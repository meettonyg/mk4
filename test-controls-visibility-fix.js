// Test to verify controls visibility after CSS fix
console.log("=== CONTROLS VISIBILITY FIX TEST ===");

function testControlsVisibility() {
    console.log("1. Checking CSS loaded:");
    const styleSheets = Array.from(document.styleSheets);
    const vueControlsCSS = styleSheets.find(sheet => sheet.href && sheet.href.includes('vue-controls.css'));
    console.log("   Vue controls CSS loaded:", !!vueControlsCSS);
    
    if (vueControlsCSS) {
        console.log("   ✓ CSS file path:", vueControlsCSS.href);
    } else {
        console.log("   ✗ CSS not found - the fix should resolve this!");
    }
    
    console.log("\n2. Checking controls overlay:");
    const overlay = document.querySelector('.gmkb-controls-overlay');
    if (overlay) {
        console.log("   ✓ Controls overlay exists");
        const computed = window.getComputedStyle(overlay);
        console.log("   Position:", computed.position);
        console.log("   Z-index:", computed.zIndex);
        console.log("   Pointer-events:", computed.pointerEvents);
    } else {
        console.log("   ✗ Controls overlay not found");
    }
    
    console.log("\n3. Checking hover state:");
    if (window.gmkbControlsInstance) {
        console.log("   Hovered component:", window.gmkbControlsInstance.hoveredComponentId || 'none');
        console.log("   Hovered section:", window.gmkbControlsInstance.hoveredSectionId || 'none');
    }
    
    console.log("\n4. Checking control elements:");
    const componentControls = document.querySelectorAll('.gmkb-component-controls');
    const sectionControls = document.querySelectorAll('.gmkb-section-controls');
    console.log("   Component controls found:", componentControls.length);
    console.log("   Section controls found:", sectionControls.length);
    
    if (componentControls.length > 0) {
        const control = componentControls[0];
        const computed = window.getComputedStyle(control);
        console.log("   Sample control styles:");
        console.log("   - Display:", computed.display);
        console.log("   - Position:", computed.position);
        console.log("   - Z-index:", computed.zIndex);
        console.log("   - Opacity:", computed.opacity);
    }
    
    console.log("\n=== FIX INSTRUCTIONS ===");
    console.log("After applying the CSS fix:");
    console.log("1. Clear browser cache (Ctrl+Shift+R)");
    console.log("2. Refresh the page");
    console.log("3. Hover over components - controls should appear");
    console.log("4. If controls still don't appear, check browser console for errors");
}

// Run test
testControlsVisibility();

// Monitor hover events
let lastHoveredComponent = null;
setInterval(() => {
    if (window.gmkbControlsInstance) {
        const current = window.gmkbControlsInstance.hoveredComponentId;
        if (current && current !== lastHoveredComponent) {
            console.log("Component hover detected:", current);
            lastHoveredComponent = current;
        }
    }
}, 1000);