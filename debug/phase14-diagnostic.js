/**
 * Diagnostic script to verify Phase 1-4 scripts are loading
 */
(function() {
    'use strict';
    
    console.log('🔍 Phase 1-4 Script Loading Diagnostic Starting...');
    
    // Check what scripts are loaded
    const scriptChecks = {
        'ComponentLifecycle': typeof window.ComponentLifecycle,
        'DataState': typeof window.DataState,
        'SyncCoordinator': typeof window.SyncCoordinator,
        'DOMOwnershipManager': typeof window.DOMOwnershipManager,
        'TopicsEditor': typeof window.TopicsEditor,
        'migrateSyncSystem': typeof window.migrateSyncSystem,
        'openOwnershipDebug': typeof window.openOwnershipDebug
    };
    
    console.table(scriptChecks);
    
    // Check for script tags in DOM
    const phase14Scripts = [
        'component-lifecycle.js',
        'data-state.js',
        'sync-coordinator.js',
        'dom-ownership-manager.js',
        'main-initialization.js',
        'migrate-sync-system.js',
        'ownership-debug.js'
    ];
    
    console.log('📜 Checking for script tags:');
    phase14Scripts.forEach(scriptName => {
        const found = document.querySelector(`script[src*="${scriptName}"]`);
        if (found) {
            console.log(`✅ ${scriptName} - ${found.src}`);
        } else {
            console.log(`❌ ${scriptName} - NOT FOUND in DOM`);
        }
    });
    
    // Check WordPress data
    if (window.gmkbData) {
        console.log('📦 gmkbData available:', {
            postId: window.gmkbData.post_id,
            phase2Enabled: window.gmkbData.phase2Enabled,
            configurationDriven: window.gmkbData.configurationDriven,
            dataBindingEnabled: window.gmkbData.dataBindingEnabled
        });
    } else {
        console.log('❌ gmkbData not available');
    }
    
    // Set up ready event listeners
    const readyEvents = [
        'component:lifecycle-ready',
        'data-state:ready',
        'sync-coordinator:ready',
        'dom-ownership:ready',
        'gmkb:phase1-4-ready'
    ];
    
    readyEvents.forEach(eventName => {
        document.addEventListener(eventName, () => {
            console.log(`✅ Event fired: ${eventName}`);
        });
    });
    
    // Provide manual test function
    window.testPhase14Scripts = function() {
        console.group('🧪 Phase 1-4 Manual Test');
        
        // Try to create instances
        try {
            if (window.ComponentLifecycle) {
                console.log('✅ ComponentLifecycle is available');
            } else {
                console.log('❌ ComponentLifecycle not loaded');
            }
        } catch(e) {
            console.error('Error testing ComponentLifecycle:', e);
        }
        
        try {
            if (window.DataState) {
                const ds = new window.DataState();
                console.log('✅ DataState instantiated:', ds);
            } else {
                console.log('❌ DataState not loaded');
            }
        } catch(e) {
            console.error('Error testing DataState:', e);
        }
        
        try {
            if (window.SyncCoordinator) {
                console.log('✅ SyncCoordinator is available');
            } else {
                console.log('❌ SyncCoordinator not loaded');
            }
        } catch(e) {
            console.error('Error testing SyncCoordinator:', e);
        }
        
        try {
            if (window.DOMOwnershipManager) {
                console.log('✅ DOMOwnershipManager is available');
            } else {
                console.log('❌ DOMOwnershipManager not loaded');
            }
        } catch(e) {
            console.error('Error testing DOMOwnershipManager:', e);
        }
        
        console.groupEnd();
        return 'Test complete';
    };
    
    console.log('📋 Run testPhase14Scripts() to test Phase 1-4 loading');
    
})();
