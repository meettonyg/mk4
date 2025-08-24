<?php
/**
 * Biography Component Template
 * ROOT FIX: Clean template without any controls - controls added by component-controls-manager.js
 */

// ROOT FIX: Component ID should be passed from parent context
$finalComponentId = isset($component_id) ? $component_id : (isset($id) ? $id : (isset($componentId) ? $componentId : ''));
?>
<!-- Biography component template - controls added dynamically by JS -->
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