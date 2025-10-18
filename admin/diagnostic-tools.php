<?php
/**
 * GMKB Admin Diagnostic & Repair Tool - COMPREHENSIVE EDITION
 * Covers ALL settings from component sidepanels, section editors, and theme customizer
 * 
 * @package MediaKitBuilder
 * @version 2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Admin_Diagnostic {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_ajax_gmkb_repair_state', array($this, 'ajax_repair_state'));
        add_action('wp_ajax_gmkb_validate_all_settings', array($this, 'ajax_validate_all_settings'));
        add_action('wp_ajax_gmkb_test_save', array($this, 'ajax_test_save'));
    }
    
    public function add_admin_menu() {
        // PRIMARY: Add as top-level menu item (same as Data Viewer)
        add_menu_page(
            'GMKB Diagnostics',
            'GMKB Diagnostics',
            'manage_options',
            'gmkb-diagnostics',
            array($this, 'render_diagnostic_page'),
            'dashicons-admin-tools',
            86  // Right after Media Kit Data (85)
        );
        
        // BACKUP: Also add to Tools menu
        add_submenu_page(
            'tools.php',
            'GMKB Diagnostics',
            'GMKB Diagnostics',
            'manage_options',
            'gmkb-diagnostics-tools',
            array($this, 'render_diagnostic_page')
        );
        
        // Debug: Log menu registration
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB Diagnostics menu registered as TOP-LEVEL menu');
            error_log('✅ Current user can manage_options: ' . (current_user_can('manage_options') ? 'YES' : 'NO'));
        }
    }
    
    public function render_diagnostic_page() {
        // ROOT FIX: Explicit capability check with better error handling
        if (!current_user_can('edit_posts') && !current_user_can('manage_options')) {
            wp_die(
                '<h1>Permission Denied</h1>' .
                '<p>You do not have sufficient permissions to access this page.</p>' .
                '<p><strong>Debug Info:</strong></p>' .
                '<ul>' .
                '<li>User ID: ' . get_current_user_id() . '</li>' .
                '<li>Can edit_posts: ' . (current_user_can('edit_posts') ? 'Yes' : 'No') . '</li>' .
                '<li>Can manage_options: ' . (current_user_can('manage_options') ? 'Yes' : 'No') . '</li>' .
                '<li>User roles: ' . implode(', ', wp_get_current_user()->roles) . '</li>' .
                '</ul>',
                'Permission Denied',
                array('response' => 403)
            );
        }
        
        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
        ?>
        <div class="wrap">
            <h1>🔧 GMKB Comprehensive Diagnostic Tool</h1>
            <p class="description">Validates all component settings, section layouts, and theme configurations</p>
            
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
                                <input type="submit" class="button button-primary" value="Run Diagnostics">
                            </td>
                        </tr>
                    </table>
                </form>
            </div>
            
            <?php if ($post_id): ?>
                <?php $this->display_comprehensive_analysis($post_id); ?>
            <?php endif; ?>
            
            <div class="card" style="margin-top: 20px;">
                <h2>Quick Actions</h2>
                <p>
                    <button class="button button-secondary" onclick="gmkbClearLocalStorage()">Clear Browser Storage</button>
                    <button class="button button-secondary" onclick="gmkbTestSave()">Test Save Function</button>
                    <button class="button button-primary" onclick="gmkbValidateAllSettings(<?php echo $post_id; ?>)">Validate All Settings</button>
                </p>
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
                            props: { title: 'Test Component' },
                            settings: {
                                style: {
                                    spacing: { margin: { top: 0, right: 0, bottom: 0, left: 0 } },
                                    background: { color: '#ffffff', opacity: 100 }
                                },
                                advanced: {
                                    layout: { width: { type: 'auto' } },
                                    responsive: { desktop: true, tablet: true, mobile: true }
                                }
                            }
                        }
                    },
                    sections: [{
                        section_id: 'test_section_123',
                        components: [{ component_id: 'test_comp_123' }],
                        layout: 'full_width',
                        settings: {
                            padding: 'medium',
                            gap: 'medium'
                        }
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
            
            function gmkbValidateAllSettings(postId) {
                if (!postId) {
                    alert('Please enter a Post ID first');
                    return;
                }
                
                jQuery.post(ajaxurl, {
                    action: 'gmkb_validate_all_settings',
                    post_id: postId,
                    nonce: '<?php echo wp_create_nonce('gmkb_diagnostics'); ?>'
                }, function(response) {
                    if (response.success) {
                        alert('Settings validated successfully!\n\n' + response.data.message);
                        location.reload();
                    } else {
                        alert('Validation failed: ' + response.data);
                    }
                });
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
    
    /**
     * COMPREHENSIVE ANALYSIS
     * Checks ALL settings from all panels and editors
     */
    private function display_comprehensive_analysis($post_id) {
        $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if (!$saved_state) {
            echo '<div class="notice notice-warning"><p>No saved state found for post ID: ' . $post_id . '</p></div>';
            return;
        }
        
        $validation_results = $this->validate_complete_state($saved_state);
        
        ?>
        <div class="card">
            <h2>📊 Comprehensive Analysis for Post <?php echo $post_id; ?></h2>
            
            <!-- SUMMARY TABLE -->
            <table class="widefat" style="margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Total</th>
                        <th>Valid</th>
                        <th>Missing</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Components</strong></td>
                        <td><?php echo $validation_results['components']['total']; ?></td>
                        <td style="color: green;"><?php echo $validation_results['components']['valid']; ?></td>
                        <td style="color: red;"><?php echo $validation_results['components']['missing']; ?></td>
                        <td><?php echo $this->get_status_icon($validation_results['components']); ?></td>
                    </tr>
                    <tr>
                        <td><strong>Sections</strong></td>
                        <td><?php echo $validation_results['sections']['total']; ?></td>
                        <td style="color: green;"><?php echo $validation_results['sections']['valid']; ?></td>
                        <td style="color: red;"><?php echo $validation_results['sections']['missing']; ?></td>
                        <td><?php echo $this->get_status_icon($validation_results['sections']); ?></td>
                    </tr>
                    <tr>
                        <td><strong>Component Settings</strong></td>
                        <td><?php echo $validation_results['settings']['total']; ?></td>
                        <td style="color: green;"><?php echo $validation_results['settings']['valid']; ?></td>
                        <td style="color: red;"><?php echo $validation_results['settings']['missing']; ?></td>
                        <td><?php echo $this->get_status_icon($validation_results['settings']); ?></td>
                    </tr>
                    <tr>
                        <td><strong>Theme Configuration</strong></td>
                        <td>1</td>
                        <td style="color: green;"><?php echo $validation_results['theme']['valid'] ? '1' : '0'; ?></td>
                        <td style="color: red;"><?php echo $validation_results['theme']['valid'] ? '0' : '1'; ?></td>
                        <td><?php echo $this->get_status_icon($validation_results['theme']); ?></td>
                    </tr>
                </tbody>
            </table>
            
            <!-- DETAILED ISSUES -->
            <?php if (!empty($validation_results['issues'])): ?>
                <div class="notice notice-error">
                    <h3>⚠️ Issues Found (<?php echo count($validation_results['issues']); ?>)</h3>
                    <ul style="list-style: disc; margin-left: 20px;">
                        <?php foreach ($validation_results['issues'] as $issue): ?>
                            <li><?php echo esc_html($issue); ?></li>
                        <?php endforeach; ?>
                    </ul>
                    <p>
                        <button class="button button-primary" onclick="gmkbRepairState(<?php echo $post_id; ?>)">
                            🔧 Auto-Repair All Issues
                        </button>
                    </p>
                </div>
            <?php else: ?>
                <div class="notice notice-success">
                    <p><strong>✅ All checks passed! No issues found.</strong></p>
                </div>
            <?php endif; ?>
            
            <!-- COMPONENT SETTINGS BREAKDOWN -->
            <details style="margin-top: 20px;">
                <summary style="cursor: pointer; font-weight: bold; padding: 10px; background: #f0f0f0;">
                    📋 Component Settings Breakdown
                </summary>
                <div style="padding: 10px;">
                    <?php foreach ($validation_results['component_details'] as $comp_id => $details): ?>
                        <h4><?php echo esc_html($details['type']); ?> (<?php echo substr($comp_id, 0, 20); ?>...)</h4>
                        <table class="widefat">
                            <tr>
                                <td>Content Settings</td>
                                <td><?php echo $this->get_check_icon($details['has_props']); ?></td>
                            </tr>
                            <tr>
                                <td>Style → Spacing</td>
                                <td><?php echo $this->get_check_icon($details['has_spacing']); ?></td>
                            </tr>
                            <tr>
                                <td>Style → Background</td>
                                <td><?php echo $this->get_check_icon($details['has_background']); ?></td>
                            </tr>
                            <tr>
                                <td>Style → Typography</td>
                                <td><?php echo $this->get_check_icon($details['has_typography']); ?></td>
                            </tr>
                            <tr>
                                <td>Style → Border</td>
                                <td><?php echo $this->get_check_icon($details['has_border']); ?></td>
                            </tr>
                            <tr>
                                <td>Style → Effects</td>
                                <td><?php echo $this->get_check_icon($details['has_effects']); ?></td>
                            </tr>
                            <tr>
                                <td>Advanced → Layout</td>
                                <td><?php echo $this->get_check_icon($details['has_layout']); ?></td>
                            </tr>
                            <tr>
                                <td>Advanced → Responsive</td>
                                <td><?php echo $this->get_check_icon($details['has_responsive']); ?></td>
                            </tr>
                            <tr>
                                <td>Advanced → Custom CSS</td>
                                <td><?php echo $this->get_check_icon($details['has_custom']); ?></td>
                            </tr>
                        </table>
                        <br>
                    <?php endforeach; ?>
                </div>
            </details>
            
            <!-- SECTION SETTINGS BREAKDOWN -->
            <details style="margin-top: 20px;">
                <summary style="cursor: pointer; font-weight: bold; padding: 10px; background: #f0f0f0;">
                    📐 Section Settings Breakdown
                </summary>
                <div style="padding: 10px;">
                    <?php foreach ($validation_results['section_details'] as $section_id => $details): ?>
                        <h4>Section (<?php echo substr($section_id, 0, 20); ?>...)</h4>
                        <table class="widefat">
                            <tr>
                                <th colspan="2" style="background: #f0f0f0;"><strong>Layout Tab</strong></th>
                            </tr>
                            <tr>
                                <td>Layout Type</td>
                                <td><?php echo $this->get_check_icon($details['has_layout']); ?> 
                                <?php if ($details['layout_value']): ?>
                                    <code><?php echo esc_html($details['layout_value']); ?></code>
                                <?php endif; ?>
                                </td>
                            </tr>
                            <tr>
                                <td>Padding</td>
                                <td><?php echo $this->get_check_icon($details['has_padding']); ?>
                                <?php if ($details['padding_value']): ?>
                                    <code><?php echo esc_html($details['padding_value']); ?></code>
                                <?php endif; ?>
                                </td>
                            </tr>
                            <tr>
                                <td>Gap</td>
                                <td><?php echo $this->get_check_icon($details['has_gap']); ?>
                                <?php if ($details['gap_value']): ?>
                                    <code><?php echo esc_html($details['gap_value']); ?></code>
                                <?php endif; ?>
                                </td>
                            </tr>
                            
                            <tr>
                                <th colspan="2" style="background: #f0f0f0;"><strong>Style Tab</strong></th>
                            </tr>
                            <tr>
                                <td>Background Color</td>
                                <td><?php echo $this->get_check_icon($details['has_background_color']); ?>
                                <?php if ($details['background_color_value']): ?>
                                    <span style="display: inline-block; width: 20px; height: 20px; background: <?php echo esc_attr($details['background_color_value']); ?>; border: 1px solid #ccc; vertical-align: middle; margin-right: 5px;"></span>
                                    <code><?php echo esc_html($details['background_color_value']); ?></code>
                                <?php endif; ?>
                                </td>
                            </tr>
                            <tr>
                                <td>Background Opacity</td>
                                <td><?php echo $this->get_check_icon($details['has_background_opacity']); ?>
                                <?php if ($details['background_opacity_value'] !== null): ?>
                                    <code><?php echo esc_html($details['background_opacity_value']); ?></code>
                                <?php endif; ?>
                                </td>
                            </tr>
                            
                            <tr>
                                <th colspan="2" style="background: #f0f0f0;"><strong>Advanced Tab</strong></th>
                            </tr>
                            <tr>
                                <td>Full Width Container</td>
                                <td><?php echo $this->get_check_icon($details['has_full_width']); ?>
                                <?php if ($details['full_width_value'] !== null): ?>
                                    <code><?php echo $details['full_width_value'] ? 'Yes' : 'No'; ?></code>
                                <?php endif; ?>
                                </td>
                            </tr>
                            <tr>
                                <td>Reverse Columns on Mobile</td>
                                <td><?php echo $this->get_check_icon($details['has_reverse_mobile']); ?>
                                <?php if ($details['reverse_mobile_value'] !== null): ?>
                                    <code><?php echo $details['reverse_mobile_value'] ? 'Yes' : 'No'; ?></code>
                                <?php endif; ?>
                                </td>
                            </tr>
                            <tr>
                                <td>Custom CSS Class</td>
                                <td><?php echo $this->get_check_icon($details['has_custom_class']); ?>
                                <?php if ($details['custom_class_value']): ?>
                                    <code><?php echo esc_html($details['custom_class_value']); ?></code>
                                <?php endif; ?>
                                </td>
                            </tr>
                        </table>
                        <br>
                    <?php endforeach; ?>
                </div>
            </details>
            
            <!-- THEME SETTINGS -->
            <details style="margin-top: 20px;">
                <summary style="cursor: pointer; font-weight: bold; padding: 10px; background: #f0f0f0;">
                    🎨 Theme Settings (from Theme Customizer)
                </summary>
                <div style="padding: 10px;">
                    <?php 
                    $theme_data = get_option('gmkb_active_theme', array());
                    $theme_details = $validation_results['theme_details'];
                    ?>
                    <table class="widefat">
                        <tr>
                            <th colspan="2"><strong>Themes Panel</strong></th>
                        </tr>
                        <tr>
                            <td>Active Theme Set</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_active_theme']); ?>
                            <?php if ($theme_details['active_theme_id']): ?>
                                <code><?php echo esc_html($theme_details['active_theme_id']); ?></code>
                            <?php endif; ?>
                            </td>
                        </tr>
                        <tr>
                            <td>Active Theme Name</td>
                            <td>
                            <?php if ($theme_details['active_theme_name']): ?>
                                <strong><?php echo esc_html($theme_details['active_theme_name']); ?></strong>
                            <?php else: ?>
                                <span style="color: red;">✗ Missing</span>
                            <?php endif; ?>
                            </td>
                        </tr>
                        <tr>
                            <td>Custom Themes Available</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_custom_themes']); ?>
                            <?php if ($theme_details['custom_themes_count'] > 0): ?>
                                (<?php echo $theme_details['custom_themes_count']; ?> custom themes)
                            <?php endif; ?>
                            </td>
                        </tr>
                        
                        <tr>
                            <th colspan="2"><strong>Colors Panel</strong></th>
                        </tr>
                        <tr>
                            <td>Primary Color</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_primary_color']); ?></td>
                        </tr>
                        <tr>
                            <td>Secondary Color</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_secondary_color']); ?></td>
                        </tr>
                        <tr>
                            <td>Background & Surface Colors</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_background_colors']); ?></td>
                        </tr>
                        <tr>
                            <td>Text Colors (text, textLight)</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_text_colors']); ?></td>
                        </tr>
                        <tr>
                            <td>Border Color</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_border_color']); ?></td>
                        </tr>
                        <tr>
                            <td>Success Color</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_success_color']); ?></td>
                        </tr>
                        <tr>
                            <td>Warning Color</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_warning_color']); ?></td>
                        </tr>
                        <tr>
                            <td>Error Color</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_error_color']); ?></td>
                        </tr>
                        
                        <tr>
                            <th colspan="2"><strong>Typography Panel</strong></th>
                        </tr>
                        <tr>
                            <td>Primary Font Family</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_font_family']); ?></td>
                        </tr>
                        <tr>
                            <td>Heading Font Family</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_heading_family']); ?></td>
                        </tr>
                        <tr>
                            <td>Font Size Settings (baseFontSize, headingScale)</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_font_sizes']); ?></td>
                        </tr>
                        <tr>
                            <td>Text Properties (lineHeight, fontWeight)</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_text_properties']); ?></td>
                        </tr>
                        
                        <tr>
                            <th colspan="2"><strong>Spacing Panel</strong></th>
                        </tr>
                        <tr>
                            <td>Base Unit</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_base_unit']); ?></td>
                        </tr>
                        <tr>
                            <td>Component Gap</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_component_gap']); ?></td>
                        </tr>
                        <tr>
                            <td>Section Padding</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_section_padding']); ?></td>
                        </tr>
                        <tr>
                            <td>Container Max Width</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_container_max_width']); ?></td>
                        </tr>
                        
                        <tr>
                            <th colspan="2"><strong>Effects Panel</strong></th>
                        </tr>
                        <tr>
                            <td>Border Settings</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_border_settings']); ?></td>
                        </tr>
                        <tr>
                            <td>Shadow Settings</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_shadow_settings']); ?></td>
                        </tr>
                        <tr>
                            <td>Animation Settings</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_animation_settings']); ?></td>
                        </tr>
                        <tr>
                            <td>Gradient Backgrounds</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_gradients']); ?></td>
                        </tr>
                        <tr>
                            <td>Blur Effects (Glassmorphism)</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_blur_effects']); ?></td>
                        </tr>
                        
                        <tr>
                            <th colspan="2"><strong>Save Theme Panel</strong></th>
                        </tr>
                        <tr>
                            <td>Theme ID</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_theme_id']); ?></td>
                        </tr>
                        <tr>
                            <td>Theme Name</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_theme_name']); ?></td>
                        </tr>
                        <tr>
                            <td>Theme Description</td>
                            <td><?php echo $this->get_check_icon($theme_details['has_theme_description']); ?></td>
                        </tr>
                        <tr>
                            <td>Is Custom Theme</td>
                            <td><?php echo $this->get_check_icon($theme_details['is_custom_theme']); ?>
                            <?php if ($theme_details['is_custom_theme']): ?>
                                <span style="color: blue;">(User-created theme)</span>
                            <?php else: ?>
                                <span style="color: gray;">(Built-in theme)</span>
                            <?php endif; ?>
                            </td>
                        </tr>
                    </table>
                </div>
            </details>
            
            <!-- RAW STATE DATA -->
            <details style="margin-top: 20px;">
                <summary style="cursor: pointer; font-weight: bold; padding: 10px; background: #f0f0f0;">
                    🔍 Raw State Data (First 1000 characters)
                </summary>
                <pre style="background: #f0f0f0; padding: 10px; overflow: auto; max-height: 300px;">
<?php echo esc_html(substr(json_encode($saved_state, JSON_PRETTY_PRINT), 0, 1000)); ?>
                </pre>
            </details>
        </div>
        <?php
    }
    
    /**
     * COMPREHENSIVE STATE VALIDATION
     * Validates ALL settings from all sidepanels and editors
     */
    private function validate_complete_state($state) {
        $results = array(
            'components' => array('total' => 0, 'valid' => 0, 'missing' => 0),
            'sections' => array('total' => 0, 'valid' => 0, 'missing' => 0),
            'settings' => array('total' => 0, 'valid' => 0, 'missing' => 0),
            'theme' => array('valid' => false),
            'issues' => array(),
            'component_details' => array(),
            'section_details' => array(),
            'theme_details' => array()
        );
        
        // Validate Components
        if (isset($state['components']) && is_array($state['components'])) {
            $results['components']['total'] = count($state['components']);
            
            foreach ($state['components'] as $comp_id => $component) {
                $comp_validation = $this->validate_component_settings($comp_id, $component);
                $results['component_details'][$comp_id] = $comp_validation;
                
                if ($comp_validation['is_valid']) {
                    $results['components']['valid']++;
                } else {
                    $results['components']['missing']++;
                    $results['issues'] = array_merge($results['issues'], $comp_validation['issues']);
                }
                
                $results['settings']['total']++;
                if ($comp_validation['settings_valid']) {
                    $results['settings']['valid']++;
                } else {
                    $results['settings']['missing']++;
                }
            }
        }
        
        // Validate Sections
        if (isset($state['sections']) && is_array($state['sections'])) {
            $results['sections']['total'] = count($state['sections']);
            
            foreach ($state['sections'] as $section) {
                $section_id = $section['section_id'] ?? 'unknown';
                $section_validation = $this->validate_section_settings($section_id, $section);
                $results['section_details'][$section_id] = $section_validation;
                
                if ($section_validation['is_valid']) {
                    $results['sections']['valid']++;
                } else {
                    $results['sections']['missing']++;
                    $results['issues'] = array_merge($results['issues'], $section_validation['issues']);
                }
            }
        }
        
        // Validate Theme
        $theme_validation = $this->validate_theme_settings();
        $results['theme']['valid'] = $theme_validation['is_valid'];
        $results['theme_details'] = $theme_validation;
        if (!$theme_validation['is_valid']) {
            $results['issues'] = array_merge($results['issues'], $theme_validation['issues']);
        }
        
        return $results;
    }
    
    /**
     * Validate Component Settings
     * Checks all settings from GenericComponentEditor, BaseStylePanel, BaseAdvancedPanel
     */
    private function validate_component_settings($comp_id, $component) {
        $validation = array(
            'is_valid' => true,
            'settings_valid' => true,
            'issues' => array(),
            'type' => $component['type'] ?? 'unknown',
            'has_props' => false,
            'has_spacing' => false,
            'has_background' => false,
            'has_typography' => false,
            'has_border' => false,
            'has_effects' => false,
            'has_layout' => false,
            'has_responsive' => false,
            'has_custom' => false
        );
        
        // Check Content Settings (props/data)
        if (isset($component['props']) || isset($component['data'])) {
            $validation['has_props'] = true;
        }
        
        // Check Settings Structure
        if (!isset($component['settings']) || !is_array($component['settings'])) {
            $validation['is_valid'] = false;
            $validation['settings_valid'] = false;
            $validation['issues'][] = "Component {$comp_id}: Missing settings object";
            return $validation;
        }
        
        $settings = $component['settings'];
        
        // Validate Style Settings
        if (isset($settings['style']) && is_array($settings['style'])) {
            $style = $settings['style'];
            
            // Spacing
            if (isset($style['spacing']) && is_array($style['spacing'])) {
                if (isset($style['spacing']['margin']) && isset($style['spacing']['padding'])) {
                    $validation['has_spacing'] = true;
                }
            }
            
            // Background
            if (isset($style['background']) && is_array($style['background'])) {
                if (isset($style['background']['color']) && isset($style['background']['opacity'])) {
                    $validation['has_background'] = true;
                }
            }
            
            // Typography
            if (isset($style['typography']) && is_array($style['typography'])) {
                $validation['has_typography'] = true;
            }
            
            // Border
            if (isset($style['border']) && is_array($style['border'])) {
                if (isset($style['border']['width']) && isset($style['border']['color'])) {
                    $validation['has_border'] = true;
                }
            }
            
            // Effects
            if (isset($style['effects']) && is_array($style['effects'])) {
                $validation['has_effects'] = true;
            }
        } else {
            $validation['settings_valid'] = false;
            $validation['issues'][] = "Component {$comp_id}: Missing style settings";
        }
        
        // Validate Advanced Settings
        if (isset($settings['advanced']) && is_array($settings['advanced'])) {
            $advanced = $settings['advanced'];
            
            // Layout
            if (isset($advanced['layout']) && is_array($advanced['layout'])) {
                if (isset($advanced['layout']['width']) && isset($advanced['layout']['alignment'])) {
                    $validation['has_layout'] = true;
                }
            }
            
            // Responsive
            if (isset($advanced['responsive']) && is_array($advanced['responsive'])) {
                if (isset($advanced['responsive']['desktop'])) {
                    $validation['has_responsive'] = true;
                }
            }
            
            // Custom CSS
            if (isset($advanced['custom']) && is_array($advanced['custom'])) {
                $validation['has_custom'] = true;
            }
        } else {
            $validation['settings_valid'] = false;
            $validation['issues'][] = "Component {$comp_id}: Missing advanced settings";
        }
        
        return $validation;
    }
    
    /**
     * Validate Section Settings
     * Checks all settings from SectionEditor
     */
    private function validate_section_settings($section_id, $section) {
        $validation = array(
            'is_valid' => true,
            'issues' => array(),
            // Layout Tab - 3 settings
            'has_layout' => false,
            'layout_value' => null,
            'has_padding' => false,
            'padding_value' => null,
            'has_gap' => false,
            'gap_value' => null,
            // Style Tab - 2 settings
            'has_background_color' => false,
            'background_color_value' => null,
            'has_background_opacity' => false,
            'background_opacity_value' => null,
            // Advanced Tab - 3 settings
            'has_full_width' => false,
            'full_width_value' => null,
            'has_reverse_mobile' => false,
            'reverse_mobile_value' => null,
            'has_custom_class' => false,
            'custom_class_value' => null
        );
        
        // Layout Type
        if (isset($section['layout']) || isset($section['type'])) {
            $validation['has_layout'] = true;
            $validation['layout_value'] = $section['layout'] ?? $section['type'];
        }
        
        // Settings
        if (isset($section['settings']) && is_array($section['settings'])) {
            $settings = $section['settings'];
            
            // Layout Tab Settings
            if (isset($settings['padding'])) {
                $validation['has_padding'] = true;
                $validation['padding_value'] = $settings['padding'];
            }
            
            if (isset($settings['gap'])) {
                $validation['has_gap'] = true;
                $validation['gap_value'] = $settings['gap'];
            }
            
            // Style Tab Settings
            if (isset($settings['backgroundColor'])) {
                $validation['has_background_color'] = true;
                $validation['background_color_value'] = $settings['backgroundColor'];
            }
            
            if (isset($settings['backgroundOpacity'])) {
                $validation['has_background_opacity'] = true;
                $validation['background_opacity_value'] = $settings['backgroundOpacity'];
            }
            
            // Advanced Tab Settings
            if (isset($settings['fullWidth'])) {
                $validation['has_full_width'] = true;
                $validation['full_width_value'] = $settings['fullWidth'];
            }
            
            if (isset($settings['reverseOnMobile'])) {
                $validation['has_reverse_mobile'] = true;
                $validation['reverse_mobile_value'] = $settings['reverseOnMobile'];
            }
            
            // Custom Class
            if (isset($settings['customClass'])) {
                $validation['has_custom_class'] = true;
                $validation['custom_class_value'] = $settings['customClass'];
            }
        }
        
        if (!$validation['has_layout']) {
            $validation['is_valid'] = false;
            $validation['issues'][] = "Section {$section_id}: Missing layout configuration";
        }
        
        return $validation;
    }
    
    /**
     * Validate Theme Settings
     * Checks all settings from ThemeCustomizer panels
     */
    private function validate_theme_settings() {
        $theme = get_option('gmkb_active_theme', array());
        
        $validation = array(
            'is_valid' => true,
            'issues' => array(),
            // Themes Panel - Theme selection
            'has_active_theme' => false,
            'active_theme_id' => null,
            'active_theme_name' => null,
            'has_custom_themes' => false,
            'custom_themes_count' => 0,
            // Colors Panel - ALL 10 colors
            'has_primary_color' => false,
            'has_secondary_color' => false,
            'has_background_colors' => false,
            'has_text_colors' => false,
            'has_border_color' => false,
            'has_success_color' => false,
            'has_warning_color' => false,
            'has_error_color' => false,
            // Typography Panel - ALL 6 settings
            'has_font_family' => false,
            'has_heading_family' => false,
            'has_font_sizes' => false,
            'has_text_properties' => false,
            // Spacing Panel - ALL 4 settings
            'has_base_unit' => false,
            'has_component_gap' => false,
            'has_section_padding' => false,
            'has_container_max_width' => false,
            // Effects Panel - ALL 5 settings
            'has_border_settings' => false,
            'has_shadow_settings' => false,
            'has_animation_settings' => false,
            'has_gradients' => false,
            'has_blur_effects' => false,
            // Save Theme Panel - Theme metadata
            'has_theme_id' => false,
            'has_theme_name' => false,
            'has_theme_description' => false,
            'is_custom_theme' => false
        );
        
        if (empty($theme) || !is_array($theme)) {
            $validation['is_valid'] = false;
            $validation['issues'][] = "Theme: No active theme configuration found";
            return $validation;
        }
        
        // Validate Themes Panel - Active theme and custom themes
        if (isset($theme['id'])) {
            $validation['has_active_theme'] = true;
            $validation['active_theme_id'] = $theme['id'];
        }
        
        if (isset($theme['name'])) {
            $validation['active_theme_name'] = $theme['name'];
        }
        
        // Check for custom themes
        $custom_themes = get_option('gmkb_custom_themes', array());
        if (!empty($custom_themes) && is_array($custom_themes)) {
            $validation['has_custom_themes'] = true;
            $validation['custom_themes_count'] = count($custom_themes);
        }
        
        // Validate Save Theme Panel - Theme metadata
        if (isset($theme['id'])) {
            $validation['has_theme_id'] = true;
        }
        
        if (isset($theme['name'])) {
            $validation['has_theme_name'] = true;
        }
        
        if (isset($theme['description'])) {
            $validation['has_theme_description'] = true;
        }
        
        if (isset($theme['isCustom']) && $theme['isCustom']) {
            $validation['is_custom_theme'] = true;
        }
        
        // Validate Colors - ALL 10 individual colors from ColorsPanel.vue
        if (isset($theme['colors']) && is_array($theme['colors'])) {
            $colors = $theme['colors'];
            if (isset($colors['primary'])) $validation['has_primary_color'] = true;
            if (isset($colors['secondary'])) $validation['has_secondary_color'] = true;
            if (isset($colors['background']) && isset($colors['surface'])) {
                $validation['has_background_colors'] = true;
            }
            if (isset($colors['text']) && isset($colors['textLight'])) {
                $validation['has_text_colors'] = true;
            }
            if (isset($colors['border'])) $validation['has_border_color'] = true;
            if (isset($colors['success'])) $validation['has_success_color'] = true;
            if (isset($colors['warning'])) $validation['has_warning_color'] = true;
            if (isset($colors['error'])) $validation['has_error_color'] = true;
        }
        
        // Validate Typography - ALL 6 settings from TypographyPanel.vue
        if (isset($theme['typography']) && is_array($theme['typography'])) {
            $typo = $theme['typography'];
            if (isset($typo['fontFamily'])) $validation['has_font_family'] = true;
            if (isset($typo['headingFamily'])) $validation['has_heading_family'] = true;
            if (isset($typo['baseFontSize']) && isset($typo['headingScale'])) {
                $validation['has_font_sizes'] = true;
            }
            if (isset($typo['lineHeight']) && isset($typo['fontWeight'])) {
                $validation['has_text_properties'] = true;
            }
        }
        
        // Validate Spacing - ALL 4 settings from SpacingPanel.vue
        if (isset($theme['spacing']) && is_array($theme['spacing'])) {
            $spacing = $theme['spacing'];
            if (isset($spacing['baseUnit'])) $validation['has_base_unit'] = true;
            if (isset($spacing['componentGap'])) $validation['has_component_gap'] = true;
            if (isset($spacing['sectionPadding'])) $validation['has_section_padding'] = true;
            if (isset($spacing['containerMaxWidth'])) $validation['has_container_max_width'] = true;
        }
        
        // Validate Effects - ALL 5 settings from EffectsPanel.vue
        if (isset($theme['effects']) && is_array($theme['effects'])) {
            $effects = $theme['effects'];
            if (isset($effects['borderRadius'])) $validation['has_border_settings'] = true;
            if (isset($effects['shadowIntensity'])) $validation['has_shadow_settings'] = true;
            if (isset($effects['animationSpeed'])) $validation['has_animation_settings'] = true;
            if (isset($effects['gradients'])) $validation['has_gradients'] = true;
            if (isset($effects['blurEffects'])) $validation['has_blur_effects'] = true;
        }
        
        return $validation;
    }
    
    /**
     * Helper Functions
     */
    private function get_status_icon($category) {
        if (isset($category['missing']) && $category['missing'] > 0) {
            return '❌ Issues Found';
        }
        if (isset($category['valid']) && $category['valid'] === false) {
            return '❌ Not Valid';
        }
        return '✅ Valid';
    }
    
    private function get_check_icon($has_feature) {
        return $has_feature ? '<span style="color: green;">✓ Present</span>' : '<span style="color: red;">✗ Missing</span>';
    }
    
    /**
     * AJAX: Validate All Settings
     */
    public function ajax_validate_all_settings() {
        check_ajax_referer('gmkb_diagnostics', 'nonce');
        
        if (!current_user_can('manage_options')) { // Back to manage_options
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
        
        $validation = $this->validate_complete_state($saved_state);
        
        $total_issues = count($validation['issues']);
        
        if ($total_issues === 0) {
            wp_send_json_success(array(
                'message' => 'All settings validated successfully! No issues found.'
            ));
        } else {
            wp_send_json_success(array(
                'message' => "Found {$total_issues} issues. See details on page."
            ));
        }
    }
    
    /**
     * AJAX: Repair State (Auto-fix all issues)
     */
    public function ajax_repair_state() {
        check_ajax_referer('gmkb_diagnostics', 'nonce');
        
        if (!current_user_can('manage_options')) { // Back to manage_options
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
        
        $repairs_made = 0;
        
        // Repair Components
        if (isset($saved_state['components']) && is_array($saved_state['components'])) {
            foreach ($saved_state['components'] as $comp_id => &$component) {
                if ($this->repair_component_settings($component)) {
                    $repairs_made++;
                }
            }
        }
        
        // Repair Sections
        if (isset($saved_state['sections']) && is_array($saved_state['sections'])) {
            foreach ($saved_state['sections'] as &$section) {
                if ($this->repair_section_settings($section)) {
                    $repairs_made++;
                }
            }
        }
        
        // Find and repair orphaned components
        if (isset($saved_state['sections']) && is_array($saved_state['sections'])) {
            foreach ($saved_state['sections'] as $section) {
                if (isset($section['components']) && is_array($section['components'])) {
                    foreach ($section['components'] as $comp_ref) {
                        $comp_id = is_array($comp_ref) 
                            ? ($comp_ref['component_id'] ?? null)
                            : $comp_ref;
                        
                        if ($comp_id && !isset($saved_state['components'][$comp_id])) {
                            // Reconstruct orphaned component
                            $parts = explode('_', $comp_id);
                            $type = count($parts) > 2 ? $parts[0] : 'unknown';
                            
                            $saved_state['components'][$comp_id] = array(
                                'id' => $comp_id,
                                'type' => $type,
                                'props' => array(),
                                'data' => array(),
                                'settings' => $this->get_default_component_settings(),
                                'sectionId' => $section['section_id'] ?? null,
                                'createdAt' => time() * 1000,
                                'updatedAt' => time() * 1000,
                                'recovered' => true
                            );
                            $repairs_made++;
                        }
                    }
                }
            }
        }
        
        // Save repaired state
        update_post_meta($post_id, 'gmkb_media_kit_state', $saved_state);
        
        wp_send_json_success(array(
            'message' => "Successfully repaired {$repairs_made} issues",
            'repairs' => $repairs_made
        ));
    }
    
    /**
     * Repair Component Settings
     */
    private function repair_component_settings(&$component) {
        $repaired = false;
        
        if (!isset($component['settings']) || !is_array($component['settings'])) {
            $component['settings'] = $this->get_default_component_settings();
            $repaired = true;
        } else {
            $defaults = $this->get_default_component_settings();
            
            // Merge with defaults
            if (!isset($component['settings']['style'])) {
                $component['settings']['style'] = $defaults['style'];
                $repaired = true;
            }
            if (!isset($component['settings']['advanced'])) {
                $component['settings']['advanced'] = $defaults['advanced'];
                $repaired = true;
            }
        }
        
        return $repaired;
    }
    
    /**
     * Repair Section Settings
     */
    private function repair_section_settings(&$section) {
        $repaired = false;
        
        if (!isset($section['layout']) && !isset($section['type'])) {
            $section['layout'] = 'full_width';
            $repaired = true;
        }
        
        if (!isset($section['settings']) || !is_array($section['settings'])) {
            $section['settings'] = array(
                'padding' => 'medium',
                'gap' => 'medium',
                'backgroundColor' => '#ffffff',
                'backgroundOpacity' => 1
            );
            $repaired = true;
        }
        
        return $repaired;
    }
    
    /**
     * Get Default Component Settings
     */
    private function get_default_component_settings() {
        return array(
            'style' => array(
                'spacing' => array(
                    'margin' => array('top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0, 'unit' => 'px'),
                    'padding' => array('top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0, 'unit' => 'px')
                ),
                'background' => array(
                    'color' => '#ffffff',
                    'opacity' => 100
                ),
                'typography' => array(
                    'fontFamily' => 'inherit',
                    'fontSize' => 16,
                    'fontWeight' => 400,
                    'lineHeight' => 1.5,
                    'color' => '#000000',
                    'textAlign' => 'left'
                ),
                'border' => array(
                    'width' => array('top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0, 'unit' => 'px'),
                    'color' => '#000000',
                    'style' => 'solid',
                    'radius' => array('topLeft' => 0, 'topRight' => 0, 'bottomRight' => 0, 'bottomLeft' => 0, 'unit' => 'px')
                ),
                'effects' => array(
                    'boxShadow' => 'none'
                )
            ),
            'advanced' => array(
                'layout' => array(
                    'width' => array('type' => 'auto', 'value' => 100, 'unit' => '%'),
                    'alignment' => 'left'
                ),
                'responsive' => array(
                    'desktop' => true,
                    'tablet' => true,
                    'mobile' => true
                ),
                'custom' => array(
                    'cssClasses' => '',
                    'cssId' => ''
                )
            )
        );
    }
    
    /**
     * AJAX: Test Save
     */
    public function ajax_test_save() {
        check_ajax_referer('gmkb_diagnostics', 'nonce');
        
        $state = json_decode(stripslashes($_POST['state']), true);
        
        $components_count = isset($state['components']) && is_array($state['components']) 
            ? count($state['components']) 
            : 0;
        
        wp_send_json_success(array(
            'received_components' => $components_count,
            'state_keys' => array_keys($state),
            'components_type' => isset($state['components']) ? gettype($state['components']) : 'not set'
        ));
    }
}

// Initialize the diagnostic tool
new GMKB_Admin_Diagnostic();

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ GMKB Diagnostics class instantiated');
}
