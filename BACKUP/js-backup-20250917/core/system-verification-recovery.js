/**
 * ROOT CAUSE FIX: System Verification and Recovery Script
 * This script verifies that all root cause fixes are working and provides
 * recovery mechanisms if any issues persist.
 */

(function() {
    'use strict';
    
    console.log('🔧 ROOT CAUSE FIX: System Verification Script Starting...');
    
    let verificationAttempts = 0;
    const MAX_VERIFICATION_ATTEMPTS = 10;
    
    function performSystemVerification() {
        verificationAttempts++;
        
        console.log(`🔍 SYSTEM VERIFICATION Attempt ${verificationAttempts}/${MAX_VERIFICATION_ATTEMPTS}`);
        
        const results = {
            enhancedComponentRenderer: {
                classAvailable: !!window.EnhancedComponentRenderer,
                instanceAvailable: !!window.enhancedComponentRenderer,
                hasRenderMethod: !!(window.enhancedComponentRenderer && window.enhancedComponentRenderer.renderComponent),
                hasInitMethod: !!(window.enhancedComponentRenderer && window.enhancedComponentRenderer.init)
            },
            coreSystemsCoordinator: {
                classAvailable: !!window.CoreSystemsCoordinator,
                instanceAvailable: !!window.coreSystemsCoordinator,
                hasCheckMethod: !!(window.coreSystemsCoordinator && window.coreSystemsCoordinator.checkSystemReadiness)
            },
            previewContainer: {
                exists: !!document.getElementById('media-kit-preview'),
                hasChildren: document.getElementById('media-kit-preview')?.children?.length > 0
            },
            circuitBreakers: {
                sortablePatched: !!window.setInterval.toString().includes('sortable-integration'),
                autoSavePatched: !!console.warn.toString().includes('auto-save')
            }
        };
        
        // Calculate overall health
        const rendererReady = results.enhancedComponentRenderer.instanceAvailable && results.enhancedComponentRenderer.hasRenderMethod;
        const coordinatorReady = results.coreSystemsCoordinator.instanceAvailable && results.coreSystemsCoordinator.hasCheckMethod;
        const systemsHealthy = rendererReady && coordinatorReady;
        
        console.log('🏥 SYSTEM HEALTH CHECK RESULTS:', {
            rendererReady,
            coordinatorReady,
            systemsHealthy,
            details: results
        });
        
        if (systemsHealthy) {
            console.log('✅ ROOT CAUSE FIX: All systems are healthy and functioning');
            
            // Trigger a manual system check to ensure everything is working
            if (window.coreSystemsCoordinator) {
                window.coreSystemsCoordinator.checkSystemReadiness(false);
            }
            
            // Check if preview area is still blank and try to recover
            if (!results.previewContainer.hasChildren) {
                console.log('🔄 RECOVERY: Preview area is blank, attempting component recovery...');
                attemptComponentRecovery();
            }
            
            return true; // Verification successful
        } else {
            console.warn(`⚠️ SYSTEM VERIFICATION: Issues detected on attempt ${verificationAttempts}`);
            
            // Try emergency recovery
            if (verificationAttempts === 5) {
                console.log('🚑 EMERGENCY RECOVERY: Attempting system recovery...');
                attemptEmergencyRecovery(results);
            }
            
            return false; // Verification failed
        }
    }
    
    function attemptComponentRecovery() {
        // Try to get saved state and render components
        if (window.enhancedStateManager && window.enhancedComponentRenderer) {
            try {
                const currentState = window.enhancedStateManager.getState();
                if (currentState && currentState.components && Object.keys(currentState.components).length > 0) {
                    console.log('🔄 RECOVERY: Found saved components, attempting render...');
                    
                    if (window.enhancedComponentRenderer.renderSavedComponents) {
                        window.enhancedComponentRenderer.renderSavedComponents(currentState);
                    } else if (window.enhancedComponentRenderer.init) {
                        window.enhancedComponentRenderer.init();
                    }
                }
            } catch (error) {
                console.error('❌ RECOVERY: Failed to render saved components:', error);
            }
        }
    }
    
    function attemptEmergencyRecovery(results) {
        // Emergency recovery for component renderer
        if (!results.enhancedComponentRenderer.instanceAvailable && results.enhancedComponentRenderer.classAvailable) {
            try {
                console.log('🚑 EMERGENCY: Creating missing component renderer instance...');
                window.enhancedComponentRenderer = new window.EnhancedComponentRenderer();
                
                if (window.enhancedComponentRenderer.init) {
                    window.enhancedComponentRenderer.init();
                }
                
                // Dispatch the ready event
                document.dispatchEvent(new CustomEvent('gmkb:component-renderer-ready', {
                    detail: {
                        renderer: window.enhancedComponentRenderer,
                        timestamp: Date.now(),
                        source: 'emergency-recovery'
                    }
                }));
                
                console.log('✅ EMERGENCY: Component renderer instance created and initialized');
            } catch (error) {
                console.error('❌ EMERGENCY: Failed to create component renderer instance:', error);
            }
        }
        
        // Emergency recovery for coordinator
        if (!results.coreSystemsCoordinator.instanceAvailable && results.coreSystemsCoordinator.classAvailable) {
            try {
                console.log('🚑 EMERGENCY: Creating missing coordinator instance...');
                window.coreSystemsCoordinator = new window.CoreSystemsCoordinator();
                console.log('✅ EMERGENCY: Coordinator instance created');
            } catch (error) {
                console.error('❌ EMERGENCY: Failed to create coordinator instance:', error);
            }
        }
    }
    
    // Start verification process
    function startVerification() {
        const verificationInterval = setInterval(() => {
            if (performSystemVerification() || verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
                clearInterval(verificationInterval);
                
                if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
                    console.error('❌ SYSTEM VERIFICATION: Max attempts reached - some issues may persist');
                    
                    // Final attempt to show what's working and what's not
                    console.log('📊 FINAL STATUS REPORT:');
                    console.log('- Enhanced Component Renderer:', window.enhancedComponentRenderer ? '✅' : '❌');
                    console.log('- Core Systems Coordinator:', window.coreSystemsCoordinator ? '✅' : '❌');
                    console.log('- Preview Container:', document.getElementById('media-kit-preview') ? '✅' : '❌');
                }
            }
        }, 1000);
    }
    
    // Wait a bit for all systems to load then start verification
    setTimeout(startVerification, 2000);
    
    // Add global debug function
    window.debugGMKBSystem = function() {
        console.log('🔍 GMKB SYSTEM DEBUG:');
        console.log('====================');
        performSystemVerification();
    };
    
    // Add global recovery function
    window.recoverGMKBSystem = function() {
        console.log('🚑 GMKB SYSTEM RECOVERY:');
        console.log('========================');
        verificationAttempts = 4; // Set to trigger emergency recovery on next attempt
        performSystemVerification();
    };
    
    console.log('✅ ROOT CAUSE FIX: System verification and recovery functions loaded');
    console.log('📋 Available commands: debugGMKBSystem(), recoverGMKBSystem()');
    
})();
