<?php
/**
 * Credibility Stories Suite Generator
 *
 * Generates four personal credibility and authenticity stories:
 * - Aha Moment/Epiphany Story: Your breakthrough insight
 * - Failure/Comeback Story: Your resilience journey
 * - Mentor/Influence Story: Your lineage and influences
 * - Personal Transformation Story: Your identity evolution
 *
 * @package MediaKitContentGenerator
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

class MKCG_Enhanced_Credibility_Stories_Generator {
    const OPENAI_MODEL = 'gpt-4';

    private $default_settings = [
        'tone' => 'authentic',
        'vulnerability_level' => 'moderate',
    ];

    private $post_meta_fields = [
        'aha_moment_story' => '_credibility_aha_moment_story',
        'failure_comeback_story' => '_credibility_failure_comeback_story',
        'mentor_story' => '_credibility_mentor_story',
        'transformation_story' => '_credibility_transformation_story',
        'credibility_stories_settings' => '_credibility_stories_settings',
    ];

    public function __construct() {
        // Constructor
    }

    public function init() {
        // Initialization if needed
    }

    /**
     * Generate credibility stories via AJAX
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
        $tone = sanitize_text_field($_POST['tone'] ?? 'authentic');
        $vulnerability_level = sanitize_text_field($_POST['vulnerability_level'] ?? 'moderate');
        $authority_hook = sanitize_textarea_field($_POST['authority_hook'] ?? '');
        $impact_intro = sanitize_textarea_field($_POST['impact_intro'] ?? '');
        $breakthrough_moment = sanitize_textarea_field($_POST['breakthrough_moment'] ?? '');
        $challenge_faced = sanitize_textarea_field($_POST['challenge_faced'] ?? '');
        $key_mentors = sanitize_textarea_field($_POST['key_mentors'] ?? '');
        $personal_journey = sanitize_textarea_field($_POST['personal_journey'] ?? '');

        // Rate limiting check
        $rate_limit_key = 'credibility_stories_generation_' . get_current_user_id();
        $recent_generations = get_transient($rate_limit_key);

        if ($recent_generations && $recent_generations >= 10) {
            wp_send_json_error(['message' => 'Rate limit exceeded. Please try again later.']);
            return;
        }

        // Check cache
        $cache_key = 'credibility_stories_' . md5(serialize([
            $name, $title, $tone, $vulnerability_level,
            $authority_hook, $impact_intro, $breakthrough_moment,
            $challenge_faced, $key_mentors, $personal_journey
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
            'name', 'title', 'tone', 'vulnerability_level',
            'authority_hook', 'impact_intro', 'breakthrough_moment',
            'challenge_faced', 'key_mentors', 'personal_journey'
        );

        $stories = $this->generate_stories($data);

        if (is_wp_error($stories)) {
            wp_send_json_error(['message' => $stories->get_error_message()]);
            return;
        }

        // Save to post meta if post_id provided
        if ($post_id > 0) {
            update_post_meta($post_id, $this->post_meta_fields['aha_moment_story'], $stories['aha_moment']);
            update_post_meta($post_id, $this->post_meta_fields['failure_comeback_story'], $stories['failure_comeback']);
            update_post_meta($post_id, $this->post_meta_fields['mentor_story'], $stories['mentor']);
            update_post_meta($post_id, $this->post_meta_fields['transformation_story'], $stories['transformation']);
            update_post_meta($post_id, $this->post_meta_fields['credibility_stories_settings'], $data);
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
     * Generate credibility stories using OpenAI
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
                        'content' => 'You are an expert personal brand storyteller specializing in creating authentic, vulnerable, and credibility-building narratives that connect deeply with audiences.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.8,
                'max_tokens' => 2200,
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
            'authentic' => 'genuine, vulnerable, and deeply personal',
            'professional' => 'professional yet personal, balancing vulnerability with authority',
            'inspiring' => 'motivational and aspirational, emphasizing growth and possibility',
            'conversational' => 'casual and relatable, like sharing with a close friend'
        ];

        $vulnerability_guidance = [
            'high' => 'Show deep vulnerability, share raw emotions and difficult truths',
            'moderate' => 'Balance authenticity with professionalism, share challenges openly but constructively',
            'low' => 'Focus on lessons learned and growth, mention challenges but emphasize outcomes'
        ];

        $tone_style = $tone_guidance[$data['tone']] ?? $tone_guidance['authentic'];
        $vulnerability_style = $vulnerability_guidance[$data['vulnerability_level']] ?? $vulnerability_guidance['moderate'];

        $prompt = "Generate four personal credibility stories for {$data['name']}";

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

        if (!empty($data['breakthrough_moment'])) {
            $prompt .= "BREAKTHROUGH MOMENT CONTEXT:\n{$data['breakthrough_moment']}\n\n";
        }

        if (!empty($data['challenge_faced'])) {
            $prompt .= "CHALLENGES FACED:\n{$data['challenge_faced']}\n\n";
        }

        if (!empty($data['key_mentors'])) {
            $prompt .= "KEY MENTORS & INFLUENCES:\n{$data['key_mentors']}\n\n";
        }

        if (!empty($data['personal_journey'])) {
            $prompt .= "PERSONAL TRANSFORMATION JOURNEY:\n{$data['personal_journey']}\n\n";
        }

        $prompt .= "Create these FOUR credibility-building stories:\n\n";

        $prompt .= "1. AHA MOMENT/EPIPHANY STORY (200-250 words):\n";
        $prompt .= "   - The breakthrough insight or realization that changed everything\n";
        $prompt .= "   - What was believed before vs. what was discovered\n";
        $prompt .= "   - The moment of clarity and its immediate impact\n";
        $prompt .= "   - How this insight led to their unique approach or methodology\n";
        $prompt .= "   - Make it vivid, specific, and transformational\n\n";

        $prompt .= "2. FAILURE/COMEBACK STORY (250-300 words):\n";
        $prompt .= "   - A significant setback, failure, or low point\n";
        $prompt .= "   - The emotional and practical challenges faced\n";
        $prompt .= "   - How they rebuilt, recovered, or pivoted\n";
        $prompt .= "   - What was learned and how it made them stronger\n";
        $prompt .= "   - Show vulnerability, resilience, and growth\n";
        $prompt .= "   - {$vulnerability_style}\n\n";

        $prompt .= "3. MENTOR/INFLUENCE STORY (150-200 words):\n";
        $prompt .= "   - Who shaped their thinking and approach?\n";
        $prompt .= "   - What specific lesson or wisdom was passed down?\n";
        $prompt .= "   - How did this influence show up in their work?\n";
        $prompt .= "   - Shows humility, gratitude, and lineage of expertise\n";
        $prompt .= "   - Makes them part of a larger tradition\n\n";

        $prompt .= "4. PERSONAL TRANSFORMATION STORY (250-300 words):\n";
        $prompt .= "   - Who they were before vs. who they became\n";
        $prompt .= "   - The identity shift, mindset change, or life transformation\n";
        $prompt .= "   - What triggered the transformation?\n";
        $prompt .= "   - The journey from old self to new self\n";
        $prompt .= "   - How this transformation enables them to help others\n";
        $prompt .= "   - Make it deeply relatable and human\n\n";

        $prompt .= "TONE: Write in a {$tone_style} tone.\n\n";

        $prompt .= "FORMAT YOUR RESPONSE EXACTLY LIKE THIS:\n\n";
        $prompt .= "AHA MOMENT STORY:\n[The complete aha moment/epiphany story here]\n\n";
        $prompt .= "FAILURE COMEBACK STORY:\n[The complete failure/comeback story here]\n\n";
        $prompt .= "MENTOR STORY:\n[The complete mentor/influence story here]\n\n";
        $prompt .= "TRANSFORMATION STORY:\n[The complete personal transformation story here]";

        return $prompt;
    }

    /**
     * Parse stories from API response
     */
    private function parse_stories($content) {
        $stories = [
            'aha_moment' => '',
            'failure_comeback' => '',
            'mentor' => '',
            'transformation' => ''
        ];

        // Extract each story using regex
        if (preg_match('/AHA MOMENT(?:\/EPIPHANY)? STORY:\s*(.*?)(?=\s*FAILURE|$)/s', $content, $aha_match)) {
            $stories['aha_moment'] = trim($aha_match[1]);
        }

        if (preg_match('/FAILURE(?:\/COMEBACK)? (?:COMEBACK )?STORY:\s*(.*?)(?=\s*MENTOR|$)/s', $content, $failure_match)) {
            $stories['failure_comeback'] = trim($failure_match[1]);
        }

        if (preg_match('/MENTOR(?:\/INFLUENCE)? STORY:\s*(.*?)(?=\s*(?:PERSONAL )?TRANSFORMATION|$)/s', $content, $mentor_match)) {
            $stories['mentor'] = trim($mentor_match[1]);
        }

        if (preg_match('/(?:PERSONAL )?TRANSFORMATION STORY:\s*(.*?)$/s', $content, $transformation_match)) {
            $stories['transformation'] = trim($transformation_match[1]);
        }

        return $stories;
    }

    /**
     * Render meta box for admin
     */
    public function render_meta_box($post) {
        $aha_moment = get_post_meta($post->ID, $this->post_meta_fields['aha_moment_story'], true);
        $failure_comeback = get_post_meta($post->ID, $this->post_meta_fields['failure_comeback_story'], true);
        $mentor = get_post_meta($post->ID, $this->post_meta_fields['mentor_story'], true);
        $transformation = get_post_meta($post->ID, $this->post_meta_fields['transformation_story'], true);

        echo '<div class="mkcg-meta-box">';
        echo '<p><strong>Generated Credibility Stories:</strong></p>';

        if ($aha_moment) {
            echo '<h4>Aha Moment Story:</h4>';
            echo '<p>' . esc_html($aha_moment) . '</p>';
        }

        if ($failure_comeback) {
            echo '<h4>Failure/Comeback Story:</h4>';
            echo '<p>' . esc_html($failure_comeback) . '</p>';
        }

        if ($mentor) {
            echo '<h4>Mentor Story:</h4>';
            echo '<p>' . esc_html($mentor) . '</p>';
        }

        if ($transformation) {
            echo '<h4>Personal Transformation Story:</h4>';
            echo '<p>' . esc_html($transformation) . '</p>';
        }

        if (!$aha_moment && !$failure_comeback && !$mentor && !$transformation) {
            echo '<p><em>No credibility stories generated yet.</em></p>';
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
            $aha_moment = get_post_meta($post_id, $this->post_meta_fields['aha_moment_story'], true);
            $failure_comeback = get_post_meta($post_id, $this->post_meta_fields['failure_comeback_story'], true);
            $mentor = get_post_meta($post_id, $this->post_meta_fields['mentor_story'], true);
            $transformation = get_post_meta($post_id, $this->post_meta_fields['transformation_story'], true);

            if ($aha_moment || $failure_comeback || $mentor || $transformation) {
                $data['has_data'] = true;
                $data['stories'] = [
                    'aha_moment' => $aha_moment ?: '',
                    'failure_comeback' => $failure_comeback ?: '',
                    'mentor' => $mentor ?: '',
                    'transformation' => $transformation ?: ''
                ];
            }
        }

        return $data;
    }
}
