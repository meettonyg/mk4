<?php
/**
 * Offers Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating service offers and packages.
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
        'required' => ['services'],
        'defaults' => [
            'count' => 3,
            'type' => 'packages'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 1500
    ],

    'system_prompt' => 'You are a business strategist who helps experts package and position their services for maximum value and clarity. You understand value-based pricing and how to structure offers that attract ideal clients while communicating clear outcomes.',

    'user_prompt' => function($params) {
        $services = $params['services'] ?? '';
        $authorityHook = $params['authorityHook'] ?? '';
        $audience = $params['audience'] ?? '';
        $count = $params['count'] ?? 3;
        $type = $params['type'] ?? 'packages';

        $prompt = "Create {$count} compelling {$type} based on:\n\n";
        $prompt .= "SERVICES/EXPERTISE: {$services}\n";

        if (!empty($authorityHook)) {
            $prompt .= "POSITIONING: {$authorityHook}\n";
        }

        if (!empty($audience)) {
            $prompt .= "TARGET AUDIENCE: {$audience}\n";
        }

        $prompt .= "\nRequirements:\n";
        $prompt .= "- Each offer should have a clear, compelling name\n";
        $prompt .= "- Focus on outcomes, not just deliverables\n";
        $prompt .= "- Include what's included in each offer\n";
        $prompt .= "- Make the value proposition crystal clear\n";
        $prompt .= "- Differentiate between offers (e.g., by depth, access, or scope)\n";

        $prompt .= "\nFormat each offer as:\n";
        $prompt .= "OFFER: [Name]\n";
        $prompt .= "IDEAL FOR: [Who this is perfect for]\n";
        $prompt .= "INCLUDES: [Bullet list of what's included]\n";
        $prompt .= "OUTCOME: [The transformation or result]\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $offers = [];
        $lines = explode("\n", trim($response_content));
        $current_offer = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^OFFER:\s*(.+)$/i', $line, $matches)) {
                if ($current_offer) {
                    $offers[] = $current_offer;
                }
                $current_offer = [
                    'name' => trim($matches[1]),
                    'idealFor' => '',
                    'includes' => [],
                    'outcome' => ''
                ];
            } elseif (preg_match('/^IDEAL FOR:\s*(.+)$/i', $line, $matches) && $current_offer) {
                $current_offer['idealFor'] = trim($matches[1]);
            } elseif (preg_match('/^INCLUDES:/i', $line)) {
                // Header, skip
            } elseif (preg_match('/^[-•]\s*(.+)$/', $line, $matches) && $current_offer) {
                $current_offer['includes'][] = trim($matches[1]);
            } elseif (preg_match('/^OUTCOME:\s*(.+)$/i', $line, $matches) && $current_offer) {
                $current_offer['outcome'] = trim($matches[1]);
            }
        }

        if ($current_offer) {
            $offers[] = $current_offer;
        }

        return $offers;
    },

    'options' => [
        'type' => [
            ['value' => 'packages', 'label' => 'Service Packages'],
            ['value' => 'programs', 'label' => 'Programs'],
            ['value' => 'products', 'label' => 'Digital Products']
        ]
    ]
];
