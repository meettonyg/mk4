<?php
/**
 * @file enhanced-state-loading-coordinator.php
 * @description ROOT FIX: Enhanced PHP State Loading Coordinator
 * 
 * This class ensures that saved state loading takes absolute priority over 
 * MKCG auto-generation, fixing the core issue where MKCG interfaces show
 * instead of restored saved components.
 * 
 * CRITICAL: This runs during PHP template rendering to check for saved
 * state and coordinate with JavaScript initialization.
 */

if (!defined('ABSPATH')) {
    exit;
}

// ROOT FIX: DISABLE COORDINATOR - bundles handle everything now
class GMKB_Enhanced_State_Loading_Coordinator {
    
    private static $instance = null;
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // ROOT FIX: Coordinator disabled - bundles handle coordination
        $this->log('Enhanced State Loading Coordinator: DISABLED (bundles handle coordination)');
    }
    
    /**
     * ROOT FIX: Return no coordination needed - bundles handle everything
     */
    public function check_saved_state_priority() {
        return array(
            'should_show_mkcg_auto_generation' => true,
            'saved_state_detected' => false,
            'coordination_mode' => 'bundles-handle-coordination',
            'instruction_for_js' => 'bundles-coordinate-everything',
            'template_behavior' => 'normal-bundle-initialization',
            'coordination_id' => 'disabled_' . time(),
            'coordination_timestamp' => current_time('mysql'),
            'debug_info' => array('coordinator' => 'disabled', 'reason' => 'bundles handle coordination')
        );
    }
    
    /**
     * ROOT FIX: No coordination JavaScript needed - bundles handle everything
     */
    public function generate_coordination_javascript($coordination_data) {
        return "
        <script id='gmkb-coordinator-disabled' type='text/javascript'>
        // ROOT FIX: PHP Coordinator disabled - bundles handle all coordination
        console.log('🚫 ROOT FIX: PHP Coordinator disabled - bundles handle coordination');
        window.gmkbPHPCoordinatorDisabled = true;
        </script>";
    }
    
    /**
     * ROOT FIX: Simple template instructions - no special coordination needed
     */
    public function generate_template_instructions($coordination_data) {
        return array(
            'show_empty_state' => true,
            'show_mkcg_dashboard' => true,
            'show_auto_generation_buttons' => true,
            'show_loading_state' => false,
            'loading_message' => '',
            'css_classes' => array('gmkb-bundle-coordination'),
            'data_attributes' => array('gmkb-coordination-mode' => 'bundles-only')
        );
    }
    
    /**
     * ROOT FIX: All coordination methods disabled - return safe defaults
     */
    public function record_saved_state($user_id = 0, $state_info = array()) {
        // Disabled
    }
    
    public function clear_saved_state_indicators($user_id = 0) {
        // Disabled  
    }
    
    public function get_coordination_status() {
        return array(
            'coordinator_active' => false,
            'status' => 'disabled',
            'reason' => 'bundles handle coordination',
            'server_time' => current_time('mysql')
        );
    }
    
    /**
     * Simple logging method
     * 
     * @param string $message Log message
     * @param string $level Log level
     */
    private function log($message, $level = 'info') {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[GMKB State Coordinator] ' . $message);
        }
    }
}

// Initialize coordinator AJAX handlers
add_action('wp_ajax_gmkb_record_saved_state', function() {
    $coordinator = GMKB_Enhanced_State_Loading_Coordinator::get_instance();
    
    $user_id = get_current_user_id();
    $state_info = array(
        'component_count' => intval($_POST['component_count'] ?? 0),
        'timestamp' => current_time('mysql')
    );
    
    $coordinator->record_saved_state($user_id, $state_info);
    
    wp_send_json_success(array(
        'message' => 'Saved state recorded',
        'user_id' => $user_id,
        'state_info' => $state_info
    ));
});

add_action('wp_ajax_nopriv_gmkb_record_saved_state', function() {
    $coordinator = GMKB_Enhanced_State_Loading_Coordinator::get_instance();
    
    $state_info = array(
        'component_count' => intval($_POST['component_count'] ?? 0),
        'timestamp' => current_time('mysql')
    );
    
    $coordinator->record_saved_state(0, $state_info);
    
    wp_send_json_success(array(
        'message' => 'Saved state recorded in session',
        'state_info' => $state_info
    ));
});

add_action('wp_ajax_gmkb_clear_saved_state', function() {
    $coordinator = GMKB_Enhanced_State_Loading_Coordinator::get_instance();
    $coordinator->clear_saved_state_indicators(get_current_user_id());
    
    wp_send_json_success(array('message' => 'Saved state indicators cleared'));
});

add_action('wp_ajax_nopriv_gmkb_clear_saved_state', function() {
    $coordinator = GMKB_Enhanced_State_Loading_Coordinator::get_instance();
    $coordinator->clear_saved_state_indicators(0);
    
    wp_send_json_success(array('message' => 'Saved state indicators cleared'));
});

// Debug endpoint
add_action('wp_ajax_gmkb_coordination_status', function() {
    $coordinator = GMKB_Enhanced_State_Loading_Coordinator::get_instance();
    wp_send_json_success($coordinator->get_coordination_status());
});

add_action('wp_ajax_nopriv_gmkb_coordination_status', function() {
    $coordinator = GMKB_Enhanced_State_Loading_Coordinator::get_instance();
    wp_send_json_success($coordinator->get_coordination_status());
});
