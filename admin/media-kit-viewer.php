<?php
/**
 * Admin Media Kit Data Viewer - UPDATED FOR VUE ARCHITECTURE
 * 
 * Displays stored component data with proper understanding of:
 * - Sections-based layout (not old layout array)
 * - Dynamic Pods data (not hardcoded in components)
 * - Vue 2.0 data structure
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Admin_Media_Kit_Viewer {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'), 999);
        add_action('add_meta_boxes', array($this, 'add_meta_box'));
    }
    
    /**
     * Add admin menu item
     */
    public function add_admin_menu() {
        // Add to main menu for visibility
        add_menu_page(
            'Media Kit Data Viewer',
            'Media Kit Data',
            'manage_options',
            'gmkb-data-viewer',
            array($this, 'render_admin_page'),
            'dashicons-database',
            85
        );
        
        // Also add to Tools menu
        add_submenu_page(
            'tools.php',
            'Media Kit Data Viewer',
            'Media Kit Data',
            'manage_options',
            'gmkb-data-viewer-tools',
            array($this, 'render_admin_page')
        );
    }
    
    /**
     * Add meta box to post edit screen - ONLY for guests post type
     */
    public function add_meta_box() {
        // ONLY show on guests post type
        if (post_type_exists('guests')) {
            add_meta_box(
                'gmkb_media_kit_data',
                'Media Kit Data',
                array($this, 'render_meta_box'),
                'guests',  // ONLY guests
                'normal',
                'high'
            );
        }
    }
    
    /**
     * Render the admin page
     */
    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1>🎨 Media Kit Data Viewer</h1>
            
            <?php
            // Handle post ID from query parameter
            $selected_post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
            
            // Get all posts with media kit data
            global $wpdb;
            $posts_with_data = $wpdb->get_results(
                "SELECT DISTINCT p.ID, p.post_title, p.post_type, p.post_status 
                 FROM {$wpdb->posts} p
                 JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
                 WHERE pm.meta_key = 'gmkb_media_kit_state'
                 AND p.post_status != 'trash'
                 ORDER BY p.post_modified DESC
                 LIMIT 100"
            );
            ?>
            
            <div class="notice notice-info">
                <p><strong>Vue 2.0 Data Viewer:</strong> Shows stored component data with Pods reference analysis.</p>
            </div>
            
            <?php if (!empty($posts_with_data)): ?>
                <form method="get" action="">
                    <input type="hidden" name="page" value="gmkb-data-viewer">
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="post_id">Select Post:</label>
                            </th>
                            <td>
                                <select name="post_id" id="post_id" style="width: 400px;">
                                    <option value="">-- Select a post --</option>
                                    <?php foreach ($posts_with_data as $post): ?>
                                        <option value="<?php echo esc_attr($post->ID); ?>" 
                                                <?php selected($selected_post_id, $post->ID); ?>>
                                            <?php 
                                            echo esc_html($post->post_title ?: '(No title)');
                                            echo ' (ID: ' . $post->ID . ', Type: ' . $post->post_type . ')';
                                            ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                                <button type="submit" class="button button-primary">View Data</button>
                            </td>
                        </tr>
                    </table>
                </form>
            <?php else: ?>
                <div class="notice notice-warning">
                    <p>No posts found with Media Kit data.</p>
                </div>
            <?php endif; ?>
            
            <?php
            // Display data if post is selected
            if ($selected_post_id > 0) {
                $this->display_post_data($selected_post_id);
            }
            ?>
        </div>
        <?php
    }
    
    /**
     * Render the meta box on post edit screen
     */
    public function render_meta_box($post) {
        // DEBUG
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: render_meta_box() called for post ID: ' . $post->ID);
        }
        
        $saved_state = get_post_meta($post->ID, 'gmkb_media_kit_state', true);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: Saved state exists: ' . (empty($saved_state) ? 'NO' : 'YES'));
            if (!empty($saved_state)) {
                error_log('GMKB: Components count: ' . (isset($saved_state['components']) ? count($saved_state['components']) : '0'));
            }
        }
        
        if (empty($saved_state)) {
            echo '<p style="color: #999;">No Media Kit data saved for this post yet.</p>';
            echo '<p><a href="' . admin_url('admin.php?page=gmkb-data-viewer') . '" target="_blank">View Data Viewer</a></p>';
            return;
        }
        
        // Show compact summary for meta box
        $components_count = isset($saved_state['components']) ? count($saved_state['components']) : 0;
        $sections_count = isset($saved_state['sections']) ? count($saved_state['sections']) : 0;
        $data_size = strlen(serialize($saved_state));
        
        ?>
        <div style="background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
            <table class="widefat striped" style="background: white;">
                <tr>
                    <th style="width: 40%;">Components:</th>
                    <td><strong><?php echo $components_count; ?></strong> components</td>
                </tr>
                <tr>
                    <th>Sections:</th>
                    <td><strong><?php echo $sections_count; ?></strong> sections</td>
                </tr>
                <tr>
                    <th>Data Size:</th>
                    <td><?php echo size_format($data_size); ?></td>
                </tr>
                <tr>
                    <th>Last Saved:</th>
                    <td><?php echo esc_html($saved_state['last_saved'] ?? 'Unknown'); ?></td>
                </tr>
            </table>
            
            <?php if ($components_count > 0): ?>
            <details style="margin-top: 15px;">
                <summary style="cursor: pointer; padding: 10px; background: #0073aa; color: white; border-radius: 4px; font-weight: bold;">📋 View All Components</summary>
                <div style="margin-top: 10px; padding: 10px; background: white; border: 1px solid #ddd; max-height: 400px; overflow-y: auto;">
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th>Component ID</th>
                                <th>Type</th>
                                <th>Data Source</th>
                                <th>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($saved_state['components'] as $comp_id => $component): ?>
                                <tr>
                                    <td><code style="font-size: 11px;"><?php echo esc_html($comp_id); ?></code></td>
                                    <td><strong><?php echo esc_html($component['type'] ?? 'unknown'); ?></strong></td>
                                    <td>
                                        <?php 
                                        if (isset($component['_usesPods']) && $component['_usesPods']) {
                                            echo '<span style="color: green;">✓ Dynamic (Pods)</span>';
                                        } elseif (isset($component['data']['_dataSource']) && $component['data']['_dataSource'] === 'pods') {
                                            echo '<span style="color: green;">✓ Dynamic (Pods)</span>';
                                        } else {
                                            $has_bloat = $this->check_hardcoded_data($component);
                                            if ($has_bloat) {
                                                echo '<span style="color: red;">⚠ Hardcoded</span>';
                                            } else {
                                                echo '<span style="color: #999;">Static</span>';
                                            }
                                        }
                                        ?>
                                    </td>
                                    <td><?php echo size_format(strlen(serialize($component))); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </details>
            <?php endif; ?>
            
            <!-- Raw Data - Always Visible on Post Edit Page -->
            <details open style="margin-top: 15px;">
                <summary style="cursor: pointer; padding: 10px; background: #2271b1; color: white; border-radius: 4px; font-weight: bold;">🔍 Raw JSON Data</summary>
                <div style="margin-top: 10px; padding: 10px; background: #f5f5f5; border: 1px solid #ddd; max-height: 500px; overflow-y: auto;">
                    <pre style="margin: 0; font-family: 'Courier New', monospace; font-size: 11px; white-space: pre-wrap; word-wrap: break-word;"><?php 
                        echo esc_html(json_encode($saved_state, JSON_PRETTY_PRINT)); 
                    ?></pre>
                </div>
            </details>
            
            <p style="margin-top: 15px; text-align: center;">
                <a href="<?php echo admin_url('admin.php?page=gmkb-data-viewer&post_id=' . $post->ID); ?>" 
                   class="button button-primary" 
                   target="_blank">
                    🔍 View Full Details
                </a>
            </p>
        </div>
        <?php
    }
    
    /**
     * Display the media kit data for a specific post
     */
    private function display_post_data($post_id, $in_meta_box = false) {
        $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if (empty($saved_state)) {
            echo '<p>No Media Kit data found for this post.</p>';
            return;
        }
        
        $post = get_post($post_id);
        
        if (!$in_meta_box) {
            ?>
            <hr>
            <h2>📊 Media Kit Data for: <?php echo esc_html($post->post_title ?: '(No title)'); ?> (ID: <?php echo $post_id; ?>)</h2>
            <?php
        }
        
        // Analyze data structure
        $components_count = isset($saved_state['components']) ? count($saved_state['components']) : 0;
        $sections_count = isset($saved_state['sections']) ? count($saved_state['sections']) : 0;
        $data_size = strlen(serialize($saved_state));
        
        // Count components in sections
        $components_in_sections = 0;
        if (isset($saved_state['sections']) && is_array($saved_state['sections'])) {
            foreach ($saved_state['sections'] as $section) {
                if (isset($section['columns']) && is_array($section['columns'])) {
                    foreach ($section['columns'] as $column) {
                        $components_in_sections += count($column);
                    }
                }
            }
        }
        
        // Analyze Pods data usage
        $pods_analysis = $this->analyze_pods_usage($saved_state, $post_id);
        
        ?>
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>📈 Summary</h3>
            <table class="widefat striped">
                <tbody>
                    <tr>
                        <th>Components Stored:</th>
                        <td><?php echo $components_count; ?> components</td>
                    </tr>
                    <tr>
                        <th>Sections (Layout):</th>
                        <td><?php echo $sections_count; ?> sections</td>
                    </tr>
                    <tr>
                        <th>Components in Sections:</th>
                        <td><?php echo $components_in_sections; ?> component references</td>
                    </tr>
                    <tr>
                        <th>Theme:</th>
                        <td><?php echo esc_html($saved_state['theme'] ?? 'Not set'); ?></td>
                    </tr>
                    <tr>
                        <th>Total Data Size:</th>
                        <td><?php echo size_format($data_size); ?></td>
                    </tr>
                    <tr>
                        <th>Version:</th>
                        <td><?php echo esc_html($saved_state['version'] ?? 'Legacy'); ?></td>
                    </tr>
                    <tr>
                        <th>Last Saved:</th>
                        <td><?php echo esc_html($saved_state['last_saved'] ?? 'Unknown'); ?></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Pods Data Analysis -->
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>🔗 Pods Data Analysis</h3>
            <?php $this->display_pods_analysis($pods_analysis); ?>
        </div>
        
        <!-- Sections Layout -->
        <?php if (isset($saved_state['sections']) && is_array($saved_state['sections'])): ?>
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>📐 Sections & Layout</h3>
            <?php foreach ($saved_state['sections'] as $index => $section): ?>
                <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; background: #fafafa;">
                    <h4>Section <?php echo $index + 1; ?>: 
                        <code><?php echo esc_html($section['section_id'] ?? 'no-id'); ?></code>
                        - <?php echo esc_html($section['layout'] ?? $section['type'] ?? 'unknown'); ?>
                    </h4>
                    
                    <?php if (isset($section['columns']) && is_array($section['columns'])): ?>
                        <div style="display: grid; grid-template-columns: repeat(<?php echo count($section['columns']); ?>, 1fr); gap: 10px;">
                            <?php foreach ($section['columns'] as $col_num => $components): ?>
                                <div style="border: 1px solid #ccc; padding: 10px; background: white;">
                                    <strong>Column <?php echo $col_num; ?></strong>
                                    <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                                        <?php foreach ($components as $comp_id): ?>
                                            <li>
                                                <code style="font-size: 11px;"><?php echo esc_html($comp_id); ?></code>
                                                <?php 
                                                if (isset($saved_state['components'][$comp_id])) {
                                                    $comp = $saved_state['components'][$comp_id];
                                                    echo '<br><span style="color: #0073aa;">→ ' . esc_html($comp['type'] ?? 'unknown') . '</span>';
                                                    
                                                    // Show if uses Pods data
                                                    if (isset($comp['data']['_dataSource']) && $comp['data']['_dataSource'] === 'pods') {
                                                        echo ' <span style="color: green; font-size: 11px;">✓ Pods</span>';
                                                    }
                                                } else {
                                                    echo '<br><span style="color: red;">⚠ Missing component data!</span>';
                                                }
                                                ?>
                                            </li>
                                        <?php endforeach; ?>
                                    </ol>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
        
        <!-- Components Detail -->
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>🧩 Components Detail</h3>
            <table class="widefat striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Data Source</th>
                        <th>Stored Size</th>
                        <th>Has Hardcoded Data</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($saved_state['components'] as $comp_id => $component): ?>
                        <tr>
                            <td><code style="font-size: 11px;"><?php echo esc_html($comp_id); ?></code></td>
                            <td><strong><?php echo esc_html($component['type'] ?? 'unknown'); ?></strong></td>
                            <td>
                                <?php 
                                if (isset($component['data']['_dataSource']) && $component['data']['_dataSource'] === 'pods') {
                                    echo '<span style="color: green;">✓ Pods (Dynamic)</span>';
                                } else {
                                    echo '<span style="color: orange;">⚠ Hardcoded</span>';
                                }
                                ?>
                            </td>
                            <td><?php echo size_format(strlen(serialize($component))); ?></td>
                            <td>
                                <?php
                                $has_hardcoded = $this->check_hardcoded_data($component);
                                if ($has_hardcoded) {
                                    echo '<span style="color: red;">⚠ YES - Bloating database</span>';
                                } else {
                                    echo '<span style="color: green;">✓ No</span>';
                                }
                                ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        
        <!-- Data Validation -->
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>✅ Data Validation</h3>
            <?php $this->validate_data_integrity($saved_state); ?>
        </div>
        
        <!-- Raw Data (Collapsed) -->
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>🔍 Raw Data Structure</h3>
            <details>
                <summary style="cursor: pointer; padding: 10px; background: #f0f0f0;">Click to expand raw JSON</summary>
                <pre style="background: #f5f5f5; padding: 10px; overflow: auto; max-height: 500px; margin-top: 10px;"><?php 
                    echo esc_html(json_encode($saved_state, JSON_PRETTY_PRINT)); 
                ?></pre>
            </details>
        </div>
        <?php
    }
    
    /**
     * Analyze Pods data usage across components
     */
    private function analyze_pods_usage($saved_state, $post_id) {
        $analysis = array(
            'total_components' => 0,
            'using_pods' => 0,
            'hardcoded' => 0,
            'bloated_components' => array(),
            'pods_fields_available' => array()
        );
        
        // Check what Pods fields are available
        if (function_exists('pods')) {
            $pod = pods('guest', $post_id);
            if ($pod) {
                $fields = $pod->fields();
                if (is_array($fields)) {
                    $analysis['pods_fields_available'] = array_keys($fields);
                }
            }
        }
        
        // Analyze each component
        if (isset($saved_state['components']) && is_array($saved_state['components'])) {
            foreach ($saved_state['components'] as $comp_id => $component) {
                $analysis['total_components']++;
                
                if (isset($component['data']['_dataSource']) && $component['data']['_dataSource'] === 'pods') {
                    $analysis['using_pods']++;
                } else {
                    $analysis['hardcoded']++;
                }
                
                // Check for bloat
                $comp_size = strlen(serialize($component));
                if ($comp_size > 5000) { // > 5KB is suspicious
                    $analysis['bloated_components'][] = array(
                        'id' => $comp_id,
                        'type' => $component['type'] ?? 'unknown',
                        'size' => $comp_size
                    );
                }
            }
        }
        
        return $analysis;
    }
    
    /**
     * Display Pods analysis results
     */
    private function display_pods_analysis($analysis) {
        ?>
        <table class="widefat striped">
            <tr>
                <th>Total Components:</th>
                <td><?php echo $analysis['total_components']; ?></td>
            </tr>
            <tr>
                <th>Using Pods Data (Dynamic):</th>
                <td style="color: green;">✓ <?php echo $analysis['using_pods']; ?> components</td>
            </tr>
            <tr>
                <th>Hardcoded Data (Bloat):</th>
                <td style="color: <?php echo $analysis['hardcoded'] > 0 ? 'red' : 'green'; ?>;">
                    <?php echo $analysis['hardcoded'] > 0 ? '⚠' : '✓'; ?> <?php echo $analysis['hardcoded']; ?> components
                </td>
            </tr>
            <tr>
                <th>Available Pods Fields:</th>
                <td>
                    <?php if (!empty($analysis['pods_fields_available'])): ?>
                        <code><?php echo implode(', ', $analysis['pods_fields_available']); ?></code>
                    <?php else: ?>
                        <em>Pods not available or no fields found</em>
                    <?php endif; ?>
                </td>
            </tr>
        </table>
        
        <?php if (!empty($analysis['bloated_components'])): ?>
            <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffc107;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">⚠ Bloated Components Detected</h4>
                <p style="margin: 0 0 10px 0;">These components have large stored data that should likely be dynamic Pods references:</p>
                <ul style="margin: 0;">
                    <?php foreach ($analysis['bloated_components'] as $bloat): ?>
                        <li>
                            <code><?php echo esc_html($bloat['id']); ?></code> 
                            (<?php echo esc_html($bloat['type']); ?>) - 
                            <strong><?php echo size_format($bloat['size']); ?></strong>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>
        <?php
    }
    
    /**
     * Check if component has hardcoded Pods data
     */
    private function check_hardcoded_data($component) {
        // Fields that should be dynamic from Pods
        $pods_fields = array('biography', 'name', 'title', 'topics', 'description', 'full_name');
        
        if (isset($component['data']) && is_array($component['data'])) {
            foreach ($pods_fields as $field) {
                if (isset($component['data'][$field]) && !empty($component['data'][$field])) {
                    // Check if it's actual content (not placeholder)
                    $content = $component['data'][$field];
                    if (is_string($content) && strlen($content) > 50 && 
                        strpos($content, 'Your') === false && 
                        strpos($content, 'goes here') === false) {
                        return true; // Has hardcoded content
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * Validate data integrity (UPDATED FOR VUE 2.0)
     */
    private function validate_data_integrity($saved_state) {
        $issues = array();
        $warnings = array();
        $successes = array();
        
        // Check version
        if (isset($saved_state['version']) && $saved_state['version'] === '2.0') {
            $successes[] = 'Using Vue 2.0 data structure';
        } else {
            $warnings[] = 'Missing version identifier or using legacy format';
        }
        
        // Check sections exist
        if (!isset($saved_state['sections']) || empty($saved_state['sections'])) {
            $issues[] = 'Missing sections array - media kit cannot render without sections';
        } else {
            $successes[] = 'Sections array present with ' . count($saved_state['sections']) . ' sections';
        }
        
        // Check components exist
        if (!isset($saved_state['components']) || empty($saved_state['components'])) {
            $warnings[] = 'No components stored';
        } else {
            $successes[] = count($saved_state['components']) . ' components stored';
        }
        
        // Validate section structure
        if (isset($saved_state['sections']) && is_array($saved_state['sections'])) {
            foreach ($saved_state['sections'] as $index => $section) {
                if (!isset($section['section_id'])) {
                    $issues[] = "Section at index {$index} missing section_id";
                }
                
                if (!isset($section['columns'])) {
                    $issues[] = "Section {$section['section_id']} missing columns array";
                }
                
                // Validate component references
                if (isset($section['columns']) && is_array($section['columns'])) {
                    foreach ($section['columns'] as $col_num => $components) {
                        foreach ($components as $comp_id) {
                            if (!isset($saved_state['components'][$comp_id])) {
                                $issues[] = "Section references missing component: {$comp_id}";
                            }
                        }
                    }
                }
            }
        }
        
        // Check for orphaned components (not in any section)
        if (isset($saved_state['components']) && isset($saved_state['sections'])) {
            $components_in_sections = array();
            
            foreach ($saved_state['sections'] as $section) {
                if (isset($section['columns']) && is_array($section['columns'])) {
                    foreach ($section['columns'] as $column) {
                        $components_in_sections = array_merge($components_in_sections, $column);
                    }
                }
            }
            
            foreach ($saved_state['components'] as $comp_id => $component) {
                if (!in_array($comp_id, $components_in_sections)) {
                    $warnings[] = "Orphaned component (not in any section): {$comp_id}";
                }
            }
        }
        
        // Display results
        if (!empty($successes)) {
            echo '<div style="padding: 10px; background: #d4edda; border: 1px solid #c3e6cb; margin-bottom: 10px;">';
            echo '<h4 style="margin: 0 0 10px 0; color: #155724;">✅ Valid Structure</h4>';
            echo '<ul style="margin: 0;">';
            foreach ($successes as $success) {
                echo '<li>' . esc_html($success) . '</li>';
            }
            echo '</ul>';
            echo '</div>';
        }
        
        if (!empty($warnings)) {
            echo '<div style="padding: 10px; background: #fff3cd; border: 1px solid #ffc107; margin-bottom: 10px;">';
            echo '<h4 style="margin: 0 0 10px 0; color: #856404;">⚠ Warnings</h4>';
            echo '<ul style="margin: 0;">';
            foreach ($warnings as $warning) {
                echo '<li>' . esc_html($warning) . '</li>';
            }
            echo '</ul>';
            echo '</div>';
        }
        
        if (!empty($issues)) {
            echo '<div style="padding: 10px; background: #f8d7da; border: 1px solid #f5c6cb;">';
            echo '<h4 style="margin: 0 0 10px 0; color: #721c24;">❌ Issues Found</h4>';
            echo '<ul style="margin: 0;">';
            foreach ($issues as $issue) {
                echo '<li>' . esc_html($issue) . '</li>';
            }
            echo '</ul>';
            echo '</div>';
        }
        
        if (empty($issues) && empty($warnings)) {
            echo '<p style="color: green; font-weight: bold;">✓ Perfect! All validation checks passed.</p>';
        }
    }
}

// Initialize the viewer
GMKB_Admin_Media_Kit_Viewer::get_instance();
