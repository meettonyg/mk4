<?php
/**
 * Media Kit API Handler
 *
 * This version has been refactored to use the traditional WordPress admin-ajax.php
 * endpoint for core data operations (load/save) to ensure maximum compatibility
 * with various hosting environments and security configurations. The REST API is
 * now only used for secondary features like theme management.
 *
 * @package GMKB
 * @since 4.0.0
 */

namespace GMKB;

if (!defined('ABSPATH')) {
    exit;
}

class MediaKitAPI {
    
    /**
     * Initialize the API handlers.
     * Hooks into WordPress AJAX actions for primary data handling and the REST API for themes.
     */
    public function __construct() {
        // Core data operations via admin-ajax.php for reliability
        add_action('wp_ajax_gmkb_load_media_kit_vue', array($this, 'ajax_get_mediakit'));
        add_action('wp_ajax_gmkb_save_media_kit_vue', array($this, 'ajax_save_mediakit'));
        
        // Import/Export operations via admin-ajax.php
        add_action('wp_ajax_gmkb_export_media_kit', array($this, 'ajax_export_mediakit'));
        add_action('wp_ajax_gmkb_import_media_kit', array($this, 'ajax_import_mediakit'));
        add_action('wp_ajax_gmkb_validate_import', array($this, 'ajax_validate_import'));

        // Secondary features like theme management can still use the REST API
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }

    /**
     * AJAX handler for loading all media kit data.
     * This is the primary data source for the Vue application.
     */
    public function ajax_get_mediakit() {
        // Security: Verify the AJAX nonce sent from the frontend.
        if (!check_ajax_referer('gmkb_nonce', 'nonce', false)) {
            wp_send_json_error(array('message' => 'Invalid security token. Please refresh the page.'), 403);
            return;
        }

        // Input validation.
        if (!isset($_POST['post_id']) || !is_numeric($_POST['post_id'])) {
            wp_send_json_error(array('message' => 'Missing or invalid Post ID.'), 400);
            return;
        }

        $post_id = intval($_POST['post_id']);

        // Permission check: Ensure the current user has rights to edit this post.
        if (!current_user_can('edit_post', $post_id)) {
             wp_send_json_error(array('message' => 'You do not have permission to access this media kit.'), 403);
             return;
        }

        // Get the data using our shared helper function.
        $response_data = $this->get_mediakit_data($post_id);

        if (is_wp_error($response_data)) {
            wp_send_json_error(array('message' => $response_data->get_error_message()), 404);
        } else {
            wp_send_json_success($response_data);
        }
    }

