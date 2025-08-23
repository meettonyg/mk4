<?php
/**
 * Admin Media Kit Data Viewer
 * 
 * Provides a simple interface in WordPress admin to view the stored component data
 * for any post that has media kit data saved.
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
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('add_meta_boxes', array($this, 'add_meta_box'));
    }
    
    /**
     * Add admin menu item
     */
    public function add_admin_menu() {
        add_submenu_page(
            'tools.php',
            'Media Kit Data Viewer',
            'Media Kit Data',
            'manage_options',
            'gmkb-data-viewer',
            array($this, 'render_admin_page')
        );
    }
    
    /**
     * Add meta box to post edit screen
     */
    public function add_meta_box() {
        $post_types = get_post_types(array('public' => true), 'names');
        
        foreach ($post_types as $post_type) {
            add_meta_box(
                'gmkb_media_kit_data',
                'Media Kit Data',
                array($this, 'render_meta_box'),
                $post_type,
                'normal',
                'low'
            );
        }
    }
    
    /**
     * Render the admin page
     */
    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1>Media Kit Data Viewer</h1>
            
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
                <p>This tool allows you to view the stored Media Kit component data for any post.</p>
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
                                            echo ' (ID: ' . $post->ID . ', Type: ' . $post->post_type . ', Status: ' . $post->post_status . ')';
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
        $this->display_post_data($post->ID, true);
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
            <h2>Media Kit Data for: <?php echo esc_html($post->post_title ?: '(No title)'); ?> (ID: <?php echo $post_id; ?>)</h2>
            <?php
        }
        
        // Display summary statistics
        $components_count = isset($saved_state['components']) ? count($saved_state['components']) : 0;
        $layout_count = isset($saved_state['layout']) ? count($saved_state['layout']) : 0;
        $saved_components_count = isset($saved_state['saved_components']) ? count($saved_state['saved_components']) : 0;
        $data_size = strlen(serialize($saved_state));
        
        ?>
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>Summary</h3>
            <table class="widefat striped">
                <tbody>
                    <tr>
                        <th>Components (Object Format):</th>
                        <td><?php echo $components_count; ?> components</td>
                    </tr>
                    <tr>
                        <th>Layout Order (ID Array):</th>
                        <td><?php echo $layout_count; ?> items</td>
                    </tr>
                    <tr>
                        <th>Saved Components (Ordered Array):</th>
                        <td><?php echo $saved_components_count; ?> components</td>
                    </tr>
                    <tr>
                        <th>Total Data Size:</th>
                        <td><?php echo size_format($data_size); ?></td>
                    </tr>
                    <tr>
                        <th>Version:</th>
                        <td><?php echo esc_html($saved_state['version'] ?? 'Not specified'); ?></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <?php if (isset($saved_state['layout']) && is_array($saved_state['layout'])): ?>
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>Component Order (from layout array)</h3>
            <ol>
                <?php foreach ($saved_state['layout'] as $component_id): ?>
                    <li>
                        <code><?php echo esc_html($component_id); ?></code>
                        <?php 
                        if (isset($saved_state['components'][$component_id])) {
                            $comp = $saved_state['components'][$component_id];
                            echo ' - Type: <strong>' . esc_html($comp['type'] ?? 'unknown') . '</strong>';
                        } else {
                            echo ' <span style="color: red;">(Component data missing!)</span>';
                        }
                        ?>
                    </li>
                <?php endforeach; ?>
            </ol>
        </div>
        <?php endif; ?>
        
        <?php if (isset($saved_state['saved_components']) && is_array($saved_state['saved_components'])): ?>
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>Saved Components (Authoritative Order)</h3>
            <table class="widefat striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Timestamp</th>
                        <th>Has Props</th>
                        <th>Has Data</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($saved_state['saved_components'] as $index => $component): ?>
                        <tr>
                            <td><?php echo $index + 1; ?></td>
                            <td><code><?php echo esc_html($component['id'] ?? 'no-id'); ?></code></td>
                            <td><strong><?php echo esc_html($component['type'] ?? 'unknown'); ?></strong></td>
                            <td>
                                <?php 
                                if (isset($component['timestamp'])) {
                                    echo date('Y-m-d H:i:s', $component['timestamp'] / 1000);
                                } else {
                                    echo '-';
                                }
                                ?>
                            </td>
                            <td><?php echo (!empty($component['props'])) ? '✓' : '✗'; ?></td>
                            <td><?php echo (!empty($component['data'])) ? '✓' : '✗'; ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php endif; ?>
        
        <?php if (isset($saved_state['globalSettings']) && !empty($saved_state['globalSettings'])): ?>
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>Global Settings</h3>
            <pre style="background: #f5f5f5; padding: 10px; overflow: auto; max-height: 300px;"><?php 
                echo esc_html(json_encode($saved_state['globalSettings'], JSON_PRETTY_PRINT)); 
            ?></pre>
        </div>
        <?php endif; ?>
        
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>Raw Data Structure</h3>
            <details>
                <summary style="cursor: pointer; padding: 10px; background: #f0f0f0;">Click to expand raw data</summary>
                <pre style="background: #f5f5f5; padding: 10px; overflow: auto; max-height: 500px; margin-top: 10px;"><?php 
                    echo esc_html(json_encode($saved_state, JSON_PRETTY_PRINT)); 
                ?></pre>
            </details>
        </div>
        
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h3>Data Validation</h3>
            <?php $this->validate_data_integrity($saved_state); ?>
        </div>
        <?php
    }
    
    /**
     * Validate data integrity and display results
     */
    private function validate_data_integrity($saved_state) {
        $issues = array();
        $warnings = array();
        
        // Check if saved_components exists
        if (!isset($saved_state['saved_components'])) {
            $issues[] = 'Missing saved_components array (required for proper rendering)';
        }
        
        // Check if layout matches components
        if (isset($saved_state['layout']) && isset($saved_state['components'])) {
            foreach ($saved_state['layout'] as $component_id) {
                if (!isset($saved_state['components'][$component_id])) {
                    $issues[] = "Layout references component ID '{$component_id}' but it's not in components object";
                }
            }
            
            // Check for orphaned components
            foreach ($saved_state['components'] as $component_id => $component) {
                if (!in_array($component_id, $saved_state['layout'])) {
                    $warnings[] = "Component '{$component_id}' exists but is not in layout array";
                }
            }
        }
        
        // Check saved_components order matches layout
        if (isset($saved_state['saved_components']) && isset($saved_state['layout'])) {
            $saved_comp_ids = array_map(function($c) { return $c['id'] ?? null; }, $saved_state['saved_components']);
            $saved_comp_ids = array_filter($saved_comp_ids);
            
            if (count($saved_comp_ids) !== count($saved_state['layout'])) {
                $warnings[] = 'saved_components count doesn\'t match layout count';
            } else {
                foreach ($saved_state['layout'] as $index => $layout_id) {
                    if (isset($saved_comp_ids[$index]) && $saved_comp_ids[$index] !== $layout_id) {
                        $issues[] = "Order mismatch at position {$index}: layout has '{$layout_id}' but saved_components has '{$saved_comp_ids[$index]}'";
                    }
                }
            }
        }
        
        if (empty($issues) && empty($warnings)) {
            echo '<p style="color: green;">✓ All data validation checks passed!</p>';
        } else {
            if (!empty($issues)) {
                echo '<h4 style="color: red;">Issues Found:</h4>';
                echo '<ul>';
                foreach ($issues as $issue) {
                    echo '<li style="color: red;">' . esc_html($issue) . '</li>';
                }
                echo '</ul>';
            }
            
            if (!empty($warnings)) {
                echo '<h4 style="color: orange;">Warnings:</h4>';
                echo '<ul>';
                foreach ($warnings as $warning) {
                    echo '<li style="color: orange;">' . esc_html($warning) . '</li>';
                }
                echo '</ul>';
            }
        }
    }
}

// Initialize the viewer
GMKB_Admin_Media_Kit_Viewer::get_instance();
