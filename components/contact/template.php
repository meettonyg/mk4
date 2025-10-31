<?php
/**
 * Contact Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'contact-' . uniqid();
$email = $props['email'] ?? '';
$phone = $props['phone'] ?? '';
$skype = $props['skype'] ?? '';
$location = $props['location'] ?? '';

// Helper function removed - no longer needed without website field
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
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
        
        <?php if ($skype): ?>
            <div class="contact-item">
                <i class="fab fa-skype"></i>
                <a href="skype:<?php echo esc_attr($skype); ?>?chat"><?php echo esc_html($skype); ?></a>
            </div>
        <?php endif; ?>
        
        <?php if ($location): ?>
            <div class="contact-item">
                <i class="fas fa-map-marker-alt"></i>
                <span><?php echo esc_html($location); ?></span>
            </div>
        <?php endif; ?>
</div>
