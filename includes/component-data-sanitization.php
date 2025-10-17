<?php
/**
 * Component Data Sanitization Before Save
 * 
 * PREVENTS DATABASE BLOAT by removing Pods data before saving
 * 
 * Strategy:
 * - On LOAD: Enrich components with Pods data (temporary, in-memory only)
 * - On SAVE: Strip Pods data, save only component structure + user edits
 * - On DISPLAY: Always load fresh from Pods
 * 
 * @package Guestify/MediaKit
 * @version 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Hook into media kit save to clean Pods data before storage
 * Priority 5 ensures this runs BEFORE the actual save
 */
add_filter('gmkb_before_save_media_kit_state', 'gmkb_sanitize_components_before_save', 5, 2);

// ROOT FIX: Log that the filter is registered
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ GMKB SANITIZATION: Filter gmkb_before_save_media_kit_state registered with priority 5');
    error_log('✅ GMKB SANITIZATION: Target function: gmkb_sanitize_components_before_save');
}

/**
 * Remove Pods data from components before saving to database
 * 
 * This prevents database bloat by keeping only:
 * - Component structure (id, type)
 * - User customizations (props that differ from Pods)
 * - Component settings
 * 
 * Pods data will be re-loaded dynamically on each page load
 * 
 * @param array $state The media kit state about to be saved
 * @param int $post_id The post ID being saved to
 * @return array Cleaned state with Pods data removed
 */
function gmkb_sanitize_components_before_save($state, $post_id) {
    // CRITICAL DEBUG: Log that filter was triggered
    error_log('================================');
    error_log('🚨 GMKB SANITIZATION FILTER TRIGGERED!');
    error_log('Post ID: ' . $post_id);
    error_log('State type: ' . gettype($state));
    error_log('State keys: ' . (is_array($state) ? implode(', ', array_keys($state)) : 'N/A'));
    error_log('Components count: ' . (isset($state['components']) ? count($state['components']) : 0));
    error_log('================================');
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('🧹 GMKB: Sanitizing components before save (removing Pods bloat + decoding HTML entities)');
    }
    
    $total_cleaned = 0;
    $size_before = strlen(serialize($state));
    
    // Clean components in main components object
    if (isset($state['components']) && is_array($state['components'])) {
        foreach ($state['components'] as $comp_id => &$component) {
            if (!is_array($component) || empty($component['type'])) {
                continue;
            }
            
            // ROOT FIX: Decode HTML entities BEFORE saving to prevent accumulation
            gmkb_decode_html_entities_recursive($component);
            
            $cleaned = gmkb_clean_component_pods_data($component);
            if ($cleaned) {
                $total_cleaned++;
            }
        }
        unset($component); // Clear reference
    }
    
    // Also clean saved_components array if it exists (legacy)
    if (isset($state['saved_components']) && is_array($state['saved_components'])) {
        foreach ($state['saved_components'] as &$component) {
            if (!is_array($component) || empty($component['type'])) {
                continue;
            }
            
            $cleaned = gmkb_clean_component_pods_data($component);
            if ($cleaned) {
                $total_cleaned++;
            }
        }
        unset($component); // Clear reference
    }
    
    $size_after = strlen(serialize($state));
    $size_saved = $size_before - $size_after;
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log("✅ GMKB: Cleaned {$total_cleaned} components");
        error_log("📊 GMKB: Saved " . size_format($size_saved) . " by removing Pods bloat");
        error_log("📊 GMKB: Size: " . size_format($size_before) . " → " . size_format($size_after));
    }
    
    return $state;
}

/**
 * Clean Pods data from a single component
 * 
 * @param array $component Component data (passed by reference)
 * @return bool True if data was cleaned
 */
