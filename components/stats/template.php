<?php
/**
 * Stats Component Template
 */

// ROOT FIX: Handle props data structure
if (isset($props) && is_array($props)) {
    // Extract from props array
    $title = $props['title'] ?? null;
    $stats = $props['stats'] ?? null;
    $componentId = $props['component_id'] ?? $props['componentId'] ?? null;
} else {
    // Direct variables might be set
    $title = $title ?? null;
    $stats = $stats ?? null;
    $componentId = $componentId ?? $id ?? null;
}

// Set defaults
$title = $title ?? 'Key Statistics';
$componentId = $componentId ?? 'stats-' . time();
?>
<div class="content-section editable-element" data-element="stats" data-component="stats" data-component-id="<?php echo esc_attr($componentId ?? $id ?? ''); ?>" data-component-type="stats">
    <div class="element-controls">
        <button class="control-btn" title="Move Up">↑</button>
        <button class="control-btn" title="Move Down">↓</button>
        <button class="control-btn" title="Duplicate">⧉</button>
        <button class="control-btn" title="Delete">×</button>
    </div>
    <h2 class="section-title"><?php echo esc_html($title ?? 'Key Statistics'); ?></h2>
    <div class="stats-grid">
        <?php if (isset($stats) && !empty($stats)): ?>
            <?php foreach ($stats as $stat): ?>
                <div class="stat-item">
                    <span class="stat-item__number"><?php echo esc_html($stat['value']); ?></span>
                    <div class="stat-item__label"><?php echo esc_html($stat['label']); ?></div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="stat-item">
                <span class="stat-item__number">1.2M</span>
                <div class="stat-item__label">Followers</div>
            </div>
            <div class="stat-item">
                <span class="stat-item__number">150+</span>
                <div class="stat-item__label">Podcast Shows</div>
            </div>
            <div class="stat-item">
                <span class="stat-item__number">500K</span>
                <div class="stat-item__label">Downloads</div>
            </div>
            <div class="stat-item">
                <span class="stat-item__number">5</span>
                <div class="stat-item__label">Years Experience</div>
            </div>
        <?php endif; ?>
    </div>
</div>
