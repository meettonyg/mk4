<?php
/**
 * GMKB Diagnostic Script
 * Add this to your theme's functions.php temporarily, then visit any media kit page
 * 
 * Usage:
 * 1. Add to functions.php
 * 2. Visit media kit builder page
 * 3. Check browser console
 * 4. Check WordPress debug.log
 */

add_action('wp_footer', 'gmkb_diagnostic_check', 999);
add_action('admin_footer', 'gmkb_diagnostic_check', 999);

function gmkb_diagnostic_check() {
    // Only run on media kit pages
    if (!function_exists('gmkb_is_builder_page') || !gmkb_is_builder_page()) {
        return;
    }
    
    ?>
    <script>
    console.group('🔍 GMKB DIAGNOSTIC CHECK');
    
    // Check 1: gmkbData exists
    if (typeof window.gmkbData === 'undefined') {
        console.error('❌ CRITICAL: window.gmkbData is UNDEFINED');
        console.error('   This means the PHP inline script did not run');
        console.error('   Check: includes/enqueue.php - gmkb_prepare_data_for_injection()');
    } else {
        console.log('✅ window.gmkbData exists');
        console.log('   Keys:', Object.keys(window.gmkbData));
    }
    
    // Check 2: apiSettings
    if (!window.gmkbData?.apiSettings) {
        console.error('❌ CRITICAL: apiSettings is missing from gmkbData');
        console.error('   Check: includes/enqueue.php line ~640');
    } else {
        console.log('✅ apiSettings exists');
        console.log('   Keys:', Object.keys(window.gmkbData.apiSettings));
    }
    
    // Check 3: apiSettings.xss
    if (!window.gmkbData?.apiSettings?.xss) {
        console.error('❌ CRITICAL: apiSettings.xss is missing');
        console.error('   This is what causes the initialization error');
    } else {
        console.log('✅ apiSettings.xss exists');
        console.log('   Config:', window.gmkbData.apiSettings.xss);
    }
    
    // Check 4: deprecationConfig
    if (window.gmkbData?.deprecationConfig === undefined) {
        console.warn('⚠️ deprecationConfig is missing');
    } else {
        console.log('✅ deprecationConfig exists');
    }
    
    // Check 5: File timestamps
    console.log('📁 Check if you rebuilt:');
    console.log('   Look at Network tab for gmkb.iife.js timestamp');
    console.log('   If it\'s old, run: npm run build');
    
    console.groupEnd();
    </script>
    <?php
    
    // Also log to PHP
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('🔍 GMKB DIAGNOSTIC: Checking data injection...');
        error_log('  - gmkb_is_builder_page: ' . (function_exists('gmkb_is_builder_page') ? 'YES' : 'NO'));
        error_log('  - gmkb_prepare_data_for_injection: ' . (function_exists('gmkb_prepare_data_for_injection') ? 'YES' : 'NO'));
        
        if (function_exists('gmkb_prepare_data_for_injection')) {
            $data = gmkb_prepare_data_for_injection();
            error_log('  - Data prepared: ' . (empty($data) ? 'EMPTY' : 'OK'));
            error_log('  - Has apiSettings: ' . (isset($data['apiSettings']) ? 'YES' : 'NO'));
            error_log('  - Has apiSettings.xss: ' . (isset($data['apiSettings']['xss']) ? 'YES' : 'NO'));
        }
    }
}
