<?php
/**
 * Logo Grid Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 */
$component_id = $props['component_id'] ?? $componentId ?? 'logo-grid-' . uniqid();
$title = $props['title'] ?? 'As Featured On';
$logos = $props['logos'] ?? [];
if (!is_array($logos)) $logos = [];
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root logo-grid-content">
    <?php if ($title): ?>
        <h2 class="section-title"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    <div class="logo-grid">
        <?php if (!empty($logos)): ?>
            <?php foreach ($logos as $index => $logo): ?>
                <?php $url = is_array($logo) ? ($logo['url'] ?? '') : $logo; ?>
                <?php $name = is_array($logo) ? ($logo['name'] ?? '') : ''; ?>
                <?php if ($url): ?>
                    <div class="logo-item">
                        <img src="<?php echo esc_url($url); ?>" alt="<?php echo esc_attr($name ?: "Logo " . ($index + 1)); ?>" />
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
