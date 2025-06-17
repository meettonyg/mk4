/**
 * Component Renderer
 * FINAL, ROBUST VERSION
 */

import { renderComponent } from './dynamic-component-loader.js';

class ComponentRenderer {
    constructor() {
        this.initialized = false;
        this.previewContainer = null;
        this.isRendering = false;
        this.renderDebounceTimer = null;
        this.stateUnsubscribe = null;
    }
    
    init() {
        if (this.initialized) return;
        console.log('Component Renderer: Initializing...');
        
        this.previewContainer = document.getElementById('media-kit-preview');
        if (!this.previewContainer) {
            console.error('CRITICAL: Preview container #media-kit-preview not found.');
            return;
        }
        
        this.initializeFromDOM();
        
        if (window.stateManager) {
            this.stateUnsubscribe = window.stateManager.subscribeGlobal(state => this.onStateChange(state));
            console.log('Component Renderer: Subscribed to state changes.');
        }
        
        // Listen for rebindControls event
        document.addEventListener('rebindControls', () => {
            console.log('Rebinding control buttons...');
            const components = this.previewContainer.querySelectorAll('[data-component-id]');
            components.forEach(element => {
                const componentId = element.getAttribute('data-component-id');
                if (componentId) {
                    this.setupComponentInteractivity(componentId);
                }
            });
        });

        this.initialized = true;
        console.log('Component Renderer: Initialization complete.');
    }
    
    onStateChange(state) {
        if (this.isRendering) {
            console.warn('Render skipped: a render is already in progress.');
            return;
        }

        if (this.renderDebounceTimer) clearTimeout(this.renderDebounceTimer);

        this.renderDebounceTimer = setTimeout(() => {
            console.log('Render triggered by state change.');
            const stateComponents = this.getSortedComponents(state);
            if (stateComponents.length > 0) {
                this.renderWithDiff(state);
            } else {
                this.updateEmptyState();
            }
        }, 50);
    }
    
    async renderWithDiff(state) {
        if (!this.previewContainer) return;
        this.isRendering = true;
        console.log('--- Render Start ---');

        const stateComponents = this.getSortedComponents(state);
        const domElements = Array.from(this.previewContainer.querySelectorAll('[data-component-id]'));
        const domIds = domElements.map(el => el.getAttribute('data-component-id'));
        const stateIds = stateComponents.map(c => c.id);

        // Remove components no longer in state
        for (const element of domElements) {
            if (!stateIds.includes(element.getAttribute('data-component-id'))) {
                console.log(`Removing component: ${element.getAttribute('data-component-id')}`);
                element.remove();
            }
        }

        // Add or update components
        for (const [index, component] of stateComponents.entries()) {
            let element = this.previewContainer.querySelector(`[data-component-id="${component.id}"]`);
            if (!element) {
                console.log(`Adding new component: ${component.id}`);
                const html = await renderComponent(component.type, component.id, component.data);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                element = tempDiv.firstElementChild;

                if (element) {
                    const referenceNode = this.previewContainer.children[index];
                    this.previewContainer.insertBefore(element, referenceNode || null);
                    this.setupComponentInteractivity(component.id);
                } else {
                    console.error(`Failed to create element for component: ${component.id}`);
                }
            } else {
                // Update component data if needed
                this.updateComponentData(element, component.data);
                // Also set up interactivity for existing components (in case they were loaded from state)
                this.setupComponentInteractivity(component.id);
            }
        }
        
        // Final re-ordering pass to ensure correctness
        for (const [index, component] of stateComponents.entries()) {
            const element = this.previewContainer.querySelector(`[data-component-id="${component.id}"]`);
            if (element && this.previewContainer.children[index] !== element) {
                 const referenceNode = this.previewContainer.children[index];
                 this.previewContainer.insertBefore(element, referenceNode || null);
            }
        }
        
        this.updateEmptyState();
        this.isRendering = false;
        console.log('--- Render Complete ---');
    }

    updateComponentData(element, data) {
        // Update contenteditable fields
        Object.entries(data).forEach(([key, value]) => {
            const field = element.querySelector(`[data-setting="${key}"]`);
            if (field && field.getAttribute('contenteditable') === 'true') {
                if (field.textContent !== value) {
                    field.textContent = value;
                }
            }
        });
    }

