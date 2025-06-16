<?php
/**
 * Social Component Template
 */
?>
<div class="social-component">
    <h2 class="social-title"><?php echo $title ?? 'Connect With Me'; ?></h2>
    <div class="social-links">
        <?php if (isset($socialLinks) && !empty($socialLinks)): ?>
            <?php foreach ($socialLinks as $link): ?>
                <a href="<?php echo $link['url']; ?>" class="social-link" target="_blank" rel="noopener noreferrer">
                    <span class="social-icon <?php echo $link['platform']; ?>-icon"></span>
                    <span class="social-name"><?php echo $link['platform']; ?></span>
                </a>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="social-placeholder">
                <p>Add your social media profiles here.</p>
                <button class="add-social-btn">+ Add Social Link</button>
            </div>
        <?php endif; ?>
    </div>
    <?php if (isset($socialLinks) && !empty($socialLinks)): ?>
        <button class="add-social-btn">+ Add Social Link</button>
    <?php endif; ?>
</div>