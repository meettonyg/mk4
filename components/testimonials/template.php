<?php
/**
 * Testimonials Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'testimonials-' . uniqid();
$title = $props['title'] ?? 'What People Say';
$testimonials = $props['testimonials'] ?? [];

// Ensure testimonials is an array
if (!is_array($testimonials)) {
    $testimonials = [];
}
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root testimonials-content">
    <?php if ($title): ?>
        <h2 class="section-title"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    
    <div class="testimonials-grid">
        <?php if (!empty($testimonials)): ?>
            <?php foreach ($testimonials as $testimonial): ?>
                <?php
                $text = is_array($testimonial) ? ($testimonial['text'] ?? '') : '';
                $author = is_array($testimonial) ? ($testimonial['author'] ?? 'Client') : 'Client';
                $author_title = is_array($testimonial) ? ($testimonial['title'] ?? '') : '';
                ?>
                <?php if ($text): ?>
                    <div class="testimonial-item">
                        <div class="testimonial-quote">"<?php echo esc_html($text); ?>"</div>
                        <div class="testimonial-author">
                            <div class="author-name"><?php echo esc_html($author); ?></div>
                            <?php if ($author_title): ?>
                                <div class="author-title"><?php echo esc_html($author_title); ?></div>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="testimonials-placeholder">Add testimonials here.</p>
        <?php endif; ?>
    </div>
</div>
