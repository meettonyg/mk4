<?php
/**
 * Import Manager for Media Kit Builder
 * 
 * Handles import of media kits with validation, conflict resolution,
 * and compatibility checks.
 * 
 * @package Guestify_Media_Kit_Builder
 * @since 2.1.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class GMKB_ImportManager {
    
    /**
     * Singleton instance
     */
    private static $instance = null;
    
    /**
     * Component Discovery instance
     */
    private $component_discovery;
    
    /**
     * Theme Discovery instance if available
     */
    private $theme_discovery;
    
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
        // Get component discovery instance
        global $gmkb_component_discovery;
        $this->component_discovery = $gmkb_component_discovery;
        
        // Get theme discovery if available
        if (class_exists('ThemeDiscovery')) {
            $this->theme_discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
        }
        
        // Initialize hooks
        $this->init_hooks();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Register AJAX handlers
        add_action('wp_ajax_gmkb_import_media_kit', array($this, 'ajax_import_media_kit'));
        add_action('wp_ajax_gmkb_validate_import', array($this, 'ajax_validate_import'));
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB ImportManager: AJAX handlers registered');
        }
    }
    
    /**
     * AJAX handler for importing media kit
     */
    public function ajax_import_media_kit() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }
        
        // Check capabilities
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        // Get parameters
        $import_data = isset($_POST['import_data']) ? $_POST['import_data'] : '';
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $import_mode = isset($_POST['import_mode']) ? sanitize_text_field($_POST['import_mode']) : 'replace';
        
        // Handle file upload if provided
        if (isset($_FILES['import_file'])) {
            $file = $_FILES['import_file'];
            
            // Validate file type
            if ($file['type'] !== 'application/json' && !str_ends_with($file['name'], '.json')) {
                wp_send_json_error('Invalid file type. Please upload a JSON file.');
                return;
            }
            
            // Read file content
            $import_data = file_get_contents($file['tmp_name']);
            if ($import_data === false) {
                wp_send_json_error('Failed to read uploaded file');
                return;
            }
        }
        
        // Decode JSON
        $data = json_decode(stripslashes($import_data), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error('Invalid JSON data: ' . json_last_error_msg());
            return;
        }
        
        // Validate import data
        $validation = $this->validate_import_data($data);
        if (!$validation['valid']) {
            wp_send_json_error('Import validation failed: ' . implode(', ', $validation['errors']));
            return;
        }
        
        try {
            // Perform the import
            $result = $this->import_media_kit($data, $post_id, $import_mode);
            
            if ($result['success']) {
                wp_send_json_success(array(
                    'message' => 'Media kit imported successfully',
                    'post_id' => $result['post_id'],
                    'components_imported' => $result['components_imported'],
                    'warnings' => $result['warnings']
                ));
            } else {
                wp_send_json_error('Import failed: ' . $result['error']);
            }
            
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB Import Error: ' . $e->getMessage());
            }
            wp_send_json_error('Import failed: ' . $e->getMessage());
        }
    }
    
    /**
     * Validate import data structure and compatibility
     */
    public function validate_import_data($data) {
        $errors = array();
        $warnings = array();
        
        // Check required fields
        $required_fields = array('version', 'export_date', 'components');
        foreach ($required_fields as $field) {
            if (!isset($data[$field])) {
                $errors[] = "Missing required field: {$field}";
            }
        }
        
        // Verify version compatibility
        if (isset($data['version'])) {
            $import_version = $data['version'];
            // Simple version check - could be more sophisticated
            if (version_compare($import_version, '2.0.0', '>')) {
                $warnings[] = "Import file version ({$import_version}) is newer than current plugin version";
            }
        }
        
        // Verify checksum if present
        if (isset($data['checksum'])) {
            $provided_checksum = $data['checksum'];
            $calculated_checksum = $this->calculate_checksum($data);
            
            if ($provided_checksum !== $calculated_checksum) {
                $warnings[] = "Checksum mismatch - file may have been modified";
            }
        }
        
        // Check component availability
        if (isset($data['components']) && $this->component_discovery) {
            $available_components = $this->component_discovery->getComponents();
            $missing_components = array();
            
            foreach ($data['components'] as $component) {
                $type = $component['type'] ?? '';
                if ($type && !isset($available_components[$type])) {
                    $missing_components[] = $type;
                }
            }
            
            if (!empty($missing_components)) {
                $warnings[] = "Missing component types: " . implode(', ', array_unique($missing_components));
            }
        }
        
        // Check theme availability if theme is specified
        if (isset($data['theme']) && $this->theme_discovery) {
            $available_themes = $this->theme_discovery->getThemes();
            if (!isset($available_themes[$data['theme']])) {
                $warnings[] = "Theme '{$data['theme']}' not available, will use default theme";
            }
        }
        
        return array(
            'valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings
        );
    }
    
    /**
     * Calculate checksum for data validation
     */
    private function calculate_checksum($data) {
        $data_copy = $data;
        unset($data_copy['checksum']);
        return md5(json_encode($data_copy));
    }
    
    /**
     * Import media kit data
     */
    public function import_media_kit($data, $post_id = 0, $import_mode = 'replace') {
        $warnings = array();
        
        // If no post_id, create new post
        if (!$post_id) {
            $post_title = $data['post_title'] ?? 'Imported Media Kit';
            $post_id = wp_insert_post(array(
                'post_title' => $post_title . ' (Imported)',
                'post_type' => $data['post_type'] ?? 'post',
                'post_status' => 'draft',
                'post_author' => get_current_user_id()
            ));
            
            if (is_wp_error($post_id)) {
                return array(
                    'success' => false,
                    'error' => 'Failed to create new post: ' . $post_id->get_error_message()
                );
            }
        }
        
        // Get existing state if merging
        $existing_state = array();
        if ($import_mode === 'merge') {
            $existing_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
            if (empty($existing_state)) {
                $existing_state = array(
                    'components' => array(),
                    'layout' => array(),
                    'sections' => array(),
                    'globalSettings' => array()
                );
            }
        }
        
        // Prepare new state
        $new_state = array(
            'components' => array(),
            'layout' => array(),
            'sections' => array(),
            'globalSettings' => array()
        );
        
        // Import components with ID conflict resolution
        $id_mapping = array();
        $components_imported = 0;
        
        if (isset($data['components'])) {
            foreach ($data['components'] as $old_id => $component) {
                // Generate new ID to avoid conflicts
                $new_id = 'imported_' . uniqid() . '_' . $old_id;
                $id_mapping[$old_id] = $new_id;
                
                // Check if component type is available
                if ($this->component_discovery) {
                    $available = $this->component_discovery->getComponents();
                    if (!isset($available[$component['type']])) {
                        $warnings[] = "Skipped unavailable component type: {$component['type']}";
                        continue;
                    }
                }
                
                // Add component with new ID
                $new_state['components'][$new_id] = $component;
                $components_imported++;
            }
        }
        
        // Import layout with mapped IDs
        if (isset($data['layout']) && is_array($data['layout'])) {
            foreach ($data['layout'] as $component_id) {
                if (isset($id_mapping[$component_id])) {
                    $new_state['layout'][] = $id_mapping[$component_id];
                }
            }
        }
        
        // Import sections with component ID mapping
        if (isset($data['sections'])) {
            foreach ($data['sections'] as $section_id => $section) {
                // Update component IDs in section
                if (isset($section['components']) && is_array($section['components'])) {
                    $mapped_components = array();
                    foreach ($section['components'] as $comp_id) {
                        if (isset($id_mapping[$comp_id])) {
                            $mapped_components[] = $id_mapping[$comp_id];
                        }
                    }
                    $section['components'] = $mapped_components;
                }
                
                $new_state['sections'][$section_id] = $section;
            }
        }
        
        // Import theme and settings
        if (isset($data['theme'])) {
            // Check if theme exists
            $theme_to_use = 'professional_clean'; // default
            
            if ($this->theme_discovery) {
                $available_themes = $this->theme_discovery->getThemes();
                if (isset($available_themes[$data['theme']])) {
                    $theme_to_use = $data['theme'];
                } else {
                    $warnings[] = "Theme '{$data['theme']}' not found, using default theme";
                }
            } else {
                $theme_to_use = $data['theme'];
            }
            
            $new_state['globalSettings']['theme'] = $theme_to_use;
        }
        
        if (isset($data['theme_customizations'])) {
            $new_state['globalSettings']['themeCustomizations'] = $data['theme_customizations'];
        }
        
        if (isset($data['global_settings'])) {
            $new_state['globalSettings'] = array_merge(
                $new_state['globalSettings'],
                $data['global_settings']
            );
        }
        
        // Merge with existing if mode is merge
        if ($import_mode === 'merge') {
            // Merge components
            $new_state['components'] = array_merge(
                $existing_state['components'] ?? array(),
                $new_state['components']
            );
            
            // Append to layout
            $new_state['layout'] = array_merge(
                $existing_state['layout'] ?? array(),
                $new_state['layout']
            );
            
            // Merge sections
            $new_state['sections'] = array_merge(
                $existing_state['sections'] ?? array(),
                $new_state['sections']
            );
            
            // Keep existing settings unless overridden
            $new_state['globalSettings'] = array_merge(
                $existing_state['globalSettings'] ?? array(),
                $new_state['globalSettings']
            );
        }
        
        // Create saved_components array for template compatibility
        $saved_components = array();
        foreach ($new_state['layout'] as $component_id) {
            if (isset($new_state['components'][$component_id])) {
                $component_data = $new_state['components'][$component_id];
                $component_data['id'] = $component_id;
                $saved_components[] = $component_data;
            }
        }
        $new_state['saved_components'] = $saved_components;
        
        // Add import metadata
        $new_state['import_info'] = array(
            'imported_date' => current_time('mysql'),
            'imported_by' => get_current_user_id(),
            'import_mode' => $import_mode,
            'original_version' => $data['version'] ?? 'unknown'
        );
        
        // Save to database
        $save_result = update_post_meta($post_id, 'gmkb_media_kit_state', $new_state);
        
        if ($save_result === false) {
            return array(
                'success' => false,
                'error' => 'Failed to save imported data to database'
            );
        }
        
        return array(
            'success' => true,
            'post_id' => $post_id,
            'components_imported' => $components_imported,
            'warnings' => $warnings,
            'id_mapping' => $id_mapping
        );
    }
    
    /**
     * AJAX handler for validating import without performing it
     */
    public function ajax_validate_import() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }
        
        // Get import data
        $import_data = isset($_POST['import_data']) ? $_POST['import_data'] : '';
        
        // Decode JSON
        $data = json_decode(stripslashes($import_data), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error('Invalid JSON data: ' . json_last_error_msg());
            return;
        }
        
        // Validate
        $validation = $this->validate_import_data($data);
        
        wp_send_json_success(array(
            'valid' => $validation['valid'],
            'errors' => $validation['errors'],
            'warnings' => $validation['warnings'],
            'summary' => array(
                'components_count' => count($data['components'] ?? array()),
                'sections_count' => count($data['sections'] ?? array()),
                'theme' => $data['theme'] ?? 'not specified',
                'version' => $data['version'] ?? 'unknown'
            )
        ));
    }
    
    /**
     * Import from file path (server-side)
     */
    public function import_from_file($filepath, $post_id = 0, $import_mode = 'replace') {
        if (!file_exists($filepath)) {
            return array(
                'success' => false,
                'error' => 'File not found: ' . $filepath
            );
        }
        
        $json_content = file_get_contents($filepath);
        if ($json_content === false) {
            return array(
                'success' => false,
                'error' => 'Failed to read file'
            );
        }
        
        $data = json_decode($json_content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return array(
                'success' => false,
                'error' => 'Invalid JSON in file: ' . json_last_error_msg()
            );
        }
        
        return $this->import_media_kit($data, $post_id, $import_mode);
    }
}

// Initialize the import manager
add_action('init', function() {
    GMKB_ImportManager::get_instance();
});
