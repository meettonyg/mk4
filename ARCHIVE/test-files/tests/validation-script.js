/**
 * GMKB Validation Script
 * Run this in browser console to validate all systems are working
 */

function validateGMKBSystems() {
    console.log('%c🔍 GMKB SYSTEM VALIDATION STARTING...', 'font-weight: bold; color: #3b82f6; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');
    
    const results = {
        coreFiles: {},
        uiFiles: {},
        globalObjects: {},
        initialization: {},
        functionality: {},
        errors: []
    };
    
    // Test 1: Check Core Files
    console.log('\n📋 1. CORE SYSTEM FILES:');
    const coreTests = [
        { name: 'Structured Logger', check: () => typeof window.structuredLogger === 'object' && window.structuredLogger !== null },
        { name: 'Enhanced State Manager', check: () => typeof window.enhancedStateManager === 'object' && window.enhancedStateManager !== null },
        { name: 'Enhanced Component Manager', check: () => typeof window.enhancedComponentManager === 'object' && window.enhancedComponentManager !== null },
        { name: 'Enhanced Component Renderer', check: () => typeof window.enhancedComponentRenderer === 'object' && window.enhancedComponentRenderer !== null },
        { name: 'Empty State Handlers', check: () => typeof window.emptyStateHandlers === 'object' && window.emptyStateHandlers !== null },
        { name: 'Component Library System', check: () => typeof window.componentLibrarySystem === 'object' && window.componentLibrarySystem !== null }
    ];
    
    coreTests.forEach(test => {
        const passed = test.check();
        results.coreFiles[test.name] = passed;
        console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'LOADED' : 'MISSING'}`);
    });
    
    // Test 2: Check UI Files
    console.log('\n🖼️ 2. UI SYSTEM FILES:');
    const uiTests = [
        { name: 'Design Panel', check: () => typeof window.designPanel === 'object' && window.designPanel !== null },
        { name: 'Element Controls', check: () => typeof window.elementControls === 'object' && window.elementControls !== null },
        { name: 'Form Controls', check: () => typeof window.formControls === 'object' && window.formControls !== null },
        { name: 'Tabs System', check: () => typeof window.setupTabs === 'function' },
        { name: 'Preview Toggle', check: () => typeof window.setupPreviewToggle === 'function' }
    ];
    
    uiTests.forEach(test => {
        const passed = test.check();
        results.uiFiles[test.name] = passed;
        console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'LOADED' : 'MISSING'}`);
    });
    
    // Test 3: Check Global Objects
    console.log('\n🌐 3. GLOBAL OBJECTS:');
    const globalTests = [
        { name: 'GMKB Data', check: () => typeof window.gmkbData === 'object' && window.gmkbData !== null },
        { name: 'Guestify Data', check: () => typeof window.guestifyData === 'object' && window.guestifyData !== null },
        { name: 'Component Data', check: () => Array.isArray(window.gmkbComponentsData) },
        { name: 'Main App Object', check: () => typeof window.gmkbApp === 'object' && window.gmkbApp !== null }
    ];
    
    globalTests.forEach(test => {
        const passed = test.check();
        results.globalObjects[test.name] = passed;
        console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'AVAILABLE' : 'MISSING'}`);
        
        // Additional info for component data
        if (test.name === 'Component Data' && passed) {
            console.log(`   📊 ${window.gmkbComponentsData.length} components available`);
        }
    });
    
    // Test 4: Check Initialization Status
    console.log('\n🚀 4. INITIALIZATION STATUS:');
    const initTests = [
        { 
            name: 'App Ready', 
            check: () => window.gmkbApp && window.gmkbApp.isReady && window.gmkbApp.isReady() 
        },
        { 
            name: 'App Initialized', 
            check: () => window.gmkbApp && window.gmkbApp.isInitialized && window.gmkbApp.isInitialized() 
        },
        { 
            name: 'State Manager Ready', 
            check: () => window.enhancedStateManager && window.enhancedStateManager.isInitialized && window.enhancedStateManager.isInitialized() 
        },
        { 
            name: 'Component Manager Ready', 
            check: () => window.enhancedComponentManager && window.enhancedComponentManager.isInitialized 
        }
    ];
    
    initTests.forEach(test => {
        try {
            const passed = test.check();
            results.initialization[test.name] = passed;
            console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'YES' : 'NO'}`);
        } catch (error) {
            results.initialization[test.name] = false;
            results.errors.push(`${test.name}: ${error.message}`);
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        }
    });
    
    // Test 5: Check Functionality
    console.log('\n⚙️ 5. FUNCTIONALITY TESTS:');
    const funcTests = [
        {
            name: 'State Manager Get State',
            check: () => window.enhancedStateManager && typeof window.enhancedStateManager.getState === 'function'
        },
        {
            name: 'Component Manager Add Component',
            check: () => window.enhancedComponentManager && typeof window.enhancedComponentManager.addComponent === 'function'
        },
        {
            name: 'Design Panel Load',
            check: () => window.designPanel && typeof window.designPanel.load === 'function'
        },
        {
            name: 'Save Functionality',
            check: () => window.gmkbApp && typeof window.gmkbApp.save === 'function'
        }
    ];
    
    funcTests.forEach(test => {
        try {
            const passed = test.check();
            results.functionality[test.name] = passed;
            console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'AVAILABLE' : 'MISSING'}`);
        } catch (error) {
            results.functionality[test.name] = false;
            results.errors.push(`${test.name}: ${error.message}`);
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        }
    });
    
    // Test 6: DOM Elements Check
    console.log('\n📄 6. CRITICAL DOM ELEMENTS:');
    const domTests = [
        { name: 'Preview Container', selector: '#media-kit-preview' },
        { name: 'Component Library', selector: '#component-library-overlay' },
        { name: 'Design Panel', selector: '#element-editor' },
        { name: 'Sidebar Tabs', selector: '.sidebar__tabs, .sidebar .tabs' },
        { name: 'Save Button', selector: '#save-btn' }
    ];
    
    domTests.forEach(test => {
        const element = document.querySelector(test.selector);
        const passed = element !== null;
        console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'FOUND' : 'MISSING'}`);
        if (!passed) {
            results.errors.push(`Missing DOM element: ${test.selector}`);
        }
    });
    
    // Summary
    const coreCount = Object.values(results.coreFiles).filter(Boolean).length;
    const uiCount = Object.values(results.uiFiles).filter(Boolean).length;
    const globalCount = Object.values(results.globalObjects).filter(Boolean).length;
    const initCount = Object.values(results.initialization).filter(Boolean).length;
    const funcCount = Object.values(results.functionality).filter(Boolean).length;
    
    console.log('\n📊 VALIDATION SUMMARY:');
    console.log(`Core Files: ${coreCount}/${coreTests.length} loaded`);
    console.log(`UI Files: ${uiCount}/${uiTests.length} loaded`);
    console.log(`Global Objects: ${globalCount}/${globalTests.length} available`);
    console.log(`Initialization: ${initCount}/${initTests.length} ready`);
    console.log(`Functionality: ${funcCount}/${funcTests.length} available`);
    
    const totalTests = coreTests.length + uiTests.length + globalTests.length + initTests.length + funcTests.length;
    const totalPassed = coreCount + uiCount + globalCount + initCount + funcCount;
    const successRate = Math.round((totalPassed / totalTests) * 100);
    
    if (successRate >= 90) {
        console.log(`%c🎉 OVERALL STATUS: EXCELLENT (${successRate}%)`, 'font-weight: bold; color: #10b981; background: #ecfdf5; padding: 4px 8px; border-radius: 4px;');
        console.log('✅ Media Kit Builder should be working correctly!');
    } else if (successRate >= 70) {
        console.log(`%c⚠️ OVERALL STATUS: GOOD (${successRate}%)`, 'font-weight: bold; color: #f59e0b; background: #fffbeb; padding: 4px 8px; border-radius: 4px;');
        console.log('⚠️ Media Kit Builder should work but may have some issues.');
    } else {
        console.log(`%c❌ OVERALL STATUS: NEEDS ATTENTION (${successRate}%)`, 'font-weight: bold; color: #ef4444; background: #fef2f2; padding: 4px 8px; border-radius: 4px;');
        console.log('❌ Media Kit Builder likely has significant issues.');
    }
    
    if (results.errors.length > 0) {
        console.log('\n🔍 ERRORS ENCOUNTERED:');
        results.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    // Quick fix suggestions
    if (successRate < 90) {
        console.log('\n🔧 QUICK FIX SUGGESTIONS:');
        if (coreCount < coreTests.length) {
            console.log('   • Refresh the page to reload core systems');
        }
        if (uiCount < uiTests.length) {
            console.log('   • Check browser console for JavaScript errors');
        }
        if (initCount < initTests.length) {
            console.log('   • Wait a few seconds for systems to initialize');
            console.log('   • Try: window.gmkbApp.initialize()');
        }
    }
    
    return {
        successRate,
        results,
        recommendation: successRate >= 90 ? 'Ready to use' : successRate >= 70 ? 'Needs minor fixes' : 'Needs major attention'
    };
}

// Run validation immediately if this script is loaded
if (typeof window !== 'undefined') {
    // Wait for DOM and a bit for scripts to load
    setTimeout(() => {
        window.validateGMKBSystems = validateGMKBSystems;
        console.log('🔧 Validation script loaded. Run validateGMKBSystems() to check system status.');
    }, 1000);
}
