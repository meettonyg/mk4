<?php
/**
 * GMKB MKCG Data Integration Service
 * 
 * Handles extraction and processing of Media Content Generator data
 * for integration with Media Kit Builder components.
 * 
 * @package Guestify
 * @version 1.0.0-phase1
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * GMKB MKCG Data Integration Service Class
 * 
 * Provides comprehensive data extraction and processing for MKCG integration
 */
class GMKB_MKCG_Data_Integration {
    
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
     * PHASE 2.3 - TASK 5: Enhanced MKCG data extraction with freshness support
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
            
            // Extract all MKCG data
            $mkcg_data = array(
                'post_info' => $this->get_post_info($post),
                'topics' => $this->get_topics_data($post_id),
                'biography' => $this->get_biography_data($post_id),
                'authority_hook' => $this->get_authority_hook_data($post_id),
                'questions' => $this->get_questions_data($post_id),
                'offers' => $this->get_offers_data($post_id),
                'social_media' => $this->get_social_media_data($post_id),
                'meta_info' => $this->get_meta_info($post_id)
            );
            
            // Validate extracted data
            $validated_data = $this->validate_and_sanitize_data($mkcg_data);
            
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
    
    /**
     * Extract topics data from MKCG
     * ROOT FIX: Enhanced to support multiple meta key formats and exact field names from your screenshot
     * 
     * @param int $post_id Post ID
     * @return array Topics data
     */
    private function get_topics_data($post_id) {
        $topics = array();
        
        // ROOT FIX: Based on Pods configuration JSON, the exact meta keys are: topic_1, topic_2, etc.
        // First try the Pods format from your WordPress custom fields
        $pods_topics = [];
        for ($i = 1; $i <= 5; $i++) {
            $meta_key = "topic_{$i}";
            $topic_value = get_post_meta($post_id, $meta_key, true);
            
            if (!empty($topic_value)) {
                $pods_topics["topic_{$i}"] = sanitize_text_field($topic_value);
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("GMKB MKCG: Found topic in {$meta_key}: {$topic_value}");
                }
            }
        }
        
