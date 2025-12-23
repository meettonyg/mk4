<?php
/**
 * Authority Hook Builder - Prompts Configuration
 *
 * Self-contained prompt logic for generating authority positioning statements.
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
        'required' => ['who', 'what'],
        'defaults' => [
            'count' => 3
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.7,
        'max_tokens' => 1000
    ],

    'system_prompt' => 'You are a positioning strategist who helps experts craft compelling authority hooks - concise statements that instantly communicate who they help and the transformation they provide. Your authority hooks follow the format "I help [WHO] [DO WHAT] so they can [RESULT]" but with variations that feel natural and powerful.',

    'user_prompt' => function($params) {
        $who = $params['who'] ?? '';
        $what = $params['what'] ?? '';
        $result = $params['result'] ?? '';
        $credentials = $params['credentials'] ?? '';
        $count = $params['count'] ?? 3;

        $prompt = "Create {$count} authority hook variations for:\n\n";
        $prompt .= "WHO THEY HELP: {$who}\n";
        $prompt .= "WHAT THEY DO: {$what}\n";

        if (!empty($result)) {
            $prompt .= "RESULT/TRANSFORMATION: {$result}\n";
        }

        if (!empty($credentials)) {
            $prompt .= "CREDENTIALS/PROOF: {$credentials}\n";
        }

        $prompt .= "\nRequirements:\n";
        $prompt .= "- Each hook should be 1-2 sentences max\n";
        $prompt .= "- Lead with value, not credentials\n";
        $prompt .= "- Be specific about the audience and outcome\n";
        $prompt .= "- Avoid jargon and buzzwords\n";
        $prompt .= "- Each variation should have a slightly different angle\n";

        $prompt .= "\nFormat each as:\n";
        $prompt .= "HOOK: [The authority hook statement]\n";
        $prompt .= "ANGLE: [Brief note on what makes this version unique]\n";

        return $prompt;
    },

    'parser' => function($response_content) {
        $hooks = [];
        $lines = explode("\n", trim($response_content));
        $current_hook = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^HOOK:\s*(.+)$/i', $line, $matches)) {
                if ($current_hook) {
                    $hooks[] = $current_hook;
                }
                $current_hook = [
                    'text' => trim($matches[1]),
                    'angle' => '',
                    'selected' => false
                ];
            } elseif (preg_match('/^ANGLE:\s*(.+)$/i', $line, $matches) && $current_hook) {
                $current_hook['angle'] = trim($matches[1]);
            }
        }

        if ($current_hook) {
            $hooks[] = $current_hook;
        }

        return $hooks;
    },

    'options' => []
];
