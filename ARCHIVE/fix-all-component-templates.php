<?php
/**
 * ROOT FIX: Clean all component templates to remove legacy controls
 * Run this script to ensure all component templates are clean
 */

$components_dir = __DIR__ . '/components';
$components = scandir($components_dir);

echo "ROOT FIX: Cleaning all component templates...\n\n";

foreach ($components as $component) {
    if ($component === '.' || $component === '..') continue;
    
    $template_path = $components_dir . '/' . $component . '/template.php';
    
    if (file_exists($template_path)) {
        $content = file_get_contents($template_path);
        $original_content = $content;
        
        // Check if template contains any control-related includes or HTML
        $has_controls = false;
        $patterns = [
            '/include.*component-controls\.php/',
            '/include.*partials.*controls/',
            '/class="element-controls"/',
            '/class="control-btn"/',
            '/\<div[^>]*controls[^>]*\>/',
            '/Move Up/',
            '/Move Down/',
            '/Duplicate/',
            '/Delete/'
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $content)) {
                $has_controls = true;
                break;
            }
        }
        
        if ($has_controls) {
            echo "❌ {$component}: Found legacy controls\n";
            
            // Add comment about controls being added by JS
            if (!strpos($content, 'controls added dynamically by JS')) {
                $content = preg_replace(
                    '/(\<\?php[\s\S]*?\?\>)/',
                    '$1' . "\n<!-- " . ucfirst($component) . " component template - controls added dynamically by JS -->",
                    $content,
                    1
                );
            }
            
            // Ensure root element has proper data attributes
            $content = preg_replace(
                '/\<div\s+class="([^"]*)"/',
                '<div class="$1"' . "\n" .
                '     data-element="' . $component . '"' . "\n" .
                '     data-component="' . $component . '"' . "\n" .
                '     data-component-type="' . $component . '"' . "\n" .
                '     data-controls-enabled="true"' . "\n" .
                '     style="position: relative; cursor: pointer;"' . "\n" .
                '     tabindex="0"',
                $content,
                1
            );
            
            echo "   ✅ Would update template structure\n";
            
        } else {
            echo "✅ {$component}: Clean template\n";
        }
    }
}

echo "\n\nTo apply fixes, review the changes and update templates manually.\n";
