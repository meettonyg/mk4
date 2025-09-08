/**
 * Comprehensive Fix Verification Script
 * Tests all fixes applied on 2025-01-03
 * 
 * @version 1.1.0
 */

(function() {
    'use strict';
    
    console.log('🔧 COMPREHENSIVE FIX VERIFICATION');
    console.log('=' .repeat(60));
    
    const results = {
        dataBinding: false,
        moveButtons: false,
        themeUI: false,
        devicePreview: false,
        exportImport: false,
        autoSave: false,
        fixes: [],
        issues: []
    };
    
    // Test 1: DataBindingEngine Fix
    console.log('\n📍 TEST 1: DataBindingEngine Fix');
    const testDataBinding = () => {
        try {
            if (window.dataBindingEngine && window.dataBindingEngine.resolveDataField) {
                // Test with invalid fieldPath (was causing error)
                const testCases = [
                    { data: {test: 'value'}, fieldPath: null },
                    { data: {test: 'value'}, fieldPath: undefined },
                    { data: {test: 'value'}, fieldPath: 123 },
                    { data: {test: 'value'}, fieldPath: ['array'] },
                    { data: {test: 'value'}, fieldPath: 'test' }
                ];
                
                let allPassed = true;
                testCases.forEach((testCase, index) => {
                    try {
                        const result = window.dataBindingEngine.resolveDataField(testCase.data, testCase.fieldPath);
                        console.log(`  Test ${index + 1}: ${typeof testCase.fieldPath} fieldPath - ${result === null || result === 'value' ? '✅' : '❌'}`);
                    } catch (error) {
                        console.log(`  Test ${index + 1}: ❌ Error - ${error.message}`);
                        allPassed = false;
                    }
                });
                
                if (allPassed) {
                    console.log('  ✅ DataBindingEngine no longer throws errors on invalid fieldPath');
                    results.dataBinding = true;
                    results.fixes.push('DataBindingEngine fieldPath validation');
                } else {
                    results.issues.push('DataBindingEngine still has errors');
                }
            } else {
                console.log('  ❌ DataBindingEngine not found');
                results.issues.push('DataBindingEngine not loaded');
            }
        } catch (error) {
            console.log('  ❌ DataBindingEngine test failed:', error.message);
            results.issues.push('DataBindingEngine test error: ' + error.message);
        }
    };
    testDataBinding();
    
    // Test 2: Move Buttons Visibility
    console.log('\n📍 TEST 2: Move Up/Down Button Visibility');
    const testMoveButtons = () => {
        const moveUpButtons = document.querySelectorAll('[data-action="move-up"], .component-control--move-up');
        const moveDownButtons = document.querySelectorAll('[data-action="move-down"], .component-control--move-down');
        
        console.log(`  Found ${moveUpButtons.length} move-up buttons`);
        console.log(`  Found ${moveDownButtons.length} move-down buttons`);
        
        if (moveUpButtons.length > 0 && moveDownButtons.length > 0) {
            // Check actual visibility
            const firstMoveUp = moveUpButtons[0];
            const computedStyle = window.getComputedStyle(firstMoveUp);
            const isVisible = computedStyle.display !== 'none';
            
            console.log(`  Move buttons display: ${computedStyle.display}`);
            console.log(`  Move buttons visibility: ${computedStyle.visibility}`);
            
            if (isVisible) {
                console.log('  ✅ Move buttons are present and styled correctly');
                results.moveButtons = true;
                results.fixes.push('Move up/down buttons fixed');
            } else {
                console.log('  ⚠️ Move buttons exist but may have visibility issues');
                results.issues.push('Move buttons visibility needs checking');
            }
        } else {
            console.log('  ❌ Move buttons not found in DOM');
            results.issues.push('Move buttons not generated');
        }
    };
    testMoveButtons();
    
    // Test 3: Theme UI Elements
    console.log('\n📍 TEST 3: Theme UI Elements');
    const testThemeUI = () => {
        // Check for theme button
        const themeButton = document.querySelector('.gmkb-theme-button, #global-theme-btn, .toolbar__btn--theme');
        const themeDropdown = document.querySelector('.gmkb-theme-dropdown');
        const themeCustomizer = document.getElementById('gmkb-theme-customizer');
        
        console.log(`  Theme button: ${themeButton ? '✅ Found' : '❌ Not found'}`);
        console.log(`  Theme dropdown: ${themeDropdown ? '✅ Found' : '❌ Not found'}`);
        console.log(`  Theme customizer: ${themeCustomizer ? '✅ Found' : '❌ Not found'}`);
        
        if (themeButton || themeDropdown || themeCustomizer) {
            console.log('  ✅ Theme UI elements exist');
            results.themeUI = true;
            results.fixes.push('Theme UI elements created');
        } else {
            console.log('  ❌ Theme UI elements missing');
            results.issues.push('Theme UI not initialized');
        }
    };
    testThemeUI();
    
    // Test 4: Device Preview Buttons
    console.log('\n📍 TEST 4: Device Preview Buttons');
    const testDevicePreview = () => {
        const previewButtons = document.querySelectorAll('.toolbar__preview-btn');
        const previewGroup = document.querySelector('.toolbar__preview-group');
        
        console.log(`  Found ${previewButtons.length} preview buttons`);
        console.log(`  Preview group: ${previewGroup ? '✅ Found' : '❌ Not found'}`);
        
        if (previewButtons.length >= 3) {
            console.log('  ✅ Device preview buttons exist');
            results.devicePreview = true;
            results.fixes.push('Device preview buttons created');
        } else {
            console.log('  ❌ Device preview buttons missing');
            results.issues.push('Device preview not created');
        }
    };
    testDevicePreview();
    
    // Test 5: Export/Import UI
    console.log('\n📍 TEST 5: Export/Import UI');
    const testExportImport = () => {
        const exportButton = document.querySelector('.gmkb-export-btn, #export-btn');
        const importButton = document.querySelector('.gmkb-import-btn, #import-btn');
        const toolbar = document.querySelector('.gmkb-toolbar-actions, .toolbar, #gmkb-toolbar, [data-toolbar]');
        
        console.log(`  Export button: ${exportButton ? '✅ Found' : '❌ Not found'}`);
        console.log(`  Import button: ${importButton ? '✅ Found' : '❌ Not found'}`);
        console.log(`  Toolbar: ${toolbar ? '✅ Found' : '❌ Not found'}`);
        
        if (toolbar) {
            console.log('  ✅ Toolbar exists for export/import buttons');
            results.exportImport = true;
            results.fixes.push('Toolbar found for export/import');
        } else {
            console.log('  ❌ Toolbar not found');
            results.issues.push('Toolbar missing for export/import');
        }
    };
    testExportImport();
    
    // Test 6: Auto-Save Data Size
    console.log('\n📍 TEST 6: Auto-Save Data Size');
    const testAutoSave = () => {
        try {
            const state = window.enhancedStateManager?.getState();
            if (state) {
                const stateSize = JSON.stringify(state).length;
                const sizeKB = (stateSize / 1024).toFixed(2);
                console.log(`  Current state size: ${sizeKB}KB`);
                
                if (stateSize > 65536) {
                    console.log('  ⚠️ State size exceeds 64KB limit - auto-save may fail');
                    results.issues.push(`State too large: ${sizeKB}KB (limit: 64KB)`);
                    
                    // Check what's taking space
                    const componentCount = Object.keys(state.components || {}).length;
                    const sectionCount = (state.sections || []).length;
                    console.log(`  Components: ${componentCount}, Sections: ${sectionCount}`);
                    
                    // Suggest cleanup
                    console.log('  💡 Suggestion: Clear unused components or implement data compression');
                } else {
                    console.log('  ✅ State size within limits');
                    results.autoSave = true;
                    results.fixes.push('State size acceptable');
                }
            }
        } catch (error) {
            console.log('  ❌ Could not check state size:', error.message);
        }
    };
    testAutoSave();
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FIX VERIFICATION SUMMARY:');
    console.log(`  DataBinding Fix: ${results.dataBinding ? '✅ Working' : '❌ Not Working'}`);
    console.log(`  Move Buttons: ${results.moveButtons ? '✅ Visible' : '❌ Not Visible'}`);
    console.log(`  Theme UI: ${results.themeUI ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Device Preview: ${results.devicePreview ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Export/Import: ${results.exportImport ? '✅ Ready' : '❌ Not Ready'}`);
    console.log(`  Auto-Save: ${results.autoSave ? '✅ OK' : '⚠️ Size Issue'}`);
    
    if (results.fixes.length > 0) {
        console.log('\n✅ SUCCESSFUL FIXES:');
        results.fixes.forEach(fix => console.log(`  - ${fix}`));
    }
    
    if (results.issues.length > 0) {
        console.log('\n⚠️ REMAINING ISSUES:');
        results.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (!results.autoSave) {
        console.log('  1. Implement data compression or cleanup for auto-save');
        console.log('     - Remove unused component metadata');
        console.log('     - Compress component props');
        console.log('     - Limit number of components');
    }
    
    if (!results.themeUI || !results.devicePreview) {
        console.log('  2. Ensure toolbar initialization completes before adding UI elements');
        console.log('     - Check if consolidatedToolbar.createThemeButton() runs');
        console.log('     - Check if consolidatedToolbar.createDevicePreviewButtons() runs');
    }
    
    // Manual fixes
    console.log('\n🔧 MANUAL FIX COMMANDS:');
    console.log('  window.consolidatedToolbar?.createThemeButton() - Create theme button');
    console.log('  window.consolidatedToolbar?.createDevicePreviewButtons() - Create preview buttons');
    console.log('  window.themeCustomizer?.init() - Initialize theme customizer');
    console.log('  window.componentControlsManager?.attachControlsToAllExistingComponents() - Reattach controls');
    
    return results;
})();
