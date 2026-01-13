<?php
/**
 * GMKB AI Service - Multi-Provider API Integration
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Handles AI API interactions for content generation with support for
 * OpenAI, Google Gemini, and Anthropic Claude.
 *
 * @package GMKB
 * @subpackage AI
 * @version 2.0.0
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Load AI Config
require_once dirname(__FILE__) . '/class-gmkb-ai-config.php';

class GMKB_AI_Service {

    /**
     * Current provider (openai, gemini, anthropic)
     * @var string
     */
    private $provider;

    /**
     * API key for current provider
     * @var string
     */
    private $api_key;

    /**
     * Current model to use
     * @var string
     */
    private $model;

    /**
     * Request timeout in seconds
     * @var int
     */
    private $timeout = 60;

    /**
     * AI Config instance
     * @var GMKB_AI_Config
     */
    private $config;

    /**
     * Provider API endpoints
     * @var array
     */
    private static $endpoints = [
        'openai' => 'https://api.openai.com/v1/chat/completions',
        'gemini' => 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
        'anthropic' => 'https://api.anthropic.com/v1/messages',
    ];

    /**
     * Constructor
     */
    public function __construct() {
        // Load settings from admin or fall back to legacy
        $this->provider = get_option('gmkb_ai_provider', 'openai');
        $this->model = get_option('gmkb_ai_model', 'gpt-4o-mini');
        $this->api_key = $this->get_api_key_for_provider($this->provider);
        $this->config = new GMKB_AI_Config();

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Service: Initialized');
            error_log('  - Provider: ' . $this->provider);
            error_log('  - Model: ' . $this->model);
            error_log('  - API Key configured: ' . (!empty($this->api_key) ? 'YES' : 'NO'));
        }
    }

    /**
     * Get API key for a specific provider
     *
     * @param string $provider Provider ID
     * @return string API key
     */
    private function get_api_key_for_provider(string $provider): string {
        // Check legacy constant for OpenAI
        if ($provider === 'openai' && defined('OPENAI_API_KEY') && !empty(OPENAI_API_KEY)) {
            return OPENAI_API_KEY;
        }

        $option_map = [
            'openai' => 'gmkb_openai_api_key',
            'gemini' => 'gmkb_gemini_api_key',
            'anthropic' => 'gmkb_anthropic_api_key',
        ];

        return get_option($option_map[$provider] ?? '', '');
    }

    /**
     * Make API call to the configured provider
     *
     * @param string $system_prompt The system prompt
     * @param string $user_prompt The user prompt
     * @param array $settings Optional settings (model, temperature, max_tokens)
     * @return array Success/error response with raw content
     */
    public function call_api($system_prompt, $user_prompt, $settings = array()) {
        // Validate API key
        if (empty($this->api_key)) {
            error_log('GMKB AI Service: Missing API key for ' . $this->provider);
            return array(
                'success' => false,
                'message' => 'AI service not configured. Please set up your API key in AI Settings.'
            );
        }

        // Extract settings with defaults
        $model = isset($settings['model']) ? $settings['model'] : $this->model;
        $temperature = isset($settings['temperature']) ? floatval($settings['temperature']) : 0.7;
        $max_tokens = isset($settings['max_tokens']) ? intval($settings['max_tokens']) : 1000;
        $timeout = isset($settings['timeout']) ? intval($settings['timeout']) : $this->timeout;

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Service: Making API call');
            error_log('  - Provider: ' . $this->provider);
            error_log('  - Model: ' . $model);
        }

        // Route to provider-specific method
        switch ($this->provider) {
            case 'gemini':
                return $this->call_gemini_api($system_prompt, $user_prompt, $model, $temperature, $max_tokens, $timeout);
            case 'anthropic':
                return $this->call_anthropic_api($system_prompt, $user_prompt, $model, $temperature, $max_tokens, $timeout);
            case 'openai':
            default:
                return $this->call_openai_api($system_prompt, $user_prompt, $model, $temperature, $max_tokens, $timeout);
        }
    }

    /**
     * Call OpenAI API
     */
    private function call_openai_api($system_prompt, $user_prompt, $model, $temperature, $max_tokens, $timeout) {
        $body = wp_json_encode([
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => $system_prompt],
                ['role' => 'user', 'content' => $user_prompt]
            ],
            'temperature' => $temperature,
            'max_tokens' => $max_tokens
        ]);

        $response = wp_remote_post(self::$endpoints['openai'], [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json',
            ],
            'body' => $body,
            'timeout' => $timeout,
        ]);

        if (is_wp_error($response)) {
            return ['success' => false, 'message' => 'API request failed: ' . $response->get_error_message()];
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code !== 200) {
            $error = $body['error']['message'] ?? 'OpenAI error (code: ' . $code . ')';
            return ['success' => false, 'message' => $error];
        }

        if (empty($body['choices'][0]['message']['content'])) {
            return ['success' => false, 'message' => 'No content received from OpenAI.'];
        }

        return [
            'success' => true,
            'content' => $body['choices'][0]['message']['content'],
            'tokens_used' => $body['usage']['total_tokens'] ?? null,
            'model' => $model
        ];
    }

    /**
     * Call Google Gemini API
     */
    private function call_gemini_api($system_prompt, $user_prompt, $model, $temperature, $max_tokens, $timeout) {
        $url = str_replace('{model}', $model, self::$endpoints['gemini']) . '?key=' . $this->api_key;

        // Gemini combines system + user into a single prompt
        $combined_prompt = $system_prompt . "\n\n" . $user_prompt;

        $body = wp_json_encode([
            'contents' => [
                ['parts' => [['text' => $combined_prompt]]]
            ],
            'generationConfig' => [
                'temperature' => $temperature,
                'maxOutputTokens' => $max_tokens,
            ]
        ]);

        $response = wp_remote_post($url, [
            'headers' => ['Content-Type' => 'application/json'],
            'body' => $body,
            'timeout' => $timeout,
        ]);

        if (is_wp_error($response)) {
            return ['success' => false, 'message' => 'API request failed: ' . $response->get_error_message()];
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code !== 200) {
            $error = $body['error']['message'] ?? 'Gemini error (code: ' . $code . ')';
            return ['success' => false, 'message' => $error];
        }

        $content = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;

        if (empty($content)) {
            return ['success' => false, 'message' => 'No content received from Gemini.'];
        }

        return [
            'success' => true,
            'content' => $content,
            'tokens_used' => $body['usageMetadata']['totalTokenCount'] ?? null,
            'model' => $model
        ];
    }

    /**
     * Call Anthropic Claude API
     */
    private function call_anthropic_api($system_prompt, $user_prompt, $model, $temperature, $max_tokens, $timeout) {
        $body = wp_json_encode([
            'model' => $model,
            'max_tokens' => $max_tokens,
            'system' => $system_prompt,
            'messages' => [
                ['role' => 'user', 'content' => $user_prompt]
            ],
            'temperature' => $temperature,
        ]);

        $response = wp_remote_post(self::$endpoints['anthropic'], [
            'headers' => [
                'x-api-key' => $this->api_key,
                'Content-Type' => 'application/json',
                'anthropic-version' => '2023-06-01',
            ],
            'body' => $body,
            'timeout' => $timeout,
        ]);

        if (is_wp_error($response)) {
            return ['success' => false, 'message' => 'API request failed: ' . $response->get_error_message()];
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code !== 200) {
            $error = $body['error']['message'] ?? 'Anthropic error (code: ' . $code . ')';
            return ['success' => false, 'message' => $error];
        }

        $content = $body['content'][0]['text'] ?? null;

        if (empty($content)) {
            return ['success' => false, 'message' => 'No content received from Claude.'];
        }

        return [
            'success' => true,
            'content' => $content,
            'tokens_used' => ($body['usage']['input_tokens'] ?? 0) + ($body['usage']['output_tokens'] ?? 0),
            'model' => $model
        ];
    }

    /**
     * Generate content using OpenAI API
     *
     * Uses the legacy config-based prompt system for backward compatibility.
     *
     * @param string $type The type of content (biography, topics, questions, etc.)
     * @param array $params Generation parameters
     * @return array Success/error response with content
     */
    public function generate_content($type, $params) {
        // Get system prompt for this type
        $system_prompt = $this->config->get_system_prompt($type);

        // Build user prompt from params
        $user_prompt = $this->build_user_prompt($type, $params);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Service: Generating ' . $type . ' content');
        }

        // Use centralized API call
        $result = $this->call_api($system_prompt, $user_prompt, array(
            'temperature' => $this->config->get_temperature($type),
            'max_tokens' => $this->config->get_max_tokens($type)
        ));

        // Return error if API call failed
        if (!$result['success']) {
            return $result;
        }

        $raw_content = $result['content'];

        // Format content based on type
        $formatted_content = $this->format_response($raw_content, $type, $params);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Service: Generation successful');
            error_log('  - Tokens used: ' . ($result['tokens_used'] ?? 'unknown'));
        }

        return array(
            'success' => true,
            'content' => $formatted_content,
            'raw_content' => $raw_content,
            'tokens_used' => $result['tokens_used'],
            'model' => $result['model']
        );
    }

    /**
     * Build user prompt based on type and parameters
     *
     * @param string $type Content type
     * @param array $params Parameters
     * @return string User prompt
     */
    private function build_user_prompt($type, $params) {
        // Get prompt template from config
        $template = $this->config->get_prompt_template($type);

        // Build authority hook string if provided
        $authority_hook = '';
        if (!empty($params['authorityHook'])) {
            $ah = $params['authorityHook'];
            $parts = array();

            if (!empty($ah['who'])) {
                $parts[] = 'I help ' . $ah['who'];
            }
            if (!empty($ah['what'])) {
                $parts[] = $ah['what'];
            }
            if (!empty($ah['when'])) {
                $parts[] = 'when ' . $ah['when'];
            }
            if (!empty($ah['how'])) {
                $parts[] = 'by ' . $ah['how'];
            }
            if (!empty($ah['where'])) {
                $parts[] = 'in ' . $ah['where'];
            }
            if (!empty($ah['why'])) {
                $parts[] = 'because ' . $ah['why'];
            }

            $authority_hook = implode(' ', $parts);
        }

        // Replace placeholders in template
        $replacements = array(
            '{{name}}' => $params['name'] ?? '',
            '{{expertise}}' => $params['expertise'] ?? '',
            '{{authorityHook}}' => $authority_hook,
            '{{tone}}' => $params['tone'] ?? 'professional',
            '{{length}}' => $params['length'] ?? 'medium',
            '{{pov}}' => $params['pov'] ?? 'third',
            '{{topics}}' => is_array($params['topics'] ?? null) ? implode(', ', $params['topics']) : ($params['topics'] ?? ''),
            '{{services}}' => is_array($params['services'] ?? null) ? implode(', ', $params['services']) : ($params['services'] ?? ''),
            '{{biography}}' => $params['biography'] ?? '',
            '{{credentials}}' => is_array($params['credentials'] ?? null) ? implode(', ', $params['credentials']) : ($params['credentials'] ?? ''),
            '{{tagline}}' => $params['tagline'] ?? '',
            // Authority Hook specific params (who/what/when/how framework)
            '{{who}}' => $params['who'] ?? '',
            '{{what}}' => $params['what'] ?? '',
            '{{when}}' => $params['when'] ?? '',
            '{{how}}' => $params['how'] ?? '',
            '{{where}}' => $params['where'] ?? '',
            '{{why}}' => $params['why'] ?? '',
            '{{count}}' => $params['count'] ?? '5'
        );

        $prompt = str_replace(array_keys($replacements), array_values($replacements), $template);

        // Clean up empty placeholders
        $prompt = preg_replace('/\{\{[a-zA-Z]+\}\}/', '', $prompt);
        $prompt = preg_replace('/\s+/', ' ', trim($prompt));

        return $prompt;
    }

    /**
     * Format API response based on content type
     *
     * @param string $content Raw content from API
     * @param string $type Content type
     * @param array $params Original parameters
     * @return mixed Formatted content
     */
    private function format_response($content, $type, $params) {
        switch ($type) {
            case 'biography':
                return $this->format_biography_response($content, $params);

            case 'topics':
                $count = isset($params['count']) ? intval($params['count']) : 10;
                return $this->format_topics_response($content, $count);

            case 'questions':
                return $this->format_list_response($content, 25);

            case 'tagline':
                return $this->format_tagline_response($content);

            case 'offers':
                return $this->format_offers_response($content);

            case 'authority_hook':
                return $this->format_authority_hook_response($content, $params);

            case 'impact_intro':
                return $this->format_impact_intro_response($content, $params);

            case 'guest_intro':
            default:
                return trim($content);
        }
    }

    /**
     * Format biography response (extract different lengths)
     *
     * @param string $content Raw content
     * @param array $params Parameters including requested length
     * @return array|string Biography content
     */
    private function format_biography_response($content, $params) {
        $biographies = array();

        // Try to extract labeled sections
        if (preg_match('/(?:Short|Brief)\s*(?:Bio(?:graphy)?)?[:\s]*(.+?)(?=(?:Medium|Long|$))/is', $content, $matches)) {
            $biographies['short'] = trim($matches[1]);
        }

        if (preg_match('/Medium\s*(?:Bio(?:graphy)?)?[:\s]*(.+?)(?=(?:Short|Long|$))/is', $content, $matches)) {
            $biographies['medium'] = trim($matches[1]);
        }

        if (preg_match('/(?:Long|Full|Extended)\s*(?:Bio(?:graphy)?)?[:\s]*(.+?)(?=(?:Short|Medium|$))/is', $content, $matches)) {
            $biographies['long'] = trim($matches[1]);
        }

        // If no labeled sections found, return based on requested length
        if (empty($biographies)) {
            $requested_length = $params['length'] ?? 'medium';
            return array(
                $requested_length => trim($content)
            );
        }

        return $biographies;
    }

    /**
     * Format topics response - extracts SHORT titles only
     *
     * @param string $content Raw content
     * @param int $expected_count Expected number of items
     * @return array Topic items as objects with title property
     */
    private function format_topics_response($content, $expected_count = 10) {
        $topics = array();
        $lines = explode("\n", trim($content));

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Match numbered format: "1.", "1)", "1:" etc.
            if (preg_match('/^\d+[\.\)\:]\s*(.+)/', $line, $matches)) {
                $title = trim($matches[1]);

                // Clean up the title
                // Remove markdown bold/italic markers
                $title = preg_replace('/\*+/', '', $title);
                // Remove leading/trailing quotes
                $title = preg_replace('/^["\'"]+|["\'"]+$/', '', $title);
                // Remove any description after " - " or " – " or ":"
                $title = preg_replace('/\s*[-–:]\s+[A-Z].*$/', '', $title);
                // Remove anything in parentheses at the end that looks like a description
                $title = preg_replace('/\s*\([^)]{30,}\)\s*$/', '', $title);
                // Trim again
                $title = trim($title, " \t\n\r\0\x0B\"'");

                if (!empty($title) && strlen($title) > 5) {
                    $topics[] = array(
                        'title' => $title,
                        'category' => 'Topic'
                    );
                }
            }

            // Stop if we have enough
            if (count($topics) >= $expected_count) {
                break;
            }
        }

        return $topics;
    }

    /**
     * Format list response (topics, questions)
     *
     * @param string $content Raw content
     * @param int $expected_count Expected number of items
     * @return array List items
     */
    private function format_list_response($content, $expected_count = 5) {
        $items = array();

        // Try to extract numbered items
        if (preg_match_all('/\d+\.\s*["\']?(.+?)["\']?(?=\n\d+\.|\n\n|$)/s', $content, $matches)) {
            $items = array_map('trim', $matches[1]);
        } else {
            // Fallback: split by newlines and filter
            $lines = explode("\n", $content);
            foreach ($lines as $line) {
                $line = trim($line);
                // Remove numbering and quotes
                $line = preg_replace('/^\d+\.\s*/', '', $line);
                $line = trim($line, " '\"");

                if (!empty($line) && strlen($line) > 5) {
                    $items[] = $line;
                }
            }
        }

        // Limit to expected count
        return array_slice($items, 0, $expected_count);
    }

    /**
     * Format tagline response
     *
     * @param string $content Raw content
     * @return array Multiple tagline options
     */
    private function format_tagline_response($content) {
        $taglines = array();

        // Try to extract multiple options
        if (preg_match_all('/(?:\d+\.\s*)?["\']?(.+?)["\']?(?=\n|$)/m', $content, $matches)) {
            foreach ($matches[1] as $tagline) {
                $tagline = trim($tagline, " '\".-");
                if (strlen($tagline) > 10 && strlen($tagline) < 200) {
                    $taglines[] = $tagline;
                }
            }
        }

        // If no multiple found, return the whole content as single
        if (empty($taglines)) {
            $taglines[] = trim($content, " '\"");
        }

        return array_unique(array_slice($taglines, 0, 5));
    }

    /**
     * Format offers response
     *
     * @param string $content Raw content
     * @return array Offer packages
     */
    private function format_offers_response($content) {
        $offers = array();

        // Try to extract structured offers
        $sections = preg_split('/(?=(?:Package|Tier|Option|Level)\s*\d|(?:Basic|Standard|Premium|Enterprise))/i', $content);

        foreach ($sections as $section) {
            $section = trim($section);
            if (strlen($section) > 20) {
                // Try to extract title
                if (preg_match('/^(.+?)[\n:]/m', $section, $match)) {
                    $title = trim($match[1]);
                    $description = trim(str_replace($match[0], '', $section));

                    $offers[] = array(
                        'title' => $title,
                        'description' => $description
                    );
                } else {
                    $offers[] = array(
                        'title' => 'Package',
                        'description' => $section
                    );
                }
            }
        }

        // Fallback to list format if no structured offers found
        if (empty($offers)) {
            $items = $this->format_list_response($content, 5);
            foreach ($items as $item) {
                $offers[] = array(
                    'title' => '',
                    'description' => $item
                );
            }
        }

        return $offers;
    }

    /**
     * Format authority hook response - extracts multiple hook variations
     *
     * @param string $content Raw content
     * @param array $params Original parameters
     * @return array Hook variations as objects with text property
     */
    private function format_authority_hook_response($content, $params) {
        $hooks = array();
        $expected_count = isset($params['count']) ? intval($params['count']) : 5;
        $lines = explode("\n", trim($content));

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Match numbered format: "1.", "1)", "1:" etc.
            if (preg_match('/^\d+[\.\)\:]\s*(.+)/', $line, $matches)) {
                $text = trim($matches[1]);

                // Clean up the text
                // Remove markdown bold/italic markers
                $text = preg_replace('/\*+/', '', $text);
                // Remove leading/trailing quotes
                $text = preg_replace('/^["\'"]+|["\'"]+$/', '', $text);
                // Trim again
                $text = trim($text, " \t\n\r\0\x0B\"'");

                if (!empty($text) && strlen($text) > 10) {
                    $hooks[] = array(
                        'text' => $text
                    );
                }
            }

            // Stop if we have enough
            if (count($hooks) >= $expected_count) {
                break;
            }
        }

        // Fallback: if no numbered list found, try splitting by double newlines
        if (empty($hooks)) {
            $paragraphs = preg_split('/\n\n+/', $content);
            foreach ($paragraphs as $para) {
                $para = trim($para);
                if (!empty($para) && strlen($para) > 10) {
                    $hooks[] = array('text' => $para);
                }
                if (count($hooks) >= $expected_count) {
                    break;
                }
            }
        }

        // Last fallback: return the whole content as a single hook
        if (empty($hooks) && !empty(trim($content))) {
            $hooks[] = array('text' => trim($content));
        }

        return $hooks;
    }

    /**
     * Format impact intro response - extracts multiple intro variations
     *
     * @param string $content Raw content
     * @param array $params Original parameters
     * @return array Impact intro variations as objects with text property
     */
    private function format_impact_intro_response($content, $params) {
        $intros = array();
        $expected_count = isset($params['count']) ? intval($params['count']) : 5;
        $lines = explode("\n", trim($content));

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Match numbered format: "1.", "1)", "1:" etc.
            if (preg_match('/^\d+[\.\)\:]\s*(.+)/', $line, $matches)) {
                $text = trim($matches[1]);

                // Clean up the text
                // Remove markdown bold/italic markers
                $text = preg_replace('/\*+/', '', $text);
                // Remove leading/trailing quotes
                $text = preg_replace('/^["\'"]+|["\'"]+$/', '', $text);
                // Trim again
                $text = trim($text, " \t\n\r\0\x0B\"'");

                if (!empty($text) && strlen($text) > 10) {
                    $intros[] = array(
                        'text' => $text
                    );
                }
            }

            // Stop if we have enough
            if (count($intros) >= $expected_count) {
                break;
            }
        }

        // Fallback: if no numbered list found, try splitting by double newlines
        if (empty($intros)) {
            $paragraphs = preg_split('/\n\n+/', $content);
            foreach ($paragraphs as $para) {
                $para = trim($para);
                if (!empty($para) && strlen($para) > 10) {
                    $intros[] = array('text' => $para);
                }
                if (count($intros) >= $expected_count) {
                    break;
                }
            }
        }

        // Last fallback: return the whole content as a single intro
        if (empty($intros) && !empty(trim($content))) {
            $intros[] = array('text' => trim($content));
        }

        return $intros;
    }

    /**
     * Test API connection
     *
     * @return array Success/error response
     */
    public function test_connection() {
        if (empty($this->api_key)) {
            return array(
                'success' => false,
                'message' => 'No API key configured'
            );
        }

        // Make a minimal test request
        $response = wp_remote_post($this->api_url, array(
            'method' => 'POST',
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json',
            ),
            'body' => wp_json_encode(array(
                'model' => $this->model,
                'messages' => array(
                    array('role' => 'user', 'content' => 'Respond with only the word "OK"')
                ),
                'max_tokens' => 5
            )),
            'timeout' => 10,
        ));

        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => 'Connection failed: ' . $response->get_error_message()
            );
        }

        $code = wp_remote_retrieve_response_code($response);

        if ($code === 200) {
            return array(
                'success' => true,
                'message' => 'API connection successful'
            );
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        $error = isset($body['error']['message']) ? $body['error']['message'] : 'Unknown error';

        return array(
            'success' => false,
            'message' => 'API returned error: ' . $error
        );
    }
}
