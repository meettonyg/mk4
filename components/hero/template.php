<?php
/**
 * Hero Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'hero-' . uniqid();
$name = $props['name'] ?? '';
$title = $props['title'] ?? '';
$bio = $props['bio'] ?? '';
$imageUrl = $props['imageUrl'] ?? $props['image_url'] ?? $props['image'] ?? '';
$ctaText = $props['ctaText'] ?? $props['cta_text'] ?? $props['buttonText'] ?? '';
$ctaUrl = $props['ctaUrl'] ?? $props['cta_url'] ?? $props['buttonUrl'] ?? '#';
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root hero-content">
    <?php if ($imageUrl): ?>
        <div class="hero__avatar">
            <img src="<?php echo esc_url($imageUrl); ?>" alt="<?php echo esc_attr($name ?: 'Profile Avatar'); ?>">
        </div>
    <?php endif; ?>
    
    <?php if ($name): ?>
        <h1 class="hero__name"><?php echo esc_html($name); ?></h1>
    <?php endif; ?>
    
    <?php if ($title): ?>
        <div class="hero__title"><?php echo esc_html($title); ?></div>
    <?php endif; ?>
    
    <?php if ($bio): ?>
        <p class="hero__bio"><?php echo esc_html($bio); ?></p>
    <?php endif; ?>
    
    <?php if ($ctaText): ?>
        <div class="hero__cta">
            <button class="btn"><?php echo esc_html($ctaText); ?></button>
        </div>
    <?php endif; ?>
</div>
