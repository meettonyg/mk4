<?php
/**
 * Topics Component Template
 * ROOT FIX: Clean template without any controls - controls added by component-controls-manager.js
 */

// Set default values from passed props
$props = $props ?? [];
$loaded_topics = $props['loaded_topics'] ?? [];

// ROOT FIX: Robust post ID detection with multiple fallbacks
$post_id = $props['post_id'] ?? $props['postId'] ?? 0;

// Fallback: Try to get from URL parameters if not in props
if (!$post_id) {
    $post_id = intval($_GET['mkcg_id'] ?? $_GET['post_id'] ?? $_GET['p'] ?? 0);
}

// If we have a post_id but no loaded topics, try to load them directly
if ($post_id > 0 && empty($loaded_topics)) {
    // Try to load topics using the Topics Data Service
    $topics_data_service_path = plugin_dir_path(__FILE__) . 'class-topics-data-service.php';
    if (file_exists($topics_data_service_path)) {
        require_once $topics_data_service_path;
        if (class_exists('Topics_Data_Service')) {
            $topics_data = Topics_Data_Service::get_unified_component_data($post_id, 'template');
            if (!empty($topics_data['topics'])) {
                $loaded_topics = $topics_data['topics'];
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Topics Template: Loaded " . count($loaded_topics) . " topics directly for post {$post_id}");
                }
            }
        }
    }
}

// ROOT FIX: Component ID should be passed from parent context
$componentId = $props['component_id'] ?? $props['componentId'] ?? '';
$title = $props['title'] ?? 'Speaking Topics';

$has_topics = !empty($loaded_topics);
$topics_to_display = $has_topics ? $loaded_topics : [];
?>
<!-- Topics component template - controls added dynamically by JS -->
<div class="content-section editable-element topics-component"
     data-element="topics"
     data-component="topics"
     data-component-type="topics"
     data-controls-enabled="true"
     style="position: relative; cursor: pointer;"
     tabindex="0">
    
    <div class="topics-header">
        <h2 class="section-title" contenteditable="true" data-setting="title">
            <?php echo esc_html($title); ?>
        </h2>
    </div>
    
    <div class="topics-container">
        <?php if ($has_topics): ?>
            <?php foreach ($topics_to_display as $index => $topic): ?>
                <div class="topic-item" data-topic-index="<?php echo esc_attr($index); ?>">
                    <div class="topic-content">
                        <div class="topic-title" contenteditable="true">
                            <?php 
                            $topic_title = is_array($topic) && isset($topic['title']) ? $topic['title'] : $topic;
                            echo esc_html($topic_title); 
                            ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
             <div class="no-topics-message">
                <p>No topics found. Click 'Edit' to add your speaking topics.</p>
            </div>
        <?php endif; ?>
    </div>
    
    <?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
        <div class="debug-notice" style="margin-top: 1rem; padding: 0.5rem; background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; font-size: 0.875rem; color: #0066cc;">
            <?php if ($has_topics): ?>
                ✅ Live data: <?php echo count($loaded_topics); ?> topics loaded from server.
            <?php else: ?>
                ❌ No topics loaded. Post ID: <?php echo esc_html($post_id); ?>
                <br>Loaded topics: <?php echo esc_html(print_r($loaded_topics, true)); ?>
            <?php endif; ?>
        </div>
    <?php endif; ?>
</div>
