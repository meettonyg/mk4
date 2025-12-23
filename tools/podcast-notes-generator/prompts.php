<?php
/**
 * Podcast Show Notes Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating podcast show notes.
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
        'required' => ['episodeTopic'],
        'defaults' => [
            'includeTimestamps' => true,
            'format' => 'comprehensive'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 1500
    ],

    'system_prompt' => 'You are a podcast producer who creates compelling show notes that drive listens and improve SEO. Your show notes help listeners find specific content, understand episode value, and discover resources mentioned. You understand how to balance comprehensiveness with scanability.',

    'user_prompt' => function($params) {
        $episodeTopic = $params['episodeTopic'] ?? '';
        $guestName = $params['guestName'] ?? '';
        $guestBio = $params['guestBio'] ?? '';
        $keyPoints = $params['keyPoints'] ?? '';
        $resources = $params['resources'] ?? '';
        $includeTimestamps = $params['includeTimestamps'] ?? true;
        $format = $params['format'] ?? 'comprehensive';

        $prompt = "Write podcast show notes for:\n\n";
        $prompt .= "EPISODE TOPIC: {$episodeTopic}\n";

        if (!empty($guestName)) {
            $prompt .= "GUEST: {$guestName}\n";
        }

        if (!empty($guestBio)) {
            $prompt .= "GUEST BIO: {$guestBio}\n";
        }

        if (!empty($keyPoints)) {
            $prompt .= "KEY DISCUSSION POINTS: {$keyPoints}\n";
        }

        if (!empty($resources)) {
            $prompt .= "RESOURCES MENTIONED: {$resources}\n";
        }

        $prompt .= "\nFormat: {$format}\n";

        $prompt .= "\nProvide:\n";
        $prompt .= "1. EPISODE TITLE: Compelling, SEO-friendly title\n";
        $prompt .= "2. EPISODE SUMMARY: 2-3 paragraph description (150-200 words)\n";
        $prompt .= "3. KEY TAKEAWAYS: 3-5 bullet points\n";

        if ($includeTimestamps) {
            $prompt .= "4. TIMESTAMPS: Key moments with time markers (MM:SS format)\n";
        }

        $prompt .= "5. GUEST BIO: Formatted guest introduction\n";
        $prompt .= "6. RESOURCES: Formatted list of links/resources\n";
        $prompt .= "7. SUBSCRIBE CTA: Brief call to subscribe/review\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $result = [
            'title' => '',
            'summary' => '',
            'takeaways' => [],
            'timestamps' => [],
            'guestBio' => '',
            'resources' => [],
            'fullContent' => trim($response_content)
        ];

        $lines = explode("\n", trim($response_content));
        $currentSection = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^EPISODE TITLE:\s*(.+)$/i', $line, $matches)) {
                $result['title'] = trim($matches[1]);
                $currentSection = null;
            } elseif (preg_match('/^EPISODE SUMMARY:/i', $line)) {
                $currentSection = 'summary';
            } elseif (preg_match('/^KEY TAKEAWAYS:/i', $line)) {
                $currentSection = 'takeaways';
            } elseif (preg_match('/^TIMESTAMPS:/i', $line)) {
                $currentSection = 'timestamps';
            } elseif (preg_match('/^[-•]\s*(.+)$/', $line, $matches)) {
                if ($currentSection === 'takeaways') {
                    $result['takeaways'][] = trim($matches[1]);
                } elseif ($currentSection === 'timestamps') {
                    $result['timestamps'][] = trim($matches[1]);
                } elseif ($currentSection === 'resources') {
                    $result['resources'][] = trim($matches[1]);
                }
            }
        }

        return $result;
    },

    'options' => [
        'format' => [
            ['value' => 'brief', 'label' => 'Brief'],
            ['value' => 'comprehensive', 'label' => 'Comprehensive'],
            ['value' => 'seo-focused', 'label' => 'SEO-Focused']
        ],
        'includeTimestamps' => [
            ['value' => true, 'label' => 'Yes'],
            ['value' => false, 'label' => 'No']
        ]
    ]
];
