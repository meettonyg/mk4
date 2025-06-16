<?php
/**
 * Hero Component Template
 */
?>
<div class="hero" data-element="hero" data-component="hero">
    <div class="hero__avatar">
        <?php if (isset($image) && !empty($image)): ?>
            <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title ?? 'Profile'); ?>">
        <?php else: ?>
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='50' font-size='50' text-anchor='middle' x='50' fill='%2364748b'%3EDJ%3C/text%3E%3C/svg%3E" alt="Profile Avatar">
        <?php endif; ?>
    </div>
    <h1 class="hero__name"><?php echo esc_html($title ?? 'New Hero Section'); ?></h1>
    <div class="hero__title"><?php echo esc_html($subtitle ?? 'Your Professional Title'); ?></div>
    <p class="hero__bio"><?php echo esc_html($bio ?? 'Briefly introduce yourself and your expertise.'); ?></p>
</div>
