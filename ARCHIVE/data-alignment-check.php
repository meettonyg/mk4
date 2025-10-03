#!/usr/bin/env php
<?php
/**
 * Media Kit Data Alignment Diagnostic Tool
 * 
 * Compares data structure across:
 * 1. Builder (tools/media-kit)
 * 2. Admin View (wp-admin data viewer)
 * 3. Frontend Display (guests/slug)
 * 
 * Usage: php data-alignment-check.php 32372
 */

require_once '../../../wp-load.php';

if (php_sapi_name() !== 'cli') {
    die('This script must be run from command line');
}

if ($argc < 2) {
    die("Usage: php data-alignment-check.php <post_id>\n");
}

$post_id = (int) $argv[1];

echo "========================================\n";
echo "MEDIA KIT DATA ALIGNMENT CHECK\n";
echo "Post ID: {$post_id}\n";
echo "========================================\n\n";

// Get raw state from database
$raw_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);

if (empty($raw_state)) {
    die("ERROR: No media kit state found for post {$post_id}\n");
}

// Apply Pods enrichment (same as frontend does)
$enriched_state = apply_filters('gmkb_load_media_kit_state', $raw_state, $post_id);

echo "DATA STRUCTURE ANALYSIS:\n";
echo "========================\n\n";

// 1. Components Structure
echo "1. COMPONENTS:\n";
echo "   Total: " . (isset($raw_state['components']) ? count($raw_state['components']) : 0) . "\n";

if (!empty($raw_state['components'])) {
    foreach ($raw_state['components'] as $id => $comp) {
        echo "   - {$id}:\n";
        echo "     Type: " . ($comp['type'] ?? 'unknown') . "\n";
        echo "     Has data: " . (isset($comp['data']) && !empty($comp['data']) ? 'YES' : 'NO') . "\n";
        echo "     Has props: " . (isset($comp['props']) && !empty($comp['props']) ? 'YES' : 'NO') . "\n";
        echo "     Has settings: " . (isset($comp['settings']) && !empty($comp['settings']) ? 'YES' : 'NO') . "\n";
        
        // Check if enriched
        if (isset($enriched_state['components'][$id])) {
            $enriched_comp = $enriched_state['components'][$id];
            $enriched = isset($enriched_comp['props']['podsDataLoaded']) && $enriched_comp['props']['podsDataLoaded'];
            echo "     Pods enriched: " . ($enriched ? 'YES' : 'NO') . "\n";
            
            if ($enriched && isset($enriched_comp['props'])) {
                $prop_keys = array_keys($enriched_comp['props']);
                echo "     Enriched props: " . implode(', ', array_slice($prop_keys, 0, 5)) . 
                     (count($prop_keys) > 5 ? '... (' . count($prop_keys) . ' total)' : '') . "\n";
            }
        }
        echo "\n";
    }
}

// 2. Sections Structure
echo "\n2. SECTIONS:\n";
echo "   Total: " . (isset($raw_state['sections']) ? count($raw_state['sections']) : 0) . "\n";

