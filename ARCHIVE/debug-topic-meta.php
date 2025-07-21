<?php
/**
 * DEBUGGING SCRIPT: Find Your Topic Meta Keys
 * This will help us identify the exact meta key format your data uses
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

// Get post_id from URL
$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;

if ($post_id === 0) {
    // Try to find any post with topic data
    global $wpdb;
    $results = $wpdb->get_results("
        SELECT post_id, meta_key, meta_value 
        FROM {$wpdb->postmeta} 
        WHERE meta_key LIKE '%topic%' 
        AND meta_value != '' 
        LIMIT 20
    ");
    
    echo "<h2>🔍 All Posts with Topic Data Found:</h2>";
    if (!empty($results)) {
        $posts_data = [];
        foreach ($results as $result) {
            $posts_data[$result->post_id][] = [
                'key' => $result->meta_key,
                'value' => $result->meta_value
            ];
        }
        
        foreach ($posts_data as $pid => $topics) {
            $title = get_the_title($pid) ?: "Post #{$pid}";
            echo "<h3>📄 <a href='?post_id={$pid}'>{$title} (ID: {$pid})</a></h3>";
            echo "<ul>";
            foreach ($topics as $topic) {
                echo "<li><strong>{$topic['key']}:</strong> " . esc_html($topic['value']) . "</li>";
            }
            echo "</ul>";
        }
    } else {
        echo "<p>❌ No posts with topic meta data found.</p>";
    }
    exit;
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Topic Meta Keys Debug</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .meta-key { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        .found { color: #10b981; font-weight: bold; }
        .missing { color: #ef4444; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>

<h1>🔍 Topic Meta Keys Debug for Post <?php echo $post_id; ?></h1>

<?php
$post_title = get_the_title($post_id) ?: "Post #{$post_id}";
echo "<p><strong>Post:</strong> {$post_title}</p>";

// Check all meta keys for this post
$all_meta = get_post_meta($post_id);

echo "<div class='section'>";
echo "<h2>📋 All Meta Keys for This Post:</h2>";
$topic_related = [];
foreach ($all_meta as $key => $values) {
    if (stripos($key, 'topic') !== false) {
        $topic_related[$key] = $values[0];
        echo "<p class='found'>✅ <span class='meta-key'>{$key}</span>: " . esc_html($values[0]) . "</p>";
    }
}

if (empty($topic_related)) {
    echo "<p class='missing'>❌ No topic-related meta keys found</p>";
}
echo "</div>";

// Check what our current code is looking for
echo "<div class='section'>";
echo "<h2>🎯 What Our Code Currently Looks For:</h2>";
$expected_keys = ['mkcg_topic_1', 'mkcg_topic_2', 'mkcg_topic_3', 'mkcg_topic_4', 'mkcg_topic_5'];
foreach ($expected_keys as $key) {
    $value = get_post_meta($post_id, $key, true);
    if (!empty($value)) {
        echo "<p class='found'>✅ <span class='meta-key'>{$key}</span>: " . esc_html($value) . "</p>";
    } else {
        echo "<p class='missing'>❌ <span class='meta-key'>{$key}</span>: (not found)</p>";
    }
}
echo "</div>";

// Check alternative formats
echo "<div class='section'>";
echo "<h2>🔍 Checking Alternative Formats:</h2>";
$alternative_formats = [
    'topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5',
    'topics_1', 'topics_2', 'topics_3', 'topics_4', 'topics_5',
    'speaking_topic_1', 'speaking_topic_2', 'speaking_topic_3',
    'pod_topic_1', 'pod_topic_2', 'pod_topic_3',
    '_topic_1', '_topic_2', '_topic_3'
];

$found_alternatives = [];
foreach ($alternative_formats as $key) {
    $value = get_post_meta($post_id, $key, true);
    if (!empty($value)) {
        echo "<p class='found'>✅ <span class='meta-key'>{$key}</span>: " . esc_html($value) . "</p>";
        $found_alternatives[$key] = $value;
    }
}

if (empty($found_alternatives)) {
    echo "<p class='missing'>❌ No alternative topic formats found</p>";
}
echo "</div>";

// Generate updated code if we found alternatives
if (!empty($found_alternatives)) {
    echo "<div class='section'>";
    echo "<h2>🔧 SOLUTION: Updated Code for Your Format</h2>";
    echo "<p>We found your topics using these meta keys. Here's the updated code:</p>";
    
    $detected_pattern = array_keys($found_alternatives)[0];
    $base_pattern = preg_replace('/\d+$/', '', $detected_pattern);
    
    echo "<h3>📝 Copy this updated template.php code:</h3>";
    echo "<textarea style='width: 100%; height: 200px; font-family: monospace; font-size: 12px;'>";
    echo htmlspecialchars("
// ROOT FIX: Updated to use your meta key format
if (\$current_post_id > 0) {
    // Check if MKCG integration class is available
    if (class_exists('GMKB_MKCG_Data_Integration')) {
        \$mkcg_integration = GMKB_MKCG_Data_Integration::get_instance();
        \$post_data = \$mkcg_integration->get_post_data(\$current_post_id);
        
        if (\$post_data && isset(\$post_data['topics']['topics']) && !empty(\$post_data['topics']['topics'])) {
            // Use MKCG data if available
            \$mkcg_topics = \$post_data['topics']['topics'];
            foreach (\$mkcg_topics as \$topic_key => \$topic_value) {
                if (!empty(\$topic_value)) {
                    \$topicsList[] = [
                        'title' => sanitize_text_field(\$topic_value),
                        'description' => '',
                        'source' => 'mkcg',
                        'meta_key' => \$topic_key
                    ];
                }
            }
            \$hasDynamicTopics = true;
        } else {
            // Fallback: Check for your specific meta key format
            for (\$i = 1; \$i <= 5; \$i++) {
                \$topic_value = get_post_meta(\$current_post_id, \"{$base_pattern}{\$i}\", true);
                if (!empty(\$topic_value)) {
                    \$topicsList[] = [
                        'title' => sanitize_text_field(\$topic_value),
                        'description' => '',
                        'source' => 'custom_meta',
                        'meta_key' => \"{$base_pattern}{\$i}\"
                    ];
                }
            }
            \$hasDynamicTopics = !empty(\$topicsList);
        }
    }
}
");
    echo "</textarea>";
    echo "</div>";
}

// Test current component loading
echo "<div class='section'>";
echo "<h2>🧪 Test Component Loading with Current Data</h2>";
if (class_exists('ComponentLoader') && class_exists('ComponentDiscovery')) {
    try {
        $discovery = new ComponentDiscovery(dirname(__FILE__) . '/components');
        $discovery->scan();
        $loader = new ComponentLoader(dirname(__FILE__) . '/components', $discovery);
        
        $props = ['post_id' => $post_id];
        $html = $loader->loadComponent('topics', $props);
        
        if ($html !== false) {
            echo "<p class='found'>✅ Component loaded successfully</p>";
            
            // Look for topics in the HTML
            preg_match_all('/class="topic-title"[^>]*>([^<]+)</', $html, $matches);
            if (!empty($matches[1])) {
                echo "<h3>📝 Topics Found in Rendered HTML:</h3>";
                foreach ($matches[1] as $i => $topic_title) {
                    $clean_title = trim($topic_title);
                    if (!empty($clean_title) && $clean_title !== 'Add Your Speaking Topics') {
                        echo "<p class='found'>✅ Topic " . ($i + 1) . ": " . esc_html($clean_title) . "</p>";
                    }
                }
            } else {
                echo "<p class='missing'>❌ No topics found in rendered HTML</p>";
            }
        } else {
            echo "<p class='missing'>❌ Component failed to load</p>";
        }
    } catch (Exception $e) {
        echo "<p class='missing'>❌ Error: " . esc_html($e->getMessage()) . "</p>";
    }
} else {
    echo "<p class='missing'>❌ Component classes not available</p>";
}
echo "</div>";
?>

</body>
</html>
