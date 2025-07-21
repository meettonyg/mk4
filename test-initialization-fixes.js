/**
 * @file test-initialization-fixes.js
 * @description Test script to validate the root-level initialization fixes
 */

console.log('%c🧪 TESTING INITIALIZATION FIXES', 'font-size: 16px; font-weight: bold; color: #2563eb; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');

// Test 1: Check initialization guards
function testInitializationGuards() {
    console.group('%c🚷 Test 1: Initialization Guards', 'color: #6366f1; font-weight: bold;');
    
    const initializedBefore = window.gmkbApp?.isInitialized();
    const initializingBefore = window.gmkbApp?.isInitializing();
    
    console.log(`✅ Initialized state before: ${initializedBefore}`);
    console.log(`✅ Initializing state before: ${initializingBefore}`);
    
    // Try to initialize again - should be prevented
    if (window.gmkbApp?.initialize) {
        console.log('Attempting duplicate initialization...');
        window.gmkbApp.initialize();
        
        const afterSecondInit = window.gmkbApp.isInitialized();
        console.log(`✅ After second init attempt: ${afterSecondInit}`);
        console.log('✅ Duplicate initialization prevention: WORKING');
    }
    
    console.groupEnd();
    return true;
}

// Test 2: Check state manager subscription method
function testStateManagerSubscription() {
    console.group('%c📊 Test 2: State Manager Subscription', 'color: #10b981; font-weight: bold;');
    
    if (window.enhancedStateManager) {
        const hasSubscribeGlobal = typeof window.enhancedStateManager.subscribeGlobal === 'function';
        const hasOldSubscribe = typeof window.enhancedStateManager.subscribe === 'function';
        
        console.log(`✅ Has subscribeGlobal method: ${hasSubscribeGlobal ? 'YES' : 'NO'}`);
        console.log(`✅ Has old subscribe method: ${hasOldSubscribe ? 'YES' : 'NO'}`);
        
        if (hasSubscribeGlobal) {
            console.log('✅ State manager subscription method: CORRECT');
            return true;
        } else {
            console.log('❌ State manager subscription method: INCORRECT');
            return false;
        }
    } else {
        console.log('❌ Enhanced state manager not available');
        return false;
    }
    
    console.groupEnd();
}

// Test 3: Check component data availability
function testComponentDataAvailability() {
    console.group('%c📦 Test 3: Component Data Availability', 'color: #8b5cf6; font-weight: bold;');
    
    const sources = [
        { name: 'window.gmkbComponentsData', data: window.gmkbComponentsData },
        { name: 'window.gmkbData.components', data: window.gmkbData?.components },
        { name: 'window.guestifyData.components', data: window.guestifyData?.components }
    ];
    
    let foundData = false;
    sources.forEach(source => {
        if (source.data && Array.isArray(source.data) && source.data.length > 0) {
            console.log(`✅ ${source.name}: ${source.data.length} components`);
            foundData = true;
        } else {
            console.log(`❌ ${source.name}: Not available or empty`);
        }
    });
    
    if (foundData) {
        console.log('✅ Component data availability: WORKING');
    } else {
        console.log('❌ Component data availability: FAILED');
    }
    
    console.groupEnd();
    return foundData;
}

// Test 4: Check loading state management
function testLoadingStateManagement() {
    console.group('%c⏳ Test 4: Loading State Management', 'color: #f59e0b; font-weight: bold;');
    
    if (window.gmkbApp?.hideLoading) {
        console.log('✅ hideLoading function available');
        
        // Check for loading elements
        const loadingElements = [
            document.getElementById('loading-state'),
            document.getElementById('state-loading-enhanced'),
            document.querySelector('.loading-state'),
            document.querySelector('.gmkb-loading')
        ].filter(Boolean);
        
        console.log(`✅ Found ${loadingElements.length} loading elements`);
        
        // Check body classes
        const hasLoadingClass = document.body.classList.contains('gmkb-loading') || document.body.classList.contains('loading');
        const hasReadyClass = document.body.classList.contains('gmkb-ready');
        
        console.log(`✅ Body has loading class: ${hasLoadingClass ? 'YES' : 'NO'}`);
        console.log(`✅ Body has ready class: ${hasReadyClass ? 'YES' : 'NO'}`);
        
        if (!hasLoadingClass && hasReadyClass) {
            console.log('✅ Loading state management: WORKING');
            return true;
        } else {
            console.log('⚠️ Loading state management: MAY NEED MANUAL TRIGGER');
            return false;
        }
    } else {
        console.log('❌ hideLoading function not available');
        return false;
    }
    
    console.groupEnd();
}

// Test 5: Check UI components initialization
function testUIComponentsInitialization() {
    console.group('%c🎛️ Test 5: UI Components Initialization', 'color: #ef4444; font-weight: bold;');
    
    if (window.gmkbApp?.setupUI) {
        console.log('✅ setupUI function available');
        
        // Check tabs
        const tabs = document.querySelectorAll('.media-kit-tabs .tab-button');
        console.log(`✅ Found ${tabs.length} tab buttons`);
        
        // Check modals
        const modals = document.querySelectorAll('[data-modal]');
        console.log(`✅ Found ${modals.length} modal triggers`);
        
        // Check component library
        const componentLibrary = document.getElementById('component-library-overlay');
        console.log(`✅ Component library modal: ${componentLibrary ? 'FOUND' : 'NOT FOUND'}`);
        
        // Check preview container
        const previewContainer = document.getElementById('media-kit-preview');
        console.log(`✅ Preview container: ${previewContainer ? 'FOUND' : 'NOT FOUND'}`);
        
        if (tabs.length > 0 || modals.length > 0 || componentLibrary || previewContainer) {
            console.log('✅ UI components initialization: WORKING');
            return true;
        } else {
            console.log('❌ UI components initialization: NO COMPONENTS FOUND');
            return false;
        }
    } else {
        console.log('❌ setupUI function not available');
        return false;
    }
    
    console.groupEnd();
}

