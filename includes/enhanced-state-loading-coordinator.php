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
        // Initialize coordinator
        $this->log('Enhanced State Loading Coordinator initialized');
    }
    
    /**
     * ROOT FIX: Check if saved state exists in client-side storage
     * This method determines whether to show MKCG auto-generation or wait for saved state
     * 
     * @return array Coordination data for template rendering
     */
    public function check_saved_state_priority() {
        $coordination_data = array(
            'should_show_mkcg_auto_generation' => true,
            'saved_state_detected' => false,
            'coordination_mode' => 'mkcg-priority', // default
            'instruction_for_js' => 'proceed-with-mkcg',
            'template_behavior' => 'show-auto-generation',
            'coordination_id' => 'coord_' . time() . '_' . wp_rand(1000, 9999),
            'coordination_timestamp' => current_time('mysql'),
            'debug_info' => array()
        );
        
        // ROOT FIX: Check client-side storage indicators
        // Since PHP can't directly access localStorage, we check for URL parameters
        // or other indicators that suggest saved state exists
        
        $saved_state_indicators = $this->detect_saved_state_indicators();
        
        if ($saved_state_indicators['has_indicators']) {
            $coordination_data['should_show_mkcg_auto_generation'] = false;
            $coordination_data['saved_state_detected'] = true;
            $coordination_data['coordination_mode'] = 'saved-state-priority';
            $coordination_data['instruction_for_js'] = 'load-saved-state-first';
            $coordination_data['template_behavior'] = 'wait-for-state-loading';
            
            $this->log('ROOT FIX: Saved state indicators detected - prioritizing saved state over MKCG');
        } else {
            $this->log('ROOT FIX: No saved state indicators - allowing MKCG auto-generation');
        }
        
        $coordination_data['debug_info'] = array(
            'indicators_checked' => $saved_state_indicators,
            'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'detection_method' => 'php-coordinator'
        );
        
        return $coordination_data;
    }
    
    /**
     * ROOT FIX: Detect indicators that saved state might exist
     * Uses various methods to determine if user likely has saved data
     * 
     * @return array Detection results
     */
    private function detect_saved_state_indicators() {
        $indicators = array(
            'has_indicators' => false,
            'url_parameter' => false,
            'session_data' => false,
            'user_meta' => false,
            'recent_activity' => false,
            'methods_checked' => array()
        );
        
        // Method 1: Check URL parameter indicating saved state
        if (isset($_GET['has_saved_state']) && $_GET['has_saved_state'] === 'true') {
            $indicators['url_parameter'] = true;
            $indicators['has_indicators'] = true;
            $indicators['methods_checked'][] = 'url_parameter';
            $this->log('ROOT FIX: URL parameter indicates saved state exists');
        }
        
        // Method 2: Check session data
        if (session_status() === PHP_SESSION_ACTIVE || session_start()) {
            if (isset($_SESSION['gmkb_has_saved_state']) && $_SESSION['gmkb_has_saved_state']) {
                $indicators['session_data'] = true;
                $indicators['has_indicators'] = true;
                $indicators['methods_checked'][] = 'session_data';
                $this->log('ROOT FIX: Session data indicates saved state exists');
            }
        }
        
        // Method 3: Check user meta (for logged-in users)
        if (is_user_logged_in()) {
            $user_id = get_current_user_id();
            $has_saved_work = get_user_meta($user_id, 'gmkb_has_saved_work', true);
            if ($has_saved_work) {
                $indicators['user_meta'] = true;
                $indicators['has_indicators'] = true;
                $indicators['methods_checked'][] = 'user_meta';
                $this->log('ROOT FIX: User meta indicates saved state exists for user ' . $user_id);
            }
        }
        
        // Method 4: Check for recent activity (return visits)
        if (isset($_COOKIE['gmkb_last_visit'])) {
            $last_visit = intval($_COOKIE['gmkb_last_visit']);
            $time_since_visit = time() - $last_visit;
            
            // If user was here in last 7 days, they might have saved state
            if ($time_since_visit < (7 * 24 * 60 * 60)) {
                $indicators['recent_activity'] = true;
                $indicators['has_indicators'] = true;
                $indicators['methods_checked'][] = 'recent_activity';
                $this->log('ROOT FIX: Recent activity suggests possible saved state (last visit: ' . $time_since_visit . ' seconds ago)');
            }
        }
        
        // Set cookie for future visits
        setcookie('gmkb_last_visit', time(), time() + (30 * 24 * 60 * 60), '/'); // 30 days
        
        return $indicators;
    }
    
    /**
     * ROOT FIX: Generate coordination JavaScript for template
     * This creates the JavaScript coordination code that bridges PHP and JS
     * 
     * @param array $coordination_data Coordination data from check_saved_state_priority()
     * @return string JavaScript code for template injection
     */
    public function generate_coordination_javascript($coordination_data) {
        $coordination_json = wp_json_encode($coordination_data);
        
        return "
        <script id='gmkb-state-loading-coordination' type='text/javascript'>
        (function() {
            // ROOT FIX: Enhanced State Loading Coordination from PHP
            window.gmkbStateLoadingCoordination = {$coordination_json};
            
            console.log('🎯 ROOT FIX: PHP State Loading Coordination active:', window.gmkbStateLoadingCoordination);
            
            // ROOT FIX: Coordinate with JavaScript initialization
            if (window.gmkbStateLoadingCoordination.coordination_mode === 'saved-state-priority') {
                console.log('🔄 ROOT FIX: PHP detected saved state - instructing JS to prioritize saved state loading');
                
                // Signal JavaScript to prioritize saved state
                window.gmkbPrioritizeSavedState = true;
                window.gmkbSuppressMKCGAutoGeneration = true;
                
                // Set up coordination event listener
                document.addEventListener('DOMContentLoaded', function() {
                    console.log('🎯 ROOT FIX: DOM ready - coordinating saved state priority');
                    
                    // ROOT FIX: Use event-driven coordination instead of polling
                    const coordinateStateLoading = () => {
                        console.log('🔄 ROOT FIX: Event-driven state loading coordination starting - NO MORE POLLING!');
                        console.log('🎯 This should eliminate the setTimeout polling errors!');
                        
                    // Check if enhanced state manager is already available
                        if (window.enhancedStateManager && typeof window.enhancedStateManager.autoLoadSavedState === 'function') {
                            console.log('✅ ROOT FIX: Enhanced state manager already available - triggering priority saved state loading');
                            triggerSavedStateLoading();
                            return;
                        }
                        
                        // Wait for coreSystemsReady event
                        console.log('⏳ ROOT FIX: Waiting for coreSystemsReady event for state coordination...');
                        
                        const onSystemsReady = (event) => {
                            console.log('🎉 ROOT FIX: coreSystemsReady event received for state coordination!', event.detail);
                            document.removeEventListener('coreSystemsReady', onSystemsReady);
                            clearTimeout(timeoutId);
                            
                            // Now trigger saved state loading
                            if (window.enhancedStateManager && typeof window.enhancedStateManager.autoLoadSavedState === 'function') {
                                triggerSavedStateLoading();
                            } else {
                                console.error('❌ ROOT FIX: Enhanced state manager not available even after coreSystemsReady event');
                                emitCoordinationFailure(new Error('Enhanced state manager not available after coreSystemsReady'));
                            }
                        };
                        
                        document.addEventListener('coreSystemsReady', onSystemsReady);
                        
                        // Fallback timeout (much longer since we're using events)
                        const timeoutId = setTimeout(() => {
                            document.removeEventListener('coreSystemsReady', onSystemsReady);
                            console.error('❌ ROOT FIX: State loading coordination failed: coreSystemsReady event timeout');
                            emitCoordinationFailure(new Error('coreSystemsReady event timeout'));
                        }, 15000); // 15 second timeout for event-driven approach
                    };
                    
                    const triggerSavedStateLoading = () => {
                        try {
                            window.enhancedStateManager.autoLoadSavedState();
                            
                            // Emit coordination success event
                            document.dispatchEvent(new CustomEvent('gmkbStateLoadingCoordinationComplete', {
                                detail: {
                                    coordination_id: window.gmkbStateLoadingCoordination.coordination_id,
                                    mode: 'saved-state-priority',
                                    success: true,
                                    approach: 'event-driven',
                                    timestamp: Date.now()
                                }
                            }));
                            
                            console.log('✅ ROOT FIX: Event-driven saved state loading coordination completed successfully');
                            
                        } catch (error) {
                            console.error('❌ ROOT FIX: Saved state loading failed:', error);
                            emitCoordinationFailure(error);
                        }
                    };
                    
                    const emitCoordinationFailure = (error) => {
                        document.dispatchEvent(new CustomEvent('gmkbStateLoadingCoordinationFailed', {
                            detail: {
                                coordination_id: window.gmkbStateLoadingCoordination.coordination_id,
                                error: error.message,
                                approach: 'event-driven',
                                timestamp: Date.now()
                            }
                        }));
                    };
                    
                    // Start event-driven coordination
                    coordinateStateLoading();
                });
                
            } else {
                console.log('🎯 ROOT FIX: No saved state detected - allowing normal MKCG initialization');
                window.gmkbPrioritizeSavedState = false;
                window.gmkbSuppressMKCGAutoGeneration = false;
            }
            
            // ROOT FIX: Expose coordination status for debugging
            window.gmkbCoordinationStatus = function() {
                return {
                    coordination: window.gmkbStateLoadingCoordination,
                    prioritizeSavedState: window.gmkbPrioritizeSavedState,
                    suppressMKCG: window.gmkbSuppressMKCGAutoGeneration,
                    stateManagerReady: !!window.enhancedStateManager
                };
            };
            
        })();
        </script>";
    }
    
    /**
     * ROOT FIX: Generate template display instructions
     * Determines what the template should show based on coordination data
     * 
     * @param array $coordination_data Coordination data
     * @return array Template display instructions
     */
    public function generate_template_instructions($coordination_data) {
        $instructions = array(
            'show_empty_state' => true,
            'show_mkcg_dashboard' => false,
            'show_auto_generation_buttons' => false,
            'show_loading_state' => false,
            'loading_message' => '',
            'css_classes' => array(),
            'data_attributes' => array()
        );
        
        if ($coordination_data['coordination_mode'] === 'saved-state-priority') {
            // Saved state detected - show loading state and wait
            $instructions['show_empty_state'] = false;
            $instructions['show_loading_state'] = true;
            $instructions['loading_message'] = 'Loading your saved components...';
            $instructions['css_classes'][] = 'gmkb-loading-saved-state';
            $instructions['data_attributes']['gmkb-coordination-mode'] = 'saved-state-priority';
            
            $this->log('ROOT FIX: Template instructions - waiting for saved state loading');
            
        } else {
            // No saved state - show MKCG auto-generation
            $instructions['show_mkcg_dashboard'] = true;
            $instructions['show_auto_generation_buttons'] = true;
            $instructions['css_classes'][] = 'gmkb-mkcg-mode';
            $instructions['data_attributes']['gmkb-coordination-mode'] = 'mkcg-priority';
            
            $this->log('ROOT FIX: Template instructions - showing MKCG auto-generation');
        }
        
        $instructions['data_attributes']['gmkb-coordination-id'] = $coordination_data['coordination_id'];
        
        return $instructions;
    }
    
    /**
     * ROOT FIX: Update user meta when state is saved (called from AJAX)
     * This helps with future saved state detection
     * 
     * @param int $user_id User ID (0 for non-logged-in users)
     * @param array $state_info Information about saved state
     */
    public function record_saved_state($user_id = 0, $state_info = array()) {
        if ($user_id > 0) {
            update_user_meta($user_id, 'gmkb_has_saved_work', true);
            update_user_meta($user_id, 'gmkb_last_save_time', current_time('mysql'));
            update_user_meta($user_id, 'gmkb_component_count', $state_info['component_count'] ?? 0);
            
            $this->log('ROOT FIX: Recorded saved state for user ' . $user_id);
        }
        
        // Also set session data for non-logged-in users
        if (session_status() === PHP_SESSION_ACTIVE || session_start()) {
            $_SESSION['gmkb_has_saved_state'] = true;
            $_SESSION['gmkb_last_save_time'] = time();
            
            $this->log('ROOT FIX: Recorded saved state in session');
        }
    }
    
    /**
     * ROOT FIX: Clear saved state indicators (called when state is cleared)
     * 
     * @param int $user_id User ID (0 for non-logged-in users)
     */
    public function clear_saved_state_indicators($user_id = 0) {
        if ($user_id > 0) {
            delete_user_meta($user_id, 'gmkb_has_saved_work');
            delete_user_meta($user_id, 'gmkb_last_save_time');
            delete_user_meta($user_id, 'gmkb_component_count');
            
            $this->log('ROOT FIX: Cleared saved state indicators for user ' . $user_id);
        }
        
        // Clear session data
        if (session_status() === PHP_SESSION_ACTIVE || session_start()) {
            unset($_SESSION['gmkb_has_saved_state']);
            unset($_SESSION['gmkb_last_save_time']);
            
            $this->log('ROOT FIX: Cleared saved state indicators from session');
        }
    }
    
    /**
     * Get coordination status for debugging
     * 
     * @return array Current coordination status
     */
    public function get_coordination_status() {
        $saved_state_check = $this->check_saved_state_priority();
        
        return array(
            'coordinator_active' => true,
            'current_coordination' => $saved_state_check,
            'detection_methods' => $this->detect_saved_state_indicators(),
            'session_active' => session_status() === PHP_SESSION_ACTIVE,
            'user_logged_in' => is_user_logged_in(),
            'current_user_id' => get_current_user_id(),
            'server_time' => current_time('mysql'),
            'debug_mode' => defined('WP_DEBUG') && WP_DEBUG
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
