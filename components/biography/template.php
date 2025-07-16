<?php
/**
 * Biography Component Template
 */
?>
<div class="content-section biography-component editable-element" data-element="biography" data-component="biography" data-component-id="<?php echo esc_attr($componentId ?? $id ?? ''); ?>" data-component-type="biography">
    <!-- ROOT FIX: Controls now created dynamically by JavaScript - no server-side duplication -->
    <h2 class="section-title"><?php echo isset($title) ? esc_html($title) : 'About Me'; ?></h2>
    <div class="biography-content">
        <?php if (isset($content) && !empty($content)): ?>
            <p><?php echo wp_kses_post($content); ?></p>
        <?php else: ?>
            <p>Add your full biography and professional background here. This is where you can share your story, expertise, and what makes you unique as a speaker or expert in your field.</p>
        <?php endif; ?>
    </div>
</div>