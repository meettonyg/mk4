<?php
/**
 * Topics Component Template
 * ROOT FIX: Mirrors Vue component structure exactly
 * Uses standardized data contract
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'topics-' . uniqid();
$title = $props['title'] ?? 'Speaking Topics';
$description = $props['description'] ?? '';
$topics = $props['topics'] ?? [];

// Ensure topics is an array
if (!is_array($topics)) {
    $topics = [];
}
?>
<!-- ROOT FIX: Exact same structure as Vue -->
<div class="gmkb-component gmkb-component--topics" data-component-id="<?php echo esc_attr($component_id); ?>">
    <div class="topics-container">
        <?php if ($title): ?>
            <h2 class="topics-title"><?php echo esc_html($title); ?></h2>
        <?php endif; ?>
        
        <?php if ($description): ?>
            <p class="topics-description"><?php echo esc_html($description); ?></p>
        <?php endif; ?>
        
        <?php if (!empty($topics)): ?>
            <?php foreach ($topics as $topic): ?>
                <?php
                // Handle both array and string formats
                $topic_name = is_array($topic) ? ($topic['name'] ?? $topic['text'] ?? '') : $topic;
                $topic_description = is_array($topic) ? ($topic['description'] ?? '') : '';
                ?>
                <?php if ($topic_name): ?>
                    <div class="topic-item">
                        <div class="topic-title"><?php echo esc_html($topic_name); ?></div>
                        <?php if ($topic_description): ?>
                            <p class="topic-description"><?php echo esc_html($topic_description); ?></p>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="topics-placeholder">Add your speaking topics here.</p>
        <?php endif; ?>
    </div>
</div>
