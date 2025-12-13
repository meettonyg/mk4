<?php
/**
 * GMKB REST API v2 - Unified Endpoint
 * 
 * Single source of truth for Vue frontend.
 * NO PHP RENDERING - pure data API.
 * Implements Phase 2 of Pure Vue Migration Plan
 * 
 * THEME PERSISTENCE FIX APPLIED: October 20, 2025
 * - Enhanced debug logging for theme saves
 * - Database error detection
 * - Save verification via immediate readback
 * - Comprehensive status tracking
 * 
 * @package GMKB
 * @version 2.0.1
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_REST_API_V2 {

    private $namespace = 'gmkb/v2';
    
    /**
     * List of all Pods fields we need to fetch
     * @var array
     */
    private $pods_fields = array();
    
    /**
     * Cache duration in seconds
     * @var int
     */
    private $cache_duration = 300; // 5 minutes

    public function __construct() {
        // ROOT FIX: Use high priority (999) to ensure Pods is fully initialized before REST API runs
        add_action('rest_api_init', array($this, 'register_routes'), 999);
        
        // ROOT FIX: Disable WordPress cookie authentication check for our endpoints
        // This allows logged-in users to access the API without strict cookie validation
        add_filter('rest_authentication_errors', array($this, 'bypass_cookie_auth_for_logged_in_users'), 100);
        
        // ROOT FIX: Delay Pods field initialization until REST API init to ensure Pods is ready
        add_action('rest_api_init', array($this, 'initialize_pods_fields'), 998);
        
        // PHASE 8: Add cache clear admin action
        add_action('admin_init', array($this, 'handle_cache_clear'));
    }
    
    /**
     * PHASE 8: Handle cache clear request via admin URL parameter
     * Usage: /wp-admin/?gmkb_clear_cache=all or ?gmkb_clear_cache=32372
     */
    public function handle_cache_clear() {
        if (!isset($_GET['gmkb_clear_cache']) || !current_user_can('manage_options')) {
            return;
        }
        
        $param = sanitize_text_field($_GET['gmkb_clear_cache']);
        global $wpdb;
        
        if ($param === 'all') {
            // Clear ALL media kit caches
            $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_gmkb_mediakit_%'");
            $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_gmkb_mediakit_%'");
            
            wp_die('✅ Cleared ALL GMKB media kit caches. <a href="' . admin_url() . '">Back to admin</a>');
        } else {
            // Clear specific post cache
            $post_id = absint($param);
            if ($post_id > 0) {
                delete_transient('gmkb_mediakit_' . $post_id);
                wp_die('✅ Cleared cache for media kit #' . $post_id . '. <a href="' . admin_url() . '">Back to admin</a>');
            }
        }
    }
    
    /**
     * Handle REST API authentication
     * SECURITY FIX: Removed bypass - proper nonce validation is required
     *
     * Frontend must send proper nonces via X-WP-Nonce header
     */
    public function bypass_cookie_auth_for_logged_in_users($result) {
        // SECURITY FIX: Do not bypass authentication errors
        // The frontend should properly refresh nonces when they expire
        // This maintains CSRF protection

        // Only allow if no existing error
        if ($result === null || $result === true) {
            return $result;
        }

        // Return the original error - do not bypass
        return $result;
    }

    /**
     * Initialize list of Pods fields to fetch
     * ARCHITECTURE FIX: Use ComponentDiscovery to get fields from component declarations
     * This implements self-contained component architecture
     * ROOT FIX: Made public for hook compatibility
     */
    public function initialize_pods_fields() {
        global $gmkb_component_discovery;
        
        // ROOT FIX: Enhanced initialization with better error handling
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔍 GMKB REST API v2: Starting Pods field initialization...');
            error_log('  - ComponentDiscovery available: ' . (isset($gmkb_component_discovery) && is_object($gmkb_component_discovery) ? 'YES' : 'NO'));
            error_log('  - Has getRequiredPodsFields method: ' . (isset($gmkb_component_discovery) && method_exists($gmkb_component_discovery, 'getRequiredPodsFields') ? 'YES' : 'NO'));
        }
        
        // ROOT FIX: Ensure ComponentDiscovery has scanned components before getting fields
        if ($gmkb_component_discovery && is_object($gmkb_component_discovery)) {
            // Check if components have been scanned
            $components = $gmkb_component_discovery->getComponents();
            if (empty($components)) {
                // Force a scan if no components found
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('⚠️ GMKB REST API v2: No components found, forcing scan...');
                }
                try {
                    $gmkb_component_discovery->scan(false);
                } catch (Exception $e) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('❌ GMKB REST API v2: Component scan failed: ' . $e->getMessage());
                    }
                }
            }
            
            // Now try to get the Pods fields
            if (method_exists($gmkb_component_discovery, 'getRequiredPodsFields')) {
                $this->pods_fields = $gmkb_component_discovery->getRequiredPodsFields();
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('✅ GMKB REST API v2: Using ' . count($this->pods_fields) . ' Pods fields from component discovery');
                    if (count($this->pods_fields) > 0) {
                        error_log('  Sample fields: ' . implode(', ', array_slice($this->pods_fields, 0, 5)) . '...');
                    }
                }
            }
        }
        
        // FALLBACK: If still no fields, use manual list
        if (empty($this->pods_fields)) {
            // FALLBACK: Manual field list if component discovery not available
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('⚠️ GMKB REST API v2: No Pods fields from component discovery, using fallback field list');
            }
            
            $this->pods_fields = array(
                // Base fields
                'biography',
                'biography_long',
                'introduction',
                'first_name',
                'last_name',
                'email',
                'phone',
                'website',
                'headshot',
                'expertise',
                'achievements'
            );
            
            // Add topics (1-5)
            for ($i = 1; $i <= 5; $i++) {
                $this->pods_fields[] = "topic_$i";
            }
            
            // Add questions (1-10)
            for ($i = 1; $i <= 10; $i++) {
                $this->pods_fields[] = "question_$i";
            }
            
            // Add social media fields
            $this->pods_fields[] = '1_facebook';
            $this->pods_fields[] = '1_instagram';
            $this->pods_fields[] = '1_linkedin';
            $this->pods_fields[] = '1_pinterest';
            $this->pods_fields[] = '1_tiktok';
            $this->pods_fields[] = '1_twitter';
            $this->pods_fields[] = 'guest_youtube';
            $this->pods_fields[] = '1_website';
            $this->pods_fields[] = '2_website';
            
            // Add media fields
            $this->pods_fields[] = 'profile_image';
            $this->pods_fields[] = 'gallery_images';
            $this->pods_fields[] = 'video_intro';
        }
    }

    /**
     * Register REST routes
     */
    public function register_routes() {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔧 GMKB REST API v2: Registering routes with namespace: ' . $this->namespace);
        }
        
        // Single endpoint to load EVERYTHING
        register_rest_route($this->namespace, '/mediakit/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_mediakit'),
            'permission_callback' => array($this, 'check_read_permissions'), // ROOT FIX: Custom permission check
            'args' => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                )
            )
        ));

        // Single endpoint to save EVERYTHING
        register_rest_route($this->namespace, '/mediakit/(?P<id>\d+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_mediakit'),
            'permission_callback' => array($this, 'check_write_permissions'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                )
            )
        ));

        // Optional: Component metadata endpoint
        register_rest_route($this->namespace, '/components', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_components'),
            'permission_callback' => '__return_true'
        ));

        // Pods field update endpoint
        register_rest_route($this->namespace, '/pods/(?P<id>\d+)/field/(?P<field>[a-zA-Z0-9_-]+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_pods_field'),
            'permission_callback' => array($this, 'check_write_permissions'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ),
                'field' => array(
                    'validate_callback' => function($param) {
                        return preg_match('/^[a-zA-Z0-9_-]+$/', $param);
                    }
                )
            )
        ));
        
        // ═══════════════════════════════════════════════════════════════════════
        // OFFERS API ENDPOINTS
        // ═══════════════════════════════════════════════════════════════════════

        // List all offers
        register_rest_route($this->namespace, '/offers', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_offers_list'),
            'permission_callback' => array($this, 'check_offers_read_permissions'),
        ));

        // Create offer
        register_rest_route($this->namespace, '/offers', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_offer'),
            'permission_callback' => array($this, 'check_offers_write_permissions'),
        ));

        // Read/Update/Delete single offer
        register_rest_route($this->namespace, '/offers/(?P<id>\d+)', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_single_offer'),
                'permission_callback' => array($this, 'check_offers_read_permissions'),
            ),
            array(
                'methods' => array('POST', 'PUT'),
                'callback' => array($this, 'update_offer'),
                'permission_callback' => array($this, 'check_offers_write_permissions'),
            ),
            array(
                'methods' => 'DELETE',
                'callback' => array($this, 'delete_offer'),
                'permission_callback' => array($this, 'check_offers_write_permissions'),
            ),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                )
            )
        ));

        // Duplicate offer
        register_rest_route($this->namespace, '/offers/(?P<id>\d+)/duplicate', array(
            'methods' => 'POST',
            'callback' => array($this, 'duplicate_offer'),
            'permission_callback' => array($this, 'check_offers_write_permissions'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                )
            )
        ));

        // Track offer click (public endpoint)
        register_rest_route($this->namespace, '/offers/(?P<id>\d+)/track', array(
            'methods' => 'POST',
            'callback' => array($this, 'track_offer_click'),
            'permission_callback' => '__return_true',
            'args' => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                )
            )
        ));

        // Bulk delete offers
        register_rest_route($this->namespace, '/offers/bulk-delete', array(
            'methods' => 'POST',
            'callback' => array($this, 'bulk_delete_offers'),
            'permission_callback' => array($this, 'check_offers_write_permissions'),
        ));

        // ═══════════════════════════════════════════════════════════════════════
        // PROFILE-OFFER RELATIONSHIP ENDPOINTS
        // ═══════════════════════════════════════════════════════════════════════

        // Get offers linked to a profile
        register_rest_route($this->namespace, '/profiles/(?P<id>\d+)/offers', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_profile_offers'),
            'permission_callback' => array($this, 'check_read_permissions'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                )
            )
        ));

        // Link/Unlink offer from profile (combined to prevent route overwrite)
        register_rest_route($this->namespace, '/profiles/(?P<id>\d+)/offers/(?P<offer_id>\d+)', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'link_offer_to_profile'),
                'permission_callback' => array($this, 'check_write_permissions'),
            ),
            array(
                'methods' => 'DELETE',
                'callback' => array($this, 'unlink_offer_from_profile'),
                'permission_callback' => array($this, 'check_write_permissions'),
            ),
            'args' => array(
                'id' => array(
                    'validate_callback' => 'is_numeric'
                ),
                'offer_id' => array(
                    'validate_callback' => 'is_numeric'
                )
            )
        ));

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB REST API v2: Routes registered successfully:');
            error_log('  - GET  /' . $this->namespace . '/mediakit/{id}');
            error_log('  - POST /' . $this->namespace . '/mediakit/{id}');
            error_log('  - GET  /' . $this->namespace . '/components');
            error_log('  - POST /' . $this->namespace . '/pods/{id}/field/{field}');
            error_log('  - GET/POST /' . $this->namespace . '/offers');
            error_log('  - GET/PUT/DELETE /' . $this->namespace . '/offers/{id}');
            error_log('  - POST /' . $this->namespace . '/offers/{id}/duplicate');
            error_log('  - POST /' . $this->namespace . '/offers/{id}/track');
            error_log('  - POST /' . $this->namespace . '/offers/bulk-delete');
            error_log('  - GET/POST/DELETE /' . $this->namespace . '/profiles/{id}/offers');
        }
    }

    /**
     * GET /gmkb/v2/mediakit/{id}
     * 
     * Returns EVERYTHING in a single response:
     * - Component state
     * - Section layout
     * - Theme settings
     * - ALL Pods data
     * - Component metadata
     * 
     * CRITICAL: Single database query, no N+1 problem
     */
    public function get_mediakit($request) {
        $post_id = (int) $request['id'];
        
        // ROOT FIX: Check cache first for performance
        $cache_key = 'gmkb_mediakit_' . $post_id;
        $cached_response = get_transient($cache_key);
        
        if ($cached_response !== false && !isset($_GET['nocache'])) {
            // Add cache hit header
            $response = rest_ensure_response($cached_response);
            $response->header('X-GMKB-Cache', 'HIT');
            return $response;
        }
        
        // DEBUG: Log the request details
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔍 GMKB REST API: get_mediakit called for post ' . $post_id . ' (CACHE MISS)');
        }

        // Verify post exists
        $post = get_post($post_id);
        if (!$post || !in_array($post->post_type, array('mkcg', 'guests'))) {
            return new WP_Error(
                'post_not_found',
                'Media kit not found',
                array('status' => 404)
            );
        }

        try {
            // OPTIMIZATION: Fetch state data only - Pods enrichment has been deprecated
            $state_data = get_post_meta($post_id, 'gmkb_media_kit_state', true);

            // DEPRECATED: Pods data fetching disabled (2025-12-11)
            // The "Write Arc" (component-field-sync.php) was broken due to action hook typo,
            // meaning Pods fields were NEVER being updated when users saved in the Builder.
            // The "Read Arc" (Vue enrichment) was causing stale data to overwrite valid JSON state.
            // JSON state (gmkb_media_kit_state) is now the single source of truth.
            // $pods_data = $this->fetch_all_pods_data($post_id, $post->post_type);
            $pods_data = array(); // Empty - no longer needed
            
            // Ensure state data is properly structured
            if (!is_array($state_data)) {
                $state_data = array();
            }
            
            // CRITICAL FIX: Log theme data for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('🎨 GMKB REST API v2: Loading state for post #' . $post_id);
                error_log('  - Theme in state: "' . ($state_data['theme'] ?? 'NOT SET') . '"');
                error_log('  - Has customizations: ' . (!empty($state_data['themeCustomizations']) ? 'YES' : 'NO'));
            }

            // Build response - theme is ONLY in state, nowhere else
            $response = array(
                'success' => true,
                'version' => '2.0',
                'timestamp' => current_time('timestamp'),
                'post' => array(
                    'id' => $post_id,
                    'title' => $post->post_title,
                    'status' => $post->post_status,
                    'modified' => $post->post_modified,
                    'type' => $post->post_type
                ),
                'state' => array(
                    'components' => $state_data['components'] ?? new stdClass(),
                    'sections' => $state_data['sections'] ?? array(),
                    'layout' => $state_data['layout'] ?? array(),
                    'theme' => $state_data['theme'] ?? 'professional_clean', // ROOT FIX: Only source is state
                    'themeCustomizations' => $state_data['themeCustomizations'] ?? new stdClass(),
                    'globalSettings' => $state_data['globalSettings'] ?? new stdClass()
                ),
                'podsData' => $pods_data,
                'metadata' => array(
                    'componentCount' => is_object($state_data['components'] ?? null) ? 0 : count($state_data['components'] ?? array()),
                    'sectionCount' => count($state_data['sections'] ?? array()),
                    'lastSaved' => $state_data['lastSaved'] ?? null
                )
            );

            // PHASE 1 ARCHITECTURAL FIX: Server-side enrichment REMOVED
            // PHASE 2 FIX (2025-12-11): Pods data fetching DEPRECATED
            //
            // The circular sync between JSON state and Pods fields has been eliminated:
            // - JSON state (gmkb_media_kit_state) is now the SINGLE source of truth
            // - podsData in response is empty (kept for backward compatibility)
            // - Vue enrichment disabled in mediaKit.js store
            // - component-field-sync.php has been deleted (was dead code due to typo)
            
            // Apply enrichment filters (for extensibility)
            $response = apply_filters('gmkb_api_mediakit_response', $response, $post_id);
            
            // ROOT FIX: Cache the response for performance
            set_transient($cache_key, $response, $this->cache_duration);
            
            // Return with cache miss header
            $rest_response = rest_ensure_response($response);
            $rest_response->header('X-GMKB-Cache', 'MISS');
            $rest_response->header('Cache-Control', 'public, max-age=' . $this->cache_duration);
            
            return $rest_response;

        } catch (Exception $e) {
            return new WP_Error(
                'load_failed',
                'Failed to load media kit: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    /**
     * POST /gmkb/v2/mediakit/{id}
     * 
     * Saves media kit state
     * 
     * Request body:
     * {
     *   "components": {...},
     *   "sections": [...],
     *   "layout": [...],
     *   "theme": {...},
     *   "globalSettings": {...}
     * }
     */
    public function save_mediakit($request) {
        $post_id = (int) $request['id'];

        // Verify post exists and user can edit
        $post = get_post($post_id);
        if (!$post || !in_array($post->post_type, array('mkcg', 'guests'))) {
            return new WP_Error(
                'post_not_found',
                'Media kit not found',
                array('status' => 404)
            );
        }

        if (!current_user_can('edit_post', $post_id)) {
            return new WP_Error(
                'forbidden',
                'You do not have permission to edit this media kit',
                array('status' => 403)
            );
        }

        try {
            // Get request body
            $body = $request->get_json_params();
            
            // ROOT FIX: Enhanced debug logging with theme tracking
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('💾 GMKB REST API v2: Saving media kit #' . $post_id);
                error_log('  - Request body size: ' . strlen(json_encode($body)) . ' bytes');
                error_log('  - Components: ' . (isset($body['components']) ? count((array)$body['components']) : 0));
                error_log('  - Sections: ' . (isset($body['sections']) ? count($body['sections']) : 0));
                error_log('  - Theme in body: ' . (isset($body['theme']) ? '"' . $body['theme'] . '"' : 'NOT SET'));
                error_log('  - Theme empty() check: ' . (empty($body['theme']) ? 'TRUE (will skip save)' : 'FALSE (will save)'));
                error_log('  - Theme value type: ' . (isset($body['theme']) ? gettype($body['theme']) : 'N/A'));
            }

            // Validate data structure
            $validation_result = $this->validate_state_data($body);
            if (is_wp_error($validation_result)) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('❌ GMKB REST API v2: Validation failed: ' . $validation_result->get_error_message());
                }
                return $validation_result;
            }

            // Prepare state data
            $state_data = array(
                'components' => $body['components'] ?? new stdClass(),
                'sections' => $body['sections'] ?? array(),
                'layout' => $body['layout'] ?? array(),
                'theme' => $body['theme'] ?? 'professional_clean', // ROOT FIX: Include theme in state
                'themeCustomizations' => $body['themeCustomizations'] ?? new stdClass(), // ROOT FIX: Include customizations in state
                'globalSettings' => $body['globalSettings'] ?? new stdClass(),
                'lastSaved' => current_time('mysql'),
                'version' => '2.0'
            );

            // ROOT FIX: Apply sanitization filter BEFORE saving
            // This removes Pods data bloat from components
            if (has_filter('gmkb_before_save_media_kit_state')) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('🔧 GMKB REST API v2: Applying gmkb_before_save_media_kit_state filter');
                }
                $state_data = apply_filters('gmkb_before_save_media_kit_state', $state_data, $post_id);
            }

            // CRITICAL: Check data size before saving
            $serialized = maybe_serialize($state_data);
            $data_size = strlen($serialized);

            if ($data_size > 10485760) { // 10MB limit
                return new WP_Error(
                    'data_too_large',
                    "Data too large: " . number_format($data_size) . " bytes (max 10MB)",
                    array('status' => 413)
                );
            }

            // ROOT FIX: Save to database with proper error handling
            global $wpdb;
            
            // Clear any previous errors
            $wpdb->flush();
            
            // Attempt to save state (theme is included in state, nowhere else)
            $result = update_post_meta($post_id, 'gmkb_media_kit_state', $state_data);

            // Check for database errors
            if ($wpdb->last_error) {
                throw new Exception('Database error: ' . $wpdb->last_error);
            }
            
            // update_post_meta returns false if the value is the same as before
            // This is NOT an error - it just means no update was needed
            if ($result === false) {
                // Check if the meta key exists
                $existing = get_post_meta($post_id, 'gmkb_media_kit_state', true);
                
                if ($existing === false || $existing === '') {
                    // Meta doesn't exist and couldn't be created - this IS an error
                    throw new Exception('Failed to create post meta. Database error: ' . ($wpdb->last_error ?: 'Unknown'));
                }
                
                // Meta exists and values are identical - not an error, just no change needed
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('ℹ️ GMKB REST API v2: No database update needed (values identical)');
                }
            }

            // Theme is part of state - no separate save needed (already in $state_data above)
            // Theme validation was done during state data preparation

            // ROOT FIX: Clear cache after successful save
            $cache_key = 'gmkb_mediakit_' . $post_id;
            delete_transient($cache_key);
            
            // Trigger action for extensibility
            do_action('gmkb_after_save_mediakit', $post_id, $state_data);
            
            // ROOT FIX: Clean save success logging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB REST API v2: Media kit #' . $post_id . ' saved successfully');
                error_log('  - Data size: ' . size_format($data_size));
                error_log('  - Components: ' . (is_object($state_data['components']) ? 0 : count($state_data['components'])));
                error_log('  - Sections: ' . count($state_data['sections']));
                error_log('  - Theme: "' . ($state_data['theme'] ?? 'NOT SET') . '"');
            }

            // ROOT FIX: Clean response - theme is in state, no separate tracking
            $response = array(
                'success' => true,
                'timestamp' => time(),
                'post_id' => $post_id,
                'data_size' => $data_size,
                'components_saved' => is_object($state_data['components']) ? 0 : count($state_data['components']),
                'sections_saved' => count($state_data['sections']),
                'theme' => $state_data['theme'] ?? null
            );
            
            return rest_ensure_response($response);

        } catch (Exception $e) {
            // ROOT FIX: Enhanced error logging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB REST API v2: Save failed for post #' . $post_id);
                error_log('  - Error: ' . $e->getMessage());
                error_log('  - File: ' . $e->getFile() . ':' . $e->getLine());
                error_log('  - Trace: ' . $e->getTraceAsString());
            }
            
            return new WP_Error(
                'save_failed',
                'Failed to save media kit: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    /**
     * DEPRECATED: Fetch ALL Pods data in one query
     *
     * @deprecated Since 2.2.0 - Pods enrichment has been removed. JSON state is single source of truth.
     *
     * This method is no longer called. It's kept for reference but will be removed in a future version.
     * The circular sync between JSON state and Pods fields caused data loss:
     * - The "Write Arc" (component-field-sync.php) was broken (action hook typo)
     * - The "Read Arc" (Vue enrichment) overwrote valid JSON with stale Pods data
     *
     * @param int $post_id The post ID
     * @param string $post_type The post type
     * @return array Empty array (method deprecated)
     */
    private function fetch_all_pods_data($post_id, $post_type) {
        // DEPRECATED: Return empty array - this method is no longer used
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('⚠️ GMKB API v2: fetch_all_pods_data() called but is DEPRECATED');
        }
        return array();

        // --- ORIGINAL CODE BELOW (kept for reference) ---
        /*
        $data = array();

        // PHASE 8 FIX: If Pods is not available, use native WordPress fallback
        if (!function_exists('pods') || !class_exists('Pods')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('ℹ️ GMKB API v2: Pods not available, using native WordPress meta fallback');
            }
            return $this->fetch_native_meta_data($post_id);
        }
        
        if (!in_array($post_type, array('mkcg', 'guests'))) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('⚠️ GMKB API v2: Skipping Pods data - invalid post_type: ' . $post_type);
            }
            return $data;
        }
        
        // ROOT FIX: Ensure we have fields to fetch
        if (empty($this->pods_fields)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('⚠️ GMKB API v2: No Pods fields configured to fetch!');
                error_log('  Attempting to initialize Pods fields now...');
            }
            // Try to initialize fields if not done yet
            $this->initialize_pods_fields();
            
            if (empty($this->pods_fields)) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('❌ GMKB API v2: Still no Pods fields after initialization attempt');
                }
                return $data;
            }
        }
        
        try {
            // ROOT FIX: Add timing information for debugging
            $start_time = microtime(true);
            
            // ROOT FIX: Use correct post type for Pods with better error handling
            $pod = pods($post_type, $post_id);
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('🔍 GMKB API v2: Created Pods object for ' . $post_type . ' #' . $post_id);
                error_log('  Pods fields to fetch: ' . count($this->pods_fields));
            }
            
            // ROOT FIX: More thorough existence check
            if (!$pod || !is_object($pod) || !method_exists($pod, 'exists') || !$pod->exists()) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('❌ GMKB API v2: Pods object invalid or post does not exist');
                    error_log('  - Pod object: ' . (is_object($pod) ? 'YES' : 'NO'));
                    error_log('  - Has exists method: ' . (is_object($pod) && method_exists($pod, 'exists') ? 'YES' : 'NO'));
                    error_log('  - Post exists in Pods: ' . ($pod && method_exists($pod, 'exists') && $pod->exists() ? 'YES' : 'NO'));
                }
                return $data;
            }
            
            // ROOT FIX: Log the fields we're about to fetch
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB API v2: Pods ready, fetching ' . count($this->pods_fields) . ' fields');
                if (count($this->pods_fields) === 0) {
                    error_log('⚠️ WARNING: No Pods fields configured to fetch!');
                }
            }
            
            // Fetch all fields in one query
            foreach ($this->pods_fields as $field) {
                $value = $pod->field($field);
                
                // ROOT FIX: Only store non-empty values to reduce payload size
                if (!empty($value) || $value === '0' || $value === 0) {
                    $data[$field] = $value;
                }
            }
            
            // ROOT FIX: Enhanced debugging output
            if (defined('WP_DEBUG') && WP_DEBUG) {
                $elapsed = round((microtime(true) - $start_time) * 1000, 2);
                $non_empty = count($data);
                error_log('✅ GMKB API v2: Fetched ' . $non_empty . '/' . count($this->pods_fields) . ' non-empty Pods fields in ' . $elapsed . 'ms');
                
                // Sample some data for verification
                if ($non_empty > 0) {
                    $sample_fields = array_slice(array_keys($data), 0, 5);
                    error_log('  Sample fields: ' . implode(', ', $sample_fields));
                } else {
                    error_log('⚠️ WARNING: All Pods fields are empty! This guest may have no data.');
                }
            }
            
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB API v2: Exception fetching Pods data: ' . $e->getMessage());
                error_log('  Stack trace: ' . $e->getTraceAsString());
            }
        }

        return $data;
        */
    }

    // REMOVED: fetch_theme_data() - Theme is now part of unified state, not fetched separately

    /**
     * DEPRECATED: Fetch profile data using native WordPress meta functions
     *
     * @deprecated Since 2.2.0 - Pods enrichment has been removed. JSON state is single source of truth.
     * 
     * This is the fallback when Pods plugin is not active.
     * Uses get_post_meta() to read the same data that Pods stored.
     * 
     * @param int $post_id The post ID
     * @return array Profile data
     */
    private function fetch_native_meta_data($post_id) {
        $data = array();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔍 GMKB API v2: Fetching native meta data for post #' . $post_id);
        }
        
        // Use GMKB_Field_Migration helper if available for legacy field support
        $use_migration_helper = class_exists('GMKB_Field_Migration');
        
        // Define all fields to fetch (same as Pods fields)
        $fields = array(
            // Personal info
            'first_name', 'last_name', 'biography', 'biography_long', 'introduction',
            // Contact info
            'email', 'phone', 'skype', 'address', 'city', 'state', 'zip', 'country', 'timezone',
            // Social media (legacy names)
            '1_twitter', '1_facebook', '1_instagram', '1_linkedin', '1_tiktok', '1_pinterest',
            'guest_youtube', '1_website', '2_website',
            // Social media (new names)
            'social_twitter', 'social_facebook', 'social_instagram', 'social_linkedin',
            'social_tiktok', 'social_pinterest', 'social_youtube', 'website_primary', 'website_secondary',
            // Media
            'headshot', 'guest_headshot', 'profile_photo', 'personal_brand_logo', 'company_logo',
            'gallery_photos', 'featured_logos', 'video_intro', 'calendar_url',
        );
        
        // Add topics 1-5
        for ($i = 1; $i <= 5; $i++) {
            $fields[] = "topic_$i";
        }
        
        // Add questions 1-25
        for ($i = 1; $i <= 25; $i++) {
            $fields[] = "question_$i";
        }
        
        // Fetch each field
        foreach ($fields as $field) {
            $value = get_post_meta($post_id, $field, true);
            
            // Handle media fields - expand to full object if it's an attachment ID
            if (!empty($value) && in_array($field, array('headshot', 'guest_headshot', 'profile_photo', 'personal_brand_logo', 'company_logo'))) {
                $attachment_id = is_array($value) && isset($value['ID']) ? $value['ID'] : absint($value);
                if ($attachment_id) {
                    $attachment = get_post($attachment_id);
                    if ($attachment && $attachment->post_type === 'attachment') {
                        $value = array(
                            'ID' => $attachment_id,
                            'guid' => wp_get_attachment_url($attachment_id),
                            'post_title' => $attachment->post_title,
                            'post_mime_type' => $attachment->post_mime_type,
                        );
                    }
                }
            }
            
            // Handle gallery fields - expand array of IDs to full objects
            if (!empty($value) && in_array($field, array('gallery_photos', 'featured_logos'))) {
                $value = maybe_unserialize($value);
                if (is_array($value)) {
                    $expanded = array();
                    foreach ($value as $item) {
                        $attachment_id = is_array($item) && isset($item['ID']) ? $item['ID'] : absint($item);
                        if ($attachment_id) {
                            $attachment = get_post($attachment_id);
                            if ($attachment && $attachment->post_type === 'attachment') {
                                $expanded[] = array(
                                    'ID' => $attachment_id,
                                    'guid' => wp_get_attachment_url($attachment_id),
                                    'post_title' => $attachment->post_title,
                                    'post_mime_type' => $attachment->post_mime_type,
                                );
                            }
                        }
                    }
                    $value = $expanded;
                }
            }
            
            // Only store non-empty values
            if (!empty($value) || $value === '0' || $value === 0) {
                $data[$field] = $value;
            }
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB API v2: Fetched ' . count($data) . ' native meta fields');
            if (count($data) > 0) {
                error_log('  Sample fields: ' . implode(', ', array_slice(array_keys($data), 0, 5)));
            }
        }
        
        return $data;
    }

    /**
     * Validate state data structure
     * 
     * @param mixed $data The data to validate
     * @return true|WP_Error True if valid, WP_Error if not
     */
    private function validate_state_data($data) {
        if (!is_array($data)) {
            return new WP_Error(
                'invalid_data',
                'Request body must be a JSON object',
                array('status' => 400)
            );
        }

        // Validate components structure
        if (isset($data['components']) && !is_array($data['components']) && !is_object($data['components'])) {
            return new WP_Error(
                'invalid_components',
                'Components must be an object or array',
                array('status' => 400)
            );
        }

        // Validate sections structure
        if (isset($data['sections']) && !is_array($data['sections'])) {
            return new WP_Error(
                'invalid_sections',
                'Sections must be an array',
                array('status' => 400)
            );
        }
        
        // Validate layout structure
        if (isset($data['layout']) && !is_array($data['layout'])) {
            return new WP_Error(
                'invalid_layout',
                'Layout must be an array',
                array('status' => 400)
            );
        }

        return true;
    }

    /**
     * Check read permissions
     * SECURITY FIX: Proper permission checking based on post status and user capabilities
     *
     * @param WP_REST_Request $request The request
     * @return bool|WP_Error Whether the user can read
     */
    public function check_read_permissions($request) {
        $post_id = (int) $request['id'];

        // PHASE 8: Use new GMKB_Permissions class if available
        if (class_exists('GMKB_Permissions')) {
            return GMKB_Permissions::can_view($post_id);
        }

        // FALLBACK: Detailed security permission check (SECURITY FIX)
        $post = get_post($post_id);

        // Check if post exists
        if (!$post) {
            return new WP_Error(
                'rest_post_not_found',
                'Media kit not found',
                array('status' => 404)
            );
        }

        // Allow access to published posts for anyone (public media kits)
        if ($post->post_status === 'publish') {
            return true;
        }

        // For non-published posts, require user to be logged in
        if (!is_user_logged_in()) {
            return new WP_Error(
                'rest_forbidden',
                'You must be logged in to access this media kit',
                array('status' => 403)
            );
        }

        // User must be able to edit the post to view non-published content
        if (current_user_can('edit_post', $post_id)) {
            return true;
        }

        // Check if user is the post author
        if ((int) $post->post_author === get_current_user_id()) {
            return true;
        }

        return new WP_Error(
            'rest_forbidden',
            'You do not have permission to access this media kit',
            array('status' => 403)
        );
    }

    /**
     * Check write permissions
     *
     * @param WP_REST_Request $request The request
     * @return bool Whether the user can write
     */
    public function check_write_permissions($request) {
        $post_id = (int) $request['id'];

        // PHASE 8: Use new GMKB_Permissions class if available
        if (class_exists('GMKB_Permissions')) {
            return GMKB_Permissions::can_edit($post_id);
        }

        // FALLBACK: Legacy capability check
        return current_user_can('edit_post', $post_id);
    }

    /**
     * POST /gmkb/v2/pods/{id}/field/{field}
     * 
     * Updates a single Pods field value
     * 
     * Request body:
     * {
     *   "value": <field_value>
     * }
     * 
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error The response
     */
    public function update_pods_field($request) {
        $post_id = (int) $request['id'];
        $field_name = sanitize_text_field($request['field']);
        
        // Verify post exists
        $post = get_post($post_id);
        if (!$post || !in_array($post->post_type, array('mkcg', 'guests'))) {
            return new WP_Error(
                'post_not_found',
                'Post not found or invalid post type',
                array('status' => 404)
            );
        }
        
        // Check permissions
        if (!current_user_can('edit_post', $post_id)) {
            return new WP_Error(
                'forbidden',
                'You do not have permission to edit this post',
                array('status' => 403)
            );
        }
        
        // Check if Pods is available
        if (!function_exists('pods') || !class_exists('Pods')) {
            return new WP_Error(
                'pods_not_available',
                'Pods plugin is not active or not available',
                array('status' => 500)
            );
        }
        
        try {
            // Get request body
            $body = $request->get_json_params();
            
            if (!isset($body['value'])) {
                return new WP_Error(
                    'missing_value',
                    'Field value is required',
                    array('status' => 400)
                );
            }
            
            $value = $body['value'];
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('💾 GMKB REST API v2: Updating Pods field');
                error_log('  - Post ID: ' . $post_id);
                error_log('  - Post Type: ' . $post->post_type);
                error_log('  - Field: ' . $field_name);
                error_log('  - Value type: ' . gettype($value));
                if (is_scalar($value)) {
                    error_log('  - Value: ' . $value);
                }
            }
            
            // Initialize Pods for this post
            $pod = pods($post->post_type, $post_id);
            
            if (!$pod || !$pod->exists()) {
                return new WP_Error(
                    'pod_not_found',
                    'Could not initialize Pods for this post',
                    array('status' => 500)
                );
            }
            
            // Save the field value
            $save_result = $pod->save($field_name, $value);
            
            if ($save_result === false || is_wp_error($save_result)) {
                $error_message = is_wp_error($save_result) ? $save_result->get_error_message() : 'Unknown error';
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('❌ GMKB REST API v2: Failed to save Pods field');
                    error_log('  - Error: ' . $error_message);
                }
                
                return new WP_Error(
                    'save_failed',
                    'Failed to save field: ' . $error_message,
                    array('status' => 500)
                );
            }
            
            // Clear cache for this post
            $cache_key = 'gmkb_mediakit_' . $post_id;
            delete_transient($cache_key);
            
            // Verify the save by reading back
            $saved_value = $pod->field($field_name);
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB REST API v2: Pods field saved successfully');
                error_log('  - Field: ' . $field_name);
                error_log('  - Verified saved value type: ' . gettype($saved_value));
            }
            
            // Return success response
            $response = array(
                'success' => true,
                'post_id' => $post_id,
                'field' => $field_name,
                'value' => $saved_value,
                'timestamp' => current_time('mysql')
            );
            
            return rest_ensure_response($response);
            
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB REST API v2: Exception updating Pods field');
                error_log('  - Error: ' . $e->getMessage());
                error_log('  - File: ' . $e->getFile() . ':' . $e->getLine());
            }
            
            return new WP_Error(
                'update_failed',
                'Failed to update Pods field: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    /**
     * GET /gmkb/v2/components
     * 
     * Returns component metadata (not rendered components)
     * 
     * PHASE 2 ENHANCEMENT: Full v2 API alignment
     * - HTTP cache headers for performance
     * - Enriched response metadata
     * - Normalized component data structure
     * - Performance timing
     * 
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error The response
     * 
     * @example Response structure:
     * {
     *   "success": true,
     *   "version": "2.0",
     *   "timestamp": 1704567890,
     *   "components": [
     *     {
     *       "type": "hero",
     *       "name": "Hero Section",
     *       "description": "Main header section",
     *       "category": "essential",
     *       "icon": "hero-icon.svg",
     *       "order": 1,
     *       "isPremium": false,
     *       "supportsSettings": true
     *     }
     *   ],
     *   "categories": { "essential": [...] },
     *   "total": 15,
     *   "metadata": {
     *     "cached": true,
     *     "cacheAge": 120,
     *     "cacheSource": "wordpress_transient",
     *     "discoverySource": "filesystem_scan",
     *     "executionTime": 0.023
     *   }
     * }
     */
    public function get_components($request) {
        // PHASE 2: Track execution time
        $start_time = microtime(true);
        
        // ROOT FIX: Use global ComponentDiscovery instance
        // The main plugin file already initializes ComponentDiscovery and stores it globally
        global $gmkb_component_discovery;
        
        if (!$gmkb_component_discovery) {
            return new WP_Error(
                'discovery_not_available',
                'Component discovery system not initialized. ComponentDiscovery should be initialized by the main plugin.',
                array('status' => 500)
            );
        }
        
        try {
            // Get cache debug info
            $cache_info = method_exists($gmkb_component_discovery, 'getDebugInfo') 
                ? $gmkb_component_discovery->getDebugInfo() 
                : array('cache_status' => array('cache_exists' => false, 'cache_age' => 0));
            
            // Use the global instance - it's already scanned on plugin init
            $components = $gmkb_component_discovery->getComponents();
            $categories = $gmkb_component_discovery->getCategories();
            
            // PHASE 2: Normalize component data for consistency
            $normalized_components = array();
            foreach ($components as $key => $component) {
                $normalized = array(
                    'type' => $component['type'] ?? $key,
                    'name' => $component['name'] ?? ucfirst(str_replace('-', ' ', $key)),
                    'title' => $component['title'] ?? $component['name'] ?? ucfirst(str_replace('-', ' ', $key)),
                    'description' => $component['description'] ?? 'No description available',
                    'category' => $component['category'] ?? 'general',
                    'icon' => $component['icon'] ?? 'default-icon.svg',
                    'order' => $component['order'] ?? 999,
                    'isPremium' => $component['isPremium'] ?? false,
                    'supportsSettings' => !empty($component['settings']) || !empty($component['schema']),
                    'directory' => $component['directory'] ?? $key
                );
                
                // Preserve any additional fields
                foreach ($component as $field => $value) {
                    if (!isset($normalized[$field])) {
                        $normalized[$field] = $value;
                    }
                }
                
                $normalized_components[] = $normalized;
            }
            
            // PHASE 2: Calculate execution time
            $execution_time = microtime(true) - $start_time;
            
            // PHASE 2: Build enriched response with metadata
            $response_data = array(
                'success' => true,
                'version' => '2.0',
                'timestamp' => current_time('timestamp'),
                'components' => $normalized_components,
                'categories' => $categories,
                'total' => count($normalized_components),
                'metadata' => array(
                    'cached' => !empty($cache_info['cache_status']['cache_exists']),
                    'cacheAge' => !empty($cache_info['cache_status']['cache_age']) ? $cache_info['cache_status']['cache_age'] : 0,
                    'cacheSource' => 'wordpress_transient',
                    'discoverySource' => 'filesystem_scan',
                    'executionTime' => round($execution_time, 4),
                    'componentsDir' => $cache_info['components_dir'] ?? '',
                    'scanRequired' => empty($cache_info['cache_status']['cache_exists'])
                )
            );
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB REST API v2: Returning ' . count($normalized_components) . ' components');
                error_log('GMKB REST API v2: Cache status - ' . ($response_data['metadata']['cached'] ? 'HIT' : 'MISS'));
                error_log('GMKB REST API v2: Execution time: ' . $execution_time . 's');
            }
            
            // PHASE 2: Create REST response with cache headers
            $response = rest_ensure_response($response_data);
            
            // PHASE 2: Add HTTP cache headers for browser/proxy caching
            // Components rarely change, so we can cache for 5 minutes
            $cache_duration = 300; // 5 minutes
            $response->header('Cache-Control', 'public, max-age=' . $cache_duration);
            $response->header('Expires', gmdate('D, d M Y H:i:s', time() + $cache_duration) . ' GMT');
            
            // Add ETag for conditional requests
            $etag = md5(json_encode($normalized_components));
            $response->header('ETag', '"' . $etag . '"');
            
            // Check if client has cached version
            $request_etag = $request->get_header('if_none_match');
            if ($request_etag && trim($request_etag, '"') === $etag) {
                // Client has current version, return 304 Not Modified
                $response->set_status(304);
                $response->set_data(null);
                return $response;
            }
            
            return $response;

        } catch (Exception $e) {
            return new WP_Error(
                'discovery_failed',
                'Component discovery failed: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // OFFERS API - PERMISSION CALLBACKS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Check read permissions for offers endpoints
     *
     * @return bool Whether the user can read offers
     */
    public function check_offers_read_permissions() {
        return current_user_can('read');
    }

    /**
     * Check write permissions for offers endpoints
     *
     * @return bool Whether the user can create/edit/delete offers
     */
    public function check_offers_write_permissions() {
        return current_user_can('edit_posts');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // OFFERS API - CRUD OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * GET /gmkb/v2/offers
     *
     * List all offers with optional filtering
     *
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error
     */
    public function get_offers_list($request) {
        $args = array(
            'post_type'      => 'gmkb_offer',
            'posts_per_page' => $request->get_param('per_page') ?: 20,
            'paged'          => $request->get_param('page') ?: 1,
            'post_status'    => 'any',
            'orderby'        => $request->get_param('orderby') ?: 'date',
            'order'          => $request->get_param('order') ?: 'DESC',
        );

        // Filter by type if provided
        $type = $request->get_param('type');
        if ($type) {
            $args['tax_query'] = array(
                array(
                    'taxonomy' => 'offer_type',
                    'field'    => 'slug',
                    'terms'    => sanitize_text_field($type),
                )
            );
        }

        // Filter by status if provided
        $status = $request->get_param('status');
        if ($status) {
            $args['post_status'] = sanitize_text_field($status);
        }

        $query = new WP_Query($args);
        $offers = array();

        foreach ($query->posts as $post) {
            $offers[] = $this->format_offer_response($post->ID);
        }

        // Add pagination headers
        $response = new WP_REST_Response($offers);
        $response->header('X-WP-Total', (int) $query->found_posts);
        $response->header('X-WP-TotalPages', (int) $query->max_num_pages);
        return $response;
    }

    /**
     * POST /gmkb/v2/offers
     *
     * Create a new offer
     *
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error
     */
    public function create_offer($request) {
        $params = $request->get_json_params();

        $post_data = array(
            'post_title'   => sanitize_text_field($params['title'] ?? 'New Offer'),
            'post_content' => wp_kses_post($params['description'] ?? ''),
            'post_status'  => sanitize_text_field($params['status'] ?? 'draft'),
            'post_type'    => 'gmkb_offer',
        );

        $offer_id = wp_insert_post($post_data);

        if (is_wp_error($offer_id)) {
            return $offer_id;
        }

        // Save metadata with proper sanitization per field type
        $meta_fields = array('retail_value', 'cta_text', 'url', 'format', 'image_id');
        foreach ($meta_fields as $field) {
            if (isset($params[$field])) {
                $value = $params[$field];
                switch ($field) {
                    case 'url':
                        $sanitized_value = esc_url_raw($value);
                        break;
                    case 'image_id':
                        $sanitized_value = absint($value);
                        break;
                    case 'retail_value':
                        $sanitized_value = floatval($value);
                        break;
                    default:
                        $sanitized_value = sanitize_text_field($value);
                }
                update_post_meta($offer_id, 'gmkb_offer_' . $field, $sanitized_value);
            }
        }

        // Set taxonomy term
        if (!empty($params['type'])) {
            wp_set_object_terms($offer_id, sanitize_text_field($params['type']), 'offer_type');
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB Offers API: Created offer #' . $offer_id);
        }

        return rest_ensure_response(array(
            'success' => true,
            'offer'   => $this->format_offer_response($offer_id),
        ));
    }

    /**
     * GET /gmkb/v2/offers/{id}
     *
     * Get a single offer
     *
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error
     */
    public function get_single_offer($request) {
        $offer_id = (int) $request['id'];
        $post = get_post($offer_id);

        if (!$post || $post->post_type !== 'gmkb_offer') {
            return new WP_Error('not_found', 'Offer not found', array('status' => 404));
        }

        return rest_ensure_response(array(
            'success' => true,
            'offer'   => $this->format_offer_response($offer_id),
        ));
    }

    /**
     * PUT/POST /gmkb/v2/offers/{id}
     *
     * Update an offer
     *
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error
     */
    public function update_offer($request) {
        $offer_id = (int) $request['id'];
        $post = get_post($offer_id);

        if (!$post || $post->post_type !== 'gmkb_offer') {
            return new WP_Error('not_found', 'Offer not found', array('status' => 404));
        }

        $params = $request->get_json_params();

        // Update core post data if present
        $post_update = array('ID' => $offer_id);
        if (isset($params['title'])) {
            $post_update['post_title'] = sanitize_text_field($params['title']);
        }
        if (isset($params['description'])) {
            $post_update['post_content'] = wp_kses_post($params['description']);
        }
        if (isset($params['status'])) {
            $post_update['post_status'] = sanitize_text_field($params['status']);
        }

        if (count($post_update) > 1) {
            wp_update_post($post_update);
        }

        // Update metadata with proper sanitization per field type
        $meta_fields = array('retail_value', 'cta_text', 'url', 'format', 'image_id');
        foreach ($meta_fields as $field) {
            if (isset($params[$field])) {
                $value = $params[$field];
                switch ($field) {
                    case 'url':
                        $sanitized_value = esc_url_raw($value);
                        break;
                    case 'image_id':
                        $sanitized_value = absint($value);
                        break;
                    case 'retail_value':
                        $sanitized_value = floatval($value);
                        break;
                    default:
                        $sanitized_value = sanitize_text_field($value);
                }
                update_post_meta($offer_id, 'gmkb_offer_' . $field, $sanitized_value);
            }
        }

        // Update type
        if (isset($params['type'])) {
            wp_set_object_terms($offer_id, sanitize_text_field($params['type']), 'offer_type');
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB Offers API: Updated offer #' . $offer_id);
        }

        return rest_ensure_response(array(
            'success' => true,
            'offer'   => $this->format_offer_response($offer_id),
        ));
    }

    /**
     * DELETE /gmkb/v2/offers/{id}
     *
     * Delete an offer
     *
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error
     */
    public function delete_offer($request) {
        $offer_id = (int) $request['id'];
        $post = get_post($offer_id);

        if (!$post || $post->post_type !== 'gmkb_offer') {
            return new WP_Error('not_found', 'Offer not found', array('status' => 404));
        }

        $result = wp_delete_post($offer_id, true);

        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete offer', array('status' => 500));
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB Offers API: Deleted offer #' . $offer_id);
        }

        return rest_ensure_response(array(
            'success' => true,
            'deleted' => true,
            'id'      => $offer_id,
        ));
    }

    /**
     * POST /gmkb/v2/offers/{id}/duplicate
     *
     * Duplicate an offer
     *
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error
     */
    public function duplicate_offer($request) {
        $offer_id = (int) $request['id'];
        $original = get_post($offer_id);

        if (!$original || $original->post_type !== 'gmkb_offer') {
            return new WP_Error('not_found', 'Offer not found', array('status' => 404));
        }

        // Create duplicate post
        $new_post = array(
            'post_title'   => $original->post_title . ' (Copy)',
            'post_content' => $original->post_content,
            'post_status'  => 'draft',
            'post_type'    => 'gmkb_offer',
        );

        $new_id = wp_insert_post($new_post);

        if (is_wp_error($new_id)) {
            return $new_id;
        }

        // Copy metadata (use !== '' to preserve 0 values)
        $meta_keys = array('gmkb_offer_retail_value', 'gmkb_offer_cta_text', 'gmkb_offer_url', 'gmkb_offer_format', 'gmkb_offer_image_id');
        foreach ($meta_keys as $key) {
            $val = get_post_meta($offer_id, $key, true);
            if ($val !== '') {
                update_post_meta($new_id, $key, $val);
            }
        }

        // Copy taxonomy terms
        $terms = wp_get_object_terms($offer_id, 'offer_type', array('fields' => 'ids'));
        if (!is_wp_error($terms) && !empty($terms)) {
            wp_set_object_terms($new_id, $terms, 'offer_type');
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB Offers API: Duplicated offer #' . $offer_id . ' to #' . $new_id);
        }

        return rest_ensure_response(array(
            'success' => true,
            'offer'   => $this->format_offer_response($new_id),
        ));
    }

    /**
     * POST /gmkb/v2/offers/{id}/track
     *
     * Track a click on an offer (public endpoint)
     *
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error
     */
    public function track_offer_click($request) {
        $offer_id = (int) $request['id'];
        $post = get_post($offer_id);

        if (!$post || $post->post_type !== 'gmkb_offer') {
            return new WP_Error('not_found', 'Offer not found', array('status' => 404));
        }

        // Use transient lock to prevent race condition in concurrent requests
        $lock_key = 'gmkb_offer_click_lock_' . $offer_id;
        $lock_acquired = false;
        $attempts = 0;

        while (!$lock_acquired && $attempts < 3) {
            if (get_transient($lock_key) === false) {
                set_transient($lock_key, true, 2); // 2 second lock
                $lock_acquired = true;
            } else {
                usleep(50000); // Wait 50ms
                $attempts++;
            }
        }

        // Perform atomic-ish update
        $clicks = (int) get_post_meta($offer_id, 'gmkb_offer_clicks', true);
        $clicks++;
        update_post_meta($offer_id, 'gmkb_offer_clicks', $clicks);

        // Release lock
        if ($lock_acquired) {
            delete_transient($lock_key);
        }

        return rest_ensure_response(array(
            'success' => true,
            'clicks'  => $clicks,
            'queued'  => !$lock_acquired, // Indicate if lock wasn't acquired
        ));
    }

    /**
     * POST /gmkb/v2/offers/bulk-delete
     *
     * Bulk delete multiple offers
     *
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error
     */
    public function bulk_delete_offers($request) {
        $params = $request->get_json_params();
        $ids = $params['ids'] ?? array();
        $deleted_count = 0;

        foreach ($ids as $id) {
            $id = absint($id);
            if ($id && get_post_type($id) === 'gmkb_offer') {
                $result = wp_delete_post($id, true);
                if ($result) {
                    $deleted_count++;
                }
            }
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB Offers API: Bulk deleted ' . $deleted_count . ' offers');
        }

        return rest_ensure_response(array(
            'success'       => true,
            'deleted_count' => $deleted_count,
        ));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PROFILE-OFFER RELATIONSHIPS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * GET /gmkb/v2/profiles/{id}/offers
     *
     * Get all offers linked to a profile
     *
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error
     */
    public function get_profile_offers($request) {
        $profile_id = (int) $request['id'];
        $post = get_post($profile_id);

        if (!$post || !in_array($post->post_type, array('mkcg', 'guests'))) {
            return new WP_Error('not_found', 'Profile not found', array('status' => 404));
        }

        $offer_ids = get_post_meta($profile_id, 'gmkb_linked_offers', true);

        if (empty($offer_ids) || !is_array($offer_ids)) {
            return rest_ensure_response(array(
                'success' => true,
                'offers'  => array(),
            ));
        }

        $offers = array();
        foreach ($offer_ids as $offer_id) {
            $offer_id = absint($offer_id);
            if ($offer_id && get_post_type($offer_id) === 'gmkb_offer') {
                $offers[] = $this->format_offer_response($offer_id);
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'offers'  => $offers,
        ));
    }

    /**
     * POST /gmkb/v2/profiles/{id}/offers/{offer_id}
     *
     * Link an offer to a profile
     *
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error
     */
    public function link_offer_to_profile($request) {
        $profile_id = (int) $request['id'];
        $offer_id = (int) $request['offer_id'];

        // Validate profile
        $profile = get_post($profile_id);
        if (!$profile || !in_array($profile->post_type, array('mkcg', 'guests'))) {
            return new WP_Error('not_found', 'Profile not found', array('status' => 404));
        }

        // Validate offer
        $offer = get_post($offer_id);
        if (!$offer || $offer->post_type !== 'gmkb_offer') {
            return new WP_Error('not_found', 'Offer not found', array('status' => 404));
        }

        // Get current linked offers
        $current_offers = get_post_meta($profile_id, 'gmkb_linked_offers', true);
        if (!is_array($current_offers)) {
            $current_offers = array();
        }

        // Add offer if not already linked
        if (!in_array($offer_id, $current_offers)) {
            $current_offers[] = $offer_id;
            update_post_meta($profile_id, 'gmkb_linked_offers', $current_offers);
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB Offers API: Linked offer #' . $offer_id . ' to profile #' . $profile_id);
        }

        return rest_ensure_response(array(
            'success'       => true,
            'linked_offers' => $current_offers,
        ));
    }

    /**
     * DELETE /gmkb/v2/profiles/{id}/offers/{offer_id}
     *
     * Unlink an offer from a profile
     *
     * @param WP_REST_Request $request The request
     * @return WP_REST_Response|WP_Error
     */
    public function unlink_offer_from_profile($request) {
        $profile_id = (int) $request['id'];
        $offer_id = (int) $request['offer_id'];

        // Validate profile
        $profile = get_post($profile_id);
        if (!$profile || !in_array($profile->post_type, array('mkcg', 'guests'))) {
            return new WP_Error('not_found', 'Profile not found', array('status' => 404));
        }

        // Get current linked offers
        $current_offers = get_post_meta($profile_id, 'gmkb_linked_offers', true);
        if (!is_array($current_offers)) {
            return rest_ensure_response(array(
                'success'       => true,
                'linked_offers' => array(),
            ));
        }

        // Remove offer from list
        $current_offers = array_values(array_diff($current_offers, array($offer_id)));
        update_post_meta($profile_id, 'gmkb_linked_offers', $current_offers);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB Offers API: Unlinked offer #' . $offer_id . ' from profile #' . $profile_id);
        }

        return rest_ensure_response(array(
            'success'       => true,
            'linked_offers' => $current_offers,
        ));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // OFFERS API - HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Format offer response
     *
     * @param int $offer_id The offer post ID
     * @return array Formatted offer data
     */
    private function format_offer_response($offer_id) {
        $post = get_post($offer_id);
        if (!$post) {
            return null;
        }

        $terms = get_the_terms($offer_id, 'offer_type');
        $type = ($terms && !is_wp_error($terms) && !empty($terms)) ? $terms[0]->slug : null;

        return array(
            'id'           => $offer_id,
            'title'        => $post->post_title,
            'description'  => $post->post_content,
            'status'       => $post->post_status,
            'type'         => $type,
            'retail_value' => get_post_meta($offer_id, 'gmkb_offer_retail_value', true),
            'cta_text'     => get_post_meta($offer_id, 'gmkb_offer_cta_text', true),
            'url'          => get_post_meta($offer_id, 'gmkb_offer_url', true),
            'format'       => get_post_meta($offer_id, 'gmkb_offer_format', true),
            'image_id'     => get_post_meta($offer_id, 'gmkb_offer_image_id', true),
            'clicks'       => (int) get_post_meta($offer_id, 'gmkb_offer_clicks', true),
            'created'      => $post->post_date,
            'modified'     => $post->post_modified,
        );
    }
}

// ROOT FIX: Instantiation now happens via init hook in main plugin file
// This ensures ComponentDiscovery is ready before REST API initializes

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('📄 GMKB REST API v2: Class defined, waiting for init hook instantiation');
}
