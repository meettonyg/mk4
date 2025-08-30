<?php
/**
 * Topics Meta Key Diagnostic
 * Place this in your WordPress root or as a plugin file to test
 */

// Only run if we have a post ID parameter
if (!isset($_GET['test_post_id'])) {
    die('Please provide a post ID using ?test_post_id=YOUR_POST_ID');
}

$post_id = intval($_GET['test_post_id']);

// Check if post exists
$post = get_post($post_id);
if (!$post) {
    die("Post ID {$post_id} not found!");
}

echo "<h1>Topics Meta Key Diagnostic for Post ID: {$post_id}</h1>";
echo "<h2>Post Title: " . esc_html($post->post_title) . "</h2>";
echo "<hr>";

// Get all post meta
$all_meta = get_post_meta($post_id);

echo "<h3>All Topic-Related Meta Keys:</h3>";
echo "<pre>";

$topic_related = array();
foreach ($all_meta as $key => $values) {
    if (stripos($key, 'topic') !== false || stripos($key, 'mkcg') !== false) {
        $topic_related[$key] = $values;
    }
}

if (empty($topic_related)) {
    echo "No topic-related meta keys found!";
} else {
    print_r($topic_related);
}

echo "</pre>";

echo "<h3>Specific Topic Checks:</h3>";

// Check Pods format (topic_1, topic_2, etc.)
echo "<h4>Pods Format (topic_1, topic_2, etc.):</h4>";
for ($i = 1; $i <= 5; $i++) {
    $value = get_post_meta($post_id, "topic_{$i}", true);
    if (!empty($value)) {
        echo "topic_{$i}: " . esc_html($value) . "<br>";
    } else {
        echo "topic_{$i}: <em>empty</em><br>";
    }
}

// Check MKCG format (mkcg_topic_1, mkcg_topic_2, etc.)
echo "<h4>MKCG Format (mkcg_topic_1, mkcg_topic_2, etc.):</h4>";
for ($i = 1; $i <= 5; $i++) {
    $value = get_post_meta($post_id, "mkcg_topic_{$i}", true);
    if (!empty($value)) {
        echo "mkcg_topic_{$i}: " . esc_html($value) . "<br>";
    } else {
        echo "mkcg_topic_{$i}: <em>empty</em><br>";
    }
}

// Test AJAX handler
echo "<h3>Testing AJAX Handler Load:</h3>";

// Load the topics AJAX handler
$ajax_handler_path = plugin_dir_path(__FILE__) . 'components/topics/ajax-handler.php';
if (file_exists($ajax_handler_path)) {
    require_once $ajax_handler_path;
    
    if (class_exists('GMKB_Topics_Ajax_Handler')) {
        $handler = GMKB_Topics_Ajax_Handler::get_instance();
        $topics = $handler->load_topics_direct($post_id);
        
        echo "<pre>";
        echo "Topics loaded by AJAX handler:\n";
        print_r($topics);
        echo "</pre>";
    } else {
        echo "<p>GMKB_Topics_Ajax_Handler class not found!</p>";
    }
} else {
    echo "<p>AJAX handler file not found at: {$ajax_handler_path}</p>";
}

// Test MKCG integration
echo "<h3>Testing MKCG Data Integration:</h3>";

$mkcg_integration_path = plugin_dir_path(__FILE__) . 'includes/class-gmkb-mkcg-data-integration.php';
if (file_exists($mkcg_integration_path)) {
    require_once $mkcg_integration_path;
    
    if (class_exists('GMKB_MKCG_Data_Integration')) {
        $mkcg = GMKB_MKCG_Data_Integration::get_instance();
        $post_data = $mkcg->get_post_data($post_id);
        
        if ($post_data && isset($post_data['topics'])) {
            echo "<pre>";
            echo "Topics from MKCG integration:\n";
            print_r($post_data['topics']);
            echo "</pre>";
        } else {
            echo "<p>No topics data from MKCG integration</p>";
        }
    } else {
        echo "<p>GMKB_MKCG_Data_Integration class not found!</p>";
    }
} else {
    echo "<p>MKCG integration file not found at: {$mkcg_integration_path}</p>";
}

echo "<hr>";
echo "<p><strong>Diagnostic complete!</strong></p>";
