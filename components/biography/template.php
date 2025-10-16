<?php
/**
 * Biography Component Template
 * ROOT FIX: Mirrors Vue component structure exactly
 * Uses standardized data contract
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'bio-' . uniqid();
$name = $props['name'] ?? '';
$title = $props['title'] ?? '';
$biography = $props['biography'] ?? $props['bio'] ?? '';
$company = $props['company'] ?? '';

// Combine title and company
$display_title = $title;
if ($company) {
    $display_title .= $company ? " • $company" : '';
}
?>
<!-- ROOT FIX: Exact same structure as Vue -->
<div class="gmkb-component gmkb-component--biography" data-component-id="<?php echo esc_attr($component_id); ?>">
    <div class="biography-content">
        <?php if ($name): ?>
            <h2 class="biography-name"><?php echo esc_html($name); ?></h2>
        <?php endif; ?>
        
        <?php if ($display_title): ?>
            <p class="biography-title"><?php echo esc_html($display_title); ?></p>
        <?php endif; ?>
        
        <?php if ($biography): ?>
            <div class="biography-text"><?php echo wpautop(wp_kses_post($biography)); ?></div>
        <?php else: ?>
            <p class="biography-placeholder">Add your full biography and professional background here.</p>
        <?php endif; ?>
    </div>
</div>
