/**
 * Topics Component Client-Side Script
 * ARCHITECTURE: Self-contained component script that registers its rendering requirements
 */

(function() {
    'use strict';
    
    // ARCHITECTURE: Register this component as requiring server-side rendering
    // This ensures the component loads actual data from the database
    function registerTopicsComponent() {
        // Create global registry if it doesn't exist
        if (!window.gmkbServerRenderComponents) {
            window.gmkbServerRenderComponents = new Set();
        }
        
        // Register topics as requiring server render for data loading
        window.gmkbServerRenderComponents.add('topics');
        
        if (window.gmkbData?.debugMode) {
            console.log('Topics Component: Registered for server-side rendering');
        }
        
        // Emit event that topics component is ready
        document.dispatchEvent(new CustomEvent('gmkb:component-registered', {
            detail: {
                type: 'topics',
                requiresServerRender: true,
                timestamp: Date.now()
            }
        }));
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', registerTopicsComponent);
    } else {
        registerTopicsComponent();
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
