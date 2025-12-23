<?php
/**
 * SEO Optimizer - Prompts Configuration
 *
 * Self-contained prompt logic for optimizing content for SEO.
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
        'required' => ['content'],
        'defaults' => [
            'outputType' => 'meta'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.6,
        'max_tokens' => 1200
    ],

    'system_prompt' => 'You are an SEO specialist who optimizes content for search engines while maintaining readability and user value. You understand keyword placement, meta descriptions, and content structure best practices. Your recommendations are practical and current with modern SEO standards.',

    'user_prompt' => function($params) {
        $content = $params['content'] ?? '';
        $targetKeyword = $params['targetKeyword'] ?? '';
        $secondaryKeywords = $params['secondaryKeywords'] ?? '';
        $outputType = $params['outputType'] ?? 'meta';

        $prompt = "Optimize the following content for SEO:\n\n";
        $prompt .= "CONTENT:\n{$content}\n\n";

        if (!empty($targetKeyword)) {
            $prompt .= "PRIMARY KEYWORD: {$targetKeyword}\n";
        }

        if (!empty($secondaryKeywords)) {
            $prompt .= "SECONDARY KEYWORDS: {$secondaryKeywords}\n";
        }

        $prompt .= "\nOutput requested: {$outputType}\n";

        switch ($outputType) {
            case 'meta':
                $prompt .= "\nProvide:\n";
                $prompt .= "- SEO TITLE: Compelling title under 60 characters with keyword\n";
                $prompt .= "- META DESCRIPTION: 150-160 characters, includes keyword, has CTA\n";
                $prompt .= "- URL SLUG: SEO-friendly URL slug\n";
                $prompt .= "- OG TITLE: Social share title (can be slightly longer)\n";
                $prompt .= "- OG DESCRIPTION: Social share description\n";
                break;
            case 'headings':
                $prompt .= "\nProvide:\n";
                $prompt .= "- Optimized H1 heading\n";
                $prompt .= "- Suggested H2 subheadings (5-7)\n";
                $prompt .= "- H3 options for each H2\n";
                break;
            case 'full':
                $prompt .= "\nProvide:\n";
                $prompt .= "- Complete SEO metadata (title, description, slug)\n";
                $prompt .= "- Optimized heading structure\n";
                $prompt .= "- Keyword density recommendation\n";
                $prompt .= "- Internal linking suggestions\n";
                $prompt .= "- Featured snippet optimization\n";
                break;
        }

        return $prompt;
    },

    'parser' => function($response_content) {
        $result = [];
        $lines = explode("\n", trim($response_content));

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^SEO TITLE:\s*(.+)$/i', $line, $matches)) {
                $result['seoTitle'] = trim($matches[1]);
            } elseif (preg_match('/^META DESCRIPTION:\s*(.+)$/i', $line, $matches)) {
                $result['metaDescription'] = trim($matches[1]);
            } elseif (preg_match('/^URL SLUG:\s*(.+)$/i', $line, $matches)) {
                $result['urlSlug'] = trim($matches[1]);
            } elseif (preg_match('/^OG TITLE:\s*(.+)$/i', $line, $matches)) {
                $result['ogTitle'] = trim($matches[1]);
            } elseif (preg_match('/^OG DESCRIPTION:\s*(.+)$/i', $line, $matches)) {
                $result['ogDescription'] = trim($matches[1]);
            }
        }

        // If structured parsing didn't work, return raw content
        if (empty($result)) {
            $result['content'] = trim($response_content);
        }

        return $result;
    },

    'options' => [
        'outputType' => [
            ['value' => 'meta', 'label' => 'Meta Tags Only'],
            ['value' => 'headings', 'label' => 'Heading Structure'],
            ['value' => 'full', 'label' => 'Full SEO Analysis']
        ]
    ]
];
