// Quick test to verify Phase 2A fixes are working

console.log('🧪 Phase 2A Verification Test');
console.log('============================\n');

// Test 1: Check initialization manager version
if (window.initManager) {
    const status = window.initManager.getStatus();
    console.log('✅ Initialization Manager Status:');
    console.log('  - Version:', status.version || 'unknown');
    console.log('  - State:', status.state);
    console.log('  - Duration:', status.duration + 'ms');
    console.log('  - Steps:', status.steps.map(s => `${s.name}(${s.status})`).join(' → '));
} else {
    console.log('❌ Initialization Manager not found');
}

// Test 2: Check modal elements
console.log('\n📋 Modal Elements Check:');
const modals = {
    'component-library-overlay': 'Component Library',
    'template-library-modal': 'Template Library',
    'global-settings-modal': 'Global Settings'
};

for (const [id, name] of Object.entries(modals)) {
    const el = document.getElementById(id);
    console.log(`  ${name}: ${el ? '✅ Found' : '❌ Not Found'}`);
}

// Test 3: Check button listeners
console.log('\n🔘 Button Listeners Check:');
const buttons = {
    'add-component-btn': 'Add Component',
    'load-template': 'Load Template',
    'global-theme-btn': 'Global Theme'
};

for (const [id, name] of Object.entries(buttons)) {
    const btn = document.getElementById(id);
    if (btn) {
        const hasListener = btn.hasAttribute('data-listener-attached');
        console.log(`  ${name}: ${hasListener ? '✅ Listener attached' : '⚠️ No listener marker'}`);
    } else {
        console.log(`  ${name}: ❌ Button not found`);
    }
}

// Test 4: Try clicking a button
console.log('\n🖱️ Testing Component Library Button...');
const testBtn = document.getElementById('add-component-btn');
if (testBtn) {
    testBtn.click();
    setTimeout(() => {
        const modal = document.getElementById('component-library-overlay');
        if (modal && modal.classList.contains('modal--open')) {
            console.log('✅ Modal opened successfully!');
            // Close it
            const closeBtn = document.getElementById('close-library');
            if (closeBtn) closeBtn.click();
        } else {
            console.log('❌ Modal did not open');
        }
    }, 100);
}

console.log('\n💡 If tests fail, try:');
console.log('1. Hard refresh (Ctrl+Shift+R)');
console.log('2. Clear cache and reload');
console.log('3. Check browser console for errors');
