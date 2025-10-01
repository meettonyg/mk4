<?php
/**
 * Pure Vue Template - Media Kit Builder v2.0
 * 
 * NO PHP RENDERING - 100% Vue.js SPA
 * WordPress only provides initial HTML shell
 * 
 * @package GMKB
 * @version 2.0.0
 */

// Security check
if (!defined('ABSPATH')) {
    exit;
}

// Get post ID
$post_id = 0;
if (isset($_GET['mkcg_id'])) {
    $post_id = intval($_GET['mkcg_id']);
} elseif (isset($_GET['post_id'])) {
    $post_id = intval($_GET['post_id']);
} else {
    $post_id = get_the_ID();
}

// Verify post exists
$post = get_post($post_id);
if (!$post || $post->post_type !== 'mkcg') {
    wp_die('Invalid media kit ID');
}

?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="gmkb-pure-vue">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title><?php echo esc_html($post->post_title); ?> - Media Kit Builder</title>

    <!-- WordPress Head (loads Vue bundle) -->
    <?php wp_head(); ?>

    <style>
        /* Critical CSS - Inline for instant loading */
        body, html {
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        #app {
            width: 100%;
            height: 100%;
        }

        /* Loading screen */
        .gmkb-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .gmkb-loading__content {
            text-align: center;
            color: white;
            max-width: 500px;
            padding: 40px;
        }

        .gmkb-loading__spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 30px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .gmkb-loading__title {
            font-size: 28px;
            margin: 0 0 12px;
            font-weight: 600;
        }

        .gmkb-loading__message {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
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
            background: #f5f5f5;
        }

        .gmkb-error__title {
            color: #dc2626;
            font-size: 24px;
            margin-bottom: 16px;
        }

        .gmkb-error__message {
            color: #64748b;
            max-width: 500px;
        }

        .gmkb-error__button {
            margin-top: 20px;
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }

        .gmkb-error__button:hover {
            background: #2563eb;
        }
    </style>
</head>
<body class="gmkb-builder gmkb-pure-vue">

    <!-- Vue Application Mount Point -->
    <div id="app">
        <!-- Loading State (Vue will replace this) -->
        <div class="gmkb-loading">
            <div class="gmkb-loading__content">
                <div class="gmkb-loading__spinner"></div>
                <h2 class="gmkb-loading__title">Loading Media Kit Builder</h2>
                <p class="gmkb-loading__message">Initializing Vue application...</p>
            </div>
        </div>
    </div>

    <!-- Data Injection for Vue -->
    <script type="text/javascript">
        // CRITICAL: This must be available before Vue loads
        window.gmkbData = {
            postId: <?php echo json_encode($post_id); ?>,
            postTitle: <?php echo json_encode($post->post_title); ?>,
            nonce: <?php echo json_encode(wp_create_nonce('gmkb_nonce')); ?>,
            restUrl: <?php echo json_encode(esc_url_raw(rest_url())); ?>,
            restNonce: <?php echo json_encode(wp_create_nonce('wp_rest')); ?>,
            ajaxUrl: <?php echo json_encode(admin_url('admin-ajax.php')); ?>,
            pluginUrl: <?php echo json_encode(GUESTIFY_PLUGIN_URL); ?>,
            environment: <?php echo json_encode(defined('WP_DEBUG') && WP_DEBUG ? 'development' : 'production'); ?>,
            version: '2.0.0',
            timestamp: <?php echo time(); ?>,
            architecture: 'pure-vue'
        };

        // Debugging helper
        if (window.gmkbData.environment === 'development') {
            console.log('🎯 GMKB Pure Vue Mode - Data Available:', window.gmkbData);
        }
    </script>

    <!-- WordPress Footer (loads scripts) -->
    <?php wp_footer(); ?>

    <!-- Fallback Error Handler -->
    <script type="text/javascript">
        // If Vue doesn't mount within 10 seconds, show error
        setTimeout(function() {
            // Check if Vue has mounted by looking for Vue-specific attributes
            const app = document.getElementById('app');
            const vueAttrs = app.querySelectorAll('[data-v-app]');
            
            if (!window.gmkbApp && vueAttrs.length === 0) {
                app.innerHTML = '<div class="gmkb-error">' +
                    '<h1 class="gmkb-error__title">⚠️ Failed to Load</h1>' +
                    '<p class="gmkb-error__message">' +
                    'The Media Kit Builder failed to initialize. ' +
                    'This could be due to a JavaScript error or network issue.' +
                    '</p>' +
                    '<button class="gmkb-error__button" onclick="location.reload()">Reload Page</button>' +
                    '</div>';
            }
        }, 10000);
    </script>
</body>
</html>
