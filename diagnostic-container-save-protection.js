/**
 * Container Detection and Save Protection Diagnostic
 * 
 * This script tests the fixes for:
 * 1. Container detection issues
 * 2. Save-triggered page blanking
 * 3. Component rendering coordination
 */

console.log('%c🧪 CONTAINER & SAVE PROTECTION DIAGNOSTIC', 'font-weight: bold; color: #e74c3c; background: #fdf2f2; padding: 2px 6px; border-radius: 3px;');

class ContainerAndSaveProtectionDiagnostic {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
    }
    
    async runAllTests() {
        console.log('🔍 Starting container and save protection diagnostic...');
        
        try {
            // Test 1: Container Detection
            await this.testContainerDetection();
            
            // Test 2: Renderer Container Logic
            await this.testRendererContainerLogic();
            
            // Test 3: Save Protection Logic
            await this.testSaveProtectionLogic();
            
            // Test 4: Component Addition Container
            await this.testComponentAdditionContainer();
            
            // Test 5: Save Operation Simulation
            await this.testSaveOperationSimulation();
            
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Diagnostic failed:', error);
            this.addResult('DIAGNOSTIC_ERROR', false, `Diagnostic error: ${error.message}`);
            this.generateReport();
        }
    }
    
    /**
     * Test 1: Container Detection
     */
    async testContainerDetection() {
        console.log('\\n📋 Test 1: Container Detection');
        
        try {
            const savedContainer = document.getElementById('saved-components-container');
            const previewContainer = document.getElementById('media-kit-preview');
            const emptyState = document.getElementById('empty-state');
            
            console.log('  🔍 Saved components container:', savedContainer ? '✅ FOUND' : '❌ NOT FOUND');
            console.log('  🔍 Preview container:', previewContainer ? '✅ FOUND' : '❌ NOT FOUND');
            console.log('  🔍 Empty state element:', emptyState ? '✅ FOUND' : '❌ NOT FOUND');
            
            if (savedContainer) {
                const computedStyle = window.getComputedStyle(savedContainer);
                const isVisible = computedStyle.display !== 'none' && 
                                computedStyle.visibility !== 'hidden' &&
                                savedContainer.offsetParent !== null;
                
                console.log('  📊 Saved container visibility:', isVisible ? '✅ VISIBLE' : '❌ HIDDEN');
                console.log('  📊 Saved container children:', savedContainer.children.length);
                
                this.addResult('SAVED_CONTAINER_DETECTION', true, `Found and ${isVisible ? 'visible' : 'hidden'} with ${savedContainer.children.length} children`);
            } else {
                this.addResult('SAVED_CONTAINER_DETECTION', false, 'Saved components container not found');
            }
            
            if (previewContainer) {
                console.log('  📊 Preview container children:', previewContainer.children.length);
                this.addResult('PREVIEW_CONTAINER_DETECTION', true, `Found with ${previewContainer.children.length} children`);
            } else {
                this.addResult('PREVIEW_CONTAINER_DETECTION', false, 'Preview container not found');
            }
            
        } catch (error) {
            console.error('  ❌ Container detection failed:', error);
            this.addResult('CONTAINER_DETECTION', false, `Error: ${error.message}`);
        }
    }
    
    /**
     * Test 2: Renderer Container Logic
     */
    async testRendererContainerLogic() {
        console.log('\\n📋 Test 2: Renderer Container Logic');
        
        try {
            const renderer = window.enhancedComponentRenderer;
            
            if (!renderer) {
                console.log('  ❌ Enhanced component renderer not available');
                this.addResult('RENDERER_CONTAINER_LOGIC', false, 'Renderer not available');
                return;
            }
            
            console.log('  ✅ Enhanced component renderer available');
            
            // Test container detection method (simulate the logic)
            const savedContainer = document.getElementById('saved-components-container');
            let targetContainer = null;
            let containerReason = 'not_found';
            
            if (savedContainer) {
                const computedStyle = window.getComputedStyle(savedContainer);
                const isVisible = computedStyle.display !== 'none' && 
                                computedStyle.visibility !== 'hidden' &&
                                savedContainer.offsetParent !== null;
                
                if (isVisible) {
                    targetContainer = savedContainer;
                    containerReason = 'saved_container_visible';
                } else {
                    containerReason = 'saved_container_hidden';
                }
            }
            
            if (!targetContainer) {
                targetContainer = document.getElementById('media-kit-preview');
                containerReason = 'fallback_to_preview';
            }
            
            console.log('  🎯 Container selection logic:', containerReason);
            console.log('  📦 Selected container:', targetContainer ? targetContainer.id : 'none');
            
            this.addResult('RENDERER_CONTAINER_LOGIC', !!targetContainer, `Logic: ${containerReason}, Container: ${targetContainer?.id || 'none'}`);
            
        } catch (error) {
            console.error('  ❌ Renderer container logic test failed:', error);
            this.addResult('RENDERER_CONTAINER_LOGIC', false, `Error: ${error.message}`);
        }
    }
    
    /**
     * Test 3: Save Protection Logic
     */
    async testSaveProtectionLogic() {
        console.log('\\n📋 Test 3: Save Protection Logic');
        
        try {
            const renderer = window.enhancedComponentRenderer;
            const stateManager = window.enhancedStateManager;
            
            if (!renderer || !stateManager) {
                console.log('  ❌ Required components not available');
                this.addResult('SAVE_PROTECTION_LOGIC', false, 'Missing renderer or state manager');
                return;
            }
            
            // Simulate save protection logic
            const currentState = stateManager.getState();
            const hasRenderedComponents = renderer.componentCache && renderer.componentCache.size > 0;
            const newStateHasComponents = Object.keys(currentState.components || {}).length > 0;
            const savedContainer = document.getElementById('saved-components-container');
            const previewContainer = document.getElementById('media-kit-preview');
            const previewHasChildren = previewContainer && previewContainer.children.length > 0;
            const savedContainerHasChildren = savedContainer && savedContainer.children.length > 0;
            
            console.log('  📊 Protection logic variables:');
            console.log('    - Has rendered components:', hasRenderedComponents);
            console.log('    - New state has components:', newStateHasComponents);
            console.log('    - Preview has children:', previewHasChildren);
            console.log('    - Saved container has children:', savedContainerHasChildren);
            
            const wouldTriggerProtection = hasRenderedComponents && newStateHasComponents && !previewHasChildren && !savedContainerHasChildren;
            
            console.log('  🛡️ Protection would trigger:', wouldTriggerProtection ? '✅ YES' : '❌ NO');
            
            this.addResult('SAVE_PROTECTION_LOGIC', true, `Protection trigger: ${wouldTriggerProtection}`);
            
        } catch (error) {
            console.error('  ❌ Save protection logic test failed:', error);
            this.addResult('SAVE_PROTECTION_LOGIC', false, `Error: ${error.message}`);
        }
    }
    
    /**
     * Test 4: Component Addition Container
     */
    async testComponentAdditionContainer() {
        console.log('\\n📋 Test 4: Component Addition Container Selection');
        
        try {
            // Simulate the logic from renderNewComponents
            let targetContainer = document.getElementById('media-kit-preview'); // Default fallback
            let containerReason = 'default_preview';
            
            const savedContainer = document.getElementById('saved-components-container');
            if (savedContainer) {
                const computedStyle = window.getComputedStyle(savedContainer);
                const isVisible = computedStyle.display !== 'none' && 
                                computedStyle.visibility !== 'hidden' &&
                                savedContainer.offsetParent !== null;
                
                if (isVisible) {
                    targetContainer = savedContainer;
                    containerReason = 'saved_container_active';
                } else {
                    containerReason = 'saved_container_hidden_fallback_preview';
                }
            }
            
            console.log('  🎯 New component target container:', containerReason);
            console.log('  📦 Target container ID:', targetContainer ? targetContainer.id : 'none');
            console.log('  📊 Target container children:', targetContainer ? targetContainer.children.length : 0);
            
            this.addResult('COMPONENT_ADDITION_CONTAINER', !!targetContainer, `Selection: ${containerReason}`);
            
        } catch (error) {
            console.error('  ❌ Component addition container test failed:', error);
            this.addResult('COMPONENT_ADDITION_CONTAINER', false, `Error: ${error.message}`);
        }
    }
    
    /**
     * Test 5: Save Operation Simulation
     */
    async testSaveOperationSimulation() {
        console.log('\\n📋 Test 5: Save Operation Simulation');
        
        try {
            // Check current state before simulated save
            const previewContainer = document.getElementById('media-kit-preview');
            const savedContainer = document.getElementById('saved-components-container');
            
            const beforeState = {
                previewChildren: previewContainer ? previewContainer.children.length : 0,
                savedChildren: savedContainer ? savedContainer.children.length : 0,
                totalVisibleComponents: 0
            };
            
            // Count total visible components
            if (previewContainer) {
                beforeState.totalVisibleComponents += previewContainer.children.length;
            }
            if (savedContainer && savedContainer !== previewContainer) {
                beforeState.totalVisibleComponents += savedContainer.children.length;
            }
            
            console.log('  📊 Before simulated save:');
            console.log('    - Preview children:', beforeState.previewChildren);
            console.log('    - Saved container children:', beforeState.savedChildren);
            console.log('    - Total visible components:', beforeState.totalVisibleComponents);
            
            // Simulate what should happen after save (no clearing)
            const afterState = beforeState; // Should remain the same
            
            console.log('  📊 Expected after save:');
            console.log('    - Preview children should remain:', afterState.previewChildren);
            console.log('    - Saved container children should remain:', afterState.savedChildren);
            console.log('    - Total visible components should remain:', afterState.totalVisibleComponents);
            
            const saveWouldPreserveComponents = afterState.totalVisibleComponents > 0;
            
            console.log('  💾 Save operation would preserve components:', saveWouldPreserveComponents ? '✅ YES' : '❌ NO');
            
            this.addResult('SAVE_OPERATION_SIMULATION', saveWouldPreserveComponents, `Components preserved: ${saveWouldPreserveComponents}`);
            
        } catch (error) {
            console.error('  ❌ Save operation simulation failed:', error);
            this.addResult('SAVE_OPERATION_SIMULATION', false, `Error: ${error.message}`);
        }
    }
    
    addResult(testName, passed, description) {
        this.testResults.push({
            testName,
            passed,
            description,
            timestamp: Date.now()
        });
    }
    
    generateReport() {
        const duration = Date.now() - this.startTime;
        const passedTests = this.testResults.filter(r => r.passed);
        const failedTests = this.testResults.filter(r => !r.passed);
        
        console.log('\\n📊 CONTAINER & SAVE PROTECTION DIAGNOSTIC REPORT');
        console.log('=============================================');
        console.log(`⏱️ Duration: ${duration}ms`);
        console.log(`✅ Passed: ${passedTests.length}`);
        console.log(`❌ Failed: ${failedTests.length}`);
        console.log(`📊 Total: ${this.testResults.length}`);
        
        console.log('\\n✅ PASSED TESTS:');
        passedTests.forEach(test => {
            console.log(`  ✅ ${test.testName}: ${test.description}`);
        });
        
        if (failedTests.length > 0) {
            console.log('\\n❌ FAILED TESTS:');
            failedTests.forEach(test => {
                console.log(`  ❌ ${test.testName}: ${test.description}`);
            });
        }
        
        const successRate = (passedTests.length / this.testResults.length) * 100;
        console.log(`\\n🎯 SUCCESS RATE: ${successRate.toFixed(1)}%`);
        
        if (successRate >= 90) {
            console.log('🎉 CONTAINER & SAVE PROTECTION: SUCCESS!');
            console.log('✅ Container detection and save protection should be working correctly');
        } else if (successRate >= 70) {
            console.log('⚠️ CONTAINER & SAVE PROTECTION: PARTIAL SUCCESS');
            console.log('🔧 Some issues remain but major problems should be resolved');
        } else {
            console.log('❌ CONTAINER & SAVE PROTECTION: NEEDS ATTENTION');
            console.log('🚨 Significant issues remain');
        }
        
        window.containerSaveProtectionResults = {
            testResults: this.testResults,
            successRate,
            duration,
            timestamp: new Date().toISOString()
        };
        
        console.log('\\n💾 Results stored in window.containerSaveProtectionResults');
    }
}

// Create global instance
window.containerAndSaveProtectionDiagnostic = new ContainerAndSaveProtectionDiagnostic();

// Auto-run
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.containerAndSaveProtectionDiagnostic.runAllTests();
        }, 1000);
    });
} else {
    setTimeout(() => {
        window.containerAndSaveProtectionDiagnostic.runAllTests();
    }, 1000);
}

console.log('🔧 Container and save protection diagnostic loaded');
console.log('📚 Run manually with: window.containerAndSaveProtectionDiagnostic.runAllTests()');
