<?php
/**
 * Test Self-Contained Pods Architecture
 * 
 * This diagnostic script verifies that:
 * 1. ComponentDiscovery can read all pods-config.json files
 * 2. getRequiredPodsFields() returns the complete field list
 * 3. No duplicates exist in the field list
 * 4. All components properly declare their Pods requirements
 * 
 * Usage: Access via WordPress admin or CLI
 * @package GMKB
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    // Load WordPress if running from CLI
    require_once dirname(__FILE__) . '/../../../../wp-load.php';
}

/**
 * Test the self-contained Pods architecture
 */
function gmkb_test_pods_architecture() {
    echo "<h1>🧪 Testing Self-Contained Pods Architecture</h1>";
    echo "<style>
        body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 20px; }
        h1, h2, h3 { color: #4fc3f7; }
        .success { color: #4caf50; }
        .warning { color: #ff9800; }
        .error { color: #f44336; }
        .info { color: #2196f3; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #444; padding: 8px; text-align: left; }
        th { background: #2d2d30; }
        tr:nth-child(even) { background: #252526; }
        pre { background: #1e1e1e; border: 1px solid #444; padding: 15px; overflow-x: auto; }
        .check { display: inline-block; width: 20px; text-align: center; }
    </style>";
    
    // STEP 1: Verify ComponentDiscovery exists
    echo "<h2>Step 1: Verify ComponentDiscovery Class</h2>";
    $discovery_path = GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
    
    if (!file_exists($discovery_path)) {
        echo "<p class='error'>❌ ComponentDiscovery.php NOT FOUND at: {$discovery_path}</p>";
        return;
    }
    
    echo "<p class='success'>✅ ComponentDiscovery.php exists</p>";
    
    require_once $discovery_path;
    
    if (!class_exists('ComponentDiscovery')) {
        echo "<p class='error'>❌ ComponentDiscovery class NOT loaded</p>";
        return;
    }
    
    echo "<p class='success'>✅ ComponentDiscovery class loaded</p>";
    
    // STEP 2: Initialize ComponentDiscovery
    echo "<h2>Step 2: Initialize ComponentDiscovery</h2>";
    $components_dir = GUESTIFY_PLUGIN_DIR . 'components/';
    
    try {
        $discovery = new ComponentDiscovery($components_dir);
        echo "<p class='success'>✅ ComponentDiscovery instantiated</p>";
        
        // Force fresh scan
        $discovery->scan(true);
        echo "<p class='success'>✅ Component scan completed</p>";
        
        $components = $discovery->getComponents();
        $component_count = count($components);
        echo "<p class='info'>📊 Found {$component_count} components</p>";
        
    } catch (Exception $e) {
        echo "<p class='error'>❌ Error: {$e->getMessage()}</p>";
        return;
    }
    
    // STEP 3: Check each component for pods-config.json
    echo "<h2>Step 3: Component Pods Configuration Status</h2>";
    echo "<table>";
    echo "<tr><th>Component</th><th>Has pods-config.json</th><th>Fields Declared</th><th>Status</th></tr>";
    
    $components_with_pods = 0;
    $components_without_pods = 0;
    $total_fields_declared = array();
    
    foreach ($components as $component_name => $component_data) {
        $component_path = $components_dir . $component_name;
        $pods_config_path = $component_path . '/pods-config.json';
        
        $has_config = file_exists($pods_config_path);
        $field_count = 0;
        $status = '❌ No config';
        
        if ($has_config) {
            $components_with_pods++;
            $config = json_decode(file_get_contents($pods_config_path), true);
            
            if ($config && isset($config['fields']) && is_array($config['fields'])) {
                $field_count = count($config['fields']);
                $field_names = array_keys($config['fields']);
                
                // Track all fields
                foreach ($field_names as $field_name) {
                    if (!isset($total_fields_declared[$field_name])) {
                        $total_fields_declared[$field_name] = array();
                    }
                    $total_fields_declared[$field_name][] = $component_name;
                }
                
                $status = '<span class="success">✅ Valid</span>';
            } else {
                $status = '<span class="warning">⚠️ Invalid JSON</span>';
            }
        } else {
            $components_without_pods++;
            $status = '<span class="error">❌ Missing</span>';
        }
        
        echo "<tr>";
        echo "<td>{$component_name}</td>";
        echo "<td>" . ($has_config ? '✅ Yes' : '❌ No') . "</td>";
        echo "<td>{$field_count}</td>";
        echo "<td>{$status}</td>";
        echo "</tr>";
    }
    
    echo "</table>";
    echo "<p class='info'>📊 Summary: {$components_with_pods} with config, {$components_without_pods} without config</p>";
    
    // STEP 4: Test getRequiredPodsFields()
    echo "<h2>Step 4: Test getRequiredPodsFields() Method</h2>";
    
    if (!method_exists($discovery, 'getRequiredPodsFields')) {
        echo "<p class='error'>❌ getRequiredPodsFields() method NOT found</p>";
        return;
    }
    
    echo "<p class='success'>✅ getRequiredPodsFields() method exists</p>";
    
    try {
        $required_fields = $discovery->getRequiredPodsFields();
        $field_count = count($required_fields);
        
        echo "<p class='success'>✅ getRequiredPodsFields() executed successfully</p>";
        echo "<p class='info'>📊 Total unique fields discovered: {$field_count}</p>";
        
    } catch (Exception $e) {
        echo "<p class='error'>❌ Error calling getRequiredPodsFields(): {$e->getMessage()}</p>";
        return;
    }
    
    // STEP 5: Display all discovered fields
    echo "<h2>Step 5: All Discovered Pods Fields</h2>";
    echo "<table>";
    echo "<tr><th>Field Name</th><th>Used By Components</th><th>Usage Count</th></tr>";
    
    // Sort fields alphabetically
    ksort($total_fields_declared);
    
    foreach ($total_fields_declared as $field_name => $using_components) {
        $usage_count = count($using_components);
        $components_list = implode(', ', $using_components);
        
        echo "<tr>";
        echo "<td><strong>{$field_name}</strong></td>";
        echo "<td>{$components_list}</td>";
        echo "<td>{$usage_count}</td>";
        echo "</tr>";
    }
    
    echo "</table>";
    
    // STEP 6: Check for duplicates in returned array
    echo "<h2>Step 6: Duplicate Detection</h2>";
    $duplicate_count = count($required_fields) - count(array_unique($required_fields));
    
    if ($duplicate_count > 0) {
        echo "<p class='warning'>⚠️ Found {$duplicate_count} duplicate(s) in returned array</p>";
        
        // Find duplicates
        $value_counts = array_count_values($required_fields);
        $duplicates = array_filter($value_counts, function($count) { return $count > 1; });
        
        echo "<p>Duplicate fields:</p><ul>";
        foreach ($duplicates as $field => $count) {
            echo "<li>{$field} (appears {$count} times)</li>";
        }
        echo "</ul>";
    } else {
        echo "<p class='success'>✅ No duplicates found - all fields are unique</p>";
    }
    
    // STEP 7: Compare declared vs returned
    echo "<h2>Step 7: Verification - Declared vs Returned</h2>";
    $declared_fields = array_keys($total_fields_declared);
    sort($declared_fields);
    sort($required_fields);
    
    $missing_in_return = array_diff($declared_fields, $required_fields);
    $extra_in_return = array_diff($required_fields, $declared_fields);
    
    if (empty($missing_in_return) && empty($extra_in_return)) {
        echo "<p class='success'>✅ Perfect match! All declared fields are returned, no extras</p>";
    } else {
        if (!empty($missing_in_return)) {
            echo "<p class='error'>❌ Missing in return: " . implode(', ', $missing_in_return) . "</p>";
        }
        if (!empty($extra_in_return)) {
            echo "<p class='warning'>⚠️ Extra in return: " . implode(', ', $extra_in_return) . "</p>";
        }
    }
    
    // STEP 8: Display full field list
    echo "<h2>Step 8: Complete Field List (as returned by getRequiredPodsFields)</h2>";
    echo "<pre>";
    echo "Array (\n";
    foreach ($required_fields as $index => $field) {
        echo "    [{$index}] => {$field}\n";
    }
    echo ")";
    echo "</pre>";
    
    echo "<p class='info'>📋 Total: " . count($required_fields) . " fields</p>";
    
    // STEP 9: Test REST API integration
    echo "<h2>Step 9: REST API Integration Test</h2>";
    
    global $gmkb_component_discovery;
    if ($gmkb_component_discovery) {
        echo "<p class='success'>✅ Global \$gmkb_component_discovery exists</p>";
        
        $api_fields = $gmkb_component_discovery->getRequiredPodsFields();
        $api_field_count = count($api_fields);
        
        echo "<p class='info'>📊 REST API would load {$api_field_count} fields</p>";
        
        if ($api_fields === $required_fields) {
            echo "<p class='success'>✅ REST API uses same field list</p>";
        } else {
            echo "<p class='warning'>⚠️ REST API field list differs from test</p>";
        }
    } else {
        echo "<p class='warning'>⚠️ Global \$gmkb_component_discovery not initialized</p>";
    }
    
    // STEP 10: Final Summary
    echo "<h2>Step 10: Final Summary</h2>";
    echo "<table>";
    echo "<tr><th>Metric</th><th>Value</th><th>Status</th></tr>";
    
    $all_have_config = $components_without_pods === 0;
    $no_duplicates = $duplicate_count === 0;
    $perfect_match = empty($missing_in_return) && empty($extra_in_return);
    
    echo "<tr><td>Total Components</td><td>{$component_count}</td><td class='info'>ℹ️</td></tr>";
    echo "<tr><td>Components with pods-config.json</td><td>{$components_with_pods}</td><td class='success'>✅</td></tr>";
    echo "<tr><td>Components without pods-config.json</td><td>{$components_without_pods}</td><td>" . ($all_have_config ? "<span class='success'>✅</span>" : "<span class='error'>❌</span>") . "</td></tr>";
    echo "<tr><td>Total Unique Fields Declared</td><td>" . count($declared_fields) . "</td><td class='info'>ℹ️</td></tr>";
    echo "<tr><td>Fields Returned by getRequiredPodsFields()</td><td>" . count($required_fields) . "</td><td class='info'>ℹ️</td></tr>";
    echo "<tr><td>Duplicate Fields</td><td>{$duplicate_count}</td><td>" . ($no_duplicates ? "<span class='success'>✅</span>" : "<span class='warning'>⚠️</span>") . "</td></tr>";
    echo "<tr><td>Declaration/Return Match</td><td>" . ($perfect_match ? 'Yes' : 'No') . "</td><td>" . ($perfect_match ? "<span class='success'>✅</span>" : "<span class='error'>❌</span>") . "</td></tr>";
    
    echo "</table>";
    
    // Overall status
    if ($all_have_config && $no_duplicates && $perfect_match) {
        echo "<h3 class='success'>🎉 ALL TESTS PASSED! Self-Contained Pods Architecture is working correctly.</h3>";
    } else {
        echo "<h3 class='warning'>⚠️ Some issues detected. Review the report above.</h3>";
    }
    
    echo "<hr>";
    echo "<p><em>Test completed at " . date('Y-m-d H:i:s') . "</em></p>";
}

// Run the test
gmkb_test_pods_architecture();
