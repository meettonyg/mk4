<?php
/**
 * GMKB Topics AJAX Handler
 * 
 * Located in: components/topics/ajax-handler.php
 * 
 * Handles saving Topics component data back to WordPress post meta
 * Implements batch saving, validation, and conflict resolution for MKCG Topics integration
 * 
 * ARCHITECTURAL PATTERN:
 * - This file is located within the Topics component folder to maintain component isolation
 * - Each component should contain its own AJAX handlers for scalability
 * - This pattern should be replicated for Biography and other component integrations
 * 
 * @package Guestify/Components/Topics
 * @version 1.0.0-phase3
 * @location components/topics/ajax-handler.php
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * GMKB Topics AJAX Handler Class
 * 
 * Provides comprehensive save-back functionality for Topics component
 */
class GMKB_Topics_Ajax_Handler {
    
    /**
     * Singleton instance
     */
    private static $instance = null;
    
    /**
     * Save operation cache
     */
    private $save_cache = array();
    
    /**
     * Error log for debugging
     */
    private $errors = array();
    
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
     * Constructor
     */
    private function __construct() {
        // Register AJAX handlers for both logged-in and non-logged-in users
        add_action('wp_ajax_save_mkcg_topics', array($this, 'ajax_save_mkcg_topics'));
        add_action('wp_ajax_nopriv_save_mkcg_topics', array($this, 'ajax_save_mkcg_topics_nopriv'));
        
        // Register validation AJAX handler
        add_action('wp_ajax_validate_mkcg_topics', array($this, 'ajax_validate_mkcg_topics'));
        add_action('wp_ajax_nopriv_validate_mkcg_topics', array($this, 'ajax_validate_mkcg_topics_nopriv'));
        
        // Register conflict resolution handler
        add_action('wp_ajax_resolve_topics_conflict', array($this, 'ajax_resolve_topics_conflict'));
        
        // PHASE 4: Register topic reordering handler
        add_action('wp_ajax_reorder_mkcg_topics', array($this, 'ajax_reorder_mkcg_topics'));
        add_action('wp_ajax_nopriv_reorder_mkcg_topics', array($this, 'ajax_reorder_mkcg_topics_nopriv'));
        
        // Add hooks for cache management
        add_action('updated_post_meta', array($this, 'clear_save_cache'), 10, 2);
        add_action('deleted_post_meta', array($this, 'clear_save_cache'), 10, 2);
    }
    
    /**
     * AJAX handler: Save MKCG topics (logged-in users)
     */
    public function ajax_save_mkcg_topics() {
        try {
            // Verify nonce for security
            if (!wp_verify_nonce($_POST['nonce'] ?? '', 'guestify_media_kit_builder')) {
                wp_send_json_error(array(
                    'message' => 'Security verification failed',
                    'code' => 'INVALID_NONCE'
                ));
                return;
            }
            
            // Check user capabilities
            if (!current_user_can('edit_posts')) {
                wp_send_json_error(array(
                    'message' => 'Insufficient permissions to save topics',
                    'code' => 'INSUFFICIENT_PERMISSIONS'
                ));
                return;
            }
            
            $this->process_save_request();
            
        } catch (Exception $e) {
            $this->log_error('AJAX save error: ' . $e->getMessage(), 'ajax-save', $e);
            wp_send_json_error(array(
                'message' => 'Internal server error',
                'code' => 'SERVER_ERROR',
                'debug' => defined('WP_DEBUG') && WP_DEBUG ? $e->getMessage() : ''
            ));
        }
    }
    
    /**
     * AJAX handler: Save MKCG topics (non-logged-in users)
     */
    public function ajax_save_mkcg_topics_nopriv() {
        wp_send_json_error(array(
            'message' => 'Authentication required to save topics',
            'code' => 'AUTHENTICATION_REQUIRED'
        ));
    }
    
