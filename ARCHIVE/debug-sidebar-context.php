<?php
/**
 * ROOT FIX INVESTIGATION: Debug Sidebar Context vs Preview Context
 * This script identifies WHY sidebar panel shows "No topics found" while preview shows topics
 */

// WordPress context check
if (!defined('ABSPATH')) {
    echo "❌ WordPress context not available\n";
    return;
}

echo "🔍 ROOT FIX INVESTIGATION: Sidebar Context Debug\n";
echo "================================================\n\n";

// Current context analysis
echo "📍 CURRENT CONTEXT:\n";
echo "   URL: " . ($_SERVER['REQUEST_URI'] ?? 'unknown') . "\n";
echo "   Script: " . (__FILE__ ?? 'unknown') . "\n";
echo "   WordPress loaded: " . (defined('ABSPATH') ? 'YES' : 'NO') . "\n";
echo "   WP_DEBUG: " . (defined('WP_DEBUG') && WP_DEBUG ? 'YES' : 'NO') . "\n\n";

// Post ID detection methods (SAME as template.php and design-panel.php)
$post_id_methods = [
    'GET_post_id' => $_GET['post_id'] ?? null,
    'GET_p' => $_GET['p'] ?? null,
    'REQUEST_post_id' => $_REQUEST['post_id'] ?? null,
    'global_post_id' => (isset($GLOBALS['post']->ID) ? $GLOBALS['post']->ID : null),
    'get_the_id' => (function_exists('get_the_ID') ? get_the_ID() : 'function_not_available'),
    'wp_query_id' => (isset($GLOBALS['wp_query']->post->ID) ? $GLOBALS['wp_query']->post->ID : null)
];

echo "🔢 POST ID DETECTION METHODS:\n";
foreach ($post_id_methods as $method => $value) {
    $status = (!empty($value) && is_numeric($value)) ? '✅' : '❌';
    echo "   {$status} {$method}: " . ($value ?? 'null') . "\n";
}
echo "\n";

// Determine current post ID using same logic as both files
$current_post_id = 0;
$post_id_source = 'none';

if (!empty($_GET['post_id']) && is_numeric($_GET['post_id'])) {
    $current_post_id = intval($_GET['post_id']);
    $post_id_source = 'url-get-post_id';
} elseif (!empty($_GET['p']) && is_numeric($_GET['p'])) {
    $current_post_id = intval($_GET['p']);
    $post_id_source = 'url-get-p';
} elseif (!empty($_REQUEST['post_id']) && is_numeric($_REQUEST['post_id'])) {
    $current_post_id = intval($_REQUEST['post_id']);
    $post_id_source = 'request-post_id';
} elseif (isset($GLOBALS['post']) && is_object($GLOBALS['post']) && isset($GLOBALS['post']->ID)) {
    $current_post_id = intval($GLOBALS['post']->ID);
    $post_id_source = 'global-post';
} elseif (function_exists('get_the_ID') && get_the_ID()) {
    $current_post_id = intval(get_the_ID());
    $post_id_source = 'wp-get_the_id';
}

echo "🎯 RESOLVED POST ID:\n";
echo "   Post ID: {$current_post_id}\n";
echo "   Source: {$post_id_source}\n";
echo "   Valid: " . ($current_post_id > 0 ? 'YES' : 'NO') . "\n\n";

// Data loading investigation (same as both files)
if ($current_post_id > 0) {
    echo "💾 DATA LOADING INVESTIGATION:\n";
    
    // Method 1: Custom post fields (topic_1, topic_2, etc.)
    $custom_topics = [];
    for ($i = 1; $i <= 5; $i++) {
        $value = get_post_meta($current_post_id, "topic_{$i}", true);
        $custom_topics["topic_{$i}"] = $value;
        echo "   topic_{$i}: " . (!empty($value) ? "'{$value}'" : 'empty') . "\n";
    }
    
    echo "\n";
    
    // Method 2: MKCG meta fields
    $mkcg_topics = [];
    for ($i = 1; $i <= 5; $i++) {
        $value = get_post_meta($current_post_id, "mkcg_topic_{$i}", true);
        $mkcg_topics["mkcg_topic_{$i}"] = $value;
        echo "   mkcg_topic_{$i}: " . (!empty($value) ? "'{$value}'" : 'empty') . "\n";
    }
    
    echo "\n";
    
    // Method 3: JSON topics data
    $json_topics = get_post_meta($current_post_id, 'topics_data', true);
    echo "   topics_data (JSON): " . (!empty($json_topics) ? "'{$json_topics}'" : 'empty') . "\n";
    
    echo "\n";
    
    // All post meta for debugging
    $all_meta = get_post_meta($current_post_id);
    echo "📋 ALL POST META FIELDS:\n";
    if (!empty($all_meta)) {
        foreach ($all_meta as $key => $values) {
            if (strpos($key, 'topic') !== false || strpos($key, 'mkcg') !== false) {
                echo "   {$key}: " . implode(', ', (array)$values) . "\n";
            }
        }
    } else {
        echo "   ❌ No meta fields found\n";
    }
    
} else {
    echo "❌ Cannot load data - no valid post ID detected\n";
}

echo "\n🔍 SIDEBAR VS PREVIEW COMPARISON:\n";
echo "   This debug simulates the EXACT same logic used in both:\n";
echo "   - components/topics/template.php (preview area) ✅ WORKING\n";
echo "   - components/topics/design-panel.php (sidebar) ❌ FAILING\n";
echo "\n";

echo "💡 EXPECTED ROOT CAUSE:\n";
echo "   If this debug shows topics data but sidebar fails, then:\n";
echo "   1. Context timing issue (sidebar loads before data available)\n";
echo "   2. Different execution context for design panels\n";
echo "   3. AJAX loading interference\n";
echo "   4. JavaScript loading race condition\n";

?>
