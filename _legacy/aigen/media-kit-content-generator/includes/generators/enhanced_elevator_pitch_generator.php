<?php
/**
 * Enhanced Elevator Pitch Generator - Complete Backend PHP Class
 *
 * Generates multi-length elevator pitches optimized for different contexts.
 * Follows unified generator architecture and service-based approach.
 *
 * @package Media_Kit_Content_Generator
 * @version 1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class MKCG_Enhanced_Elevator_Pitch_Generator {

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
     * Default settings
     */
    private $default_settings = [
        'context' => 'networking',
        'tone' => 'professional',
    ];

    /**
     * Post meta field mappings for WordPress storage
     */
    private $post_meta_fields = [
        'pitch_30s' => '_elevator_pitch_30s',
        'pitch_60s' => '_elevator_pitch_60s',
        'pitch_2min' => '_elevator_pitch_2min',
        'pitch_5min' => '_elevator_pitch_5min',
        'context' => '_elevator_pitch_context',
        'tone' => '_elevator_pitch_tone',
        'generation_date' => '_elevator_pitch_generation_date',
        'generation_count' => '_elevator_pitch_generation_count',
        'last_modified' => '_elevator_pitch_last_modified',
        'api_usage' => '_elevator_pitch_api_usage',
        'cache_key' => '_elevator_pitch_cache_key'
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

        error_log('MKCG Elevator Pitch Generator: Enhanced backend initialized v' . self::VERSION);
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

        error_log('MKCG Elevator Pitch Generator: Initialized with centralized services');
    }

    /**
     * Register WordPress hooks
     */
    private function register_hooks() {
        // Register scripts and styles
        add_action('mkcg_register_scripts', [$this, 'register_scripts']);
        add_action('mkcg_enqueue_generator_scripts', [$this, 'enqueue_scripts'], 10, 1);

        // Add meta boxes
        add_action('add_meta_boxes', [$this, 'add_meta_boxes']);

        // Save post hooks
        add_action('save_post', [$this, 'save_post_data'], 10, 2);
    }

    /**
     * Register scripts and styles
     */
    public function register_scripts() {
        wp_register_script(
            'mkcg-elevator-pitch-generator',
            plugins_url('assets/js/generators/elevator-pitch-generator.js', MKCG_PLUGIN_FILE),
            [],
            self::VERSION,
            true
        );
    }

    /**
     * Enqueue scripts for specific generator
     */
    public function enqueue_scripts($generator_type) {
        if ($generator_type === 'elevator_pitch') {
            wp_enqueue_script('mkcg-elevator-pitch-generator');
        }
    }

    /**
     * Get template data for rendering
     */
    public function get_template_data() {
        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
        $entry_id = isset($_GET['entry']) ? intval($_GET['entry']) : 0;
        $entry_key = isset($_GET['entry_key']) ? sanitize_text_field($_GET['entry_key']) : '';

        $template_data = [
            'post_id' => $post_id,
            'entry_id' => $entry_id,
            'entry_key' => $entry_key,
            'has_data' => false
        ];

        if ($post_id > 0) {
            $pitch_data = $this->get_pitch_data($post_id);

            if ($pitch_data['has_data']) {
                $template_data = array_merge($template_data, $pitch_data);
                $template_data['has_data'] = true;
            }
        }

        return $template_data;
    }

    /**
     * Get pitch data from post meta
     */
    public function get_pitch_data($post_id) {
        $pitch_data = [
            'has_data' => false,
            'pitches' => [
                '30s' => '',
                '60s' => '',
                '2min' => '',
                '5min' => ''
            ],
            'settings' => $this->default_settings,
            'personal_info' => [
                'name' => '',
                'title' => '',
                'organization' => ''
            ],
            'generation_date' => current_time('mysql')
        ];

        $post = get_post($post_id);
        if (!$post) {
            return $pitch_data;
        }

        // Get pitches from post meta
        $pitch_30s = get_post_meta($post_id, $this->post_meta_fields['pitch_30s'], true);
        $pitch_60s = get_post_meta($post_id, $this->post_meta_fields['pitch_60s'], true);
        $pitch_2min = get_post_meta($post_id, $this->post_meta_fields['pitch_2min'], true);
        $pitch_5min = get_post_meta($post_id, $this->post_meta_fields['pitch_5min'], true);

        // Get settings
        $context = get_post_meta($post_id, $this->post_meta_fields['context'], true);
        $tone = get_post_meta($post_id, $this->post_meta_fields['tone'], true);
        $generation_date = get_post_meta($post_id, $this->post_meta_fields['generation_date'], true);

        // Get personal info
        $name = get_post_meta($post_id, '_guest_name', true);
        if (empty($name)) {
            $name = $post->post_title;
        }

        $title = get_post_meta($post_id, '_guest_title', true);
        $organization = get_post_meta($post_id, '_guest_company', true);

        $has_data = !empty($pitch_30s) || !empty($pitch_60s) || !empty($pitch_2min) || !empty($pitch_5min);

        if ($has_data) {
            $pitch_data['has_data'] = true;
            $pitch_data['pitches'] = [
                '30s' => $pitch_30s,
                '60s' => $pitch_60s,
                '2min' => $pitch_2min,
                '5min' => $pitch_5min
            ];
            $pitch_data['settings'] = [
                'context' => $context ?: $this->default_settings['context'],
                'tone' => $tone ?: $this->default_settings['tone']
            ];
            $pitch_data['personal_info'] = [
                'name' => $name,
                'title' => $title,
                'organization' => $organization
            ];
            $pitch_data['generation_date'] = $generation_date ?: current_time('mysql');
        } else {
            $pitch_data['personal_info'] = [
                'name' => $name,
                'title' => $title,
                'organization' => $organization
            ];
        }

        return $pitch_data;
    }

    /**
     * Enhanced security verification
     */
    private function verify_security_comprehensive($action = 'generate') {
        if (!is_user_logged_in()) {
            error_log('MKCG Elevator Pitch: Security check failed - user not logged in');
            return ['success' => false, 'message' => 'User authentication required'];
        }

        if (!current_user_can('edit_posts')) {
            error_log('MKCG Elevator Pitch: Security check failed - insufficient capabilities');
            return ['success' => false, 'message' => 'Insufficient user permissions'];
        }

        $nonce = $_POST['nonce'] ?? $_POST['security'] ?? $_GET['nonce'] ?? $_GET['security'] ?? '';
        if (!wp_verify_nonce($nonce, 'mkcg_nonce')) {
            error_log('MKCG Elevator Pitch: Security check failed - invalid nonce');
            return ['success' => false, 'message' => 'Security verification failed'];
        }

        $rate_check = $this->check_rate_limit();
        if (!$rate_check['allowed']) {
            error_log('MKCG Elevator Pitch: Rate limit exceeded for user ' . get_current_user_id());
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
        $cache_key = 'mkcg_elevator_pitch_rate_limit_' . $user_id;

        $rate_data = get_transient($cache_key);

        if (!$rate_data) {
            $rate_data = [
                'count' => 0,
                'start_time' => $current_time
            ];
        }

        if (($current_time - $rate_data['start_time']) >= self::RATE_LIMIT_PERIOD) {
            $rate_data = [
                'count' => 0,
                'start_time' => $current_time
            ];
        }

        if ($rate_data['count'] >= self::RATE_LIMIT_REQUESTS) {
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset_time' => $rate_data['start_time'] + self::RATE_LIMIT_PERIOD
            ];
        }

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

        $required_fields = ['name'];
        foreach ($required_fields as $field) {
            if (empty($data[$field])) {
                $errors[] = "Field '{$field}' is required";
            }
        }

        $text_fields = ['name', 'title', 'organization', 'context', 'tone'];
        foreach ($text_fields as $field) {
            $sanitized[$field] = isset($data[$field]) ? sanitize_text_field($data[$field]) : '';
        }

        $textarea_fields = ['authority_hook', 'impact_intro', 'value_proposition', 'target_audience', 'unique_benefit', 'call_to_action'];
        foreach ($textarea_fields as $field) {
            $sanitized[$field] = isset($data[$field]) ? sanitize_textarea_field($data[$field]) : '';
        }

        $valid_contexts = ['networking', 'virtual', 'conference', 'email', 'media'];
        if (!empty($sanitized['context']) && !in_array($sanitized['context'], $valid_contexts)) {
            $errors[] = 'Invalid context specified';
            $sanitized['context'] = $this->default_settings['context'];
        }

        $valid_tones = ['professional', 'conversational', 'energetic', 'authoritative'];
        if (!empty($sanitized['tone']) && !in_array($sanitized['tone'], $valid_tones)) {
            $errors[] = 'Invalid tone specified';
            $sanitized['tone'] = $this->default_settings['tone'];
        }

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
     * Generate elevator pitches with comprehensive error handling
     */
    private function generate_pitches($data) {
        // Check cache first
        $cache_key = $this->generate_cache_key($data);
        $cached_result = $this->get_cached_pitches($cache_key);

        if ($cached_result) {
            error_log('MKCG Elevator Pitch: Using cached result');
            return $cached_result;
        }

        if (empty($data['name'])) {
            return [
                'success' => false,
                'message' => 'Name is required to generate elevator pitches.'
            ];
        }

        // Context guidelines
        $context_guidelines = [
            'networking' => 'in-person networking event with quick introductions',
            'virtual' => 'virtual meeting or video call setting',
            'conference' => 'professional conference or speaking engagement',
            'email' => 'email introduction or cold outreach',
            'media' => 'media interview or podcast appearance'
        ];

        // Tone guidelines
        $tone_guidelines = [
            'professional' => 'polished, business-appropriate, and authoritative',
            'conversational' => 'friendly, approachable, and natural',
            'energetic' => 'enthusiastic, dynamic, and compelling',
            'authoritative' => 'confident, expert-level, and commanding'
        ];

        // Prepare the prompt
        $prompt = "You are a professional pitch writer creating elevator pitches for {$data['name']}";

        if (!empty($data['title'])) {
            $prompt .= ", a {$data['title']}";
        }

        if (!empty($data['organization'])) {
            $prompt .= " at {$data['organization']}";
        }

        $prompt .= ".\n\n";

        $prompt .= "Create 4 elevator pitches optimized for a {$context_guidelines[$data['context']]}.\n";
        $prompt .= "Use a {$tone_guidelines[$data['tone']]} tone throughout.\n\n";

        $prompt .= "Use the following information:\n\n";

        if (!empty($data['authority_hook'])) {
            $prompt .= "AUTHORITY HOOK (expertise and value):\n{$data['authority_hook']}\n\n";
        }

        if (!empty($data['impact_intro'])) {
            $prompt .= "IMPACT INTRO (credentials and mission):\n{$data['impact_intro']}\n\n";
        }

        if (!empty($data['value_proposition'])) {
            $prompt .= "VALUE PROPOSITION:\n{$data['value_proposition']}\n\n";
        }

        if (!empty($data['target_audience'])) {
            $prompt .= "TARGET AUDIENCE:\n{$data['target_audience']}\n\n";
        }

        if (!empty($data['unique_benefit'])) {
            $prompt .= "UNIQUE BENEFIT:\n{$data['unique_benefit']}\n\n";
        }

        if (!empty($data['call_to_action'])) {
            $prompt .= "DESIRED CALL TO ACTION:\n{$data['call_to_action']}\n\n";
        }

        $prompt .= "Create 4 versions:\n";
        $prompt .= "1. 30-SECOND PITCH: Approximately 75 words. Ultra-concise, memorable hook.\n";
        $prompt .= "2. 60-SECOND PITCH: Approximately 150 words. Adds key credibility and value.\n";
        $prompt .= "3. 2-MINUTE PITCH: Approximately 300 words. Full story with examples.\n";
        $prompt .= "4. 5-MINUTE PITCH: Approximately 750 words. Comprehensive narrative with depth.\n\n";

        $prompt .= "Guidelines:\n";
        $prompt .= "- Start with a hook that grabs attention\n";
        $prompt .= "- Clearly articulate the problem you solve\n";
        $prompt .= "- Explain your unique approach or solution\n";
        $prompt .= "- Include relevant credibility markers\n";
        $prompt .= "- End with a clear next step or CTA\n";
        $prompt .= "- Make each version complete and self-contained\n";
        $prompt .= "- Scale depth appropriately for each length\n\n";

        $prompt .= "Format your response as:\n";
        $prompt .= "30-SECOND PITCH:\n[pitch here]\n\n";
        $prompt .= "60-SECOND PITCH:\n[pitch here]\n\n";
        $prompt .= "2-MINUTE PITCH:\n[pitch here]\n\n";
        $prompt .= "5-MINUTE PITCH:\n[pitch here]\n";

        // Check API key
        $api_key = get_option('mkcg_openai_api_key');
        if (empty($api_key)) {
            error_log('MKCG Elevator Pitch: OpenAI API key not configured');
            return [
                'success' => false,
                'message' => 'OpenAI API key is not configured.',
                'error_code' => 'API_KEY_MISSING'
            ];
        }

        if (!$this->validate_api_key_format($api_key)) {
            error_log('MKCG Elevator Pitch: Invalid API key format');
            return [
                'success' => false,
                'message' => 'Invalid OpenAI API key format.',
                'error_code' => 'API_KEY_INVALID'
            ];
        }

        try {
            $headers = [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json'
            ];

            $request_body = [
                'model' => self::OPENAI_MODEL,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional pitch writer who creates compelling, memorable elevator pitches.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 2000
            ];

            $response = wp_remote_post(
                'https://api.openai.com/v1/chat/completions',
                [
                    'headers' => $headers,
                    'body' => wp_json_encode($request_body),
                    'timeout' => self::API_TIMEOUT,
                    'data_format' => 'body'
                ]
            );

            if (is_wp_error($response)) {
                error_log('MKCG Elevator Pitch: OpenAI API error - ' . $response->get_error_message());
                return [
                    'success' => false,
                    'message' => 'Error connecting to OpenAI API: ' . $response->get_error_message()
                ];
            }

            $response_body = wp_remote_retrieve_body($response);
            $response_data = json_decode($response_body, true);

            if (isset($response_data['error'])) {
                error_log('MKCG Elevator Pitch: OpenAI API error - ' . $response_data['error']['message']);
                return [
                    'success' => false,
                    'message' => 'OpenAI API error: ' . $response_data['error']['message']
                ];
            }

            $content = $response_data['choices'][0]['message']['content'] ?? '';

            if (empty($content)) {
                return [
                    'success' => false,
                    'message' => 'OpenAI API returned empty response.'
                ];
            }

            // Parse the pitches
            $pitches = [];

            preg_match('/30-SECOND PITCH:\s*(.*?)(?=\s*60-SECOND PITCH:|$)/s', $content, $pitch_30s);
            preg_match('/60-SECOND PITCH:\s*(.*?)(?=\s*2-MINUTE PITCH:|$)/s', $content, $pitch_60s);
            preg_match('/2-MINUTE PITCH:\s*(.*?)(?=\s*5-MINUTE PITCH:|$)/s', $content, $pitch_2min);
            preg_match('/5-MINUTE PITCH:\s*(.*?)$/s', $content, $pitch_5min);

            $pitches['30s'] = !empty($pitch_30s[1]) ? trim($pitch_30s[1]) : '';
            $pitches['60s'] = !empty($pitch_60s[1]) ? trim($pitch_60s[1]) : '';
            $pitches['2min'] = !empty($pitch_2min[1]) ? trim($pitch_2min[1]) : '';
            $pitches['5min'] = !empty($pitch_5min[1]) ? trim($pitch_5min[1]) : '';

            if (empty($pitches['30s']) && empty($pitches['60s']) && empty($pitches['2min']) && empty($pitches['5min'])) {
                error_log('MKCG Elevator Pitch: Failed to parse pitches from response');
                return [
                    'success' => false,
                    'message' => 'Failed to parse pitches from OpenAI response.',
                    'error_code' => 'PARSE_FAILED'
                ];
            }

            $result = [
                'success' => true,
                'pitches' => $pitches,
                'settings' => [
                    'context' => $data['context'],
                    'tone' => $data['tone']
                ],
                'personal_info' => [
                    'name' => $data['name'],
                    'title' => $data['title'],
                    'organization' => $data['organization']
                ],
                'generation_date' => current_time('mysql'),
                'cache_key' => $cache_key
            ];

            $this->cache_pitches_result($cache_key, $result);

            if (!empty($data['post_id'])) {
                $this->save_pitches_to_post_meta($data['post_id'], $pitches, [
                    'context' => $data['context'],
                    'tone' => $data['tone']
                ]);

                $this->update_generation_stats($data['post_id']);
            }

            return $result;
        } catch (Exception $e) {
            error_log('MKCG Elevator Pitch: Exception - ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error generating pitches: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Save pitches to post meta
     */
    private function save_pitches_to_post_meta($post_id, $pitches, $settings) {
        $post = get_post($post_id);
        if (!$post) {
            return false;
        }

        update_post_meta($post_id, $this->post_meta_fields['pitch_30s'], $pitches['30s']);
        update_post_meta($post_id, $this->post_meta_fields['pitch_60s'], $pitches['60s']);
        update_post_meta($post_id, $this->post_meta_fields['pitch_2min'], $pitches['2min']);
        update_post_meta($post_id, $this->post_meta_fields['pitch_5min'], $pitches['5min']);
        update_post_meta($post_id, $this->post_meta_fields['context'], $settings['context']);
        update_post_meta($post_id, $this->post_meta_fields['tone'], $settings['tone']);
        update_post_meta($post_id, $this->post_meta_fields['generation_date'], current_time('mysql'));

        return true;
    }

    /**
     * Generate cache key
     */
    private function generate_cache_key($data) {
        $key_data = [
            'name' => $data['name'],
            'title' => $data['title'],
            'organization' => $data['organization'],
            'context' => $data['context'],
            'tone' => $data['tone'],
            'authority_hook' => $data['authority_hook'],
            'impact_intro' => $data['impact_intro']
        ];

        return 'mkcg_elevator_pitch_' . md5(serialize($key_data));
    }

    /**
     * Get cached result
     */
    private function get_cached_pitches($cache_key) {
        return get_transient($cache_key);
    }

    /**
     * Cache result
     */
    private function cache_pitches_result($cache_key, $result) {
        set_transient($cache_key, $result, self::CACHE_DURATION);
    }

    /**
     * Validate API key format
     */
    private function validate_api_key_format($api_key) {
        return (strlen($api_key) >= 20 && strpos($api_key, 'sk-') === 0);
    }

    /**
     * Update generation statistics
     */
    private function update_generation_stats($post_id) {
        $current_count = get_post_meta($post_id, $this->post_meta_fields['generation_count'], true);
        $new_count = intval($current_count) + 1;
        update_post_meta($post_id, $this->post_meta_fields['generation_count'], $new_count);
        update_post_meta($post_id, $this->post_meta_fields['last_modified'], current_time('mysql'));

        $api_usage = get_post_meta($post_id, $this->post_meta_fields['api_usage'], true);
        if (!is_array($api_usage)) {
            $api_usage = [];
        }

        $today = date('Y-m-d');
        if (!isset($api_usage[$today])) {
            $api_usage[$today] = 0;
        }
        $api_usage[$today]++;

        $cutoff_date = date('Y-m-d', strtotime('-30 days'));
        foreach ($api_usage as $date => $count) {
            if ($date < $cutoff_date) {
                unset($api_usage[$date]);
            }
        }

        update_post_meta($post_id, $this->post_meta_fields['api_usage'], $api_usage);
    }

    /**
     * Add meta boxes
     */
    public function add_meta_boxes() {
        $post_types = ['post', 'page', 'guests'];

        foreach ($post_types as $post_type) {
            add_meta_box(
                'mkcg_elevator_pitch_data',
                'Elevator Pitch Generator Data',
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
        $pitch_data = $this->get_pitch_data($post->ID);

        wp_nonce_field('mkcg_elevator_pitch_meta_box', 'mkcg_elevator_pitch_nonce');

        echo '<div class="mkcg-meta-box">';
        echo '<h4>Generated Elevator Pitches</h4>';

        if ($pitch_data['has_data']) {
            foreach (['30s' => '30 Second', '60s' => '60 Second', '2min' => '2 Minute', '5min' => '5 Minute'] as $key => $label) {
                $pitch = $pitch_data['pitches'][$key];
                if (!empty($pitch)) {
                    echo '<div class="pitch-section">';
                    echo '<h5>' . esc_html($label) . ' Pitch</h5>';
                    echo '<textarea readonly rows="4" style="width:100%;">' . esc_textarea($pitch) . '</textarea>';
                    echo '<p><small>Word count: ' . str_word_count($pitch) . '</small></p>';
                    echo '</div>';
                }
            }

            echo '<div class="pitch-settings">';
            echo '<p><strong>Settings:</strong> Context: ' . esc_html($pitch_data['settings']['context']) . ', Tone: ' . esc_html($pitch_data['settings']['tone']) . '</p>';
            echo '<p><strong>Generated:</strong> ' . esc_html($pitch_data['generation_date']) . '</p>';
            echo '</div>';
        } else {
            echo '<p>No elevator pitches generated yet.</p>';
        }

        echo '</div>';
    }

    /**
     * Save post data hook
     */
    public function save_post_data($post_id, $post) {
        if (!isset($_POST['mkcg_elevator_pitch_nonce']) || !wp_verify_nonce($_POST['mkcg_elevator_pitch_nonce'], 'mkcg_elevator_pitch_meta_box')) {
            return;
        }

        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        update_post_meta($post_id, $this->post_meta_fields['last_modified'], current_time('mysql'));
    }

    /**
     * AJAX handler for generating pitches
     */
    public function ajax_generate_pitches() {
        $security_check = $this->verify_security_comprehensive('generate');
        if (!$security_check['success']) {
            wp_send_json_error($security_check);
            return;
        }

        $raw_data = [
            'post_id' => isset($_POST['post_id']) ? $_POST['post_id'] : 0,
            'authority_hook' => isset($_POST['authority_hook']) ? $_POST['authority_hook'] : '',
            'impact_intro' => isset($_POST['impact_intro']) ? $_POST['impact_intro'] : '',
            'name' => isset($_POST['name']) ? $_POST['name'] : '',
            'title' => isset($_POST['title']) ? $_POST['title'] : '',
            'organization' => isset($_POST['organization']) ? $_POST['organization'] : '',
            'context' => isset($_POST['context']) ? $_POST['context'] : $this->default_settings['context'],
            'tone' => isset($_POST['tone']) ? $_POST['tone'] : $this->default_settings['tone'],
            'value_proposition' => isset($_POST['value_proposition']) ? $_POST['value_proposition'] : '',
            'target_audience' => isset($_POST['target_audience']) ? $_POST['target_audience'] : '',
            'unique_benefit' => isset($_POST['unique_benefit']) ? $_POST['unique_benefit'] : '',
            'call_to_action' => isset($_POST['call_to_action']) ? $_POST['call_to_action'] : ''
        ];

        $validation_result = $this->validate_and_sanitize_input($raw_data);
        if (!$validation_result['success']) {
            wp_send_json_error([
                'message' => 'Validation failed: ' . implode(', ', $validation_result['errors']),
                'errors' => $validation_result['errors']
            ]);
            return;
        }

        $data = $validation_result['data'];

        $result = $this->generate_pitches($data);

        if ($result['success']) {
            error_log('MKCG Elevator Pitch: Successfully generated pitches for post ' . $data['post_id']);
            wp_send_json_success($result);
        } else {
            error_log('MKCG Elevator Pitch: Failed to generate pitches - ' . $result['message']);
            wp_send_json_error($result);
        }
    }

    /**
     * AJAX handler for getting pitch data
     */
    public function ajax_get_pitch_data() {
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

        $pitch_data = $this->get_pitch_data($post_id);

        wp_send_json_success($pitch_data);
    }
}

// Initialize the generator
new MKCG_Enhanced_Elevator_Pitch_Generator();
