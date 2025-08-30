<?php
/**
 * Debug Component Loading
 * Diagnostic script to test component discovery and AJAX response
 */

// WordPress setup
require_once(dirname(__FILE__) . '/../../../wp-config.php');

echo "<h1>Component Loading Diagnostic</h1>";
echo "<pre>";

echo "=== CONSTANTS CHECK ===\n";
echo "GUESTIFY_PLUGIN_DIR: " . (defined('GUESTIFY_PLUGIN_DIR') ? GUESTIFY_PLUGIN_DIR : 'NOT DEFINED') . "\n";
echo "GUESTIFY_PLUGIN_URL: " . (defined('GUESTIFY_PLUGIN_URL') ? GUESTIFY_PLUGIN_URL : 'NOT DEFINED') . "\n";
echo "\n";

echo "=== COMPONENT DIRECTORY CHECK ===\n";
$components_dir = GUESTIFY_PLUGIN_DIR . 'components';
echo "Components directory: $components_dir\n";
echo "Directory exists: " . (is_dir($components_dir) ? 'YES' : 'NO') . "\n";
echo "Directory readable: " . (is_readable($components_dir) ? 'YES' : 'NO') . "\n";

if (is_dir($components_dir)) {
    $subdirs = glob($components_dir . '/*', GLOB_ONLYDIR);
    echo "Component subdirectories found: " . count($subdirs) . "\n";
    foreach ($subdirs as $subdir) {
        $name = basename($subdir);
        $json_file = $subdir . '/component.json';
        echo "  - $name: " . (file_exists($json_file) ? 'HAS component.json' : 'MISSING component.json') . "\n";
    }
}
echo "\n";

echo "=== COMPONENT DISCOVERY TEST ===\n";
try {
    require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
    
    $discovery = new ComponentDiscovery($components_dir);
    echo "ComponentDiscovery instantiated successfully\n";
    
    // Force fresh scan
    echo "Performing fresh scan...\n";
    $categories = $discovery->scan(true);
    
    $components = $discovery->getComponents();
    echo "Total components found: " . count($components) . "\n";
    echo "Categories found: " . count($categories) . "\n";
    
    foreach ($categories as $category => $cat_components) {
        echo "  Category '$category': " . count($cat_components) . " components\n";
    }
    
    echo "\nComponent details:\n";
    foreach ($components as $key => $component) {
        echo "  - '$key': {$component['name']} (category: {$component['category']}, type: " . ($component['type'] ?? 'not set') . ")\n";
    }
    
} catch (Exception $e) {
    echo "ERROR in ComponentDiscovery: " . $e->getMessage() . "\n";
}
echo "\n";

echo "=== PLUGIN INSTANCE TEST ===\n";
try {
    if (class_exists('Guestify_Media_Kit_Builder')) {
        echo "Plugin class exists\n";
        $plugin = Guestify_Media_Kit_Builder::get_instance();
        echo "Plugin instance obtained\n";
        
        $discovery = $plugin->get_component_discovery();
        if ($discovery) {
            echo "Component discovery available from plugin\n";
            $components = $discovery->getComponents();
            echo "Components from plugin instance: " . count($components) . "\n";
        } else {
            echo "Component discovery NOT available from plugin\n";
        }
    } else {
        echo "Plugin class does not exist\n";
    }
} catch (Exception $e) {
    echo "ERROR in plugin test: " . $e->getMessage() . "\n";
}
echo "\n";

echo "=== AJAX HANDLER SIMULATION ===\n";
try {
    if (class_exists('Guestify_Media_Kit_Builder')) {
        $plugin = Guestify_Media_Kit_Builder::get_instance();
        $discovery = $plugin->get_component_discovery();
        
        if ($discovery) {
            // Force fresh scan
            $discovery->scan(true);
            $components = $discovery->getComponents();
            $categories = $discovery->getCategories();
            
            // Convert to the format expected by JavaScript
            $components_array = array();
            foreach ($components as $key => $component) {
                $component['type'] = $component['type'] ?? $key;
                $component['name'] = $component['name'] ?? ucfirst($key);
                $component['title'] = $component['title'] ?? $component['name'];
                $component['description'] = $component['description'] ?? 'No description available';
                $component['category'] = $component['category'] ?? 'general';
                $component['premium'] = $component['isPremium'] ?? false;
                $component['icon'] = $component['icon'] ?? 'fa-puzzle-piece';
                
                $components_array[] = $component;
            }
            
            $categories_array = array();
            foreach ($categories as $cat_name => $cat_components) {
                $categories_array[] = array(
                    'slug' => $cat_name,
                    'name' => ucfirst($cat_name),
                    'description' => ucfirst($cat_name) . ' components'
                );
            }
            
            $result = array(
                'components' => $components_array,
                'categories' => $categories_array,
                'total' => count($components_array),
                'timestamp' => time(),
                'source' => 'diagnostic_test'
            );
            
            echo "AJAX response simulation:\n";
            echo json_encode($result, JSON_PRETTY_PRINT) . "\n";
        } else {
            echo "Component discovery not available\n";
        }
    } else {
        echo "Plugin class not available\n";
    }
} catch (Exception $e) {
    echo "ERROR in AJAX simulation: " . $e->getMessage() . "\n";
}

echo "</pre>";

// Test actual AJAX endpoint
echo "<h2>Test AJAX Endpoint</h2>";
echo "<button onclick='testAjax()'>Test AJAX Call</button>";
echo "<div id='ajax-result'></div>";

?>
<script>
function testAjax() {
    const resultDiv = document.getElementById('ajax-result');
    resultDiv.innerHTML = 'Testing...';
    
    const formData = new FormData();
    formData.append('action', 'guestify_get_components');
    
    fetch('/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(text => {
        resultDiv.innerHTML = '<h3>Raw Response:</h3><pre>' + text + '</pre>';
        
        try {
            const data = JSON.parse(text);
            resultDiv.innerHTML += '<h3>Parsed JSON:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        } catch (e) {
            resultDiv.innerHTML += '<h3>JSON Parse Error:</h3><pre>' + e.message + '</pre>';
        }
    })
    .catch(error => {
        resultDiv.innerHTML = '<h3>Fetch Error:</h3><pre>' + error.message + '</pre>';
    });
}
</script>
