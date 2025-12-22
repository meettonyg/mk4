<?php
/**
 * YouTube Description Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating YouTube video descriptions.
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
        'required' => ['videoTopic'],
        'defaults' => [
            'includeTimestamps' => true,
            'includeLinks' => true
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 1200
    ],

    'system_prompt' => 'You are a YouTube SEO expert who writes descriptions that drive discoverability and engagement. You understand YouTube\'s algorithm, keyword placement, and how to structure descriptions for maximum impact. Your descriptions are optimized for both search and viewer engagement.',

    'user_prompt' => function($params) {
        $videoTopic = $params['videoTopic'] ?? '';
        $keyPoints = $params['keyPoints'] ?? '';
        $targetKeywords = $params['targetKeywords'] ?? '';
        $channelName = $params['channelName'] ?? '';
        $includeTimestamps = $params['includeTimestamps'] ?? true;
        $includeLinks = $params['includeLinks'] ?? true;

        $prompt = "Write a YouTube video description for:\n\n";
        $prompt .= "VIDEO TOPIC: {$videoTopic}\n";

        if (!empty($keyPoints)) {
            $prompt .= "KEY POINTS COVERED: {$keyPoints}\n";
        }

        if (!empty($targetKeywords)) {
            $prompt .= "TARGET KEYWORDS: {$targetKeywords}\n";
        }

        if (!empty($channelName)) {
            $prompt .= "CHANNEL: {$channelName}\n";
        }

        $prompt .= "\nProvide a description with:\n";
        $prompt .= "1. HOOK (first 2-3 lines - visible before 'Show More')\n";
        $prompt .= "   - Include main keyword\n";
        $prompt .= "   - Create curiosity\n";

        if ($includeTimestamps) {
            $prompt .= "2. TIMESTAMPS (0:00 format)\n";
            $prompt .= "   - 5-8 chapter markers\n";
        }

        $prompt .= "3. FULL DESCRIPTION\n";
        $prompt .= "   - Summary of video value\n";
        $prompt .= "   - Keywords naturally integrated\n";

        if ($includeLinks) {
            $prompt .= "4. LINKS SECTION\n";
            $prompt .= "   - [Placeholder links for resources, social, etc.]\n";
        }

        $prompt .= "5. HASHTAGS (3-5 relevant hashtags)\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        return [
            'description' => trim($response_content),
            'charCount' => strlen(trim($response_content))
        ];
    },

    'options' => [
        'includeTimestamps' => [
            ['value' => true, 'label' => 'Yes'],
            ['value' => false, 'label' => 'No']
        ],
        'includeLinks' => [
            ['value' => true, 'label' => 'Yes'],
            ['value' => false, 'label' => 'No']
        ]
    ]
];
