<?php
/**
 * QUICK TEST: Your topic_1 Format
 * Test the updated code with your specific meta key format
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

$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
?>
<!DOCTYPE html>
<html>
<head>
    <title>Topic_1 Format Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: #10b981; font-weight: bold; }
        .error { color: #ef4444; font-weight: bold; }
        .topic-preview { background: #f0f9ff; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 3px solid #0ea5e9; }
        .meta-key { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>

<h1>🧪 Testing Your topic_1 Format</h1>

<?php if ($post_id > 0): ?>
    <p><strong>Testing Post ID:</strong> <?php echo $post_id; ?></p>
    <p><strong>Post Title:</strong> <?php echo get_the_title($post_id) ?: 'N/A'; ?></p>
    
    <h2>📋 Step 1: Check Your Raw Data</h2>
    <?php
    $your_topics = [];
    for ($i = 1; $i <= 5; $i++) {
        $value = get_post_meta($post_id, "topic_{$i}", true);
        if (!empty($value)) {
            $your_topics["topic_{$i}"] = $value;
            echo "<p class='success'>✅ <span class='meta-key'>topic_{$i}</span>: " . esc_html($value) . "</p>";
        }
    }
    
    if (empty($your_topics)) {
        echo "<p class='error'>❌ No topic_1, topic_2, etc. meta fields found</p>";
        echo "<p>Try running the full debug script: <a href='debug-topic-meta.php?post_id={$post_id}'>debug-topic-meta.php</a></p>";
    } else {
        echo "<p class='success'><strong>✅ Found " . count($your_topics) . " topics in topic_X format!</strong></p>";
    }
    ?>
    
    <h2>🔧 Step 2: Test Updated MKCG Integration</h2>
    <?php
    if (class_exists('GMKB_MKCG_Data_Integration')) {
        try {
            $mkcg_integration = GMKB_MKCG_Data_Integration::get_instance();
            $post_data = $mkcg_integration->get_post_data($post_id);
            
            if ($post_data && isset($post_data['topics']['topics']) && !empty($post_data['topics']['topics'])) {
                echo "<p class='success'>✅ MKCG Integration now finds your topics!</p>";
                echo "<p>Meta format used: <span class='meta-key'>" . ($post_data['topics']['meta']['meta_format_used'] ?? 'unknown') . "</span></p>";
                
                foreach ($post_data['topics']['topics'] as $key => $value) {
                    echo "<div class='topic-preview'><strong>{$key}:</strong> " . esc_html($value) . "</div>";
                }
            } else {
                echo "<p class='error'>❌ MKCG Integration still not finding topics</p>";
            }
        } catch (Exception $e) {
            echo "<p class='error'>❌ MKCG Integration error: " . esc_html($e->getMessage()) . "</p>";
        }
    } else {
        echo "<p class='error'>❌ MKCG Integration class not found</p>";
    }
    ?>
    
    <h2>🎨 Step 3: Test Component Rendering</h2>
    <?php
    if (class_exists('ComponentLoader') && class_exists('ComponentDiscovery')) {
        try {
            $discovery = new ComponentDiscovery(dirname(__FILE__) . '/components');
            $discovery->scan();
            $loader = new ComponentLoader(dirname(__FILE__) . '/components', $discovery);
            
            $props = ['post_id' => $post_id];
            $html = $loader->loadComponent('topics', $props);
            
            if ($html !== false) {
                echo "<p class='success'>✅ Component renders successfully</p>";
                
                // Extract topics from rendered HTML
                preg_match_all('/class="topic-title"[^>]*>([^<]+)</', $html, $matches);
                if (!empty($matches[1])) {
                    echo "<h3>📝 Topics in Rendered Component:</h3>";
                    foreach ($matches[1] as $i => $topic_title) {
                        $clean_title = trim($topic_title);
                        if (!empty($clean_title) && $clean_title !== 'Add Your Speaking Topics') {
                            echo "<div class='topic-preview'>Topic " . ($i + 1) . ": " . esc_html($clean_title) . "</div>";
                        }
                    }
                    
                    echo "<p class='success'><strong>🎉 SUCCESS! Your topics are now populating!</strong></p>";
                } else {
                    echo "<p class='error'>❌ No dynamic topics found in component output</p>";
                }
                
                // Check for data attributes
                if (strpos($html, 'data-has-dynamic-topics="true"') !== false) {
                    echo "<p class='success'>✅ Dynamic topics flag is set correctly</p>";
                }
                
                if (strpos($html, 'data-post-id="' . $post_id . '"') !== false) {
                    echo "<p class='success'>✅ Post ID is passed correctly</p>";
                }
                
            } else {
                echo "<p class='error'>❌ Component failed to render</p>";
            }
        } catch (Exception $e) {
            echo "<p class='error'>❌ Component test error: " . esc_html($e->getMessage()) . "</p>";
        }
    } else {
        echo "<p class='error'>❌ Component classes not available</p>";
    }
    ?>
    
    <h2>📋 Next Steps</h2>
    <?php if (!empty($your_topics)): ?>
        <p class='success'>✅ <strong>You're all set!</strong> Your topics should now appear in the media kit builder.</p>
        <ol>
            <li>Clear any browser cache</li>
            <li>Reload the media kit builder page with <code>?post_id=<?php echo $post_id; ?></code></li>
            <li>Add a Topics component - it should show your data instead of placeholders</li>
            <li>Check the design panel - it should load your existing topics</li>
        </ol>
        
        <h3>🔗 Test in Builder</h3>
        <p>Visit your media kit builder: <br>
        <a href="<?php echo home_url('/guestify-media-kit?post_id=' . $post_id); ?>" target="_blank">
            <?php echo home_url('/guestify-media-kit?post_id=' . $post_id); ?>
        </a></p>
        
    <?php else: ?>
        <p class='error'>❌ No topics found. Please check your meta field names or data.</p>
        <p>Run the full debug: <a href='debug-topic-meta.php?post_id=<?php echo $post_id; ?>'>debug-topic-meta.php</a></p>
    <?php endif; ?>

<?php else: ?>
    <h2>❌ No Post ID</h2>
    <p>Please add <code>?post_id=YOUR_POST_ID</code> to the URL</p>
    
    <h3>🔍 Find Posts with topic_X Data:</h3>
    <?php
    global $wpdb;
    $results = $wpdb->get_results("
        SELECT DISTINCT post_id, COUNT(*) as topic_count
        FROM {$wpdb->postmeta} 
        WHERE meta_key LIKE 'topic_%' 
        AND meta_value != '' 
        GROUP BY post_id
        ORDER BY topic_count DESC
        LIMIT 10
    ");
    
    if (!empty($results)) {
        echo "<ul>";
        foreach ($results as $result) {
            $title = get_the_title($result->post_id) ?: "Post #{$result->post_id}";
            echo "<li><a href='?post_id={$result->post_id}'>{$title} ({$result->topic_count} topics)</a></li>";
        }
        echo "</ul>";
    } else {
        echo "<p>No posts with topic_X meta fields found.</p>";
    }
    ?>
<?php endif; ?>

</body>
</html>
