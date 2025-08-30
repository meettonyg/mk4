<?php
/**
 * Debug Template Logic Test
 * 
 * Quick test to validate the template_instructions logic
 * without loading the full WordPress environment
 */

echo "🔍 Testing template logic...\n\n";

// Test case 1: No post ID
echo "=== TEST 1: No Post ID ===\n";
$post_id = 0;
$has_saved_components = false;
$template_instructions = array(
    'show_empty_state' => true,
    'show_saved_components' => false
);

echo "Initial state:\n";
echo "  post_id: $post_id\n";
echo "  has_saved_components: " . ($has_saved_components ? 'true' : 'false') . "\n";
echo "  show_empty_state: " . ($template_instructions['show_empty_state'] ? 'true' : 'false') . "\n";
echo "  show_saved_components: " . ($template_instructions['show_saved_components'] ? 'true' : 'false') . "\n";

if ($post_id > 0) {
    // This won't run
    echo "Post ID > 0, would load saved state\n";
} else {
    echo "No valid post ID - cannot load saved state\n";
}

if ($has_saved_components) {
    $template_instructions['show_empty_state'] = false;
    $template_instructions['show_saved_components'] = true;
    echo "Has saved components - showing saved container\n";
} else {
    $template_instructions['show_empty_state'] = true;
    $template_instructions['show_saved_components'] = false;
    echo "No saved components - showing empty state\n";
}

echo "Final state:\n";
echo "  show_empty_state: " . ($template_instructions['show_empty_state'] ? 'true' : 'false') . "\n";
echo "  show_saved_components: " . ($template_instructions['show_saved_components'] ? 'true' : 'false') . "\n";
echo "Result: " . ($template_instructions['show_empty_state'] ? "EMPTY STATE" : "SAVED COMPONENTS") . " should render\n\n";

// Test case 2: Post ID with saved components
echo "=== TEST 2: Post ID with Saved Components ===\n";
$post_id = 123;
$saved_state = array('components' => array('comp1', 'comp2'));
$has_saved_components = count($saved_state['components']) > 0;
$template_instructions = array(
    'show_empty_state' => true,
    'show_saved_components' => false
);

echo "Initial state:\n";
echo "  post_id: $post_id\n";
echo "  saved_components_count: " . count($saved_state['components']) . "\n";
echo "  has_saved_components: " . ($has_saved_components ? 'true' : 'false') . "\n";

if ($post_id > 0) {
    echo "Post ID > 0, loading saved state\n";
    if (!empty($saved_state) && isset($saved_state['components']) && is_array($saved_state['components'])) {
        $has_saved_components = count($saved_state['components']) > 0;
        echo "Found " . count($saved_state['components']) . " saved components\n";
    }
}

if ($has_saved_components) {
    $template_instructions['show_empty_state'] = false;
    $template_instructions['show_saved_components'] = true;
    echo "Has saved components - showing saved container\n";
} else {
    $template_instructions['show_empty_state'] = true;
    $template_instructions['show_saved_components'] = false;
    echo "No saved components - showing empty state\n";
}

echo "Final state:\n";
echo "  show_empty_state: " . ($template_instructions['show_empty_state'] ? 'true' : 'false') . "\n";
echo "  show_saved_components: " . ($template_instructions['show_saved_components'] ? 'true' : 'false') . "\n";
echo "Result: " . ($template_instructions['show_saved_components'] ? "SAVED COMPONENTS" : "EMPTY STATE") . " should render\n\n";

// Test case 3: Safety check
echo "=== TEST 3: Safety Check ===\n";
$template_instructions = array(
    'show_empty_state' => false,
    'show_saved_components' => false,
    'show_loading_state' => false
);

echo "Problematic state:\n";
echo "  show_empty_state: " . ($template_instructions['show_empty_state'] ? 'true' : 'false') . "\n";
echo "  show_saved_components: " . ($template_instructions['show_saved_components'] ? 'true' : 'false') . "\n";
echo "  show_loading_state: " . ($template_instructions['show_loading_state'] ? 'true' : 'false') . "\n";

// Safety check
if (!$template_instructions['show_saved_components'] && !$template_instructions['show_empty_state'] && !$template_instructions['show_loading_state']) {
    $template_instructions['show_empty_state'] = true;
    echo "EMERGENCY FALLBACK: Forcing empty state\n";
}

echo "After safety check:\n";
echo "  show_empty_state: " . ($template_instructions['show_empty_state'] ? 'true' : 'false') . "\n";
echo "Result: " . ($template_instructions['show_empty_state'] ? "EMPTY STATE" : "UNKNOWN") . " should render\n\n";

echo "✅ Template logic validation complete!\n";
?>
