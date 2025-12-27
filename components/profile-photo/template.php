<?php
/**
 * Profile Photo Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'profile-photo-' . uniqid();
$photo = $props['photo'] ?? $props['data']['photo'] ?? null;
$size = $props['size'] ?? $props['data']['size'] ?? 'medium';
$shape = $props['shape'] ?? $props['data']['shape'] ?? 'circle';
$alignment = $props['settings']['advanced']['layout']['alignment'] ?? $props['alignment'] ?? $props['data']['alignment'] ?? 'center';

// Size mappings
$size_map = array(
    'small' => '150px',
    'medium' => '250px',
    'large' => '350px'
);
$max_dimension = $size_map[$size] ?? '250px';

// Alignment class
$align_class = 'align-' . esc_attr($alignment);

// Shape class
$shape_class = 'photo-shape-' . esc_attr($shape);

// Check if photo has a valid URL
$has_photo = $photo && !empty($photo['url']);
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root profile-photo-content <?php echo $has_photo ? 'has-photo' : 'no-photo'; ?>">
    <?php if ($has_photo): ?>
        <div class="profile-photo-container <?php echo esc_attr($align_class); ?>">
            <img
                src="<?php echo esc_url($photo['url']); ?>"
                alt="<?php echo esc_attr($photo['alt'] ?? 'Profile Photo'); ?>"
                class="profile-photo-image <?php echo esc_attr($shape_class); ?> photo-size-<?php echo esc_attr($size); ?>"
                style="max-width: <?php echo esc_attr($max_dimension); ?>; max-height: <?php echo esc_attr($max_dimension); ?>;"
                loading="lazy"
            />
            <?php if (!empty($photo['caption'])): ?>
                <p class="profile-photo-caption"><?php echo esc_html($photo['caption']); ?></p>
            <?php endif; ?>
        </div>
    <?php else: ?>
        <div class="profile-photo-placeholder">
            <i class="fa-solid fa-user-circle"></i>
            <p>No profile photo available</p>
        </div>
    <?php endif; ?>
</div>

<style>
.profile-photo-content {
    width: 100%;
    padding: var(--spacing-md, 1rem);
}

.profile-photo-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.75rem);
}

.profile-photo-container.align-left {
    align-items: flex-start;
}

.profile-photo-container.align-center {
    align-items: center;
}

.profile-photo-container.align-right {
    align-items: flex-end;
}

.profile-photo-image {
    width: 100%;
    height: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    object-fit: cover;
    aspect-ratio: 1 / 1;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Shape variations */
.profile-photo-image.photo-shape-circle {
    border-radius: 50%;
}

.profile-photo-image.photo-shape-square {
    border-radius: 0;
}

.profile-photo-image.photo-shape-rounded {
    border-radius: 16px;
}

.profile-photo-image:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.profile-photo-caption {
    margin: 0;
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-text-muted, #64748b);
    text-align: center;
    max-width: 300px;
}

.profile-photo-placeholder {
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

.profile-photo-placeholder i {
    font-size: 4rem;
    margin-bottom: var(--spacing-md, 1rem);
    opacity: 0.5;
}

.profile-photo-placeholder p {
    margin: 0;
    font-size: var(--font-size-sm, 0.875rem);
    font-style: italic;
}

@media (max-width: 768px) {
    .profile-photo-image {
        max-width: 200px !important;
    }

    .profile-photo-caption {
        max-width: 200px;
    }
}
</style>
