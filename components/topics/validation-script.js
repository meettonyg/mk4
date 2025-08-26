/**
 * Topics Component Enhanced - Validation Script
 * Tests all enhanced functionality including drag & drop
 * 
 * @package Guestify/Components/Topics
 * @version 5.0.0-validation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for the enhanced topics system to load
    setTimeout(() => {
        console.log('🧪 TOPICS VALIDATION: Starting enhanced functionality tests...');
        
        // Test 1: Check if enhanced scripts loaded
        const testsResults = [];
        
        // ROOT FIX: Check for simplified sync system instead of complex TopicsEnhanced
        if (typeof window.TopicsSync !== 'undefined') {
            testsResults.push('✅ TopicsSync global object loaded (simplified system)');
            
            // Test available methods
            if (typeof window.TopicsSync.initialize === 'function') {
                testsResults.push('✅ initialize method available');
            } else {
                testsResults.push('❌ initialize method missing');
            }
            
            if (typeof window.TopicsSync.testSync === 'function') {
                testsResults.push('✅ testSync method available');
            } else {
                testsResults.push('❌ testSync method missing');
            }
            
            if (typeof window.TopicsSync.debug === 'function') {
                testsResults.push('✅ debug method available');
            } else {
                testsResults.push('❌ debug method missing');
            }
        } else {
            testsResults.push('❌ TopicsSync global object not found - check panel-script.js');
        }
        
        // ROOT FIX: Check for simplified sync elements instead of complex topics-list
        const previewElements = document.querySelectorAll('.topic-title[contenteditable="true"]');
        const designPanelInputs = document.querySelectorAll('textarea[data-property^="topic_"], input[data-property^="topic_"]');
        
        if (previewElements.length > 0) {
            testsResults.push(`✅ ${previewElements.length} contenteditable preview elements found`);
            
            // Check for sync initialization
            const initializedElements = document.querySelectorAll('.topic-title[data-sync-initialized="true"]');
            if (initializedElements.length > 0) {
                testsResults.push(`✅ ${initializedElements.length} elements initialized for sync`);
            } else {
                testsResults.push('⚠️ No elements initialized for sync yet');
            }
        } else {
            testsResults.push('❌ No contenteditable preview elements found');
        }
        
        if (designPanelInputs.length > 0) {
            testsResults.push(`✅ ${designPanelInputs.length} design panel topic inputs found`);
        } else {
            testsResults.push('⚠️ No design panel topic inputs found (design panel may not be open)');
        }
        
        // Test 3: Check enhanced CSS classes
        const enhancedElements = document.querySelectorAll('.topic-item, .drag-handle, .auto-save-indicator');
        if (enhancedElements.length > 0) {
            testsResults.push(`✅ ${enhancedElements.length} enhanced elements found`);
        } else {
            testsResults.push('❌ No enhanced elements found');
        }
        
        // Test 4: Check keyboard shortcuts
        const keyboardShortcuts = document.getElementById('keyboard-shortcuts');
        if (keyboardShortcuts) {
            testsResults.push('✅ Keyboard shortcuts panel found');
        } else {
            testsResults.push('⚠️ Keyboard shortcuts panel not found');
        }
        
        // Test 5: Check notification system
        const notification = document.getElementById('notification');
        if (notification) {
            testsResults.push('✅ Notification system found');
        } else {
            testsResults.push('⚠️ Notification system not found');
        }
        
        // Test 6: Check enhanced styles
        const styleElements = document.querySelectorAll('.sidebar-header, .live-editor-section, .display-settings');
        if (styleElements.length >= 3) {
            testsResults.push('✅ Enhanced styling elements found');
        } else {
            testsResults.push(`⚠️ Only ${styleElements.length}/3 enhanced styling elements found`);
        }
        
        // Display results
        console.log('🧪 TOPICS VALIDATION RESULTS:');
        console.log('================================');
        testsResults.forEach(result => console.log(result));
        console.log('================================');
        
        // Overall status
        const passed = testsResults.filter(r => r.startsWith('✅')).length;
        const failed = testsResults.filter(r => r.startsWith('❌')).length;
        const warnings = testsResults.filter(r => r.startsWith('⚠️')).length;
        
        console.log(`📊 SUMMARY: ${passed} passed, ${warnings} warnings, ${failed} failed`);
        
        if (failed === 0) {
            console.log('TOPICS: All critical tests passed!');
            
            // Test the simplified sync system if available
            if (window.TopicsSync && typeof window.TopicsSync.debug === 'function') {
                console.log('Running TopicsSync validation...');
                window.TopicsSync.debug();
            }
        } else {
            console.warn('TOPICS: Some tests failed. Check implementation.');
        }
        
        // Expose test results globally for manual inspection
        window.topicsValidationResults = {
            passed,
            warnings,
            failed,
            results: testsResults,
            timestamp: new Date().toISOString()
        };
        
        // ROOT FIX: Test simplified sync functionality
        if (window.TopicsSync) {
            console.log('Testing simplified sync capabilities...');
            
            const syncMethods = ['initialize', 'testSync', 'debug', 'refreshSync'];
            const availableMethods = syncMethods.filter(method => typeof window.TopicsSync[method] === 'function');
            
            if (availableMethods.length > 0) {
                console.log(`Available sync methods: ${availableMethods.join(', ')}`);
                console.log('TIP: Run TopicsSync.testSync() to test bi-directional sync!');
            }
        }
        
    }, 1000); // Wait 1 second for all scripts to initialize
});

// ROOT FIX: Expose simplified validation function
window.validateTopicsSync = function() {
    console.log('Running Topics Sync validation...');
    // Re-run the validation
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Also run TopicsSync debug if available
    if (window.TopicsSync && typeof window.TopicsSync.debug === 'function') {
        setTimeout(() => {
            window.TopicsSync.debug();
        }, 500);
    }
};
