<?php
/**
 * ARCHIVED: PHP Component Rendering Methods
 * 
 * These methods were removed in Option A: Remove PHP Rendering
 * Date Archived: 2025-01-30
 * Reason: Replaced by Vue.js client-side rendering + REST API v2
 * 
 * REPLACEMENT ARCHITECTURE:
 * - Component data: GET /gmkb/v2/mediakit/{id} (REST API v2)
 * - Component rendering: Vue.js components (client-side)
 * - Design panels: Vue.js design panel components (client-side)
 * 
 * DO NOT USE THESE METHODS - THEY ARE DEPRECATED AND NON-FUNCTIONAL
 */

/**
 * @deprecated 2.1.0 Use REST API v2 + Vue rendering instead
 * @see class-gmkb-rest-api-v2.php
 */
public function ajax_render_component_ARCHIVED() {
    // Method body removed - see git history if needed
    // This was a 500+ line method that rendered components server-side
    // Replaced by: Vue components load data via REST API and render client-side
    wp_send_json_error([
        'message' => 'This endpoint is deprecated. Use Vue.js client-side rendering.',
        'deprecated' => true,
        'replacement' => 'GET /gmkb/v2/mediakit/{id}'
    ], 410); // 410 Gone
}

/**
 * @deprecated 2.1.0 Use REST API v2 + Vue rendering instead
 * @see class-gmkb-rest-api-v2.php
 */
public function ajax_render_component_enhanced_ARCHIVED() {
    // Method body removed - see git history if needed
    wp_send_json_error([
        'message' => 'This endpoint is deprecated. Use Vue.js client-side rendering.',
        'deprecated' => true,
        'replacement' => 'GET /gmkb/v2/mediakit/{id}'
    ], 410); // 410 Gone
}

/**
 * @deprecated 2.1.0 Use Vue design panel components instead
 */
public function ajax_render_design_panel_ARCHIVED() {
    // Method body removed - see git history if needed  
    wp_send_json_error([
        'message' => 'This endpoint is deprecated. Use Vue.js design panel components.',
        'deprecated' => true,
        'replacement' => 'Vue design panels in src/vue/components/'
    ], 410); // 410 Gone
}

/**
 * Helper method for topics rendering - ARCHIVED
 * @deprecated 2.1.0
 */
private function render_topics_component_enhanced_ARCHIVED($props) {
    // Method body removed - see git history if needed
    wp_send_json_error([
        'message' => 'Topics rendering is now handled by Vue.js',
        'deprecated' => true
    ], 410);
}

/**
 * Helper method for component scripts - ARCHIVED  
 * @deprecated 2.1.0
 */
private function get_component_scripts_ARCHIVED($component_type, $props) {
    // Method body removed - Vue handles all script loading
    return [];
}

/**
 * Helper method for generic design panel - ARCHIVED
 * @deprecated 2.1.0
 */
private function get_generic_design_panel_ARCHIVED($component_slug) {
    // Method body removed - Vue design panels handle all UI
    return '';
}
