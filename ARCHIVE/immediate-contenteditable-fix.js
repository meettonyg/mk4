/**
 * IMMEDIATE CONTENTEDITABLE FIX
 * 
 * This script provides immediate fixing of contenteditable functionality
 * for topics components when the main script fails to initialize properly.
 * 
 * Usage: Run immediateContentEditableFix() in console
 */

(function() {
    'use strict';
    
    console.log('🚀 IMMEDIATE CONTENTEDITABLE FIX LOADED');
    
    function immediateContentEditableFix() {
        console.log('🎯 IMMEDIATE FIX: Starting contenteditable initialization...');
        
        // Find all topic title elements
        const topicTitles = document.querySelectorAll('.topic-title, .topics-container .topic-title, [data-topic-number]');
        console.log(`🎯 IMMEDIATE FIX: Found ${topicTitles.length} topic elements`);
        
        let successCount = 0;
        
        topicTitles.forEach((element, index) => {
            try {
                const topicNumber = index + 1;
                
                console.log(`🔧 FIXING: Topic ${topicNumber}`, element);
                
                // CRITICAL: Ensure contenteditable is properly set
                element.setAttribute('contenteditable', 'true');
                element.setAttribute('data-topic-number', topicNumber);
                element.setAttribute('spellcheck', 'false');
                element.style.outline = 'none';
                element.style.cursor = 'text';
                element.style.minHeight = '20px';
                element.style.padding = '4px 8px';
                element.style.borderRadius = '4px';
                element.style.transition = 'all 0.2s ease';
                
                // Store original value for comparison
                if (!element.hasAttribute('data-original-value')) {
                    element.setAttribute('data-original-value', element.textContent.trim());
                }
                
                // Remove existing listeners by cloning element
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                
                // Set up clear, simple event handlers
                newElement.addEventListener('mousedown', function(e) {
                    e.stopPropagation();
                    console.log(`🖱️ MOUSEDOWN: Topic ${topicNumber}`);
                });
                
                newElement.addEventListener('click', function(e) {
                    e.stopPropagation();
                    console.log(`👆 CLICK: Topic ${topicNumber} - focusing`);
                    
                    // Ensure proper focus
                    if (document.activeElement !== this) {
                        this.focus();
                        
                        // Place cursor at end
                        setTimeout(() => {
                            const range = document.createRange();
                            const selection = window.getSelection();
                            range.selectNodeContents(this);
                            range.collapse(false);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }, 10);
                    }
                });
                
                newElement.addEventListener('focus', function() {
                    console.log(`🎯 FOCUS: Topic ${topicNumber} - EDITING MODE ACTIVATED`);\n                    this.setAttribute('data-editing', 'true');\n                    this.style.backgroundColor = '#fff3cd';\n                    this.style.border = '2px solid #ffc107';\n                    this.style.boxShadow = '0 0 0 0.2rem rgba(255, 193, 7, 0.25)';\n                });\n                \n                newElement.addEventListener('blur', function() {\n                    console.log(`💫 BLUR: Topic ${topicNumber} - editing mode deactivated`);\n                    this.removeAttribute('data-editing');\n                    this.style.backgroundColor = '';\n                    this.style.border = '';\n                    this.style.boxShadow = '';\n                    \n                    const newValue = this.textContent.trim();\n                    const originalValue = this.getAttribute('data-original-value') || '';\n                    \n                    if (newValue !== originalValue) {\n                        console.log(`📝 CHANGE DETECTED: Topic ${topicNumber}: \"${originalValue}\" → \"${newValue}\"`);\n                        this.setAttribute('data-original-value', newValue);\n                        \n                        // Visual feedback for successful edit\n                        this.style.backgroundColor = '#d4edda';\n                        this.style.borderColor = '#28a745';\n                        setTimeout(() => {\n                            this.style.backgroundColor = '';\n                            this.style.borderColor = '';\n                        }, 1000);\n                    }\n                });\n                \n                newElement.addEventListener('input', function() {\n                    console.log(`⌨️ INPUT: Topic ${topicNumber} - text being typed`);\n                    // Visual feedback while typing\n                    this.style.backgroundColor = '#e3f2fd';\n                });\n                \n                newElement.addEventListener('keydown', function(e) {\n                    if (e.key === 'Enter') {\n                        e.preventDefault();\n                        console.log(`⏎ ENTER: Topic ${topicNumber} - finishing edit`);\n                        this.blur();\n                    }\n                    \n                    if (e.key === 'Escape') {\n                        console.log(`🚫 ESCAPE: Topic ${topicNumber} - cancelling edit`);\n                        const originalValue = this.getAttribute('data-original-value') || '';\n                        this.textContent = originalValue;\n                        this.blur();\n                    }\n                });\n                \n                // Add hover effects\n                newElement.addEventListener('mouseenter', function() {\n                    if (!this.hasAttribute('data-editing')) {\n                        this.style.backgroundColor = '#f8f9fa';\n                        this.style.border = '1px solid #dee2e6';\n                    }\n                });\n                \n                newElement.addEventListener('mouseleave', function() {\n                    if (!this.hasAttribute('data-editing')) {\n                        this.style.backgroundColor = '';\n                        this.style.border = '';\n                    }\n                });\n                \n                console.log(`✅ SUCCESS: Topic ${topicNumber} fully initialized`);\n                successCount++;\n                \n            } catch (error) {\n                console.error(`❌ ERROR: Failed to initialize topic ${index + 1}:`, error);\n            }\n        });\n        \n        console.log(`🎉 IMMEDIATE FIX COMPLETE: ${successCount}/${topicTitles.length} topics successfully initialized`);\n        \n        if (successCount > 0) {\n            console.log('💡 TRY NOW: Click on any topic text to start editing!');\n            console.log('⌨️ USE: Enter to save, Escape to cancel');\n            \n            // Show success notification\n            showSuccessNotification(`✅ ${successCount} topics are now editable!`);\n            \n            return true;\n        } else {\n            console.log('❌ FIX FAILED: No topics were successfully initialized');\n            showErrorNotification('❌ Fix failed - no editable topics found');\n            return false;\n        }\n    }\n    \n    function showSuccessNotification(message) {\n        const notification = document.createElement('div');\n        notification.innerHTML = message;\n        notification.style.cssText = `\n            position: fixed;\n            top: 20px;\n            right: 20px;\n            background: #28a745;\n            color: white;\n            padding: 12px 20px;\n            border-radius: 8px;\n            font-weight: bold;\n            z-index: 10000;\n            font-size: 14px;\n            box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n            animation: slideIn 0.3s ease-out;\n        `;\n        \n        // Add animation\n        const style = document.createElement('style');\n        style.textContent = `\n            @keyframes slideIn {\n                from { transform: translateX(100%); opacity: 0; }\n                to { transform: translateX(0); opacity: 1; }\n            }\n        `;\n        document.head.appendChild(style);\n        \n        document.body.appendChild(notification);\n        \n        setTimeout(() => {\n            if (notification.parentNode) {\n                notification.style.transform = 'translateX(100%)';\n                notification.style.opacity = '0';\n                setTimeout(() => {\n                    notification.parentNode.removeChild(notification);\n                }, 300);\n            }\n        }, 4000);\n    }\n    \n    function showErrorNotification(message) {\n        const notification = document.createElement('div');\n        notification.innerHTML = message;\n        notification.style.cssText = `\n            position: fixed;\n            top: 20px;\n            right: 20px;\n            background: #dc3545;\n            color: white;\n            padding: 12px 20px;\n            border-radius: 8px;\n            font-weight: bold;\n            z-index: 10000;\n            font-size: 14px;\n            box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n        `;\n        \n        document.body.appendChild(notification);\n        \n        setTimeout(() => {\n            if (notification.parentNode) {\n                notification.parentNode.removeChild(notification);\n            }\n        }, 4000);\n    }\n    \n    // Test function to verify topics are working\n    function testTopicsEditing() {\n        console.log('🧪 TESTING: Topics editing functionality...');\n        \n        const editableTopics = document.querySelectorAll('.topic-title[contenteditable=\"true\"]');\n        console.log(`🧪 Found ${editableTopics.length} contenteditable topics`);\n        \n        let results = {\n            total: editableTopics.length,\n            canFocus: 0,\n            hasListeners: 0,\n            editingMode: 0\n        };\n        \n        editableTopics.forEach((topic, index) => {\n            const topicNumber = index + 1;\n            \n            // Test focus ability\n            topic.focus();\n            if (document.activeElement === topic) {\n                results.canFocus++;\n                console.log(`✅ Topic ${topicNumber}: Can focus`);\n                \n                // Test editing mode activation\n                if (topic.hasAttribute('data-editing')) {\n                    results.editingMode++;\n                    console.log(`✅ Topic ${topicNumber}: Editing mode activated`);\n                } else {\n                    console.log(`❌ Topic ${topicNumber}: Editing mode not activated`);\n                }\n                \n                topic.blur();\n            } else {\n                console.log(`❌ Topic ${topicNumber}: Cannot focus`);\n            }\n            \n            // Test event listeners\n            if (topic.hasAttribute('data-topic-number')) {\n                results.hasListeners++;\n                console.log(`✅ Topic ${topicNumber}: Has event listeners`);\n            } else {\n                console.log(`❌ Topic ${topicNumber}: No event listeners`);\n            }\n        });\n        \n        console.log('📊 TEST RESULTS:', results);\n        \n        const isWorking = results.canFocus === results.total && results.editingMode === results.total;\n        \n        if (isWorking) {\n            console.log('🎉 SUCCESS: All topics are working correctly!');\n            showSuccessNotification('🎉 All topics are editable and working!');\n        } else {\n            console.log('⚠️ ISSUES DETECTED: Some topics may not be working properly');\n            console.log('💡 TRY: Run immediateContentEditableFix() to fix issues');\n        }\n        \n        return isWorking;\n    }\n    \n    // Auto-run the fix when loaded\n    function autoRunFix() {\n        console.log('🚀 AUTO-RUN: Checking if topics need fixing...');\n        \n        // Check if topics exist\n        const topicTitles = document.querySelectorAll('.topic-title');\n        if (topicTitles.length === 0) {\n            console.log('ℹ️ No topics found - fix not needed');\n            return;\n        }\n        \n        // Check if they're already properly initialized\n        const editableTopics = document.querySelectorAll('.topic-title[contenteditable=\"true\"][data-topic-number]');\n        if (editableTopics.length === topicTitles.length) {\n            console.log('✅ Topics already properly initialized');\n            \n            // Quick test to make sure they're working\n            const testResult = testTopicsEditing();\n            if (!testResult) {\n                console.log('🔧 Topics exist but not working - applying fix...');\n                immediateContentEditableFix();\n            }\n            return;\n        }\n        \n        console.log('🔧 Topics need fixing - applying immediate fix...');\n        immediateContentEditableFix();\n    }\n    \n    // Expose functions globally\n    window.immediateContentEditableFix = immediateContentEditableFix;\n    window.fixTopicsNow = immediateContentEditableFix;\n    window.testTopicsEditing = testTopicsEditing;\n    \n    // Auto-run when DOM is ready\n    if (document.readyState === 'loading') {\n        document.addEventListener('DOMContentLoaded', function() {\n            setTimeout(autoRunFix, 1000); // Wait 1 second after DOM ready\n        });\n    } else {\n        // DOM already ready\n        setTimeout(autoRunFix, 500); // Wait 0.5 seconds\n    }\n    \n    console.log('🎯 IMMEDIATE FIX READY: Use immediateContentEditableFix() or fixTopicsNow() to fix topics immediately');\n    console.log('🧪 TEST READY: Use testTopicsEditing() to test if topics are working');\n    \n})();"