/**
 * Quick Authority Hook Fix Test
 * 
 * Copy and paste this in browser console to test the authority-hook fix
 */

(async function testAuthorityHookFix() {
    console.log('🔧 Testing Authority Hook Fix...');
    console.log('===================================');
    
    let passed = 0;
    let total = 0;
    
    function test(name, condition, details) {
        total++;
        const status = condition ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${name}`);
        if (details) console.log('   →', details);
        if (condition) passed++;
    }
    
    // Test 1: Component loader available
    test('Component Loader Available', !!window.dynamicComponentLoader);
    
    if (!window.dynamicComponentLoader) {
        console.log('❌ Cannot continue - component loader missing');
        return;
    }
    
    // Test 2: Template fetch
    try {
        console.log('🔄 Fetching template...');
        const template = await window.dynamicComponentLoader.getTemplate('authority-hook');
        
        test('Template Fetched', template && template.length > 0, 
             template ? `${template.length} characters` : 'No template');
        
        if (template) {
            const isClean = !template.includes('<?php echo esc_attr($componentId');
            test('Template Clean (no bad PHP)', isClean,
                 isClean ? 'No problematic PHP code' : 'Contains problematic PHP');
        }
        
    } catch (error) {
        test('Template Fetched', false, error.message);
    }
    
    // Test 3: Component rendering
    try {
        console.log('🔄 Testing rendering...');
        const element = await window.dynamicComponentLoader.renderComponent({
            type: 'authority-hook',
            id: 'test-' + Date.now(),
            props: { title: 'Test', who: 'Test audience' }
        });
        
        test('Component Rendered', !!element, 
             element ? element.tagName : 'No element');
        
        if (element) {
            test('Has Controls', !!element.querySelector('.element-controls'),
                 element.querySelectorAll('.control-btn').length + ' control buttons');
            
            test('Has Authority Items', element.querySelectorAll('.authority-item').length >= 3,
                 element.querySelectorAll('.authority-item').length + ' authority items');
            
            // Clean up
            if (element.parentNode) element.parentNode.removeChild(element);
        }
        
    } catch (error) {
        test('Component Rendered', false, error.message);
    }
    
    // Test 4: No console errors during test
    const originalError = console.error;
    const errors = [];
    console.error = (...args) => { errors.push(args); originalError(...args); };
    
    await new Promise(resolve => setTimeout(resolve, 500));
    console.error = originalError;
    
    test('No New Console Errors', errors.length === 0,
         errors.length > 0 ? `${errors.length} errors captured` : 'Clean execution');
    
    // Summary
    const successRate = (passed / total) * 100;
    console.log('\\n===================================');
    console.log(`📊 RESULT: ${successRate.toFixed(1)}% (${passed}/${total})`);
    
    if (successRate >= 95) {
        console.log('🎉 EXCELLENT - Authority hook fix is working!');
        console.log('✅ Try adding authority-hook component via UI');
    } else if (successRate >= 75) {
        console.log('👍 GOOD - Minor issues remain');
        console.log('🔄 Clear cache and refresh page');
    } else {
        console.log('❌ NEEDS WORK - Significant issues remain');
        console.log('🔍 Check template file and server logs');
    }
    
    window.authorityHookTestResult = { successRate, passed, total };
    console.log('===================================');
    
})().catch(error => {
    console.error('❌ Test failed:', error);
});
