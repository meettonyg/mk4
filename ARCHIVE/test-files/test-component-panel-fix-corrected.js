/**
 * CORRECTED Test Script for Component Panel Fix 
 * 
 * Tests the CORRECT implementation using the left sidebar element-editor area.
 * 
 * Run this in browser console after page loads to validate the fix.
 */

window.testComponentPanelFixCorrected = function() {
    console.log('🧪 Testing CORRECTED Component Panel Fix (Left Sidebar Integration)');
    console.log('='.repeat(70));
    
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
    
    // Test 4: Check if element-editor DOM element exists in left sidebar
    const elementEditorElement = document.getElementById('element-editor');
    test('Left sidebar element-editor exists', !!elementEditorElement, true);
    
    // Test 5: Check if design tab exists
    const designTab = document.querySelector('[data-tab="design"]');
    const designTabContent = document.getElementById('design-tab');
    test('Design tab exists', !!designTab, true);
    test('Design tab content exists', !!designTabContent, true);
    
    // Test 6: Check if designPanel targets correct element
    const panelTargetsCorrectElement = window.designPanel && 
                                      window.designPanel.panel && 
                                      window.designPanel.panel.id === 'element-editor';
    test('designPanel targets left sidebar element-editor', panelTargetsCorrectElement, true);
    
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
        
        console.log('\\n🧪 INTERACTIVE TEST: Component Selection with Left Sidebar');
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
                
                // Check if Design tab is now active
                const designTabActive = designTab.classList.contains('sidebar__tab--active');
                test('Design tab becomes active', designTabActive, true);
                
                // Check if element-editor content has changed
                const elementEditorContent = elementEditorElement.innerHTML;
                const hasComponentSettings = elementEditorContent.includes('element-editor__title') && 
                                            !elementEditorContent.includes('No Element Selected');
                test('Left sidebar shows component settings', hasComponentSettings, true);
                
                // Check if element controls were added
                const hasControls = firstComponent.querySelector('.element-controls') !== null;
                test('Element controls created', hasControls, false);
                
                console.log('📋 Deselecting component...');
                window.selectElement(null);
                
                setTimeout(() => {
                    const noLongerSelected = !firstComponent.classList.contains('selected');
                    test('Component deselects properly', noLongerSelected, true);
                    
                    const backToDefault = elementEditorElement.innerHTML.includes('No Element Selected');
                    test('Left sidebar returns to default state', backToDefault, true);
                    
                    // Final summary after all async tests
                    console.log('\\n📊 FINAL TEST SUMMARY:');
                    console.log(`✅ Passed: ${results.passed}`);
                    console.log(`❌ Failed: ${results.failed}`);
                    console.log(`📋 Total: ${results.tests.length}`);
                    
                    const successRate = (results.passed / results.tests.length * 100).toFixed(1);
                    console.log(`📈 Success Rate: ${successRate}%`);
                    
                    if (results.failed === 0) {
                        console.log('\\n🎉 ALL TESTS PASSED! Component panel integration is working correctly!');
                        console.log('🎯 Component settings now appear in the left sidebar Design tab.');
                    } else {
                        console.log('\\n⚠️ Some tests failed. Check the results above.');
                        
                        const criticalFailures = results.tests.filter(t => t.critical && t.status === 'FAIL');
                        if (criticalFailures.length > 0) {
                            console.log('🚨 Critical failures:');
                            criticalFailures.forEach(failure => {
                                console.log(`   - ${failure.name}`);
                            });
                        }
                    }
                }, 200);
            }, 200);
            
        } catch (error) {
            console.error('❌ Interactive test failed:', error);
            test('Interactive test completed', false, true);
        }
    } else {
        console.log('\\n⚠️ No components found for interactive testing');
        console.log('📋 Try adding a component first, then run this test again');
        
        // Show summary for non-interactive tests
        console.log('\\n📊 TEST SUMMARY (Non-Interactive):');
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`📋 Total: ${results.tests.length}`);
        
        const successRate = (results.passed / results.tests.length * 100).toFixed(1);
        console.log(`📈 Success Rate: ${successRate}%`);
    }
    
    // Instructions for manual testing
    console.log('\\n📖 MANUAL TESTING INSTRUCTIONS:');
    console.log('1. Add a component to the preview (drag from sidebar or use \"Add Component\" button)');
    console.log('2. Click on the component in the preview area');
    console.log('3. You should see:');
    console.log('   • Component gets highlighted with blue outline');
    console.log('   • LEFT SIDEBAR automatically switches to \"Design\" tab');
    console.log('   • Component-specific settings appear in the left sidebar Design panel');
    console.log('   • Control buttons appear on the component (move, duplicate, delete)');
    console.log('4. Click elsewhere to deselect');
    console.log('5. Left sidebar should return to \"No Element Selected\" state');
    
    return {
        success: results.failed === 0,
        results,
        successRate: parseFloat((results.passed / results.tests.length * 100).toFixed(1))
    };
};

// Add quick debug function
window.debugComponentPanel = function() {
    console.log('🔍 Component Panel Debug Info:');
    console.log('============================');
    
    const elementEditor = document.getElementById('element-editor');
    const designTab = document.querySelector('[data-tab=\"design\"]');
    const designTabContent = document.getElementById('design-tab');
    
    console.log('Left Sidebar Elements:');
    console.log(`  element-editor exists: ${!!elementEditor}`);
    console.log(`  design tab exists: ${!!designTab}`);
    console.log(`  design tab content exists: ${!!designTabContent}`);
    
    console.log('\\nGlobal Objects:');
    console.log(`  window.selectElement: ${typeof window.selectElement}`);
    console.log(`  window.designPanel: ${typeof window.designPanel}`);
    console.log(`  window.elementEditor: ${typeof window.elementEditor}`);
    
    if (window.designPanel) {
        console.log(`  designPanel.panel.id: ${window.designPanel.panel?.id}`);
    }
    
    const components = document.querySelectorAll('[data-component-id]');
    console.log(`\\nComponents available: ${components.length}`);
    
    if (elementEditor) {
        console.log(`\\nCurrent element-editor content preview: "${elementEditor.innerHTML.substring(0, 100)}..."`);
    }
};

// Auto-run if everything is loaded
if (document.readyState === 'complete' && window.selectElement) {
    console.log('🚀 CORRECTED Component Panel Fix Test loaded and ready!');
    console.log('📋 Run testComponentPanelFixCorrected() to validate the corrected fix.');
} else {
    console.log('🚀 CORRECTED Component Panel Fix Test loaded.');
    console.log('⏳ Waiting for system initialization... Run testComponentPanelFixCorrected() after components load.');
}

// Add to global test suite if it exists
if (window.mkLog) {
    window.mkLog.testComponentPanelCorrected = window.testComponentPanelFixCorrected;
}

console.log('💡 Debug function available: debugComponentPanel()');
console.log('🧪 Test function available: testComponentPanelFixCorrected()');
