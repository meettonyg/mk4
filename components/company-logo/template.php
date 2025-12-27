<?php
/**
 * Company Logo Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'company-logo-' . uniqid();
$logo = $props['logo'] ?? $props['data']['logo'] ?? null;
$size = $props['size'] ?? $props['data']['size'] ?? 'medium';
$alignment = $props['alignment'] ?? $props['data']['alignment'] ?? 'center';

// Size mappings
$size_map = array(
    'small' => '150px',
    'medium' => '250px',
    'large' => '350px'
);
$max_dimension = $size_map[$size] ?? '250px';

// Alignment class
$align_class = 'align-' . esc_attr($alignment);
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root company-logo-content <?php echo $logo ? 'has-logo' : 'no-logo'; ?>">
    <?php if ($logo && !empty($logo['url'])): ?>
        <div class="company-logo-container <?php echo esc_attr($align_class); ?>">
            <img
                src="<?php echo esc_url($logo['url']); ?>"
                alt="<?php echo esc_attr($logo['alt'] ?? 'Company Logo'); ?>"
                class="company-logo-image logo-size-<?php echo esc_attr($size); ?>"
                style="max-width: <?php echo esc_attr($max_dimension); ?>; max-height: <?php echo esc_attr($max_dimension); ?>;"
                loading="lazy"
            />
        </div>
    <?php else: ?>
        <div class="company-logo-placeholder">
            <i class="fa-solid fa-building"></i>
            <p>No company logo available</p>
        </div>
    <?php endif; ?>
</div>

<style>
.company-logo-content {
    width: 100%;
    padding: var(--spacing-md, 1rem);
}

.company-logo-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.75rem);
}

.company-logo-container.align-left {
    align-items: flex-start;
}

.company-logo-container.align-center {
    align-items: center;
}

.company-logo-container.align-right {
    align-items: flex-end;
}

.company-logo-image {
    width: 100%;
    height: auto;
    object-fit: contain;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.company-logo-image:hover {
    transform: scale(1.05);
    opacity: 0.9;
}

.company-logo-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl, 2rem);
    color: var(--color-text-muted, #94a3b8);
    background: var(--color-surface, #f8fafc);
    border-radius: var(--border-radius, 8px);
    border: 2px dashed var(--color-border, #e2e8f0);
}

.company-logo-placeholder i {
    font-size: 4rem;
    margin-bottom: var(--spacing-md, 1rem);
    opacity: 0.5;
}

.company-logo-placeholder p {
    margin: 0;
    font-size: var(--font-size-sm, 0.875rem);
    font-style: italic;
}

@media (max-width: 768px) {
    .company-logo-image {
        max-width: 180px !important;
    }
}
</style>
