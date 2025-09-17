<?php
/**
 * GMKB Post Data Manager (Refactored from MKCG Data Integration)
 * 
 * PHASE 1 ARCHITECTURAL FIX: Post-level data operations only
 * Component-specific operations moved to individual component integrations
 * 
 * @package Guestify
 * @version 2.0.0-phase1-post-level-only
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// Load Component Integration Registry
if (!class_exists('Component_Integration_Registry')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/Component_Integration_Registry.php';
}

/**
 * GMKB Post Data Manager Class
 * 
 * PHASE 1 REFACTOR: Handles post-level operations and cross-component coordination
 * Individual component data operations delegated to component-specific integrations
 */
class GMKB_Post_Data_Manager {
    
    /**
     * Singleton instance
     */
    private static $instance = null;
    
    /**
     * Cache for processed data
     */
    private $data_cache = array();
    
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
        // Add hooks for cache management
        add_action('save_post', array($this, 'clear_post_cache'));
        add_action('deleted_post_meta', array($this, 'clear_meta_cache'), 10, 2);
        add_action('updated_post_meta', array($this, 'clear_meta_cache'), 10, 2);
        
        // TASK 5: AJAX handlers now managed by GMKB_MKCG_Refresh_AJAX_Handlers class
        // Removed duplicate handlers to prevent conflicts
    }
    
    /**
     * PHASE 1 REFACTOR: Get post data using component integrations
     * Delegates to individual component integrations instead of handling directly
     * @param int $post_id Post ID
     * @return array|null Enhanced data with metadata
     */
    public function get_post_data($post_id) {
        // Validate post ID
        if (!$this->validate_post_id($post_id)) {
            $this->log_error("Invalid post ID: {$post_id}", 'validation');
            return null;
        }
        
        // Check cache first
        $cache_key = "mkcg_data_{$post_id}";
        if (isset($this->data_cache[$cache_key])) {
            return $this->data_cache[$cache_key];
        }
        
        try {
            // Get post object
            $post = get_post($post_id);
            if (!$post) {
                $this->log_error("Post not found: {$post_id}", 'post-retrieval');
                return null;
            }
            
            // PHASE 1 REFACTOR: Use Component Integration Registry instead of direct extraction
            $comprehensive_data = Component_Integration_Registry::get_post_data_comprehensive($post_id);
            
            // Transform to legacy format for backward compatibility
            $post_data = array(
                'post_info' => $this->get_post_info($post),
                'components' => $comprehensive_data['components'],
                'availability' => $comprehensive_data['availability'],
                'meta_info' => $this->get_meta_info($post_id)
            );
            
            // Validate extracted data
            $validated_data = $this->validate_and_sanitize_data($post_data);
            
            // TASK 5: Add freshness metadata
            $validated_data['freshness'] = $this->get_freshness_metadata($post_id);
            
            // Cache the result
            $this->data_cache[$cache_key] = $validated_data;
            
            return $validated_data;
            
        } catch (Exception $e) {
            $this->log_error("Error extracting data for post {$post_id}: " . $e->getMessage(), 'extraction');
            return null;
        }
    }
    
    /**
     * Get basic post information
     * 
     * @param WP_Post $post The post object
     * @return array Post information
     */
    private function get_post_info($post) {
        return array(
            'id' => $post->ID,
            'title' => sanitize_text_field($post->post_title),
            'content' => wp_kses_post($post->post_content),
            'excerpt' => sanitize_text_field($post->post_excerpt),
            'slug' => sanitize_title($post->post_name),
            'status' => sanitize_text_field($post->post_status),
            'date_created' => $post->post_date,
            'date_modified' => $post->post_modified
        );
    }
    
    // PHASE 1 REMOVED: Component-specific methods moved to individual integrations
    
    // PHASE 1 REMOVED: Biography methods moved to Biography_Pods_Integration
    
    // PHASE 1 REMOVED: Authority hook methods moved to Authority_Hook_Pods_Integration
    
    // PHASE 1 REMOVED: Questions methods moved to Questions_Pods_Integration
    
    // PHASE 1 REMOVED: Offers methods moved to component integration (future)
    
    // PHASE 1 REMOVED: Social media methods moved to Social_Pods_Integration
    
    /**
     * Get meta information about MKCG data
     * 
     * @param int $post_id Post ID
     * @return array Meta information
     */
    private function get_meta_info($post_id) {
        return array(
            'extraction_timestamp' => time(),
            'extraction_date' => current_time('mysql'),
            'post_id' => $post_id,
            'mkcg_version' => get_post_meta($post_id, 'mkcg_generator_version', true),
            'last_mkcg_update' => get_post_meta($post_id, 'mkcg_last_update', true),
            'data_source' => 'mkcg_integration'
        );
    }
    
    /**
     * Validate post ID
     * 
     * @param mixed $post_id Post ID to validate
     * @return bool True if valid
     */
    private function validate_post_id($post_id) {
        return is_numeric($post_id) && intval($post_id) > 0 && get_post_status($post_id) !== false;
    }
    
    /**
     * Validate and sanitize extracted data
     * 
     * @param array $data Raw extracted data
     * @return array Validated and sanitized data
     */
    private function validate_and_sanitize_data($data) {
        // Ensure all top-level keys exist
        $default_structure = array(
            'post_info' => array(),
            'topics' => array('topics' => array(), 'meta' => array()),
            'biography' => array('biography' => array(), 'meta' => array()),
            'authority_hook' => array('authority_hook' => array(), 'meta' => array()),
            'questions' => array('questions' => array(), 'meta' => array()),
            'offers' => array('offers' => array(), 'meta' => array()),
            'social_media' => array(),
            'meta_info' => array()
        );
        
        // Merge with defaults to ensure structure
        $validated_data = array_merge($default_structure, $data);
        
        // Add validation flags
        $validated_data['validation'] = array(
            'has_topics' => !empty($validated_data['topics']['topics']),
            'has_biography' => !empty($validated_data['biography']['biography']),
            'has_authority_hook' => !empty($validated_data['authority_hook']['authority_hook']),
            'has_questions' => !empty($validated_data['questions']['questions']),
            'has_offers' => !empty($validated_data['offers']['offers']),
            'has_social_media' => !empty($validated_data['social_media']),
            'is_complete' => false
        );
        
        // Determine if data set is complete
        $validated_data['validation']['is_complete'] = 
            $validated_data['validation']['has_topics'] || 
            $validated_data['validation']['has_biography'] || 
            $validated_data['validation']['has_authority_hook'];
        
        return $validated_data;
    }
    
    /**
     * Log error for debugging
     * 
     * @param string $message Error message
     * @param string $context Error context
     */
    private function log_error($message, $context = 'general') {
        $error = array(
            'message' => $message,
            'context' => $context,
            'timestamp' => time(),
            'backtrace' => wp_debug_backtrace_summary()
        );
        
        $this->errors[] = $error;
        
        // Log to WordPress debug if enabled
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("GMKB MKCG Integration [{$context}]: {$message}");
        }
    }
    
    /**
     * Get errors
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
     * Clear post cache when post is updated
     * 
     * @param int $post_id Post ID
     */
    public function clear_post_cache($post_id) {
        $cache_key = "mkcg_data_{$post_id}";
        unset($this->data_cache[$cache_key]);
    }
    
    /**
     * Clear meta cache when meta is updated
     * 
     * @param array $meta_ids Meta IDs
     * @param int $post_id Post ID
     */
    public function clear_meta_cache($meta_ids, $post_id) {
        $this->clear_post_cache($post_id);
    }
    
    /**
     * TASK 5: Get freshness metadata for data refresh functionality
     * 
     * @param int $post_id Post ID
     * @return array Freshness metadata
     */
    private function get_freshness_metadata($post_id) {
        return array(
            'extraction_timestamp' => time(),
            'last_modified' => get_post_modified_time('U', false, $post_id),
            'content_hash' => $this->calculate_content_hash($post_id),
            'version' => '1.0.0-task5'
        );
    }
    
    /**
     * TASK 5: Calculate content hash for change detection
     * PHASE 1 REFACTOR: Use component integrations for hash calculation
     * 
     * @param int $post_id Post ID
     * @return string Content hash
     */
    private function calculate_content_hash($post_id) {
        $content_parts = array();
        
        // PHASE 1 REFACTOR: Get hashes from all component integrations
        foreach (Component_Integration_Registry::get_component_types() as $component_type) {
            $component_hash = Component_Integration_Registry::calculate_component_hash($component_type, $post_id);
            if (!empty($component_hash)) {
                $content_parts[] = $component_type . ':' . $component_hash;
            }
        }
        
        return md5(implode('|', $content_parts));
    }
    
    /**
     * TASK 5: Check data freshness compared to client timestamp
     * 
     * @param int $post_id Post ID
     * @param int $client_timestamp Client's data timestamp
     * @return array Freshness check result
     */
    public function check_data_freshness($post_id, $client_timestamp) {
        if (!$this->validate_post_id($post_id)) {
            return array(
                'success' => false,
                'message' => 'Invalid post ID'
            );
        }
        
        try {
            // Get current server timestamp and content hash
            $server_timestamp = time();
            $current_hash = $this->calculate_content_hash($post_id);
            
            // Get stored hash from client data if available
            $stored_hash = get_transient("mkcg_hash_{$post_id}");
            
            // Compare timestamps and content
            $has_fresh_data = false;
            $changed_components = array();
            
            // Check if content has changed
            if ($stored_hash && $current_hash !== $stored_hash) {
                $has_fresh_data = true;
                $changed_components = $this->detect_changed_components($post_id, $stored_hash, $current_hash);
            }
            
            // Check modification time
            $last_modified = get_post_modified_time('U', false, $post_id);
            if ($last_modified > $client_timestamp) {
                $has_fresh_data = true;
            }
            
            // Store current hash
            set_transient("mkcg_hash_{$post_id}", $current_hash, 3600); // 1 hour
            
            return array(
                'success' => true,
                'server_timestamp' => $server_timestamp,
                'client_timestamp' => $client_timestamp,
                'has_fresh_data' => $has_fresh_data,
                'last_modified' => $last_modified,
                'content_hash' => $current_hash,
                'changed_components' => $changed_components
            );
            
        } catch (Exception $e) {
            $this->log_error("Error checking data freshness for post {$post_id}: " . $e->getMessage(), 'freshness-check');
            return array(
                'success' => false,
                'message' => 'Error checking data freshness: ' . $e->getMessage()
            );
        }
    }
    

    

    
    /**
     * Get available MKCG data for a post (quick check)
     * PHASE 1 REFACTOR: Use component integrations for availability checks
     * 
     * @param int $post_id Post ID
     * @return array Availability flags
     */
    public function get_data_availability($post_id) {
        if (!$this->validate_post_id($post_id)) {
            return array();
        }
        
        // PHASE 1 REFACTOR: Use Component Integration Registry
        $availability = array();
        
        foreach (Component_Integration_Registry::get_component_types() as $component_type) {
            $component_availability = Component_Integration_Registry::get_component_availability($component_type, $post_id);
            $availability["has_{$component_type}"] = $component_availability['has_data'];
        }
        
        return $availability;
    }
    
    // =======================
    // TASK 5: SERVER-SIDE REFRESH SUPPORT
    // =======================
    
    /**
     * Get fresh data timestamp for comparison
     * 
     * @param int $post_id Post ID
     * @return int|false Timestamp or false if not found
     */
    public function get_fresh_data_timestamp($post_id) {
        if (!$this->validate_post_id($post_id)) {
            return false;
        }
        
        // Check for recent MKCG updates
        $last_update = get_post_meta($post_id, 'mkcg_last_update', true);
        if ($last_update) {
            return strtotime($last_update);
        }
        
        // Fall back to post modification time
        $post = get_post($post_id);
        if ($post) {
            return strtotime($post->post_modified);
        }
        
        return false;
    }
    

    
    /**
     * Detect which components have changed since client timestamp
     * 
     * @param int $post_id Post ID
     * @param string $stored_hash Previous content hash
     * @param string $current_hash Current content hash
     * @return array Array of changed component types
     */
    private function detect_changed_components($post_id, $stored_hash, $current_hash) {
        $changed = array();
        
        // If hashes are different, assume all components with data might have changed
        if ($stored_hash !== $current_hash) {
            $component_checks = array(
                'topics' => 'topic_1',
                'biography' => 'biography_short',
                'authority_hook' => 'authority_hook_who',
                'questions' => 'question_1',
                'offers' => 'offer_1_title',
                'social_media' => 'social_twitter'
            );
            
            foreach ($component_checks as $component_type => $meta_key) {
                // If component has data, mark it as potentially changed
                if (!empty(get_post_meta($post_id, $meta_key, true))) {
                    $changed[] = $component_type;
                }
            }
        }
        
        return $changed;
    }
    
    /**
     * Get fresh component data for specific component type
     * 
     * @param int $post_id Post ID
     * @param string $component_type Component type
     * @return array|null Component data or null
     */
    public function get_fresh_component_data($post_id, $component_type) {
        if (!$this->validate_post_id($post_id)) {
            return null;
        }
        
        switch ($component_type) {
            case 'topics':
                return $this->get_topics_data($post_id);
            case 'biography':
                return $this->get_biography_data($post_id);
            case 'authority_hook':
            case 'authority-hook':
                return $this->get_authority_hook_data($post_id);
            case 'questions':
                return $this->get_questions_data($post_id);
            case 'offers':
                return $this->get_offers_data($post_id);
            case 'social_media':
            case 'social-media':
                return $this->get_social_media_data($post_id);
            default:
                return null;
        }
    }
    
    /**
     * TASK 5: Get fresh MKCG data for AJAX handler
     * 
     * @param int $post_id Post ID
     * @return array Response array with success flag
     */
    public function get_fresh_mkcg_data($post_id) {
        try {
            $fresh_data = $this->get_post_data($post_id);
            
            if ($fresh_data) {
                return array(
                    'success' => true,
                    'data' => $fresh_data,
                    'timestamp' => time(),
                    'post_id' => $post_id,
                    'message' => 'Fresh data retrieved successfully'
                );
            } else {
                return array(
                    'success' => false,
                    'message' => 'No MKCG data found for this post',
                    'post_id' => $post_id
                );
            }
            
        } catch (Exception $e) {
            $this->log_error("Error getting fresh MKCG data for post {$post_id}: " . $e->getMessage(), 'fresh-data-retrieval');
            return array(
                'success' => false,
                'message' => 'Error retrieving fresh data: ' . $e->getMessage(),
                'post_id' => $post_id
            );
        }
    }
    
    /**
     * TASK 5: Get fresh component data for AJAX handler
     * 
     * @param int $post_id Post ID
     * @param string $component_type Component type
     * @return array Response array with success flag
     */
    public function get_fresh_component_data_for_ajax($post_id, $component_type) {
        try {
            $component_data = $this->get_fresh_component_data($post_id, $component_type);
            
            if ($component_data) {
                return array(
                    'success' => true,
                    'data' => $component_data,
                    'component_type' => $component_type,
                    'timestamp' => time(),
                    'post_id' => $post_id,
                    'message' => 'Fresh component data retrieved successfully'
                );
            } else {
                return array(
                    'success' => false,
                    'message' => 'No data found for this component type',
                    'component_type' => $component_type,
                    'post_id' => $post_id
                );
            }
            
        } catch (Exception $e) {
            $this->log_error("Error getting fresh component data for {$component_type} in post {$post_id}: " . $e->getMessage(), 'fresh-component-retrieval');
            return array(
                'success' => false,
                'message' => 'Error retrieving fresh component data: ' . $e->getMessage(),
                'component_type' => $component_type,
                'post_id' => $post_id
            );
        }
    }
    
    /**
     * TASK 5: Get refresh debug information for AJAX handler
     * 
     * @param int $post_id Post ID
     * @return array Debug information
     */
    public function get_refresh_debug_info($post_id) {
        try {
            $post_data = $this->get_post_data($post_id);
            $availability = $this->get_data_availability($post_id);
            $freshness_info = $this->get_fresh_data_timestamp($post_id);
            $errors = $this->get_errors();
            
            return array(
                'post_id' => $post_id,
                'has_mkcg_data' => !empty($post_data),
                'data_availability' => $availability,
                'freshness_info' => $freshness_info,
                'last_extraction' => $post_data['meta_info']['extraction_timestamp'] ?? null,
                'extraction_date' => $post_data['meta_info']['extraction_date'] ?? null,
                'data_quality' => $this->calculate_data_quality($post_data),
                'component_counts' => $this->get_component_counts($post_data),
                'errors' => $errors,
                'cache_status' => array(
                    'data_cache_size' => count($this->data_cache),
                    'timestamp_cache_size' => count($this->timestampCache ?? array())
                ),
                'performance' => array(
                    'generation_time' => microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'],
                    'memory_usage' => memory_get_usage(true),
                    'memory_peak' => memory_get_peak_usage(true)
                )
            );
            
        } catch (Exception $e) {
            $this->log_error("Error getting debug info for post {$post_id}: " . $e->getMessage(), 'debug-info');
            return array(
                'post_id' => $post_id,
                'error' => 'Failed to generate debug info: ' . $e->getMessage()
            );
        }
    }
    
    /**
     * TASK 5: Enhanced compare_data_freshness with proper return format
     * 
     * @param int $post_id Post ID
     * @param int $client_timestamp Client timestamp
     * @return array Comparison result with success flag
     */
    public function compare_data_freshness($post_id, $client_timestamp) {
        try {
            $server_timestamp = $this->get_fresh_data_timestamp($post_id);
            
            if (!$server_timestamp) {
                return array(
                    'success' => false,
                    'message' => 'Could not determine server timestamp for this post',
                    'post_id' => $post_id,
                    'client_timestamp' => $client_timestamp
                );
            }
            
            $has_fresh_data = $server_timestamp > $client_timestamp;
            $time_difference = $server_timestamp - $client_timestamp;
            
            // Detect changed components if fresh data is available
            $changed_components = array();
            if ($has_fresh_data) {
                $changed_components = $this->detect_changed_components($post_id, $client_timestamp);
            }
            
            return array(
                'success' => true,
                'server_timestamp' => $server_timestamp,
                'client_timestamp' => $client_timestamp,
                'has_fresh_data' => $has_fresh_data,
                'time_difference' => $time_difference,
                'changed_components' => $changed_components,
                'post_id' => $post_id,
                'check_time' => current_time('mysql')
            );
            
        } catch (Exception $e) {
            $this->log_error("Error comparing data freshness for post {$post_id}: " . $e->getMessage(), 'freshness-comparison');
            return array(
                'success' => false,
                'message' => 'Error during freshness comparison: ' . $e->getMessage(),
                'post_id' => $post_id,
                'client_timestamp' => $client_timestamp
            );
        }
    }
    
    /**
     * TASK 5: Calculate data quality score for debug info
     * 
     * @param array $post_data Post data
     * @return array Quality information
     */
    private function calculate_data_quality($post_data) {
        if (!$post_data || !isset($post_data['validation'])) {
            return array(
                'score' => 0,
                'level' => 'none',
                'components_available' => 0
            );
        }
        
        $validation = $post_data['validation'];
        $quality_components = array(
            $validation['has_topics'] ? 20 : 0,
            $validation['has_biography'] ? 25 : 0,
            $validation['has_authority_hook'] ? 20 : 0,
            $validation['has_questions'] ? 15 : 0,
            $validation['has_offers'] ? 10 : 0,
            $validation['has_social_media'] ? 10 : 0
        );
        
        $score = array_sum($quality_components);
        $available_count = count(array_filter($validation));
        
        $level = 'poor';
        if ($score >= 80) $level = 'excellent';
        elseif ($score >= 60) $level = 'good';
        elseif ($score >= 40) $level = 'fair';
        
        return array(
            'score' => $score,
            'level' => $level,
            'components_available' => $available_count,
            'total_possible' => 6
        );
    }
    
    /**
     * TASK 5: Get component counts for debug info
     * 
     * @param array $post_data Post data
     * @return array Component counts
     */
    private function get_component_counts($post_data) {
        if (!$post_data) {
            return array();
        }
        
        $counts = array();
        
        // Topics
        if (isset($post_data['topics']['topics'])) {
            $counts['topics'] = count($post_data['topics']['topics']);
        }
        
        // Biography
        if (isset($post_data['biography']['biography'])) {
            $counts['biography'] = count(array_filter($post_data['biography']['biography']));
        }
        
        // Authority Hook
        if (isset($post_data['authority_hook']['authority_hook'])) {
            $counts['authority_hook'] = count($post_data['authority_hook']['authority_hook']);
        }
        
        // Questions
        if (isset($post_data['questions']['questions'])) {
            $counts['questions'] = count($post_data['questions']['questions']);
        }
        
        // Offers
        if (isset($post_data['offers']['offers'])) {
            $counts['offers'] = count($post_data['offers']['offers']);
        }
        
        // Social Media
        if (isset($post_data['social_media'])) {
            $counts['social_media'] = count($post_data['social_media']);
        }
        
        return $counts;
    }
    
    // =======================
    // TASK 5: AJAX HANDLERS - MOVED TO DEDICATED CLASS
    // =======================
    // AJAX handlers have been moved to GMKB_MKCG_Refresh_AJAX_Handlers class
    // to prevent conflicts and provide better separation of concerns
}
