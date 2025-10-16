<?php
/**
 * Questions Component Template
 */
$component_id = $props['component_id'] ?? $componentId ?? 'questions-' . uniqid();
$title = $props['title'] ?? 'Frequently Asked Questions';
$questions = $props['questions'] ?? [];
if (!is_array($questions)) $questions = [];
?>
<div class="gmkb-component gmkb-component--questions" data-component-id="<?php echo esc_attr($component_id); ?>">
    <?php if ($title): ?>
        <h2 class="section-title"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    <div class="questions-list">
        <?php if (!empty($questions)): ?>
            <?php foreach ($questions as $question): ?>
                <?php $q = is_array($question) ? ($question['question'] ?? '') : $question; ?>
                <?php $a = is_array($question) ? ($question['answer'] ?? '') : ''; ?>
                <?php if ($q): ?>
                    <div class="question-item">
                        <div class="question-text"><?php echo esc_html($q); ?></div>
                        <?php if ($a): ?>
                            <div class="question-answer"><?php echo esc_html($a); ?></div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
