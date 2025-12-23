<?php
/**
 * Questions Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating interview questions.
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
        'required' => ['topics'],
        'defaults' => [
            'count' => 5,
            'style' => 'conversational'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 1200
    ],

    'system_prompt' => 'You are an experienced podcast host and interviewer who crafts thought-provoking questions that bring out the best in guests. Your questions are designed to elicit engaging stories, unique insights, and valuable takeaways for audiences. You understand how to structure conversations for maximum impact.',

    'user_prompt' => function($params) {
        $topics = $params['topics'] ?? '';
        $authorityHook = $params['authorityHook'] ?? '';
        $count = $params['count'] ?? 5;
        $style = $params['style'] ?? 'conversational';

        $prompt = "Generate {$count} compelling interview questions based on:\n\n";
        $prompt .= "TOPICS/EXPERTISE: {$topics}\n";

        if (!empty($authorityHook)) {
            $prompt .= "\nGUEST POSITIONING: {$authorityHook}\n";
        }

        $prompt .= "\nQuestion style: {$style}\n";
        $prompt .= "\nRequirements:\n";
        $prompt .= "- Questions should be open-ended and invite storytelling\n";
        $prompt .= "- Include a mix of 'what', 'how', and 'why' questions\n";
        $prompt .= "- Avoid yes/no questions\n";
        $prompt .= "- Questions should reveal the guest's expertise naturally\n";
        $prompt .= "- Include at least one unexpected or unique angle\n";

        $prompt .= "\nFormat as a numbered list:\n";
        $prompt .= "1. [Question]\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $questions = [];
        $lines = explode("\n", trim($response_content));

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Match numbered questions
            if (preg_match('/^\d+[\.\)]\s*(.+)$/', $line, $matches)) {
                $questions[] = [
                    'question' => trim($matches[1]),
                    'selected' => false
                ];
            }
        }

        return $questions;
    },

    'options' => [
        'style' => [
            ['value' => 'conversational', 'label' => 'Conversational'],
            ['value' => 'deep-dive', 'label' => 'Deep Dive'],
            ['value' => 'rapid-fire', 'label' => 'Rapid Fire']
        ],
        'count' => [
            ['value' => 5, 'label' => '5 questions'],
            ['value' => 10, 'label' => '10 questions'],
            ['value' => 15, 'label' => '15 questions']
        ]
    ]
];
