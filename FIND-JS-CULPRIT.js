// Find what's setting inline styles
console.log('=== FINDING THE CULPRIT ===\n');

const layout = document.querySelector('.layout-two-column');

// 1. Check for mutation observers
console.log('1. Checking for MutationObservers...');
// We can't directly see observers, but we can test
const originalStyle = layout.style.cssText;
layout.style.gridTemplateColumns = 'TEST';
setTimeout(() => {
    if (layout.style.gridTemplateColumns !== 'TEST') {
        console.log('   ❌ Something is actively overriding styles!');
        console.log('   Current value:', layout.style.gridTemplateColumns);
    } else {
        console.log('   ✅ No immediate override detected');
    }
    layout.style.cssText = originalStyle;
}, 100);

// 2. Check draggable instances
console.log('\n2. Checking for Sortable/Draggable...');
if (window.Sortable) {
    console.log('   Sortable.js is loaded');
    // Check if layout has Sortable instance
    if (layout._sortable || layout.sortable) {
        console.log('   ❌ Sortable instance found on layout element!');
    }
}

// 3. Check Vue instance for watchers/computed
console.log('\n3. Checking Vue component...');
if (layout.__vueParentComponent) {
    console.log('   Vue component found');
    const instance = layout.__vueParentComponent;
    if (instance.proxy) {
        console.log('   Component name:', instance.proxy.$options.name);
    }
}

// 4. Monitor style changes
console.log('\n4. Setting up style monitor...');
let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            console.log('   🔥 Style changed!');
            console.log('      New style:', mutation.target.style.cssText);
            console.log('      Grid columns:', mutation.target.style.gridTemplateColumns);
            
            // Get stack trace to find what's setting it
            console.trace('      Stack trace:');
        }
    });
});

observer.observe(layout, { attributes: true, attributeFilter: ['style'] });

console.log('   Observer active. Any style changes will be logged.');
console.log('   Try clicking a different device button to see what sets the styles.');

// 5. Override setter to catch what's setting it
console.log('\n5. Intercepting style setter...');
const originalSetter = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'gridTemplateColumns').set;
let interceptCount = 0;
Object.defineProperty(layout.style, 'gridTemplateColumns', {
    set: function(value) {
        if (interceptCount++ < 5) {  // Only log first 5 to avoid spam
            console.log('   🎯 gridTemplateColumns being set to:', value);
            console.trace('   Called from:');
        }
        return originalSetter.call(this, value);
    },
    get: function() {
        return originalSetter.call(this);
    }
});

console.log('\n=== WAITING FOR ACTIVITY ===');
console.log('Click around or resize window to trigger style changes...');

// Clean up after 10 seconds
setTimeout(() => {
    observer.disconnect();
    console.log('\n=== MONITORING STOPPED ===');
}, 10000);
