<?php
/**
 * GMKB AI Controller - REST API Endpoint for AI Content Generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Supports dual deployment:
 * - Integrated Mode: Inside Media Kit Builder (Auth required, saves to store)
 * - Standalone Mode: On public WordPress pages (No auth, rate-limited)
 *
 * Supports two generation approaches:
 * - Legacy: /ai/generate with 'type' parameter (biography, topics, etc.)
 * - New: /ai/tool/generate with 'tool' parameter (biography-generator, topics-generator, etc.)
 *
 * @package GMKB
 * @subpackage AI
 * @version 2.0.0
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_AI_Controller {

    /**
     * REST API namespace
     * @var string
     */
    private $namespace = 'gmkb/v2';

    /**
     * AI Service instance
     * @var GMKB_AI_Service
     */
    private $ai_service;

    /**
     * Tool Discovery instance
     * @var GMKB_Tool_Discovery
     */
    private $tool_discovery;

    /**
     * Rate limit for public (anonymous) users
     * @var int
     */
    private $public_rate_limit = 3;

    /**
     * Rate limit for authenticated users
     * @var int
     */
    private $authenticated_rate_limit = 10;

    /**
     * Rate limit window in seconds (1 hour)
     * @var int
     */
    private $rate_limit_window = 3600;

    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'), 10);

        // Load services
        $this->load_ai_service();
        $this->load_tool_discovery();

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Controller: Initialized');
        }
    }

    /**
     * Load the AI Service class
     */
    private function load_ai_service() {
        $service_path = GMKB_PLUGIN_DIR . 'includes/services/class-gmkb-ai-service.php';

        if (file_exists($service_path)) {
            require_once $service_path;
            $this->ai_service = new GMKB_AI_Service();
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB AI Controller: AI Service file not found at ' . $service_path);
            }
        }
    }

    /**
     * Load the Tool Discovery service
     */
    private function load_tool_discovery() {
        $discovery_path = GMKB_PLUGIN_DIR . 'includes/services/class-gmkb-tool-discovery.php';

        if (file_exists($discovery_path)) {
            require_once $discovery_path;
            $this->tool_discovery = GMKB_Tool_Discovery::instance();
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB AI Controller: Tool Discovery not found at ' . $discovery_path);
            }
        }
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Main AI generation endpoint
        register_rest_route($this->namespace, '/ai/generate', array(
            'methods' => 'POST',
            'callback' => array($this, 'generate_content'),
            'permission_callback' => array($this, 'check_generate_permissions'),
            'args' => array(
                'type' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Type of content to generate',
                    'enum' => array(
                        'biography',
                        'topics',
                        'questions',
                        'tagline',
                        'guest_intro',
                        'offers',
                        'authority_hook'
                    ),
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'params' => array(
                    'required' => true,
                    'type' => 'object',
                    'description' => 'Generation parameters'
                ),
                'context' => array(
                    'required' => false,
                    'type' => 'string',
                    'default' => 'public',
                    'enum' => array('builder', 'public'),
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'nonce' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Security nonce for public requests',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));

        // Test endpoint for API connectivity
        register_rest_route($this->namespace, '/ai/test', array(
            'methods' => 'GET',
            'callback' => array($this, 'test_connection'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));

        // Usage status endpoint
        register_rest_route($this->namespace, '/ai/usage', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_usage_status'),
            'permission_callback' => '__return_true'
        ));

        // New tool-based generation endpoint (for /tools/ architecture)
        register_rest_route($this->namespace, '/ai/tool/generate', array(
            'methods' => 'POST',
            'callback' => array($this, 'generate_from_tool'),
            'permission_callback' => array($this, 'check_generate_permissions'),
            'args' => array(
                'tool' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Tool ID (e.g., biography-generator)',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'params' => array(
                    'required' => true,
                    'type' => 'object',
                    'description' => 'Generation parameters'
                ),
                'context' => array(
                    'required' => false,
                    'type' => 'string',
                    'default' => 'public',
                    'enum' => array('builder', 'public'),
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'nonce' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Security nonce for public requests',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));

        // Tool discovery endpoint (lists available tools)
        register_rest_route($this->namespace, '/ai/tools', array(
            'methods' => 'GET',
            'callback' => array($this, 'list_tools'),
            'permission_callback' => '__return_true'
        ));

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Controller: Routes registered');
            error_log('  - POST /' . $this->namespace . '/ai/generate');
            error_log('  - POST /' . $this->namespace . '/ai/tool/generate');
            error_log('  - GET  /' . $this->namespace . '/ai/tools');
            error_log('  - GET  /' . $this->namespace . '/ai/test');
            error_log('  - GET  /' . $this->namespace . '/ai/usage');
        }
    }

    /**
     * Check permissions for AI generation
     * Implements dual-layer security for builder vs public contexts
     *
     * @param WP_REST_Request $request
     * @return bool|WP_Error
     */
    public function check_generate_permissions($request) {
        $context = $request->get_param('context') ?? 'public';

        // Builder context: Require authentication
        if ($context === 'builder') {
            if (!is_user_logged_in()) {
                return new WP_Error(
                    'rest_forbidden',
                    'You must be logged in to use the AI generator in the builder.',
                    array('status' => 401)
                );
            }

            if (!current_user_can('edit_posts')) {
                return new WP_Error(
                    'rest_forbidden',
                    'You do not have permission to generate content.',
                    array('status' => 403)
                );
            }

            // Check user-based rate limit
            $rate_check = $this->check_user_rate_limit();
            if (is_wp_error($rate_check)) {
                return $rate_check;
            }

            return true;
        }

        // Public context: Verify nonce and check IP rate limit
        $nonce = $request->get_param('nonce');

        // Verify public nonce (generated by shortcode)
        if (empty($nonce) || !wp_verify_nonce($nonce, 'gmkb_public_ai')) {
            return new WP_Error(
                'invalid_nonce',
                'Invalid security token. Please refresh the page and try again.',
                array('status' => 403)
            );
        }

        // Check IP-based rate limit for public users
        $rate_check = $this->check_ip_rate_limit();
        if (is_wp_error($rate_check)) {
            return $rate_check;
        }

        return true;
    }

    /**
     * Check admin permissions for test endpoint
     *
     * @param WP_REST_Request $request
     * @return bool
     */
    public function check_admin_permissions($request) {
        return current_user_can('manage_options');
    }

    /**
     * Check IP-based rate limit for public users
     *
     * @return true|WP_Error
     */
    private function check_ip_rate_limit() {
        $ip = $this->get_client_ip();
        $transient_key = 'gmkb_ai_limit_' . md5($ip);
        $usage = get_transient($transient_key);

        if ($usage === false) {
            $usage = array(
                'count' => 0,
                'first_request' => time()
            );
        }

        // Check if limit exceeded
        if ($usage['count'] >= $this->public_rate_limit) {
            $reset_in = $this->rate_limit_window - (time() - $usage['first_request']);

            if ($reset_in > 0) {
                return new WP_Error(
                    'rate_limited',
                    sprintf(
                        'Free usage limit reached (%d generations per hour). Resets in %d minutes. Sign up for unlimited access!',
                        $this->public_rate_limit,
                        ceil($reset_in / 60)
                    ),
                    array(
                        'status' => 429,
                        'reset_time' => $reset_in,
                        'remaining' => 0
                    )
                );
            }

            // Reset the counter
            $usage = array(
                'count' => 0,
                'first_request' => time()
            );
        }

        return true;
    }

    /**
     * Check user-based rate limit for authenticated users
     *
     * @return true|WP_Error
     */
    private function check_user_rate_limit() {
        $user_id = get_current_user_id();
        $transient_key = 'gmkb_ai_user_limit_' . $user_id;
        $usage = get_transient($transient_key);

        if ($usage === false) {
            $usage = array(
                'count' => 0,
                'first_request' => time()
            );
        }

        // Check if limit exceeded
        if ($usage['count'] >= $this->authenticated_rate_limit) {
            $reset_in = $this->rate_limit_window - (time() - $usage['first_request']);

            if ($reset_in > 0) {
                return new WP_Error(
                    'rate_limited',
                    sprintf(
                        'Rate limit reached (%d generations per hour). Resets in %d minutes.',
                        $this->authenticated_rate_limit,
                        ceil($reset_in / 60)
                    ),
                    array(
                        'status' => 429,
                        'reset_time' => $reset_in,
                        'remaining' => 0
                    )
                );
            }

            // Reset the counter
            $usage = array(
                'count' => 0,
                'first_request' => time()
            );
        }

        return true;
    }

    /**
     * Increment usage counter after successful generation
     *
     * @param string $context 'builder' or 'public'
     */
    private function increment_usage($context) {
        if ($context === 'builder' && is_user_logged_in()) {
            $user_id = get_current_user_id();
            $transient_key = 'gmkb_ai_user_limit_' . $user_id;
        } else {
            $ip = $this->get_client_ip();
            $transient_key = 'gmkb_ai_limit_' . md5($ip);
        }

        $usage = get_transient($transient_key);

        if ($usage === false) {
            $usage = array(
                'count' => 0,
                'first_request' => time()
            );
        }

        $usage['count']++;
        set_transient($transient_key, $usage, $this->rate_limit_window);
    }

    /**
     * Get remaining usage count
     *
     * @param string $context 'builder' or 'public'
     * @return array Usage info with remaining and reset_time
     */
    private function get_usage_info($context) {
        if ($context === 'builder' && is_user_logged_in()) {
            $user_id = get_current_user_id();
            $transient_key = 'gmkb_ai_user_limit_' . $user_id;
            $limit = $this->authenticated_rate_limit;
        } else {
            $ip = $this->get_client_ip();
            $transient_key = 'gmkb_ai_limit_' . md5($ip);
            $limit = $this->public_rate_limit;
        }

        $usage = get_transient($transient_key);

        if ($usage === false) {
            return array(
                'remaining' => $limit,
                'reset_time' => $this->rate_limit_window,
                'limit' => $limit
            );
        }

        $remaining = max(0, $limit - $usage['count']);
        $reset_in = $this->rate_limit_window - (time() - $usage['first_request']);

        return array(
            'remaining' => $remaining,
            'reset_time' => max(0, $reset_in),
            'limit' => $limit
        );
    }

    /**
     * Get client IP address
     *
     * @return string
     */
    private function get_client_ip() {
        $ip_keys = array(
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR'
        );

        foreach ($ip_keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];

                // Handle comma-separated IPs (X-Forwarded-For)
                if (strpos($ip, ',') !== false) {
                    $ips = explode(',', $ip);
                    $ip = trim($ips[0]);
                }

                // Validate IP
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return '0.0.0.0';
    }

    /**
     * Main AI content generation endpoint
     *
     * POST /wp-json/gmkb/v2/ai/generate
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function generate_content($request) {
        $type = $request->get_param('type');
        $params = $request->get_param('params');
        $context = $request->get_param('context') ?? 'public';

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Controller: Generate request');
            error_log('  - Type: ' . $type);
            error_log('  - Context: ' . $context);
            error_log('  - Params: ' . wp_json_encode($params));
        }

        // Validate AI service is available
        if (!$this->ai_service) {
            return new WP_Error(
                'service_unavailable',
                'AI service is not available. Please check server configuration.',
                array('status' => 503)
            );
        }

        // Validate params based on type
        $validation = $this->validate_params($type, $params);
        if (is_wp_error($validation)) {
            return $validation;
        }

        try {
            // Generate content using AI service
            $result = $this->ai_service->generate_content($type, $params);

            if (!$result['success']) {
                return new WP_Error(
                    'generation_failed',
                    $result['message'] ?? 'Content generation failed.',
                    array('status' => 500)
                );
            }

            // Increment usage counter on success
            $this->increment_usage($context);

            // Get updated usage info
            $usage = $this->get_usage_info($context);

            // Build response
            $response_data = array(
                'success' => true,
                'data' => array(
                    'content' => $result['content'],
                    'type' => $type,
                    'metadata' => array(
                        'tokens_used' => $result['tokens_used'] ?? null,
                        'model' => $result['model'] ?? 'gpt-4o-mini',
                        'generated_at' => current_time('mysql')
                    )
                ),
                'usage' => $usage
            );

            $response = rest_ensure_response($response_data);

            // Add rate limit headers
            $response->header('X-RateLimit-Limit', $usage['limit']);
            $response->header('X-RateLimit-Remaining', $usage['remaining']);
            $response->header('X-RateLimit-Reset', time() + $usage['reset_time']);

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB AI Controller: Generation successful');
                error_log('  - Content length: ' . strlen(is_array($result['content']) ? wp_json_encode($result['content']) : $result['content']));
                error_log('  - Remaining usage: ' . $usage['remaining']);
            }

            return $response;

        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB AI Controller: Exception during generation');
                error_log('  - Error: ' . $e->getMessage());
            }

            return new WP_Error(
                'generation_error',
                'An error occurred during content generation: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    /**
     * Validate generation parameters based on type
     *
     * @param string $type Generation type
     * @param array $params Parameters to validate
     * @return true|WP_Error
     */
    private function validate_params($type, $params) {
        if (!is_array($params)) {
            return new WP_Error(
                'invalid_params',
                'Parameters must be an object.',
                array('status' => 400)
            );
        }

        // Type-specific validation
        switch ($type) {
            case 'biography':
                // Biography needs at minimum: name or authority hook data
                if (empty($params['name']) && empty($params['authorityHook'])) {
                    return new WP_Error(
                        'missing_params',
                        'Biography generation requires either a name or authority hook data.',
                        array('status' => 400)
                    );
                }
                break;

            case 'topics':
                // Topics need expertise or authority hook
                if (empty($params['expertise']) && empty($params['authorityHook'])) {
                    return new WP_Error(
                        'missing_params',
                        'Topics generation requires expertise or authority hook data.',
                        array('status' => 400)
                    );
                }
                break;

            case 'questions':
                // Questions need topics
                if (empty($params['topics']) && empty($params['authorityHook'])) {
                    return new WP_Error(
                        'missing_params',
                        'Questions generation requires topics or authority hook data.',
                        array('status' => 400)
                    );
                }
                break;

            case 'tagline':
                // Tagline needs some context
                if (empty($params['authorityHook']) && empty($params['name'])) {
                    return new WP_Error(
                        'missing_params',
                        'Tagline generation requires authority hook or name.',
                        array('status' => 400)
                    );
                }
                break;

            case 'guest_intro':
                // Guest intro needs guest name and context (title, topic, or authority hook)
                if (empty($params['guestName'])) {
                    return new WP_Error(
                        'missing_params',
                        'Guest intro generation requires a guest name.',
                        array('status' => 400)
                    );
                }
                if (empty($params['guestTitle']) && empty($params['topic']) && empty($params['authorityHook'])) {
                    return new WP_Error(
                        'missing_params',
                        'Guest intro generation requires title, topic, or authority hook data.',
                        array('status' => 400)
                    );
                }
                break;

            case 'offers':
                // Offers need service context
                if (empty($params['services']) && empty($params['authorityHook'])) {
                    return new WP_Error(
                        'missing_params',
                        'Offers generation requires services or authority hook data.',
                        array('status' => 400)
                    );
                }
                break;

            case 'authority_hook':
                // Authority hook just needs some input
                if (empty($params['who']) && empty($params['what'])) {
                    return new WP_Error(
                        'missing_params',
                        'Authority hook generation requires at least "who" or "what".',
                        array('status' => 400)
                    );
                }
                break;
        }

        return true;
    }

    /**
     * Test API connection endpoint
     *
     * GET /wp-json/gmkb/v2/ai/test
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function test_connection($request) {
        if (!$this->ai_service) {
            return new WP_Error(
                'service_unavailable',
                'AI service is not available.',
                array('status' => 503)
            );
        }

        $result = $this->ai_service->test_connection();

        return rest_ensure_response(array(
            'success' => $result['success'],
            'message' => $result['message'] ?? ($result['success'] ? 'Connection successful' : 'Connection failed'),
            'timestamp' => current_time('mysql')
        ));
    }

    /**
     * Get usage status endpoint
     *
     * GET /wp-json/gmkb/v2/ai/usage
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_usage_status($request) {
        $context = is_user_logged_in() ? 'builder' : 'public';
        $usage = $this->get_usage_info($context);

        return rest_ensure_response(array(
            'success' => true,
            'context' => $context,
            'usage' => $usage
        ));
    }

    /**
     * Tool-based AI content generation endpoint
     *
     * POST /wp-json/gmkb/v2/ai/tool/generate
     *
     * Uses the /tools/ directory architecture with self-contained prompts.php
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function generate_from_tool($request) {
        $tool_id = $request->get_param('tool');
        $params = $request->get_param('params');
        $context = $request->get_param('context') ?? 'public';

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Controller: Tool-based generate request');
            error_log('  - Tool: ' . $tool_id);
            error_log('  - Context: ' . $context);
            error_log('  - Params: ' . wp_json_encode($params));
        }

        // Check if tool discovery is available
        if (!$this->tool_discovery) {
            return new WP_Error(
                'service_unavailable',
                'Tool discovery service is not available.',
                array('status' => 503)
            );
        }

        // Check if tool exists
        if (!$this->tool_discovery->tool_exists($tool_id)) {
            return new WP_Error(
                'tool_not_found',
                sprintf('Tool "%s" not found.', $tool_id),
                array('status' => 404)
            );
        }

        // Load tool prompts configuration
        $prompts = $this->tool_discovery->get_tool_prompts($tool_id);

        if (!$prompts) {
            return new WP_Error(
                'prompts_not_found',
                sprintf('Prompts configuration for tool "%s" not found.', $tool_id),
                array('status' => 500)
            );
        }

        // Validate prompts structure
        $validation = $this->tool_discovery->validate_tool_prompts($tool_id);
        if (!$validation['valid']) {
            return new WP_Error(
                'invalid_prompts',
                'Tool prompts configuration is invalid: ' . implode(', ', $validation['errors']),
                array('status' => 500)
            );
        }

        // Apply validation from prompts.php
        if (isset($prompts['validation'])) {
            $param_validation = $this->validate_tool_params($params, $prompts['validation']);
            if (is_wp_error($param_validation)) {
                return $param_validation;
            }
            // Merge defaults
            if (isset($prompts['validation']['defaults'])) {
                $params = array_merge($prompts['validation']['defaults'], $params);
            }
        }

        try {
            // Get AI settings from prompts.php
            $settings = isset($prompts['settings']) ? $prompts['settings'] : array();
            $model = isset($settings['model']) ? $settings['model'] : 'gpt-4o-mini';
            $temperature = isset($settings['temperature']) ? $settings['temperature'] : 0.7;
            $max_tokens = isset($settings['max_tokens']) ? $settings['max_tokens'] : 1000;

            // Build system prompt
            $system_prompt = isset($prompts['system_prompt']) ? $prompts['system_prompt'] : '';

            // Build user prompt using the callable
            if (!is_callable($prompts['user_prompt'])) {
                return new WP_Error(
                    'invalid_prompt_function',
                    'user_prompt must be a callable function.',
                    array('status' => 500)
                );
            }
            $user_prompt = call_user_func($prompts['user_prompt'], $params);

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB AI Controller: Calling AI service');
                error_log('  - Model: ' . $model);
                error_log('  - System prompt length: ' . strlen($system_prompt));
                error_log('  - User prompt length: ' . strlen($user_prompt));
            }

            // Verify AI service is available
            if (!$this->ai_service) {
                return new WP_Error(
                    'service_unavailable',
                    'AI service is not available.',
                    array('status' => 500)
                );
            }

            // Use centralized AI service for API call
            $api_result = $this->ai_service->call_api($system_prompt, $user_prompt, array(
                'model' => $model,
                'temperature' => $temperature,
                'max_tokens' => $max_tokens
            ));

            if (!$api_result['success']) {
                return new WP_Error(
                    'api_error',
                    $api_result['message'],
                    array('status' => 502)
                );
            }

            $raw_content = $api_result['content'];
            $tokens_used = $api_result['tokens_used'];

            // Parse response using the tool's parser function
            if (!is_callable($prompts['parser'])) {
                return new WP_Error(
                    'invalid_parser_function',
                    'parser must be a callable function.',
                    array('status' => 500)
                );
            }
            $parsed_content = call_user_func($prompts['parser'], $raw_content);

            // Increment usage counter on success
            $this->increment_usage($context);

            // Get updated usage info
            $usage = $this->get_usage_info($context);

            // Build response
            $response_data = array(
                'success' => true,
                'data' => array(
                    'content' => $parsed_content,
                    'tool' => $tool_id,
                    'metadata' => array(
                        'tokens_used' => $tokens_used,
                        'model' => $model,
                        'generated_at' => current_time('mysql')
                    )
                ),
                'usage' => $usage
            );

            $rest_response = rest_ensure_response($response_data);

            // Add rate limit headers
            $rest_response->header('X-RateLimit-Limit', $usage['limit']);
            $rest_response->header('X-RateLimit-Remaining', $usage['remaining']);
            $rest_response->header('X-RateLimit-Reset', time() + $usage['reset_time']);

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB AI Controller: Tool generation successful');
                error_log('  - Content type: ' . gettype($parsed_content));
                error_log('  - Remaining usage: ' . $usage['remaining']);
            }

            return $rest_response;

        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB AI Controller: Exception during tool generation');
                error_log('  - Error: ' . $e->getMessage());
            }

            return new WP_Error(
                'generation_error',
                'An error occurred during content generation: ' . $e->getMessage(),
                array('status' => 500)
            );
        }
    }

    /**
     * Validate tool parameters against validation config
     *
     * @param array $params User-provided parameters
     * @param array $validation Validation config from prompts.php
     * @return true|WP_Error
     */
    private function validate_tool_params($params, $validation) {
        if (!is_array($params)) {
            return new WP_Error(
                'invalid_params',
                'Parameters must be an object.',
                array('status' => 400)
            );
        }

        // Check required fields
        if (isset($validation['required']) && is_array($validation['required'])) {
            foreach ($validation['required'] as $field) {
                if (empty($params[$field])) {
                    return new WP_Error(
                        'missing_required_param',
                        sprintf('Missing required parameter: %s', $field),
                        array('status' => 400)
                    );
                }
            }
        }

        return true;
    }

    /**
     * List available tools endpoint
     *
     * GET /wp-json/gmkb/v2/ai/tools
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function list_tools($request) {
        if (!$this->tool_discovery) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'Tool discovery service not available',
                'tools' => array()
            ));
        }

        $tools = $this->tool_discovery->get_all_tools();

        // Filter out internal properties (those starting with _)
        $public_tools = array_map(function($tool) {
            return array_filter($tool, function($key) {
                return strpos($key, '_') !== 0;
            }, ARRAY_FILTER_USE_KEY);
        }, $tools);

        return rest_ensure_response(array(
            'success' => true,
            'count' => count($public_tools),
            'tools' => array_values($public_tools)
        ));
    }
}
