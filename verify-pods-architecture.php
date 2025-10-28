#!/usr/bin/env php
<?php
/**
 * Pods Architecture Verification Test Script
 * 
 * This script verifies that the self-contained Pods architecture is working correctly.
 * 
 * Usage:
 * 1. Navigate to plugin directory
 * 2. Run: php verify-pods-architecture.php
 * 
 * Requirements:
 * - WordPress environment
 * - WP_DEBUG enabled
 * - Access to WordPress functions
 */

// Bootstrap WordPress
define('WP_USE_THEMES', false);
require_once(__DIR__ . '/../../../wp-load.php');

if (!defined('ABSPATH')) {
    die("Error: Cannot load WordPress. Make sure you're running this from the plugin directory.\n");
}

echo "===========================================\n";
echo "Pods Architecture Verification Test\n";
echo "===========================================\n\n";

// Test 1: Check if ComponentDiscovery class exists
echo "Test 1: ComponentDiscovery Class\n";
echo "-------------------------------------------\n";

if (class_exists('ComponentDiscovery')) {
    echo "✅ ComponentDiscovery class exists\n";
} else {
    echo "❌ ComponentDiscovery class NOT found\n";
    die("CRITICAL: ComponentDiscovery class missing. Cannot continue.\n");
}

// Test 2: Check if global instance exists
echo "\nTest 2: Global ComponentDiscovery Instance\n";
echo "-------------------------------------------\n";

global $gmkb_component_discovery;

