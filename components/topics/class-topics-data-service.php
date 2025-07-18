<?php
/**
 * ROOT FIX: Topics Component Data Service
 * Component-specific data service for topics component only
 * Ensures preview and sidebar use IDENTICAL data loading logic
 * 
 * @package Guestify/Components/Topics
 * @version 1.0.0-component-specific
 */

class Topics_Data_Service {
    
    /**
     * Get topics data using unified logic for both preview and sidebar
     * 
     * @return array {
     *     @type array  $topics        Array of topic objects
     *     @type int    $post_id       Resolved post ID
     *     @type string $post_id_source Source of post ID detection
     *     @type string $data_source   Source of topics data
     *     @type bool   $success       Whether data loading succeeded
     *     @type string $message       Status message
     * }
     */
    public static function get_unified_topics_data($context = 'unknown') {
        // Phase 1: Unified Post ID Detection
        $post_id_result = self::detect_post_id();
        $current_post_id = $post_id_result['post_id'];
        $post_id_source = $post_id_result['source'];
        
        // Phase 2: Unified Topics Loading
        $topics_result = self::load_topics_data($current_post_id);
        
        // Phase 3: Comprehensive Result
        $result = [
            'topics' => $topics_result['topics'],
            'post_id' => $current_post_id,
            'post_id_source' => $post_id_source,
            'data_source' => $topics_result['source'],
            'success' => $topics_result['success'],
            'message' => $topics_result['message'],
            'context' => $context,
            'timestamp' => current_time('mysql'),
            'debug_info' => [
                'post_id_methods' => $post_id_result['debug'],
                'data_methods' => $topics_result['debug']
            ]
        ];
        
        // Phase 4: Debug Logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Topics Data Service [{$context}]: Post ID {$current_post_id} ({$post_id_source}), " . 
                     count($result['topics']) . " topics from {$result['data_source']}");
        }
        
        return $result;
    }
    
    /**
     * Unified Post ID Detection - IDENTICAL logic for preview and sidebar
     */
    private static function detect_post_id() {
        $methods = [
            'component_props' => isset($GLOBALS['gmkb_component_post_id']) ? $GLOBALS['gmkb_component_post_id'] : null,
            'url_post_id' => $_GET['post_id'] ?? null,
            'url_p' => $_GET['p'] ?? null,
            'request_post_id' => $_REQUEST['post_id'] ?? null,
            'global_post' => (isset($GLOBALS['post']->ID) ? $GLOBALS['post']->ID : null),
            'wp_get_the_id' => (function_exists('get_the_ID') ? get_the_ID() : null),
            'wp_query' => (isset($GLOBALS['wp_query']->post->ID) ? $GLOBALS['wp_query']->post->ID : null)
        ];
        
        // Priority-based detection
        $current_post_id = 0;
        $post_id_source = 'none';
        
        foreach ($methods as $method => $value) {
            if (!empty($value) && is_numeric($value) && $value > 0) {
                $current_post_id = intval($value);
                $post_id_source = $method;
                break;
            }
        }
        
        return [
            'post_id' => $current_post_id,
            'source' => $post_id_source,
            'debug' => $methods
        ];
    }
    
    /**
     * Unified Topics Loading - IDENTICAL logic for preview and sidebar
     */
    private static function load_topics_data($post_id) {
        $topics = [];
        $data_source = 'none';
        $success = false;
        $message = 'No topics found';
        
        $debug_methods = [
            'custom_fields' => [],
            'mkcg_fields' => [],
            'json_data' => null,
            'post_meta_all' => []
        ];
        
        if ($post_id <= 0) {
            return [
                'topics' => $topics,
                'source' => $data_source,
                'success' => $success,
                'message' => 'No valid post ID detected',
                'debug' => $debug_methods
            ];
        }
        
        // Method 1: Custom post fields (topic_1, topic_2, etc.)
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = get_post_meta($post_id, "topic_{$i}", true);
            $debug_methods['custom_fields']["topic_{$i}"] = $topic_value;
            
            if (!empty($topic_value) && strlen(trim($topic_value)) > 0) {
                $topics[] = [
                    'title' => sanitize_text_field(trim($topic_value)),
                    'description' => '',
                    'index' => $i - 1,
                    'meta_key' => "topic_{$i}",
                    'source' => 'custom_fields_unified'
                ];
                $success = true;
                $data_source = 'custom_fields_unified';
            }
        }
        
        // Method 2: MKCG meta fields (fallback)
        if (!$success) {
            for ($i = 1; $i <= 5; $i++) {
                $topic_value = get_post_meta($post_id, "mkcg_topic_{$i}", true);
                $debug_methods['mkcg_fields']["mkcg_topic_{$i}"] = $topic_value;
                
                if (!empty($topic_value) && strlen(trim($topic_value)) > 0) {
                    $topics[] = [
                        'title' => sanitize_text_field(trim($topic_value)),
                        'description' => '',
                        'index' => $i - 1,
                        'meta_key' => "mkcg_topic_{$i}",
                        'source' => 'mkcg_fields_unified'
                    ];
                    $success = true;
                    $data_source = 'mkcg_fields_unified';
                }
            }
        }
        
        // Method 3: JSON topics data (final fallback)
        if (!$success) {
            $json_topics = get_post_meta($post_id, 'topics_data', true);
            $debug_methods['json_data'] = $json_topics;
            
            if (!empty($json_topics)) {
                $decoded_topics = json_decode($json_topics, true);
                if (is_array($decoded_topics)) {
                    foreach ($decoded_topics as $index => $topic_data) {
                        if (!empty($topic_data['title'])) {
                            $topics[] = [
                                'title' => sanitize_text_field(trim($topic_data['title'])),
                                'description' => sanitize_text_field(trim($topic_data['description'] ?? '')),
                                'index' => $index,
                                'meta_key' => 'topics_data',
                                'source' => 'json_data_unified'
                            ];
                            $success = true;
                            $data_source = 'json_data_unified';
                        }
                    }
                }
            }
        }
        
        // Debug: Get all post meta
        $all_meta = get_post_meta($post_id);
        foreach ($all_meta as $key => $values) {
            if (strpos($key, 'topic') !== false || strpos($key, 'mkcg') !== false) {
                $debug_methods['post_meta_all'][$key] = $values;
            }
        }
        
        // Update message
        if ($success) {
            $message = count($topics) . " topics loaded from {$data_source}";
        } else {
            $message = "No topics found in post {$post_id}";
        }
        
        return [
            'topics' => $topics,
            'source' => $data_source,
            'success' => $success,
            'message' => $message,
            'debug' => $debug_methods
        ];
    }
    
    /**
     * Get topics formatted for sidebar panel display
     */
    public static function get_sidebar_topics($context = 'sidebar') {
        $data = self::get_unified_topics_data($context);
        
        return [
            'topics' => $data['topics'],
            'found' => $data['success'],
            'count' => count($data['topics']),
            'post_id' => $data['post_id'],
            'message' => $data['message'],
            'debug' => defined('WP_DEBUG') && WP_DEBUG ? $data['debug_info'] : null
        ];
    }
    
    /**
     * Get topics formatted for preview area display
     */
    public static function get_preview_topics($context = 'preview') {
        $data = self::get_unified_topics_data($context);
        
        return [
            'topics' => $data['topics'],
            'found' => $data['success'],
            'loading_source' => $data['data_source'],
            'post_id' => $data['post_id'],
            'container_class' => $data['success'] ? 'has-topics' : 'no-topics',
            'debug' => defined('WP_DEBUG') && WP_DEBUG ? $data['debug_info'] : null
        ];
    }
    
    /**
     * Save topics data (for future use)
     */
    public static function save_topics_data($post_id, $topics, $source = 'custom_fields') {
        if ($post_id <= 0 || !is_array($topics)) {
            return false;
        }
        
        $success = true;
        
        // Save to custom fields format
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = isset($topics[$i - 1]['title']) ? $topics[$i - 1]['title'] : '';
            $result = update_post_meta($post_id, "topic_{$i}", sanitize_text_field($topic_value));
            if ($result === false) {
                $success = false;
            }
        }
        
        // Also save as JSON backup
        $json_data = json_encode($topics);
        update_post_meta($post_id, 'topics_data', $json_data);
        update_post_meta($post_id, 'topics_data_timestamp', current_time('mysql'));
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Topics Data Service: Saved " . count($topics) . " topics to post {$post_id} via {$source}");
        }
        
        return $success;
    }
}
