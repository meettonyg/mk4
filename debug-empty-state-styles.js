// Quick style debug for empty state

console.log('=== Empty State Style Debug ===');

function checkEmptyStateStyles() {
    const emptyState = document.getElementById('empty-state');
    const preview = document.getElementById('media-kit-preview');
    
    if (!emptyState) {
        console.error('Empty state not found!');
        return;
    }
    
    const computedStyles = window.getComputedStyle(emptyState);
    const previewStyles = window.getComputedStyle(preview);
    
    console.log('Empty State Computed Styles:');
    console.log('- Display:', computedStyles.display);
    console.log('- Visibility:', computedStyles.visibility);
    console.log('- Background:', computedStyles.background);
    console.log('- Color:', computedStyles.color);
    console.log('- Font Family:', computedStyles.fontFamily);
    
    console.log('\nPreview Container Styles:');
    console.log('- Background:', previewStyles.background);
    console.log('- Color:', previewStyles.color);
    
    // Check button styles
    const primaryBtn = document.getElementById('add-first-component');
    if (primaryBtn) {
        const btnStyles = window.getComputedStyle(primaryBtn);
        console.log('\nPrimary Button Styles:');
        console.log('- Background:', btnStyles.background);
        console.log('- Color:', btnStyles.color);
        console.log('- Padding:', btnStyles.padding);
        console.log('- Border:', btnStyles.border);
        console.log('- Display:', btnStyles.display);
    }
    
    // Check if CSS files are loaded
    const styleSheets = Array.from(document.styleSheets);
    const builderCSS = styleSheets.find(sheet => sheet.href && sheet.href.includes('guestify-builder.css'));
    
    if (builderCSS) {
        console.log('\nBuilder CSS loaded:', builderCSS.href);
        try {
            const rules = Array.from(builderCSS.cssRules || builderCSS.rules);
            const emptyStateRules = rules.filter(rule => 
                rule.selectorText && rule.selectorText.includes('empty-state')
            );
            console.log('Empty state CSS rules found:', emptyStateRules.length);
        } catch (e) {
            console.log('Cannot access CSS rules (cross-origin)');
        }
    } else {
        console.error('Builder CSS not found!');
    }
}

// Fix function to apply styles directly
window.fixEmptyStateStyles = function() {
    const emptyState = document.getElementById('empty-state');
    const preview = document.getElementById('media-kit-preview');
    
    if (!emptyState) {
        console.error('Empty state not found!');
        return;
    }
    
    // Ensure preview has white background
    preview.style.background = 'white';
    preview.style.color = '#1a1a1a';
    
    // Apply title styles
    const title = emptyState.querySelector('.empty-state__title');
    if (title) {
        title.style.color = '#1e293b';
        title.style.fontSize = '24px';
        title.style.fontWeight = '600';
    }
    
    // Apply text styles
    const text = emptyState.querySelector('.empty-state__text');
    if (text) {
        text.style.color = '#64748b';
        text.style.fontSize = '16px';
    }
    
    // Fix buttons
    const buttons = emptyState.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.gap = '8px';
        btn.style.padding = '10px 20px';
        btn.style.borderRadius = '6px';
        btn.style.fontSize = '14px';
        btn.style.fontWeight = '500';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s';
        btn.style.border = 'none';
        
        if (btn.classList.contains('btn--primary')) {
            btn.style.background = '#0ea5e9';
            btn.style.color = 'white';
        } else if (btn.classList.contains('btn--secondary')) {
            btn.style.background = 'transparent';
            btn.style.color = '#64748b';
            btn.style.border = '1px solid #e2e8f0';
        }
    });
    
    console.log('Styles applied!');
};

// Run check on load
setTimeout(checkEmptyStateStyles, 500);

console.log('Commands available:');
console.log('- checkEmptyStateStyles() - Check current styles');
console.log('- fixEmptyStateStyles() - Apply inline styles as temporary fix');