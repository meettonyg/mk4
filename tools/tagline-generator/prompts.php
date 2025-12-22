<?php
/**
 * Tagline Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating memorable taglines.
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
            'count' => 5,
            'style' => 'professional'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.9,
        'max_tokens' => 800
    ],

    'system_prompt' => 'You are a branding expert and copywriter who creates memorable, punchy taglines that capture the essence of a personal brand. Your taglines are concise, unique, and instantly communicate value. You understand what makes taglines stick in people\'s minds.',

    'user_prompt' => function($params) {
        $name = $params['name'] ?? '';
        $authorityHook = $params['authorityHook'] ?? '';
        $expertise = $params['expertise'] ?? '';
        $count = $params['count'] ?? 5;
        $style = $params['style'] ?? 'professional';

        $prompt = "Generate {$count} memorable taglines for:\n\n";
        $prompt .= "NAME: {$name}\n";

        if (!empty($authorityHook)) {
            $prompt .= "WHAT THEY DO: {$authorityHook}\n";
        }

        if (!empty($expertise)) {
            $prompt .= "EXPERTISE: {$expertise}\n";
        }

        $prompt .= "\nStyle: {$style}\n";
        $prompt .= "\nRequirements:\n";
        $prompt .= "- Keep each tagline under 10 words\n";
        $prompt .= "- Make them memorable and repeatable\n";
        $prompt .= "- Focus on transformation or unique value\n";
        $prompt .= "- Avoid clichés and generic phrases\n";
        $prompt .= "- Each should work standalone without explanation\n";

        $prompt .= "\nFormat as a numbered list:\n";
        $prompt .= "1. [Tagline]\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $taglines = [];
        $lines = explode("\n", trim($response_content));

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^\d+[\.\)]\s*(.+)$/', $line, $matches)) {
                $taglines[] = [
                    'text' => trim($matches[1]),
                    'selected' => false
                ];
            }
        }

        return $taglines;
    },

    'options' => [
        'style' => [
            ['value' => 'professional', 'label' => 'Professional'],
            ['value' => 'bold', 'label' => 'Bold & Confident'],
            ['value' => 'inspirational', 'label' => 'Inspirational'],
            ['value' => 'playful', 'label' => 'Playful']
        ]
    ]
];
