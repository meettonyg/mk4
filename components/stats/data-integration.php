<?php
/**
 * Stats Component - Data Integration
 *
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 *
 * @package Guestify/Components/Stats
 * @version 3.0.0-native
 */

if (!defined('ABSPATH')) {
    exit;
}

class Stats_Data_Integration {

    protected static $component_type = 'stats';

    /**
     * Maximum number of stats supported
     */
    const MAX_STATS = 6;

    /**
     * Load stats data from native WordPress meta
     */
    public static function load_component_data($post_id) {
        $result = array(
            'stats' => array(),
            'title' => '',
            'subtitle' => '',
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

        // Load section title/subtitle
        $result['title'] = get_post_meta($post_id, 'stats_title', true) ?: '';
        $result['subtitle'] = get_post_meta($post_id, 'stats_subtitle', true) ?: '';

        // Load individual stats (1-6)
        for ($i = 1; $i <= self::MAX_STATS; $i++) {
            $value = get_post_meta($post_id, "stat_{$i}_value", true);
            $label = get_post_meta($post_id, "stat_{$i}_label", true);
            $icon = get_post_meta($post_id, "stat_{$i}_icon", true);

            if (!empty($value) || !empty($label)) {
                $result['stats'][] = array(
                    'id' => 'stat_' . $i,
                    'index' => $i,
                    'value' => sanitize_text_field($value),
                    'label' => sanitize_text_field($label),
                    'icon' => sanitize_text_field($icon)
                );
                $result['count']++;
            }
        }

        // Also check for serialized stats array
        $stats_array = get_post_meta($post_id, 'statistics', true);
        if (!empty($stats_array) && is_array($stats_array) && empty($result['stats'])) {
            foreach ($stats_array as $index => $stat) {
                if (is_array($stat)) {
                    $result['stats'][] = array(
                        'id' => 'stat_' . ($index + 1),
                        'index' => $index + 1,
                        'value' => isset($stat['value']) ? sanitize_text_field($stat['value']) : '',
                        'label' => isset($stat['label']) ? sanitize_text_field($stat['label']) : '',
                        'icon' => isset($stat['icon']) ? sanitize_text_field($stat['icon']) : ''
                    );
                    $result['count']++;
                }
            }
        }

        if ($result['count'] > 0) {
            $result['success'] = true;
            $result['message'] = "Loaded {$result['count']} statistics from native meta";
        } else {
            $result['message'] = 'No statistics data found';
        }

        return $result;
    }

    /**
     * Save stats data to native WordPress meta
     */
    public static function save_component_data($post_id, $data) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return array('success' => false, 'message' => 'Invalid post ID');
        }

        $count = 0;

        // Save title/subtitle
        if (isset($data['title'])) {
            update_post_meta($post_id, 'stats_title', sanitize_text_field($data['title']));
        }
        if (isset($data['subtitle'])) {
            update_post_meta($post_id, 'stats_subtitle', sanitize_text_field($data['subtitle']));
        }

        // Save individual stats
        $stats = isset($data['stats']) ? $data['stats'] : array();

        for ($i = 1; $i <= self::MAX_STATS; $i++) {
            $stat_index = $i - 1;

            if (isset($stats[$stat_index])) {
                $stat = $stats[$stat_index];

                $value = is_array($stat) ? ($stat['value'] ?? '') : '';
                $label = is_array($stat) ? ($stat['label'] ?? '') : '';
                $icon = is_array($stat) ? ($stat['icon'] ?? '') : '';

                if (!empty($value) || !empty($label)) {
                    update_post_meta($post_id, "stat_{$i}_value", sanitize_text_field($value));
                    update_post_meta($post_id, "stat_{$i}_label", sanitize_text_field($label));
                    update_post_meta($post_id, "stat_{$i}_icon", sanitize_text_field($icon));
                    $count++;
                } else {
                    delete_post_meta($post_id, "stat_{$i}_value");
                    delete_post_meta($post_id, "stat_{$i}_label");
                    delete_post_meta($post_id, "stat_{$i}_icon");
                }
            } else {
                delete_post_meta($post_id, "stat_{$i}_value");
                delete_post_meta($post_id, "stat_{$i}_label");
                delete_post_meta($post_id, "stat_{$i}_icon");
            }
        }

        return array('success' => true, 'count' => $count, 'message' => "Saved {$count} statistics");
    }

    /**
     * Check if stats data exists
     */
    public static function has_component_data($post_id) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return false;
        }

        // Check for any stat value
        for ($i = 1; $i <= self::MAX_STATS; $i++) {
            $value = get_post_meta($post_id, "stat_{$i}_value", true);
            if (!empty($value)) return true;

            $label = get_post_meta($post_id, "stat_{$i}_label", true);
            if (!empty($label)) return true;
        }

        // Check serialized array
        $stats = get_post_meta($post_id, 'statistics', true);
        return !empty($stats);
    }

    /**
     * Prepare template props
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;

        $props['title'] = $component_data['title'] ?? '';
        $props['subtitle'] = $component_data['subtitle'] ?? '';
        $props['stats'] = $component_data['stats'] ?? array();
        $props['stats_count'] = count($props['stats']);
        $props['has_stats'] = !empty($props['stats']);

        return $props;
    }
}

/**
 * Enrich stats props for frontend rendering
 */
add_filter('gmkb_enrich_stats_props', function($props, $post_id) {
    $data = Stats_Data_Integration::load_component_data($post_id);

    if ($data['success']) {
        $props = Stats_Data_Integration::prepare_template_props($data, $props);
    }

    return $props;
}, 10, 2);

GMKB_Logger::startup('Stats Data Integration loaded');
