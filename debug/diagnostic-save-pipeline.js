/**
 * Quick save diagnostic tool
 * Run this in the console to test the save pipeline
 */

(function() {
    'use strict';
    
    console.group('🔍 Save Pipeline Diagnostic');
    
    // Check if WordPress save integration exists
    console.log('1. WordPress Save Integration:', {
        exists: !!window.wordPressSaveIntegration,
        isSaving: window.wordPressSaveIntegration?.isSaving?.(),
        lastSaveTime: window.wordPressSaveIntegration?.getLastSaveTime?.()
    });
    
    // Check state manager
    console.log('2. State Manager:', {
        exists: !!window.enhancedStateManager,
        hasState: !!window.enhancedStateManager?.getState?.(),
        componentCount: Object.keys(window.enhancedStateManager?.getState?.()?.components || {}).length
    });
    
    // Check WordPress data
    console.log('3. WordPress Data:', {
        exists: !!window.gmkbData,
        hasAjaxUrl: !!window.gmkbData?.ajaxUrl,
        hasNonce: !!window.gmkbData?.nonce,
        postId: window.gmkbData?.postId || window.gmkbData?.post_id
    });
    
    // Check GMKB system
    console.log('4. GMKB System:', {
        exists: !!window.GMKB,
        hasDispatch: !!window.GMKB?.dispatch
    });
    
    // Add event listener to test event flow
    const testListener = (event) => {
        console.log('✅ gmkb:save-requested event received!', event.detail);
        document.removeEventListener('gmkb:save-requested', testListener);
    };
    document.addEventListener('gmkb:save-requested', testListener);
    
    // Test dispatching the event
    console.log('5. Testing event dispatch...');
    if (window.GMKB?.dispatch) {
        window.GMKB.dispatch('gmkb:save-requested', {
            source: 'diagnostic-test',
            timestamp: Date.now(),
            onComplete: (response) => {
                console.log('✅ Save completed!', response);
            },
            onError: (error) => {
                console.error('❌ Save failed!', error);
            }
        });
    } else {
        console.error('❌ GMKB dispatch not available');
    }
    
    // Direct test of WordPress save
    console.log('6. Testing direct WordPress save...');
    if (window.wordPressSaveIntegration) {
        window.wordPressSaveIntegration.save('diagnostic-direct-test')
            .then(response => {
                console.log('✅ Direct save succeeded!', response);
            })
            .catch(error => {
                console.error('❌ Direct save failed!', error);
            });
    } else {
        console.error('❌ WordPress save integration not available');
        
        // Try to load it manually
        console.log('Attempting to initialize WordPress save integration...');
        if (window.enhancedStateManager && window.gmkbData) {
            // The script should have already loaded, but let's check
            console.log('Dependencies are available, integration should be loaded');
        }
    }
    
    console.groupEnd();
    
    // Provide quick save function
    window.testSave = async function() {
        console.log('🔄 Testing save pipeline...');
        
        try {
            // Method 1: Through toolbar
            if (window.consolidatedToolbar) {
                console.log('Triggering save through toolbar...');
                window.consolidatedToolbar.handleSaveClick();
            }
            
            // Method 2: Direct WordPress save
            if (window.wordPressSaveIntegration) {
                console.log('Triggering direct WordPress save...');
                const result = await window.wordPressSaveIntegration.save('manual-test');
                console.log('✅ Save result:', result);
            }
            
            // Method 3: Through component manager
            if (window.enhancedComponentManager?.manualSave) {
                console.log('Triggering save through component manager...');
                const result = await window.enhancedComponentManager.manualSave();
                console.log('✅ Component manager save result:', result);
            }
            
        } catch (error) {
            console.error('❌ Save test failed:', error);
        }
    };
    
    console.log('\n💡 Run window.testSave() to test the save pipeline');
    
})();