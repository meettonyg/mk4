<?php
/**
 * Contact Component Template
 * ROOT FIX: Mirrors Vue component structure exactly
 * Uses standardized data contract
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'contact-' . uniqid();
$email = $props['email'] ?? '';
$phone = $props['phone'] ?? '';
$website = $props['website'] ?? '';
$location = $props['location'] ?? '';

// Helper function to display website without protocol
function displayWebsite($website) {
    if (!$website) return '';
    return preg_replace('/^https?:\/\//', '', $website);
}
?>
<!-- ROOT FIX: Exact same structure as Vue -->
<div class="gmkb-component gmkb-component--contact" data-component-id="<?php echo esc_attr($component_id); ?>">
    <div class="component-root contact-info">
        <?php if ($email): ?>
            <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <a href="mailto:<?php echo esc_attr($email); ?>"><?php echo esc_html($email); ?></a>
            </div>
        <?php endif; ?>
        
        <?php if ($phone): ?>
            <div class="contact-item">
                <i class="fas fa-phone"></i>
                <a href="tel:<?php echo esc_attr($phone); ?>"><?php echo esc_html($phone); ?></a>
            </div>
        <?php endif; ?>
        
        <?php if ($website): ?>
            <div class="contact-item">
                <i class="fas fa-globe"></i>
                <a href="<?php echo esc_url($website); ?>" target="_blank" rel="noopener noreferrer">
                    <?php echo esc_html(displayWebsite($website)); ?>
                </a>
            </div>
        <?php endif; ?>
        
        <?php if ($location): ?>
            <div class="contact-item">
                <i class="fas fa-map-marker-alt"></i>
                <span><?php echo esc_html($location); ?></span>
            </div>
        <?php endif; ?>
    </div>
</div>
