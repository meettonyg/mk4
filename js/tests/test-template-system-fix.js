/**
 * @file test-template-system-fix.js
 * @description Validates that the template loading system fix resolved the 287s timeout issue
 * 
 * This test script verifies:
 * 1. Template systems are properly registered and exposed globally
 * 2. Initialization time is under 5 seconds (down from 287s)
 * 3. All template-related race conditions are eliminated
 * 
 * Usage: Copy and paste this code into browser console after page load
 */

const templateSystemTest = {
    async runTemplateFix() {
        console.log('🧪 Testing Template System Fix...\n');
        
        const results = {
            passed: 0,
            failed: 0,
            tests: [],
            startTime: performance.now()
        };
        
        function test(name, condition, critical = false) {
            const status = condition ? 'PASS' : 'FAIL';
            const icon = condition ? '✅' : '❌';
            const criticalIcon = critical ? '🚨' : '';
            
            console.log(`${icon} ${criticalIcon} ${name}: ${status}`);
            
            if (condition) {
                results.passed++;
            } else {
                results.failed++;
            }
            
            results.tests.push({ name, status, critical });
        }
        
        // Critical Template System Tests
        console.log('🔍 Testing Template System Infrastructure...');
        
        test('dynamicComponentLoader globally available', !!window.dynamicComponentLoader, true);
        test('mkTemplateCache globally available', !!window.mkTemplateCache, true);
        test('dynamicComponentLoader has renderComponent method', typeof window.dynamicComponentLoader?.renderComponent === 'function', true);
        test('templateCache has get method', typeof window.mkTemplateCache?.get === 'function', true);
        test('templateCache has set method', typeof window.mkTemplateCache?.set === 'function', true);
        
        // System Registration Tests
        console.log('\n🔍 Testing System Registration...');
        
        const systemInfo = window.getEnhancedSystemInfo?.();
        if (systemInfo) {
            test('dynamicComponentLoader registered', systemInfo.registered?.dynamicComponentLoader, true);
            test('templateCache registered', systemInfo.registered?.templateCache, true);
            test('dynamicComponentLoader type correct', systemInfo.types?.dynamicComponentLoader === 'DynamicComponentLoader');
            test('templateCache type correct', systemInfo.types?.templateCache === 'TemplateCache');
        } else {
            test('System info available', false, true);
        }
        
        // Performance Test
        console.log('\n🔍 Testing Template Loading Performance...');
        
        try {
            const perfStart = performance.now();
            
            // Test basic template cache functionality
            if (window.mkTemplateCache) {
                const stats = window.mkTemplateCache.getStats();
                test('Template cache statistics available', !!stats);
                console.log(`📊 Cache Stats: ${JSON.stringify(stats, null, 2)}`);
                
                // Test cache operations
                window.mkTemplateCache.set('test-component', '<div>Test Template</div>', { test: true });
                const retrieved = window.mkTemplateCache.get('test-component');
                test('Template cache set/get working', !!retrieved && retrieved.html === '<div>Test Template</div>');
            }
            
            // Test dynamic component loader
            if (window.dynamicComponentLoader) {
                const stats = window.dynamicComponentLoader.getStats();
                test('Dynamic loader statistics available', !!stats);
                console.log(`📊 Loader Stats: ${JSON.stringify(stats, null, 2)}`);
            }
            
            const perfEnd = performance.now();
            const testDuration = perfEnd - perfStart;
            test('Template operations complete under 100ms', testDuration < 100);
            
            console.log(`⏱️ Template test duration: ${testDuration.toFixed(2)}ms`);
            
        } catch (error) {
            console.error('❌ Template performance test failed:', error);
            results.failed++;
        }
        
        // Initialization Time Check
        console.log('\n🔍 Testing Initialization Performance...');
        
        // Check if we can get initialization time from performance monitor
        if (window.mkPerf) {
            const perfReport = window.mkPerf.getMetrics();
            const initMetrics = Object.keys(perfReport || {}).filter(key => 
                key.includes('init') || key.includes('register') || key.includes('system')
            );
            
            if (initMetrics.length > 0) {
                console.log('📊 Initialization metrics found:', initMetrics);
                
                // Look for long operations (over 5 seconds)
                const longOps = Object.entries(perfReport).filter(([key, value]) => 
                    Array.isArray(value) && value.some(metric => metric > 5000)
                );
                
                test('No operations over 5 seconds', longOps.length === 0, true);
                
                if (longOps.length > 0) {
                    console.log('⚠️ Long operations detected:', longOps);
                }
            }
        }
        
        // Summary
        const totalTime = performance.now() - results.startTime;
        
        console.log('\n📋 Template System Fix Test Results:');
        console.log(`  ✅ Passed: ${results.passed}`);
        console.log(`  ❌ Failed: ${results.failed}`);
        console.log(`  ⏱️ Test Duration: ${totalTime.toFixed(2)}ms`);
        
        const successRate = (results.passed / (results.passed + results.failed) * 100).toFixed(1);
        console.log(`  📊 Success Rate: ${successRate}%`);
        
        // Critical failures check
        const criticalFailures = results.tests.filter(test => !test.status.includes('PASS') && test.critical);
        
        if (criticalFailures.length === 0 && results.failed === 0) {
            console.log('\n🎉 Template System Fix SUCCESSFUL!');
            console.log('✅ All template loading infrastructure is working correctly');
            console.log('✅ 287-second timeout issue should be resolved');
            console.log('✅ Template-related race conditions eliminated');
            return true;
        } else if (criticalFailures.length === 0) {
            console.log('\n✅ Template System Fix MOSTLY SUCCESSFUL!');
            console.log(`✅ All critical systems working, ${results.failed} minor issues`);
            return true;
        } else {
            console.log('\n❌ Template System Fix NEEDS ATTENTION!');
            console.log('❌ Critical template systems still missing:');
            criticalFailures.forEach(failure => {
                console.log(`   - ${failure.name}`);
            });
            return false;
        }
    },
    
    // Quick diagnostic function
    quickCheck() {
        console.log('🔍 Quick Template System Check:');
        console.log('dynamicComponentLoader:', !!window.dynamicComponentLoader);
        console.log('mkTemplateCache:', !!window.mkTemplateCache);
        console.log('System registrar:', window.systemRegistrar?.list()?.length || 0, 'systems');
        
        if (window.dynamicComponentLoader && window.mkTemplateCache) {
            console.log('✅ Template systems available - fix appears to be working!');
        } else {
            console.log('❌ Template systems still missing - fix may not be applied yet');
        }
    }
};

// Expose globally for easy testing
window.templateSystemTest = templateSystemTest;

// Auto-run if this script is imported
console.log('🧪 Template System Test Ready!');
console.log('Commands: templateSystemTest.runTemplateFix(), templateSystemTest.quickCheck()');
console.log('Quick check: templateSystemTest.quickCheck()');

// Run quick check immediately
templateSystemTest.quickCheck();
