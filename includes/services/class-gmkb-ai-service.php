<?php
/**
 * GMKB AI Service - OpenAI API Integration
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Handles all OpenAI API interactions for content generation.
 *
 * Ported from: media-kit-content-generator/aigen/includes/services/class-mkcg-api-service.php
 *
 * @package GMKB
 * @subpackage AI
 * @version 1.0.0
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Load AI Config
require_once dirname(__FILE__) . '/class-gmkb-ai-config.php';

class GMKB_AI_Service {

    /**
     * OpenAI API key
     * @var string
     */
    private $api_key;

    /**
     * OpenAI API URL
     * @var string
     */
    private $api_url = 'https://api.openai.com/v1/chat/completions';

    /**
     * Default model to use
     * @var string
     */
    private $model = 'gpt-4o-mini';

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
     * Constructor
     */
    public function __construct() {
        // Check constant first, then fall back to WordPress option
        $this->api_key = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : get_option('gmkb_openai_api_key', '');
        $this->config = new GMKB_AI_Config();

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Service: Initialized');
            error_log('  - API Key configured: ' . (!empty($this->api_key) ? 'YES' : 'NO'));
        }
    }

    /**
     * Make a raw API call to OpenAI
     *
     * This is the central method for all OpenAI interactions. It handles:
     * - API key validation
     * - Request formatting
     * - Error handling
     * - Response parsing
     *
     * @param string $system_prompt The system prompt
     * @param string $user_prompt The user prompt
     * @param array $settings Optional settings (model, temperature, max_tokens)
     * @return array Success/error response with raw content
     */
    public function call_api($system_prompt, $user_prompt, $settings = array()) {
        // Validate API key
        if (empty($this->api_key)) {
            error_log('GMKB AI Service: Missing OpenAI API key');
            return array(
                'success' => false,
                'message' => 'AI service not configured. Please contact the administrator.'
            );
        }

        // Extract settings with defaults
        $model = isset($settings['model']) ? $settings['model'] : $this->model;
        $temperature = isset($settings['temperature']) ? floatval($settings['temperature']) : 0.7;
        $max_tokens = isset($settings['max_tokens']) ? intval($settings['max_tokens']) : 1000;
        $timeout = isset($settings['timeout']) ? intval($settings['timeout']) : $this->timeout;

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Service: Making API call');
            error_log('  - Model: ' . $model);
            error_log('  - System prompt length: ' . strlen($system_prompt));
            error_log('  - User prompt length: ' . strlen($user_prompt));
        }

        // Build request body
        $body = wp_json_encode(array(
            'model' => $model,
            'messages' => array(
                array('role' => 'system', 'content' => $system_prompt),
                array('role' => 'user', 'content' => $user_prompt)
            ),
            'temperature' => $temperature,
            'max_tokens' => $max_tokens
        ));

        // Make API request
        $response = wp_remote_post($this->api_url, array(
            'method' => 'POST',
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json',
            ),
            'body' => $body,
            'timeout' => $timeout,
        ));

        // Handle request error
        if (is_wp_error($response)) {
            error_log('GMKB AI Service: API request failed: ' . $response->get_error_message());
            return array(
                'success' => false,
                'message' => 'API request failed: ' . $response->get_error_message()
            );
        }

        // Check response code
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Service: Response code: ' . $response_code);
        }

        if ($response_code !== 200) {
            error_log('GMKB AI Service: API error: ' . $response_body);

            $error_data = json_decode($response_body, true);
            $error_message = isset($error_data['error']['message'])
                ? $error_data['error']['message']
                : 'OpenAI API error (code: ' . $response_code . ')';

            return array(
                'success' => false,
                'message' => $error_message
            );
        }

        // Parse response
        $data = json_decode($response_body, true);

        if (empty($data['choices'][0]['message']['content'])) {
            error_log('GMKB AI Service: No content in API response');
            return array(
                'success' => false,
                'message' => 'No content received from AI service.'
            );
        }

        $raw_content = $data['choices'][0]['message']['content'];
        $tokens_used = isset($data['usage']['total_tokens']) ? $data['usage']['total_tokens'] : null;

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AI Service: API call successful');
            error_log('  - Tokens used: ' . ($tokens_used ?? 'unknown'));
        }

        return array(
            'success' => true,
            'content' => $raw_content,
            'tokens_used' => $tokens_used,
            'model' => $model
        );
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
            '{{tagline}}' => $params['tagline'] ?? ''
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
                return $this->format_list_response($content, 5);

            case 'questions':
                return $this->format_list_response($content, 25);

            case 'tagline':
                return $this->format_tagline_response($content);

            case 'offers':
                return $this->format_offers_response($content);

            case 'guest_intro':
            case 'authority_hook':
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
