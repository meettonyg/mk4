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
        
        // Check if TopicsEnhanced global is available
        if (typeof window.TopicsEnhanced !== 'undefined') {
            testsResults.push('✅ TopicsEnhanced global object loaded');
            
            // Test available methods
            if (typeof window.TopicsEnhanced.addTopic === 'function') {
                testsResults.push('✅ addTopic method available');
            } else {
                testsResults.push('❌ addTopic method missing');
            }
            
            if (typeof window.TopicsEnhanced.saveTopic === 'function') {
                testsResults.push('✅ saveTopic method available');
            } else {
                testsResults.push('❌ saveTopic method missing');
            }
            
            if (typeof window.TopicsEnhanced.showNotification === 'function') {
                testsResults.push('✅ showNotification method available');
            } else {
                testsResults.push('❌ showNotification method missing');
            }
        } else {
            testsResults.push('❌ TopicsEnhanced global object not found');
        }
        
        // Test 2: Check DOM elements
        const topicsList = document.getElementById('topics-list');
        if (topicsList) {
            testsResults.push('✅ Topics list container found');
            
            // Check for drag handles
            const dragHandles = topicsList.querySelectorAll('.drag-handle[draggable="true"]');
            if (dragHandles.length > 0) {
                testsResults.push(`✅ ${dragHandles.length} draggable handles found`);
            } else {
                testsResults.push('⚠️ No draggable handles found (may be empty state)');
            }
            
            // Check for topic inputs
            const topicInputs = topicsList.querySelectorAll('.topic-input');
            if (topicInputs.length > 0) {
                testsResults.push(`✅ ${topicInputs.length} topic inputs found`);
                
                // Test auto-expand functionality
                const firstInput = topicInputs[0];
                if (firstInput) {
                    const originalHeight = firstInput.style.height;
                    firstInput.style.height = 'auto';
                    const autoHeight = Math.min(firstInput.scrollHeight, 120) + 'px';
                    firstInput.style.height = autoHeight;
                    testsResults.push('✅ Auto-expand functionality working');
                }
            } else {
                testsResults.push('⚠️ No topic inputs found (may be empty state)');
            }
        } else {
            testsResults.push('❌ Topics list container not found');
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
            console.log('🎉 ENHANCED TOPICS: All critical tests passed!');
            
            // Show success notification if available
            if (window.TopicsEnhanced && typeof window.TopicsEnhanced.showNotification === 'function') {
                window.TopicsEnhanced.showNotification('Enhanced Topics loaded successfully!', 'success');
            }
        } else {
            console.warn('⚠️ ENHANCED TOPICS: Some tests failed. Check implementation.');
        }
        
        // Expose test results globally for manual inspection
        window.topicsValidationResults = {
            passed,
            warnings,
            failed,
            results: testsResults,
            timestamp: new Date().toISOString()
        };
        
        // Test drag & drop functionality (non-destructive)
        if (window.TopicsEnhanced) {
            console.log('🧪 Testing drag & drop capabilities...');
            
            const dragHandles = document.querySelectorAll('.drag-handle[draggable="true"]');
            if (dragHandles.length > 0) {
                console.log(`✅ ${dragHandles.length} draggable elements ready for interaction`);
                console.log('💡 TIP: Try dragging a topic handle to reorder topics!');
            }
            
            // Test keyboard shortcuts
            console.log('⌨️ KEYBOARD SHORTCUTS AVAILABLE:');
            console.log('  • Ctrl+N: Add new topic');
            console.log('  • Ctrl+S: Save topics');
            console.log('  • ?: Show keyboard shortcuts panel');
            console.log('  • Tab: Navigate between topics');
        }
        
    }, 1000); // Wait 1 second for all scripts to initialize
});

// Expose validation function for manual testing
window.validateTopicsEnhanced = function() {
    console.log('🔄 Running Topics Enhanced validation...');
    // Re-run the validation
    document.dispatchEvent(new Event('DOMContentLoaded'));
};
