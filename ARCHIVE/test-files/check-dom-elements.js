// Quick diagnostic function to check DOM elements
window.checkDOMElements = function() {
    console.log('🔍 DOM Element Diagnostic...\n');
    
    const elementsToCheck = [
        'media-kit-preview',
        'preview-container', 
        'preview',
        'guestify-preview',
        'builder-preview',
        'mk-preview'
    ];
    
    console.log('📋 Checking for preview container elements:');
    elementsToCheck.forEach(id => {
        const element = document.getElementById(id);
        console.log(`  ${id}:`, element ? '✅ Found' : '❌ Not found');
        if (element) {
            console.log(`    Classes: ${element.className}`);
            console.log(`    Parent: ${element.parentElement?.tagName}.${element.parentElement?.className}`);
        }
    });
    
    // Also check by class name
    console.log('\n📋 Checking for preview container by class:');
    const classPrefixes = ['preview', 'builder', 'media-kit', 'mk-'];
    classPrefixes.forEach(prefix => {
        const elements = document.querySelectorAll(`[class*="${prefix}"]`);
        if (elements.length > 0) {
            console.log(`  Elements with "${prefix}":`, elements.length);
            elements.forEach((el, i) => {
                if (i < 3) { // Show first 3
                    console.log(`    ${el.tagName}#${el.id || 'no-id'}.${el.className}`);
                }
            });
        }
    });
    
    return true;
};

console.log('📋 DOM diagnostic function loaded. Run checkDOMElements() to analyze available elements.');