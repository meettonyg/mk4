<?php
/**
 * Version History AJAX Handlers
 * 
 * Handles version history save/load/delete operations
 * 
 * @package Guestify_Media_Kit_Builder
 * @version 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Version_History_Handler {
    
    /**
     * Meta key for storing versions
     */
    const VERSION_META_KEY = 'gmkb_version_history';
    
    /**
     * Maximum number of versions to keep
     */
    const MAX_VERSIONS = 20;
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('wp_ajax_gmkb_save_version', array($this, 'ajax_save_version'));
        add_action('wp_ajax_gmkb_load_versions', array($this, 'ajax_load_versions'));
        add_action('wp_ajax_gmkb_delete_version', array($this, 'ajax_delete_version'));
        
        // Auto-save hooks
        add_action('gmkb_before_theme_change', array($this, 'auto_save_before_theme_change'));
        add_action('gmkb_before_bulk_operation', array($this, 'auto_save_before_bulk_operation'));
    }
    
    /**
     * Save a new version via AJAX
     */
    public function ajax_save_version() {
        // Security check
        check_ajax_referer('gmkb_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        if (!$post_id) {
            wp_send_json_error('Invalid post ID');
            return;
        }
        
        $version_json = isset($_POST['version']) ? stripslashes($_POST['version']) : '';
        $version = json_decode($version_json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error('Invalid version data');
            return;
        }
        
        // Save version
        $result = $this->save_version($post_id, $version);
        
        if ($result) {
            wp_send_json_success(array(
                'message' => 'Version saved successfully',
                'version_id' => $version['id'],
                'timestamp' => time()
            ));
        } else {
            wp_send_json_error('Failed to save version');
        }
    }
    
    /**
     * Load versions via AJAX
     */
    public function ajax_load_versions() {
        // Security check
        check_ajax_referer('gmkb_nonce', 'nonce');
        
        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
        if (!$post_id) {
            wp_send_json_error('Invalid post ID');
            return;
        }
        
        $versions = $this->get_versions($post_id);
        
        wp_send_json_success($versions);
    }
    
    /**
     * Delete a version via AJAX
     */
    public function ajax_delete_version() {
        // Security check
        check_ajax_referer('gmkb_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $version_id = isset($_POST['version_id']) ? sanitize_text_field($_POST['version_id']) : '';
        
        if (!$post_id || !$version_id) {
            wp_send_json_error('Invalid parameters');
            return;
        }
        
        $result = $this->delete_version($post_id, $version_id);
        
        if ($result) {
            wp_send_json_success(array(
                'message' => 'Version deleted successfully',
                'version_id' => $version_id
            ));
        } else {
            wp_send_json_error('Failed to delete version');
        }
    }
    
    /**
     * Save a version to post meta
     */
    private function save_version($post_id, $version) {
        $versions = $this->get_versions($post_id);
        
        // Add new version to beginning
        array_unshift($versions, $version);
        
        // Limit to max versions
        if (count($versions) > self::MAX_VERSIONS) {
            $versions = array_slice($versions, 0, self::MAX_VERSIONS);
        }
        
        // Save to post meta
        return update_post_meta($post_id, self::VERSION_META_KEY, $versions);
    }
    
    /**
     * Get all versions for a post
     */
    private function get_versions($post_id) {
        $versions = get_post_meta($post_id, self::VERSION_META_KEY, true);
        
        if (!is_array($versions)) {
            $versions = array();
        }
        
        return $versions;
    }
    
    /**
     * Delete a specific version
     */
    private function delete_version($post_id, $version_id) {
        $versions = $this->get_versions($post_id);
        
        // Filter out the version to delete
        $versions = array_filter($versions, function($version) use ($version_id) {
            return $version['id'] !== $version_id;
        });
        
        // Re-index array
        $versions = array_values($versions);
        
        // Save updated versions
        return update_post_meta($post_id, self::VERSION_META_KEY, $versions);
    }
    
    /**
     * Auto-save before theme change
     */
    public function auto_save_before_theme_change($data) {
        if (!isset($data['post_id'])) return;
        
        $post_id = intval($data['post_id']);
        $current_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if ($current_state) {
            $version = array(
                'id' => 'v_' . time() . '_auto',
                'name' => 'Before theme change',
                'type' => 'auto',
                'timestamp' => time(),
                'created' => current_time('mysql'),
                'state' => $current_state,
                'size' => strlen(json_encode($current_state)),
                'author' => wp_get_current_user()->display_name
            );
            
            $this->save_version($post_id, $version);
        }
    }
    
    /**
     * Auto-save before bulk operation
     */
    public function auto_save_before_bulk_operation($data) {
        if (!isset($data['post_id'])) return;
        
        $post_id = intval($data['post_id']);
        $operation = isset($data['operation']) ? $data['operation'] : 'bulk operation';
        $current_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if ($current_state) {
            $version = array(
                'id' => 'v_' . time() . '_auto',
                'name' => 'Before ' . $operation,
                'type' => 'auto',
                'timestamp' => time(),
                'created' => current_time('mysql'),
                'state' => $current_state,
                'size' => strlen(json_encode($current_state)),
                'author' => wp_get_current_user()->display_name
            );
            
            $this->save_version($post_id, $version);
        }
    }
    
    /**
     * Get version diff for comparison
     */
    public function get_version_diff($post_id, $version_id_1, $version_id_2) {
        $versions = $this->get_versions($post_id);
        
        $version_1 = null;
        $version_2 = null;
        
        foreach ($versions as $version) {
            if ($version['id'] === $version_id_1) {
                $version_1 = $version;
            }
            if ($version['id'] === $version_id_2) {
                $version_2 = $version;
            }
        }
        
        if (!$version_1 || !$version_2) {
            return false;
        }
        
        // Calculate differences
        $diff = array(
            'components' => array(
                'added' => array(),
                'removed' => array(),
                'modified' => array()
            ),
            'sections' => array(
                'added' => array(),
                'removed' => array(),
                'modified' => array()
            ),
            'theme' => array(
                'changed' => false,
                'old' => $version_1['state']['theme'] ?? '',
                'new' => $version_2['state']['theme'] ?? ''
            )
        );
        
        // Compare components
        $components_1 = $version_1['state']['components'] ?? array();
        $components_2 = $version_2['state']['components'] ?? array();
        
        $keys_1 = array_keys($components_1);
        $keys_2 = array_keys($components_2);
        
        $diff['components']['added'] = array_diff($keys_2, $keys_1);
        $diff['components']['removed'] = array_diff($keys_1, $keys_2);
        
        // Check for modified components
        $common_keys = array_intersect($keys_1, $keys_2);
        foreach ($common_keys as $key) {
            if (serialize($components_1[$key]) !== serialize($components_2[$key])) {
                $diff['components']['modified'][] = $key;
            }
        }
        
        // Check theme changes
        if (($version_1['state']['theme'] ?? '') !== ($version_2['state']['theme'] ?? '')) {
            $diff['theme']['changed'] = true;
        }
        
        return $diff;
    }
}

// Initialize the handler
new GMKB_Version_History_Handler();
