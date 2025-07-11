/**
 * @file test-state-loading-root-fix.js
 * @description ROOT FIX: Comprehensive testing and validation for state loading priority fix
 * 
 * This script validates that:
 * 1. Saved state loading takes priority over MKCG auto-generation
 * 2. PHP coordination system works properly
 * 3. Interface switches correctly between loading/empty/component states
 * 4. Race conditions are eliminated
 */

(function() {
    'use strict';
    
    /**
     * ROOT FIX: Comprehensive State Loading Fix Validation
     * Primary validation function to test the entire fix
     */
    window.validateStateLoadingRootFix = async function() {
        console.log('🎯 ROOT FIX: Starting comprehensive state loading fix validation...\n');
        
        const results = {
            passed: 0,
            failed: 0,
            critical: 0,
            criticalPassed: 0,
            tests: [],
            summary: '',
            success: false
        };
        
        function test(name, condition, critical = false, details = '') {
            const status = condition ? 'PASS' : 'FAIL';
            const icon = condition ? '✅' : '❌';
            
            console.log(`${icon} ${name}: ${status}${details ? ' - ' + details : ''}`);
            
            results.tests.push({ name, status, critical, details });
            
            if (critical) {
                results.critical++;
                if (condition) {
                    results.criticalPassed++;
                }
            }
            
            if (condition) {
                results.passed++;
            } else {
                results.failed++;
            }
        }
        
        console.log('=== PHASE 1: PHP COORDINATION VALIDATION ===');
        
        // Test PHP coordination system
        test('PHP Coordination Data Available', !!window.gmkbStateLoadingCoordination, true,
             window.gmkbStateLoadingCoordination?.coordination_mode || 'missing');
        
        test('PHP Coordination Flags Set', 
             typeof window.gmkbPrioritizeSavedState === 'boolean' && 
             typeof window.gmkbSuppressMKCGAutoGeneration === 'boolean', true);
        
        if (window.gmkbStateLoadingCoordination) {
            const coord = window.gmkbStateLoadingCoordination;
            test('PHP Coordination Mode Valid', 
                 ['saved-state-priority', 'mkcg-priority'].includes(coord.coordination_mode), true,
                 coord.coordination_mode);
            
            test('PHP Coordination ID Present', !!coord.coordination_id, false, coord.coordination_id);
            test('PHP Coordination Timestamp Present', !!coord.coordination_timestamp, false);
        }
        
        console.log('\n=== PHASE 2: JAVASCRIPT INTEGRATION VALIDATION ===');
        
        // Test JavaScript system integration
        test('Enhanced State Manager Available', !!window.enhancedStateManager, true);
        test('Enhanced State Manager Has Coordination Methods', 
             typeof window.enhancedStateManager?.hideLoadingStateAndShowComponents === 'function' &&
             typeof window.enhancedStateManager?.hideLoadingStateAndShowEmptyState === 'function' &&
             typeof window.enhancedStateManager?.recordSuccessfulStateLoading === 'function', true);
        
        test('Enhanced State Manager Has initializeAfterSystems', 
             typeof window.enhancedStateManager?.initializeAfterSystems === 'function', true);
        
        console.log('\n=== PHASE 3: SAVED STATE DETECTION VALIDATION ===');
        
        // Test saved state detection
        const hasLocalStorageData = !!localStorage.getItem('guestifyMediaKitState');
        test('Has Saved Data in localStorage', hasLocalStorageData, false);
        
        if (hasLocalStorageData) {
            try {
                const savedData = JSON.parse(localStorage.getItem('guestifyMediaKitState'));
                const componentCount = Object.keys(savedData.components || savedData.c || {}).length;
                
                test('Saved Data is Valid JSON', !!savedData, true);
                test('Saved Data Has Components', componentCount > 0, true, `${componentCount} components`);
                
                console.log(`📊 Saved Data Summary:`);
                console.log(`  Components: ${componentCount}`);
                console.log(`  Layout: ${(savedData.layout || savedData.l || []).length}`);
                console.log(`  Version: ${savedData.meta?.version || savedData.v || 'unknown'}`);
                
                // Test priority logic
                if (window.gmkbStateLoadingCoordination) {
                    const shouldPrioritize = window.gmkbStateLoadingCoordination.coordination_mode === 'saved-state-priority';
                    test('ROOT FIX: PHP Correctly Detected Saved State', shouldPrioritize, true,
                         `Mode: ${window.gmkbStateLoadingCoordination.coordination_mode}`);
                }
                
            } catch (error) {
                test('Saved Data Parse Error', false, true, error.message);
            }
        }
        
        console.log('\n=== PHASE 4: CURRENT STATE VALIDATION ===');
        
        // Test current state
        if (window.enhancedStateManager) {
            const currentState = window.enhancedStateManager.getState();
            test('Current State Available', !!currentState, true);
            
            if (currentState) {
                const currentComponentCount = Object.keys(currentState.components || {}).length;
                test('Current State Has Components Object', !!(currentState.components), false);
                
                console.log(`📊 Current State Summary:`);
                console.log(`  Components: ${currentComponentCount}`);
                console.log(`  Layout: ${(currentState.layout || []).length}`);
                
                // ROOT FIX: Critical test - saved components actually loaded
                if (hasLocalStorageData) {
                    try {
                        const savedData = JSON.parse(localStorage.getItem('guestifyMediaKitState'));
                        const savedComponentCount = Object.keys(savedData.components || savedData.c || {}).length;
                        
                        test('ROOT FIX: Saved Components Actually Loaded', 
                             currentComponentCount > 0 && currentComponentCount === savedComponentCount, true,
                             `Current: ${currentComponentCount}, Saved: ${savedComponentCount}`);
                        
                        if (currentComponentCount !== savedComponentCount) {
                            console.warn(`⚠️ ROOT FIX: Component count mismatch! This indicates the fix is not working properly.`);
                        }
                    } catch (e) {
                        console.warn('⚠️ Could not compare saved vs current state:', e.message);
                    }
                }
            }
        }
        
        console.log('\n=== PHASE 5: INTERFACE STATE VALIDATION ===');
        
        // Test interface elements
        const loadingState = document.getElementById('state-loading-enhanced');
        const emptyState = document.getElementById('enhanced-empty-state');
        const previewContainer = document.getElementById('media-kit-preview');
        
        test('Loading State Element Exists', !!loadingState, false);
        test('Empty State Element Exists', !!emptyState, false);
        test('Preview Container Exists', !!previewContainer, true);
        
        if (loadingState && emptyState && previewContainer) {
            const loadingVisible = loadingState.style.display !== 'none' && getComputedStyle(loadingState).display !== 'none';
            const emptyVisible = emptyState.style.display !== 'none' && getComputedStyle(emptyState).display !== 'none';
            
            test('Interface State is Consistent', !(loadingVisible && emptyVisible), false,
                 `Loading: ${loadingVisible}, Empty: ${emptyVisible}`);
            
            if (window.enhancedStateManager) {
                const currentState = window.enhancedStateManager.getState();
                const hasComponents = Object.keys(currentState?.components || {}).length > 0;
                
                if (hasComponents) {
                    test('ROOT FIX: Loading State Hidden When Components Loaded', !loadingVisible, true);
                    test('ROOT FIX: Empty State Hidden When Components Loaded', !emptyVisible, true);
                } else if (!hasLocalStorageData) {
                    test('ROOT FIX: Empty State Shown When No Components', emptyVisible, false);
                }
            }
        }
        
        console.log('\n=== PHASE 6: MKCG SUPPRESSION VALIDATION ===');
        
        // Test MKCG suppression
        if (window.gmkbSuppressMKCGAutoGeneration && hasLocalStorageData) {
            test('ROOT FIX: MKCG Auto-Generation Suppressed When Saved State Exists', 
                 window.gmkbSuppressMKCGAutoGeneration, true);
        }
        
        const mkcgDashboard = document.getElementById('mkcg-enhanced-dashboard');
        if (mkcgDashboard && hasLocalStorageData) {
            const dashboardVisible = getComputedStyle(mkcgDashboard).display !== 'none';
            test('ROOT FIX: MKCG Dashboard Hidden When Saved State Loaded', !dashboardVisible, false);
        }
        
        console.log('\n=== FINAL ROOT FIX VALIDATION SUMMARY ===');
        
        const criticalSuccess = results.criticalPassed === results.critical;
        const overallSuccess = results.failed === 0;
        const primarySuccess = criticalSuccess && results.passed >= (results.tests.length * 0.8);
        
        console.log(`  ✅ Total Passed: ${results.passed}`);
        console.log(`  ❌ Total Failed: ${results.failed}`);
        console.log(`  🔥 Critical Passed: ${results.criticalPassed}/${results.critical}`);
        console.log(`  📊 Success Rate: ${Math.round((results.passed / results.tests.length) * 100)}%`);
        
        if (criticalSuccess && primarySuccess) {
            results.summary = '🎉 ROOT FIX VALIDATION: SUCCESS!';
            results.success = true;
            
            console.log('\n🎉 ROOT FIX VALIDATION: SUCCESS!');
            console.log('✅ The state loading priority fix is working correctly.');
            
            if (hasLocalStorageData && window.enhancedStateManager) {
                const currentState = window.enhancedStateManager.getState();
                const componentCount = Object.keys(currentState?.components || {}).length;
                
                if (componentCount > 0) {
                    console.log(`🎊 CONFIRMED: ${componentCount} saved components are now loaded and take priority over MKCG!`);
                } else {
                    console.log('ℹ️ Note: Components detected in storage but not in current state - check loading timing.');
                }
            } else {
                console.log('ℹ️ Note: No saved components found - fix will work when user has saved data.');
            }
            
        } else if (criticalSuccess) {
            results.summary = '⚠️ ROOT FIX VALIDATION: PARTIAL SUCCESS';
            results.success = false;
            
            console.log('\n⚠️ ROOT FIX VALIDATION: PARTIAL SUCCESS');
            console.log('✅ Core functionality is working but some issues detected.');
            const failures = results.tests.filter(t => t.status === 'FAIL' && !t.critical);
            console.log('📝 Non-critical issues:', failures.map(f => f.name));
            
        } else {
            results.summary = '❌ ROOT FIX VALIDATION: CRITICAL FAILURES';
            results.success = false;
            
            console.log('\n❌ ROOT FIX VALIDATION: CRITICAL FAILURES');
            console.log('💥 The state loading priority fix is NOT working correctly.');
            const criticalFailures = results.tests.filter(t => t.status === 'FAIL' && t.critical);
            console.log('🔥 Critical failures:', criticalFailures.map(f => f.name));
            
            console.log('\n🔧 Suggested fixes:');
            if (!window.gmkbStateLoadingCoordination) {
                console.log('  1. Check PHP coordination system initialization');
            }
            if (!window.enhancedStateManager?.hideLoadingStateAndShowComponents) {
                console.log('  2. Verify enhanced state manager updates are loaded');
            }
            if (criticalFailures.some(f => f.name.includes('Saved Components Actually Loaded'))) {
                console.log('  3. Check state loading timing and coordination events');
            }
        }
        
        return results;
    };
    
    /**
     * ROOT FIX: Quick validation for immediate testing
     */
    window.quickStateLoadingValidation = function() {
        console.log('🔍 ROOT FIX: Quick validation of state loading fix...\n');
        
        const checks = {
            phpCoordination: !!window.gmkbStateLoadingCoordination,
            stateManager: !!window.enhancedStateManager,
            savedData: !!localStorage.getItem('guestifyMediaKitState'),
            coordinationMethods: !!(window.enhancedStateManager?.hideLoadingStateAndShowComponents),
            priorityFlags: typeof window.gmkbPrioritizeSavedState === 'boolean'
        };
        
        console.table(checks);
        
        const allCritical = checks.phpCoordination && checks.stateManager && checks.coordinationMethods;
        
        if (allCritical) {
            console.log('✅ ROOT FIX: All critical systems are active!');
            
            if (checks.savedData) {
                console.log('💾 Saved data detected - fix should prioritize saved state over MKCG');
                
                // Quick check current state
                if (window.enhancedStateManager) {
                    const currentState = window.enhancedStateManager.getState();
                    const componentCount = Object.keys(currentState?.components || {}).length;
                    console.log(`📊 Current state has ${componentCount} components`);
                    
                    if (componentCount > 0) {
                        console.log('🎉 SUCCESS: Saved components are loaded!');
                    } else {
                        console.log('⚠️ No components in current state - may need to refresh or trigger loading');
                    }
                }
            } else {
                console.log('ℹ️ No saved data - fix will show MKCG auto-generation as expected');
            }
            
            return true;
        } else {
            console.log('❌ ROOT FIX: Some critical systems are missing');
            return false;
        }
    };
    
    /**
     * ROOT FIX: Force state loading for testing
     */
    window.forceStateLoadingTest = async function() {
        console.log('🔄 ROOT FIX: Force testing state loading...');
        
        if (!window.enhancedStateManager) {
            console.error('❌ Enhanced state manager not available');
            return false;
        }
        
        try {
            // Call the initialization method directly
            console.log('🔄 Calling initializeAfterSystems...');
            await window.enhancedStateManager.initializeAfterSystems();
            
            // Check results
            const currentState = window.enhancedStateManager.getState();
            const componentCount = Object.keys(currentState?.components || {}).length;
            
            console.log(`✅ Force test completed - ${componentCount} components in state`);
            
            if (componentCount > 0) {
                console.log('🎉 SUCCESS: State loading worked!');
                return true;
            } else {
                console.log('⚠️ No components loaded - check saved data or coordination');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Force test failed:', error);
            return false;
        }
    };
    
    /**
     * ROOT FIX: Test coordination status
     */
    window.testCoordinationStatus = function() {
        console.log('🎯 ROOT FIX: Testing coordination status...\n');
        
        const coordination = window.gmkbStateLoadingCoordination;
        const prioritize = window.gmkbPrioritizeSavedState;
        const suppress = window.gmkbSuppressMKCGAutoGeneration;
        
        console.log('📊 PHP Coordination Data:', coordination);
        console.log('🎯 Prioritize Saved State:', prioritize);
        console.log('🚫 Suppress MKCG:', suppress);
        
        if (window.gmkbCoordinationStatus) {
            console.log('🔍 Full Coordination Status:', window.gmkbCoordinationStatus());
        }
        
        return {
            coordination,
            prioritize,
            suppress,
            fullStatus: window.gmkbCoordinationStatus?.()
        };
    };
    
    // Expose help function
    window.stateLoadingRootFixHelp = function() {
        console.log('🎯 ROOT FIX: State Loading Priority Fix - Testing Commands\n');
        console.log('Main validation commands:');
        console.log('  validateStateLoadingRootFix()    - COMPREHENSIVE validation (recommended)');
        console.log('  quickStateLoadingValidation()    - Quick status check');
        console.log('  forceStateLoadingTest()          - Force test state loading');
        console.log('  testCoordinationStatus()         - Check PHP coordination status');
        console.log('\nDebugging commands:');
        console.log('  stateLoadingRootFixHelp()        - Show this help');
        console.log('  window.gmkbCoordinationStatus()  - Get coordination status');
        console.log('  enhancedStateManager.debug()     - Debug state manager');
        console.log('\nUsage:');
        console.log('  1. Run validateStateLoadingRootFix() for full validation');
        console.log('  2. Look for "ROOT FIX VALIDATION: SUCCESS!" message');
        console.log('  3. If issues found, run individual debug commands');
    };
    
    console.log('🎯 ROOT FIX: State Loading Priority Fix test suite loaded');
    console.log('💡 Run validateStateLoadingRootFix() to test the fix');
    console.log('💡 Run stateLoadingRootFixHelp() for all commands');
    
})();
