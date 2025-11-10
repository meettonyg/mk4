<?php
/**
 * Logo Grid Component Template
 * ROOT FIX: Template outputs CONTENT ONLY - parent system provides wrapper
 * ✅ PHASE 1B: Frontend layout support - reads layoutStyle, columns, logoNameStyle
 */

// Component identification
$component_id = $props['component_id'] ?? $componentId ?? 'logo-grid-' . uniqid();

// ✅ PHASE 1B: Extract layout data with defaults
$title = $props['title'] ?? 'As Featured On';
$logos = $props['logos'] ?? [];
if (!is_array($logos)) $logos = [];

$layoutStyle = $props['layoutStyle'] ?? 'grid';
$columns = $props['columns'] ?? 'auto';
$logoNameStyle = $props['logoNameStyle'] ?? 'below';
$carouselSettings = $props['carouselSettings'] ?? null;

// ✅ PHASE 1B: Build CSS classes array (mirrors Vue renderer)
$grid_classes = ['logo-grid', "logo-grid--{$layoutStyle}"];
if ($layoutStyle !== 'carousel') {
    $grid_classes[] = "logo-grid--columns-{$columns}";
}

// ✅ PHASE 1B: Debug logging (when WP_DEBUG enabled)
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ Logo Grid Template - Component: ' . $component_id);
    error_log('  - Layout Style: ' . $layoutStyle);
    error_log('  - Columns: ' . $columns);
    error_log('  - Logo Name Style: ' . $logoNameStyle);
    error_log('  - Logos Count: ' . count($logos));
    error_log('  - CSS Classes: ' . implode(' ', $grid_classes));
}
?>
<!-- ROOT FIX: Inner content only - outer wrapper provided by system -->
<div class="component-root logo-grid-content">
    <?php if ($title): ?>
        <h2 class="section-title"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    
    <!-- ✅ PHASE 1B: Dynamic layout classes + data attributes -->
    <div class="<?php echo esc_attr(implode(' ', $grid_classes)); ?>"
         data-layout-style="<?php echo esc_attr($layoutStyle); ?>"
         data-logo-name-style="<?php echo esc_attr($logoNameStyle); ?>">
        
        <?php if (!empty($logos)): ?>
            <?php foreach ($logos as $index => $logo): ?>
                <?php
                // Extract logo properties (handle both array and string)
                $url = is_array($logo) ? ($logo['url'] ?? '') : $logo;
                $name = is_array($logo) ? ($logo['name'] ?? '') : '';
                $alt = is_array($logo) ? ($logo['alt'] ?? '') : '';
                $link = is_array($logo) ? ($logo['link'] ?? '') : '';
                $linkNewTab = is_array($logo) ? ($logo['linkNewTab'] ?? false) : false;
                
                // Skip if no URL
                if (!$url) continue;
                
                // Determine alt text (priority: alt > name > generic)
                $alt_text = $alt ?: ($name ?: "Logo " . ($index + 1));
                ?>
                
                <?php if ($link): ?>
                    <!-- Logo with link -->
                    <a href="<?php echo esc_url($link); ?>" 
                       class="logo-item"
                       <?php if ($linkNewTab): ?>target="_blank" rel="noopener noreferrer"<?php endif; ?>>
                        <img src="<?php echo esc_url($url); ?>" 
                             alt="<?php echo esc_attr($alt_text); ?>" 
                             <?php if ($name): ?>title="<?php echo esc_attr($name); ?>"<?php endif; ?> />
                        
                        <?php if ($name): ?>
                            <div class="logo-name"><?php echo esc_html($name); ?></div>
                        <?php endif; ?>
                        
                        <?php if ($linkNewTab): ?>
                            <div class="external-link-indicator" title="Opens in new tab">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </div>
                        <?php endif; ?>
                    </a>
                <?php else: ?>
                    <!-- Logo without link -->
                    <div class="logo-item">
                        <img src="<?php echo esc_url($url); ?>" 
                             alt="<?php echo esc_attr($alt_text); ?>" 
                             <?php if ($name): ?>title="<?php echo esc_attr($name); ?>"<?php endif; ?> />
                        
                        <?php if ($name): ?>
                            <div class="logo-name"><?php echo esc_html($name); ?></div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
                
            <?php endforeach; ?>
        <?php else: ?>
            <!-- Empty state -->
            <div class="logo-grid-empty">
                <p>No logos to display.</p>
            </div>
        <?php endif; ?>
    </div>
</div>
