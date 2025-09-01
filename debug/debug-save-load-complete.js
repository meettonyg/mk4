/**
 * Comprehensive Save/Load Pipeline Debugger
 * ROOT CAUSE ANALYSIS: Trace every step of the save and load process
 */

(function() {
    'use strict';
    
    console.log('%c🔍 SAVE/LOAD PIPELINE DEBUGGER', 'font-size: 16px; font-weight: bold; color: #ff6b6b');
    
    // Step 1: Check current state
    console.group('📊 Step 1: Current State Analysis');
    const state = window.enhancedStateManager?.getState();
    console.log('State exists:', !!state);
    console.log('Components:', state?.components || {});
    console.log('Component count:', Object.keys(state?.components || {}).length);
    console.log('Layout:', state?.layout || []);
    console.log('saved_components array:', state?.saved_components || []);
    console.groupEnd();
    
    // Step 2: Check WordPress data
    console.group('🌐 Step 2: WordPress Data Check');
    console.log('gmkbData exists:', !!window.gmkbData);
    console.log('Post ID:', window.gmkbData?.postId || window.gmkbData?.post_id);
    console.log('Ajax URL:', window.gmkbData?.ajaxUrl);
    console.log('Nonce:', window.gmkbData?.nonce);
    console.log('Saved components from WP:', window.gmkbData?.saved_components);
    console.log('Saved state from WP:', window.gmkbData?.saved_state);
    console.groupEnd();
    
    // Step 3: Test save functionality
    window.debugSave = async function() {
        console.group('💾 Step 3: Testing Save Process');
        
        // Add a test component first
        const testId = 'debug-test-' + Date.now();
        const testComponent = {
            id: testId,
            type: 'hero',
            props: { title: 'Debug Test Component' },
            timestamp: Date.now()
        };
        
        // Add to state
        if (window.enhancedStateManager) {
            window.enhancedStateManager.addComponent(testComponent);
            console.log('✅ Added test component:', testId);
        }
        
        // Get updated state
        const stateToSave = window.enhancedStateManager?.getState();
        console.log('State to save:', stateToSave);
        
        // Try different save methods
        console.log('\n🔄 Method 1: WordPress Save Integration');
        if (window.wordPressSaveIntegration) {
            try {
                const result = await window.wordPressSaveIntegration.save('debug-test');
                console.log('✅ WordPress save result:', result);
            } catch (error) {
                console.error('❌ WordPress save failed:', error);
            }
        } else {
            console.error('❌ WordPress Save Integration not found!');
        }
        
        console.log('\n🔄 Method 2: Direct AJAX Save');
        try {
            const wpData = window.gmkbData;
            if (!wpData) throw new Error('No WordPress data');
            
            const formData = new FormData();
            formData.append('action', 'guestify_save_media_kit');
            formData.append('nonce', wpData.nonce);
            formData.append('post_id', wpData.postId || wpData.post_id);
            formData.append('state', JSON.stringify(stateToSave));
            
            console.log('Sending AJAX request to:', wpData.ajaxUrl);
            console.log('With action:', 'guestify_save_media_kit');
            console.log('Post ID:', wpData.postId || wpData.post_id);
            
            const response = await fetch(wpData.ajaxUrl, {
                method: 'POST',
                body: formData
            });
            
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            try {
                const responseData = JSON.parse(responseText);
                console.log('✅ Direct AJAX response:', responseData);
            } catch (e) {
                console.error('❌ Failed to parse response:', e);
            }
            
        } catch (error) {
            console.error('❌ Direct AJAX failed:', error);
        }
        
        console.log('\n🔄 Method 3: Component Manager Auto-Save');
        if (window.enhancedComponentManager?.autoSaveState) {
            try {
                const result = await window.enhancedComponentManager.autoSaveState('debug-test', {});
                console.log('✅ Component manager save result:', result);
            } catch (error) {
                console.error('❌ Component manager save failed:', error);
            }
        }
        
        console.groupEnd();
    };
    
    // Step 4: Check database directly
    window.checkDatabase = async function() {
        console.group('🗄️ Step 4: Database Check');
        
        const wpData = window.gmkbData;
        if (!wpData) {
            console.error('No WordPress data available');
            return;
        }
        
        // Create a custom AJAX request to check the database
        const formData = new FormData();
        formData.append('action', 'gmkb_debug_check_database');
        formData.append('nonce', wpData.nonce);
        formData.append('post_id', wpData.postId || wpData.post_id);
        
        try {
            const response = await fetch(wpData.ajaxUrl, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log('Database check result:', result);
        } catch (error) {
            console.error('Database check failed:', error);
            console.log('Note: You may need to add a debug action to check the database');
        }
        
        console.groupEnd();
    };
    
    // Step 5: Trace initialization
    console.group('🚀 Step 5: Initialization Trace');
    console.log('State Manager initialized:', window.enhancedStateManager?.isInitialized);
    console.log('Component Manager initialized:', window.enhancedComponentManager?.isInitialized);
    console.log('WordPress Save Integration:', !!window.wordPressSaveIntegration);
    
    // Check what data was loaded on init
    console.log('\n📥 Data loaded on init:');
    console.log('- getInitialStateFromSources should use gmkbData');
    console.log('- gmkbData.saved_components:', window.gmkbData?.saved_components);
    console.log('- gmkbData.saved_state:', window.gmkbData?.saved_state);
    console.groupEnd();
    
    // Step 6: localStorage vs Database
    console.group('💽 Step 6: Storage Comparison');
    const localStorageData = localStorage.getItem('guestifyMediaKitState');
    console.log('localStorage has data:', !!localStorageData);
    if (localStorageData) {
        try {
            const parsed = JSON.parse(localStorageData);
            console.log('localStorage components:', Object.keys(parsed.components || {}).length);
            console.log('localStorage data:', parsed);
        } catch (e) {
            console.error('Failed to parse localStorage:', e);
        }
    }
    console.groupEnd();
    
    // Provide action buttons
    console.log('\n%c🛠️ DIAGNOSTIC ACTIONS:', 'font-size: 14px; font-weight: bold; color: #4ecdc4');
    console.log('1. Run debugSave() - Test the save pipeline');
    console.log('2. Run checkDatabase() - Check database directly');
    console.log('3. Run clearLocalStorage() - Clear localStorage to test WP loading');
    
    window.clearLocalStorage = function() {
        localStorage.removeItem('guestifyMediaKitState');
        localStorage.removeItem('guestifyMediaKitState_backup');
        console.log('✅ localStorage cleared - refresh to test WordPress loading');
    };
    
    // Monitor save events
    document.addEventListener('gmkb:save-requested', (e) => {
        console.log('📡 gmkb:save-requested event:', e.detail);
    });
    
    document.addEventListener('gmkb:save-complete', (e) => {
        console.log('✅ gmkb:save-complete event:', e.detail);
    });
    
    document.addEventListener('gmkb:save-error', (e) => {
        console.error('❌ gmkb:save-error event:', e.detail);
    });
    
    // Check for save integration loading
    setTimeout(() => {
        if (!window.wordPressSaveIntegration) {
            console.error('%c❌ CRITICAL: WordPress Save Integration not loaded after 2 seconds!', 'color: red; font-weight: bold');
            console.log('This means the script is not being enqueued properly');
        }
    }, 2000);
    
})();