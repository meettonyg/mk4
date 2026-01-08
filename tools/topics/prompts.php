<?php
/**
 * Topics Generator - Prompts Configuration
 *
 * Self-contained prompt logic for generating speaking topics and podcast ideas.
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
        'required' => ['expertise'],
        'defaults' => [
            'count' => 10,
            'includeDescriptions' => true
        ]
    ],

    'settings' => [
        'model' => 'gpt-4o-mini',
        'temperature' => 0.8,
        'max_tokens' => 1500
    ],

    'system_prompt' => 'You are an expert content strategist and speaking coach who helps thought leaders develop compelling topics for podcasts, keynotes, and workshops. You understand audience psychology and what makes topics engaging and shareable. Your suggestions are specific, actionable, and designed to position the speaker as an authority.',

    'user_prompt' => function($params) {
        $expertise = $params['expertise'] ?? '';
        $authorityHook = $params['authorityHook'] ?? '';
        $count = $params['count'] ?? 10;
        $includeDescriptions = $params['includeDescriptions'] ?? true;

        $prompt = "Generate exactly {$count} compelling speaking/podcast topics for someone with the following expertise:\n\n";
        $prompt .= "EXPERTISE: {$expertise}\n";

        if (!empty($authorityHook)) {
            $prompt .= "\nAUTHORITY HOOK: {$authorityHook}\n";
        }

        $prompt .= "\nRequirements:\n";
        $prompt .= "- Topics should be specific and actionable, not generic\n";
        $prompt .= "- Each topic title should be compelling and attention-grabbing (15 words max)\n";
        $prompt .= "- Topics should position the speaker as an authority\n";
        $prompt .= "- Mix of evergreen and timely topics\n";

        $prompt .= "\nIMPORTANT FORMATTING RULES:\n";
        $prompt .= "- Do NOT use markdown, asterisks, bold, or quotes in your response\n";
        $prompt .= "- Do NOT number the topics\n";
        $prompt .= "- Follow the EXACT format below for each topic\n\n";

        $prompt .= "Format each topic EXACTLY like this (use these exact labels):\n\n";
        $prompt .= "TOPIC: The Art of Scaling Without Burnout\n";
        $prompt .= "CATEGORY: Growth\n";
        $prompt .= "HOOK: Learn the counterintuitive strategies that let founders 10x their business while working less.\n";
        $prompt .= "KEY POINTS:\n";
        $prompt .= "- First key takeaway the audience will learn\n";
        $prompt .= "- Second key takeaway the audience will learn\n";
        $prompt .= "- Third key takeaway the audience will learn\n\n";

        $prompt .= "Use only these categories: Strategy, Mistakes, Case Study, Framework, Mindset, Revenue, Leadership, Hiring, Funding, Trends, Growth, Innovation, Marketing, Sales, Operations\n";
        $prompt .= "\nNow generate exactly {$count} topics following this exact format:";

        return $prompt;
    },

    'parser' => function($response_content) {
        $topics = [];
        $lines = explode("\n", trim($response_content));
        $current_topic = null;

        // Helper to clean up text - remove markdown, quotes, asterisks
        $cleanText = function($text) {
            $text = trim($text);
            // Remove markdown bold/italic
            $text = preg_replace('/\*+/', '', $text);
            // Remove leading/trailing quotes
            $text = preg_replace('/^["\'"]+|["\'"]+$/', '', $text);
            // Remove numbered prefixes like "1. " or "1) "
            $text = preg_replace('/^\d+[\.\)]\s*/', '', $text);
            return trim($text);
        };

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Match TOPIC: line (with or without number prefix)
            if (preg_match('/^(?:\d+[\.\)]\s*)?TOPIC:\s*(.+)$/i', $line, $matches)) {
                if ($current_topic && !empty($current_topic['title'])) {
                    $topics[] = $current_topic;
                }
                $current_topic = [
                    'title' => $cleanText($matches[1]),
                    'category' => '',
                    'hook' => '',
                    'keyPoints' => []
                ];
            } elseif (preg_match('/^CATEGORY:\s*(.+)$/i', $line, $matches) && $current_topic) {
                $current_topic['category'] = $cleanText($matches[1]);
            } elseif (preg_match('/^HOOK:\s*(.+)$/i', $line, $matches) && $current_topic) {
                $current_topic['hook'] = $cleanText($matches[1]);
            } elseif (preg_match('/^KEY\s*POINTS?:/i', $line)) {
                // Key points header, skip
            } elseif (preg_match('/^[-•*]\s*(.+)$/', $line, $matches) && $current_topic) {
                $current_topic['keyPoints'][] = $cleanText($matches[1]);
            }
        }

        if ($current_topic && !empty($current_topic['title'])) {
            $topics[] = $current_topic;
        }

        return $topics;
    },

    'options' => [
        'count' => [
            ['value' => 3, 'label' => '3 topics'],
            ['value' => 5, 'label' => '5 topics'],
            ['value' => 10, 'label' => '10 topics']
        ]
    ]
];
