/**
 * Quick Fix: Ensure post ID is available for topics loading
 * Add this to your WordPress theme's functions.php or as a must-use plugin
 */

// Hook into the AJAX handler to ensure post ID is available
add_action('wp_ajax_guestify_render_component', 'fix_topics_post_id', 5);
add_action('wp_ajax_nopriv_guestify_render_component', 'fix_topics_post_id', 5);

function fix_topics_post_id() {
    // Check if we're rendering a topics component
    if (isset($_POST['component']) && $_POST['component'] === 'topics') {
        // Try to get post ID from various sources
        $post_id = 0;
        
        // From URL parameters
        if (!$post_id && isset($_GET['mkcg_id'])) {
            $post_id = intval($_GET['mkcg_id']);
        }
        if (!$post_id && isset($_GET['post_id'])) {
            $post_id = intval($_GET['post_id']);
        }
        
        // From POST data
        if (!$post_id && isset($_POST['post_id'])) {
            $post_id = intval($_POST['post_id']);
        }
        
        // From referer URL
        if (!$post_id && isset($_SERVER['HTTP_REFERER'])) {
            $referer = $_SERVER['HTTP_REFERER'];
            if (preg_match('/mkcg_id=(\d+)/', $referer, $matches)) {
                $post_id = intval($matches[1]);
            }
        }
        
        // If we found a post ID, ensure it's in the props
        if ($post_id > 0) {
            if (isset($_POST['props'])) {
                $props = json_decode(stripslashes($_POST['props']), true);
                if (!isset($props['post_id']) || empty($props['post_id'])) {
                    $props['post_id'] = $post_id;
                    $_POST['props'] = json_encode($props);
                }
            }
            
            // Also ensure it's in POST data
            if (!isset($_POST['post_id'])) {
                $_POST['post_id'] = $post_id;
            }
            if (!isset($_POST['media_kit_post_id'])) {
                $_POST['media_kit_post_id'] = $post_id;
            }
        }
    }
}

// Alternative: Add post ID to all AJAX requests
add_action('wp_loaded', function() {
    if (is_admin() && defined('DOING_AJAX') && DOING_AJAX) {
        // Get post ID from referer or other sources
        $post_id = 0;
        
        if (isset($_GET['mkcg_id'])) {
            $post_id = intval($_GET['mkcg_id']);
        } elseif (isset($_SERVER['HTTP_REFERER'])) {
            $referer = $_SERVER['HTTP_REFERER'];
            if (preg_match('/mkcg_id=(\d+)/', $referer, $matches)) {
                $post_id = intval($matches[1]);
            }
        }
        
        if ($post_id > 0) {
            $_REQUEST['fallback_post_id'] = $post_id;
        }
    }
});
