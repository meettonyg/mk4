<?php
/**
 * Content Repurposer - Prompts Configuration
 *
 * Self-contained prompt logic for repurposing content across formats.
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
        'required' => ['content', 'targetFormat'],
        'defaults' => [
            'preserveKeyPoints' => true
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 2000
    ],

    'system_prompt' => 'You are a content strategist who excels at repurposing content across different formats while maintaining the core message and value. You understand the unique requirements of each platform and format, and adapt content accordingly while preserving the essence.',

    'user_prompt' => function($params) {
        $content = $params['content'] ?? '';
        $targetFormat = $params['targetFormat'] ?? '';
        $platform = $params['platform'] ?? '';
        $preserveKeyPoints = $params['preserveKeyPoints'] ?? true;

        $prompt = "Repurpose the following content into: {$targetFormat}\n\n";
        $prompt .= "ORIGINAL CONTENT:\n{$content}\n\n";

        if (!empty($platform)) {
            $prompt .= "TARGET PLATFORM: {$platform}\n";
        }

        $prompt .= "\nRequirements:\n";

        switch ($targetFormat) {
            case 'linkedin-post':
                $prompt .= "- Keep under 3000 characters\n";
                $prompt .= "- Start with a strong hook line\n";
                $prompt .= "- Use line breaks for readability\n";
                $prompt .= "- End with a question or call to action\n";
                $prompt .= "- Include 3-5 relevant hashtags\n";
                break;
            case 'twitter-thread':
                $prompt .= "- Create a thread of 5-8 tweets\n";
                $prompt .= "- Each tweet under 280 characters\n";
                $prompt .= "- First tweet should hook readers\n";
                $prompt .= "- Number each tweet (1/X format)\n";
                $prompt .= "- Last tweet should have a CTA\n";
                break;
            case 'email-newsletter':
                $prompt .= "- Include a compelling subject line\n";
                $prompt .= "- Keep it scannable with short paragraphs\n";
                $prompt .= "- Include a clear CTA\n";
                $prompt .= "- Personal, conversational tone\n";
                break;
            case 'video-script':
                $prompt .= "- Include hook, body, and CTA sections\n";
                $prompt .= "- Write for spoken delivery\n";
                $prompt .= "- Keep sentences short and punchy\n";
                $prompt .= "- Include [VISUAL] cues where relevant\n";
                break;
            default:
                $prompt .= "- Adapt the content appropriately for the format\n";
                $prompt .= "- Maintain the core message and value\n";
        }

        if ($preserveKeyPoints) {
            $prompt .= "- Preserve the main insights and takeaways\n";
        }

        return $prompt;
    },

    'parser' => function($response_content) {
        return [
            'content' => trim($response_content),
            'wordCount' => str_word_count(trim($response_content))
        ];
    },

    'options' => [
        'targetFormat' => [
            ['value' => 'linkedin-post', 'label' => 'LinkedIn Post'],
            ['value' => 'twitter-thread', 'label' => 'Twitter/X Thread'],
            ['value' => 'email-newsletter', 'label' => 'Email Newsletter'],
            ['value' => 'video-script', 'label' => 'Video Script'],
            ['value' => 'instagram-carousel', 'label' => 'Instagram Carousel'],
            ['value' => 'blog-post', 'label' => 'Blog Post']
        ]
    ]
];
