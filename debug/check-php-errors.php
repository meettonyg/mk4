<?php
/**
 * PHP Error Checker
 * Load this directly to check for PHP errors
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Test basic PHP
echo "PHP is working<br>";

// Test loading WordPress
require_once('../../../../wp-load.php');
echo "WordPress loaded<br>";

// Test loading the plugin file
$plugin_file = dirname(__FILE__) . '/../guestify-media-kit-builder.php';
if (file_exists($plugin_file)) {
    echo "Plugin file found<br>";
    
    // Check syntax
    $php_code = file_get_contents($plugin_file);
    $tokens = token_get_all($php_code);
    echo "Plugin file syntax check passed<br>";
} else {
    echo "Plugin file NOT found at: " . $plugin_file . "<br>";
}

// Test enqueue file
$enqueue_file = dirname(__FILE__) . '/../includes/enqueue.php';
if (file_exists($enqueue_file)) {
    echo "Enqueue file found<br>";
    
    // Check syntax
    $php_code = file_get_contents($enqueue_file);
    $tokens = token_get_all($php_code);
    echo "Enqueue file syntax check passed<br>";
} else {
    echo "Enqueue file NOT found<br>";
}

// Check if plugin is active
if (function_exists('is_plugin_active')) {
    $plugin = 'mk4/guestify-media-kit-builder.php';
    if (is_plugin_active($plugin)) {
        echo "Plugin is ACTIVE<br>";
    } else {
        echo "Plugin is NOT active<br>";
    }
}

echo "<br>If you see this, PHP is working correctly.";
