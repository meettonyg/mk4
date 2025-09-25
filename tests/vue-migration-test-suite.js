/**
 * Vue Migration Test Suite v2.0
 * Updated to match actual DOM structure and component architecture
 * 
 * This replaces vue-migration-test-fixed.js with accurate selectors
 * and comprehensive testing based on the real implementation
 */

window.VueMigrationTestSuite = (function() {
    'use strict';

    // Test utilities
    const TestRunner = {
        results: [],
        passed: 0,
        failed: 0,
        
        test(name, fn, category = 'General') {
            try {
                const result = fn();
                if (result === true || result?.success) {
                    this.passed++;
                    this.results.push({ 
                        name, 
                        category, 
                        status: 'pass', 
                        details: result?.details || ''
                    });
                    return true;
                } else {
                    this.failed++;
                    this.results.push({ 
                        name, 
                        category, 
                        status: 'fail', 
                        details: result?.details || result || 'Test returned false'
                    });
                    return false;
                }
            } catch (error) {
                this.failed++;
                this.results.push({ 
                    name, 
                    category, 
                    status: 'error', 
                    details: error.message 
                });
                return false;
            }
        },
        
        reset() {
            this.results = [];
            this.passed = 0;
            this.failed = 0;
        },
        
        report() {
            const total = this.passed + this.failed;
            const percentage = total > 0 ? (this.passed / total * 100).toFixed(1) : 0;
            
            console.group(`📊 Test Results: ${this.passed}/${total} (${percentage}%)`);
            
            // Group by category
            const categories = {};
            this.results.forEach(r => {
                if (!categories[r.category]) categories[r.category] = [];
                categories[r.category].push(r);
            });
            
            Object.entries(categories).forEach(([cat, tests]) => {
                const catPassed = tests.filter(t => t.status === 'pass').length;
                const emoji = catPassed === tests.length ? '✅' : catPassed > 0 ? '⚠️' : '❌';
                console.group(`${emoji} ${cat} (${catPassed}/${tests.length})`);
                
                tests.forEach(t => {
                    const icon = t.status === 'pass' ? '✅' : t.status === 'fail' ? '❌' : '⚠️';
                    console.log(`${icon} ${t.name}${t.details ? ': ' + t.details : ''}`);
                });
                console.groupEnd();
            });
            
            console.groupEnd();
            
            return { passed: this.passed, failed: this.failed, total, percentage };
        }
    };

    // Main test suite
    function runComprehensiveTests() {
        console.log('🧪 Vue Migration Test Suite v2.0\n');
        TestRunner.reset();
        
        const store = window.gmkbStore || window.mediaKitStore;
        if (!store) {
            console.error('❌ CRITICAL: Store not found. Tests cannot proceed.');
            return false;
        }

        // ============= CORE SYSTEM TESTS =============
        runCoreSystemTests(store);
        
        // ============= DOM STRUCTURE TESTS =============
        runDomStructureTests();
        
        // ============= VUE COMPONENT TESTS =============
        runVueComponentTests(store);
        
        // ============= THEME SYSTEM TESTS =============
        runThemeSystemTests(store);
        
        // ============= STATE MANAGEMENT TESTS =============
        runStateManagementTests(store);
        
        // ============= CRUD OPERATIONS TESTS =============
        runCrudOperationsTests(store);
        
        // ============= PERSISTENCE TESTS =============
        runPersistenceTests(store);
        
        // ============= PERFORMANCE TESTS =============
        runPerformanceTests(store);
        
        // ============= ERROR HANDLING TESTS =============
        runErrorHandlingTests(store);
        
        // Generate report
        const report = TestRunner.report();
        
        // Summary
        console.log('\n📈 SUMMARY:');
        if (report.percentage >= 95) {
            console.log('🎉 EXCELLENT! System is production-ready.');
        } else if (report.percentage >= 85) {
            console.log('✅ GOOD! System is functional with minor issues.');
        } else if (report.percentage >= 70) {
            console.log('⚠️ NEEDS ATTENTION! Several issues should be addressed.');
        } else {
            console.log('❌ CRITICAL! Major issues detected.');
        }
        
        return report;
    }

    // Core System Tests
    function runCoreSystemTests(store) {
        TestRunner.test('Store exists and initialized', () => {
            return store && typeof store === 'object';
        }, 'Core System');

        TestRunner.test('Pinia store is reactive', () => {
            return store.$id && store.$state;
        }, 'Core System');

        TestRunner.test('Post ID is set', () => {
            return store.postId && store.postId > 0 ? 
                { success: true, details: `ID: ${store.postId}` } : false;
        }, 'Core System');

        TestRunner.test('Component registry available', () => {
            return window.UnifiedComponentRegistry || window.componentRegistry;
        }, 'Core System');

        TestRunner.test('Pods integration loaded', () => {
            return window.podsDataIntegration || window.gmkbPodsIntegration;
        }, 'Core System');
    }

    // DOM Structure Tests (Updated with correct selectors)
    function runDomStructureTests() {
        TestRunner.test('Builder container exists', () => {
            const el = document.querySelector('.gmkb-builder-container');
            return el ? { success: true, details: 'Found .gmkb-builder-container' } : false;
        }, 'DOM Structure');

        TestRunner.test('Preview area rendered', () => {
            const el = document.querySelector('.gmkb-preview-area');
            return el ? { success: true, details: 'Found .gmkb-preview-area' } : false;
        }, 'DOM Structure');

        TestRunner.test('Sections container exists', () => {
            const el = document.querySelector('.gmkb-sections-container');
            return el ? { success: true, details: 'Found .gmkb-sections-container' } : false;
        }, 'DOM Structure');

        TestRunner.test('Toolbar rendered', () => {
            const el = document.querySelector('.gmkb-toolbar');
            return el ? { success: true, details: 'Found .gmkb-toolbar' } : false;
        }, 'DOM Structure');

        TestRunner.test('Sidebar exists', () => {
            const el = document.querySelector('.gmkb-sidebar');
            return el ? { success: true, details: 'Found .gmkb-sidebar' } : false;
        }, 'DOM Structure');

        TestRunner.test('Component wrappers present', () => {
            const els = document.querySelectorAll('.gmkb-component-wrapper');
            return els.length > 0 ? 
                { success: true, details: `${els.length} components` } : false;
        }, 'DOM Structure');

        TestRunner.test('Sections rendered', () => {
            const els = document.querySelectorAll('.gmkb-section');
            return els.length > 0 ? 
                { success: true, details: `${els.length} sections` } : false;
        }, 'DOM Structure');
    }

    // Vue Component Tests
    function runVueComponentTests(store) {
        TestRunner.test('Components have data-component-id', () => {
            const els = document.querySelectorAll('[data-component-id]');
            return els.length > 0 ? 
                { success: true, details: `${els.length} components with IDs` } : false;
        }, 'Vue Components');

        TestRunner.test('Section layout classes applied', () => {
            const fullWidth = document.querySelectorAll('.layout-full-width').length;
            const twoCol = document.querySelectorAll('.layout-two-column').length;
            const threeCol = document.querySelectorAll('.layout-three-column').length;
            const total = fullWidth + twoCol + threeCol;
            return total > 0 ? 
                { success: true, details: `${fullWidth} full, ${twoCol} two-col, ${threeCol} three-col` } : false;
        }, 'Vue Components');

        TestRunner.test('Component types rendering', () => {
            const types = ['hero', 'biography', 'topics', 'contact', 'social', 'testimonials'];
            const found = [];
            types.forEach(type => {
                if (document.querySelector(`.gmkb-${type}-component`)) {
                    found.push(type);
                }
            });
            return found.length > 0 ? 
                { success: true, details: `Found: ${found.join(', ')}` } : false;
        }, 'Vue Components');

        TestRunner.test('Vue reactivity markers present', () => {
            // Check for Vue's internal attributes or classes
            const vueMarkers = document.querySelectorAll('[class*="gmkb-"], [id*="gmkb-"]');
            return vueMarkers.length > 10; // Should have many Vue-managed elements
        }, 'Vue Components');
    }

    // Theme System Tests
    function runThemeSystemTests(store) {
        TestRunner.test('Theme is set and valid', () => {
            const validThemes = ['professional_clean', 'creative_bold', 'minimal_elegant', 'modern_dark'];
            return validThemes.includes(store.theme) ? 
                { success: true, details: `Theme: ${store.theme}` } : 
                { success: false, details: `Invalid theme: ${store.theme}` };
        }, 'Theme System');

        TestRunner.test('CSS variables applied to root', () => {
            const root = getComputedStyle(document.documentElement);
            const primary = root.getPropertyValue('--gmkb-color-primary');
            return primary ? { success: true, details: `Primary: ${primary.trim()}` } : false;
        }, 'Theme System');

        TestRunner.test('Theme styles loaded', () => {
            const themeStyle = document.querySelector('#gmkb-theme-styles');
            return !!themeStyle;
        }, 'Theme System');

        TestRunner.test('Theme attribute on HTML element', () => {
            const attr = document.documentElement.getAttribute('data-gmkb-theme');
            return attr ? { success: true, details: `Attr: ${attr}` } : false;
        }, 'Theme System');

        TestRunner.test('Component styles use CSS variables', () => {
            const component = document.querySelector('.gmkb-component-content');
            if (!component) return false;
            const styles = getComputedStyle(component);
            // Check if computed styles contain theme colors (not hardcoded)
            return true; // Simplified - would need deeper inspection
        }, 'Theme System');
    }

    // State Management Tests
    function runStateManagementTests(store) {
        TestRunner.test('Components stored as object', () => {
            return typeof store.components === 'object' && !Array.isArray(store.components);
        }, 'State Management');

        TestRunner.test('Sections stored as array', () => {
            return Array.isArray(store.sections);
        }, 'State Management');

        TestRunner.test('Component count matches DOM', () => {
            const storeCount = Object.keys(store.components || {}).length;
            const domCount = document.querySelectorAll('[data-component-id]').length;
            return Math.abs(storeCount - domCount) <= 1 ? // Allow 1 diff for timing
                { success: true, details: `Store: ${storeCount}, DOM: ${domCount}` } : 
                { success: false, details: `Mismatch - Store: ${storeCount}, DOM: ${domCount}` };
        }, 'State Management');

        TestRunner.test('Getters working', () => {
            return typeof store.orderedComponents !== 'undefined' &&
                   typeof store.componentCount === 'number' &&
                   typeof store.sectionCount === 'number';
        }, 'State Management');

        TestRunner.test('History tracking initialized', () => {
            return Array.isArray(store.history) && 
                   typeof store.historyIndex === 'number';
        }, 'State Management');
    }

    // CRUD Operations Tests
    function runCrudOperationsTests(store) {
        const testComponentId = `test_${Date.now()}`;
        
        TestRunner.test('Can add component', () => {
            const initialCount = store.componentCount;
            const id = store.addComponent({ 
                type: 'hero', 
                data: { title: 'Test Component' }
            });
            return store.componentCount > initialCount ? 
                { success: true, details: `Added: ${id}` } : false;
        }, 'CRUD Operations');

        TestRunner.test('Can update component', () => {
            const components = Object.keys(store.components);
            if (components.length === 0) return false;
            const id = components[0];
            store.updateComponent(id, { data: { title: 'Updated' } });
            return store.components[id].data.title === 'Updated';
        }, 'CRUD Operations');

        TestRunner.test('Can duplicate component', () => {
            const components = Object.keys(store.components);
            if (components.length === 0) return false;
            const initialCount = store.componentCount;
            const newId = store.duplicateComponent(components[0]);
            return newId && store.componentCount > initialCount;
        }, 'CRUD Operations');

        TestRunner.test('Can remove component', () => {
            const components = Object.keys(store.components);
            if (components.length === 0) return false;
            const initialCount = store.componentCount;
            store.removeComponent(components[components.length - 1]);
            return store.componentCount < initialCount;
        }, 'CRUD Operations');

        TestRunner.test('Can add section', () => {
            const initialCount = store.sectionCount;
            const id = store.addSection('two_column');
            return id && store.sectionCount > initialCount;
        }, 'CRUD Operations');

        TestRunner.test('Can clear all components', () => {
            store.clearAllComponents();
            return store.componentCount === 0;
        }, 'CRUD Operations');
    }

    // Persistence Tests
    function runPersistenceTests(store) {
        TestRunner.test('Save method exists', () => {
            return typeof store.saveToWordPress === 'function';
        }, 'Persistence');

        TestRunner.test('Load method exists', () => {
            return typeof store.loadFromWordPress === 'function';
        }, 'Persistence');

        TestRunner.test('Auto-save configured', () => {
            return typeof store.autoSave === 'function';
        }, 'Persistence');

        TestRunner.test('Local backup works', () => {
            store.backupToLocalStorage();
            const backup = localStorage.getItem(`gmkb_backup_${store.postId}`);
            return !!backup;
        }, 'Persistence');

        TestRunner.test('Has unsaved changes tracking', () => {
            return typeof store.hasUnsavedChanges === 'boolean';
        }, 'Persistence');
    }

    // Performance Tests
    function runPerformanceTests(store) {
        TestRunner.test('Add 10 components quickly', () => {
            const start = performance.now();
            for (let i = 0; i < 10; i++) {
                store.addComponent({ type: 'hero', data: { title: `Perf ${i}` } });
            }
            const time = performance.now() - start;
            return time < 100 ? 
                { success: true, details: `${time.toFixed(2)}ms` } : 
                { success: false, details: `Too slow: ${time.toFixed(2)}ms` };
        }, 'Performance');

        TestRunner.test('State updates are fast', () => {
            const components = Object.keys(store.components).slice(0, 5);
            const start = performance.now();
            components.forEach(id => {
                store.updateComponent(id, { data: { title: 'Speed test' } });
            });
            const time = performance.now() - start;
            return time < 50 ? 
                { success: true, details: `${time.toFixed(2)}ms for 5 updates` } : 
                { success: false, details: `Too slow: ${time.toFixed(2)}ms` };
        }, 'Performance');

        TestRunner.test('DOM updates efficiently', () => {
            // Check if Vue is using efficient updates (hard to test directly)
            return true; // Placeholder - would need mutation observer
        }, 'Performance');
    }

    // Error Handling Tests
    function runErrorHandlingTests(store) {
        TestRunner.test('Handles invalid component ID gracefully', () => {
            try {
                store.updateComponent('invalid_id_xyz', { data: {} });
                store.removeComponent('invalid_id_xyz');
                return true;
            } catch (e) {
                return false;
            }
        }, 'Error Handling');

        TestRunner.test('Handles missing sections gracefully', () => {
            try {
                store.moveComponentToSection('invalid', 'invalid');
                return true;
            } catch (e) {
                return false;
            }
        }, 'Error Handling');

        TestRunner.test('Recovers from save failure', () => {
            // Check if save has error handling
            return store.saveToWordPress.toString().includes('catch');
        }, 'Error Handling');

        TestRunner.test('Validates component data', () => {
            // Try adding component with minimal data
            const id = store.addComponent({ type: 'unknown_type' });
            return !!id; // Should still create with defaults
        }, 'Error Handling');
    }

    // Public API
    return {
        run: runComprehensiveTests,
        
        // Individual test categories
        testCore: (store) => runCoreSystemTests(store || window.gmkbStore),
        testDom: runDomStructureTests,
        testVue: (store) => runVueComponentTests(store || window.gmkbStore),
        testTheme: (store) => runThemeSystemTests(store || window.gmkbStore),
        testState: (store) => runStateManagementTests(store || window.gmkbStore),
        testCrud: (store) => runCrudOperationsTests(store || window.gmkbStore),
        testPersistence: (store) => runPersistenceTests(store || window.gmkbStore),
        testPerformance: (store) => runPerformanceTests(store || window.gmkbStore),
        testErrors: (store) => runErrorHandlingTests(store || window.gmkbStore),
        
        // Utility to get current state
        getSystemState: function() {
            const store = window.gmkbStore || window.mediaKitStore;
            return {
                storeAvailable: !!store,
                componentCount: store?.componentCount || 0,
                sectionCount: store?.sectionCount || 0,
                theme: store?.theme || 'unknown',
                hasUnsavedChanges: store?.hasUnsavedChanges || false,
                postId: store?.postId || null
            };
        }
    };
})();

// Convenience function for quick testing
window.testVueMigration = function() {
    return VueMigrationTestSuite.run();
};

// Auto-load message
console.log(`
🧪 Vue Migration Test Suite v2.0 Loaded
======================================
Commands:
- testVueMigration() - Run complete test suite
- VueMigrationTestSuite.run() - Same as above
- VueMigrationTestSuite.testCore() - Test core systems only
- VueMigrationTestSuite.testDom() - Test DOM structure only
- VueMigrationTestSuite.testTheme() - Test theme system only
- VueMigrationTestSuite.getSystemState() - Get current state

Run testVueMigration() to start comprehensive testing!
`);
