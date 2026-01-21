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
        'max_tokens' => 2000
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
     * Length slot configuration - defines variation counts for economical token usage
     */
    'lengthSlots' => [
        'short' => [
            'label' => 'Short (50-75 words)',
            'wordRange' => '50-75',
            'variationCount' => 5,
            'description' => 'Social media profiles or brief introductions'
        ],
        'medium' => [
            'label' => 'Medium (150-200 words)',
            'wordRange' => '150-200',
            'variationCount' => 3,
            'description' => 'Speaker profiles, book jackets, or professional websites'
        ],
        'long' => [
            'label' => 'Long (300-400 words)',
            'wordRange' => '300-400',
            'variationCount' => 2,
            'description' => 'Press kits, detailed speaker pages, or formal introductions'
        ]
    ],

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

        // Length configuration
        $length_slots = [
            'short' => ['wordRange' => '50-75', 'variationCount' => 5, 'description' => 'social media profiles or brief introductions'],
            'medium' => ['wordRange' => '150-200', 'variationCount' => 3, 'description' => 'speaker profiles, book jackets, or professional websites'],
            'long' => ['wordRange' => '300-400', 'variationCount' => 2, 'description' => 'press kits, detailed speaker pages, or formal introductions']
        ];
        $slot = $length_slots[$length] ?? $length_slots['medium'];
        $word_range = $slot['wordRange'];
        $variation_count = $slot['variationCount'];
        $length_description = $slot['description'];

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

        // Build the prompt
        $prompt = "Create {$variation_count} distinct professional biography variations for {$name}";
        if ($title) {
            $prompt .= ", a {$title}";
        }
        if ($organization) {
            $prompt .= " at {$organization}";
        }
        $prompt .= ".\n\n";

        $prompt .= "Requirements for ALL variations:\n";
        $prompt .= "1. Use a {$selected_tone} tone.\n";
        $prompt .= "2. Write in {$selected_pov}.\n";
        $prompt .= "3. Length: {$word_range} words each (suitable for {$length_description}).\n";
        $prompt .= "4. Each variation should have a different opening hook, structure, or emphasis.\n";
        $prompt .= "5. Maintain factual consistency across variations.\n";

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

        // Handle refinement requests
        if (!empty($params['currentDraft']) && !empty($params['refinementInstructions'])) {
            $prompt .= "\n\nCURRENT DRAFT TO REFINE:\n" . sanitize_textarea_field($params['currentDraft']) . "\n";
            $prompt .= "\nREFINEMENT INSTRUCTIONS:\n" . sanitize_textarea_field($params['refinementInstructions']) . "\n";
            $prompt .= "\nProvide {$variation_count} refined variations based on the feedback.\n";
        }

        // Request JSON format for easy parsing
        $prompt .= "\n\nRespond with valid JSON in this exact format:\n";
        $prompt .= "{\n";
        $prompt .= "  \"variations\": [\n";
        for ($i = 1; $i <= $variation_count; $i++) {
            $prompt .= "    {\"id\": {$i}, \"label\": \"Option {$i}\", \"text\": \"[Biography text here]\"}";
            $prompt .= ($i < $variation_count) ? ",\n" : "\n";
        }
        $prompt .= "  ]\n";
        $prompt .= "}\n";
        $prompt .= "\nIMPORTANT: Return ONLY the JSON object, no markdown code blocks or other text.";

        return $prompt;
    },

    /**
     * Response parser function
     *
     * @param string $response_content Raw response from OpenAI
     * @return array Structured variations data matching frontend expectations
     */
    'parser' => function($response_content) {
        // Try to parse as JSON first
        $decoded = json_decode($response_content, true);

        if (json_last_error() === JSON_ERROR_NONE && isset($decoded['variations'])) {
            // Valid JSON with variations
            return [
                'variations' => array_map(function($v) {
                    return [
                        'id' => $v['id'] ?? 0,
                        'label' => $v['label'] ?? 'Option',
                        'text' => trim($v['text'] ?? ''),
                        'wordCount' => str_word_count(trim($v['text'] ?? ''))
                    ];
                }, $decoded['variations']),
                'count' => count($decoded['variations'])
            ];
        }

        // Try to extract JSON from response (sometimes wrapped in markdown code blocks)
        if (preg_match('/\{[\s\S]*"variations"[\s\S]*\}/m', $response_content, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE && isset($decoded['variations'])) {
                return [
                    'variations' => array_map(function($v) {
                        return [
                            'id' => $v['id'] ?? 0,
                            'label' => $v['label'] ?? 'Option',
                            'text' => trim($v['text'] ?? ''),
                            'wordCount' => str_word_count(trim($v['text'] ?? ''))
                        ];
                    }, $decoded['variations']),
                    'count' => count($decoded['variations'])
                ];
            }
        }

        // Fallback: Try to parse legacy format (SHORT BIO: / MEDIUM BIO: / LONG BIO:)
        $variations = [];
        $patterns = [
            'short' => '/SHORT BIO:\s*(.*?)(?=\s*(?:MEDIUM BIO:|LONG BIO:|$))/is',
            'medium' => '/MEDIUM BIO:\s*(.*?)(?=\s*(?:LONG BIO:|$))/is',
            'long' => '/LONG BIO:\s*(.*?)$/is'
        ];

        $id = 1;
        foreach ($patterns as $key => $pattern) {
            if (preg_match($pattern, $response_content, $matches)) {
                $text = trim($matches[1]);
                if (!empty($text)) {
                    $variations[] = [
                        'id' => $id++,
                        'label' => ucfirst($key) . ' Bio',
                        'text' => $text,
                        'wordCount' => str_word_count($text)
                    ];
                }
            }
        }

        if (!empty($variations)) {
            return [
                'variations' => $variations,
                'count' => count($variations)
            ];
        }

        // Final fallback: treat entire response as single variation
        if (!empty(trim($response_content))) {
            return [
                'variations' => [
                    [
                        'id' => 1,
                        'label' => 'Generated',
                        'text' => trim($response_content),
                        'wordCount' => str_word_count(trim($response_content))
                    ]
                ],
                'count' => 1
            ];
        }

        return [
            'variations' => [],
            'count' => 0,
            'error' => 'Failed to parse response'
        ];
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
