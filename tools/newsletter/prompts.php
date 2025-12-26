<?php
/**
 * Newsletter Writer - Prompts Configuration
 *
 * Self-contained prompt logic for generating newsletter content.
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
            'format' => 'single-topic',
            'tone' => 'conversational'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 2000
    ],

    'system_prompt' => 'You are a newsletter expert who creates engaging, valuable content that readers look forward to receiving. You understand how to balance education with entertainment, and how to build connection through consistent, personality-driven content. Your newsletters feel like a message from a trusted friend.',

    'user_prompt' => function($params) {
        $topic = $params['topic'] ?? '';
        $format = $params['format'] ?? 'single-topic';
        $tone = $params['tone'] ?? 'conversational';
        $audience = $params['audience'] ?? '';
        $senderName = $params['senderName'] ?? '';
        $callToAction = $params['callToAction'] ?? '';

        $prompt = "Write a newsletter edition about:\n\n";
        $prompt .= "MAIN TOPIC: {$topic}\n";
        $prompt .= "FORMAT: {$format}\n";
        $prompt .= "TONE: {$tone}\n";

        if (!empty($audience)) {
            $prompt .= "AUDIENCE: {$audience}\n";
        }

        if (!empty($senderName)) {
            $prompt .= "FROM: {$senderName}\n";
        }

        if (!empty($callToAction)) {
            $prompt .= "CTA: {$callToAction}\n";
        }

        $prompt .= "\nProvide:\n";
        $prompt .= "- SUBJECT LINE: Compelling subject that drives opens\n";
        $prompt .= "- PREVIEW TEXT: Complementary preview snippet\n";
        $prompt .= "- NEWSLETTER BODY: Complete content\n";

        switch ($format) {
            case 'single-topic':
                $prompt .= "\nFormat: Deep dive on one topic with:\n";
                $prompt .= "- Personal opening hook\n";
                $prompt .= "- Main insight or lesson\n";
                $prompt .= "- Actionable takeaway\n";
                $prompt .= "- Personal sign-off\n";
                break;
            case 'curated':
                $prompt .= "\nFormat: Curated roundup with:\n";
                $prompt .= "- Brief personal intro\n";
                $prompt .= "- 3-5 curated items with commentary\n";
                $prompt .= "- One main recommendation\n";
                $prompt .= "- Personal sign-off\n";
                break;
            case 'story':
                $prompt .= "\nFormat: Story-driven with:\n";
                $prompt .= "- Hook that starts in the action\n";
                $prompt .= "- Personal story or anecdote\n";
                $prompt .= "- Lesson or insight\n";
                $prompt .= "- Application for reader\n";
                break;
        }

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
            } elseif (preg_match('/^NEWSLETTER BODY:/i', $line)) {
                $bodyStarted = true;
            } elseif ($bodyStarted) {
                $body[] = $line;
            }
        }

        $result['body'] = implode("\n", $body);

        if (empty($result['body'])) {
            $result['body'] = trim($response_content);
        }

        return $result;
    },

    'options' => [
        'format' => [
            ['value' => 'single-topic', 'label' => 'Single Topic Deep Dive'],
            ['value' => 'curated', 'label' => 'Curated Roundup'],
            ['value' => 'story', 'label' => 'Story-Driven']
        ],
        'tone' => [
            ['value' => 'conversational', 'label' => 'Conversational'],
            ['value' => 'professional', 'label' => 'Professional'],
            ['value' => 'witty', 'label' => 'Witty/Fun']
        ]
    ]
];
