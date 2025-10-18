<?php
/**
 * Video Intro Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 */
$component_id = $props['component_id'] ?? $componentId ?? 'video-intro-' . uniqid();
$title = $props['title'] ?? '';
$videoUrl = $props['videoUrl'] ?? $props['video_url'] ?? '';
$description = $props['description'] ?? '';
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root video-intro-content">
    <?php if ($title): ?>
        <h2 class="section-title"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    <div class="video-container">
        <?php if ($videoUrl): ?>
            <iframe src="<?php echo esc_url($videoUrl); ?>" frameborder="0" allowfullscreen class="video-embed"></iframe>
        <?php else: ?>
            <p class="video-placeholder">Add your video URL</p>
        <?php endif; ?>
    </div>
    <?php if ($description): ?>
        <p class="video-description"><?php echo esc_html($description); ?></p>
    <?php endif; ?>
</div>
