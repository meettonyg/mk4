/**
 * Diagnostic tool for save failures in Media Kit Builder
 * Run these commands in the browser console to diagnose save issues
 */

window.diagnoseSave = {
    
    // Check if gmkbData is available
    checkData: function() {
        console.log('=== SAVE DIAGNOSTIC: Checking gmkbData ===');
        
        if (typeof gmkbData === 'undefined') {
            console.error('❌ gmkbData is not defined! This is critical.');
            return false;
        }
        
        console.log('✅ gmkbData exists');
        console.log('📊 Post ID:', gmkbData.postId || gmkbData.post_id || 'MISSING');
        console.log('📊 AJAX URL:', gmkbData.ajaxUrl || 'MISSING');
        console.log('📊 Nonce:', gmkbData.nonce ? gmkbData.nonce.substring(0, 10) + '...' : 'MISSING');
        
        // Check for mkcg_id in URL
        const urlParams = new URLSearchParams(window.location.search);
        const mkcgId = urlParams.get('mkcg_id');
        console.log('📊 mkcg_id from URL:', mkcgId || 'NOT FOUND');
        
        if (!gmkbData.postId && !gmkbData.post_id && mkcgId) {
            console.warn('⚠️ Post ID missing in gmkbData but mkcg_id found in URL: ' + mkcgId);
            console.log('🔧 Attempting to fix by setting gmkbData.postId = ' + mkcgId);
            gmkbData.postId = parseInt(mkcgId);
            gmkbData.post_id = parseInt(mkcgId);
        }
        
        return true;
    },
    
    // Test save with minimal data
    testMinimalSave: async function() {
        console.log('=== SAVE DIAGNOSTIC: Testing minimal save ===');
        
        if (!this.checkData()) {
            console.error('❌ Cannot test save - gmkbData not properly configured');
            return;
        }
        
        const postId = gmkbData.postId || gmkbData.post_id;
        if (!postId) {
            console.error('❌ No post ID available for save');
            return;
        }
        
        const testState = {
            components: {},
            layout: [],
            globalSettings: {},
            test: true,
            timestamp: Date.now()
        };
        
        console.log('📤 Sending test save for post ID:', postId);
        console.log('📤 Test state:', testState);
        
        const formData = new FormData();
        formData.append('action', 'gmkb_save_media_kit');
        formData.append('nonce', gmkbData.nonce);
        formData.append('post_id', postId);
        formData.append('state', JSON.stringify(testState));
        
        try {
            const response = await fetch(gmkbData.ajaxUrl, {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            });
            
            const text = await response.text();
            console.log('📥 Raw response:', text);
            
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    console.log('✅ Test save successful!', data);
                } else {
                    console.error('❌ Test save failed:', data);
                }
                return data;
            } catch (e) {
                console.error('❌ Failed to parse response as JSON:', e);
                console.log('📥 Response was:', text);
                
                // Check for common PHP errors
                if (text.includes('Fatal error')) {
                    console.error('🔴 PHP Fatal Error detected in response!');
                }
                if (text.includes('Warning')) {
                    console.warn('⚠️ PHP Warning detected in response');
                }
            }
        } catch (error) {
            console.error('❌ Network error during save:', error);
        }
    },
    
    // Get current state from the app
    getCurrentState: function() {
        console.log('=== SAVE DIAGNOSTIC: Getting current state ===');
        
        // Try to get state from Vue app (lean bundle)
        if (window.vueApp && window.vueApp.$pinia) {
            const store = window.vueApp.$pinia._s.get('main');
            if (store) {
                console.log('✅ Got state from Vue/Pinia store');
                console.log('📊 Components:', Object.keys(store.components).length);
                console.log('📊 Layout:', store.layout.length);
                return {
                    components: store.components,
                    layout: store.layout,
                    sections: store.sections || [],
                    theme: store.theme,
                    globalSettings: store.globalSettings || {}
                };
            }
        }
        
        // Try to get from localStorage
        const stored = localStorage.getItem('gmkb_state');
        if (stored) {
            try {
                const state = JSON.parse(stored);
                console.log('✅ Got state from localStorage');
                console.log('📊 Components:', Object.keys(state.components || {}).length);
                return state;
            } catch (e) {
                console.error('❌ Failed to parse localStorage state');
            }
        }
        
        console.warn('⚠️ Could not retrieve current state');
        return null;
    },
    
    // Test save with actual current state
    testActualSave: async function() {
        console.log('=== SAVE DIAGNOSTIC: Testing save with actual state ===');
        
        const state = this.getCurrentState();
        if (!state) {
            console.error('❌ No state to save');
            return;
        }
        
        const postId = gmkbData.postId || gmkbData.post_id;
        if (!postId) {
            console.error('❌ No post ID for save');
            
            // Try to get from URL
            const urlParams = new URLSearchParams(window.location.search);
            const mkcgId = urlParams.get('mkcg_id');
            if (mkcgId) {
                console.log('🔧 Using mkcg_id from URL:', mkcgId);
                gmkbData.postId = parseInt(mkcgId);
                gmkbData.post_id = parseInt(mkcgId);
            } else {
                return;
            }
        }
        
        console.log('📤 Saving actual state for post ID:', postId);
        console.log('📊 State summary:', {
            components: Object.keys(state.components || {}).length,
            layout: (state.layout || []).length,
            theme: state.theme
        });
        
        const formData = new FormData();
        formData.append('action', 'gmkb_save_media_kit');
        formData.append('nonce', gmkbData.nonce);
        formData.append('post_id', postId);
        formData.append('state', JSON.stringify(state));
        
        try {
            const response = await fetch(gmkbData.ajaxUrl, {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            });
            
            const text = await response.text();
            
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    console.log('✅ Actual save successful!', data);
                } else {
                    console.error('❌ Actual save failed:', data);
                }
                return data;
            } catch (e) {
                console.error('❌ Failed to parse response:', e);
                console.log('📥 Raw response:', text);
            }
        } catch (error) {
            console.error('❌ Network error:', error);
        }
    },
    
    // Fix missing post ID
    fixPostId: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const mkcgId = urlParams.get('mkcg_id');
        
        if (!mkcgId) {
            console.error('❌ No mkcg_id in URL to use for fix');
            return false;
        }
        
        const postId = parseInt(mkcgId);
        console.log('🔧 Setting post ID to:', postId);
        
        // Set in gmkbData
        if (typeof gmkbData !== 'undefined') {
            gmkbData.postId = postId;
            gmkbData.post_id = postId;
            console.log('✅ Updated gmkbData with post ID');
        }
        
        // Set in Vue store if available
        if (window.vueApp && window.vueApp.$pinia) {
            const store = window.vueApp.$pinia._s.get('main');
            if (store) {
                store.postId = postId;
                console.log('✅ Updated Vue store with post ID');
            }
        }
        
        return true;
    },
    
    // Run all diagnostics
    runAll: async function() {
        console.log('🔍 RUNNING COMPLETE SAVE DIAGNOSTICS 🔍');
        console.log('=====================================');
        
        this.checkData();
        console.log('-------------------------------------');
        
        const state = this.getCurrentState();
        if (state) {
            console.log('Current state summary:', {
                components: Object.keys(state.components || {}).length,
                layout: (state.layout || []).length,
                hasPostId: !!(gmkbData.postId || gmkbData.post_id)
            });
        }
        console.log('-------------------------------------');
        
        console.log('Testing minimal save...');
        await this.testMinimalSave();
        console.log('-------------------------------------');
        
        console.log('Testing actual state save...');
        await this.testActualSave();
        console.log('=====================================');
        console.log('Diagnostics complete. Check results above.');
    }
};

// Auto-fix post ID if missing
(function() {
    if (typeof gmkbData !== 'undefined' && !gmkbData.postId && !gmkbData.post_id) {
        console.warn('⚠️ Post ID missing in gmkbData - attempting auto-fix...');
        if (window.diagnoseSave.fixPostId()) {
            console.log('✅ Post ID auto-fixed');
        }
    }
})();

console.log(`
📊 SAVE DIAGNOSTIC TOOL LOADED
================================
Available commands:

diagnoseSave.checkData()      - Check if gmkbData is properly configured
diagnoseSave.testMinimalSave() - Test save with minimal data
diagnoseSave.testActualSave()  - Test save with current state
diagnoseSave.getCurrentState() - Get the current media kit state
diagnoseSave.fixPostId()       - Fix missing post ID from URL
diagnoseSave.runAll()          - Run all diagnostics

Start with: diagnoseSave.runAll()
`);
