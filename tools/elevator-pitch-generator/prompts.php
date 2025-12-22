<?php
/**
 * Elevator Pitch Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating compelling elevator pitches.
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
        'required' => ['name'],
        'defaults' => [
            'duration' => '30',
            'tone' => 'professional'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 1000
    ],

    'system_prompt' => 'You are an expert pitch coach who helps professionals craft compelling elevator pitches. Your pitches are concise, memorable, and designed to spark curiosity. You understand the psychology of first impressions and how to communicate value quickly.',

    'user_prompt' => function($params) {
        $name = $params['name'] ?? '';
        $authorityHook = $params['authorityHook'] ?? '';
        $expertise = $params['expertise'] ?? '';
        $audience = $params['audience'] ?? '';
        $duration = $params['duration'] ?? '30';
        $tone = $params['tone'] ?? 'professional';

        $prompt = "Create a {$duration}-second elevator pitch for:\n\n";
        $prompt .= "NAME: {$name}\n";

        if (!empty($authorityHook)) {
            $prompt .= "WHAT THEY DO: {$authorityHook}\n";
        }

        if (!empty($expertise)) {
            $prompt .= "EXPERTISE: {$expertise}\n";
        }

        if (!empty($audience)) {
            $prompt .= "TARGET AUDIENCE: {$audience}\n";
        }

        $prompt .= "\nTone: {$tone}\n";
        $prompt .= "\nRequirements:\n";
        $prompt .= "- Start with a hook that grabs attention\n";
        $prompt .= "- Clearly state the value proposition\n";
        $prompt .= "- Include a memorable differentiator\n";
        $prompt .= "- End with a conversation opener or call to action\n";
        $prompt .= "- Keep it natural and conversational\n";
        $prompt .= "- Approximately " . ($duration == '30' ? '75' : ($duration == '60' ? '150' : '200')) . " words\n";

        $prompt .= "\nProvide the pitch as natural spoken text, ready to deliver.";

        return $prompt;
    },

    'parser' => function($response_content) {
        return [
            'pitch' => trim($response_content),
            'wordCount' => str_word_count(trim($response_content))
        ];
    },

    'options' => [
        'duration' => [
            ['value' => '30', 'label' => '30 seconds'],
            ['value' => '60', 'label' => '60 seconds'],
            ['value' => '90', 'label' => '90 seconds']
        ],
        'tone' => [
            ['value' => 'professional', 'label' => 'Professional'],
            ['value' => 'conversational', 'label' => 'Conversational'],
            ['value' => 'energetic', 'label' => 'Energetic']
        ]
    ]
];
