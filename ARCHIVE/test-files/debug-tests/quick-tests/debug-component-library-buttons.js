/**
 * EMERGENCY DEBUG: Component Library Button Investigation
 * Run this in browser console to diagnose button issues
 */

function debugComponentLibraryButtons() {
    console.log('🔧 DEBUGGING: Component Library Button Investigation');
    console.log('='.repeat(60));
    
    // 1. Check if modal exists
    const modal = document.getElementById('component-library-overlay');
    console.log('📋 Modal element:', modal ? '✅ FOUND' : '❌ NOT FOUND');
    if (modal) {
        console.log('  - Modal display:', getComputedStyle(modal).display);
        console.log('  - Modal visibility:', getComputedStyle(modal).visibility);
    }
    
    // 2. Check if buttons exist
    const cancelBtn = document.getElementById('cancel-component-button');
    const addBtn = document.getElementById('add-component-button');
    
    console.log('📋 Cancel button (#cancel-component-button):', cancelBtn ? '✅ FOUND' : '❌ NOT FOUND');
    console.log('📋 Add button (#add-component-button):', addBtn ? '✅ FOUND' : '❌ NOT FOUND');
    
    if (cancelBtn) {
        console.log('  - Cancel button visible:', cancelBtn.offsetParent !== null);
        console.log('  - Cancel button text:', cancelBtn.textContent);
        console.log('  - Cancel button classes:', cancelBtn.className);
    }
    
    if (addBtn) {
        console.log('  - Add button visible:', addBtn.offsetParent !== null);
        console.log('  - Add button text:', addBtn.textContent);
        console.log('  - Add button classes:', addBtn.className);
    }
    
    // 3. Check component library system
    console.log('📋 Component library system:', typeof window.componentLibrarySystem);
    if (window.componentLibrarySystem) {
        console.log('  - Status:', window.componentLibrarySystem.getStatus());
    }
    
    // 4. Check modal system
    console.log('📋 Modal system:', typeof window.GMKB_Modals);
    if (window.GMKB_Modals) {
        console.log('  - Status:', window.GMKB_Modals.getStatus());
    }
    
    // 5. Check if component grid exists
    const componentGrid = document.getElementById('component-grid');
    console.log('📋 Component grid:', componentGrid ? '✅ FOUND' : '❌ NOT FOUND');
    
    if (componentGrid) {
        const cards = componentGrid.querySelectorAll('.component-card');
        console.log('  - Component cards found:', cards.length);
        const selectedCards = componentGrid.querySelectorAll('.component-card.selected');
        console.log('  - Selected cards:', selectedCards.length);
    }
    
    // 6. Test button click handlers manually
    console.log('🧪 TESTING: Manual button click simulation');
    
    if (cancelBtn) {
        console.log('  - Testing cancel button click...');
        try {
            cancelBtn.click();
            console.log('  - Cancel click: ✅ NO ERROR');
        } catch (error) {
            console.log('  - Cancel click: ❌ ERROR -', error.message);
        }
    }
    
    if (addBtn) {
        console.log('  - Testing add button click...');
        try {
            addBtn.click();
            console.log('  - Add click: ✅ NO ERROR');
        } catch (error) {
            console.log('  - Add click: ❌ ERROR -', error.message);
        }
    }
    
    // 7. Check for event listeners
    console.log('🔍 EVENT LISTENERS: Checking attached listeners');
    
    if (cancelBtn) {
        const cancelListeners = getEventListeners ? getEventListeners(cancelBtn) : 'DevTools required';
        console.log('  - Cancel button listeners:', cancelListeners);
    }
    
    if (addBtn) {
        const addListeners = getEventListeners ? getEventListeners(addBtn) : 'DevTools required';
        console.log('  - Add button listeners:', addListeners);
    }
    
    // 8. Manual event listener attachment test
    console.log('🔧 MANUAL FIX: Attempting to attach event listeners manually');
    
    if (cancelBtn && !cancelBtn.hasAttribute('data-debug-listener')) {
        cancelBtn.addEventListener('click', function(e) {
            console.log('🟢 MANUAL CANCEL: Button clicked!');
            e.preventDefault();
            
            // Try to hide modal
            if (window.GMKB_Modals) {
                window.GMKB_Modals.hide('component-library-overlay');
                console.log('🟢 MANUAL CANCEL: Modal hidden via GMKB_Modals');
            } else {
                const modal = document.getElementById('component-library-overlay');
                if (modal) {
                    modal.style.display = 'none';
                    console.log('🟢 MANUAL CANCEL: Modal hidden via direct style');
                }
            }
        });
        cancelBtn.setAttribute('data-debug-listener', 'true');
        console.log('  - ✅ Manual cancel listener attached');
    }
    
    if (addBtn && !addBtn.hasAttribute('data-debug-listener')) {
        addBtn.addEventListener('click', function(e) {
            console.log('🟢 MANUAL ADD: Button clicked!');
            e.preventDefault();
            
            const componentGrid = document.getElementById('component-grid');
            if (componentGrid) {
                const selectedCards = componentGrid.querySelectorAll('.component-card.selected');
                console.log(`🟢 MANUAL ADD: Found ${selectedCards.length} selected components`);
                
                if (selectedCards.length === 0) {
                    alert('Please select one or more components to add');
                    return;
                }
                
                selectedCards.forEach(card => {
                    const componentType = card.dataset.component;
                    console.log(`🟢 MANUAL ADD: Adding ${componentType}`);
                    
                    // Try to add component
                    if (window.enhancedComponentManager?.isReady()) {
                        window.enhancedComponentManager.addComponent(componentType, {});
                    } else {
                        console.log('🟢 MANUAL ADD: Component manager not ready');
                        alert('Component manager not ready. Component: ' + componentType);
                    }
                });
                
                // Clear selection and hide modal
                selectedCards.forEach(card => card.classList.remove('selected'));
                
                if (window.GMKB_Modals) {
                    window.GMKB_Modals.hide('component-library-overlay');
                }
            }
        });
        addBtn.setAttribute('data-debug-listener', 'true');
        console.log('  - ✅ Manual add listener attached');
    }
    
    console.log('='.repeat(60));
    console.log('🎯 SUMMARY: Manual listeners attached. Try clicking buttons now.');
    console.log('If buttons work now, the issue is with timing/initialization order.');
}

// Auto-run when script loads
debugComponentLibraryButtons();

// Also make available in console
window.debugComponentLibraryButtons = debugComponentLibraryButtons;

console.log('🚀 DEBUG SCRIPT LOADED: Run debugComponentLibraryButtons() anytime');
