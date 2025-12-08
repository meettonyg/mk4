<?php
/**
 * Phase 0: Database Storage Audit
 *
 * Determines how Pods is storing media kit data:
 * - Meta-based storage (in wp_postmeta) - Easy migration
 * - Table-based storage (in wp_pods_*) - Requires data migration
 *
 * Usage: yoursite.com/wp-admin/?gmkb_db_audit=1
 *
 * @package GMKB
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Database_Audit {

    private $results = [];

    public function __construct() {
        $this->results = [
            'timestamp' => current_time('mysql'),
            'wordpress_version' => get_bloginfo('version'),
            'pods_active' => class_exists('Pods'),
            'pods_version' => $this->get_pods_version(),
            'checks' => [],
            'recommendations' => [],
        ];
    }

    public function run_audit() {
        $this->check_pods_tables();
        $this->check_meta_storage();
        $this->check_serialized_data();
        $this->check_post_type_exists();
        $this->analyze_sample_posts();
        $this->generate_recommendations();

        return $this->results;
    }

    /**
     * Check for Pods-specific database tables
     */
    private function check_pods_tables() {
        global $wpdb;

        $pods_tables = $wpdb->get_results("SHOW TABLES LIKE '{$wpdb->prefix}pods_%'", ARRAY_N);
        $table_names = array_map(function($row) { return $row[0]; }, $pods_tables);

        $this->results['checks']['pods_tables'] = [
            'found' => count($table_names) > 0,
            'tables' => $table_names,
            'count' => count($table_names),
            'impact' => count($table_names) > 0 ? 'HIGH' : 'NONE',
            'description' => count($table_names) > 0 
                ? 'Pods is using table-based storage. Data migration script required.'
                : 'No Pods tables found. Data is likely in wp_postmeta (meta-based storage).',
        ];

        // Check specifically for guests table
        $guests_table = $wpdb->get_var("SHOW TABLES LIKE '{$wpdb->prefix}pods_guests'");
        $this->results['checks']['pods_guests_table'] = [
            'exists' => !empty($guests_table),
            'table_name' => $guests_table ?: null,
        ];
    }

    /**
     * Check if data exists in wp_postmeta
     */
    private function check_meta_storage() {
        global $wpdb;

        // Get a sample guests post
        $sample_post = $wpdb->get_var("
            SELECT ID FROM {$wpdb->posts} 
            WHERE post_type = 'guests' 
            AND post_status IN ('publish', 'draft', 'private')
            LIMIT 1
        ");

        if (!$sample_post) {
            $this->results['checks']['meta_storage'] = [
                'status' => 'NO_DATA',
                'description' => 'No guests posts found to analyze.',
            ];
            return;
        }

        // Check key fields in postmeta
        $test_fields = [
            'first_name', 'last_name', 'biography', 'email',
            'topic_1', 'topic_2', 'question_1',
            'headshot', 'profile_photo',
            '1_twitter', '1_facebook', 'guest_youtube'
        ];

        $found_fields = [];
        $missing_fields = [];

        foreach ($test_fields as $field) {
            $value = get_post_meta($sample_post, $field, true);
            if (!empty($value)) {
                $found_fields[] = $field;
            } else {
                $missing_fields[] = $field;
            }
        }

        $this->results['checks']['meta_storage'] = [
            'sample_post_id' => $sample_post,
            'fields_checked' => count($test_fields),
            'fields_found' => count($found_fields),
            'fields_found_list' => $found_fields,
            'fields_missing' => count($missing_fields),
            'fields_missing_list' => $missing_fields,
            'percentage_found' => round((count($found_fields) / count($test_fields)) * 100, 1),
            'status' => count($found_fields) > (count($test_fields) / 2) ? 'PASS' : 'FAIL',
        ];
    }

    /**
     * Check for serialized data in postmeta
     */
    private function check_serialized_data() {
        global $wpdb;

        $serialized_fields = $wpdb->get_results("
            SELECT DISTINCT meta_key, 
                   COUNT(*) as count,
                   CASE
                     WHEN meta_value LIKE 'a:%' THEN 'serialized_array'
                     WHEN meta_value LIKE 'O:%' THEN 'serialized_object'
                     ELSE 'unknown'
                   END as data_type
            FROM {$wpdb->postmeta} pm
            INNER JOIN {$wpdb->posts} p ON pm.post_id = p.ID
            WHERE p.post_type = 'guests'
            AND (meta_value LIKE 'a:%' OR meta_value LIKE 'O:%')
            AND meta_key NOT LIKE '\\_%'
            GROUP BY meta_key, data_type
            ORDER BY count DESC
            LIMIT 20
        ");

        $this->results['checks']['serialized_data'] = [
            'found' => count($serialized_fields) > 0,
            'fields' => $serialized_fields,
            'description' => 'Fields that contain serialized PHP data (arrays/objects)',
        ];
    }

    /**
     * Check if guests post type exists
     */
    private function check_post_type_exists() {
        global $wpdb;

        $counts = $wpdb->get_row("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN post_status = 'publish' THEN 1 ELSE 0 END) as published,
                SUM(CASE WHEN post_status = 'draft' THEN 1 ELSE 0 END) as draft,
                SUM(CASE WHEN post_status = 'private' THEN 1 ELSE 0 END) as private_posts
            FROM {$wpdb->posts}
            WHERE post_type = 'guests'
        ");

        $this->results['checks']['post_type'] = [
            'exists' => post_type_exists('guests'),
            'registered_by_pods' => $this->is_pods_cpt('guests'),
            'post_counts' => $counts,
        ];

        // Also check for mkcg post type (legacy)
        $mkcg_counts = $wpdb->get_row("
            SELECT COUNT(*) as total
            FROM {$wpdb->posts}
            WHERE post_type = 'mkcg'
        ");

        $this->results['checks']['legacy_post_type'] = [
            'exists' => post_type_exists('mkcg'),
            'post_count' => $mkcg_counts->total ?? 0,
        ];
    }

    /**
     * Analyze sample posts for data structure
     */
    private function analyze_sample_posts() {
        global $wpdb;

        // Get up to 3 sample posts with different amounts of data
        $sample_posts = $wpdb->get_col("
            SELECT ID FROM {$wpdb->posts}
            WHERE post_type = 'guests'
            AND post_status IN ('publish', 'draft')
            ORDER BY ID DESC
            LIMIT 3
        ");

        $samples = [];
        foreach ($sample_posts as $post_id) {
            $meta_count = $wpdb->get_var($wpdb->prepare("
                SELECT COUNT(*) FROM {$wpdb->postmeta}
                WHERE post_id = %d
                AND meta_key NOT LIKE '\\_%'
            ", $post_id));

            $samples[] = [
                'post_id' => $post_id,
                'title' => get_the_title($post_id),
                'public_meta_count' => $meta_count,
            ];
        }

        $this->results['checks']['sample_analysis'] = [
            'samples' => $samples,
        ];
    }

    /**
     * Generate migration recommendations
     */
    private function generate_recommendations() {
        $recommendations = [];
        $overall_status = 'READY';

        // Check if Pods tables exist
        if ($this->results['checks']['pods_tables']['found']) {
            $overall_status = 'NEEDS_MIGRATION';
            $recommendations[] = [
                'priority' => 'HIGH',
                'action' => 'Create data migration script to move data from wp_pods_* tables to wp_postmeta',
                'reason' => 'Pods is using table-based storage',
            ];
        }

        // Check meta storage success
        if (isset($this->results['checks']['meta_storage']['percentage_found'])) {
            $percentage = $this->results['checks']['meta_storage']['percentage_found'];
            if ($percentage < 50) {
                $overall_status = 'INVESTIGATE';
                $recommendations[] = [
                    'priority' => 'HIGH',
                    'action' => 'Investigate missing fields - data may be in Pods tables',
                    'reason' => "Only {$percentage}% of expected fields found in wp_postmeta",
                ];
            } elseif ($percentage >= 90) {
                $recommendations[] = [
                    'priority' => 'INFO',
                    'action' => 'Proceed to Phase 1 verification',
                    'reason' => "{$percentage}% of fields found in wp_postmeta - meta-based storage confirmed",
                ];
            }
        }

        // Check serialized data
        if ($this->results['checks']['serialized_data']['found']) {
            $recommendations[] = [
                'priority' => 'MEDIUM',
                'action' => 'Add maybe_unserialize() handling in Phase 2 schema',
                'reason' => 'Some fields contain serialized PHP data',
            ];
        }

        // Check if Pods is still needed for CPT registration
        if ($this->results['checks']['post_type']['registered_by_pods'] ?? false) {
            $recommendations[] = [
                'priority' => 'HIGH',
                'action' => 'Include CPT registration in Phase 2 core-schema.php',
                'reason' => 'Pods currently registers the guests post type',
            ];
        }

        $this->results['recommendations'] = $recommendations;
        $this->results['overall_status'] = $overall_status;
        $this->results['ready_for_phase_1'] = $overall_status === 'READY' || $overall_status === 'NEEDS_MIGRATION';
    }

    /**
     * Check if a CPT is registered by Pods
     */
    private function is_pods_cpt($post_type) {
        if (!function_exists('pods_api')) {
            return false;
        }
        
        $pods_api = pods_api();
        $pod = $pods_api->load_pod(['name' => $post_type], false);
        
        return !empty($pod);
    }

    /**
     * Get Pods plugin version
     */
    private function get_pods_version() {
        if (!function_exists('get_plugin_data')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $pods_file = WP_PLUGIN_DIR . '/pods/init.php';
        if (!file_exists($pods_file)) {
            return null;
        }

        $plugin_data = get_plugin_data($pods_file);
        return $plugin_data['Version'] ?? null;
    }
}

// Register audit endpoint
add_action('admin_init', function() {
    if (!isset($_GET['gmkb_db_audit'])) {
        return;
    }

    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    $audit = new GMKB_Database_Audit();
    $results = $audit->run_audit();

    header('Content-Type: application/json');
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit;
});

/**
 * Generate HTML report
 */
add_action('admin_init', function() {
    if (!isset($_GET['gmkb_db_audit_html'])) {
        return;
    }

    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    $audit = new GMKB_Database_Audit();
    $results = $audit->run_audit();

    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>GMKB Database Audit Report</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; background: #f1f1f1; }
            .container { max-width: 1200px; margin: 0 auto; }
            .card { background: white; border-radius: 8px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            h1 { color: #1d2327; margin-bottom: 8px; }
            h2 { color: #2271b1; border-bottom: 2px solid #2271b1; padding-bottom: 8px; }
            .status-READY, .status-PASS { color: #00a32a; font-weight: bold; }
            .status-NEEDS_MIGRATION, .status-INVESTIGATE { color: #dba617; font-weight: bold; }
            .status-FAIL { color: #d63638; font-weight: bold; }
            .priority-HIGH { background: #facfd2; color: #8a2424; padding: 2px 8px; border-radius: 4px; }
            .priority-MEDIUM { background: #f0c33c; color: #6e4b00; padding: 2px 8px; border-radius: 4px; }
            .priority-INFO { background: #d0e6f1; color: #0a4b78; padding: 2px 8px; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
            th { background: #f6f7f7; }
            pre { background: #1d2327; color: #50fa7b; padding: 16px; border-radius: 4px; overflow-x: auto; }
            .meta { color: #646970; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <h1>🔍 GMKB Database Audit Report</h1>
                <p class="meta">Generated: <?php echo esc_html($results['timestamp']); ?> | 
                   WordPress <?php echo esc_html($results['wordpress_version']); ?> |
                   Pods: <?php echo $results['pods_active'] ? 'Active (v' . esc_html($results['pods_version']) . ')' : 'Inactive'; ?></p>
                
                <h2>Overall Status: <span class="status-<?php echo esc_attr($results['overall_status']); ?>">
                    <?php echo esc_html($results['overall_status']); ?>
                </span></h2>
            </div>

            <div class="card">
                <h2>📊 Pods Tables Check</h2>
                <?php $pods_check = $results['checks']['pods_tables']; ?>
                <p><strong>Impact:</strong> <span class="status-<?php echo $pods_check['found'] ? 'INVESTIGATE' : 'READY'; ?>">
                    <?php echo esc_html($pods_check['impact']); ?>
                </span></p>
                <p><?php echo esc_html($pods_check['description']); ?></p>
                <?php if ($pods_check['found']): ?>
                <p><strong>Tables found:</strong></p>
                <pre><?php echo esc_html(implode("\n", $pods_check['tables'])); ?></pre>
                <?php endif; ?>
            </div>

            <div class="card">
                <h2>📁 Meta Storage Analysis</h2>
                <?php $meta = $results['checks']['meta_storage']; ?>
                <?php if (isset($meta['sample_post_id'])): ?>
                <p><strong>Sample Post:</strong> #<?php echo esc_html($meta['sample_post_id']); ?></p>
                <p><strong>Status:</strong> <span class="status-<?php echo esc_attr($meta['status']); ?>">
                    <?php echo esc_html($meta['percentage_found']); ?>% of fields found in wp_postmeta
                </span></p>
                
                <table>
                    <tr><th>Metric</th><th>Value</th></tr>
                    <tr><td>Fields Checked</td><td><?php echo esc_html($meta['fields_checked']); ?></td></tr>
                    <tr><td>Fields Found</td><td><?php echo esc_html($meta['fields_found']); ?></td></tr>
                    <tr><td>Fields Missing</td><td><?php echo esc_html($meta['fields_missing']); ?></td></tr>
                </table>

                <?php if (!empty($meta['fields_found_list'])): ?>
                <p><strong>Fields with data:</strong> <?php echo esc_html(implode(', ', $meta['fields_found_list'])); ?></p>
                <?php endif; ?>
                
                <?php if (!empty($meta['fields_missing_list'])): ?>
                <p><strong>Missing fields:</strong> <?php echo esc_html(implode(', ', $meta['fields_missing_list'])); ?></p>
                <?php endif; ?>
                <?php else: ?>
                <p>No guest posts found to analyze.</p>
                <?php endif; ?>
            </div>

            <div class="card">
                <h2>📦 Post Type Information</h2>
                <?php $pt = $results['checks']['post_type']; ?>
                <table>
                    <tr><th>Property</th><th>Value</th></tr>
                    <tr><td>Post Type Exists</td><td><?php echo $pt['exists'] ? '✅ Yes' : '❌ No'; ?></td></tr>
                    <tr><td>Registered by Pods</td><td><?php echo $pt['registered_by_pods'] ? '⚠️ Yes' : '✅ No'; ?></td></tr>
                    <tr><td>Total Posts</td><td><?php echo esc_html($pt['post_counts']->total ?? 0); ?></td></tr>
                    <tr><td>Published</td><td><?php echo esc_html($pt['post_counts']->published ?? 0); ?></td></tr>
                    <tr><td>Draft</td><td><?php echo esc_html($pt['post_counts']->draft ?? 0); ?></td></tr>
                </table>
            </div>

            <div class="card">
                <h2>✅ Recommendations</h2>
                <?php foreach ($results['recommendations'] as $rec): ?>
                <div style="margin-bottom: 16px; padding: 12px; background: #f6f7f7; border-radius: 4px;">
                    <span class="priority-<?php echo esc_attr($rec['priority']); ?>"><?php echo esc_html($rec['priority']); ?></span>
                    <strong style="margin-left: 8px;"><?php echo esc_html($rec['action']); ?></strong>
                    <p style="margin: 8px 0 0; color: #646970;"><?php echo esc_html($rec['reason']); ?></p>
                </div>
                <?php endforeach; ?>
            </div>

            <div class="card">
                <h2>🚀 Next Steps</h2>
                <?php if ($results['ready_for_phase_1']): ?>
                <p style="color: #00a32a; font-size: 18px;">✅ <strong>Ready to proceed to Phase 1!</strong></p>
                <ol>
                    <li>Run the native data test: <code>?gmkb_native_test=1&post_id=[ID]</code></li>
                    <li>Compare results with Pods active vs deactivated</li>
                    <li>If successful, proceed to Phase 2 schema codification</li>
                </ol>
                <?php else: ?>
                <p style="color: #d63638;">⚠️ <strong>Investigation required before proceeding.</strong></p>
                <p>Review the recommendations above and address high-priority items first.</p>
                <?php endif; ?>
            </div>

            <div class="card">
                <h2>📋 Raw JSON Output</h2>
                <pre><?php echo esc_html(json_encode($results, JSON_PRETTY_PRINT)); ?></pre>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
});
