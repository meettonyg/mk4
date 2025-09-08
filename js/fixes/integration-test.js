/**
 * Media Kit Builder Integration Test
 * Tests all fixes applied on 2025-01-03
 * 
 * @version 2.0.0
 * @date 2025-01-03
 */

(function() {
    'use strict';
    
    console.log('🧪 MEDIA KIT BUILDER INTEGRATION TEST v2.0');
    console.log('=' .repeat(70));
    console.log('Testing all component systems and fixes...\n');
    
    const testResults = {
        passed: 0,
        failed: 0,
        warnings: 0,
        tests: {}
    };
    
    /**
     * Test 1: Component Controls Manager
     */
    const testComponentControls = () => {
        console.log('📍 TEST 1: Component Controls Manager');
        const results = [];
        
        // Check if manager exists
        if (window.componentControlsManager) {
            results.push({ test: 'Manager exists', status: 'PASS' });
            
            // Check control definitions
            const controlDefs = window.componentControlsManager.controlDefinitions;
            const expectedControls = ['edit', 'move-up', 'move-down', 'duplicate', 'delete'];
            const hasAllControls = expectedControls.every(control => control in controlDefs);
            
            results.push({ 
                test: 'All control types defined', 
                status: hasAllControls ? 'PASS' : 'FAIL',
                details: hasAllControls ? null : 'Missing control definitions'
            });
            
            // Check for components with controls
            const components = document.querySelectorAll('[data-component-id]');
            const componentsWithControls = Array.from(components).filter(comp => 
                comp.querySelector('.component-controls--dynamic')
            );
            
            results.push({
                test: 'Controls attached to components',
                status: componentsWithControls.length > 0 ? 'PASS' : 'WARN',
                details: `${componentsWithControls.length}/${components.length} components have controls`
            });
            
            // Test control visibility
            if (componentsWithControls.length > 0) {
                const firstComponent = componentsWithControls[0];
                const controls = firstComponent.querySelector('.component-controls--dynamic');
                
                // Simulate hover
                firstComponent.dispatchEvent(new MouseEvent('mouseenter'));
                
                setTimeout(() => {
                    const isVisible = window.getComputedStyle(controls).opacity !== '0';
                    results.push({
                        test: 'Controls show on hover',
                        status: isVisible ? 'PASS' : 'FAIL',
                        details: isVisible ? null : 'Controls not becoming visible on hover'
                    });
                }, 100);
            }
            
        } else {
            results.push({ test: 'Manager exists', status: 'FAIL', details: 'componentControlsManager not found' });
        }
        
        return results;
    };
    
    /**
     * Test 2: Theme System
     */
    const testThemeSystem = () => {
        console.log('\n📍 TEST 2: Theme System');
        const results = [];
        
        // Check theme manager
        if (window.themeManager) {
            results.push({ test: 'Theme Manager exists', status: 'PASS' });
            
            // Check available themes
            const themes = window.themeManager.getAvailableThemes();
            results.push({
                test: 'Themes loaded',
                status: themes.length > 0 ? 'PASS' : 'FAIL',
                details: `Found ${themes.length} themes`
            });
            
            // Check current theme
            const currentTheme = window.themeManager.getCurrentTheme();
            results.push({
                test: 'Current theme set',
                status: currentTheme ? 'PASS' : 'FAIL',
                details: currentTheme ? `Active: ${currentTheme.theme_name}` : 'No theme active'
            });
            
        } else {
            results.push({ test: 'Theme Manager exists', status: 'FAIL', details: 'themeManager not found' });
        }
        
        // Check theme UI
        const themeButton = document.querySelector('.gmkb-theme-button, #global-theme-btn, .toolbar__btn--theme');
        results.push({
            test: 'Theme button exists',
            status: themeButton ? 'PASS' : 'FAIL'
        });
        
        const themeDropdown = document.querySelector('.gmkb-theme-dropdown');
        results.push({
            test: 'Theme dropdown exists',
            status: themeDropdown ? 'PASS' : 'FAIL'
        });
        
        const themeCustomizer = document.getElementById('gmkb-theme-customizer');
        results.push({
            test: 'Theme customizer panel exists',
            status: themeCustomizer ? 'PASS' : 'FAIL'
        });
        
        return results;
    };
    
    /**
     * Test 3: Toolbar System
     */
    const testToolbarSystem = () => {
        console.log('\n📍 TEST 3: Toolbar System');
        const results = [];
        
        // Check toolbar exists
        const toolbar = document.querySelector('.gmkb-toolbar-actions, .toolbar, #gmkb-toolbar, [data-toolbar]');
        results.push({
            test: 'Toolbar exists',
            status: toolbar ? 'PASS' : 'FAIL'
        });
        
        // Check device preview buttons
        const previewButtons = document.querySelectorAll('.toolbar__preview-btn');
        results.push({
            test: 'Device preview buttons',
            status: previewButtons.length >= 3 ? 'PASS' : 'WARN',
            details: `Found ${previewButtons.length} preview buttons (expected 3)`
        });
        
        // Check core buttons
        const buttons = {
            save: document.getElementById('save-btn'),
            export: document.querySelector('.toolbar__button--export, #export-btn'),
            import: document.querySelector('.toolbar__button--import'),
            undo: document.getElementById('undo-btn'),
            redo: document.getElementById('redo-btn')
        };
        
        Object.entries(buttons).forEach(([name, button]) => {
            results.push({
                test: `${name.charAt(0).toUpperCase() + name.slice(1)} button`,
                status: button ? 'PASS' : 'WARN',
                details: button ? null : 'Button not found'
            });
        });
        
        return results;
    };
    
    /**
     * Test 4: State Management
     */
    const testStateManagement = () => {
        console.log('\n📍 TEST 4: State Management');
        const results = [];
        
        // Check state manager
        if (window.enhancedStateManager) {
            results.push({ test: 'State Manager exists', status: 'PASS' });
            
            // Get current state
            const state = window.enhancedStateManager.getState();
            results.push({
                test: 'State accessible',
                status: state ? 'PASS' : 'FAIL'
            });
            
            if (state) {
                // Check state structure
                const hasComponents = 'components' in state;
                const hasSections = 'sections' in state;
                const hasLayout = 'layout' in state;
                
                results.push({
                    test: 'State structure valid',
                    status: hasComponents && hasSections && hasLayout ? 'PASS' : 'FAIL',
                    details: `Components: ${hasComponents}, Sections: ${hasSections}, Layout: ${hasLayout}`
                });
                
                // Check state size (for auto-save)
                const stateSize = JSON.stringify(state).length;
                const sizeKB = (stateSize / 1024).toFixed(2);
                const sizeOK = stateSize < 65536;
                
                results.push({
                    test: 'State size for auto-save',
                    status: sizeOK ? 'PASS' : 'WARN',
                    details: `${sizeKB}KB (limit: 64KB)`
                });
            }
            
        } else {
            results.push({ test: 'State Manager exists', status: 'FAIL' });
        }
        
        // Check undo/redo
        if (window.stateHistory) {
            results.push({ test: 'History manager exists', status: 'PASS' });
            
            const canUndo = window.stateHistory.canUndo();
            const canRedo = window.stateHistory.canRedo();
            
            results.push({
                test: 'History functionality',
                status: 'PASS',
                details: `Can undo: ${canUndo}, Can redo: ${canRedo}`
            });
        } else {
            results.push({ test: 'History manager exists', status: 'WARN' });
        }
        
        return results;
    };
    
    /**
     * Test 5: Data Binding
     */
    const testDataBinding = () => {
        console.log('\n📍 TEST 5: Data Binding Engine');
        const results = [];
        
        if (window.dataBindingEngine) {
            results.push({ test: 'DataBindingEngine exists', status: 'PASS' });
            
            // Test field path validation fix
            const testCases = [
                { fieldPath: null, expected: null },
                { fieldPath: undefined, expected: null },
                { fieldPath: 123, expected: null },
                { fieldPath: 'valid.path', expected: 'success' }
            ];
            
            let allPassed = true;
            testCases.forEach(testCase => {
                try {
                    const result = window.dataBindingEngine.resolveDataField(
                        { valid: { path: 'success' } },
                        testCase.fieldPath
                    );
                    if ((testCase.expected === null && result !== null) ||
                        (testCase.expected === 'success' && result !== 'success')) {
                        allPassed = false;
                    }
                } catch (error) {
                    allPassed = false;
                }
            });
            
            results.push({
                test: 'Field path validation',
                status: allPassed ? 'PASS' : 'FAIL',
                details: allPassed ? 'No errors on invalid paths' : 'Still throwing errors'
            });
            
        } else {
            results.push({ test: 'DataBindingEngine exists', status: 'FAIL' });
        }
        
        return results;
    };
    
    /**
     * Test 6: Component Library
     */
    const testComponentLibrary = () => {
        console.log('\n📍 TEST 6: Component Library');
        const results = [];
        
        // Check if library modal exists
        const libraryModal = document.getElementById('component-library-overlay');
        results.push({
            test: 'Component library modal',
            status: libraryModal ? 'PASS' : 'WARN'
        });
        
        // Check registry
        if (window.GMKBComponentRegistry) {
            results.push({ test: 'Component registry exists', status: 'PASS' });
            
            const components = window.GMKBComponentRegistry.getComponents();
            results.push({
                test: 'Components registered',
                status: components.length > 0 ? 'PASS' : 'FAIL',
                details: `${components.length} components available`
            });
        } else {
            results.push({ test: 'Component registry exists', status: 'FAIL' });
        }
        
        return results;
    };
    
    /**
     * Run all tests
     */
    const runAllTests = async () => {
        // Run each test suite
        const testSuites = [
            { name: 'Component Controls', fn: testComponentControls },
            { name: 'Theme System', fn: testThemeSystem },
            { name: 'Toolbar System', fn: testToolbarSystem },
            { name: 'State Management', fn: testStateManagement },
            { name: 'Data Binding', fn: testDataBinding },
            { name: 'Component Library', fn: testComponentLibrary }
        ];
        
        for (const suite of testSuites) {
            const results = await suite.fn();
            testResults.tests[suite.name] = results;
            
            // Count results
            results.forEach(result => {
                if (result.status === 'PASS') testResults.passed++;
                else if (result.status === 'FAIL') testResults.failed++;
                else if (result.status === 'WARN') testResults.warnings++;
            });
        }
        
        // Display summary
        displaySummary();
    };
    
    /**
     * Display test summary
     */
    const displaySummary = () => {
        console.log('\n' + '=' .repeat(70));
        console.log('📊 TEST SUMMARY');
        console.log('=' .repeat(70));
        
        const total = testResults.passed + testResults.failed + testResults.warnings;
        const passRate = ((testResults.passed / total) * 100).toFixed(1);
        
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`⚠️ Warnings: ${testResults.warnings}`);
        console.log(`Pass Rate: ${passRate}%`);
        
        // Show failed tests
        if (testResults.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            Object.entries(testResults.tests).forEach(([suite, results]) => {
                const failed = results.filter(r => r.status === 'FAIL');
                if (failed.length > 0) {
                    console.log(`\n${suite}:`);
                    failed.forEach(test => {
                        console.log(`  - ${test.test}${test.details ? `: ${test.details}` : ''}`);
                    });
                }
            });
        }
        
        // Show warnings
        if (testResults.warnings > 0) {
            console.log('\n⚠️ WARNINGS:');
            Object.entries(testResults.tests).forEach(([suite, results]) => {
                const warnings = results.filter(r => r.status === 'WARN');
                if (warnings.length > 0) {
                    console.log(`\n${suite}:`);
                    warnings.forEach(test => {
                        console.log(`  - ${test.test}${test.details ? `: ${test.details}` : ''}`);
                    });
                }
            });
        }
        
        // Overall status
        console.log('\n' + '=' .repeat(70));
        if (testResults.failed === 0 && testResults.warnings === 0) {
            console.log('✅ ALL TESTS PASSED! Media Kit Builder is fully functional.');
        } else if (testResults.failed === 0) {
            console.log('✅ Core functionality working. Some minor issues detected.');
        } else {
            console.log('❌ Critical issues detected. Please run fixCriticalIssues()');
        }
        
        // Provide fix functions
        console.log('\n🔧 AVAILABLE FIX FUNCTIONS:');
        console.log('  fixCriticalIssues() - Fix all critical failures');
        console.log('  fixMoveButtons() - Fix move up/down buttons');
        console.log('  fixThemeUI() - Fix theme customizer UI');
        console.log('  fixAllControls() - Reattach controls to all components');
        console.log('  runDiagnostics() - Run detailed diagnostics');
    };
    
    // Run tests after a short delay to ensure everything is loaded
    setTimeout(runAllTests, 500);
    
    // Expose fix functions globally
    window.fixCriticalIssues = () => {
        console.log('🔧 Fixing critical issues...');
        
        // Fix move buttons
        if (window.componentControlsManager) {
            window.componentControlsManager.attachControlsToAllExistingComponents();
        }
        
        // Fix theme UI
        if (window.consolidatedToolbar) {
            window.consolidatedToolbar.createThemeButton();
            window.consolidatedToolbar.createDevicePreviewButtons();
        }
        
        // Fix export/import buttons
        if (window.gmkbExportImportUI) {
            window.gmkbExportImportUI.addToolbarButtons();
        }
        
        console.log('✅ Critical fixes applied. Re-run tests with runIntegrationTest()');
    };
    
    window.fixMoveButtons = () => {
        console.log('🔧 Fixing move buttons...');
        
        const components = document.querySelectorAll('[data-component-id]');
        let fixed = 0;
        
        components.forEach(component => {
            const componentId = component.getAttribute('data-component-id');
            if (componentId && window.componentControlsManager) {
                // Remove existing controls first
                const existingControls = component.querySelector('.component-controls--dynamic');
                if (existingControls) {
                    existingControls.remove();
                }
                
                // Reattach controls
                if (window.componentControlsManager.attachControls(component, componentId)) {
                    fixed++;
                }
            }
        });
        
        console.log(`✅ Fixed controls for ${fixed} components`);
    };
    
    window.fixThemeUI = () => {
        console.log('🔧 Fixing theme UI...');
        
        // Ensure theme button exists
        if (window.consolidatedToolbar) {
            window.consolidatedToolbar.createThemeButton();
        }
        
        // Ensure theme customizer is initialized
        if (window.themeCustomizer && !document.getElementById('gmkb-theme-customizer')) {
            window.themeCustomizer.createCustomizerUI();
        }
        
        console.log('✅ Theme UI fixed');
    };
    
    window.fixAllControls = () => {
        if (window.componentControlsManager) {
            window.componentControlsManager.attachControlsToAllExistingComponents();
            console.log('✅ Controls reattached to all components');
        } else {
            console.error('❌ Component controls manager not found');
        }
    };
    
    window.runDiagnostics = () => {
        console.group('🔍 MEDIA KIT BUILDER DIAGNOSTICS');
        
        // System status
        console.group('System Components');
        const systems = {
            'State Manager': window.enhancedStateManager,
            'Component Manager': window.enhancedComponentManager,
            'Theme Manager': window.themeManager,
            'Controls Manager': window.componentControlsManager,
            'Toolbar': window.consolidatedToolbar,
            'Data Binding': window.dataBindingEngine,
            'Component Registry': window.GMKBComponentRegistry
        };
        
        Object.entries(systems).forEach(([name, system]) => {
            console.log(`${name}: ${system ? '✅ Loaded' : '❌ Missing'}`);
        });
        console.groupEnd();
        
        // DOM elements
        console.group('DOM Elements');
        const elements = {
            'Toolbar': '.gmkb-toolbar-actions, .toolbar, #gmkb-toolbar',
            'Save Button': '#save-btn',
            'Theme Button': '.gmkb-theme-button, #global-theme-btn',
            'Preview Buttons': '.toolbar__preview-btn',
            'Components': '[data-component-id]',
            'Sections': '.gmkb-section'
        };
        
        Object.entries(elements).forEach(([name, selector]) => {
            const count = document.querySelectorAll(selector).length;
            console.log(`${name}: ${count > 0 ? `✅ ${count} found` : '❌ Not found'}`);
        });
        console.groupEnd();
        
        // State info
        if (window.enhancedStateManager) {
            console.group('State Information');
            const state = window.enhancedStateManager.getState();
            if (state) {
                console.log(`Components: ${Object.keys(state.components || {}).length}`);
                console.log(`Sections: ${Object.keys(state.sections || {}).length}`);
                console.log(`Layout items: ${(state.layout || []).length}`);
                const stateSize = JSON.stringify(state).length;
                console.log(`State size: ${(stateSize / 1024).toFixed(2)}KB`);
            }
            console.groupEnd();
        }
        
        console.groupEnd();
    };
    
    // Expose test runner globally
    window.runIntegrationTest = runAllTests;
    
    // Return results for immediate use
    return testResults;
    
})();
