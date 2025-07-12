<?php
/**
 * ROOT FIX TEST FILE
 * 
 * This file tests if the page detection and script loading fixes are working.
 * Place this in your WordPress root and access it to see the detection results.
 */

// Load WordPress
require_once('../../../wp-load.php');

// Test the detection
$request_uri = $_SERVER['REQUEST_URI'] ?? '';
$contains_guestify = strpos($request_uri, 'guestify-media-kit') !== false;

echo "<!DOCTYPE html>\n";
echo "<html>\n";
echo "<head>\n";
echo "<title>GMKB Root Fix Test</title>\n";
echo "<style>\n";
echo "body { font-family: monospace; padding: 20px; background: #f5f5f5; }\n";
echo ".success { color: green; font-weight: bold; }\n";
echo ".error { color: red; font-weight: bold; }\n";
echo ".info { color: blue; }\n";
echo ".box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n";
echo "</style>\n";
echo "</head>\n";
echo "<body>\n";

echo "<h1>GMKB Root Fix Test Results</h1>\n";

echo "<div class='box'>\n";
echo "<h2>URL Detection Test</h2>\n";
echo "<p><strong>Current URL:</strong> <span class='info'>$request_uri</span></p>\n";
echo "<p><strong>Contains 'guestify-media-kit':</strong> ";
echo $contains_guestify ? "<span class='success'>YES ✅</span>" : "<span class='error'>NO ❌</span>";
echo "</p>\n";
echo "</div>\n";

echo "<div class='box'>\n";
echo "<h2>Global Detection Test</h2>\n";
echo "<p><strong>GMKB_BUILDER_PAGE defined:</strong> ";
echo defined('GMKB_BUILDER_PAGE') ? "<span class='success'>YES ✅</span>" : "<span class='error'>NO ❌</span>";
echo "</p>\n";
if (defined('GMKB_BUILDER_PAGE')) {
    echo "<p><strong>GMKB_BUILDER_PAGE value:</strong> ";
    echo GMKB_BUILDER_PAGE ? "<span class='success'>TRUE ✅</span>" : "<span class='error'>FALSE ❌</span>";
    echo "</p>\n";
}
echo "</div>\n";

echo "<div class='box'>\n";
echo "<h2>Script Manager Test</h2>\n";
if (class_exists('GMKB_Enhanced_Script_Manager')) {
    echo "<p class='success'>✅ GMKB_Enhanced_Script_Manager class exists</p>\n";
    
    $manager = GMKB_Enhanced_Script_Manager::get_instance();
    $status = $manager->get_status();
    
    echo "<h3>Manager Status:</h3>\n";
    echo "<pre>";
    print_r($status);
    echo "</pre>\n";
} else {
    echo "<p class='error'>❌ GMKB_Enhanced_Script_Manager class NOT found</p>\n";
}
echo "</div>\n";

echo "<div class='box'>\n";
echo "<h2>Quick Test Links</h2>\n";
echo "<p>Click these to test different URL patterns:</p>\n";
echo "<ul>\n";
echo "<li><a href='/guestify-media-kit/?post_id=32372'>Test URL: /guestify-media-kit/?post_id=32372</a></li>\n";
echo "<li><a href='/index.php?pagename=guestify-media-kit&post_id=32372'>Test URL: /index.php?pagename=guestify-media-kit&post_id=32372</a></li>\n";
echo "<li><a href='/?page=guestify-media-kit&post_id=32372'>Test URL: /?page=guestify-media-kit&post_id=32372</a></li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<div class='box'>\n";
echo "<h2>Instructions</h2>\n";
echo "<ol>\n";
echo "<li>Check if the detection is working above</li>\n";
echo "<li>Open your browser's Developer Console (F12)</li>\n";
echo "<li>Look for console messages starting with 'GMKB ROOT FIX:'</li>\n";
echo "<li>Visit your actual builder page and check the console logs</li>\n";
echo "<li>Look for '✅ SCRIPT ENQUEUING TRIGGERED!' in the logs</li>\n";
echo "</ol>\n";
echo "</div>\n";

echo "</body>\n";
echo "</html>\n";
