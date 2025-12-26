<?php
/**
 * Credibility Story Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating credibility-building stories.
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
        'required' => ['achievement'],
        'defaults' => [
            'style' => 'humble',
            'length' => 'medium'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 1200
    ],

    'system_prompt' => 'You are a personal branding expert who helps professionals share their achievements in a way that builds credibility without sounding boastful. Your stories focus on the journey, the lessons learned, and the value created for others. You understand how to let accomplishments speak for themselves through narrative.',

    'user_prompt' => function($params) {
        $achievement = $params['achievement'] ?? '';
        $context = $params['context'] ?? '';
        $impact = $params['impact'] ?? '';
        $style = $params['style'] ?? 'humble';
        $length = $params['length'] ?? 'medium';

        $wordCount = $length === 'short' ? '75-125' : ($length === 'medium' ? '150-250' : '300-400');

        $prompt = "Create a credibility story ({$wordCount} words) based on:\n\n";
        $prompt .= "ACHIEVEMENT: {$achievement}\n";

        if (!empty($context)) {
            $prompt .= "CONTEXT/CHALLENGE: {$context}\n";
        }

        if (!empty($impact)) {
            $prompt .= "IMPACT/RESULTS: {$impact}\n";
        }

        $prompt .= "\nStyle: {$style}\n";
        $prompt .= "\nRequirements:\n";
        $prompt .= "- Don't lead with the achievement; build to it\n";
        $prompt .= "- Focus on the problem solved or value created\n";
        $prompt .= "- Include specific details or metrics where relevant\n";
        $prompt .= "- Make it relatable, not just impressive\n";
        $prompt .= "- Show what you learned or how it changed you\n";
        $prompt .= "- Avoid sounding boastful or self-promotional\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        return [
            'story' => trim($response_content),
            'wordCount' => str_word_count(trim($response_content))
        ];
    },

    'options' => [
        'style' => [
            ['value' => 'humble', 'label' => 'Humble & Relatable'],
            ['value' => 'confident', 'label' => 'Confident'],
            ['value' => 'teaching', 'label' => 'Teaching Moment']
        ],
        'length' => [
            ['value' => 'short', 'label' => 'Short (75-125 words)'],
            ['value' => 'medium', 'label' => 'Medium (150-250 words)'],
            ['value' => 'long', 'label' => 'Long (300-400 words)']
        ]
    ]
];