    /**
     * AJAX handler for saving the media kit state.
     */
    public function ajax_save_mediakit() {
        // Security: Verify the AJAX nonce.
        if (!check_ajax_referer('gmkb_nonce', 'nonce', false)) {
            wp_send_json_error(array('message' => 'Your session has expired. Please refresh the page to continue saving.'), 403);
            return;
        }

        // Input validation.
        if (!isset($_POST['post_id']) || !is_numeric($_POST['post_id'])) {
            wp_send_json_error(array('message' => 'Missing or invalid Post ID.'), 400);
            return;
        }

        $post_id = intval($_POST['post_id']);

        // Permission check.
        if (!current_user_can('edit_post', $post_id)) {
             wp_send_json_error(array('message' => 'You do not have permission to save this media kit.'), 403);
             return;
        }

        if (!isset($_POST['state'])) {
            wp_send_json_error(array('message' => 'Missing state data.'), 400);
            return;
        }

        // Process and save the data.
        $state_json = stripslashes($_POST['state']);
        $data = json_decode($state_json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error(array('message' => 'Invalid state data format.'), 400);
            return;
        }
        
        $result = $this->save_mediakit_data($post_id, $data);

        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()), 500);
        } else {
            wp_send_json_success($result);
        }
    }

    /**
     * Helper function to fetch all data for a media kit.
     *
     * @param int $post_id The ID of the post.
     * @return array|\WP_Error The complete data array or a WP_Error on failure.
     */
    private function get_mediakit_data($post_id) {
        $post = get_post($post_id);
        if (!$post) {
            return new \WP_Error('post_not_found', 'Post not found', array('status' => 404));
        }
        
        $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        if (empty($media_kit_state) || !is_array($media_kit_state)) {
            $media_kit_state = array(
                'components' => new \stdClass(),
                'layout' => array(),
                'sections' => array(),
                'theme' => 'professional_clean',
                'themeSettings' => new \stdClass(),
                'themeCustomizations' => new \stdClass(),
                'globalSettings' => new \stdClass(),
            );
        }

        $pods_data = $this->fetch_all_pods_data($post_id);
        
        // ROOT FIX: Load theme customizations from separate post meta if not in state
        // This ensures backwards compatibility with existing media kits
        $theme_customizations = $media_kit_state['themeCustomizations'] ?? new \stdClass();
        if (empty((array)$theme_customizations)) {
            $saved_customizations = get_post_meta($post_id, 'gmkb_theme_customizations', true);
            if (!empty($saved_customizations) && is_array($saved_customizations)) {
                $theme_customizations = $saved_customizations;
            }
        }
        
        return array(
            'version' => '1.0-ajax',
            'postId' => $post_id,
            'postType' => $post->post_type,
            'components' => $media_kit_state['components'] ?? new \stdClass(),
            'layout' => $media_kit_state['layout'] ?? $media_kit_state['sections'] ?? array(), // Handle legacy 'sections' as layout
            'sections' => $media_kit_state['sections'] ?? $media_kit_state['layout'] ?? array(), // Handle legacy 'layout' as sections
            'theme' => $media_kit_state['theme'] ?? 'professional_clean',
            'themeSettings' => $media_kit_state['themeSettings'] ?? new \stdClass(),
            'themeCustomizations' => $theme_customizations,
            'globalSettings' => $media_kit_state['globalSettings'] ?? new \stdClass(),
            'podsData' => $pods_data,
            'timestamp' => current_time('mysql')
        );
    }

    /**
     * Helper function to save the media kit state.
     *
     * @param int $post_id The ID of the post.
     * @param array $data The state data from the frontend.
     * @return array|\WP_Error Success array or a WP_Error on failure.
     */
    private function save_mediakit_data($post_id, $data) {
        if (!isset($data['components']) || !isset($data['layout'])) {
            return new \WP_Error('missing_data', 'Incomplete state data: components and layout are required.', array('status' => 400));
        }

        // ROOT FIX: Sanitize font families to prevent HTML encoding on every save
        $data = $this->sanitize_font_families($data);

        $state = array(
            'components' => $data['components'] ?? new \stdClass(),
            'layout' => $data['layout'] ?? array(),
            'sections' => $data['layout'] ?? array(), // Ensure sections and layout are synced.
            'theme' => $data['theme'] ?? 'professional_clean',
            'themeSettings' => $data['themeSettings'] ?? new \stdClass(),
            'themeCustomizations' => $data['themeCustomizations'] ?? new \stdClass(), // ROOT FIX: Store customizations in state too
            'globalSettings' => $data['globalSettings'] ?? new \stdClass(),
            'timestamp' => current_time('mysql')
        );

        $updated = update_post_meta($post_id, 'gmkb_media_kit_state', $state);
        
        if ($updated === false) {
            return new \WP_Error('save_failed', 'Failed to write media kit state to the database.', array('status' => 500));
        }

        // ROOT FIX: Save theme customizations as separate post meta for frontend display
        // Frontend class-gmkb-frontend-display.php looks for 'gmkb_theme_customizations'
        // This allows theme customizations to persist from customizer to preview to frontend
        $theme_customizations = $data['themeCustomizations'] ?? array();
        if (!empty($theme_customizations)) {
            // Convert from Vue format (colors: {primary: '#xxx'}) to PHP format expected by frontend
            $customizations_for_frontend = array();
            
            // Process colors
            if (!empty($theme_customizations['colors']) && is_array($theme_customizations['colors'])) {
                $customizations_for_frontend['colors'] = $theme_customizations['colors'];
            }
            
            // Process typography
            if (!empty($theme_customizations['typography']) && is_array($theme_customizations['typography'])) {
                $customizations_for_frontend['typography'] = array();
                foreach ($theme_customizations['typography'] as $key => $value) {
                    // Map camelCase to snake_case for PHP convention
                    if ($key === 'fontFamily') {
                        $customizations_for_frontend['typography']['fontFamily'] = $value;
                    } elseif ($key === 'headingFamily') {
                        $customizations_for_frontend['typography']['headingFont'] = $value;
                    } elseif ($key === 'baseFontSize') {
                        $customizations_for_frontend['typography']['fontSize'] = $value;
                    } elseif ($key === 'lineHeight') {
                        $customizations_for_frontend['typography']['lineHeight'] = $value;
                    } else {
                        $customizations_for_frontend['typography'][$key] = $value;
                    }
                }
            }
            
            // Process spacing
            if (!empty($theme_customizations['spacing']) && is_array($theme_customizations['spacing'])) {
                $customizations_for_frontend['spacing'] = array();
                foreach ($theme_customizations['spacing'] as $key => $value) {
                    // Map camelCase to snake_case for PHP convention
                    if ($key === 'componentGap') {
                        $customizations_for_frontend['spacing']['componentGap'] = $value;
                    } elseif ($key === 'sectionPadding') {
                        $customizations_for_frontend['spacing']['sectionGap'] = $value;
                    } elseif ($key === 'containerMaxWidth') {
                        $customizations_for_frontend['spacing']['containerPadding'] = $value;
                    } else {
                        $customizations_for_frontend['spacing'][$key] = $value;
                    }
                }
            }
            
            // Process effects
            if (!empty($theme_customizations['effects']) && is_array($theme_customizations['effects'])) {
                $customizations_for_frontend['effects'] = $theme_customizations['effects'];
            }
            
            update_post_meta($post_id, 'gmkb_theme_customizations', $customizations_for_frontend);
        } else {
            // Clear customizations if empty
            delete_post_meta($post_id, 'gmkb_theme_customizations');
        }

        return array(
            'success' => true,
            'timestamp' => $state['timestamp'],
            'message' => 'Media kit saved successfully.'
        );
    }

    /**
     * Sanitize font families in data to prevent HTML encoding
     * This is a self-healing function that cleans data on every save
     * 
     * @param array $data The media kit data
     * @return array Sanitized data
     */
    private function sanitize_font_families($data) {
        // Sanitize components
        if (isset($data['components']) && is_array($data['components'])) {
            foreach ($data['components'] as $component_id => $component) {
                if (isset($component['settings']['style']['typography']['fontFamily'])) {
                    $data['components'][$component_id]['settings']['style']['typography']['fontFamily'] = 
                        $this->clean_font_family($component['settings']['style']['typography']['fontFamily']);
                }
            }
        }

        // Sanitize sections
        if (isset($data['layout']) && is_array($data['layout'])) {
            foreach ($data['layout'] as $section_id => $section) {
                if (isset($section['settings']['style']['typography']['fontFamily'])) {
                    $data['layout'][$section_id]['settings']['style']['typography']['fontFamily'] = 
                        $this->clean_font_family($section['settings']['style']['typography']['fontFamily']);
                }
            }
        }

        return $data;
    }

    /**
     * Clean a font family string by removing HTML encoding and quotes
     * 
     * @param string $fontFamily The font family value
     * @return string Cleaned font family
     */
    private function clean_font_family($fontFamily) {
        if (empty($fontFamily) || !is_string($fontFamily)) {
            return 'inherit';
        }

        // Recursively decode HTML entities (handles cascaded encoding)
        $decoded = $fontFamily;
        $previous = '';
        $iterations = 0;
        $max_iterations = 10;
        
        while ($decoded !== $previous && $iterations < $max_iterations) {
            $previous = $decoded;
            $decoded = html_entity_decode($decoded, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $iterations++;
        }

        // Remove all quotes (single and double)
        // Quotes will be added back by CSS generation in ComponentStyleService
        $cleaned = preg_replace('/[\'"]/', '', $decoded);

        // Trim whitespace
        $cleaned = trim($cleaned);

        return $cleaned;
    }
    
    /**
     * Fetch all relevant Pods data for a post in a single efficient operation.
     *
     * @param int $post_id The ID of the post.
     * @return array The fetched data.
     */
    private function fetch_all_pods_data($post_id) {
        $data = array();
        
        $fields = array(
            'biography', 'biography_short', 'first_name', 'last_name', 
            'guest_title', 'tagline', 'email', 'phone', 'website', 'guest_headshot'
        );
        
        for ($i = 1; $i <= 5; $i++) { $fields[] = "topic_{$i}"; }
        for ($i = 1; $i <= 10; $i++) { $fields[] = "question_{$i}"; }
        
        foreach ($fields as $field) {
            $value = get_post_meta($post_id, $field, true);
            if (!empty($value)) {
                $data[$field] = $value;
            }
        }
        
        if (empty($data['biography']) && function_exists('pods')) {
            try {
                $pod = pods('mkcg', $post_id);
                if ($pod && $pod->exists()) {
                    foreach ($fields as $field) {
                        if (empty($data[$field])) { // Only fill if not already set by get_post_meta
                            $value = $pod->field($field);
                            if (!empty($value)) {
                                $data[$field] = $value;
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB Pods API Error: ' . $e->getMessage());
                }
            }
        }
        
        return $data;
    }
    
    /**
     * Register REST API routes for non-essential features like themes.
     */
    public function register_rest_routes() {
        $namespace = 'gmkb/v1';
        
        register_rest_route($namespace, '/themes/custom', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_custom_themes'),
            'permission_callback' => array($this, 'check_themes_permission')
        ));
        
        register_rest_route($namespace, '/themes/custom', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_custom_theme'),
            'permission_callback' => array($this, 'check_themes_permission')
        ));
    }
    
    /**
     * Get custom themes from the database via REST API.
     */
    public function get_custom_themes($request) {
        if (!is_user_logged_in()) {
            return rest_ensure_response(array(
                'themes' => array(),
                'message' => 'Login required for custom themes'
            ));
        }
        
        $custom_themes = get_option('gmkb_custom_themes', array());
        
        return rest_ensure_response(array(
            'themes' => is_array($custom_themes) ? array_values($custom_themes) : array(),
        ));
    }
    
    /**
     * Save a custom theme to the database via REST API.
     */
    public function save_custom_theme($request) {
        $theme = $request->get_json_params();
        
        if (!$theme || !isset($theme['id']) || !isset($theme['colors'])) {
            return new \WP_Error('invalid_theme', 'Invalid theme data.', array('status' => 400));
        }
        
        $custom_themes = get_option('gmkb_custom_themes', array());
        if (!is_array($custom_themes)) {
            $custom_themes = array();
        }
        
        $custom_themes[$theme['id']] = $theme;
        update_option('gmkb_custom_themes', $custom_themes);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Theme saved successfully.',
            'theme' => $theme
        ));
    }
    
    /**
     * Permission check for the theme-related REST endpoints.
     */
    public function check_themes_permission(\WP_REST_Request $request) {
        // Anyone can view themes.
        if ($request->get_method() === 'GET') {
            return true;
        }
        
        // Only authenticated users who can edit posts can save themes.
        $nonce = $request->get_header('X-WP-Nonce');
        if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error('rest_nonce_invalid', 'Invalid authentication.', array('status' => 403));
        }
        
        return current_user_can('edit_posts');
    }
    
    /**
     * AJAX handler for exporting media kit
     * This delegates to the ExportManager for actual export logic
     */
    public function ajax_export_mediakit() {
        // Security check
        if (!check_ajax_referer('gmkb_nonce', 'nonce', false)) {
            wp_send_json_error(array('message' => 'Invalid security token'), 403);
            return;
        }
        
        // Permission check
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => 'Insufficient permissions'), 403);
            return;
        }
        
        // Get parameters
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $export_type = isset($_POST['export_type']) ? sanitize_text_field($_POST['export_type']) : 'full';
        
        if (!$post_id) {
            wp_send_json_error(array('message' => 'Missing post ID'), 400);
            return;
        }
        
        // Check if user can edit this post
        if (!current_user_can('edit_post', $post_id)) {
            wp_send_json_error(array('message' => 'You cannot export this media kit'), 403);
            return;
        }
        
        try {
            // Use ExportManager if available
            if (class_exists('GMKB_ExportManager')) {
                $export_manager = \GMKB_ExportManager::get_instance();
                $export_data = $export_manager->generate_export($post_id, $export_type);
                
                wp_send_json_success(array(
                    'export_data' => $export_data,
                    'filename' => $this->generate_export_filename($post_id, $export_type)
                ));
            } else {
                // Fallback: basic export
                $export_data = $this->generate_basic_export($post_id, $export_type);
                wp_send_json_success(array(
                    'export_data' => $export_data,
                    'filename' => $this->generate_export_filename($post_id, $export_type)
                ));
            }
        } catch (\Exception $e) {
            wp_send_json_error(array('message' => 'Export failed: ' . $e->getMessage()), 500);
        }
    }
    
    /**
     * AJAX handler for importing media kit
     */
    public function ajax_import_mediakit() {
        // Security check
        if (!check_ajax_referer('gmkb_nonce', 'nonce', false)) {
            wp_send_json_error(array('message' => 'Invalid security token'), 403);
            return;
        }
        
        // Permission check
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => 'Insufficient permissions'), 403);
            return;
        }
        
        // Get parameters
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $import_data = isset($_POST['import_data']) ? $_POST['import_data'] : '';
        $import_mode = isset($_POST['import_mode']) ? sanitize_text_field($_POST['import_mode']) : 'replace';
        $resolutions = isset($_POST['resolutions']) ? json_decode(stripslashes($_POST['resolutions']), true) : array();
        
        if (!$post_id) {
            wp_send_json_error(array('message' => 'Missing post ID'), 400);
            return;
        }
        
        // Check if user can edit this post
        if (!current_user_can('edit_post', $post_id)) {
            wp_send_json_error(array('message' => 'You cannot import to this media kit'), 403);
            return;
        }
        
        // Decode import data
        $data = json_decode(stripslashes($import_data), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error(array('message' => 'Invalid JSON data'), 400);
            return;
        }
        
        try {
            // Use ImportManager if available
            if (class_exists('GMKB_ImportManager')) {
                $import_manager = \GMKB_ImportManager::get_instance();
                $result = $import_manager->import_media_kit($data, $post_id, $import_mode);
                
                if ($result['success']) {
                    wp_send_json_success(array(
                        'message' => 'Import successful',
                        'components_imported' => $result['components_imported'],
                        'warnings' => $result['warnings'] ?? array()
                    ));
                } else {
                    wp_send_json_error(array('message' => $result['error']), 500);
                }
            } else {
                // Fallback: basic import
                $result = $this->perform_basic_import($post_id, $data, $import_mode);
                wp_send_json_success($result);
            }
        } catch (\Exception $e) {
            wp_send_json_error(array('message' => 'Import failed: ' . $e->getMessage()), 500);
        }
    }
    
    /**
     * AJAX handler for validating import data
     */
    public function ajax_validate_import() {
        // Security check
        if (!check_ajax_referer('gmkb_nonce', 'nonce', false)) {
            wp_send_json_error(array('message' => 'Invalid security token'), 403);
            return;
        }
        
        // Get import data
        $import_data = isset($_POST['import_data']) ? $_POST['import_data'] : '';
        
        // Decode import data
        $data = json_decode(stripslashes($import_data), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error(array('message' => 'Invalid JSON data'), 400);
            return;
        }
        
        try {
            // Use ImportManager if available
            if (class_exists('GMKB_ImportManager')) {
                $import_manager = \GMKB_ImportManager::get_instance();
                $validation = $import_manager->validate_import_data($data);
                
                wp_send_json_success(array(
                    'valid' => $validation['valid'],
                    'errors' => $validation['errors'],
                    'warnings' => $validation['warnings'],
                    'summary' => array(
                        'components_count' => count($data['components'] ?? array()),
                        'sections_count' => count($data['sections'] ?? array()),
                        'theme' => $data['theme'] ?? 'not specified',
                        'version' => $data['version'] ?? 'unknown'
                    )
                ));
            } else {
                // Basic validation
                $valid = isset($data['version']) && isset($data['components']);
                wp_send_json_success(array(
                    'valid' => $valid,
                    'errors' => $valid ? array() : array('Missing required fields'),
                    'warnings' => array(),
                    'summary' => array(
                        'components_count' => count($data['components'] ?? array()),
                        'sections_count' => count($data['sections'] ?? array()),
                        'theme' => $data['theme'] ?? 'not specified',
                        'version' => $data['version'] ?? 'unknown'
                    )
                ));
            }
        } catch (\Exception $e) {
            wp_send_json_error(array('message' => 'Validation failed: ' . $e->getMessage()), 500);
        }
    }
    
    /**
     * Generate filename for export
     */
    private function generate_export_filename($post_id, $export_type) {
        $post = get_post($post_id);
        $slug = $post ? sanitize_title($post->post_title) : 'media-kit';
        $date = date('Y-m-d-His');
        return sprintf('mediakit-%s-%s-%s.json', $slug, $export_type, $date);
    }
    
    /**
     * Basic export implementation (fallback)
     */
    private function generate_basic_export($post_id, $export_type) {
        $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        $post = get_post($post_id);
        
        $export = array(
            'version' => '3.0.0',
            'format' => $export_type,
            'created' => current_time('c'),
            'wordpress_version' => get_bloginfo('version'),
            'post_id' => $post_id,
            'post_title' => $post ? $post->post_title : '',
            'metadata' => array(
                'author' => get_current_user_id(),
                'site_url' => get_site_url()
            )
        );
        
        if ($export_type === 'full' || $export_type === 'components') {
            $export['components'] = $state['components'] ?? array();
        }
        
        if ($export_type === 'full' || $export_type === 'template') {
            $export['sections'] = $state['sections'] ?? array();
            $export['theme'] = $state['theme'] ?? 'professional_clean';
            $export['themeCustomizations'] = $state['themeCustomizations'] ?? array();
        }
        
        return $export;
    }
    
    /**
     * Basic import implementation (fallback)
     */
    private function perform_basic_import($post_id, $data, $import_mode) {
        $current_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        if (empty($current_state)) {
            $current_state = array(
                'components' => array(),
                'sections' => array(),
                'theme' => 'professional_clean',
                'themeCustomizations' => array()
            );
        }
        
        $new_state = $current_state;
        
        if ($import_mode === 'replace') {
            $new_state = array(
                'components' => $data['components'] ?? array(),
                'sections' => $data['sections'] ?? array(),
                'theme' => $data['theme'] ?? 'professional_clean',
                'themeCustomizations' => $data['themeCustomizations'] ?? array()
            );
        } else {
            // Merge mode
            if (isset($data['components'])) {
                $new_state['components'] = array_merge(
                    $current_state['components'] ?? array(),
                    $data['components']
                );
            }
            if (isset($data['sections'])) {
                $new_state['sections'] = array_merge(
                    $current_state['sections'] ?? array(),
                    $data['sections']
                );
            }
        }
        
        update_post_meta($post_id, 'gmkb_media_kit_state', $new_state);
        
        return array(
            'success' => true,
            'components_imported' => count($data['components'] ?? array()),
            'warnings' => array()
        );
    }
}

// Initialize the API handler.
new MediaKitAPI();
