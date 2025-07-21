/**
 * ROOT FIX: Re-rendering Elimination Test
 * 
 * This test validates that the root fix has eliminated multiple component re-renders
 * and that components now render exactly once during initialization.
 */

(function() {
    'use strict';
    
    console.log('🧪 ROOT FIX TEST: Re-rendering Elimination Validation');
    
    // Track component renders
    const renderCounts = new Map();
    const renderTimestamps = new Map();
    
    // Wait for systems to be available
    function waitForSystems() {
        return new Promise((resolve) => {
            const checkSystems = () => {
                if (window.GMKB && window.StateManager && window.ComponentManager && window.UICoordinator) {
                    resolve();
                } else {
                    setTimeout(checkSystems, 100);
                }
            };
            checkSystems();
        });
    }
    
    // Monitor component rendering
    function monitorComponentRendering() {
        console.log('📊 ROOT FIX TEST: Starting component render monitoring...');
        
        // Override ComponentManager.renderComponent to track renders
        const originalRenderComponent = window.ComponentManager.renderComponent;
        window.ComponentManager.renderComponent = async function(componentId) {
            // Track render count
            const currentCount = renderCounts.get(componentId) || 0;
            renderCounts.set(componentId, currentCount + 1);
            
            // Track timestamp
            if (!renderTimestamps.has(componentId)) {
                renderTimestamps.set(componentId, []);
            }
            renderTimestamps.get(componentId).push(Date.now());
            
            console.log(`🎨 RENDER TRACKED: Component ${componentId} rendered ${currentCount + 1} time(s)`);
            
            // Call original method
            return await originalRenderComponent.call(this, componentId);
        };
        
        // Also monitor insertComponentIntoDOM
        const originalInsertComponent = window.ComponentManager.insertComponentIntoDOM;
        window.ComponentManager.insertComponentIntoDOM = function(componentId, html, component, ajaxScripts) {
            console.log(`📝 DOM INSERT: Component ${componentId} inserted into DOM`);
            return originalInsertComponent.call(this, componentId, html, component, ajaxScripts);
        };
        
        console.log('✅ ROOT FIX TEST: Component render monitoring active');
    }
    
    // Analyze results after initialization
    function analyzeResults() {
        console.log('📊 ROOT FIX TEST: Analyzing render results...');
        
        let totalComponents = 0;
        let componentsWithSingleRender = 0;
        let componentsWithMultipleRenders = 0;
        let maxRenders = 0;
        
        console.log('\n=== COMPONENT RENDER ANALYSIS ===');
        
        for (const [componentId, count] of renderCounts.entries()) {
            totalComponents++;
            
            if (count === 1) {
                componentsWithSingleRender++;
                console.log(`✅ ${componentId}: ${count} render (GOOD)`);
            } else {
                componentsWithMultipleRenders++;
                console.log(`❌ ${componentId}: ${count} renders (BAD - multiple renders!)`);
                
                // Show timestamps to understand timing
                const timestamps = renderTimestamps.get(componentId);
                if (timestamps && timestamps.length > 1) {
                    const intervals = [];
                    for (let i = 1; i < timestamps.length; i++) {
                        intervals.push(timestamps[i] - timestamps[i-1]);
                    }
                    console.log(`   Render intervals: ${intervals.join('ms, ')}ms`);
                }
            }
            
            maxRenders = Math.max(maxRenders, count);
        }
        
        console.log('\n=== SUMMARY ===');
        console.log(`Total components: ${totalComponents}`);
        console.log(`Components with single render: ${componentsWithSingleRender}`);
        console.log(`Components with multiple renders: ${componentsWithMultipleRenders}`);
        console.log(`Maximum renders per component: ${maxRenders}`);
        
        // ROOT FIX SUCCESS CRITERIA
        const success = componentsWithMultipleRenders === 0 && maxRenders <= 1;
        
        if (success) {
            console.log('🎉 ROOT FIX SUCCESS: All components rendered exactly once!');
            console.log('✅ Re-rendering issue has been eliminated');
            return true;
        } else {
            console.log('❌ ROOT FIX FAILED: Multiple renders still occurring');
            console.log('⚠️  Need additional investigation');
            return false;
        }
    }
    
    // Check empty state management
    function testEmptyStateManagement() {
        console.log('🔍 ROOT FIX TEST: Testing empty state management...');
        
        const emptyState = document.getElementById('empty-state');
        const previewContainer = document.getElementById('media-kit-preview');
        const components = previewContainer?.querySelectorAll('[data-component-id]');
        
        console.log(`Empty state element: ${emptyState ? 'found' : 'NOT FOUND'}`);
        console.log(`Preview container: ${previewContainer ? 'found' : 'NOT FOUND'}`);
        console.log(`Components in preview: ${components ? components.length : 0}`);
        
        if (components && components.length > 0) {
            console.log(`✅ Components present, empty state should be hidden`);
            if (emptyState && emptyState.style.display === 'none') {
                console.log(`✅ Empty state correctly hidden`);
            } else {
                console.log(`⚠️  Empty state might not be properly hidden`);
            }
        } else {
            console.log(`✅ No components, empty state should be visible`);
            if (emptyState && emptyState.style.display !== 'none') {
                console.log(`✅ Empty state correctly visible`);
            } else {
                console.log(`⚠️  Empty state might not be properly shown`);
            }
        }
    }
    
    // Main test execution
    async function runRootFixTest() {
        try {
            console.log('🚀 ROOT FIX TEST: Starting validation...');
            
            // Wait for systems to initialize
            await waitForSystems();
            console.log('✅ ROOT FIX TEST: Systems available');
            
            // Monitor rendering
            monitorComponentRendering();
            
            // Wait for initialization to complete
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Analyze results
            const success = analyzeResults();
            
            // Test empty state
            testEmptyStateManagement();
            
            console.log('\n=== ROOT FIX TEST COMPLETE ===');
            if (success) {
                console.log('🎉 ROOT FIX VALIDATION: PASSED');
                console.log('✅ Components now render exactly once');
                console.log('✅ Re-rendering issue eliminated');
                console.log('✅ Controls should attach naturally without preservation hacks');
            } else {
                console.log('❌ ROOT FIX VALIDATION: FAILED');
                console.log('⚠️  Multiple renders still detected');
                console.log('⚠️  Additional fixes may be needed');
            }
            
        } catch (error) {
            console.error('❌ ROOT FIX TEST ERROR:', error);
        }
    }
    
    // Auto-run test when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runRootFixTest);
    } else {
        runRootFixTest();
    }
    
})();
