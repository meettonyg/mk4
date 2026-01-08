<?php
/**
 * Topics Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating speaking topics and podcast ideas.
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
        'required' => ['expertise'],
        'defaults' => [
            'count' => 10,
            'includeDescriptions' => true
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.8,
        'max_tokens' => 1500
    ],

    'system_prompt' => 'You are an expert content strategist and speaking coach who helps thought leaders develop compelling topics for podcasts, keynotes, and workshops. You understand audience psychology and what makes topics engaging and shareable. Your suggestions are specific, actionable, and designed to position the speaker as an authority.',

    'user_prompt' => function($params) {
        $expertise = $params['expertise'] ?? '';
        $authorityHook = $params['authorityHook'] ?? '';
        $count = $params['count'] ?? 10;

        $prompt = "Generate {$count} compelling podcast interview topics based on this expert's authority:\n\n";

        // Use authority hook as primary input (legacy approach)
        if (!empty($authorityHook)) {
            $prompt .= "Expert Authority: {$authorityHook}\n\n";
        } else {
            $prompt .= "Expert Authority: {$expertise}\n\n";
        }

        $prompt .= "Requirements:\n";
        $prompt .= "- Topics must directly relate to the expert's authority area\n";
        $prompt .= "- Make topics intriguing and results-driven to attract podcast hosts\n";
        $prompt .= "- Use specific strategies, frameworks, or proven methods\n";
        $prompt .= "- Each topic should be a compelling title (not a full description)\n";
        $prompt .= "- Topics should position the speaker as the go-to expert\n\n";

        $prompt .= "Format: Return as a numbered list (1., 2., 3., etc.) with just the topic titles.\n";
        $prompt .= "Do not include descriptions, categories, or bullet points - just the topic titles.\n\n";

        $prompt .= "Example format:\n";
        $prompt .= "1. The 3-Step Framework for Landing High-Profile Podcast Interviews\n";
        $prompt .= "2. Why Most Experts Fail at Podcast Outreach (And How to Fix It)\n";
        $prompt .= "3. Converting Podcast Appearances into High-Ticket Clients\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $topics = [];
        $lines = explode("\n", trim($response_content));

        // Helper to clean up text
        $cleanText = function($text) {
            $text = trim($text);
            // Remove markdown bold/italic
            $text = preg_replace('/\*+/', '', $text);
            // Remove leading/trailing quotes
            $text = preg_replace('/^["\'"]+|["\'"]+$/', '', $text);
            return trim($text);
        };

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Match numbered format: "1.", "1)", "1:" etc.
            if (preg_match('/^\d+[\.\)\:]\s*(.+)/', $line, $matches)) {
                $title = $cleanText($matches[1]);
                if (!empty($title)) {
                    $topics[] = [
                        'title' => $title,
                        'category' => 'Topic',
                        'hook' => '',
                        'keyPoints' => []
                    ];
                }
            }
        }

        return $topics;
    },

    'options' => [
        'count' => [
            ['value' => 3, 'label' => '3 topics'],
            ['value' => 5, 'label' => '5 topics'],
            ['value' => 10, 'label' => '10 topics']
        ]
    ]
];
