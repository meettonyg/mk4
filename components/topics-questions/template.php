<?php
/**
 * Topics Questions Component Template
 * Displays topics and interview questions in various formats
 */

$component_id = $props['component_id'] ?? $componentId ?? 'topics-questions-' . uniqid();
$displayMode = $props['displayMode'] ?? 'combined';
$showModeSelector = $props['showModeSelector'] ?? true;
$topicsDisplay = $props['topicsDisplay'] ?? 'cards';
$questionsDisplay = $props['questionsDisplay'] ?? 'list';
$topicsTitle = $props['topicsTitle'] ?? 'Topics of Expertise';
$questionsTitle = $props['questionsTitle'] ?? 'Interview Questions';

// Collect topics
$topics = [];
for ($i = 1; $i <= 5; $i++) {
    $topic = $props["topic_$i"] ?? '';
    if (!empty(trim($topic))) {
        $topics[] = $topic;
    }
}

// Collect questions
$questions = [];
for ($i = 1; $i <= 25; $i++) {
    $question = $props["question_$i"] ?? '';
    if (!empty(trim($question))) {
        $questions[] = $question;
    }
}
?>
<div class="gmkb-component gmkb-component--topicsquestions" data-component-id="<?php echo esc_attr($component_id); ?>">
    <div class="component-root topics-questions-content">
    
    <?php if ($showModeSelector): ?>
    <div class="display-mode-selector">
        <button class="mode-btn <?php echo $displayMode === 'topics' ? 'active' : ''; ?>" data-mode="topics">Topics Only</button>
        <button class="mode-btn <?php echo $displayMode === 'questions' ? 'active' : ''; ?>" data-mode="questions">Questions Only</button>
        <button class="mode-btn <?php echo $displayMode === 'combined' ? 'active' : ''; ?>" data-mode="combined">Topics & Questions</button>
    </div>
    <?php endif; ?>

    <?php if ($displayMode === 'topics' || $displayMode === 'combined'): ?>
    <div class="topics-section">
        <?php if ($topicsTitle): ?>
            <h3 class="section-title"><?php echo esc_html($topicsTitle); ?></h3>
        <?php endif; ?>
        
        <div class="topics-container display-<?php echo esc_attr($topicsDisplay); ?>">
            <?php if (!empty($topics)): ?>
                <?php foreach ($topics as $index => $topic): ?>
                    <div class="topic-item <?php echo $topicsDisplay === 'cards' ? 'card-style' : ''; ?>">
                        <span class="topic-number"><?php echo $index + 1; ?></span>
                        <span class="topic-text"><?php echo esc_html($topic); ?></span>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p class="no-content">No topics added yet.</p>
            <?php endif; ?>
        </div>
    </div>
    <?php endif; ?>

    <?php if ($displayMode === 'questions' || $displayMode === 'combined'): ?>
    <div class="questions-section">
        <?php if ($questionsTitle): ?>
            <h3 class="section-title"><?php echo esc_html($questionsTitle); ?></h3>
        <?php endif; ?>
        
        <div class="questions-container display-<?php echo esc_attr($questionsDisplay); ?>">
            <?php if (!empty($questions)): ?>
                <?php foreach ($questions as $index => $question): ?>
                    <div class="question-item <?php echo $questionsDisplay === 'accordion' ? 'accordion-item' : ''; ?>">
                        <?php if ($questionsDisplay === 'accordion'): ?>
                            <div class="question-header" data-question-index="<?php echo $index; ?>">
                                <span class="question-number">Q<?php echo $index + 1; ?></span>
                                <span class="question-text"><?php echo esc_html($question); ?></span>
                                <span class="accordion-icon">+</span>
                            </div>
                            <div class="answer-placeholder hidden">
                                <p>Answer content would go here...</p>
                            </div>
                        <?php else: ?>
                            <div class="question-content">
                                <span class="question-number">Q<?php echo $index + 1; ?>:</span>
                                <span class="question-text"><?php echo esc_html($question); ?></span>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p class="no-content">No questions added yet.</p>
            <?php endif; ?>
        </div>
    </div>
    <?php endif; ?>
    
    </div>  <!-- close component-root -->
</div>
