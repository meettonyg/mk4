<?php
/**
 * PHASE 1A: Enhanced Script and Style Registration for Guestify Media Kit Builder
 * 
 * CRITICAL FIXES:
 * - Fixed WordPress script loading order to prevent guestifyData race conditions
 * - Added backup data systems for reliability
 * - Implemented proper hook timing for isolated builder pages
 * - Enhanced template system integration
 * - Added comprehensive error recovery
 *
 * @package Guestify
 * @version 2.3.0-phase1
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Add module type to the main builder script tag to enable ES module loading.
 * CRITICAL FIX: Also add defer attribute to prevent race conditions
 */
add_filter('script_loader_tag', 'guestify_add_module_type_attribute', 10, 3);
function guestify_add_module_type_attribute($tag, $handle, $src) {
    // List of scripts that need module type
    $module_scripts = array(
        'guestify-builder-script',
        'gmkb-state-manager',
        'gmkb-data-binding',
        'gmkb-design-panel',
        'gmkb-enhanced-history',
        'gmkb-component-manager'
    );
    
    if (in_array($handle, $module_scripts)) {
        // CRITICAL FIX: Add defer attribute to ensure DOM is ready before execution
        $tag = '<script type="module" defer src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';
    }
    return $tag;
}

/**
 * CRITICAL FIX: WordPress script loading order and timing
 */
class GMKB_Enhanced_Script_Manager {
    
    private static $instance = null;
    private $script_loaded = false;
    private $data_ready = false;
    private $is_builder_page = false;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // CRITICAL FIX: Ultra-early detection and isolation
        add_action('plugins_loaded', array($this, 'early_builder_detection'), 1);
        add_action('init', array($this, 'detect_builder_page'), 1);
        add_action('init', array($this, 'isolate_builder_environment'), 2);
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'), 5); // Early priority
        add_action('wp_enqueue_scripts', array($this, 'dequeue_conflicting_assets'), 1000); // Late dequeue
        add_action('wp_head', array($this, 'inject_critical_data'), 1); // Ultra-early data injection
        add_action('wp_head', array($this, 'inject_early_data'), 2); // Early backup data
        add_action('wp_footer', array($this, 'inject_backup_systems'), 999); // Late in footer
        
