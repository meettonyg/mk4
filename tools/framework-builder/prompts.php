<?php
/**
 * Framework Builder - Prompts Configuration
 *
 * Self-contained prompt logic for creating proprietary frameworks and methodologies.
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
        'required' => ['expertise', 'process'],
        'defaults' => [
            'type' => 'steps',
            'steps' => 5
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.8,
        'max_tokens' => 1500
    ],

    'system_prompt' => 'You are a thought leadership strategist who helps experts create proprietary frameworks and methodologies. Your frameworks are memorable, easy to explain, and position the creator as an authority. You understand how to package expertise into teachable, repeatable systems with compelling names.',

    'user_prompt' => function($params) {
        $expertise = $params['expertise'] ?? '';
        $process = $params['process'] ?? '';
        $outcome = $params['outcome'] ?? '';
        $type = $params['type'] ?? 'steps';
        $steps = $params['steps'] ?? 5;

        $prompt = "Create a proprietary framework based on:\n\n";
        $prompt .= "EXPERTISE AREA: {$expertise}\n";
        $prompt .= "CURRENT PROCESS/APPROACH: {$process}\n";

        if (!empty($outcome)) {
            $prompt .= "DESIRED OUTCOME FOR CLIENTS: {$outcome}\n";
        }

        $prompt .= "\nFramework type: {$type} ({$steps} elements)\n";
        $prompt .= "\nProvide:\n";
        $prompt .= "- FRAMEWORK NAME: A memorable, brandable name (consider acronyms, alliteration, or metaphors)\n";
        $prompt .= "- TAGLINE: One line that captures what it delivers\n";
        $prompt .= "- OVERVIEW: 2-3 sentences explaining the framework\n";
        $prompt .= "- STEPS/PILLARS: {$steps} distinct elements, each with:\n";
        $prompt .= "  - Name (memorable, action-oriented)\n";
        $prompt .= "  - Description (1-2 sentences)\n";
        $prompt .= "  - Key action or question\n";
        $prompt .= "- SIGNATURE PHRASE: A quotable line about the framework\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $result = [
            'name' => '',
            'tagline' => '',
            'overview' => '',
            'steps' => [],
            'signaturePhrase' => ''
        ];

        $lines = explode("\n", trim($response_content));
        $current_step = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^FRAMEWORK NAME:\s*(.+)$/i', $line, $matches)) {
                $result['name'] = trim($matches[1]);
            } elseif (preg_match('/^TAGLINE:\s*(.+)$/i', $line, $matches)) {
                $result['tagline'] = trim($matches[1]);
            } elseif (preg_match('/^OVERVIEW:\s*(.+)$/i', $line, $matches)) {
                $result['overview'] = trim($matches[1]);
            } elseif (preg_match('/^SIGNATURE PHRASE:\s*(.+)$/i', $line, $matches)) {
                $result['signaturePhrase'] = trim($matches[1]);
            } elseif (preg_match('/^\d+\.\s*(.+)$/i', $line, $matches)) {
                if ($current_step) {
                    $result['steps'][] = $current_step;
                }
                $current_step = ['name' => trim($matches[1]), 'description' => '', 'action' => ''];
            } elseif (preg_match('/^(Description|DESCRIPTION):\s*(.+)$/i', $line, $matches) && $current_step) {
                $current_step['description'] = trim($matches[2]);
            } elseif (preg_match('/^(Key Action|ACTION|QUESTION):\s*(.+)$/i', $line, $matches) && $current_step) {
                $current_step['action'] = trim($matches[2]);
            } elseif (preg_match('/^[-•]\s*(.+)$/', $line, $matches) && $current_step && empty($current_step['description'])) {
                $current_step['description'] = trim($matches[1]);
            }
        }

        if ($current_step) {
            $result['steps'][] = $current_step;
        }

        return $result;
    },

    'options' => [
        'type' => [
            ['value' => 'steps', 'label' => 'Step-by-Step Process'],
            ['value' => 'pillars', 'label' => 'Pillars/Foundations'],
            ['value' => 'phases', 'label' => 'Phases/Stages']
        ],
        'steps' => [
            ['value' => 3, 'label' => '3 elements'],
            ['value' => 4, 'label' => '4 elements'],
            ['value' => 5, 'label' => '5 elements'],
            ['value' => 7, 'label' => '7 elements']
        ]
    ]
];
