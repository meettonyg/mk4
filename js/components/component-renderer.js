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
        
        // Set flag to prevent initial re-render
        this.skipInitialRender = true;
        
        // Initialize state from existing DOM components
        this.initializeFromDOM();
        
        // Subscribe to state changes
        if (window.stateManager) {
            window.stateManager.subscribeGlobal(state => this.onStateChange(state));
        }
        
        // Listen for component-specific events
        document.addEventListener('gmkb-state-changed', e => {
            this.renderAllComponents(e.detail.state);
        });
        
        // Clear the skip flag after initialization
        setTimeout(() => {
            this.skipInitialRender = false;
        }, 100);
        
        this.initialized = true;
        console.log('Component renderer initialized');
    }
    
    /**
     * Handle state changes
     * @param {Object} state - Current state
     */
    onStateChange(state) {
        // Skip if rendering is disabled (batch operations)
        if (this.disableRendering) {
            console.log('Rendering disabled for batch operation');
            return;
        }
        
        // Skip initial render to preserve hardcoded components
        if (this.skipInitialRender) {
            console.log('Skipping initial render to preserve existing components');
            return;
        }
        
        // Check if we're in the middle of a deletion operation
        if (this.isDeletingComponent) {
            // Skip the re-render during deletion to avoid conflicts
            return;
        }
        
        // Skip if we're currently rendering
        if (this.isRendering) {
            console.log('Already rendering, skipping state change');
            return;
        }
        
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
        
        // Create a map of existing component IDs
        const existingIds = new Set();
        existingComponents.forEach(el => {
            existingIds.add(el.getAttribute('data-component-id'));
        });
        
        // Check if we need to do a full re-render (components removed or reordered)
        let needsFullRerender = false;
        
        // Check for removed components
        existingIds.forEach(id => {
            if (!components.find(c => c.id === id)) {
                needsFullRerender = true;
            }
        });
        
        // Check for order changes
        if (!needsFullRerender && existingComponents.length === components.length) {
            existingComponents.forEach((el, index) => {
                if (el.getAttribute('data-component-id') !== components[index].id) {
                    needsFullRerender = true;
                }
            });
        }
        
        if (needsFullRerender) {
            this.renderAllFromScratch(components);
        } else {
            // Only render new components
            this.renderNewComponents(components, existingIds);
        }
    }
    
    /**
     * Render only new components
     * @param {Array} components - All components
     * @param {Set} existingIds - Set of existing component IDs
     */
    async renderNewComponents(components, existingIds) {
        console.log('renderNewComponents called with', components.length, 'components');
        console.log('Existing IDs:', Array.from(existingIds));
        
        // Hide empty state and drop zones if we have components
        if (components.length > 0) {
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Hide any remaining drop zones
            const dropZones = this.previewContainer.querySelectorAll('.drop-zone');
            dropZones.forEach(zone => {
                zone.style.display = 'none';
            });
            
            this.previewContainer.classList.add('has-components');
        }
        
        // Render only new components
        for (const component of components) {
            console.log(`Checking component ${component.id}, exists: ${existingIds.has(component.id)}`);
            if (!existingIds.has(component.id)) {
                // Double-check the component doesn't already exist in DOM
                const alreadyInDOM = document.querySelector(`[data-component-id="${component.id}"]`);
                if (alreadyInDOM) {
                    console.warn(`Component ${component.id} already in DOM, skipping render`);
                    continue;
                }
                
                try {
                    console.log(`Rendering new component: ${component.type} (${component.id})`);
                    
                    // Use the dynamic component loader to render the component
                    const html = await renderComponent(component.type, component.id, component.data);
                    
                    // Find the appropriate insertion point
                    const insertionPoint = this.findInsertionPoint(component);
                    
                    if (insertionPoint.dropZone) {
                        // Replace drop zone with component
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;
                        const componentElement = tempDiv.firstElementChild;
                        
                        if (componentElement && insertionPoint.dropZone.parentNode) {
                            insertionPoint.dropZone.parentNode.replaceChild(componentElement, insertionPoint.dropZone);
                        }
                    } else {
                        // Add to the preview container at the appropriate position
                        this.previewContainer.insertAdjacentHTML('beforeend', html);
                    }
                    
                    // Make the component interactive
                    this.setupComponentInteractivity(component.id);
                } catch (error) {
                    console.error(`Failed to render component ${component.type}:`, error);
                }
            }
        }
        
        // Update empty state visibility
        this.updateEmptyState();
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
        
        // Set rendering flag
        this.isRendering = true;
        
        // Clear the container
        this.previewContainer.innerHTML = '';
        
        // Hide empty state if we have components
        if (components.length > 0) {
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
        }
        
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
        
        // Update empty state visibility
        this.updateEmptyState();
        
        // Clear rendering flag
        this.isRendering = false;
    }
    
    /**
     * Find the appropriate insertion point for a component
     * @param {Object} component - Component to insert
     * @returns {Object} Insertion point info
     */
    findInsertionPoint(component) {
        // Check if there's a drop zone waiting for this component
        const dropZones = this.previewContainer.querySelectorAll('.drop-zone:not([style*="display: none"])');
        
        if (dropZones.length > 0) {
            // Use the first visible drop zone
            return { dropZone: dropZones[0] };
        }
        
        return { dropZone: null };
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
                // Store original content on focus
                editable.addEventListener('focus', () => {
                    editable.setAttribute('data-original-content', editable.textContent);
                });
                
                editable.addEventListener('blur', () => {
                    const settingKey = editable.getAttribute('data-setting');
                    if (settingKey && window.stateManager) {
                        window.stateManager.updateComponent(componentId, settingKey, editable.textContent);
                    }
                    // Clear the original content attribute after saving
                    editable.removeAttribute('data-original-content');
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
            controls.addEventListener('click', async (e) => {
                e.stopPropagation();
                const btn = e.target.closest('.control-btn');
                if (!btn) return;
                
                const action = btn.getAttribute('data-action') || btn.title;
                
                switch (action) {
                    case 'Delete':
                    case 'delete':
                        if (confirm('Are you sure you want to delete this component?')) {
                            // Save any active edits first
                            if (window.componentManager) {
                                await window.componentManager.saveActiveEditableContent();
                            }
                            
                            // Set flag to prevent re-render during deletion
                            this.isDeletingComponent = true;
                            
                            // Animate the removal
                            element.style.transition = 'all 0.3s ease';
                            element.style.opacity = '0';
                            element.style.transform = 'scale(0.95)';
                            
                            setTimeout(() => {
                                if (window.stateManager) {
                                    window.stateManager.removeComponent(componentId);
                                }
                                // Clear the flag after state update
                                setTimeout(() => {
                                    this.isDeletingComponent = false;
                                }, 100);
                            }, 300);
                        }
                        break;
                        
                    case 'Duplicate':
                    case 'duplicate':
                        if (window.componentManager) {
                            await window.componentManager.saveActiveEditableContent();
                            window.componentManager.duplicateComponent(componentId);
                        }
                        break;
                        
                    case 'Move Up':
                    case 'moveUp':
                        if (window.componentManager) {
                            await window.componentManager.moveComponent(componentId, 'up');
                        }
                        break;
                        
                    case 'Move Down':
                    case 'moveDown':
                        if (window.componentManager) {
                            await window.componentManager.moveComponent(componentId, 'down');
                        }
                        break;
                }
            });
        }
    }
    
    /**
     * Initialize state from existing DOM components
     */
    initializeFromDOM() {
        if (!this.previewContainer || !window.stateManager) return;
        
        // Find all existing components in the DOM
        const existingComponents = this.previewContainer.querySelectorAll('.editable-element[data-component]');
        
        // Skip initialization if no components exist (blank canvas)
        if (existingComponents.length === 0) {
            console.log('No existing components found - starting with blank canvas');
            this.setupEmptyState();
            return;
        }
        
        // Also preserve drop zones
        const dropZones = this.previewContainer.querySelectorAll('.drop-zone');
        console.log(`Found ${dropZones.length} drop zones to preserve`);
        
        // Temporarily disable state notifications
        const originalNotify = window.stateManager.notifyGlobalListeners;
        window.stateManager.notifyGlobalListeners = () => {};
        
        existingComponents.forEach((element, index) => {
            const componentType = element.getAttribute('data-component');
            const componentId = element.getAttribute('data-component-id') || `${componentType}-initial-${index}`;
            
            // Set the component ID if not already set
            if (!element.hasAttribute('data-component-id')) {
                element.setAttribute('data-component-id', componentId);
            }
            
            // Also set data-component-type for consistency
            if (!element.hasAttribute('data-component-type')) {
                element.setAttribute('data-component-type', componentType);
            }
            
            // Initialize in state manager (skip notification during init)
            const componentData = this.extractComponentData(element, componentType);
            window.stateManager.initComponent(componentId, componentType, componentData, true);
            
            // Make the component interactive
            this.setupComponentInteractivity(componentId);
        });
        
        // Re-enable state notifications
        window.stateManager.notifyGlobalListeners = originalNotify;
        
        console.log(`Initialized ${existingComponents.length} components from DOM`);
    }
    
    /**
     * Extract component data from DOM element
     */
    extractComponentData(element, componentType) {
        const data = {};
        
        // Extract data based on component type
        switch (componentType) {
            case 'hero':
                const nameEl = element.querySelector('.hero__name');
                const titleEl = element.querySelector('.hero__title');
                const bioEl = element.querySelector('.hero__bio');
                
                if (nameEl) data.name = nameEl.textContent;
                if (titleEl) data.title = titleEl.textContent;
                if (bioEl) data.bio = bioEl.textContent;
                break;
                
            case 'topics':
                const topicEls = element.querySelectorAll('.topic-item');
                data.topics = Array.from(topicEls).map(el => el.textContent);
                break;
                
            case 'social':
                const linkEls = element.querySelectorAll('.social-link');
                data.links = Array.from(linkEls).map(el => ({
                    url: el.getAttribute('href'),
                    title: el.getAttribute('title')
                }));
                break;
        }
        
        return data;
    }
    
    /**
     * Set up empty state interactions
     */
    setupEmptyState() {
        console.log('Setting up empty state interactions...');
        
        // Use a slight delay to ensure DOM is ready
        setTimeout(() => {
            const addFirstBtn = document.getElementById('add-first-component');
            const loadTemplateBtn = document.getElementById('load-template');
            const dropZone = document.querySelector('.drop-zone--primary');
            
            console.log('Empty state elements:', {
                addFirstBtn: !!addFirstBtn,
                loadTemplateBtn: !!loadTemplateBtn,
                dropZone: !!dropZone
            });
            
            if (addFirstBtn) {
                addFirstBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Add component button clicked');
                    // Show component library modal
                    document.dispatchEvent(new CustomEvent('show-component-library'));
                });
                console.log('Add component button listener attached');
            }
            
            if (loadTemplateBtn) {
                loadTemplateBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Load template button clicked');
                    // Show template selection modal
                    document.dispatchEvent(new CustomEvent('show-template-library'));
                });
                console.log('Load template button listener attached');
            }
            
            // Show drop zone when dragging starts
            document.addEventListener('dragstart', () => {
                if (dropZone && !document.querySelector('[data-component-id]')) {
                    dropZone.style.display = 'block';
                }
            });
        }, 100);
    }
    
    /**
     * Check if preview is empty and update UI accordingly
     */
    updateEmptyState() {
        const hasComponents = this.previewContainer && 
                            this.previewContainer.querySelector('[data-component-id]');
        
        if (this.previewContainer) {
            if (hasComponents) {
                this.previewContainer.classList.add('has-components');
            } else {
                this.previewContainer.classList.remove('has-components');
            }
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
