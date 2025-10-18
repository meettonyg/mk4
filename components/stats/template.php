<?php
/**
 * Stats Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'stats-' . uniqid();
$title = $props['title'] ?? 'By The Numbers';
$stats = $props['stats'] ?? [];

// Ensure stats is an array
if (!is_array($stats)) {
    $stats = [];
}
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root stats-content">
    <?php if ($title): ?>
        <h2 class="section-title"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    
    <div class="stats-container">
        <?php if (!empty($stats)): ?>
            <?php foreach ($stats as $stat): ?>
                <?php
                $value = is_array($stat) ? ($stat['value'] ?? '') : '';
                $label = is_array($stat) ? ($stat['label'] ?? '') : '';
                ?>
                <?php if ($value && $label): ?>
                    <div class="stat-item">
                        <div class="stat-value"><?php echo esc_html($value); ?></div>
                        <div class="stat-label"><?php echo esc_html($label); ?></div>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="stats-placeholder">Add your statistics here.</p>
        <?php endif; ?>
    </div>
</div>
