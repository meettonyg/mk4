<?php
/**
 * Guest Intro Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating podcast/interview guest introductions.
 * Supports multi-length generation with economical AI token usage:
 * - Short (30-45s): 5 variations
 * - Medium (60-90s): 3 variations
 * - Long (2-3 min): 2 variations
 *
 * @package GMKB
 * @subpackage Tools
 * @version 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

return [
    'validation' => [
        'required' => ['guestName'],
        'anyOf' => ['guestTitle', 'topic', 'authorityHook'],
        'defaults' => [
            'length' => 'short',
            'tone' => 'professional',
            'hookStyle' => 'question'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.8,
        'max_tokens' => 2000
    ],

    /**
     * Length slot configuration - defines variation counts for economical token usage
     *
     * TODO: Consider centralizing this configuration. Currently duplicated in:
     * - src/composables/useAIGuestIntro.js (LENGTH_SLOTS constant)
     * - tools/guest-intro/meta.json (lengthVariants)
     * - This file (lengthSlots)
     * The backend could potentially read from meta.json to reduce duplication.
     */
    'lengthSlots' => [
        'short' => [
            'label' => 'Short (30-45s)',
            'wordRange' => '50-80',
            'variationCount' => 5,
            'description' => 'Punchy, high-energy intro for fast-paced shows'
        ],
        'medium' => [
            'label' => 'Medium (60-90s)',
            'wordRange' => '100-150',
            'variationCount' => 3,
            'description' => 'Balanced intro with credibility and anticipation'
        ],
        'long' => [
            'label' => 'Long (2-3 min)',
            'wordRange' => '200-350',
            'variationCount' => 2,
            'description' => 'Comprehensive intro for keynotes and formal events'
        ]
    ],

    'system_prompt' => 'You are an experienced podcast host and event MC who crafts compelling guest introductions. Your intros:
- Hook the audience immediately with the opening line
- Establish credibility naturally (not a resume dump)
- Build anticipation for what the guest will share
- Flow naturally when read aloud
- Match the requested tone and energy level

