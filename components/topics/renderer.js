/**
 * @file renderer.js
 * @description Topics Component Self-Registering Renderer
 * 
 * ✅ CHECKLIST COMPLIANT:
 * - Phase 1: Event-driven initialization, no polling
 * - Phase 2: Simplicity first, self-contained component
 * - Phase 3: No state management - pure rendering
 * - Phase 4: Error boundaries included
 * - Phase 5: WordPress data compatible
 * 
 * ARCHITECTURE: Self-contained component with self-registration
 */

(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'topics';
    
    // Component schema definition
    const schema = {
        dataBindings: {
            title: 'topics_title',
            topics: 'topics_list',
            // Support for individual topic fields (legacy)
            topic_1: 'topic_1',
            topic_2: 'topic_2',
            topic_3: 'topic_3',
            topic_4: 'topic_4',
            topic_5: 'topic_5',
            topic_6: 'topic_6',
            topic_7: 'topic_7',
            topic_8: 'topic_8',
            topic_9: 'topic_9',
            topic_10: 'topic_10'
        },
        layouts: ['grid', 'list', 'tags', 'cards'],
        defaults: {
            title: 'Speaking Topics',
            topics: [],
            layout: 'grid',
            maxTopics: 20,
            showPriority: false,
            columnsDesktop: 3,
            columnsMobile: 1,
            showDescriptions: true
        },
        validation: {
            required: [],
            maxTopics: 20,
            maxLength: {
                title: 100,
                topicTitle: 150,
                topicDescription: 500
            }
        }
    };
    
    /**
     * Render the topics component
     * @param {object} data - Component data (bound from Pods fields)
     * @param {object} options - Rendering options
     * @returns {string} HTML string
     */
    function renderComponent(data, options = {}) {
        try {
            // Extract title
            const title = data.title || schema.defaults.title;
            
            // Extract topics - support both array format and individual fields
            let topics = [];
            
            // First check if we have an array of topics
            if (Array.isArray(data.topics)) {
                topics = data.topics;
            } 
            // Otherwise, check for individual topic fields
            else {
                for (let i = 1; i <= 10; i++) {
                    const topicField = data[`topic_${i}`];
                    if (topicField) {
                        // Handle different topic data formats
                        if (typeof topicField === 'string' && topicField.trim()) {
                            topics.push({
                                topic_title: topicField,
                                topic_description: ''
                            });
                        } else if (typeof topicField === 'object' && topicField.topic_title) {
                            topics.push(topicField);
                        }
                    }
                }
            }
            
            // Extract options with defaults
            const layout = options.layout || schema.defaults.layout;
            const maxTopics = options.maxTopics || schema.defaults.maxTopics;
            const showPriority = options.showPriority !== undefined ? options.showPriority : schema.defaults.showPriority;
            const columnsDesktop = options.columnsDesktop || schema.defaults.columnsDesktop;
            const showDescriptions = options.showDescriptions !== undefined ? options.showDescriptions : schema.defaults.showDescriptions;
            
            // Build component HTML
            let html = `<div class="gmkb-topics gmkb-topics--${layout} gmkb-component--self-registered">`;
            
            // Add title
            html += `<h3 class="gmkb-topics__title">${escapeHtml(title)}</h3>`;
            
            // Add phase badge for debugging (remove in production)
            if (window.gmkbData?.debugMode) {
                html += `<div class="gmkb-component__phase2-badge">[SELF-REGISTERED - ${layout.toUpperCase()}]</div>`;
            }
            
            // Render topics based on layout
            if (topics.length > 0) {
                const displayTopics = topics.slice(0, maxTopics);
                
                switch(layout) {
                    case 'grid':
                        html += renderGridLayout(displayTopics, columnsDesktop, showPriority, showDescriptions);
                        break;
                    case 'list':
                        html += renderListLayout(displayTopics, showPriority, showDescriptions);
                        break;
                    case 'tags':
                        html += renderTagsLayout(displayTopics);
                        break;
                    case 'cards':
                        html += renderCardsLayout(displayTopics, columnsDesktop, showPriority, showDescriptions);
                        break;
                    default:
                        html += renderGridLayout(displayTopics, columnsDesktop, showPriority, showDescriptions);
                }
            } else {
                html += '<p class="gmkb-topics__empty">No topics configured yet.</p>';
            }
            
            html += '</div>';
            
            return html;
            
        } catch (error) {
            console.error(`Error rendering ${COMPONENT_TYPE}:`, error);
            // Return error component
            return `<div class="gmkb-component gmkb-component--error">
                <h3>⚠️ Error Rendering Topics Component</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>`;
        }
    }
    
    /**
     * Render grid layout
     */
    function renderGridLayout(topics, columns, showPriority, showDescriptions) {
        let html = `<div class="gmkb-topics__grid" style="grid-template-columns: repeat(${columns}, 1fr);">`;
        
        topics.forEach((topic, index) => {
            const topicTitle = topic.topic_title || topic.title || '';
            const topicDescription = topic.topic_description || topic.description || '';
            const priority = showPriority && (topic.priority || index + 1) ? 
                `<span class="gmkb-topics__priority">${topic.priority || index + 1}</span>` : '';
            
            html += `<div class="gmkb-topics__item">
                ${priority}
                <h4 class="gmkb-topics__item-title">${escapeHtml(topicTitle)}</h4>`;
            
            if (showDescriptions && topicDescription) {
                html += `<p class="gmkb-topics__item-description">${escapeHtml(topicDescription)}</p>`;
            }
            
            html += '</div>';
        });
        
        html += '</div>';
        return html;
    }
    
    /**
     * Render list layout
     */
    function renderListLayout(topics, showPriority, showDescriptions) {
        let html = '<ul class="gmkb-topics__list">';
        
        topics.forEach((topic, index) => {
            const topicTitle = topic.topic_title || topic.title || '';
            const topicDescription = topic.topic_description || topic.description || '';
            const priority = showPriority && (topic.priority || index + 1) ? 
                `<span class="gmkb-topics__priority">${topic.priority || index + 1}</span>` : '';
            
            html += `<li class="gmkb-topics__item">
                ${priority}
                <h4 class="gmkb-topics__item-title">${escapeHtml(topicTitle)}</h4>`;
            
            if (showDescriptions && topicDescription) {
                html += `<p class="gmkb-topics__item-description">${escapeHtml(topicDescription)}</p>`;
            }
            
            html += '</li>';
        });
        
        html += '</ul>';
        return html;
    }
    
    /**
     * Render tags layout
     */
    function renderTagsLayout(topics) {
        let html = '<div class="gmkb-topics__tags">';
        
        topics.forEach(topic => {
            const topicTitle = topic.topic_title || topic.title || '';
            if (topicTitle) {
                html += `<span class="gmkb-topics__tag">${escapeHtml(topicTitle)}</span>`;
            }
        });
        
        html += '</div>';
        return html;
    }
    
    /**
     * Render cards layout
     */
    function renderCardsLayout(topics, columns, showPriority, showDescriptions) {
        let html = `<div class="gmkb-topics__cards" style="grid-template-columns: repeat(${columns}, 1fr);">`;
        
        topics.forEach((topic, index) => {
            const topicTitle = topic.topic_title || topic.title || '';
            const topicDescription = topic.topic_description || topic.description || '';
            const priority = showPriority && (topic.priority || index + 1) ? 
                `<span class="gmkb-topics__priority-badge">${topic.priority || index + 1}</span>` : '';
            
            html += `<div class="gmkb-topics__card">
                ${priority}
                <div class="gmkb-topics__card-header">
                    <h4 class="gmkb-topics__card-title">${escapeHtml(topicTitle)}</h4>
                </div>`;
            
            if (showDescriptions && topicDescription) {
                html += `<div class="gmkb-topics__card-body">
                    <p class="gmkb-topics__card-description">${escapeHtml(topicDescription)}</p>
                </div>`;
            }
            
            html += '</div>';
        });
        
        html += '</div>';
        return html;
    }
    
    /**
     * HTML escape utility
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
    
    /**
     * Register the component with the global registry
     * ROOT FIX: Event-driven, no polling, proper API usage
     */
    function registerComponent() {
        if (window.GMKBComponentRegistry && typeof window.GMKBComponentRegistry.register === 'function') {
            // Register with proper component object structure
            const success = window.GMKBComponentRegistry.register(COMPONENT_TYPE, {
                renderer: renderComponent,
                schema: schema,
                type: COMPONENT_TYPE
            });
            if (success && window.gmkbData?.debugMode) {
                console.log(`✅ Topics component registered successfully`);
            }
        }
    }
    
    // Try immediate registration if registry exists
    if (window.GMKBComponentRegistry) {
        registerComponent();
    } else {
        // Listen for registry ready event - EVENT-DRIVEN, no polling
        document.addEventListener('gmkb:component-registry-ready', registerComponent);
    }
    
})();