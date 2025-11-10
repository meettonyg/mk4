// HOVER TEST
// Run this in console, then try hovering

console.log('Setting up hover test...');

// Find all wrappers
const wrappers = document.querySelectorAll('.component-wrapper');
console.log('Found', wrappers.length, 'wrappers');

// Add manual event listeners
wrappers.forEach((wrapper, i) => {
    wrapper.addEventListener('mouseenter', () => {
        console.log(`✅ MOUSEENTER detected on wrapper ${i}`);
        console.log('   Component ID:', wrapper.dataset.componentId);
    });
    
    wrapper.addEventListener('mouseleave', () => {
        console.log(`❌ MOUSELEAVE detected on wrapper ${i}`);
    });
});

console.log('✅ Hover test listeners added!');
console.log('Now hover over a component and check if you see messages');
