<?php
/**
 * Social Post Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating social media posts.
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
            'platform' => 'linkedin',
            'count' => 3,
            'tone' => 'professional'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.8,
        'max_tokens' => 1500
    ],

    'system_prompt' => 'You are a social media strategist who creates engaging posts optimized for each platform. You understand platform-specific best practices, character limits, and what drives engagement. Your posts are scroll-stopping, valuable, and encourage interaction.',

    'user_prompt' => function($params) {
        $topic = $params['topic'] ?? '';
        $platform = $params['platform'] ?? 'linkedin';
        $count = $params['count'] ?? 3;
        $tone = $params['tone'] ?? 'professional';
        $callToAction = $params['callToAction'] ?? '';

        $prompt = "Create {$count} {$platform} posts about:\n\n";
        $prompt .= "TOPIC: {$topic}\n";
        $prompt .= "TONE: {$tone}\n";

        if (!empty($callToAction)) {
            $prompt .= "DESIRED CTA: {$callToAction}\n";
        }

        $prompt .= "\nPlatform requirements:\n";

        switch ($platform) {
            case 'linkedin':
                $prompt .= "- Hook in first line (appears before 'see more')\n";
                $prompt .= "- Use line breaks for readability\n";
                $prompt .= "- 1300-2000 characters ideal\n";
                $prompt .= "- End with engagement question or CTA\n";
                $prompt .= "- Include 3-5 relevant hashtags\n";
                break;
            case 'twitter':
                $prompt .= "- Under 280 characters per tweet\n";
                $prompt .= "- Punchy and direct\n";
                $prompt .= "- Include 1-2 hashtags max\n";
                break;
            case 'instagram':
                $prompt .= "- Hook in first line\n";
                $prompt .= "- Use emoji strategically\n";
                $prompt .= "- Include CTA\n";
                $prompt .= "- 5-10 hashtags at end\n";
                break;
            case 'facebook':
                $prompt .= "- Conversational tone\n";
                $prompt .= "- Question or CTA encouraged\n";
                $prompt .= "- Medium length (100-250 words)\n";
                break;
        }

        $prompt .= "\nFormat each post clearly separated with '---' between them.";

        return $prompt;
    },

    'parser' => function($response_content) {
        $posts = [];
        $parts = preg_split('/---+/', $response_content);

        foreach ($parts as $part) {
            $part = trim($part);
            if (!empty($part)) {
                $posts[] = [
                    'content' => $part,
                    'charCount' => strlen($part)
                ];
            }
        }

        return $posts;
    },

    'options' => [
        'platform' => [
            ['value' => 'linkedin', 'label' => 'LinkedIn'],
            ['value' => 'twitter', 'label' => 'Twitter/X'],
            ['value' => 'instagram', 'label' => 'Instagram'],
            ['value' => 'facebook', 'label' => 'Facebook']
        ],
        'tone' => [
            ['value' => 'professional', 'label' => 'Professional'],
            ['value' => 'casual', 'label' => 'Casual'],
            ['value' => 'inspiring', 'label' => 'Inspiring'],
            ['value' => 'educational', 'label' => 'Educational']
        ],
        'count' => [
            ['value' => 1, 'label' => '1 post'],
            ['value' => 3, 'label' => '3 posts'],
            ['value' => 5, 'label' => '5 posts']
        ]
    ]
];
