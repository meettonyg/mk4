/**
 * @file blank-screen-diagnostic.js
 * @description Emergency diagnostic tool for blank screen after component addition
 * USAGE: Run this in browser console after blank screen occurs
 */

(function() {
    'use strict';
    
    console.group('🔍 BLANK SCREEN DIAGNOSTIC');
    
    // 1. Check if components exist in database/state
    console.log('=== STATE CHECK ===');
    const state = window.enhancedStateManager?.getState();
    if (state) {
        console.log('✅ State Manager Available');
        console.log('Components in state:', Object.keys(state.components || {}));
        console.log('Layout:', state.layout || []);
    } else {
        console.log('❌ State Manager Not Available');
    }
    
    // 2. Check DOM containers
    console.log('=== DOM CONTAINER CHECK ===');
    const previewContainer = document.getElementById('media-kit-preview');
    const savedContainer = document.getElementById('saved-components-container');
    const emptyState = document.getElementById('empty-state');
    
    console.log('Preview Container:', {
        exists: !!previewContainer,
        visible: previewContainer ? window.getComputedStyle(previewContainer).display : 'N/A',
        children: previewContainer ? previewContainer.children.length : 0,
        innerHTML: previewContainer ? previewContainer.innerHTML.length : 0
    });
    
    console.log('Saved Container:', {
        exists: !!savedContainer,
        visible: savedContainer ? window.getComputedStyle(savedContainer).display : 'N/A',
        children: savedContainer ? savedContainer.children.length : 0,
        innerHTML: savedContainer ? savedContainer.innerHTML.length : 0
    });
    
    console.log('Empty State:', {
        exists: !!emptyState,
        visible: emptyState ? window.getComputedStyle(emptyState).display : 'N/A'
    });
    
    // 3. Check for rendered components in DOM
    console.log('=== COMPONENT DOM CHECK ===');
    const allComponents = document.querySelectorAll('[data-component-id], .media-kit-component, .component-wrapper');
    console.log(`Found ${allComponents.length} component elements in DOM:`);
    allComponents.forEach((comp, index) => {
        const styles = window.getComputedStyle(comp);
        console.log(`Component ${index + 1}:`, {
            id: comp.id,
            classes: comp.className,
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            position: styles.position,
            zIndex: styles.zIndex,
            parent: comp.parentElement?.id || 'no-parent'
        });
    });
    
    // 4. Check for CSS that might be hiding content
    console.log('=== CSS HIDE CHECK ===');
    const bodyStyles = window.getComputedStyle(document.body);
    const htmlStyles = window.getComputedStyle(document.documentElement);
    const mainContainer = document.querySelector('.media-kit-builder-container, .guestify-container, main');
    
    console.log('Body styles:', {
        display: bodyStyles.display,
        visibility: bodyStyles.visibility,
        opacity: bodyStyles.opacity,
        overflow: bodyStyles.overflow
    });
    
    console.log('HTML styles:', {
        display: htmlStyles.display,
        visibility: htmlStyles.visibility,
        opacity: htmlStyles.opacity
    });
    
    if (mainContainer) {
        const mainStyles = window.getComputedStyle(mainContainer);
        console.log('Main container styles:', {
            display: mainStyles.display,
            visibility: mainStyles.visibility,
            opacity: mainStyles.opacity,
            height: mainStyles.height,
            overflow: mainStyles.overflow
        });
    }
    
    // 5. Check for JavaScript errors
    console.log('=== ERROR CHECK ===');
    const errors = [];
    const originalError = window.onerror;
    window.onerror = function(msg, url, line, col, error) {
        errors.push({ msg, url, line, col, error });
        console.log('Captured Error:', { msg, url, line, col, error });
        if (originalError) originalError.apply(window, arguments);
    };
    
    // 6. Component renderer status
    console.log('=== RENDERER STATUS ===');
    if (window.enhancedComponentRenderer) {
        console.log('Renderer Stats:', window.enhancedComponentRenderer.getStats());
        console.log('Renderer Cache:', window.enhancedComponentRenderer.componentCache);
    } else {
        console.log('❌ Enhanced Component Renderer Not Available');
    }
    
    // 7. Quick fixes to try
    console.log('=== QUICK FIXES TO TRY ===');
    console.log('Run these commands one by one:');
    console.log('1. Force show saved container: document.getElementById("saved-components-container").style.display = "block"');
    console.log('2. Force hide empty state: document.getElementById("empty-state").style.display = "none"');
    console.log('3. Force show body: document.body.style.display = "block"; document.body.style.visibility = "visible"');
    console.log('4. Manual render: window.enhancedComponentRenderer.render()');
    console.log('5. Reload without cache: location.reload(true)');
    
    console.groupEnd();
    
    // Auto-fix attempts
    console.log('🔧 ATTEMPTING AUTO-FIXES...');
    
    // Fix 1: Ensure containers are visible
    if (savedContainer) {
        savedContainer.style.display = 'block';
        savedContainer.style.visibility = 'visible';
        console.log('✅ Auto-fix: Showed saved container');
    }
    
    if (emptyState) {
        emptyState.style.display = 'none';
        console.log('✅ Auto-fix: Hid empty state');
    }
    
    // Fix 2: Force body visibility
    document.body.style.display = 'block';
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    console.log('✅ Auto-fix: Ensured body visibility');
    
    // Fix 3: Try manual render
    if (window.enhancedComponentRenderer) {
        setTimeout(() => {
            window.enhancedComponentRenderer.render().then(success => {
                console.log('✅ Auto-fix: Manual render result:', success);
            }).catch(error => {
                console.log('❌ Auto-fix: Manual render failed:', error);
            });
        }, 100);
    }
    
    console.log('🏁 DIAGNOSTIC COMPLETE - Check fixes above');
    
})();

// Export for manual use
window.blankScreenDiagnostic = function() {
    // Re-run the diagnostic
    console.clear();
    const script = document.createElement('script');
    script.textContent = arguments.callee.toString().replace('function() {', '(function() {').replace(/}$/, '})();');
    document.head.appendChild(script);
    document.head.removeChild(script);
};

console.log('🔍 Blank Screen Diagnostic Tool Loaded');
console.log('💡 Run blankScreenDiagnostic() in console if screen goes blank');
