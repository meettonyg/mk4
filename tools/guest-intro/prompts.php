<?php
/**
 * Guest Intro Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating podcast/interview guest introductions.
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
        'required' => ['biography'],
        'defaults' => [
            'length' => 'medium',
            'tone' => 'professional'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 800
    ],

    'system_prompt' => 'You are an experienced podcast host who crafts compelling guest introductions that build anticipation and establish credibility. Your intros are engaging, highlight key achievements, and set up the conversation perfectly. You know how to make guests sound impressive without being over-the-top.',

    'user_prompt' => function($params) {
        $biography = $params['biography'] ?? '';
        $credentials = $params['credentials'] ?? '';
        $topic = $params['topic'] ?? '';
        $length = $params['length'] ?? 'medium';
        $tone = $params['tone'] ?? 'professional';

        $wordCount = $length === 'short' ? '50-75' : ($length === 'medium' ? '100-150' : '150-200');

        $prompt = "Write a podcast guest introduction ({$wordCount} words) for:\n\n";
        $prompt .= "BIO/BACKGROUND: {$biography}\n";

        if (!empty($credentials)) {
            $prompt .= "KEY CREDENTIALS: {$credentials}\n";
        }

        if (!empty($topic)) {
            $prompt .= "EPISODE TOPIC: {$topic}\n";
        }

        $prompt .= "\nTone: {$tone}\n";
        $prompt .= "\nRequirements:\n";
        $prompt .= "- Open with a hook that makes listeners want to stay\n";
        $prompt .= "- Highlight 2-3 key credentials or achievements\n";
        $prompt .= "- Build anticipation for what they'll share\n";
        $prompt .= "- End with a warm welcome\n";
        $prompt .= "- Write as spoken word, natural for a host to read\n";

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
        'length' => [
            ['value' => 'short', 'label' => 'Short (50-75 words)'],
            ['value' => 'medium', 'label' => 'Medium (100-150 words)'],
            ['value' => 'long', 'label' => 'Long (150-200 words)']
        ],
        'tone' => [
            ['value' => 'professional', 'label' => 'Professional'],
            ['value' => 'casual', 'label' => 'Casual'],
            ['value' => 'enthusiastic', 'label' => 'Enthusiastic']
        ]
    ]
];
