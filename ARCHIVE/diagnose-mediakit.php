#!/usr/bin/env php
<?php
/**
 * Quick Diagnostic Script for Media Kit Data
 * 
 * Run from command line:
 * php diagnose-mediakit.php 32372
 * 
 * Or access via web (if placed in plugin root):
 * https://guestify.ai/wp-content/plugins/guestify-media-kit-builder/diagnose-mediakit.php?id=32372
 */

// Allow both CLI and web access
if (php_sapi_name() === 'cli') {
    // CLI mode
    if ($argc < 2) {
        die("Usage: php diagnose-mediakit.php <post_id>\n");
    }
    $post_id = (int) $argv[1];
    
    // Load WordPress
    $wp_load = dirname(__FILE__) . '/../../../wp-load.php';
    if (!file_exists($wp_load)) {
        die("Error: WordPress not found. Run this from the plugin directory.\n");
    }
    require_once $wp_load;
} else {
    // Web mode
    require_once '../../../wp-load.php';
    
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        die('Usage: diagnose-mediakit.php?id=<post_id>');
    }
    
    $post_id = (int) $_GET['id'];
    
    // Security check
    if (!current_user_can('edit_posts')) {
        die('Access denied. You must be logged in with edit permissions.');
    }
    
    header('Content-Type: text/plain; charset=utf-8');
}

echo "=====================================\n";
echo "MEDIA KIT DIAGNOSTIC REPORT\n";
echo "Post ID: {$post_id}\n";
echo "=====================================\n\n";

// Get post
$post = get_post($post_id);
if (!$post) {
    die("❌ ERROR: Post {$post_id} not found\n");
}

echo "✅ Post Found\n";
echo "   Type: {$post->post_type}\n";
echo "   Title: {$post->post_title}\n";
echo "   Status: {$post->post_status}\n";
echo "\n";

// Get media kit state
$state = get_post_meta($post_id, 'gmkb_media_kit_state', true);

if (empty($state)) {
    echo "❌ NO MEDIA KIT STATE FOUND\n";
    echo "   The post has no gmkb_media_kit_state meta\n";
    exit(1);
}

echo "✅ Media Kit State Found\n\n";

// Analyze structure
echo "STRUCTURE ANALYSIS:\n";
echo "-------------------\n";

$has_sections = !empty($state['sections']);
$has_components = !empty($state['components']);
$has_saved_components = !empty($state['saved_components']);
$has_layout = !empty($state['layout']);

echo "Has sections: " . ($has_sections ? "✅ YES (" . count($state['sections']) . ")" : "❌ NO") . "\n";
echo "Has components map: " . ($has_components ? "✅ YES (" . count($state['components']) . ")" : "❌ NO") . "\n";
echo "Has saved_components: " . ($has_saved_components ? "✅ YES (" . count($state['saved_components']) . ")" : "❌ NO") . "\n";
echo "Has layout array: " . ($has_layout ? "✅ YES (" . count($state['layout']) . ")" : "❌ NO") . "\n";
echo "\n";

// Analyze sections
if ($has_sections) {
    echo "SECTIONS DETAIL:\n";
    echo "----------------\n";
    foreach ($state['sections'] as $idx => $section) {
        $sec_id = $section['section_id'] ?? 'NO_ID';
        $sec_type = $section['section_type'] ?? 'NO_TYPE';
        $sec_comps = $section['components'] ?? [];
        
        echo "Section #{$idx}:\n";
        echo "  ID: {$sec_id}\n";
        echo "  Type: {$sec_type}\n";
        echo "  Component Refs: " . count($sec_comps) . "\n";
        
        if (!empty($sec_comps)) {
            foreach ($sec_comps as $cidx => $cref) {
                if (is_array($cref)) {
                    $ref_id = $cref['component_id'] ?? 'NO_ID';
                    echo "    [{$cidx}] Array Ref → {$ref_id}\n";
                } else {
                    echo "    [{$cidx}] String ID → {$cref}\n";
                }
            }
        }
        echo "\n";
    }
}

// Analyze components
if ($has_components) {
    echo "COMPONENTS DETAIL:\n";
    echo "------------------\n";
    foreach ($state['components'] as $id => $component) {
        $type = $component['type'] ?? 'NO_TYPE';
        $has_props = !empty($component['props']);
        $has_settings = !empty($component['settings']);
        $has_data = !empty($component['data']);
        $section_id = $component['sectionId'] ?? 'NONE';
        
        echo "Component: {$id}\n";
        echo "  Type: {$type}\n";
        echo "  Section: {$section_id}\n";
        echo "  Has props: " . ($has_props ? "✅" : "❌") . "\n";
        echo "  Has settings: " . ($has_settings ? "✅" : "❌") . "\n";
        echo "  Has data: " . ($has_data ? "✅" : "❌") . "\n";
        
        // Show props if they exist
        if ($has_props) {
            echo "  Props:\n";
            foreach ($component['props'] as $key => $value) {
                $preview = is_string($value) ? substr($value, 0, 50) : json_encode($value);
                echo "    - {$key}: {$preview}\n";
            }
        }
        
        // Show settings if they exist
        if ($has_settings) {
            echo "  Settings:\n";
            foreach ($component['settings'] as $key => $value) {
                $preview = is_string($value) ? substr($value, 0, 50) : json_encode($value);
                echo "    - {$key}: {$preview}\n";
            }
        }
        
        echo "\n";
    }
}

// Cross-reference check
echo "CROSS-REFERENCE CHECK:\n";
echo "----------------------\n";

if ($has_sections && $has_components) {
    $orphaned_refs = [];
    $found_refs = [];
    
    foreach ($state['sections'] as $section) {
        $sec_comps = $section['components'] ?? [];
        foreach ($sec_comps as $cref) {
            $ref_id = is_array($cref) ? ($cref['component_id'] ?? null) : $cref;
            
            if ($ref_id) {
                if (isset($state['components'][$ref_id])) {
                    $found_refs[] = $ref_id;
                } else {
                    $orphaned_refs[] = $ref_id;
                }
            }
        }
    }
    
    echo "✅ Valid References: " . count($found_refs) . "\n";
    echo "❌ Orphaned References: " . count($orphaned_refs) . "\n";
    
    if (!empty($orphaned_refs)) {
        echo "\nOrphaned component IDs:\n";
        foreach ($orphaned_refs as $orphan) {
            echo "  - {$orphan}\n";
        }
    }
} else {
    echo "⚠️  Cannot cross-reference (missing sections or components)\n";
}

echo "\n";
echo "=====================================\n";
echo "DIAGNOSIS COMPLETE\n";
echo "=====================================\n";

if (!$has_sections && !$has_components) {
    echo "\n⚠️  WARNING: No sections AND no components!\n";
    echo "This media kit appears to be empty.\n";
} elseif ($has_sections && !$has_components) {
    echo "\n❌ ERROR: Has sections but no components map!\n";
    echo "The sections reference components that don't exist.\n";
} elseif (!$has_sections && $has_components) {
    echo "\n⚠️  WARNING: Has components but no sections!\n";
    echo "Components exist but aren't organized into sections.\n";
    echo "Frontend will use fallback rendering.\n";
} else {
    if (count($orphaned_refs ?? []) > 0) {
        echo "\n⚠️  WARNING: Some components are referenced but don't exist!\n";
        echo "This will cause empty sections on the frontend.\n";
    } else {
        echo "\n✅ Structure looks good!\n";
        echo "All component references are valid.\n";
    }
}

echo "\n";
