<?php
/**
 * Enhanced AJAX Support - Topics Component Integration
 * 
 * This file now focuses only on Topics-specific AJAX functionality
 * All general AJAX handlers have been moved to the main plugin to prevent conflicts
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Note: This file is included by the main plugin and provides enhanced Topics functionality
// All main AJAX handlers (component loading, rendering, design panels) are now in the main plugin
// to prevent conflicts and ensure single source of truth.

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ Enhanced AJAX: Topics integration loaded (conflicts removed)');
}

// All enhanced functionality has been integrated into the main plugin
// to ensure single source of truth and prevent AJAX handler conflicts
// 
// The topics component AJAX handlers remain in components/topics/ajax-handler.php
// which provides specialized Topics functionality without conflicts