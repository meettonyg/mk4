// QUICK CHECK: Is our code even loading?
console.clear();
console.log('🔍 CHECKING IF FIX IS LOADED\n');

// 1. Check if preview area exists
const preview = document.getElementById('media-kit-preview');
console.log('1. Preview area exists?', !!preview);
if (preview) {
    console.log('   Current classes:', preview.className || 'NONE');
}

// 2. Check if DevicePreview component exists
const deviceBtns = document.querySelectorAll('.device-preview__btn');
console.log('\n2. Device buttons found?', deviceBtns.length);
if (deviceBtns.length > 0) {
    console.log('   Buttons exist - component loaded');
    
    // Check if button has Vue instance
    const btn = deviceBtns[0];
    console.log('   Vue attached?', !!btn.__vueParentComponent);
}

// 3. Try to manually trigger the fix
console.log('\n3. Manually testing the fix...');
if (preview) {
    // Manually add classes
    preview.classList.add('device-mobile', 'gmkb-device--mobile');
    console.log('   Added classes:', preview.className);
    
    // Find layout elements
    const layouts = document.querySelectorAll('[class*="layout-two-column"], .gmkb-section__content');
    console.log('   Found layouts:', layouts.length);
    
    if (layouts.length > 0) {
        layouts.forEach(layout => {
            console.log('   Layout class:', layout.className);
            // Force mobile style
            layout.style.gridTemplateColumns = '1fr';
            layout.style.gap = '2rem';
        });
        
        // Check if it worked
        setTimeout(() => {
            const testLayout = layouts[0];
            console.log('\n4. After manual override:');
            console.log('   Style:', testLayout.style.gridTemplateColumns);
            console.log('   Computed:', getComputedStyle(testLayout).gridTemplateColumns);
        }, 100);
    }
}

// 4. Check if Vue app is running
console.log('\n5. Vue App Status:');
const vueApp = document.getElementById('vue-media-kit-app') || document.getElementById('app');
if (vueApp) {
    console.log('   Vue root found:', vueApp.id);
    console.log('   Has Vue instance?', !!vueApp.__vue_app__);
}

// 5. Try clicking Mobile button programmatically
console.log('\n6. Looking for Mobile button...');
const mobileBtn = Array.from(document.querySelectorAll('button')).find(
    btn => btn.textContent.includes('Mobile') || btn.querySelector('.device-label')?.textContent === 'Mobile'
);

if (mobileBtn) {
    console.log('   Mobile button found!');
    console.log('   Button class:', mobileBtn.className);
    
    // Add listener to see what happens when clicked
    mobileBtn.addEventListener('click', () => {
        console.log('\n   📱 MOBILE CLICKED - Checking after 500ms...');
        setTimeout(() => {
            console.log('   Preview classes:', preview?.className);
            console.log('   Observer exists?', !!window.devicePreviewObserver);
            const layout = document.querySelector('[class*="layout-two-column"]');
            if (layout) {
                console.log('   Layout style:', layout.style.gridTemplateColumns);
                console.log('   Layout computed:', getComputedStyle(layout).gridTemplateColumns);
            }
        }, 500);
    }, { once: true });
    
    console.log('   → Click the Mobile button now and watch console');
} else {
    console.log('   ❌ Mobile button not found!');
}

// 6. Check if the fix function exists
console.log('\n7. Checking for our fix in global scope...');
console.log('   devicePreviewObserver:', typeof window.devicePreviewObserver);
console.log('   Any observers?:', Object.keys(window).filter(k => k.includes('Observer')));

// 7. Last resort - check all scripts
console.log('\n8. Checking loaded scripts...');
const scripts = Array.from(document.scripts);
const relevantScripts = scripts.filter(s => s.src && (s.src.includes('gmkb') || s.src.includes('media-kit')));
console.log('   Found', relevantScripts.length, 'media kit scripts');
relevantScripts.forEach(s => {
    console.log('   -', s.src.split('/').pop());
});

console.log('\n=== DIAGNOSIS ===');
console.log('If observer is undefined after clicking Mobile,');
console.log('the JavaScript fix is NOT in the bundle.');
console.log('Need to verify the build process.');
