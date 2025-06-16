<?php
/**
 * Social Component Template
 */
// Default social links if none provided
$defaultLinks = [
    ['url' => '#', 'title' => 'Twitter', 'icon' => 'twitter'],
    ['url' => '#', 'title' => 'LinkedIn', 'icon' => 'linkedin'],
    ['url' => '#', 'title' => 'Instagram', 'icon' => 'instagram']
];
$socialLinks = $links ?? $defaultLinks;
?>
<div class="social-links editable-element" data-element="social" data-component="social" data-component-id="<?php echo esc_attr($componentId); ?>" data-component-type="social">
    <div class="element-controls">
        <button class="control-btn" title="Move Up">↑</button>
        <button class="control-btn" title="Move Down">↓</button>
        <button class="control-btn" title="Duplicate">⧉</button>
        <button class="control-btn" title="Delete">×</button>
    </div>
    <?php foreach ($socialLinks as $link): ?>
        <a href="<?php echo esc_url($link['url']); ?>" class="social-link" title="<?php echo esc_attr($link['title']); ?>">
            <?php if ($link['icon'] === 'twitter' || $link['title'] === 'Twitter'): ?>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
            <?php elseif ($link['icon'] === 'linkedin' || $link['title'] === 'LinkedIn'): ?>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                </svg>
            <?php elseif ($link['icon'] === 'instagram' || $link['title'] === 'Instagram'): ?>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
            <?php else: ?>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                </svg>
            <?php endif; ?>
        </a>
    <?php endforeach; ?>
</div>
