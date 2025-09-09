/**
 * Biography Component JavaScript
 * COMPLIANT: Self-contained component behavior only
 */
(function() {
    'use strict';
    
    // Register biography component for server-side rendering to load Pods data
    if (!window.gmkbServerRenderComponents) {
        window.gmkbServerRenderComponents = new Set();
    }
    window.gmkbServerRenderComponents.add('biography');
    
    // Dispatch event to notify system
    document.dispatchEvent(new CustomEvent('gmkb:component-requires-server-render', {
        detail: { componentType: 'biography' }
    }));
    
    // Biography Component Class - handles only UI interactions
    class BiographyComponent {
        constructor(element) {
            this.element = element;
            this.init();
        }

        init() {
            // Initialize component UI behavior only
            this.setupEventListeners();
        }

        setupEventListeners() {
            const placeholder = this.element.querySelector('.biography-placeholder');
            if (placeholder) {
                placeholder.addEventListener('click', this.handleEdit.bind(this));
            }
            
            // Add edit button for existing content
            const content = this.element.querySelector('.biography-content');
            if (content) {
                content.addEventListener('dblclick', this.handleEdit.bind(this));
            }
        }

        handleEdit() {
            // Trigger edit event for this component
            const event = new CustomEvent('gmkb:component-edit-requested', {
                detail: {
                    componentId: this.element.id,
                    componentType: 'biography'
                },
                bubbles: true
            });
            this.element.dispatchEvent(event);
        }
    }

    // Initialize components when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const biographyElements = document.querySelectorAll('.biography-component');
        biographyElements.forEach(element => {
            new BiographyComponent(element);
        });
    });
    
})();