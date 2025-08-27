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
     * PHASE 1 FIX: Load topics data from Pods fields ONLY - Single source of truth
     * Eliminates all fallback chains and multiple data sources
     * 
     * @param int $post_id Post ID to load topics from
     * @return array Topics data result
     */
    private static function load_topics_data($post_id) {
        $topics = array();
        $data_source = 'pods_fields_primary';
        $success = false;
        $message = 'No topics found';
        $quality = 'empty';
        $count = 0;
        
        if ($post_id <= 0) {
            return array(
                'topics' => $topics,
                'source' => 'none',
                'success' => false,
                'message' => 'No valid post ID detected',
                'quality' => 'error',
                'count' => 0
            );
        }
        
        // PHASE 1 FIX: PODS FIELDS ONLY - Single source of truth (topic_1, topic_2, etc.)
        // NO FALLBACK CHAINS - This is the architectural requirement
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = get_post_meta($post_id, "topic_{$i}", true);
            
            if (!empty($topic_value) && strlen(trim($topic_value)) > 0) {
                $topics[] = array(
                    'title' => trim(sanitize_text_field(trim($topic_value))),
                    'description' => '',
                    'index' => $i - 1,
                    'meta_key' => "topic_{$i}",
                    'source' => 'pods_fields_primary'
                );
                $count++;
                $success = true;
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("✅ PHASE 1 Topics Data Service: Found topic_{$i} = {$topic_value} (Pods only)");
                }
            }
        }
        
        // PHASE 1 ARCHITECTURAL REQUIREMENT: NO OTHER DATA SOURCES
        // All MKCG fallbacks, JSON fallbacks, and component_data fallbacks REMOVED
        
        // Calculate quality based on Pods data only
        if ($count >= 4) {
            $quality = 'excellent';
        } elseif ($count >= 2) {
            $quality = 'good';
        } elseif ($count >= 1) {
            $quality = 'fair';
        } else {
            $quality = 'empty';
        }
        
        // Update message
        if ($success) {
            $message = "{$count} topics loaded from Pods fields (single source of truth)";
        } else {
            $message = "No topics found in Pods fields for post {$post_id}";
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("✅ PHASE 1 ARCHITECTURAL FIX: Topics loaded from Pods ONLY - {$count} topics, quality: {$quality}");
        }
        
        return array(
            'topics' => $topics,
            'source' => $data_source,
            'success' => $success,
            'message' => $message,
            'quality' => $quality,
            'count' => $count
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
