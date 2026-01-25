<?php
/**
 * Component Data Sanitization Before Save
 *
 * UPDATED (2025-01-24): Pods enrichment has been deprecated. JSON state is now
 * the single source of truth. This file NO LONGER strips content fields.
 *
 * Current behavior:
 * - Decodes HTML entities to prevent accumulation
 * - Removes internal metadata fields only (_dataSource, podsDataLoaded, etc.)
 * - PRESERVES all user content fields (biography, introduction, topics, etc.)
 *
 * Previous (deprecated) strategy that caused DATA LOSS:
 * - On LOAD: Enrich components with Pods data (temporary, in-memory only)
 * - On SAVE: Strip Pods data, save only component structure + user edits
 * - On DISPLAY: Always load fresh from Pods
 *
 * @package Guestify/MediaKit
 * @version 2.3.0
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

/**
 * Remove Pods data from components before saving to database
 *
 * DEPRECATED (2025-01-24): This function previously stripped "Pods fields" from
 * component data to prevent database bloat, assuming they would be re-enriched
 * from Pods on load. However, Pods enrichment has been DISABLED (see REST API v2)
 * and JSON state is now the single source of truth.
 *
 * Stripping content fields (biography, introduction, etc.) now causes DATA LOSS
 * because the data is never re-enriched.
 *
 * This function now only:
 * - Decodes HTML entities to prevent accumulation
 * - Removes metadata fields (_dataSource, podsDataLoaded, enrichmentTimestamp)
 * - Does NOT strip content fields anymore
 *
 * @param array $state The media kit state about to be saved
 * @param int $post_id The post ID being saved to
 * @return array Cleaned state (content fields preserved)
 */
function gmkb_sanitize_components_before_save($state, $post_id) {
    // Clean components in main components object
    if (isset($state['components']) && is_array($state['components'])) {
        foreach ($state['components'] as $comp_id => &$component) {
            if (!is_array($component) || empty($component['type'])) {
                continue;
            }

            // Decode HTML entities BEFORE saving to prevent accumulation
            gmkb_decode_html_entities_recursive($component);

            // DEPRECATED: No longer strip content fields - JSON state is single source of truth
            // Only clean metadata fields now
            gmkb_clean_component_metadata_only($component);
        }
        unset($component); // Clear reference
    }

    // Also clean saved_components array if it exists (legacy)
    if (isset($state['saved_components']) && is_array($state['saved_components'])) {
        foreach ($state['saved_components'] as &$component) {
            if (!is_array($component) || empty($component['type'])) {
                continue;
            }

            // DEPRECATED: No longer strip content fields
            gmkb_clean_component_metadata_only($component);
        }
        unset($component); // Clear reference
    }

    return $state;
}

/**
 * Clean only metadata fields from a component (NOT content fields)
 *
 * IMPORTANT: This is the safe version that preserves user content.
 * Only removes internal tracking metadata.
 *
 * @param array $component Component data (passed by reference)
 * @return void
 */
function gmkb_clean_component_metadata_only(&$component) {
    // Metadata fields to remove (internal tracking only, NOT content)
    $metadata_fields = array(
        '_dataSource',
        'data_source',
        'podsDataLoaded',
        'enrichmentTimestamp',
        '_prePopulated',  // Internal Vue flag
    );

    // Clean data object - metadata only
    if (isset($component['data']) && is_array($component['data'])) {
        foreach ($metadata_fields as $field) {
            if (isset($component['data'][$field])) {
                unset($component['data'][$field]);
            }
        }
    }

    // Clean props object - metadata only
    if (isset($component['props']) && is_array($component['props'])) {
        foreach ($metadata_fields as $field) {
            if (isset($component['props'][$field])) {
                unset($component['props'][$field]);
            }
        }
    }

    // Remove root-level metadata
    unset($component['_usesPods']);
    unset($component['_podsType']);
}

/**
 * DEPRECATED: Clean Pods data from a single component
 *
 * @deprecated 2.3.0 Use gmkb_clean_component_metadata_only() instead.
 *             This function stripped content fields which caused data loss
 *             after Pods enrichment was disabled.
 *
 * @param array $component Component data (passed by reference)
 * @return bool True if data was cleaned
 */
function gmkb_clean_component_pods_data(&$component) {
    // DEPRECATED: Now just calls the safe metadata-only cleaner
    // Content fields are no longer stripped to prevent data loss
    gmkb_clean_component_metadata_only($component);
    return false;
}

/**
 * Recursively decode HTML entities in all string values
 * This prevents the accumulation of HTML encoding over multiple save/load cycles
 * Critical for font-family values which get encoded as &amp; -> &amp;amp; -> &amp;amp;amp; etc.
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
            }
        } elseif (is_array($value)) {
            // Recursively decode nested arrays
            gmkb_decode_html_entities_recursive($value);
        }
    }
    unset($value); // Clear reference
}

/**
 * DEPRECATED: Get list of Pods fields to remove for each component type
 *
 * @deprecated 2.3.0 This function is no longer used. Content fields should NOT be stripped
 *             as JSON state is now the single source of truth.
 *
 * @param string $type Component type
 * @return array Empty array - content fields are no longer stripped
 */
function gmkb_get_pods_fields_by_component_type($type) {
    // DEPRECATED: Return empty array to prevent data loss
    // Content fields (biography, introduction, etc.) must be preserved
    // since Pods enrichment has been disabled.
    return array();

    // --- ORIGINAL CODE BELOW (kept for reference) ---
    /*
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
    */
}

/**
 * DEPRECATED: Add marker to new components when they're created
 *
 * @deprecated 2.3.0 Pods enrichment has been disabled. This filter is now a no-op.
 */
add_filter('gmkb_prepare_new_component', 'gmkb_mark_component_uses_pods', 10, 2);

function gmkb_mark_component_uses_pods($component, $type) {
    // DEPRECATED: Pods enrichment has been disabled
    // JSON state is now the single source of truth
    // No need to mark components for Pods enrichment
    return $component;
}
