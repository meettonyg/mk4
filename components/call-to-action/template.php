<?php
/**
 * Call to Action Component Template
 */

// ROOT FIX: Handle props data structure
if (isset($props) && is_array($props)) {
    // Extract from props array
    $title = $props['title'] ?? null;
    $description = $props['description'] ?? null;
    $buttonText = $props['buttonText'] ?? null;
    $buttonUrl = $props['buttonUrl'] ?? null;
    $buttonTarget = $props['buttonTarget'] ?? null;
    $componentId = $props['component_id'] ?? $props['componentId'] ?? null;
} else {
    // Direct variables might be set
    $title = $title ?? null;
    $description = $description ?? null;
    $buttonText = $buttonText ?? null;
    $buttonUrl = $buttonUrl ?? null;
    $buttonTarget = $buttonTarget ?? null;
    $componentId = $componentId ?? $id ?? null;
}

// Set defaults
$componentId = $componentId ?? 'cta-' . time();
?>
<div class="cta-component editable-element" data-element="call-to-action" data-component="call-to-action" data-component-id="<?php echo esc_attr($componentId ?? $id ?? ''); ?>" data-component-type="call-to-action">
    <!-- ROOT FIX: Controls now created dynamically by JavaScript - no server-side duplication -->
    <?php if (isset($title) || isset($description) || isset($buttonText) || isset($buttonUrl)): ?>
        <div class="cta-content">
            <?php if (isset($title)): ?>
                <h2 class="cta-title"><?php echo $title; ?></h2>
            <?php endif; ?>
            
            <?php if (isset($description)): ?>
                <div class="cta-description"><?php echo $description; ?></div>
            <?php endif; ?>
            
            <?php if (isset($buttonText) && isset($buttonUrl)): ?>
                <a href="<?php echo $buttonUrl; ?>" class="cta-button" target="<?php echo $buttonTarget ?? '_self'; ?>">
                    <?php echo $buttonText; ?>
                </a>
            <?php endif; ?>
        </div>
    <?php else: ?>
        <div class="cta-placeholder">
            <h2 class="cta-placeholder-title">Add a Call to Action</h2>
            <p class="cta-placeholder-text">Create a compelling call to action to prompt visitors to engage with you.</p>
            <button class="cta-edit-btn">Edit Call to Action</button>
        </div>
    <?php endif; ?>
</div>