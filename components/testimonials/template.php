<?php
/**
 * Testimonials Component Template
 */

// ROOT FIX: Handle props data structure
if (isset($props) && is_array($props)) {
    // Extract from props array
    $title = $props['title'] ?? null;
    $description = $props['description'] ?? null;
    $testimonials = $props['testimonials'] ?? null;
    $componentId = $props['component_id'] ?? $props['componentId'] ?? null;
} else {
    // Direct variables might be set
    $title = $title ?? null;
    $description = $description ?? null;
    $testimonials = $testimonials ?? null;
    $componentId = $componentId ?? $id ?? null;
}

// Set defaults
$title = $title ?? 'Testimonials';
$componentId = $componentId ?? 'testimonials-' . time();
?>
<div class="testimonials-component editable-element" data-element="testimonials" data-component="testimonials" data-component-id="<?php echo esc_attr($componentId ?? $id ?? ''); ?>" data-component-type="testimonials">
    <div class="element-controls">
        <button class="control-btn" title="Move Up">↑</button>
        <button class="control-btn" title="Move Down">↓</button>
        <button class="control-btn" title="Duplicate">⧉</button>
        <button class="control-btn" title="Delete">×</button>
    </div>
    <h2 class="testimonials-title"><?php echo $title ?? 'Testimonials'; ?></h2>
    <?php if (isset($description)): ?>
        <div class="testimonials-description"><?php echo $description; ?></div>
    <?php endif; ?>
    
    <div class="testimonials-grid">
        <?php if (isset($testimonials) && !empty($testimonials)): ?>
            <?php foreach ($testimonials as $testimonial): ?>
                <div class="testimonial-item">
                    <div class="testimonial-content">
                        <div class="testimonial-quote-icon">❝</div>
                        <div class="testimonial-text"><?php echo $testimonial['text']; ?></div>
                    </div>
                    <div class="testimonial-author">
                        <?php if (isset($testimonial['authorImage']) && !empty($testimonial['authorImage'])): ?>
                            <div class="testimonial-author-image">
                                <img src="<?php echo $testimonial['authorImage']; ?>" alt="<?php echo $testimonial['authorName']; ?>">
                            </div>
                        <?php endif; ?>
                        <div class="testimonial-author-info">
                            <div class="testimonial-author-name"><?php echo $testimonial['authorName']; ?></div>
                            <?php if (isset($testimonial['authorTitle'])): ?>
                                <div class="testimonial-author-title"><?php echo $testimonial['authorTitle']; ?></div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="testimonials-placeholder">
                <p>Add testimonials from clients, colleagues, or partners.</p>
                <button class="add-testimonial-btn">+ Add Testimonial</button>
            </div>
        <?php endif; ?>
    </div>
    
    <?php if (isset($testimonials) && !empty($testimonials)): ?>
        <button class="add-testimonial-btn">+ Add Testimonial</button>
    <?php endif; ?>
</div>