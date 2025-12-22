<?php
/**
 * Enhanced Persona Generator - Complete Backend PHP Class
 *
 * Handles persona generation, AJAX requests, OpenAI integration, and WordPress post meta storage.
 * Follows unified generator architecture and service-based approach.
 *
 * Generates professional personas that complement bio, topics, and questions generators.
 *
 * @package Media_Kit_Content_Generator
 * @version 1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class MKCG_Enhanced_Persona_Generator {

    /**
     * Version for cache busting and feature tracking
     */
    const VERSION = '1.0';

    /**
     * Rate limiting settings for API protection
     */
    const RATE_LIMIT_REQUESTS = 10;
    const RATE_LIMIT_PERIOD = 3600; // 1 hour

    /**
     * Maximum API request timeout
     */
    const API_TIMEOUT = 60;

    /**
     * Cache duration for API responses
     */
    const CACHE_DURATION = 1800; // 30 minutes

    /**
     * OpenAI model to use for generation
     */
    const OPENAI_MODEL = 'gpt-4';

    /**
     * Default persona settings
     */
    private $default_settings = [
        'style' => 'strategic',
        'focus' => 'expertise',
        'depth' => 'comprehensive',
    ];

    /**
     * Post meta field mappings for WordPress storage
     */
    private $post_meta_fields = [
        'persona_selected' => '_persona_selected',
        'persona_options' => '_persona_options',
        'persona_style' => '_persona_style',
        'persona_focus' => '_persona_focus',
        'persona_depth' => '_persona_depth',
        'generation_date' => '_persona_generation_date',
        'generation_count' => '_persona_generation_count',
        'last_modified' => '_persona_last_modified',
        'api_usage' => '_persona_api_usage',
        'cache_key' => '_persona_cache_key'
    ];

    /**
     * Authority Hook Service for centralized data
     */
    private $authority_hook_service;

    /**
     * Impact Intro Service for centralized data
     */
    private $impact_intro_service;

    /**
     * Initialize the generator with enhanced features
     */
    public function __construct() {
        // Initialize services
        $this->init_services();

        // Register WordPress hooks
        $this->register_hooks();

        error_log('MKCG Persona Generator: Enhanced backend initialized v' . self::VERSION);
    }

    /**
     * Initialize centralized services
     */
    private function init_services() {
        // Initialize Authority Hook Service
        if (class_exists('MKCG_Authority_Hook_Service')) {
            $this->authority_hook_service = new MKCG_Authority_Hook_Service();
        }

        // Initialize Impact Intro Service
        if (class_exists('MKCG_Impact_Intro_Service')) {
            $this->impact_intro_service = new MKCG_Impact_Intro_Service();
        }

        error_log('MKCG Persona Generator: Initialized with centralized services');
    }

    /**
     * Register WordPress hooks
     */
    private function register_hooks() {
        // Register scripts and styles
        add_action('mkcg_register_scripts', [$this, 'register_scripts']);
        add_action('mkcg_enqueue_generator_scripts', [$this, 'enqueue_scripts'], 10, 1);

        // Add meta boxes for persona data
        add_action('add_meta_boxes', [$this, 'add_meta_boxes']);

        // Save post hooks
        add_action('save_post', [$this, 'save_post_data'], 10, 2);
    }

    /**
     * Register scripts and styles
     */
    public function register_scripts() {
        // Register persona generator script
        wp_register_script(
            'mkcg-persona-generator',
            plugins_url('assets/js/generators/persona-generator.js', MKCG_PLUGIN_FILE),
            [],
            self::VERSION,
            true
        );
    }

    /**
     * Enqueue scripts for specific generator
     *
     * @param string $generator_type The generator type
     */
    public function enqueue_scripts($generator_type) {
        if ($generator_type === 'persona') {
            wp_enqueue_script('mkcg-persona-generator');
        }
    }

    /**
     * Get template data for rendering
     *
     * @return array Template data
     */
    public function get_template_data() {
        // Get post ID from URL
        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
        $entry_id = isset($_GET['entry']) ? intval($_GET['entry']) : 0;
        $entry_key = isset($_GET['entry_key']) ? sanitize_text_field($_GET['entry_key']) : '';

        // Initialize template data
        $template_data = [
            'post_id' => $post_id,
            'entry_id' => $entry_id,
            'entry_key' => $entry_key,
            'has_data' => false
        ];

        // If we have a post ID, try to get persona data
        if ($post_id > 0) {
            $persona_data = $this->get_persona_data($post_id);

            if ($persona_data['has_data']) {
                $template_data = array_merge($template_data, $persona_data);
                $template_data['has_data'] = true;
            }
        }

        return $template_data;
    }

    /**
     * Get persona data from post meta
     *
     * @param int $post_id Post ID
     * @return array Persona data
     */
    public function get_persona_data($post_id) {
        // Initialize data structure
        $persona_data = [
            'has_data' => false,
            'selected_persona' => '',
            'persona_options' => [],
            'settings' => $this->default_settings,
            'personal_info' => [
                'name' => '',
                'title' => '',
                'organization' => ''
            ],
            'generation_date' => current_time('mysql')
        ];

        // Check if post exists
        $post = get_post($post_id);
        if (!$post) {
            return $persona_data;
        }

        // Get persona from post meta
        $selected_persona = get_post_meta($post_id, $this->post_meta_fields['persona_selected'], true);
        $persona_options = get_post_meta($post_id, $this->post_meta_fields['persona_options'], true);

        // Get settings from post meta
        $style = get_post_meta($post_id, $this->post_meta_fields['persona_style'], true);
        $focus = get_post_meta($post_id, $this->post_meta_fields['persona_focus'], true);
        $depth = get_post_meta($post_id, $this->post_meta_fields['persona_depth'], true);
        $generation_date = get_post_meta($post_id, $this->post_meta_fields['generation_date'], true);

        // Get personal info
        $name = get_post_meta($post_id, '_guest_name', true);
        if (empty($name)) {
            $name = $post->post_title;
        }

        $title = get_post_meta($post_id, '_guest_title', true);
        $organization = get_post_meta($post_id, '_guest_company', true);

        // Check if we have data
        $has_data = !empty($selected_persona) || !empty($persona_options);

        if ($has_data) {
            $persona_data['has_data'] = true;
            $persona_data['selected_persona'] = $selected_persona;
            $persona_data['persona_options'] = is_array($persona_options) ? $persona_options : [];
            $persona_data['settings'] = [
                'style' => $style ?: $this->default_settings['style'],
                'focus' => $focus ?: $this->default_settings['focus'],
                'depth' => $depth ?: $this->default_settings['depth']
            ];
            $persona_data['personal_info'] = [
                'name' => $name,
                'title' => $title,
                'organization' => $organization
            ];
            $persona_data['generation_date'] = $generation_date ?: current_time('mysql');
        } else {
            // If no persona data, still populate personal info
            $persona_data['personal_info'] = [
                'name' => $name,
                'title' => $title,
                'organization' => $organization
            ];
        }

        return $persona_data;
    }

    /**
     * Enhanced security verification with comprehensive checks
     */
    private function verify_security_comprehensive($action = 'generate') {
        // Check user authentication
        if (!is_user_logged_in()) {
            error_log('MKCG Persona: Security check failed - user not logged in');
            return ['success' => false, 'message' => 'User authentication required'];
        }

        // Check user capabilities
        if (!current_user_can('edit_posts')) {
            error_log('MKCG Persona: Security check failed - insufficient capabilities');
            return ['success' => false, 'message' => 'Insufficient user permissions'];
        }

        // Verify nonce (check both POST and GET)
        $nonce = $_POST['nonce'] ?? $_POST['security'] ?? $_GET['nonce'] ?? $_GET['security'] ?? '';
        if (!wp_verify_nonce($nonce, 'mkcg_nonce')) {
            error_log('MKCG Persona: Security check failed - invalid nonce');
            return ['success' => false, 'message' => 'Security verification failed'];
        }

        // Check rate limiting
        $rate_check = $this->check_rate_limit();
        if (!$rate_check['allowed']) {
            error_log('MKCG Persona: Rate limit exceeded for user ' . get_current_user_id());
            return ['success' => false, 'message' => 'Rate limit exceeded. Please wait before making another request.'];
        }

        return ['success' => true, 'message' => 'Security verification passed'];
    }

    /**
     * Rate limiting implementation
     */
    private function check_rate_limit() {
        $user_id = get_current_user_id();
        $current_time = time();
        $cache_key = 'mkcg_persona_rate_limit_' . $user_id;

        // Get existing rate limit data
        $rate_data = get_transient($cache_key);

        if (!$rate_data) {
            $rate_data = [
                'count' => 0,
                'start_time' => $current_time
            ];
        }

        // Reset if period has passed
        if (($current_time - $rate_data['start_time']) >= self::RATE_LIMIT_PERIOD) {
            $rate_data = [
                'count' => 0,
                'start_time' => $current_time
            ];
        }

        // Check if limit exceeded
        if ($rate_data['count'] >= self::RATE_LIMIT_REQUESTS) {
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset_time' => $rate_data['start_time'] + self::RATE_LIMIT_PERIOD
            ];
        }

        // Increment counter
        $rate_data['count']++;
        set_transient($cache_key, $rate_data, self::RATE_LIMIT_PERIOD);

        return [
            'allowed' => true,
            'remaining' => self::RATE_LIMIT_REQUESTS - $rate_data['count'],
            'reset_time' => $rate_data['start_time'] + self::RATE_LIMIT_PERIOD
        ];
    }

    /**
     * Enhanced input validation and sanitization
     */
    private function validate_and_sanitize_input($data) {
        $sanitized = [];
        $errors = [];

        // Validate required fields
        $required_fields = ['name'];
        foreach ($required_fields as $field) {
            if (empty($data[$field])) {
                $errors[] = "Field '{$field}' is required";
            }
        }

        // Sanitize all text fields
        $text_fields = ['name', 'title', 'organization', 'style', 'focus', 'depth'];
        foreach ($text_fields as $field) {
            $sanitized[$field] = isset($data[$field]) ? sanitize_text_field($data[$field]) : '';
        }

        // Sanitize textarea fields
        $textarea_fields = ['authority_hook', 'impact_intro', 'industry', 'unique_factors', 'additional_notes'];
        foreach ($textarea_fields as $field) {
            $sanitized[$field] = isset($data[$field]) ? sanitize_textarea_field($data[$field]) : '';
        }

        // Validate style options
        $valid_styles = ['strategic', 'tactical', 'thought-leader', 'practitioner', 'innovator'];
        if (!empty($sanitized['style']) && !in_array($sanitized['style'], $valid_styles)) {
            $errors[] = 'Invalid style specified';
            $sanitized['style'] = $this->default_settings['style'];
        }

        // Validate focus options
        $valid_focuses = ['expertise', 'impact', 'innovation', 'leadership', 'results'];
        if (!empty($sanitized['focus']) && !in_array($sanitized['focus'], $valid_focuses)) {
            $errors[] = 'Invalid focus specified';
            $sanitized['focus'] = $this->default_settings['focus'];
        }

        // Validate depth options
        $valid_depths = ['concise', 'comprehensive', 'detailed'];
        if (!empty($sanitized['depth']) && !in_array($sanitized['depth'], $valid_depths)) {
            $errors[] = 'Invalid depth specified';
            $sanitized['depth'] = $this->default_settings['depth'];
        }

        // Validate post ID
        if (isset($data['post_id'])) {
            $sanitized['post_id'] = intval($data['post_id']);
            if ($sanitized['post_id'] <= 0) {
                $errors[] = 'Invalid post ID';
            }
        }

        return [
            'success' => empty($errors),
            'data' => $sanitized,
            'errors' => $errors
        ];
    }

    /**
     * Enhanced persona generation with comprehensive error handling and caching
     *
     * @param array $data Form data
     * @return array Generated personas
     */
    private function generate_personas($data) {
        // Check cache first
        $cache_key = $this->generate_cache_key($data);
        $cached_result = $this->get_cached_personas($cache_key);

        if ($cached_result) {
            error_log('MKCG Persona: Using cached result for request');
            return $cached_result;
        }

        // Check if we have the required data
        if (empty($data['name'])) {
            return [
                'success' => false,
                'message' => 'Name is required to generate personas.'
            ];
        }

        // Set up style guidelines
        $style_guidelines = [
            'strategic' => 'high-level visionary focused on big-picture thinking and long-term strategy',
            'tactical' => 'hands-on implementer focused on practical execution and immediate results',
            'thought-leader' => 'industry influencer focused on shaping conversations and driving change',
            'practitioner' => 'skilled expert focused on mastery of craft and practical application',
            'innovator' => 'creative disruptor focused on breakthrough thinking and novel solutions'
        ];

        // Set up focus guidelines
        $focus_guidelines = [
            'expertise' => 'deep technical knowledge and specialized skills',
            'impact' => 'measurable results and transformative outcomes',
            'innovation' => 'creative approaches and cutting-edge solutions',
            'leadership' => 'guiding teams and influencing industry direction',
            'results' => 'proven track record and quantifiable achievements'
        ];

        // Prepare the prompt
        $prompt = "You are a professional brand strategist tasked with creating compelling professional personas for {$data['name']}";

        if (!empty($data['title'])) {
            $prompt .= ", a {$data['title']}";
        }

        if (!empty($data['organization'])) {
            $prompt .= " at {$data['organization']}";
        }

        $prompt .= ".\n\n";

        $prompt .= "Generate 5 distinct professional persona options that could be used for media appearances, speaking engagements, and thought leadership.\n\n";

        $prompt .= "Each persona should be {$style_guidelines[$data['style']]} with emphasis on {$focus_guidelines[$data['focus']]}.\n\n";

        $prompt .= "Use the following information as the foundation:\n\n";

        if (!empty($data['authority_hook'])) {
            $prompt .= "AUTHORITY HOOK (core expertise and value proposition):\n{$data['authority_hook']}\n\n";
        }

        if (!empty($data['impact_intro'])) {
            $prompt .= "IMPACT INTRO (credentials and mission):\n{$data['impact_intro']}\n\n";
        }

        if (!empty($data['industry'])) {
            $prompt .= "INDUSTRY CONTEXT:\n{$data['industry']}\n\n";
        }

        if (!empty($data['unique_factors'])) {
            $prompt .= "UNIQUE FACTORS:\n{$data['unique_factors']}\n\n";
        }

        if (!empty($data['additional_notes'])) {
            $prompt .= "ADDITIONAL NOTES:\n{$data['additional_notes']}\n\n";
        }

        $prompt .= "For each persona, create:\n";
        $prompt .= "1. A distinctive persona title/label (e.g., 'The Strategic Disruptor', 'The Practical Innovator')\n";
        $prompt .= "2. A compelling 2-3 sentence description that captures their essence and positioning\n\n";

        $prompt .= "Guidelines:\n";
        $prompt .= "- Each persona should be distinct and authentic\n";
        $prompt .= "- Focus on how they want to be perceived in the industry\n";
        $prompt .= "- Include specific angles or perspectives they bring\n";
        $prompt .= "- Make each persona actionable for content creation and positioning\n";
        $prompt .= "- Ensure personas feel genuine and not forced\n\n";

        $prompt .= "Format your response as follows:\n";
        $prompt .= "PERSONA 1:\n[Title]\n[Description]\n\n";
        $prompt .= "PERSONA 2:\n[Title]\n[Description]\n\n";
        $prompt .= "PERSONA 3:\n[Title]\n[Description]\n\n";
        $prompt .= "PERSONA 4:\n[Title]\n[Description]\n\n";
        $prompt .= "PERSONA 5:\n[Title]\n[Description]\n";

        // Check if OpenAI API key is available
        $api_key = get_option('mkcg_openai_api_key');
        if (empty($api_key)) {
            error_log('MKCG Persona: OpenAI API key not configured');
            return [
                'success' => false,
                'message' => 'OpenAI API key is not configured. Please set it in the plugin settings.',
                'error_code' => 'API_KEY_MISSING'
            ];
        }

        // Validate API key format
        if (!$this->validate_api_key_format($api_key)) {
            error_log('MKCG Persona: Invalid API key format');
            return [
                'success' => false,
                'message' => 'Invalid OpenAI API key format. Please check your configuration.',
                'error_code' => 'API_KEY_INVALID'
            ];
        }

        try {
            // Prepare API request
            $headers = [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json'
            ];

            $request_body = [
                'model' => self::OPENAI_MODEL,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional brand strategist who creates compelling, authentic professional personas.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.8,
                'max_tokens' => 1500
            ];

            // Send request to OpenAI API
            $response = wp_remote_post(
                'https://api.openai.com/v1/chat/completions',
                [
                    'headers' => $headers,
                    'body' => wp_json_encode($request_body),
                    'timeout' => self::API_TIMEOUT,
                    'data_format' => 'body'
                ]
            );

            // Check for errors
            if (is_wp_error($response)) {
                error_log('MKCG Persona: OpenAI API error - ' . $response->get_error_message());
                return [
                    'success' => false,
                    'message' => 'Error connecting to OpenAI API: ' . $response->get_error_message()
                ];
            }

            // Parse response
            $response_body = wp_remote_retrieve_body($response);
            $response_data = json_decode($response_body, true);

            // Check for API errors
            if (isset($response_data['error'])) {
                error_log('MKCG Persona: OpenAI API error - ' . $response_data['error']['message']);
                return [
                    'success' => false,
                    'message' => 'OpenAI API error: ' . $response_data['error']['message']
                ];
            }

            // Extract content from response
            $content = $response_data['choices'][0]['message']['content'] ?? '';

            if (empty($content)) {
                return [
                    'success' => false,
                    'message' => 'OpenAI API returned empty response.'
                ];
            }

            // Parse the personas from the response
            $personas = [];
            for ($i = 1; $i <= 5; $i++) {
                $pattern = "/PERSONA {$i}:\s*(.*?)(?:\n\n|\$)/s";
                if ($i < 5) {
                    $pattern = "/PERSONA {$i}:\s*(.*?)(?=\s*PERSONA " . ($i + 1) . ":|$)/s";
                }

                preg_match($pattern, $content, $matches);

                if (!empty($matches[1])) {
                    // Split into title and description
                    $persona_text = trim($matches[1]);
                    $lines = explode("\n", $persona_text, 2);

                    $personas[] = [
                        'title' => trim($lines[0]),
                        'description' => isset($lines[1]) ? trim($lines[1]) : '',
                        'id' => 'persona_' . $i
                    ];
                }
            }

            // Check if we have at least one persona
            if (empty($personas)) {
                error_log('MKCG Persona: Failed to parse personas from OpenAI response');
                return [
                    'success' => false,
                    'message' => 'Failed to parse personas from OpenAI response.',
                    'error_code' => 'PARSE_FAILED',
                    'raw_response' => substr($content, 0, 500)
                ];
            }

            // Cache successful result
            $result = [
                'success' => true,
                'personas' => $personas,
                'count' => count($personas),
                'settings' => [
                    'style' => $data['style'],
                    'focus' => $data['focus'],
                    'depth' => $data['depth']
                ],
                'personal_info' => [
                    'name' => $data['name'],
                    'title' => $data['title'],
                    'organization' => $data['organization']
                ],
                'generation_date' => current_time('mysql'),
                'cache_key' => $cache_key
            ];

            $this->cache_personas_result($cache_key, $result);

            // Save personas to post meta if we have a post ID
            if (!empty($data['post_id'])) {
                $this->save_personas_to_post_meta($data['post_id'], $personas, [
                    'style' => $data['style'],
                    'focus' => $data['focus'],
                    'depth' => $data['depth']
                ]);

                // Update generation count and API usage
                $this->update_generation_stats($data['post_id']);
            }

            return $result;
        } catch (Exception $e) {
            error_log('MKCG Persona: Exception - ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error generating personas: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Save personas to post meta
     *
     * @param int $post_id Post ID
     * @param array $personas Personas to save
     * @param array $settings Settings to save
     * @return bool Success status
     */
    private function save_personas_to_post_meta($post_id, $personas, $settings) {
        // Check if post exists
        $post = get_post($post_id);
        if (!$post) {
            return false;
        }

        // Save personas
        update_post_meta($post_id, $this->post_meta_fields['persona_options'], $personas);

        // Save settings
        update_post_meta($post_id, $this->post_meta_fields['persona_style'], $settings['style']);
        update_post_meta($post_id, $this->post_meta_fields['persona_focus'], $settings['focus']);
        update_post_meta($post_id, $this->post_meta_fields['persona_depth'], $settings['depth']);
        update_post_meta($post_id, $this->post_meta_fields['generation_date'], current_time('mysql'));

        return true;
    }

    /**
     * Save selected persona to post meta
     *
     * @param int $post_id Post ID
     * @param string $persona_id Selected persona ID
     * @return bool Success status
     */
    private function save_selected_persona($post_id, $persona_id) {
        // Check if post exists
        $post = get_post($post_id);
        if (!$post) {
            return false;
        }

        // Get persona options
        $personas = get_post_meta($post_id, $this->post_meta_fields['persona_options'], true);

        if (!is_array($personas)) {
            return false;
        }

        // Find the selected persona
        $selected_persona = null;
        foreach ($personas as $persona) {
            if ($persona['id'] === $persona_id) {
                $selected_persona = $persona;
                break;
            }
        }

        if (!$selected_persona) {
            return false;
        }

        // Save selected persona
        update_post_meta($post_id, $this->post_meta_fields['persona_selected'], $selected_persona);

        return true;
    }

    /**
     * Generate cache key for persona request
     */
    private function generate_cache_key($data) {
        $key_data = [
            'name' => $data['name'],
            'title' => $data['title'],
            'organization' => $data['organization'],
            'style' => $data['style'],
            'focus' => $data['focus'],
            'authority_hook' => $data['authority_hook'],
            'impact_intro' => $data['impact_intro'],
            'industry' => $data['industry']
        ];

        return 'mkcg_persona_' . md5(serialize($key_data));
    }

    /**
     * Get cached persona result
     */
    private function get_cached_personas($cache_key) {
        return get_transient($cache_key);
    }

    /**
     * Cache persona result
     */
    private function cache_personas_result($cache_key, $result) {
        set_transient($cache_key, $result, self::CACHE_DURATION);
    }

    /**
     * Validate OpenAI API key format
     */
    private function validate_api_key_format($api_key) {
        // OpenAI API keys typically start with 'sk-' and are 51 characters long
        return (strlen($api_key) >= 20 && strpos($api_key, 'sk-') === 0);
    }

    /**
     * Update generation statistics
     */
    private function update_generation_stats($post_id) {
        // Update generation count
        $current_count = get_post_meta($post_id, $this->post_meta_fields['generation_count'], true);
        $new_count = intval($current_count) + 1;
        update_post_meta($post_id, $this->post_meta_fields['generation_count'], $new_count);

        // Update last modified
        update_post_meta($post_id, $this->post_meta_fields['last_modified'], current_time('mysql'));

        // Update API usage statistics
        $api_usage = get_post_meta($post_id, $this->post_meta_fields['api_usage'], true);
        if (!is_array($api_usage)) {
            $api_usage = [];
        }

        $today = date('Y-m-d');
        if (!isset($api_usage[$today])) {
            $api_usage[$today] = 0;
        }
        $api_usage[$today]++;

        // Keep only last 30 days
        $cutoff_date = date('Y-m-d', strtotime('-30 days'));
        foreach ($api_usage as $date => $count) {
            if ($date < $cutoff_date) {
                unset($api_usage[$date]);
            }
        }

        update_post_meta($post_id, $this->post_meta_fields['api_usage'], $api_usage);
    }

    /**
     * Add meta boxes for persona data
     */
    public function add_meta_boxes() {
        $post_types = ['post', 'page', 'guests'];

        foreach ($post_types as $post_type) {
            add_meta_box(
                'mkcg_persona_data',
                'Persona Generator Data',
                [$this, 'render_meta_box'],
                $post_type,
                'normal',
                'default'
            );
        }
    }

    /**
     * Render meta box content
     */
    public function render_meta_box($post) {
        $persona_data = $this->get_persona_data($post->ID);

        wp_nonce_field('mkcg_persona_meta_box', 'mkcg_persona_nonce');

        echo '<div class="mkcg-meta-box">';
        echo '<h4>Generated Personas</h4>';

        if ($persona_data['has_data']) {
            if (!empty($persona_data['selected_persona'])) {
                echo '<div class="selected-persona">';
                echo '<h5>Selected Persona</h5>';
                echo '<p><strong>' . esc_html($persona_data['selected_persona']['title']) . '</strong></p>';
                echo '<p>' . esc_html($persona_data['selected_persona']['description']) . '</p>';
                echo '</div>';
            }

            if (!empty($persona_data['persona_options'])) {
                echo '<div class="persona-options">';
                echo '<h5>All Options (' . count($persona_data['persona_options']) . ')</h5>';
                foreach ($persona_data['persona_options'] as $persona) {
                    echo '<div class="persona-option">';
                    echo '<p><strong>' . esc_html($persona['title']) . '</strong></p>';
                    echo '<p><small>' . esc_html($persona['description']) . '</small></p>';
                    echo '</div>';
                }
                echo '</div>';
            }

            echo '<div class="persona-settings">';
            echo '<p><strong>Settings:</strong> Style: ' . esc_html($persona_data['settings']['style']) . ', Focus: ' . esc_html($persona_data['settings']['focus']) . '</p>';
            echo '<p><strong>Generated:</strong> ' . esc_html($persona_data['generation_date']) . '</p>';
            echo '</div>';
        } else {
            echo '<p>No personas generated yet.</p>';
        }

        echo '</div>';
    }

    /**
     * Save post data hook
     */
    public function save_post_data($post_id, $post) {
        // Verify nonce
        if (!isset($_POST['mkcg_persona_nonce']) || !wp_verify_nonce($_POST['mkcg_persona_nonce'], 'mkcg_persona_meta_box')) {
            return;
        }

        // Check user capabilities
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Auto-save handling
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Update last modified timestamp
        update_post_meta($post_id, $this->post_meta_fields['last_modified'], current_time('mysql'));
    }

    /**
     * AJAX handler for generating personas
     */
    public function ajax_generate_personas() {
        // Enhanced security verification
        $security_check = $this->verify_security_comprehensive('generate');
        if (!$security_check['success']) {
            wp_send_json_error($security_check);
            return;
        }

        // Enhanced data collection and validation
        $raw_data = [
            'post_id' => isset($_POST['post_id']) ? $_POST['post_id'] : 0,
            'authority_hook' => isset($_POST['authority_hook']) ? $_POST['authority_hook'] : '',
            'impact_intro' => isset($_POST['impact_intro']) ? $_POST['impact_intro'] : '',
            'name' => isset($_POST['name']) ? $_POST['name'] : '',
            'title' => isset($_POST['title']) ? $_POST['title'] : '',
            'organization' => isset($_POST['organization']) ? $_POST['organization'] : '',
            'style' => isset($_POST['style']) ? $_POST['style'] : $this->default_settings['style'],
            'focus' => isset($_POST['focus']) ? $_POST['focus'] : $this->default_settings['focus'],
            'depth' => isset($_POST['depth']) ? $_POST['depth'] : $this->default_settings['depth'],
            'industry' => isset($_POST['industry']) ? $_POST['industry'] : '',
            'unique_factors' => isset($_POST['unique_factors']) ? $_POST['unique_factors'] : '',
            'additional_notes' => isset($_POST['additional_notes']) ? $_POST['additional_notes'] : ''
        ];

        // Validate and sanitize input
        $validation_result = $this->validate_and_sanitize_input($raw_data);
        if (!$validation_result['success']) {
            wp_send_json_error([
                'message' => 'Validation failed: ' . implode(', ', $validation_result['errors']),
                'errors' => $validation_result['errors']
            ]);
            return;
        }

        $data = $validation_result['data'];

        // Generate personas
        $result = $this->generate_personas($data);

        if ($result['success']) {
            error_log('MKCG Persona: Successfully generated personas for post ' . $data['post_id']);
            wp_send_json_success($result);
        } else {
            error_log('MKCG Persona: Failed to generate personas - ' . $result['message']);
            wp_send_json_error($result);
        }
    }

    /**
     * AJAX handler for saving selected persona
     */
    public function ajax_save_persona() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mkcg_nonce')) {
            wp_send_json_error(['message' => 'Security check failed.']);
            return;
        }

        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $persona_id = isset($_POST['persona_id']) ? sanitize_text_field($_POST['persona_id']) : '';

        if (!$post_id || !$persona_id) {
            wp_send_json_error(['message' => 'Post ID and persona ID are required.']);
            return;
        }

        $result = $this->save_selected_persona($post_id, $persona_id);

        if ($result) {
            wp_send_json_success(['message' => 'Persona saved successfully.']);
        } else {
            wp_send_json_error(['message' => 'Failed to save persona.']);
        }
    }

    /**
     * AJAX handler for getting persona data
     */
    public function ajax_get_persona_data() {
        // Enhanced security verification
        $security_check = $this->verify_security_comprehensive('get');
        if (!$security_check['success']) {
            wp_send_json_error($security_check);
            return;
        }

        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;

        if (!$post_id) {
            wp_send_json_error(['message' => 'Post ID is required']);
            return;
        }

        // Get persona data
        $persona_data = $this->get_persona_data($post_id);

        wp_send_json_success($persona_data);
    }
}

// Initialize the generator
new MKCG_Enhanced_Persona_Generator();
