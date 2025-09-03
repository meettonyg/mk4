/**
 * Topics Editor Load Verification
 * This script verifies if TopicsEditor is loading and helps diagnose issues
 */

(function() {
    'use strict';
    
    console.log('🔍 Topics Editor Load Verification Starting...');
    
    // Check if TopicsEditor script tag exists
    const scriptTag = document.querySelector('script[src*="TopicsEditor.js"]');
    if (scriptTag) {
        console.log('✅ TopicsEditor.js script tag found:', scriptTag.src);
        
        // Check for load errors
        scriptTag.addEventListener('error', (e) => {
            console.error('❌ TopicsEditor.js failed to load:', e);
        });
        
        scriptTag.addEventListener('load', (e) => {
            console.log('✅ TopicsEditor.js script tag loaded');
        });
    } else {
        console.error('❌ TopicsEditor.js script tag not found');
    }
    
    // Check TopicsEditor availability periodically
    let checkCount = 0;
    const checkInterval = setInterval(() => {
        checkCount++;
        
        const status = {
            TopicsEditor: typeof window.TopicsEditor,
            componentEditorRegistry: !!window.componentEditorRegistry,
            hasTopicsEditor: window.componentEditorRegistry?.hasEditor?.('topics') || false,
            quickTestTopics: typeof window.quickTestTopics
        };
        
        console.log(`Check #${checkCount}:`, status);
        
        if (status.TopicsEditor === 'function') {
            console.log('✅ TopicsEditor loaded successfully!');
            
            // If registry exists but topics not registered, register it
            if (window.componentEditorRegistry && !window.componentEditorRegistry.hasEditor('topics')) {
                window.componentEditorRegistry.register('topics', window.TopicsEditor);
                console.log('✅ Manually registered TopicsEditor with registry');
            }
            
            clearInterval(checkInterval);
            
            // Test the editor
            testEditorFunctionality();
        } else if (checkCount >= 10) {
            console.error('❌ TopicsEditor failed to load after 10 checks');
            console.log('Attempting manual load...');
            clearInterval(checkInterval);
            
            // Try to manually load the editor
            manuallyLoadEditor();
        }
    }, 500);
    
    function testEditorFunctionality() {
        console.log('🧪 Testing Topics Editor functionality...');
        
        // Check if we can create an instance
        try {
            const testContainer = document.createElement('div');
            const testEditor = new window.TopicsEditor(
                testContainer,
                'test-topics',
                { topics: ['Test Topic 1', 'Test Topic 2'] },
                (id, data) => console.log('Test update:', data)
            );
            
            console.log('✅ Topics Editor instance created successfully');
            
            // Try to render
            testEditor.render().then(() => {
                console.log('✅ Topics Editor render successful');
                console.log('HTML generated:', testContainer.innerHTML.substring(0, 100) + '...');
            });
        } catch (error) {
            console.error('❌ Error creating Topics Editor:', error);
        }
    }
    
    function manuallyLoadEditor() {
        // Try to fetch and eval the script manually
        const scriptUrl = '/wp-content/plugins/guestify-media-kit-builder/components/topics/TopicsEditor.js';
        
        fetch(scriptUrl)
            .then(response => response.text())
            .then(scriptText => {
                console.log('📄 Fetched TopicsEditor.js, length:', scriptText.length);
                
                // Check for syntax errors
                try {
                    // Use Function constructor to check syntax
                    new Function(scriptText);
                    console.log('✅ No syntax errors detected');
                    
                    // Execute the script
                    eval(scriptText);
                    console.log('✅ Script executed');
                    
                    // Check if it worked
                    if (typeof window.TopicsEditor === 'function') {
                        console.log('✅ TopicsEditor now available!');
                        testEditorFunctionality();
                    } else {
                        console.error('❌ Script executed but TopicsEditor not available');
                    }
                } catch (error) {
                    console.error('❌ Syntax error in TopicsEditor.js:', error);
                    console.log('Error details:', error.message);
                    console.log('This likely means there\'s still a syntax error in the file');
                }
            })
            .catch(error => {
                console.error('❌ Failed to fetch TopicsEditor.js:', error);
            });
    }
    
    // Also check the state to see what topics we should be showing
    setTimeout(() => {
        const state = window.enhancedStateManager?.getState?.();
        if (state?.components?.['topics-1756841493193-1']) {
            const component = state.components['topics-1756841493193-1'];
            console.log('📊 Topics component in state:', component);
            console.log('Topics data:', component.data);
        }
    }, 1000);
    
})();
