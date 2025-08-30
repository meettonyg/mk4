/**
 * Emergency Container Visibility Fix
 * Ensures at least one container is always visible
 */
(function() {
    'use strict';
    
    function ensureContainerVisibility() {
        const savedContainer = document.getElementById('saved-components-container');
        const emptyState = document.getElementById('empty-state');
        const preview = document.getElementById('media-kit-preview');
        
        console.log('🔧 Container Visibility Check:', {
            savedContainer: savedContainer ? savedContainer.style.display : 'not found',
            emptyState: emptyState ? emptyState.style.display : 'not found',
            hasComponents: window.enhancedStateManager?.getState()?.components ? Object.keys(window.enhancedStateManager.getState().components).length : 0,
            hasSections: window.sectionLayoutManager?.getSections()?.length || 0
        });
        
        // Check if we have any content
        const state = window.enhancedStateManager?.getState();
        const hasComponents = state?.components && Object.keys(state.components).length > 0;
        const hasSections = state?.sections && Object.keys(state.sections).length > 0;
        const hasContent = hasComponents || hasSections;
        
        if (hasContent) {
            // Show saved container, hide empty state
            if (savedContainer) {
                savedContainer.style.display = 'block';
                console.log('✅ Showing saved-components-container (has content)');
            }
            if (emptyState) {
                emptyState.style.display = 'none';
            }
        } else {
            // Show empty state, hide saved container
            if (emptyState) {
                emptyState.style.display = 'block';
                console.log('✅ Showing empty-state (no content)');
            }
            if (savedContainer) {
                savedContainer.style.display = 'none';
            }
        }
        
        // Ensure preview container is visible
        if (preview && !preview.querySelector(':scope > div[style*="display: block"]')) {
            console.warn('⚠️ No visible container found in preview!');
            if (emptyState && emptyState.style.display !== 'block' && savedContainer && savedContainer.style.display !== 'block') {
                emptyState.style.display = 'block';
                console.log('🆘 Emergency: Forcing empty state visible');
            }
        }
    }
    
    // Run immediately
    ensureContainerVisibility();
    
    // Run when state changes
    document.addEventListener('gmkb:state-changed', ensureContainerVisibility);
    
    // Run when core systems are ready
    document.addEventListener('gmkb:core-systems-ready', () => {
        setTimeout(ensureContainerVisibility, 100);
    });
    
    // Make it available globally for debugging
    window.ensureContainerVisibility = ensureContainerVisibility;
    
    console.log('✅ Container Visibility Fix loaded - call ensureContainerVisibility() to debug');
    
})();