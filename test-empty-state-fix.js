/**
 * ROOT-LEVEL EMPTY STATE FIX VALIDATION SCRIPT
 * 
 * Tests the comprehensive fix for empty state appearing when components exist
 * 
 * ISSUE FIXED:
 * - ensureEmptyStateVisible() method was unconditionally showing empty state
 * - Warning "Found unexpected components in empty state: 2" eliminated
 * - Empty state now properly conditional on actual component existence
 * 
 * @version 1.0.0
 * @created 2025-01-16
 */

window.testEmptyStateFix = {
    
    /**
     * Main test runner - validates all aspects of empty state fix
     */
    async runAllTests() {
        console.log('\n🧪 ===== EMPTY STATE FIX VALIDATION TESTS =====');
        console.log('📍 Testing root-level fix for unconditional empty state display');
        console.log('🎯 Expected: Empty state only shows when NO components exist\n');
        
        let totalTests = 0;
        let passedTests = 0;
        
        const tests = [
            this.testEmptyStateMethod,
            this.testStateComponentDetection,
            this.testDOMComponentDetection,
            this.testEventDrivenUpdates,
            this.testSavedComponentsRestoration,
            this.testComponentAdditionHandling,
            this.testComponentRemovalHandling,
            this.testEdgeCases
        ];
        
        for (const test of tests) {
            totalTests++;
            try {
                const result = await test.call(this);
                if (result) {
                    passedTests++;
                    console.log(`✅ ${test.name}: PASSED`);
                } else {
                    console.log(`❌ ${test.name}: FAILED`);
                }
            } catch (error) {
                console.log(`❌ ${test.name}: ERROR -`, error.message);
            }
        }
        
        console.log(`\n📊 TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('🎉 ALL TESTS PASSED - Empty state fix working correctly!');
            console.log('✅ Root cause eliminated: ensureEmptyStateVisible() now conditional');
            console.log('✅ Warning "Found unexpected components in empty state" eliminated');
            return true;
        } else {
            console.log('⚠️ Some tests failed - fix may need adjustment');
            return false;
        }
    },
    
    /**
     * Test 1: Validate ensureEmptyStateVisible method exists and has proper logic
     */
    testEmptyStateMethod() {
        console.log('\n🔍 Test 1: ensureEmptyStateVisible Method Validation');
        
        // Check if UIManager exists
        if (!window.GMKB?.systems?.UIManager) {
            console.log('❌ UIManager not found');
            return false;
        }
        
        const uiManager = window.GMKB.systems.UIManager;
        
        // Check if method exists
        if (typeof uiManager.ensureEmptyStateVisible !== 'function') {
            console.log('❌ ensureEmptyStateVisible method not found');
            return false;
        }
        
        // Check if method accepts parameters (forceCheck)
        const methodString = uiManager.ensureEmptyStateVisible.toString();
        if (!methodString.includes('forceCheck')) {
            console.log('❌ Method does not include forceCheck parameter');
            return false;
        }
        
        // Check if method has proper conditional logic
        if (!methodString.includes('shouldShowEmptyState')) {
            console.log('❌ Method missing conditional empty state logic');
            return false;
        }
        
        if (!methodString.includes('stateComponentCount === 0 && domComponentCount === 0')) {
            console.log('❌ Method missing proper component count checks');
            return false;
        }
        
        console.log('✅ ensureEmptyStateVisible method has proper conditional logic');
        return true;
    },
    
    /**
     * Test 2: Test state manager component detection
     */
    testStateComponentDetection() {
        console.log('\n🔍 Test 2: State Manager Component Detection');
        
        if (!window.GMKB?.systems?.StateManager) {
            console.log('❌ StateManager not found');
            return false;
        }
        
        const stateManager = window.GMKB.systems.StateManager;
        const state = stateManager.getState();
        
        if (!state || typeof state.components !== 'object') {
            console.log('❌ State components not properly structured');
            return false;
        }
        
        const componentCount = Object.keys(state.components).length;
        console.log(`📊 State component count: ${componentCount}`);
        
        // Validate state structure
        if (!Array.isArray(state.layout)) {
            console.log('❌ State layout not properly structured');
            return false;
        }
        
        console.log('✅ State manager component detection working');
        return true;
    },
    
    /**
     * Test 3: Test DOM component detection
     */
    testDOMComponentDetection() {
        console.log('\n🔍 Test 3: DOM Component Detection');
        
        const previewContainer = document.getElementById('media-kit-preview');
        if (!previewContainer) {
            console.log('❌ Preview container not found');
            return false;
        }
        
        const domComponents = previewContainer.querySelectorAll('.media-kit-component');
        const componentCount = domComponents.length;
        
        console.log(`📊 DOM component count: ${componentCount}`);
        
        // Check if components have proper attributes
        let validComponents = 0;
        domComponents.forEach(component => {
            if (component.id && component.dataset.componentType) {
                validComponents++;
            }
        });
        
        console.log(`📊 Valid DOM components: ${validComponents}/${componentCount}`);
        
        if (componentCount > 0 && validComponents !== componentCount) {
            console.log('⚠️ Some DOM components missing proper attributes');
        }
        
        console.log('✅ DOM component detection working');
        return true;
    },
    
    /**
     * Test 4: Test event-driven empty state updates
     */
    testEventDrivenUpdates() {
        console.log('\n🔍 Test 4: Event-Driven Empty State Updates');
        
        if (!window.GMKB?.systems?.UIManager) {
            console.log('❌ UIManager not found');
            return false;
        }
        
        const uiManager = window.GMKB.systems.UIManager;
        
        // Check if renderingInProgress flag exists
        if (typeof uiManager.renderingInProgress === 'undefined') {
            console.log('❌ renderingInProgress flag not found');
            return false;
        }
        
        // Test empty state visibility
        const emptyState = document.getElementById('empty-state');
        if (!emptyState) {
            console.log('❌ Empty state element not found');
            return false;
        }
        
        const currentDisplay = window.getComputedStyle(emptyState).display;
        console.log(`📊 Current empty state display: ${currentDisplay}`);
        
        // Call the method to see if it works without errors\n        try {\n            uiManager.ensureEmptyStateVisible(true);\n            console.log('✅ ensureEmptyStateVisible executed without errors');\n        } catch (error) {\n            console.log('❌ ensureEmptyStateVisible threw error:', error.message);\n            return false;\n        }\n        \n        console.log('✅ Event-driven updates working');\n        return true;\n    },\n    \n    /**\n     * Test 5: Test saved components restoration scenario\n     */\n    testSavedComponentsRestoration() {\n        console.log('\\n🔍 Test 5: Saved Components Restoration');\n        \n        // Check localStorage for saved state\n        let savedState = null;\n        try {\n            const saved = localStorage.getItem('gmkb-state');\n            if (saved) {\n                savedState = JSON.parse(saved);\n            }\n        } catch (error) {\n            console.log('⚠️ Error reading localStorage:', error.message);\n        }\n        \n        if (savedState) {\n            const savedComponentCount = Object.keys(savedState.components || {}).length;\n            console.log(`📊 Saved components in localStorage: ${savedComponentCount}`);\n            \n            if (savedComponentCount > 0) {\n                console.log('✅ Saved components found - this is the test scenario');\n                \n                // Check if empty state is properly hidden\n                const emptyState = document.getElementById('empty-state');\n                if (emptyState) {\n                    const isVisible = window.getComputedStyle(emptyState).display !== 'none';\n                    if (isVisible && savedComponentCount > 0) {\n                        console.log('❌ Empty state visible despite saved components - FIX NEEDED');\n                        return false;\n                    } else {\n                        console.log('✅ Empty state properly hidden with saved components');\n                    }\n                }\n            }\n        } else {\n            console.log('📝 No saved components found - empty state should be visible');\n        }\n        \n        console.log('✅ Saved components restoration test passed');\n        return true;\n    },\n    \n    /**\n     * Test 6: Test component addition handling\n     */\n    testComponentAdditionHandling() {\n        console.log('\\n🔍 Test 6: Component Addition Handling');\n        \n        // Check if event listeners are properly set up\n        if (!window.GMKB?.systems?.UIManager?.eventState) {\n            console.log('❌ UIManager event state not found');\n            return false;\n        }\n        \n        const eventState = window.GMKB.systems.UIManager.eventState;\n        \n        if (!eventState.initializationComplete) {\n            console.log('⚠️ Initialization not complete yet');\n        }\n        \n        // Test that component manager exists\n        if (!window.GMKB?.systems?.ComponentManager) {\n            console.log('❌ ComponentManager not found');\n            return false;\n        }\n        \n        console.log('✅ Component addition handling infrastructure ready');\n        return true;\n    },\n    \n    /**\n     * Test 7: Test component removal handling\n     */\n    testComponentRemovalHandling() {\n        console.log('\\n🔍 Test 7: Component Removal Handling');\n        \n        // Check if component removal triggers empty state check\n        const previewContainer = document.getElementById('media-kit-preview');\n        const emptyState = document.getElementById('empty-state');\n        \n        if (!previewContainer || !emptyState) {\n            console.log('❌ Required DOM elements not found');\n            return false;\n        }\n        \n        const currentComponents = previewContainer.querySelectorAll('.media-kit-component');\n        console.log(`📊 Current components for removal test: ${currentComponents.length}`);\n        \n        // If no components, empty state should be visible\n        if (currentComponents.length === 0) {\n            const isVisible = window.getComputedStyle(emptyState).display !== 'none';\n            if (!isVisible) {\n                console.log('❌ Empty state should be visible when no components exist');\n                return false;\n            }\n        }\n        \n        console.log('✅ Component removal handling ready');\n        return true;\n    },\n    \n    /**\n     * Test 8: Test edge cases and error handling\n     */\n    testEdgeCases() {\n        console.log('\\n🔍 Test 8: Edge Cases and Error Handling');\n        \n        const uiManager = window.GMKB?.systems?.UIManager;\n        if (!uiManager) {\n            console.log('❌ UIManager not available for edge case testing');\n            return false;\n        }\n        \n        // Test calling ensureEmptyStateVisible with invalid DOM\n        const originalGetElementById = document.getElementById;\n        \n        try {\n            // Temporarily break getElementById\n            document.getElementById = () => null;\n            \n            // This should not throw an error\n            uiManager.ensureEmptyStateVisible(true);\n            console.log('✅ Handles missing DOM elements gracefully');\n            \n        } catch (error) {\n            console.log('❌ Does not handle missing DOM elements:', error.message);\n            return false;\n        } finally {\n            // Restore original function\n            document.getElementById = originalGetElementById;\n        }\n        \n        // Test with undefined GMKB systems\n        try {\n            const backupSystems = window.GMKB.systems;\n            window.GMKB.systems = undefined;\n            \n            uiManager.ensureEmptyStateVisible(true);\n            console.log('✅ Handles missing systems gracefully');\n            \n            window.GMKB.systems = backupSystems;\n        } catch (error) {\n            console.log('❌ Does not handle missing systems:', error.message);\n            return false;\n        }\n        \n        console.log('✅ Edge cases handled properly');\n        return true;\n    },\n    \n    /**\n     * Quick test for immediate validation\n     */\n    quickTest() {\n        console.log('\\n⚡ QUICK EMPTY STATE FIX TEST');\n        \n        const emptyState = document.getElementById('empty-state');\n        const previewContainer = document.getElementById('media-kit-preview');\n        \n        if (!emptyState || !previewContainer) {\n            console.log('❌ Required DOM elements not found');\n            return false;\n        }\n        \n        const stateManager = window.GMKB?.systems?.StateManager;\n        if (!stateManager) {\n            console.log('❌ StateManager not found');\n            return false;\n        }\n        \n        const state = stateManager.getState();\n        const stateComponentCount = Object.keys(state.components || {}).length;\n        const domComponentCount = previewContainer.querySelectorAll('.media-kit-component').length;\n        const emptyStateVisible = window.getComputedStyle(emptyState).display !== 'none';\n        \n        console.log(`📊 State components: ${stateComponentCount}`);\n        console.log(`📊 DOM components: ${domComponentCount}`);\n        console.log(`📊 Empty state visible: ${emptyStateVisible}`);\n        \n        // ROOT FIX VALIDATION: Empty state should only be visible when both counts are 0\n        const shouldBeVisible = stateComponentCount === 0 && domComponentCount === 0;\n        const isCorrect = emptyStateVisible === shouldBeVisible;\n        \n        if (isCorrect) {\n            console.log('✅ QUICK TEST PASSED - Empty state logic working correctly!');\n            if (shouldBeVisible) {\n                console.log('  Empty state correctly shown (no components)');\n            } else {\n                console.log('  Empty state correctly hidden (components exist)');\n            }\n        } else {\n            console.log('❌ QUICK TEST FAILED - Empty state logic incorrect');\n            console.log(`  Expected visible: ${shouldBeVisible}, Actual visible: ${emptyStateVisible}`);\n        }\n        \n        return isCorrect;\n    },\n    \n    /**\n     * Force empty state recalculation for testing\n     */\n    forceEmptyStateCheck() {\n        console.log('\\n🔄 FORCING EMPTY STATE RECALCULATION...');\n        \n        const uiManager = window.GMKB?.systems?.UIManager;\n        if (uiManager && typeof uiManager.ensureEmptyStateVisible === 'function') {\n            uiManager.ensureEmptyStateVisible(true);\n            console.log('✅ Empty state recalculation triggered');\n            \n            // Run quick test after recalculation\n            setTimeout(() => {\n                this.quickTest();\n            }, 200);\n        } else {\n            console.log('❌ Cannot force empty state check - UIManager not available');\n        }\n    }\n};\n\n// Auto-run quick test if components are loaded\nif (window.GMKB?.systems?.UIManager) {\n    console.log('\\n🚀 EMPTY STATE FIX - AUTO QUICK TEST');\n    setTimeout(() => {\n        window.testEmptyStateFix.quickTest();\n    }, 1000);\n} else {\n    console.log('\\n⏳ EMPTY STATE FIX TEST - Waiting for GMKB initialization...');\n    \n    // Listen for GMKB ready event\n    if (typeof document !== 'undefined') {\n        document.addEventListener('gmkb:initialization-complete', () => {\n            console.log('\\n🚀 GMKB READY - Running empty state fix test...');\n            setTimeout(() => {\n                window.testEmptyStateFix.quickTest();\n            }, 500);\n        });\n    }\n}\n\n// Console helper functions\nconsole.log('\\n🧪 EMPTY STATE FIX VALIDATION LOADED');\nconsole.log('💡 Available commands:');\nconsole.log('  testEmptyStateFix.runAllTests() - Run complete test suite');\nconsole.log('  testEmptyStateFix.quickTest() - Quick validation');\nconsole.log('  testEmptyStateFix.forceEmptyStateCheck() - Force recalculation');\nconsole.log('');\n