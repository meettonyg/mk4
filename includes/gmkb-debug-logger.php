<?php
/**
 * GMKB Debug Logger
 * 
 * Provides detailed logging for save/load operations to diagnose
 * why components aren't persisting.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Debug_Logger {
    
    private static $log_file;
    
    public static function init() {
        self::$log_file = plugin_dir_path(dirname(__FILE__)) . 'logs/gmkb-debug.log';
        
        // Create log directory if it doesn't exist
        $log_dir = dirname(self::$log_file);
        if (!file_exists($log_dir)) {
            wp_mkdir_p($log_dir);
        }
    }
    
    public static function log($message, $context = array()) {
        if (!self::$log_file) {
            self::init();
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $log_entry = sprintf(
            "[%s] %s\n",
            $timestamp,
            $message
        );
        
        if (!empty($context)) {
            $log_entry .= "Context: " . json_encode($context, JSON_PRETTY_PRINT) . "\n";
        }
        
        $log_entry .= str_repeat('-', 80) . "\n";
        
        // Write to file
        error_log($log_entry, 3, self::$log_file);
        
        // Also write to WordPress debug.log if WP_DEBUG is enabled
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: ' . $message . (!empty($context) ? ' | ' . json_encode($context) : ''));
        }
    }
    
    public static function log_save_operation($post_id, $state) {
        $debug_info = array(
            'post_id' => $post_id,
            'components_count' => isset($state['components']) ? count($state['components']) : 0,
            'sections_count' => isset($state['sections']) ? count($state['sections']) : 0,
            'has_layout' => isset($state['layout']) && !empty($state['layout']),
            'theme' => isset($state['theme']) ? $state['theme'] : 'not_set'
        );
        
        // Count component references in sections
        $components_in_sections = 0;
        if (isset($state['sections']) && is_array($state['sections'])) {
            foreach ($state['sections'] as $section) {
                if (isset($section['components']) && is_array($section['components'])) {
                    $components_in_sections += count($section['components']);
                }
            }
        }
        $debug_info['components_in_sections'] = $components_in_sections;
        
        // Check component structure
        if (isset($state['components']) && !empty($state['components'])) {
            $first_component_key = array_key_first($state['components']);
            $first_component = $state['components'][$first_component_key];
            $debug_info['first_component'] = array(
                'id' => $first_component_key,
                'type' => isset($first_component['type']) ? $first_component['type'] : 'unknown',
                'has_data' => isset($first_component['data']),
                'has_props' => isset($first_component['props']),
                'has_sectionId' => isset($first_component['sectionId'])
            );
        }
        
        self::log('SAVE OPERATION', $debug_info);
        
        // Log state keys for debugging
        self::log('State structure keys: ' . implode(', ', array_keys($state)));
        
        return $debug_info;
    }
    
    public static function log_load_operation($post_id, $loaded_state) {
        $debug_info = array(
            'post_id' => $post_id,
            'state_exists' => !empty($loaded_state),
            'is_array' => is_array($loaded_state),
            'components_count' => 0,
            'sections_count' => 0
        );
        
        if (is_array($loaded_state)) {
            $debug_info['components_count'] = isset($loaded_state['components']) ? count($loaded_state['components']) : 0;
            $debug_info['sections_count'] = isset($loaded_state['sections']) ? count($loaded_state['sections']) : 0;
            $debug_info['has_layout'] = isset($loaded_state['layout']) && !empty($loaded_state['layout']);
            $debug_info['theme'] = isset($loaded_state['theme']) ? $loaded_state['theme'] : 'not_set';
            
            // Check for component references in sections
            $components_in_sections = 0;
            if (isset($loaded_state['sections']) && is_array($loaded_state['sections'])) {
                foreach ($loaded_state['sections'] as $section) {
                    if (isset($section['components']) && is_array($section['components'])) {
                        $components_in_sections += count($section['components']);
                    }
                }
            }
            $debug_info['components_in_sections'] = $components_in_sections;
            
            // Check first component if exists
            if (isset($loaded_state['components']) && !empty($loaded_state['components'])) {
                $first_component_key = array_key_first($loaded_state['components']);
                $first_component = $loaded_state['components'][$first_component_key];
                $debug_info['first_component'] = array(
                    'id' => $first_component_key,
                    'type' => isset($first_component['type']) ? $first_component['type'] : 'unknown',
                    'has_data' => isset($first_component['data']),
                    'has_props' => isset($first_component['props'])
                );
            }
        }
        
        self::log('LOAD OPERATION', $debug_info);
        
        return $debug_info;
    }
    
    public static function get_recent_logs($lines = 100) {
        if (!self::$log_file) {
            self::init();
        }
        
        if (!file_exists(self::$log_file)) {
            return 'No log file found';
        }
        
        $file = new SplFileObject(self::$log_file);
        $file->seek(PHP_INT_MAX);
        $total_lines = $file->key();
        
        $start_line = max(0, $total_lines - $lines);
        $file->seek($start_line);
        
        $output = '';
        while (!$file->eof()) {
            $output .= $file->fgets();
        }
        
        return $output;
    }
}

// Initialize the logger
GMKB_Debug_Logger::init();