// Test 6: Check empty state handlers
function testEmptyStateHandlers() {
    console.group('%c📋 Test 6: Empty State Handlers', 'color: #06b6d4; font-weight: bold;');
    
    if (window.emptyStateHandlers) {
        console.log('✅ Empty state handlers available');
        
        const status = window.emptyStateHandlers.getStatus ? window.emptyStateHandlers.getStatus() : null;
        if (status) {
            console.log(`✅ Initialized: ${status.isInitialized ? 'YES' : 'NO'}`);
            console.log(`✅ Active buttons: ${status.activeButtons?.length || 0}`);
            console.log(`✅ Interactions: ${status.interactionCount || 0}`);
            
            if (status.isInitialized) {
                console.log('✅ Empty state handlers: WORKING');
                return true;
            } else {
                console.log('❌ Empty state handlers: NOT INITIALIZED');
                return false;
            }
        } else {
            console.log('⚠️ Empty state handlers: STATUS NOT AVAILABLE');
            return false;
        }
    } else {
        console.log('❌ Empty state handlers not available');
        return false;
    }
    
    console.groupEnd();
}

// Test 7: Check double initialization prevention
function testDoubleInitializationPrevention() {
    console.group('%c🔄 Test 7: Double Initialization Prevention', 'color: #ec4899; font-weight: bold;');
    
    // Count console messages for duplicate initialization
    const originalConsoleLog = console.log;
    let duplicateInitMessages = 0;
    
    console.log = function(...args) {
        const message = args.join(' ');
        if (message.includes('Already initialized') || message.includes('already in progress')) {
            duplicateInitMessages++;
        }
        originalConsoleLog.apply(console, args);
    };
    
    // Try multiple initializations
    if (window.gmkbApp?.initialize) {
        window.gmkbApp.initialize();
        window.gmkbApp.initialize();
        window.gmkbApp.initialize();
    }
    
    // Restore console
    console.log = originalConsoleLog;
    
    console.log(`✅ Duplicate initialization attempts detected: ${duplicateInitMessages}`);
    
    if (duplicateInitMessages >= 2) {
        console.log('✅ Double initialization prevention: WORKING');
        return true;
    } else {
        console.log('❌ Double initialization prevention: NOT WORKING');
        return false;
    }
    
    console.groupEnd();
}

// Main test runner
function runInitializationTests() {
    console.log('🧪 Starting initialization fix tests...\n');
    
    const results = {
        timestamp: new Date().toISOString(),
        tests: {}
    };
    
    // Run all tests
    results.tests.initializationGuards = testInitializationGuards();
    results.tests.stateManagerSubscription = testStateManagerSubscription();
    results.tests.componentDataAvailability = testComponentDataAvailability();
    results.tests.loadingStateManagement = testLoadingStateManagement();
    results.tests.uiComponentsInitialization = testUIComponentsInitialization();
    results.tests.emptyStateHandlers = testEmptyStateHandlers();
    results.tests.doubleInitializationPrevention = testDoubleInitializationPrevention();
    
    // Summary
    console.group('%c📋 TEST SUMMARY', 'font-size: 14px; font-weight: bold; color: #dc2626;');
    console.log('Timestamp:', results.timestamp);
    
    const testCount = Object.keys(results.tests).length;
    const passedTests = Object.values(results.tests).filter(Boolean).length;
    const successRate = Math.round((passedTests / testCount) * 100);
    
    console.log(`Tests Passed: ${passedTests}/${testCount} (${successRate}%)`);
    
    if (successRate >= 85) {
        console.log('%c✅ INITIALIZATION FIXES: SUCCESS', 'color: #10b981; font-weight: bold;');
        console.log('The initialization system has been successfully fixed at the root level.');
    } else if (successRate >= 70) {
        console.log('%c⚠️ INITIALIZATION FIXES: MOSTLY WORKING', 'color: #f59e0b; font-weight: bold;');
        console.log('Most initialization issues have been fixed, but some minor issues remain.');
    } else {
        console.log('%c❌ INITIALIZATION FIXES: ISSUES REMAIN', 'color: #ef4444; font-weight: bold;');
        console.log('Significant initialization issues still need to be addressed.');
    }
    
    console.groupEnd();
    
    // Provide debugging commands
    console.group('%c🔧 DEBUGGING COMMANDS', 'font-size: 12px; font-weight: bold; color: #6366f1;');
    console.log('Manual commands available:');
    console.log('- gmkbApp.forceReinitialize() - Force reinitialize the system');
    console.log('- gmkbApp.hideLoading() - Manually hide loading state');
    console.log('- gmkbApp.setupUI() - Manually setup UI components');
    console.log('- gmkbDiagnostic.enhanced() - Run enhanced system diagnostics');
    console.log('- window.emptyStateHandlers.reset() - Reset empty state handlers');
    console.groupEnd();
    
    // Make results available globally
    window.initializationTestResults = results;
    
    return results;
}

// Auto-run if document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runInitializationTests, 3000); // Wait for systems to load
    });
} else {
    setTimeout(runInitializationTests, 3000);
}

// Make test runner available globally
window.testInitializationFixes = runInitializationTests;

console.log('✅ Initialization test script loaded. Use testInitializationFixes() to run tests.');
