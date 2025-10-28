<?php
/**
 * Guest Intro Component Template
 * ROOT FIX: Simplified to match data-integration.php - only displays introduction text from Pods
 * 
 * Data provided by Guest_Intro_Data_Integration::prepare_template_props():
 * - $props['introduction'] - The introduction text from Pods
 * - $props['has_intro'] - Boolean flag if intro exists
 */

// ROOT FIX: Get introduction from props (matches data-integration.php)
$introduction = '';
$has_intro = false;
$componentId = null;

if (isset($props) && is_array($props)) {
    $introduction = $props['introduction'] ?? '';
    $has_intro = $props['has_intro'] ?? false;
    $componentId = $props['component_id'] ?? $props['componentId'] ?? null;
}

// Fallback: Try to load directly from Pods if no props
if (empty($introduction) && !empty($post_id)) {
    if (function_exists('pods') && class_exists('Guest_Intro_Data_Integration')) {
        $intro_data = Guest_Intro_Data_Integration::load_component_data($post_id);
        if ($intro_data['success']) {
            $introduction = $intro_data['intro']['introduction'] ?? '';
            $has_intro = !empty($introduction);
        }
    }
}

// Set defaults
$componentId = $componentId ?? 'guest-intro-' . time();
?>
<!-- ROOT FIX: Simplified template - just displays introduction text -->
<div class="component-root intro-container">
    <?php if ($has_intro && !empty($introduction)): ?>
        <div class="guest-intro-content">
            <div class="intro-text">
                <?php echo wp_kses_post(wpautop($introduction)); ?>
            </div>
        </div>
    <?php else: ?>
        <div class="guest-intro-content guest-intro-empty">
            <p class="intro-placeholder">No introduction available. Add an introduction in the Pods 'introduction' field.</p>
        </div>
    <?php endif; ?>
</div>
