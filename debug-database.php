<?php
/**
 * Debug Script to Check Media Kit State in Database
 * 
 * This script directly queries the database to see what's actually saved
 * for a given post ID.
 */

// Load WordPress
require_once('../../../../wp-load.php');

// Check if post_id is provided
if (!isset($_GET['post_id'])) {
    die('Please provide a post_id parameter: ?post_id=32372');
}

$post_id = intval($_GET['post_id']);

// Get the saved state from database
$saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);

// Output debug info
header('Content-Type: text/plain');
echo "=== GMKB Database Debug for Post ID: $post_id ===\n\n";

if ($saved_state) {
    echo "State found in database!\n";
    echo "State type: " . gettype($saved_state) . "\n";
    
    if (is_array($saved_state)) {
        echo "State keys: " . implode(', ', array_keys($saved_state)) . "\n\n";
        
        // Check components
        if (isset($saved_state['components'])) {
            echo "Components found:\n";
            echo "  Type: " . gettype($saved_state['components']) . "\n";
            
            if (is_array($saved_state['components'])) {
                $comp_count = count($saved_state['components']);
                echo "  Count: $comp_count\n";
                
                if ($comp_count > 0) {
                    echo "  Component IDs:\n";
                    foreach (array_keys($saved_state['components']) as $id) {
                        $comp = $saved_state['components'][$id];
                        echo "    - $id (type: " . ($comp['type'] ?? 'unknown') . ")\n";
                    }
                    
                    // Show first component details
                    $first_key = array_key_first($saved_state['components']);
                    echo "\n  First component details:\n";
                    echo "    ID: $first_key\n";
                    $first_comp = $saved_state['components'][$first_key];
                    foreach ($first_comp as $key => $value) {
                        if (is_array($value) || is_object($value)) {
                            echo "    $key: " . gettype($value) . " with " . count((array)$value) . " items\n";
                        } else {
                            echo "    $key: " . substr((string)$value, 0, 100) . "\n";
                        }
                    }
                } else {
                    echo "  No components in array (empty)\n";
                }
            }
        } else {
            echo "No components key found in state\n";
        }
        
        // Check sections
        echo "\nSections:\n";
        if (isset($saved_state['sections'])) {
            echo "  Type: " . gettype($saved_state['sections']) . "\n";
            echo "  Count: " . count($saved_state['sections']) . "\n";
            
            if (is_array($saved_state['sections']) && count($saved_state['sections']) > 0) {
                foreach ($saved_state['sections'] as $section) {
                    $section_id = $section['section_id'] ?? 'unknown';
                    $comp_count = isset($section['components']) ? count($section['components']) : 0;
                    echo "    - Section $section_id: $comp_count component references\n";
                    
                    if ($comp_count > 0 && isset($section['components'])) {
                        foreach ($section['components'] as $comp_ref) {
                            if (is_array($comp_ref)) {
                                echo "      • " . ($comp_ref['component_id'] ?? 'unknown') . "\n";
                            } else {
                                echo "      • $comp_ref\n";
                            }
                        }
                    }
                }
            }
        } else {
            echo "  No sections found\n";
        }
        
        // Show raw JSON for debugging
        echo "\n=== Raw JSON (first 2000 chars) ===\n";
        $json = json_encode($saved_state, JSON_PRETTY_PRINT);
        echo substr($json, 0, 2000);
        
        if (strlen($json) > 2000) {
            echo "\n... (truncated, total length: " . strlen($json) . " chars)";
        }
        
    } else {
        echo "State is not an array!\n";
        var_dump($saved_state);
    }
} else {
    echo "No saved state found for post ID: $post_id\n";
    
    // Check if the post exists
    $post = get_post($post_id);
    if ($post) {
        echo "\nPost exists:\n";
        echo "  Title: " . $post->post_title . "\n";
        echo "  Type: " . $post->post_type . "\n";
        echo "  Status: " . $post->post_status . "\n";
        
        // Check all meta keys for this post
        $all_meta = get_post_meta($post_id);
        if ($all_meta) {
            echo "\nAll meta keys for this post:\n";
            foreach (array_keys($all_meta) as $key) {
                echo "  - $key\n";
                if (strpos($key, 'gmkb') !== false || strpos($key, 'media_kit') !== false) {
                    $value = get_post_meta($post_id, $key, true);
                    echo "    Value type: " . gettype($value) . "\n";
                    if (is_array($value)) {
                        echo "    Array keys: " . implode(', ', array_keys($value)) . "\n";
                    }
                }
            }
        }
    } else {
        echo "\nPost does not exist!\n";
    }
}
