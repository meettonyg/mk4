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
        console.log('renderAllComponents - Components from state:', components.map(c => ({ id: c.id, type: c.type })));
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
        
        // Handle empty state and drop zones based on component count
        const emptyState = document.getElementById('empty-state');
        const dropZones = this.previewContainer.querySelectorAll('.drop-zone');
        
        if (components.length > 0) {
            // Hide empty state if we have components
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Hide any remaining drop zones
            dropZones.forEach(zone => {
                zone.style.display = 'none';
            });
            
            this.previewContainer.classList.add('has-components');
        } else {
            // Show empty state if no components
            if (!emptyState) {
                // Create if doesn't exist
                const newEmptyState = this.createEmptyStateElement();
                this.previewContainer.appendChild(newEmptyState);
                this.setupEmptyState();
            } else {
                emptyState.style.display = 'block';
            }
            
            this.previewContainer.classList.remove('has-components');
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
        
        // Store reference to empty state before clearing
        let emptyState = document.getElementById('empty-state');
        const emptyStateParent = emptyState ? emptyState.parentNode : null;
        
        // Clear only components, preserve empty state
        const componentsInDom = this.previewContainer.querySelectorAll('[data-component-id]');
        componentsInDom.forEach(comp => comp.remove());
        
        // Also clear any drop zones
        const dropZones = this.previewContainer.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => zone.remove());
        
        // Handle empty state visibility
        if (!emptyState) {
            // Create empty state if it doesn't exist
            emptyState = this.createEmptyStateElement();
            this.previewContainer.appendChild(emptyState);
        }
        
        if (components.length > 0) {
            // Hide empty state if we have components
            emptyState.style.display = 'none';
            this.previewContainer.classList.add('has-components');
        } else {
            // Show empty state if no components
            emptyState.style.display = 'block';
            this.previewContainer.classList.remove('has-components');
            // Setup empty state interactions
            this.setupEmptyState();
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
        
        // Check if interactivity was already set up to avoid duplicate listeners
        if (element.hasAttribute('data-interactive')) {
            console.log(`Component ${componentId} already has interactivity set up, skipping`);
            return;
        }
        
        console.log(`Setting up interactivity for component ${componentId}`);
        element.setAttribute('data-interactive', 'true');
        
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
                
                const action = btn.getAttribute('data-action') || btn.title || btn.textContent.trim();
                
                // If action doesn't match expected values, try button text
                let finalAction = action;
                if (!['Delete', 'delete', 'Duplicate', 'duplicate', 'Move Up', 'moveUp', 'Move Down', 'moveDown'].includes(action)) {
                    finalAction = btn.textContent.trim();
                }
                
                switch (finalAction) {
                    case 'Delete':
                    case 'delete':
                    case '×': // × symbol
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
                    case '⧉': // ⧉ symbol
                        if (window.componentManager) {
                            await window.componentManager.saveActiveEditableContent();
                            window.componentManager.duplicateComponent(componentId);
                        }
                        break;
                        
                    case 'Move Up':
                    case 'moveUp':
                    case '↑': // ↑ symbol
                        if (window.componentManager) {
                            await window.componentManager.moveComponent(componentId, 'up');
                        }
                        break;
                        
                    case 'Move Down':
                    case 'moveDown':
                    case '↓': // ↓ symbol
                        if (window.componentManager) {
                            await window.componentManager.moveComponent(componentId, 'down');
                        }
                        break;
                        
                    default:
                        console.warn(`Unknown control action: '${action}', button text: '${buttonText}'`);
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
            let emptyState = document.getElementById('empty-state');
            
            if (hasComponents) {
                this.previewContainer.classList.add('has-components');
                // Hide empty state if visible
                if (emptyState) {
                    emptyState.style.display = 'none';
                }
            } else {
                this.previewContainer.classList.remove('has-components');
                // Show empty state
                if (!emptyState) {
                    // Create if doesn't exist
                    emptyState = this.createEmptyStateElement();
                    this.previewContainer.appendChild(emptyState);
                    this.setupEmptyState();
                }
                emptyState.style.display = 'block';
            }
        }
    }
    
    /**
     * Create empty state element if it doesn't exist
     * @returns {HTMLElement} Empty state element
     */
    createEmptyStateElement() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.id = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state__icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="9"></line>
                    <line x1="9" y1="13" x2="15" y2="13"></line>
                    <line x1="9" y1="17" x2="11" y2="17"></line>
                </svg>
            </div>
            <h2 class="empty-state__title">Start Building Your Media Kit</h2>
            <p class="empty-state__text">Add components from the sidebar or choose a template to get started.</p>
            <div class="empty-state__actions">
                <button class="btn btn--primary" id="add-first-component">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Component
                </button>
                <button class="btn btn--secondary" id="load-template">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    Load Template
                </button>
            </div>
        `;
        return emptyState;
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
