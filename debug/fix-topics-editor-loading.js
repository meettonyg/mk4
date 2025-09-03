/**
 * Topics Editor Test and Fix
 * Ensures Topics editor loads and displays properly
 */

(function() {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    // Wait for systems to be ready
    function waitForSystems() {
        if (window.componentEditorRegistry && window.TopicsEditor) {
            logger.info('TOPICS_FIX', 'Systems ready, registering Topics editor');
            registerTopicsEditor();
        } else {
            logger.info('TOPICS_FIX', 'Waiting for systems...', {
                registry: !!window.componentEditorRegistry,
                editor: !!window.TopicsEditor
            });
            setTimeout(waitForSystems, 100);
        }
    }
    
    // Register the Topics editor
    function registerTopicsEditor() {
        if (!window.componentEditorRegistry.hasEditor('topics')) {
            window.componentEditorRegistry.register('topics', window.TopicsEditor);
            logger.info('TOPICS_FIX', 'Topics editor registered successfully');
        }
    }
    
    // Test function to manually load Topics editor
    window.testTopicsEditor = function(componentId) {
        componentId = componentId || 'topics-1756841493193-1';
        
        const container = document.getElementById('custom-content-editor');
        if (!container) {
            logger.error('TOPICS_FIX', 'No custom-content-editor container found');
            return;
        }
        
        // Get component data
        const component = window.enhancedStateManager?.getState()?.components?.[componentId];
        if (!component) {
            logger.error('TOPICS_FIX', `Component ${componentId} not found`);
            return;
        }
        
        // Extract topics from component
        let topics = [];
        if (component.props?.topics) {
            topics = component.props.topics;
        } else {
            // Try to extract from topic_1, topic_2, etc.
            for (let i = 1; i <= 10; i++) {
                const topicKey = `topic_${i}`;
                if (component.props?.[topicKey]) {
                    topics.push(component.props[topicKey]);
                } else if (component.data?.[topicKey]) {
                    topics.push(component.data[topicKey]);
                }
            }
        }
        
        logger.info('TOPICS_FIX', `Found ${topics.length} topics`, topics);
        
        // Create the editor
        const editor = new window.TopicsEditor(
            container,
            componentId,
            { topics },
            (id, data) => {
                logger.info('TOPICS_FIX', 'Topics updated', data);
                // Update component
                if (window.enhancedComponentManager) {
                    window.enhancedComponentManager.updateComponentProps(id, data);
                }
            }
        );
        
        // Render the editor
        editor.render().then(() => {
            logger.info('TOPICS_FIX', 'Topics editor rendered successfully');
        });
        
        return editor;
    };
    
    // Function to get topics from the preview
    window.getTopicsFromPreview = function(componentId) {
        componentId = componentId || 'topics-1756841493193-1';
        
        const componentEl = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentEl) {
            logger.error('TOPICS_FIX', 'Component not found in preview');
            return [];
        }
        
        const topicElements = componentEl.querySelectorAll('.topic-title');
        const topics = Array.from(topicElements).map(el => el.textContent.trim());
        
        logger.info('TOPICS_FIX', `Found ${topics.length} topics in preview`, topics);
        return topics;
    };
    
    // Function to manually create Topics editor with preview data
    window.createTopicsEditorFromPreview = function() {
        const topics = getTopicsFromPreview();
        const container = document.getElementById('custom-content-editor');
        
        if (!container) {
            // Create container if it doesn't exist
            const designTab = document.getElementById('design-tab');
            if (designTab) {
                const newContainer = document.createElement('div');
                newContainer.id = 'custom-content-editor';
                designTab.appendChild(newContainer);
                logger.info('TOPICS_FIX', 'Created custom-content-editor container');
            }
        }
        
        return testTopicsEditor('topics-1756841493193-1');
    };
    
    // Start the system
    waitForSystems();
    
    // Add diagnostic info
    logger.info('TOPICS_FIX', 'Topics editor fix loaded. Commands available:');
    logger.info('TOPICS_FIX', '  - testTopicsEditor() - Test editor loading');
    logger.info('TOPICS_FIX', '  - getTopicsFromPreview() - Get topics from preview');
    logger.info('TOPICS_FIX', '  - createTopicsEditorFromPreview() - Create editor with preview data');
    
})();
