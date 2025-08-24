/**
 * Debug why controls are disappearing
 */
(function() {
    'use strict';
    
    console.log('🔍 Loading controls visibility debugger...');
    
    window.debugControlsVisibility = function() {
        console.log('🔍 DEBUGGING CONTROLS VISIBILITY');
        console.log('='.repeat(60));
        
        const components = document.querySelectorAll('[data-component-id]');
        console.log(`Found ${components.length} components`);
        
        components.forEach((component, index) => {
            const componentId = component.getAttribute('data-component-id');
            const controls = component.querySelector('.component-controls--dynamic');
            
            console.log(`\nComponent ${index + 1}: ${componentId}`);
            console.log(`  Has ID attribute: ${component.id === componentId}`);
            console.log(`  Has controls: ${!!controls}`);
            
            if (controls) {
                const styles = window.getComputedStyle(controls);
                console.log(`  Controls visibility:`);
                console.log(`    - opacity: ${styles.opacity}`);
                console.log(`    - visibility: ${styles.visibility}`);
                console.log(`    - pointer-events: ${styles.pointerEvents}`);
                console.log(`    - position: ${styles.position}`);
                console.log(`    - z-index: ${styles.zIndex}`);
                console.log(`    - display: ${styles.display}`);
                
                // Check if controls are in DOM
                console.log(`    - Parent element: ${controls.parentElement?.tagName}.${controls.parentElement?.className}`);
                console.log(`    - Controls HTML exists: ${controls.innerHTML.length > 0}`);
                
                // Force show for debugging
                controls.style.opacity = '1';
                controls.style.visibility = 'visible';
                controls.style.pointerEvents = 'all';
                controls.style.border = '2px solid lime';
                console.log(`  ✅ Forced controls visible`);
            } else {
                console.log(`  ❌ NO CONTROLS FOUND`);
                
                // Try to attach controls
                if (window.componentControlsManager && component.id) {
                    console.log(`  🔧 Attempting to attach controls...`);
                    const success = window.componentControlsManager.attachControls(component, componentId);
                    console.log(`  Result: ${success ? 'SUCCESS' : 'FAILED'}`);
                }
            }
        });
        
        console.log('\n' + '='.repeat(60));
    };
    
    // Auto-run after page loads
    setTimeout(() => {
        console.log('🤖 Auto-debugging controls visibility...');
        window.debugControlsVisibility();
    }, 2000);
    
    console.log('✅ Controls visibility debugger loaded!');
    console.log('Run debugControlsVisibility() to check controls');
    
})();