    /**
     * Process the save request
     */
    private function process_save_request() {
        $start_time = microtime(true);
        
        // Extract and validate parameters
        $post_id = intval($_POST['post_id'] ?? 0);
        $topics_data = $_POST['topics'] ?? array();
        $save_type = sanitize_text_field($_POST['save_type'] ?? 'manual');
        $client_timestamp = intval($_POST['client_timestamp'] ?? time());
        
        // Validate required parameters
        if (!$post_id || $post_id <= 0) {
            wp_send_json_error(array(
                'message' => 'Invalid post ID provided',
                'code' => 'INVALID_POST_ID'
            ));
            return;
        }
        
        // Verify post exists and is accessible
        $post = get_post($post_id);
        if (!$post || $post->post_status === 'trash') {
            wp_send_json_error(array(
                'message' => 'Post not found or inaccessible',
                'code' => 'POST_NOT_FOUND',
                'post_id' => $post_id
            ));
            return;
        }
        
        // Check for concurrent editing conflicts
        $conflict_check = $this->check_for_conflicts($post_id, $client_timestamp);
        if ($conflict_check['has_conflict']) {
            wp_send_json_error(array(
                'message' => 'Concurrent editing conflict detected',
                'code' => 'EDIT_CONFLICT',
                'conflict_details' => $conflict_check,
                'resolution_required' => true
            ));
            return;
        }
        
        // Validate and sanitize topics data
        $validated_topics = $this->validate_and_sanitize_topics($topics_data);
        if (!$validated_topics['valid']) {
            wp_send_json_error(array(
                'message' => 'Topic data validation failed',
                'code' => 'VALIDATION_FAILED',
                'validation_errors' => $validated_topics['errors']
            ));
            return;
        }
        
        // Perform batch save operation
        $save_result = $this->save_topics_to_post_meta($post_id, $validated_topics['topics'], $save_type);
        
        if ($save_result['success']) {
            $processing_time = round((microtime(true) - $start_time) * 1000, 2);
            
            wp_send_json_success(array(
                'message' => 'Topics saved successfully',
                'post_id' => $post_id,
                'topics_saved' => count($validated_topics['topics']),
                'save_type' => $save_type,
                'timestamp' => time(),
                'server_time' => current_time('mysql'),
                'processing_time' => $processing_time,
                'quality_summary' => $this->calculate_topics_quality($validated_topics['topics'])
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to save topics',
                'code' => 'SAVE_FAILED',
                'details' => $save_result['error']
            ));
        }
    }
    
    /**
     * Validate and sanitize topics data
     * 
     * @param array $topics_data Raw topics data from client
     * @return array Validation result with sanitized data
     */
    private function validate_and_sanitize_topics($topics_data) {
        $result = array(
            'valid' => true,
            'topics' => array(),
            'errors' => array()
        );
        
        // Ensure topics_data is an array
        if (!is_array($topics_data)) {
            $result['valid'] = false;
            $result['errors'][] = 'Topics data must be an array';
            return $result;
        }
        
        // Validate each topic (expecting up to 5 topics)
        for ($i = 1; $i <= 5; $i++) {
            $topic_key = "topic_{$i}";
            $topic_value = '';
            
            // Check if topic data exists in various possible formats
            if (isset($topics_data[$topic_key])) {
                $topic_value = $topics_data[$topic_key];
            } elseif (isset($topics_data[$i - 1])) {
                $topic_value = $topics_data[$i - 1];
            } elseif (isset($topics_data["topic{$i}"])) {
                $topic_value = $topics_data["topic{$i}"];
            }
            
            // Sanitize topic value
            if (!empty($topic_value)) {
                $sanitized_topic = $this->sanitize_topic_value($topic_value);
                
                if ($sanitized_topic !== false) {
                    $result['topics'][$topic_key] = $sanitized_topic;
                } else {
                    $result['errors'][] = "Topic {$i} contains invalid content";
                }
            }
            // Empty topics are allowed - they will be saved as empty to clear existing data
        }
        
        // Validate at least one topic has content (optional - can be removed if empty topics are acceptable)
        if (empty($result['topics'])) {
            // Allow empty topics for clearing all content
            $result['topics'] = array(); // Empty array means clear all topics
        }
        
        // Check for validation errors
        if (!empty($result['errors'])) {
            $result['valid'] = false;
        }
        
        return $result;
    }
    
