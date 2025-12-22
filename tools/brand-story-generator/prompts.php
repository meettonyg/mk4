<?php
/**
 * Brand Story Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating compelling brand origin stories.
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
        'required' => ['background'],
        'defaults' => [
            'length' => 'medium',
            'tone' => 'authentic'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 1500
    ],

    'system_prompt' => 'You are a storytelling expert who helps entrepreneurs and professionals craft compelling brand origin stories. Your stories follow classic narrative structure, create emotional connection, and position the person as the guide for their audience\'s journey. You understand how to weave challenges, transformation, and purpose into an authentic narrative.',

    'user_prompt' => function($params) {
        $background = $params['background'] ?? '';
        $challenge = $params['challenge'] ?? '';
        $transformation = $params['transformation'] ?? '';
        $mission = $params['mission'] ?? '';
        $length = $params['length'] ?? 'medium';
        $tone = $params['tone'] ?? 'authentic';

        $wordCount = $length === 'short' ? '150-250' : ($length === 'medium' ? '300-450' : '500-700');

        $prompt = "Create a brand origin story ({$wordCount} words) based on:\n\n";
        $prompt .= "BACKGROUND: {$background}\n";

        if (!empty($challenge)) {
            $prompt .= "KEY CHALLENGE/TURNING POINT: {$challenge}\n";
        }

        if (!empty($transformation)) {
            $prompt .= "TRANSFORMATION: {$transformation}\n";
        }

        if (!empty($mission)) {
            $prompt .= "CURRENT MISSION: {$mission}\n";
        }

        $prompt .= "\nTone: {$tone}\n";
        $prompt .= "\nRequirements:\n";
        $prompt .= "- Start with a compelling hook\n";
        $prompt .= "- Include the 'before' state (challenge/struggle)\n";
        $prompt .= "- Show the turning point or revelation\n";
        $prompt .= "- Describe the transformation\n";
        $prompt .= "- Connect to current mission and how they help others\n";
        $prompt .= "- Make it relatable and emotionally engaging\n";
        $prompt .= "- End with a sense of purpose\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        return [
            'story' => trim($response_content),
            'wordCount' => str_word_count(trim($response_content))
        ];
    },

    'options' => [
        'length' => [
            ['value' => 'short', 'label' => 'Short (150-250 words)'],
            ['value' => 'medium', 'label' => 'Medium (300-450 words)'],
            ['value' => 'long', 'label' => 'Long (500-700 words)']
        ],
        'tone' => [
            ['value' => 'authentic', 'label' => 'Authentic & Vulnerable'],
            ['value' => 'professional', 'label' => 'Professional'],
            ['value' => 'inspiring', 'label' => 'Inspiring']
        ]
    ]
];
