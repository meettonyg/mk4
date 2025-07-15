/**
 * @file debug-dependency-chain.js
 * @description Diagnose WordPress script loading dependency chain issues
 */

(function() {
    'use strict';
    
    console.log('%c🔍 DEPENDENCY CHAIN DIAGNOSTIC', 'font-size: 16px; font-weight: bold; color: #dc2626; background: #fef2f2; padding: 8px;');
    
    // Check what scripts actually loaded
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const guestifyScripts = scripts.filter(script => script.src.includes('guestify'));
    
    console.group('📄 Loaded Scripts:');
    guestifyScripts.forEach(script => {
        const filename = script.src.split('/').pop().split('?')[0];
        const hasAsync = script.hasAttribute('async');
        const hasDefer = script.hasAttribute('defer');
        console.log(`  📜 ${filename}${hasAsync ? ' (async)' : ''}${hasDefer ? ' (defer)' : ''}`);
    });
    console.groupEnd();
    
    // Check GMKB namespace
    console.group('🏗️ GMKB Namespace Status:');
    console.log('  window.GMKB:', !!window.GMKB);
    if (window.GMKB) {
        console.log('  window.GMKB.initializer:', !!window.GMKB.initializer);
        console.log('  window.GMKB.systems:', Object.keys(window.GMKB.systems || {}));
        console.log('  GMKB Status:', window.GMKB.getStatus ? window.GMKB.getStatus() : 'No getStatus method');
    } else {
        console.log('  ❌ GMKB namespace not created');
        
        // Check if gmkb-main.js loaded but failed
        const gmkbMainScript = guestifyScripts.find(s => s.src.includes('gmkb-main'));
        if (gmkbMainScript) {
            console.log('  📜 gmkb-main.js script tag found:', gmkbMainScript.src);
            console.log('  🔄 gmkb-main.js may have failed to execute');
        } else {
            console.log('  ❌ gmkb-main.js script tag not found');
        }
    }
    console.groupEnd();
    
    // Check file loading order
    console.group('📊 Expected vs Actual Load Order:');
    const expectedOrder = [
        'gmkb-main.js',
        'gmkb-system-initializer.js', 
        'enhanced-component-manager.js',
        'core-systems-bundle.js',
        'application-bundle.js'
    ];
    
    const actualOrder = guestifyScripts.map(script => {
        const filename = script.src.split('/').pop().split('?')[0];
        return filename;
    });
    
    console.log('  Expected:', expectedOrder);
    console.log('  Actual:  ', actualOrder);
    
    let orderCorrect = true;
    let lastFoundIndex = -1;
    
    expectedOrder.forEach(expectedScript => {
        const foundIndex = actualOrder.findIndex(script => script.includes(expectedScript.replace('.js', '')));
        if (foundIndex !== -1) {
            if (foundIndex <= lastFoundIndex) {
                orderCorrect = false;
            }
            lastFoundIndex = foundIndex;
        }
    });
    
    console.log('  Order Correct:', orderCorrect ? '✅' : '❌');
    console.groupEnd();
    
    // Manual load test for gmkb-main.js
    console.group('🧪 Manual Load Test:');
    
    const testScript = document.createElement('script');
    testScript.textContent = `
        console.log('🧪 TEST: Manual GMKB creation test');
        if (!window.GMKB_TEST) {
            const GMKB_TEST = { test: 'success', timestamp: Date.now() };
            window.GMKB_TEST = GMKB_TEST;
            console.log('✅ TEST: Manual namespace creation works');
        }
    `;
    
    document.head.appendChild(testScript);
    
    setTimeout(() => {
        console.log('  Manual test result:', window.GMKB_TEST ? '✅ Success' : '❌ Failed');
    }, 10);
    
    console.groupEnd();
    
    // Recommendations
    console.group('💡 Diagnostic Recommendations:');
    
    if (!window.GMKB) {
        const gmkbMainScript = guestifyScripts.find(s => s.src.includes('gmkb-main'));
        if (!gmkbMainScript) {
            console.log('  🔧 gmkb-main.js script not found - check enqueue.php file path');
        } else {
            console.log('  🔧 gmkb-main.js loaded but GMKB not created - check for JavaScript errors');
            console.log('  📋 Open Network tab to check for 404 errors');
            console.log('  🐛 Check Console for JavaScript syntax errors in gmkb-main.js');
        }
    }
    
    if (!orderCorrect) {
        console.log('  🔧 Script load order incorrect - check WordPress dependency chain');
    }
    
    const hasAsyncDefer = guestifyScripts.some(s => s.hasAttribute('async') || s.hasAttribute('defer'));
    if (hasAsyncDefer) {
        console.log('  🔧 Some scripts have async/defer - remove from enqueue.php');
    }
    
    console.groupEnd();
    
    // Global debug function
    window.debugDependencyChain = () => {
        console.clear();
        location.reload();
    };
    
    console.log('🔄 Run debugDependencyChain() to re-run this diagnostic');
    
})();
