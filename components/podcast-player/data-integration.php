<?php
/**
 * Podcast Player Component - Data Integration
 *
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 *
 * @package Guestify/Components/PodcastPlayer
 * @version 3.0.0-native
 */

if (!defined('ABSPATH')) {
    exit;
}

class Podcast_Player_Data_Integration {

    protected static $component_type = 'podcast-player';

    /**
     * Field mappings for podcast data
     */
    protected static $field_mappings = array(
        'title' => 'podcast_title',
        'subtitle' => 'podcast_subtitle',
        'podcastUrl' => 'podcast_main_url',
        'spotifyUrl' => 'spotify_podcast_url',
        'appleUrl' => 'apple_podcast_url',
        'episode_1' => 'episode_1_url',
        'episode_2' => 'episode_2_url',
        'episode_3' => 'episode_3_url'
    );

    /**
     * Load podcast data from native WordPress meta
     */
    public static function load_component_data($post_id) {
        $result = array(
            'podcast' => array(),
            'episodes' => array(),
            'count' => 0,
            'source' => 'native_meta',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'timestamp' => current_time('mysql')
        );

        if (!is_numeric($post_id) || $post_id <= 0) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }

        // Load podcast info fields
        foreach (self::$field_mappings as $key => $meta_key) {
            if (strpos($key, 'episode_') === 0) continue; // Handle episodes separately

            $value = get_post_meta($post_id, $meta_key, true);
            if (!empty($value)) {
                // URL fields
                if (strpos($key, 'Url') !== false) {
                    $result['podcast'][$key] = esc_url_raw($value);
                } else {
                    $result['podcast'][$key] = sanitize_text_field($value);
                }
                $result['count']++;
            }
        }

        // Load episodes (1-3 from schema, but support more)
        for ($i = 1; $i <= 10; $i++) {
            $episode_url = get_post_meta($post_id, "episode_{$i}_url", true);
            if (!empty($episode_url)) {
                $episode_title = get_post_meta($post_id, "episode_{$i}_title", true);
                $episode_desc = get_post_meta($post_id, "episode_{$i}_description", true);

                $result['episodes'][] = array(
                    'id' => 'episode_' . $i,
                    'index' => $i,
                    'url' => esc_url_raw($episode_url),
                    'title' => $episode_title ? sanitize_text_field($episode_title) : "Episode {$i}",
                    'description' => $episode_desc ? sanitize_text_field($episode_desc) : ''
                );
                $result['count']++;
            }
        }

        // Also check for serialized episodes array
        $episodes_array = get_post_meta($post_id, 'podcast_episodes', true);
        if (!empty($episodes_array) && is_array($episodes_array)) {
            foreach ($episodes_array as $index => $episode) {
                if (is_array($episode) && !empty($episode['url'])) {
                    $result['episodes'][] = array(
                        'id' => 'episode_' . ($index + 1),
                        'index' => $index + 1,
                        'url' => esc_url_raw($episode['url']),
                        'title' => isset($episode['title']) ? sanitize_text_field($episode['title']) : '',
                        'description' => isset($episode['description']) ? sanitize_text_field($episode['description']) : ''
                    );
                    $result['count']++;
                }
            }
        }

        if ($result['count'] > 0) {
            $result['success'] = true;
            $result['message'] = "Loaded podcast data with " . count($result['episodes']) . " episodes";
        } else {
            $result['message'] = 'No podcast data found';
        }

        return $result;
    }

    /**
     * Save podcast data to native WordPress meta
     */
    public static function save_component_data($post_id, $data) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return array('success' => false, 'message' => 'Invalid post ID');
        }

        $podcast = isset($data['podcast']) ? $data['podcast'] : $data;
        $count = 0;

        // Save main podcast fields
        foreach (self::$field_mappings as $key => $meta_key) {
            if (strpos($key, 'episode_') === 0) continue;

            if (isset($podcast[$key])) {
                $value = strpos($key, 'Url') !== false
                    ? esc_url_raw($podcast[$key])
                    : sanitize_text_field($podcast[$key]);

                if (!empty($value)) {
                    update_post_meta($post_id, $meta_key, $value);
                    $count++;
                } else {
                    delete_post_meta($post_id, $meta_key);
                }
            }
        }

        // Save episodes if provided
        if (isset($data['episodes']) && is_array($data['episodes'])) {
            update_post_meta($post_id, 'podcast_episodes', $data['episodes']);
            $count += count($data['episodes']);
        }

        return array('success' => true, 'count' => $count, 'message' => "Saved podcast data");
    }

    /**
     * Check if podcast data exists
     */
    public static function has_component_data($post_id) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return false;
        }

        // Check for any podcast URL
        $spotify = get_post_meta($post_id, 'spotify_podcast_url', true);
        if (!empty($spotify)) return true;

        $apple = get_post_meta($post_id, 'apple_podcast_url', true);
        if (!empty($apple)) return true;

        $main = get_post_meta($post_id, 'podcast_main_url', true);
        if (!empty($main)) return true;

        $episodes = get_post_meta($post_id, 'podcast_episodes', true);
        return !empty($episodes);
    }

    /**
     * Prepare template props
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;

        $podcast = $component_data['podcast'] ?? array();

        $props['title'] = $podcast['title'] ?? '';
        $props['subtitle'] = $podcast['subtitle'] ?? '';
        $props['podcast_url'] = $podcast['podcastUrl'] ?? '';
        $props['spotify_url'] = $podcast['spotifyUrl'] ?? '';
        $props['apple_url'] = $podcast['appleUrl'] ?? '';
        $props['episodes'] = $component_data['episodes'] ?? array();
        $props['episodes_count'] = count($props['episodes']);
        $props['has_podcast'] = !empty($props['spotify_url']) || !empty($props['apple_url']) || !empty($props['episodes']);

        return $props;
    }
}

/**
 * Enrich podcast-player props for frontend rendering
 */
add_filter('gmkb_enrich_podcast-player_props', function($props, $post_id) {
    $data = Podcast_Player_Data_Integration::load_component_data($post_id);

    if ($data['success']) {
        $props = Podcast_Player_Data_Integration::prepare_template_props($data, $props);
    }

    return $props;
}, 10, 2);

GMKB_Logger::startup('Podcast Player Data Integration loaded');
