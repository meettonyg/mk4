<?php
/**
 * Debug REST Endpoint for Media Kit Data
 * 
 * Temporary diagnostic tool to inspect media kit state structure
 * Access via: /wp-json/gmkb/v1/debug/{post_id}
 * 
 * ROOT CAUSE INVESTIGATION TOOL
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function() {
    register_rest_route('gmkb/v1', '/debug/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'gmkb_debug_mediakit_data',
        'permission_callback' => function() {
            return current_user_can('edit_posts'); // Only logged in users with edit permission
        },
        'args' => array(
            'id' => array(
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            )
        )
    ));
});

function gmkb_debug_mediakit_data($request) {
    $post_id = (int) $request['id'];
    
    // Get post
    $post = get_post($post_id);
    if (!$post) {
        return new WP_Error('not_found', 'Post not found', array('status' => 404));
    }
    
    // Get media kit state
    $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
    
    if (empty($state)) {
        return array(
            'post_id' => $post_id,
            'post_type' => $post->post_type,
            'has_state' => false,
            'message' => 'No media kit state found'
        );
    }
    
    // Analyze structure
    $analysis = array(
        'post_id' => $post_id,
        'post_type' => $post->post_type,
        'post_title' => $post->post_title,
        'has_state' => true,
        'structure' => array(
            'has_sections' => !empty($state['sections']),
            'section_count' => is_array($state['sections']) ? count($state['sections']) : 0,
            'has_components' => !empty($state['components']),
            'component_count' => is_array($state['components']) ? count($state['components']) : 0,
            'has_saved_components' => !empty($state['saved_components']),
            'saved_component_count' => is_array($state['saved_components']) ? count($state['saved_components']) : 0,
            'has_layout' => !empty($state['layout']),
            'layout_count' => is_array($state['layout']) ? count($state['layout']) : 0
        ),
        'sections' => array(),
        'components' => array(),
        'raw_state' => $state // Full state for inspection
    );
    
    // Analyze sections
    if (!empty($state['sections'])) {
        foreach ($state['sections'] as $idx => $section) {
            $analysis['sections'][] = array(
                'index' => $idx,
                'section_id' => $section['section_id'] ?? 'no-id',
                'section_type' => $section['section_type'] ?? 'no-type',
                'layout_type' => $section['layout'] ?? 'no-layout',
                'component_refs' => $section['components'] ?? array(),
                'component_ref_count' => is_array($section['components']) ? count($section['components']) : 0
            );
        }
    }
    
    // Analyze components
    if (!empty($state['components'])) {
        foreach ($state['components'] as $id => $component) {
            $analysis['components'][] = array(
                'id' => $id,
                'type' => $component['type'] ?? 'no-type',
                'has_props' => !empty($component['props']),
                'has_settings' => !empty($component['settings']),
                'has_data' => !empty($component['data']),
                'props' => $component['props'] ?? null,
                'settings' => $component['settings'] ?? null,
                'data' => $component['data'] ?? null,
                'section_id' => $component['sectionId'] ?? 'no-section'
            );
        }
    }
    
    return rest_ensure_response($analysis);
}
