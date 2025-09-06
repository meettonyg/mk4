/**
 * Test Suite Loader
 * Loads and runs all test files for the Media Kit Builder
 * 
 * @version 1.0.0
 */
(function() {
    'use strict';
    
    console.log('🧪 Test Suite Loader initializing...');
    
    class TestSuiteLoader {
        constructor() {
            this.testFiles = {
                core: [
                    'test-A1-component-discovery.js',
                    'test-A2-add-component.js',
                    'test-A3-edit-component.js',
                    'test-A4-duplicate-component.js',
                    'test-A5-delete-component.js',
                    'test-A6-reorder-components.js'
                ],
                state: [
                    'test-B1-initialize-saved-data.js',
                    'test-B2-auto-save.js',
                    'test-B3-undo-redo.js'
                ],
                ui: [
                    'test-C2-toolbar-functionality.js'
                ],
                integration: [
                    'test-D1-wordpress-integration.js'
                ],
                phase: [
                    'test-phase1-fixes.js',
                    'test-phase2-implementation.js',
                    'test-phase3-optimization.js',
                    'test-phase-integration.js'
                ],
                fixes: [
                    'test-blank-screen-fix.js',
                    'test-component-controls-fix.js',
                    'test-drag-drop-section-fix.js',
                    'test-empty-state-section-support.js'
                ]
            };
            
            this.results = {
                total: 0,
                loaded: 0,
                failed: 0,
                tests: []
            };
            
            this.basePath = '/wp-content/plugins/guestify-media-kit-builder/tests/';
        }
        
        /**
         * Load a single test file
         */
        async loadTestFile(filename, category) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                const testId = `test-${category}-${filename.replace('.js', '')}`;
                
                script.src = this.basePath + filename;
                script.id = testId;
                
                script.onload = () => {
                    console.log(`✅ Loaded: ${filename}`);
                    this.results.loaded++;
                    this.results.tests.push({
                        file: filename,
                        category: category,
                        status: 'loaded'
                    });
                    resolve();
                };
                
                script.onerror = () => {
                    console.warn(`⚠️ Failed to load: ${filename}`);
                    this.results.failed++;
                    this.results.tests.push({
                        file: filename,
                        category: category,
                        status: 'failed'
                    });
                    resolve(); // Don't reject, continue loading other tests
                };
                
                // Remove existing script if it exists
                const existing = document.getElementById(testId);
                if (existing) {
                    existing.remove();
                }
                
                document.head.appendChild(script);
            });
        }
        
        /**
         * Load all tests in a category
         */
        async loadCategory(category) {
            const files = this.testFiles[category];
            if (!files || files.length === 0) {
                console.warn(`No tests found for category: ${category}`);
                return;
            }
            
            console.log(`\n📂 Loading ${category} tests...`);
            
            for (const file of files) {
                this.results.total++;
                await this.loadTestFile(file, category);
            }
        }
        
        /**
         * Load all test files
         */
        async loadAllTests() {
            console.log('🚀 Loading all test files...\n');
            
            this.results = {
                total: 0,
                loaded: 0,
                failed: 0,
                tests: []
            };
            
            const categories = Object.keys(this.testFiles);
            
            for (const category of categories) {
                await this.loadCategory(category);
            }
            
            this.printSummary();
            
            return this.results;
        }
        
        /**
         * Load specific categories
         */
        async loadCategories(categories) {
            console.log(`🚀 Loading test categories: ${categories.join(', ')}\n`);
            
            this.results = {
                total: 0,
                loaded: 0,
                failed: 0,
                tests: []
            };
            
            for (const category of categories) {
                if (this.testFiles[category]) {
                    await this.loadCategory(category);
                } else {
                    console.warn(`Unknown category: ${category}`);
                }
            }
            
            this.printSummary();
            
            return this.results;
        }
        
        /**
         * Print loading summary
         */
        printSummary() {
            console.log('\n' + '='.repeat(60));
            console.log('📊 Test Loading Summary');
            console.log('='.repeat(60));
            console.log(`Total Files: ${this.results.total}`);
            console.log(`✅ Loaded: ${this.results.loaded}`);
            console.log(`❌ Failed: ${this.results.failed}`);
            console.log(`Success Rate: ${Math.round((this.results.loaded / this.results.total) * 100)}%`);
            
            if (this.results.failed > 0) {
                console.log('\n⚠️ Failed to load:');
                this.results.tests
                    .filter(t => t.status === 'failed')
                    .forEach(t => console.log(`  - ${t.file} (${t.category})`));
            }
            
            console.log('='.repeat(60));
        }
        
        /**
         * Run loaded tests (if they have a run function)
         */
        async runLoadedTests() {
            console.log('\n🏃 Running loaded tests...\n');
            
            const testFunctions = [
                'runComponentDiscoveryTests',
                'runAddComponentTests',
                'runEditComponentTests',
                'runDuplicateComponentTests',
                'runDeleteComponentTests',
                'runReorderComponentTests',
                'runStateInitializationTests',
                'runAutoSaveTests',
                'runUndoRedoTests',
                'runToolbarTests',
                'runWordPressIntegrationTests'
            ];
            
            let testsRun = 0;
            
            for (const funcName of testFunctions) {
                if (typeof window[funcName] === 'function') {
                    console.log(`🔄 Running ${funcName}...`);
                    try {
                        await window[funcName]();
                        testsRun++;
                    } catch (error) {
                        console.error(`❌ Error running ${funcName}:`, error);
                    }
                }
            }
            
            console.log(`\n✅ Ran ${testsRun} test suites`);
            
            return testsRun;
        }
    }
    
    // Create global test suite loader
    window.testSuiteLoader = new TestSuiteLoader();
    
    // Global functions for easy access
    window.loadAllTests = async function() {
        return await window.testSuiteLoader.loadAllTests();
    };
    
    window.loadTestCategory = async function(category) {
        return await window.testSuiteLoader.loadCategories([category]);
    };
    
    window.runAllTests = async function() {
        console.log('🎯 Running complete test suite...\n');
        
        // First load all tests
        const loadResults = await window.testSuiteLoader.loadAllTests();
        
        if (loadResults.loaded === 0) {
            console.error('❌ No tests were loaded successfully');
            return false;
        }
        
        // Then run them
        const testsRun = await window.testSuiteLoader.runLoadedTests();
        
        console.log('\n🎉 Test suite complete!');
        console.log(`Tests loaded: ${loadResults.loaded}`);
        console.log(`Test suites run: ${testsRun}`);
        
        return {
            loaded: loadResults,
            run: testsRun
        };
    };
    
    window.runQuickTests = async function() {
        console.log('⚡ Running quick tests...\n');
        
        // Load only core and state tests
        const loadResults = await window.testSuiteLoader.loadCategories(['core', 'state']);
        
        if (loadResults.loaded === 0) {
            console.error('❌ No tests were loaded successfully');
            return false;
        }
        
        // Run loaded tests
        const testsRun = await window.testSuiteLoader.runLoadedTests();
        
        return {
            loaded: loadResults,
            run: testsRun
        };
    };
    
    // Quick diagnostic function
    window.runQuickDiagnostic = function() {
        console.log('\n🔍 Quick System Diagnostic\n');
        console.log('='.repeat(60));
        
        const checks = {
            'GMKB System': !!window.GMKB,
            'State Manager': !!window.enhancedStateManager,
            'Component Manager': !!window.enhancedComponentManager,
            'Component Renderer': !!window.enhancedComponentRenderer,
            'Controls Manager': !!window.componentControlsManager,
            'Modal System': !!window.GMKB_Modals,
            'Event Bus': !!window.eventBus,
            'Template Cache': !!window.templateCache,
            'Section Manager': !!window.sectionLayoutManager,
            'Section Renderer': !!window.sectionRenderer
        };
        
        let passCount = 0;
        let totalCount = 0;
        
        for (const [system, status] of Object.entries(checks)) {
            console.log(`${status ? '✅' : '❌'} ${system}: ${status ? 'Ready' : 'Not Found'}`);
            if (status) passCount++;
            totalCount++;
        }
        
        console.log('='.repeat(60));
        console.log(`System Health: ${Math.round((passCount / totalCount) * 100)}%`);
        
        // Check current state
        const state = window.enhancedStateManager?.getState();
        if (state) {
            console.log(`\n📊 Current State:`);
            console.log(`  Components: ${state.components?.length || 0}`);
            console.log(`  Sections: ${state.sections?.length || 0}`);
            console.log(`  Last Save: ${state.lastSaved || 'Never'}`);
            console.log(`  Debug Mode: ${window.gmkbData?.debugMode ? 'ON' : 'OFF'}`);
        }
        
        console.log('='.repeat(60));
        
        return {
            systems: checks,
            health: Math.round((passCount / totalCount) * 100),
            state: state
        };
    };
    
    console.log('✅ Test Suite Loader ready!');
    console.log('Available commands:');
    console.log('  window.runAllTests() - Load and run all tests');
    console.log('  window.runQuickTests() - Run core and state tests only');
    console.log('  window.loadAllTests() - Load all test files');
    console.log('  window.loadTestCategory(category) - Load specific category');
    console.log('  window.runQuickDiagnostic() - Quick system health check');
    
})();