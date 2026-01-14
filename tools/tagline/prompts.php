<?php
/**
 * Tagline Generator - Prompts Configuration
 *
 * Enhanced prompt logic for generating memorable taglines using the
 * 6 W's Authority Framework (Who, What, When, How, Where, Why).
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
        'required' => [],
        'anyOf' => ['authorityHook', 'who', 'what'],
        'defaults' => [
            'count' => 10,
            'styleFocus' => 'outcome',
            'tone' => 'bold'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.9,
        'max_tokens' => 2000
    ],

    'system_prompt' => 'You are a world-class branding strategist and copywriter who creates memorable, impactful taglines that distill complex expertise into powerful statements. Your taglines are:

- Concise (5-10 words maximum)
- Memorable and repeatable
- Focused on transformation and outcomes
- Unique to the individual\'s positioning
- Designed to stick in people\'s minds

You understand the psychology of memorable messaging and create taglines that work across all platforms: LinkedIn headlines, podcast intros, email signatures, and business cards.',

    'user_prompt' => function($params) {
        $count = $params['count'] ?? 10;
        $styleFocus = $params['styleFocus'] ?? 'outcome';
        $tone = $params['tone'] ?? 'bold';

        // Authority Hook components (4 W's)
        $who = $params['who'] ?? '';
        $what = $params['what'] ?? '';
        $when = $params['when'] ?? '';
        $how = $params['how'] ?? '';

        // Impact Intro components (remaining 2 W's)
        $where = $params['where'] ?? '';  // Credentials/proof
        $why = $params['why'] ?? '';      // Mission/purpose

        // Brand context
        $industry = $params['industry'] ?? '';
        $uniqueFactor = $params['uniqueFactor'] ?? '';
        $existingTaglines = $params['existingTaglines'] ?? '';

        // Legacy support for single authorityHook field
        $authorityHook = $params['authorityHook'] ?? '';

        // Refinement context
        $previousTaglines = $params['previousTaglines'] ?? [];
        $refinementFeedback = $params['refinementFeedback'] ?? '';

        // Intent type
        $intent = $params['intent'] ?? 'brand';

        $prompt = "Generate {$count} powerful, memorable taglines.\n\n";

        // Build context from 6 W's framework
        $prompt .= "=== AUTHORITY FRAMEWORK ===\n";

        if (!empty($who)) {
            $prompt .= "WHO they help: {$who}\n";
        }
        if (!empty($what)) {
            $prompt .= "WHAT they help achieve: {$what}\n";
        }
        if (!empty($when)) {
            $prompt .= "WHEN clients need this: {$when}\n";
        }
        if (!empty($how)) {
            $prompt .= "HOW they deliver: {$how}\n";
        }
        if (!empty($where)) {
            $prompt .= "WHERE their authority comes from: {$where}\n";
        }
        if (!empty($why)) {
            $prompt .= "WHY this is their mission: {$why}\n";
        }

        // Fallback to legacy authorityHook if no 6 W's provided
        if (empty($who) && empty($what) && !empty($authorityHook)) {
            $prompt .= "AUTHORITY HOOK: {$authorityHook}\n";
        }

        $prompt .= "\n";

        // Brand context
        if (!empty($industry) || !empty($uniqueFactor)) {
            $prompt .= "=== BRAND CONTEXT ===\n";
            if (!empty($industry)) {
                $prompt .= "Industry: {$industry}\n";
            }
            if (!empty($uniqueFactor)) {
                $prompt .= "Unique Factor: {$uniqueFactor}\n";
            }
            $prompt .= "\n";
        }

        // Existing taglines to improve upon
        if (!empty($existingTaglines)) {
            $prompt .= "=== EXISTING TAGLINES TO IMPROVE ===\n";
            $prompt .= "{$existingTaglines}\n\n";
        }

        // Style and tone settings
        $prompt .= "=== STYLE SETTINGS ===\n";

        $styleDescriptions = [
            'problem' => 'Problem-Focused: Emphasize the pain point or challenge being solved',
            'solution' => 'Solution-Focused: Highlight the method, framework, or approach',
            'outcome' => 'Outcome-Focused: Lead with the transformation or end result',
            'authority' => 'Authority-Focused: Position expertise, credibility, and trust'
        ];
        $prompt .= "Style Focus: " . ($styleDescriptions[$styleFocus] ?? $styleDescriptions['outcome']) . "\n";

        $toneDescriptions = [
            'bold' => 'Bold & Direct: Confident, assertive, no-nonsense',
            'professional' => 'Professional & Polished: Sophisticated, trustworthy, refined',
            'clever' => 'Conversational & Clever: Witty, memorable wordplay, engaging',
            'inspirational' => 'Inspirational: Uplifting, motivational, visionary'
        ];
        $prompt .= "Tone: " . ($toneDescriptions[$tone] ?? $toneDescriptions['bold']) . "\n\n";

        // Intent-specific guidance
        $intentGuidance = [
            'brand' => 'Create brand taglines that define identity and stick in people\'s minds.',
            'podcast' => 'Create podcast hooks that make hosts want to book immediately.',
            'course' => 'Create course/book titles that promise transformation and intrigue.'
        ];
        $prompt .= "Intent: " . ($intentGuidance[$intent] ?? $intentGuidance['brand']) . "\n\n";

        // Refinement handling
        if (!empty($refinementFeedback) && !empty($previousTaglines)) {
            $prompt .= "=== REFINEMENT REQUEST ===\n";
            $prompt .= "Previous taglines generated:\n";
            foreach ($previousTaglines as $i => $tagline) {
                $prompt .= ($i + 1) . ". {$tagline}\n";
            }
            $prompt .= "\nUser feedback for refinement: {$refinementFeedback}\n";
            $prompt .= "\nGenerate {$count} NEW taglines that incorporate this feedback while maintaining the best elements of the previous options.\n\n";
        }

        // Requirements
        $prompt .= "=== REQUIREMENTS ===\n";
        $prompt .= "- Each tagline must be 5-10 words maximum\n";
        $prompt .= "- Make them immediately memorable and repeatable\n";
        $prompt .= "- Focus on transformation, not features\n";
        $prompt .= "- Avoid cliches and generic phrases\n";
        $prompt .= "- Each should work standalone without explanation\n";
        $prompt .= "- Vary the structure across all {$count} options\n";
        $prompt .= "- Include a mix of: statements, questions (if appropriate), and action-oriented phrases\n\n";

        $prompt .= "IMPORTANT: You MUST generate exactly {$count} taglines, numbered 1 through {$count}.\n\n";
        $prompt .= "Format as a numbered list:\n";
        $prompt .= "1. [Tagline]\n";
        $prompt .= "2. [Tagline]\n";
        $prompt .= "...\n";
        $prompt .= "{$count}. [Tagline]\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $taglines = [];
        $lines = explode("\n", trim($response_content));

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Match numbered list items: "1. Tagline" or "1) Tagline"
            if (preg_match('/^\d+[\.\)]\s*(.+)$/', $line, $matches)) {
                $tagline = trim($matches[1]);
                // Remove surrounding quotes if present
                $tagline = preg_replace('/^["\']+|["\']+$/', '', $tagline);
                // Remove markdown bold markers **
                $tagline = str_replace('**', '', $tagline);
                $tagline = trim($tagline);
                if (!empty($tagline) && strlen($tagline) > 3) {
                    $taglines[] = [
                        'text' => $tagline,
                        'selected' => false,
                        'locked' => false
                    ];
                }
            }
        }

        return $taglines;
    },

    'options' => [
        'styleFocus' => [
            ['value' => 'problem', 'label' => 'Problem-Focused'],
            ['value' => 'solution', 'label' => 'Solution-Focused'],
            ['value' => 'outcome', 'label' => 'Outcome-Focused'],
            ['value' => 'authority', 'label' => 'Authority-Focused']
        ],
        'tone' => [
            ['value' => 'bold', 'label' => 'Bold & Direct'],
            ['value' => 'professional', 'label' => 'Professional & Polished'],
            ['value' => 'clever', 'label' => 'Conversational & Clever'],
            ['value' => 'inspirational', 'label' => 'Inspirational']
        ],
        'intent' => [
            ['value' => 'brand', 'label' => 'Brand Tagline'],
            ['value' => 'podcast', 'label' => 'Podcast Hook'],
            ['value' => 'course', 'label' => 'Course/Book Title']
        ]
    ]
];
