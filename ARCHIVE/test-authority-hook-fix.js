/**
 * Quick Authority Hook Template Fix Test
 * 
 * Run this in the browser console to test if the authority-hook 
 * component now renders correctly after the template simplification.
 */

(async function testAuthorityHookFix() {
    console.log('🧪 Testing Authority Hook Template Fix...');
    console.log('=====================================');
    
    let success = 0;
    let total = 0;
    
    function testResult(name, result, details = null) {
        total++;
        const emoji = result ? '✅' : '❌';
        console.log(`${emoji} ${name}: ${result ? 'PASS' : 'FAIL'}`);
        if (details) console.log('   Details:', details);
        if (result) success++;
    }
    
    // Test 1: Check if dynamic component loader is available
    testResult(
        'Dynamic Component Loader Available',
        !!window.dynamicComponentLoader,
        window.dynamicComponentLoader ? 'Found' : 'Missing'
    );
    
    // Test 2: Test authority-hook template fetch
    try {
        console.log('🔄 Fetching authority-hook template...');
        const template = await window.dynamicComponentLoader.getTemplate('authority-hook');
        
        const hasTemplate = template && template.length > 0;
        testResult(
            'Authority Hook Template Fetch',
            hasTemplate,
            hasTemplate ? { 
                length: template.length,
                isSimple: !template.includes('<style>'),
                hasDataElement: template.includes('data-element="authority-hook"'),
                hasEditableContent: template.includes('contenteditable="true"')
            } : 'No template returned'
        );
        
        // Test 3: Check template structure
        if (hasTemplate) {
            const hasCorrectStructure = 
                template.includes('editable-element') &&
                template.includes('element-controls') &&
                template.includes('data-setting=') &&
                !template.includes('<style>'); // Should NOT have embedded styles
                
            testResult(
                'Template Structure Correct',
                hasCorrectStructure,
                {
                    hasEditableElement: template.includes('editable-element'),
                    hasElementControls: template.includes('element-controls'),
                    hasDataSettings: template.includes('data-setting='),
                    noEmbeddedStyles: !template.includes('<style>')
                }
            );
        }
        
    } catch (error) {
        testResult(
            'Authority Hook Template Fetch',
            false,
            `Error: ${error.message}`
        );
    }
    
    // Test 4: Test component rendering
    try {
        if (window.dynamicComponentLoader && window.dynamicComponentLoader.renderComponent) {
            console.log('🔄 Testing component rendering...');
            
            const element = await window.dynamicComponentLoader.renderComponent({
                type: 'authority-hook',
                id: 'test-authority-hook-' + Date.now(),
                props: {
                    title: 'Test Authority Hook',
                    who: 'Test audience',
                    what: 'Test expertise',
                    when: 'Test timing',
                    how: 'Test method'
                }
            });
            
            const renderSuccess = element && element.tagName;
            testResult(
                'Component Rendering',
                renderSuccess,
                renderSuccess ? {
                    tagName: element.tagName,
                    hasId: !!element.id,
                    hasClass: element.className.includes('authority-hook'),
                    hasControls: !!element.querySelector('.element-controls')
                } : 'No element returned'
            );
            
            // Clean up test element
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }
    } catch (error) {
        testResult(
            'Component Rendering',
            false,
            `Error: ${error.message}`
        );
    }
    
    // Test 5: Check for console errors during component operations
    const originalError = console.error;
    const errors = [];
    console.error = function(...args) {
        errors.push(args);
        originalError.apply(console, args);
    };
    
    // Wait a moment to catch any immediate errors
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.error = originalError;
    
    const hasNewErrors = errors.length > 0;
    testResult(
        'No New Console Errors',
        !hasNewErrors,
        hasNewErrors ? { errorCount: errors.length, errors: errors.slice(0, 2) } : 'Clean'
    );
    
    // Summary
    const successRate = (success / total) * 100;
    console.log('\n=====================================');
    console.log('📊 AUTHORITY HOOK FIX TEST SUMMARY');
    console.log('=====================================');
    console.log(`Success Rate: ${successRate.toFixed(1)}% (${success}/${total})`);
    console.log(`Status: ${successRate >= 80 ? '✅ EXCELLENT' : successRate >= 60 ? '⚠️ GOOD' : '❌ NEEDS WORK'}`);
    
    if (successRate >= 80) {
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('✅ Authority hook template fix appears successful!');
        console.log('🧪 Try adding an authority-hook component to verify it works.');
        console.log('📊 Monitor console for any remaining errors.');
    } else {
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('🔧 Some issues remain with the authority hook template.');
        console.log('📝 Check server logs for any PHP template errors.');
        console.log('🔄 Verify template file was saved correctly.');
    }
    
    // Make results available globally
    window.authorityHookTestResults = {
        successRate,
        testsPass: success,
        totalTests: total,
        timestamp: new Date().toISOString()
    };
    
    console.log('\nResults available in: window.authorityHookTestResults');
    console.log('=====================================');
    
})().catch(error => {
    console.error('❌ Authority hook test failed:', error);
});
