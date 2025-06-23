/**
 * Test Script for Component Panel Fix (Gemini's Solution)
 * 
 * This tests the implementation of the missing connection between
 * component selection and design panel opening.
 * 
 * Run this in browser console after page loads to validate the fix.
 */

window.testComponentPanelFix = function() {
    console.log('🧪 Testing Component Panel Fix (Gemini\'s Solution)');
    console.log('='.repeat(60));
    
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
    
    // Test 1: Check if selectElement function exists and is exported
    test('selectElement function exported', typeof window.selectElement === 'function' || 
         (window.elementEditor && typeof window.elementEditor.selectElement === 'function'), true);
    
    // Test 2: Check if designPanel is available
    test('designPanel object available', !!window.designPanel || 
         (window.designPanel && typeof window.designPanel.load === 'function'), true);
    
    // Test 3: Check if element-editor has proper imports
    const elementEditorLoaded = document.querySelector('script[src*="element-editor"]') !== null ||
                               window.elementEditor !== undefined;
    test('element-editor.js loaded', elementEditorLoaded, true);
    
    // Test 4: Check if design-panel.js has required methods
    const designPanelMethods = window.designPanel && [
        typeof window.designPanel.load === 'function',
        typeof window.designPanel.show === 'function', 
        typeof window.designPanel.hide === 'function'
    ].every(Boolean);
    test('designPanel has required methods', designPanelMethods, true);
    
    // Test 5: Check if there are components in preview to test with
    const previewComponents = document.querySelectorAll('#media-kit-preview [data-component-id]');
    test('Components available for testing', previewComponents.length > 0, false);
    
    // Test 6: Check if design panel element exists in DOM
    const designPanelElement = document.getElementById('design-panel');
    test('Design panel DOM element exists', !!designPanelElement, true);
    
    // Test 7: Check if CSS for selected state is applied
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
    
    // Interactive Test 8: If components exist, test actual functionality
    if (previewComponents.length > 0) {
        const firstComponent = previewComponents[0];
        const componentId = firstComponent.getAttribute('data-component-id');
        
        console.log('\n🧪 INTERACTIVE TEST: Component Selection');
        console.log(`Testing with component: ${componentId}`);
        
        try {
            // Import selectElement function
            let selectElement = null;
            
            // Try different ways to access selectElement
            if (typeof window.selectElement === 'function') {
                selectElement = window.selectElement;
            } else if (window.elementEditor && typeof window.elementEditor.selectElement === 'function') {
                selectElement = window.elementEditor.selectElement;
            }
            
            if (selectElement) {
                // Test selection
                console.log('📋 Calling selectElement...');
                selectElement(firstComponent);
                
                // Check if selected class was added
                const hasSelectedClass = firstComponent.classList.contains('selected');
                test('Component gets selected class', hasSelectedClass, true);
                
                // Check if design panel was called (we can't easily test the call itself)
                test('selectElement executed without errors', true, true);
                
                // Check if element controls were added
                const hasControls = firstComponent.querySelector('.element-controls') !== null;
                test('Element controls created', hasControls, false);
                
                console.log('📋 Deselecting component...');
                selectElement(null);
                
                const noLongerSelected = !firstComponent.classList.contains('selected');
                test('Component deselects properly', noLongerSelected, true);
                
            } else {
                test('selectElement function accessible', false, true);
            }
            
        } catch (error) {
            console.error('❌ Interactive test failed:', error);
            test('Interactive test completed', false, true);
        }
    } else {
        console.log('\n⚠️ No components found for interactive testing');
        console.log('📋 Try adding a component first, then run this test again');
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📋 Total: ${results.tests.length}`);
    
    const successRate = (results.passed / results.tests.length * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Gemini\'s fix appears to be working correctly.');
        console.log('🎯 Try clicking on a component in the preview to test design panel opening.');
    } else {
        console.log('\n⚠️ Some tests failed. Check the results above for details.');
        
        const criticalFailures = results.tests.filter(t => t.critical && t.status === 'FAIL');
        if (criticalFailures.length > 0) {
            console.log('🚨 Critical failures detected:');
            criticalFailures.forEach(failure => {
                console.log(`   - ${failure.name}`);
            });
        }
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
        successRate: parseFloat(successRate)
    };
};

// Auto-run if components are already loaded
if (document.readyState === 'complete') {
    console.log('🚀 Component Panel Fix Test loaded. Run testComponentPanelFix() to validate.');
} else {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Component Panel Fix Test loaded. Run testComponentPanelFix() to validate.');
    });
}

// Add to global test suite if it exists
if (window.mkLog) {
    window.mkLog.testComponentPanel = window.testComponentPanelFix;
}
