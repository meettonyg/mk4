<?php
/**
 * Biography Component Template - SIMPLIFIED
 * SINGLE RESPONSIBILITY: Display biography text only
 * Other fields (name, title, location) moved to separate components
 */

// Extract biography text from props
$biography = $props['biography'] ?? $props['bio'] ?? $props['bio_content'] ?? $props['content'] ?? '';

// Debug logging (if WP_DEBUG enabled)
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('========== BIOGRAPHY TEMPLATE (SIMPLIFIED) ==========');
    error_log('Biography length: ' . strlen($biography));
    error_log('Has content: ' . (!empty($biography) ? 'YES' : 'NO'));
    error_log('====================================================');
}
?>
<!-- SIMPLIFIED BIOGRAPHY: Text content only -->
<!-- TEMPLATE VERSION: 2025-10-27-simplified -->
<div class="component-root biography-component">
    <?php if (!empty($biography)): ?>
        <div class="biography-text"><?php echo wpautop(wp_kses_post($biography)); ?></div>
    <?php else: ?>
        <div class="biography-placeholder">
            <p>No biography available.</p>
        </div>
    <?php endif; ?>
</div>