function gmkb_clean_component_pods_data(&$component) {
    $cleaned = false;
    $type = $component['type'] ?? 'unknown';
    
    // Fields to remove based on component type
    $pods_fields_to_remove = gmkb_get_pods_fields_by_component_type($type);
    
    if (empty($pods_fields_to_remove)) {
        return false; // No Pods fields for this component type
    }
    
    // Clean data object
    if (isset($component['data']) && is_array($component['data'])) {
        foreach ($pods_fields_to_remove as $field) {
            if (isset($component['data'][$field])) {
                unset($component['data'][$field]);
                $cleaned = true;
            }
        }
        
        // Also remove meta fields
        if (isset($component['data']['_dataSource'])) {
            unset($component['data']['_dataSource']);
        }
        if (isset($component['data']['data_source'])) {
            unset($component['data']['data_source']);
        }
        if (isset($component['data']['podsDataLoaded'])) {
            unset($component['data']['podsDataLoaded']);
        }
        if (isset($component['data']['enrichmentTimestamp'])) {
            unset($component['data']['enrichmentTimestamp']);
        }
    }
    
    // Clean props object (same fields)
    if (isset($component['props']) && is_array($component['props'])) {
        foreach ($pods_fields_to_remove as $field) {
            if (isset($component['props'][$field])) {
                unset($component['props'][$field]);
                $cleaned = true;
            }
        }
        
        // Remove meta fields from props too
        if (isset($component['props']['data_source'])) {
            unset($component['props']['data_source']);
        }
        if (isset($component['props']['podsDataLoaded'])) {
            unset($component['props']['podsDataLoaded']);
        }
        if (isset($component['props']['enrichmentTimestamp'])) {
            unset($component['props']['enrichmentTimestamp']);
        }
    }
    
    // Add marker that this component uses Pods
    // This tells the system to re-enrich on load
    $component['_usesPods'] = true;
    $component['_podsType'] = $type;
    
    return $cleaned;
}

/**
 * ROOT FIX: Recursively decode HTML entities in all string values
 * This prevents the accumulation of HTML encoding over multiple save/load cycles
 * Critical for font-family values which get encoded as &amp; → &amp;amp; → &amp;amp;amp; etc.
 * 
 * @param array $data Data array to decode (passed by reference)
 * @return void
 */
function gmkb_decode_html_entities_recursive(&$data) {
    if (!is_array($data)) {
        return;
    }
    
    foreach ($data as $key => &$value) {
        if (is_string($value)) {
            // Decode repeatedly until no more entities exist
            // This handles cases where values have been encoded multiple times
            $decoded = $value;
            $previous = '';
            $iterations = 0;
            $max_iterations = 10; // Safety limit
            
            while ($decoded !== $previous && $iterations < $max_iterations) {
                $previous = $decoded;
                $decoded = html_entity_decode($decoded, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $iterations++;
            }
            
            // Only update if decoding changed the value
            if ($decoded !== $value) {
                $value = $decoded;
                
                if (defined('WP_DEBUG') && WP_DEBUG && $iterations > 1) {
                    error_log("🔧 GMKB DECODE: Decoded '{$key}' {$iterations} times: {$value}");
                }
            }
        } elseif (is_array($value)) {
            // Recursively decode nested arrays
            gmkb_decode_html_entities_recursive($value);
        }
    }
    unset($value); // Clear reference
}

/**
 * Get list of Pods fields to remove for each component type
 * 
 * @param string $type Component type
 * @return array List of field names to remove
 */
function gmkb_get_pods_fields_by_component_type($type) {
    $pods_fields_map = array(
        'biography' => array(
            'biography',
            'full_biography',
            'content',
            'biography_short',
            'excerpt',
            'professional_bio',
            'has_biography',
            'name',
            'first_name',
            'last_name',
            'full_name'
        ),
        'hero' => array(
            'title',
            'subtitle',
            'description',
            'tagline',
            'full_name',
            'first_name',
            'last_name',
            'guest_title',
            'headshot',
            'image'
        ),
        'topics' => array(
            'topics',
            'loaded_topics',
            'topics_count',
            'has_topics',
            'topic_1',
            'topic_2',
            'topic_3',
            'topic_4',
            'topic_5'
        ),
        'questions' => array(
            'questions',
            'loaded_questions',
            'questions_count',
            'has_questions',
            'question_1',
            'question_2',
            'question_3',
            'question_4',
            'question_5',
            'question_6',
            'question_7',
            'question_8',
            'question_9',
            'question_10'
        ),
        'contact' => array(
            'email',
            'phone',
            'website',
            'address',
            'linkedin',
            'twitter',
            'has_contact'
        ),
        'guest-intro' => array(
            'introduction',
            'content',
            'credentials',
            'achievements',
            'has_intro',
            'full_name',
            'name'
        ),
        'social' => array(
            'facebook',
            'twitter',
            'instagram',
            'linkedin',
            'youtube',
            'tiktok',
            'website'
        )
    );
    
    return $pods_fields_map[$type] ?? array();
}

/**
 * Also add marker to new components when they're created
 * This ensures they get enriched even if never saved before
 */
add_filter('gmkb_prepare_new_component', 'gmkb_mark_component_uses_pods', 10, 2);

function gmkb_mark_component_uses_pods($component, $type) {
    // Check if this component type uses Pods data
    $pods_fields = gmkb_get_pods_fields_by_component_type($type);
    
    if (!empty($pods_fields)) {
        $component['_usesPods'] = true;
        $component['_podsType'] = $type;
    }
    
    return $component;
}