if ($gmkb_component_discovery && $gmkb_component_discovery instanceof ComponentDiscovery) {
    echo "✅ Global \$gmkb_component_discovery instance exists\n";
} else {
    echo "❌ Global instance NOT found\n";
    
    // Try to create one
    echo "   Attempting to create instance...\n";
    try {
        require_once(GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php');
        $gmkb_component_discovery = new ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components/');
        $gmkb_component_discovery->scan(true);
        echo "✅ Successfully created ComponentDiscovery instance\n";
    } catch (Exception $e) {
        echo "❌ Failed to create instance: " . $e->getMessage() . "\n";
        die();
    }
}

// Test 3: Check if getRequiredPodsFields method exists
echo "\nTest 3: getRequiredPodsFields Method\n";
echo "-------------------------------------------\n";

if (method_exists($gmkb_component_discovery, 'getRequiredPodsFields')) {
    echo "✅ getRequiredPodsFields() method exists\n";
} else {
    echo "❌ getRequiredPodsFields() method NOT found\n";
    die("CRITICAL: Method missing. Cannot continue.\n");
}

// Test 4: Get and display discovered Pods fields
echo "\nTest 4: Field Discovery\n";
echo "-------------------------------------------\n";

try {
    $fields = $gmkb_component_discovery->getRequiredPodsFields();
    
    if (empty($fields)) {
        echo "⚠️  No fields discovered (empty array)\n";
    } else {
        echo "✅ Discovered " . count($fields) . " unique Pods fields\n\n";
        echo "Field List:\n";
        
        // Sort for readability
        sort($fields);
        
        $field_count = 0;
        foreach ($fields as $field) {
            $field_count++;
            echo sprintf("  %2d. %s\n", $field_count, $field);
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error discovering fields: " . $e->getMessage() . "\n";
}

// Test 5: Check pods-config.json files
echo "\n\nTest 5: Component pods-config.json Files\n";
echo "-------------------------------------------\n";

$components_dir = GUESTIFY_PLUGIN_DIR . 'components/';
$component_folders = glob($components_dir . '*', GLOB_ONLYDIR);

$total_components = 0;
$components_with_config = 0;
$components_without_config = array();

foreach ($component_folders as $component_path) {
    $component_name = basename($component_path);
    $total_components++;
    
    $pods_config_path = $component_path . '/pods-config.json';
    
    if (file_exists($pods_config_path)) {
        $components_with_config++;
        
        // Validate JSON
        $config = json_decode(file_get_contents($pods_config_path), true);
        
        if ($config && isset($config['fields']) && is_array($config['fields'])) {
            $field_count = count($config['fields']);
            echo "  ✅ {$component_name}: {$field_count} fields declared\n";
        } else {
            echo "  ⚠️  {$component_name}: Config exists but invalid format\n";
        }
    } else {
        $components_without_config[] = $component_name;
        echo "  ❌ {$component_name}: No pods-config.json\n";
    }
}

echo "\n";
echo "Summary: {$components_with_config}/{$total_components} components have pods-config.json\n";

if (!empty($components_without_config)) {
    echo "⚠️  Components missing config: " . implode(', ', $components_without_config) . "\n";
}

// Test 6: Check REST API v2 integration
echo "\n\nTest 6: REST API v2 Integration\n";
echo "-------------------------------------------\n";

if (class_exists('GMKB_REST_API_V2')) {
    echo "✅ GMKB_REST_API_V2 class exists\n";
    
    // Check if the initialize_pods_fields method would use discovery
    $reflection = new ReflectionClass('GMKB_REST_API_V2');
    if ($reflection->hasMethod('initialize_pods_fields')) {
        echo "✅ initialize_pods_fields() method exists\n";
        
        // Read the method source to check if it uses discovery
        $method = $reflection->getMethod('initialize_pods_fields');
        $filename = $method->getFileName();
        $start_line = $method->getStartLine();
        $end_line = $method->getEndLine();
        
        $source = file($filename);
        $method_source = implode('', array_slice($source, $start_line - 1, $end_line - $start_line + 1));
        
        if (strpos($method_source, 'getRequiredPodsFields') !== false) {
            echo "✅ Method uses ComponentDiscovery->getRequiredPodsFields()\n";
        } else {
            echo "⚠️  Method doesn't appear to use ComponentDiscovery\n";
        }
        
        if (strpos($method_source, 'FALLBACK') !== false) {
            echo "✅ Method has fallback for when discovery unavailable\n";
        }
    } else {
        echo "❌ initialize_pods_fields() method NOT found\n";
    }
} else {
    echo "❌ GMKB_REST_API_V2 class NOT found\n";
}

// Test 7: Check enqueue.php integration
echo "\n\nTest 7: enqueue.php Integration\n";
echo "-------------------------------------------\n";

if (function_exists('gmkb_get_pods_data')) {
    echo "✅ gmkb_get_pods_data() function exists\n";
    
    // Read the function source
    $reflection = new ReflectionFunction('gmkb_get_pods_data');
    $filename = $reflection->getFileName();
    $start_line = $reflection->getStartLine();
    $end_line = $reflection->getEndLine();
    
    $source = file($filename);
    $function_source = implode('', array_slice($source, $start_line - 1, $end_line - $start_line + 1));
    
    if (strpos($function_source, 'getRequiredPodsFields') !== false) {
        echo "✅ Function uses ComponentDiscovery->getRequiredPodsFields()\n";
    } else {
        echo "⚠️  Function doesn't appear to use ComponentDiscovery\n";
    }
    
    if (strpos($function_source, 'FALLBACK') !== false || strpos($function_source, 'fallback') !== false) {
        echo "✅ Function has fallback for when discovery unavailable\n";
    }
} else {
    echo "❌ gmkb_get_pods_data() function NOT found\n";
}

// Test 8: Component data comparison
echo "\n\nTest 8: Field Coverage Analysis\n";
echo "-------------------------------------------\n";

// Get fields from discovery
$discovered_fields = $gmkb_component_discovery->getRequiredPodsFields();

// Get components
$components = $gmkb_component_discovery->getComponents();

echo "Components analyzed: " . count($components) . "\n";
echo "Total unique fields: " . count($discovered_fields) . "\n\n";

// Group components by field usage
$field_usage = array();
foreach ($discovered_fields as $field) {
    $field_usage[$field] = array();
}

foreach ($components as $component_name => $component_data) {
    $pods_config_path = $components_dir . $component_name . '/pods-config.json';
    
    if (file_exists($pods_config_path)) {
        $config = json_decode(file_get_contents($pods_config_path), true);
        
        if ($config && isset($config['fields'])) {
            foreach ($config['fields'] as $field_name => $field_config) {
                if (isset($field_usage[$field_name])) {
                    $field_usage[$field_name][] = $component_name;
                }
            }
        }
    }
}

// Show most commonly used fields
echo "Most commonly used fields:\n";
arsort(array_map('count', $field_usage));
$top_fields = array_slice($field_usage, 0, 10, true);

foreach ($top_fields as $field => $components_using) {
    $count = count($components_using);
    echo sprintf("  • %s: %d component(s)\n", $field, $count);
}

// Final Summary
echo "\n\n===========================================\n";
echo "Test Summary\n";
echo "===========================================\n\n";

$tests_passed = 0;
$tests_total = 8;

if (class_exists('ComponentDiscovery')) $tests_passed++;
if ($gmkb_component_discovery instanceof ComponentDiscovery) $tests_passed++;
if (method_exists($gmkb_component_discovery, 'getRequiredPodsFields')) $tests_passed++;
if (!empty($discovered_fields)) $tests_passed++;
if ($components_with_config >= 14) $tests_passed++; // At least 14 of 16 components
if (class_exists('GMKB_REST_API_V2')) $tests_passed++;
if (function_exists('gmkb_get_pods_data')) $tests_passed++;
if (count($discovered_fields) >= 20) $tests_passed++; // Should have at least 20 unique fields

$pass_rate = round(($tests_passed / $tests_total) * 100);

if ($pass_rate >= 80) {
    echo "✅ PASS: {$tests_passed}/{$tests_total} tests passed ({$pass_rate}%)\n";
    echo "\n";
    echo "Self-contained Pods architecture is operational!\n";
    exit(0);
} else {
    echo "⚠️  PARTIAL: {$tests_passed}/{$tests_total} tests passed ({$pass_rate}%)\n";
    echo "\n";
    echo "Some issues detected. Review output above.\n";
    exit(1);
}
