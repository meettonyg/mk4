<?php
/**
 * Interview Prep Generator
 *
 * Generates anticipated interview questions with prepared answers:
 * - Creates 8-10 likely interview questions based on expertise
 * - Provides strategic, well-crafted answers for each question
 * - Different interview contexts (podcast, media, conference, virtual)
 * - Question types: expertise, background, methodology, results, philosophy
 *
 * @package MediaKitContentGenerator
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

class MKCG_Enhanced_Interview_Prep_Generator {
    const OPENAI_MODEL = 'gpt-4';

    private $default_settings = [
        'interview_type' => 'podcast',
        'depth' => 'moderate',
        'question_count' => 8,
    ];

    private $post_meta_fields = [
        'interview_questions' => '_interview_prep_questions',
        'interview_answers' => '_interview_prep_answers',
        'interview_settings' => '_interview_prep_settings',
    ];

    public function __construct() {
        // Constructor
    }

    public function init() {
        // Initialization if needed
    }

    /**
     * Generate interview Q&A via AJAX
     */
    public function ajax_generate_interview_prep() {
        check_ajax_referer('mkcg_nonce', 'nonce');

        if (!current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'Permission denied']);
            return;
        }

        $post_id = intval($_POST['post_id'] ?? 0);
        $name = sanitize_text_field($_POST['name'] ?? '');
        $title = sanitize_text_field($_POST['title'] ?? '');
        $interview_type = sanitize_text_field($_POST['interview_type'] ?? 'podcast');
        $depth = sanitize_text_field($_POST['depth'] ?? 'moderate');
        $question_count = intval($_POST['question_count'] ?? 8);
        $authority_hook = sanitize_textarea_field($_POST['authority_hook'] ?? '');
        $impact_intro = sanitize_textarea_field($_POST['impact_intro'] ?? '');
        $expertise_areas = sanitize_textarea_field($_POST['expertise_areas'] ?? '');
        $key_messages = sanitize_textarea_field($_POST['key_messages'] ?? '');
        $audience_context = sanitize_textarea_field($_POST['audience_context'] ?? '');

        // Rate limiting check
        $rate_limit_key = 'interview_prep_generation_' . get_current_user_id();
        $recent_generations = get_transient($rate_limit_key);

        if ($recent_generations && $recent_generations >= 10) {
            wp_send_json_error(['message' => 'Rate limit exceeded. Please try again later.']);
            return;
        }

        // Check cache
        $cache_key = 'interview_prep_' . md5(serialize([
            $name, $title, $interview_type, $depth, $question_count,
            $authority_hook, $impact_intro, $expertise_areas,
            $key_messages, $audience_context
        ]));
        $cached_qa = get_transient($cache_key);

        if ($cached_qa) {
            wp_send_json_success([
                'qa_pairs' => $cached_qa,
                'cached' => true
            ]);
            return;
        }

        // Generate Q&A
        $data = compact(
            'name', 'title', 'interview_type', 'depth', 'question_count',
            'authority_hook', 'impact_intro', 'expertise_areas',
            'key_messages', 'audience_context'
        );

        $qa_pairs = $this->generate_interview_qa($data);

        if (is_wp_error($qa_pairs)) {
            wp_send_json_error(['message' => $qa_pairs->get_error_message()]);
            return;
        }

        // Save to post meta if post_id provided
        if ($post_id > 0) {
            $questions = array_column($qa_pairs, 'question');
            $answers = array_column($qa_pairs, 'answer');

            update_post_meta($post_id, $this->post_meta_fields['interview_questions'], $questions);
            update_post_meta($post_id, $this->post_meta_fields['interview_answers'], $answers);
            update_post_meta($post_id, $this->post_meta_fields['interview_settings'], $data);
        }

        // Cache results (30 minutes)
        set_transient($cache_key, $qa_pairs, 1800);

        // Update rate limit
        set_transient($rate_limit_key, ($recent_generations ?? 0) + 1, 3600);

        wp_send_json_success([
            'qa_pairs' => $qa_pairs,
            'cached' => false
        ]);
    }

    /**
     * Generate interview Q&A using OpenAI
     */
    private function generate_interview_qa($data) {
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
                        'content' => 'You are an expert media coach and interview strategist who helps guests prepare for interviews by anticipating questions and crafting compelling answers.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 2500,
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

        return $this->parse_qa_pairs($content);
    }

    /**
     * Build the generation prompt
     */
    private function build_prompt($data) {
        $interview_types = [
            'podcast' => 'podcast interview - conversational, storytelling-focused, often 30-60 minutes',
            'media' => 'media interview (TV/radio) - concise, soundbite-ready, typically 5-15 minutes',
            'conference' => 'conference presentation Q&A - professional, thought-leadership focused',
            'virtual' => 'virtual summit/webinar - educational, value-driven, audience-interactive',
            'print' => 'print/written interview - detailed, quotable, evergreen content'
        ];

        $depth_guidance = [
            'light' => 'surface-level questions, easy to answer, warm-up style',
            'moderate' => 'balanced mix of easy and challenging questions',
            'deep' => 'thought-provoking, challenging questions that require depth and expertise'
        ];

        $interview_context = $interview_types[$data['interview_type']] ?? $interview_types['podcast'];
        $depth_style = $depth_guidance[$data['depth']] ?? $depth_guidance['moderate'];

        $prompt = "Generate {$data['question_count']} anticipated interview questions with prepared answers for {$data['name']}";

        if (!empty($data['title'])) {
            $prompt .= ", {$data['title']}";
        }

        $prompt .= ".\n\n";

        $prompt .= "INTERVIEW CONTEXT: This is for a {$interview_context}.\n\n";

        if (!empty($data['authority_hook'])) {
            $prompt .= "EXPERTISE & AUTHORITY:\n{$data['authority_hook']}\n\n";
        }

        if (!empty($data['impact_intro'])) {
            $prompt .= "BACKGROUND & EXPERIENCE:\n{$data['impact_intro']}\n\n";
        }

        if (!empty($data['expertise_areas'])) {
            $prompt .= "KEY EXPERTISE AREAS:\n{$data['expertise_areas']}\n\n";
        }

        if (!empty($data['key_messages'])) {
            $prompt .= "KEY MESSAGES TO CONVEY:\n{$data['key_messages']}\n\n";
        }

        if (!empty($data['audience_context'])) {
            $prompt .= "AUDIENCE CONTEXT:\n{$data['audience_context']}\n\n";
        }

        $prompt .= "Create {$data['question_count']} interview questions with answers:\n\n";

        $prompt .= "QUESTION DIFFICULTY: {$depth_style}\n\n";

        $prompt .= "QUESTION MIX - Include variety:\n";
        $prompt .= "- Background/Origin questions (\"How did you get started...?\")\n";
        $prompt .= "- Expertise questions (\"What's your approach to...?\")\n";
        $prompt .= "- Methodology questions (\"Can you walk us through...?\")\n";
        $prompt .= "- Results/Impact questions (\"What kind of results have you seen...?\")\n";
        $prompt .= "- Philosophy/Perspective questions (\"Why do you think...?\")\n";
        $prompt .= "- Advice/Actionable questions (\"What's one thing listeners can...?\")\n\n";

        $prompt .= "ANSWER GUIDELINES:\n";
        $prompt .= "- Keep answers conversational and authentic\n";
        $prompt .= "- Include specific examples or stories when relevant\n";
        $prompt .= "- Each answer should be 75-150 words\n";
        $prompt .= "- Make answers quotable and memorable\n";
        $prompt .= "- Incorporate key messages naturally\n";
        $prompt .= "- End answers with impact, not trailing off\n\n";

        $prompt .= "FORMAT YOUR RESPONSE EXACTLY LIKE THIS:\n\n";
        $prompt .= "Q1: [First interview question here?]\n";
        $prompt .= "A1: [Strategic, well-crafted answer here]\n\n";
        $prompt .= "Q2: [Second interview question here?]\n";
        $prompt .= "A2: [Strategic, well-crafted answer here]\n\n";
        $prompt .= "[Continue for all {$data['question_count']} questions]\n\n";

        $prompt .= "Make the questions realistic and likely to be asked in this type of interview.";

        return $prompt;
    }

    /**
     * Parse Q&A pairs from API response
     */
    private function parse_qa_pairs($content) {
        $qa_pairs = [];

        // Match Q1: ... A1: ... pattern
        preg_match_all('/Q(\d+):\s*(.*?)\s*A\1:\s*(.*?)(?=\s*Q\d+:|$)/s', $content, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $qa_pairs[] = [
                'number' => intval($match[1]),
                'question' => trim($match[2]),
                'answer' => trim($match[3])
            ];
        }

        return $qa_pairs;
    }

    /**
     * Render meta box for admin
     */
    public function render_meta_box($post) {
        $questions = get_post_meta($post->ID, $this->post_meta_fields['interview_questions'], true);
        $answers = get_post_meta($post->ID, $this->post_meta_fields['interview_answers'], true);

        echo '<div class="mkcg-meta-box">';
        echo '<p><strong>Generated Interview Q&A:</strong></p>';

        if ($questions && $answers) {
            foreach ($questions as $index => $question) {
                echo '<div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">';
                echo '<h4>Q' . ($index + 1) . ': ' . esc_html($question) . '</h4>';
                echo '<p><strong>A:</strong> ' . esc_html($answers[$index] ?? '') . '</p>';
                echo '</div>';
            }
        } else {
            echo '<p><em>No interview Q&A generated yet.</em></p>';
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
            'qa_pairs' => []
        ];

        if ($post_id > 0) {
            $questions = get_post_meta($post_id, $this->post_meta_fields['interview_questions'], true);
            $answers = get_post_meta($post_id, $this->post_meta_fields['interview_answers'], true);

            if ($questions && $answers) {
                $data['has_data'] = true;
                foreach ($questions as $index => $question) {
                    $data['qa_pairs'][] = [
                        'number' => $index + 1,
                        'question' => $question,
                        'answer' => $answers[$index] ?? ''
                    ];
                }
            }
        }

        return $data;
    }
}
