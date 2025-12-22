<?php
/**
 * Biography Generator - Prompts & Logic
 *
 * Self-contained prompt configuration for the Biography Generator tool.
 * Uses the array return pattern for clean integration with ToolDiscovery.
 *
 * @package GMKB
 * @subpackage Tools
 * @version 2.0.0
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

return [
    /**
     * Validation rules
     */
    'validation' => [
        'required' => ['name'],
        'defaults' => [
            'tone' => 'professional',
            'pov' => 'third',
            'length' => 'medium'
        ]
    ],

    /**
     * OpenAI API settings
     */
    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 1000
    ],

    /**
     * System prompt - defines the AI's role and behavior
     */
    'system_prompt' => 'You are an expert professional biography writer specializing in creating compelling bios for speakers, authors, consultants, and thought leaders. You craft biographies that:
- Establish credibility and expertise
- Connect emotionally with the target audience
- Highlight unique value propositions
- Are written in the requested person perspective (1st, 2nd, or 3rd)
- Match the requested tone (professional, conversational, inspirational)
- Vary appropriately by length (short: 50-75 words, medium: 150-200 words, long: 300-400 words)

Always write in clear, engaging prose without bullet points unless specifically requested.',

    /**
     * User prompt builder function
     *
     * @param array $params Input parameters from the request
     * @return string The constructed prompt
     */
    'user_prompt' => function($params) {
        $name = sanitize_text_field($params['name'] ?? '');
        $title = sanitize_text_field($params['title'] ?? '');
        $organization = sanitize_text_field($params['organization'] ?? '');
        $tone = sanitize_text_field($params['tone'] ?? 'professional');
        $pov = sanitize_text_field($params['pov'] ?? 'third');
        $length = sanitize_text_field($params['length'] ?? 'medium');

        // Tone guidelines
        $tones = [
            'professional' => 'formal, authoritative, and business-appropriate',
            'conversational' => 'friendly, approachable, and conversational',
            'authoritative' => 'expert, confident, and authoritative',
            'inspirational' => 'uplifting, motivational, and inspiring',
            'friendly' => 'warm, approachable, and personable',
            'bold' => 'confident, direct, and impactful'
        ];
        $selected_tone = $tones[$tone] ?? $tones['professional'];

        // POV guidelines
        $povs = [
            'first' => 'first person (using "I" and "my")',
            'second' => 'second person (using "you" and "your")',
            'third' => 'third person (using their name and "he", "she", or "they")'
        ];
        $selected_pov = $povs[$pov] ?? $povs['third'];

        // Length guidelines
        $lengths = [
            'short' => '50-75 words, suitable for social media profiles or brief introductions',
            'medium' => '150-200 words, suitable for speaker profiles, book jackets, or professional websites',
            'long' => '300-400 words, suitable for press kits, detailed speaker pages, or formal introductions'
        ];
        $selected_length = $lengths[$length] ?? $lengths['medium'];

        // Build the prompt
        $prompt = "Create a professional biography for {$name}";
        if ($title) {
            $prompt .= ", a {$title}";
        }
        if ($organization) {
            $prompt .= " at {$organization}";
        }
        $prompt .= ".\n\n";

        $prompt .= "Requirements:\n";
        $prompt .= "1. Use a {$selected_tone} tone.\n";
        $prompt .= "2. Write in {$selected_pov}.\n";
        $prompt .= "3. Length: {$selected_length}.\n";

        // Add context fields if provided
        if (!empty($params['authorityHook'])) {
            $ah = $params['authorityHook'];
            $hook_parts = [];

            if (!empty($ah['who'])) $hook_parts[] = 'helps ' . sanitize_text_field($ah['who']);
            if (!empty($ah['what'])) $hook_parts[] = sanitize_text_field($ah['what']);
            if (!empty($ah['when'])) $hook_parts[] = 'when ' . sanitize_text_field($ah['when']);
            if (!empty($ah['how'])) $hook_parts[] = 'by ' . sanitize_text_field($ah['how']);
            if (!empty($ah['where'])) $hook_parts[] = 'in ' . sanitize_text_field($ah['where']);
            if (!empty($ah['why'])) $hook_parts[] = 'because ' . sanitize_text_field($ah['why']);

            if (!empty($hook_parts)) {
                $prompt .= "\nCORE EXPERTISE (Authority Hook):\n" . implode(' ', $hook_parts) . "\n";
            }
        }

        if (!empty($params['impactIntro'])) {
            $prompt .= "\nCREDENTIALS & MISSION (Impact Intro):\n" . sanitize_textarea_field($params['impactIntro']) . "\n";
        }

        if (!empty($params['existingBio'])) {
            $prompt .= "\nEXISTING BIO (Reference for style and facts):\n" . sanitize_textarea_field($params['existingBio']) . "\n";
        }

        if (!empty($params['achievements'])) {
            $achievements = is_array($params['achievements'])
                ? implode(', ', array_map('sanitize_text_field', $params['achievements']))
                : sanitize_textarea_field($params['achievements']);
            $prompt .= "\nKEY ACHIEVEMENTS:\n" . $achievements . "\n";
        }

        // Request all three lengths for flexibility
        $prompt .= "\n\nGenerate THREE versions of the biography:\n";
        $prompt .= "Format your response exactly as follows:\n\n";
        $prompt .= "SHORT BIO:\n[50-75 word version]\n\n";
        $prompt .= "MEDIUM BIO:\n[150-200 word version]\n\n";
        $prompt .= "LONG BIO:\n[300-400 word version]";

        return $prompt;
    },

    /**
     * Response parser function
     *
     * @param string $response_content Raw response from OpenAI
     * @return array Structured biography data
     */
    'parser' => function($response_content) {
        $biographies = [
            'short' => '',
            'medium' => '',
            'long' => ''
        ];

        // Parse labeled sections using regex
        if (preg_match('/SHORT BIO:\s*(.*?)(?=\s*MEDIUM BIO:|$)/is', $response_content, $matches)) {
            $biographies['short'] = trim($matches[1]);
        }

        if (preg_match('/MEDIUM BIO:\s*(.*?)(?=\s*LONG BIO:|$)/is', $response_content, $matches)) {
            $biographies['medium'] = trim($matches[1]);
        }

        if (preg_match('/LONG BIO:\s*(.*?)$/is', $response_content, $matches)) {
            $biographies['long'] = trim($matches[1]);
        }

        // Fallback: if parsing fails, use the whole content for the requested length
        if (empty($biographies['short']) && empty($biographies['medium']) && empty($biographies['long'])) {
            $biographies['medium'] = trim($response_content);
        }

        return $biographies;
    },

    /**
     * Field mappings for saving to database
     */
    'field_mappings' => [
        'short' => 'biography_short',
        'medium' => 'biography',
        'long' => 'biography_long'
    ],

    /**
     * Available options for UI dropdowns
     */
    'options' => [
        'tone' => [
            'professional' => 'Professional',
            'conversational' => 'Conversational',
            'inspirational' => 'Inspirational',
            'authoritative' => 'Authoritative',
            'friendly' => 'Friendly & Approachable',
            'bold' => 'Bold & Confident'
        ],
        'pov' => [
            'first' => 'First Person (I/My)',
            'second' => 'Second Person (You/Your)',
            'third' => 'Third Person (He/She/They)'
        ],
        'length' => [
            'short' => 'Short (50-75 words)',
            'medium' => 'Medium (150-200 words)',
            'long' => 'Long (300-400 words)'
        ]
    ]
];
