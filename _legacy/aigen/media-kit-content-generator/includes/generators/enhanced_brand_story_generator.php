<?php
/**
 * Enhanced Personal Brand Story Suite Generator
 * Creates origin story, manifesto, mission, signature story
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

class MKCG_Enhanced_Brand_Story_Generator {

    const VERSION = '1.0';
    const RATE_LIMIT_REQUESTS = 10;
    const RATE_LIMIT_PERIOD = 3600;
    const API_TIMEOUT = 60;
    const CACHE_DURATION = 1800;
    const OPENAI_MODEL = 'gpt-4';

    private $default_settings = ['tone' => 'authentic', 'length' => 'medium'];

    private $post_meta_fields = [
        'origin_story' => '_brand_origin_story',
        'manifesto' => '_brand_manifesto',
        'mission' => '_brand_mission',
        'signature_story' => '_brand_signature_story',
        'generation_date' => '_brand_story_generation_date'
    ];

    private $authority_hook_service;
    private $impact_intro_service;

    public function __construct() {
        $this->init_services();
        $this->register_hooks();
        error_log('MKCG Brand Story: Initialized v' . self::VERSION);
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
            'mkcg-brand-story-generator',
            plugins_url('assets/js/generators/brand-story-generator.js', MKCG_PLUGIN_FILE),
            [],
            self::VERSION,
            true
        );
    }

    public function enqueue_scripts($generator_type) {
        if ($generator_type === 'brand_story') {
            wp_enqueue_script('mkcg-brand-story-generator');
        }
    }

    public function get_template_data() {
        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
        $template_data = [
            'post_id' => $post_id,
            'has_data' => false,
            'stories' => ['origin' => '', 'manifesto' => '', 'mission' => '', 'signature' => ''],
            'settings' => $this->default_settings
        ];

        if ($post_id > 0) {
            $story_data = $this->get_story_data($post_id);
            if ($story_data['has_data']) {
                $template_data = array_merge($template_data, $story_data);
            }
        }

        return $template_data;
    }

    public function get_story_data($post_id) {
        $post = get_post($post_id);
        if (!$post) return ['has_data' => false];

        $origin = get_post_meta($post_id, $this->post_meta_fields['origin_story'], true);
        $manifesto = get_post_meta($post_id, $this->post_meta_fields['manifesto'], true);
        $mission = get_post_meta($post_id, $this->post_meta_fields['mission'], true);
        $signature = get_post_meta($post_id, $this->post_meta_fields['signature_story'], true);

        $has_data = !empty($origin) || !empty($manifesto) || !empty($mission) || !empty($signature);

        return [
            'has_data' => $has_data,
            'stories' => [
                'origin' => $origin,
                'manifesto' => $manifesto,
                'mission' => $mission,
                'signature' => $signature
            ],
            'personal_info' => [
                'name' => get_post_meta($post_id, '_guest_name', true) ?: $post->post_title,
                'title' => get_post_meta($post_id, '_guest_title', true)
            ]
        ];
    }

    private function verify_security_comprehensive() {
        if (!is_user_logged_in() || !current_user_can('edit_posts')) {
            return ['success' => false, 'message' => 'Insufficient permissions'];
        }

        $nonce = $_POST['nonce'] ?? '';
        if (!wp_verify_nonce($nonce, 'mkcg_nonce')) {
            return ['success' => false, 'message' => 'Security verification failed'];
        }

        return ['success' => true];
    }

    private function generate_stories($data) {
        $api_key = get_option('mkcg_openai_api_key');
        if (empty($api_key) || strlen($api_key) < 20) {
            return ['success' => false, 'message' => 'Invalid API key'];
        }

        $prompt = "You are a professional brand storyteller creating compelling narratives for {$data['name']}";
        if (!empty($data['title'])) $prompt .= ", a {$data['title']}";
        $prompt .= ".\n\n";

        $prompt .= "Create 4 distinct brand stories:\n\n";

        $prompt .= "1. ORIGIN STORY: How they got started (compelling journey narrative, 250-300 words)\n";
        $prompt .= "2. BRAND MANIFESTO: Values and beliefs statement (150-200 words)\n";
        $prompt .= "3. MISSION STATEMENT: Clear purpose definition (50-75 words)\n";
        $prompt .= "4. SIGNATURE STORY: Memorable anecdote illustrating expertise (200-250 words)\n\n";

        if (!empty($data['authority_hook'])) {
            $prompt .= "EXPERTISE:\n{$data['authority_hook']}\n\n";
        }

        if (!empty($data['impact_intro'])) {
            $prompt .= "IMPACT:\n{$data['impact_intro']}\n\n";
        }

        if (!empty($data['background'])) {
            $prompt .= "BACKGROUND:\n{$data['background']}\n\n";
        }

        if (!empty($data['values'])) {
            $prompt .= "CORE VALUES:\n{$data['values']}\n\n";
        }

        $prompt .= "Guidelines:\n";
        $prompt .= "- Make stories authentic and relatable\n";
        $prompt .= "- Include specific details and moments\n";
        $prompt .= "- Focus on transformation and impact\n";
        $prompt .= "- Use {$data['tone']} tone throughout\n\n";

        $prompt .= "Format:\nORIGIN STORY:\n[story]\n\nBRAND MANIFESTO:\n[manifesto]\n\nMISSION STATEMENT:\n[mission]\n\nSIGNATURE STORY:\n[story]";

        try {
            $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $api_key,
                    'Content-Type' => 'application/json'
                ],
                'body' => wp_json_encode([
                    'model' => self::OPENAI_MODEL,
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a professional brand storyteller creating authentic, compelling narratives.'],
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'temperature' => 0.8,
                    'max_tokens' => 2500
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

            // Parse stories
            preg_match('/ORIGIN STORY:\s*(.*?)(?=\s*BRAND MANIFESTO:|$)/s', $content, $origin_match);
            preg_match('/BRAND MANIFESTO:\s*(.*?)(?=\s*MISSION STATEMENT:|$)/s', $content, $manifesto_match);
            preg_match('/MISSION STATEMENT:\s*(.*?)(?=\s*SIGNATURE STORY:|$)/s', $content, $mission_match);
            preg_match('/SIGNATURE STORY:\s*(.*?)$/s', $content, $signature_match);

            $stories = [
                'origin' => trim($origin_match[1] ?? ''),
                'manifesto' => trim($manifesto_match[1] ?? ''),
                'mission' => trim($mission_match[1] ?? ''),
                'signature' => trim($signature_match[1] ?? '')
            ];

            if (empty(array_filter($stories))) {
                return ['success' => false, 'message' => 'Failed to parse stories'];
            }

            $result = ['success' => true, 'stories' => $stories];

            if (!empty($data['post_id'])) {
                $this->save_stories_to_post_meta($data['post_id'], $stories);
            }

            return $result;

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Generation error'];
        }
    }

    private function save_stories_to_post_meta($post_id, $stories) {
        update_post_meta($post_id, $this->post_meta_fields['origin_story'], $stories['origin']);
        update_post_meta($post_id, $this->post_meta_fields['manifesto'], $stories['manifesto']);
        update_post_meta($post_id, $this->post_meta_fields['mission'], $stories['mission']);
        update_post_meta($post_id, $this->post_meta_fields['signature_story'], $stories['signature']);
        update_post_meta($post_id, $this->post_meta_fields['generation_date'], current_time('mysql'));
    }

    public function ajax_generate_stories() {
        $security_check = $this->verify_security_comprehensive();
        if (!$security_check['success']) {
            wp_send_json_error($security_check);
            return;
        }

        $data = [
            'post_id' => intval($_POST['post_id'] ?? 0),
            'name' => sanitize_text_field($_POST['name'] ?? ''),
            'title' => sanitize_text_field($_POST['title'] ?? ''),
            'tone' => sanitize_text_field($_POST['tone'] ?? 'authentic'),
            'authority_hook' => sanitize_textarea_field($_POST['authority_hook'] ?? ''),
            'impact_intro' => sanitize_textarea_field($_POST['impact_intro'] ?? ''),
            'background' => sanitize_textarea_field($_POST['background'] ?? ''),
            'values' => sanitize_textarea_field($_POST['values'] ?? '')
        ];

        if (empty($data['name'])) {
            wp_send_json_error(['message' => 'Name is required']);
            return;
        }

        $result = $this->generate_stories($data);

        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }

    public function add_meta_boxes() {
        add_meta_box(
            'mkcg_brand_story_data',
            'Brand Story Suite Data',
            [$this, 'render_meta_box'],
            ['post', 'page', 'guests'],
            'normal',
            'default'
        );
    }

    public function render_meta_box($post) {
        $story_data = $this->get_story_data($post->ID);
        echo '<div class="mkcg-meta-box"><h4>Generated Brand Stories</h4>';
        if ($story_data['has_data']) {
            echo '<p>Stories generated successfully.</p>';
        } else {
            echo '<p>No stories generated yet.</p>';
        }
        echo '</div>';
    }
}

new MKCG_Enhanced_Brand_Story_Generator();
