<?php
/**
 * Social Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 */

// Data contract - standardized variable names
$component_id = $props['component_id'] ?? $componentId ?? 'social-' . uniqid();
$links = $props['links'] ?? [];

// Ensure links is an array
if (!is_array($links)) {
    $links = [];
}

// Helper function to get social icon class
function getSocialIcon($platform) {
    $icons = [
        'facebook' => 'fab fa-facebook-f',
        'twitter' => 'fab fa-twitter',
        'linkedin' => 'fab fa-linkedin-in',
        'instagram' => 'fab fa-instagram',
        'youtube' => 'fab fa-youtube',
        'github' => 'fab fa-github',
        'pinterest' => 'fab fa-pinterest',
        'tiktok' => 'fab fa-tiktok'
    ];
    $lowerPlatform = strtolower($platform);
    return $icons[$lowerPlatform] ?? 'fas fa-link';
}
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root social-links">
        <?php if (!empty($links)): ?>
            <?php foreach ($links as $link): ?>
                <?php
                $url = is_array($link) ? ($link['url'] ?? '#') : '#';
                $platform = is_array($link) ? ($link['platform'] ?? 'Link') : 'Link';
                ?>
                <a href="<?php echo esc_url($url); ?>" 
                   title="<?php echo esc_attr($platform); ?>"
                   class="social-link"
                   target="_blank"
                   rel="noopener noreferrer">
                    <i class="<?php echo esc_attr(getSocialIcon($platform)); ?>"></i>
                </a>
            <?php endforeach; ?>
        <?php endif; ?>
</div>
