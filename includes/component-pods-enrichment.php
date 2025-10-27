<?php
/**
 * Component Pods Data Enrichment System
 * 
 * PHASE 1 ARCHITECTURAL COMPLIANCE:
 * - Single source of truth: Pods fields only
 * - No polling or async operations
 * - Event-driven via WordPress filters
 * - Root cause fix for missing preview data
 * 
 * This system enriches saved component state with actual Pods field values
 * when components are loaded in the media kit preview.
 * 
 * @package Guestify/MediaKit
 * @version 1.0.0-phase1-compliant
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Hook into media kit state loading to enrich with Pods data
 * Priority 10 ensures this runs after state is loaded but before rendering
 */
add_filter('gmkb_load_media_kit_state', 'gmkb_enrich_components_with_pods_data', 10, 2);

/**
 * Main enrichment function - processes all components in saved state
 * 
 * @param array $saved_state The loaded media kit state
 * @param int $post_id The current post ID
 * @return array Enriched state with Pods field data
 */
function gmkb_enrich_components_with_pods_data($saved_state, $post_id) {
    // Validate post ID
    if (!$post_id || !is_numeric($post_id) || $post_id <= 0) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Enrichment: Invalid post ID provided: ' . $post_id);
        }
        return $saved_state;
    }
    
    // Verify post exists
    if (get_post_status($post_id) === false) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Enrichment: Post does not exist: ' . $post_id);
        }
        return $saved_state;
    }
    
    // Process saved_components array if it exists
    if (!empty($saved_state['saved_components']) && is_array($saved_state['saved_components'])) {
        foreach ($saved_state['saved_components'] as &$component) {
            if (empty($component['type'])) {
                continue;
            }
            
            // Initialize props if not set
            if (!isset($component['props'])) {
                $component['props'] = array();
            }
            
            // Enrich based on component type
            switch ($component['type']) {
                case 'topics':
                    $component['props'] = gmkb_enrich_topics_data($component['props'], $post_id);
                    // PHASE 1 FIX: Also update data field for backward compatibility
                    $component['data'] = $component['props'];
                    break;
                    
                case 'biography':
                    $component['props'] = gmkb_enrich_biography_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
                    
                case 'contact':
                    $component['props'] = gmkb_enrich_contact_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
                    
                case 'hero':
                    $component['props'] = gmkb_enrich_hero_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
                    
                case 'questions':
                    $component['props'] = gmkb_enrich_questions_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
                    
                case 'guest-intro':
                    $component['props'] = gmkb_enrich_guest_intro_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
                    
                case 'topics-questions':
                    // Combined component needs both topics and questions data
                    $component['props'] = gmkb_enrich_topics_data($component['props'], $post_id);
                    $component['props'] = gmkb_enrich_questions_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
                    
                // Additional component types can be added here
                default:
                    // Log unhandled component types in debug mode
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('GMKB Enrichment: No enrichment handler for component type: ' . $component['type']);
                    }
                    break;
            }
            
            // Mark that Pods data has been loaded
            $component['props']['podsDataLoaded'] = true;
            $component['props']['enrichmentTimestamp'] = time();
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $component_count = count($saved_state['saved_components']);
            error_log("GMKB Enrichment: Enriched {$component_count} components with Pods data for post {$post_id}");
        }
    }
    
    // Also process components in the main components object if it exists
    if (!empty($saved_state['components']) && is_array($saved_state['components'])) {
        foreach ($saved_state['components'] as $component_id => &$component) {
            if (empty($component['type'])) {
                continue;
            }
            
            // Initialize props if not set
            if (!isset($component['props'])) {
                $component['props'] = array();
            }
            
            // Apply same enrichment logic
            switch ($component['type']) {
                case 'topics':
                    $component['props'] = gmkb_enrich_topics_data($component['props'], $post_id);
                    // PHASE 1 FIX: Also update data field for backward compatibility
                    $component['data'] = $component['props'];
                    break;
                case 'biography':
                    $component['props'] = gmkb_enrich_biography_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
                case 'contact':
                    $component['props'] = gmkb_enrich_contact_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
                case 'hero':
                    $component['props'] = gmkb_enrich_hero_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
                case 'questions':
                    $component['props'] = gmkb_enrich_questions_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
                case 'guest-intro':
                    $component['props'] = gmkb_enrich_guest_intro_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
                    
                case 'topics-questions':
                    // Combined component needs both topics and questions data
                    $component['props'] = gmkb_enrich_topics_data($component['props'], $post_id);
                    $component['props'] = gmkb_enrich_questions_data($component['props'], $post_id);
                    $component['data'] = $component['props'];
                    break;
            }
            
            $component['props']['podsDataLoaded'] = true;
            $component['props']['enrichmentTimestamp'] = time();
        }
    }
    
    return $saved_state;
}

/**
 * Enrich topics component with Pods field data
 * PHASE 1: Single source of truth - Pods fields only
 * 
 * @param array $props Existing component props
 * @param int $post_id Post ID to load data from
 * @return array Enriched props with topics data
 */
