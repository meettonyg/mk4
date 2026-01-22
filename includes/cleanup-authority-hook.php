<?php
/**
 * Remove Authority Hook Component - WordPress Admin Page
 * 
 * Access via: /wp-admin/admin.php?page=cleanup-authority-hook
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add admin menu
add_action('admin_menu', 'gmkb_cleanup_authority_hook_menu');

function gmkb_cleanup_authority_hook_menu() {
    add_management_page(
        'Cleanup Authority Hook',
        'Cleanup Authority Hook',
        'manage_options',
        'cleanup-authority-hook',
        'gmkb_cleanup_authority_hook_page'
    );
}

function gmkb_cleanup_authority_hook_page() {
    // Check permissions
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
    
    // Process cleanup if requested
    if (isset($_POST['run_cleanup']) && check_admin_referer('cleanup_authority_hook')) {
        $result = gmkb_remove_authority_hook_components();
        
        echo '<div class="notice notice-success"><p>';
        echo '<strong>✅ Cleanup Complete!</strong><br>';
        echo "Cleaned: {$result['cleaned']} posts<br>";
        echo "Skipped: {$result['skipped']} posts<br>";
        echo "Components removed: {$result['components_removed']}";
        echo '</p></div>';
    }
    
    ?>
    <div class="wrap">
        <h1>🧹 Remove Authority Hook Component</h1>
        
        <div class="card">
            <h2>What does this do?</h2>
            <p>This tool removes the <code>authority-hook</code> component from all media kit posts.</p>
            <p>The authority-hook component is no longer supported and is causing errors.</p>
            
            <h3>⚠️ Before running:</h3>
            <ul>
                <li>✅ Backup your database</li>
                <li>✅ Make sure no one is editing media kits</li>
            </ul>
        </div>
        
        <form method="post" style="margin-top: 20px;">
            <?php wp_nonce_field('cleanup_authority_hook'); ?>
            <input type="hidden" name="run_cleanup" value="1">
            <button type="submit" class="button button-primary button-large">
                🚀 Run Cleanup Now
            </button>
        </form>
        
        <div class="card" style="margin-top: 20px;">
            <h3>After cleanup:</h3>
            <ol>
                <li>Rebuild the application: <code>npm run build</code></li>
                <li>Hard refresh browser: <code>Ctrl + Shift + R</code></li>
                <li>The error should be gone!</li>
            </ol>
        </div>
    </div>
    <?php
}

function gmkb_remove_authority_hook_components() {
    global $wpdb;
    
    $cleaned = 0;
    $skipped = 0;
    $components_removed = 0;
    
    // Get all media kit posts
    $posts = get_posts(array(
        'post_type' => 'guests',
        'posts_per_page' => -1,
        'post_status' => 'any'
    ));
    
    foreach ($posts as $post) {
        $post_id = $post->ID;
        $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if (!$saved_state || !is_array($saved_state)) {
            $skipped++;
            continue;
        }
        
        $modified = false;
        $authority_hooks_found = array();
        
        // Find authority-hook components
        if (isset($saved_state['components']) && is_array($saved_state['components'])) {
            foreach ($saved_state['components'] as $comp_id => $component) {
                if (isset($component['type']) && $component['type'] === 'authority-hook') {
                    $authority_hooks_found[] = $comp_id;
                }
            }
        }
        
        if (!empty($authority_hooks_found)) {
            // Remove from components
            foreach ($authority_hooks_found as $comp_id) {
                unset($saved_state['components'][$comp_id]);
                $components_removed++;
            }
            
            // Remove from sections
            if (isset($saved_state['sections']) && is_array($saved_state['sections'])) {
                foreach ($saved_state['sections'] as &$section) {
                    // Full-width sections
                    if (isset($section['components']) && is_array($section['components'])) {
                        $section['components'] = array_values(array_filter(
                            $section['components'],
                            function($comp_ref) use ($authority_hooks_found) {
                                $comp_id = is_string($comp_ref) ? $comp_ref : ($comp_ref['component_id'] ?? null);
                                return !in_array($comp_id, $authority_hooks_found);
                            }
                        ));
                    }
                    
                    // Columned sections
                    if (isset($section['columns']) && is_array($section['columns'])) {
                        foreach ($section['columns'] as &$components) {
                            if (is_array($components)) {
                                $components = array_values(array_filter(
                                    $components,
                                    function($comp_id) use ($authority_hooks_found) {
                                        return !in_array($comp_id, $authority_hooks_found);
                                    }
                                ));
                            }
                        }
                    }
                }
            }
            
            update_post_meta($post_id, 'gmkb_media_kit_state', $saved_state);
            $cleaned++;
            $modified = true;
        }
        
        if (!$modified) {
            $skipped++;
        }
    }
    
    return array(
        'cleaned' => $cleaned,
        'skipped' => $skipped,
        'components_removed' => $components_removed
    );
}