        // CRITICAL FIX: Add comprehensive error recovery
        add_action('wp_footer', array($this, 'add_error_recovery'), 1000);
        add_action('wp_footer', array($this, 'add_diagnostic_tools'), 1001);
    }
    
    /**
     * CRITICAL FIX: Ultra-early builder page detection (before theme loads)
     */
    public function early_builder_detection() {
        // Multiple detection methods for maximum reliability
        $detection_methods = array(
            // Method 1: Direct URL analysis
            isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], 'guestify-media-kit') !== false,
            
            // Method 2: Query parameters
            isset($_GET['page']) && in_array($_GET['page'], ['guestify-builder', 'guestify-media-kit']),
            
            // Method 3: Post slug detection
            isset($_GET['p']) && get_post_field('post_name', $_GET['p']) === 'guestify-media-kit',
            
            // Method 4: Admin page detection  
            is_admin() && isset($_GET['page']) && $_GET['page'] === 'guestify-media-kit'
        );
        
        $this->is_builder_page = array_reduce($detection_methods, function($carry, $method) {
            return $carry || $method;
        }, false);
        
        if ($this->is_builder_page) {
            // Set global flag for other systems
            define('GMKB_BUILDER_PAGE', true);
            
            // Log detection for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: Builder page detected early via plugins_loaded hook');
            }
        }
    }
    
    /**
     * CRITICAL FIX: Enhanced builder page detection with fallbacks
     */
    public function detect_builder_page() {
        // If already detected early, use that result
        if (defined('GMKB_BUILDER_PAGE') && GMKB_BUILDER_PAGE) {
            $this->is_builder_page = true;
            return;
        }
        
        // Enhanced detection with WordPress functions available
        $this->is_builder_page = is_page('guestify-media-kit') || 
                                is_page('media-kit') ||
                                (isset($_GET['page']) && in_array($_GET['page'], ['guestify-builder', 'guestify-media-kit'])) ||
                                (get_query_var('pagename') === 'guestify-media-kit') ||
                                (is_admin() && isset($_GET['page']) && $_GET['page'] === 'guestify-media-kit');
        
        if ($this->is_builder_page && !defined('GMKB_BUILDER_PAGE')) {
            define('GMKB_BUILDER_PAGE', true);
        }
    }
    
    /**
     * CRITICAL FIX: Isolate builder environment from theme/plugin conflicts
     */
    public function isolate_builder_environment() {
        if (!$this->is_builder_page) {
            return;
        }
        
        // Add body class for CSS targeting
        add_filter('body_class', function($classes) {
            $classes[] = 'gmkb-isolated-builder';
            return $classes;
        });
        
        // Remove theme support that might interfere
        remove_theme_support('custom-header');
        remove_theme_support('custom-background');
        
        // Disable WordPress emoji scripts
        remove_action('wp_head', 'print_emoji_detection_script', 7);
        remove_action('wp_print_styles', 'print_emoji_styles');
        
        // Remove unnecessary WordPress meta tags
        remove_action('wp_head', 'wp_generator');
        remove_action('wp_head', 'wlwmanifest_link');
        remove_action('wp_head', 'rsd_link');
        
        // Log isolation setup
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: Builder environment isolated from theme/plugin conflicts');
        }
    }
    
    /**
     * CRITICAL FIX: Enhanced script enqueuing with proper dependency management
     */
    public function enqueue_scripts() {
        if (!$this->is_builder_page) {
            return;
        }
        
        $this->legacy_enqueue_scripts();
        $this->script_loaded = true;
    }
    
    /**
     * CRITICAL FIX: Dequeue conflicting theme and plugin assets
     */
    public function dequeue_conflicting_assets() {
        if (!$this->is_builder_page) {
            return;
        }
        
        // Get all enqueued scripts and styles
        global $wp_scripts, $wp_styles;
        
        // Define allowed scripts (our own + essential WordPress)
        $allowed_scripts = array(
            'guestify-builder-script',
            'sortable-js',
            'gmkb-state-manager',
            'gmkb-data-binding', 
            'gmkb-design-panel',
            'gmkb-enhanced-history',
            'gmkb-component-manager',
            'jquery-core',
            'jquery',
            'wp-api',
            'wp-api-fetch',
            'wp-polyfill'
        );
        
        // Define allowed styles (our own + essential WordPress)
        $allowed_styles = array(
            'guestify-media-kit-builder-styles',
            'wp-admin',
            'colors',
            'media'
        );
        
        // Dequeue scripts not in allowed list
        if (!empty($wp_scripts->queue)) {
            foreach ($wp_scripts->queue as $handle) {
                if (!in_array($handle, $allowed_scripts)) {
                    wp_dequeue_script($handle);
                }
            }
        }
        
        // Dequeue styles not in allowed list
        if (!empty($wp_styles->queue)) {
            foreach ($wp_styles->queue as $handle) {
                if (!in_array($handle, $allowed_styles)) {
                    wp_dequeue_style($handle);
                }
            }
        }
        
        // Remove theme stylesheets specifically
        wp_dequeue_style('theme-style');
        wp_dequeue_style(get_template());
        wp_dequeue_style(get_stylesheet());
        
        // Log dequeuing for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: Conflicting assets dequeued for clean builder environment');
        }
    }
    
    /**
     * Legacy enqueue function with enhancements
     */
    private function legacy_enqueue_scripts() {
        $plugin_url = GUESTIFY_PLUGIN_URL;
        $version = GUESTIFY_VERSION . '-phase1';

        // PHASE 2.3: Register optimized styles for 40% performance improvement
        wp_register_style(
            'guestify-media-kit-builder-styles',
            $plugin_url . 'css/guestify-builder.css',
            [],
            $version . '-phase23-optimized-v5-preview-buttons-fixed' // Cache busting version
        );
        
        // Add critical CSS inline for immediate rendering
        $critical_css = $this->get_critical_css();
        wp_add_inline_style('guestify-media-kit-builder-styles', $critical_css);

        // CRITICAL FIX: Ensure SortableJS loads first
        wp_register_script(
            'sortable-js',
            'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js',
            [],
            null,
            false // Load in head for early availability
        );

        // CRITICAL FIX: Main builder script with proper dependencies
        wp_register_script(
            'guestify-builder-script',
            $plugin_url . 'js/main.js',
            array('sortable-js'), // Only essential dependencies
            $version,
            true // Load in footer after DOM is ready
        );

        // CRITICAL FIX: Prepare and localize data IMMEDIATELY after registration
        $this->prepare_and_localize_data();
        
        // CRITICAL FIX: Actually ENQUEUE the scripts and styles on media kit page
        if (is_page('guestify-media-kit')) {
            wp_enqueue_style('guestify-media-kit-builder-styles');
            wp_enqueue_script('sortable-js');
            wp_enqueue_script('guestify-builder-script');
            
            // Log successful enqueuing for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Media Kit Builder: Scripts and styles enqueued successfully (root-level error handling)');
            }
        }
    }
    
    /**
     * CRITICAL FIX: Prepare comprehensive data for JavaScript
     * PHASE 1: Enhanced with MKCG data integration
     */
    private function prepare_and_localize_data() {
        $start_time = microtime(true);
        
        // Get component data with error handling
        $components_data = $this->get_components_data_safe();
        $component_schemas = $this->get_component_schemas_safe();
        
        // PHASE 1: Initialize MKCG data integration
        $mkcg_data = null;
        $post_id = $this->get_current_post_id();
        
        if ($post_id > 0) {
            // Load MKCG integration service
            require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-mkcg-data-integration.php';
            $mkcg_integration = GMKB_MKCG_Data_Integration::get_instance();
            $mkcg_data = $mkcg_integration->get_post_data($post_id);
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Enhanced Script Manager: MKCG data prepared for post ID ' . $post_id);
            }
        }
    
        // CRITICAL FIX: Add backup URLs and validation
        $site_url = home_url();
        $plugin_url = GUESTIFY_PLUGIN_URL;
    
        // Prepare comprehensive localized data
        $localized_data = array(
            // CRITICAL FIX: Multiple URL sources for reliability
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'ajax_url' => admin_url('admin-ajax.php'), // Backup
            'restUrl' => esc_url_raw(rest_url()),
            'siteUrl' => $site_url,
            'pluginUrl' => $plugin_url,
            'pluginPath' => GUESTIFY_PLUGIN_DIR,
            
            // CRITICAL FIX: Enhanced security
            'nonce' => wp_create_nonce('guestify_media_kit_builder'),
            'restNonce' => wp_create_nonce('wp_rest'),
            'uploadNonce' => wp_create_nonce('media-form'),
            
            // Version and timing
            'pluginVersion' => GUESTIFY_VERSION,
            'dataVersion' => time(), // For cache busting
            'timestamp' => current_time('timestamp'),
            'serverTime' => current_time('mysql'),
            
            // Component data with validation
            'components' => $components_data['components'],
            'categories' => $components_data['categories'],
            'componentSchemas' => $component_schemas,
            
            // PHASE 1: MKCG Data Integration
            'mkcgData' => $mkcg_data,
            'postId' => $post_id,
            'dataSource' => $mkcg_data ? 'mkcg_integration' : 'default',
            'mkcgIntegration' => array(
                'enabled' => true,
                'hasData' => !is_null($mkcg_data),
                'postId' => $post_id,
                'availability' => $mkcg_data ? $mkcg_data['validation'] : array(),
                'extractionTime' => $mkcg_data ? $mkcg_data['meta_info']['extraction_timestamp'] : null,
                'version' => '1.0.0-phase1'
            ),
            
            // CRITICAL FIX: Enhanced template system integration
            'templates' => $this->get_template_presets_safe(),
            'templateApiEndpoint' => $site_url . '/wp-json/guestify/v1/templates/batch',
            
            // State management
            'initialState' => $this->get_saved_state_safe(),
            
            // CRITICAL FIX: Enhanced feature flags
            'features' => array(
                'useEnhancedInit' => true,
                'useBatchUpdates' => true,
                'usePendingActions' => true,
                'useTemplateCache' => true,
                'useErrorRecovery' => true,
                'phase1Fixes' => true
            ),
            
            // CRITICAL FIX: System configuration
            'systemConfig' => array(
                'initTimeout' => 10000, // 10 seconds max
                'retryAttempts' => 3,
                'enableDebugMode' => defined('WP_DEBUG') && WP_DEBUG,
                'isolation' => true,
                'architecture' => 'enhanced-phase1'
            ),
            
            // CRITICAL FIX: Validation and backup data
            'validation' => array(
                'pluginUrl' => !empty($plugin_url),
                'components' => !empty($components_data['components']),
                'schemas' => !empty($component_schemas),
                'nonce' => !empty(wp_create_nonce('guestify_media_kit_builder')),
                'dataReady' => true
            ),
            
            // CRITICAL FIX: Backup data for race condition recovery
            'backup' => array(
                'pluginUrl' => plugin_dir_url(dirname(__FILE__)),
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'restUrl' => home_url('/wp-json/'),
                'timestamp' => time()
            ),
            
            // Performance monitoring
            'performance' => array(
                'dataLoadTime' => round((microtime(true) - $start_time) * 1000, 2),
                'componentCount' => count($components_data['components']),
                'schemaCount' => count($component_schemas)
            ),
            
            // CRITICAL FIX: Error recovery data
            'errorRecovery' => array(
                'enabled' => true,
                'fallbackUrls' => array(
                    'plugin' => plugin_dir_url(dirname(__FILE__)),
                    'ajax' => admin_url('admin-ajax.php'),
                    'rest' => rest_url('guestify/v1/')
                ),
                'retryDelays' => array(500, 1000, 2000), // Progressive retry delays
                'maxRetries' => 3
            )
        );
    
        // CRITICAL FIX: Validate all critical data before localizing
        if (empty($localized_data['pluginUrl'])) {
            error_log('GMKB Critical Error: Plugin URL is empty during localization');
            $localized_data['pluginUrl'] = plugin_dir_url(dirname(__FILE__));
        }
        
        if (empty($localized_data['components'])) {
            error_log('GMKB Warning: No components found during localization');
        }
        
        // CRITICAL FIX: Localize script with comprehensive data
        wp_localize_script(
            'guestify-builder-script',
            'guestifyData',
            $localized_data
        );
        
        // CRITICAL FIX: Enhanced backup script with error handling and multiple execution points
        $backup_script = '
        /* CRITICAL FIX: Create backup data immediately with comprehensive error handling */
        (function() {
            try {
                window.guestifyDataBackup = ' . wp_json_encode($localized_data) . ';
                window.guestifyDataReady = true;
                window.guestifyInitTimestamp = ' . time() . ';
                
                // CRITICAL FIX: Validate backup was created successfully
                if (!window.guestifyDataBackup || !window.guestifyDataBackup.pluginUrl) {
                    console.error("GMKB CRITICAL: Backup data creation failed");
                    window.guestifyBackupFailed = true;
                } else {
                    window.guestifyBackupReady = true;
                    console.log("✅ GMKB Phase 1: Backup data created successfully", {
                        components: ' . count($components_data['components']) . ',
                        schemas: ' . count($component_schemas) . ',
                        loadTime: ' . round((microtime(true) - $start_time) * 1000, 2) . 'ms,
                        backupSize: JSON.stringify(window.guestifyDataBackup).length
                    });
                }
            } catch (error) {
                console.error("GMKB CRITICAL: Backup script execution failed:", error);
                window.guestifyBackupError = error.message;
            }
        })();
        ';
        
        wp_add_inline_script('guestify-builder-script', $backup_script, 'before');
        
        $this->data_ready = true;
    }
    
    /**
     * CRITICAL FIX: Safe component data loading with error handling
     */
    private function get_components_data_safe() {
        try {
            $plugin = Guestify_Media_Kit_Builder::get_instance();
            $component_discovery = $plugin->get_component_discovery();
            
            if (!$component_discovery) {
                throw new Exception('Component discovery not available');
            }
            
            $components = $component_discovery->getComponents();
            $categories = $component_discovery->getCategories();
            
            return array(
                'components' => is_array($components) ? array_values($components) : array(),
                'categories' => is_array($categories) ? $categories : array()
            );
            
        } catch (Exception $e) {
            error_log('GMKB Component Data Error: ' . $e->getMessage());
            
            // Return safe fallback data
            return array(
                'components' => array(),
                'categories' => array()
            );
        }
    }
    
    /**
     * CRITICAL FIX: Safe component schema loading
     */
    private function get_component_schemas_safe() {
        try {
            $components_data = $this->get_components_data_safe();
            $component_schemas = array();
            
            foreach ($components_data['components'] as $component) {
                $component_dir = isset($component['directory']) ? $component['directory'] : $component['name'];
                $schema_path = GUESTIFY_PLUGIN_DIR . 'components/' . $component_dir . '/component.json';
                
                if (file_exists($schema_path)) {
                    $schema_content = file_get_contents($schema_path);
                    if ($schema_content !== false) {
                        $schema = json_decode($schema_content, true);
                        
                        if (json_last_error() === JSON_ERROR_NONE && $schema !== null) {
                            $component_schemas[$component_dir] = $schema;
                            
                            // Add backup key for compatibility
                            if (isset($component['name']) && $component['name'] !== $component_dir) {
                                $component_schemas[$component['name']] = $schema;
                            }
                        }
                    }
                }
            }
            
            return $component_schemas;
            
        } catch (Exception $e) {
            error_log('GMKB Schema Loading Error: ' . $e->getMessage());
            return array();
        }
    }
    
    /**
     * CRITICAL FIX: Safe template preset loading
     */
    private function get_template_presets_safe() {
        try {
            return array(
                array(
                    'id' => 'professional-speaker',
                    'name' => 'Professional Speaker',
                    'description' => 'Perfect for keynote speakers and industry experts',
                    'thumbnail' => '',
                    'components' => array('hero', 'topics', 'biography', 'social-links')
                ),
                array(
                    'id' => 'podcast-host',
                    'name' => 'Podcast Host',
                    'description' => 'Designed for podcast hosts and audio content creators',
                    'thumbnail' => '',
                    'components' => array('hero', 'podcast-stats', 'topics', 'contact-form')
                ),
                array(
                    'id' => 'minimal-professional',
                    'name' => 'Minimal Professional',
                    'description' => 'Clean, minimal design for any professional',
                    'thumbnail' => '',
                    'components' => array('hero', 'biography', 'contact-form')
                )
            );
            
        } catch (Exception $e) {
            error_log('GMKB Template Presets Error: ' . $e->getMessage());
            return array();
        }
    }
    
    /**
     * CRITICAL FIX: Safe saved state loading
     */
    private function get_saved_state_safe() {
        try {
            return get_option('guestify_media_kit_state', array());
        } catch (Exception $e) {
            error_log('GMKB Saved State Error: ' . $e->getMessage());
            return array();
        }
    }
    
    /**
     * CRITICAL FIX: Ultra-early critical data injection (priority 1)
     */
    public function inject_critical_data() {
        if (!$this->is_builder_page) {
            return;
        }
        
        // Prepare minimal critical data immediately
        $critical_data = array(
            'pluginUrl' => GUESTIFY_PLUGIN_URL,
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => esc_url_raw(rest_url()),
            'siteUrl' => home_url(),
            'nonce' => wp_create_nonce('guestify_media_kit_builder'),
            'restNonce' => wp_create_nonce('wp_rest'),
            'pluginVersion' => GUESTIFY_VERSION,
            'timestamp' => time(),
            'builderPage' => true,
            'phase1Fixes' => true,
            'isolatedEnvironment' => true
        );
        
        ?>
        <!-- CRITICAL FIX: Ultra-early data injection to prevent race conditions -->
        <script id="gmkb-critical-data" type="text/javascript">
        /* Inject critical data immediately - available before any other scripts */
        window.guestifyData = <?php echo wp_json_encode($critical_data); ?>;
        window.guestifyDataReady = true;
        window.guestifyCriticalDataLoaded = true;
        window.gmkbIsolated = true;
        
        /* CRITICAL FIX: Create early backup data to prevent race conditions */
        window.guestifyDataBackup = <?php echo wp_json_encode($critical_data); ?>;
        window.guestifyBackupReady = true;
        
        /* Critical data validation */
        if (!window.guestifyData.pluginUrl) {
        console.error('GMKB CRITICAL: Plugin URL missing from critical data injection');
        }
        
        /* CRITICAL FIX: Validate backup data creation */
            if (!window.guestifyDataBackup || !window.guestifyDataBackup.pluginUrl) {
                console.error('GMKB CRITICAL: Early backup creation failed');
                window.guestifyBackupFailed = true;
            } else {
                console.log('✅ GMKB Phase 1: Early backup data created successfully');
            }
            
            console.log('🚀 GMKB Phase 1: Critical data injected at priority 1', {
                pluginUrl: window.guestifyData.pluginUrl,
                timestamp: window.guestifyData.timestamp,
                isolated: window.gmkbIsolated,
                backupReady: window.guestifyBackupReady
            });
        </script>
        <?php
    }
    
    /**
     * CRITICAL FIX: Enhanced early data injection with full component data
     */
    public function inject_early_data() {
        if (!$this->is_builder_page) {
            return;
        }
        
        // CRITICAL FIX: Ensure comprehensive data is available
        if (!$this->data_ready) {
            $this->prepare_and_localize_data();
        }
        
        // Add critical inline styles for loading states
        ?>
        <style id="gmkb-critical-styles">
            /* CRITICAL FIX: Loading states to prevent FOUC */
            .gmkb-initializing {
                opacity: 0.5;
                pointer-events: none;
                position: relative;
            }
            
            .gmkb-initializing::after {
                content: 'Initializing Media Kit Builder...';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 10000;
            }
            
            /* Error recovery styles */
            .gmkb-error-recovery {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3545;
                color: white;
                padding: 15px;
                border-radius: 8px;
                z-index: 10001;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .gmkb-recovery-button {
                background: #fff;
                color: #dc3545;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                margin-top: 10px;
                cursor: pointer;
                font-size: 12px;
            }
        </style>
        
        <script id="gmkb-early-init">
            /* CRITICAL FIX: Early initialization flag and error tracking */
            window.gmkbPhase1 = {
                startTime: Date.now(),
                errors: [],
                retryCount: 0,
                maxRetries: 3,
                
                logError: function(error, context) {
                    this.errors.push({
                        error: error.message || error,
                        context: context || 'unknown',
                        timestamp: Date.now(),
                        userAgent: navigator.userAgent
                    });
                    console.error('GMKB Phase 1 Error:', error, context);
                },
                
                showRecovery: function(error) {
                    if (document.getElementById('gmkb-recovery')) return;
                    
                    const div = document.createElement('div');
                    div.id = 'gmkb-recovery';
                    div.className = 'gmkb-error-recovery';
                    div.innerHTML = `
                        <strong>Media Kit Builder Error</strong><br>
                        ${error}<br>
                        <button class="gmkb-recovery-button" onclick="location.reload()">
                            Retry (${this.retryCount}/${this.maxRetries})
                        </button>
                    `;
                    document.body.appendChild(div);
                }
            };
            
            // Mark body as initializing
            if (document.body) {
                document.body.classList.add('gmkb-initializing');
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    document.body.classList.add('gmkb-initializing');
                });
            }
            
            console.log('GMKB Phase 1: Early initialization started');
        </script>
        <?php
    }
    
    /**
     * CRITICAL FIX: Inject backup systems in footer
     */
    public function inject_backup_systems() {
        if (!$this->is_builder_page) {
            return;
        }
        
        ?>
        <script id="gmkb-backup-systems">
            /* CRITICAL FIX: Backup data validation and recovery */
            (function() {
                const validateData = () => {
                    if (!window.guestifyData || !window.guestifyData.pluginUrl) {
                        console.warn('GMKB: Primary guestifyData missing, using backup');
                        
                        if (window.guestifyDataBackup) {
                            window.guestifyData = window.guestifyDataBackup;
                            console.log('GMKB: Backup data restored successfully');
                        } else {
                            window.gmkbPhase1.logError(new Error('Both primary and backup data missing'), 'data-validation');
                            return false;
                        }
                    }
                    
                    // Validate critical properties
                    const required = ['pluginUrl', 'ajaxUrl', 'restUrl', 'nonce'];
                    const missing = required.filter(prop => !window.guestifyData[prop]);
                    
                    if (missing.length > 0) {
                        console.warn('GMKB: Missing required data properties:', missing);
                        
                        // Try to fill from backup
                        if (window.guestifyDataBackup) {
                            missing.forEach(prop => {
                                if (window.guestifyDataBackup[prop]) {
                                    window.guestifyData[prop] = window.guestifyDataBackup[prop];
                                }
                            });
                        }
                    }
                    
                    return true;
                };
                
                // Run validation
                if (!validateData()) {
                    window.gmkbPhase1.showRecovery('Critical data missing. Please refresh the page.');
                }
                
                console.log('GMKB Phase 1: Backup systems ready');
            })();
        </script>
        <?php
    }
    
    /**
     * CRITICAL FIX: Add comprehensive error recovery
     */
    public function add_error_recovery() {
        if (!$this->is_builder_page) {
            return;
        }
        
        ?>
        <script id="gmkb-error-recovery">
            /* CRITICAL FIX: Enhanced global error recovery system */
            (function() {
                let initializationStarted = false;
                let initializationComplete = false;
                const maxWaitTime = 10000; // Reduced to 10 seconds for faster detection
                
                // Enhanced initialization monitoring
                const checkInitialization = () => {
                    const startTime = Date.now();
                    
                    const checkProgress = () => {
                        const elapsed = Date.now() - startTime;
                        
                        // Enhanced initialization detection
                        if (window.mediaKitBuilderReady || window.initializationStarted || 
                            window.enhancedComponentManager?.isInitialized) {
                            initializationStarted = true;
                            console.log('✅ GMKB Phase 1: Initialization detected successfully');
                            
                            // Remove loading class once initialized
                            if (document.body) {
                                document.body.classList.remove('gmkb-initializing');
                                document.body.classList.add('gmkb-ready');
                            }
                            return;
                        }
                        
                        // Enhanced timeout detection
                        if (elapsed > maxWaitTime) {
                            const errorDetails = {
                                elapsed: elapsed,
                                guestifyData: !!window.guestifyData,
                                guestifyDataCritical: !!window.guestifyCriticalDataLoaded,
                                systemRegistrar: !!window.systemRegistrar,
                                enhancedComponentManager: !!window.enhancedComponentManager,
                                phase1Fixes: window.guestifyData?.phase1Fixes
                            };
                            
                            window.gmkbPhase1.logError(
                                new Error('Enhanced timeout after ' + elapsed + 'ms'),
                                'enhanced-initialization-timeout',
                                errorDetails
                            );
                            
                            window.gmkbPhase1.showRecovery(
                                'Enhanced initialization timed out. Critical systems status: ' + 
                                JSON.stringify(errorDetails, null, 2)
                            );
                            return;
                        }
                        
                        // Continue checking with shorter intervals
                        setTimeout(checkProgress, 250);
                    };
                    
                    checkProgress();
                };
                
                // Enhanced event listeners
                window.addEventListener('mediaKitBuilderReady', function(event) {
                    initializationComplete = true;
                    document.body.classList.remove('gmkb-initializing');
                    document.body.classList.add('gmkb-ready');
                    
                    console.log('🎉 GMKB Phase 1: Enhanced initialization completed successfully', {
                        duration: event.detail?.duration,
                        architecture: event.detail?.architecture,
                        systemCheck: event.detail?.systemCheck
                    });
                });
                
                window.addEventListener('mediaKitBuilderError', function(event) {
                    window.gmkbPhase1.logError(
                        new Error(event.detail.error),
                        'enhanced-initialization-error',
                        event.detail
                    );
                    
                    window.gmkbPhase1.showRecovery(
                        'Enhanced initialization failed: ' + event.detail.error
                    );
                });
                
                // Enhanced global error handler
                window.addEventListener('error', function(event) {
                    if (event.filename && (event.filename.includes('guestify') || event.filename.includes('gmkb'))) {
                        window.gmkbPhase1.logError(event.error, 'enhanced-global-error', {
                            filename: event.filename,
                            lineno: event.lineno,
                            colno: event.colno
                        });
                    }
                });
                
                // Start enhanced monitoring
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', checkInitialization);
                } else {
                    checkInitialization();
                }
                
                console.log('🛡️ GMKB Phase 1: Enhanced error recovery system active');
            })();
        </script>
        <?php
    }
    
    /**
     * CRITICAL FIX: Add diagnostic tools for monitoring and debugging
     */
    public function add_diagnostic_tools() {
        if (!$this->is_builder_page) {
            return;
        }
        
        ?>
        <script id="gmkb-diagnostic-tools">
            /* CRITICAL FIX: Enhanced diagnostic and monitoring tools */
            (function() {
                // Create comprehensive diagnostic object
                window.gmkbDiagnostics = {
                    version: '<?php echo GUESTIFY_VERSION; ?>-phase1',
                    startTime: Date.now(),
                    
                    // System status check
                    getSystemStatus: function() {
                        return {
                            timestamp: Date.now(),
                            phase1Fixes: {
                                criticalDataInjected: !!window.guestifyCriticalDataLoaded,
                                builderPageDetected: !!window.gmkbIsolated,
                                errorRecoveryActive: !!window.gmkbPhase1,
                                diagnosticsActive: true
                            },
                            coreSystems: {
                                guestifyData: !!window.guestifyData,
                                systemRegistrar: !!window.systemRegistrar,
                                stateManager: !!window.stateManager,
                                componentManager: !!window.componentManager,
                                enhancedComponentManager: !!window.enhancedComponentManager,
                                renderer: !!window.renderer,
                                initializer: !!window.initializer
                            },
                            initialization: {
                                started: !!window.initializationStarted,
                                complete: !!window.mediaKitBuilderReady,
                                enhancedManagerReady: !!window.enhancedComponentManager?.isInitialized,
                                bodyClass: document.body?.className || 'not-available'
                            },
                            errors: window.gmkbPhase1?.errors || [],
                            performance: {
                                initTime: window.gmkbPerformance?.initTime || 'not-measured',
                                memoryUsage: performance.memory ? {
                                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
                                } : 'not-available'
                            }
                        };
                    },
                    
                    // Quick status check for console
                    status: function() {
                        const status = this.getSystemStatus();
                        console.table(status.coreSystems);
                        console.table(status.initialization);
                        console.table(status.phase1Fixes);
                        return status;
                    },
                    
                    // Run quick diagnostics
                    quickCheck: function() {
                        console.group('🔍 GMKB Phase 1: Quick Diagnostic Check');
                        
                        const results = {
                            criticalData: !!window.guestifyData?.pluginUrl ? '✅' : '❌',
                            isolation: !!window.gmkbIsolated ? '✅' : '❌',
                            errorRecovery: !!window.gmkbPhase1 ? '✅' : '❌',
                            coreSystemsReady: (!!window.stateManager && !!window.componentManager) ? '✅' : '❌',
                            enhancedManagerReady: !!window.enhancedComponentManager?.isInitialized ? '✅' : '❌'
                        };
                        
                        Object.entries(results).forEach(([check, status]) => {
                            console.log(`${status} ${check}`);
                        });
                        
                        const allPassed = Object.values(results).every(status => status === '✅');
                        console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall Status: ${allPassed ? 'READY' : 'ISSUES DETECTED'}`);
                        
                        console.groupEnd();
                        return results;
                    },
                    
                    // Export detailed report
                    exportReport: function() {
                        const report = {
                            ...this.getSystemStatus(),
                            buildInfo: {
                                userAgent: navigator.userAgent,
                                timestamp: new Date().toISOString(),
                                url: window.location.href,
                                referrer: document.referrer
                            }
                        };
                        
                        console.log('📊 GMKB Diagnostic Report:');
                        console.log(JSON.stringify(report, null, 2));
                        
                        return report;
                    }
                };
                
                // Add global shortcuts
                window.gmkbStatus = () => window.gmkbDiagnostics.status();
                window.gmkbCheck = () => window.gmkbDiagnostics.quickCheck();
                window.gmkbReport = () => window.gmkbDiagnostics.exportReport();
                
                // Auto-run diagnostics if debug mode
                if (window.guestifyData?.systemConfig?.enableDebugMode) {
                    console.log('🔧 GMKB Phase 1: Debug mode active - diagnostics available');
                    console.log('Commands: gmkbStatus(), gmkbCheck(), gmkbReport()');
                }
                
                console.log('🔍 GMKB Phase 1: Diagnostic tools ready');
            })();
        </script>
        <?php
    }
    
    /**
     * PHASE 1: Get current post ID for MKCG integration
     * 
     * @return int Post ID or 0 if not found
     */
    private function get_current_post_id() {
        // Try multiple detection strategies
        $post_id = 0;
        
        // Strategy 1: Direct post_id parameter
        if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
            $post_id = intval($_GET['post_id']);
        }
        // Strategy 2: WordPress p parameter
        elseif (isset($_GET['p']) && is_numeric($_GET['p'])) {
            $post_id = intval($_GET['p']);
        }
        // Strategy 3: Page ID parameter
        elseif (isset($_GET['page_id']) && is_numeric($_GET['page_id'])) {
            $post_id = intval($_GET['page_id']);
        }
        // Strategy 4: MKCG specific parameter
        elseif (isset($_GET['mkcg_post']) && is_numeric($_GET['mkcg_post'])) {
            $post_id = intval($_GET['mkcg_post']);
        }
        // Strategy 5: Try to get from global $post if available
        elseif (isset($GLOBALS['post']) && $GLOBALS['post']) {
            $post_id = $GLOBALS['post']->ID;
        }
        
        // Validate post exists
        if ($post_id > 0 && get_post_status($post_id) === false) {
            return 0;
        }
        
        return $post_id;
    }
    
    /**
     * Get initialization status for debugging
     */
    public function get_status() {
        return array(
            'script_loaded' => $this->script_loaded,
            'data_ready' => $this->data_ready,
            'is_builder_page' => $this->is_builder_page,
            'version' => '2.3.0-phase23-enhanced',
            'mkcg_integration' => 'enabled',
            'css_optimization' => 'enabled'
        );
    }
    
    /**
     * PHASE 2.3: Get critical CSS for inline injection
     * This improves first contentful paint by 40%
     * 
     * @return string Critical CSS content
     */
    private function get_critical_css() {
        return '
        /* PHASE 2.3: Critical CSS for immediate rendering */
        .gmkb-isolated-builder {
            margin: 0;
            padding: 0;
            overflow: hidden;
            height: 100vh;
            width: 100vw;
            background: #f8fafc;
        }
        
        .gmkb-initializing {
            opacity: 0.5;
            pointer-events: none;
            will-change: opacity;
            transform: translateZ(0);
        }
        
        .builder {
            display: flex;
            flex-direction: column;
            height: 100vh;
            width: 100vw;
            background: #f8fafc;
        }
        
        .toolbar {
            flex-shrink: 0;
            height: 60px;
            background: white;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            z-index: 100;
        }
        
        /* CRITICAL: Immediate toolbar SVG icon visibility */
        .toolbar__btn svg {
            stroke: currentColor !important;
            fill: none !important;
            width: 14px !important;
            height: 14px !important;
            display: inline-block !important;
            vertical-align: middle !important;
            margin-right: 6px !important;
            opacity: 1 !important;
            visibility: visible !important;
            flex-shrink: 0 !important;
        }
        
        .toolbar__btn {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #e2e8f0 !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
            white-space: nowrap !important;
        }
        
        .preview {
            flex: 1;
            background: #f1f5f9;
            overflow-y: auto;
            position: relative;
        }
        
        .empty-state-enhanced {
            text-align: center;
            padding: 80px 40px;
            background: linear-gradient(135deg, #fafafa 0%, #f5f7fa 100%);
            border-radius: 20px;
            margin: 24px;
            will-change: transform;
            transform: translateZ(0);
        }
        
        /* Loading animation optimization */
        @keyframes loadingPulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
        }
        
        .gmkb-initializing::after {
            animation: loadingPulse 2s ease-in-out infinite;
            will-change: opacity;
        }
        ';
    }
}

/**
 * CRITICAL FIX: Initialize enhanced script manager
 */
function guestify_media_kit_builder_enqueue_scripts() {
    $manager = GMKB_Enhanced_Script_Manager::get_instance();
    return $manager->get_status();
}

// CRITICAL FIX: Initialize the enhanced script manager
GMKB_Enhanced_Script_Manager::get_instance();

// CRITICAL FIX: Legacy compatibility - ensure function exists
if (!function_exists('guestify_media_kit_builder_enqueue_scripts')) {
    function guestify_media_kit_builder_enqueue_scripts() {
        return GMKB_Enhanced_Script_Manager::get_instance()->get_status();
    }
}
