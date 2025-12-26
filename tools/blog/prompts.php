<?php
/**
 * Blog Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating blog posts.
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
            'length' => 'medium',
            'tone' => 'professional',
            'format' => 'how-to'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 3000
    ],

    'system_prompt' => 'You are an expert content writer who creates engaging, SEO-friendly blog posts. Your posts are well-structured, actionable, and written for busy professionals. You understand how to hook readers, provide genuine value, and include clear takeaways. Your writing is clear, concise, and free of fluff.',

    'user_prompt' => function($params) {
        $topic = $params['topic'] ?? '';
        $audience = $params['audience'] ?? '';
        $keyPoints = $params['keyPoints'] ?? '';
        $keywords = $params['keywords'] ?? '';
        $length = $params['length'] ?? 'medium';
        $tone = $params['tone'] ?? 'professional';
        $format = $params['format'] ?? 'how-to';

        $wordCount = $length === 'short' ? '500-700' : ($length === 'medium' ? '800-1200' : '1500-2000');

        $prompt = "Write a {$format} blog post ({$wordCount} words) about:\n\n";
        $prompt .= "TOPIC: {$topic}\n";

        if (!empty($audience)) {
            $prompt .= "TARGET AUDIENCE: {$audience}\n";
        }

        if (!empty($keyPoints)) {
            $prompt .= "KEY POINTS TO COVER: {$keyPoints}\n";
        }

        if (!empty($keywords)) {
            $prompt .= "SEO KEYWORDS TO INCLUDE: {$keywords}\n";
        }

        $prompt .= "\nTone: {$tone}\n";
        $prompt .= "\nRequirements:\n";
        $prompt .= "- Start with a compelling hook\n";
        $prompt .= "- Use clear subheadings (H2, H3)\n";
        $prompt .= "- Include actionable takeaways\n";
        $prompt .= "- Use bullet points where appropriate\n";
        $prompt .= "- End with a strong conclusion and call to action\n";
        $prompt .= "- Make it scannable for busy readers\n";
        $prompt .= "\nFormat with markdown for headings and lists.";

        return $prompt;
    },

    'parser' => function($response_content) {
        return [
            'content' => trim($response_content),
            'wordCount' => str_word_count(trim($response_content)),
            'format' => 'markdown'
        ];
    },

    'options' => [
        'length' => [
            ['value' => 'short', 'label' => 'Short (500-700 words)'],
            ['value' => 'medium', 'label' => 'Medium (800-1200 words)'],
            ['value' => 'long', 'label' => 'Long (1500-2000 words)']
        ],
        'format' => [
            ['value' => 'how-to', 'label' => 'How-To Guide'],
            ['value' => 'listicle', 'label' => 'Listicle'],
            ['value' => 'opinion', 'label' => 'Opinion/Thought Leadership'],
            ['value' => 'case-study', 'label' => 'Case Study']
        ],
        'tone' => [
            ['value' => 'professional', 'label' => 'Professional'],
            ['value' => 'conversational', 'label' => 'Conversational'],
            ['value' => 'authoritative', 'label' => 'Authoritative']
        ]
    ]
];
