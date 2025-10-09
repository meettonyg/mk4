@echo off
cls
echo ========================================
echo   CLEAR ALL WORDPRESS CACHES
echo ========================================
echo.
echo This will create a cache-clearing script
echo you can upload to your WordPress site.
echo.
pause

echo Creating cache-clear.php...
echo.

(
echo ^<?php
echo /**
echo  * Emergency Cache Clearer
echo  * Upload this to WordPress root and visit: yoursite.com/cache-clear.php
echo  */
echo.
echo // Verify we're in WordPress
echo if ^( ^!defined^( 'ABSPATH' ^) ^) {
echo     define^( 'ABSPATH', __DIR__ . '/' ^);
echo }
echo.
echo require_once ABSPATH . 'wp-load.php';
echo.
echo if ^( ^!current_user_can^( 'manage_options' ^) ^) {
echo     die^( 'Access denied' ^);
echo }
echo.
echo echo '^<h1^>Clearing ALL Caches...^</h1^>';
echo echo '^<pre^>';
echo.
echo // Clear WordPress transients
echo echo "1. Clearing transients...\n";
echo delete_expired_transients^( true ^);
echo echo "   ✅ Transients cleared\n\n";
echo.
echo // Clear WP Object Cache
echo echo "2. Clearing object cache...\n";
echo if ^( function_exists^( 'wp_cache_flush' ^) ^) {
echo     wp_cache_flush^(^);
echo     echo "   ✅ Object cache flushed\n\n";
echo } else {
echo     echo "   ℹ️ Object cache not available\n\n";
echo }
echo.
echo // Clear Opcache
echo echo "3. Clearing PHP Opcache...\n";
echo if ^( function_exists^( 'opcache_reset' ^) ^) {
echo     opcache_reset^(^);
echo     echo "   ✅ Opcache cleared\n\n";
echo } else {
echo     echo "   ℹ️ Opcache not available\n\n";
echo }
echo.
echo // Clear common cache plugins
echo echo "4. Clearing cache plugins...\n";
echo.
echo // WP Super Cache
echo if ^( function_exists^( 'wp_cache_clear_cache' ^) ^) {
echo     wp_cache_clear_cache^(^);
echo     echo "   ✅ WP Super Cache cleared\n";
echo }
echo.
echo // W3 Total Cache
echo if ^( function_exists^( 'w3tc_flush_all' ^) ^) {
echo     w3tc_flush_all^(^);
echo     echo "   ✅ W3 Total Cache cleared\n";
echo }
echo.
echo // WP Rocket
echo if ^( function_exists^( 'rocket_clean_domain' ^) ^) {
echo     rocket_clean_domain^(^);
echo     echo "   ✅ WP Rocket cleared\n";
echo }
echo.
echo // LiteSpeed Cache
echo if ^( class_exists^( 'LiteSpeed\Purge' ^) ^) {
echo     do_action^( 'litespeed_purge_all' ^);
echo     echo "   ✅ LiteSpeed Cache cleared\n";
echo }
echo.
echo echo "\n5. Clearing rewrite rules...\n";
echo flush_rewrite_rules^( true ^);
echo echo "   ✅ Rewrite rules flushed\n\n";
echo.
echo echo "========================================\n";
echo echo "✅ ALL CACHES CLEARED!\n";
echo echo "========================================\n\n";
echo echo "Now:\n";
echo echo "1. Close your browser COMPLETELY\n";
echo echo "2. Reopen browser\n";
echo echo "3. Hard refresh (Ctrl+Shift+R)\n";
echo echo "4. Check console for new GMKB structure\n\n";
echo echo "Delete this file after use for security!\n";
echo echo '^</pre^>';
echo ^?^>
) > cache-clear.php

echo.
echo ========================================
echo ✅ cache-clear.php created!
echo ========================================
echo.
echo UPLOAD THIS FILE TO:
echo   Your WordPress root directory
echo   (same folder as wp-config.php)
echo.
echo THEN VISIT:
echo   https://guestify.ai/cache-clear.php
echo.
echo After running it:
echo  1. DELETE the file (security!)
echo  2. Close browser completely
echo  3. Reopen and hard refresh
echo.
pause
