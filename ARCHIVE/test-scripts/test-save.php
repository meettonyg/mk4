<?php
/**
 * Test Save Script - Debug Component Saving
 * 
 * This script tests saving a component and shows what happens at each step.
 */

// Load WordPress
require_once('../../../../wp-load.php');

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if post_id is provided
if (!isset($_GET['post_id'])) {
    die('Please provide a post_id parameter: ?post_id=32372');
}

$post_id = intval($_GET['post_id']);

// Create test state with a component
$test_state = array(
    'components' => array(
        'test_component_' . time() => array(
            'id' => 'test_component_' . time(),
            'type' => 'biography',
            'props' => array(
                'title' => 'Test Biography',
                'content' => 'This is a test biography component created at ' . date('Y-m-d H:i:s')
            ),
            'sectionId' => 'section_test_123',
            'createdAt' => time() * 1000,
            'updatedAt' => time() * 1000
        )
    ),
    'sections' => array(
        array(
            'section_id' => 'section_test_123',
            'section_type' => 'full_width',
            'components' => array(
                array(
                    'component_id' => 'test_component_' . time(),
                    'column' => 1,
                    'order' => 0
                )
            )
        )
    ),
    'layout' => array(),
    'theme' => 'default'
);

header('Content-Type: text/plain');
echo "=== GMKB Save Test for Post ID: $post_id ===\n\n";

// Step 1: Check current state
echo "Step 1: Checking current state...\n";
$current_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
if ($current_state && isset($current_state['components'])) {
    echo "  Current components count: " . count($current_state['components']) . "\n";
} else {
    echo "  No current components found\n";
}

// Step 2: Save test state
echo "\nStep 2: Saving test state...\n";
echo "  Test state components count: " . count($test_state['components']) . "\n";
echo "  Test state type: " . gettype($test_state) . "\n";
echo "  Components type: " . gettype($test_state['components']) . "\n";

$result = update_post_meta($post_id, 'gmkb_media_kit_state', $test_state);
echo "  update_post_meta result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";

// Step 3: Verify save
echo "\nStep 3: Verifying save...\n";
$saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
if ($saved_state) {
    echo "  State retrieved successfully\n";
    echo "  State type: " . gettype($saved_state) . "\n";
    
    if (isset($saved_state['components'])) {
        echo "  Components found: " . count($saved_state['components']) . "\n";
        echo "  Components type: " . gettype($saved_state['components']) . "\n";
        
        if (count($saved_state['components']) > 0) {
            echo "  Component IDs: " . implode(', ', array_keys($saved_state['components'])) . "\n";
        }
    } else {
        echo "  No components key in saved state!\n";
    }
} else {
    echo "  Failed to retrieve saved state!\n";
}

// Step 4: Test JSON encoding/decoding
echo "\nStep 4: Testing JSON encoding/decoding...\n";
$json_encoded = json_encode($test_state);
echo "  JSON encoded length: " . strlen($json_encoded) . " chars\n";

$json_decoded = json_decode($json_encoded, true);
if ($json_decoded) {
    echo "  JSON decode successful\n";
    echo "  Decoded components count: " . count($json_decoded['components']) . "\n";
} else {
    echo "  JSON decode FAILED!\n";
    echo "  JSON error: " . json_last_error_msg() . "\n";
}

// Step 5: Check what PHP would see from JavaScript
echo "\nStep 5: Simulating JavaScript object submission...\n";
$js_like_data = json_encode($test_state);
$php_received = json_decode($js_like_data, true);

if ($php_received && isset($php_received['components'])) {
    echo "  PHP would receive components count: " . count($php_received['components']) . "\n";
    echo "  Components type in PHP: " . gettype($php_received['components']) . "\n";
    
    // Test counting
    $count1 = count($php_received['components']);
    $count2 = count((array)$php_received['components']);
    echo "  count() result: $count1\n";
    echo "  count((array)) result: $count2\n";
    
    // Check if it's associative
    $is_assoc = (array_keys($php_received['components']) !== range(0, count($php_received['components']) - 1));
    echo "  Is associative array: " . ($is_assoc ? 'YES' : 'NO') . "\n";
}

echo "\n=== Test Complete ===\n";
echo "You can now check the database directly or use debug-database.php to verify.\n";
