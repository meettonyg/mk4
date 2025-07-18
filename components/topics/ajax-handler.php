<?php
/**
 * PHASE 1.2 ROOT FIX: Simplified Topics AJAX Handler
 * ✅ ELIMINATES infinite loading through simplified, reliable AJAX handling
 * ✅ Single save method to prevent conflicts  
 * ✅ Enhanced error reporting for debugging
 * ✅ Streamlined validation to prevent timeouts
 * ✅ Direct-to-database saves with immediate response
 * 
 * @package Guestify/Components/Topics
 * @version 1.2.0-phase12-simplified
 * @location components/topics/ajax-handler.php
 */

// PHASE 1.2 FIX: Ensure WordPress context
if (!defined('ABSPATH')) {
    exit;
}

/**
 * PHASE 1.2: Simplified Topics AJAX Handler Class
 * Focused on reliability and preventing loading state issues
 */
class GMKB_Topics_Ajax_Handler {
    
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
        // PHASE 1.2 FIX: Essential save handlers
        add_action('wp_ajax_save_custom_topics', array($this, 'ajax_save_topics'));
        add_action('wp_ajax_nopriv_save_custom_topics', array($this, 'ajax_save_topics_nopriv'));
        
        // PHASE 1.2 FIX: Essential load handlers
        add_action('wp_ajax_load_stored_topics', array($this, 'ajax_load_topics'));
        add_action('wp_ajax_nopriv_load_stored_topics', array($this, 'ajax_load_topics_nopriv'));
        
