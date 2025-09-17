<?php
/**
 * @file polling-detector-injector.php
 * @description ROOT FIX: Polling Detection System Injector
 * 
 * This file injects the comprehensive polling detection system into the 
 * Media Kit Builder template to identify the exact source of the timeout errors.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Polling_Detector_Injector {
    
    public static function inject_detector() {
        // ROOT FIX: DETECTOR DISABLED - Was causing race conditions
        // This debug system was injecting polling functions that caused timeout errors
        return; // DISABLED - bundles handle coordination without polling
        
        // Only inject on builder pages
        if (!is_page('guestify-media-kit')) {
            return;
        }
        
        // Read the detector script
        $detector_path = GUESTIFY_PLUGIN_DIR . 'debug/comprehensive-polling-detector.js';
        
        if (!file_exists($detector_path)) {
            error_log('GMKB Polling Detector: Script file not found at ' . $detector_path);
            return;
        }
        
        $detector_script = file_get_contents($detector_path);
        
        if (empty($detector_script)) {
            error_log('GMKB Polling Detector: Failed to read script content');
            return;
        }
        
        // Inject the script with high priority
        echo '<script type="text/javascript" id="gmkb-polling-detector">';
        echo '/* ROOT FIX: Comprehensive Polling Detection System */';
        echo $detector_script;
        echo '</script>';
        
        error_log('GMKB Polling Detector: Detection system injected successfully');
        
        // Also add a simple inline script to initialize detection
        echo '<script type="text/javascript">';
        echo 'console.log("🚀 ROOT FIX: Polling detector active - watch console for detection results");';
        echo 'console.log("🔧 Run detectPolling() in console after 10 seconds to see results");';
        echo 'console.log("🚫 Run eliminatePolling() in console to eliminate detected polling");';
        echo '</script>';
    }
    
    public static function add_debug_info() {
        // ROOT FIX: DEBUG INFO DISABLED - Was causing setInterval polling
        return; // DISABLED - bundles handle coordination without polling
        
        if (!is_page('guestify-media-kit')) {
            return;
        }
        
        echo '<div id="polling-debug-info" style="position: fixed; top: 10px; left: 10px; background: #000; color: #0f0; padding: 10px; font-family: monospace; font-size: 12px; z-index: 10000; border-radius: 4px; max-width: 300px;">';
        echo '<div>🕵️ Polling Detector Active</div>';
        echo '<div>⏰ Monitor: <span id="detection-count">0</span> detections</div>';
        echo '<div>🎯 Looking for line 2584 error source</div>';
        echo '<div style="margin-top: 8px; font-size: 10px; opacity: 0.8;">Check browser console for details</div>';
        echo '</div>';
        
        echo '<script>';
        echo 'setInterval(() => {';
        echo '  if (window.pollingDetector) {';
        echo '    document.getElementById("detection-count").textContent = window.pollingDetector.detected.length;';
        echo '  }';
        echo '}, 1000);';
        echo '</script>';
    }
}

// Hook into wp_head with high priority to inject before other scripts
add_action('wp_head', array('GMKB_Polling_Detector_Injector', 'inject_detector'), 1);

// Hook into wp_footer to add debug info
add_action('wp_footer', array('GMKB_Polling_Detector_Injector', 'add_debug_info'), 1);
