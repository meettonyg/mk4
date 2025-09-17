<?php
/**
 * Database Inspector for GMKB
 * Helps diagnose save/load issues with media kit state
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Database_Inspector {
    
    public function __construct() {
        // Only add inspector in debug mode
        if (defined('WP_DEBUG') && WP_DEBUG) {
            add_action('wp_ajax_gmkb_inspect_state', array($this, 'inspect_state'));
        }
    }
    
    /**
     * AJAX handler to inspect database state
     */
    public function inspect_state() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        
        if (!$post_id) {
            wp_send_json_error('No post ID provided');
            return;
        }
        
        // Get saved state
        $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        $analysis = array(
            'post_id' => $post_id,
            'state_exists' => !empty($saved_state)
        );
        
        if (!empty($saved_state)) {
            // Analyze components
            if (isset($saved_state['components'])) {
                $components = $saved_state['components'];
                $analysis['components_analysis'] = array(
                    'exists' => true,
                    'type' => gettype($components),
                    'count' => is_array($components) ? count($components) : 0,
                    'first_5_ids' => is_array($components) ? array_slice(array_keys($components), 0, 5) : []
                );
                
                // Sample component structure
                if (is_array($components) && count($components) > 0) {
                    $first_key = array_key_first($components);
                    $first_component = $components[$first_key];
                    $analysis['components_analysis']['sample_component'] = array(
                        'id' => $first_key,
                        'type' => isset($first_component['type']) ? $first_component['type'] : 'unknown',
                        'has_data' => isset($first_component['data']),
                        'has_props' => isset($first_component['props']),
                        'keys' => array_keys($first_component)
                    );
                }
            } else {
                $analysis['components_analysis'] = array(
                    'exists' => false
                );
            }
            
            // Analyze sections
            if (isset($saved_state['sections'])) {
                $sections = $saved_state['sections'];
                $analysis['sections_analysis'] = array(
                    'count' => is_array($sections) ? count($sections) : 0,
                    'sections' => array()
                );
                
                if (is_array($sections)) {
                    foreach ($sections as $section) {
                        $analysis['sections_analysis']['sections'][] = array(
                            'id' => isset($section['id']) ? $section['id'] : 'unknown',
                            'type' => isset($section['type']) ? $section['type'] : 'unknown',
                            'component_count' => isset($section['components']) && is_array($section['components']) ? count($section['components']) : 0
                        );
                    }
                }
            }
            
            // Analyze layout
            if (isset($saved_state['layout'])) {
                $analysis['layout_analysis'] = array(
                    'exists' => true,
                    'type' => gettype($saved_state['layout']),
                    'count' => is_array($saved_state['layout']) ? count($saved_state['layout']) : 0
                );
            }
        }
        
        wp_send_json_success($analysis);
    }
}

// Initialize the inspector
new GMKB_Database_Inspector();
