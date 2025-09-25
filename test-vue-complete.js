/**
 * Complete Vue Migration Test Suite
 * Phase 5: Comprehensive validation of Vue-only rendering
 */

(function() {
    'use strict';
    
    // Test results storage
    window.gmkbTestResults = {
        timestamp: new Date().toISOString(),
        passed: [],
        failed: [],
        warnings: []
    };
    
    /**
     * Test 1: Script Loading
     */
    function testScriptLoading() {
        console.log('\n📦 TEST 1: Script Loading');
        const scripts = Array.from(document.querySelectorAll('script[src*="gmkb"]'));
        
        // Check if lean bundle is loaded
        const leanBundle = scripts.find(s => s.src.includes('dist/gmkb.iife.js'));
        if (leanBundle) {
            window.gmkbTestResults.passed.push('Lean bundle loaded');
            console.log('✅ Lean bundle loaded');
        } else {
            window.gmkbTestResults.failed.push('Lean bundle not found');
            console.log('❌ Lean bundle not found');
        }
        
        // Check for legacy scripts (should not exist)
        const legacyScripts = scripts.filter(s => 
            s.src.includes('Renderer.js') || 
            s.src.includes('ComponentControlsManager.js') ||
            s.src.includes('enhanced-component-renderer')
        );
        
        if (legacyScripts.length === 0) {
            window.gmkbTestResults.passed.push('No legacy scripts loaded');
            console.log('✅ No legacy scripts loaded');
        } else {
            window.gmkbTestResults.failed.push(`${legacyScripts.length} legacy scripts still loading`);
            console.log(`❌ ${legacyScripts.length} legacy scripts found:`, legacyScripts.map(s => s.src));
        }
    }
    
    /**
     * Test 2: Vue App Status
     */
    function testVueApp() {
        console.log('\n🎯 TEST 2: Vue Application');
        
        // Check Vue app exists
        if (window.gmkbApp) {
            window.gmkbTestResults.passed.push('Vue app initialized');
            console.log('✅ Vue app found:', window.gmkbApp);
        } else {
            window.gmkbTestResults.failed.push('Vue app not initialized');
            console.log('❌ Vue app not found');
        }
        
        // Check Pinia store
        if (window.gmkbStore) {
            window.gmkbTestResults.passed.push('Pinia store initialized');
            console.log('✅ Pinia store found');
            console.log('   Components:', window.gmkbStore.components?.length || 0);
            console.log('   Sections:', window.gmkbStore.sections?.length || 0);
        } else {
            window.gmkbTestResults.failed.push('Pinia store not initialized');
            console.log('❌ Pinia store not found');
        }
        
        // Check mount point
        const mountPoints = [
            document.getElementById('gmkb-vue-app'),
            document.getElementById('vue-media-kit-app'),
            document.querySelector('.vue-media-kit-app')
        ].filter(Boolean);
        
        if (mountPoints.length > 0) {
            window.gmkbTestResults.passed.push('Vue mount point exists');
            console.log('✅ Vue mount point found:', mountPoints[0].id || mountPoints[0].className);
        } else {
            window.gmkbTestResults.failed.push('Vue mount point missing');
            console.log('❌ Vue mount point not found');
        }
    }
    
    /**
     * Test 3: Legacy System Status
     */
    function testLegacySystems() {
        console.log('\n🔒 TEST 3: Legacy Systems');
        
        const legacySystems = [
            { name: 'enhancedComponentManager', path: 'window.enhancedComponentManager' },
            { name: 'ComponentRenderer', path: 'window.ComponentRenderer' },
            { name: 'Renderer', path: 'window.Renderer' },
            { name: 'stateManager (legacy)', path: 'window.stateManager' }
        ];
        
        legacySystems.forEach(system => {
            const obj = eval(system.path);
            if (!obj || obj._legacyDisabled === true) {
                window.gmkbTestResults.passed.push(`${system.name} disabled`);
                console.log(`✅ ${system.name}: Disabled or not loaded`);
            } else if (obj === window.gmkbStore) {
                // stateManager might be the Vue store, which is OK
                window.gmkbTestResults.passed.push(`${system.name} is Vue store`);
                console.log(`✅ ${system.name}: Points to Vue store`);
            } else {
                window.gmkbTestResults.failed.push(`${system.name} still active`);
                console.log(`❌ ${system.name}: Still active!`);
            }
        });
    }
    
    /**
     * Test 4: Component Rendering
     */
    function testComponentRendering() {
        console.log('\n🎨 TEST 4: Component Rendering');
        
        // Count store components
        const storeCount = window.gmkbStore?.components?.length || 0;
        console.log(`📊 Store components: ${storeCount}`);
        
        // Count DOM components (Vue components)
        const vueComponents = document.querySelectorAll('[data-v-], .vue-component');
        const legacyComponents = document.querySelectorAll('.gmkb-component-wrapper:not(.vue-component)');
        
        console.log(`📊 Vue components in DOM: ${vueComponents.length}`);
        console.log(`📊 Legacy components in DOM: ${legacyComponents.length}`);
        
        if (legacyComponents.length === 0) {
            window.gmkbTestResults.passed.push('No legacy components in DOM');
            console.log('✅ No legacy components found');
        } else {
            window.gmkbTestResults.failed.push(`${legacyComponents.length} legacy components in DOM`);
            console.log('❌ Legacy components still present:', legacyComponents);
        }
        
        // Check for duplicates
        if (storeCount > 0 && vueComponents.length > storeCount * 2) {
            window.gmkbTestResults.warnings.push('Possible duplicate rendering detected');
            console.log('⚠️ Warning: More components in DOM than expected');
        }
    }
    
    /**
     * Test 5: CRUD Operations
     */
    async function testCRUDOperations() {
        console.log('\n🔧 TEST 5: CRUD Operations');
        
        if (!window.gmkbStore) {
            console.log('❌ Skipping CRUD tests - store not available');
            return;
        }
        
        try {
            // Test Add
            const initialCount = window.gmkbStore.components.length;
            window.gmkbStore.addComponent({ type: 'hero' });
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (window.gmkbStore.components.length === initialCount + 1) {
                window.gmkbTestResults.passed.push('Add component works');
                console.log('✅ Add component successful');
            } else {
                window.gmkbTestResults.failed.push('Add component failed');
                console.log('❌ Add component failed');
            }
            
            // Test Remove
            const lastComponent = window.gmkbStore.components[window.gmkbStore.components.length - 1];
            if (lastComponent) {
                window.gmkbStore.removeComponent(lastComponent.id);
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (window.gmkbStore.components.length === initialCount) {
                    window.gmkbTestResults.passed.push('Remove component works');
                    console.log('✅ Remove component successful');
                } else {
                    window.gmkbTestResults.failed.push('Remove component failed');
                    console.log('❌ Remove component failed');
                }
            }
            
        } catch (error) {
            window.gmkbTestResults.failed.push(`CRUD operations error: ${error.message}`);
            console.error('❌ CRUD test error:', error);
        }
    }
    
    /**
     * Test 6: Theme System
     */
    function testThemeSystem() {
        console.log('\n🎨 TEST 6: Theme System');
        
        if (window.themeStore) {
            window.gmkbTestResults.passed.push('Theme store available');
            console.log('✅ Theme store found');
            console.log('   Current theme:', window.themeStore.currentTheme);
        } else {
            window.gmkbTestResults.failed.push('Theme store not available');
            console.log('❌ Theme store not found');
        }
        
        // Check CSS variables
        const root = document.documentElement;
        const hasThemeVars = getComputedStyle(root).getPropertyValue('--gmkb-color-primary');
        
        if (hasThemeVars) {
            window.gmkbTestResults.passed.push('Theme CSS variables applied');
            console.log('✅ Theme CSS variables active');
        } else {
            window.gmkbTestResults.warnings.push('Theme CSS variables not detected');
            console.log('⚠️ Theme CSS variables not found');
        }
    }
    
    /**
     * Run all tests
     */
    window.runVueMigrationTests = async function() {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 RUNNING COMPLETE VUE MIGRATION TEST SUITE');
        console.log('='.repeat(60));
        
        // Reset results
        window.gmkbTestResults = {
            timestamp: new Date().toISOString(),
            passed: [],
            failed: [],
            warnings: []
        };
        
        // Run tests
        testScriptLoading();
        testVueApp();
        testLegacySystems();
        testComponentRendering();
        await testCRUDOperations();
        testThemeSystem();
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${window.gmkbTestResults.passed.length}`);
        console.log(`❌ Failed: ${window.gmkbTestResults.failed.length}`);
        console.log(`⚠️ Warnings: ${window.gmkbTestResults.warnings.length}`);
        
        if (window.gmkbTestResults.failed.length === 0) {
            console.log('\n🎉 🎉 🎉 ALL TESTS PASSED! 🎉 🎉 🎉');
            console.log('Vue migration is complete and working correctly!');
        } else {
            console.log('\n❌ Some tests failed. Details:');
            window.gmkbTestResults.failed.forEach(failure => {
                console.log(`  - ${failure}`);
            });
        }
        
        if (window.gmkbTestResults.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            window.gmkbTestResults.warnings.forEach(warning => {
                console.log(`  - ${warning}`);
            });
        }
        
        return window.gmkbTestResults;
    };
    
    // Auto-run after delay
    if (document.readyState === 'complete') {
        setTimeout(() => {
            console.log('Auto-running Vue migration tests in 2 seconds...');
            setTimeout(window.runVueMigrationTests, 2000);
        }, 500);
    } else {
        window.addEventListener('load', () => {
            setTimeout(() => {
                console.log('Auto-running Vue migration tests in 2 seconds...');
                setTimeout(window.runVueMigrationTests, 2000);
            }, 500);
        });
    }
    
    console.log('✅ Vue Migration Test Suite loaded');
    console.log('Run: runVueMigrationTests() to test manually');
    
})();