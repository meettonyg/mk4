<?php
/**
 * Main Plugin Class
 * 
 * Issue #13 FIX: Extracted from guestify-media-kit-builder.php
 * Handles core plugin initialization and component discovery
 * 
 * @package Guestify
 * @since 4.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main plugin class - OPTION A: PURE VUE (PHP RENDERING REMOVED)
 */
class GMKB_Plugin {

    private static $instance;
    private static $initialized = false;
    private $component_discovery;

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
     * Constructor - Initialize plugin
     */
    private function __construct() {
        if (self::$initialized) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: Preventing double initialization - already initialized');
            }
            return;
        }
        self::$initialized = true;
        
        $this->init_component_system();
        $this->init_hooks();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Pure Vue initialization complete');
        }
    }

    /**
     * Initialize component discovery system
     */
    private function init_component_system() {
        // Initialize component system
        $this->component_discovery = new ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components');
        
        // Make globally available
        global $gmkb_component_discovery;
        $gmkb_component_discovery = $this->component_discovery;
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: ComponentDiscovery initialized');
        }
        
        // ROOT FIX: Force immediate scan to ensure components are available for REST API
        // This ensures getRequiredPodsFields() has data when called
        try {
            $scan_result = $this->component_discovery->scan(false);
            $components_found = $this->component_discovery->getComponents();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('📊 GMKB: Found ' . count($components_found) . ' components during initialization');
                
                // Log Pods field discovery for debugging
                $pods_fields = $this->component_discovery->getRequiredPodsFields();
                error_log('🔍 GMKB: Discovered ' . count($pods_fields) . ' unique Pods fields from component configs');
                if (count($pods_fields) > 0) {
                    error_log('  Sample fields: ' . implode(', ', array_slice($pods_fields, 0, 10)));
                }
            }
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Component scan failed: ' . $e->getMessage());
            }
        }
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        add_action('init', array($this, 'load_textdomain'));
        add_action('init', array($this, 'ensure_topics_ajax_handlers_registered'), 5);
        add_action('init', array($this, 'register_offers_cpt'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_shortcode('guestify_media_kit', array($this, 'media_kit_shortcode'));
    }

    /**
     * Load plugin text domain for translations
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'guestify-media-kit-builder',
            false,
            dirname(plugin_basename(GUESTIFY_PLUGIN_DIR . 'guestify-media-kit-builder.php')) . '/languages'
        );
    }

    /**
     * Register Offers CPT and Taxonomy
     *
     * Creates the gmkb_offer custom post type and offer_type taxonomy
     * for managing reusable offers in media kits.
     */
    public function register_offers_cpt() {
        // 1. Register Taxonomy: offer_type
        $labels_tax = array(
            'name'              => _x('Offer Types', 'taxonomy general name', 'guestify-media-kit-builder'),
            'singular_name'     => _x('Offer Type', 'taxonomy singular name', 'guestify-media-kit-builder'),
            'search_items'      => __('Search Offer Types', 'guestify-media-kit-builder'),
            'all_items'         => __('All Offer Types', 'guestify-media-kit-builder'),
            'edit_item'         => __('Edit Offer Type', 'guestify-media-kit-builder'),
            'update_item'       => __('Update Offer Type', 'guestify-media-kit-builder'),
            'add_new_item'      => __('Add New Offer Type', 'guestify-media-kit-builder'),
            'new_item_name'     => __('New Offer Type Name', 'guestify-media-kit-builder'),
            'menu_name'         => __('Offer Types', 'guestify-media-kit-builder'),
        );

        register_taxonomy('offer_type', array('gmkb_offer'), array(
            'hierarchical'      => true,
            'labels'            => $labels_tax,
            'show_ui'           => true,
            'show_in_rest'      => true,
            'query_var'         => true,
            'rewrite'           => array('slug' => 'offer-type'),
        ));

        // 2. Register CPT: gmkb_offer
        $labels_cpt = array(
            'name'                  => _x('Offers', 'Post Type General Name', 'guestify-media-kit-builder'),
            'singular_name'         => _x('Offer', 'Post Type Singular Name', 'guestify-media-kit-builder'),
            'menu_name'             => __('Offers', 'guestify-media-kit-builder'),
            'name_admin_bar'        => __('Offer', 'guestify-media-kit-builder'),
            'archives'              => __('Offer Archives', 'guestify-media-kit-builder'),
            'attributes'            => __('Offer Attributes', 'guestify-media-kit-builder'),
            'parent_item_colon'     => __('Parent Offer:', 'guestify-media-kit-builder'),
            'all_items'             => __('All Offers', 'guestify-media-kit-builder'),
            'add_new_item'          => __('Add New Offer', 'guestify-media-kit-builder'),
            'add_new'               => __('Add New', 'guestify-media-kit-builder'),
            'new_item'              => __('New Offer', 'guestify-media-kit-builder'),
            'edit_item'             => __('Edit Offer', 'guestify-media-kit-builder'),
            'update_item'           => __('Update Offer', 'guestify-media-kit-builder'),
            'view_item'             => __('View Offer', 'guestify-media-kit-builder'),
            'view_items'            => __('View Offers', 'guestify-media-kit-builder'),
            'search_items'          => __('Search Offer', 'guestify-media-kit-builder'),
        );

        $args = array(
            'label'                 => __('Offer', 'guestify-media-kit-builder'),
            'description'           => __('Offers and giveaways for media kits', 'guestify-media-kit-builder'),
            'labels'                => $labels_cpt,
            'supports'              => array('title', 'editor', 'thumbnail', 'custom-fields'),
            'taxonomies'            => array('offer_type'),
            'hierarchical'          => false,
            'public'                => false,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'menu_position'         => 25,
            'menu_icon'             => 'dashicons-tickets-alt',
            'show_in_admin_bar'     => true,
            'show_in_nav_menus'     => true,
            'can_export'            => true,
            'has_archive'           => false,
            'exclude_from_search'   => true,
            'publicly_queryable'    => false,
            'capability_type'       => 'post',
            'show_in_rest'          => true,
            'rest_base'             => 'offers',
        );

        register_post_type('gmkb_offer', $args);

        // 3. Create default taxonomy terms if they don't exist
        $default_terms = array(
            'gift'  => __('Gift', 'guestify-media-kit-builder'),
            'prize' => __('Prize', 'guestify-media-kit-builder'),
            'deal'  => __('Deal', 'guestify-media-kit-builder'),
        );

        foreach ($default_terms as $slug => $name) {
            if (!term_exists($slug, 'offer_type')) {
                wp_insert_term($name, 'offer_type', array('slug' => $slug));
            }
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Registered gmkb_offer CPT and offer_type taxonomy');
        }
    }

    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route('guestify/v1', '/components', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_get_components'),
            'permission_callback' => '__return_true'
        ));
    }

    /**
     * REST API endpoint to get components
     */
    public function rest_get_components() {
        $components = $this->component_discovery->getComponents();
        $categories = $this->component_discovery->getCategories();
        
        return array(
            'success' => true,
            'components' => $components,
            'categories' => $categories,
            'total' => count($components),
            'timestamp' => time()
        );
    }

    /**
     * Media Kit Shortcode - Pure Vue Only
     * NO PHP RENDERING - just loads Vue SPA
     */
    public function media_kit_shortcode($atts) {
        ob_start();
        
        // Always use Pure Vue template
        $template = GUESTIFY_PLUGIN_DIR . 'templates/builder-template-vue-pure.php';
        
        if (file_exists($template)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Loading Pure Vue template via shortcode');
            }
            include $template;
        } else {
            echo '<div style="padding: 20px; text-align: center; background: #fee; border: 2px solid #f88; border-radius: 8px; margin: 20px;">
                <h2>⚠️ Template Not Found</h2>
                <p>Pure Vue template file not found: ' . esc_html($template) . '</p>
                <p>Please ensure the builder-template-vue-pure.php file exists in the templates directory.</p>
            </div>';
        }
        
        return ob_get_clean();
    }

    /**
     * Ensure Topics AJAX handlers are registered
     */
    public function ensure_topics_ajax_handlers_registered() {
        if (class_exists('GMKB_Topics_Ajax_Handler')) {
            $topics_handler = GMKB_Topics_Ajax_Handler::get_instance();
            
            $registered_actions = array(
                'wp_ajax_save_custom_topics',
                'wp_ajax_nopriv_save_custom_topics',
                'wp_ajax_load_stored_topics',
                'wp_ajax_nopriv_load_stored_topics'
            );
            
            foreach ($registered_actions as $action) {
                if (!has_action($action)) {
                    if (strpos($action, 'save') !== false) {
                        add_action($action, array($topics_handler, 'ajax_save_topics'));
                    } else {
                        add_action($action, array($topics_handler, 'ajax_load_topics'));
                    }
                }
            }
        }
    }

    /**
     * Get component discovery instance
     */
    public function get_component_discovery() {
        return $this->component_discovery;
    }

    /**
     * P0 FIX #11: Enhanced post ID detection with validation
     * Ensures post exists and user has permission before allowing access
     */
    public function detect_mkcg_post_id() {
        $post_id = 0;
        
        // P0 FIX #11: Sanitize and validate all inputs
        if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
            $post_id = absint($_GET['post_id']);
        } elseif (isset($_GET['p']) && is_numeric($_GET['p'])) {
            $post_id = absint($_GET['p']);
        } elseif (isset($_GET['page_id']) && is_numeric($_GET['page_id'])) {
            $post_id = absint($_GET['page_id']);
        } elseif (isset($_GET['mkcg_id']) && is_numeric($_GET['mkcg_id'])) {
            $post_id = absint($_GET['mkcg_id']);
        } elseif (isset($_GET['media_kit_id']) && is_numeric($_GET['media_kit_id'])) {
            $post_id = absint($_GET['media_kit_id']);
        } elseif (function_exists('get_the_ID') && get_the_ID()) {
            $post_id = absint(get_the_ID());
        } elseif (isset($GLOBALS['post']) && is_object($GLOBALS['post']) && isset($GLOBALS['post']->ID)) {
            $post_id = absint($GLOBALS['post']->ID);
        }
        
        // P0 FIX #11: Validate post exists and is accessible
        if ($post_id > 0) {
            $post = get_post($post_id);
            
            // Check if post exists
            if (!$post) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB: Invalid post ID - post does not exist: ' . $post_id);
                }
                return 0;
            }
            
            // Check if post is trashed
            if ($post->post_status === 'trash') {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB: Invalid post ID - post is trashed: ' . $post_id);
                }
                return 0;
            }
            
            // P0 FIX #11: Check user permissions
            if (!current_user_can('edit_post', $post_id)) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB: User lacks permission to edit post: ' . $post_id);
                }
                return 0;
            }
        }
        
        return $post_id;
    }
}
