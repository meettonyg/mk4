<?php
/**
 * Biography Component Template
 * COMPLIANT: Clean template that receives data from server-side rendering
 * No fallback loading - data should be provided by the rendering system
 */

// Component ID should be passed from parent context
$finalComponentId = isset($component_id) ? $component_id : (isset($id) ? $id : (isset($componentId) ? $componentId : ''));

// Handle props data structure from server-side rendering
if (isset($props) && is_array($props)) {
    // Extract bio from props - check multiple possible fields
    $bio_content = $props['bio'] ?? $props['biography'] ?? $props['content'] ?? null;
    $post_id = $props['post_id'] ?? $props['postId'] ?? 0;
} else {
    // Direct variables might be set
    $bio_content = $bio ?? $biography ?? $content ?? null;
    $post_id = $post_id ?? 0;
}

// Map to final content variable for display
$content = $bio_content;
$title = $title ?? 'Biography';
?>
<!-- Biography component template - controls added dynamically by JS -->
<div class="content-section biography-component editable-element" 
     data-element="biography" 
     data-component="biography" 
     data-component-type="biography"
     data-component-id="<?php echo esc_attr($finalComponentId ?: 'biography-' . time()); ?>"
     data-controls-enabled="true"
     style="position: relative; cursor: pointer;"
     tabindex="0">
    
    <h2 class="section-title"><?php echo isset($title) ? esc_html($title) : 'Biography'; ?></h2>
    <div class="biography-content">
        <?php if (isset($content) && !empty($content)): ?>
            <p><?php echo wp_kses_post($content); ?></p>
        <?php else: ?>
            <p class="biography-placeholder">Add your full biography and professional background here. This is where you can share your story, expertise, and what makes you unique as a speaker or expert in your field.</p>
        <?php endif; ?>
    </div>
</div>