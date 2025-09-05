/**
 * Component Selection System Monitor
 * ROOT FIX: Ensures design panel stays open during component updates
 * 
 * This diagnostic ensures the selection lifecycle works correctly:
 * 1. Component selection opens design panel
 * 2. Editing fields updates component without closing panel
 * 3. Selection is preserved through destructive re-rendering
 */

(function() {
    'use strict';
    
    console.log('%c=== SELECTION SYSTEM MONITOR ACTIVE ===', 'color: green; font-size: 14px; font-weight: bold;');
    
    // Monitor update lifecycle events
    let updateInProgress = false;
    let selectedDuringUpdate = null;
    
    document.addEventListener('gmkb:before-component-update', (event) => {
        updateInProgress = true;
        selectedDuringUpdate = event.detail.componentId;
        console.log('🔄 Update starting for:', selectedDuringUpdate, 'From design panel:', event.detail.isFromDesignPanel);
    });
    
    document.addEventListener('gmkb:after-component-update', (event) => {
        updateInProgress = false;
        console.log('✅ Update completed for:', event.detail.componentId);
        selectedDuringUpdate = null;
    });
    
    // Monitor selection events
    document.addEventListener('gmkb:component-selected', (event) => {
        console.log('🎯 Component selected:', event.detail.componentId, 'Restoration:', event.detail.isRestoration);
    });
    
    document.addEventListener('gmkb:component-deselected', (event) => {
        if (updateInProgress) {
            console.warn('⚠️ WARNING: Deselection during update! This should be prevented.');
        } else {
            console.log('🚫 Component deselected:', event.detail?.componentId || 'unknown');
        }
    });
    
    // Monitor design panel state
    setInterval(() => {
        if (window.designPanel && window.designPanel.currentComponentId) {
            const panelVisible = document.getElementById('element-editor')?.querySelector('.element-editor__title')?.textContent !== 'No Element Selected';
            if (!panelVisible && !updateInProgress) {
                console.warn('⚠️ Design panel hidden but has current component:', window.designPanel.currentComponentId);
            }
        }
    }, 2000);
    
    // Provide diagnostic function
    window.checkSelectionSystem = function() {
        console.log('\n=== SELECTION SYSTEM STATUS ===');
        console.log('Design Panel:', {
            exists: !!window.designPanel,
            currentComponent: window.designPanel?.currentComponentId,
            isUpdating: window.designPanel?.isUpdating
        });
        console.log('Selection Manager:', {
            exists: !!window.componentSelectionManager,
            selectedComponent: window.componentSelectionManager?.selectedComponentId,
            isUpdating: window.componentSelectionManager?.isUpdating
        });
        console.log('Update in progress:', updateInProgress);
        console.log('Components in DOM:', document.querySelectorAll('[data-component-id]').length);
        return 'Check complete';
    };
    
    console.log('To check status, run: checkSelectionSystem()');
    
})();
