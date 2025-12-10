<?php
/**
 * Admin Functionality Class
 * 
 * Issue #13 FIX: Extracted from guestify-media-kit-builder.php
 * Handles admin menu, cache management page
 * 
 * @package Guestify
 * @since 4.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin functionality for GMKB
 */
class GMKB_Admin {

    private static $instance;
    private $component_discovery;

    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
        }
    }

    /**
     * Set component discovery instance
     */
    public function set_component_discovery($discovery) {
        $this->component_discovery = $discovery;
    }

    /**
     * Add admin menu items
     */
    public function add_admin_menu() {
        add_options_page(
            'GMKB Component Cache',
            'GMKB Cache',
            'manage_options',
            'gmkb-cache',
            array($this, 'admin_cache_page')
        );
    }

    /**
     * Admin cache management page
     */
    public function admin_cache_page() {
        // Get component discovery instance
        if (!$this->component_discovery) {
            $plugin = GMKB_Plugin::get_instance();
            $this->component_discovery = $plugin->get_component_discovery();
        }

        // Handle form submissions - SECURITY FIX: Consolidated nonce verification
        if (isset($_POST['clear_cache']) || isset($_POST['refresh_components'])) {
            if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'gmkb_cache_action')) {
                echo '<div class="notice notice-error"><p>Security verification failed. Please try again.</p></div>';
            } else {
                if (isset($_POST['clear_cache'])) {
                    $this->component_discovery->clearCache();
                    echo '<div class="notice notice-success"><p>Component cache cleared successfully!</p></div>';
                }
                if (isset($_POST['refresh_components'])) {
                    $this->component_discovery->forceRefresh();
                    echo '<div class="notice notice-success"><p>Components refreshed successfully!</p></div>';
                }
            }
        }
        
        // Get debug info
        $debug_info = $this->component_discovery->getDebugInfo();
        $cache_status = $debug_info['cache_status'];
        
        ?>
        <div class="wrap">
            <h1>GMKB Component Cache Management</h1>
            
            <div class="card">
                <h2>Cache Status</h2>
                <table class="form-table">
                    <tr>
                        <th>Cache Exists:</th>
                        <td><?php echo $cache_status['cache_exists'] ? '✅ Yes' : '❌ No'; ?></td>
                    </tr>
                    <?php if ($cache_status['cache_exists']): ?>
                    <tr>
                        <th>Cache Age:</th>
                        <td><?php echo human_time_diff(time() - $cache_status['cache_age']) . ' ago'; ?></td>
                    </tr>
                    <tr>
                        <th>Cache Size:</th>
                        <td><?php echo size_format($cache_status['cache_size']); ?></td>
                    </tr>
                    <?php endif; ?>
                    <tr>
                        <th>Components Found:</th>
                        <td><?php echo $debug_info['components_count']; ?></td>
                    </tr>
                    <tr>
                        <th>Categories:</th>
                        <td><?php echo implode(', ', $debug_info['category_names']); ?></td>
                    </tr>
                </table>
            </div>
            
            <div class="card">
                <h2>Cache Management</h2>
                <form method="post">
                    <?php wp_nonce_field('gmkb_cache_action'); ?>
                    <p>
                        <input type="submit" name="clear_cache" class="button button-secondary" value="Clear Cache" />
                        <span class="description">Clear the component cache. Next page load will scan the filesystem.</span>
                    </p>
                    <p>
                        <input type="submit" name="refresh_components" class="button button-primary" value="Refresh Components" />
                        <span class="description">Force a fresh scan and update the cache immediately.</span>
                    </p>
                </form>
            </div>
            
            <div class="card">
                <h2>Performance Information</h2>
                <p><strong>Why caching matters:</strong> Without caching, the system scans the filesystem every time the builder loads. 
                   With <?php echo $debug_info['components_count']; ?> components, this improves performance significantly.</p>
                <p><strong>When to refresh:</strong> Use "Refresh Components" after adding, removing, or modifying component files.</p>
                <p><strong>Cache duration:</strong> Cache expires automatically after 1 hour, or after 24 hours maximum.</p>
            </div>
        </div>
        <?php
    }
}
