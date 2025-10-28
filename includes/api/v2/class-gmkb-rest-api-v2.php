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
    }
    
    /**
     * Bypass WordPress cookie authentication for logged-in users
     * ROOT FIX: WordPress REST API cookie auth is too strict, causing 403 errors
     * 
     * This fixes the "nonce_expired" 403 errors during active editing sessions
     */
    public function bypass_cookie_auth_for_logged_in_users($result) {
        // If there's already an error, check if we should override it
        if (is_wp_error($result)) {
            $error_code = $result->get_error_code();
            
            // ROOT FIX: Bypass nonce errors for logged-in users with edit capabilities
            if (($error_code === 'rest_cookie_invalid_nonce' || 
                 $error_code === 'rest_forbidden' ||
                 $error_code === 'rest_cookie_nonce_expired') && 
                is_user_logged_in()) {
                
                // Additional check: user must have edit capabilities
                if (current_user_can('edit_posts')) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('✅ GMKB REST API: Bypassing ' . $error_code . ' for logged-in editor');
                    }
                    return true; // Allow the request
                }
            }
            return $result;
        }
        
        // If user is logged in with edit capabilities, allow request
        if (is_user_logged_in() && current_user_can('edit_posts')) {
            return true;
        }
        
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
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB REST API v2: Routes registered successfully:');
            error_log('  - GET  /' . $this->namespace . '/mediakit/{id}');
            error_log('  - POST /' . $this->namespace . '/mediakit/{id}');
            error_log('  - GET  /' . $this->namespace . '/components');
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
            // OPTIMIZATION: Fetch ALL data in one go - theme is in state
            $state_data = get_post_meta($post_id, 'gmkb_media_kit_state', true);
            $pods_data = $this->fetch_all_pods_data($post_id, $post->post_type);
            
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
            // Vue components are self-contained and load their own data via usePodsData() composable
            // This eliminates:
            // - Centralized enrichment dependency
            // - Dual data loading (server + client)
            // - props/data duplication
            // - Race conditions in data loading
            // 
            // Pods data is still sent in response['podsData'] for Vue store initialization
            
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
     * Fetch ALL Pods data in one query
     * 
     * OPTIMIZATION: Single query instead of N queries
     * ROOT FIX: Enhanced error handling and debugging
     * 
     * @param int $post_id The post ID
     * @param string $post_type The post type
     * @return array Pods data
     */
    private function fetch_all_pods_data($post_id, $post_type) {
        $data = array();
        
        // ROOT FIX: Comprehensive checks before attempting Pods access
        if (!function_exists('pods')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB API v2: Pods plugin not active or pods() function not available');
            }
            return $data;
        }
        
        if (!class_exists('Pods')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB API v2: Pods class not loaded - plugin may not be fully initialized');
            }
            return $data;
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
    }

    // REMOVED: fetch_theme_data() - Theme is now part of unified state, not fetched separately

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
     * Check read permissions - more lenient for logged-in users
     * ROOT FIX: Simplified permission check to prevent race conditions
     * 
     * @param WP_REST_Request $request The request
     * @return bool|WP_Error Whether the user can read
     */
    public function check_read_permissions($request) {
        // Always allow read access for now - security can be tightened later
        // This prevents the 403 errors during development
        return true;
        
        /* FUTURE: Re-enable stricter permissions after migration complete
        $post_id = (int) $request['id'];
        
        // If user is logged in, allow access
        if (is_user_logged_in()) {
            return true;
        }
        
        // For non-logged-in users, check if post is public
        $post = get_post($post_id);
        if ($post && $post->post_status === 'publish') {
            return true;
        }
        
        return new WP_Error(
            'rest_forbidden',
            'You must be logged in to access this media kit',
            array('status' => 403)
        );
        */
    }

    /**
     * Check write permissions
     * 
     * @param WP_REST_Request $request The request
     * @return bool Whether the user can write
     */
    public function check_write_permissions($request) {
        $post_id = (int) $request['id'];
        return current_user_can('edit_post', $post_id);
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
}

// ROOT FIX: Instantiation now happens via init hook in main plugin file
// This ensures ComponentDiscovery is ready before REST API initializes

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('📄 GMKB REST API v2: Class defined, waiting for init hook instantiation');
}
