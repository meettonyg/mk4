<?php
/**
 * Fix HTML-encoded font family values in saved media kit data
 * 
 * ISSUE: Font family values like 'Roboto', sans-serif are being HTML-encoded
 * each time they're saved, creating &amp;#x27; entities that compound.
 * 
 * This script decodes all fontFamily values in component settings.
 * 
 * Usage: php fix-encoded-fonts.php
 * Or run from WordPress admin by including this file.
 */

// If running from command line, load WordPress
if (php_sapi_name() === 'cli') {
    // Try to find wp-load.php
    $wp_load_paths = [
        __DIR__ . '/../../../../wp-load.php',
        __DIR__ . '/../../../../../wp-load.php',
        __DIR__ . '/../../../../../../wp-load.php',
    ];
    
    $wp_loaded = false;
    foreach ($wp_load_paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            $wp_loaded = true;
            break;
        }
    }
    
    if (!$wp_loaded) {
        die("Error: Could not find wp-load.php. Please run this from within WordPress.\n");
    }
}

echo "Starting font encoding fix...\n\n";

// Get all media kit posts
$post_types = ['guests'];
$fixed_count = 0;
$total_count = 0;

foreach ($post_types as $post_type) {
    echo "Processing $post_type posts...\n";
    
    $posts = get_posts([
        'post_type' => $post_type,
        'posts_per_page' => -1,
        'post_status' => 'any'
    ]);
    
    echo "Found " . count($posts) . " $post_type posts\n";
    
    foreach ($posts as $post) {
        $total_count++;
        $post_id = $post->ID;
        
        // Get the media kit state
        $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if (empty($state) || !is_array($state)) {
            continue;
        }
        
        $modified = false;
        
        // Check components
        if (!empty($state['components']) && is_array($state['components'])) {
            foreach ($state['components'] as $comp_id => $component) {
                if (empty($component['settings']['style']['typography']['fontFamily'])) {
                    continue;
                }
                
                $font_family = $component['settings']['style']['typography']['fontFamily'];
                
                // Check if it contains HTML entities
                if (strpos($font_family, '&') !== false || strpos($font_family, '&#') !== false) {
                    // Decode it
                    $decoded = html_entity_decode($font_family, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    
                    echo "  Post #{$post_id} Component {$comp_id}:\n";
                    echo "    Before: {$font_family}\n";
                    echo "    After:  {$decoded}\n";
                    
                    // Update the value
                    $state['components'][$comp_id]['settings']['style']['typography']['fontFamily'] = $decoded;
                    $modified = true;
                }
            }
        }
        
        // If we modified the state, save it back
        if ($modified) {
            update_post_meta($post_id, 'gmkb_media_kit_state', $state);
            $fixed_count++;
            echo "  ✅ Fixed post #{$post_id}\n";
        }
    }
}

echo "\n";
echo "=====================================\n";
echo "Fix complete!\n";
echo "Total posts processed: {$total_count}\n";
echo "Posts fixed: {$fixed_count}\n";
echo "=====================================\n";
