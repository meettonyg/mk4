<?php
/**
 * Stats Component Template
 * ROOT FIX: Mirrors Vue component structure exactly
 * Uses standardized data contract
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
<!-- ROOT FIX: Exact same structure as Vue -->
<div class="gmkb-component gmkb-component--stats" data-component-id="<?php echo esc_attr($component_id); ?>">
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
