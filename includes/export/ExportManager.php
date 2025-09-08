<?php
/**
 * Export Manager for Media Kit Builder
 * 
 * Handles export of media kits in various formats while respecting 
 * the self-contained component and theme architecture.
 * 
 * @package Guestify_Media_Kit_Builder
 * @since 2.1.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class GMKB_ExportManager {
    
    /**
     * Singleton instance
     */
    private static $instance = null;
    
    /**
     * Component Discovery instance
     */
    private $component_discovery;
    
    /**
     * Theme Discovery instance  
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
        // Get component discovery instance if available
        global $gmkb_component_discovery;
        $this->component_discovery = $gmkb_component_discovery;
        
        // Initialize hooks
        $this->init_hooks();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Register AJAX handlers
        add_action('wp_ajax_gmkb_export_media_kit', array($this, 'ajax_export_media_kit'));
        add_action('wp_ajax_gmkb_export_bulk', array($this, 'ajax_export_bulk'));
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB ExportManager: AJAX handlers registered');
        }
    }
    
    /**
     * AJAX handler for exporting a single media kit
     */
    public function ajax_export_media_kit() {
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
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $format = isset($_POST['format']) ? sanitize_text_field($_POST['format']) : 'json';
        $export_type = isset($_POST['export_type']) ? sanitize_text_field($_POST['export_type']) : 'full';
        
        if (!$post_id) {
            wp_send_json_error('Post ID is required');
            return;
        }
        
        // Generate export data
        try {
            $export_data = $this->generate_export($post_id, $export_type);
            
            if (!$export_data) {
                wp_send_json_error('Failed to generate export data');
                return;
            }
            
            // Format the response based on requested format
            if ($format === 'json') {
                // Return JSON for download
                wp_send_json_success(array(
                    'export_data' => $export_data,
                    'filename' => $this->generate_filename($post_id, $export_type),
                    'mimetype' => 'application/json'
                ));
            } else {
                wp_send_json_error('Unsupported export format: ' . $format);
            }
            
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB Export Error: ' . $e->getMessage());
            }
            wp_send_json_error('Export failed: ' . $e->getMessage());
        }
    }
    
    /**
     * Generate export data for a media kit
     */
    public function generate_export($post_id, $export_type = 'full') {
        // Get the post
        $post = get_post($post_id);
        if (!$post) {
            throw new Exception('Post not found');
        }
        
        // Get media kit state
        $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        if (empty($state)) {
            $state = array(
                'components' => array(),
                'layout' => array(),
                'sections' => array(),
                'globalSettings' => array()
            );
        }
        
        // Build export structure
        $export = array(
            'version' => '1.0.0',
            'export_date' => current_time('c'), // ISO 8601 format
            'wordpress_version' => get_bloginfo('version'),
            'gmkb_version' => defined('GMKB_VERSION') ? GMKB_VERSION : '2.1.0',
            'post_id' => $post_id,
            'post_title' => $post->post_title,
            'post_type' => $post->post_type,
            'metadata' => array(
                'author' => get_current_user_id(),
                'author_name' => wp_get_current_user()->display_name,
                'site_url' => get_site_url(),
                'export_type' => $export_type
            )
        );
        
        // Add data based on export type
        switch ($export_type) {
            case 'full':
                // Full export includes everything
                $export['components'] = $state['components'] ?? array();
                $export['layout'] = $state['layout'] ?? array();
                $export['sections'] = $state['sections'] ?? array();
                $export['theme'] = $state['globalSettings']['theme'] ?? 'professional_clean';
                $export['theme_customizations'] = $state['globalSettings']['themeCustomizations'] ?? array();
                $export['global_settings'] = $state['globalSettings'] ?? array();
                
                // Add component version information
                $export['metadata']['component_versions'] = $this->get_component_versions($state['components']);
                break;
                
            case 'template':
                // Template export - structure without content
                $export['components'] = $this->strip_component_content($state['components'] ?? array());
                $export['layout'] = $state['layout'] ?? array();
                $export['sections'] = $state['sections'] ?? array();
                $export['theme'] = $state['globalSettings']['theme'] ?? 'professional_clean';
                $export['global_settings'] = array(
                    'theme' => $state['globalSettings']['theme'] ?? 'professional_clean'
                );
                break;
                
            case 'components':
                // Components only export
                $export['components'] = $state['components'] ?? array();
                $export['layout'] = $state['layout'] ?? array();
                $export['metadata']['component_versions'] = $this->get_component_versions($state['components']);
                break;
                
            default:
                throw new Exception('Invalid export type: ' . $export_type);
        }
        
        // Add export integrity check
        $export['checksum'] = $this->generate_checksum($export);
        
        return $export;
    }
    
    /**
     * Strip content from components (for template export)
     */
    private function strip_component_content($components) {
        $stripped = array();
        
        foreach ($components as $id => $component) {
            $stripped[$id] = array(
                'type' => $component['type'] ?? '',
                'sectionId' => $component['sectionId'] ?? null,
                'position' => $component['position'] ?? 0,
                'settings' => $component['settings'] ?? array(),
                // Remove actual content/data
                'data' => array(),
                'props' => array()
            );
        }
        
        return $stripped;
    }
    
    /**
     * Get component version information
     */
    private function get_component_versions($components) {
        $versions = array();
        
        if (!$this->component_discovery) {
            return $versions;
        }
        
        $discovered_components = $this->component_discovery->getComponents();
        
        foreach ($components as $component) {
            $type = $component['type'] ?? '';
            if ($type && isset($discovered_components[$type])) {
                $versions[$type] = $discovered_components[$type]['version'] ?? '1.0.0';
            }
        }
        
        return $versions;
    }
    
    /**
     * Generate checksum for export data
     */
    private function generate_checksum($data) {
        // Remove checksum field if it exists to avoid circular reference
        unset($data['checksum']);
        
        // Generate MD5 hash of the JSON data
        return md5(json_encode($data));
    }
    
    /**
     * Generate filename for export
     */
    private function generate_filename($post_id, $export_type) {
        $post = get_post($post_id);
        $slug = $post ? sanitize_title($post->post_title) : 'media-kit';
        $date = date('Y-m-d');
        
        return sprintf(
            'media-kit-%s-%s-%s.json',
            $slug,
            $export_type,
            $date
        );
    }
    
    /**
     * AJAX handler for bulk export
     */
    public function ajax_export_bulk() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }
        
        // Check capabilities
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        $post_ids = isset($_POST['post_ids']) ? array_map('intval', $_POST['post_ids']) : array();
        
        if (empty($post_ids)) {
            wp_send_json_error('No posts selected for export');
            return;
        }
        
        $exports = array();
        $errors = array();
        
        foreach ($post_ids as $post_id) {
            try {
                $exports[] = $this->generate_export($post_id, 'full');
            } catch (Exception $e) {
                $errors[] = array(
                    'post_id' => $post_id,
                    'error' => $e->getMessage()
                );
            }
        }
        
        wp_send_json_success(array(
            'exports' => $exports,
            'errors' => $errors,
            'total' => count($post_ids),
            'successful' => count($exports),
            'failed' => count($errors)
        ));
    }
    
    /**
     * Export to file (server-side)
     */
    public function export_to_file($post_id, $export_type = 'full') {
        $export_data = $this->generate_export($post_id, $export_type);
        
        if (!$export_data) {
            return false;
        }
        
        // Generate file path
        $upload_dir = wp_upload_dir();
        $export_dir = $upload_dir['basedir'] . '/gmkb-exports';
        
        // Create export directory if it doesn't exist
        if (!file_exists($export_dir)) {
            wp_mkdir_p($export_dir);
        }
        
        // Generate filename
        $filename = $this->generate_filename($post_id, $export_type);
        $filepath = $export_dir . '/' . $filename;
        
        // Write to file
        $json = json_encode($export_data, JSON_PRETTY_PRINT);
        $result = file_put_contents($filepath, $json);
        
        if ($result === false) {
            return false;
        }
        
        return array(
            'path' => $filepath,
            'url' => $upload_dir['baseurl'] . '/gmkb-exports/' . $filename,
            'filename' => $filename,
            'size' => filesize($filepath)
        );
    }
}

// Initialize the export manager
add_action('init', function() {
    GMKB_ExportManager::get_instance();
});
