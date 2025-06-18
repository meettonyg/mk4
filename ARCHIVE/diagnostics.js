/**
 * Diagnostic Script for Enhanced System
 * Run this in the browser console to diagnose issues
 */

console.log('=== GMKB Enhanced System Diagnostics ===');
console.log('');

// Check if enhanced modules are loaded
console.log('1. Module Loading Status:');
console.log('   - State Manager:', typeof window.gmkbDebug?.stateManager !== 'undefined' ? '✓ Loaded' : '✗ Not loaded');
console.log('   - Data Binding Engine:', typeof window.gmkbDebug?.dataBindingEngine !== 'undefined' ? '✓ Loaded' : '✗ Not loaded');
console.log('   - Component Manager:', typeof window.gmkbDebug?.componentManager !== 'undefined' ? '✓ Loaded' : '✗ Not loaded');
console.log('   - History Service:', typeof window.gmkbDebug?.historyService !== 'undefined' ? '✓ Loaded' : '✗ Not loaded');
console.log('');

// Check component registry
console.log('2. Component Registry:');
if (window.gmkbDebug?.componentManager) {
    const components = window.gmkbDebug.componentManager.componentRegistry;
    console.log('   - Total components:', components.size);
    if (components.size > 0) {
        console.log('   - Registered components:');
        components.forEach((comp, name) => {
            console.log(`     • ${name}`);
        });
    }
} else {
    console.log('   - Component manager not available');
}
console.log('');

// Check AJAX configuration
console.log('3. AJAX Configuration:');
console.log('   - ajaxurl:', window.ajaxurl || 'Not defined');
console.log('   - gmkb_data:', window.gmkb_data ? '✓ Available' : '✗ Not available');
if (window.gmkb_data) {
    console.log('     - nonce:', window.gmkb_data.nonce ? '✓ Present' : '✗ Missing');
    console.log('     - ajax_url:', window.gmkb_data.ajax_url || 'Not defined');
}
console.log('   - guestifyData:', window.guestifyData ? '✓ Available' : '✗ Not available');
if (window.guestifyData) {
    console.log('     - components:', Array.isArray(window.guestifyData.components) ? `✓ ${window.guestifyData.components.length} components` : '✗ Not an array');
    console.log('     - nonce:', window.guestifyData.nonce ? '✓ Present' : '✗ Missing');
}
console.log('');

// Check state
console.log('4. Current State:');
if (window.gmkbDebug?.getState) {
    const state = window.gmkbDebug.getState();
    if (state) {
        console.log('   - Components in state:', Object.keys(state.components || {}).length);
        console.log('   - Metadata:', state.metadata);
    } else {
        console.log('   - No state available');
    }
}
console.log('');

// Check for duplicate bindings
console.log('5. Control Button Analysis:');
const controlButtons = document.querySelectorAll('.control-btn');
console.log('   - Total control buttons:', controlButtons.length);
const eventListeners = new Map();
controlButtons.forEach((btn, index) => {
    const listeners = getEventListeners ? getEventListeners(btn) : null;
    if (listeners && listeners.click) {
        eventListeners.set(index, listeners.click.length);
    }
});
if (eventListeners.size > 0) {
    console.log('   - Event listeners per button:');
    eventListeners.forEach((count, index) => {
        console.log(`     Button ${index}: ${count} click listeners`);
    });
}
console.log('');

// Recommendations
console.log('6. Recommendations:');
if (!window.gmkbDebug?.componentManager || window.gmkbDebug.componentManager.componentRegistry.size === 0) {
    console.log('   ⚠️  Components not loading. Check:');
    console.log('      - AJAX handlers are registered');
    console.log('      - Nonces are being passed correctly');
    console.log('      - enhanced-ajax.php is being included');
}

if (controlButtons.length > 20) {
    console.log('   ⚠️  Many control buttons detected. Check:');
    console.log('      - MutationObserver debouncing');
    console.log('      - Duplicate event bindings');
}

console.log('');
console.log('To reset everything, run: gmkbDebug.resetAll()');
console.log('=== End Diagnostics ===');