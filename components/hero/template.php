<?php
/**
 * Hero Component Template
 */
// Map variable names for backwards compatibility
$name = $name ?? $title ?? 'New Hero Section';
$title = $title ?? $subtitle ?? 'Your Professional Title';
$bio = $bio ?? $description ?? 'Briefly introduce yourself and your expertise.';
?>
<div class="hero editable-element" data-element="hero" data-component="hero" data-component-id="<?php echo esc_attr($componentId); ?>" data-component-type="hero">
    <!-- ROOT FIX: Controls now created dynamically by JavaScript - no server-side duplication -->
    <div class="hero__avatar">
        <?php if (isset($image) && !empty($image)): ?>
            <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($name); ?>">
        <?php else: ?>
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='50' font-size='50' text-anchor='middle' x='50' fill='%2364748b'%3EDJ%3C/text%3E%3C/svg%3E" alt="Profile Avatar">
        <?php endif; ?>
    </div>
    <h1 class="hero__name" contenteditable="true" data-setting="name"><?php echo esc_html($name); ?></h1>
    <div class="hero__title" contenteditable="true" data-setting="title"><?php echo esc_html($title); ?></div>
    <p class="hero__bio" contenteditable="true" data-setting="bio"><?php echo esc_html($bio); ?></p>
</div>
