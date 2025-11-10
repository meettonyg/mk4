<?php
/**
 * Pure Vue Template - Media Kit Builder v2.0
 * 
 * NO PHP RENDERING - 100% Vue.js SPA
 * WordPress only provides initial HTML shell
 * 
 * @package GMKB
 * @version 2.0.1
 * Last modified: 2025-11-09 - Added direct wp_enqueue_media() call
 */

// Security check
if (!defined('ABSPATH')) {
    exit;
}

// ROOT FIX: Enhanced post ID detection with multiple strategies
$post_id = 0;
if (isset($_GET['mkcg_id'])) {
    $post_id = intval($_GET['mkcg_id']);
} elseif (isset($_GET['post_id'])) {
    $post_id = intval($_GET['post_id']);
} elseif (isset($_GET['p'])) {
    $post_id = intval($_GET['p']);
} else {
    $post_id = get_the_ID();
}

// Verify post exists
$post = get_post($post_id);
if (!$post) {
    wp_die(
        'Invalid media kit ID: Post not found (ID: ' . esc_html($post_id) . ')',
        'Media Kit Builder Error',
        array('response' => 404)
    );
}

// Support multiple post types
$allowed_post_types = array('guests', 'mkcg');
if (!in_array($post->post_type, $allowed_post_types)) {
    wp_die('Invalid media kit ID: Post type "' . esc_html($post->post_type) . '" is not supported. Expected: guests or mkcg');
}

?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="gmkb-pure-vue">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title><?php echo esc_html($post->post_title); ?> - Media Kit Builder</title>

    <?php
    // ROOT FIX: DIRECTLY enqueue media library BEFORE wp_head()
    // This ensures wp.media is available when Vue initializes
    wp_enqueue_media();
    wp_enqueue_script('media-editor');
    
    // Add inline verification script
    wp_add_inline_script('media-editor', '
        console.log("🔍 GMKB: Verification script running (template direct load)...");
        if (window.wp && window.wp.media) {
            console.log("✅ GMKB: WordPress media library (wp.media) is available");
            console.log("  - wp.media object:", window.wp.media);
        } else {
            console.error("❌ GMKB: WordPress media library (wp.media) NOT available - media upload will fail");
            console.error("❌ window.wp:", window.wp);
            console.error("❌ window.wp.media:", window.wp?.media);
        }
    ');
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB TEMPLATE: Directly enqueued wp.media before wp_head()');
    }
    ?>

    <!-- WordPress Head (loads Vue bundle) -->
    <?php wp_head(); ?>

    <style>
        /* CRITICAL CSS - Must be inline for instant loading */
        body, html {
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif;
            background: #f8f9fb;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        #app {
            width: 100%;
            height: 100%;
        }
        
        /* ROOT FIX: Hide builder wrapper until Vue is ready */
        #gmkb-builder-wrapper {
            display: none;
        }
        
        body.gmkb-vue-ready #gmkb-builder-wrapper {
            display: flex;
        }
        
        /* Hide loading screen when Vue is ready */
        body.gmkb-vue-ready #app {
            display: none;
        }

        /* Loading screen - Shows until Vue takes over */
        .gmkb-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
            position: relative;
            overflow: hidden;
        }

        .gmkb-loading::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)" /></svg>');
            animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(20px, 20px); }
        }

        .gmkb-loading__content {
            text-align: center;
            color: white;
            max-width: 500px;
            padding: 40px;
            position: relative;
            z-index: 1;
        }

        .gmkb-loading__spinner {
            width: 64px;
            height: 64px;
            border: 3px solid rgba(255, 255, 255, 0.2);
            border-top-color: white;
            border-right-color: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            margin: 0 auto 30px;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .gmkb-loading__title {
            font-size: 32px;
            margin: 0 0 12px;
            font-weight: 700;
            letter-spacing: -0.5px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .gmkb-loading__message {
            font-size: 16px;
            opacity: 0.95;
            margin: 0;
            font-weight: 500;
            text-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
        }

        /* Error screen */
        .gmkb-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            padding: 40px;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .gmkb-error__title {
            font-size: 32px;
            margin: 0 0 16px;
            font-weight: 600;
        }

        .gmkb-error__message {
            font-size: 18px;
            margin: 0 0 24px;
            max-width: 600px;
            line-height: 1.6;
        }

        .gmkb-error__button {
            padding: 12px 32px;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .gmkb-error__button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body class="gmkb-builder gmkb-pure-vue">

    <!-- PHASE 3 & 6: Pure Vue Application Mount Point -->
    <!-- Vue takes complete control - NO static UI elements -->
    <div id="app">
        <!-- Loading State - Vue will replace this entire content -->
        <div class="gmkb-loading">
            <div class="gmkb-loading__content">
                <div class="gmkb-loading__spinner"></div>
                <h2 class="gmkb-loading__title">Loading Media Kit Builder</h2>
                <p class="gmkb-loading__message">Phase 6 optimizations active...</p>
            </div>
        </div>
    </div>
    
    <!-- Builder UI Structure - Mount points for Vue Teleport -->
    <!-- ROOT FIX: Don't hide wrapper - let Vue control visibility -->
    <div id="gmkb-builder-wrapper">
        <!-- Toolbar mount point -->
        <div id="gmkb-toolbar"></div>
        
        <!-- Main content area with sidebar -->
        <div id="gmkb-main-content">
            <!-- Sidebar -->
            <aside id="gmkb-sidebar"></aside>
            
            <!-- Preview area -->
            <div id="media-kit-preview"></div>
        </div>
    </div>

    <!-- Data Injection handled by enqueue.php via wp_head() -->
    <!-- Template provides HTML structure only - NO data injection -->

    <!-- WordPress Footer (loads scripts) -->
    <?php 
    wp_footer(); 
    
    // ROOT FIX v3: Output media templates for frontend builder
    // WordPress media library requires these admin templates to work
    if (!is_admin()) {
        // Print media templates (Backbone views for media library modal)
        wp_print_media_templates();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Media templates printed in footer for frontend builder');
        }
    }
    ?>

    <!-- PHASE 6: Fallback Error Handler -->
    <script type="text/javascript">
        // If Vue doesn't mount within 10 seconds, show error
        setTimeout(function() {
            const app = document.getElementById('app');
            
            // Check if Vue has successfully mounted
            if (!window.gmkbApp && !window.gmkbVueInstance) {
                app.innerHTML = '<div class="gmkb-error">' +
                    '<h1 class="gmkb-error__title">⚠️ Failed to Load</h1>' +
                    '<p class="gmkb-error__message">' +
                    'The Media Kit Builder failed to initialize. ' +
                    'This could be due to a JavaScript error or network issue.' +
                    '</p>' +
                    '<p class="gmkb-error__message" style="font-size: 14px; opacity: 0.8;">' +
                    'Check the browser console for details.' +
                    '</p>' +
                    '<button class="gmkb-error__button" onclick="location.reload()">Reload Page</button>' +
                    '</div>';
            }
        }, 10000);
    </script>
</body>
</html>
