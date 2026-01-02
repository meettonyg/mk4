<?php
/**
 * REST API Template Controller
 *
 * Provides endpoints for template directory functionality:
 * - List all templates (built-in + user)
 * - Get single template with full content
 * - CRUD for user-saved templates
 *
 * @package Guestify_Media_Kit_Builder
 * @since 2.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_REST_Template_Controller {

    const NAMESPACE = 'gmkb/v1';
    const USER_TEMPLATE_CPT = 'gmkb_user_template';

    /**
     * Constructor - register hooks
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
        add_action('init', array($this, 'register_post_type'));
    }

    /**
     * Register Custom Post Type for User Templates
     *
     * Stores user-saved templates with full content in post_content
     * Supports revisions for data safety
     */
    public function register_post_type() {
        register_post_type(self::USER_TEMPLATE_CPT, array(
            'labels' => array(
                'name'          => __('User Templates', 'guestify-media-kit'),
                'singular_name' => __('User Template', 'guestify-media-kit'),
            ),
            'public'       => false,
            'show_ui'      => false,
            'show_in_rest' => false,
            'supports'     => array('title', 'editor', 'author', 'revisions'),
            'capability_type' => 'post',
            'map_meta_cap' => true,
        ));
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        // GET /templates - All templates (built-in + user)
        register_rest_route(self::NAMESPACE, '/templates', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_templates'),
            'permission_callback' => array($this, 'read_permission_check'),
        ));

        // GET /templates/(?P<id>[\w-]+) - Single template with full content
        register_rest_route(self::NAMESPACE, '/templates/(?P<id>[\w-]+)', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_template'),
            'permission_callback' => array($this, 'single_read_permission_check'),
            'args'                => array(
                'id' => array(
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
            ),
        ));

        // POST /templates/user - Create user template
        register_rest_route(self::NAMESPACE, '/templates/user', array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($this, 'create_user_template'),
            'permission_callback' => array($this, 'write_permission_check'),
        ));

        // PUT /templates/user/(?P<id>\d+) - Update user template
        register_rest_route(self::NAMESPACE, '/templates/user/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array($this, 'update_user_template'),
            'permission_callback' => array($this, 'write_permission_check'),
            'args'                => array(
                'id' => array(
                    'required'          => true,
                    'type'              => 'integer',
                    'sanitize_callback' => 'absint',
                ),
            ),
        ));

        // DELETE /templates/user/(?P<id>\d+) - Delete user template
        register_rest_route(self::NAMESPACE, '/templates/user/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array($this, 'delete_user_template'),
            'permission_callback' => array($this, 'write_permission_check'),
            'args'                => array(
                'id' => array(
                    'required'          => true,
                    'type'              => 'integer',
                    'sanitize_callback' => 'absint',
                ),
            ),
        ));
    }

    /**
     * Check read permission for templates list
     * Built-in templates are public, but user templates require auth
     */
    public function read_permission_check() {
        // Allow public access - built-in templates are safe to expose
        // User templates are filtered by author in get_templates()
        return true;
    }

    /**
     * Check read permission for single template
     * Built-in templates are public, user templates require ownership
     */
    public function single_read_permission_check($request) {
        $id = $request->get_param('id');

        // Numeric IDs are user templates - require auth
        if (is_numeric($id)) {
            return is_user_logged_in();
        }

        // Built-in templates (string IDs like 'author-bold') are public
        return true;
    }

    /**
     * Check write permission - must be able to edit posts
     */
    public function write_permission_check() {
        return current_user_can('edit_posts');
    }

    /**
     * Get ThemeDiscovery instance
     *
     * @return ThemeDiscovery
     */
    private function get_theme_discovery() {
        if (!class_exists('ThemeDiscovery')) {
            require_once GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php';
        }
        return new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
    }

    /**
     * Get all templates (lightweight list for directory)
     *
     * Returns both built-in themes (as templates) and user-saved templates
     */
    public function get_templates($request) {
        $templates = array();

        // 1. Load Built-in Themes as Templates (using ThemeDiscovery for caching)
        $discovery = $this->get_theme_discovery();

        foreach ($discovery->getThemes() as $slug => $theme_data) {
            if (empty($theme_data['theme_id'])) {
                continue;
            }

            $templates[] = array(
                'id'                  => $slug,
                'type'                => 'built_in',
                'name'                => $theme_data['theme_name'] ?? $slug,
                'description'         => $theme_data['description'] ?? '',
                'category'            => $theme_data['category'] ?? 'portfolio',
                'tags'                => $theme_data['metadata']['tags'] ?? array(),
                'is_premium'          => $theme_data['metadata']['is_premium'] ?? false,
                'is_new'              => $theme_data['metadata']['is_new'] ?? false,
                'sort_order'          => $theme_data['metadata']['sort_order'] ?? 100,
                'preview_image'       => $this->get_preview_url($slug),
                'thumbnail_image'     => $this->get_thumbnail_url($slug),
                'has_default_content' => !empty($theme_data['defaultContent']),
            );
        }

        // 2. Load User Templates (Custom Post Type)
        $user_id = get_current_user_id();

        if ($user_id) {
            $user_posts = get_posts(array(
                'post_type'      => self::USER_TEMPLATE_CPT,
                'author'         => $user_id,
                'posts_per_page' => -1,
                'post_status'    => 'publish',
            ));

            foreach ($user_posts as $post) {
                $templates[] = array(
                    'id'                  => $post->ID,
                    'type'                => 'user',
                    'name'                => $post->post_title,
                    'description'         => get_post_meta($post->ID, '_gmkb_description', true),
                    'category'            => 'saved',
                    'tags'                => array('custom', 'saved'),
                    'is_premium'          => false,
                    'is_new'              => false,
                    'sort_order'          => 1000, // User templates at the end
                    'created_at'          => $post->post_date,
                    'updated_at'          => $post->post_modified,
                    'has_default_content' => true,
                    'thumbnail_image'     => get_post_meta($post->ID, '_gmkb_thumbnail', true) ?: $this->get_default_thumbnail_url(),
                );
            }
        }

        // Sort by sort_order
        usort($templates, function($a, $b) {
            return ($a['sort_order'] ?? 100) - ($b['sort_order'] ?? 100);
        });

        return rest_ensure_response(array(
            'success'   => true,
            'templates' => $templates,
            'total'     => count($templates),
        ));
    }

    /**
     * Get single template with full content
     *
     * For built-in templates, returns the full theme.json
     * For user templates, returns the saved content
     */
    public function get_template($request) {
        $id = $request->get_param('id');

        // Check if user template (numeric ID)
        if (is_numeric($id)) {
            $post = get_post(absint($id));

            if (!$post || $post->post_type !== self::USER_TEMPLATE_CPT) {
                return new WP_Error(
                    'not_found',
                    __('Template not found', 'guestify-media-kit'),
                    array('status' => 404)
                );
            }

            // Check ownership
            if ($post->post_author != get_current_user_id() && !current_user_can('edit_others_posts')) {
                return new WP_Error(
                    'forbidden',
                    __('You do not have permission to view this template', 'guestify-media-kit'),
                    array('status' => 403)
                );
            }

            $content = json_decode($post->post_content, true);

            return rest_ensure_response(array(
                'success'  => true,
                'template' => array(
                    'id'             => $post->ID,
                    'type'           => 'user',
                    'name'           => $post->post_title,
                    'description'    => get_post_meta($post->ID, '_gmkb_description', true),
                    'defaultContent' => $content['defaultContent'] ?? $content,
                    'theme'          => $content['theme'] ?? 'professional_clean',
                    'themeCustomizations' => $content['themeCustomizations'] ?? array(),
                ),
            ));
        }

        // Built-in theme (using ThemeDiscovery for caching)
        $discovery = $this->get_theme_discovery();
        $sanitized_id = sanitize_file_name($id);
        $theme_data = $discovery->getTheme($sanitized_id);

        // Try alternate format if not found (underscores <-> hyphens)
        if (!$theme_data) {
            // Theme IDs in JSON use underscores, directory names use hyphens
            $alternate_id = strpos($sanitized_id, '_') !== false
                ? str_replace('_', '-', $sanitized_id)
                : str_replace('-', '_', $sanitized_id);
            $theme_data = $discovery->getTheme($alternate_id);
        }

        if (!$theme_data) {
            return new WP_Error(
                'not_found',
                __('Template not found', 'guestify-media-kit'),
                array('status' => 404)
            );
        }

        // Add image URLs
        $theme_data['preview_image_url'] = $this->get_preview_url($id);
        $theme_data['thumbnail_image_url'] = $this->get_thumbnail_url($id);

        return rest_ensure_response(array(
            'success'  => true,
            'template' => $theme_data,
        ));
    }

    /**
     * Create user template
     *
     * Saves the current media kit state as a reusable template
     */
    public function create_user_template($request) {
        $params = $request->get_json_params();

        if (empty($params['name'])) {
            return new WP_Error(
                'invalid_data',
                __('Template name is required', 'guestify-media-kit'),
                array('status' => 400)
            );
        }

        if (empty($params['content'])) {
            return new WP_Error(
                'invalid_data',
                __('Template content is required', 'guestify-media-kit'),
                array('status' => 400)
            );
        }

        // Create the post
        $post_id = wp_insert_post(array(
            'post_type'    => self::USER_TEMPLATE_CPT,
            'post_title'   => sanitize_text_field($params['name']),
            'post_content' => wp_json_encode($params['content']),
            'post_status'  => 'publish',
            'post_author'  => get_current_user_id(),
        ));

        if (is_wp_error($post_id)) {
            return new WP_Error(
                'create_failed',
                $post_id->get_error_message(),
                array('status' => 500)
            );
        }

        // Save metadata
        if (!empty($params['description'])) {
            update_post_meta($post_id, '_gmkb_description', sanitize_textarea_field($params['description']));
        }

        if (!empty($params['thumbnail'])) {
            update_post_meta($post_id, '_gmkb_thumbnail', esc_url_raw($params['thumbnail']));
        }

        return rest_ensure_response(array(
            'success' => true,
            'id'      => $post_id,
            'message' => __('Template saved successfully', 'guestify-media-kit'),
        ));
    }

    /**
     * Update user template
     */
    public function update_user_template($request) {
        $id = $request->get_param('id');
        $params = $request->get_json_params();

        $post = get_post($id);

        if (!$post || $post->post_type !== self::USER_TEMPLATE_CPT) {
            return new WP_Error(
                'not_found',
                __('Template not found', 'guestify-media-kit'),
                array('status' => 404)
            );
        }

        // Check ownership
        if ($post->post_author != get_current_user_id() && !current_user_can('edit_others_posts')) {
            return new WP_Error(
                'forbidden',
                __('You do not have permission to edit this template', 'guestify-media-kit'),
                array('status' => 403)
            );
        }

        // Update post
        $update_data = array('ID' => $id);

        if (!empty($params['name'])) {
            $update_data['post_title'] = sanitize_text_field($params['name']);
        }

        if (!empty($params['content'])) {
            $update_data['post_content'] = wp_json_encode($params['content']);
        }

        $result = wp_update_post($update_data);

        if (is_wp_error($result)) {
            return new WP_Error(
                'update_failed',
                $result->get_error_message(),
                array('status' => 500)
            );
        }

        // Update metadata
        if (isset($params['description'])) {
            update_post_meta($id, '_gmkb_description', sanitize_textarea_field($params['description']));
        }

        if (isset($params['thumbnail'])) {
            update_post_meta($id, '_gmkb_thumbnail', esc_url_raw($params['thumbnail']));
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Template updated successfully', 'guestify-media-kit'),
        ));
    }

    /**
     * Delete user template
     */
    public function delete_user_template($request) {
        $id = $request->get_param('id');

        $post = get_post($id);

        if (!$post || $post->post_type !== self::USER_TEMPLATE_CPT) {
            return new WP_Error(
                'not_found',
                __('Template not found', 'guestify-media-kit'),
                array('status' => 404)
            );
        }

        // Check ownership
        if ($post->post_author != get_current_user_id() && !current_user_can('delete_others_posts')) {
            return new WP_Error(
                'forbidden',
                __('You do not have permission to delete this template', 'guestify-media-kit'),
                array('status' => 403)
            );
        }

        // Delete the post permanently
        $result = wp_delete_post($id, true);

        if (!$result) {
            return new WP_Error(
                'delete_failed',
                __('Failed to delete template', 'guestify-media-kit'),
                array('status' => 500)
            );
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Template deleted successfully', 'guestify-media-kit'),
        ));
    }

    /**
     * Get preview image URL for a theme
     */
    private function get_preview_url($theme_id) {
        $themes_url = defined('GMKB_PLUGIN_URL') ? GMKB_PLUGIN_URL . 'themes' : plugin_dir_url(dirname(dirname(__FILE__))) . 'themes';
        $themes_dir = defined('GMKB_PLUGIN_DIR') ? GMKB_PLUGIN_DIR . 'themes' : plugin_dir_path(dirname(dirname(__FILE__))) . 'themes';

        $preview_path = $themes_dir . '/' . $theme_id . '/preview.jpg';

        if (file_exists($preview_path)) {
            return $themes_url . '/' . $theme_id . '/preview.jpg';
        }

        return $this->get_default_preview_url();
    }

    /**
     * Get thumbnail image URL for a theme
     */
    private function get_thumbnail_url($theme_id) {
        $themes_url = defined('GMKB_PLUGIN_URL') ? GMKB_PLUGIN_URL . 'themes' : plugin_dir_url(dirname(dirname(__FILE__))) . 'themes';
        $themes_dir = defined('GMKB_PLUGIN_DIR') ? GMKB_PLUGIN_DIR . 'themes' : plugin_dir_path(dirname(dirname(__FILE__))) . 'themes';

        $thumbnail_path = $themes_dir . '/' . $theme_id . '/thumbnail.jpg';

        if (file_exists($thumbnail_path)) {
            return $themes_url . '/' . $theme_id . '/thumbnail.jpg';
        }

        return $this->get_default_thumbnail_url();
    }

    /**
     * Get default preview image URL
     */
    private function get_default_preview_url() {
        $assets_url = defined('GMKB_PLUGIN_URL') ? GMKB_PLUGIN_URL . 'assets' : plugin_dir_url(dirname(dirname(__FILE__))) . 'assets';
        return $assets_url . '/images/themes/default-preview.jpg';
    }

    /**
     * Get default thumbnail image URL
     */
    private function get_default_thumbnail_url() {
        $assets_url = defined('GMKB_PLUGIN_URL') ? GMKB_PLUGIN_URL . 'assets' : plugin_dir_url(dirname(dirname(__FILE__))) . 'assets';
        return $assets_url . '/images/themes/default-thumbnail.jpg';
    }
}

// Note: Controller is initialized by the main plugin file (guestify-media-kit-builder.php)
