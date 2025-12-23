<?php
/**
 * Interview Prep Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating interview preparation materials.
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
            'type' => 'podcast',
            'depth' => 'comprehensive'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 2000
    ],

    'system_prompt' => 'You are a media training coach who helps experts prepare for podcast and media interviews. You create comprehensive prep materials that help guests deliver memorable, value-packed interviews. You understand how to structure talking points, anticipate questions, and prepare sound bites.',

    'user_prompt' => function($params) {
        $topic = $params['topic'] ?? '';
        $expertise = $params['expertise'] ?? '';
        $keyMessages = $params['keyMessages'] ?? '';
        $showName = $params['showName'] ?? '';
        $type = $params['type'] ?? 'podcast';
        $depth = $params['depth'] ?? 'comprehensive';

        $prompt = "Create interview preparation materials for:\n\n";
        $prompt .= "TOPIC: {$topic}\n";

        if (!empty($expertise)) {
            $prompt .= "GUEST'S EXPERTISE: {$expertise}\n";
        }

        if (!empty($keyMessages)) {
            $prompt .= "KEY MESSAGES TO CONVEY: {$keyMessages}\n";
        }

        if (!empty($showName)) {
            $prompt .= "SHOW/INTERVIEW: {$showName}\n";
        }

        $prompt .= "\nInterview type: {$type}\n";
        $prompt .= "\nProvide:\n";
        $prompt .= "1. HOOK: Opening statement that grabs attention\n";
        $prompt .= "2. KEY TALKING POINTS: 3-5 main points to cover\n";
        $prompt .= "3. LIKELY QUESTIONS: 5 questions the host might ask with suggested answers\n";
        $prompt .= "4. SOUND BITES: 3 quotable statements ready to deliver\n";
        $prompt .= "5. STORIES: 2 short stories or examples to share\n";
        $prompt .= "6. CALL TO ACTION: What you want listeners to do\n";
        $prompt .= "7. BRIDGING PHRASES: 3 phrases to redirect tough questions\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $result = [
            'hook' => '',
            'talkingPoints' => [],
            'questions' => [],
            'soundBites' => [],
            'stories' => [],
            'callToAction' => '',
            'bridgingPhrases' => []
        ];

        $lines = explode("\n", trim($response_content));
        $current_section = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^(1\.|HOOK:)/i', $line)) {
                $current_section = 'hook';
                if (preg_match('/^(?:1\.|HOOK:)\s*(.+)$/i', $line, $matches)) {
                    $result['hook'] = trim($matches[1]);
                }
            } elseif (preg_match('/^(2\.|KEY TALKING POINTS:)/i', $line)) {
                $current_section = 'talkingPoints';
            } elseif (preg_match('/^(3\.|LIKELY QUESTIONS:)/i', $line)) {
                $current_section = 'questions';
            } elseif (preg_match('/^(4\.|SOUND BITES:)/i', $line)) {
                $current_section = 'soundBites';
            } elseif (preg_match('/^(5\.|STORIES:)/i', $line)) {
                $current_section = 'stories';
            } elseif (preg_match('/^(6\.|CALL TO ACTION:)/i', $line)) {
                $current_section = 'callToAction';
                if (preg_match('/^(?:6\.|CALL TO ACTION:)\s*(.+)$/i', $line, $matches)) {
                    $result['callToAction'] = trim($matches[1]);
                }
            } elseif (preg_match('/^(7\.|BRIDGING PHRASES:)/i', $line)) {
                $current_section = 'bridgingPhrases';
            } elseif (preg_match('/^[-•]\s*(.+)$/', $line, $matches)) {
                if ($current_section && is_array($result[$current_section] ?? null)) {
                    $result[$current_section][] = trim($matches[1]);
                }
            }
        }

        return $result;
    },

    'options' => [
        'type' => [
            ['value' => 'podcast', 'label' => 'Podcast Interview'],
            ['value' => 'media', 'label' => 'Media Interview'],
            ['value' => 'panel', 'label' => 'Panel Discussion']
        ],
        'depth' => [
            ['value' => 'quick', 'label' => 'Quick Prep'],
            ['value' => 'comprehensive', 'label' => 'Comprehensive']
        ]
    ]
];
