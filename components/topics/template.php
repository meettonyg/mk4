<?php
/**
 * Topics Component Template - DEFINITIVE FIX
 * This version uses a more robust method to calculate the path to the
 * reusable controls partial, resolving the "File Not Found" error.
 */

// Set default values from passed props
$props = $props ?? [];
$loaded_topics = $props['loaded_topics'] ?? [];
$post_id = $props['post_id'] ?? 0;

// ROOT FIX: Use consistent ID format that matches JavaScript state management
// JavaScript generates 'component-{timestamp}', PHP should use the same format
$componentId = $props['component_id'] ?? $props['componentId'] ?? 'component-' . round(microtime(true) * 1000);
$title = $props['title'] ?? 'Speaking Topics';

$has_topics = !empty($loaded_topics);
$topics_to_display = $has_topics ? $loaded_topics : []; // Show nothing if no topics
?>

<div class="content-section editable-element topics-component">
    
    <?php
    // ROOT FIX: Dynamic Controls Architecture
    // ComponentControlsManager handles control creation and attachment dynamically
    // No static HTML controls needed - JavaScript manages everything
    echo "<!-- Dynamic Controls: ComponentControlsManager will attach controls via JavaScript -->\n";
    // Static controls removed - using scalable dynamic architecture
    ?>
    
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
    
    <?php if ($has_topics && defined('WP_DEBUG') && WP_DEBUG): ?>
        <div class="debug-notice" style="margin-top: 1rem; padding: 0.5rem; background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; font-size: 0.875rem; color: #0066cc;">
            ✅ Live data: <?php echo count($loaded_topics); ?> topics loaded from server.
        </div>
    <?php endif; ?>
</div>
