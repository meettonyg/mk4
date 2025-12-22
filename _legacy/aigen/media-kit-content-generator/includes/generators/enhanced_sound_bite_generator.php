<?php
/**
 * Sound Bite Generator
 *
 * Generates quotable, memorable statements perfect for:
 * - Social media posts
 * - Pull quotes in articles
 * - Speaking presentations
 * - Marketing materials
 *
 * Types: One-liners, provocative statements, wisdom quotes,
 * contrarian takes, actionable insights, metaphors
 *
 * @package MediaKitContentGenerator
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

class MKCG_Enhanced_Sound_Bite_Generator {
    const OPENAI_MODEL = 'gpt-4';

    private $default_settings = [
        'style' => 'mixed',
        'tone' => 'bold',
        'count' => 12,
    ];

    private $post_meta_fields = [
        'sound_bites' => '_sound_bites_list',
        'sound_bite_settings' => '_sound_bite_settings',
    ];

    public function __construct() {
        // Constructor
    }

    public function init() {
        // Initialization if needed
    }

    /**
     * Generate sound bites via AJAX
     */
    public function ajax_generate_sound_bites() {
        check_ajax_referer('mkcg_nonce', 'nonce');

        if (!current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'Permission denied']);
            return;
        }

        $post_id = intval($_POST['post_id'] ?? 0);
        $name = sanitize_text_field($_POST['name'] ?? '');
        $title = sanitize_text_field($_POST['title'] ?? '');
        $style = sanitize_text_field($_POST['style'] ?? 'mixed');
        $tone = sanitize_text_field($_POST['tone'] ?? 'bold');
        $count = intval($_POST['count'] ?? 12);
        $authority_hook = sanitize_textarea_field($_POST['authority_hook'] ?? '');
        $impact_intro = sanitize_textarea_field($_POST['impact_intro'] ?? '');
        $expertise_areas = sanitize_textarea_field($_POST['expertise_areas'] ?? '');
        $key_philosophies = sanitize_textarea_field($_POST['key_philosophies'] ?? '');
        $unique_perspectives = sanitize_textarea_field($_POST['unique_perspectives'] ?? '');

        // Rate limiting check
        $rate_limit_key = 'sound_bites_generation_' . get_current_user_id();
        $recent_generations = get_transient($rate_limit_key);

        if ($recent_generations && $recent_generations >= 10) {
            wp_send_json_error(['message' => 'Rate limit exceeded. Please try again later.']);
            return;
        }

        // Check cache
        $cache_key = 'sound_bites_' . md5(serialize([
            $name, $title, $style, $tone, $count,
            $authority_hook, $impact_intro, $expertise_areas,
            $key_philosophies, $unique_perspectives
        ]));
        $cached_bites = get_transient($cache_key);

        if ($cached_bites) {
            wp_send_json_success([
                'sound_bites' => $cached_bites,
                'cached' => true
            ]);
            return;
        }

        // Generate sound bites
        $data = compact(
            'name', 'title', 'style', 'tone', 'count',
            'authority_hook', 'impact_intro', 'expertise_areas',
            'key_philosophies', 'unique_perspectives'
        );

        $sound_bites = $this->generate_sound_bites($data);

        if (is_wp_error($sound_bites)) {
            wp_send_json_error(['message' => $sound_bites->get_error_message()]);
            return;
        }

        // Save to post meta if post_id provided
        if ($post_id > 0) {
            update_post_meta($post_id, $this->post_meta_fields['sound_bites'], $sound_bites);
            update_post_meta($post_id, $this->post_meta_fields['sound_bite_settings'], $data);
        }

        // Cache results (30 minutes)
        set_transient($cache_key, $sound_bites, 1800);

        // Update rate limit
        set_transient($rate_limit_key, ($recent_generations ?? 0) + 1, 3600);

        wp_send_json_success([
            'sound_bites' => $sound_bites,
            'cached' => false
        ]);
    }

    /**
     * Generate sound bites using OpenAI
     */
    private function generate_sound_bites($data) {
        $api_key = get_option('mkcg_openai_api_key');
        if (empty($api_key)) {
            return new WP_Error('no_api_key', 'OpenAI API key not configured');
        }

        $prompt = $this->build_prompt($data);

        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
            'timeout' => 60,
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode([
                'model' => self::OPENAI_MODEL,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert copywriter and content strategist who creates memorable, quotable statements that capture attention and communicate powerful ideas concisely.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.9,
                'max_tokens' => 1800,
            ]),
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);

        if (!isset($body['choices'][0]['message']['content'])) {
            return new WP_Error('api_error', 'Invalid API response');
        }

        $content = $body['choices'][0]['message']['content'];

        return $this->parse_sound_bites($content);
    }

    /**
     * Build the generation prompt
     */
    private function build_prompt($data) {
        $style_guidance = [
            'mixed' => 'a mix of different styles for variety',
            'one_liners' => 'punchy one-liners that pack a punch',
            'provocative' => 'provocative statements that challenge assumptions',
            'wisdom' => 'wisdom quotes that offer insight and guidance',
            'contrarian' => 'contrarian takes that go against conventional thinking',
            'actionable' => 'actionable insights people can immediately use',
            'metaphors' => 'metaphorical statements that create vivid mental images'
        ];

        $tone_guidance = [
            'bold' => 'bold, confident, and assertive',
            'thoughtful' => 'thoughtful, nuanced, and reflective',
            'edgy' => 'edgy, provocative, and boundary-pushing',
            'inspirational' => 'inspirational, uplifting, and motivating',
            'direct' => 'direct, no-nonsense, and straight to the point'
        ];

        $style_type = $style_guidance[$data['style']] ?? $style_guidance['mixed'];
        $tone_type = $tone_guidance[$data['tone']] ?? $tone_guidance['bold'];

        $prompt = "Generate {$data['count']} quotable sound bites for {$data['name']}";

        if (!empty($data['title'])) {
            $prompt .= ", {$data['title']}";
        }

        $prompt .= ".\n\n";

        if (!empty($data['authority_hook'])) {
            $prompt .= "EXPERTISE & AUTHORITY:\n{$data['authority_hook']}\n\n";
        }

        if (!empty($data['impact_intro'])) {
            $prompt .= "BACKGROUND & EXPERIENCE:\n{$data['impact_intro']}\n\n";
        }

        if (!empty($data['expertise_areas'])) {
            $prompt .= "KEY EXPERTISE AREAS:\n{$data['expertise_areas']}\n\n";
        }

        if (!empty($data['key_philosophies'])) {
            $prompt .= "KEY PHILOSOPHIES & BELIEFS:\n{$data['key_philosophies']}\n\n";
        }

        if (!empty($data['unique_perspectives'])) {
            $prompt .= "UNIQUE PERSPECTIVES:\n{$data['unique_perspectives']}\n\n";
        }

        $prompt .= "Create {$data['count']} quotable sound bites:\n\n";

        $prompt .= "STYLE: Generate {$style_type}\n";
        $prompt .= "TONE: Make them {$tone_type}\n\n";

        $prompt .= "SOUND BITE REQUIREMENTS:\n";
        $prompt .= "- Each should be 10-25 words maximum\n";
        $prompt .= "- Make them Tweet-worthy and shareable\n";
        $prompt .= "- Each should stand alone without context\n";
        $prompt .= "- Make them memorable and quotable\n";
        $prompt .= "- Use strong, vivid language\n";
        $prompt .= "- Avoid generic platitudes\n";
        $prompt .= "- Make each one unique and distinctive\n\n";

        if ($data['style'] === 'mixed') {
            $prompt .= "VARIETY - Include mix of:\n";
            $prompt .= "- Provocative statements that challenge thinking\n";
            $prompt .= "- Wisdom quotes offering insight\n";
            $prompt .= "- Contrarian takes against conventional wisdom\n";
            $prompt .= "- Actionable one-liners\n";
            $prompt .= "- Metaphorical statements\n\n";
        }

        $prompt .= "EXAMPLES OF GOOD SOUND BITES:\n";
        $prompt .= "- \"Your network isn't who you know. It's who knows what you're capable of.\"\n";
        $prompt .= "- \"Strategy without execution is a daydream. Execution without strategy is a nightmare.\"\n";
        $prompt .= "- \"Most people don't lack ideas. They lack the courage to act on them.\"\n\n";

        $prompt .= "FORMAT YOUR RESPONSE EXACTLY LIKE THIS:\n\n";
        $prompt .= "1. [First sound bite here]\n";
        $prompt .= "2. [Second sound bite here]\n";
        $prompt .= "3. [Third sound bite here]\n";
        $prompt .= "[Continue for all {$data['count']} sound bites]\n\n";

        $prompt .= "Make each sound bite powerful, memorable, and uniquely attributed to this person's perspective and expertise.";

        return $prompt;
    }

    /**
     * Parse sound bites from API response
     */
    private function parse_sound_bites($content) {
        $sound_bites = [];

        // Match numbered list: 1. ... 2. ... etc.
        preg_match_all('/(\d+)\.\s*[""""]?(.*?)[""""]?\s*(?=\n\d+\.|\n*$)/s', $content, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $bite_text = trim($match[2]);
            // Remove any leading/trailing quotes
            $bite_text = trim($bite_text, '"""\'');

            if (!empty($bite_text)) {
                $sound_bites[] = [
                    'number' => intval($match[1]),
                    'text' => $bite_text,
                    'word_count' => str_word_count($bite_text)
                ];
            }
        }

        return $sound_bites;
    }

    /**
     * Render meta box for admin
     */
    public function render_meta_box($post) {
        $sound_bites = get_post_meta($post->ID, $this->post_meta_fields['sound_bites'], true);

        echo '<div class="mkcg-meta-box">';
        echo '<p><strong>Generated Sound Bites:</strong></p>';

        if ($sound_bites) {
            echo '<ol>';
            foreach ($sound_bites as $bite) {
                echo '<li style="margin-bottom: 10px;">';
                echo '<em>"' . esc_html($bite['text']) . '"</em>';
                echo ' <span style="color: #666;">(' . $bite['word_count'] . ' words)</span>';
                echo '</li>';
            }
            echo '</ol>';
        } else {
            echo '<p><em>No sound bites generated yet.</em></p>';
        }

        echo '</div>';
    }

    /**
     * Get template data
     */
    public function get_template_data() {
        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;

        $data = [
            'has_data' => false,
            'sound_bites' => []
        ];

        if ($post_id > 0) {
            $sound_bites = get_post_meta($post_id, $this->post_meta_fields['sound_bites'], true);

            if ($sound_bites) {
                $data['has_data'] = true;
                $data['sound_bites'] = $sound_bites;
            }
        }

        return $data;
    }
}