function gmkb_enrich_topics_data($props, $post_id) {
    // Validate post ID
    if (!$post_id || $post_id <= 0) {
        return $props;
    }
    
    $topics = array();
    $topics_found = 0;
    
    // Load topics from Pods fields (topic_1 through topic_5)
    for ($i = 1; $i <= 5; $i++) {
        $field_key = "topic_{$i}";
        $topic_value = get_post_meta($post_id, $field_key, true);
        
        if (!empty($topic_value) && is_string($topic_value) && strlen(trim($topic_value)) > 0) {
            // Add to props as individual field
            $props[$field_key] = trim($topic_value);
            
            // Add to topics array for rendering
            $topics[] = array(
                'title' => trim($topic_value),
                'description' => '',
                'field_key' => $field_key,
                'index' => $i - 1
            );
            $topics_found++;
        }
    }
    
    // Add enriched data to props
    if (!empty($topics)) {
        $props['topics'] = $topics;
        $props['loaded_topics'] = $topics;
        $props['topics_count'] = $topics_found;
        $props['has_topics'] = true;
    } else {
        $props['topics'] = array();
        $props['loaded_topics'] = array();
        $props['topics_count'] = 0;
        $props['has_topics'] = false;
    }
    
    // Mark data source
    $props['data_source'] = 'pods_fields';
    $props['podsDataLoaded'] = true;
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log("GMKB Topics Enrichment: Loaded {$topics_found} topics from Pods fields for post {$post_id}");
    }
    
    return $props;
}

/**
 * Enrich biography component with Pods field data
 * SIMPLIFIED: Only loads biography text - other fields moved to separate components
 * 
 * @param array $props Existing component props
 * @param int $post_id Post ID to load data from
 * @return array Enriched props with biography data
 */
function gmkb_enrich_biography_data($props, $post_id) {
    // Validate post ID
    if (!$post_id || $post_id <= 0) {
        return $props;
    }
    
    // Try to load from Pods first
    if (function_exists('pods')) {
        try {
            $pod = pods('guests', $post_id);
            if ($pod && $pod->exists()) {
                // Helper to extract string value from Pods
                $extract_value = function($value) {
                    if (is_array($value)) {
                        if (isset($value[0])) return is_string($value[0]) ? $value[0] : '';
                        if (isset($value['name'])) return $value['name'];
                        if (isset($value['post_title'])) return $value['post_title'];
                        return '';
                    }
                    return is_string($value) ? $value : '';
                };
                
                // Load biography text only
                $bio = $extract_value($pod->field('biography'));
                
                if ($bio) {
                    $props['biography'] = $bio;
                    $props['bio'] = $bio;
                    $props['bio_content'] = $bio;
                    $props['content'] = $bio;
                    
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('[Biography Simplified] Loaded from Pods - Length: ' . strlen($bio));
                    }
                }
            }
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('[Biography Simplified] Pods error: ' . $e->getMessage());
            }
        }
    }
    
    // FALLBACK: Load from post meta if Pods didn't work
    if (empty($props['biography'])) {
        $biography = get_post_meta($post_id, 'biography', true);
        if (!empty($biography)) {
            $props['biography'] = $biography;
            $props['bio'] = $biography;
            $props['bio_content'] = $biography;
            $props['content'] = $biography;
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('[Biography Simplified] Loaded from post meta - Length: ' . strlen($biography));
            }
        }
    }
    
    // Mark data source
    $props['data_source'] = function_exists('pods') ? 'pods_api' : 'post_meta';
    $props['has_biography'] = !empty($props['biography']);
    
    return $props;
}

/**
 * Enrich contact component with Pods field data
 * 
 * @param array $props Existing component props
 * @param int $post_id Post ID to load data from
 * @return array Enriched props with contact data
 */
function gmkb_enrich_contact_data($props, $post_id) {
    // Validate post ID
    if (!$post_id || $post_id <= 0) {
        return $props;
    }
    
    $has_contact = false;
    
    // Load email
    $email = get_post_meta($post_id, 'email', true);
    if (!empty($email) && is_email($email)) {
        $props['email'] = sanitize_email($email);
        $has_contact = true;
    }
    
    // Load phone
    $phone = get_post_meta($post_id, 'phone', true);
    if (!empty($phone)) {
        $props['phone'] = sanitize_text_field($phone);
        $has_contact = true;
    }
    
    // Load website
    $website = get_post_meta($post_id, 'website', true);
    if (!empty($website)) {
        $props['website'] = esc_url_raw($website);
        $has_contact = true;
    }
    
    // Load address fields
    $address = get_post_meta($post_id, 'address', true);
    if (!empty($address)) {
        $props['address'] = sanitize_text_field($address);
        $has_contact = true;
    }
    
    // Load social media links
    $linkedin = get_post_meta($post_id, 'linkedin', true);
    if (!empty($linkedin)) {
        $props['linkedin'] = esc_url_raw($linkedin);
    }
    
    $twitter = get_post_meta($post_id, 'twitter', true);
    if (!empty($twitter)) {
        $props['twitter'] = esc_url_raw($twitter);
    }
    
    // Mark data source
    $props['data_source'] = 'pods_fields';
    $props['has_contact'] = $has_contact;
    
    return $props;
}

