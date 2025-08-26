<?php
/**
 * Topics Component Data Service - SCALABLE ARCHITECTURE
 * 
 * Component-specific service that extends Base_Component_Data_Service
 * Provides unified data loading for topics component across all contexts
 * 
 * @package Guestify/Components/Topics
 * @version 2.0.0-scalable-base-service
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Load component-specific integration if not already loaded
if (!class_exists('Topics_Pods_Integration')) {
    require_once __DIR__ . '/Topics_Pods_Integration.php';
}

class Topics_Data_Service extends Base_Component_Data_Service {
    
    /**
     * Component type identifier
     */
    protected static $component_type = 'topics';
    
    /**
     * EVENT-DRIVEN: Get unified component data with explicit post ID
     * Implements base class abstract method for topics component
     * 
     * @param int $post_id Explicit post ID (required)
     * @param string $context Context where data is requested
     * @return array Component data array
     */
    public static function get_unified_component_data($post_id, $context = 'unknown') {
        // EVENT-DRIVEN: Validate explicit post ID parameter
        $validation = self::validate_explicit_post_id($post_id, $context);
        
        if (!$validation['valid']) {
            return array(
                'topics' => array(),
                'post_id' => $validation['post_id'],
                'success' => false,
                'message' => $validation['error'],
                'context' => $context,
                'component_type' => self::$component_type,
                'timestamp' => current_time('mysql'),
                'event_driven' => true
            );
        }
        
        $current_post_id = $validation['post_id'];
        
        // PHASE 1 FIX: Use component-specific Pods integration
        $pods_result = Topics_Pods_Integration::load_topics_data($current_post_id);
        
        // EVENT-DRIVEN result
        $result = array(
            'topics' => $pods_result['topics'],
            'post_id' => $current_post_id,
            'post_title' => $validation['post_title'],
            'data_source' => $pods_result['source'],
            'success' => $pods_result['success'],
            'message' => $pods_result['message'],
            'context' => $context,
            'component_type' => self::$component_type,
            'timestamp' => current_time('mysql'),
            'event_driven' => true,
            'quality' => $pods_result['quality'],
            'count' => $pods_result['count']
        );
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("EVENT-DRIVEN TOPICS: Context [{$context}] Post ID {$current_post_id} (explicit), " . 
                     count($result['topics']) . " topics from {$result['data_source']}");
        }
        
        return $result;
    }
    
    /**
     * EVENT-DRIVEN: Get component data for preview area with explicit post ID
     * Implements base class abstract method
     * 
     * @param int $post_id Explicit post ID (required)
     * @param string $context Context identifier
     * @return array Preview-formatted data
     */
    public static function get_preview_data($post_id, $context = 'preview') {
        $data = self::get_unified_component_data($post_id, $context);
        
        return array(
            'topics' => $data['topics'],
            'found' => $data['success'],
            'loading_source' => $data['data_source'],
            'post_id' => $data['post_id'],
            'container_class' => $data['success'] ? 'has-topics' : 'no-topics',
            'component_type' => self::$component_type,
            'event_driven' => true,
            'debug' => defined('WP_DEBUG') && WP_DEBUG ? $data['debug_info'] : null
        );
    }
    
    /**
     * EVENT-DRIVEN: Get component data for sidebar/design panel with explicit post ID
     * Implements base class abstract method
     * 
     * @param int $post_id Explicit post ID (required)
     * @param string $context Context identifier
     * @return array Sidebar-formatted data
     */
    public static function get_sidebar_data($post_id, $context = 'sidebar') {
        $data = self::get_unified_component_data($post_id, $context);
        
        return array(
            'topics' => $data['topics'],
            'found' => $data['success'],
            'count' => count($data['topics']),
            'post_id' => $data['post_id'],
            'message' => $data['message'],
            'component_type' => self::$component_type,
            'event_driven' => true,
            'debug' => defined('WP_DEBUG') && WP_DEBUG ? $data['debug_info'] : null
        );
    }
    
    /**
     * TOPICS-SPECIFIC: Load topics data from multiple sources
     * Enhanced version of previous logic with better error handling
     * 
     * @param int $post_id Post ID to load topics from
     * @return array Topics data result
     */
    private static function load_topics_data($post_id) {
        $topics = array();
        $data_source = 'none';
        $success = false;
        $message = 'No topics found';
        
        $debug_methods = array(
            'pods_fields' => array(),
            'json_data' => null,
            'post_meta_all' => array(),
            'component_data' => null
        );
        
        if ($post_id <= 0) {
            return array(
                'topics' => $topics,
                'source' => $data_source,
                'success' => $success,
                'message' => 'No valid post ID detected',
                'debug' => $debug_methods
            );
        }
        
        // SCALABLE: Try to load from base class component data first
        $component_data = self::load_component_data($post_id);
        if (!empty($component_data) && isset($component_data['topics'])) {
            $debug_methods['component_data'] = $component_data;
            
            foreach ($component_data['topics'] as $index => $topic) {
                if (!empty($topic['title'])) {
                    $topics[] = array(
                        'title' => trim(sanitize_text_field(trim($topic['title']))),
                        'description' => trim(sanitize_text_field(trim($topic['description'] ?? ''))),
                        'index' => $index,
                        'meta_key' => 'component_data',
                        'source' => 'component_data_scalable'
                    );
                    $success = true;
                    $data_source = 'component_data_scalable';
                }
            }
        }
        
        // PHASE 1 FIX: PODS FIELDS ONLY - Single source of truth (topic_1, topic_2, etc.)
        if (!$success) {
            for ($i = 1; $i <= 5; $i++) {
                $topic_value = get_post_meta($post_id, "topic_{$i}", true);
                $debug_methods['pods_fields']["topic_{$i}"] = $topic_value;
                
                if (!empty($topic_value) && strlen(trim($topic_value)) > 0) {
                    $topics[] = array(
                        'title' => trim(sanitize_text_field(trim($topic_value))),
                        'description' => '',
                        'index' => $i - 1,
                        'meta_key' => "topic_{$i}",
                        'source' => 'pods_fields_primary'
                    );
                    $success = true;
                    $data_source = 'pods_fields_primary';
                    
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("PHASE 1 Topics Data Service: Found topic_{$i} = {$topic_value}");
                    }
                }
            }
        }
        
        // PHASE 1 REMOVED: No fallback chains - Pods fields only
        
        // LEGACY: Method 3 - JSON topics data (final fallback)
        if (!$success) {
            $json_topics = get_post_meta($post_id, 'topics_data', true);
            $debug_methods['json_data'] = $json_topics;
            
            if (!empty($json_topics)) {
                $decoded_topics = json_decode($json_topics, true);
                if (is_array($decoded_topics)) {
                    foreach ($decoded_topics as $index => $topic_data) {
                        if (!empty($topic_data['title'])) {
                            $topics[] = array(
                                'title' => trim(sanitize_text_field(trim($topic_data['title']))),
                                'description' => trim(sanitize_text_field(trim($topic_data['description'] ?? ''))),
                                'index' => $index,
                                'meta_key' => 'topics_data',
                                'source' => 'json_data_legacy'
                            );
                            $success = true;
                            $data_source = 'json_data_legacy';
                        }
                    }
                }
            }
        }
        
        // Debug: Get Pods-related post meta for analysis
        $all_meta = get_post_meta($post_id);
        foreach ($all_meta as $key => $values) {
            if (strpos($key, 'topic') !== false || strpos($key, 'component') !== false) {
                $debug_methods['post_meta_all'][$key] = $values;
            }
        }
        
        // Update message
        if ($success) {
            $message = count($topics) . " topics loaded from {$data_source}";
        } else {
            $message = "No topics found in post {$post_id}";
        }
        
        return array(
            'topics' => $topics,
            'source' => $data_source,
            'success' => $success,
            'message' => $message,
            'debug' => $debug_methods
        );
    }
    
    /**
     * SCALABLE: Save topics data using base class patterns
     * 
     * @param int   $post_id Post ID to save to
     * @param array $topics  Topics data to save
     * @param array $options Save options
     * @return bool Success status
     */
    public static function save_topics_data($post_id, $topics, $options = array()) {
        if ($post_id <= 0 || !is_array($topics)) {
            return false;
        }
        
        // PHASE 1 FIX: Use component-specific Pods integration for save
        $save_result = Topics_Pods_Integration::save_topics_data($post_id, $topics);
        
        // Also use base class for additional metadata if needed
        if ($save_result['success']) {
            $component_data = array(
                'topics' => $topics,
                'total_count' => count($topics),
                'last_updated' => current_time('mysql'),
                'source' => 'component_pods_integration'
            );
            parent::save_component_data($post_id, $component_data, $options);
        }
        
        return $save_result['success'];
    }
    
    /**
     * SCALABLE: Validate topics data
     * Override base class method for topics-specific validation
     * 
     * @param array $data Topics data to validate
     * @return array|false Validated data or false on failure
     */
    protected static function validate_component_data($data) {
        if (!is_array($data) || !isset($data['topics'])) {
            return false;
        }
        
        // Validate topics array
        if (!is_array($data['topics'])) {
            return false;
        }
        
        // Validate each topic
        $validated_topics = array();
        foreach ($data['topics'] as $index => $topic) {
            if (!is_array($topic) || empty($topic['title'])) {
                continue; // Skip invalid topics
            }
            
            $validated_topics[] = array(
                'title' => trim(sanitize_text_field($topic['title'])),
                'description' => trim(sanitize_text_field($topic['description'] ?? '')),
                'index' => intval($index),
                'source' => sanitize_text_field($topic['source'] ?? 'validated')
            );
        }
        
        $data['topics'] = $validated_topics;
        $data['total_count'] = count($validated_topics);
        
        return $data;
    }
    
    /**
     * BACKWARD COMPATIBILITY: Legacy method support with auto-detection fallback
     * Maintains compatibility with existing code but logs deprecation warnings
     */
    
    public static function get_unified_topics_data($context = 'unknown') {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('DEPRECATED: get_unified_topics_data() called without explicit post_id. Use get_unified_component_data($post_id, $context) instead.');
        }
        
        // Attempt to get post_id from various sources for backward compatibility
        $post_id = $_POST['post_id'] ?? $_GET['post_id'] ?? get_the_ID() ?? 0;
        
        return self::get_unified_component_data($post_id, $context);
    }
    
    public static function get_sidebar_topics($context = 'sidebar') {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('DEPRECATED: get_sidebar_topics() called without explicit post_id. Use get_sidebar_data($post_id, $context) instead.');
        }
        
        $post_id = $_POST['post_id'] ?? $_GET['post_id'] ?? get_the_ID() ?? 0;
        
        return self::get_sidebar_data($post_id, $context);
    }
    
    public static function get_preview_topics($context = 'preview') {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('DEPRECATED: get_preview_topics() called without explicit post_id. Use get_preview_data($post_id, $context) instead.');
        }
        
        $post_id = $_POST['post_id'] ?? $_GET['post_id'] ?? get_the_ID() ?? 0;
        
        return self::get_preview_data($post_id, $context);
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ SCALABLE TOPICS: Topics Data Service loaded with scalable base architecture');
}
