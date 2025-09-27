<?php
/**
 * REST API MediaKit Endpoints
 * 
 * Unified API endpoints for Media Kit operations
 * Implements Phase 1 of Pure Vue Migration
 * 
 * @package Guestify_Media_Kit_Builder
 * @version 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_REST_MediaKit_Controller {
    
    /**
     * Namespace for REST routes
     */
    const NAMESPACE = 'gmkb/v1';
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register REST routes
     */
    public function register_routes() {
        // Main media kit endpoints
        register_rest_route(self::NAMESPACE, '/mediakit/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_mediakit'),
                'permission_callback' => array($this, 'permissions_check'),
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'type' => 'integer'
                    )
                )
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'save_mediakit'),
                'permission_callback' => array($this, 'permissions_check'),
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'type' => 'integer'
                    )
                )
            )
        ));
        
        // Export endpoints
        register_rest_route(self::NAMESPACE, '/mediakit/(?P<id>\d+)/export', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'export_mediakit'),
            'permission_callback' => array($this, 'permissions_check'),
            'args' => array(
                'id' => array(
                    'required' => true,
                    'type' => 'integer'
                ),
                'format' => array(
                    'required' => false,
                    'type' => 'string',
                    'default' => 'full',
                    'enum' => array('full', 'template', 'components')
                )
            )
        ));
        
        // Import endpoints
        register_rest_route(self::NAMESPACE, '/mediakit/import', array(
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => array($this, 'import_mediakit'),
            'permission_callback' => array($this, 'permissions_check')
        ));
        
        // Themes endpoint
        register_rest_route(self::NAMESPACE, '/themes', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'get_themes'),
            'permission_callback' => '__return_true'
        ));
        
        // Templates endpoint
        register_rest_route(self::NAMESPACE, '/templates', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'get_templates'),
            'permission_callback' => '__return_true'
        ));
    }
    
    /**
     * Check permissions for the request
     */
    public function permissions_check($request) {
        // For read operations, allow if post is public
        if ($request->get_method() === 'GET') {
            $post_id = $request->get_param('id');
            if ($post_id) {
                $post = get_post($post_id);
                if ($post && $post->post_status === 'publish') {
                    return true;
                }
            }
        }
        
        // For write operations, check capabilities
        return current_user_can('edit_posts');
    }
    
    /**
     * Get media kit data
     */
    public function get_mediakit($request) {
        $post_id = $request->get_param('id');
        
        // Validate post exists
        $post = get_post($post_id);
        if (!$post) {
            return new WP_Error('not_found', 'Media kit not found', array('status' => 404));
        }
        
        // Load media kit state
        $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        // Load Pods data
        $pods_data = array();
        if (function_exists('pods') && $post->post_type === 'guests') {
            $pod = pods('guests', $post_id);
            if ($pod && $pod->exists()) {
                $pods_data = array(
                    'firstName' => $pod->field('first_name'),
                    'lastName' => $pod->field('last_name'),
                    'biography' => $pod->field('biography'),
                    'biographyLong' => $pod->field('biography_long'),
                    'expertise' => $pod->field('expertise'),
                    'topics' => $pod->field('topics'),
                    'achievements' => $pod->field('achievements'),
                    'socialLinks' => array(
                        'website' => $pod->field('website'),
                        'linkedin' => $pod->field('linkedin'),
                        'twitter' => $pod->field('twitter'),
                        'facebook' => $pod->field('facebook'),
                        'instagram' => $pod->field('instagram'),
                        'youtube' => $pod->field('youtube')
                    ),
                    'media' => array(
                        'profileImage' => $pod->field('profile_image'),
                        'galleryImages' => $pod->field('gallery_images'),
                        'videoIntro' => $pod->field('video_intro')
                    )
                );
            }
        }
        
        // Prepare response data
        $response_data = array(
            'version' => '3.0.0',
            'postId' => $post_id,
            'components' => $state['components'] ?? new stdClass(),
            'sections' => $state['sections'] ?? array(),
            'theme' => $state['theme'] ?? 'professional_clean',
            'themeCustomizations' => $state['themeCustomizations'] ?? new stdClass(),
            'globalSettings' => $state['globalSettings'] ?? new stdClass(),
            'podsData' => $pods_data,
            'metadata' => array(
                'postTitle' => $post->post_title,
                'postStatus' => $post->post_status,
                'postType' => $post->post_type,
                'lastModified' => $post->post_modified,
                'author' => get_the_author_meta('display_name', $post->post_author)
            )
        );
        
        return new WP_REST_Response($response_data, 200);
    }
    
    /**
     * Save media kit data
     */
    public function save_mediakit($request) {
        $post_id = $request->get_param('id');
        $data = $request->get_json_params();
        
        // Validate post exists
        $post = get_post($post_id);
        if (!$post) {
            return new WP_Error('not_found', 'Media kit not found', array('status' => 404));
        }
        
        // Check permissions
        if (!current_user_can('edit_post', $post_id)) {
            return new WP_Error('forbidden', 'You do not have permission to edit this media kit', array('status' => 403));
        }
        
        // Prepare state for saving
        $state = array(
            'components' => $data['components'] ?? new stdClass(),
            'sections' => $data['sections'] ?? array(),
            'theme' => $data['theme'] ?? 'professional_clean',
            'themeCustomizations' => $data['themeCustomizations'] ?? new stdClass(),
            'globalSettings' => $data['globalSettings'] ?? new stdClass(),
            'last_saved' => current_time('mysql'),
            'save_timestamp' => time(),
            'version' => '3.0.0'
        );
        
        // Save to database
        $result = update_post_meta($post_id, 'gmkb_media_kit_state', $state);
        
        if ($result === false) {
            return new WP_Error('save_failed', 'Failed to save media kit', array('status' => 500));
        }
        
        // Return success response
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Media kit saved successfully',
            'timestamp' => time(),
            'post_id' => $post_id,
            'components_count' => is_object($state['components']) ? 0 : count($state['components']),
            'sections_count' => count($state['sections'])
        ), 200);
    }
    
    /**
     * Export media kit in various formats
     */
    public function export_mediakit($request) {
        $post_id = $request->get_param('id');
        $format = $request->get_param('format');
        
        // Get media kit data
        $mediakit_request = new WP_REST_Request('GET', self::NAMESPACE . '/mediakit/' . $post_id);
        $mediakit_response = $this->get_mediakit($mediakit_request);
        
        if (is_wp_error($mediakit_response)) {
            return $mediakit_response;
        }
        
        $data = $mediakit_response->get_data();
        
        // Prepare export data based on format
        switch ($format) {
            case 'template':
                // Structure without content
                $export_data = array(
                    'version' => '3.0.0',
                    'format' => 'template',
                    'created' => current_time('c'),
                    'sections' => array_map(function($section) {
                        return array(
                            'type' => $section['type'] ?? 'standard',
                            'layout' => $section['layout'] ?? 'full_width'
                        );
                    }, $data['sections']),
                    'componentTypes' => array_values(array_unique(array_map(function($component) {
                        return $component['type'] ?? 'unknown';
                    }, (array) $data['components']))),
                    'theme' => $data['theme']
                );
                break;
                
            case 'components':
                // Components only
                $export_data = array(
                    'version' => '3.0.0',
                    'format' => 'components',
                    'created' => current_time('c'),
                    'components' => $data['components']
                );
                break;
                
            case 'full':
            default:
                // Full export
                $export_data = array(
                    'version' => '3.0.0',
                    'format' => 'full',
                    'created' => current_time('c'),
                    'wordpress_version' => get_bloginfo('version'),
                    'plugin_version' => GMKB_VERSION,
                    'components' => $data['components'],
                    'sections' => $data['sections'],
                    'theme' => $data['theme'],
                    'themeCustomizations' => $data['themeCustomizations'],
                    'podsData' => $data['podsData'],
                    'metadata' => array(
                        'componentCount' => is_object($data['components']) ? 0 : count($data['components']),
                        'sectionCount' => count($data['sections']),
                        'exportedBy' => wp_get_current_user()->display_name,
                        'originalPostId' => $post_id,
                        'originalTitle' => $data['metadata']['postTitle']
                    )
                );
                break;
        }
        
        return new WP_REST_Response($export_data, 200);
    }
    
    /**
     * Import media kit from JSON
     */
    public function import_mediakit($request) {
        $import_data = $request->get_json_params();
        
        // Validate import data
        if (!isset($import_data['version']) || !isset($import_data['format'])) {
            return new WP_Error('invalid_import', 'Invalid import data format', array('status' => 400));
        }
        
        // Check version compatibility
        $import_version = $import_data['version'];
        if (version_compare($import_version, '2.0.0', '<')) {
            return new WP_Error('version_mismatch', 'Import version too old. Please upgrade the export.', array('status' => 400));
        }
        
        // Determine target post ID
        $target_post_id = $request->get_param('target_post_id');
        if (!$target_post_id) {
            // Create new post if no target specified
            $new_post = wp_insert_post(array(
                'post_title' => 'Imported Media Kit - ' . current_time('Y-m-d H:i'),
                'post_type' => 'guests',
                'post_status' => 'draft'
            ));
            
            if (is_wp_error($new_post)) {
                return new WP_Error('post_creation_failed', 'Failed to create new post for import', array('status' => 500));
            }
            
            $target_post_id = $new_post;
        }
        
        // Validate target post
        $post = get_post($target_post_id);
        if (!$post) {
            return new WP_Error('not_found', 'Target post not found', array('status' => 404));
        }
        
        // Check permissions
        if (!current_user_can('edit_post', $target_post_id)) {
            return new WP_Error('forbidden', 'You do not have permission to edit this post', array('status' => 403));
        }
        
        // Process import based on format
        $state = array();
        
        switch ($import_data['format']) {
            case 'full':
                $state = array(
                    'components' => $import_data['components'] ?? new stdClass(),
                    'sections' => $import_data['sections'] ?? array(),
                    'theme' => $import_data['theme'] ?? 'professional_clean',
                    'themeCustomizations' => $import_data['themeCustomizations'] ?? new stdClass(),
                    'globalSettings' => $import_data['globalSettings'] ?? new stdClass()
                );
                
                // Import Pods data if available
                if (isset($import_data['podsData']) && function_exists('pods')) {
                    $this->import_pods_data($target_post_id, $import_data['podsData']);
                }
                break;
                
            case 'template':
                // Import as template - structure only
                $state = array(
                    'components' => new stdClass(),
                    'sections' => $import_data['sections'] ?? array(),
                    'theme' => $import_data['theme'] ?? 'professional_clean',
                    'themeCustomizations' => new stdClass(),
                    'globalSettings' => new stdClass()
                );
                break;
                
            case 'components':
                // Merge components with existing state
                $existing_state = get_post_meta($target_post_id, 'gmkb_media_kit_state', true);
                $state = $existing_state ?: array();
                
                // Merge components
                $existing_components = (array) ($state['components'] ?? array());
                $import_components = (array) ($import_data['components'] ?? array());
                
                $state['components'] = array_merge($existing_components, $import_components);
                break;
                
            default:
                return new WP_Error('invalid_format', 'Unknown import format', array('status' => 400));
        }
        
        // Add import metadata
        $state['last_import'] = current_time('mysql');
        $state['import_timestamp'] = time();
        $state['import_version'] = $import_version;
        
        // Save imported state
        $result = update_post_meta($target_post_id, 'gmkb_media_kit_state', $state);
        
        if ($result === false) {
            return new WP_Error('import_failed', 'Failed to import media kit', array('status' => 500));
        }
        
        // Return success response
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Media kit imported successfully',
            'post_id' => $target_post_id,
            'components_imported' => is_object($state['components']) ? 0 : count($state['components']),
            'sections_imported' => count($state['sections'] ?? array()),
            'format' => $import_data['format']
        ), 200);
    }
    
    /**
     * Import Pods data
     */
    private function import_pods_data($post_id, $pods_data) {
        if (!function_exists('pods')) {
            return false;
        }
        
        $pod = pods('guests', $post_id);
        if (!$pod || !$pod->exists()) {
            return false;
        }
        
        // Map and save Pods fields
        $fields_to_import = array(
            'first_name' => $pods_data['firstName'] ?? '',
            'last_name' => $pods_data['lastName'] ?? '',
            'biography' => $pods_data['biography'] ?? '',
            'biography_long' => $pods_data['biographyLong'] ?? '',
            'expertise' => $pods_data['expertise'] ?? '',
            'topics' => $pods_data['topics'] ?? '',
            'achievements' => $pods_data['achievements'] ?? ''
        );
        
        // Social links
        if (isset($pods_data['socialLinks'])) {
            foreach ($pods_data['socialLinks'] as $platform => $url) {
                $fields_to_import[$platform] = $url;
            }
        }
        
        // Save fields
        foreach ($fields_to_import as $field => $value) {
            if (!empty($value)) {
                $pod->save($field, $value);
            }
        }
        
        return true;
    }
    
    /**
     * Get available themes
     */
    public function get_themes($request) {
        // Use existing theme discovery if available
        $theme_dir = GMKB_PLUGIN_DIR . 'themes/';
        $themes = array();
        
        // Hardcoded themes for now (will be replaced with discovery system)
        $available_themes = array(
            'professional_clean' => array(
                'name' => 'Professional Clean',
                'description' => 'Clean and modern professional theme',
                'thumbnail' => GMKB_PLUGIN_URL . 'themes/professional_clean/thumbnail.png',
                'isPremium' => false
            ),
            'modern_dark' => array(
                'name' => 'Modern Dark',
                'description' => 'Sleek dark theme for modern professionals',
                'thumbnail' => GMKB_PLUGIN_URL . 'themes/modern_dark/thumbnail.png',
                'isPremium' => false
            ),
            'vibrant_gradient' => array(
                'name' => 'Vibrant Gradient',
                'description' => 'Bold gradients and vibrant colors',
                'thumbnail' => GMKB_PLUGIN_URL . 'themes/vibrant_gradient/thumbnail.png',
                'isPremium' => false
            ),
            'minimal_serif' => array(
                'name' => 'Minimal Serif',
                'description' => 'Elegant serif typography with minimal design',
                'thumbnail' => GMKB_PLUGIN_URL . 'themes/minimal_serif/thumbnail.png',
                'isPremium' => false
            )
        );
        
        return new WP_REST_Response(array(
            'themes' => $available_themes,
            'total' => count($available_themes)
        ), 200);
    }
    
    /**
     * Get available templates
     */
    public function get_templates($request) {
        $templates_dir = GMKB_PLUGIN_DIR . 'templates/presets/';
        $templates = array();
        
        // Hardcoded templates for demo
        $available_templates = array(
            'speaker' => array(
                'name' => 'Professional Speaker',
                'description' => 'Perfect for keynote speakers and thought leaders',
                'components' => array('hero', 'biography', 'topics', 'achievements', 'testimonials', 'booking'),
                'sections' => array(
                    array('layout' => 'full_width'),
                    array('layout' => '2_column'),
                    array('layout' => 'full_width')
                ),
                'thumbnail' => GMKB_PLUGIN_URL . 'templates/thumbnails/speaker.png'
            ),
            'author' => array(
                'name' => 'Author & Writer',
                'description' => 'Showcase books and writing credentials',
                'components' => array('hero', 'biography', 'books', 'press', 'testimonials', 'contact'),
                'sections' => array(
                    array('layout' => 'full_width'),
                    array('layout' => '3_column'),
                    array('layout' => 'full_width')
                ),
                'thumbnail' => GMKB_PLUGIN_URL . 'templates/thumbnails/author.png'
            ),
            'consultant' => array(
                'name' => 'Business Consultant',
                'description' => 'Professional consulting and advisory services',
                'components' => array('hero', 'biography', 'services', 'clients', 'testimonials', 'cta'),
                'sections' => array(
                    array('layout' => 'full_width'),
                    array('layout' => '2_column'),
                    array('layout' => 'full_width')
                ),
                'thumbnail' => GMKB_PLUGIN_URL . 'templates/thumbnails/consultant.png'
            )
        );
        
        return new WP_REST_Response(array(
            'templates' => $available_templates,
            'total' => count($available_templates)
        ), 200);
    }
}

// Initialize the controller
add_action('init', function() {
    new GMKB_REST_MediaKit_Controller();
});
