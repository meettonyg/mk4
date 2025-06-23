// Diagnostic script to check if Phase 2A changes are present

console.log('🔍 Checking Phase 2A file changes...\n');

// Check 1: Component Library
fetch('./js/modals/component-library.js')
    .then(response => response.text())
    .then(content => {
        console.log('📚 Component Library Check:');
        if (content.includes('validateAndAssignElements')) {
            console.log('✅ New promise-based version detected');
        } else if (content.includes('retryCount < 5')) {
            console.log('❌ OLD version with retry logic detected');
        } else {
            console.log('⚠️ Unknown version');
        }
        console.log('First 200 chars:', content.substring(0, 200));
    });

// Check 2: Initialization Manager
fetch('./js/core/initialization-manager.js')
    .then(response => response.text())
    .then(content => {
        console.log('\n🎯 Initialization Manager Check:');
        if (content.includes('waitForModalHTML')) {
            console.log('✅ Enhanced version with modal validation');
        } else {
            console.log('❌ OLD version without modal validation');
        }
        
        if (content.includes('mediaKitInit.initializeUI')) {
            console.log('✅ Updated setupCoreUI with fallback');
        } else if (content.includes('const { initializeUI }')) {
            console.log('❌ OLD setupCoreUI with direct import');
        }
    });

// Check 3: Global Settings
fetch('./js/modals/global-settings.js')
    .then(response => response.text())
    .then(content => {
        console.log('\n⚙️ Global Settings Check:');
        if (content.includes('gatherSettings')) {
            console.log('✅ New version with gatherSettings method');
        } else {
            console.log('❌ OLD version');
        }
    });

// Check 4: Current module versions in memory
console.log('\n📦 Loaded Module Versions:');
if (window.initManager) {
    const status = window.initManager.getStatus();
    console.log('InitializationManager status:', status.state);
    console.log('Steps:', status.steps.map(s => s.name));
}

// Check if old functions exist
if (window.setupComponentLibrary) {
    console.log('⚠️ Old setupComponentLibrary function exists globally');
}

console.log('\n💡 If you see OLD versions, try:');
console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
console.log('2. Hard refresh (Ctrl+Shift+R)');
console.log('3. Check if changes were saved to disk');
