<?php
/**
 * Template Router Diagnostic
 * 
 * Add this to the TOP of your theme's single-guests.php file temporarily:
 * <?php include_once(GMKB_PLUGIN_DIR . 'debug/template-diagnostic.php'); ?>
 */

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('=== THEME TEMPLATE DIAGNOSTIC ===');
    error_log('Theme template loaded: single-guests.php');
    
    global $post;
    if ($post) {
        error_log('Post ID: ' . $post->ID);
        error_log('Post Title: ' . $post->post_title);
        error_log('Post Type: ' . $post->post_type);
        
        // Check for media kit data
        $media_kit_state = get_post_meta($post->ID, 'gmkb_media_kit_state', true);
        
        if (!empty($media_kit_state)) {
            error_log('⚠️ WARNING: This post HAS media kit data!');
            error_log('Components: ' . count($media_kit_state['components'] ?? []));
            error_log('Sections: ' . count($media_kit_state['sections'] ?? []));
            error_log('Layout items: ' . count($media_kit_state['layout'] ?? []));
            
            // This should have been intercepted by the plugin!
            error_log('❌ ERROR: Plugin template router FAILED to intercept!');
            error_log('Plugin template exists: ' . (file_exists(GMKB_PLUGIN_DIR . 'templates/single-guests-mediakit-fallback.php') ? 'YES' : 'NO'));
            
            // Try to manually load the plugin template
            $plugin_template = GMKB_PLUGIN_DIR . 'templates/single-guests-mediakit-fallback.php';
            if (file_exists($plugin_template)) {
                error_log('🔧 ATTEMPTING MANUAL OVERRIDE...');
                
                // Set globals for the template
                $GLOBALS['gmkb_using_media_kit_template'] = true;
                $GLOBALS['gmkb_media_kit_state'] = $media_kit_state;
                $GLOBALS['gmkb_media_kit_post_id'] = $post->ID;
                
                // Include the plugin template and exit
                include $plugin_template;
                exit;
            }
        } else {
            error_log('✅ No media kit data - using theme template is correct');
        }
    }
}

// If we get here, continue with the theme template...
?>
