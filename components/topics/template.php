<?php
/**
 * Topics Component Template
 */
?>
<div class="topics-component">
    <h2 class="topics-title"><?php echo $title ?? 'Topics'; ?></h2>
    <div class="topics-list">
        <?php if (isset($topics) && !empty($topics)): ?>
            <?php foreach ($topics as $topic): ?>
                <div class="topic-item">
                    <span class="topic-name"><?php echo $topic['name']; ?></span>
                    <?php if (isset($topic['description'])): ?>
                        <p class="topic-description"><?php echo $topic['description']; ?></p>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="topics-placeholder">
                <p>Add your areas of expertise or speaking topics here.</p>
                <button class="add-topic-btn">+ Add Topic</button>
            </div>
        <?php endif; ?>
    </div>
    <?php if (isset($topics) && !empty($topics)): ?>
        <button class="add-topic-btn">+ Add Topic</button>
    <?php endif; ?>
</div>