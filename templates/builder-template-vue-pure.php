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

        #app {
            width: 100%;
            height: 100%;
        }

        /* PHASE 6: Loading screen - Shows until Vue takes over */
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

        /* PHASE 6: Error screen */
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
        
        /* Hide WordPress admin bar in builder */
        #wpadminbar {
            display: none !important;
        }
        
        html {
            margin-top: 0 !important;
        }
        
        /* Builder UI Structure */
        #gmkb-builder-wrapper {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            padding-top: 60px; /* Account for fixed toolbar */
        }
        
        #gmkb-toolbar {
            flex-shrink: 0;
            z-index: 100;
            background: white;
            border-bottom: 1px solid #e5e7eb;
        }
        
        #gmkb-main-content {
            flex: 1;
            display: flex;
            overflow: hidden;
            /* Remove fixed height - let it flex naturally */
            padding-top: 0; /* Toolbar should take its space naturally via flex */
        }
        
        #gmkb-sidebar {
            flex-shrink: 0;
            width: 300px;
            height: 100%;
            overflow: hidden; /* Let child component handle scroll */
            display: flex;
            flex-direction: column;
            margin-top: 0; /* Ensure no negative margin */
            position: relative; /* Ensure proper stacking */
        }
        
        #media-kit-preview {
            flex: 1;
            overflow-y: auto;
            background: #f9fafb;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        /* Device preview styles */
        #media-kit-preview.device-desktop {
            max-width: 100%;
            margin: 0;
            box-shadow: none;
        }
        
        #media-kit-preview.device-tablet {
            max-width: 768px;
            margin: 0 auto;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        #media-kit-preview.device-mobile {
            max-width: 375px;
            margin: 0 auto;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        /* Show builder wrapper when Vue is ready */
        .gmkb-vue-ready #gmkb-builder-wrapper {
            display: flex !important;
        }
        
        /* Hide loading screen when Vue is ready */
        .gmkb-vue-ready #app {
            display: none;
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
    <div id="gmkb-builder-wrapper" style="display: none;">
        <!-- Toolbar mount point -->
        <div id="gmkb-toolbar"></div>
        
        <!-- Main content area with sidebar -->
        <div id="gmkb-main-content">
            <!-- Sidebar -->
            <aside id="gmkb-sidebar"></aside>
            
            <!-- Preview area -->
            <div id="media-kit-preview" style="flex: 1; overflow-y: auto; background: #f9fafb;"></div>
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
            version: '4.0.0-phase6',
            timestamp: <?php echo time(); ?>,
            architecture: 'pure-vue',
            debugMode: <?php echo json_encode(defined('WP_DEBUG') && WP_DEBUG); ?>,
            
            // ROOT FIX: Themes data - provide complete theme objects
            // These MUST match the structure in theme.js availableThemes
            themes: <?php 
                // CRITICAL: Build themes array with ALL required fields
                // Test that PHP is encoding correctly
                $themes = array(
                    array(
                        'id' => 'professional_clean',  // CRITICAL: This MUST encode as "id": "professional_clean"
                        'name' => 'Professional Clean',
                        'description' => 'Clean and professional design',
                        'category' => 'professional',
                        'colors' => array(
                            'primary' => '#3b82f6',
                            'secondary' => '#2563eb',
                            'background' => '#ffffff',
                            'surface' => '#f8fafc',
                            'text' => '#1e293b',
                            'textLight' => '#64748b',
                            'border' => '#e2e8f0',
                            'success' => '#10b981',
                            'warning' => '#f59e0b',
                            'error' => '#ef4444'
                        ),
                        'typography' => array(
                            'fontFamily' => "'Inter', system-ui, sans-serif",
                            'headingFamily' => "'Inter', system-ui, sans-serif",
                            'baseFontSize' => 16,
                            'headingScale' => 1.25,
                            'lineHeight' => 1.6,
                            'fontWeight' => 400
                        ),
                        'spacing' => array(
                            'baseUnit' => 8,
                            'componentGap' => 24,
                            'sectionPadding' => 40,
                            'containerMaxWidth' => 1200
                        ),
                        'effects' => array(
                            'borderRadius' => '8px',
                            'shadowIntensity' => 'medium',
                            'animationSpeed' => 'normal',
                            'gradients' => false,
                            'blurEffects' => false
                        )
                    ),
                    array(
                        'id' => 'creative_bold',
                        'name' => 'Creative Bold',
                        'description' => 'Bold and creative design',
                        'category' => 'creative',
                        'colors' => array(
                            'primary' => '#f97316',
                            'secondary' => '#ea580c',
                            'background' => '#fffbf5',
                            'surface' => '#fff7ed',
                            'text' => '#1f2937',
                            'textLight' => '#78716c',
                            'border' => '#fed7aa',
                            'success' => '#84cc16',
                            'warning' => '#fbbf24',
                            'error' => '#dc2626'
                        ),
                        'typography' => array(
                            'fontFamily' => "'Poppins', system-ui, sans-serif",
                            'headingFamily' => "'Playfair Display', serif",
                            'baseFontSize' => 17,
                            'headingScale' => 1.3,
                            'lineHeight' => 1.7,
                            'fontWeight' => 400
                        ),
                        'spacing' => array(
                            'baseUnit' => 10,
                            'componentGap' => 32,
                            'sectionPadding' => 48,
                            'containerMaxWidth' => 1280
                        ),
                        'effects' => array(
                            'borderRadius' => '12px',
                            'shadowIntensity' => 'strong',
                            'animationSpeed' => 'normal',
                            'gradients' => true,
                            'blurEffects' => false
                        )
                    ),
                    array(
                        'id' => 'minimal_elegant',
                        'name' => 'Minimal Elegant',
                        'description' => 'Minimal and elegant design',
                        'category' => 'minimal',
                        'colors' => array(
                            'primary' => '#18181b',
                            'secondary' => '#27272a',
                            'background' => '#ffffff',
                            'surface' => '#fafafa',
                            'text' => '#18181b',
                            'textLight' => '#71717a',
                            'border' => '#e4e4e7',
                            'success' => '#22c55e',
                            'warning' => '#eab308',
                            'error' => '#f87171'
                        ),
                        'typography' => array(
                            'fontFamily' => "'Helvetica Neue', system-ui, sans-serif",
                            'headingFamily' => "'Georgia', serif",
                            'baseFontSize' => 16,
                            'headingScale' => 1.2,
                            'lineHeight' => 1.5,
                            'fontWeight' => 300
                        ),
                        'spacing' => array(
                            'baseUnit' => 8,
                            'componentGap' => 20,
                            'sectionPadding' => 32,
                            'containerMaxWidth' => 1100
                        ),
                        'effects' => array(
                            'borderRadius' => '2px',
                            'shadowIntensity' => 'subtle',
                            'animationSpeed' => 'fast',
                            'gradients' => false,
                            'blurEffects' => false
                        )
                    ),
                    array(
                        'id' => 'modern_dark',
                        'name' => 'Modern Dark',
                        'description' => 'Modern dark theme',
                        'category' => 'dark',
                        'colors' => array(
                            'primary' => '#8b5cf6',
                            'secondary' => '#7c3aed',
                            'background' => '#0f172a',
                            'surface' => '#1e293b',
                            'text' => '#f1f5f9',
                            'textLight' => '#94a3b8',
                            'border' => '#334155',
                            'success' => '#4ade80',
                            'warning' => '#fbbf24',
                            'error' => '#f87171'
                        ),
                        'typography' => array(
                            'fontFamily' => "'Inter', system-ui, sans-serif",
                            'headingFamily' => "'Inter', system-ui, sans-serif",
                            'baseFontSize' => 16,
                            'headingScale' => 1.25,
                            'lineHeight' => 1.6,
                            'fontWeight' => 400
                        ),
                        'spacing' => array(
                            'baseUnit' => 8,
                            'componentGap' => 24,
                            'sectionPadding' => 40,
                            'containerMaxWidth' => 1200
                        ),
                        'effects' => array(
                            'borderRadius' => '8px',
                            'shadowIntensity' => 'strong',
                            'animationSpeed' => 'normal',
                            'gradients' => true,
                            'blurEffects' => true
                        )
                    )
                );
                
                // ROOT FIX: Output as clean JSON
                // Try without flags first to ensure proper encoding
                echo json_encode($themes);
            ?>,
            
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

        // ROOT FIX: DEBUG - Log themes data structure immediately
        if (window.gmkbData.debugMode) {
            console.log('🎯 GMKB Pure Vue Mode - Phase 6 Active');
            console.log('📊 Data Available:', {
                postId: window.gmkbData.postId,
                architecture: window.gmkbData.architecture,
                version: window.gmkbData.version,
                hasState: !!window.gmkbData.savedState,
                podsFields: Object.keys(window.gmkbData.pods_data).length
            });
            
            // CRITICAL: Check themes IMMEDIATELY after PHP output
            console.log('🎨 Themes from PHP:', window.gmkbData.themes);
            if (window.gmkbData.themes && window.gmkbData.themes.length > 0) {
                console.log('🎨 First theme from PHP:', window.gmkbData.themes[0]);
                console.log('🎨 First theme ID from PHP:', window.gmkbData.themes[0].id);
                console.log('🎨 First theme keys from PHP:', Object.keys(window.gmkbData.themes[0]));
            }
        }
    </script>

    <!-- WordPress Footer (loads scripts) -->
    <?php wp_footer(); ?>

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
