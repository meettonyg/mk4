// EMERGENCY DEBUG SCRIPT
// Paste this in browser console to diagnose controls issue

console.log('===========================================');
console.log('COMPONENT CONTROLS DEBUG');
console.log('===========================================');

// Check if ComponentWrapper elements exist
const wrappers = document.querySelectorAll('.component-wrapper');
console.log('\n1. Component Wrappers found:', wrappers.length);

if (wrappers.length === 0) {
    console.error('❌ NO COMPONENT WRAPPERS FOUND!');
    console.log('This means components are not rendering at all.');
} else {
    console.log('✅ Component wrappers are rendering');
    
    // Check each wrapper
    wrappers.forEach((wrapper, index) => {
        console.log(`\n--- Wrapper ${index + 1} ---`);
        console.log('Component ID:', wrapper.dataset.componentId);
        console.log('Classes:', wrapper.className);
        
        // Check if controls exist inside
        const controls = wrapper.querySelector('.component-controls');
        if (controls) {
            console.log('✅ Controls element EXISTS');
            console.log('Controls display:', window.getComputedStyle(controls).display);
            console.log('Controls visibility:', window.getComputedStyle(controls).visibility);
            console.log('Controls opacity:', window.getComputedStyle(controls).opacity);
            console.log('Controls z-index:', window.getComputedStyle(controls).zIndex);
        } else {
            console.log('❌ Controls element NOT IN DOM');
        }
        
        // Check for showControls data attribute
        console.log('Hover state:', wrapper.classList.contains('component-wrapper--hovering'));
        console.log('Selected state:', wrapper.classList.contains('component-wrapper--selected'));
    });
}

// Check if Vue app is mounted
console.log('\n2. Vue App Status:');
console.log('gmkbApp exists:', !!window.gmkbApp);
console.log('mediaKitStore exists:', !!window.__mediaKitStore);

// Check store data
if (window.__mediaKitStore) {
    console.log('\n3. Store Data:');
    console.log('Components count:', Object.keys(window.__mediaKitStore.components || {}).length);
    console.log('Sections count:', (window.__mediaKitStore.sections || []).length);
}

console.log('\n===========================================');
console.log('NEXT STEPS:');
console.log('1. Hover over a component');
console.log('2. Run this script again');
console.log('3. Check if "Hover state" changes to true');
console.log('===========================================');
