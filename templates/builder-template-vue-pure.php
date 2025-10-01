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

// ROOT FIX: Enhanced post ID detection with multiple strategies
$post_id = 0;
if (isset($_GET['mkcg_id'])) {
    $post_id = intval($_GET['mkcg_id']);
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('GMKB Phase 3: Using mkcg_id parameter: ' . $post_id);
    }
} elseif (isset($_GET['post_id'])) {
    $post_id = intval($_GET['post_id']);
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('GMKB Phase 3: Using post_id parameter: ' . $post_id);
    }
} elseif (isset($_GET['p'])) {
    $post_id = intval($_GET['p']);
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('GMKB Phase 3: Using p parameter: ' . $post_id);
    }
} else {
    $post_id = get_the_ID();
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('GMKB Phase 3: Using get_the_ID(): ' . ($post_id ?: 'NULL'));
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('GMKB Phase 3: Final detected post_id: ' . $post_id);
    error_log('GMKB Phase 3: REQUEST_URI: ' . ($_SERVER['REQUEST_URI'] ?? 'N/A'));
    error_log('GMKB Phase 3: GET parameters: ' . print_r($_GET, true));
}

// ROOT FIX: Verify post exists - support both 'guests' and 'mkcg' post types
$post = get_post($post_id);
if (!$post) {
    $error_details = '';
    if (defined('WP_DEBUG') && WP_DEBUG) {
        $error_details = '<br><br><strong>Debug Info:</strong><br>';
        $error_details .= 'Post ID attempted: ' . esc_html($post_id) . '<br>';
        $error_details .= 'URL: ' . esc_html($_SERVER['REQUEST_URI'] ?? 'N/A') . '<br>';
        $error_details .= 'GET parameters: ' . esc_html(print_r($_GET, true));
    }
    wp_die(
        'Invalid media kit ID: Post not found (ID: ' . esc_html($post_id) . ')' . $error_details,
        'Media Kit Builder Error',
        array('response' => 404)
    );
}

// Support multiple post types (guests is the primary post type)
$allowed_post_types = array('guests', 'mkcg');
if (!in_array($post->post_type, $allowed_post_types)) {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('GMKB Phase 3: Invalid post type for media kit: ' . $post->post_type . ' (ID: ' . $post_id . ')');
    }
    wp_die('Invalid media kit ID: Post type "' . esc_html($post->post_type) . '" is not supported. Expected: guests or mkcg');
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
            background: #f5f7fa;
        }

        /* ROOT FIX: Full-Featured Layout Structure - NO RIGHT SIDEBAR */
        .gmkb-app-wrapper {
            position: fixed;
            top: 60px;
            left: 280px;
            right: 0;
            bottom: 0;
            overflow: hidden;
        }
        
        /* Toolbar Styles */
        .gmkb-toolbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            z-index: 1000;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .toolbar-loading {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #64748b;
            font-size: 14px;
        }
        
        .toolbar-loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        .toolbar-left {
            display: flex;
            align-items: baseline;
            gap: 12px;
        }
        
        .toolbar-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
        }
        
        .toolbar-subtitle {
            font-size: 14px;
            color: #64748b;
        }
        
        .toolbar-right {
            display: flex;
            gap: 12px;
        }
        
        .toolbar-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            color: #475569;
            transition: all 0.2s ease;
        }
        
        .toolbar-btn:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
        }
        
        .toolbar-btn--primary {
            background: #3b82f6;
            border-color: #3b82f6;
            color: #ffffff;
        }
        
        .toolbar-btn--primary:hover {
            background: #2563eb;
            border-color: #2563eb;
        }
        
        .toolbar-btn svg {
            width: 18px;
            height: 18px;
        }
        
        /* Sidebar Styles */
        .gmkb-sidebar {
            position: fixed;
            top: 60px;
            left: 0;
            width: 280px;
            bottom: 0;
            background: #ffffff;
            border-right: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            z-index: 100;
        }
        
        .sidebar-header {
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .sidebar-header h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }
        
        .sidebar-btn-primary {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 16px;
            background: #3b82f6;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s ease;
        }
        
        .sidebar-btn-primary:hover {
            background: #2563eb;
        }
        
        .sidebar-content {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }
        
        /* Main Content Area - NO RIGHT SIDEBAR */
        .gmkb-main-content {
            position: fixed;
            top: 60px;
            left: 280px;
            right: 0;
            bottom: 0;
            overflow: auto;
            background: #f5f7fa;
        }
        
        .media-kit-preview {
            min-height: 100%;
            padding: 24px;
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
        
        /* Responsive adjustments - NO RIGHT SIDEBAR */
        @media (max-width: 1024px) {
            .gmkb-sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s ease;
                z-index: 200;
            }
            
            .gmkb-sidebar.open {
                transform: translateX(0);
            }
            
            .gmkb-app-wrapper,
            .gmkb-main-content {
                left: 0;
            }
        }
        
        @media (max-width: 768px) {
            .gmkb-toolbar {
                height: 50px;
            }
            
            .gmkb-app-wrapper,
            .gmkb-main-content,
            .gmkb-sidebar {
                top: 50px;
            }
        }
        
        /* Hide WordPress admin bar in builder */
        #wpadminbar {
            display: none !important;
        }
        
        html {
            margin-top: 0 !important;
        }
    </style>
