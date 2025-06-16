/**
 * Component Renderer
 * Responsible for rendering components in the DOM based on state changes
 */

import { renderComponent } from './dynamic-component-loader.js';

class ComponentRenderer {
    constructor() {
        this.initialized = false;
        this.previewContainer = null;
    }
    
    /**
     * Initialize the component renderer
     */
    init() {
        if (this.initialized) return;
        
        // Find the preview container
        this.previewContainer = document.getElementById('media-kit-preview');
        
        if (!this.previewContainer) {
            console.error('Preview container not found. Components cannot be rendered.');
            return;
        }
        
        // Subscribe to state changes
        if (window.stateManager) {
            window.stateManager.subscribeGlobal(state => this.onStateChange(state));
        }
        
        // Listen for component-specific events
        document.addEventListener('gmkb-state-changed', e => {
            this.renderAllComponents(e.detail.state);
        });
        
        this.initialized = true;
        console.log('Component renderer initialized');
    }
    
    /**
     * Handle state changes
     * @param {Object} state - Current state
     */
    onStateChange(state) {
        this.renderAllComponents(state);
    }
    
    /**
     * Render all components based on current state
     * @param {Object} state - Current state
     */
    renderAllComponents(state) {
        if (!this.previewContainer) {
            console.error('Preview container not found. Cannot render components.');
            return;
        }
        
        const components = this.getSortedComponents(state);
        const existingComponents = this.previewContainer.querySelectorAll('[data-component-id]');
        
        // Check if a full re-render is necessary
        let needsRerender = (existingComponents.length !== components.length);
        if (!needsRerender) {
            existingComponents.forEach((el, index) => {
                if (el.getAttribute('data-component-id') !== components[index].id) {
                    needsRerender = true;
                }
            });
        }
        
        if (needsRerender) {
            this.renderAllFromScratch(components);
        }
        // If no re-render is needed, the DataBindingEngine will handle any necessary internal updates.
        // No else block or call to updateComponentData is required.
    }
    
    /**
     * Get sorted components from state
     * @param {Object} state - Current state
     * @returns {Array} Sorted components
     */
    getSortedComponents(state) {
        if (!state.components) return [];
        
        if (Array.isArray(state.components)) {
            return [...state.components].sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        
        return Object.entries(state.components).map(([id, component]) => ({
            id, 
            type: component.type,
            order: component.order,
            data: component.data
        })).sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    
    /**
     * Render all components from scratch
     * @param {Array} components - Components to render
     */
    async renderAllFromScratch(components) {
        if (!this.previewContainer) return;
        
        // Clear the container
        this.previewContainer.innerHTML = '';
        
        // Render each component
        for (const component of components) {
            try {
                console.log(`Rendering component: ${component.type} (${component.id})`);
                
                // Use the dynamic component loader to render the component
                const html = await renderComponent(component.type, component.id, component.data);
                
                // Add to the preview container
                this.previewContainer.insertAdjacentHTML('beforeend', html);
                
                // Make the component interactive
                this.setupComponentInteractivity(component.id);
            } catch (error) {
                console.error(`Failed to render component ${component.type}:`, error);
                
                // Add a placeholder for the failed component
                const placeholder = document.createElement('div');
                placeholder.className = 'editable-element component-placeholder';
                placeholder.setAttribute('data-component-id', component.id);
                placeholder.setAttribute('data-component-type', component.type);
                placeholder.innerHTML = `
                    <div class="element-controls">
                        <button class="control-btn" title="Move Up">↑</button>
                        <button class="control-btn" title="Move Down">↓</button>
                        <button class="control-btn" title="Duplicate">⧉</button>
                        <button class="control-btn" title="Delete">×</button>
                    </div>
                    <h3>${component.type} Component</h3>
                    <p>This component could not be rendered. Please try refreshing.</p>
                `;
                
                this.previewContainer.appendChild(placeholder);
            }
        }
        
        // Trigger a rendered event
        document.dispatchEvent(new CustomEvent('components-rendered', {
            detail: { count: components.length }
        }));
    }
    
    // updateComponentData method has been removed
    // DataBindingEngine now handles all internal component updates
    
    /**
     * Set up interactivity for a component
     * @param {string} componentId - Component ID
     */
    setupComponentInteractivity(componentId) {
        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!element) return;
        
        // Import needed modules for interactivity
        import('../ui/element-editor.js').then(module => {
            // Add click handler for selection
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                module.selectElement(element);
                
                // Dispatch selection event
                document.dispatchEvent(new CustomEvent('component-selected', {
                    detail: {
                        componentId,
                        componentType: element.getAttribute('data-component-type')
                    }
                }));
            });
            
            // Set up content editable elements
            const editables = element.querySelectorAll('[contenteditable="true"]');
            editables.forEach(editable => {
                editable.addEventListener('blur', () => {
                    const settingKey = editable.getAttribute('data-setting');
                    if (settingKey && window.stateManager) {
                        window.stateManager.updateComponent(componentId, settingKey, editable.textContent);
                    }
                });
                
                // Prevent Enter key in single-line editables
                if (!editable.matches('p, div.multiline')) {
                    editable.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            editable.blur();
                        }
                    });
                }
            });
        });
        
        // Set up control buttons
        const controls = element.querySelector('.element-controls');
        if (controls) {
            controls.addEventListener('click', (e) => {
                e.stopPropagation();
                const btn = e.target.closest('.control-btn');
                if (!btn) return;
                
                const action = btn.getAttribute('data-action') || btn.title;
                
                switch (action) {
                    case 'Delete':
                    case 'delete':
                        if (confirm('Are you sure you want to delete this component?')) {
                            if (window.stateManager) {
                                window.stateManager.removeComponent(componentId);
                            } else {
                                element.remove();
                            }
                        }
                        break;
                        
                    case 'Duplicate':
                    case 'duplicate':
                        if (window.componentManager) {
                            window.componentManager.duplicateComponent(componentId);
                        }
                        break;
                        
                    case 'Move Up':
                    case 'moveUp':
                        if (window.componentManager) {
                            window.componentManager.moveComponent(componentId, 'up');
                        }
                        break;
                        
                    case 'Move Down':
                    case 'moveDown':
                        if (window.componentManager) {
                            window.componentManager.moveComponent(componentId, 'down');
                        }
                        break;
                }
            });
        }
    }
}

// Create singleton instance
export const componentRenderer = new ComponentRenderer();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        componentRenderer.init();
    });
} else {
    componentRenderer.init();
}
