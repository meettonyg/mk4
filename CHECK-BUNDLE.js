// Quick check if our JS fix is in the bundle
console.log('🔍 CHECKING IF FIX IS IN BUNDLE\n');

// Search for our fix code in all scripts
const scripts = Array.from(document.scripts);
let foundFix = false;

scripts.forEach(script => {
    if (script.src && script.src.includes('gmkb')) {
        console.log('Checking script:', script.src);
        
        // Fetch and check content
        fetch(script.src)
            .then(r => r.text())
            .then(content => {
                // Look for our fix code
                if (content.includes('overrideLayoutStyles')) {
                    console.log('✅ Found overrideLayoutStyles function in bundle!');
                    foundFix = true;
                }
                if (content.includes('devicePreviewObserver')) {
                    console.log('✅ Found devicePreviewObserver in bundle!');
                }
                if (content.includes('MutationObserver')) {
                    console.log('✅ Found MutationObserver usage in bundle!');
                }
                
                // Check if old code without fix
                if (!content.includes('overrideLayoutStyles') && content.includes('setDevice')) {
                    console.log('❌ Bundle has old DevicePreview code without fix!');
                    console.log('   You need to rebuild: npm run build');
                }
            });
    }
});

// Also check inline scripts
const inlineScripts = Array.from(document.scripts).filter(s => !s.src && s.textContent);
inlineScripts.forEach(script => {
    if (script.textContent.includes('overrideLayoutStyles')) {
        console.log('✅ Found fix in inline script!');
        foundFix = true;
    }
});

setTimeout(() => {
    if (!foundFix) {
        console.log('\n❌ FIX NOT FOUND IN BUNDLE!');
        console.log('The JavaScript fix is not in the built files.');
        console.log('\nTO FIX:');
        console.log('1. Make sure DevicePreview.vue has the overrideLayoutStyles code');
        console.log('2. Run: npm run build');
        console.log('3. Clear browser cache completely');
        console.log('4. Reload the page');
    }
}, 2000);
