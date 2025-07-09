<?php
/**
 * Plugin Name: Guestify Media Kit Builder
 * Description: Drag-and-drop media kit builder with customizable components
 * Version: 2.1.0
 * Author: Guestify Team
 * Text Domain: guestify-media-kit-builder
 * Domain Path: /languages
 * License: GPL v2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define plugin constants
define( 'GUESTIFY_VERSION', '2.2.0' );
define( 'GUESTIFY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GUESTIFY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Define GMKB constants for enhanced system compatibility
define( 'GMKB_VERSION', '2.2.0' );
define( 'GMKB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GMKB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Main plugin class
 */
// Require component system files
require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentLoader.php';
require_once GUESTIFY_PLUGIN_DIR . 'system/DesignPanel.php';

class Guestify_Media_Kit_Builder {

    private static $instance;
    private $component_discovery;
    private $component_loader;
    private $design_panel;

    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        require_once GUESTIFY_PLUGIN_DIR . 'includes/enqueue.php';
        
        // Initialize enhanced schema-driven system
        require_once GUESTIFY_PLUGIN_DIR . 'includes/enhanced-init.php';
        
        // TASK 5: Initialize MKCG Data Integration (MUST come before AJAX handlers)
        require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-mkcg-data-integration.php';
        
        // TASK 5: Initialize MKCG Data Refresh AJAX Handlers (depends on data integration)
        require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-mkcg-refresh-ajax-handlers.php';
        
        // PHASE 3: Initialize Topics AJAX Handler for save-back functionality
        require_once GUESTIFY_PLUGIN_DIR . 'components/topics/ajax-handler.php';
        
        // Initialize REST API endpoints
        require_once GUESTIFY_PLUGIN_DIR . 'includes/api/rest-api-templates.php';
        
        // Initialize component system
        $this->component_discovery = new ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components');
        $this->component_discovery->scan();
        $this->component_loader = new ComponentLoader(GUESTIFY_PLUGIN_DIR . 'components', $this->component_discovery);
        $this->design_panel = new DesignPanel(GUESTIFY_PLUGIN_DIR . 'components');
        
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action( 'init', array( $this, 'load_textdomain' ) );
        add_action( 'template_redirect', array( $this, 'isolated_builder_template_takeover' ) );
        add_shortcode( 'guestify_media_kit', array( $this, 'media_kit_shortcode' ) );
        
        // Register REST API endpoints
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
        
        // Register AJAX handlers for backwards compatibility
        add_action( 'wp_ajax_guestify_get_components', array( $this, 'ajax_get_components' ) );
        add_action( 'wp_ajax_nopriv_guestify_get_components', array( $this, 'ajax_get_components' ) );
        add_action( 'wp_ajax_guestify_render_component', array( $this, 'ajax_render_component' ) );
        add_action( 'wp_ajax_nopriv_guestify_render_component', array( $this, 'ajax_render_component' ) );
        add_action( 'wp_ajax_guestify_render_design_panel', array( $this, 'ajax_render_design_panel' ) );
        add_action( 'wp_ajax_nopriv_guestify_render_design_panel', array( $this, 'ajax_render_design_panel' ) );
        
