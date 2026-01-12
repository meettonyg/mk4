<?php
/**
 * Plugin Name: Guestify Media Kit Builder
 * Description: Drag-and-drop media kit builder with customizable components
 * Version: 2.1.0-option-a-pure-vue
 * Author: Guestify Team
 * Text Domain: guestify-media-kit-builder
 * Domain Path: /languages
 * License: GPL v2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// ROOT FIX: CRITICAL - Enqueue media library on 'wp' hook (fires before template)
// This ensures wp.media is available when template loads
add_action('wp', function() {
    // Only on media kit builder pages
    if (isset($_SERVER['REQUEST_URI']) && preg_match('#/tools/media-kit($|/|\?|&)#', $_SERVER['REQUEST_URI'])) {
        // ROOT FIX: Enqueue all required media scripts with proper dependencies
        wp_enqueue_media();
        
        // These are the core media library scripts that wp_enqueue_media() should load:
        // But we'll explicitly enqueue them to be sure
        wp_enqueue_script('media-models');
        wp_enqueue_script('wp-plupload');
        wp_enqueue_script('media-views');
        wp_enqueue_script('media-editor');
        wp_enqueue_script('media-audiovideo');
        
        // Enqueue media styles
        wp_enqueue_style('media-views');
    }
}, 1);

// DEFINE CONSTANTS AT THE TOP LEVEL
define('GUESTIFY_VERSION', '2.1.0-option-a-pure-vue');
define('GUESTIFY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GUESTIFY_PLUGIN_URL', plugin_dir_url(__FILE__));
define('GMKB_VERSION', '2.1.0-option-a-pure-vue');
define('GMKB_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GMKB_PLUGIN_URL', plugin_dir_url(__FILE__));
define('GMKB_WORDPRESS_COMPATIBLE', true);
define('GMKB_ARCHITECTURE', 'pure-vue'); // PHASE 3 COMPLETE: 100% Vue architecture, no PHP rendering
define('GMKB_USE_PURE_VUE', true); // PHASE 3: Always use Pure Vue template
define('GMKB_DEV_MODE', defined('WP_DEBUG') && WP_DEBUG);

// Include shared profile branding functions (used by enqueue.php and REST API)
require_once GUESTIFY_PLUGIN_DIR . 'includes/profile-branding.php';

// Include Vue-only enqueue system
require_once GUESTIFY_PLUGIN_DIR . 'includes/enqueue.php';

// ADMIN FILES: Only load essential admin tools
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/Base_Component_Data_Service.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/Base_Component_Data_Service.php';
}

// ARCHITECTURE: Components read data from props.data (JSON state)
// Pods circular sync removed - JSON state is single source of truth
// See: _archive/PODS-SYNC-REMOVAL-2025-12-11/ for removed Pods integration code

// ROOT FIX: Include component data sanitization (prevent database bloat)
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/component-data-sanitization.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/component-data-sanitization.php';
}

// DEPRECATED: Bi-directional field sync system REMOVED (2025-12-11)
// The "Write Arc" (component-field-sync.php) was broken due to an action hook typo:
// - API fired: 'gmkb_after_save_mediakit' (no underscore)
// - Sync listened for: 'gmkb_after_save_media_kit' (with underscore)
// This meant the sync NEVER executed. Since it's dead code, it has been deleted.
// The JSON state (gmkb_media_kit_state) is now the single source of truth.
// Archived: _archive/PODS-SYNC-REMOVAL-2025-12-11/component-field-sync.php

// PHASE 4: Theme Generator for dynamic CSS generation
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/class-theme-generator.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/class-theme-generator.php';
}

// PHASE 5: Component Marketplace Ready
if (is_admin()) {
    if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/marketplace/ComponentPackageManager.php')) {
        require_once GUESTIFY_PLUGIN_DIR . 'includes/marketplace/ComponentPackageManager.php';
    }
    if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/marketplace/ComponentPackageValidator.php')) {
        require_once GUESTIFY_PLUGIN_DIR . 'includes/marketplace/ComponentPackageValidator.php';
    }
}

// PHASE 6: Import/Export System
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/export/ExportManager.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/export/ExportManager.php';
}
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/import/ImportManager.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/import/ImportManager.php';
}

// PHASE 7: Version Control System
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/version-control/VersionManager.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/version-control/VersionManager.php';
}

// PHASE 8: Native Code-First Data Layer (Headless Architecture Migration)
// Replaces Pods dependency with native WordPress CPT and meta field registration
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/core-schema.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/core-schema.php';
}

// NOTE: gmkb_pitch and gmkb_interview CPTs were removed.
// Pitch/Interview data is synced from external plugin tables via bridge hooks.
// See: system/class-onboarding-sync.php for bridge implementation.

if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/field-migration-map.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/field-migration-map.php';
}

// Profile Schema - Single Source of Truth for field definitions
// Replaces the legacy Formidable field mapping
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/class-profile-schema.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/class-profile-schema.php';
}

// Profile Repository - Data Access Layer for profile CRUD operations
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/class-profile-repository.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/class-profile-repository.php';
}

// Onboarding Schema - Single Source of Truth for gamification tasks and rewards
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/class-onboarding-schema.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/class-onboarding-schema.php';
}

// Onboarding Repository - Progress calculation and data access
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/class-onboarding-repository.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/class-onboarding-repository.php';
}

// Onboarding Migration - Progress recalculation and data migration tools
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/migrations/class-onboarding-migration.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/migrations/class-onboarding-migration.php';
}

// Onboarding Sync - GHL integration via WP Fusion
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/class-onboarding-sync.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/class-onboarding-sync.php';
}

// Onboarding Hooks - Event integration for automatic progress updates
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/class-onboarding-hooks.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/class-onboarding-hooks.php';
}

// Onboarding Leaderboard - Displays top users by progress
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/class-onboarding-leaderboard.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/class-onboarding-leaderboard.php';
}

// Profile Scoring - Cialdini-based influence scoring (separate from onboarding gamification)
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/class-profile-scoring.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/class-profile-scoring.php';
}

// Premium Features - Feature gating for premium functionality
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/class-premium-features.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/class-premium-features.php';
}

// Profile Limits - Membership tier based profile creation limits
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/class-profile-limits.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/class-profile-limits.php';
}

// Profile Schema Markup - Schema.org structured data generation
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/class-profile-schema-markup.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/class-profile-schema-markup.php';
}

// SEO Service - Profile SEO meta tags and schema output
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/seo/class-profile-seo-service.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/seo/class-profile-seo-service.php';
}

// AEO Optimizer - Answer Engine Optimization scoring and recommendations
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/seo/class-aeo-optimizer.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/seo/class-aeo-optimizer.php';
}

// Legacy: Formidable Field ID to Post Meta mapping
// TODO: Remove after migration verification complete
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/formidable-field-map.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/formidable-field-map.php';
}

if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/permissions.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/permissions.php';
}

// PHASE 8.4: GraphQL Integration (Optional - requires WPGraphQL plugin)
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/graphql-types.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/graphql-types.php';
}

// Native data layer test scripts (admin only)
if (is_admin()) {
    // Check both possible locations for test files
    $native_test_paths = [
        'tests/native-data-test.php',
        'tests/native-migration/native-data-test.php',
    ];
    foreach ($native_test_paths as $path) {
        if (file_exists(GUESTIFY_PLUGIN_DIR . $path)) {
            require_once GUESTIFY_PLUGIN_DIR . $path;
            break;
        }
    }

    // Onboarding system tests
    if (file_exists(GUESTIFY_PLUGIN_DIR . 'tests/onboarding/onboarding-test.php')) {
        require_once GUESTIFY_PLUGIN_DIR . 'tests/onboarding/onboarding-test.php';
    }

    // Profile Scoring (Cialdini model) tests
    if (file_exists(GUESTIFY_PLUGIN_DIR . 'tests/onboarding/profile-scoring-test.php')) {
        require_once GUESTIFY_PLUGIN_DIR . 'tests/onboarding/profile-scoring-test.php';
    }
}

// PHASE 2 IMPLEMENTATION: Pure Vue REST API v2 - Unified Endpoint
// ROOT FIX: Removed MediaKitAPI (v1) - redundant code, frontend only uses v2
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-rest-api-v2.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-rest-api-v2.php';
}

// Profile API - Direct post meta editing for Vue Profile Editor
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-profile-api.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-profile-api.php';
}

// Offers API - CRUD for relational Offers system
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-offers-api.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-offers-api.php';
}

// Interviews API - CRUD for relational Interviews system
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-interviews-api.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-interviews-api.php';
}

// Onboarding API - Progress tracking and gamification endpoints
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-onboarding-api.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-onboarding-api.php';
}

// Onboarding Admin API - Rewards management endpoints
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-onboarding-admin-api.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-onboarding-admin-api.php';
}

// Profile Limits API - Membership tier limits endpoints
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-profile-limits-api.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-profile-limits-api.php';
}

// Offers Migration - Migrate Formidable offers to native CPT
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/migrations/class-gmkb-offers-migration.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/migrations/class-gmkb-offers-migration.php';
}

// AI INTEGRATION: AI Content Generation REST API Controller
// Part of the Unified AI Generator Architecture ("Modular Widgets")
// Supports both integrated (builder) and standalone (free tools) modes
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-ai-controller.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-ai-controller.php';
}

// PHASE 3: Component Discovery API for scalable component architecture
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/ComponentDiscoveryAPI.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/ComponentDiscoveryAPI.php';
    add_action('init', function() {
        if (class_exists('\GMKB\ComponentDiscoveryAPI')) {
            new \GMKB\ComponentDiscoveryAPI();
        }
    }, 5);
}

// ROOT FIX: Theme REST API Controller - CRITICAL for theme saving functionality
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/class-rest-theme-controller.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/class-rest-theme-controller.php';
    add_action('init', function() {
        if (class_exists('GMKB_REST_Theme_Controller')) {
            new GMKB_REST_Theme_Controller();
        }
    }, 5);
}

// Template Directory REST API Controller - Carrd-like template selection
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/class-rest-template-controller.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/class-rest-template-controller.php';
    add_action('init', function() {
        if (class_exists('GMKB_REST_Template_Controller')) {
            new GMKB_REST_Template_Controller();
        }
    }, 5);
}

// Component system files
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
}

// ROOT FIX: Auto-load component data-integration files (ARCHITECTURE COMPLIANT)
// This ensures each component's data integration logic is loaded
$components_dir = GUESTIFY_PLUGIN_DIR . 'components';
if (is_dir($components_dir)) {
    $component_folders = glob($components_dir . '/*', GLOB_ONLYDIR);
    foreach ($component_folders as $component_folder) {
        $data_integration_file = $component_folder . '/data-integration.php';
        if (file_exists($data_integration_file)) {
            require_once $data_integration_file;
        }
    }
}

// ROOT FIX: Include frontend template router for conditional media kit display
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/frontend-template-router.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/frontend-template-router.php';
}

// Profile Editor Shortcode - Vue-based profile editing
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/profile-shortcode.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/profile-shortcode.php';
}

// Profile List Shortcode - Vue-based profile listing
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/profile-list-shortcode.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/profile-list-shortcode.php';
}

// Onboarding Dashboard Shortcode - Vue-based gamification dashboard
// Usage: [gmkb_onboarding] or [gmkb_profile_strength profile_id="123" size="medium"]
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/onboarding-shortcode.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/onboarding-shortcode.php';
}

// AI INTEGRATION: Free Tools Shortcode for public AI generators (standalone mode)
// Usage: [gmkb_free_tool type="biography" title="Free Bio Generator"]
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/class-gmkb-free-tools-shortcode.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/class-gmkb-free-tools-shortcode.php';
}

// Tool Metadata: Provides server-side access to meta.json tool configurations for SEO
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-tool-metadata.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-tool-metadata.php';
}

// Tool Landing Page Shortcode: Full SEO landing pages with Vue components
// Usage: [gmkb_tool_landing tool="topics-generator"]
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/class-gmkb-tool-landing-shortcode.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/class-gmkb-tool-landing-shortcode.php';
}

// Generic Tool Shortcode: Embeds any tool by slug
// Usage: [gmkb_tool tool="topics-generator"]
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/class-gmkb-tool-shortcode.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/class-gmkb-tool-shortcode.php';
}

// Virtual Tool Pages: Auto-generated pages at /tools/ and /tools/{slug}/
// No manual page creation required - URLs are handled via rewrite rules
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/pages/class-gmkb-tool-pages.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/pages/class-gmkb-tool-pages.php';
}

// Virtual Template Pages: Auto-generated pages at /templates/ and /templates/{slug}/
// SEO-friendly template directory for media kit designs
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/pages/class-gmkb-template-pages.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/pages/class-gmkb-template-pages.php';
}

// Template Directory Shortcode - Display templates on any page
// Usage: [gmkb_templates] or [gmkb_templates category="corporate" columns="3"]
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/template-directory-shortcode.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/template-directory-shortcode.php';
}

// Offers Shortcode - Display offers on any page
// Usage: [gmkb_offers] or [gmkb_offers profile_id="123" layout="grid" columns="3"]
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/offers-shortcode.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/offers-shortcode.php';
}

// Home Widget Shortcode - Compact widget for Guestify Home Dashboard
// Usage: [gmkb_home_widget] or [gmkb_home_widget compact="true"]
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/home-widget-shortcode.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/home-widget-shortcode.php';
}

// ROOT FIX: Include debug REST endpoint for troubleshooting
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/debug-rest-endpoint.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/debug-rest-endpoint.php';
}

// ROOT FIX: Load frontend display class on BOTH admin and frontend
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-frontend-display.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-frontend-display.php';
}

// AGENCY INTEGRATION: Guestify Core multi-tenant agency management
// Bridges Media Kit Builder with agency scoping for profiles and media kits
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-agency-bridge.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-agency-bridge.php';
}

// ADMIN TOOLS: Load essential admin functionality only
if (is_admin()) {
    // ROOT FIX: Load comprehensive diagnostic tool
    $diagnostic_file = GUESTIFY_PLUGIN_DIR . 'admin/diagnostic-tools.php';
    if (file_exists($diagnostic_file)) {
        require_once $diagnostic_file;
    }

    $viewer_file = GUESTIFY_PLUGIN_DIR . 'admin/media-kit-viewer.php';
    if (file_exists($viewer_file)) {
        require_once $viewer_file;
    }

    // Onboarding Admin - Rewards management and statistics
    if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/admin/class-gmkb-onboarding-admin.php')) {
        require_once GUESTIFY_PLUGIN_DIR . 'includes/admin/class-gmkb-onboarding-admin.php';
    }

    // Profile Limits Admin - Membership tier management
    if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/admin/class-gmkb-profile-limits-admin.php')) {
        require_once GUESTIFY_PLUGIN_DIR . 'includes/admin/class-gmkb-profile-limits-admin.php';
    }

    // AI Settings Admin - OpenAI API configuration
    if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/admin/class-gmkb-ai-settings-admin.php')) {
        require_once GUESTIFY_PLUGIN_DIR . 'includes/admin/class-gmkb-ai-settings-admin.php';
    }
}

// ============================================
// Issue #13 FIX: Load refactored class files
// Split 870-line file into 4 separate classes
// ============================================

require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-plugin.php';
require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-admin.php';
require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-ajax.php';
require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-routing.php';

// Backward compatibility alias
class Guestify_Media_Kit_Builder extends GMKB_Plugin {}

// Initialize the plugin
$gmkb_plugin = GMKB_Plugin::get_instance();

// ROOT FIX: Ensure ComponentDiscovery is globally available immediately
// This fixes race condition where REST API can't find ComponentDiscovery
global $gmkb_component_discovery;
if (!isset($gmkb_component_discovery)) {
    $gmkb_component_discovery = $gmkb_plugin->get_component_discovery();
}

// ROOT FIX: Initialize REST API v2 AFTER ComponentDiscovery is ready
// This ensures Pods fields can be discovered from component configs
global $gmkb_rest_api_v2;
if (class_exists('GMKB_REST_API_V2')) {
    $gmkb_rest_api_v2 = new GMKB_REST_API_V2();
}

// AI INTEGRATION: Initialize AI Controller
// Provides /gmkb/v2/ai/generate endpoint for content generation
global $gmkb_ai_controller;
if (class_exists('GMKB_AI_Controller')) {
    $gmkb_ai_controller = new GMKB_AI_Controller();
}

// Initialize admin functionality
$gmkb_admin = GMKB_Admin::get_instance();
$gmkb_admin->set_component_discovery($gmkb_plugin->get_component_discovery());

// Initialize AJAX handlers
$gmkb_ajax = GMKB_Ajax::get_instance();
$gmkb_ajax->set_component_discovery($gmkb_plugin->get_component_discovery());

// Initialize routing
$gmkb_routing = GMKB_Routing::get_instance();
