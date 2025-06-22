/**
 * Updated Test Script for Component Panel Fix (Gemini's Solution)
 * 
 * This tests the implementation after fixing the module imports and HTML element.
 * 
 * Run this in browser console after page loads to validate the fix.
 */

window.testComponentPanelFixUpdated = function() {
    console.log('🧪 Testing Updated Component Panel Fix (Post Integration)');
    console.log('='.repeat(65));
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function test(name, condition, critical = false) {
        const status = condition ? 'PASS' : 'FAIL';
        const icon = condition ? '✅' : '❌';
        
        console.log(`${icon} ${name}: ${status}`);
        
        results.tests.push({ name, status, critical });
        
        if (condition) {
            results.passed++;
        } else {
            results.failed++;
        }
        
        return condition;
    }
    
    // Test 1: Check if selectElement function is globally accessible
    test('selectElement function globally accessible', typeof window.selectElement === 'function', true);
    
    // Test 2: Check if designPanel is globally accessible
    test('designPanel globally accessible', !!window.designPanel, true);
    
    // Test 3: Check if elementEditor is globally accessible
    test('elementEditor globally accessible', !!window.elementEditor, true);
    
    // Test 4: Check if design panel DOM element exists
    const designPanelElement = document.getElementById('design-panel');
    test('Design panel DOM element exists', !!designPanelElement, true);
    
    // Test 5: Check if design panel has required sub-elements
    const designPanelContent = document.getElementById('design-panel-content');
    const designPanelClose = document.getElementById('close-design-panel');
    test('Design panel has content area', !!designPanelContent, true);
    test('Design panel has close button', !!designPanelClose, false);
    
    // Test 6: Check if designPanel has required methods
    const designPanelMethods = window.designPanel && [
        typeof window.designPanel.load === 'function',
        typeof window.designPanel.show === 'function', 
        typeof window.designPanel.hide === 'function'
    ].every(Boolean);
    test('designPanel has required methods', designPanelMethods, true);
    
    // Test 7: Check if there are components in preview to test with
    const previewComponents = document.querySelectorAll('#media-kit-preview [data-component-id]');
    test('Components available for testing', previewComponents.length > 0, false);
    
    // Test 8: Check if CSS for selected state is applied
    const cssRuleExists = Array.from(document.styleSheets).some(sheet => {
        try {
            return Array.from(sheet.cssRules).some(rule => 
                rule.selectorText && rule.selectorText.includes('.selected')
            );
        } catch (e) {
            return false;
        }
    });
    test('CSS for selected state available', cssRuleExists, false);
    
    // Interactive Test 9: If components exist, test actual functionality
    if (previewComponents.length > 0) {
        const firstComponent = previewComponents[0];
        const componentId = firstComponent.getAttribute('data-component-id');
        
        console.log('\n🧪 INTERACTIVE TEST: Component Selection');
        console.log(`Testing with component: ${componentId}`);
        
        try {
            // Test selection using global function
            console.log('📋 Calling window.selectElement...');
            window.selectElement(firstComponent);
            
            // Give time for async operations
            setTimeout(() => {
                // Check if selected class was added
                const hasSelectedClass = firstComponent.classList.contains('selected');
                test('Component gets selected class', hasSelectedClass, true);
                
                // Check if design panel is visible
                const panelVisible = designPanelElement.classList.contains('visible');
                test('Design panel becomes visible', panelVisible, true);
                
                // Check if element controls were added
                const hasControls = firstComponent.querySelector('.element-controls') !== null;
                test('Element controls created', hasControls, false);
                
                console.log('📋 Deselecting component...');
                window.selectElement(null);
                
                setTimeout(() => {
                    const noLongerSelected = !firstComponent.classList.contains('selected');
                    test('Component deselects properly', noLongerSelected, true);
                    
                    const panelHidden = !designPanelElement.classList.contains('visible');
                    test('Design panel hides on deselect', panelHidden, true);
                    
                    // Final summary after all async tests
                    console.log('\n📊 FINAL TEST SUMMARY:');
                    console.log(`✅ Passed: ${results.passed}`);
                    console.log(`❌ Failed: ${results.failed}`);
                    console.log(`📋 Total: ${results.tests.length}`);
                    
                    const successRate = (results.passed / results.tests.length * 100).toFixed(1);
                    console.log(`📈 Success Rate: ${successRate}%`);
                    
                    if (results.failed === 0) {
                        console.log('\n🎉 ALL TESTS PASSED! Gemini\'s fix is working correctly!');
                        console.log('🎯 Component panel should now open when you click components.');
                    } else {
                        console.log('\n⚠️ Some tests failed. Check the results above.');
                        
                        const criticalFailures = results.tests.filter(t => t.critical && t.status === 'FAIL');
                        if (criticalFailures.length > 0) {
                            console.log('🚨 Critical failures:');
                            criticalFailures.forEach(failure => {
                                console.log(`   - ${failure.name}`);
                            });
                        }
                    }
                }, 100);
            }, 100);
            
        } catch (error) {
            console.error('❌ Interactive test failed:', error);
            test('Interactive test completed', false, true);
        }
    } else {
        console.log('\n⚠️ No components found for interactive testing');
        console.log('📋 Try adding a component first, then run this test again');
        
        // Show summary for non-interactive tests
        console.log('\n📊 TEST SUMMARY (Non-Interactive):');
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`📋 Total: ${results.tests.length}`);
        
        const successRate = (results.passed / results.tests.length * 100).toFixed(1);
        console.log(`📈 Success Rate: ${successRate}%`);
    }
    
    // Instructions for manual testing
    console.log('\n📖 MANUAL TESTING INSTRUCTIONS:');
    console.log('1. Add a component to the preview (drag from sidebar or use "Add Component" button)');
    console.log('2. Click on the component in the preview area');
    console.log('3. You should see:');
    console.log('   • Component gets highlighted with blue outline');
    console.log('   • Control buttons appear (move, duplicate, delete)'); 
    console.log('   • Design panel opens on the right with component settings');
    console.log('4. Click elsewhere to deselect');
    console.log('5. Component should lose highlight and design panel should close');
    
    return {
        success: results.failed === 0,
        results,
        successRate: parseFloat((results.passed / results.tests.length * 100).toFixed(1))
    };
};

