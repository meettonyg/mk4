// Test script to verify empty state centering fix
console.log('=== Empty State Centering Test ===');

function testEmptyStateCentering() {
    const preview = document.getElementById('media-kit-preview');
    const emptyState = document.getElementById('empty-state');
    const previewContainer = document.getElementById('preview-container');
    
    if (!preview || !emptyState) {
        console.error('Required elements not found!');
        return;
    }
    
    // Check computed styles
    const previewStyles = window.getComputedStyle(preview);
    const containerStyles = window.getComputedStyle(previewContainer);
    
    console.log('Preview Container Styles:');
    console.log('- Display:', containerStyles.display);
    console.log('- Flex Direction:', containerStyles.flexDirection);
    console.log('- Height:', containerStyles.height);
    
    console.log('\nMedia Kit Preview Styles:');
    console.log('- Display:', previewStyles.display);
    console.log('- Flex:', previewStyles.flex);
    console.log('- Justify Content:', previewStyles.justifyContent);
    console.log('- Align Items:', previewStyles.alignItems);
    console.log('- Height:', previewStyles.height);
    console.log('- Has "has-components" class:', preview.classList.contains('has-components'));
    
    // Test if centering should work
    const shouldCenter = !preview.classList.contains('has-components');
    const isFlexContainer = previewStyles.display === 'flex';
    const hasFlexGrow = previewStyles.flex.includes('1');
    const hasCenterJustify = previewStyles.justifyContent === 'center';
    const hasCenterAlign = previewStyles.alignItems === 'center';
    
    console.log('\nCentering Analysis:');
    console.log('- Should center (no components):', shouldCenter);
    console.log('- Is flex container:', isFlexContainer);
    console.log('- Has flex: 1:', hasFlexGrow);
    console.log('- Has justify-content: center:', hasCenterJustify);
    console.log('- Has align-items: center:', hasCenterAlign);
    
    if (shouldCenter && isFlexContainer && hasFlexGrow && hasCenterJustify && hasCenterAlign) {
        console.log('\n✅ All centering conditions are met!');
    } else {
        console.log('\n❌ Centering conditions not met. Issues:');
        if (!isFlexContainer) console.log('  - Not a flex container');
        if (!hasFlexGrow) console.log('  - Missing flex: 1');
        if (!hasCenterJustify) console.log('  - Missing justify-content: center');
        if (!hasCenterAlign) console.log('  - Missing align-items: center');
    }
    
    // Check empty state position
    const emptyRect = emptyState.getBoundingClientRect();
    const previewRect = preview.getBoundingClientRect();
    
    const horizontalCenter = Math.abs((emptyRect.left + emptyRect.width/2) - (previewRect.left + previewRect.width/2));
    const verticalCenter = Math.abs((emptyRect.top + emptyRect.height/2) - (previewRect.top + previewRect.height/2));
    
    console.log('\nEmpty State Position:');
    console.log('- Horizontal offset from center:', horizontalCenter.toFixed(2) + 'px');
    console.log('- Vertical offset from center:', verticalCenter.toFixed(2) + 'px');
    
    if (horizontalCenter < 5 && verticalCenter < 5) {
        console.log('✅ Empty state is properly centered!');
    } else {
        console.log('❌ Empty state is not centered');
    }
}

// Run test
testEmptyStateCentering();

// Manual fix function if needed
window.forceEmptyStateCentering = function() {
    const preview = document.getElementById('media-kit-preview');
    if (preview) {
        // Force remove has-components class
        preview.classList.remove('has-components');
        
        // Force apply centering styles
        preview.style.cssText = `
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
            width: 100% !important;
            justify-content: center !important;
            align-items: center !important;
            min-height: 500px !important;
            background: white !important;
        `;
        
        console.log('Centering styles forcefully applied!');
        testEmptyStateCentering();
    }
};

console.log('\nCommands available:');
console.log('- testEmptyStateCentering() - Run centering test');
console.log('- forceEmptyStateCentering() - Force apply centering styles');