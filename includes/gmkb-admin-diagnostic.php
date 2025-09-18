<?php
/**
 * GMKB Admin Diagnostic & Repair Tool
 * Add this to the plugin to create an admin page for diagnostics
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Admin_Diagnostic {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_ajax_gmkb_repair_state', array($this, 'ajax_repair_state'));
        add_action('wp_ajax_gmkb_test_save', array($this, 'ajax_test_save'));
    }
    
    public function add_admin_menu() {
        add_submenu_page(
            'edit.php?post_type=guest',
            'GMKB Diagnostics',
            'GMKB Diagnostics',
            'manage_options',
            'gmkb-diagnostics',
            array($this, 'render_diagnostic_page')
        );
    }
    
    public function render_diagnostic_page() {
        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
        ?>
        <div class="wrap">
            <h1>GMKB Diagnostic & Repair Tool</h1>
            
            <div class="card">
                <h2>Check Media Kit State</h2>
                <form method="get" action="">
                    <input type="hidden" name="post_type" value="guest">
                    <input type="hidden" name="page" value="gmkb-diagnostics">
                    <table class="form-table">
                        <tr>
                            <th><label for="post_id">Post ID:</label></th>
                            <td>
                                <input type="number" name="post_id" id="post_id" value="<?php echo esc_attr($post_id); ?>" class="regular-text">
                                <input type="submit" class="button button-primary" value="Check State">
                            </td>
                        </tr>
                    </table>
                </form>
            </div>
            
            <?php if ($post_id): ?>
                <?php $this->display_state_analysis($post_id); ?>
            <?php endif; ?>
            
            <div class="card" style="margin-top: 20px;">
                <h2>Quick Fixes</h2>
                <button class="button button-secondary" onclick="gmkbClearLocalStorage()">Clear Browser Storage</button>
                <button class="button button-secondary" onclick="gmkbTestSave()">Test Save Function</button>
                <button class="button button-secondary" onclick="gmkbDebugState()">Debug Current State</button>
            </div>
            
            <script>
            function gmkbClearLocalStorage() {
                localStorage.clear();
                alert('Browser storage cleared. Please reload the media kit editor.');
            }
            
            function gmkbTestSave() {
                const testState = {
                    components: {
                        'test_comp_123': {
                            id: 'test_comp_123',
                            type: 'biography',
                            props: { title: 'Test Component' }
                        }
                    },
                    sections: [{
                        section_id: 'test_section_123',
                        components: [{ component_id: 'test_comp_123' }]
                    }],
                    layout: []
                };
                
                jQuery.post(ajaxurl, {
                    action: 'gmkb_test_save',
                    nonce: '<?php echo wp_create_nonce('gmkb_diagnostics'); ?>',
                    state: JSON.stringify(testState)
                }, function(response) {
                    console.log('Test save response:', response);
                    alert('Test save completed. Check console for results.');
                });
            }
            
            function gmkbDebugState() {
                if (window.opener && window.opener.stateManager) {
                    const state = window.opener.stateManager.getState();
                    console.log('Current state from editor:', state);
                    alert('State logged to console');
                } else {
                    alert('Please open this page from the Media Kit editor');
                }
            }
            
            function gmkbRepairState(postId) {
                if (!confirm('This will repair the media kit state. Continue?')) return;
                
                jQuery.post(ajaxurl, {
                    action: 'gmkb_repair_state',
                    post_id: postId,
                    nonce: '<?php echo wp_create_nonce('gmkb_diagnostics'); ?>'
                }, function(response) {
                    if (response.success) {
                        alert('State repaired successfully! Reload the media kit editor.');
                        location.reload();
                    } else {
                        alert('Repair failed: ' + response.data);
                    }
                });
            }
            </script>
        </div>
        <?php
    }
    
    private function display_state_analysis($post_id) {
        $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if (!$saved_state) {
            echo '<div class="notice notice-warning"><p>No saved state found for post ID: ' . $post_id . '</p></div>';
            return;
        }
        
        $components_count = isset($saved_state['components']) ? count($saved_state['components']) : 0;
        $sections_count = isset($saved_state['sections']) ? count($saved_state['sections']) : 0;
        
        // Find orphaned components
        $orphaned_components = array();
        $components_in_sections = 0;
        
        if (isset($saved_state['sections']) && is_array($saved_state['sections'])) {
            foreach ($saved_state['sections'] as $section) {
                if (isset($section['components']) && is_array($section['components'])) {
                    foreach ($section['components'] as $comp_ref) {
                        $components_in_sections++;
                        $comp_id = is_array($comp_ref) 
                            ? (isset($comp_ref['component_id']) ? $comp_ref['component_id'] : 'unknown')
                            : $comp_ref;
                        
                        if (!isset($saved_state['components'][$comp_id])) {
                            $orphaned_components[] = $comp_id;
                        }
                    }
                }
            }
        }
        
        ?>
        <div class="card">
            <h2>State Analysis for Post <?php echo $post_id; ?></h2>
            
            <table class="widefat">
                <tr>
                    <th>Components in Main Object:</th>
                    <td><?php echo $components_count; ?></td>
                </tr>
                <tr>
                    <th>Sections:</th>
                    <td><?php echo $sections_count; ?></td>
                </tr>
                <tr>
                    <th>Component References in Sections:</th>
                    <td><?php echo $components_in_sections; ?></td>
                </tr>
                <tr>
                    <th>Orphaned Components:</th>
                    <td>
                        <?php 
                        if (count($orphaned_components) > 0) {
                            echo '<span style="color: red;">' . count($orphaned_components) . ' components need repair!</span><br>';
                            echo 'IDs: ' . implode(', ', array_slice($orphaned_components, 0, 5));
                            if (count($orphaned_components) > 5) {
                                echo ' ... and ' . (count($orphaned_components) - 5) . ' more';
                            }
                        } else {
                            echo '<span style="color: green;">None - State is valid</span>';
                        }
                        ?>
                    </td>
                </tr>
            </table>
            
            <?php if (count($orphaned_components) > 0): ?>
                <p>
                    <button class="button button-primary" onclick="gmkbRepairState(<?php echo $post_id; ?>)">
                        Repair State (Fix Orphaned Components)
                    </button>
                </p>
            <?php endif; ?>
            
            <h3>Raw State Data (First 1000 chars)</h3>
            <pre style="background: #f0f0f0; padding: 10px; overflow: auto; max-height: 300px;">
<?php echo esc_html(substr(json_encode($saved_state, JSON_PRETTY_PRINT), 0, 1000)); ?>
            </pre>
        </div>
        <?php
    }
    
    public function ajax_repair_state() {
        check_ajax_referer('gmkb_diagnostics', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied');
            return;
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        if (!$post_id) {
            wp_send_json_error('No post ID provided');
            return;
        }
        
        $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        if (!$saved_state) {
            wp_send_json_error('No state found');
            return;
        }
        
        // Initialize components if needed
        if (!isset($saved_state['components'])) {
            $saved_state['components'] = array();
        }
        
        $repaired = 0;
        
        // Find and repair orphaned components
        if (isset($saved_state['sections']) && is_array($saved_state['sections'])) {
            foreach ($saved_state['sections'] as $section) {
                if (isset($section['components']) && is_array($section['components'])) {
                    foreach ($section['components'] as $comp_ref) {
                        $comp_id = is_array($comp_ref) 
                            ? (isset($comp_ref['component_id']) ? $comp_ref['component_id'] : null)
                            : $comp_ref;
                        
                        if ($comp_id && !isset($saved_state['components'][$comp_id])) {
                            // Reconstruct the component
                            $parts = explode('_', $comp_id);
                            $type = count($parts) > 2 ? $parts[0] : 'unknown';
                            
                            $saved_state['components'][$comp_id] = array(
                                'id' => $comp_id,
                                'type' => $type,
                                'props' => array(),
                                'data' => array(),
                                'content' => array(),
                                'sectionId' => isset($section['section_id']) ? $section['section_id'] : null,
                                'createdAt' => time() * 1000,
                                'updatedAt' => time() * 1000,
                                'recovered' => true
                            );
                            $repaired++;
                        }
                    }
                }
            }
        }
        
        // Save the repaired state
        update_post_meta($post_id, 'gmkb_media_kit_state', $saved_state);
        
        wp_send_json_success(array(
            'message' => "Repaired $repaired orphaned components",
            'components_count' => count($saved_state['components'])
        ));
    }
    
    public function ajax_test_save() {
        check_ajax_referer('gmkb_diagnostics', 'nonce');
        
        $state = json_decode(stripslashes($_POST['state']), true);
        
        $components_count = 0;
        if (isset($state['components'])) {
            if (is_array($state['components'])) {
                $components_count = count($state['components']);
            }
        }
        
        wp_send_json_success(array(
            'received_components' => $components_count,
            'state_keys' => array_keys($state),
            'components_type' => isset($state['components']) ? gettype($state['components']) : 'not set'
        ));
    }
}

// Initialize the diagnostic tool
new GMKB_Admin_Diagnostic();
