<?php
/**
 * Signature Story Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating signature stories for speaking.
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
        'required' => ['experience'],
        'defaults' => [
            'duration' => '3-5 minutes',
            'purpose' => 'keynote'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 2000
    ],

    'system_prompt' => 'You are a speaking coach who helps thought leaders craft signature stories - compelling narratives they can use repeatedly in keynotes, interviews, and presentations. Your stories have clear structure, emotional beats, and always connect to a larger message or lesson. You understand the power of specific details and sensory language.',

    'user_prompt' => function($params) {
        $experience = $params['experience'] ?? '';
        $lesson = $params['lesson'] ?? '';
        $audience = $params['audience'] ?? '';
        $duration = $params['duration'] ?? '3-5 minutes';
        $purpose = $params['purpose'] ?? 'keynote';

        $prompt = "Create a signature story ({$duration} when delivered) for:\n\n";
        $prompt .= "THE EXPERIENCE/MOMENT: {$experience}\n";

        if (!empty($lesson)) {
            $prompt .= "THE LESSON/MESSAGE: {$lesson}\n";
        }

        if (!empty($audience)) {
            $prompt .= "INTENDED AUDIENCE: {$audience}\n";
        }

        $prompt .= "\nPurpose: {$purpose}\n";
        $prompt .= "\nRequirements:\n";
        $prompt .= "- Open with a hook that drops the audience into the moment\n";
        $prompt .= "- Use specific, sensory details to make it vivid\n";
        $prompt .= "- Include dialogue where appropriate\n";
        $prompt .= "- Build tension or conflict\n";
        $prompt .= "- Show the realization or turning point\n";
        $prompt .= "- Connect to the universal lesson\n";
        $prompt .= "- End with a memorable line or callback\n";
        $prompt .= "\nWrite as spoken narrative, ready to deliver on stage.";

        return $prompt;
    },

    'parser' => function($response_content) {
        return [
            'story' => trim($response_content),
            'wordCount' => str_word_count(trim($response_content))
        ];
    },

    'options' => [
        'duration' => [
            ['value' => '1-2 minutes', 'label' => '1-2 minutes'],
            ['value' => '3-5 minutes', 'label' => '3-5 minutes'],
            ['value' => '5-7 minutes', 'label' => '5-7 minutes']
        ],
        'purpose' => [
            ['value' => 'keynote', 'label' => 'Keynote Opening'],
            ['value' => 'podcast', 'label' => 'Podcast Interview'],
            ['value' => 'teaching', 'label' => 'Teaching Moment']
        ]
    ]
];
