<?php
/**
 * Essential Business Stories Suite Generator
 *
 * Generates four critical business stories based on John Jantsch's framework:
 * - Purpose Story: Why you exist beyond profit
 * - Positioning Story: Your competitive differentiation
 * - Transformation Story: Customer success narrative
 * - Contrarian/Challenge Story: Your unique perspective
 *
 * @package MediaKitContentGenerator
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

class MKCG_Enhanced_Business_Stories_Generator {
    const OPENAI_MODEL = 'gpt-4';

    private $default_settings = [
        'industry' => '',
        'target_customer' => '',
        'tone' => 'professional',
        'competitor_context' => '',
    ];

    private $post_meta_fields = [
        'purpose_story' => '_business_purpose_story',
        'positioning_story' => '_business_positioning_story',
        'transformation_story' => '_business_transformation_story',
        'contrarian_story' => '_business_contrarian_story',
        'business_stories_settings' => '_business_stories_settings',
    ];

    public function __construct() {
        // Constructor
    }

    public function init() {
        // Initialization if needed
    }

    /**
     * Generate business stories via AJAX
     */
    public function ajax_generate_stories() {
        check_ajax_referer('mkcg_nonce', 'nonce');

        if (!current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'Permission denied']);
            return;
        }

        $post_id = intval($_POST['post_id'] ?? 0);
        $name = sanitize_text_field($_POST['name'] ?? '');
        $title = sanitize_text_field($_POST['title'] ?? '');
        $industry = sanitize_text_field($_POST['industry'] ?? '');
        $target_customer = sanitize_textarea_field($_POST['target_customer'] ?? '');
        $tone = sanitize_text_field($_POST['tone'] ?? 'professional');
        $authority_hook = sanitize_textarea_field($_POST['authority_hook'] ?? '');
        $impact_intro = sanitize_textarea_field($_POST['impact_intro'] ?? '');
        $origin_story = sanitize_textarea_field($_POST['origin_story'] ?? '');
        $competitor_context = sanitize_textarea_field($_POST['competitor_context'] ?? '');
        $customer_results = sanitize_textarea_field($_POST['customer_results'] ?? '');
        $unique_approach = sanitize_textarea_field($_POST['unique_approach'] ?? '');

        // Rate limiting check
        $rate_limit_key = 'business_stories_generation_' . get_current_user_id();
        $recent_generations = get_transient($rate_limit_key);

        if ($recent_generations && $recent_generations >= 10) {
            wp_send_json_error(['message' => 'Rate limit exceeded. Please try again later.']);
            return;
        }

        // Check cache
        $cache_key = 'business_stories_' . md5(serialize([
            $name, $title, $industry, $target_customer, $tone,
            $authority_hook, $impact_intro, $origin_story,
            $competitor_context, $customer_results, $unique_approach
        ]));
        $cached_stories = get_transient($cache_key);

        if ($cached_stories) {
            wp_send_json_success([
                'stories' => $cached_stories,
                'cached' => true
            ]);
            return;
        }

        // Generate stories
        $data = compact(
            'name', 'title', 'industry', 'target_customer', 'tone',
            'authority_hook', 'impact_intro', 'origin_story',
            'competitor_context', 'customer_results', 'unique_approach'
        );

        $stories = $this->generate_stories($data);

        if (is_wp_error($stories)) {
            wp_send_json_error(['message' => $stories->get_error_message()]);
            return;
        }

        // Save to post meta if post_id provided
        if ($post_id > 0) {
            update_post_meta($post_id, $this->post_meta_fields['purpose_story'], $stories['purpose']);
            update_post_meta($post_id, $this->post_meta_fields['positioning_story'], $stories['positioning']);
            update_post_meta($post_id, $this->post_meta_fields['transformation_story'], $stories['transformation']);
            update_post_meta($post_id, $this->post_meta_fields['contrarian_story'], $stories['contrarian']);
            update_post_meta($post_id, $this->post_meta_fields['business_stories_settings'], $data);
        }

        // Cache results (30 minutes)
        set_transient($cache_key, $stories, 1800);

        // Update rate limit
        set_transient($rate_limit_key, ($recent_generations ?? 0) + 1, 3600);

        wp_send_json_success([
            'stories' => $stories,
            'cached' => false
        ]);
    }

    /**
     * Generate business stories using OpenAI
     */
    private function generate_stories($data) {
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
                        'content' => 'You are an expert business storyteller and marketing strategist specializing in creating compelling narratives based on the Duct Tape Marketing framework.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.8,
                'max_tokens' => 2000,
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

        return $this->parse_stories($content);
    }

    /**
     * Build the generation prompt
     */
    private function build_prompt($data) {
        $tone_guidance = [
            'professional' => 'professional and authoritative, suitable for corporate audiences',
            'authentic' => 'genuine and personal, showing vulnerability and humanity',
            'inspiring' => 'motivational and aspirational, energizing the reader',
            'conversational' => 'casual and approachable, like talking to a friend'
        ];

        $tone_style = $tone_guidance[$data['tone']] ?? $tone_guidance['professional'];

        $prompt = "Generate four essential business stories for {$data['name']}";

        if (!empty($data['title'])) {
            $prompt .= ", {$data['title']}";
        }

        if (!empty($data['industry'])) {
            $prompt .= " in the {$data['industry']} industry";
        }

        $prompt .= ".\n\n";

        if (!empty($data['target_customer'])) {
            $prompt .= "TARGET CUSTOMER: {$data['target_customer']}\n\n";
        }

        if (!empty($data['authority_hook'])) {
            $prompt .= "EXPERTISE & AUTHORITY:\n{$data['authority_hook']}\n\n";
        }

        if (!empty($data['impact_intro'])) {
            $prompt .= "BACKGROUND & EXPERIENCE:\n{$data['impact_intro']}\n\n";
        }

        if (!empty($data['origin_story'])) {
            $prompt .= "ORIGIN STORY CONTEXT:\n{$data['origin_story']}\n\n";
        }

        if (!empty($data['competitor_context'])) {
            $prompt .= "COMPETITIVE LANDSCAPE:\n{$data['competitor_context']}\n\n";
        }

        if (!empty($data['customer_results'])) {
            $prompt .= "CUSTOMER RESULTS:\n{$data['customer_results']}\n\n";
        }

        if (!empty($data['unique_approach'])) {
            $prompt .= "UNIQUE APPROACH/PHILOSOPHY:\n{$data['unique_approach']}\n\n";
        }

        $prompt .= "Create these FOUR business stories based on the Duct Tape Marketing framework:\n\n";

        $prompt .= "1. PURPOSE STORY (200-250 words):\n";
        $prompt .= "   - Why does this business exist beyond making money?\n";
        $prompt .= "   - What greater purpose drives this work?\n";
        $prompt .= "   - What change are they working to create in the world?\n";
        $prompt .= "   - This should attract employees, investors, and aligned customers\n";
        $prompt .= "   - Make it inspiring and meaningful\n\n";

        $prompt .= "2. POSITIONING STORY (150-200 words):\n";
        $prompt .= "   - How are they differentiated from competitors?\n";
        $prompt .= "   - What unique space do they occupy in the market?\n";
        $prompt .= "   - What's their 'David vs Goliath' narrative (if applicable)?\n";
        $prompt .= "   - Who are they FOR and who are they NOT for?\n";
        $prompt .= "   - Make it clear and compelling\n\n";

        $prompt .= "3. TRANSFORMATION STORY (250-300 words):\n";
        $prompt .= "   - Tell a specific customer success story\n";
        $prompt .= "   - Include before/after transformation\n";
        $prompt .= "   - Show the process and methodology in action\n";
        $prompt .= "   - Include specific results and outcomes\n";
        $prompt .= "   - Make it concrete and believable\n\n";

        $prompt .= "4. CONTRARIAN/CHALLENGE STORY (150-200 words):\n";
        $prompt .= "   - What industry 'truth' or conventional wisdom do they challenge?\n";
        $prompt .= "   - What's their unique or controversial perspective?\n";
        $prompt .= "   - Why does the industry need to think differently?\n";
        $prompt .= "   - Make it thought-provoking and differentiated\n\n";

        $prompt .= "TONE: Write in a {$tone_style} tone.\n\n";

        $prompt .= "FORMAT YOUR RESPONSE EXACTLY LIKE THIS:\n\n";
        $prompt .= "PURPOSE STORY:\n[The complete purpose story here]\n\n";
        $prompt .= "POSITIONING STORY:\n[The complete positioning story here]\n\n";
        $prompt .= "TRANSFORMATION STORY:\n[The complete transformation story here]\n\n";
        $prompt .= "CONTRARIAN STORY:\n[The complete contrarian/challenge story here]";

        return $prompt;
    }

    /**
     * Parse stories from API response
     */
    private function parse_stories($content) {
        $stories = [
            'purpose' => '',
            'positioning' => '',
            'transformation' => '',
            'contrarian' => ''
        ];

        // Extract each story using regex
        if (preg_match('/PURPOSE STORY:\s*(.*?)(?=\s*POSITIONING STORY:|$)/s', $content, $purpose_match)) {
            $stories['purpose'] = trim($purpose_match[1]);
        }

        if (preg_match('/POSITIONING STORY:\s*(.*?)(?=\s*TRANSFORMATION STORY:|$)/s', $content, $positioning_match)) {
            $stories['positioning'] = trim($positioning_match[1]);
        }

        if (preg_match('/TRANSFORMATION STORY:\s*(.*?)(?=\s*CONTRARIAN STORY:|CONTRARIAN\/CHALLENGE STORY:|$)/s', $content, $transformation_match)) {
            $stories['transformation'] = trim($transformation_match[1]);
        }

        if (preg_match('/CONTRARIAN(?:\/CHALLENGE)? STORY:\s*(.*?)$/s', $content, $contrarian_match)) {
            $stories['contrarian'] = trim($contrarian_match[1]);
        }

        return $stories;
    }

    /**
     * Render meta box for admin
     */
    public function render_meta_box($post) {
        $purpose = get_post_meta($post->ID, $this->post_meta_fields['purpose_story'], true);
        $positioning = get_post_meta($post->ID, $this->post_meta_fields['positioning_story'], true);
        $transformation = get_post_meta($post->ID, $this->post_meta_fields['transformation_story'], true);
        $contrarian = get_post_meta($post->ID, $this->post_meta_fields['contrarian_story'], true);

        echo '<div class="mkcg-meta-box">';
        echo '<p><strong>Generated Business Stories:</strong></p>';

        if ($purpose) {
            echo '<h4>Purpose Story:</h4>';
            echo '<p>' . esc_html($purpose) . '</p>';
        }

        if ($positioning) {
            echo '<h4>Positioning Story:</h4>';
            echo '<p>' . esc_html($positioning) . '</p>';
        }

        if ($transformation) {
            echo '<h4>Transformation Story:</h4>';
            echo '<p>' . esc_html($transformation) . '</p>';
        }

        if ($contrarian) {
            echo '<h4>Contrarian Story:</h4>';
            echo '<p>' . esc_html($contrarian) . '</p>';
        }

        if (!$purpose && !$positioning && !$transformation && !$contrarian) {
            echo '<p><em>No business stories generated yet.</em></p>';
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
            'stories' => []
        ];

        if ($post_id > 0) {
            $purpose = get_post_meta($post_id, $this->post_meta_fields['purpose_story'], true);
            $positioning = get_post_meta($post_id, $this->post_meta_fields['positioning_story'], true);
            $transformation = get_post_meta($post_id, $this->post_meta_fields['transformation_story'], true);
            $contrarian = get_post_meta($post_id, $this->post_meta_fields['contrarian_story'], true);

            if ($purpose || $positioning || $transformation || $contrarian) {
                $data['has_data'] = true;
                $data['stories'] = [
                    'purpose' => $purpose ?: '',
                    'positioning' => $positioning ?: '',
                    'transformation' => $transformation ?: '',
                    'contrarian' => $contrarian ?: ''
                ];
            }
        }

        return $data;
    }
}
