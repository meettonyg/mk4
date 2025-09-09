/**
 * Topics Component Client-Side Script
 * COMPLIANT: Self-contained component script for UI interactions only
 * No global registration - configuration handled via component.json
 */

(function() {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    // COMPLIANT: Initialize topics component UI behavior only
    function initializeTopicsComponent() {
        // Component configuration is read from component.json by discovery system
        // No need to register globally - requiresServerRender flag handles it
        
        if (window.gmkbData?.debugMode) {
            console.log('Topics Component: Initialized (server rendering configured via component.json)');
        }
        
        // Emit event that topics component is ready
        document.dispatchEvent(new CustomEvent('gmkb:component-registered', {
            detail: {
                type: 'topics',
                timestamp: Date.now()
            }
        }));
        
        // Initialize sync functionality
        initializeTopicsSync();
    }
    
    // SYNC FUNCTIONALITY: Handle bi-directional sync for Topics
    function initializeTopicsSync() {
        // Listen for Topics-specific data change events from the editor
        document.addEventListener('component:data-changed', handleDataChanged);
        document.addEventListener('component:editor-ready', handleEditorReady);
        
        logger.info('TOPICS', 'Sync functionality initialized');
    }
    
    function handleDataChanged(event) {
        const { componentId, newData } = event.detail;
        
        // Only handle topics components
        const preview = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!preview || !preview.classList.contains('gmkb-topics')) {
            return;
        }
        
        // Update preview with new topics data
        if (newData && newData.topics) {
            updatePreview(componentId, newData.topics);
            updateState(componentId, newData.topics);
        }
    }
    
    function handleEditorReady(event) {
        const { componentId, componentType } = event.detail;
        
        if (componentType === 'topics') {
            logger.info('TOPICS', `Editor ready for component: ${componentId}`);
        }
    }
    
    function updatePreview(componentId, topics) {
        const preview = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!preview) return;
        
        const container = preview.querySelector('.gmkb-topics__grid');
        if (!container) return;
        
        // Clear and rebuild topics display
        container.innerHTML = '';
        
        topics.forEach((topic, index) => {
            if (topic && topic.trim()) {
                const topicEl = document.createElement('div');
                topicEl.className = 'gmkb-topics__item';
                topicEl.innerHTML = `
                    <h4 class="topic-title" data-topic-number="${index + 1}">
                        ${topic}
                    </h4>
                `;
                container.appendChild(topicEl);
            }
        });
        
        logger.debug('TOPICS', `Updated preview with ${topics.length} topics`);
    }
    
    function updateState(componentId, topics) {
        if (!window.enhancedStateManager) return;
        
        const state = window.enhancedStateManager.getState();
        const component = state.components[componentId];
        
        if (!component) return;
        
        // Convert to Pods field format
        const newData = {};
        topics.forEach((topic, index) => {
            newData[`topic_${index + 1}`] = topic;
        });
        
        // Clear unused fields
        for (let i = topics.length + 1; i <= 10; i++) {
            newData[`topic_${i}`] = '';
        }
        
        // Update state
        window.enhancedStateManager.dispatch({
            type: 'UPDATE_COMPONENT',
            payload: {
                id: componentId,
                updates: { 
                    data: { ...component.data, ...newData },
                    props: { ...component.props, topics: topics }
                }
            }
        });
        
        // Trigger save if save handler exists
        if (window.GMKB?.Topics?.SaveHandler) {
            window.GMKB.Topics.SaveHandler.saveTopics(componentId, topics);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTopicsComponent);
    } else {
        initializeTopicsComponent();
    }
    
    // ARCHITECTURE: Component-specific functionality
    window.TopicsComponent = {
        // Method to handle topics editing
        edit: function(componentId) {
            const component = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!component) return;
            
            // Make topic titles editable
            const topicTitles = component.querySelectorAll('.topic-title[contenteditable]');
            topicTitles.forEach(title => {
                title.focus();
            });
        },
        
        // Method to save topics
        save: function(componentId) {
            const component = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!component) return;
            
            const topics = [];
            const topicTitles = component.querySelectorAll('.topic-title');
            
            topicTitles.forEach((title, index) => {
                const topicNumber = title.getAttribute('data-topic-number');
                const topicValue = title.textContent.trim();
                if (topicValue) {
                    topics[`topic_${topicNumber}`] = topicValue;
                }
            });
            
            // Trigger save event
            document.dispatchEvent(new CustomEvent('gmkb:component-save', {
                detail: {
                    componentId: componentId,
                    type: 'topics',
                    data: { topics: topics }
                }
            }));
        }
    };
    
})();
