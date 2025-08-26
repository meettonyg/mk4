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
     * ROOT FIX: Enhanced AJAX load handler with comprehensive error handling
     * ELIMINATES infinite loading by ensuring response is ALWAYS sent with proper structure
     */
    public function ajax_load_topics() {
        $start_time = microtime(true);
        
        // ROOT FIX: Guaranteed response structure - no matter what happens, client gets proper JSON
        $response = array(
            'success' => false,
            'message' => '',
            'data' => array(
                'topics' => array(),
                'post_id' => 0,
                'total_topics' => 0,
                'has_data' => false,
                'loading_complete' => true,
                'error_code' => null
            ),
            'debug' => array(),
            'phase' => 'root-fix-comprehensive'
        );
        
        try {
            // ROOT FIX: Enhanced post ID extraction with multiple fallback strategies
            $post_id = $this->extract_post_id_comprehensive();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("ROOT FIX Topics Load: post_id={$post_id}, method=comprehensive_extraction");
            }
            
            if (!$post_id || $post_id <= 0) {
                $response['message'] = 'No valid post ID found';
                $response['data']['error_code'] = 'INVALID_POST_ID';
                $response['data']['loading_complete'] = true;
                $response['debug']['post_id_sources'] = $this->get_post_id_debug_info();
                wp_send_json($response);
                return;
            }
            
            // ROOT FIX: Enhanced topic loading with multiple data sources
            $topics_result = $this->load_topics_comprehensive($post_id);
            $processing_time = round((microtime(true) - $start_time) * 1000, 2);
            
            // ROOT FIX: Always mark as successful load, even if no topics found
            $response['success'] = true;
            $response['message'] = $topics_result['message'];
            $response['data'] = array(
                'topics' => $topics_result['topics'],
                'post_id' => $post_id,
                'total_topics' => $topics_result['count'],
                'has_data' => $topics_result['count'] > 0,
                'loading_complete' => true,
                'data_source' => $topics_result['source'],
                'timestamp' => time(),
                'server_time' => current_time('mysql'),
                'method' => 'comprehensive_load',
                'processing_time' => $processing_time,
                'data_format' => 'javascript_compatible',
                'quality_check' => $topics_result['quality']
            );
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("ROOT FIX Topics: Loaded {$topics_result['count']} topics from {$topics_result['source']} for post {$post_id} in {$processing_time}ms");
            }
            
        } catch (Exception $e) {
            // ROOT FIX: Comprehensive error handling - never leave client hanging
            $response['message'] = 'Topics loading failed: ' . $e->getMessage();
            $response['data']['error_code'] = 'LOAD_EXCEPTION';
            $response['data']['loading_complete'] = true;
            $response['debug']['exception'] = array(
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            );
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('ROOT FIX Topics Load Exception: ' . $e->getMessage());
                error_log('ROOT FIX Exception Context: ' . $e->getFile() . ':' . $e->getLine());
            }
        }
        
        // ROOT FIX: Guaranteed JSON response - prevents client-side infinite loading
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
            
            // PHASE 1.2 FIX: Direct save with multiple format handling
            for ($i = 1; $i <= 5; $i++) {
            $topic_key = "topic_{$i}";
            $mkcg_key = "mkcg_topic_{$i}";
            $topic_value = '';
            
            // ROOT FIX: Handle multiple input formats from different sources
            if (isset($topics_data[$topic_key])) {
                // Direct format: topic_1, topic_2, etc.
            $topic_value = $topics_data[$topic_key];
            } elseif (isset($topics_data[$mkcg_key])) {
            // MKCG format: mkcg_topic_1, mkcg_topic_2, etc.
                $topic_value = $topics_data[$mkcg_key];
            } elseif (isset($topics_data[$i - 1])) {
                // Array index format: 0, 1, 2, etc.
                if (is_array($topics_data[$i - 1])) {
                    $topic_value = $topics_data[$i - 1]['title'] ?? $topics_data[$i - 1];
                } else {
                    $topic_value = $topics_data[$i - 1];
                }
            } elseif (isset($topics_data["topic{$i}"])) {
                // Concatenated format: topic1, topic2, etc.
                $topic_value = $topics_data["topic{$i}"];
            }
            
            // PHASE 1.2 FIX: Simple sanitization - no complex validation to prevent delays
            $topic_value = is_string($topic_value) ? sanitize_text_field(trim($topic_value)) : '';
            
            // ROOT FIX: Save to MKCG format FIRST as primary storage
            $result1 = update_post_meta($post_id, $mkcg_key, $topic_value);   // MKCG format (primary)
            // Also save to direct format for backward compatibility
            $result2 = update_post_meta($post_id, $topic_key, $topic_value);           // Direct custom field (backup)
                
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
     * ROOT FIX: Comprehensive post ID extraction with all possible sources
     */
    private function extract_post_id_comprehensive() {
        $post_id = 0;
        $sources = array();
        
        // Strategy 1: AJAX request parameters
        if (!empty($_POST['post_id']) && is_numeric($_POST['post_id'])) {
            $post_id = intval($_POST['post_id']);
            $sources[] = 'POST[post_id]';
        }
        
        if (!$post_id && !empty($_POST['media_kit_post_id']) && is_numeric($_POST['media_kit_post_id'])) {
            $post_id = intval($_POST['media_kit_post_id']);
            $sources[] = 'POST[media_kit_post_id]';
        }
        
        // Strategy 2: GET parameters
        if (!$post_id && !empty($_GET['post_id']) && is_numeric($_GET['post_id'])) {
            $post_id = intval($_GET['post_id']);
            $sources[] = 'GET[post_id]';
        }
        
        if (!$post_id && !empty($_GET['p']) && is_numeric($_GET['p'])) {
            $post_id = intval($_GET['p']);
            $sources[] = 'GET[p]';
        }
        
        // Strategy 3: REQUEST fallback
        if (!$post_id && !empty($_REQUEST['post_id']) && is_numeric($_REQUEST['post_id'])) {
            $post_id = intval($_REQUEST['post_id']);
            $sources[] = 'REQUEST[post_id]';
        }
        
        // Strategy 4: HTTP referrer analysis
        if (!$post_id && !empty($_SERVER['HTTP_REFERER'])) {
            $referrer = $_SERVER['HTTP_REFERER'];
            if (preg_match('/[?&]post_id=(\d+)/', $referrer, $matches)) {
                $post_id = intval($matches[1]);
                $sources[] = 'HTTP_REFERER';
            }
        }
        
        // Validate post exists and is accessible
        if ($post_id > 0) {
            $post = get_post($post_id);
            if (!$post || $post->post_status === 'trash') {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("ROOT FIX: Invalid post ID {$post_id} - post does not exist or is trashed");
                }
                return 0;
            }
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("ROOT FIX: Post ID {$post_id} extracted from sources: " . implode(', ', $sources));
        }
        
        return $post_id;
    }
    
    /**
     * ROOT FIX: Comprehensive topic loading with multiple data sources and quality assessment
     */
    private function load_topics_comprehensive($post_id) {
        $result = array(
            'topics' => array(),
            'count' => 0,
            'source' => 'none',
            'message' => '',
            'quality' => 'unknown'
        );
        
        try {
            // Initialize empty topics structure
            for ($i = 1; $i <= 5; $i++) {
                $result['topics']["topic_{$i}"] = '';
            }
            
            // ROOT FIX: Strategy 1: MKCG fields FIRST (mkcg_topic_1, etc.) - these are the primary fields
            $mkcg_topics = $this->load_from_mkcg_fields($post_id);
            if ($mkcg_topics['count'] > 0) {
                $result = array_merge($result, $mkcg_topics);
                $result['source'] = 'mkcg_fields';
                $result['message'] = "Loaded {$mkcg_topics['count']} topics from MKCG fields";
                return $result;
            }
            
            // Strategy 2: Direct custom fields (topic_1, topic_2, etc.) - fallback only
            $custom_topics = $this->load_from_custom_fields($post_id);
            if ($custom_topics['count'] > 0) {
                $result = array_merge($result, $custom_topics);
                $result['source'] = 'custom_fields';
                $result['message'] = "Loaded {$custom_topics['count']} topics from custom fields";
                return $result;
            }
            
            // Strategy 3: JSON stored data
            $json_topics = $this->load_from_json_data($post_id);
            if ($json_topics['count'] > 0) {
                $result = array_merge($result, $json_topics);
                $result['source'] = 'json_data';
                $result['message'] = "Loaded {$json_topics['count']} topics from JSON data";
                return $result;
            }
            
            // Strategy 4: WordPress post meta backup
            $meta_topics = $this->load_from_post_meta_backup($post_id);
            if ($meta_topics['count'] > 0) {
                $result = array_merge($result, $meta_topics);
                $result['source'] = 'post_meta_backup';
                $result['message'] = "Loaded {$meta_topics['count']} topics from post meta backup";
                return $result;
            }
            
            // No topics found from any source
            $result['message'] = 'No topics found in any data source';
            $result['quality'] = 'empty';
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("ROOT FIX: No topics found for post {$post_id} in any data source");
            }
            
        } catch (Exception $e) {
            $result['message'] = 'Error loading topics: ' . $e->getMessage();
            $result['quality'] = 'error';
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("ROOT FIX: Exception in comprehensive load: " . $e->getMessage());
            }
        }
        
        return $result;
    }
    
    /**
     * ROOT FIX: Load from custom fields with quality assessment
     * Updated to use the correct Pods meta key format
     */
    private function load_from_custom_fields($post_id) {
        $result = array('topics' => array(), 'count' => 0, 'quality' => 'empty');
        
        // ROOT FIX: Based on Pods configuration, the correct format is topic_1, topic_2, etc.
        for ($i = 1; $i <= 5; $i++) {
            $topic_key = "topic_{$i}";
            $topic_value = get_post_meta($post_id, $topic_key, true);
            
            if (!empty($topic_value) && is_string($topic_value)) {
                $cleaned_value = sanitize_text_field(trim($topic_value));
                if (strlen($cleaned_value) > 0) {
                    $result['topics'][$topic_key] = $cleaned_value;
                    $result['count']++;
                    
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("ROOT FIX: Found {$topic_key} = {$cleaned_value} for post {$post_id}");
                    }
                }
            }
            
            if (empty($result['topics'][$topic_key])) {
                $result['topics'][$topic_key] = '';
            }
        }
        
        if ($result['count'] > 0) {
            $result['quality'] = $this->assess_topics_quality($result['topics']);
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("ROOT FIX: Loaded {$result['count']} topics from custom fields for post {$post_id}");
            }
        }
        
        return $result;
    }
    
    /**
     * ROOT FIX: Load from MKCG fields with quality assessment
     */
    private function load_from_mkcg_fields($post_id) {
        $result = array('topics' => array(), 'count' => 0, 'quality' => 'empty');
        
        for ($i = 1; $i <= 5; $i++) {
            $topic_key = "topic_{$i}";
            $mkcg_key = "mkcg_{$topic_key}";
            $topic_value = get_post_meta($post_id, $mkcg_key, true);
            
            if (!empty($topic_value) && is_string($topic_value)) {
                $cleaned_value = sanitize_text_field(trim($topic_value));
                if (strlen($cleaned_value) > 0) {
                    $result['topics'][$topic_key] = $cleaned_value;
                    $result['count']++;
                }
            }
            
            if (empty($result['topics'][$topic_key])) {
                $result['topics'][$topic_key] = '';
            }
        }
        
        if ($result['count'] > 0) {
            $result['quality'] = $this->assess_topics_quality($result['topics']);
        }
        
        return $result;
    }
    
    /**
     * ROOT FIX: Load from JSON data with quality assessment
     */
    private function load_from_json_data($post_id) {
        $result = array('topics' => array(), 'count' => 0, 'quality' => 'empty');
        
        $json_data = get_post_meta($post_id, 'topics_data', true);
        if (!empty($json_data)) {
            $decoded_data = json_decode($json_data, true);
            if (is_array($decoded_data)) {
                $topic_index = 1;
                foreach ($decoded_data as $topic_data) {
                    if ($topic_index > 5) break;
                    
                    $topic_key = "topic_{$topic_index}";
                    if (!empty($topic_data['title']) && is_string($topic_data['title'])) {
                        $cleaned_value = sanitize_text_field(trim($topic_data['title']));
                        if (strlen($cleaned_value) > 0) {
                            $result['topics'][$topic_key] = $cleaned_value;
                            $result['count']++;
                        }
                    }
                    
                    if (empty($result['topics'][$topic_key])) {
                        $result['topics'][$topic_key] = '';
                    }
                    
                    $topic_index++;
                }
            }
        }
        
        // Fill remaining empty slots
        for ($i = 1; $i <= 5; $i++) {
            $topic_key = "topic_{$i}";
            if (!isset($result['topics'][$topic_key])) {
                $result['topics'][$topic_key] = '';
            }
        }
        
        if ($result['count'] > 0) {
            $result['quality'] = $this->assess_topics_quality($result['topics']);
        }
        
        return $result;
    }
    
    /**
     * ROOT FIX: Load from post meta backup with quality assessment
     */
    private function load_from_post_meta_backup($post_id) {
        $result = array('topics' => array(), 'count' => 0, 'quality' => 'empty');
        
        $backup_data = get_post_meta($post_id, 'gmkb_topics_backup', true);
        if (!empty($backup_data) && is_array($backup_data)) {
            for ($i = 1; $i <= 5; $i++) {
                $topic_key = "topic_{$i}";
                if (!empty($backup_data[$topic_key]) && is_string($backup_data[$topic_key])) {
                    $cleaned_value = sanitize_text_field(trim($backup_data[$topic_key]));
                    if (strlen($cleaned_value) > 0) {
                        $result['topics'][$topic_key] = $cleaned_value;
                        $result['count']++;
                    }
                }
                
                if (empty($result['topics'][$topic_key])) {
                    $result['topics'][$topic_key] = '';
                }
            }
        }
        
        if ($result['count'] > 0) {
            $result['quality'] = $this->assess_topics_quality($result['topics']);
        }
        
        return $result;
    }
    
    /**
     * ROOT FIX: Assess quality of loaded topics
     */
    private function assess_topics_quality($topics) {
        $non_empty = array_filter($topics, function($topic) {
            return !empty($topic) && strlen(trim($topic)) > 0;
        });
        
        $count = count($non_empty);
        
        if ($count === 0) return 'empty';
        if ($count >= 4) return 'excellent';
        if ($count >= 2) return 'good';
        return 'fair';
    }
    
    /**
     * ROOT FIX: Get debug information for post ID extraction
     */
    private function get_post_id_debug_info() {
        return array(
            'POST_post_id' => $_POST['post_id'] ?? 'not_set',
            'POST_media_kit_post_id' => $_POST['media_kit_post_id'] ?? 'not_set',
            'GET_post_id' => $_GET['post_id'] ?? 'not_set',
            'GET_p' => $_GET['p'] ?? 'not_set',
            'REQUEST_post_id' => $_REQUEST['post_id'] ?? 'not_set',
            'HTTP_REFERER' => $_SERVER['HTTP_REFERER'] ?? 'not_set',
            'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'not_set'
        );
    }
    
    /**
     * ROOT FIX: Direct topic loading for single-step render
     * Used by main plugin AJAX handler to pre-load topic data
     */
    public function load_topics_direct($data_source_id = 0) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("load_topics_direct called with post ID: {$data_source_id}");
        }
        
        if (empty($data_source_id)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("load_topics_direct: Empty post ID, returning empty array");
            }
            return [];
        }

        // ROOT FIX: Try MKCG fields FIRST (mkcg_topic_1, mkcg_topic_2, etc.) - these are the primary fields
        $topics_array = [];
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = get_post_meta($data_source_id, "mkcg_topic_{$i}", true);
            if (!empty($topic_value) && is_string($topic_value)) {
                // ROOT FIX: Ensure all whitespace is properly trimmed
                $cleaned_value = trim(sanitize_text_field(trim($topic_value)));
                if (strlen($cleaned_value) > 0) {
                    $topics_array[] = [
                        'title' => $cleaned_value,
                        'description' => ''
                    ];
                    
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("ROOT FIX: Found mkcg_topic_{$i}: {$topic_value}");
                    }
                }
            }
        }
        
        if (!empty($topics_array)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("ROOT FIX: Successfully loaded " . count($topics_array) . " topics from MKCG fields for post {$data_source_id}");
            }
            return $topics_array;
        }
        
        // Fallback: Try custom fields (topic_1, topic_2, etc.) if no MKCG fields found
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = get_post_meta($data_source_id, "topic_{$i}", true);
            if (!empty($topic_value) && is_string($topic_value)) {
                // ROOT FIX: Ensure all whitespace is properly trimmed
                $cleaned_value = trim(sanitize_text_field(trim($topic_value)));
                if (strlen($cleaned_value) > 0) {
                    $topics_array[] = [
                        'title' => $cleaned_value,
                        'description' => ''
                    ];
                    
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("ROOT FIX: Found topic_{$i}: {$topic_value} (fallback)");
                    }
                }
            }
        }
        
        if (!empty($topics_array)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("ROOT FIX: Successfully loaded " . count($topics_array) . " topics from custom fields for post {$data_source_id}");
            }
            return $topics_array;
        }
        
        // Fallback: Try to get data from a dedicated custom field
        $topics = get_post_meta($data_source_id, 'gmkb_topics_data', true);
        if (!empty($topics) && is_array($topics)) {
            return $topics;
        }
        
        // Debug logging if no topics found
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("ROOT FIX: No topics found for post {$data_source_id}");
            
            // Log all meta keys to help debug
            $all_meta = get_post_meta($data_source_id);
            $topic_related = array();
            foreach ($all_meta as $key => $value) {
                if (stripos($key, 'topic') !== false) {
                    $topic_related[$key] = $value;
                }
            }
            if (!empty($topic_related)) {
                error_log("ROOT FIX: Topic-related meta found: " . print_r($topic_related, true));
            }
        }
        
        return []; // Return empty array if no topics are found.
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

// ROOT FIX: Initialize the enhanced handler immediately
GMKB_Topics_Ajax_Handler::get_instance();

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('ROOT FIX Topics AJAX Handler: Comprehensive, reliable handler initialized with enhanced error handling');
}
