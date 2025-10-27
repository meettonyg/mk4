<?php
/**
 * Biography Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 * This prevents double-wrapper issue
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'bio-' . uniqid();
$name = $props['name'] ?? '';
$title = $props['title'] ?? '';
$biography = $props['biography'] ?? $props['bio'] ?? $props['bio_content'] ?? '';
$company = $props['company'] ?? '';
$location = $props['location'] ?? '';

// ROOT FIX: AGGRESSIVE debugging to see what data we actually have
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('========== BIOGRAPHY TEMPLATE DEBUG ==========');
    error_log('Component ID: ' . $component_id);
    error_log('Available props keys: ' . implode(', ', array_keys($props)));
    error_log('Name: ' . ($name ?: 'EMPTY'));
    error_log('Title: ' . ($title ?: 'EMPTY'));
    error_log('Company: ' . ($company ?: 'EMPTY'));
    error_log('Location: ' . ($location ?: 'EMPTY'));
    error_log('Biography length: ' . strlen($biography));
    error_log('Biography preview: ' . substr($biography, 0, 100));
    error_log('Post ID: ' . ($props['post_id'] ?? 'NO POST ID'));
    error_log('==============================================');
}

// Build display title - only show if there's content
// Match Vue component logic: title, then company with separator if both exist
$display_title = '';
if ($title && $company) {
    $display_title = $title . ' • ' . $company;
} elseif ($title) {
    $display_title = $title;
} elseif ($company) {
    $display_title = $company;
}
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root biography-content">
    <?php if ($name): ?>
        <h2 class="biography-name"><?php echo esc_html($name); ?></h2>
    <?php endif; ?>
    
    <?php if ($display_title): ?>
        <p class="biography-title"><?php echo esc_html($display_title); ?></p>
    <?php endif; ?>
    
    <?php if ($location): ?>
        <p class="biography-location">📍 <?php echo esc_html($location); ?></p>
    <?php endif; ?>
    
    <?php if ($biography): ?>
        <div class="biography-text"><?php echo wpautop(wp_kses_post($biography)); ?></div>
    <?php else: ?>
        <div class="biography-placeholder" style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc; border-radius: 8px;">
            <p><strong>Biography Component - No Data Available</strong></p>
            <p style="font-size: 14px; color: #666;">This component is waiting for biography data from Pods.</p>
            <?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
                <details style="margin-top: 10px; font-size: 12px; color: #999;">
                    <summary>Debug Info (WP_DEBUG mode)</summary>
                    <pre><?php echo esc_html(print_r($props, true)); ?></pre>
                </details>
            <?php endif; ?>
        </div>
    <?php endif; ?>
</div>
