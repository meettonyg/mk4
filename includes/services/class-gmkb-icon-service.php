<?php
/**
 * GMKB Icon Service
 *
 * Loads and serves SVG icons from the assets/icons directory.
 * Provides a centralized way to access icons instead of hardcoding SVG strings.
 *
 * @package GMKB
 * @subpackage Services
 * @version 1.0.0
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Icon_Service {

    /**
     * Singleton instance
     * @var GMKB_Icon_Service
     */
    private static $instance = null;

    /**
     * Path to icons directory
     * @var string
     */
    private $icons_path;

    /**
     * Cache of loaded icon SVGs
     * @var array
     */
    private $icons_cache = [];

    /**
     * Get singleton instance
     *
     * @return GMKB_Icon_Service
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Private constructor
     */
    private function __construct() {
        $this->icons_path = GMKB_PLUGIN_DIR . 'assets/icons/';
    }

    /**
     * Get an icon SVG by name
     *
     * @param string $icon_name The icon name (e.g., 'user', 'arrow-right')
     * @return string The SVG markup or empty string if not found
     */
    public function get_icon($icon_name) {
        // Sanitize icon name to prevent directory traversal
        $icon_name = sanitize_file_name($icon_name);

        // Check cache first
        if (isset($this->icons_cache[$icon_name])) {
            return $this->icons_cache[$icon_name];
        }

        $file_path = $this->icons_path . $icon_name . '.svg';

        if (!file_exists($file_path)) {
            GMKB_Logger::warning('GMKB Icon Service: Icon not found: ' . $icon_name);
            return '';
        }

        $svg = file_get_contents($file_path);

        // Cache the result
        $this->icons_cache[$icon_name] = $svg;

        return $svg;
    }

    /**
     * Check if an icon exists
     *
     * @param string $icon_name The icon name
     * @return bool True if icon exists
     */
    public function icon_exists($icon_name) {
        $icon_name = sanitize_file_name($icon_name);
        $file_path = $this->icons_path . $icon_name . '.svg';
        return file_exists($file_path);
    }

    /**
     * Get all available icon names
     *
     * @return array List of available icon names (without .svg extension)
     */
    public function get_available_icons() {
        $icons = [];

        if (!is_dir($this->icons_path)) {
            return $icons;
        }

        $files = glob($this->icons_path . '*.svg');

        foreach ($files as $file) {
            $icons[] = basename($file, '.svg');
        }

        return $icons;
    }

    /**
     * Get the icons directory path
     *
     * @return string Path to icons directory
     */
    public function get_icons_path() {
        return $this->icons_path;
    }

    /**
     * Clear the icon cache
     */
    public function clear_cache() {
        $this->icons_cache = [];
    }
}

/**
 * Helper function to access the singleton
 *
 * @return GMKB_Icon_Service
 */
function gmkb_icon_service() {
    return GMKB_Icon_Service::instance();
}

/**
 * Helper function to get an icon
 *
 * @param string $icon_name The icon name
 * @return string The SVG markup
 */
function gmkb_get_icon($icon_name) {
    return GMKB_Icon_Service::instance()->get_icon($icon_name);
}
