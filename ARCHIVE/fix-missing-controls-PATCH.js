/**
 * ROOT FIX: Debug and fix missing controls on components
 * This script diagnoses why some components don't have controls and fixes them
 */

(function() {
    'use strict';
    
    console.log('🔧 Loading Missing Controls Fix...');
    
    // Wait for systems to be ready
    const initWhenReady = () => {
        if (window.componentControlsManager && window.enhancedComponentManager) {
            initializeFix();
        } else {
            document.addEventListener('gmkb:core-systems-ready', initializeFix, { once: true });
        }
    };
    
    const initializeFix = () => {
        console.log('🎯 Missing Controls Fix: Initializing...');
        
        // Listen for component render events
        document.addEventListener('gmkb:component-rendered', (event) => {
            console.log('📦 Component rendered:', event.detail);
            const { componentId, element } = event.detail;
            
            if (element && componentId) {
                // Ensure controls are attached after a brief delay for DOM to settle
                setTimeout(() => {
                    ensureControlsAttached(element, componentId);
                }, 100);
            }
        });
        
        // Also listen for state changes that might add components
        document.addEventListener('gmkb:state-changed', () => {
            setTimeout(checkAllComponents, 200);
        });
        
        // Initial check for existing components
        setTimeout(checkAllComponents, 500);
    };
    
    const ensureControlsAttached = (element, componentId) => {
        // Check if controls already exist
        if (element.querySelector('.component-controls--dynamic')) {
            console.log(`✅ Controls already present for ${componentId}`);
            return;
        }
        
        // Ensure element has proper attributes
        if (!element.hasAttribute('data-component-id')) {
            element.setAttribute('data-component-id', componentId);
            console.log(`📝 Set data-component-id="${componentId}" on element`);
        }
        
        // Ensure element has an ID
        if (!element.id) {
            element.id = componentId;
            console.log(`📝 Set id="${componentId}" on element`);
        }
        
        // Try to attach controls
        console.log(`🔧 Attempting to attach controls to ${componentId}...`);
        const success = window.componentControlsManager.attachControls(element, componentId);
        
        if (success) {
            console.log(`✅ Successfully attached controls to ${componentId}`);
        } else {
            console.error(`❌ Failed to attach controls to ${componentId}`);
            
            // Try alternative approach - dispatch event
            document.dispatchEvent(new CustomEvent('gmkb:attach-controls-requested', {
                detail: { componentElement: element, componentId }
            }));
        }
    };
    
    const checkAllComponents = () => {
        console.log('🔍 Checking all components for missing controls...');
        
        // Find all components
        const components = document.querySelectorAll(
            '[data-component-id], ' +
            '[data-component-type], ' +
            '.gmkb-component'
        );
        
        let missingCount = 0;
        let fixedCount = 0;
        
        components.forEach(element => {
            // Skip if in modal/overlay
            if (element.closest('.modal, .overlay, #component-library-overlay')) {
                return;
            }
            
            const componentId = element.id || element.getAttribute('data-component-id');
            
            if (!componentId) {
                console.warn('⚠️ Component without ID found:', element);
                return;
            }
            
            // Check for controls
            const hasControls = element.querySelector('.component-controls--dynamic');
            
            if (!hasControls) {
                missingCount++;
                console.log(`🔍 Component ${componentId} is missing controls`);
                
                // Try to fix
                ensureControlsAttached(element, componentId);
                
                // Check if fixed
                if (element.querySelector('.component-controls--dynamic')) {
                    fixedCount++;
                }
            }
        });
        
        console.log(`📊 Missing Controls Check Complete:
        - Total components: ${components.length}
        - Missing controls: ${missingCount}
        - Fixed: ${fixedCount}
        - Still missing: ${missingCount - fixedCount}`);
        
        if (missingCount - fixedCount > 0) {
            console.log('⚠️ Some components still missing controls. Run fixMissingControls() to try again.');
        }
    };
    
    // Global debug functions
    window.fixMissingControls = () => {
        console.log('🔧 FIXING MISSING CONTROLS...');
        checkAllComponents();
    };
    
    window.diagnoseComponent = (componentId) => {
        console.log(`🔍 DIAGNOSING COMPONENT: ${componentId}`);
        console.log('='.repeat(60));
        
        const element = document.getElementById(componentId);
        
        if (!element) {
            console.error('❌ Component element not found');
            return;
        }
        
        console.log('Element found:', element);
        console.log('Attributes:');
        console.log('  - id:', element.id);
        console.log('  - data-component-id:', element.getAttribute('data-component-id'));
        console.log('  - data-component-type:', element.getAttribute('data-component-type'));
        console.log('  - data-controls-attached:', element.getAttribute('data-controls-attached'));
        console.log('  - className:', element.className);
        
        const controls = element.querySelector('.component-controls--dynamic');
        console.log('Controls present:', !!controls);
        
        if (controls) {
            console.log('Control styles:');
            console.log('  - opacity:', controls.style.opacity);
            console.log('  - visibility:', controls.style.visibility);
            console.log('  - display:', window.getComputedStyle(controls).display);
            console.log('  - pointer-events:', controls.style.pointerEvents);
        }
        
        console.log('\nAttempting to attach controls...');
        ensureControlsAttached(element, componentId);
    };
    
    window.forceAttachControls = (componentId) => {
        const element = document.getElementById(componentId);
        if (!element) {
            console.error('Component not found:', componentId);
            return;
        }
        
        // Remove any existing controls
        const existingControls = element.querySelectorAll('.component-controls, .component-controls--dynamic');
        existingControls.forEach(ctrl => ctrl.remove());
        
        // Reset attributes
        element.removeAttribute('data-controls-attached');
        element.removeAttribute('data-controls-manager');
        element.removeAttribute('data-controls-processing');
        
        // Set required attributes
        element.setAttribute('data-component-id', componentId);
        if (!element.id) {
            element.id = componentId;
        }
        
        // Force attach
        console.log('🔧 Force attaching controls to', componentId);
        const success = window.componentControlsManager.attachControls(element, componentId);
        
        if (success) {
            console.log('✅ Controls attached successfully');
            
            // Make them visible for testing
            const controls = element.querySelector('.component-controls--dynamic');
            if (controls) {
                controls.style.opacity = '1';
                controls.style.visibility = 'visible';
                controls.style.pointerEvents = 'all';
                controls.style.border = '2px solid lime';
            }
        } else {
            console.error('❌ Failed to attach controls');
        }
        
        return success;
    };
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }
    
    console.log('✅ Missing Controls Fix loaded. Commands available:');
    console.log('  - fixMissingControls() - Check and fix all components');
    console.log('  - diagnoseComponent(componentId) - Diagnose specific component');
    console.log('  - forceAttachControls(componentId) - Force attach controls');
    
})();