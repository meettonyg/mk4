// DEBUG: Check what's really happening
console.log('=== DEVICE PREVIEW DEBUG ===');

// 1. Check the actual scoped attribute
const layout = document.querySelector('.layout-two-column');
const scopedAttr = Array.from(layout.attributes).find(a => a.name.startsWith('data-v-'));
console.log('1. Current scoped attribute:', scopedAttr?.name || 'None');

// 2. Check for inline styles
console.log('2. Inline styles on element:', layout.style.cssText || 'None');

// 3. Get ALL computed styles
const computed = getComputedStyle(layout);
console.log('3. Grid computed values:');
console.log('   - display:', computed.display);
console.log('   - grid-template-columns:', computed.gridTemplateColumns);
console.log('   - gap:', computed.gap);

// 4. Check what CSS rules are actually applying
const sheets = Array.from(document.styleSheets);
let foundDeviceRules = false;
sheets.forEach(sheet => {
    try {
        Array.from(sheet.cssRules || []).forEach(rule => {
            if (rule.selectorText?.includes('device-mobile') && rule.selectorText?.includes('layout-two-column')) {
                console.log('4. Found device rule:', rule.selectorText);
                console.log('   Styles:', rule.style.gridTemplateColumns);
                foundDeviceRules = true;
            }
        });
    } catch(e) {}
});
if (!foundDeviceRules) {
    console.log('4. ❌ No device-mobile rules found for layout-two-column');
}

// 5. Try forcing with maximum specificity inline
console.log('\n5. Testing inline override...');
layout.style.cssText = 'display: grid !important; grid-template-columns: 1fr !important; gap: 20px !important;';
const afterForce = getComputedStyle(layout).gridTemplateColumns;
console.log('   After inline force:', afterForce);
if (afterForce === '1fr' || !afterForce.includes('px')) {
    console.log('   ✅ Inline override works!');
} else {
    console.log('   ❌ Something is STILL overriding even inline styles!');
    console.log('   This suggests JavaScript is setting values after CSS');
}

// 6. Look for any JavaScript that might be setting grid values
console.log('\n6. Checking for interfering JavaScript...');
if (window.ResizeObserver) {
    console.log('   ResizeObserver exists - could be recalculating');
}

// Remove inline test
layout.style.cssText = '';

console.log('\n=== NEXT STEPS ===');
console.log('The scoped attribute above needs to match what we use in CSS.');
console.log('If it changed from data-v-1c680fad, update the CSS to match.');
