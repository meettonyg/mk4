<?php
/**
 * Call to Action Component Template
 */
?>
<div class="cta-component">
    <?php if (isset($title) || isset($description) || isset($buttonText) || isset($buttonUrl)): ?>
        <div class="cta-content">
            <?php if (isset($title)): ?>
                <h2 class="cta-title"><?php echo $title; ?></h2>
            <?php endif; ?>
            
            <?php if (isset($description)): ?>
                <div class="cta-description"><?php echo $description; ?></div>
            <?php endif; ?>
            
            <?php if (isset($buttonText) && isset($buttonUrl)): ?>
                <a href="<?php echo $buttonUrl; ?>" class="cta-button" target="<?php echo $buttonTarget ?? '_self'; ?>">
                    <?php echo $buttonText; ?>
                </a>
            <?php endif; ?>
        </div>
    <?php else: ?>
        <div class="cta-placeholder">
            <h2 class="cta-placeholder-title">Add a Call to Action</h2>
            <p class="cta-placeholder-text">Create a compelling call to action to prompt visitors to engage with you.</p>
            <button class="cta-edit-btn">Edit Call to Action</button>
        </div>
    <?php endif; ?>
</div>