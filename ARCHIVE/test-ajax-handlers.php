<?php
/**
 * AJAX HANDLER VERIFICATION SCRIPT
 * This will test if our AJAX handlers are properly registered
 */

// WordPress integration
if (!defined('ABSPATH')) {
    $wp_load_path = dirname(dirname(dirname(dirname(__FILE__)))) . '/wp-load.php';
    if (file_exists($wp_load_path)) {
        require_once $wp_load_path;
    } else {
        die('WordPress not found.');
    }
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>AJAX Handler Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: #10b981; font-weight: bold; }
        .error { color: #ef4444; font-weight: bold; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .ajax-test { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 5px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px; }
        button { background: #0073aa; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #005a87; }
    </style>
</head>
<body>

<h1>🧪 AJAX Handler Test</h1>

<div class="test-section">
    <h2>🔧 Step 1: Check WordPress AJAX Environment</h2>
    
    <?php
    // Check if we're in WordPress context
    if (defined('ABSPATH')) {
        echo "<p class='success'>✅ WordPress loaded successfully</p>";
        echo "<p>AJAX URL: " . admin_url('admin-ajax.php') . "</p>";
        echo "<p>Site URL: " . site_url() . "</p>";
        
        // Check if user is logged in
        if (is_user_logged_in()) {
            echo "<p class='success'>✅ User is logged in</p>";
            echo "<p>User ID: " . get_current_user_id() . "</p>";
        } else {
            echo "<p class='error'>❌ User is not logged in (will use nopriv handlers)</p>";
        }
    } else {
        echo "<p class='error'>❌ WordPress not loaded</p>";
    }
    ?>
</div>

<div class="test-section">
    <h2>📋 Step 2: Check Class Availability</h2>
    
    <?php
    // Check if our classes exist
    $classes_to_check = [
        'GMKB_Topics_Ajax_Handler',
        'GMKB_MKCG_Data_Integration',
        'ComponentLoader',
        'ComponentDiscovery'
    ];
    
    foreach ($classes_to_check as $class_name) {
        if (class_exists($class_name)) {
            echo "<p class='success'>✅ {$class_name} class found</p>";
        } else {
            echo "<p class='error'>❌ {$class_name} class NOT found</p>";
        }
    }
    ?>
</div>

<div class="test-section">
    <h2>🌐 Step 3: Manual AJAX Test</h2>
    <p>Test the AJAX handlers directly:</p>
    
    <div class="ajax-test">
        <h3>Test load_stored_topics Handler</h3>
        <button onclick="testLoadStoredTopics()">Test Load Stored Topics</button>
        <div id="load-topics-result"></div>
    </div>
    
    <div class="ajax-test">
        <h3>Test with Specific Post ID</h3>
        <input type="number" id="test-post-id" placeholder="Enter Post ID" value="<?php echo isset($_GET['post_id']) ? intval($_GET['post_id']) : ''; ?>">
        <button onclick="testWithPostId()">Test with Post ID</button>
        <div id="post-id-result"></div>
    </div>
</div>

<div class="test-section">
    <h2>📊 Step 4: WordPress Hook Debug</h2>
    
    <?php
    // Check registered AJAX actions
    global $wp_filter;
    
    $ajax_actions_to_check = [
        'wp_ajax_load_stored_topics',
        'wp_ajax_nopriv_load_stored_topics',
        'wp_ajax_save_mkcg_topics',
        'wp_ajax_nopriv_save_mkcg_topics'
    ];
    
    echo "<h3>Registered AJAX Actions:</h3>";
    foreach ($ajax_actions_to_check as $action) {
        if (isset($wp_filter[$action])) {
            echo "<p class='success'>✅ {$action} is registered</p>";
            
            // Show what's hooked
            $callbacks = $wp_filter[$action]->callbacks;
            foreach ($callbacks as $priority => $hooks) {
                foreach ($hooks as $hook) {
                    if (is_array($hook['function']) && is_object($hook['function'][0])) {
                        $class_name = get_class($hook['function'][0]);
                        $method_name = $hook['function'][1];
                        echo "<p style='margin-left: 20px; font-size: 12px; color: #666;'>→ {$class_name}::{$method_name} (priority: {$priority})</p>";
                    } else {
                        echo "<p style='margin-left: 20px; font-size: 12px; color: #666;'>→ " . print_r($hook['function'], true) . " (priority: {$priority})</p>";
                    }
                }
            }
        } else {
            echo "<p class='error'>❌ {$action} is NOT registered</p>";
        }
    }
    ?>
</div>

<script>
// Get WordPress AJAX data
const ajaxUrl = '<?php echo admin_url('admin-ajax.php'); ?>';
const nonce = '<?php echo wp_create_nonce('guestify_media_kit_builder'); ?>';

function testLoadStoredTopics() {
    const resultDiv = document.getElementById('load-topics-result');
    resultDiv.innerHTML = '<p>🔄 Testing...</p>';
    
    const formData = new FormData();
    formData.append('action', 'load_stored_topics');
    formData.append('nonce', nonce);
    formData.append('post_id', '1'); // Use post ID 1 as test
    
    fetch(ajaxUrl, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('AJAX Response:', data);
        if (data.success) {
            resultDiv.innerHTML = '<p class="success">✅ AJAX call successful!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        } else {
            resultDiv.innerHTML = '<p class="error">❌ AJAX call failed: ' + (data.data || 'Unknown error') + '</p>';
        }
    })
    .catch(error => {
        console.error('AJAX Error:', error);
        resultDiv.innerHTML = '<p class="error">❌ AJAX request failed: ' + error.message + '</p>';
    });
}

function testWithPostId() {
    const postId = document.getElementById('test-post-id').value;
    const resultDiv = document.getElementById('post-id-result');
    
    if (!postId) {
        resultDiv.innerHTML = '<p class="error">❌ Please enter a Post ID</p>';
        return;
    }
    
    resultDiv.innerHTML = '<p>🔄 Testing with Post ID ' + postId + '...</p>';
    
    const formData = new FormData();
    formData.append('action', 'load_stored_topics');
    formData.append('nonce', nonce);
    formData.append('post_id', postId);
    
    fetch(ajaxUrl, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Post ID Test Response:', data);
        if (data.success) {
            resultDiv.innerHTML = '<p class="success">✅ Found topics for Post ID ' + postId + '!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        } else {
            resultDiv.innerHTML = '<p class="error">❌ No topics found for Post ID ' + postId + ': ' + (data.data || 'Unknown error') + '</p>';
        }
    })
    .catch(error => {
        console.error('Post ID Test Error:', error);
        resultDiv.innerHTML = '<p class="error">❌ Request failed: ' + error.message + '</p>';
    });
}

// Auto-test on page load
window.addEventListener('load', function() {
    console.log('🧪 AJAX Test Page Loaded');
    console.log('AJAX URL:', ajaxUrl);
    console.log('Nonce:', nonce);
});
</script>

</body>
</html>
