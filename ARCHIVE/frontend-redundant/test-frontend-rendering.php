<?php
/**
 * Test Frontend Rendering
 * 
 * Simple test file to verify media kit frontend rendering
 * Place this in the WordPress root or as a page template
 * 
 * Usage: Access this file or add to a page template
 */

// Load WordPress
if (!defined('ABSPATH')) {
    require_once(dirname(__FILE__) . '/wp-load.php');
}

// Get a test post ID (replace with your actual guest post ID)
$test_post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;

if (!$test_post_id) {
    // Try to find a guest post with media kit data
    $args = array(
        'post_type' => 'guests',
        'posts_per_page' => 1,
        'meta_key' => 'gmkb_media_kit_state',
        'meta_compare' => 'EXISTS'
    );
    
    $query = new WP_Query($args);
    
    if ($query->have_posts()) {
        $query->the_post();
        $test_post_id = get_the_ID();
        wp_reset_postdata();
    }
}

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Media Kit Frontend Test</title>
    <?php wp_head(); ?>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .test-header {
            background: #f0f0f0;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
        }
        .test-header h1 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .test-info {
            color: #666;
            font-size: 14px;
        }
        .test-controls {
            margin: 20px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .test-controls input {
            padding: 8px 12px;
            margin-right: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .test-controls button {
            padding: 8px 20px;
            background: #295cff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .test-controls button:hover {
            background: #1c4acc;
        }
        .status-message {
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .status-message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status-message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status-message.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
    </style>
</head>
<body>
    <div class="test-header">
        <h1>Media Kit Frontend Rendering Test</h1>
        <div class="test-info">
            This page tests the frontend rendering of saved media kits.
        </div>
    </div>
    
    <div class="test-controls">
        <form method="get">
            <label>Post ID: </label>
            <input type="number" name="post_id" value="<?php echo esc_attr($test_post_id); ?>" placeholder="Enter guest post ID">
            <button type="submit">Load Media Kit</button>
        </form>
    </div>
    
    <?php if ($test_post_id): ?>
        <?php
        // Check if media kit exists
        $has_media_kit = function_exists('gmkb_has_media_kit') ? gmkb_has_media_kit($test_post_id) : false;
        
        if ($has_media_kit):
            $post = get_post($test_post_id);
        ?>
            <div class="status-message success">
                ✅ Media kit found for: <strong><?php echo esc_html($post->post_title); ?></strong> (ID: <?php echo $test_post_id; ?>)
            </div>
            
            <h2>Rendered Media Kit:</h2>
            <div style="border: 2px solid #ddd; border-radius: 8px; padding: 20px; background: white;">
                <?php
                // Render the media kit
                if (function_exists('gmkb_render_media_kit')) {
                    echo gmkb_render_media_kit($test_post_id);
                } else {
                    echo '<p>Error: gmkb_render_media_kit function not found</p>';
                }
                ?>
            </div>
            
            <h2>Shortcode Test:</h2>
            <div style="border: 2px solid #ddd; border-radius: 8px; padding: 20px; background: white; margin-top: 20px;">
                <?php
                // Test shortcode rendering
                echo do_shortcode('[gmkb_media_kit id="' . $test_post_id . '"]');
                ?>
            </div>
            
        <?php else: ?>
            <div class="status-message error">
                ❌ No media kit found for post ID: <?php echo $test_post_id; ?>
            </div>
            
            <?php
            // Try to show what's in the database
            $state = get_post_meta($test_post_id, 'gmkb_media_kit_state', true);
            if ($state):
            ?>
                <div class="status-message info">
                    ℹ️ Raw data exists but may be invalid. Debug info:
                    <pre><?php print_r($state); ?></pre>
                </div>
            <?php endif; ?>
            
        <?php endif; ?>
    <?php else: ?>
        <div class="status-message info">
            ℹ️ No post ID specified. Enter a guest post ID above to test rendering.
        </div>
        
        <?php
        // Show available guest posts with media kits
        $args = array(
            'post_type' => 'guests',
            'posts_per_page' => 10,
            'meta_key' => 'gmkb_media_kit_state',
            'meta_compare' => 'EXISTS'
        );
        
        $query = new WP_Query($args);
        
        if ($query->have_posts()):
        ?>
            <h3>Available Guest Posts with Media Kits:</h3>
            <ul>
                <?php while ($query->have_posts()): $query->the_post(); ?>
                    <li>
                        <a href="?post_id=<?php echo get_the_ID(); ?>">
                            <?php the_title(); ?> (ID: <?php echo get_the_ID(); ?>)
                        </a>
                    </li>
                <?php endwhile; ?>
            </ul>
        <?php
        wp_reset_postdata();
        endif;
        ?>
    <?php endif; ?>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
        <h3>Testing Information:</h3>
        <ul>
            <li><strong>Plugin Active:</strong> <?php 
                $plugin_file = 'mk4/guestify-media-kit-builder.php';
                $active_plugins = get_option('active_plugins');
                echo in_array($plugin_file, $active_plugins) ? '✅ Yes' : '❌ No'; 
            ?></li>
            <li><strong>Frontend Renderer Class:</strong> <?php echo class_exists('GMKB_Frontend_Renderer') ? '✅ Loaded' : '❌ Not Loaded'; ?></li>
            <li><strong>Helper Functions:</strong> 
                <ul>
                    <li>gmkb_render_media_kit: <?php echo function_exists('gmkb_render_media_kit') ? '✅ Available' : '❌ Not Found'; ?></li>
                    <li>gmkb_has_media_kit: <?php echo function_exists('gmkb_has_media_kit') ? '✅ Available' : '❌ Not Found'; ?></li>
                </ul>
            </li>
            <li><strong>Template Router Class:</strong> <?php echo class_exists('GMKB_Frontend_Template_Router') ? '✅ Loaded' : '❌ Not Loaded'; ?></li>
            <li><strong>Constants:</strong>
                <ul>
                    <li>GMKB_PLUGIN_DIR: <?php echo defined('GMKB_PLUGIN_DIR') ? '✅ ' . GMKB_PLUGIN_DIR : '❌ Not Defined'; ?></li>
                    <li>GMKB_PLUGIN_URL: <?php echo defined('GMKB_PLUGIN_URL') ? '✅ ' . GMKB_PLUGIN_URL : '❌ Not Defined'; ?></li>
                </ul>
            </li>
        </ul>
        
        <h3>Theme Selection Test:</h3>
        <?php if ($test_post_id && $has_media_kit): ?>
            <form method="get">
                <input type="hidden" name="post_id" value="<?php echo $test_post_id; ?>">
                <label>Test with Theme: </label>
                <select name="theme">
                    <option value="">Default</option>
                    <option value="professional_clean">Professional Clean</option>
                    <option value="creative_bold">Creative Bold</option>
                    <option value="minimal_elegant">Minimal Elegant</option>
                    <option value="modern_dark">Modern Dark</option>
                </select>
                <button type="submit">Apply Theme</button>
            </form>
            
            <?php if (isset($_GET['theme']) && $_GET['theme']): ?>
                <div style="border: 2px solid #ddd; border-radius: 8px; padding: 20px; background: white; margin-top: 20px;">
                    <h4>With Theme: <?php echo esc_html($_GET['theme']); ?></h4>
                    <?php
                    echo gmkb_render_media_kit($test_post_id, array('theme' => $_GET['theme']));
                    ?>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
    
    <?php wp_footer(); ?>
</body>
</html>