if (!empty($raw_state['sections'])) {
    foreach ($raw_state['sections'] as $idx => $section) {
        $sec_id = $section['section_id'] ?? 'no-id';
        $sec_type = $section['section_type'] ?? $section['type'] ?? 'unknown';
        
        echo "   Section #{$idx} ({$sec_id}):\n";
        echo "     Type: {$sec_type}\n";
        echo "     Layout: " . ($section['layout'] ?? 'not-set') . "\n";
        
        // Check component references
        if ($sec_type === 'two_column' || $sec_type === 'three_column') {
            if (isset($section['columns'])) {
                echo "     Has 'columns' key: YES\n";
                foreach ($section['columns'] as $col_num => $col_comps) {
                    echo "       Column {$col_num}: " . count($col_comps) . " components\n";
                    foreach ($col_comps as $comp_ref) {
                        if (is_string($comp_ref)) {
                            $exists = isset($raw_state['components'][$comp_ref]) ? 'EXISTS' : 'MISSING';
                            echo "         - {$comp_ref} ({$exists})\n";
                        } else {
                            echo "         - " . json_encode($comp_ref) . "\n";
                        }
                    }
                }
            } else {
                echo "     Has 'columns' key: NO (will check 'components')\n";
            }
        }
        
        if (isset($section['components'])) {
            $comp_count = is_array($section['components']) ? count($section['components']) : 0;
            echo "     Has 'components' key: YES ({$comp_count})\n";
            
            if (is_array($section['components'])) {
                foreach ($section['components'] as $comp_ref) {
                    if (is_string($comp_ref)) {
                        $exists = isset($raw_state['components'][$comp_ref]) ? 'EXISTS' : 'MISSING';
                        echo "       - {$comp_ref} ({$exists})\n";
                    } else {
                        $cid = is_array($comp_ref) ? ($comp_ref['component_id'] ?? 'no-id') : 'invalid';
                        $col = is_array($comp_ref) ? ($comp_ref['column'] ?? 'no-col') : 'n/a';
                        echo "       - {$cid} (column: {$col})\n";
                    }
                }
            }
        }
        echo "\n";
    }
}

// 3. Cross-Reference Check
echo "\n3. CROSS-REFERENCE CHECK:\n";
$orphaned_components = array();
$missing_references = array();

// Find components referenced in sections but not in components map
if (!empty($raw_state['sections'])) {
    foreach ($raw_state['sections'] as $section) {
        $refs = array();
        
        // Collect refs from 'components' key
        if (isset($section['components']) && is_array($section['components'])) {
            foreach ($section['components'] as $ref) {
                if (is_string($ref)) {
                    $refs[] = $ref;
                } elseif (is_array($ref) && isset($ref['component_id'])) {
                    $refs[] = $ref['component_id'];
                }
            }
        }
        
        // Collect refs from 'columns' key
        if (isset($section['columns']) && is_array($section['columns'])) {
            foreach ($section['columns'] as $col_comps) {
                if (is_array($col_comps)) {
                    foreach ($col_comps as $ref) {
                        if (is_string($ref)) {
                            $refs[] = $ref;
                        }
                    }
                }
            }
        }
        
        // Check if each ref exists
        foreach ($refs as $ref) {
            if (!isset($raw_state['components'][$ref])) {
                $missing_references[] = $ref;
            }
        }
    }
}

// Find components in map but not referenced in sections
$all_component_ids = isset($raw_state['components']) ? array_keys($raw_state['components']) : array();
$referenced_ids = array();

if (!empty($raw_state['sections'])) {
    foreach ($raw_state['sections'] as $section) {
        // From components array
        if (isset($section['components']) && is_array($section['components'])) {
            foreach ($section['components'] as $ref) {
                if (is_string($ref)) {
                    $referenced_ids[] = $ref;
                } elseif (is_array($ref) && isset($ref['component_id'])) {
                    $referenced_ids[] = $ref['component_id'];
                }
            }
        }
        
        // From columns object
        if (isset($section['columns']) && is_array($section['columns'])) {
            foreach ($section['columns'] as $col_comps) {
                if (is_array($col_comps)) {
                    foreach ($col_comps as $ref) {
                        if (is_string($ref)) {
                            $referenced_ids[] = $ref;
                        }
                    }
                }
            }
        }
    }
}

$orphaned_components = array_diff($all_component_ids, $referenced_ids);

echo "   Components in map: " . count($all_component_ids) . "\n";
echo "   Components referenced: " . count(array_unique($referenced_ids)) . "\n";
echo "   Missing references: " . count($missing_references) . "\n";
echo "   Orphaned components: " . count($orphaned_components) . "\n";

if (!empty($missing_references)) {
    echo "\n   Missing component IDs:\n";
    foreach (array_unique($missing_references) as $missing) {
        echo "     - {$missing}\n";
    }
}

if (!empty($orphaned_components)) {
    echo "\n   Orphaned component IDs:\n";
    foreach ($orphaned_components as $orphan) {
        echo "     - {$orphan}\n";
    }
}

