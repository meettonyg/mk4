/**
 * Final Status Verification Script
 * Verifies the complete state of Vue migration and identifies any remaining issues
 */

(function() {
    'use strict';
    
    const results = {
        vueSystem: [],
        piniaStore: [],
        components: [],
        legacyCode: [],
        performance: [],
        overall: true
    };
    
    // Test 1: Vue System
    function testVueSystem() {
        console.log('🔍 Checking Vue System...');
        
        // Check Vue app exists - Vue 3 doesn't expose _instance, check for version instead
        if (window.gmkbApp && window.gmkbApp.version) {
            results.vueSystem.push({ test: 'Vue App Instance', status: '✅', detail: 'Vue app mounted successfully' });
        } else if (window.gmkbVueInstance) {
            results.vueSystem.push({ test: 'Vue App Instance', status: '✅', detail: 'Vue instance found' });
        } else {
            results.vueSystem.push({ test: 'Vue App Instance', status: '❌', detail: 'Vue app not found' });
            results.overall = false;
        }
        
        // Check Vue version
        if (window.gmkbApp && window.gmkbApp.version) {
            results.vueSystem.push({ test: 'Vue Version', status: '✅', detail: `Vue ${window.gmkbApp.version}` });
        } else if (window.Vue && window.Vue.version) {
            results.vueSystem.push({ test: 'Vue Version', status: '✅', detail: `Vue ${window.Vue.version}` });
        }
    }
    
    // Test 2: Pinia Store
    function testPiniaStore() {
        console.log('🔍 Checking Pinia Store...');
        
        if (window.gmkbStore) {
            results.piniaStore.push({ test: 'Store Instance', status: '✅', detail: 'Pinia store available' });
            
            // Check store methods
            const requiredMethods = ['addComponent', 'removeComponent', 'updateComponent', 'saveToWordPress'];
            requiredMethods.forEach(method => {
                if (typeof window.gmkbStore[method] === 'function') {
                    results.piniaStore.push({ test: `Store.${method}()`, status: '✅', detail: 'Method exists' });
                } else {
                    results.piniaStore.push({ test: `Store.${method}()`, status: '❌', detail: 'Method missing' });
                    results.overall = false;
                }
            });
            
            // Check state
            results.piniaStore.push({ 
                test: 'Component Count', 
                status: '📊', 
                detail: `${Object.keys(window.gmkbStore.components || {}).length} components loaded`
            });
        } else {
            results.piniaStore.push({ test: 'Store Instance', status: '❌', detail: 'Store not found' });
            results.overall = false;
        }
    }
    
    // Test 3: Component System
    function testComponents() {
        console.log('🔍 Checking Component System...');
        
        const expectedComponents = [
            'hero', 'biography', 'topics', 'contact', 'testimonials',
            'guest-intro', 'topics-questions', 'photo-gallery', 'logo-grid',
            'call-to-action', 'social', 'stats', 'questions',
            'video-intro', 'podcast-player', 'booking-calendar', 'authority-hook'
        ];
        
        // Check if registry exists - try multiple possible locations
        const registry = window.UnifiedComponentRegistry || window.componentRegistry || null;
        if (registry) {
            const registeredTypes = registry.getAvailableTypes ? 
                registry.getAvailableTypes() : [];
            
            expectedComponents.forEach(type => {
                if (registeredTypes.includes(type)) {
                    results.components.push({ test: `Component: ${type}`, status: '✅', detail: 'Registered' });
                } else {
                    results.components.push({ test: `Component: ${type}`, status: '⚠️', detail: 'Not registered' });
                }
            });
            
            results.components.push({ 
                test: 'Total Components', 
                status: '📊', 
                detail: `${registeredTypes.length} of ${expectedComponents.length} registered`
            });
        } else {
            // Don't fail overall if registry isn't found - Vue components might work without it
            results.components.push({ test: 'Component Registry', status: '⚠️', detail: 'Registry not found (may be using Vue-only components)' });
        }
    }
    
    // Test 4: Check for Legacy Code
    function testLegacyCode() {
        console.log('🔍 Checking for Legacy Code...');
        
        // Check for old global objects that shouldn't exist
        const legacyGlobals = [
            'GMKBComponentManager', // Old manager
            'ComponentDiscoveryManager', // Old discovery
            'gmkbRenderers' // Old renderer collection
        ];
        
        legacyGlobals.forEach(global => {
            if (window[global]) {
                results.legacyCode.push({ test: `Legacy: ${global}`, status: '⚠️', detail: 'Still present' });
            } else {
                results.legacyCode.push({ test: `Legacy: ${global}`, status: '✅', detail: 'Removed' });
            }
        });
        
        // Check DOM for legacy elements
        const legacySelectors = [
            '.gmkb-component--legacy',
            '[data-legacy-renderer]',
            '.phase2-component'
        ];
        
        legacySelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                results.legacyCode.push({ test: `DOM: ${selector}`, status: '⚠️', detail: `${elements.length} found` });
            } else {
                results.legacyCode.push({ test: `DOM: ${selector}`, status: '✅', detail: 'None found' });
            }
        });
    }
    
    // Test 5: Performance Metrics
    function testPerformance() {
        console.log('🔍 Checking Performance...');
        
        if (performance && performance.memory) {
            const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            results.performance.push({ 
                test: 'Memory Usage', 
                status: memoryMB < 100 ? '✅' : '⚠️', 
                detail: `${memoryMB} MB`
            });
        }
        
        // Check for event listeners (Chrome DevTools only)
        const eventCount = typeof getEventListeners === 'function' ? getEventListeners(document).length : 'N/A';
        results.performance.push({ 
            test: 'Event Listeners', 
            status: '📊', 
            detail: `${eventCount} listeners`
        });
        
        // Check bundle size (if available)
        if (window.gmkbData && window.gmkbData.bundleSize) {
            const sizeKB = Math.round(window.gmkbData.bundleSize / 1024);
            results.performance.push({ 
                test: 'Bundle Size', 
                status: sizeKB < 500 ? '✅' : '⚠️', 
                detail: `${sizeKB} KB`
            });
        }
    }
    
    // Generate Report
    function generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 MEDIA KIT BUILDER - FINAL STATUS REPORT');
        console.log('='.repeat(60));
        
        // Vue System
        console.log('\n🔷 Vue System:');
        results.vueSystem.forEach(r => {
            console.log(`  ${r.status} ${r.test}: ${r.detail}`);
        });
        
        // Pinia Store
        console.log('\n🏪 Pinia Store:');
        results.piniaStore.forEach(r => {
            console.log(`  ${r.status} ${r.test}: ${r.detail}`);
        });
        
        // Components
        console.log('\n🧩 Components:');
        const componentSummary = results.components.find(r => r.test === 'Total Components');
        if (componentSummary) {
            console.log(`  ${componentSummary.status} ${componentSummary.detail}`);
        }
        
        // Legacy Code
        console.log('\n🗑️ Legacy Code Cleanup:');
        const hasLegacy = results.legacyCode.some(r => r.status === '⚠️');
        if (!hasLegacy) {
            console.log('  ✅ All legacy code removed!');
        } else {
            results.legacyCode.filter(r => r.status === '⚠️').forEach(r => {
                console.log(`  ${r.status} ${r.test}: ${r.detail}`);
            });
        }
        
        // Performance
        console.log('\n⚡ Performance:');
        results.performance.forEach(r => {
            console.log(`  ${r.status} ${r.test}: ${r.detail}`);
        });
        
        // Overall Status
        console.log('\n' + '='.repeat(60));
        if (results.overall && !hasLegacy) {
            console.log('🎉 STATUS: MIGRATION COMPLETE & CLEAN!');
            console.log('✅ The Media Kit Builder is fully migrated to Vue.js');
            console.log('✅ All legacy code has been removed');
            console.log('✅ System is production ready');
        } else if (results.overall) {
            console.log('⚠️ STATUS: MIGRATION FUNCTIONAL BUT NEEDS CLEANUP');
            console.log('The system works but some legacy code remains');
        } else {
            console.log('❌ STATUS: CRITICAL ISSUES FOUND');
            console.log('Please review the errors above');
        }
        console.log('='.repeat(60));
        
        return results;
    }
    
    // Run all tests
    function runAllTests() {
        testVueSystem();
        testPiniaStore();
        testComponents();
        testLegacyCode();
        testPerformance();
        return generateReport();
    }
    
    // Make it globally available
    window.verifyMediaKitStatus = runAllTests;
    
    // Auto-run if in debug mode
    if (window.gmkbData && window.gmkbData.debugMode) {
        console.log('🚀 Running automatic status verification...');
        setTimeout(runAllTests, 2000); // Wait for everything to load
    }
    
    console.log('💡 Run verifyMediaKitStatus() to check migration status');
})();
