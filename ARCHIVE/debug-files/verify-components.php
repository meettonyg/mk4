<?php
/**
 * Component Architecture Verification Script
 * 
 * Run this script to verify all components are properly configured
 * Usage: php verify-components.php
 */

$components_dir = __DIR__ . '/components/';
$required_components = [
    'hero', 'biography', 'topics', 'contact', 'social',
    'testimonials', 'call-to-action', 'questions', 'stats',
    'video-intro', 'photo-gallery', 'podcast-player',
    'booking-calendar', 'authority-hook', 'guest-intro', 'logo-grid'
];

$results = [];
$errors = [];

echo "🔍 Verifying Component Architecture\n";
echo str_repeat("=", 50) . "\n\n";

foreach ($required_components as $component) {
    $component_path = $components_dir . $component . '/';
    $status = [
        'name' => $component,
        'directory' => false,
        'manifest' => false,
        'vue_renderer' => false,
        'php_template' => false,
        'schema' => false,
        'styles' => false,
        'manifest_valid' => false
    ];
    
    // Check directory exists
    if (is_dir($component_path)) {
        $status['directory'] = true;
        
        // Check for component.json
        $manifest_path = $component_path . 'component.json';
        if (file_exists($manifest_path)) {
            $status['manifest'] = true;
            
            // Validate manifest
            $manifest_content = file_get_contents($manifest_path);
            $manifest = json_decode($manifest_content, true);
            
            if ($manifest && isset($manifest['type']) && $manifest['type'] === $component) {
                $status['manifest_valid'] = true;
                
                // Check for Vue renderer
                if (isset($manifest['renderers']['vue'])) {
                    $vue_file = $component_path . $manifest['renderers']['vue'];
                    $status['vue_renderer'] = file_exists($vue_file);
                }
                
                // Check for PHP template
                if (isset($manifest['renderers']['php'])) {
                    $php_file = $component_path . $manifest['renderers']['php'];
                    $status['php_template'] = file_exists($php_file);
                }
                
                // Check for schema
                if (isset($manifest['schema'])) {
                    $schema_file = $component_path . $manifest['schema'];
                    $status['schema'] = file_exists($schema_file);
                }
                
                // Check for styles
                if (isset($manifest['styles'])) {
                    $styles_file = $component_path . $manifest['styles'];
                    $status['styles'] = file_exists($styles_file);
                }
            } else {
                $errors[] = "Invalid manifest for $component";
            }
        }
    }
    
    $results[$component] = $status;
}

// Display results
echo "📊 Component Status Report\n";
echo str_repeat("-", 50) . "\n\n";

foreach ($results as $component => $status) {
    $icon = $status['manifest_valid'] ? '✅' : '⚠️';
    echo "$icon $component\n";
    
    echo "   Directory: " . ($status['directory'] ? '✓' : '✗') . "\n";
    echo "   Manifest: " . ($status['manifest'] ? '✓' : '✗');
    echo $status['manifest_valid'] ? ' (valid)' : ($status['manifest'] ? ' (invalid)' : '');
    echo "\n";
    echo "   Vue Renderer: " . ($status['vue_renderer'] ? '✓' : '✗') . "\n";
    echo "   PHP Template: " . ($status['php_template'] ? '✓' : '✗') . "\n";
    echo "   Schema: " . ($status['schema'] ? '✓' : '✗') . "\n";
    echo "   Styles: " . ($status['styles'] ? '✓' : '✗') . "\n";
    echo "\n";
}

// Summary
echo str_repeat("=", 50) . "\n";
echo "📈 Summary\n";
echo str_repeat("-", 50) . "\n";

$total_components = count($required_components);
$valid_manifests = array_filter($results, fn($s) => $s['manifest_valid']);
$vue_ready = array_filter($results, fn($s) => $s['vue_renderer']);

echo "Total Components: $total_components\n";
echo "Valid Manifests: " . count($valid_manifests) . "/$total_components\n";
echo "Vue Renderers: " . count($vue_ready) . "/$total_components\n";

// Check which Vue renderers need to be moved
$renderers_to_move = [];
foreach ($results as $component => $status) {
    if ($status['manifest_valid'] && !$status['vue_renderer']) {
        $manifest_path = $components_dir . $component . '/component.json';
        $manifest = json_decode(file_get_contents($manifest_path), true);
        if (isset($manifest['renderers']['vue'])) {
            $vue_name = $manifest['renderers']['vue'];
            $old_path = __DIR__ . '/src/vue/components/renderers/' . $vue_name;
            if (file_exists($old_path)) {
                $renderers_to_move[$component] = $vue_name;
            }
        }
    }
}

if (!empty($renderers_to_move)) {
    echo "\n";
    echo "⚠️  Vue Renderers to Move:\n";
    echo str_repeat("-", 50) . "\n";
    foreach ($renderers_to_move as $component => $renderer) {
        echo "  $component: $renderer\n";
        echo "    From: src/vue/components/renderers/$renderer\n";
        echo "    To:   components/$component/$renderer\n";
    }
}

// Display errors
if (!empty($errors)) {
    echo "\n";
    echo "❌ Errors Found:\n";
    echo str_repeat("-", 50) . "\n";
    foreach ($errors as $error) {
        echo "  - $error\n";
    }
}

echo "\n✅ Verification Complete!\n";

// Provide next steps
if (count($vue_ready) < $total_components) {
    echo "\n📝 Next Steps:\n";
    echo "1. Move remaining Vue renderers to component directories\n";
    echo "2. Run: npm install (to install glob if needed)\n";
    echo "3. Run: npm run build\n";
    echo "4. Delete src/vue/components/renderers/ when migration is complete\n";
}
