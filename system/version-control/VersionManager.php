<?php
/**
 * Version Manager for Media Kit Builder
 * Implements version history and restore capability with efficient storage
 * 
 * @package GuestifyMediaKitBuilder
 * @subpackage System\VersionControl
 * @since 2.2.0
 */

namespace GMKB\System\VersionControl;

if (!defined('ABSPATH')) {
    exit;
}

class VersionManager {
    
    /**
     * Maximum number of versions to store per media kit
     */
    const MAX_VERSIONS = 20;
    
    /**
     * Meta key for storing version history
     */
    const VERSION_HISTORY_KEY = 'gmkb_version_history';
    
    /**
     * Meta key for current version index
     */
    const VERSION_INDEX_KEY = 'gmkb_version_index';
    
    /**
     * Singleton instance
     */
    private static $instance = null;
    
    /**
     * Logger instance
     */
    private $logger = null;
    
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
        // Set up AJAX handlers
        add_action('wp_ajax_gmkb_save_version', array($this, 'ajax_save_version'));
        add_action('wp_ajax_gmkb_list_versions', array($this, 'ajax_list_versions'));
        add_action('wp_ajax_gmkb_restore_version', array($this, 'ajax_restore_version'));
        add_action('wp_ajax_gmkb_compare_versions', array($this, 'ajax_compare_versions'));
        add_action('wp_ajax_gmkb_delete_version', array($this, 'ajax_delete_version'));
        
        // Auto-versioning hooks
        add_action('gmkb_before_major_change', array($this, 'auto_create_snapshot'));
        add_action('gmkb_state_saved', array($this, 'maybe_create_auto_version'));
        