</head>
<body class="gmkb-builder gmkb-pure-vue">

    <!-- ROOT FIX: Full-Featured Pure Vue Structure -->
    <!-- This provides ALL the DOM elements that Vue components expect -->
    
    <!-- Main Application Container -->
    <div id="app" class="gmkb-app-wrapper">
        <!-- Loading State (Vue will replace this) -->
        <div class="gmkb-loading">
            <div class="gmkb-loading__content">
                <div class="gmkb-loading__spinner"></div>
                <h2 class="gmkb-loading__title">Loading Media Kit Builder</h2>
                <p class="gmkb-loading__message">Initializing Vue application...</p>
            </div>
        </div>
    </div>
    
    <!-- ROOT FIX: Toolbar Container - Vue will populate this -->
    <div id="gmkb-toolbar" class="gmkb-toolbar">
        <!-- Vue MediaKitToolbarComplete component will render here -->
        <div class="toolbar-loading">
            <div class="toolbar-loading-spinner"></div>
            <span>Loading toolbar...</span>
        </div>
    </div>
    
    <!-- ROOT FIX: Sidebar Structure for SidebarIntegration -->
    <div id="gmkb-sidebar" class="gmkb-sidebar">
        <div class="sidebar-header">
            <h3>Components</h3>
            <button id="add-component-btn" class="sidebar-btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Component
            </button>
        </div>
        <div id="sidebar-components" class="sidebar-content">
            <!-- Vue will populate this -->
        </div>
    </div>
    
    <!-- ROOT FIX: Main Content Area -->
    <div id="gmkb-main-content" class="gmkb-main-content">
        <div id="media-kit-preview" class="media-kit-preview">
            <!-- Vue SectionLayoutEnhanced will render here -->
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
            architecture: 'pure-vue',
            debugMode: <?php echo json_encode(defined('WP_DEBUG') && WP_DEBUG); ?>,
            
            // ROOT FIX: Add themes data for theme store (MUST BE ARRAY, not object)
            themes: <?php echo json_encode(array(
                array(
                    'id' => 'professional_clean',
                    'name' => 'Professional Clean',
                    'description' => 'Clean and professional design',
                    'category' => 'professional',
                    'colors' => array(
                        'primary' => '#3b82f6',
                        'secondary' => '#8b5cf6',
                        'border' => '#e2e8f0'
                    )
                ),
                array(
                    'id' => 'creative_bold',
                    'name' => 'Creative Bold',
                    'description' => 'Bold and creative design',
                    'category' => 'creative',
                    'colors' => array(
                        'primary' => '#ec4899',
                        'secondary' => '#f59e0b',
                        'border' => '#fbbf24'
                    )
                ),
                array(
                    'id' => 'modern_minimal',
                    'name' => 'Modern Minimal',
                    'description' => 'Minimal and modern design',
                    'category' => 'modern',
                    'colors' => array(
                        'primary' => '#06b6d4',
                        'secondary' => '#0ea5e9',
                        'border' => '#e0f2fe'
                    )
                ),
                array(
                    'id' => 'elegant_classic',
                    'name' => 'Elegant Classic',
                    'description' => 'Classic and elegant design',
                    'category' => 'elegant',
                    'colors' => array(
                        'primary' => '#7c3aed',
                        'secondary' => '#a78bfa',
                        'border' => '#ddd6fe'
                    )
                ),
                array(
                    'id' => 'dark_mode',
                    'name' => 'Dark Mode',
                    'description' => 'Dark theme for modern look',
                    'category' => 'dark',
                    'colors' => array(
                        'primary' => '#8b5cf6',
                        'secondary' => '#a78bfa',
                        'border' => '#4c1d95'
                    )
                )
            )); ?>,
            
            // Load saved state if exists
            savedState: <?php 
                $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
                echo json_encode($saved_state ?: null);
            ?>,
            
            // Pods data if available
            pods_data: <?php
                $pods_data = array();
                if (function_exists('pods')) {
                    $pod = pods('guests', $post_id);
                    if ($pod && $pod->exists()) {
                        $fields = array(
                            'biography', 'first_name', 'last_name', 'email', 
                            'phone', 'website', 'headshot'
                        );
                        foreach ($fields as $field) {
                            $pods_data[$field] = $pod->field($field);
                        }
                        // Add topics
                        for ($i = 1; $i <= 5; $i++) {
                            $pods_data["topic_$i"] = $pod->field("topic_$i");
                        }
                    }
                }
                echo json_encode($pods_data);
            ?>
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