    /**
     * Sanitize individual topic value
     * 
     * @param mixed $topic_value Raw topic value
     * @return string|false Sanitized topic or false if invalid
     */
    private function sanitize_topic_value($topic_value) {
        // Convert to string
        if (!is_string($topic_value)) {
            $topic_value = strval($topic_value);
        }
        
        // Trim whitespace
        $topic_value = trim($topic_value);
        
        // Check length constraints
        if (strlen($topic_value) > 100) {
            return false; // Topic too long
        }
        
        // Allow empty values (for clearing topics)
        if (empty($topic_value)) {
            return '';
        }
        
        // Check minimum length for non-empty topics
        if (strlen($topic_value) < 3) {
            return false; // Topic too short
        }
        
        // Sanitize content
        $sanitized = sanitize_text_field($topic_value);
        
        // Additional validation - check for potentially harmful content
        if ($sanitized !== $topic_value) {
            // HTML or other unwanted content was stripped
            return false;
        }
        
        // Validate allowed characters (alphanumeric, spaces, common punctuation)
        if (!preg_match('/^[a-zA-Z0-9\s\-.,!?\'\"()&]+$/', $sanitized)) {
            return false; // Contains disallowed characters
        }
        
        return $sanitized;
    }
    
    /**
     * Save topics to WordPress post meta
     * 
     * @param int $post_id Post ID
     * @param array $topics Sanitized topics data
     * @param string $save_type Save type (manual, auto)
     * @return array Save result
     */
    private function save_topics_to_post_meta($post_id, $topics, $save_type = 'manual') {
        try {
            $save_timestamp = current_time('mysql');
            $user_id = get_current_user_id();
            $topics_saved = 0;
            
            // Save each topic to individual meta fields
            for ($i = 1; $i <= 5; $i++) {
                $topic_key = "topic_{$i}";
                $meta_key = "mkcg_{$topic_key}";
                
                if (isset($topics[$topic_key])) {
                    // Save non-empty topic
                    $topic_value = $topics[$topic_key];
                    $update_result = update_post_meta($post_id, $meta_key, $topic_value);
                    
                    if ($update_result !== false) {
                        $topics_saved++;
                    }
                } else {
                    // Clear empty topic (save empty string to explicitly clear)
                    update_post_meta($post_id, $meta_key, '');
                }
            }
            
            // Save metadata about this save operation
            update_post_meta($post_id, 'mkcg_topics_last_edited', $save_timestamp);
            update_post_meta($post_id, 'mkcg_topics_last_edited_by', $user_id);
            update_post_meta($post_id, 'mkcg_topics_save_type', $save_type);
            update_post_meta($post_id, 'mkcg_topics_version', '1.0.0-phase3');
            
            // Update general MKCG last update timestamp
            update_post_meta($post_id, 'mkcg_last_update', $save_timestamp);
            
            // Log successful save for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("GMKB Topics: Successfully saved {$topics_saved} topics for post {$post_id} (type: {$save_type})");
            }
            
            return array(
                'success' => true,
                'topics_saved' => $topics_saved,
                'timestamp' => $save_timestamp,
                'save_type' => $save_type
            );
            
        } catch (Exception $e) {
            $this->log_error("Error saving topics to post {$post_id}: " . $e->getMessage(), 'save-operation', $e);
            
            return array(
                'success' => false,
                'error' => 'Database save operation failed',
                'debug' => defined('WP_DEBUG') && WP_DEBUG ? $e->getMessage() : ''
            );
        }
    }
    
    /**
     * Check for concurrent editing conflicts
     * 
     * @param int $post_id Post ID
     * @param int $client_timestamp Client's last known timestamp
     * @return array Conflict check result
     */
    private function check_for_conflicts($post_id, $client_timestamp) {
        try {
            // Get last edited timestamp from server
            $last_edited = get_post_meta($post_id, 'mkcg_topics_last_edited', true);
            
            if (empty($last_edited)) {
                // No previous edit timestamp - no conflict
                return array(
                    'has_conflict' => false,
                    'message' => 'No previous edits detected'
                );
            }
            
            $server_timestamp = strtotime($last_edited);
            
            // Check if server data is newer than client data
            if ($server_timestamp > $client_timestamp) {
                $last_edited_by = get_post_meta($post_id, 'mkcg_topics_last_edited_by', true);
                $current_user_id = get_current_user_id();
                
                // Check if it was edited by a different user
                if ($last_edited_by && $last_edited_by != $current_user_id) {
                    $editor_info = get_userdata($last_edited_by);
                    $editor_name = $editor_info ? $editor_info->display_name : 'Unknown User';
                    
                    return array(
                        'has_conflict' => true,
                        'message' => "Content was modified by {$editor_name}",
                        'server_timestamp' => $server_timestamp,
                        'client_timestamp' => $client_timestamp,
                        'last_edited_by' => $editor_name,
                        'time_difference' => $server_timestamp - $client_timestamp
                    );
                }
                
                return array(
                    'has_conflict' => true,
                    'message' => 'Content was modified from another session',
                    'server_timestamp' => $server_timestamp,
                    'client_timestamp' => $client_timestamp,
                    'time_difference' => $server_timestamp - $client_timestamp
                );
            }
            
            return array(
                'has_conflict' => false,
                'message' => 'No conflicts detected'
            );
            
        } catch (Exception $e) {
            $this->log_error("Error checking conflicts for post {$post_id}: " . $e->getMessage(), 'conflict-check', $e);
            
            // In case of error, allow save to proceed (fail-safe approach)
            return array(
                'has_conflict' => false,
                'message' => 'Conflict check failed - proceeding with save',
                'error' => $e->getMessage()
            );
        }
    }
    
    /**
     * Calculate topics quality summary
     * 
     * @param array $topics Topics data
     * @return array Quality summary
     */
    private function calculate_topics_quality($topics) {
        $total_topics = count($topics);
        $total_score = 0;
        $quality_breakdown = array();
        
        foreach ($topics as $topic_key => $topic_value) {
            $score = $this->calculate_individual_topic_quality($topic_value);
            $total_score += $score;
            $quality_breakdown[$topic_key] = $score;
        }
        
        $average_score = $total_topics > 0 ? round($total_score / $total_topics) : 0;
        
        $quality_level = 'poor';
        if ($average_score >= 80) $quality_level = 'excellent';
        elseif ($average_score >= 60) $quality_level = 'good';
        elseif ($average_score >= 40) $quality_level = 'fair';
        
        return array(
            'total_topics' => $total_topics,
            'average_score' => $average_score,
            'quality_level' => $quality_level,
            'breakdown' => $quality_breakdown
        );
    }
    
    /**
     * Calculate quality score for individual topic
     * 
     * @param string $topic_value Topic value
     * @return int Quality score (0-100)
     */
    private function calculate_individual_topic_quality($topic_value) {
        if (empty($topic_value)) {
            return 0;
        }
        
        $score = 0;
        $length = strlen($topic_value);
        
        // Length scoring (optimal 20-60 characters)
        if ($length >= 20 && $length <= 60) {
            $score += 40;
        } elseif ($length >= 10 && $length <= 80) {
            $score += 25;
        } elseif ($length >= 3) {
            $score += 10;
        }
        
        // Word count scoring (optimal 2-8 words)
        $word_count = str_word_count($topic_value);
        if ($word_count >= 2 && $word_count <= 8) {
            $score += 30;
        } elseif ($word_count >= 1 && $word_count <= 12) {
            $score += 15;
        }
        
        // Professional language indicators
        if (preg_match('/^[A-Z]/', $topic_value)) {
            $score += 10; // Starts with capital
        }
        
        if (!preg_match('/\s{2,}/', $topic_value)) {
            $score += 10; // No double spaces
        }
        
        if (!preg_match('/[!]{2,}/', $topic_value)) {
            $score += 10; // No excessive punctuation
        }
        
        return min(100, $score);
    }
    
    /**
     * AJAX handler: Validate topics without saving
     */
    public function ajax_validate_mkcg_topics() {
        try {
            // Verify nonce for security
            if (!wp_verify_nonce($_POST['nonce'] ?? '', 'guestify_media_kit_builder')) {
                wp_send_json_error(array(
                    'message' => 'Security verification failed',
                    'code' => 'INVALID_NONCE'
                ));
                return;
            }
            
            $topics_data = $_POST['topics'] ?? array();
            
            // Validate and sanitize topics data
            $validated_topics = $this->validate_and_sanitize_topics($topics_data);
            
            if ($validated_topics['valid']) {
                $quality_summary = $this->calculate_topics_quality($validated_topics['topics']);
                
                wp_send_json_success(array(
                    'message' => 'Topics validation successful',
                    'topics_count' => count($validated_topics['topics']),
                    'quality_summary' => $quality_summary,
                    'validation_timestamp' => time()
                ));
            } else {
                wp_send_json_error(array(
                    'message' => 'Topics validation failed',
                    'code' => 'VALIDATION_FAILED',
                    'validation_errors' => $validated_topics['errors']
                ));
            }
            
        } catch (Exception $e) {
            $this->log_error('AJAX validation error: ' . $e->getMessage(), 'ajax-validation', $e);
            wp_send_json_error(array(
                'message' => 'Validation error',
                'code' => 'SERVER_ERROR'
            ));
        }
    }
    
    /**
     * AJAX handler: Validate topics (non-logged-in users)
     */
    public function ajax_validate_mkcg_topics_nopriv() {
        wp_send_json_error(array(
            'message' => 'Authentication required for validation',
            'code' => 'AUTHENTICATION_REQUIRED'
        ));
    }
    
    /**
     * AJAX handler: Resolve editing conflicts
     */
    public function ajax_resolve_topics_conflict() {
        try {
            // Verify nonce for security
            if (!wp_verify_nonce($_POST['nonce'] ?? '', 'guestify_media_kit_builder')) {
                wp_send_json_error(array(
                    'message' => 'Security verification failed',
                    'code' => 'INVALID_NONCE'
                ));
                return;
            }
            
            $post_id = intval($_POST['post_id'] ?? 0);
            $resolution_type = sanitize_text_field($_POST['resolution_type'] ?? 'overwrite');
            
            if (!$post_id) {
                wp_send_json_error(array(
                    'message' => 'Invalid post ID',
                    'code' => 'INVALID_POST_ID'
                ));
                return;
            }
            
            switch ($resolution_type) {
                case 'overwrite':
                    // Allow overwrite by setting client timestamp to current time
                    $_POST['client_timestamp'] = time();
                    $this->process_save_request();
                    break;
                    
                case 'reload':
                    // Get current server data
                    $current_topics = array();
                    for ($i = 1; $i <= 5; $i++) {
                        $topic_value = get_post_meta($post_id, "mkcg_topic_{$i}", true);
                        if (!empty($topic_value)) {
                            $current_topics["topic_{$i}"] = $topic_value;
                        }
                    }
                    
                    wp_send_json_success(array(
                        'message' => 'Current server data retrieved',
                        'topics' => $current_topics,
                        'timestamp' => time(),
                        'resolution_type' => 'reload'
                    ));
                    break;
                    
                default:
                    wp_send_json_error(array(
                        'message' => 'Invalid resolution type',
                        'code' => 'INVALID_RESOLUTION'
                    ));
            }
            
        } catch (Exception $e) {
            $this->log_error('AJAX conflict resolution error: ' . $e->getMessage(), 'ajax-conflict-resolution', $e);
            wp_send_json_error(array(
                'message' => 'Conflict resolution error',
                'code' => 'SERVER_ERROR'
            ));
        }
    }
    
    /**
     * Clear save cache when post meta is updated
     * 
     * @param int $meta_id Meta ID
     * @param int $post_id Post ID
     */
    public function clear_save_cache($meta_id, $post_id) {
        $cache_key = "topics_save_{$post_id}";
        unset($this->save_cache[$cache_key]);
    }
    
    /**
     * Log error for debugging
     * 
     * @param string $message Error message
     * @param string $context Error context
     * @param Exception $exception Exception object (optional)
     */
    private function log_error($message, $context = 'general', $exception = null) {
        $error = array(
            'message' => $message,
            'context' => $context,
            'timestamp' => time(),
            'user_id' => get_current_user_id(),
            'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
            'backtrace' => $exception ? $exception->getTraceAsString() : wp_debug_backtrace_summary()
        );
        
        $this->errors[] = $error;
        
        // Log to WordPress debug if enabled
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("GMKB Topics AJAX [{$context}]: {$message}");
            if ($exception) {
                error_log("GMKB Topics AJAX Exception: " . $exception->getTraceAsString());
            }
        }
    }
    
    /**
     * Get errors for debugging
     * 
     * @return array Array of errors
     */
    public function get_errors() {
        return $this->errors;
    }
    
    /**
     * Clear errors
     */
    public function clear_errors() {
        $this->errors = array();
    }
    
    /**
     * PHASE 4: AJAX handler for topic reordering (logged-in users)
     */
    public function ajax_reorder_mkcg_topics() {
        try {
            // Verify nonce for security
            if (!wp_verify_nonce($_POST['nonce'] ?? '', 'guestify_media_kit_builder')) {
                wp_send_json_error(array(
                    'message' => 'Security verification failed',
                    'code' => 'INVALID_NONCE'
                ));
                return;
            }
            
            // Check user capabilities
            if (!current_user_can('edit_posts')) {
                wp_send_json_error(array(
                    'message' => 'Insufficient permissions to reorder topics',
                    'code' => 'INSUFFICIENT_PERMISSIONS'
                ));
                return;
            }
            
            $this->process_reorder_request();
            
        } catch (Exception $e) {
            $this->log_error('AJAX reorder error: ' . $e->getMessage(), 'ajax-reorder', $e);
            wp_send_json_error(array(
                'message' => 'Internal server error during reorder',
                'code' => 'SERVER_ERROR',
                'debug' => defined('WP_DEBUG') && WP_DEBUG ? $e->getMessage() : ''
            ));
        }
    }
    
    /**
     * PHASE 4: AJAX handler for topic reordering (non-logged-in users)
     */
    public function ajax_reorder_mkcg_topics_nopriv() {
        wp_send_json_error(array(
            'message' => 'Authentication required to reorder topics',
            'code' => 'AUTHENTICATION_REQUIRED'
        ));
    }
    
    /**
     * PHASE 4: Process topic reorder request
     */
    private function process_reorder_request() {
        $start_time = microtime(true);
        
        // Extract and validate parameters
        $post_id = intval($_POST['post_id'] ?? 0);
        $topics_data = $_POST['topics'] ?? array();
        $reorder_info = $_POST['reorder_info'] ?? array();
        
        // Validate required parameters
        if (!$post_id || $post_id <= 0) {
            wp_send_json_error(array(
                'message' => 'Invalid post ID provided',
                'code' => 'INVALID_POST_ID'
            ));
            return;
        }
        
        // Verify post exists and is accessible
        $post = get_post($post_id);
        if (!$post || $post->post_status === 'trash') {
            wp_send_json_error(array(
                'message' => 'Post not found or inaccessible',
                'code' => 'POST_NOT_FOUND',
                'post_id' => $post_id
            ));
            return;
        }
        
        // Validate reorder information
        if (!isset($reorder_info['source_position']) || !isset($reorder_info['target_position'])) {
            wp_send_json_error(array(
                'message' => 'Invalid reorder information provided',
                'code' => 'INVALID_REORDER_INFO'
            ));
            return;
        }
        
        $source_position = intval($reorder_info['source_position']);
        $target_position = intval($reorder_info['target_position']);
        
        // Validate position ranges (1-5 for topics)
        if ($source_position < 1 || $source_position > 5 || $target_position < 1 || $target_position > 5) {
            wp_send_json_error(array(
                'message' => 'Invalid topic positions (must be 1-5)',
                'code' => 'INVALID_POSITION_RANGE'
            ));
            return;
        }
        
        // Validate and sanitize reordered topics data
        $validated_topics = $this->validate_and_sanitize_topics($topics_data);
        if (!$validated_topics['valid']) {
            wp_send_json_error(array(
                'message' => 'Reordered topic data validation failed',
                'code' => 'VALIDATION_FAILED',
                'validation_errors' => $validated_topics['errors']
            ));
            return;
        }
        
        // Perform reorder save operation
        $reorder_result = $this->save_reordered_topics_to_post_meta(
            $post_id, 
            $validated_topics['topics'], 
            $source_position, 
            $target_position,
            $reorder_info
        );
        
        if ($reorder_result['success']) {
            $processing_time = round((microtime(true) - $start_time) * 1000, 2);
            
            wp_send_json_success(array(
                'message' => 'Topics reordered successfully',
                'post_id' => $post_id,
                'reorder_info' => array(
                    'source_position' => $source_position,
                    'target_position' => $target_position,
                    'topics_affected' => count($validated_topics['topics'])
                ),
                'timestamp' => time(),
                'server_time' => current_time('mysql'),
                'processing_time' => $processing_time,
                'quality_summary' => $this->calculate_topics_quality($validated_topics['topics'])
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to save reordered topics',
                'code' => 'REORDER_SAVE_FAILED',
                'details' => $reorder_result['error']
            ));
        }
    }
    
    /**
     * PHASE 4: Save reordered topics to WordPress post meta
     * 
     * @param int $post_id Post ID
     * @param array $topics Reordered topics data
     * @param int $source_position Original position
     * @param int $target_position New position
     * @param array $reorder_info Additional reorder information
     * @return array Save result
     */
    private function save_reordered_topics_to_post_meta($post_id, $topics, $source_position, $target_position, $reorder_info) {
        try {
            $reorder_timestamp = current_time('mysql');
            $user_id = get_current_user_id();
            $topics_saved = 0;
            
            // Clear all existing topic meta first to ensure clean reorder
            for ($i = 1; $i <= 5; $i++) {
                delete_post_meta($post_id, "mkcg_topic_{$i}");
            }
            
            // Save reordered topics to their new positions
            foreach ($topics as $topic_key => $topic_value) {
                if (!empty($topic_value)) {
                    $meta_key = "mkcg_{$topic_key}";
                    $update_result = update_post_meta($post_id, $meta_key, $topic_value);
                    
                    if ($update_result !== false) {
                        $topics_saved++;
                    }
                }
            }
            
            // Save reorder operation metadata
            update_post_meta($post_id, 'mkcg_topics_last_reordered', $reorder_timestamp);
            update_post_meta($post_id, 'mkcg_topics_last_reordered_by', $user_id);
            update_post_meta($post_id, 'mkcg_topics_reorder_info', array(
                'source_position' => $source_position,
                'target_position' => $target_position,
                'timestamp' => $reorder_timestamp,
                'user_id' => $user_id
            ));
            
            // Update general edit metadata
            update_post_meta($post_id, 'mkcg_topics_last_edited', $reorder_timestamp);
            update_post_meta($post_id, 'mkcg_topics_last_edited_by', $user_id);
            update_post_meta($post_id, 'mkcg_topics_save_type', 'reorder');
            update_post_meta($post_id, 'mkcg_last_update', $reorder_timestamp);
            
            // Log successful reorder for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("GMKB Topics: Successfully reordered topics for post {$post_id} (" . 
                    "from position {$source_position} to {$target_position}, " . 
                    "{$topics_saved} topics saved)");
            }
            
            return array(
                'success' => true,
                'topics_saved' => $topics_saved,
                'timestamp' => $reorder_timestamp,
                'source_position' => $source_position,
                'target_position' => $target_position
            );
            
        } catch (Exception $e) {
            $this->log_error("Error reordering topics for post {$post_id}: " . $e->getMessage(), 'reorder-operation', $e);
            
            return array(
                'success' => false,
                'error' => 'Database reorder operation failed',
                'debug' => defined('WP_DEBUG') && WP_DEBUG ? $e->getMessage() : ''
            );
        }
    }
    
    /**
     * Get handler status for debugging
     * 
     * @return array Status information
     */
    public function get_status() {
        return array(
            'handlers_registered' => true,
            'save_cache_size' => count($this->save_cache),
            'errors_logged' => count($this->errors),
            'version' => '1.0.0-phase3',
            'capabilities' => array(
                'batch_save' => true,
                'validation' => true,
                'conflict_resolution' => true,
                'auto_save_support' => true,
                'quality_analysis' => true,
                'topic_reordering' => true,
                'undo_support' => true
            )
        );
    }
}

// Initialize the Topics AJAX handler
GMKB_Topics_Ajax_Handler::get_instance();
