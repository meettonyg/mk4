<?php
/**
 * GMKB State Repair Tool
 * 
 * This script repairs media kit states where components exist in sections
 * but not in the main components object.
 */

// Load WordPress
require_once('../../../../wp-load.php');

// Check if post_id is provided
$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
$fix = isset($_GET['fix']) && $_GET['fix'] === 'true';

header('Content-Type: text/plain');

if (!$post_id) {
    echo "=== GMKB State Repair Tool ===\n\n";
    echo "Usage:\n";
    echo "  Check state: ?post_id=32372\n";
    echo "  Fix state:   ?post_id=32372&fix=true\n";
    die();
}

echo "=== GMKB State Repair Tool for Post ID: $post_id ===\n\n";

// Get the saved state
$saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);

if (!$saved_state) {
    echo "No saved state found for post ID: $post_id\n";
    die();
}

// Analyze the state
$components_count = isset($saved_state['components']) ? count($saved_state['components']) : 0;
$sections_count = isset($saved_state['sections']) ? count($saved_state['sections']) : 0;

echo "Current State Analysis:\n";
echo "  Components in main object: $components_count\n";
echo "  Sections: $sections_count\n";

// Find orphaned components in sections
$orphaned_components = array();
$components_in_sections = array();

if (isset($saved_state['sections']) && is_array($saved_state['sections'])) {
    foreach ($saved_state['sections'] as $section) {
        $section_id = isset($section['section_id']) ? $section['section_id'] : 'unknown';
        
        if (isset($section['components']) && is_array($section['components'])) {
            echo "\n  Section $section_id has " . count($section['components']) . " component references:\n";
            
            foreach ($section['components'] as $comp_ref) {
                $comp_id = is_array($comp_ref) 
                    ? (isset($comp_ref['component_id']) ? $comp_ref['component_id'] : 'unknown')
                    : $comp_ref;
                
                $components_in_sections[$comp_id] = $section_id;
                echo "    - $comp_id";
                
                // Check if this component exists in the main components object
                if (!isset($saved_state['components'][$comp_id])) {
                    echo " [ORPHANED - NOT IN COMPONENTS OBJECT]";
                    $orphaned_components[$comp_id] = array(
                        'section_id' => $section_id,
                        'comp_ref' => $comp_ref
                    );
                } else {
                    echo " [OK - exists in components]";
                }
                echo "\n";
            }
        }
    }
}

if (count($orphaned_components) > 0) {
    echo "\n⚠️ FOUND " . count($orphaned_components) . " ORPHANED COMPONENTS!\n";
    echo "These components are referenced in sections but don't exist in the main components object.\n";
    echo "This is why they don't persist after save/load.\n";
    
    if ($fix) {
        echo "\n🔧 FIXING STATE...\n";
        
        // Initialize components array if needed
        if (!isset($saved_state['components'])) {
            $saved_state['components'] = array();
        }
        
        // Reconstruct missing components
        foreach ($orphaned_components as $comp_id => $info) {
            // Extract type from component ID (format: type_timestamp_random)
            $parts = explode('_', $comp_id);
            $type = count($parts) > 2 ? $parts[0] : 'unknown';
            
            // Create minimal component structure
            $saved_state['components'][$comp_id] = array(
                'id' => $comp_id,
                'type' => $type,
                'props' => array(),
                'data' => array(),
                'content' => array(),
                'sectionId' => $info['section_id'],
                'createdAt' => time() * 1000,
                'updatedAt' => time() * 1000,
                'recovered' => true // Mark as recovered
            );
            
            echo "  ✅ Reconstructed component: $comp_id (type: $type)\n";
        }
        
        // Save the fixed state
        $result = update_post_meta($post_id, 'gmkb_media_kit_state', $saved_state);
        
        if ($result) {
            echo "\n✅ STATE FIXED AND SAVED!\n";
            echo "Components in main object: " . count($saved_state['components']) . "\n";
            echo "The media kit should now load properly.\n";
        } else {
            echo "\n❌ Failed to save fixed state.\n";
        }
        
    } else {
        echo "\nTo fix this issue, add &fix=true to the URL:\n";
        echo "  ?post_id=$post_id&fix=true\n";
    }
    
} else {
    echo "\n✅ No orphaned components found. State appears to be valid.\n";
    
    if ($components_count > 0) {
        echo "\nComponents in state:\n";
        foreach (array_keys($saved_state['components']) as $comp_id) {
            $comp = $saved_state['components'][$comp_id];
            $type = isset($comp['type']) ? $comp['type'] : 'unknown';
            $section = isset($comp['sectionId']) ? $comp['sectionId'] : 'none';
            echo "  - $comp_id (type: $type, section: $section)\n";
        }
    }
}

echo "\n=== End of Analysis ===\n";
