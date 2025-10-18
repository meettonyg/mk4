<?php
/**
 * Photo Gallery Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 */
$component_id = $props['component_id'] ?? $componentId ?? 'photo-gallery-' . uniqid();
$title = $props['title'] ?? 'Photo Gallery';
$photos = $props['photos'] ?? [];
if (!is_array($photos)) $photos = [];
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root photo-gallery-content">
    <?php if ($title): ?>
        <h2 class="section-title"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    <div class="photo-gallery-grid">
        <?php if (!empty($photos)): ?>
            <?php foreach ($photos as $index => $photo): ?>
                <?php $url = is_array($photo) ? ($photo['url'] ?? '') : $photo; ?>
                <?php $caption = is_array($photo) ? ($photo['caption'] ?? '') : ''; ?>
                <?php if ($url): ?>
                    <div class="photo-item">
                        <img src="<?php echo esc_url($url); ?>" alt="<?php echo esc_attr($caption ?: "Photo " . ($index + 1)); ?>" />
                        <?php if ($caption): ?>
                            <div class="photo-caption"><?php echo esc_html($caption); ?></div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
