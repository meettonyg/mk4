/**
 * Test script for media kit rendering fix
 * Run this in the browser console to verify the fix is working
 */

// Test Suite for Media Kit Rendering
const MediaKitRenderTest = {
    // Test 1: Check if components are loaded from localStorage
    testLocalStorageLoad: function() {
        console.log('=== Test 1: LocalStorage Load ===');
        const savedData = localStorage.getItem('mediaKitData');
        
        if (!savedData) {
            console.log('❌ No saved data found in localStorage');
            return false;
        }
        
        try {
            const data = JSON.parse(savedData);
            console.log('✅ Found saved data with', data.components.length, 'components');
            console.log('Components:', data.components.map(c => `${c.type} (${c.id})`));
            return true;
        } catch (e) {
            console.log('❌ Failed to parse saved data:', e);
            return false;
        }
    },
    
    // Test 2: Check if state manager has loaded the components
    testStateManager: function() {
        console.log('\n=== Test 2: State Manager ===');
        
        if (!window.stateManager) {
            console.log('❌ State manager not found');
            return false;
        }
        
        const state = window.stateManager.getState();
        const componentCount = Object.keys(state.components || {}).length;
        
        if (componentCount === 0) {
            console.log('❌ No components in state manager');
            return false;
        }
        
        console.log('✅ State manager has', componentCount, 'components');
        Object.entries(state.components).forEach(([id, comp]) => {
            console.log(`  - ${comp.type} (${id})`);
        });
        
        return true;
    },
    
    // Test 3: Check if components are rendered in DOM
    testDOMRendering: function() {
        console.log('\n=== Test 3: DOM Rendering ===');
        
        const renderedComponents = document.querySelectorAll('[data-component-id]');
        const emptyState = document.getElementById('empty-state');
        
        if (renderedComponents.length === 0) {
            console.log('❌ No components found in DOM');
            
            if (emptyState && emptyState.style.display !== 'none') {
                console.log('⚠️  Empty state is visible');
            }
            
            return false;
        }
        
        console.log('✅ Found', renderedComponents.length, 'components in DOM');
        renderedComponents.forEach(el => {
            console.log(`  - ${el.getAttribute('data-component-type')} (${el.getAttribute('data-component-id')})`);
        });
        
        if (emptyState && emptyState.style.display === 'none') {
            console.log('✅ Empty state is properly hidden');
        }
        
        return true;
    },
    
    // Test 4: Check renderer status
    testRenderer: function() {
        console.log('\n=== Test 4: Component Renderer ===');
        
        if (!window.componentRenderer) {
            console.log('❌ Component renderer not found');
            return false;
        }
        
        const status = {
            initialized: window.componentRenderer.initialized,
            isRendering: window.componentRenderer.isRendering,
            skipInitialRender: window.componentRenderer.skipInitialRender
        };
        
        console.log('Renderer status:', status);
        
        if (!status.initialized) {
            console.log('❌ Renderer not initialized');
            return false;
        }
        
        console.log('✅ Renderer is initialized and ready');
        return true;
    },
    
    // Test 5: Force render test
    testForceRender: function() {
        console.log('\n=== Test 5: Force Render Test ===');
        
        if (!window.stateManager || !window.componentRenderer) {
            console.log('❌ Required systems not available');
            return false;
        }
        
        const beforeCount = document.querySelectorAll('[data-component-id]').length;
        console.log('Components before force render:', beforeCount);
        
        // Force render
        const state = window.stateManager.getState();
        window.componentRenderer.skipInitialRender = false;
        window.componentRenderer.onStateChange(state);
        
        // Check after a delay
        setTimeout(() => {
            const afterCount = document.querySelectorAll('[data-component-id]').length;
            console.log('Components after force render:', afterCount);
            
            if (afterCount > 0 && afterCount >= beforeCount) {
                console.log('✅ Force render successful');
            } else {
                console.log('❌ Force render may have failed');
            }
        }, 500);
        
        return true;
    },
    
    // Run all tests
    runAllTests: function() {
        console.log('🧪 Running Media Kit Render Tests...\n');
        
        const results = {
            localStorage: this.testLocalStorageLoad(),
            stateManager: this.testStateManager(),
            domRendering: this.testDOMRendering(),
            renderer: this.testRenderer()
        };
        
        // Run force render test last (async)
        this.testForceRender();
        
        console.log('\n📊 Test Summary:');
        console.log('LocalStorage:', results.localStorage ? '✅' : '❌');
        console.log('State Manager:', results.stateManager ? '✅' : '❌');
        console.log('DOM Rendering:', results.domRendering ? '✅' : '❌');
        console.log('Renderer:', results.renderer ? '✅' : '❌');
        
        const allPassed = Object.values(results).every(r => r === true);
        console.log('\nOverall:', allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
        
        if (!results.domRendering && results.stateManager) {
            console.log('\n⚠️  Components are in state but not rendered. The fix should address this.');
            console.log('Try refreshing the page to see if the fix is working.');
        }
        
        return results;
    },
    
    // Utility: Create test media kit
    createTestMediaKit: function() {
        console.log('Creating test media kit...');
        
        const testData = {
            version: '1.0.0',
            metadata: {
                title: 'Test Media Kit',
                theme: 'default',
                lastModified: new Date().toISOString()
            },
            components: [
                {
                    id: 'hero-test-1',
                    type: 'hero',
                    order: 0,
                    data: {
                        name: 'Test User',
                        title: 'Test Title',
                        bio: 'This is a test bio'
                    }
                },
                {
                    id: 'stats-test-2',
                    type: 'stats',
                    order: 1,
                    data: {
                        stats: [
                            { value: '100K', label: 'Followers' },
                            { value: '50%', label: 'Engagement' }
                        ]
                    }
                }
            ]
        };
        
        localStorage.setItem('mediaKitData', JSON.stringify(testData));
        console.log('✅ Test media kit created. Refresh the page to test loading.');
    }
};

// Make it globally available
window.MediaKitRenderTest = MediaKitRenderTest;

// Auto-run tests after a delay to ensure page is loaded
setTimeout(() => {
    console.log('To run render tests, use: MediaKitRenderTest.runAllTests()');
    console.log('To create test data, use: MediaKitRenderTest.createTestMediaKit()');
}, 1000);
