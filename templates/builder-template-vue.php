<?php
/**
 * Media Kit Builder - Vue Application Template
 * Clean, minimal template for 100% Vue architecture
 * 
 * @package Guestify
 * @version 4.0.0
 */

// Get post ID
$post_id = isset($_GET['mkcg_id']) ? intval($_GET['mkcg_id']) : 0;

// Debug mode
$debug_mode = defined('WP_DEBUG') && WP_DEBUG;
?>

<div id="gmkb-vue-app-wrapper" class="gmkb-wrapper">
    <!-- Vue App Mount Point -->
    <div id="gmkb-app" 
         data-post-id="<?php echo esc_attr($post_id); ?>"
         data-api-root="<?php echo esc_url(rest_url('gmkb/v1/')); ?>"
         data-nonce="<?php echo esc_attr(wp_create_nonce('wp_rest')); ?>">
        
        <!-- Loading State (replaced by Vue on mount) -->
        <div class="gmkb-loading">
            <div class="gmkb-loading-spinner">
                <svg width="50" height="50" viewBox="0 0 50 50" class="gmkb-spinner">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="#42b883" stroke-width="3" stroke-linecap="round">
                        <animate attributeName="stroke-dasharray" values="0 125;125 125" dur="1.5s" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" values="0;-125" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                </svg>
            </div>
            <p class="gmkb-loading-text">Loading Media Kit Builder...</p>
        </div>
    </div>
    
    <!-- Noscript Fallback -->
    <noscript>
        <div class="gmkb-noscript-notice">
            <h2>JavaScript Required</h2>
            <p>The Media Kit Builder requires JavaScript to be enabled in your browser.</p>
            <p>Please enable JavaScript and refresh this page.</p>
        </div>
    </noscript>
</div>

<style>
/* Minimal styles for loading state */
.gmkb-wrapper {
    min-height: 100vh;
    background: #f5f5f5;
}

.gmkb-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
}

.gmkb-loading-spinner {
    margin-bottom: 20px;
}

.gmkb-spinner {
    animation: rotate 2s linear infinite;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.gmkb-loading-text {
    font-size: 16px;
    color: #666;
    margin: 0;
}

.gmkb-noscript-notice {
    background: #fff;
    border: 2px solid #f44336;
    border-radius: 8px;
    padding: 30px;
    margin: 50px auto;
    max-width: 500px;
    text-align: center;
}

.gmkb-noscript-notice h2 {
    color: #f44336;
    margin: 0 0 15px 0;
}

.gmkb-noscript-notice p {
    color: #666;
    margin: 10px 0;
    line-height: 1.5;
}

/* Hide WordPress admin bar on builder page */
body.media-kit-builder-page #wpadminbar {
    display: none !important;
}

body.media-kit-builder-page {
    margin-top: 0 !important;
}

/* Vue app styles will override these once loaded */
#gmkb-app[data-v-] .gmkb-loading {
    display: none;
}
</style>

<?php if ($debug_mode): ?>
<script>
// Debug information
console.log('🚀 GMKB Vue Mode - Debug Info');
console.log('================================');
console.log('Post ID:', <?php echo json_encode($post_id); ?>);
console.log('API Root:', <?php echo json_encode(rest_url('gmkb/v1/')); ?>);
console.log('Nonce:', '<?php echo wp_create_nonce('wp_rest'); ?>'.substring(0, 10) + '...');
console.log('Plugin URL:', <?php echo json_encode(GUESTIFY_PLUGIN_URL); ?>);
console.log('================================');
</script>
<?php endif; ?>