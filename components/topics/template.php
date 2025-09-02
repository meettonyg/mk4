<?php
/**
 * Topics Component Template
 * ROOT FIX: Simplified template that handles all data formats gracefully
 * 
 * This template loads topics from Pods fields (single source of truth)
 * and renders them without causing critical errors
 */

// Set default values from passed props
$props = $props ?? [];
$loaded_topics = $props['loaded_topics'] ?? $props['topics'] ?? [];

// ROOT FIX: Robust post ID detection with multiple fallbacks
$post_id = $props['post_id'] ?? $props['postId'] ?? 0;

// Fallback: Try to get from URL parameters if not in props
if (!$post_id) {
    $post_id = intval($_GET['mkcg_id'] ?? $_GET['post_id'] ?? $_GET['p'] ?? 0);
}

// ROOT FIX: Load topics directly from Pods fields without complex class dependencies
// This avoids the critical error from missing base classes
if ($post_id > 0 && empty($loaded_topics)) {
    $topics_from_pods = array();
    
    // PHASE 1: Load from Pods fields only (topic_1 through topic_5)
    for ($i = 1; $i <= 5; $i++) {
        $topic_value = get_post_meta($post_id, "topic_{$i}", true);
        if (!empty($topic_value) && is_string($topic_value)) {
            $cleaned_value = trim(sanitize_text_field($topic_value));
            if (!empty($cleaned_value)) {
                $topics_from_pods[] = array(
                    'title' => $cleaned_value,
                    'index' => $i - 1
                );
            }
        }
    }
    
    if (!empty($topics_from_pods)) {
        $loaded_topics = $topics_from_pods;
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Topics Template: Loaded " . count($loaded_topics) . " topics directly from Pods for post {$post_id}");
        }
    }
}

// ROOT FIX: Component ID should be passed from parent context
$componentId = $props['component_id'] ?? $props['componentId'] ?? '';
$title = $props['title'] ?? 'Speaking Topics';

// ROOT FIX: Handle different data formats
$has_topics = false;
$topics_to_display = array();

if (!empty($loaded_topics)) {
    // Process topics array to ensure consistent format
    foreach ($loaded_topics as $key => $topic) {
        $topic_title = '';
        
        if (is_array($topic)) {
            // Handle array format
            $topic_title = isset($topic['title']) ? trim($topic['title']) : 
                          (isset($topic['topic_title']) ? trim($topic['topic_title']) : '');
        } elseif (is_string($topic)) {
            // Handle string format
            $topic_title = trim($topic);
        }
        
        // Only add non-empty topics
        if (!empty($topic_title)) {
            $topics_to_display[] = array(
                'title' => $topic_title,
                'index' => count($topics_to_display)
            );
            $has_topics = true;
        }
    }
}
?>
<!-- Topics component template - controls added dynamically by JS -->
<div class="content-section editable-element topics-component media-kit-component"
     data-element="topics"
     data-component="topics"
     data-component-type="topics"
     data-component-id="<?php echo esc_attr($componentId ?: 'topics-' . time()); ?>"
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
            <?php foreach ($topics_to_display as $topic): ?>
                <div class="topic-item" data-topic-index="<?php echo esc_attr($topic['index']); ?>" data-topic-number="<?php echo esc_attr($topic['index'] + 1); ?>">
                    <div class="topic-content">
                        <div class="topic-title" 
                             contenteditable="true" 
                             data-topic-number="<?php echo esc_attr($topic['index'] + 1); ?>"
                             data-original-value="<?php echo esc_attr($topic['title']); ?>">
                            <?php echo esc_html($topic['title']); ?>
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
                ✅ Live data: <?php echo count($topics_to_display); ?> topics loaded.
            <?php else: ?>
                ❌ No topics loaded. Post ID: <?php echo esc_html($post_id); ?>
            <?php endif; ?>
        </div>
    <?php endif; ?>
</div>
