<?php
/**
 * Hero Component Template
 */
?>
<div class="hero-component">
    <h1 class="hero-title"><?php echo $title ?? 'Your Name'; ?></h1>
    <p class="hero-subtitle"><?php echo $subtitle ?? 'Your Profession'; ?></p>
    <div class="hero-image">
        <?php if (isset($image) && !empty($image)): ?>
            <img src="<?php echo $image; ?>" alt="<?php echo $title ?? 'Hero Image'; ?>">
        <?php else: ?>
            <div class="placeholder-image">Upload Image</div>
        <?php endif; ?>
    </div>
</div>