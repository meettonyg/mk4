/**
 * Debug script to identify what's causing the design panel to close
 */

(function() {
    console.log('%c🔍 PANEL CLOSING DEBUGGER ACTIVE', 'color: orange; font-size: 14px; font-weight: bold;');
    
    // Monitor design panel hide calls
    if (window.designPanel) {
        const originalHide = window.designPanel.hide;
        window.designPanel.hide = function(...args) {
            console.error('%c🚨 DESIGN PANEL HIDE CALLED!', 'color: red; font-size: 14px; font-weight: bold;');
            console.trace('Stack trace:');
            return originalHide.apply(this, args);
        };
    }
    
    // Monitor component deselection events
    document.addEventListener('gmkb:component-deselected', (e) => {
        console.warn('%c📢 COMPONENT DESELECTED EVENT', 'color: orange; font-size: 12px;', e.detail);
        console.trace('Event dispatched from:');
    });
    
    // Monitor selection manager
    if (window.componentSelectionManager) {
        const originalDeselect = window.componentSelectionManager.deselectCurrentComponent;
        window.componentSelectionManager.deselectCurrentComponent = function(...args) {
            console.error('%c🚨 DESELECT COMPONENT CALLED!', 'color: red; font-size: 14px; font-weight: bold;');
            console.log('isUpdating flag:', this.isUpdating);
            console.trace('Stack trace:');
            return originalDeselect.apply(this, args);
        };
    }
    
    // Monitor focus changes
    let lastFocused = null;
    document.addEventListener('focusout', (e) => {
        if (e.target.closest('#element-editor') || e.target.closest('.design-panel')) {
            console.log('%c📤 FOCUS OUT from design panel element', 'color: blue;', {
                from: e.target,
                to: e.relatedTarget,
                timestamp: Date.now()
            });
            lastFocused = e.target;
        }
    }, true);
    
    document.addEventListener('focusin', (e) => {
        if (e.target.closest('#element-editor') || e.target.closest('.design-panel')) {
            console.log('%c📥 FOCUS IN to design panel element', 'color: green;', {
                element: e.target,
                from: lastFocused,
                timestamp: Date.now()
            });
        }
    }, true);
    
    // Monitor clicks
    document.addEventListener('click', (e) => {
        if (e.target.closest('#element-editor') || e.target.closest('.design-panel')) {
            console.log('%c🖱️ CLICK in design panel', 'color: purple;', {
                target: e.target,
                currentTarget: e.currentTarget,
                bubbles: e.bubbles,
                defaultPrevented: e.defaultPrevented
            });
        }
    }, true);
    
    // Monitor update events
    document.addEventListener('gmkb:before-component-update', (e) => {
        console.log('%c⏳ BEFORE COMPONENT UPDATE', 'color: blue;', e.detail);
    });
    
    document.addEventListener('gmkb:after-component-update', (e) => {
        console.log('%c✅ AFTER COMPONENT UPDATE', 'color: green;', e.detail);
    });
    
    console.log('Debug listeners attached. Try clicking on a form field in the design panel to see what triggers.');
})();
