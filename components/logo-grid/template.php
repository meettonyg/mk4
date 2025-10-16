<?php
/**
 * Logo Grid Component Template
 */
$component_id = $props['component_id'] ?? $componentId ?? 'logo-grid-' . uniqid();
$title = $props['title'] ?? 'As Featured On';
$logos = $props['logos'] ?? [];
if (!is_array($logos)) $logos = [];
?>
<div class="gmkb-component gmkb-component--logogrid" data-component-id="<?php echo esc_attr($component_id); ?>">
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
