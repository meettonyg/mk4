<?php
/**
 * Call to Action Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 * This prevents double-wrapper issue
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'cta-' . uniqid();
$title = $props['title'] ?? 'Ready to Take Action?';
$description = $props['description'] ?? '';
$buttons = $props['buttons'] ?? [];

// Ensure buttons is an array
if (!is_array($buttons)) {
    $buttons = [];
}
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root cta-content">
    <?php if ($title): ?>
        <h2 class="cta-title"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    
    <?php if ($description): ?>
        <p class="cta-description"><?php echo esc_html($description); ?></p>
    <?php endif; ?>
    
    <div class="cta-buttons">
        <?php if (!empty($buttons)): ?>
            <?php foreach ($buttons as $button): ?>
                <?php
                $text = is_array($button) ? ($button['text'] ?? 'Click Here') : 'Click Here';
                $url = is_array($button) ? ($button['url'] ?? '#') : '#';
                $style = is_array($button) ? ($button['style'] ?? 'primary') : 'primary';
                $target = is_array($button) ? ($button['target'] ?? '_self') : '_self';
                ?>
                <a href="<?php echo esc_url($url); ?>" 
                   class="cta-button <?php echo esc_attr($style); ?>"
                   target="<?php echo esc_attr($target); ?>">
                    <?php echo esc_html($text); ?>
                </a>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