// Auto-run if everything is loaded
if (document.readyState === 'complete' && window.selectElement) {
    console.log('🚀 Updated Component Panel Fix Test loaded and ready!');
    console.log('📋 Run testComponentPanelFixUpdated() to validate the integrated fix.');
} else {
    console.log('🚀 Updated Component Panel Fix Test loaded.');
    console.log('⏳ Waiting for system initialization... Run testComponentPanelFixUpdated() after components load.');
}

// Add to global test suite if it exists
if (window.mkLog) {
    window.mkLog.testComponentPanelUpdated = window.testComponentPanelFixUpdated;
}

// Add quick test shortcut
window.quickTestPanel = function() {
    if (!window.selectElement) {
        console.log('❌ selectElement not available yet. Wait for initialization.');
        return false;
    }
    
    const components = document.querySelectorAll('[data-component-id]');
    if (components.length === 0) {
        console.log('❌ No components found. Add a component first.');
        return false;
    }
    
    const firstComponent = components[0];
    console.log('🧪 Quick test: Selecting first component...');
    window.selectElement(firstComponent);
    
    setTimeout(() => {
        const isSelected = firstComponent.classList.contains('selected');
        const panelVisible = document.getElementById('design-panel')?.classList.contains('visible');
        
        console.log(`✅ Component selected: ${isSelected}`);
        console.log(`✅ Panel visible: ${panelVisible}`);
        
        if (isSelected && panelVisible) {
            console.log('🎉 Quick test PASSED! Panel fix is working.');
        } else {
            console.log('❌ Quick test FAILED. Check the issues above.');
        }
        
        return isSelected && panelVisible;
    }, 200);
};

console.log('💡 Quick test shortcut available: quickTestPanel()');
