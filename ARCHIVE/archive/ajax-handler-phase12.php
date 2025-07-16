<?php
/**
 * PHASE 1.2 ROOT FIX: Simplified Topics AJAX Handler
 * ✅ ELIMINATES infinite loading through simplified, reliable AJAX handling
 * ✅ Single save method to prevent conflicts  
 * ✅ Enhanced error reporting for debugging
 * ✅ Streamlined validation to prevent timeouts
 * ✅ Direct-to-database saves with immediate response
 */

// PHASE 1.2 FIX: Ensure WordPress context
if (!defined('ABSPATH')) {
    exit;
}

/**
 * PHASE 1.2: Simplified Topics AJAX Handler Class
 * Focused on reliability and preventing loading state issues
 */
class GMKB_Topics_Ajax_Handler_Phase12 {
    
    private static $instance = null;
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor - Register only essential AJAX handlers
     */
    private function __construct() {
        // PHASE 1.2 FIX: Single primary save handler to prevent conflicts
        add_action('wp_ajax_save_topics_phase12', array($this, 'ajax_save_topics'));
        add_action('wp_ajax_nopriv_save_topics_phase12', array($this, 'ajax_save_topics_nopriv'));
        
        // PHASE 1.2 FIX: Simple load handler for displaying topics  
        add_action('wp_ajax_load_topics_phase12', array($this, 'ajax_load_topics'));
        add_action('wp_ajax_nopriv_load_topics_phase12', array($this, 'ajax_load_topics_nopriv'));
        
        // PHASE 1.2 FIX: Maintain compatibility with existing handlers but redirect to new ones
        add_action('wp_ajax_save_custom_topics', array($this, 'ajax_save_topics'));
        add_action('wp_ajax_load_stored_topics', array($this, 'ajax_load_topics'));
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('PHASE 1.2 Topics AJAX Handler: Initialized with simplified handlers');
        }
    }
    
    /**
     * PHASE 1.2 FIX: Primary AJAX save handler - streamlined and reliable
     */
    public function ajax_save_topics() {
        // PHASE 1.2 FIX: Immediate response structure
        $response = array(
            'success' => false,
            'message' => '',
            'data' => array(),
            'debug' => array(),
            'phase' => '1.2'
        );
        
        try {
            // PHASE 1.2 FIX: Quick essential validations only
            if (!$this->quick_validate_request($response)) {
                wp_send_json($response);
                return;
            }
            
            // PHASE 1.2 FIX: Extract data with minimal processing
            $post_id = intval($_POST['post_id'] ?? 0);
            $topics_data = $_POST['topics'] ?? array();
            
            // PHASE 1.2 FIX: Simple JSON handling
            if (is_string($topics_data)) {
                $topics_data = json_decode(stripslashes($topics_data), true);
                if (!is_array($topics_data)) {
                    $topics_data = array();
                }
            }
            
            // PHASE 1.2 FIX: Direct save with minimal validation
            $save_result = $this->save_topics_direct($post_id, $topics_data);
            
            if ($save_result['success']) {
                $response['success'] = true;
                $response['message'] = 'Topics saved successfully';
                $response['data'] = array(
                    'post_id' => $post_id,
                    'topics_saved' => $save_result['count'],
                    'timestamp' => time(),
                    'method' => 'phase_1_2_direct'
                );
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("PHASE 1.2 Topics: Successfully saved {$save_result['count']} topics for post {$post_id}");
                }
            } else {
                $response['message'] = 'Save failed: ' . $save_result['error'];
                $response['debug']['save_error'] = $save_result['error'];
            }
            
        } catch (Exception $e) {
            $response['message'] = 'Server error during save';
            $response['debug']['exception'] = $e->getMessage();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('PHASE 1.2 Topics AJAX Error: ' . $e->getMessage());
            }
        }
        
        wp_send_json($response);
    }
    
    /**
     * PHASE 1.2 FIX: Primary AJAX load handler - simple and fast
     */
    public function ajax_load_topics() {
        $response = array(
            'success' => false,
            'message' => '',
            'data' => array(),
            'phase' => '1.2'
        );
        
        try {
            // PHASE 1.2 FIX: Minimal validation for load requests
            $post_id = intval($_POST['post_id'] ?? $_GET['post_id'] ?? 0);
            
            if (!$post_id) {
                $response['message'] = 'Invalid post ID';
                wp_send_json($response);
                return;
            }
            
            // PHASE 1.2 FIX: Direct load from database
            $topics = $this->load_topics_direct($post_id);
            
            $response['success'] = true;
            $response['message'] = 'Topics loaded successfully';
            $response['data'] = array(
                'topics' => $topics,
                'post_id' => $post_id,
                'count' => count(array_filter($topics)),
                'timestamp' => time(),
                'method' => 'phase_1_2_direct'
            );
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("PHASE 1.2 Topics: Loaded " . count(array_filter($topics)) . " topics for post {$post_id}");
            }
            
        } catch (Exception $e) {
            $response['message'] = 'Load error: ' . $e->getMessage();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('PHASE 1.2 Topics Load Error: ' . $e->getMessage());
            }
        }
        
        wp_send_json($response);
    }
    
    /**
     * PHASE 1.2 FIX: Non-logged-in user handlers
     */
    public function ajax_save_topics_nopriv() {
        wp_send_json(array(
            'success' => false,
            'message' => 'Authentication required',
            'code' => 'AUTHENTICATION_REQUIRED',
            'phase' => '1.2'
        ));
    }
    
    public function ajax_load_topics_nopriv() {
        wp_send_json(array(
            'success' => false,
            'message' => 'Authentication required',
            'code' => 'AUTHENTICATION_REQUIRED',
            'phase' => '1.2'
        ));
    }
    
    /**
     * PHASE 1.2 FIX: Quick request validation - essential checks only
     */
    private function quick_validate_request(&$response) {
        // Check WordPress functions
        if (!function_exists('wp_verify_nonce') || !function_exists('get_current_user_id')) {
            $response['message'] = 'WordPress functions not available';
            return false;
        }
        
        // Check nonce
        $nonce = $_POST['nonce'] ?? '';
        if (empty($nonce) || !wp_verify_nonce($nonce, 'guestify_media_kit_builder')) {
            $response['message'] = 'Security verification failed';
            return false;
        }
        
        // Check user permissions
        if (!current_user_can('edit_posts')) {
            $response['message'] = 'Insufficient permissions';
            return false;
        }
        
        return true;
    }
    
    /**
     * PHASE 1.2 FIX: Direct topic save - minimal processing for reliability
     */
    private function save_topics_direct($post_id, $topics_data) {
        try {
            // PHASE 1.2 FIX: Validate post exists
            if (!get_post($post_id)) {
                return array('success' => false, 'error' => 'Post not found');
            }
            
            $saved_count = 0;
            
            // PHASE 1.2 FIX: Save to both custom fields and MKCG fields for compatibility
            for ($i = 1; $i <= 5; $i++) {
                $topic_key = "topic_{$i}";
                $topic_value = '';
                
                // PHASE 1.2 FIX: Extract topic value with flexible key matching
                if (isset($topics_data[$topic_key])) {
                    $topic_value = $topics_data[$topic_key];
                } elseif (isset($topics_data[$i - 1])) {
                    $topic_value = $topics_data[$i - 1];
                } elseif (isset($topics_data["topic{$i}"])) {
                    $topic_value = $topics_data["topic{$i}"];
                }
                
                // PHASE 1.2 FIX: Simple sanitization
                $topic_value = is_string($topic_value) ? sanitize_text_field(trim($topic_value)) : '';
                
                // PHASE 1.2 FIX: Save to both field formats for maximum compatibility
                update_post_meta($post_id, $topic_key, $topic_value);           // Direct custom field
                update_post_meta($post_id, "mkcg_{$topic_key}", $topic_value);   // MKCG format
                
                if (!empty($topic_value)) {
                    $saved_count++;
                }
            }
            
            // PHASE 1.2 FIX: Save minimal metadata
            update_post_meta($post_id, 'topics_last_saved', current_time('mysql'));
            update_post_meta($post_id, 'topics_save_method', 'phase_1_2_direct');
            
            return array(
                'success' => true,
                'count' => $saved_count,
                'method' => 'direct'
            );
            
        } catch (Exception $e) {
            return array(
                'success' => false, 
                'error' => $e->getMessage()
            );
        }
    }
    
    /**
     * PHASE 1.2 FIX: Direct topic load - fast and simple
     */
    private function load_topics_direct($post_id) {
        $topics = array();
        
        try {
            // PHASE 1.2 FIX: Load from multiple sources for maximum compatibility
            for ($i = 1; $i <= 5; $i++) {
                $topic_key = "topic_{$i}";
                $topic_value = '';
                
                // PHASE 1.2 FIX: Try custom fields first, then MKCG fields
                $topic_value = get_post_meta($post_id, $topic_key, true);
                if (empty($topic_value)) {
                    $topic_value = get_post_meta($post_id, "mkcg_{$topic_key}", true);
                }
                
                $topics[$topic_key] = $topic_value ? sanitize_text_field($topic_value) : '';
            }
            
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("PHASE 1.2 Topics Load Error: " . $e->getMessage());
            }
            // Return empty topics array on error
            for ($i = 1; $i <= 5; $i++) {
                $topics["topic_{$i}"] = '';
            }
        }
        
        return $topics;
    }
}

// PHASE 1.2 FIX: Initialize the simplified handler
if (!class_exists('GMKB_Topics_Ajax_Handler')) {
    // If original class doesn't exist, alias our simplified version
    class_alias('GMKB_Topics_Ajax_Handler_Phase12', 'GMKB_Topics_Ajax_Handler');
}

// PHASE 1.2 FIX: Initialize
GMKB_Topics_Ajax_Handler_Phase12::get_instance();

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('PHASE 1.2 Topics AJAX Handler: Simplified handler loaded and ready');
}
