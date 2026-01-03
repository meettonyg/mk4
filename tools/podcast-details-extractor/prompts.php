<?php
/**
 * Podcast Details Extractor - Backend Logic
 *
 * Extracts podcast information from Apple Podcasts or Google Podcasts URLs
 * by fetching and parsing the podcast's RSS feed.
 *
 * @package GMKB
 * @subpackage Tools
 * @version 2.0.0
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Podcast Details Extractor Class
 *
 * Handles RSS feed fetching and parsing for podcast information extraction.
 */
class GMKB_Podcast_Details_Extractor {

    /**
     * Rate limit: maximum requests per IP per hour
     */
    const RATE_LIMIT_MAX_REQUESTS = 30;

    /**
     * Rate limit window in seconds (1 hour)
     */
    const RATE_LIMIT_WINDOW = 3600;

    /**
     * Transient prefix for rate limiting
     */
    const RATE_LIMIT_PREFIX = 'gmkb_pde_rate_';

    /**
     * Get iTunes/Apple Podcasts RSS URL from podcast page URL
     *
     * @param string $apple_podcast_url Apple Podcasts URL
     * @return string|false RSS feed URL or false on failure
     */
    public function get_itunes_rss_url($apple_podcast_url) {
        preg_match('/id(\d+)/', $apple_podcast_url, $matches);
        if (!$matches) {
            return false;
        }

        $podcast_id = $matches[1];
        $api_url = 'https://itunes.apple.com/lookup?id=' . $podcast_id;
        $response = wp_remote_get($api_url, [
            'timeout' => 15,
            'sslverify' => true,
        ]);

        if (is_wp_error($response)) {
            return false;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (isset($data['results'][0]['feedUrl'])) {
            return $data['results'][0]['feedUrl'];
        }

        return false;
    }

    /**
     * Get Google Podcasts RSS URL from podcast page URL
     *
     * @param string $google_podcast_url Google Podcasts URL
     * @return string|false RSS feed URL or false on failure
     */
    public function get_google_podcast_rss_url($google_podcast_url) {
        preg_match('/aHR0c[^"&]+/', $google_podcast_url, $matches);
        if ($matches) {
            return urldecode(base64_decode($matches[0]));
        }
        return false;
    }

    /**
     * Determine platform and get RSS URL
     *
     * @param string $url Podcast URL (Apple or Google)
     * @return string|false RSS feed URL or false on failure
     */
    public function get_podcast_rss_url($url) {
        if (strpos($url, 'podcasts.apple.com') !== false) {
            return $this->get_itunes_rss_url($url);
        } elseif (strpos($url, 'podcasts.google.com') !== false) {
            return $this->get_google_podcast_rss_url($url);
        }
        return false;
    }

    /**
     * Extract podcast information from RSS feed
     *
     * @param string $rss_feed_url URL to the podcast RSS feed
     * @return array Podcast information or error array
     */
    public function get_podcast_info($rss_feed_url) {
        // Fetch RSS feed
        $response = wp_remote_get($rss_feed_url, [
            'timeout' => 30,
            'sslverify' => true,
        ]);

        if (is_wp_error($response)) {
            return ['error' => 'Failed to fetch RSS feed'];
        }

        $body = wp_remote_retrieve_body($response);
        if (empty($body)) {
            return ['error' => 'Empty RSS feed response'];
        }

        // Suppress XML errors and load
        libxml_use_internal_errors(true);
        $rss_feed_xml = simplexml_load_string($body);

        if ($rss_feed_xml === false) {
            return ['error' => 'Invalid RSS feed format'];
        }

        $namespaces = $rss_feed_xml->getNamespaces(true);

        // Extract the podcast information
        $channel = $rss_feed_xml->channel;
        $itunes = isset($namespaces['itunes']) ? $channel->children($namespaces['itunes']) : null;

        $podcast_info = [
            'link' => (string)$channel->link,
            'language' => (string)$channel->language,
            'copyright' => (string)$channel->copyright,
            'webMaster' => (string)$channel->webMaster,
            'managingEditor' => (string)$channel->managingEditor,
            'image' => isset($channel->image->url) ? (string)$channel->image->url : '',
            'pubDate' => (string)$channel->pubDate,
            'title' => (string)$channel->title,
            'description' => (string)$channel->description,
            'lastBuildDate' => (string)$channel->lastBuildDate,
        ];

        // Add iTunes namespace fields if available
        if ($itunes) {
            $podcast_info['itunes_owner_name'] = isset($itunes->owner->name) ? (string)$itunes->owner->name : '';
            $podcast_info['itunes_owner_email'] = isset($itunes->owner->email) ? (string)$itunes->owner->email : '';
            $podcast_info['itunes_category'] = isset($itunes->category) ? (string)$itunes->category->attributes()->text : '';
            $podcast_info['itunes_keywords'] = isset($itunes->keywords) ? (string)$itunes->keywords : '';
            $podcast_info['itunes_explicit'] = isset($itunes->explicit) ? (string)$itunes->explicit : '';
            $podcast_info['itunes_author'] = isset($itunes->author) ? (string)$itunes->author : '';
            $podcast_info['itunes_summary'] = isset($itunes->summary) ? (string)$itunes->summary : '';
            $podcast_info['itunes_subtitle'] = isset($itunes->subtitle) ? (string)$itunes->subtitle : '';

            // Try to get iTunes image if regular image is empty
            if (empty($podcast_info['image']) && isset($itunes->image)) {
                $podcast_info['image'] = (string)$itunes->image->attributes()->href;
            }
        }

        // Filter out empty values
        return array_filter($podcast_info, function($value) {
            return $value !== '';
        });
    }

    /**
     * Check if request is rate limited
     *
     * @return bool|WP_Error True if allowed, WP_Error if rate limited
     */
    public function check_rate_limit() {
        // Logged-in users get higher limits
        if (is_user_logged_in()) {
            return true;
        }

        $ip = $this->get_client_ip();
        $transient_key = self::RATE_LIMIT_PREFIX . md5($ip);
        $request_count = get_transient($transient_key);

        if ($request_count === false) {
            // First request from this IP
            set_transient($transient_key, 1, self::RATE_LIMIT_WINDOW);
            return true;
        }

        if ($request_count >= self::RATE_LIMIT_MAX_REQUESTS) {
            return new WP_Error(
                'rate_limited',
                'Too many requests. Please try again later.',
                ['status' => 429]
            );
        }

        // Increment counter
        set_transient($transient_key, $request_count + 1, self::RATE_LIMIT_WINDOW);
        return true;
    }

    /**
     * Get client IP address
     *
     * @return string Client IP address
     */
    private function get_client_ip() {
        $ip_keys = [
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        ];

        foreach ($ip_keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                // Handle comma-separated IPs (X-Forwarded-For)
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return '0.0.0.0';
    }

    /**
     * Handle REST API request
     *
     * @param WP_REST_Request $request REST request object
     * @return array|WP_Error Podcast information or error
     */
    public function handle_rest_request($request) {
        // Check rate limit
        $rate_check = $this->check_rate_limit();
        if (is_wp_error($rate_check)) {
            return $rate_check;
        }

        $url = $request->get_param('url');

        // Validate URL format
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return new WP_Error('invalid_url', 'Invalid URL format.', ['status' => 400]);
        }

        // Check if URL is from supported platforms
        if (strpos($url, 'podcasts.apple.com') === false && strpos($url, 'podcasts.google.com') === false) {
            return new WP_Error('unsupported_platform', 'URL must be from Apple Podcasts or Google Podcasts.', ['status' => 400]);
        }

        // Get RSS feed URL
        $rss_feed_url = $this->get_podcast_rss_url($url);

        if (!$rss_feed_url) {
            return new WP_Error('rss_not_found', 'Could not find RSS feed for this podcast.', ['status' => 404]);
        }

        // Get podcast information
        $podcast_info = $this->get_podcast_info($rss_feed_url);

        if (isset($podcast_info['error'])) {
            return new WP_Error('extraction_failed', $podcast_info['error'], ['status' => 500]);
        }

        return $podcast_info;
    }
}

/**
 * Register REST routes for podcast extractor
 */
add_action('rest_api_init', function() {
    $extractor = new GMKB_Podcast_Details_Extractor();

    register_rest_route('podcast-details-extractor/v1', '/info', [
        'methods' => 'GET',
        'callback' => [$extractor, 'handle_rest_request'],
        'permission_callback' => '__return_true',
        'args' => [
            'url' => [
                'required' => true,
                'type' => 'string',
                'validate_callback' => function ($value) {
                    return filter_var($value, FILTER_VALIDATE_URL) !== false;
                },
                'sanitize_callback' => 'esc_url_raw',
            ],
        ],
    ]);
});

/**
 * Return tool configuration for ToolDiscovery
 */
return [
    'validation' => [
        'required' => ['url'],
        'defaults' => []
    ],
    'type' => 'extractor',
    'options' => []
];
