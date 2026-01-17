<?php
/**
 * REST API Template Controller
 *
 * Provides endpoints for the media kit builder:
 * - /starter-templates - Persona-based layouts (what sections/components appear)
 * - /themes - Visual styles only (colors, typography, spacing)
 *
 * @package Guestify_Media_Kit_Builder
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_REST_Template_Controller {

    const NAMESPACE = 'gmkb/v1';
    const USER_TEMPLATE_CPT = 'gmkb_user_template';

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
        add_action('init', array($this, 'register_post_type'));
    }

    /**
     * Register Custom Post Type for User Templates
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
        // Starter Templates (layouts)
        register_rest_route(self::NAMESPACE, '/starter-templates', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_starter_templates'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route(self::NAMESPACE, '/starter-templates/(?P<id>[\w-]+)', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_starter_template'),
            'permission_callback' => '__return_true',
            'args'                => array(
                'id' => array(
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
            ),
        ));

        register_rest_route(self::NAMESPACE, '/personas', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_personas'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route(self::NAMESPACE, '/filter-manifest', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_filter_manifest'),
            'permission_callback' => '__return_true',
        ));

        // Themes (visual styles)
        register_rest_route(self::NAMESPACE, '/themes', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_themes'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route(self::NAMESPACE, '/themes/(?P<id>[\w-]+)', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_theme'),
            'permission_callback' => '__return_true',
            'args'                => array(
                'id' => array(
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
            ),
        ));

        // User saved templates (CRUD)
        register_rest_route(self::NAMESPACE, '/user-templates', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_user_templates'),
                'permission_callback' => array($this, 'check_logged_in'),
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'create_user_template'),
                'permission_callback' => array($this, 'check_can_edit'),
            ),
        ));

        register_rest_route(self::NAMESPACE, '/user-templates/(?P<id>\d+)', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_user_template'),
                'permission_callback' => array($this, 'check_logged_in'),
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array($this, 'update_user_template'),
                'permission_callback' => array($this, 'check_can_edit'),
            ),
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array($this, 'delete_user_template'),
                'permission_callback' => array($this, 'check_can_edit'),
            ),
        ));
    }

    // =====================================================
    // Permission Checks
    // =====================================================

    public function check_logged_in() {
        return is_user_logged_in();
    }

    public function check_can_edit() {
        return current_user_can('edit_posts');
    }

    // =====================================================
    // Discovery Helpers
    // =====================================================

    private function get_template_discovery() {
        if (!class_exists('TemplateDiscovery')) {
            require_once GMKB_PLUGIN_DIR . 'system/TemplateDiscovery.php';
        }
        return new TemplateDiscovery(GMKB_PLUGIN_DIR . 'starter-templates');
    }

    private function get_theme_discovery() {
        if (!class_exists('ThemeDiscovery')) {
            require_once GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php';
        }
        return new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
    }

    // =====================================================
    // Starter Templates (Layouts)
    // =====================================================

    /**
     * GET /starter-templates
     * List all persona-based layout templates
     */
    public function get_starter_templates($request) {
        $discovery = $this->get_template_discovery();
        $templates = array();

        foreach ($discovery->getTemplates() as $id => $template) {
            $persona = $template['persona'] ?? array();
            $templates[] = array(
                'id'                 => $id,
                'name'               => $template['template_name'] ?? $id,
                'description'        => $template['description'] ?? '',
                'persona'            => $persona,
                'use_case'           => $persona['use_case'] ?? 'General Bio',
                'layout_variant'     => $persona['layout_variant'] ?? 'standard',
                'preview_url'        => $template['preview_url'] ?? null,
                'tags'               => $template['metadata']['tags'] ?? array(),
                'is_premium'         => $template['metadata']['is_premium'] ?? false,
                'recommended_themes' => $template['metadata']['recommended_themes'] ?? array(),
                'section_count'      => isset($template['sections']) ? count($template['sections']) : 0,
            );
        }

        return rest_ensure_response(array(
            'success'   => true,
            'templates' => $templates,
            'total'     => count($templates),
        ));
    }

    /**
     * GET /starter-templates/{id}
     * Get single template with full layout content
     */
    public function get_starter_template($request) {
        $id = sanitize_file_name($request->get_param('id'));
        $discovery = $this->get_template_discovery();
        $template = $discovery->getTemplate($id);

        if (!$template) {
            return new WP_Error('not_found', 'Template not found', array('status' => 404));
        }

        return rest_ensure_response(array(
            'success'  => true,
            'template' => $template,
        ));
    }

    /**
     * GET /personas
     * List all persona types
     */
    public function get_personas($request) {
        $discovery = $this->get_template_discovery();
        return rest_ensure_response(array(
            'success'  => true,
            'personas' => $discovery->getPersonaTypes(),
        ));
    }

    /**
     * GET /filter-manifest
     * Get multi-dimensional filter manifest for template picker
     */
    public function get_filter_manifest($request) {
        $discovery = $this->get_template_discovery();
        $manifest = $discovery->getFilterManifest();

        return rest_ensure_response(array(
            'success'  => true,
            'manifest' => $manifest,
        ));
    }

    // =====================================================
    // Themes (Visual Styles)
    // =====================================================

    /**
     * GET /themes
     * List all visual style themes
     */
    public function get_themes($request) {
        $discovery = $this->get_theme_discovery();
        $themes = array();

        foreach ($discovery->getThemes() as $id => $theme) {
            // Skip old-style themes that have defaultContent (they're layouts, not visual styles)
            if (isset($theme['defaultContent'])) {
                continue;
            }

            $themes[] = array(
                'id'             => $id,
                'name'           => $theme['theme_name'] ?? $id,
                'description'    => $theme['description'] ?? '',
                'style'          => $theme['style'] ?? null,
                'preview_url'    => $theme['preview_url'] ?? null,
                'preview_colors' => $theme['metadata']['preview_colors'] ?? array(),
                'is_dark'        => $theme['metadata']['is_dark'] ?? false,
                'is_premium'     => $theme['metadata']['is_premium'] ?? false,
                'tags'           => $theme['metadata']['tags'] ?? array(),
                'colors'         => array(
                    'primary'    => $theme['colors']['primary'] ?? '#2563eb',
                    'secondary'  => $theme['colors']['secondary'] ?? '#1e40af',
                    'background' => $theme['colors']['background'] ?? '#ffffff',
                ),
            );
        }

        return rest_ensure_response(array(
            'success' => true,
            'themes'  => $themes,
            'total'   => count($themes),
        ));
    }

    /**
     * GET /themes/{id}
     * Get single theme with full visual styling
     */
    public function get_theme($request) {
        $id = sanitize_file_name($request->get_param('id'));
        $discovery = $this->get_theme_discovery();
        $theme = $discovery->getTheme($id);

        if (!$theme) {
            return new WP_Error('not_found', 'Theme not found', array('status' => 404));
        }

        // Don't return old-style themes with defaultContent
        if (isset($theme['defaultContent'])) {
            return new WP_Error('not_found', 'Theme not found', array('status' => 404));
        }

        return rest_ensure_response(array(
            'success' => true,
            'theme'   => $theme,
        ));
    }

    // =====================================================
    // User Templates (CRUD)
    // =====================================================

    /**
     * GET /user-templates
     * List user's saved templates
     */
    public function get_user_templates($request) {
        $posts = get_posts(array(
            'post_type'      => self::USER_TEMPLATE_CPT,
            'author'         => get_current_user_id(),
            'posts_per_page' => -1,
            'post_status'    => 'publish',
        ));

        $templates = array();
        foreach ($posts as $post) {
            $templates[] = array(
                'id'          => $post->ID,
                'name'        => $post->post_title,
                'description' => get_post_meta($post->ID, '_gmkb_description', true),
                'thumbnail'   => get_post_meta($post->ID, '_gmkb_thumbnail', true),
                'created_at'  => $post->post_date,
                'updated_at'  => $post->post_modified,
            );
        }

        return rest_ensure_response(array(
            'success'   => true,
            'templates' => $templates,
            'total'     => count($templates),
        ));
    }

    /**
     * GET /user-templates/{id}
     * Get single user template
     */
    public function get_user_template($request) {
        $id = absint($request->get_param('id'));
        $post = get_post($id);

        if (!$post || $post->post_type !== self::USER_TEMPLATE_CPT) {
            return new WP_Error('not_found', 'Template not found', array('status' => 404));
        }

        if ($post->post_author != get_current_user_id() && !current_user_can('edit_others_posts')) {
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }

        $content = json_decode($post->post_content, true);

        return rest_ensure_response(array(
            'success'  => true,
            'template' => array(
                'id'          => $post->ID,
                'name'        => $post->post_title,
                'description' => get_post_meta($post->ID, '_gmkb_description', true),
                'content'     => $content,
                'created_at'  => $post->post_date,
                'updated_at'  => $post->post_modified,
            ),
        ));
    }

    /**
     * POST /user-templates
     * Create new user template
     */
    public function create_user_template($request) {
        $params = $request->get_json_params();

        if (empty($params['name'])) {
            return new WP_Error('invalid_data', 'Name is required', array('status' => 400));
        }

        if (empty($params['content'])) {
            return new WP_Error('invalid_data', 'Content is required', array('status' => 400));
        }

        $post_id = wp_insert_post(array(
            'post_type'    => self::USER_TEMPLATE_CPT,
            'post_title'   => sanitize_text_field($params['name']),
            'post_content' => wp_json_encode($params['content']),
            'post_status'  => 'publish',
            'post_author'  => get_current_user_id(),
        ));

        if (is_wp_error($post_id)) {
            return new WP_Error('create_failed', $post_id->get_error_message(), array('status' => 500));
        }

        if (!empty($params['description'])) {
            update_post_meta($post_id, '_gmkb_description', sanitize_textarea_field($params['description']));
        }

        if (!empty($params['thumbnail'])) {
            update_post_meta($post_id, '_gmkb_thumbnail', esc_url_raw($params['thumbnail']));
        }

        return rest_ensure_response(array(
            'success' => true,
            'id'      => $post_id,
        ));
    }

    /**
     * PUT /user-templates/{id}
     * Update user template
     */
    public function update_user_template($request) {
        $id = absint($request->get_param('id'));
        $params = $request->get_json_params();
        $post = get_post($id);

        if (!$post || $post->post_type !== self::USER_TEMPLATE_CPT) {
            return new WP_Error('not_found', 'Template not found', array('status' => 404));
        }

        if ($post->post_author != get_current_user_id() && !current_user_can('edit_others_posts')) {
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }

        $update_data = array('ID' => $id);

        if (!empty($params['name'])) {
            $update_data['post_title'] = sanitize_text_field($params['name']);
        }

        if (!empty($params['content'])) {
            $update_data['post_content'] = wp_json_encode($params['content']);
        }

        $result = wp_update_post($update_data);

        if (is_wp_error($result)) {
            return new WP_Error('update_failed', $result->get_error_message(), array('status' => 500));
        }

        if (isset($params['description'])) {
            update_post_meta($id, '_gmkb_description', sanitize_textarea_field($params['description']));
        }

        if (isset($params['thumbnail'])) {
            update_post_meta($id, '_gmkb_thumbnail', esc_url_raw($params['thumbnail']));
        }

        return rest_ensure_response(array('success' => true));
    }

    /**
     * DELETE /user-templates/{id}
     * Delete user template
     */
    public function delete_user_template($request) {
        $id = absint($request->get_param('id'));
        $post = get_post($id);

        if (!$post || $post->post_type !== self::USER_TEMPLATE_CPT) {
            return new WP_Error('not_found', 'Template not found', array('status' => 404));
        }

        if ($post->post_author != get_current_user_id() && !current_user_can('delete_others_posts')) {
            return new WP_Error('forbidden', 'Access denied', array('status' => 403));
        }

        $result = wp_delete_post($id, true);

        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete', array('status' => 500));
        }

        return rest_ensure_response(array('success' => true));
    }
}