/**
 * Enrich hero component with Pods field data
 * 
 * @param array $props Existing component props
 * @param int $post_id Post ID to load data from
 * @return array Enriched props with hero data
 */
function gmkb_enrich_hero_data($props, $post_id) {
    // Validate post ID
    if (!$post_id || $post_id <= 0) {
        return $props;
    }
    
    // Load guest name
    $first_name = get_post_meta($post_id, 'first_name', true);
    $last_name = get_post_meta($post_id, 'last_name', true);
    
    if ($first_name || $last_name) {
        $full_name = trim($first_name . ' ' . $last_name);
        $props['full_name'] = $full_name;
        $props['title'] = $props['title'] ?? $full_name;
    }
    
    // Load guest title/profession
    $guest_title = get_post_meta($post_id, 'guest_title', true);
    if (!empty($guest_title)) {
        $props['guest_title'] = sanitize_text_field($guest_title);
        $props['subtitle'] = $props['subtitle'] ?? $guest_title;
    }
    
    // Load tagline
    $tagline = get_post_meta($post_id, 'tagline', true);
    if (!empty($tagline)) {
        $props['tagline'] = sanitize_text_field($tagline);
        $props['description'] = $props['description'] ?? $tagline;
    }
    
    // Load headshot
    $headshot = get_post_meta($post_id, 'guest_headshot', true);
    if (!empty($headshot)) {
        $props['headshot'] = $headshot;
        $props['image'] = $props['image'] ?? $headshot;
    }
    
    // Mark data source
    $props['data_source'] = 'pods_fields';
    
    return $props;
}

/**
 * Enrich questions component with Pods field data
 * 
 * @param array $props Existing component props
 * @param int $post_id Post ID to load data from
 * @return array Enriched props with questions data
 */
function gmkb_enrich_questions_data($props, $post_id) {
    // Validate post ID
    if (!$post_id || $post_id <= 0) {
        return $props;
    }
    
    $questions = array();
    $questions_found = 0;
    
    // Load questions from Pods fields (question_1 through question_10)
    for ($i = 1; $i <= 10; $i++) {
        $field_key = "question_{$i}";
        $question_value = get_post_meta($post_id, $field_key, true);
        
        if (!empty($question_value) && is_string($question_value) && strlen(trim($question_value)) > 0) {
            // Add to props as individual field
            $props[$field_key] = trim($question_value);
            
            // Add to questions array for rendering
            $questions[] = array(
                'question' => trim($question_value),
                'field_key' => $field_key,
                'index' => $i - 1
            );
            $questions_found++;
        }
    }
    
    // Add enriched data to props
    if (!empty($questions)) {
        $props['questions'] = $questions;
        $props['loaded_questions'] = $questions;
        $props['questions_count'] = $questions_found;
        $props['has_questions'] = true;
    } else {
        $props['questions'] = array();
        $props['loaded_questions'] = array();
        $props['questions_count'] = 0;
        $props['has_questions'] = false;
    }
    
    // Mark data source
    $props['data_source'] = 'pods_fields';
    
    return $props;
}

/**
 * Enrich guest intro component with Pods field data
 * 
 * @param array $props Existing component props
 * @param int $post_id Post ID to load data from
 * @return array Enriched props with guest intro data
 */
function gmkb_enrich_guest_intro_data($props, $post_id) {
    // Validate post ID
    if (!$post_id || $post_id <= 0) {
        return $props;
    }
    
    // Load introduction text
    $introduction = get_post_meta($post_id, 'introduction', true);
    if (!empty($introduction)) {
        $props['introduction'] = $introduction;
        $props['content'] = $introduction;
    }
    
    // Load guest credentials
    $credentials = get_post_meta($post_id, 'credentials', true);
    if (!empty($credentials)) {
        $props['credentials'] = $credentials;
    }
    
    // Load achievements
    $achievements = get_post_meta($post_id, 'achievements', true);
    if (!empty($achievements)) {
        $props['achievements'] = $achievements;
    }
    
    // Mark data source
    $props['data_source'] = 'pods_fields';
    $props['has_intro'] = !empty($introduction) || !empty($credentials) || !empty($achievements);
    
    return $props;
}

// Also hook into AJAX load to ensure enrichment happens
add_action('wp_ajax_gmkb_load_media_kit', 'gmkb_enrich_ajax_response', 5);
add_action('wp_ajax_nopriv_gmkb_load_media_kit', 'gmkb_enrich_ajax_response', 5);

function gmkb_enrich_ajax_response() {
    // This runs before the main AJAX handler to ensure filter is registered
    // The actual enrichment happens via the filter above
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('GMKB Enrichment: AJAX load filter registered');
    }
}