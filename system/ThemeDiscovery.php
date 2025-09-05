<?php
/**
 * Theme Discovery System
 * Phase 4: Automatic theme discovery with caching
 * 
 * Follows the same self-contained architecture as ComponentDiscovery
 * 
 * @package GMKB/System
 * @since 4.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class ThemeDiscovery {
    
    private $themes_dir;
    private $themes = array();
    private $cache_key = 'gmkb_themes_cache';
    private $cache_duration = 3600; // 1 hour
    
    /**
     * Constructor
     * 
     * @param string $themes_dir Path to themes directory
     */
    public function __construct($themes_dir) {
        $this->themes_dir = $themes_dir;
        
        if (!is_dir($this->themes_dir)) {
            throw new Exception('Themes directory not found: ' . $this->themes_dir);
        }
    }
    
    /**
     * Scan for themes
     * 
     * @param bool $force_fresh Force fresh scan without cache
     * @return array Array of themes
     */
    public function scan($force_fresh = false) {
        // Try cache first unless forced fresh
        if (!$force_fresh) {
            $cached_themes = get_transient($this->cache_key);
            if ($cached_themes !== false) {
                $this->themes = $cached_themes;
                return $this->themes;
            }
        }
        
        $this->themes = array();
        
        // Scan themes directory
        $theme_dirs = glob($this->themes_dir . '/*', GLOB_ONLYDIR);
        
        foreach ($theme_dirs as $theme_path) {
            $theme_id = basename($theme_path);
            $theme_file = $theme_path . '/theme.json';
            
            if (file_exists($theme_file)) {
                $theme_data = json_decode(file_get_contents($theme_file), true);
                
                if ($theme_data && isset($theme_data['theme_id'])) {
                    // Ensure theme has all required data
                    $theme_data['path'] = $theme_path;
                    $theme_data['directory'] = $theme_id;
                    
                    // Add preview image URL if exists
                    $preview_image = $theme_path . '/preview.png';
                    if (file_exists($preview_image)) {
                        $theme_data['preview_url'] = plugins_url('themes/' . $theme_id . '/preview.png', dirname(dirname(__FILE__)));
                    }
                    
                    // Add CSS file URL if exists
                    $css_file = $theme_path . '/theme.css';
                    if (file_exists($css_file)) {
                        $theme_data['css_url'] = plugins_url('themes/' . $theme_id . '/theme.css', dirname(dirname(__FILE__)));
                    }
                    
                    $this->themes[$theme_id] = $theme_data;
                }
            }
        }
        
        // Cache the results
        set_transient($this->cache_key, $this->themes, $this->cache_duration);
        
        return $this->themes;
    }
    
    /**
     * Get all discovered themes
     * 
     * @return array
     */
    public function getThemes() {
        if (empty($this->themes)) {
            $this->scan();
        }
        return $this->themes;
    }
    
    /**
     * Get a specific theme
     * 
     * @param string $theme_id Theme identifier
     * @return array|null Theme data or null if not found
     */
    public function getTheme($theme_id) {
        $themes = $this->getThemes();
        return isset($themes[$theme_id]) ? $themes[$theme_id] : null;
    }
    
    /**
     * Clear theme cache
     */
    public function clearCache() {
        delete_transient($this->cache_key);
    }
    
    /**
     * Force refresh themes
     * 
     * @return array
     */
    public function forceRefresh() {
        $this->clearCache();
        return $this->scan(true);
    }
}
