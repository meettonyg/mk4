<?php
/**
 * Biography Component Template
 * ROOT FIX: Enhanced with proper control attachment support
 */

// ROOT FIX: Ensure component ID is always available - DO NOT generate new ID here
// The ID should be passed from the parent context
$finalComponentId = isset($component_id) ? $component_id : (isset($id) ? $id : (isset($componentId) ? $componentId : ''));
if (empty($finalComponentId)) {
    // This should not happen if the component is loaded properly
    error_log('WARNING: Biography template loaded without component ID!');
    $finalComponentId = 'biography-error-' . uniqid();
}
?>
<div class="content-section biography-component editable-element" 
     data-element="biography" 
     data-component="biography" 
     data-component-type="biography"
     data-controls-enabled="true"
     style="position: relative; cursor: pointer;"
     tabindex="0">
    
    <h2 class="section-title"><?php echo isset($title) ? esc_html($title) : 'About Me'; ?></h2>
    <div class="biography-content">
        <?php if (isset($content) && !empty($content)): ?>
            <p><?php echo wp_kses_post($content); ?></p>
        <?php else: ?>
            <p>Add your full biography and professional background here. This is where you can share your story, expertise, and what makes you unique as a speaker or expert in your field.</p>
        <?php endif; ?>
    </div>
</div>