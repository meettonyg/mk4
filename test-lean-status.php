<?php
/**
 * Quick test to verify lean bundle is working
 * Place this in WordPress root or plugin directory and access via browser
 */

// Load WordPress if not already loaded
if (!defined('ABSPATH')) {
    require_once('../../../wp-load.php');
}

// Check if plugin is active
if (!defined('GUESTIFY_PLUGIN_DIR')) {
    die('Guestify Media Kit Builder plugin is not active');
}

// Check if lean bundle exists
$bundle_path = GUESTIFY_PLUGIN_DIR . 'dist/gmkb.iife.js';
$bundle_exists = file_exists($bundle_path);

// Check lean bundle setting
$lean_enabled = defined('GMKB_USE_LEAN_BUNDLE') ? GMKB_USE_LEAN_BUNDLE : false;

?>
<!DOCTYPE html>
<html>
<head>
    <title>Lean Bundle Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Media Kit Builder - Lean Bundle Status</h1>
    
    <div class="status <?php echo $bundle_exists ? 'success' : 'error'; ?>">
        Bundle File: <?php echo $bundle_exists ? '✅ EXISTS' : '❌ NOT FOUND'; ?>
        <br>Path: <?php echo $bundle_path; ?>
    </div>
    
    <div class="status <?php echo $lean_enabled ? 'success' : 'error'; ?>">
        Lean Bundle: <?php echo $lean_enabled ? '✅ ENABLED' : '❌ DISABLED'; ?>
    </div>
    
    <div class="status info">
        Plugin URL: <?php echo GUESTIFY_PLUGIN_URL; ?>
    </div>
    
    <?php if ($bundle_exists): ?>
        <div class="status info">
            Bundle Size: <?php echo number_format(filesize($bundle_path) / 1024, 2); ?> KB
            <br>Last Modified: <?php echo date('Y-m-d H:i:s', filemtime($bundle_path)); ?>
        </div>
    <?php endif; ?>
    
    <h2>Quick Actions</h2>
    <p>
        <a href="/tools/media-kit/?mkcg_id=32372" target="_blank">Open Media Kit Builder</a> |
        <a href="test-lean-bundle.html" target="_blank">Open Static Test Page</a>
    </p>
    
    <h2>Console Commands</h2>
    <pre>
// Build the bundle (run in project directory)
npm run build

// Test in console
window.GMKB

// Add a test component
window.GMKB.addComponent('hero', { title: 'Test' })

// Get current state
window.GMKB.getState()

// Save state
window.GMKB.save()
    </pre>
    
    <h2>To Enable Lean Bundle</h2>
    <pre>
1. Build the bundle: npm run build
2. Edit includes/enqueue.php line 52:
   define('GMKB_USE_LEAN_BUNDLE', true);
3. Clear browser cache
4. Reload the builder page
    </pre>
</body>
</html>
