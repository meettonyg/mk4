<?php
/**
 * Topics Component Template
 */
// Default topics if none provided
$defaultTopics = ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4'];
$topicsList = $topics ?? $defaultTopics;
$sectionTitle = $title ?? 'Speaking Topics';
?>
<div class="content-section editable-element" data-element="topics" data-component="topics" data-component-id="<?php echo esc_attr($componentId); ?>" data-component-type="topics">
    <div class="element-controls">
        <button class="control-btn" title="Move Up">↑</button>
        <button class="control-btn" title="Move Down">↓</button>
        <button class="control-btn" title="Duplicate">⧉</button>
        <button class="control-btn" title="Delete">×</button>
    </div>
    <h2 class="section-title" contenteditable="true" data-setting="title"><?php echo esc_html($sectionTitle); ?></h2>
    <div class="topics-grid">
        <?php foreach ($topicsList as $topic): ?>
            <div class="topic-item" contenteditable="true"><?php echo esc_html($topic); ?></div>
        <?php endforeach; ?>
    </div>
</div>