<?php
/**
 * Debug Console Logger
 * Loads ONLY when WP_DEBUG is enabled
 * 
 * @package Guestify Media Kit Builder
 * @version 1.0.0
 * @since 4.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Output comprehensive debug diagnostics to browser console
 * Only runs when WP_DEBUG is enabled
 */
function gmkb_debug_console_diagnostics() {
    // CRITICAL: Only load if debugging is explicitly enabled
    if (!defined('WP_DEBUG') || !WP_DEBUG) {
        return;
    }
    
    // Allow disabling even in debug mode via constant
    if (defined('GMKB_DISABLE_CONSOLE_DEBUG') && GMKB_DISABLE_CONSOLE_DEBUG) {
        return;
    }
    
    ?>
    <script type="text/javascript">
    (function() {
        'use strict';
        
        console.log('%c🔍 GMKB Debug Mode Active', 'background: #ff6b6b; color: white; padding: 4px 8px; font-weight: bold;');
        
        document.addEventListener('DOMContentLoaded', function() {
            console.log('GMKB: DOM ready, running diagnostics...');
            
            if (window.gmkbData && window.gmkbData.ajaxUrl) {
                console.log('GMKB: Backend data (gmkbData) is available.');
                
                // Log gmkbData keys for debugging
                console.log('🔍 GMKB DEBUG: gmkbData keys:', Object.keys(window.gmkbData));
                
                // Check Component Registry
                if (window.gmkbData.componentRegistry) {
                    const components = window.gmkbData.componentRegistry;
                    const componentCount = Object.keys(components).length;
                    
                    console.log('GMKB: Component Registry exists (' + componentCount + ' components)');
                    console.log('🔍 GMKB DEBUG: Component types:', Object.keys(components));
                    
                    // Icon field validation
                    const componentsWithoutIcons = [];
                    const iconMap = {};
                    
                    Object.keys(components).forEach(type => {
                        const comp = components[type];
                        if (!comp.icon || comp.icon === 'fa-solid fa-cube') {
                            componentsWithoutIcons.push(type);
                        }
                        iconMap[type] = comp.icon || 'MISSING';
                    });
                    
                    console.log('🎨 GMKB: Icon mapping:', iconMap);
                    
                    if (componentsWithoutIcons.length > 0) {
                        console.warn('GMKB: Components using fallback cube icon:', componentsWithoutIcons);
                    } else {
                        console.log('GMKB: All components have custom icons defined');
                    }
                    
                    // Show first component as sample
                    const firstComponent = Object.values(components)[0];
                    if (firstComponent) {
                        console.log('📦 GMKB DEBUG: Sample component data:', firstComponent);
                    }
                } else {
                    console.error('GMKB: componentRegistry is UNDEFINED or NULL!');
                    console.log('🔍 GMKB DEBUG: Full gmkbData:', window.gmkbData);
                }
                
                // Check Theme Data
                if (window.gmkbData.themes) {
                    console.log('GMKB: Themes available (' + window.gmkbData.themes.length + ')');
                } else {
                    console.warn('GMKB: No themes data found');
                }
                
                // Check Saved State
                if (window.gmkbData.savedState) {
                    console.log('GMKB: Saved state loaded');
                    if (window.gmkbData.savedState.components) {
                        console.log('  - Components in state:', Object.keys(window.gmkbData.savedState.components).length);
                    }
                    if (window.gmkbData.savedState.sections) {
                        console.log('  - Sections in state:', Object.keys(window.gmkbData.savedState.sections).length);
                    }
                } else {
                    console.log('GMKB: No saved state (new media kit)');
                }
                
                // Check Pods Data
                if (window.gmkbData.pods_data) {
                    const fieldCount = Object.keys(window.gmkbData.pods_data).length;
                    console.log('GMKB: Pods data loaded (' + fieldCount + ' fields)');
                    if (fieldCount > 0) {
                        console.log('  - Available fields:', Object.keys(window.gmkbData.pods_data).slice(0, 5).join(', '));
                    }
                } else {
                    console.log('GMKB: No Pods data available');
                }
                
            } else {
                console.error('GMKB CRITICAL: Backend data (gmkbData) is MISSING.');
                console.log('🔍 GMKB DEBUG: Check PHP enqueue.php for data injection issues');
            }
            
            // Check GMKB namespace after initialization
            setTimeout(function() {
                if (window.GMKB) {
                    console.log('GMKB: Namespace initialized');
                    console.log('  - Version:', window.GMKB.version);
                    console.log('  - Architecture:', window.GMKB.architecture);
                    console.log('  - Initialization:', window.GMKB.initialization);
                    
                    if (window.GMKB.stores) {
                        console.log('GMKB: Stores available:', Object.keys(window.GMKB.stores));
                    }
                    
                    if (window.GMKB.services) {
                        console.log('GMKB: Services available:', Object.keys(window.GMKB.services));
                    }
                } else {
                    console.warn('GMKB: Namespace not initialized yet');
                }
            }, 2000);
        });
        
        console.log('%cDebug console logging is active. To disable, define GMKB_DISABLE_CONSOLE_DEBUG in wp-config.php', 'color: #888;');
    })();
    </script>
    <?php
}
