<?php
/**
 * Email Writer - Prompts Configuration
 *
 * Self-contained prompt logic for generating email copy.
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
        'required' => ['purpose'],
        'defaults' => [
            'type' => 'promotional',
            'tone' => 'friendly'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 1200
    ],

    'system_prompt' => 'You are an email marketing expert who writes compelling emails that get opened, read, and acted upon. You understand email best practices, subject line psychology, and how to drive conversions while maintaining authenticity. Your emails are personal, valuable, and action-oriented.',

    'user_prompt' => function($params) {
        $purpose = $params['purpose'] ?? '';
        $type = $params['type'] ?? 'promotional';
        $audience = $params['audience'] ?? '';
        $callToAction = $params['callToAction'] ?? '';
        $tone = $params['tone'] ?? 'friendly';
        $senderName = $params['senderName'] ?? '';

        $prompt = "Write a {$type} email for:\n\n";
        $prompt .= "PURPOSE: {$purpose}\n";

        if (!empty($audience)) {
            $prompt .= "AUDIENCE: {$audience}\n";
        }

        if (!empty($callToAction)) {
            $prompt .= "DESIRED ACTION: {$callToAction}\n";
        }

        if (!empty($senderName)) {
            $prompt .= "SENDER: {$senderName}\n";
        }

        $prompt .= "TONE: {$tone}\n";

        $prompt .= "\nProvide:\n";
        $prompt .= "- SUBJECT LINE: Compelling, under 50 characters\n";
        $prompt .= "- PREVIEW TEXT: 40-90 characters that complements subject\n";
        $prompt .= "- EMAIL BODY: The complete email\n";
        $prompt .= "\nRequirements:\n";
        $prompt .= "- Keep paragraphs short (2-3 sentences max)\n";
        $prompt .= "- Include a clear, single CTA\n";
        $prompt .= "- Write conversationally\n";
        $prompt .= "- Make it scannable\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $result = [
            'subjectLine' => '',
            'previewText' => '',
            'body' => ''
        ];

        $lines = explode("\n", trim($response_content));
        $bodyStarted = false;
        $body = [];

        foreach ($lines as $line) {
            $line = trim($line);

            if (preg_match('/^SUBJECT LINE:\s*(.+)$/i', $line, $matches)) {
                $result['subjectLine'] = trim($matches[1]);
            } elseif (preg_match('/^PREVIEW TEXT:\s*(.+)$/i', $line, $matches)) {
                $result['previewText'] = trim($matches[1]);
            } elseif (preg_match('/^EMAIL BODY:/i', $line)) {
                $bodyStarted = true;
            } elseif ($bodyStarted) {
                $body[] = $line;
            }
        }

        $result['body'] = implode("\n", $body);

        // If structured parsing didn't work well, try to extract
        if (empty($result['body'])) {
            $result['body'] = trim($response_content);
        }

        return $result;
    },

    'options' => [
        'type' => [
            ['value' => 'promotional', 'label' => 'Promotional'],
            ['value' => 'welcome', 'label' => 'Welcome Email'],
            ['value' => 'follow-up', 'label' => 'Follow-Up'],
            ['value' => 'announcement', 'label' => 'Announcement'],
            ['value' => 'nurture', 'label' => 'Nurture/Value']
        ],
        'tone' => [
            ['value' => 'friendly', 'label' => 'Friendly'],
            ['value' => 'professional', 'label' => 'Professional'],
            ['value' => 'urgent', 'label' => 'Urgent'],
            ['value' => 'casual', 'label' => 'Casual']
        ]
    ]
];
