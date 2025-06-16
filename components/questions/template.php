<?php
/**
 * Questions Component Template
 */
?>
<div class="questions-component">
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