<?php
/**
 * Biography Component Template
 */
?>
<div class="biography-component">
    <h2 class="biography-title"><?php echo $title ?? 'Biography'; ?></h2>
    <div class="biography-content">
        <?php if (isset($content) && !empty($content)): ?>
            <div class="biography-text"><?php echo $content; ?></div>
        <?php else: ?>
            <div class="biography-placeholder">Add your biography here. Share your story, experience, and qualifications.</div>
        <?php endif; ?>
    </div>
</div>