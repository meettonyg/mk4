<?php
/**
 * Persona Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating ideal client personas.
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
            'count' => 1,
            'depth' => 'detailed'
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 1500
    ],

    'system_prompt' => 'You are a marketing strategist who creates detailed, realistic ideal client personas. Your personas go beyond demographics to capture psychographics, pain points, aspirations, and buying behaviors. You understand what makes personas actionable for marketing and sales.',

    'user_prompt' => function($params) {
        $services = $params['services'] ?? '';
        $authorityHook = $params['authorityHook'] ?? '';
        $industry = $params['industry'] ?? '';
        $count = $params['count'] ?? 1;
        $depth = $params['depth'] ?? 'detailed';

        $prompt = "Create {$count} ideal client persona(s) for:\n\n";
        $prompt .= "SERVICES/OFFERINGS: {$services}\n";

        if (!empty($authorityHook)) {
            $prompt .= "POSITIONING: {$authorityHook}\n";
        }

        if (!empty($industry)) {
            $prompt .= "INDUSTRY: {$industry}\n";
        }

        $prompt .= "\nDepth: {$depth}\n";
        $prompt .= "\nFor each persona, include:\n";
        $prompt .= "- NAME: A realistic name\n";
        $prompt .= "- TITLE/ROLE: Their professional role\n";
        $prompt .= "- DEMOGRAPHICS: Age, location, income level\n";
        $prompt .= "- PAIN POINTS: 3-5 key challenges they face\n";
        $prompt .= "- GOALS: What they're trying to achieve\n";
        $prompt .= "- OBJECTIONS: What might stop them from buying\n";
        $prompt .= "- TRIGGER: What event would make them seek your service\n";
        $prompt .= "- WHERE THEY ARE: Where to find them online/offline\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $personas = [];
        $lines = explode("\n", trim($response_content));
        $current_persona = null;
        $current_field = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^NAME:\s*(.+)$/i', $line, $matches)) {
                if ($current_persona) {
                    $personas[] = $current_persona;
                }
                $current_persona = ['name' => trim($matches[1])];
                $current_field = null;
            } elseif (preg_match('/^(TITLE|ROLE|TITLE\/ROLE):\s*(.+)$/i', $line, $matches) && $current_persona) {
                $current_persona['title'] = trim($matches[2]);
            } elseif (preg_match('/^DEMOGRAPHICS:\s*(.+)$/i', $line, $matches) && $current_persona) {
                $current_persona['demographics'] = trim($matches[1]);
            } elseif (preg_match('/^PAIN POINTS:/i', $line)) {
                $current_field = 'painPoints';
                $current_persona['painPoints'] = [];
            } elseif (preg_match('/^GOALS:/i', $line)) {
                $current_field = 'goals';
                $current_persona['goals'] = [];
            } elseif (preg_match('/^OBJECTIONS:/i', $line)) {
                $current_field = 'objections';
                $current_persona['objections'] = [];
            } elseif (preg_match('/^TRIGGER:\s*(.+)$/i', $line, $matches) && $current_persona) {
                $current_persona['trigger'] = trim($matches[1]);
                $current_field = null;
            } elseif (preg_match('/^WHERE THEY ARE:\s*(.+)$/i', $line, $matches) && $current_persona) {
                $current_persona['whereTheyAre'] = trim($matches[1]);
                $current_field = null;
            } elseif (preg_match('/^[-•]\s*(.+)$/', $line, $matches) && $current_persona && $current_field) {
                $current_persona[$current_field][] = trim($matches[1]);
            }
        }

        if ($current_persona) {
            $personas[] = $current_persona;
        }

        return $personas;
    },

    'options' => [
        'depth' => [
            ['value' => 'brief', 'label' => 'Brief Overview'],
            ['value' => 'detailed', 'label' => 'Detailed Profile']
        ]
    ]
];
