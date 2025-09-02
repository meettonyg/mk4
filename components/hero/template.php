<?php
/**
 * Hero Component Template
 */
// ROOT FIX: Correct variable mapping for saved props
// The props come in as 'title', 'subtitle', 'buttonText'
// But the template uses 'name', 'title', 'bio'

// Check if we have the new props structure
if (isset($props) && is_array($props)) {
    // Extract props if they exist
    $hero_title = $props['title'] ?? null;
    $hero_subtitle = $props['subtitle'] ?? null;
    $hero_button = $props['buttonText'] ?? null;
} else {
    // Direct variables might be set
    $hero_title = $title ?? null;
    $hero_subtitle = $subtitle ?? null;
    $hero_button = $buttonText ?? null;
}

// Map to template variables
$name = $hero_title ?? 'New Hero Section';
$title = $hero_subtitle ?? 'Your Professional Title';  
$bio = $description ?? 'Briefly introduce yourself and your expertise.';
$buttonText = $hero_button ?? 'Get In Touch';
?>
<div class="hero editable-element" data-element="hero" data-component="hero" data-component-type="hero">
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
    <?php if (!empty($buttonText)): ?>
    <div class="hero__cta" style="margin-top: 20px;">
        <button class="btn btn-primary" style="padding: 12px 30px; background: #295cff; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
            <?php echo esc_html($buttonText); ?>
        </button>
    </div>
    <?php endif; ?>
</div>
