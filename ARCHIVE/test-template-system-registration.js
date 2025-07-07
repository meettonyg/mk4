/**
 * @file test-template-system-registration.js
 * @description Comprehensive test to validate template system registration and identify root cause
 * 
 * PHASE 1.2: Template System Registration Fix - ROOT CAUSE DIAGNOSIS
 * 
 * This test will help us understand:
 * 1. Are template systems being imported correctly?
 * 2. Are they being registered with system registrar?
 * 3. Are they being exposed globally?
 * 4. What's causing the 287-second timeout?
 * 
 * Usage: Copy and paste this into browser console
 */

window.testTemplateSystemRegistration = function() {
    console.clear();
    console.log('🔍 PHASE 1.2: Template System Registration Diagnostic Test');
    console.log('='.repeat(60));
    
    const results = {
        passed: 0,
        failed: 0,
        critical: 0,
        tests: []
    };
    
    function test(name, condition, critical = false, details = '') {
        const status = condition ? 'PASS' : 'FAIL';
        const icon = condition ? '✅' : '❌';
        
        console.log(`${icon} ${name}: ${status}${details ? ' - ' + details : ''}`);
        
        results.tests.push({ name, status, critical, details });
        
        if (condition) {
            results.passed++;
        } else {
            results.failed++;
            if (critical) results.critical++;
        }
        
        return condition;
    }
    
    console.log('\n📋 PHASE 1: System Import & Registration Tests');
    console.log('-'.repeat(50));
    
    // Test 1: Basic system registrar functionality
    test('System Registrar Available', !!window.systemRegistrar, true);
    test('System Registrar has register method', typeof window.systemRegistrar?.register === 'function', true);
    test('System Registrar has getAll method', typeof window.systemRegistrar?.getAll === 'function', true);
    
    // Test 2: Template systems in registrar
    const allSystems = window.systemRegistrar?.getAll() || {};
    test('dynamicComponentLoader in system registrar', 'dynamicComponentLoader' in allSystems, true);
    test('templateCache in system registrar', 'templateCache' in allSystems, true);
    
    // Test 3: Template systems actually registered (not null)
    test('dynamicComponentLoader registered (not null)', allSystems.dynamicComponentLoader !== null, true, 
         `Type: ${typeof allSystems.dynamicComponentLoader}`);
    test('templateCache registered (not null)', allSystems.templateCache !== null, true,
         `Type: ${typeof allSystems.templateCache}`);
    
    // Test 4: Global exposure
    test('window.dynamicComponentLoader available', !!window.dynamicComponentLoader, true);
    test('window.mkTemplateCache available', !!window.mkTemplateCache, true);
    
    console.log('\n📋 PHASE 2: System Validation Tests');
    console.log('-'.repeat(50));
    
    // Test 5: System instance validation
    if (window.dynamicComponentLoader) {
        test('dynamicComponentLoader has renderComponent method', 
             typeof window.dynamicComponentLoader.renderComponent === 'function', true);
        test('dynamicComponentLoader has getTemplate method', 
             typeof window.dynamicComponentLoader.getTemplate === 'function', true);
        test('dynamicComponentLoader has getStats method', 
             typeof window.dynamicComponentLoader.getStats === 'function', false);
    }
    
    if (window.mkTemplateCache) {
        test('mkTemplateCache has get method', 
             typeof window.mkTemplateCache.get === 'function', true);
        test('mkTemplateCache has set method', 
             typeof window.mkTemplateCache.set === 'function', true);
        test('mkTemplateCache has getStats method', 
             typeof window.mkTemplateCache.getStats === 'function', false);
    }
    
    console.log('\n📋 PHASE 3: Registration Statistics');
    console.log('-'.repeat(50));
    
    // Test 6: Registration statistics
    if (window.systemRegistrar?.getStats) {
        const stats = window.systemRegistrar.getStats();
        console.log('📊 Registration Statistics:', stats);
        
        test('Total registrations > 0', stats.totalRegistrations > 0, true);
        test('System count >= 6', stats.systemCount >= 6, true, `Current: ${stats.systemCount}`);
        test('Core system count >= 6', stats.coreSystemCount >= 6, true, `Current: ${stats.coreSystemCount}`);
    }
    
    // Test 7: Registered systems list
    if (window.systemRegistrar?.list) {
        const registeredSystems = window.systemRegistrar.list();
        console.log('📋 Registered Systems:', registeredSystems);
        
        test('dynamicComponentLoader in registered list', 
             registeredSystems.includes('dynamicComponentLoader'), true);
        test('templateCache in registered list', 
             registeredSystems.includes('templateCache'), true);
        test('At least 6 systems registered', registeredSystems.length >= 6, true, 
             `Current: ${registeredSystems.length}`);
    }
    
    console.log('\n📋 PHASE 4: Template System Functionality Tests');
    console.log('-'.repeat(50));
    
    // Test 8: Template cache functionality
    if (window.mkTemplateCache) {
        try {
            // Test basic cache operations
            const testKey = 'test-template-' + Date.now();
            const testValue = '<div>Test Template</div>';
            
            window.mkTemplateCache.set(testKey, testValue);
            const retrieved = window.mkTemplateCache.get(testKey);
            
            test('Template cache can store and retrieve', 
                 retrieved && retrieved.html === testValue, false);
                 
            // Clean up test
            window.mkTemplateCache.clear();
        } catch (error) {
            test('Template cache operations work', false, false, error.message);
        }
    }
    
    // Test 9: Dynamic component loader functionality test
    if (window.dynamicComponentLoader) {
        try {
            const stats = window.dynamicComponentLoader.getStats?.();
            test('Dynamic component loader stats available', !!stats, false, 
                 stats ? `Cache: ${stats.fromCache}, Server: ${stats.fromServer}` : 'No stats');
        } catch (error) {
            test('Dynamic component loader stats work', false, false, error.message);
        }
    }
    
    console.log('\n📋 PHASE 5: Root Cause Analysis');
    console.log('-'.repeat(50));
    
    // Analyze potential issues
    const potentialIssues = [];
    
    if (!window.systemRegistrar) {
        potentialIssues.push('CRITICAL: System registrar not available - imports may have failed');
    }
    
    if (!allSystems.dynamicComponentLoader) {
        potentialIssues.push('CRITICAL: dynamicComponentLoader not registered - import or registration failed');
    }
    
    if (!allSystems.templateCache) {
        potentialIssues.push('CRITICAL: templateCache not registered - import or registration failed');
    }
    
    if (!window.dynamicComponentLoader) {
        potentialIssues.push('CRITICAL: dynamicComponentLoader not exposed globally - system-initializer issue');
    }
    
    if (!window.mkTemplateCache) {
        potentialIssues.push('CRITICAL: mkTemplateCache not exposed globally - system-initializer issue');
    }
    
    if (window.systemRegistrar?.getStats && window.systemRegistrar.getStats().systemCount < 6) {
        potentialIssues.push('WARNING: Less than 6 systems registered - some systems may be missing');
    }
    
    console.log('\n🎯 ROOT CAUSE ANALYSIS');
    console.log('-'.repeat(30));
    
    if (potentialIssues.length === 0) {
        console.log('✅ NO ISSUES DETECTED - Template systems appear to be working correctly!');
        console.log('🤔 The 287-second timeout may be caused by a different issue.');
        console.log('💡 Possible alternative causes:');
        console.log('   - Network timeouts during template fetching');
        console.log('   - WordPress AJAX endpoint issues');
        console.log('   - PHP template rendering performance');
        console.log('   - Infinite loops in initialization logic');
    } else {
        console.log('❌ ISSUES DETECTED:');
        potentialIssues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
    }
    
    console.log('\n📊 TEST SUMMARY');
    console.log('-'.repeat(20));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`🚨 Critical Failed: ${results.critical}`);
    
    const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (results.critical > 0) {
        console.log('\n🚨 CRITICAL ISSUES FOUND - Template system registration has fundamental problems');
        return false;
    } else if (results.failed > 0) {
        console.log('\n⚠️ MINOR ISSUES FOUND - Template system registration mostly working');
        return true;
    } else {
        console.log('\n🎉 ALL TESTS PASSED - Template system registration is working correctly!');
        return true;
    }
};

// Auto-run test if Media Kit Builder is ready
if (window.systemRegistrar) {
    console.log('🚀 Media Kit Builder detected, running template system registration test...');
    setTimeout(() => window.testTemplateSystemRegistration(), 1000);
} else {
    console.log('⏳ Waiting for Media Kit Builder to initialize...');
    console.log('💡 Run window.testTemplateSystemRegistration() manually once ready');
}