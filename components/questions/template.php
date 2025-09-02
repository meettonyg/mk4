<?php
/**
 * Questions Component Template
 */

// ROOT FIX: Handle props data structure
if (isset($props) && is_array($props)) {
    // Extract from props array
    $title = $props['title'] ?? null;
    $description = $props['description'] ?? null;
    $questions = $props['questions'] ?? null;
    $componentId = $props['component_id'] ?? $props['componentId'] ?? null;
} else {
    // Direct variables might be set
    $title = $title ?? null;
    $description = $description ?? null;
    $questions = $questions ?? null;
    $componentId = $componentId ?? $id ?? null;
}

// Set defaults
$title = $title ?? 'Frequently Asked Questions';
$componentId = $componentId ?? 'questions-' . time();
?>
<div class="questions-component editable-element" data-element="questions" data-component="questions" data-component-id="<?php echo esc_attr($componentId ?? $id ?? ''); ?>" data-component-type="questions">
    <!-- ROOT FIX: Controls now created dynamically by JavaScript - no server-side duplication -->
    <h2 class="questions-title"><?php echo $title ?? 'Frequently Asked Questions'; ?></h2>
    <?php if (isset($description)): ?>
        <div class="questions-description"><?php echo $description; ?></div>
    <?php endif; ?>
    
    <div class="questions-accordion">
        <?php if (isset($questions) && !empty($questions)): ?>
            <?php foreach ($questions as $index => $question): ?>
                <div class="question-item" data-index="<?php echo $index; ?>">
                    <div class="question-header">
                        <h3 class="question-text"><?php echo $question['question']; ?></h3>
                        <div class="question-toggle-icon">
                            <span class="toggle-icon-line"></span>
                            <span class="toggle-icon-line"></span>
                        </div>
                    </div>
                    <div class="question-answer">
                        <div class="question-answer-content"><?php echo $question['answer']; ?></div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="questions-placeholder">
                <p>Add frequently asked questions and their answers.</p>
                <button class="add-question-btn">+ Add Question</button>
            </div>
        <?php endif; ?>
    </div>
    
    <?php if (isset($questions) && !empty($questions)): ?>
        <button class="add-question-btn">+ Add Question</button>
    <?php endif; ?>
</div>