        // If we found topics with topic_ format (Pods), use them
        if (!empty($pods_topics)) {
            $topics = $pods_topics;
            $found_format = 'topic_';
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("GMKB MKCG: Successfully loaded " . count($topics) . " topics from topic_ fields (Pods) for post {$post_id}");
                error_log("GMKB MKCG: Topics data: " . print_r($topics, true));
            }
        } else {
            // Fallback: Try other possible meta key formats including mkcg_
            $meta_formats = [
                'mkcg_topic_',    // MKCG format (legacy)
                'topics_',        // Plural topics format
                '_topic_',        // Underscore prefix format
                'speaking_topic_', // Descriptive format
                'pod_topic_'      // Pods plugin format (alternative)
            ];
            
            $found_format = null;
            foreach ($meta_formats as $format) {
                $format_topics = [];
                
                // Extract up to 5 topics for this format
                for ($i = 1; $i <= 5; $i++) {
                    $meta_key = $format . $i;
                    $topic_value = get_post_meta($post_id, $meta_key, true);
                    
                    if (!empty($topic_value)) {
                        $format_topics["topic_{$i}"] = sanitize_text_field($topic_value);
                    }
                }
                
                // If we found topics with this format, use them and stop searching
                if (!empty($format_topics)) {
                    $topics = $format_topics;
                    $found_format = $format;
                    break;
                }
            }
        }
        
        // Debug: Log all post meta to see what's available
        if (defined('WP_DEBUG') && WP_DEBUG && empty($topics)) {
            $all_meta = get_post_meta($post_id);
            $topic_related_meta = array();
            foreach ($all_meta as $key => $value) {
                if (stripos($key, 'topic') !== false || stripos($key, 'mkcg') !== false) {
                    $topic_related_meta[$key] = $value;
                }
            }
            error_log("GMKB MKCG: No topics found for post {$post_id}. Topic-related meta fields: " . print_r($topic_related_meta, true));
        }
        
        // Add topic metadata if available
        $topics_meta = array(
            'count' => count($topics),
            'meta_format_used' => $found_format ?? 'none',
            'generated_date' => get_post_meta($post_id, 'mkcg_topics_generated_date', true),
            'generator_version' => get_post_meta($post_id, 'mkcg_topics_version', true)
        );
        
        return array(
            'topics' => $topics,
            'meta' => array_filter($topics_meta) // Remove empty values
        );
    }
    
    /**
     * Extract biography data from MKCG
     * 
     * @param int $post_id Post ID
     * @return array Biography data
     */
    private function get_biography_data($post_id) {
        $biography = array();
        
        // Standard MKCG biography fields
        $bio_fields = array(
            'name' => 'mkcg_biography_name',
            'title' => 'mkcg_biography_title',
            'organization' => 'mkcg_biography_organization',
            'short' => 'mkcg_biography_short',
            'medium' => 'mkcg_biography_medium',
            'long' => 'mkcg_biography_long',
            'tone' => 'mkcg_biography_tone',
            'expertise' => 'mkcg_biography_expertise',
            'achievements' => 'mkcg_biography_achievements'
        );
        
        foreach ($bio_fields as $key => $meta_key) {
            $value = get_post_meta($post_id, $meta_key, true);
            if (!empty($value)) {
                $biography[$key] = sanitize_textarea_field($value);
            }
        }
        
        // Add biography metadata
        $bio_meta = array(
            'generated_date' => get_post_meta($post_id, 'mkcg_biography_generated_date', true),
            'word_count' => isset($biography['long']) ? str_word_count($biography['long']) : 0,
            'tone_style' => get_post_meta($post_id, 'mkcg_biography_tone_style', true)
        );
        
        return array(
            'biography' => $biography,
            'meta' => array_filter($bio_meta)
        );
    }
    
    /**
     * Extract authority hook data from MKCG
     * 
     * @param int $post_id Post ID
     * @return array Authority hook data
     */
    private function get_authority_hook_data($post_id) {
        $authority_hook = array();
        
        // Standard MKCG authority hook components
        $hook_fields = array(
            'who' => 'mkcg_authority_hook_who',
            'what' => 'mkcg_authority_hook_what',
            'when' => 'mkcg_authority_hook_when',
            'where' => 'mkcg_authority_hook_where',
            'why' => 'mkcg_authority_hook_why',
            'how' => 'mkcg_authority_hook_how'
        );
        
        foreach ($hook_fields as $key => $meta_key) {
            $value = get_post_meta($post_id, $meta_key, true);
            if (!empty($value)) {
                $authority_hook[$key] = sanitize_textarea_field($value);
            }
        }
        
        // Add authority hook metadata
        $hook_meta = array(
            'generated_date' => get_post_meta($post_id, 'mkcg_authority_hook_generated_date', true),
            'style' => get_post_meta($post_id, 'mkcg_authority_hook_style', true),
            'complete' => count($authority_hook) >= 4 // At least 4 components for complete hook
        );
        
        return array(
            'authority_hook' => $authority_hook,
            'meta' => array_filter($hook_meta)
        );
    }
    
    /**
     * Extract questions data from MKCG
     * 
     * @param int $post_id Post ID
     * @return array Questions data
     */
    private function get_questions_data($post_id) {
        $questions = array();
        
        // Extract up to 10 questions (standard MKCG structure)
        for ($i = 1; $i <= 10; $i++) {
            $question_value = get_post_meta($post_id, "mkcg_question_{$i}", true);
            if (!empty($question_value)) {
                $questions["question_{$i}"] = sanitize_text_field($question_value);
            }
        }
        
        // Add questions metadata
        $questions_meta = array(
            'count' => count($questions),
            'generated_date' => get_post_meta($post_id, 'mkcg_questions_generated_date', true),
            'category' => get_post_meta($post_id, 'mkcg_questions_category', true)
        );
        
        return array(
            'questions' => $questions,
            'meta' => array_filter($questions_meta)
        );
    }
    
    /**
     * Extract offers data from MKCG
     * 
     * @param int $post_id Post ID
     * @return array Offers data
     */
    private function get_offers_data($post_id) {
        $offers = array();
        
        // Extract up to 5 offers (standard MKCG structure)
        for ($i = 1; $i <= 5; $i++) {
            $offer_title = get_post_meta($post_id, "mkcg_offer_{$i}_title", true);
            $offer_description = get_post_meta($post_id, "mkcg_offer_{$i}_description", true);
            $offer_price = get_post_meta($post_id, "mkcg_offer_{$i}_price", true);
            
            if (!empty($offer_title)) {
                $offers["offer_{$i}"] = array(
                    'title' => sanitize_text_field($offer_title),
                    'description' => sanitize_textarea_field($offer_description),
                    'price' => sanitize_text_field($offer_price)
                );
            }
        }
        
        // Add offers metadata
        $offers_meta = array(
            'count' => count($offers),
            'generated_date' => get_post_meta($post_id, 'mkcg_offers_generated_date', true),
            'style' => get_post_meta($post_id, 'mkcg_offers_style', true)
        );
        
        return array(
            'offers' => $offers,
            'meta' => array_filter($offers_meta)
        );
    }
    
    /**
     * Extract social media data from MKCG
     * 
     * @param int $post_id Post ID
     * @return array Social media data
     */
    private function get_social_media_data($post_id) {
        $social_media = array();
        
        // Standard social media platforms
        $social_platforms = array(
            'twitter' => 'mkcg_social_twitter',
            'linkedin' => 'mkcg_social_linkedin',
            'instagram' => 'mkcg_social_instagram',
            'facebook' => 'mkcg_social_facebook',
            'youtube' => 'mkcg_social_youtube',
            'tiktok' => 'mkcg_social_tiktok',
            'website' => 'mkcg_social_website',
            'podcast' => 'mkcg_social_podcast'
        );
        
        foreach ($social_platforms as $platform => $meta_key) {
            $value = get_post_meta($post_id, $meta_key, true);
            if (!empty($value)) {
                $social_media[$platform] = esc_url_raw($value);
            }
        }
        
        return $social_media;
    }
    
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
     * 
     * @param int $post_id Post ID
     * @return string Content hash
     */
    private function calculate_content_hash($post_id) {
        $content_parts = array();
        
        // Include all MKCG meta fields in hash calculation
        $meta_keys = array(
            'mkcg_topic_1', 'mkcg_topic_2', 'mkcg_topic_3', 'mkcg_topic_4', 'mkcg_topic_5',
            'mkcg_biography_name', 'mkcg_biography_title', 'mkcg_biography_short', 'mkcg_biography_medium', 'mkcg_biography_long',
            'mkcg_authority_hook_who', 'mkcg_authority_hook_what', 'mkcg_authority_hook_when', 'mkcg_authority_hook_how',
            'mkcg_question_1', 'mkcg_question_2', 'mkcg_question_3', 'mkcg_question_4', 'mkcg_question_5',
            'mkcg_offer_1_title', 'mkcg_offer_1_description', 'mkcg_offer_2_title', 'mkcg_offer_2_description'
        );
        
        foreach ($meta_keys as $key) {
            $value = get_post_meta($post_id, $key, true);
            if (!empty($value)) {
                $content_parts[] = $key . ':' . $value;
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
     * 
     * @param int $post_id Post ID
     * @return array Availability flags
     */
    public function get_data_availability($post_id) {
        if (!$this->validate_post_id($post_id)) {
            return array();
        }
        
        return array(
            'has_topics' => !empty(get_post_meta($post_id, 'mkcg_topic_1', true)),
            'has_biography' => !empty(get_post_meta($post_id, 'mkcg_biography_short', true)),
            'has_authority_hook' => !empty(get_post_meta($post_id, 'mkcg_authority_hook_who', true)),
            'has_questions' => !empty(get_post_meta($post_id, 'mkcg_question_1', true)),
            'has_offers' => !empty(get_post_meta($post_id, 'mkcg_offer_1_title', true)),
            'has_social_media' => !empty(get_post_meta($post_id, 'mkcg_social_twitter', true)) || 
                                !empty(get_post_meta($post_id, 'mkcg_social_linkedin', true))
        );
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
                'topics' => 'mkcg_topic_1',
                'biography' => 'mkcg_biography_short',
                'authority_hook' => 'mkcg_authority_hook_who',
                'questions' => 'mkcg_question_1',
                'offers' => 'mkcg_offer_1_title',
                'social_media' => 'mkcg_social_twitter'
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