    initializeFromDOM() {
        if (!this.previewContainer) return;
        const existingComponents = this.previewContainer.querySelectorAll('.editable-element[data-component]');
        if (existingComponents.length === 0) {
            this.updateEmptyState(); // Use the standard method to show/setup empty state
        } else {
            // Set up interactivity for any components that exist in DOM on page load
            existingComponents.forEach(element => {
                const componentId = element.getAttribute('data-component-id');
                if (componentId) {
                    this.setupComponentInteractivity(componentId);
                }
            });
        }
    }

    updateEmptyState() {
        if (!this.previewContainer) return;
        const hasComponents = !!this.previewContainer.querySelector('[data-component-id]');
        let emptyState = document.getElementById('empty-state');

        if (hasComponents) {
            this.previewContainer.classList.add('has-components');
            if (emptyState) emptyState.style.display = 'none';
        } else {
            console.log('No components found, showing and setting up empty state.');
            this.previewContainer.classList.remove('has-components');
            if (!emptyState) {
                emptyState = this.createEmptyStateElement();
                this.previewContainer.appendChild(emptyState);
            }
            emptyState.style.display = 'flex';
            this.setupEmptyState();
        }
    }

    setupEmptyState() {
        setTimeout(() => {
            const addBtn = document.getElementById('add-first-component');
            const loadBtn = document.getElementById('load-template');

            if (addBtn && !addBtn.hasAttribute('data-listener-attached')) {
                addBtn.setAttribute('data-listener-attached', 'true');
                addBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('show-component-library')));
                console.log('Add Component button listener attached.');
            }
            if (loadBtn && !loadBtn.hasAttribute('data-listener-attached')) {
                loadBtn.setAttribute('data-listener-attached', 'true');
                loadBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('show-template-library')));
                console.log('Load Template button listener attached.');
            }
        }, 100);
    }
    
    setupComponentInteractivity(componentId) {
        setTimeout(() => {
            const element = this.previewContainer.querySelector(`[data-component-id="${componentId}"]`);
            if (!element) return;

            // Set up control buttons
            const controlButtons = element.querySelectorAll('.control-btn');
            controlButtons.forEach(btn => {
                // Remove any existing listeners to prevent duplicates
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Add new listener
                newBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = newBtn.textContent.trim();
                    console.log(`Control button clicked: ${action} for component ${componentId}`);
                    
                    if (window.componentManager && window.componentManager.handleControlAction) {
                        window.componentManager.handleControlAction(action, componentId);
                    } else {
                        console.error('Component manager not available for control actions');
                    }
                });
            });

            // Ensure element selection is set up
            if (window.setupElementSelection) {
                window.setupElementSelection();
            }

            // Ensure content editable updates are set up
            if (window.setupContentEditableUpdates) {
                window.setupContentEditableUpdates();
            }
        }, 100);
    }

    getSortedComponents(state) {
        if (!state.components) return [];
        
        // Convert components object to array and add IDs
        const components = Object.entries(state.components).map(([id, component]) => ({
            id,
            type: component.type,
            data: component.data,
            order: component.order || 0
        }));
        
        // Sort by order
        return components.sort((a, b) => a.order - b.order);
    }

    createEmptyStateElement() {
        const emptyState = document.createElement('div');
        emptyState.id = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-content">
                <h3>Start Building Your Media Kit</h3>
                <p>Add your first component to get started</p>
                <div class="empty-state-actions">
                    <button id="add-first-component" class="button button-primary">
                        <span class="dashicons dashicons-plus-alt2"></span>
                        Add Component
                    </button>
                    <button id="load-template" class="button">
                        <span class="dashicons dashicons-layout"></span>
                        Load Template
                    </button>
                </div>
            </div>
        `;
        return emptyState;
    }

    destroy() {
        if (this.stateUnsubscribe) {
            this.stateUnsubscribe();
        }
        this.initialized = false;
    }
}

// Export singleton instance (ensure this part is at the end)
export const componentRenderer = new ComponentRenderer();