        // PHASE 1.2 FIX: Maintain backward compatibility
        add_action('wp_ajax_save_mkcg_topics', array($this, 'ajax_save_topics'));
        add_action('wp_ajax_nopriv_save_mkcg_topics', array($this, 'ajax_save_topics_nopriv'));
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('PHASE 1.2 Topics AJAX Handler: Initialized with simplified, reliable handlers');
        }
    }
    
    /**
     * PHASE 1.2 FIX: Primary AJAX save handler - streamlined and reliable
     */
    public function ajax_save_topics() {
        // PHASE 1.2 FIX: Immediate response structure to prevent timeouts
        $response = array(
            'success' => false,
            'message' => '',
            'data' => array(),
            'debug' => array(),
            'phase' => '1.2-simplified'
        );
        
        try {
            // PHASE 1.2 FIX: Quick essential validations only
            if (!$this->quick_validate_request($response)) {
                wp_send_json($response);
                return;
            }
            
            // PHASE 1.1 FIX: Enhanced post ID extraction with multiple parameter support
            $post_id = intval($_POST['post_id'] ?? $_POST['media_kit_post_id'] ?? 0);
            
            // PHASE 1.1 FIX: Debug logging for post ID detection
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("PHASE 1.1 AJAX Handler: post_id={$post_id}, POST_post_id=" . ($_POST['post_id'] ?? 'null') . ", POST_media_kit_post_id=" . ($_POST['media_kit_post_id'] ?? 'null'));
            }
            
            $topics_data = $_POST['topics'] ?? array();
            
            // PHASE 1.2 FIX: Simple JSON handling without complex validation
            if (is_string($topics_data)) {
                $topics_data = json_decode(stripslashes($topics_data), true);
                if (!is_array($topics_data)) {
                    $topics_data = array();
                }
            }
            
            // PHASE 1.2 FIX: Direct save with minimal validation to prevent delays
            $save_result = $this->save_topics_direct($post_id, $topics_data);
            
            if ($save_result['success']) {
                $response['success'] = true;
                $response['message'] = 'Topics saved successfully';
                $response['data'] = array(
                    'post_id' => $post_id,
                    'topics_saved' => $save_result['count'],
                    'timestamp' => time(),
                    'server_time' => current_time('mysql'),
                    'method' => 'phase_1_2_direct',
                    'processing_time' => $save_result['processing_time'] ?? 0
                );
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("PHASE 1.2 Topics: Successfully saved {$save_result['count']} topics for post {$post_id} in {$save_result['processing_time']}ms");
                }
            } else {
                $response['message'] = 'Save failed: ' . $save_result['error'];
                $response['debug']['save_error'] = $save_result['error'];
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("PHASE 1.2 Topics: Save failed for post {$post_id}: " . $save_result['error']);
                }
            }
            
        } catch (Exception $e) {
            $response['message'] = 'Server error during save';
            $response['debug']['exception'] = $e->getMessage();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('PHASE 1.2 Topics AJAX Save Error: ' . $e->getMessage());
            }
        }
        
        // PHASE 1.2 FIX: Always send immediate response
        wp_send_json($response);
    }
    
    /**
     * PHASE 1.2 FIX: Primary AJAX load handler - simple and fast
     */
    public function ajax_load_topics() {
        $start_time = microtime(true);
        
        $response = array(
            'success' => false,
            'message' => '',
            'data' => array(),
            'phase' => '1.2-simplified'
        );
        
        try {
            // PHASE 1.1 FIX: Enhanced post ID extraction for load requests
            $post_id = intval(
                $_POST['post_id'] ?? 
                $_POST['media_kit_post_id'] ?? 
                $_GET['post_id'] ?? 
                $_GET['media_kit_post_id'] ?? 
                0
            );
            
            // PHASE 1.1 FIX: Debug logging for load requests
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("PHASE 1.1 AJAX Load: post_id={$post_id}, GET_post_id=" . ($_GET['post_id'] ?? 'null') . ", POST_post_id=" . ($_POST['post_id'] ?? 'null') . ", POST_media_kit_post_id=" . ($_POST['media_kit_post_id'] ?? 'null'));
            }
            
            if (!$post_id) {
                $response['message'] = 'Invalid post ID';
                wp_send_json($response);
                return;
            }
            
            // PHASE 1.2 FIX: Direct load from database without complex processing
            $topics = $this->load_topics_direct($post_id);
            $processing_time = round((microtime(true) - $start_time) * 1000, 2);
            
            $response['success'] = true;
            $response['message'] = 'Topics loaded successfully';
            $response['data'] = array(
                'topics' => $topics,
                'post_id' => $post_id,
                'total_topics' => count(array_filter($topics)),
                'timestamp' => time(),
                'server_time' => current_time('mysql'),
                'method' => 'phase_1_2_direct',
                'processing_time' => $processing_time,
                'data_format' => 'javascript_compatible'
            );
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("PHASE 1.2 Topics: Loaded " . count(array_filter($topics)) . " topics for post {$post_id} in {$processing_time}ms");
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
            'message' => 'Authentication required to save topics',
            'code' => 'AUTHENTICATION_REQUIRED',
            'phase' => '1.2-simplified'
        ));
    }
    
    public function ajax_load_topics_nopriv() {
        wp_send_json(array(
            'success' => false,
            'message' => 'Authentication required to load topics',
            'code' => 'AUTHENTICATION_REQUIRED',
            'phase' => '1.2-simplified'
        ));
    }
    
    /**
     * PHASE 1.2 FIX: Quick request validation - essential checks only
     */
    private function quick_validate_request(&$response) {
        // PHASE 1.2 FIX: Check only essential WordPress functions
        if (!function_exists('wp_verify_nonce') || !function_exists('get_current_user_id')) {
            $response['message'] = 'WordPress functions not available';
            $response['debug']['missing_functions'] = array(
                'wp_verify_nonce' => function_exists('wp_verify_nonce'),
                'get_current_user_id' => function_exists('get_current_user_id')
            );
            return false;
        }
        
        // PHASE 1.2 FIX: Check nonce
        $nonce = $_POST['nonce'] ?? '';
        if (empty($nonce)) {
            $response['message'] = 'Security token missing';
            $response['debug']['nonce_issue'] = 'No nonce provided';
            return false;
        }
        
        if (!wp_verify_nonce($nonce, 'gmkb_nonce')) {
            $response['message'] = 'Security verification failed';
            $response['debug']['nonce_issue'] = 'Nonce verification failed';
            return false;
        }
        
        // PHASE 1.2 FIX: Check user permissions
        $user_id = get_current_user_id();
        if (!$user_id) {
            $response['message'] = 'User not authenticated';
            $response['debug']['auth_issue'] = 'No user ID available';
            return false;
        }
        
        if (!current_user_can('edit_posts')) {
            $response['message'] = 'Insufficient permissions';
            $response['debug']['permission_issue'] = 'User cannot edit posts';
            return false;
        }
        
        return true;
    }
    
    /**
     * PHASE 1.2 FIX: Direct topic save - minimal processing for reliability
     */
    private function save_topics_direct($post_id, $topics_data) {
        $start_time = microtime(true);
        
        try {
            // PHASE 1.2 FIX: Quick post validation
            $post = get_post($post_id);
            if (!$post || $post->post_status === 'trash') {
                return array('success' => false, 'error' => 'Post not found or inaccessible');
            }
            
            $saved_count = 0;
            $save_operations = array();
            
            // PHASE 1.2 FIX: Save to both custom fields and MKCG fields for maximum compatibility
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
                
                // PHASE 1.2 FIX: Simple sanitization - no complex validation to prevent delays
                $topic_value = is_string($topic_value) ? sanitize_text_field(trim($topic_value)) : '';
                
                // PHASE 1.2 FIX: Save to both field formats for maximum compatibility
                $result1 = update_post_meta($post_id, $topic_key, $topic_value);           // Direct custom field
                $result2 = update_post_meta($post_id, "mkcg_{$topic_key}", $topic_value);   // MKCG format
                
                $save_operations[] = array(
                    'field' => $topic_key,
                    'value' => $topic_value,
                    'custom_field_result' => $result1,
                    'mkcg_field_result' => $result2
                );
                
                if (!empty($topic_value)) {
                    $saved_count++;
                }
            }
            
            // PHASE 1.2 FIX: Save minimal metadata
            $timestamp = current_time('mysql');
            update_post_meta($post_id, 'topics_last_saved', $timestamp);
            update_post_meta($post_id, 'topics_save_method', 'phase_1_2_direct');
            update_post_meta($post_id, 'topics_last_saved_by', get_current_user_id());
            
            $processing_time = round((microtime(true) - $start_time) * 1000, 2);
            
            return array(
                'success' => true,
                'count' => $saved_count,
                'method' => 'direct',
                'processing_time' => $processing_time,
                'timestamp' => $timestamp,
                'operations' => defined('WP_DEBUG') && WP_DEBUG ? $save_operations : null
            );
            
        } catch (Exception $e) {
            return array(
                'success' => false, 
                'error' => $e->getMessage(),
                'processing_time' => round((microtime(true) - $start_time) * 1000, 2)
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
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                $non_empty_topics = array_filter($topics);
                error_log("PHASE 1.2 Topics Load: Found " . count($non_empty_topics) . " topics for post {$post_id}");
                if (!empty($non_empty_topics)) {
                    error_log("PHASE 1.2 Topics: " . implode(', ', $non_empty_topics));
                }
            }
            
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("PHASE 1.2 Topics Load Error: " . $e->getMessage());
            }
            // Return empty topics array on error to prevent loading state issues
            for ($i = 1; $i <= 5; $i++) {
                $topics["topic_{$i}"] = '';
            }
        }
        
        return $topics;
    }
    
    /**
     * PHASE 1.2 FIX: Additional helper methods for backward compatibility
     */
    
    /**
     * Get current topics count for a post
     */
    public function get_topics_count($post_id) {
        $topics = $this->load_topics_direct($post_id);
        return count(array_filter($topics));
    }
    
    /**
     * Check if post has any topics
     */
    public function has_topics($post_id) {
        return $this->get_topics_count($post_id) > 0;
    }
    
    /**
     * Get topics metadata
     */
    public function get_topics_metadata($post_id) {
        return array(
            'last_saved' => get_post_meta($post_id, 'topics_last_saved', true),
            'save_method' => get_post_meta($post_id, 'topics_save_method', true),
            'last_saved_by' => get_post_meta($post_id, 'topics_last_saved_by', true),
            'count' => $this->get_topics_count($post_id)
        );
    }
}

// PHASE 1.2 FIX: Initialize the handler immediately
GMKB_Topics_Ajax_Handler::get_instance();

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('PHASE 1.2 Topics AJAX Handler: Simplified, reliable handler initialized and ready');
}