        \GMKB_Logger::startup('Version Manager initialized');
    }
    
    /**
     * Create a version snapshot
     * 
     * @param int $post_id The post ID to create version for
     * @param array $state The state to save
     * @param string $message Optional message for the version
     * @param bool $is_auto Whether this is an auto-save
     * @return array|WP_Error
     */
    public function create_version($post_id, $state, $message = '', $is_auto = false) {
        if (!$post_id || !$state) {
            return new \WP_Error('invalid_params', 'Invalid parameters for version creation');
        }
        
        // Get existing versions
        $versions = $this->get_versions($post_id);
        
        // Create version entry
        $version = array(
            'version_id' => 'v_' . time() . '_' . wp_generate_password(10, false),
            'timestamp' => current_time('mysql'),
            'author_id' => get_current_user_id(),
            'message' => $message ?: ($is_auto ? 'Auto-save' : 'Manual save'),
            'is_auto' => $is_auto,
            'state_snapshot' => null, // Will be set below
            'size' => 0 // Will be calculated
        );
        
        // If we have previous versions, store as diff to save space
        if (!empty($versions)) {
            $last_version = end($versions);
            if (isset($last_version['state_snapshot'])) {
                $diff = $this->create_diff($last_version['state_snapshot'], $state);
                if ($diff !== false && strlen(json_encode($diff)) < strlen(json_encode($state)) * 0.7) {
                    // Only use diff if it's significantly smaller (less than 70% of full state)
                    $version['state_snapshot'] = array(
                        'type' => 'diff',
                        'base_version' => $last_version['version_id'],
                        'changes' => $diff
                    );
                } else {
                    // Store full state
                    $version['state_snapshot'] = array(
                        'type' => 'full',
                        'state' => $state
                    );
                }
            } else {
                // Store full state
                $version['state_snapshot'] = array(
                    'type' => 'full',
                    'state' => $state
                );
            }
        } else {
            // First version, store full state
            $version['state_snapshot'] = array(
                'type' => 'full',
                'state' => $state
            );
        }
        
        // Calculate size
        $version['size'] = strlen(json_encode($version['state_snapshot']));
        
        // Add to versions array
        $versions[] = $version;
        
        // Clean up old versions if exceeding max
        if (count($versions) > self::MAX_VERSIONS) {
            // Keep the first full snapshot and recent versions
            $versions = $this->cleanup_old_versions($versions);
        }
        
        // Save versions
        update_post_meta($post_id, self::VERSION_HISTORY_KEY, $versions);
        
        // Update version index
        update_post_meta($post_id, self::VERSION_INDEX_KEY, count($versions) - 1);
        
        \GMKB_Logger::info('Version created: ' . $version['version_id'] . ' for post ' . $post_id);
        
        return array(
            'success' => true,
            'version' => $version,
            'total_versions' => count($versions)
        );
    }
    
    /**
     * Get all versions for a post
     * 
     * @param int $post_id
     * @return array
     */
    public function get_versions($post_id) {
        $versions = get_post_meta($post_id, self::VERSION_HISTORY_KEY, true);
        return is_array($versions) ? $versions : array();
    }
    
    /**
     * Get a specific version
     * 
     * @param int $post_id
     * @param string $version_id
     * @return array|null
     */
    public function get_version($post_id, $version_id) {
        $versions = $this->get_versions($post_id);
        foreach ($versions as $version) {
            if ($version['version_id'] === $version_id) {
                return $version;
            }
        }
        return null;
    }
    
    /**
     * Restore a specific version
     * 
     * @param int $post_id
     * @param string $version_id
     * @return array|WP_Error
     */
    public function restore_version($post_id, $version_id) {
        $version = $this->get_version($post_id, $version_id);
        
        if (!$version) {
            return new \WP_Error('version_not_found', 'Version not found');
        }
        
        // Reconstruct the full state from version
        $state = $this->reconstruct_state($post_id, $version);
        
        if (!$state) {
            return new \WP_Error('reconstruction_failed', 'Failed to reconstruct state from version');
        }
        
        // Create a backup of current state before restoring
        $current_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        if ($current_state) {
            $this->create_version($post_id, $current_state, 'Backup before restore', true);
        }
        
        // Update the current state
        update_post_meta($post_id, 'gmkb_media_kit_state', $state);
        
        // Trigger state restored action
        do_action('gmkb_version_restored', $post_id, $version_id, $state);
        
        \GMKB_Logger::info('Version restored: ' . $version_id . ' for post ' . $post_id);
        
        return array(
            'success' => true,
            'version_id' => $version_id,
            'state' => $state
        );
    }
    
    /**
     * Compare two versions
     * 
     * @param int $post_id
     * @param string $version_id_1
     * @param string $version_id_2
     * @return array|WP_Error
     */
    public function compare_versions($post_id, $version_id_1, $version_id_2) {
        $version1 = $this->get_version($post_id, $version_id_1);
        $version2 = $this->get_version($post_id, $version_id_2);
        
        if (!$version1 || !$version2) {
            return new \WP_Error('version_not_found', 'One or both versions not found');
        }
        
        // Reconstruct full states
        $state1 = $this->reconstruct_state($post_id, $version1);
        $state2 = $this->reconstruct_state($post_id, $version2);
        
        if (!$state1 || !$state2) {
            return new \WP_Error('reconstruction_failed', 'Failed to reconstruct states for comparison');
        }
        
        // Create diff
        $diff = $this->create_detailed_diff($state1, $state2);
        
        return array(
            'success' => true,
            'version1' => array(
                'id' => $version_id_1,
                'timestamp' => $version1['timestamp'],
                'message' => $version1['message']
            ),
            'version2' => array(
                'id' => $version_id_2,
                'timestamp' => $version2['timestamp'],
                'message' => $version2['message']
            ),
            'diff' => $diff
        );
    }
    
    /**
     * Delete a specific version
     * 
     * @param int $post_id
     * @param string $version_id
     * @return array|WP_Error
     */
    public function delete_version($post_id, $version_id) {
        $versions = $this->get_versions($post_id);
        $filtered_versions = array();
        $deleted = false;
        
        foreach ($versions as $version) {
            if ($version['version_id'] !== $version_id) {
                $filtered_versions[] = $version;
            } else {
                $deleted = true;
            }
        }
        
        if (!$deleted) {
            return new \WP_Error('version_not_found', 'Version not found');
        }
        
        // Rebuild diff chain if necessary
        $filtered_versions = $this->rebuild_diff_chain($filtered_versions);
        
        // Save updated versions
        update_post_meta($post_id, self::VERSION_HISTORY_KEY, $filtered_versions);
        
        return array(
            'success' => true,
            'deleted' => $version_id,
            'remaining_versions' => count($filtered_versions)
        );
    }
    
    /**
     * Create a diff between two states
     * 
     * @param array $old_state
     * @param array $new_state
     * @return array|false
     */
    private function create_diff($old_state, $new_state) {
        try {
            $diff = array();
            
            // Track added components
            if (isset($new_state['components'])) {
                foreach ($new_state['components'] as $id => $component) {
                    if (!isset($old_state['components'][$id])) {
                        $diff['added_components'][$id] = $component;
                    } elseif ($old_state['components'][$id] != $component) {
                        $diff['modified_components'][$id] = $component;
                    }
                }
            }
            
            // Track removed components
            if (isset($old_state['components'])) {
                foreach ($old_state['components'] as $id => $component) {
                    if (!isset($new_state['components'][$id])) {
                        $diff['removed_components'][] = $id;
                    }
                }
            }
            
            // Track layout changes
            if (isset($new_state['layout']) && isset($old_state['layout'])) {
                if ($new_state['layout'] != $old_state['layout']) {
                    $diff['layout'] = $new_state['layout'];
                }
            }
            
            // Track section changes
            if (isset($new_state['sections']) && isset($old_state['sections'])) {
                if ($new_state['sections'] != $old_state['sections']) {
                    $diff['sections'] = $new_state['sections'];
                }
            }
            
            // Track global settings changes
            if (isset($new_state['globalSettings']) && isset($old_state['globalSettings'])) {
                if ($new_state['globalSettings'] != $old_state['globalSettings']) {
                    $diff['globalSettings'] = $new_state['globalSettings'];
                }
            }
            
            return !empty($diff) ? $diff : false;
        } catch (\Exception $e) {
            \GMKB_Logger::exception($e, 'Version Manager: Error creating diff');
            return false;
        }
    }
    
    /**
     * Create a detailed diff for comparison view
     * 
     * @param array $state1
     * @param array $state2
     * @return array
     */
    private function create_detailed_diff($state1, $state2) {
        $diff = array(
            'components' => array(
                'added' => array(),
                'removed' => array(),
                'modified' => array()
            ),
            'layout_changed' => false,
            'sections_changed' => false,
            'settings_changed' => false,
            'summary' => array()
        );
        
        // Compare components
        $ids1 = isset($state1['components']) ? array_keys($state1['components']) : array();
        $ids2 = isset($state2['components']) ? array_keys($state2['components']) : array();
        
        $diff['components']['added'] = array_diff($ids2, $ids1);
        $diff['components']['removed'] = array_diff($ids1, $ids2);
        
        foreach (array_intersect($ids1, $ids2) as $id) {
            if ($state1['components'][$id] != $state2['components'][$id]) {
                $diff['components']['modified'][] = $id;
            }
        }
        
        // Check layout changes
        $diff['layout_changed'] = (isset($state1['layout']) && isset($state2['layout'])) 
            ? $state1['layout'] != $state2['layout'] 
            : false;
        
        // Check section changes
        $diff['sections_changed'] = (isset($state1['sections']) && isset($state2['sections'])) 
            ? $state1['sections'] != $state2['sections'] 
            : false;
        
        // Check settings changes
        $diff['settings_changed'] = (isset($state1['globalSettings']) && isset($state2['globalSettings'])) 
            ? $state1['globalSettings'] != $state2['globalSettings'] 
            : false;
        
        // Create summary
        $changes = array();
        if (count($diff['components']['added']) > 0) {
            $changes[] = count($diff['components']['added']) . ' component(s) added';
        }
        if (count($diff['components']['removed']) > 0) {
            $changes[] = count($diff['components']['removed']) . ' component(s) removed';
        }
        if (count($diff['components']['modified']) > 0) {
            $changes[] = count($diff['components']['modified']) . ' component(s) modified';
        }
        if ($diff['layout_changed']) {
            $changes[] = 'Layout changed';
        }
        if ($diff['sections_changed']) {
            $changes[] = 'Sections changed';
        }
        if ($diff['settings_changed']) {
            $changes[] = 'Settings changed';
        }
        
        $diff['summary'] = $changes;
        
        return $diff;
    }
    
    /**
     * Reconstruct full state from a version (handles diffs)
     * 
     * @param int $post_id
     * @param array $version
     * @return array|null
     */
    private function reconstruct_state($post_id, $version) {
        if (!isset($version['state_snapshot'])) {
            return null;
        }
        
        $snapshot = $version['state_snapshot'];
        
        // If it's a full state, return it directly
        if ($snapshot['type'] === 'full') {
            return $snapshot['state'];
        }
        
        // If it's a diff, we need to reconstruct from base
        if ($snapshot['type'] === 'diff') {
            $base_version = $this->get_version($post_id, $snapshot['base_version']);
            if (!$base_version) {
                \GMKB_Logger::warning('Version Manager: Base version not found: ' . $snapshot['base_version']);
                return null;
            }
            
            // Recursively reconstruct base state
            $base_state = $this->reconstruct_state($post_id, $base_version);
            if (!$base_state) {
                return null;
            }
            
            // Apply diff to base state
            return $this->apply_diff($base_state, $snapshot['changes']);
        }
        
        return null;
    }
    
    /**
     * Apply a diff to a base state
     * 
     * @param array $base_state
     * @param array $diff
     * @return array
     */
    private function apply_diff($base_state, $diff) {
        $new_state = $base_state;
        
        // Apply added components
        if (isset($diff['added_components'])) {
            foreach ($diff['added_components'] as $id => $component) {
                $new_state['components'][$id] = $component;
            }
        }
        
        // Apply modified components
        if (isset($diff['modified_components'])) {
            foreach ($diff['modified_components'] as $id => $component) {
                $new_state['components'][$id] = $component;
            }
        }
        
        // Apply removed components
        if (isset($diff['removed_components'])) {
            foreach ($diff['removed_components'] as $id) {
                unset($new_state['components'][$id]);
            }
        }
        
        // Apply layout changes
        if (isset($diff['layout'])) {
            $new_state['layout'] = $diff['layout'];
        }
        
        // Apply section changes
        if (isset($diff['sections'])) {
            $new_state['sections'] = $diff['sections'];
        }
        
        // Apply settings changes
        if (isset($diff['globalSettings'])) {
            $new_state['globalSettings'] = $diff['globalSettings'];
        }
        
        return $new_state;
    }
    
    /**
     * Cleanup old versions, keeping important ones
     * 
     * @param array $versions
     * @return array
     */
    private function cleanup_old_versions($versions) {
        // Keep first version (baseline)
        $kept_versions = array($versions[0]);
        
        // Keep recent versions (last MAX_VERSIONS - 1)
        $recent_versions = array_slice($versions, -(self::MAX_VERSIONS - 1));
        
        // Merge and ensure we have full snapshots at regular intervals
        $last_full_index = 0;
        foreach ($recent_versions as $index => $version) {
            if ($version['state_snapshot']['type'] === 'full') {
                $last_full_index = $index;
            }
            
            // Ensure we have a full snapshot every 5 versions
            if ($index - $last_full_index >= 5 && $version['state_snapshot']['type'] === 'diff') {
                // Convert this diff to a full snapshot
                $full_state = $this->reconstruct_state($post_id, $version);
                if ($full_state) {
                    $version['state_snapshot'] = array(
                        'type' => 'full',
                        'state' => $full_state
                    );
                    $last_full_index = $index;
                }
            }
            
            $kept_versions[] = $version;
        }
        
        return $kept_versions;
    }
    
    /**
     * Rebuild diff chain after deletion
     * 
     * @param array $versions
     * @return array
     */
    private function rebuild_diff_chain($versions) {
        $rebuilt = array();
        $last_full_state = null;
        
        foreach ($versions as $version) {
            if ($version['state_snapshot']['type'] === 'full') {
                $last_full_state = $version['state_snapshot']['state'];
                $rebuilt[] = $version;
            } elseif ($version['state_snapshot']['type'] === 'diff' && $last_full_state) {
                // Reconstruct and create new diff from last full state
                $reconstructed = $this->apply_diff($last_full_state, $version['state_snapshot']['changes']);
                $new_diff = $this->create_diff($last_full_state, $reconstructed);
                
                if ($new_diff !== false) {
                    $version['state_snapshot'] = array(
                        'type' => 'diff',
                        'base_version' => end($rebuilt)['version_id'],
                        'changes' => $new_diff
                    );
                    $rebuilt[] = $version;
                } else {
                    // Store as full if diff fails
                    $version['state_snapshot'] = array(
                        'type' => 'full',
                        'state' => $reconstructed
                    );
                    $last_full_state = $reconstructed;
                    $rebuilt[] = $version;
                }
            }
        }
        
        return $rebuilt;
    }
    
    /**
     * Auto-create snapshot before major changes
     * 
     * @param array $context
     */
    public function auto_create_snapshot($context) {
        if (!isset($context['post_id']) || !isset($context['state'])) {
            return;
        }
        
        $message = isset($context['action']) ? 'Auto-save before ' . $context['action'] : 'Auto-save before major change';
        $this->create_version($context['post_id'], $context['state'], $message, true);
    }
    
    /**
     * Maybe create auto version based on changes
     * 
     * @param array $context
     */
    public function maybe_create_auto_version($context) {
        if (!isset($context['post_id']) || !isset($context['state'])) {
            return;
        }
        
        $post_id = $context['post_id'];
        $state = $context['state'];
        
        // Get last version
        $versions = $this->get_versions($post_id);
        if (empty($versions)) {
            // No versions yet, create first one
            $this->create_version($post_id, $state, 'Initial version', true);
            return;
        }
        
        $last_version = end($versions);
        
        // Check time since last version (auto-version every 10 minutes)
        $last_timestamp = strtotime($last_version['timestamp']);
        $current_timestamp = time();
        
        if (($current_timestamp - $last_timestamp) > 600) { // 10 minutes
            $this->create_version($post_id, $state, 'Auto-save (timed)', true);
        }
    }
    
    /**
     * AJAX handler for saving version
     */
    public function ajax_save_version() {
        check_ajax_referer('gmkb_ajax_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $state = isset($_POST['state']) ? json_decode(stripslashes($_POST['state']), true) : null;
        $message = isset($_POST['message']) ? sanitize_text_field($_POST['message']) : '';
        
        if (!$post_id || !$state) {
            wp_send_json_error('Invalid parameters');
        }
        
        $result = $this->create_version($post_id, $state, $message, false);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        wp_send_json_success($result);
    }
    
    /**
     * AJAX handler for listing versions
     */
    public function ajax_list_versions() {
        check_ajax_referer('gmkb_ajax_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        
        if (!$post_id) {
            wp_send_json_error('Invalid post ID');
        }
        
        $versions = $this->get_versions($post_id);
        
        // Add user info to versions
        foreach ($versions as &$version) {
            $user = get_user_by('id', $version['author_id']);
            $version['author_name'] = $user ? $user->display_name : 'Unknown';
            // Remove state snapshot from list (too large)
            unset($version['state_snapshot']);
        }
        
        wp_send_json_success(array(
            'versions' => $versions,
            'total' => count($versions),
            'max_versions' => self::MAX_VERSIONS
        ));
    }
    
    /**
     * AJAX handler for restoring version
     */
    public function ajax_restore_version() {
        check_ajax_referer('gmkb_ajax_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $version_id = isset($_POST['version_id']) ? sanitize_text_field($_POST['version_id']) : '';
        
        if (!$post_id || !$version_id) {
            wp_send_json_error('Invalid parameters');
        }
        
        $result = $this->restore_version($post_id, $version_id);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        wp_send_json_success($result);
    }
    
    /**
     * AJAX handler for comparing versions
     */
    public function ajax_compare_versions() {
        check_ajax_referer('gmkb_ajax_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $version_id_1 = isset($_POST['version_id_1']) ? sanitize_text_field($_POST['version_id_1']) : '';
        $version_id_2 = isset($_POST['version_id_2']) ? sanitize_text_field($_POST['version_id_2']) : '';
        
        if (!$post_id || !$version_id_1 || !$version_id_2) {
            wp_send_json_error('Invalid parameters');
        }
        
        $result = $this->compare_versions($post_id, $version_id_1, $version_id_2);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        wp_send_json_success($result);
    }
    
    /**
     * AJAX handler for deleting version
     */
    public function ajax_delete_version() {
        check_ajax_referer('gmkb_ajax_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $version_id = isset($_POST['version_id']) ? sanitize_text_field($_POST['version_id']) : '';
        
        if (!$post_id || !$version_id) {
            wp_send_json_error('Invalid parameters');
        }
        
        $result = $this->delete_version($post_id, $version_id);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        wp_send_json_success($result);
    }
}

// Initialize the singleton
add_action('init', array('GMKB\System\VersionControl\VersionManager', 'get_instance'));
