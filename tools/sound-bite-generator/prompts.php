<?php
/**
 * Sound Bite Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating quotable sound bites.
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
        'required' => ['topic'],
        'defaults' => [
            'count' => 5,
            'style' => 'quotable'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.8,
        'max_tokens' => 1000
    ],

    'system_prompt' => 'You are a media trainer who helps thought leaders create memorable sound bites for interviews, podcasts, and speaking engagements. Your sound bites are concise, quotable, and designed to be shared. You understand what makes phrases stick in people\'s minds and get repeated.',

    'user_prompt' => function($params) {
        $topic = $params['topic'] ?? '';
        $expertise = $params['expertise'] ?? '';
        $authorityHook = $params['authorityHook'] ?? '';
        $count = $params['count'] ?? 5;
        $style = $params['style'] ?? 'quotable';

        $prompt = "Generate {$count} memorable sound bites about:\n\n";
        $prompt .= "TOPIC: {$topic}\n";

        if (!empty($expertise)) {
            $prompt .= "SPEAKER'S EXPERTISE: {$expertise}\n";
        }

        if (!empty($authorityHook)) {
            $prompt .= "SPEAKER'S POSITIONING: {$authorityHook}\n";
        }

        $prompt .= "\nStyle: {$style}\n";
        $prompt .= "\nRequirements:\n";
        $prompt .= "- Each sound bite should be 1-2 sentences max\n";
        $prompt .= "- Make them quotable and shareable\n";
        $prompt .= "- Use vivid language and strong imagery\n";
        $prompt .= "- Avoid jargon unless it's industry-specific\n";
        $prompt .= "- Each should standalone and make sense out of context\n";

        $prompt .= "\nFormat as a numbered list:\n";
        $prompt .= "1. [Sound bite]\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $soundBites = [];
        $lines = explode("\n", trim($response_content));

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^\d+[\.\)]\s*(.+)$/', $line, $matches)) {
                $soundBites[] = [
                    'text' => trim($matches[1]),
                    'selected' => false
                ];
            }
        }

        return $soundBites;
    },

    'options' => [
        'style' => [
            ['value' => 'quotable', 'label' => 'Quotable'],
            ['value' => 'provocative', 'label' => 'Provocative'],
            ['value' => 'inspiring', 'label' => 'Inspiring'],
            ['value' => 'contrarian', 'label' => 'Contrarian']
        ]
    ]
];
