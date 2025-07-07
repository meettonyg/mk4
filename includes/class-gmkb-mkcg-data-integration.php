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
    }
    
    /**
     * Get comprehensive MKCG data for a post
     * 
     * @param int $post_id The post ID to extract data from
     * @return array|null Structured MKCG data or null if invalid
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
     * 
     * @param int $post_id Post ID
     * @return array Topics data
     */
    private function get_topics_data($post_id) {
        $topics = array();
        
        // Extract up to 5 topics (standard MKCG structure)
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = get_post_meta($post_id, "mkcg_topic_{$i}", true);
            if (!empty($topic_value)) {
                $topics["topic_{$i}"] = sanitize_text_field($topic_value);
            }
        }
        
        // Add topic metadata if available
        $topics_meta = array(
            'count' => count($topics),
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
}
