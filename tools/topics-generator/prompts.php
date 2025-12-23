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
            'count' => 5,
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
        $count = $params['count'] ?? 5;
        $includeDescriptions = $params['includeDescriptions'] ?? true;

        $prompt = "Generate {$count} compelling speaking/podcast topics for someone with the following expertise:\n\n";
        $prompt .= "EXPERTISE: {$expertise}\n";

        if (!empty($authorityHook)) {
            $prompt .= "\nAUTHORITY HOOK: {$authorityHook}\n";
        }

        $prompt .= "\nRequirements:\n";
        $prompt .= "- Topics should be specific and actionable, not generic\n";
        $prompt .= "- Each topic should have a compelling hook that grabs attention\n";
        $prompt .= "- Topics should position the speaker as an authority\n";
        $prompt .= "- Mix of evergreen and timely topics\n";

        if ($includeDescriptions) {
            $prompt .= "\nFormat each topic as:\n";
            $prompt .= "TOPIC: [Compelling title]\n";
            $prompt .= "HOOK: [One sentence that makes people want to learn more]\n";
            $prompt .= "KEY POINTS: [3 bullet points of what will be covered]\n";
        } else {
            $prompt .= "\nProvide just the topic titles, one per line.";
        }

        return $prompt;
    },

    'parser' => function($response_content) {
        $topics = [];
        $lines = explode("\n", trim($response_content));
        $current_topic = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^TOPIC:\s*(.+)$/i', $line, $matches)) {
                if ($current_topic) {
                    $topics[] = $current_topic;
                }
                $current_topic = [
                    'title' => trim($matches[1]),
                    'hook' => '',
                    'keyPoints' => []
                ];
            } elseif (preg_match('/^HOOK:\s*(.+)$/i', $line, $matches) && $current_topic) {
                $current_topic['hook'] = trim($matches[1]);
            } elseif (preg_match('/^KEY POINTS:/i', $line)) {
                // Key points header, skip
            } elseif (preg_match('/^[-•]\s*(.+)$/', $line, $matches) && $current_topic) {
                $current_topic['keyPoints'][] = trim($matches[1]);
            } elseif ($current_topic === null && !empty($line)) {
                // Simple title-only format
                $topics[] = ['title' => $line, 'hook' => '', 'keyPoints' => []];
            }
        }

        if ($current_topic) {
            $topics[] = $current_topic;
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
