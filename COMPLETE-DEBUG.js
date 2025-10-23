// COMPREHENSIVE DEVICE PREVIEW DEBUGGER
console.clear();
console.log('🔍 DEVICE PREVIEW COMPLETE DEBUG\n');
console.log('=================================\n');

// 1. CHECK: Is device-mobile class present?
const preview = document.getElementById('media-kit-preview');
console.log('1️⃣ PREVIEW AREA CHECK:');
console.log('   Element found:', !!preview);
if (preview) {
    console.log('   Classes:', preview.className);
    console.log('   Has device-mobile?', preview.classList.contains('device-mobile'));
}

// 2. CHECK: Find ALL layout elements
console.log('\n2️⃣ LAYOUT ELEMENTS:');
const allLayouts = document.querySelectorAll('[class*="layout-"]');
console.log('   Found', allLayouts.length, 'elements with layout classes:');
allLayouts.forEach((el, i) => {
    console.log(`   [${i}] Class: ${el.className}`);
    console.log(`       Style: ${el.style.cssText || 'none'}`);
    console.log(`       Computed grid: ${getComputedStyle(el).gridTemplateColumns}`);
});

// 3. CHECK: Is our DevicePreview component even running?
console.log('\n3️⃣ DEVICEPREVIEW COMPONENT:');
console.log('   Observer exists?', !!window.devicePreviewObserver);
console.log('   Observer active?', window.devicePreviewObserver?._isActive);

// 4. TEST: Manually set styles and watch what happens
console.log('\n4️⃣ MANUAL STYLE TEST:');
const testLayout = document.querySelector('.layout-two-column');
if (testLayout) {
    console.log('   Setting grid to "1fr"...');
    testLayout.style.gridTemplateColumns = '1fr';
    
    // Check immediately
    console.log('   Immediate check:', testLayout.style.gridTemplateColumns);
    
    // Check after 10ms
    setTimeout(() => {
        console.log('   After 10ms:', testLayout.style.gridTemplateColumns);
    }, 10);
    
    // Check after 100ms
    setTimeout(() => {
        console.log('   After 100ms:', testLayout.style.gridTemplateColumns);
        console.log('   Computed:', getComputedStyle(testLayout).gridTemplateColumns);
    }, 100);
    
    // Check after 500ms
    setTimeout(() => {
        console.log('   After 500ms:', testLayout.style.gridTemplateColumns);
        console.log('   Computed:', getComputedStyle(testLayout).gridTemplateColumns);
    }, 500);
}

// 5. CHECK: What happens when we click Mobile button?
console.log('\n5️⃣ DEVICE BUTTON TEST:');
const mobileBtn = Array.from(document.querySelectorAll('button')).find(
    btn => btn.textContent.includes('Mobile')
);
if (mobileBtn) {
    console.log('   Mobile button found');
    console.log('   Button classes:', mobileBtn.className);
    console.log('   Is active?', mobileBtn.className.includes('active'));
    
    // Add click listener to see what happens
    mobileBtn.addEventListener('click', function() {
        console.log('\n   📱 MOBILE BUTTON CLICKED!');
        
        setTimeout(() => {
            console.log('   After click - preview classes:', preview?.className);
            const layout = document.querySelector('.layout-two-column');
            if (layout) {
                console.log('   After click - layout style:', layout.style.cssText);
                console.log('   After click - computed:', getComputedStyle(layout).gridTemplateColumns);
            }
        }, 100);
    }, { once: true });
    
    console.log('   → Click the Mobile button now to see what happens');
}

// 6. CHECK: Look for Vue components
console.log('\n6️⃣ VUE COMPONENT STRUCTURE:');
const vueRoot = document.getElementById('vue-media-kit-app') || document.getElementById('app');
if (vueRoot && vueRoot.__vue_app__) {
    console.log('   Vue app found');
    const app = vueRoot.__vue_app__;
    console.log('   App version:', app.version);
}

// Check for DevicePreview component
const devicePreviewEl = document.querySelector('.device-preview');
if (devicePreviewEl) {
    console.log('   DevicePreview element found');
    if (devicePreviewEl.__vueParentComponent) {
        console.log('   Has Vue component attached');
    }
}

// 7. MONITOR: Set up comprehensive monitoring
console.log('\n7️⃣ SETTING UP MONITORS:');

// Monitor preview area for class changes
if (preview) {
    const classObserver = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            if (m.attributeName === 'class') {
                console.log('   🔄 Preview class changed to:', m.target.className);
            }
        });
    });
    classObserver.observe(preview, { attributes: true, attributeFilter: ['class'] });
    console.log('   ✓ Monitoring preview area classes');
}

// Monitor layout elements for style changes
const layoutObserver = new MutationObserver((mutations) => {
    mutations.forEach(m => {
        if (m.attributeName === 'style') {
            const el = m.target;
            console.log('   🎨 Style changed on:', el.className);
            console.log('      New style:', el.style.cssText);
            console.log('      Grid:', el.style.gridTemplateColumns);
        }
    });
});

document.querySelectorAll('.layout-two-column').forEach(el => {
    layoutObserver.observe(el, { attributes: true, attributeFilter: ['style'] });
});
console.log('   ✓ Monitoring layout styles');

// 8. CHECK CSS Rules
console.log('\n8️⃣ CSS RULES CHECK:');
let foundRules = 0;
Array.from(document.styleSheets).forEach(sheet => {
    try {
        Array.from(sheet.cssRules || []).forEach(rule => {
            if (rule.selectorText && rule.selectorText.includes('device-mobile') && 
                rule.selectorText.includes('layout-two-column')) {
                foundRules++;
                console.log('   Found rule:', rule.selectorText);
                console.log('   Properties:', rule.style.cssText.substring(0, 100));
            }
        });
    } catch(e) {}
});
console.log('   Total device-mobile rules for layouts:', foundRules);

console.log('\n=================================');
console.log('📋 NEXT STEPS:');
console.log('1. Click the Mobile button');
console.log('2. Watch the console for changes');
console.log('3. Tell me what the output shows');
console.log('=================================\n');

// Clean up after 30 seconds
setTimeout(() => {
    console.log('\n🛑 MONITORING STOPPED');
    if (window.classObserver) classObserver.disconnect();
    if (window.layoutObserver) layoutObserver.disconnect();
}, 30000);