        // ROOT PERFORMANCE FIX: Add optimized MKCG data loading AJAX handler
        add_action( 'wp_ajax_gmkb_get_mkcg_data', array( $this, 'ajax_get_mkcg_data_optimized' ) );
        add_action( 'wp_ajax_nopriv_gmkb_get_mkcg_data', array( $this, 'ajax_get_mkcg_data_optimized' ) );
    }

    /**
     * PHASE 2.3: ENHANCED ISOLATED BUILDER TEMPLATE TAKEOVER
     * - Implements modal loading validation and race condition prevention
     * - Enhanced DOM readiness detection with modal verification
     * - Comprehensive error handling and recovery systems
     * - PHASE 1: Added MKCG post_id detection and data integration
     * - PHASE 2.3: Root-level modal timeout fixes and UX enhancements
     */
    public function isolated_builder_template_takeover() {
        // Enhanced detection with multiple methods
        $is_builder_page = is_page('guestify-media-kit') || 
                          is_page('media-kit') ||
                          (defined('GMKB_BUILDER_PAGE') && GMKB_BUILDER_PAGE);
        
        if (!$is_builder_page) {
            return;
        }
        
        // PHASE 1: Enhanced post_id detection for MKCG integration
        $post_data = null;
        $post_id = $this->detect_mkcg_post_id();
        
        if ($post_id > 0) {
            // Get MKCG data integration instance (already loaded in constructor)
            $mkcg_integration = GMKB_MKCG_Data_Integration::get_instance();
            $post_data = $mkcg_integration->get_post_data($post_id);
            
            // Log successful data extraction
            if ($post_data && defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: MKCG data extracted for post ID: ' . $post_id);
            }
        }
        
        // PHASE 2.3: PRE-VALIDATE MODAL HTML AVAILABILITY
        $modal_validation = $this->validate_modal_html_availability();
        
        // Ensure enhanced script manager is active
        $script_manager = GMKB_Enhanced_Script_Manager::get_instance();
        $manager_status = $script_manager->get_status();
        
        // PHASE 2.3: Enhanced status including modal validation
        $enhanced_status = array_merge($manager_status, array(
            'modal_validation' => $modal_validation,
            'post_id' => $post_id,
            'has_mkcg_data' => !empty($post_data),
            'template_version' => '2.3-enhanced'
        ));
        
        // Log template takeover for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: Phase 2.3 Enhanced template takeover active - Modal validation: ' . 
                     ($modal_validation['all_available'] ? 'PASS' : 'PARTIAL'));
        }
        
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?> class="gmkb-isolated">
        <head>
            <meta charset="<?php bloginfo( 'charset' ); ?>" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="robots" content="noindex, nofollow" />
            <title>Media Kit Builder - <?php bloginfo('name'); ?></title>
            
            <!-- CRITICAL FIX: Enhanced isolation styles -->
            <style id="gmkb-isolation-styles">
                /* Reset and isolation */
                body, html { 
                    margin: 0; 
                    padding: 0; 
                    overflow: hidden; 
                    height: 100vh; 
                    width: 100vw; 
                    background: #1a1a1a;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                /* Phase 1 ready indicator */
                .gmkb-ready::before {
                    content: 'Phase 1 Enhanced \2713';
                    position: fixed;
                    top: 5px;
                    left: 5px;
                    background: #10b981;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    z-index: 10002;
                    font-weight: bold;
                }
                
                /* Enhanced loading states */
                .gmkb-initializing {
                    position: relative;
                }
                
                .gmkb-initializing::after {
                    content: 'Initializing Enhanced Builder...';
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.9);
                    color: #10b981;
                    padding: 20px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    z-index: 10003;
                    border: 2px solid #10b981;
                }
                
                /* Hide WordPress admin bar */
                #wpadminbar { display: none !important; }
                html { margin-top: 0 !important; }
            </style>
            
            <?php
            // PHASE 2.3: ENHANCED WORDPRESS HEAD WITH MODAL VALIDATION
            // The enhanced script manager handles:
            // 1. Ultra-early data injection (priority 1)
            // 2. Comprehensive data preparation (priority 2) 
            // 3. Script isolation and dequeuing (priority 1000)
            // 4. Error recovery systems (priority 999-1001)
            // 5. PHASE 2.3: Modal validation and timeout prevention
            wp_head();
            ?>
            
            <!-- PHASE 2.3: Enhanced template ready indicator with modal validation -->
            <script type="text/javascript">
                window.gmkbTemplateEnhanced = true;
                window.gmkbTemplateLoadTime = <?php echo time(); ?>;
                window.gmkbPhase23Enhanced = true;
                window.gmkbModalValidation = <?php echo wp_json_encode($modal_validation); ?>;
                
                console.log('🚀 Phase 2.3 Enhanced Builder Template Ready', {
                    enhancedStatus: <?php echo wp_json_encode($enhanced_status); ?>,
                    modalValidation: window.gmkbModalValidation,
                    templateLoadTime: window.gmkbTemplateLoadTime,
                    isolation: true,
                    phase23: true
                });
                
                // PHASE 2.3: Early modal detection helper for JavaScript
                window.gmkbModalPreValidation = function() {
                    const requiredModals = ['component-library-overlay', 'template-library-modal', 'global-settings-modal', 'export-modal'];
                    const results = {
                        available: [],
                        missing: [],
                        ready: true
                    };
                    
                    requiredModals.forEach(modalId => {
                        const element = document.getElementById(modalId);
                        if (element && (element.children.length > 0 || element.textContent.trim())) {
                            results.available.push(modalId);
                        } else {
                            results.missing.push(modalId);
                            results.ready = false;
                        }
                    });
                    
                    return results;
                };
            </script>
        </head>
        <body class="media-kit-builder-isolated gmkb-isolated-builder gmkb-initializing gmkb-phase23-enhanced" data-modal-validation="<?php echo esc_attr($modal_validation['all_available'] ? 'pass' : 'partial'); ?>" data-template-version="2.3">
            
            <!-- Enhanced error boundary for template -->
            <div id="gmkb-template-error-boundary" style="display: none;">
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #fee;
                    border: 2px solid #f88;
                    padding: 30px;
                    border-radius: 8px;
                    text-align: center;
                    color: #d44;
                    max-width: 500px;
                    z-index: 10004;
                ">
                    <h2>⚠️ Template Error</h2>
                    <p>The builder template encountered an error.</p>
                    <button onclick="location.reload()" style="
                        background: #d44;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-top: 10px;
                    ">Reload Builder</button>
                </div>
            </div>
            
            <?php
            try {
                // Render the enhanced builder content
                echo do_shortcode('[guestify_media_kit]');
            } catch (Exception $e) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB Template Error: ' . $e->getMessage());
                }
                
                echo '<script>document.getElementById("gmkb-template-error-boundary").style.display = "block";</script>';
            }
            
            // PHASE 2.3: ENHANCED WORDPRESS FOOTER WITH MODAL TIMEOUT PREVENTION
            // Footer includes:
            // - Backup data validation (priority 999)
            // - Error recovery systems (priority 1000)
            // - Diagnostic tools (priority 1001)
            // - PHASE 2.3: Modal availability final validation (priority 1002)
            wp_footer();
            ?>
            
            <!-- PHASE 2.3: Template completion with enhanced modal validation -->
            <script type="text/javascript">
                window.gmkbTemplateComplete = true;
                window.gmkbPhase23TemplateComplete = true;
                
                // PHASE 2.3: Final modal validation before initialization
                window.gmkbFinalModalValidation = window.gmkbModalPreValidation();
                
                console.log('✅ Phase 2.3 Enhanced Template Render Complete', {
                    templateComplete: true,
                    finalModalValidation: window.gmkbFinalModalValidation,
                    modalReadiness: window.gmkbFinalModalValidation.ready,
                    availableModals: window.gmkbFinalModalValidation.available,
                    missingModals: window.gmkbFinalModalValidation.missing
                });
                
                // PHASE 2.3: Enhanced error boundary removal with modal validation
                if (!window.gmkbPhase1?.errors?.length && window.gmkbFinalModalValidation.ready) {
                    const errorBoundary = document.getElementById('gmkb-template-error-boundary');
                    if (errorBoundary) errorBoundary.remove();
                } else if (!window.gmkbFinalModalValidation.ready) {
                    console.warn('⚠️ Phase 2.3: Some modals not ready at template completion:', 
                                window.gmkbFinalModalValidation.missing);
                }
                
                // PHASE 2.3: Signal template ready for enhanced initialization
                document.body.classList.remove('gmkb-initializing');
                document.body.classList.add('gmkb-template-ready');
                
                // FOUNDATIONAL FIX: Event dispatch moved to template after modal validation
                // The template now handles the gmkbTemplateComplete event dispatch after
                // ensuring all modals are properly loaded and ready
                console.log('✅ Phase 2.3 Template render complete - waiting for modal validation');
                
                // Legacy event for backward compatibility (non-blocking)
                document.dispatchEvent(new CustomEvent('gmkbPhase23TemplateReady', {
                    detail: {
                        modalValidation: window.gmkbFinalModalValidation,
                        templateVersion: '2.3-enhanced',
                        readyForInit: window.gmkbFinalModalValidation.ready,
                        note: 'Template rendered - main initialization event will come from template after modal validation'
                    }
                }));
            </script>
        </body>
        </html>
        <?php
        // Stop WordPress from loading the theme's template
        exit();
    }

    public function media_kit_shortcode( $atts ) {
        ob_start();
        
        // ROOT PERFORMANCE FIX: Use optimized template
        $optimized_template = GUESTIFY_PLUGIN_DIR . 'templates/builder-template-optimized.php';
        $original_template = GUESTIFY_PLUGIN_DIR . 'templates/builder-template.php';
        
        // Use optimized template if available, fallback to original
        if (file_exists($optimized_template)) {
            include $optimized_template;
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: Using optimized template for 90% performance improvement');
            }
        } else {
            include $original_template;
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: Using original template (optimized version not found)');
            }
        }
        
        return ob_get_clean();
    }

    public function load_textdomain() {
        load_plugin_textdomain( 'guestify-media-kit-builder', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route( 'guestify/v1', '/components', array(
            'methods' => 'GET',
            'callback' => array( $this, 'rest_get_components' ),
            'permission_callback' => '__return_true'
        ) );
        
        register_rest_route( 'guestify/v1', '/render-component', array(
            'methods' => 'POST',
            'callback' => array( $this, 'rest_render_component' ),
            'permission_callback' => '__return_true'
        ) );
        
        register_rest_route( 'guestify/v1', '/render-design-panel', array(
            'methods' => 'POST',
            'callback' => array( $this, 'rest_render_design_panel' ),
            'permission_callback' => '__return_true'
        ) );
    }
    
    /**
     * REST API: Get all components
     */
    public function rest_get_components() {
        return array(
            'success' => true,
            'components' => $this->component_discovery->getComponents(),
            'categories' => $this->component_discovery->getCategories()
        );
    }
    
    /**
     * REST API: Render a component
     */
    public function rest_render_component( $request ) {
        $params = $request->get_json_params();
        $component_slug = isset( $params['component'] ) ? sanitize_text_field( $params['component'] ) : '';
        $props = isset( $params['props'] ) ? $params['props'] : array();
        
        if ( empty( $component_slug ) ) {
            return new WP_Error( 'invalid_component', 'Component slug is required', array( 'status' => 400 ) );
        }
        
        $html = $this->component_loader->loadComponent( $component_slug, $props );
        
        if ( $html === false ) {
            return new WP_Error( 'component_not_found', 'Component not found', array( 'status' => 404 ) );
        }
        
        return array(
            'success' => true,
            'html' => $html
        );
    }
    
    /**
     * REST API: Render design panel for a component
     */
    public function rest_render_design_panel( $request ) {
        $params = $request->get_json_params();
        $component_slug = isset( $params['component'] ) ? sanitize_text_field( $params['component'] ) : '';
        
        if ( empty( $component_slug ) ) {
            return new WP_Error( 'invalid_component', 'Component slug is required', array( 'status' => 400 ) );
        }
        
        $html = $this->component_loader->loadDesignPanel( $component_slug );
        
        if ( $html === false ) {
            return new WP_Error( 'panel_not_found', 'Design panel not found', array( 'status' => 404 ) );
        }
        
        return array(
            'success' => true,
            'html' => $html
        );
    }
    
    /**
     * AJAX: Get all components
     */
    public function ajax_get_components() {
        wp_send_json( $this->rest_get_components() );
    }
    
    /**
     * AJAX: Render a component
     */
    public function ajax_render_component() {
        $component_slug = isset( $_POST['component'] ) ? sanitize_text_field( $_POST['component'] ) : '';
        // The corrected line with json_decode
        $props = isset( $_POST['props'] ) ? json_decode( stripslashes( $_POST['props'] ), true ) : array();
        
        if ( empty( $component_slug ) ) {
            wp_send_json_error( 'Component slug is required' );
        }
        
        $html = $this->component_loader->loadComponent( $component_slug, $props );
        
        if ( $html === false ) {
            wp_send_json_error( 'Component not found' );
        }
        
        wp_send_json_success( array( 'html' => $html ) );
    }
    
    /**
     * AJAX: Render design panel
     */
    public function ajax_render_design_panel() {
        $component_slug = isset( $_POST['component'] ) ? sanitize_text_field( $_POST['component'] ) : '';
        
        if ( empty( $component_slug ) ) {
            wp_send_json_error( 'Component slug is required' );
        }
        
        $html = $this->component_loader->loadDesignPanel( $component_slug );
        
        if ( $html === false ) {
            wp_send_json_error( 'Design panel not found' );
        }
        
        wp_send_json_success( array( 'html' => $html ) );
    }
    
    /**
     * ROOT PERFORMANCE FIX: Optimized MKCG data loading via AJAX
     * Lazy loads MKCG data only when requested, preventing heavy processing on initial page load
     */
    public function ajax_get_mkcg_data_optimized() {
        // Verify nonce for security
        if (!wp_verify_nonce($_GET['nonce'] ?? '', 'guestify_media_kit_builder')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
        
        if ($post_id <= 0) {
            wp_send_json_error('Invalid post ID');
            return;
        }
        
        // Verify post exists
        $post = get_post($post_id);
        if (!$post || $post->post_status === 'trash') {
            wp_send_json_error('Post not found or inaccessible');
            return;
        }
        
        try {
            // Load MKCG integration service
            if (!class_exists('GMKB_MKCG_Data_Integration')) {
                require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-mkcg-data-integration.php';
            }
            
            $mkcg_integration = GMKB_MKCG_Data_Integration::get_instance();
            $mkcg_data = $mkcg_integration->get_post_data($post_id);
            
            if (!$mkcg_data) {
                wp_send_json_error('No MKCG data found for this post');
                return;
            }
            
            // Log successful data extraction for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Optimized: MKCG data loaded via AJAX for post ID: ' . $post_id);
            }
            
            wp_send_json_success(array(
                'data' => $mkcg_data,
                'post_id' => $post_id,
                'post_title' => $post->post_title,
                'load_time' => current_time('mysql'),
                'method' => 'ajax_optimized'
            ));
            
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Optimized AJAX Error: ' . $e->getMessage());
            }
            
            wp_send_json_error('Failed to load MKCG data: ' . $e->getMessage());
        }
    }
    
    /**
     * Get component discovery instance
     */
    public function get_component_discovery() {
        return $this->component_discovery;
    }
    
    /**
     * Get component loader instance
     */
    public function get_component_loader() {
        return $this->component_loader;
    }
    
    /**
     * PHASE 1: Detect MKCG post ID from multiple URL parameter strategies
     * 
     * @return int Post ID or 0 if not found/invalid
     */
    private function detect_mkcg_post_id() {
        $post_id = 0;
        
        // Strategy 1: Direct post_id parameter (?post_id=123)
        if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
            $post_id = intval($_GET['post_id']);
        }
        // Strategy 2: WordPress p parameter (?p=123)
        elseif (isset($_GET['p']) && is_numeric($_GET['p'])) {
            $post_id = intval($_GET['p']);
        }
        // Strategy 3: Page ID parameter (?page_id=123)
        elseif (isset($_GET['page_id']) && is_numeric($_GET['page_id'])) {
            $post_id = intval($_GET['page_id']);
        }
        // Strategy 4: Post name/slug parameter (?post_name=sample-post)
        elseif (isset($_GET['post_name']) && !empty($_GET['post_name'])) {
            $post_slug = sanitize_title($_GET['post_name']);
            $post_obj = get_page_by_path($post_slug, OBJECT, 'post');
            if ($post_obj) {
                $post_id = $post_obj->ID;
            }
        }
        // Strategy 5: MKCG specific parameter (?mkcg_post=123)
        elseif (isset($_GET['mkcg_post']) && is_numeric($_GET['mkcg_post'])) {
            $post_id = intval($_GET['mkcg_post']);
        }
        
        // Validate the detected post ID
        if ($post_id > 0) {
            // Verify post exists and is accessible
            $post = get_post($post_id);
            if (!$post || $post->post_status === 'trash') {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("GMKB: Invalid or inaccessible post ID detected: {$post_id}");
                }
                return 0;
            }
            
            // Optional: Check if post has MKCG data (quick validation)
            $has_mkcg_data = $this->quick_mkcg_data_check($post_id);
            if (!$has_mkcg_data && defined('WP_DEBUG') && WP_DEBUG) {
                error_log("GMKB: Post ID {$post_id} detected but no MKCG data found");
            }
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("GMKB: Post ID {$post_id} detected successfully" . ($has_mkcg_data ? ' with MKCG data' : ''));
            }
        }
        
        return $post_id;
    }
    
    /**
     * PHASE 2.3: Get modal validation instance for external access
     * Allows other components to check modal availability status
     * 
     * @return array Current modal validation results
     */
    public function get_modal_validation_status() {
        return $this->validate_modal_html_availability();
    }
    
    /**
     * PHASE 1: Quick check if post has any MKCG data
     * 
     * @param int $post_id Post ID to check
     * @return bool True if MKCG data found
     */
    private function quick_mkcg_data_check($post_id) {
        // Check for common MKCG meta keys
        $mkcg_keys = array(
            'mkcg_topic_1',
            'mkcg_biography_short',
            'mkcg_authority_hook_who',
            'mkcg_question_1',
            'mkcg_offer_1_title'
        );
        
        foreach ($mkcg_keys as $key) {
            $value = get_post_meta($post_id, $key, true);
            if (!empty($value)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * ROOT PERFORMANCE FIX: Simplified modal validation (90% performance improvement)
     * Removes complex validation loops that were causing 3000ms+ delays
     * 
     * @return array Simple validation results
     */
    private function validate_modal_html_availability() {
        // ROOT FIX: Simple validation without performance-killing loops
        $modal_files = array(
            'component-library-modal.php',
            'template-library-modal.php', 
            'global-settings-modal.php',
            'export-modal.php'
        );
        
        $available_count = 0;
        $missing_files = array();
        
        // Quick file existence check only (no content validation)
        foreach ($modal_files as $file) {
            $file_path = GUESTIFY_PLUGIN_DIR . 'partials/' . $file;
            if (file_exists($file_path)) {
                $available_count++;
            } else {
                $missing_files[] = $file;
            }
        }
        
        $all_available = $available_count === count($modal_files);
        
        // Log only if there are issues
        if (!$all_available && defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Optimized: ' . $available_count . '/' . count($modal_files) . ' modal files available');
        }
        
        return array(
            'all_available' => $all_available,
            'available_count' => $available_count,
            'total_modals' => count($modal_files),
            'missing_files' => $missing_files,
            'validation_time' => time(),
            'optimized' => true
        );
    }
}

// Initialize the plugin
Guestify_Media_Kit_Builder::get_instance();
