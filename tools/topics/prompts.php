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

        $prompt = "Generate {$count} podcast interview topic TITLES for this expert:\n\n";

        // Use authority hook as primary input (legacy approach)
        if (!empty($authorityHook)) {
            $prompt .= "Expert Authority: {$authorityHook}\n\n";
        } else {
            $prompt .= "Expert Authority: {$expertise}\n\n";
        }

        $prompt .= "CRITICAL REQUIREMENTS:\n";
        $prompt .= "- Each topic must be a SHORT title (8-15 words max)\n";
        $prompt .= "- NO descriptions, explanations, or elaborations\n";
        $prompt .= "- NO bullet points or sub-items\n";
        $prompt .= "- Topics should be intriguing and results-driven\n";
        $prompt .= "- Use specific frameworks, numbers, or contrarian angles\n\n";

        $prompt .= "FORMAT: Numbered list with ONLY the topic title on each line.\n\n";

        $prompt .= "GOOD examples (short, punchy titles):\n";
        $prompt .= "1. The 3-Step Framework for Landing High-Profile Podcast Interviews\n";
        $prompt .= "2. Why Most Experts Fail at Podcast Outreach\n";
        $prompt .= "3. Converting Podcast Appearances into High-Ticket Clients\n";
        $prompt .= "4. The 5 Mistakes SaaS Founders Make When Scaling\n";
        $prompt .= "5. Building a Team That Operates Without Your Daily Involvement\n\n";

        $prompt .= "BAD example (too long - DO NOT do this):\n";
        $prompt .= "1. The 90-Day Revenue Revolution: How SaaS Founders Can Achieve 40% Growth with Proven Strategies - This topic highlights the speaker's unique 90-day system...\n\n";

        $prompt .= "Generate {$count} SHORT topic titles now:";

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