// 4. Section Type Analysis
echo "\n\n4. SECTION TYPE COMPATIBILITY:\n";
if (!empty($raw_state['sections'])) {
    foreach ($raw_state['sections'] as $idx => $section) {
        $type = $section['section_type'] ?? $section['type'] ?? 'unknown';
        $has_columns = isset($section['columns']);
        $has_components = isset($section['components']);
        
        echo "   Section #{$idx} ({$type}):\n";
        
        if ($type === 'two_column' || $type === 'three_column') {
            if ($has_columns) {
                echo "     ✓ Has 'columns' key (CORRECT for {$type})\n";
            } else {
                echo "     ✗ Missing 'columns' key (REQUIRED for {$type})\n";
            }
        } else {
            if ($has_components) {
                echo "     ✓ Has 'components' array (CORRECT for {$type})\n";
            } else {
                echo "     ⚠ Missing 'components' array\n";
            }
        }
    }
}

// 5. Pods Data Availability
echo "\n\n5. PODS DATA AVAILABILITY:\n";
$pods_fields = array(
    'biography' => 'biography',
    'first_name' => 'first_name',
    'last_name' => 'last_name',
    'guest_title' => 'guest_title',
    'email' => 'email',
);

foreach ($pods_fields as $label => $field) {
    $value = get_post_meta($post_id, $field, true);
    $has_value = !empty($value);
    $status = $has_value ? '✓' : '✗';
    $preview = $has_value ? substr($value, 0, 50) . '...' : 'empty';
    echo "   {$status} {$label}: {$preview}\n";
}

// Check topics
echo "\n   Topics:\n";
for ($i = 1; $i <= 5; $i++) {
    $topic = get_post_meta($post_id, "topic_{$i}", true);
    if (!empty($topic)) {
        echo "     ✓ Topic {$i}: " . substr($topic, 0, 50) . "\n";
    } else {
        echo "     ✗ Topic {$i}: empty\n";
    }
}

// 6. Recommendations
echo "\n\n6. RECOMMENDATIONS:\n";

$issues_found = 0;

if (!empty($missing_references)) {
    echo "   ⚠ FIX REQUIRED: Some sections reference components that don't exist\n";
    echo "     → Remove invalid references or add missing components\n";
    $issues_found++;
}

if (!empty($orphaned_components)) {
    echo "   ⚠ CLEANUP SUGGESTED: Some components are not used in any section\n";
    echo "     → Remove unused components or add them to a section\n";
    $issues_found++;
}

foreach ($raw_state['sections'] ?? array() as $idx => $section) {
    $type = $section['section_type'] ?? $section['type'] ?? 'unknown';
    if (($type === 'two_column' || $type === 'three_column') && !isset($section['columns'])) {
        echo "   ✗ ERROR: Section #{$idx} is {$type} but missing 'columns' key\n";
        echo "     → Frontend will not render components correctly\n";
        $issues_found++;
    }
}

if ($issues_found === 0) {
    echo "   ✓ Data structure looks good!\n";
    echo "   ✓ All components are properly referenced\n";
    echo "   ✓ All sections have correct structure\n";
}

echo "\n========================================\n";
echo "DIAGNOSTIC COMPLETE\n";
echo "========================================\n";

// Export option
if (isset($argv[2]) && $argv[2] === '--export-json') {
    $export_file = "mediakit-{$post_id}-" . date('Y-m-d-His') . ".json";
    file_put_contents($export_file, json_encode(array(
        'raw_state' => $raw_state,
        'enriched_state' => $enriched_state,
        'post_id' => $post_id,
        'analysis' => array(
            'components_count' => count($raw_state['components'] ?? array()),
            'sections_count' => count($raw_state['sections'] ?? array()),
            'orphaned' => $orphaned_components,
            'missing' => $missing_references,
        )
    ), JSON_PRETTY_PRINT));
    
    echo "\n✓ Data exported to: {$export_file}\n";
}

exit($issues_found > 0 ? 1 : 0);
