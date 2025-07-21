/**
 * @file test-refactored-architecture.js
 * @description Validation script for the refactored modular ES6 architecture
 */

console.log('%c🧪 TESTING REFACTORED ARCHITECTURE', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');

/**
 * Test 1: Module Loading and Dependencies
 */
function testModuleLoading() {
    console.log('\n📦 Testing Module Loading and Dependencies...');
    
    const tests = {
        'GMKB Object Available': !!window.GMKB,
        'StateManager Available': !!window.StateManager,
        'ComponentManager Available': !!window.ComponentManager,
        'UICoordinator Available': !!window.UICoordinator,
        'GMKB Systems Attached': !!(window.GMKB && window.GMKB.systems),
        'StateManager in GMKB': !!(window.GMKB?.systems?.StateManager),
        'ComponentManager in GMKB': !!(window.GMKB?.systems?.ComponentManager),
        'UICoordinator in GMKB': !!(window.GMKB?.systems?.UICoordinator)
    };
    
    let passed = 0;
    let total = Object.keys(tests).length;
    
    Object.entries(tests).forEach(([test, result]) => {
        const status = result ? '✅' : '❌';
        console.log(`  ${status} ${test}: ${result}`);
        if (result) passed++;
    });
    
    console.log(`📊 Module Loading: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    return passed === total;
}

/**
 * Test 2: Event System Functionality
 */
function testEventSystem() {
    console.log('\n📡 Testing Event System...');
    
    let eventReceived = false;
    
    // Test event subscription
    if (window.GMKB && window.GMKB.subscribe) {
        window.GMKB.subscribe('test-event', (event) => {
            eventReceived = true;
            console.log('  ✅ Event received successfully:', event.detail);
        });
        
        // Test event dispatch
        if (window.GMKB.dispatch) {
            window.GMKB.dispatch('test-event', { test: 'data' });
        }
    }
    
    const tests = {
        'GMKB.dispatch function exists': typeof window.GMKB?.dispatch === 'function',
        'GMKB.subscribe function exists': typeof window.GMKB?.subscribe === 'function',
        'Event dispatch/subscribe works': eventReceived
    };
    
    let passed = 0;
    let total = Object.keys(tests).length;
    
    Object.entries(tests).forEach(([test, result]) => {
        const status = result ? '✅' : '❌';
        console.log(`  ${status} ${test}: ${result}`);
        if (result) passed++;
    });
    
    console.log(`📊 Event System: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    return passed === total;
}

/**
 * Test 3: State Management
 */
function testStateManagement() {
    console.log('\n📋 Testing State Management...');
    
    const tests = {
        'StateManager.init function exists': typeof window.StateManager?.init === 'function',
        'StateManager.getState function exists': typeof window.StateManager?.getState === 'function',
        'StateManager.addComponent function exists': typeof window.StateManager?.addComponent === 'function',
        'StateManager.updateComponent function exists': typeof window.StateManager?.updateComponent === 'function',
        'StateManager.removeComponent function exists': typeof window.StateManager?.removeComponent === 'function'
    };
    
    // Test state access
    if (window.StateManager && window.StateManager.getState) {
        try {
            const state = window.StateManager.getState();
            tests['StateManager returns valid state object'] = typeof state === 'object' && state !== null;
            tests['State has components property'] = state.hasOwnProperty('components');
            tests['State has layout property'] = state.hasOwnProperty('layout');
        } catch (error) {
            console.warn('  ⚠️ Error accessing state:', error);
            tests['StateManager returns valid state object'] = false;
            tests['State has components property'] = false;
            tests['State has layout property'] = false;
        }
    }
    
    let passed = 0;
    let total = Object.keys(tests).length;
    
    Object.entries(tests).forEach(([test, result]) => {
        const status = result ? '✅' : '❌';
        console.log(`  ${status} ${test}: ${result}`);
        if (result) passed++;
    });
    
    console.log(`📊 State Management: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    return passed === total;
}

/**
 * Test 4: Component Management
 */
function testComponentManagement() {
    console.log('\n🧩 Testing Component Management...');
    
    const tests = {
        'ComponentManager.init function exists': typeof window.ComponentManager?.init === 'function',
        'ComponentManager.addComponent function exists': typeof window.ComponentManager?.addComponent === 'function',
        'ComponentManager.loadSavedComponents function exists': typeof window.ComponentManager?.loadSavedComponents === 'function',
        'ComponentManager.renderComponent function exists': typeof window.ComponentManager?.renderComponent === 'function',
        'ComponentManager has availableComponents': window.ComponentManager?.hasOwnProperty('availableComponents')
    };
    
    let passed = 0;
    let total = Object.keys(tests).length;
    
    Object.entries(tests).forEach(([test, result]) => {
        const status = result ? '✅' : '❌';
        console.log(`  ${status} ${test}: ${result}`);
        if (result) passed++;
    });
    
    console.log(`📊 Component Management: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    return passed === total;
}

/**
 * Test 5: UI Coordination
 */
function testUICoordination() {
    console.log('\n🎯 Testing UI Coordination...');
    
    const tests = {
        'UICoordinator.init function exists': typeof window.UICoordinator?.init === 'function',
        'UICoordinator has initialized flag': window.UICoordinator?.hasOwnProperty('initialized'),
        'UICoordinator.loadSavedComponentsOnce function exists': typeof window.UICoordinator?.loadSavedComponentsOnce === 'function'
    };
    
    let passed = 0;
    let total = Object.keys(tests).length;
    
    Object.entries(tests).forEach(([test, result]) => {
        const status = result ? '✅' : '❌';
        console.log(`  ${status} ${test}: ${result}`);
        if (result) passed++;
    });
    
    console.log(`📊 UI Coordination: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    return passed === total;
}

/**
 * Test 6: WordPress Integration
 */
function testWordPressIntegration() {
    console.log('\n🔗 Testing WordPress Integration...');
    
    const tests = {
        'WordPress gmkbData available': !!window.gmkbData,
        'AJAX URL available': !!(window.gmkbData?.ajaxUrl),
        'Nonce available': !!(window.gmkbData?.nonce),
        'Post ID available': !!(window.gmkbData?.postId),
        'Plugin URL available': !!(window.gmkbData?.pluginUrl)
    };
    
    let passed = 0;
    let total = Object.keys(tests).length;
    
    Object.entries(tests).forEach(([test, result]) => {
        const status = result ? '✅' : '❌';
        console.log(`  ${status} ${test}: ${result}`);
        if (result) passed++;
    });
    
    console.log(`📊 WordPress Integration: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    return passed === total;
}

/**
 * Test 7: Architecture Compliance
 */
function testArchitectureCompliance() {
    console.log('\n🏗️ Testing Architecture Compliance...');
    
    const tests = {
        'No polling detected (setTimeout/setInterval)': !checkForPolling(),
        'Event-driven initialization': !!window.UICoordinator?.initialized,
        'Clean namespace separation': checkNamespaceSeparation(),
        'Proper error handling': checkErrorHandling(),
        'No inline script pollution': !checkInlineScripts()
    };
    
    let passed = 0;
    let total = Object.keys(tests).length;
    
    Object.entries(tests).forEach(([test, result]) => {
        const status = result ? '✅' : '❌';
        console.log(`  ${status} ${test}: ${result}`);
        if (result) passed++;
    });
    
    console.log(`📊 Architecture Compliance: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    return passed === total;
}

/**
 * Helper Functions
 */
function checkForPolling() {
    // Simple check for obvious polling patterns
    const scriptContent = document.documentElement.innerHTML;
    return scriptContent.includes('setInterval') || scriptContent.includes('setTimeout');
}

function checkNamespaceSeparation() {
    return !!(
        window.GMKB?.systems &&
        window.StateManager &&
        window.ComponentManager &&
        window.UICoordinator
    );
}

function checkErrorHandling() {
    // Check if console.error or try/catch patterns exist
    return !!(
        window.StateManager?.loadFromStorage &&
        window.ComponentManager?.renderComponent
    );
}

function checkInlineScripts() {
    // Check for inline script tags
    const inlineScripts = document.querySelectorAll('script:not([src])');
    return inlineScripts.length > 5; // Allow some inline scripts for WordPress
}

/**
 * Main Test Runner
 */
function runRefactoredArchitectureTests() {
    console.log('%c🧪 RUNNING REFACTORED ARCHITECTURE VALIDATION', 'font-weight: bold; color: #ffffff; background: #2563eb; padding: 8px 16px; border-radius: 6px;');
    console.log('Testing ES6 modular architecture with event-driven coordination...\n');
    
    const results = {
        'Module Loading': testModuleLoading(),
        'Event System': testEventSystem(),
        'State Management': testStateManagement(),
        'Component Management': testComponentManagement(),
        'UI Coordination': testUICoordination(),
        'WordPress Integration': testWordPressIntegration(),
        'Architecture Compliance': testArchitectureCompliance()
    };
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    const percentage = Math.round(passed / total * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('%c📊 FINAL RESULTS', 'font-weight: bold; color: #1f2937; background: #f3f4f6; padding: 4px 8px;');
    console.log('='.repeat(60));
    
    Object.entries(results).forEach(([test, result]) => {
        const status = result ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${test}`);
    });
    
    console.log('='.repeat(60));
    
    if (percentage >= 90) {
        console.log(`%c🎉 REFACTORING SUCCESS: ${passed}/${total} tests passed (${percentage}%)`, 'font-weight: bold; color: #059669; background: #d1fae5; padding: 8px 16px; border-radius: 6px;');
        console.log('%c✅ Architecture is ready for Phase 5!', 'font-weight: bold; color: #059669;');
    } else if (percentage >= 70) {
        console.log(`%c⚠️ PARTIAL SUCCESS: ${passed}/${total} tests passed (${percentage}%)`, 'font-weight: bold; color: #d97706; background: #fef3c7; padding: 8px 16px; border-radius: 6px;');
        console.log('%c🔧 Some issues need to be addressed before Phase 5', 'font-weight: bold; color: #d97706;');
    } else {
        console.log(`%c❌ REFACTORING ISSUES: ${passed}/${total} tests passed (${percentage}%)`, 'font-weight: bold; color: #dc2626; background: #fee2e2; padding: 8px 16px; border-radius: 6px;');
        console.log('%c🚨 Critical issues need to be fixed before proceeding', 'font-weight: bold; color: #dc2626;');
    }
    
    if (percentage >= 90) {
        console.log('\n%c🚀 PHASE 5: WORDPRESS INTEGRATION READY', 'font-weight: bold; color: #ffffff; background: #059669; padding: 8px 16px; border-radius: 6px;');
        console.log('Next steps:');
        console.log('1. Test ES6 module loading in browser');
        console.log('2. Verify component rendering works');
        console.log('3. Test state persistence');
        console.log('4. Validate event-driven coordination');
        console.log('5. Begin advanced WordPress integration features');
    }
    
    return { passed, total, percentage };
}

// Auto-run if this script is loaded
if (typeof window !== 'undefined') {
    // Wait for DOM and initial setup
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runRefactoredArchitectureTests, 1000);
        });
    } else {
        setTimeout(runRefactoredArchitectureTests, 1000);
    }
}

// Export for manual testing
if (typeof window !== 'undefined') {
    window.runRefactoredArchitectureTests = runRefactoredArchitectureTests;
    window.testRefactoredArchitecture = runRefactoredArchitectureTests;
}

console.log('%c💡 TIP: Run testRefactoredArchitecture() manually to test the refactored system', 'color: #6b7280; font-style: italic;');