You write introductions that make guests sound impressive and approachable, never over-the-top or salesy. Each introduction you create is unique in its hook and approach.',

    'user_prompt' => function($params) {
        $guestName = $params['guestName'] ?? '';
        $guestTitle = $params['guestTitle'] ?? '';
        $episodeTitle = $params['episodeTitle'] ?? '';
        $topic = $params['topic'] ?? '';

        // Authority Hook (Who-What-When-How)
        $authorityHook = $params['authorityHook'] ?? [];
        $hookWho = $authorityHook['who'] ?? '';
        $hookWhat = $authorityHook['what'] ?? '';
        $hookWhen = $authorityHook['when'] ?? '';
        $hookHow = $authorityHook['how'] ?? '';

        // Impact Intro (Where-Why)
        $impactIntro = $params['impactIntro'] ?? [];
        $credentials = $impactIntro['credentials'] ?? '';
        $mission = $impactIntro['mission'] ?? '';

        // Settings
        $length = $params['length'] ?? 'short';
        $tone = $params['tone'] ?? 'professional';
        $hookStyle = $params['hookStyle'] ?? 'question';
        $notes = $params['notes'] ?? '';

        // Refinement context (for iterative editing)
        $currentDraft = $params['currentDraft'] ?? '';
        $refinementInstructions = $params['refinementInstructions'] ?? '';

        // Length configuration
        $lengthConfig = [
            'short' => ['words' => '50-80', 'variations' => 5],
            'medium' => ['words' => '100-150', 'variations' => 3],
            'long' => ['words' => '200-350', 'variations' => 2]
        ];
        $config = $lengthConfig[$length] ?? $lengthConfig['short'];

        // Tone mapping
        $toneDescriptions = [
            'professional' => 'Professional and polished - authoritative yet approachable',
            'conversational' => 'Conversational and high-energy - warm and engaging',
            'warm' => 'Warm and story-driven - personal and relatable',
            'authoritative' => 'Authoritative and results-focused - commanding and impressive'
        ];
        $toneDesc = $toneDescriptions[$tone] ?? $toneDescriptions['professional'];

        // Hook style mapping
        $hookStyleDescriptions = [
            'question' => 'Start with a provocative question that makes listeners lean in',
            'statistic' => 'Open with a shocking or surprising statistic',
            'problem' => 'Begin with the problem/solution gap the guest addresses',
            'authority' => 'Lead with the guest\'s most impressive credential or achievement'
        ];
        $hookDesc = $hookStyleDescriptions[$hookStyle] ?? $hookStyleDescriptions['question'];

        // Build the prompt
        $prompt = "";

        // Check if this is a refinement request
        if (!empty($currentDraft) && !empty($refinementInstructions)) {
            $prompt .= "=== REFINEMENT REQUEST ===\n";
            $prompt .= "I have an existing guest introduction that needs refinement.\n\n";
            $prompt .= "CURRENT DRAFT:\n\"{$currentDraft}\"\n\n";
            $prompt .= "REFINEMENT INSTRUCTIONS: {$refinementInstructions}\n\n";
            $prompt .= "Please edit the current draft according to these instructions. Keep the same general structure and length unless asked to change it. Return ONLY the refined introduction text.\n";
            return $prompt;
        }

        // Standard generation request
        $prompt .= "Generate {$config['variations']} unique guest introduction variations ({$config['words']} words each).\n\n";

        // Guest information
        $prompt .= "=== GUEST INFORMATION ===\n";
        if (!empty($guestName)) $prompt .= "Guest Name: {$guestName}\n";
        if (!empty($guestTitle)) $prompt .= "Title/Company: {$guestTitle}\n";
        if (!empty($episodeTitle)) $prompt .= "Episode/Event: {$episodeTitle}\n";
        if (!empty($topic)) $prompt .= "Discussion Topic: {$topic}\n";

        // Authority Hook context
        if (!empty($hookWho) || !empty($hookWhat) || !empty($hookWhen) || !empty($hookHow)) {
            $prompt .= "\n=== AUTHORITY HOOK (Who-What-When-How) ===\n";
            if (!empty($hookWho)) $prompt .= "WHO they help: {$hookWho}\n";
            if (!empty($hookWhat)) $prompt .= "WHAT result they deliver: {$hookWhat}\n";
            if (!empty($hookWhen)) $prompt .= "WHEN people need them: {$hookWhen}\n";
            if (!empty($hookHow)) $prompt .= "HOW they do it: {$hookHow}\n";
        }

        // Impact Intro context
        if (!empty($credentials) || !empty($mission)) {
            $prompt .= "\n=== IMPACT INTRO (Where-Why) ===\n";
            if (!empty($credentials)) $prompt .= "WHERE (Credentials/Authority): {$credentials}\n";
            if (!empty($mission)) $prompt .= "WHY (Mission/Purpose): {$mission}\n";
        }

        // Settings
        $prompt .= "\n=== GENERATION SETTINGS ===\n";
        $prompt .= "Tone: {$toneDesc}\n";
        $prompt .= "Hook Style: {$hookDesc}\n";
        $prompt .= "Length: {$length} ({$config['words']} words per intro)\n";

        if (!empty($notes)) {
            $prompt .= "\nAdditional Notes: {$notes}\n";
        }

        // Format instructions
        $prompt .= "\n=== OUTPUT FORMAT ===\n";
        $prompt .= "Return the introductions in this exact JSON format:\n";
        $prompt .= "{\n";
        $prompt .= "  \"variations\": [\n";
        $prompt .= "    {\n";
        $prompt .= "      \"id\": 1,\n";
        $prompt .= "      \"label\": \"Descriptive label for this variation style (e.g., 'High-Energy Hook')\",\n";
        $prompt .= "      \"text\": \"The full introduction text...\"\n";
        $prompt .= "    }\n";
        $prompt .= "  ]\n";
        $prompt .= "}\n\n";

        $prompt .= "Requirements:\n";
        $prompt .= "- Each variation MUST use a distinctly different opening hook\n";
        $prompt .= "- Write as natural spoken word - this will be read aloud by a host\n";
        $prompt .= "- Include the guest's name naturally (usually at the welcome point)\n";
        $prompt .= "- End with a warm welcome that transitions to conversation\n";
        $prompt .= "- DO NOT use placeholders like [Name] - use the actual guest name\n";
        $prompt .= "- Return ONLY valid JSON, no additional text\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        // Try to parse as JSON first
        $decoded = json_decode($response_content, true);

        if (json_last_error() === JSON_ERROR_NONE && isset($decoded['variations'])) {
            // Valid JSON with variations
            return [
                'variations' => array_map(function($v) {
                    return [
                        'id' => $v['id'] ?? 0,
                        'label' => $v['label'] ?? 'Variation',
                        'text' => trim($v['text'] ?? ''),
                        'wordCount' => str_word_count(trim($v['text'] ?? ''))
                    ];
                }, $decoded['variations']),
                'count' => count($decoded['variations'])
            ];
        }

        // Try to extract JSON from response (sometimes wrapped in markdown)
        if (preg_match('/\{[\s\S]*"variations"[\s\S]*\}/m', $response_content, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE && isset($decoded['variations'])) {
                return [
                    'variations' => array_map(function($v) {
                        return [
                            'id' => $v['id'] ?? 0,
                            'label' => $v['label'] ?? 'Variation',
                            'text' => trim($v['text'] ?? ''),
                            'wordCount' => str_word_count(trim($v['text'] ?? ''))
                        ];
                    }, $decoded['variations']),
                    'count' => count($decoded['variations'])
                ];
            }
        }

        // Fallback for single refinement result (plain text)
        if (!empty($response_content)) {
            return [
                'variations' => [
                    [
                        'id' => 1,
                        'label' => 'Refined',
                        'text' => trim($response_content),
                        'wordCount' => str_word_count(trim($response_content))
                    ]
                ],
                'count' => 1,
                'isRefinement' => true
            ];
        }

        return [
            'variations' => [],
            'count' => 0,
            'error' => 'Failed to parse response'
        ];
    },

    'options' => [
        'length' => [
            ['value' => 'short', 'label' => 'Short (30-45 sec)', 'variations' => 5],
            ['value' => 'medium', 'label' => 'Medium (60-90 sec)', 'variations' => 3],
            ['value' => 'long', 'label' => 'Long (2-3 min)', 'variations' => 2]
        ],
        'tone' => [
            ['value' => 'professional', 'label' => 'Professional & Polished'],
            ['value' => 'conversational', 'label' => 'Conversational & High-Energy'],
            ['value' => 'warm', 'label' => 'Warm & Story-driven'],
            ['value' => 'authoritative', 'label' => 'Authoritative & Results-focused']
        ],
        'hookStyle' => [
            ['value' => 'question', 'label' => 'Provocative Question'],
            ['value' => 'statistic', 'label' => 'Shocking Statistic'],
            ['value' => 'problem', 'label' => 'The Problem/Solution Gap'],
            ['value' => 'authority', 'label' => 'Direct Authority Intro']
        ]
    ]
];
