<?php
/**
 * Emergency PHP Syntax Check
 * Run this to validate our event-driven changes are syntactically correct
 */

// Test Base_Component_Data_Service syntax
echo "🔍 TESTING PHP SYNTAX...\n";

// Include files to check for syntax errors
$files_to_check = [
    'system/Base_Component_Data_Service.php',
    'components/topics/class-topics-data-service.php', 
    'components/topics/design-panel.php',
    'components/topics/template.php',
    'guestify-media-kit-builder.php'
];

$plugin_dir = __DIR__ . '/';
$syntax_errors = [];

foreach ($files_to_check as $file) {
    $full_path = $plugin_dir . $file;
    if (file_exists($full_path)) {
        $syntax_check = shell_exec("php -l $full_path 2>&1");
        if (strpos($syntax_check, 'No syntax errors') === false) {
            $syntax_errors[] = $file . ': ' . $syntax_check;
        } else {
            echo "✅ $file - No syntax errors\n";
        }
    } else {
        echo "❌ $file - File not found\n";
    }
}

if (!empty($syntax_errors)) {
    echo "\n❌ SYNTAX ERRORS FOUND:\n";
    foreach ($syntax_errors as $error) {
        echo "  $error\n";
    }
} else {
    echo "\n✅ ALL FILES: No syntax errors detected\n";
}

// Test class loading
echo "\n🔍 TESTING CLASS LOADING...\n";

if (!defined('ABSPATH')) {
    define('ABSPATH', '/');
}

try {
    require_once $plugin_dir . 'system/Base_Component_Data_Service.php';
    echo "✅ Base_Component_Data_Service loaded\n";
} catch (Exception $e) {
    echo "❌ Base_Component_Data_Service error: " . $e->getMessage() . "\n";
}

try {
    require_once $plugin_dir . 'components/topics/class-topics-data-service.php';
    echo "✅ Topics_Data_Service loaded\n";
} catch (Exception $e) {
    echo "❌ Topics_Data_Service error: " . $e->getMessage() . "\n";
}

// Test method existence
if (class_exists('Topics_Data_Service')) {
    if (method_exists('Topics_Data_Service', 'get_sidebar_data')) {
        echo "✅ get_sidebar_data method exists\n";
        
        // Test method signature
        $reflection = new ReflectionMethod('Topics_Data_Service', 'get_sidebar_data');
        $params = $reflection->getParameters();
        echo "✅ Method parameters: " . count($params) . " (" . implode(', ', array_map(function($p) { return '$' . $p->getName(); }, $params)) . ")\n";
        
        if (count($params) >= 1 && $params[0]->getName() === 'post_id') {
            echo "✅ EVENT-DRIVEN: First parameter is \$post_id\n";
        } else {
            echo "❌ EVENT-DRIVEN: First parameter is NOT \$post_id\n";
        }
    } else {
        echo "❌ get_sidebar_data method missing\n";
    }
} else {
    echo "❌ Topics_Data_Service class not found\n";
}

echo "\n🎯 SYNTAX CHECK COMPLETE\n";
