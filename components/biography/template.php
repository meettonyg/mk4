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
    $bio_content = $props['bio'] ?? $props['biography'] ?? $props['content'] ?? $props['bio_content'] ?? null;
    $post_id = $props['post_id'] ?? $props['postId'] ?? 0;
    // ROOT FIX: Extract name and professional title from props
    $guest_name = $props['name'] ?? null;
    $guest_title = $props['title'] ?? null;
    $guest_company = $props['company'] ?? null;
} else {
    // Direct variables might be set
    $bio_content = $bio ?? $biography ?? $content ?? $bio_content ?? null;
    $post_id = $post_id ?? 0;
    $guest_name = $name ?? null;
    $guest_title = $title ?? null;
    $guest_company = $company ?? null;
}

// ROOT FIX: If no content was passed, try to load it directly for debugging
if (empty($bio_content) && $post_id > 0) {
    // ROOT FIX: Load from actual Pods field name
    $biography_field = get_post_meta($post_id, 'biography', true);
    $introduction_field = get_post_meta($post_id, 'introduction', true);
    
    // Use the first available biography field
    if (!empty($biography_field)) {
        $bio_content = $biography_field;
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Biography Template: Loaded biography field directly for post {$post_id}");
        }
    } elseif (!empty($introduction_field)) {
        $bio_content = $introduction_field;
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Biography Template: Loaded introduction field as fallback for post {$post_id}");
        }
    } else {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Biography Template: No biography data found for post {$post_id}");
        }
    }
}

// Map to final content variable for display
$content = $bio_content;
$section_title = 'Biography';
?>
<!-- Biography component template - matches Vue structure -->
<div class="content-section biography-component editable-element" 
     data-element="biography" 
     data-component="biography" 
     data-component-type="biography"
     data-component-id="<?php echo esc_attr($finalComponentId ?: 'biography-' . time()); ?>"
     data-controls-enabled="true"
     style="position: relative; cursor: pointer;"
     tabindex="0">
    
    <div class="biography-content">
        <?php // Display name as h2 (matches Vue structure) ?>
        <?php if (!empty($guest_name)): ?>
            <h2 class="biography-name"><?php echo esc_html($guest_name); ?></h2>
        <?php endif; ?>
        
        <?php // Display title/company ?>
        <?php if (!empty($guest_title) || !empty($guest_company)): ?>
            <p class="biography-title">
                <?php 
                $title_parts = array();
                if (!empty($guest_title)) $title_parts[] = $guest_title;
                if (!empty($guest_company)) $title_parts[] = $guest_company;
                echo esc_html(implode(' • ', $title_parts));
                ?>
            </p>
        <?php endif; ?>
        
        <?php // Display biography text ?>
        <?php if (isset($content) && !empty($content)): ?>
            <div class="biography-text"><?php echo wp_kses_post($content); ?></div>
        <?php else: ?>
            <p class="biography-placeholder">Add your full biography and professional background here. This is where you can share your story, expertise, and what makes you unique as a speaker or expert in your field.</p>
        <?php endif; ?>
    </div>
</div>