<?php
/**
 * Impact Intro Builder - Prompts Configuration
 *
 * Self-contained prompt logic for generating impactful self-introductions.
 *
 * @package GMKB
 * @subpackage Tools
 * @version 2.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

return [
    'validation' => [
        'required' => ['name', 'expertise'],
        'defaults' => [
            'context' => 'networking',
            'tone' => 'confident'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 800
    ],

    'system_prompt' => 'You are a personal branding coach who helps professionals introduce themselves in a way that makes an immediate impact. Your introductions are memorable, establish credibility quickly, and invite further conversation. You understand how to balance confidence with approachability.',

    'user_prompt' => function($params) {
        $name = $params['name'] ?? '';
        $expertise = $params['expertise'] ?? '';
        $authorityHook = $params['authorityHook'] ?? '';
        $achievement = $params['achievement'] ?? '';
        $context = $params['context'] ?? 'networking';
        $tone = $params['tone'] ?? 'confident';

        $prompt = "Create an impactful self-introduction for:\n\n";
        $prompt .= "NAME: {$name}\n";
        $prompt .= "EXPERTISE: {$expertise}\n";

        if (!empty($authorityHook)) {
            $prompt .= "WHAT THEY DO: {$authorityHook}\n";
        }

        if (!empty($achievement)) {
            $prompt .= "KEY ACHIEVEMENT: {$achievement}\n";
        }

        $prompt .= "\nContext: {$context}\n";
        $prompt .= "Tone: {$tone}\n";
        $prompt .= "\nRequirements:\n";
        $prompt .= "- Keep it under 30 seconds when spoken\n";
        $prompt .= "- Lead with impact, not just job title\n";
        $prompt .= "- Include a memorable hook or unique angle\n";
        $prompt .= "- End with something that invites conversation\n";
        $prompt .= "- Make it natural and conversational\n";

        $prompt .= "\nProvide the introduction as natural spoken text.";

        return $prompt;
    },

    'parser' => function($response_content) {
        return [
            'intro' => trim($response_content),
            'wordCount' => str_word_count(trim($response_content))
        ];
    },

    'options' => [
        'context' => [
            ['value' => 'networking', 'label' => 'Networking Event'],
            ['value' => 'conference', 'label' => 'Conference'],
            ['value' => 'interview', 'label' => 'Media Interview'],
            ['value' => 'meeting', 'label' => 'Business Meeting']
        ],
        'tone' => [
            ['value' => 'confident', 'label' => 'Confident'],
            ['value' => 'warm', 'label' => 'Warm & Approachable'],
            ['value' => 'authoritative', 'label' => 'Authoritative']
        ]
    ]
];
