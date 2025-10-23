// DEVICE PREVIEW DEBUGGING SCRIPT
// Run this in browser console to identify the root cause

console.log('🔍 DEVICE PREVIEW DEBUGGER');
console.log('=========================\n');

// 1. CHECK: Is the class applied?
const preview = document.querySelector('#media-kit-preview');
console.log('1️⃣ Device class applied?', preview?.classList.contains('device-mobile'));

// 2. CHECK: Find the actual layout element
const layoutElement = document.querySelector('.layout-two-column');
if (layoutElement) {
    console.log('\n2️⃣ Layout element found:', layoutElement.className);
    
    // 3. CHECK: What styles are actually applied?
    const computed = window.getComputedStyle(layoutElement);
    console.log('3️⃣ Current grid columns:', computed.gridTemplateColumns);
    console.log('   Display:', computed.display);
    
    // 4. CHECK: Are there inline styles overriding?
    console.log('\n4️⃣ Inline styles:', layoutElement.getAttribute('style') || 'None');
    
    // 5. CHECK: What CSS rules are targeting this element?
    console.log('\n5️⃣ Finding CSS rules that match...');
    const sheets = Array.from(document.styleSheets);
    const matchingRules = [];
    
    sheets.forEach(sheet => {
        try {
            const rules = Array.from(sheet.cssRules || []);
            rules.forEach(rule => {
                if (rule.selectorText && layoutElement.matches(rule.selectorText)) {
                    matchingRules.push({
                        selector: rule.selectorText,
                        styles: rule.style.cssText
                    });
                }
            });
        } catch(e) {
            // Skip cross-origin sheets
        }
    });
    
    console.log('Matching CSS rules:', matchingRules);
    
    // 6. CHECK: Look for device-mobile rules in stylesheets
    console.log('\n6️⃣ Searching for device-mobile CSS rules...');
    const deviceRules = [];
    sheets.forEach(sheet => {
        try {
            const rules = Array.from(sheet.cssRules || []);
            rules.forEach(rule => {
                if (rule.selectorText && rule.selectorText.includes('device-mobile')) {
                    deviceRules.push({
                        selector: rule.selectorText,
                        styles: rule.style.cssText.substring(0, 100) + '...'
                    });
                }
            });
        } catch(e) {}
    });
    
    if (deviceRules.length === 0) {
        console.error('❌ NO device-mobile rules found in CSS!');
        console.log('   This means the CSS is NOT being bundled properly.');
    } else {
        console.log('✅ Found', deviceRules.length, 'device-mobile rules:');
        deviceRules.slice(0, 5).forEach(r => console.log('  -', r.selector));
    }
    
    // 7. CHECK: Is there a scoped style attribute?
    const scopedAttr = Array.from(layoutElement.attributes).find(
        attr => attr.name.startsWith('data-v-')
    );
    if (scopedAttr) {
        console.log('\n7️⃣ Vue scoped styles detected:', scopedAttr.name);
        console.log('   This might be overriding global styles!');
    }
    
    // 8. CHECK: What's the specificity battle?
    console.log('\n8️⃣ CSS Specificity Analysis:');
    console.log('   To override, we need higher specificity than:', 
                scopedAttr ? `[${scopedAttr.name}] .layout-two-column` : '.layout-two-column');
    
    // 9. TEST: Can we force it with inline styles?
    console.log('\n9️⃣ Testing inline style override...');
    layoutElement.style.gridTemplateColumns = '1fr';
    const newComputed = window.getComputedStyle(layoutElement).gridTemplateColumns;
    console.log('   After inline style:', newComputed);
    if (newComputed === '1fr' || newComputed.includes('1fr')) {
        console.log('   ✅ Inline styles work! CSS specificity is the issue.');
    } else {
        console.log('   ❌ Even inline styles don\'t work. Something else is overriding.');
    }
    
    // 10. CHECK: Build verification
    console.log('\n🔟 Build Check:');
    console.log('   Run this in terminal: grep -c "device-mobile" dist/gmkb.css');
    console.log('   If result is 0, CSS is not being bundled.');
    
} else {
    console.error('❌ No .layout-two-column element found!');
    console.log('Available layout elements:', 
                document.querySelectorAll('[class*="layout"]'));
}

console.log('\n=========================');
console.log('📊 SUMMARY');
console.log('=========================');
console.log('Next steps based on results above:');
console.log('- If NO device-mobile rules found → Fix CSS bundling');
console.log('- If rules exist but don\'t apply → Fix CSS specificity');
console.log('- If Vue scoped styles detected → Need to override scoped styles');
console.log('- If inline styles present → Need !important or inline JS');
