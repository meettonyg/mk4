<?php
/**
 * Hero Component Template - Frontend Display
 */

// ROOT FIX: Extract all available variables
if (isset($props) && is_array($props)) {
    extract($props, EXTR_SKIP);
}

// ROOT FIX: Map variables with proper fallbacks
$hero_name = $name ?? $title ?? 'Guest Name';
$hero_title = $subtitle ?? $title ?? 'Professional Title';
$hero_bio = $bio ?? $description ?? '';
$hero_button = $buttonText ?? 'Get In Touch';
$hero_image = $image ?? '';

// ROOT FIX: Debug output
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('HERO TEMPLATE VARS: name=' . $hero_name . ', title=' . $hero_title . ', bio=' . substr($hero_bio, 0, 50));
}
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
    <h1 class="hero__name"><?php echo esc_html($hero_name); ?></h1>
    <div class="hero__title"><?php echo esc_html($hero_title); ?></div>
    <?php if (!empty($hero_bio)): ?>
    <p class="hero__bio"><?php echo esc_html($hero_bio); ?></p>
    <?php endif; ?>
    <?php if (!empty($hero_button)): ?>
    <div class="hero__cta" style="margin-top: 20px;">
        <button class="btn btn-primary" style="padding: 12px 30px; background: #295cff; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
            <?php echo esc_html($hero_button); ?>
        </button>
    </div>
    <?php endif; ?>
</div>
