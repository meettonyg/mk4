<?php
/**
 * Press Release Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating press releases.
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
        'required' => ['announcement'],
        'defaults' => [
            'type' => 'news'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.6,
        'max_tokens' => 1500
    ],

    'system_prompt' => 'You are a PR professional who writes compelling press releases that follow AP style and journalistic standards. Your press releases are newsworthy, well-structured, and designed to catch the attention of journalists and editors. You understand the inverted pyramid structure and how to write quotable statements.',

    'user_prompt' => function($params) {
        $announcement = $params['announcement'] ?? '';
        $company = $params['company'] ?? '';
        $spokesperson = $params['spokesperson'] ?? '';
        $contact = $params['contact'] ?? '';
        $date = $params['date'] ?? date('F j, Y');
        $location = $params['location'] ?? '';
        $type = $params['type'] ?? 'news';

        $prompt = "Write a press release for:\n\n";
        $prompt .= "ANNOUNCEMENT: {$announcement}\n";

        if (!empty($company)) {
            $prompt .= "COMPANY/ORGANIZATION: {$company}\n";
        }

        if (!empty($spokesperson)) {
            $prompt .= "SPOKESPERSON: {$spokesperson}\n";
        }

        if (!empty($location)) {
            $prompt .= "LOCATION: {$location}\n";
        }

        $prompt .= "DATE: {$date}\n";
        $prompt .= "TYPE: {$type}\n";

        $prompt .= "\nRequirements:\n";
        $prompt .= "- Start with 'FOR IMMEDIATE RELEASE'\n";
        $prompt .= "- Include a compelling headline and sub-headline\n";
        $prompt .= "- Begin with dateline (CITY, STATE -- Date)\n";
        $prompt .= "- Lead paragraph answers Who, What, When, Where, Why\n";
        $prompt .= "- Include 1-2 quotable quotes from spokesperson\n";
        $prompt .= "- Use inverted pyramid structure\n";
        $prompt .= "- Include boilerplate 'About' section\n";
        $prompt .= "- End with contact information placeholder\n";
        $prompt .= "- Keep between 400-600 words\n";
        $prompt .= "- Use third person, objective tone\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        return [
            'content' => trim($response_content),
            'wordCount' => str_word_count(trim($response_content)),
            'format' => 'text'
        ];
    },

    'options' => [
        'type' => [
            ['value' => 'news', 'label' => 'News Announcement'],
            ['value' => 'product', 'label' => 'Product Launch'],
            ['value' => 'event', 'label' => 'Event Announcement'],
            ['value' => 'partnership', 'label' => 'Partnership/Collaboration'],
            ['value' => 'award', 'label' => 'Award/Recognition'],
            ['value' => 'hire', 'label' => 'Executive Hire']
        ]
    ]
];
