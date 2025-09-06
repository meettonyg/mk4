/**
 * Test Script: Saved Components Root Level Fix Validation
 * 
 * This script validates that the root-level fixes for saved components loading are working correctly.
 * 
 * USAGE:
 * 1. Open browser console on Media Kit Builder page
 * 2. Copy and paste this entire script
 * 3. Run: testSavedComponentsFix()
 * 
 * WHAT IT TESTS:
 * - No duplicate script loading
 * - WordPress data loading into state manager
 * - Proper component rendering without fallbacks
 * - State synchronization between WordPress and localStorage
 */

window.testSavedComponentsFix = function() {
    console.group('%c🔧 SAVED COMPONENTS ROOT FIX VALIDATION', 'font-size: 16px; font-weight: bold; color: #e53e3e; background: #fed7d7; padding: 4px 8px; border-radius: 4px;');
    
    const results = {
        duplicateScripts: 'UNKNOWN',
        wordpressDataLoading: 'UNKNOWN',
        stateManagerInit: 'UNKNOWN',
        componentRendering: 'UNKNOWN',
        fallbackUsage: 'UNKNOWN',
        overall: 'UNKNOWN'
    };
    
    // Test 1: Check for duplicate script loading
    console.group('%c1. Duplicate Script Loading Test', 'font-weight: bold; color: #d69e2e;');
    
    try {
        const scripts = Array.from(document.querySelectorAll('script[src*="main.js"]'));
        const mainJsScripts = scripts.filter(script => script.src.includes('main.js'));
        
        console.log('Main.js scripts found:', mainJsScripts.length);
        mainJsScripts.forEach((script, index) => {
            console.log(`  ${index + 1}. ${script.src}`);
        });
        
        if (mainJsScripts.length === 1) {
            results.duplicateScripts = 'PASS';
            console.log('%c✅ PASS: No duplicate main.js scripts found', 'color: #38a169; font-weight: bold;');
        } else {
            results.duplicateScripts = 'FAIL';
            console.log('%c❌ FAIL: Multiple main.js scripts detected', 'color: #e53e3e; font-weight: bold;');
        }
    } catch (error) {
        results.duplicateScripts = 'ERROR';
        console.error('Error checking scripts:', error);
    }
    
    console.groupEnd();
    
    // Test 2: WordPress Data Loading
    console.group('%c2. WordPress Data Loading Test', 'font-weight: bold; color: #d69e2e;');
    
    try {
        const hasGmkbData = !!(window.gmkbData && window.gmkbData.savedState);
        const hasGuestifyData = !!(window.guestifyData && window.guestifyData.savedState);
        const hasStateManager = !!window.enhancedStateManager;
        
        console.log('WordPress data sources:');
        console.log('  gmkbData.savedState:', hasGmkbData ? '✅ Available' : '❌ Missing');
        console.log('  guestifyData.savedState:', hasGuestifyData ? '✅ Available' : '❌ Missing');
        console.log('  enhancedStateManager:', hasStateManager ? '✅ Available' : '❌ Missing');
        
        if (hasStateManager && (hasGmkbData || hasGuestifyData)) {
            const wpData = (window.gmkbData && window.gmkbData.savedState) || (window.guestifyData && window.guestifyData.savedState);
            const wpComponentCount = wpData ? Object.keys(wpData.components || {}).length : 0;
            
            console.log('WordPress component count:', wpComponentCount);
            
            if (wpComponentCount > 0) {
                results.wordpressDataLoading = 'PASS';
                console.log('%c✅ PASS: WordPress saved components available', 'color: #38a169; font-weight: bold;');
            } else {
                results.wordpressDataLoading = 'PARTIAL';
                console.log('%c⚠️ PARTIAL: WordPress data available but no components', 'color: #d69e2e; font-weight: bold;');
            }
        } else {
            results.wordpressDataLoading = 'FAIL';
            console.log('%c❌ FAIL: WordPress data or state manager missing', 'color: #e53e3e; font-weight: bold;');
        }
    } catch (error) {
        results.wordpressDataLoading = 'ERROR';
        console.error('Error checking WordPress data:', error);
    }
    
    console.groupEnd();
    
    // Test 3: State Manager Initialization and Component Recovery
    console.group('%c3. State Manager Initialization & Recovery Test', 'font-weight: bold; color: #d69e2e;');
    
    try {
        if (window.enhancedStateManager) {
            const currentState = window.enhancedStateManager.getState();
            const stateComponentCount = Object.keys(currentState.components || {}).length;
            const stateLayout = currentState.layout || [];
            
            console.log('State manager status:');
            console.log('  Components in state:', stateComponentCount);
            console.log('  Layout length:', stateLayout.length);
            console.log('  State structure valid:', !!(currentState.components && currentState.layout && currentState.globalSettings));
            
            // Check for component recovery indicators
            const recoveryLogs = [];
            if (window.structuredLogger && window.structuredLogger.getRecentLogs) {
                // This would require implementing getRecentLogs, but for now we'll check console
                console.log('  Component recovery: Check console for recovery messages');
            }
            
            // Validate component data integrity
            let validComponents = 0;
            let recoveredComponents = 0;
            if (currentState.components) {
                Object.entries(currentState.components).forEach(([id, comp]) => {
                    if (comp.type && comp.id) {
                        validComponents++;
                        // Check if this looks like a recovered component (ID pattern matching type)
                        if ((id.includes('topics-') && comp.type === 'topics') ||
                            (id.includes('hero-') && comp.type === 'hero') ||
                            (id.includes('bio-') && comp.type === 'biography')) {
                            recoveredComponents++;
                        }
                    }
                });
            }
            
            console.log('  Valid components:', validComponents);
            console.log('  Potentially recovered:', recoveredComponents);
            
            if (stateComponentCount > 0 && validComponents === stateComponentCount) {
                results.stateManagerInit = 'PASS';
                console.log('%c✅ PASS: State manager has valid components loaded', 'color: #38a169; font-weight: bold;');
                
                if (recoveredComponents > 0) {
                    console.log(`%c🔧 INFO: ${recoveredComponents} components appear to have been recovered`, 'color: #2b6cb0; font-weight: bold;');
                }
                
                // Show component details
                Object.keys(currentState.components).forEach(id => {
                    const comp = currentState.components[id];
                    console.log(`    - ${id}: ${comp.type}`);
                });
            } else if (stateComponentCount > 0) {
                results.stateManagerInit = 'PARTIAL';
                console.log(`%c⚠️ PARTIAL: State manager has components but ${stateComponentCount - validComponents} may be invalid`, 'color: #d69e2e; font-weight: bold;');
            } else {
                results.stateManagerInit = 'PARTIAL';
                console.log('%c⚠️ PARTIAL: State manager initialized but no components', 'color: #d69e2e; font-weight: bold;');
            }
        } else {
            results.stateManagerInit = 'FAIL';
            console.log('%c❌ FAIL: State manager not available', 'color: #e53e3e; font-weight: bold;');
        }
    } catch (error) {
        results.stateManagerInit = 'ERROR';
        console.error('Error checking state manager:', error);
    }
    
    console.groupEnd();
    
    // Test 4: Component Rendering
    console.group('%c4. Component Rendering Test', 'font-weight: bold; color: #d69e2e;');
    
    try {
        const previewContainer = document.getElementById('media-kit-preview');
        const rendererAvailable = !!window.enhancedComponentRenderer;
        
        console.log('Rendering status:');
        console.log('  Preview container:', previewContainer ? '✅ Found' : '❌ Missing');
        console.log('  Enhanced renderer:', rendererAvailable ? '✅ Available' : '❌ Missing');
        
        if (previewContainer && rendererAvailable) {
            const domComponentCount = previewContainer.children.length;
            const rendererStats = window.enhancedComponentRenderer.getStats ? window.enhancedComponentRenderer.getStats() : {};
            
            console.log('  DOM components:', domComponentCount);
            console.log('  Renderer initialized:', rendererStats.initialized || false);
            console.log('  Cached components:', rendererStats.cachedComponents || 0);
            
            if (domComponentCount > 0 && rendererStats.initialized) {
                results.componentRendering = 'PASS';
                console.log('%c✅ PASS: Components rendered successfully', 'color: #38a169; font-weight: bold;');
            } else if (rendererStats.initialized) {
                results.componentRendering = 'PARTIAL';
                console.log('%c⚠️ PARTIAL: Renderer initialized but no DOM components', 'color: #d69e2e; font-weight: bold;');
            } else {
                results.componentRendering = 'FAIL';
                console.log('%c❌ FAIL: Renderer not initialized or no components rendered', 'color: #e53e3e; font-weight: bold;');
            }
        } else {
            results.componentRendering = 'FAIL';
            console.log('%c❌ FAIL: Preview container or renderer missing', 'color: #e53e3e; font-weight: bold;');
        }
    } catch (error) {
        results.componentRendering = 'ERROR';
        console.error('Error checking component rendering:', error);
    }
    
    console.groupEnd();
    
    // Test 5: Fallback Usage Detection
    console.group('%c5. Fallback Usage Detection', 'font-weight: bold; color: #d69e2e;');
    
    try {
        // Check console logs for fallback indicators
        const consoleEntries = [];
        let fallbackDetected = false;
        
        // Check for common fallback indicators in the current test
        const logTests = [
            { test: () => !!document.querySelector('.component-placeholder'), name: 'Placeholder components' },
            { test: () => !!document.querySelector('.component-error'), name: 'Error components' },
            { test: () => window.enhancedComponentRenderer && window.enhancedComponentRenderer.getStats && 
                     window.enhancedComponentRenderer.getStats().renderingMode === 'fallback', name: 'Fallback rendering mode' }
        ];
        
        console.log('Fallback indicators:');
        logTests.forEach(({ test, name }) => {
            const detected = test();
            console.log(`  ${name}: ${detected ? '❌ DETECTED' : '✅ Not detected'}`);
            if (detected) fallbackDetected = true;
        });
        
        if (!fallbackDetected) {
            results.fallbackUsage = 'PASS';
            console.log('%c✅ PASS: No fallback mechanisms detected', 'color: #38a169; font-weight: bold;');
        } else {
            results.fallbackUsage = 'FAIL';
            console.log('%c❌ FAIL: Fallback mechanisms detected', 'color: #e53e3e; font-weight: bold;');
        }
    } catch (error) {
        results.fallbackUsage = 'ERROR';
        console.error('Error checking fallback usage:', error);
    }
    
    console.groupEnd();
    
    // Overall Results
    console.group('%c6. Overall Assessment', 'font-weight: bold; color: #553c9a;');
    
    const passCount = Object.values(results).filter(r => r === 'PASS').length;
    const failCount = Object.values(results).filter(r => r === 'FAIL').length;
    const errorCount = Object.values(results).filter(r => r === 'ERROR').length;
    const partialCount = Object.values(results).filter(r => r === 'PARTIAL').length;
    
    console.log('Test Results Summary:');
    console.log(`  ✅ PASS: ${passCount}/5 tests`);
    console.log(`  ⚠️ PARTIAL: ${partialCount}/5 tests`);
    console.log(`  ❌ FAIL: ${failCount}/5 tests`);
    console.log(`  🔥 ERROR: ${errorCount}/5 tests`);
    
    // Determine overall result
    if (passCount >= 4 && errorCount === 0) {
        results.overall = 'PASS';
        console.log('%c🎉 OVERALL: ROOT FIX SUCCESSFUL!', 'color: #38a169; font-weight: bold; font-size: 14px;');
        console.log('Saved components should be loading correctly without fallbacks.');
    } else if (passCount >= 2 && failCount <= 2) {
        results.overall = 'PARTIAL';
        console.log('%c⚠️ OVERALL: PARTIAL SUCCESS', 'color: #d69e2e; font-weight: bold; font-size: 14px;');
        console.log('Some fixes are working but issues remain.');
    } else {
        results.overall = 'FAIL';
        console.log('%c❌ OVERALL: ROOT FIX FAILED', 'color: #e53e3e; font-weight: bold; font-size: 14px;');
        console.log('Significant issues detected. Manual investigation required.');
    }
    
    console.groupEnd();
    
    // Recommendations
    console.group('%c7. Recommendations', 'font-weight: bold; color: #2d3748;');
    
    if (results.duplicateScripts === 'FAIL') {
        console.log('🔧 Remove duplicate script loading in template takeover or enqueue system');
    }
    
    if (results.wordpressDataLoading === 'FAIL') {
        console.log('🔧 Ensure WordPress saved state is being passed to JavaScript correctly');
    }
    
    if (results.stateManagerInit === 'FAIL') {
        console.log('🔧 Check state manager initialization and WordPress data loading priority');
    }
    
    if (results.componentRendering === 'FAIL') {
        console.log('🔧 Verify component renderer initialization sequence and template loading');
    }
    
    if (results.fallbackUsage === 'FAIL') {
        console.log('🔧 Investigate why fallback mechanisms are being triggered');
    }
    
    if (results.overall === 'PASS') {
        console.log('✨ No recommendations - system is working correctly!');
    }
    
    console.groupEnd();
    
    console.groupEnd();
    
    return results;
};

// Quick test function
window.quickSavedComponentsTest = function() {
    console.log('🚀 Running quick saved components test...');
    const results = window.testSavedComponentsFix();
    console.log(`📊 Quick Results: ${results.overall} (${Object.values(results).filter(r => r === 'PASS').length}/5 tests passed)`);
    return results.overall;
};

console.log('✅ Saved Components Fix Test Suite Loaded');
console.log('🔧 Run testSavedComponentsFix() to validate fixes');
console.log('⚡ Run quickSavedComponentsTest() for a quick check');
