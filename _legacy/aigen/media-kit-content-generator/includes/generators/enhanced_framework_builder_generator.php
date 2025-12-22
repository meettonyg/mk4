<?php
/**
 * Enhanced Signature Framework Builder Generator
 * Creates branded methodologies and systems
 * 
 * @package Media_Kit_Content_Generator
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

class MKCG_Enhanced_Framework_Builder_Generator {

    const VERSION = '1.0';
    const RATE_LIMIT_REQUESTS = 10;
    const RATE_LIMIT_PERIOD = 3600;
    const API_TIMEOUT = 60;
    const CACHE_DURATION = 1800;
    const OPENAI_MODEL = 'gpt-4';

    private $default_settings = [
        'framework_type' => 'process',
        'step_count' => 5,
        'complexity' => 'moderate'
    ];

    private $post_meta_fields = [
        'framework_name' => '_framework_name',
        'framework_names' => '_framework_name_options',
        'framework_steps' => '_framework_steps',
        'framework_description' => '_framework_description',
        'framework_type' => '_framework_type',
        'step_count' => '_framework_step_count',
        'generation_date' => '_framework_generation_date'
    ];

    private $authority_hook_service;
    private $impact_intro_service;

    public function __construct() {
        $this->init_services();
        $this->register_hooks();
        error_log('MKCG Framework Builder: Initialized v' . self::VERSION);
    }

    private function init_services() {
        if (class_exists('MKCG_Authority_Hook_Service')) {
            $this->authority_hook_service = new MKCG_Authority_Hook_Service();
        }
        if (class_exists('MKCG_Impact_Intro_Service')) {
            $this->impact_intro_service = new MKCG_Impact_Intro_Service();
        }
    }

    private function register_hooks() {
        add_action('mkcg_register_scripts', [$this, 'register_scripts']);
        add_action('mkcg_enqueue_generator_scripts', [$this, 'enqueue_scripts'], 10, 1);
        add_action('add_meta_boxes', [$this, 'add_meta_boxes']);
    }

    public function register_scripts() {
        wp_register_script(
            'mkcg-framework-builder-generator',
            plugins_url('assets/js/generators/framework-builder-generator.js', MKCG_PLUGIN_FILE),
            [],
            self::VERSION,
            true
        );
    }

    public function enqueue_scripts($generator_type) {
        if ($generator_type === 'framework_builder') {
            wp_enqueue_script('mkcg-framework-builder-generator');
        }
    }

    public function get_template_data() {
        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
        $template_data = [
            'post_id' => $post_id,
            'has_data' => false,
            'framework_names' => [],
            'framework_steps' => [],
            'settings' => $this->default_settings
        ];

        if ($post_id > 0) {
            $framework_data = $this->get_framework_data($post_id);
            if ($framework_data['has_data']) {
                $template_data = array_merge($template_data, $framework_data);
            }
        }

        return $template_data;
    }

    public function get_framework_data($post_id) {
        $post = get_post($post_id);
        if (!$post) {
            return ['has_data' => false];
        }

        $framework_names = get_post_meta($post_id, $this->post_meta_fields['framework_names'], true);
        $framework_steps = get_post_meta($post_id, $this->post_meta_fields['framework_steps'], true);
        $selected_name = get_post_meta($post_id, $this->post_meta_fields['framework_name'], true);

        $has_data = !empty($framework_names) || !empty($framework_steps);

        return [
            'has_data' => $has_data,
            'framework_names' => is_array($framework_names) ? $framework_names : [],
            'framework_steps' => is_array($framework_steps) ? $framework_steps : [],
            'selected_name' => $selected_name,
            'settings' => [
                'framework_type' => get_post_meta($post_id, $this->post_meta_fields['framework_type'], true) ?: 'process',
                'step_count' => get_post_meta($post_id, $this->post_meta_fields['step_count'], true) ?: 5
            ],
            'personal_info' => [
                'name' => get_post_meta($post_id, '_guest_name', true) ?: $post->post_title,
                'title' => get_post_meta($post_id, '_guest_title', true),
                'expertise' => get_post_meta($post_id, '_guest_expertise', true)
            ]
        ];
    }

    private function verify_security_comprehensive() {
        if (!is_user_logged_in() || !current_user_can('edit_posts')) {
            return ['success' => false, 'message' => 'Insufficient permissions'];
        }

        $nonce = $_POST['nonce'] ?? $_POST['security'] ?? '';
        if (!wp_verify_nonce($nonce, 'mkcg_nonce')) {
            return ['success' => false, 'message' => 'Security verification failed'];
        }

        $rate_check = $this->check_rate_limit();
        if (!$rate_check['allowed']) {
            return ['success' => false, 'message' => 'Rate limit exceeded'];
        }

        return ['success' => true];
    }

    private function check_rate_limit() {
        $user_id = get_current_user_id();
        $cache_key = 'mkcg_framework_rate_limit_' . $user_id;
        $rate_data = get_transient($cache_key);

        if (!$rate_data) {
            $rate_data = ['count' => 0, 'start_time' => time()];
        }

        if ((time() - $rate_data['start_time']) >= self::RATE_LIMIT_PERIOD) {
            $rate_data = ['count' => 0, 'start_time' => time()];
        }

        if ($rate_data['count'] >= self::RATE_LIMIT_REQUESTS) {
            return ['allowed' => false];
        }

        $rate_data['count']++;
        set_transient($cache_key, $rate_data, self::RATE_LIMIT_PERIOD);

        return ['allowed' => true];
    }

    private function generate_framework($data) {
        $api_key = get_option('mkcg_openai_api_key');
        if (empty($api_key) || strlen($api_key) < 20) {
            return ['success' => false, 'message' => 'Invalid API key'];
        }

        $step_count = intval($data['step_count']);
        $framework_type = $data['framework_type'];

        $prompt = "You are a business framework expert creating a signature methodology for {$data['name']}";
        if (!empty($data['title'])) $prompt .= ", a {$data['title']}";
        $prompt .= ".\n\n";

        $prompt .= "Create:\n";
        $prompt .= "1. FRAMEWORK NAMES: Generate 5 memorable framework/methodology names\n";
        $prompt .= "2. FRAMEWORK STRUCTURE: Create a {$step_count}-step {$framework_type} framework\n\n";

        if (!empty($data['authority_hook'])) {
            $prompt .= "EXPERTISE:\n{$data['authority_hook']}\n\n";
        }

        if (!empty($data['expertise_area'])) {
            $prompt .= "FOCUS AREA: {$data['expertise_area']}\n\n";
        }

        $prompt .= "For framework names, create memorable, professional names like:\n";
        $prompt .= "- 'The [Number] Pillars of [Outcome]'\n";
        $prompt .= "- 'The [Adjective] [Noun] Method'\n";
        $prompt .= "- 'The [Acronym] Framework'\n\n";

        $prompt .= "For the {$step_count}-step framework, provide:\n";
        $prompt .= "- Step number and clear name\n";
        $prompt .= "- 2-3 sentence description of each step\n";
        $prompt .= "- How it connects to the next step\n\n";

        $prompt .= "Format:\n";
        $prompt .= "FRAMEWORK NAMES:\n1. [Name]\n2. [Name]\n3. [Name]\n4. [Name]\n5. [Name]\n\n";
        $prompt .= "FRAMEWORK STEPS:\nSTEP 1: [Name]\n[Description]\n\n";
        $prompt .= "STEP 2: [Name]\n[Description]\n\n";
        $prompt .= "(continue for all {$step_count} steps)";

        try {
            $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $api_key,
                    'Content-Type' => 'application/json'
                ],
                'body' => wp_json_encode([
                    'model' => self::OPENAI_MODEL,
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a business framework expert who creates memorable, actionable methodologies.'],
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'temperature' => 0.8,
                    'max_tokens' => 2000
                ]),
                'timeout' => self::API_TIMEOUT
            ]);

            if (is_wp_error($response)) {
                return ['success' => false, 'message' => 'API connection error'];
            }

            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (isset($body['error'])) {
                return ['success' => false, 'message' => $body['error']['message']];
            }

            $content = $body['choices'][0]['message']['content'] ?? '';
            if (empty($content)) {
                return ['success' => false, 'message' => 'Empty response'];
            }

            // Parse framework names
            preg_match('/FRAMEWORK NAMES:(.*?)(?=FRAMEWORK STEPS:|$)/s', $content, $names_match);
            $framework_names = [];
            if (!empty($names_match[1])) {
                preg_match_all('/\d+\.\s*(.+)/m', $names_match[1], $name_matches);
                $framework_names = array_map('trim', $name_matches[1] ?? []);
            }

            // Parse framework steps
            $framework_steps = [];
            for ($i = 1; $i <= $step_count; $i++) {
                $pattern = "/STEP {$i}:\s*(.+?)(?=\n\nSTEP|$)/s";
                preg_match($pattern, $content, $step_match);
                if (!empty($step_match[1])) {
                    $step_parts = explode("\n", trim($step_match[1]), 2);
                    $framework_steps[] = [
                        'number' => $i,
                        'name' => trim($step_parts[0]),
                        'description' => isset($step_parts[1]) ? trim($step_parts[1]) : ''
                    ];
                }
            }

            if (empty($framework_names) && empty($framework_steps)) {
                return ['success' => false, 'message' => 'Failed to parse response'];
            }

            $result = [
                'success' => true,
                'framework_names' => $framework_names,
                'framework_steps' => $framework_steps,
                'settings' => [
                    'framework_type' => $framework_type,
                    'step_count' => $step_count
                ]
            ];

            if (!empty($data['post_id'])) {
                $this->save_framework_to_post_meta($data['post_id'], $framework_names, $framework_steps, [
                    'framework_type' => $framework_type,
                    'step_count' => $step_count
                ]);
            }

            return $result;

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Generation error: ' . $e->getMessage()];
        }
    }

    private function save_framework_to_post_meta($post_id, $names, $steps, $settings) {
        update_post_meta($post_id, $this->post_meta_fields['framework_names'], $names);
        update_post_meta($post_id, $this->post_meta_fields['framework_steps'], $steps);
        update_post_meta($post_id, $this->post_meta_fields['framework_type'], $settings['framework_type']);
        update_post_meta($post_id, $this->post_meta_fields['step_count'], $settings['step_count']);
        update_post_meta($post_id, $this->post_meta_fields['generation_date'], current_time('mysql'));
    }

    public function ajax_generate_framework() {
        $security_check = $this->verify_security_comprehensive();
        if (!$security_check['success']) {
            wp_send_json_error($security_check);
            return;
        }

        $data = [
            'post_id' => isset($_POST['post_id']) ? intval($_POST['post_id']) : 0,
            'name' => sanitize_text_field($_POST['name'] ?? ''),
            'title' => sanitize_text_field($_POST['title'] ?? ''),
            'framework_type' => sanitize_text_field($_POST['framework_type'] ?? 'process'),
            'step_count' => intval($_POST['step_count'] ?? 5),
            'authority_hook' => sanitize_textarea_field($_POST['authority_hook'] ?? ''),
            'expertise_area' => sanitize_textarea_field($_POST['expertise_area'] ?? '')
        ];

        if (empty($data['name'])) {
            wp_send_json_error(['message' => 'Name is required']);
            return;
        }

        $result = $this->generate_framework($data);

        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }

    public function ajax_save_framework_selection() {
        $nonce = $_POST['nonce'] ?? '';
        if (!wp_verify_nonce($nonce, 'mkcg_nonce')) {
            wp_send_json_error(['message' => 'Security check failed']);
            return;
        }

        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $framework_name = sanitize_text_field($_POST['framework_name'] ?? '');

        if ($post_id && $framework_name) {
            update_post_meta($post_id, $this->post_meta_fields['framework_name'], $framework_name);
            wp_send_json_success(['message' => 'Framework name saved']);
        } else {
            wp_send_json_error(['message' => 'Invalid data']);
        }
    }

    public function add_meta_boxes() {
        add_meta_box(
            'mkcg_framework_data',
            'Signature Framework Data',
            [$this, 'render_meta_box'],
            ['post', 'page', 'guests'],
            'normal',
            'default'
        );
    }

    public function render_meta_box($post) {
        $framework_data = $this->get_framework_data($post->ID);
        echo '<div class="mkcg-meta-box">';
        echo '<h4>Generated Framework</h4>';
        if ($framework_data['has_data']) {
            if (!empty($framework_data['selected_name'])) {
                echo '<p><strong>Selected:</strong> ' . esc_html($framework_data['selected_name']) . '</p>';
            }
            if (!empty($framework_data['framework_steps'])) {
                echo '<p><strong>Steps:</strong> ' . count($framework_data['framework_steps']) . '</p>';
            }
        } else {
            echo '<p>No framework generated yet.</p>';
        }
        echo '</div>';
    }
}

new MKCG_Enhanced_Framework_Builder_Generator();
