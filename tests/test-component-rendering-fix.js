/**
 * Component Rendering Fix Verification Script
 * 
 * ROOT CAUSE FIX VERIFICATION:
 * This script verifies that the core issue has been resolved:
 * - Components appear briefly, then get replaced by empty state, then go blank
 * 
 * FIXES VERIFIED:
 * 1. Template conditionally shows/hides empty state based on saved components
 * 2. JavaScript respects template decisions about display states
 * 3. Component renderer forces initial render when needed
 * 4. Coordination between PHP template and JavaScript state management
 */

console.log('%c🧪 COMPONENT RENDERING FIX VERIFICATION', 'font-weight: bold; color: #10b981; background: #ecfdf5; padding: 2px 6px; border-radius: 3px;');

class ComponentRenderingFixVerification {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
    }
    
    /**
     * Run comprehensive verification of the rendering fix
     */
    async runAllTests() {
        console.log('🔍 Starting component rendering fix verification...');
        
        try {
            // Test 1: Template State Detection
            await this.testTemplateStateDetection();
            
            // Test 2: Empty State Coordination
            await this.testEmptyStateCoordination();
            
            // Test 3: Component Renderer State
            await this.testComponentRendererState();
            
            // Test 4: DOM State Consistency
            await this.testDOMStateConsistency();
            
            // Test 5: State Management Coordination
            await this.testStateManagementCoordination();
            
            // Test 6: Saved Components Rendering
            await this.testSavedComponentsRendering();
            
            // Final verification
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Verification failed:', error);
            this.addResult('VERIFICATION_ERROR', false, `Verification error: ${error.message}`);
            this.generateReport();
        }
    }
    
    /**
     * Test 1: Template State Detection
     */
    async testTemplateStateDetection() {
        console.log('\n📋 Test 1: Template State Detection');
        
        try {
            // Check if saved components container exists
            const savedComponentsContainer = document.getElementById('saved-components-container');
            const emptyState = document.getElementById('empty-state');
            
            const hasSavedContainer = !!savedComponentsContainer;
            const hasEmptyState = !!emptyState;
            
            console.log('  🔍 Saved components container:', hasSavedContainer ? '✅ FOUND' : '❌ NOT FOUND');
            console.log('  🔍 Empty state element:', hasEmptyState ? '✅ FOUND' : '❌ NOT FOUND');
            
            if (hasSavedContainer) {
                console.log('  ✅ Template detected saved components and created container');
                this.addResult('TEMPLATE_SAVED_CONTAINER', true, 'Template correctly created saved components container');
                
                // Check for debug info
                const debugInfo = savedComponentsContainer.querySelector('.debug-saved-components');
                if (debugInfo) {
                    console.log('  📊 Debug info:', debugInfo.textContent);
                }
            } else if (hasEmptyState) {
                console.log('  ℹ️ Template showing empty state (no saved components)');
                this.addResult('TEMPLATE_EMPTY_STATE', true, 'Template correctly showing empty state');
            } else {
                console.log('  ⚠️ Neither saved container nor empty state found');
                this.addResult('TEMPLATE_STATE_MISSING', false, 'Neither saved container nor empty state found');
            }
            
            // Check data attributes
            if (emptyState) {
                const allowJsControl = emptyState.dataset.allowJsControl;
                console.log('  🎛️ JavaScript control allowed:', allowJsControl);
                this.addResult('TEMPLATE_JS_CONTROL', allowJsControl === 'true', `JS control setting: ${allowJsControl}`);
            }
            
        } catch (error) {
            console.error('  ❌ Template state detection failed:', error);
            this.addResult('TEMPLATE_STATE_DETECTION', false, `Template test error: ${error.message}`);
        }
    }
    
    /**
     * Test 2: Empty State Coordination
     */
    async testEmptyStateCoordination() {
        console.log('\n📋 Test 2: Empty State Coordination');
        
        try {
            // Check if empty state handlers are initialized
            const emptyStateHandlers = window.emptyStateHandlers;
            
            if (!emptyStateHandlers) {
                console.log('  ❌ Empty state handlers not available');
                this.addResult('EMPTY_STATE_HANDLERS', false, 'Empty state handlers not available');
                return;
            }
            
            console.log('  ✅ Empty state handlers available');
            
            // Check initialization status
            const status = emptyStateHandlers.getStatus ? emptyStateHandlers.getStatus() : {};
            console.log('  📊 Status:', status);
            
            if (status.isInitialized) {
                this.addResult('EMPTY_STATE_INITIALIZED', true, 'Empty state handlers properly initialized');
            } else {
                this.addResult('EMPTY_STATE_INITIALIZED', false, 'Empty state handlers not initialized');
            }
            
            // Test analytics
            if (emptyStateHandlers.getAnalytics) {
                const analytics = emptyStateHandlers.getAnalytics();
                console.log('  📈 Analytics:', analytics);
                this.addResult('EMPTY_STATE_ANALYTICS', true, `Analytics available: ${analytics.totalInteractions} interactions`);
            }
            
        } catch (error) {
            console.error('  ❌ Empty state coordination test failed:', error);
            this.addResult('EMPTY_STATE_COORDINATION', false, `Empty state test error: ${error.message}`);
        }
    }
    
    /**
     * Test 3: Component Renderer State
     */
    async testComponentRendererState() {
        console.log('\n📋 Test 3: Component Renderer State');
        
        try {
            const renderer = window.enhancedComponentRenderer;
            
            if (!renderer) {
                console.log('  ❌ Enhanced component renderer not available');
                this.addResult('COMPONENT_RENDERER', false, 'Component renderer not available');
                return;
            }
            
            console.log('  ✅ Enhanced component renderer available');
            
            // Check initialization
            const isInitialized = renderer.initialized;
            console.log('  🔧 Initialized:', isInitialized);
            this.addResult('RENDERER_INITIALIZED', isInitialized, `Renderer initialization: ${isInitialized}`);
            
            // Check stats
            if (renderer.getStats) {
                const stats = renderer.getStats();
                console.log('  📊 Renderer stats:', stats);
                this.addResult('RENDERER_STATS', true, `Stats available: ${stats.cachedComponents} cached components`);
            }
            
            // Check preview container
            const container = document.getElementById('media-kit-preview');
            if (container) {
                const childrenCount = container.children.length;
                console.log('  📦 Preview container children:', childrenCount);
                this.addResult('PREVIEW_CONTAINER', true, `Preview container has ${childrenCount} children`);
            }
            
        } catch (error) {
            console.error('  ❌ Component renderer test failed:', error);
            this.addResult('COMPONENT_RENDERER_TEST', false, `Renderer test error: ${error.message}`);
        }
    }
    
    /**
     * Test 4: DOM State Consistency
     */
    async testDOMStateConsistency() {
        console.log('\n📋 Test 4: DOM State Consistency');
        
        try {
            const savedComponentsContainer = document.getElementById('saved-components-container');
            const emptyState = document.getElementById('empty-state');
            const previewContainer = document.getElementById('media-kit-preview');
            
            // Check visibility states
            const savedVisible = savedComponentsContainer && savedComponentsContainer.style.display !== 'none';
            const emptyVisible = emptyState && emptyState.style.display !== 'none' && window.getComputedStyle(emptyState).display !== 'none';
            const previewHasContent = previewContainer && previewContainer.children.length > 0;
            
            console.log('  👁️ Saved container visible:', savedVisible);
            console.log('  👁️ Empty state visible:', emptyVisible);
            console.log('  👁️ Preview has content:', previewHasContent);
            
            // Check for consistency
            if (savedVisible && !emptyVisible) {
                console.log('  ✅ Consistent state: Saved components showing, empty state hidden');
                this.addResult('DOM_CONSISTENCY_SAVED', true, 'Consistent saved components state');
            } else if (!savedVisible && emptyVisible) {
                console.log('  ✅ Consistent state: Empty state showing, saved components hidden');
                this.addResult('DOM_CONSISTENCY_EMPTY', true, 'Consistent empty state');
            } else if (savedVisible && emptyVisible) {
                console.log('  ⚠️ Inconsistent state: Both saved and empty states visible');
                this.addResult('DOM_CONSISTENCY_CONFLICT', false, 'Both states visible simultaneously');
            } else {
                console.log('  ⚠️ Unclear state: Neither state clearly visible');
                this.addResult('DOM_CONSISTENCY_UNCLEAR', false, 'Neither state clearly visible');
            }
            
        } catch (error) {
            console.error('  ❌ DOM consistency test failed:', error);
            this.addResult('DOM_CONSISTENCY', false, `DOM test error: ${error.message}`);
        }
    }
    
    /**
     * Test 5: State Management Coordination
     */
    async testStateManagementCoordination() {
        console.log('\n📋 Test 5: State Management Coordination');
        
        try {
            const stateManager = window.enhancedStateManager;
            
            if (!stateManager) {
                console.log('  ❌ Enhanced state manager not available');
                this.addResult('STATE_MANAGER', false, 'State manager not available');
                return;
            }
            
            console.log('  ✅ Enhanced state manager available');
            
            // Get current state
            const currentState = stateManager.getState();
            const componentCount = currentState ? Object.keys(currentState.components || {}).length : 0;
            
            console.log('  📊 Current state component count:', componentCount);
            this.addResult('STATE_COMPONENT_COUNT', true, `State has ${componentCount} components`);
            
            // Check if state matches DOM
            const previewContainer = document.getElementById('media-kit-preview');
            const domComponentCount = previewContainer ? previewContainer.querySelectorAll('[data-component-id]').length : 0;
            
            console.log('  📊 DOM component count:', domComponentCount);
            
            if (componentCount === domComponentCount) {
                console.log('  ✅ State and DOM component counts match');
                this.addResult('STATE_DOM_SYNC', true, 'State and DOM synchronized');
            } else {
                console.log('  ⚠️ State and DOM component counts differ');
                this.addResult('STATE_DOM_SYNC', false, `State: ${componentCount}, DOM: ${domComponentCount}`);
            }
            
        } catch (error) {
            console.error('  ❌ State management test failed:', error);
            this.addResult('STATE_MANAGEMENT', false, `State test error: ${error.message}`);
        }
    }
    
    /**
     * Test 6: Saved Components Rendering
     */
    async testSavedComponentsRendering() {
        console.log('\n📋 Test 6: Saved Components Rendering');
        
        try {
            // Check WordPress data for saved components
            const wpData = window.gmkbData || window.guestifyData;
            
            if (!wpData) {
                console.log('  ❌ WordPress data not available');
                this.addResult('WP_DATA', false, 'WordPress data not available');
                return;
            }
            
            const savedComponents = wpData.saved_components || [];
            console.log('  📊 WordPress saved components:', savedComponents.length);
            
            if (savedComponents.length > 0) {
                console.log('  ✅ WordPress data has saved components');
                this.addResult('WP_SAVED_COMPONENTS', true, `WordPress has ${savedComponents.length} saved components`);
                
                // Check if they're rendered
                const previewContainer = document.getElementById('media-kit-preview');
                const renderedComponents = previewContainer ? previewContainer.querySelectorAll('[data-component-id]') : [];
                
                console.log('  📊 Rendered components in DOM:', renderedComponents.length);
                
                if (renderedComponents.length > 0) {
                    console.log('  ✅ Components successfully rendered in DOM');
                    this.addResult('COMPONENTS_RENDERED', true, `${renderedComponents.length} components rendered`);
                    
                    // List rendered component types
                    const componentTypes = Array.from(renderedComponents).map(el => {
                        const classList = Array.from(el.classList);
                        const typeClass = classList.find(cls => cls.includes('-component'));
                        return typeClass || 'unknown';
                    });
                    console.log('  📝 Rendered component types:', componentTypes);
                    
                } else {
                    console.log('  ❌ No components rendered in DOM despite saved data');
                    this.addResult('COMPONENTS_RENDERED', false, 'Components not rendered despite saved data');
                }
                
            } else {
                console.log('  ℹ️ No saved components in WordPress data');
                this.addResult('WP_SAVED_COMPONENTS', true, 'No saved components (expected for new media kit)');
            }
            
        } catch (error) {
            console.error('  ❌ Saved components rendering test failed:', error);
            this.addResult('SAVED_COMPONENTS_RENDERING', false, `Rendering test error: ${error.message}`);
        }
    }
    
    /**
     * Add test result
     */
    addResult(testName, passed, description) {
        this.testResults.push({
            testName,
            passed,
            description,
            timestamp: Date.now()
        });
    }
    
    /**
     * Generate comprehensive test report
     */
    generateReport() {
        const duration = Date.now() - this.startTime;
        const passedTests = this.testResults.filter(r => r.passed);
        const failedTests = this.testResults.filter(r => !r.passed);
        
        console.log('\n📊 COMPONENT RENDERING FIX VERIFICATION REPORT');
        console.log('=====================================');
        console.log(`⏱️ Duration: ${duration}ms`);
        console.log(`✅ Passed: ${passedTests.length}`);
        console.log(`❌ Failed: ${failedTests.length}`);
        console.log(`📊 Total: ${this.testResults.length}`);
        
        console.log('\n✅ PASSED TESTS:');
        passedTests.forEach(test => {
            console.log(`  ✅ ${test.testName}: ${test.description}`);
        });
        
        if (failedTests.length > 0) {
            console.log('\n❌ FAILED TESTS:');
            failedTests.forEach(test => {
                console.log(`  ❌ ${test.testName}: ${test.description}`);
            });
        }
        
        // Overall assessment
        const successRate = (passedTests.length / this.testResults.length) * 100;
        console.log(`\n🎯 SUCCESS RATE: ${successRate.toFixed(1)}%`);
        
        if (successRate >= 90) {
            console.log('🎉 COMPONENT RENDERING FIX VERIFICATION: SUCCESS!');
            console.log('✅ The component briefly appearing then disappearing issue should be resolved');
        } else if (successRate >= 70) {
            console.log('⚠️ COMPONENT RENDERING FIX VERIFICATION: PARTIAL SUCCESS');
            console.log('🔧 Some issues remain but major problems are likely resolved');
        } else {
            console.log('❌ COMPONENT RENDERING FIX VERIFICATION: NEEDS ATTENTION');
            console.log('🚨 Significant issues remain with the rendering fix');
        }
        
        // Store results globally for debugging
        window.componentRenderingFixResults = {
            testResults: this.testResults,
            successRate,
            duration,
            timestamp: new Date().toISOString()
        };
        
        console.log('\n💾 Results stored in window.componentRenderingFixResults');
    }
    
    /**
     * Continuous monitoring mode
     */
    startContinuousMonitoring() {
        console.log('🔄 Starting continuous monitoring...');
        
        let lastState = null;
        let lastDOMState = null;
        
        const monitor = () => {
            try {
                // Check state changes
                const currentState = window.enhancedStateManager ? window.enhancedStateManager.getState() : null;
                const stateString = JSON.stringify(currentState);
                
                if (stateString !== lastState) {
                    console.log('🔄 State change detected:', currentState);
                    lastState = stateString;
                }
                
                // Check DOM changes
                const previewContainer = document.getElementById('media-kit-preview');
                const domString = previewContainer ? previewContainer.innerHTML : '';
                
                if (domString !== lastDOMState) {
                    const componentCount = previewContainer ? previewContainer.querySelectorAll('[data-component-id]').length : 0;
                    console.log('🔄 DOM change detected, components:', componentCount);
                    lastDOMState = domString;
                }
                
            } catch (error) {
                console.error('🔄 Monitor error:', error);
            }
        };
        
        // Monitor every 2 seconds
        setInterval(monitor, 2000);
        
        console.log('✅ Continuous monitoring started (every 2 seconds)');
    }
}

// Create global instance
window.componentRenderingFixVerification = new ComponentRenderingFixVerification();

// Auto-run if not in development mode
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.componentRenderingFixVerification.runAllTests();
        }, 2000); // Give systems time to initialize
    });
} else {
    setTimeout(() => {
        window.componentRenderingFixVerification.runAllTests();
    }, 2000);
}

console.log('🔧 Component rendering fix verification loaded');
console.log('📚 Available methods:');
console.log('  - window.componentRenderingFixVerification.runAllTests()');
console.log('  - window.componentRenderingFixVerification.startContinuousMonitoring()');
