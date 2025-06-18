/**
 * Enhanced Component Renderer
 * Intelligent diff-based rendering with optimized updates
 */

import { renderComponent } from '../components/dynamic-component-loader.js';
import enhancedStateManager from './enhanced-state-manager.js';

class EnhancedComponentRenderer {
    constructor() {
        this.initialized = false;
        this.previewContainer = null;
        this.renderQueue = new Set();
        this.isRendering = false;
        this.componentCache = new Map();
        this.disableRendering = false;
        this.stateUnsubscribe = null;
        this.lastState = null;
        this.renderDebounceTimer = null; // Add missing property
        this.renderStartTime = null; // Track when rendering starts
        this.healthCheckInterval = null; // Health check timer
    }
    
    /**
     * Initialize the renderer
     */
    init() {
        if (this.initialized) return;
        
        console.log('EnhancedComponentRenderer: Initializing...');
        
        this.previewContainer = document.getElementById('media-kit-preview');
        if (!this.previewContainer) {
            console.error('Preview container not found');
            return;
        }
        
        // Initialize from existing DOM
        this.initializeFromDOM();
        
        // Subscribe to state changes
        this.stateUnsubscribe = enhancedStateManager.subscribeGlobal((state) => {
            this.onStateChange(state);
        });
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup health check to prevent stuck state
        this.setupHealthCheck();
        
        this.initialized = true;
        console.log('EnhancedComponentRenderer: Initialization complete');
    }
    
    /**
     * Setup health check to prevent stuck rendering
     */
    setupHealthCheck() {
        // Less aggressive health check - only log warnings, don't force resets
        this.healthCheckInterval = setInterval(() => {
            if (this.isRendering && this.renderStartTime) {
                const renderDuration = Date.now() - this.renderStartTime;
                if (renderDuration > 1000) {
                    console.warn(`Renderer taking longer than expected: ${renderDuration}ms`);
                    // Don't force reset - let the render complete naturally
                    // Only log for debugging purposes
                }
            }
        }, 2000); // Check less frequently
    }
    
    /**
     * Force reset the renderer
     */
    forceReset() {
        this.isRendering = false;
        this.renderStartTime = null;
        
        // Process last queued state if any
        if (this.renderQueue.size > 0) {
            const states = Array.from(this.renderQueue);
            this.renderQueue.clear();
            
            // Process only the last state
            const lastState = states[states.length - 1];
            console.log('Processing last queued state after reset');
            
            // Use setTimeout to avoid immediate re-entry
            setTimeout(() => {
                this.onStateChange(lastState);
            }, 10);
        }
    }
    
    /**
     * Initialize from existing DOM
     */
    initializeFromDOM() {
        const existingComponents = this.previewContainer.querySelectorAll('[data-component-id]');
        
        if (existingComponents.length === 0) {
            this.updateEmptyState(true);
            // Also setup empty state buttons if they already exist
            this.setupEmptyStateButtons();
        } else {
            // Setup interactivity for existing components
            existingComponents.forEach(element => {
                const componentId = element.getAttribute('data-component-id');
                this.setupComponentInteractivity(element);
                this.trackContentEditable(element);
            });
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for rendering control events
        document.addEventListener('disable-rendering', () => {
            this.disableRendering = true;
        });
        
        document.addEventListener('enable-rendering', () => {
            this.disableRendering = false;
        });
        
        // Listen for forced render
        document.addEventListener('force-render', () => {
            this.forceRender();
        });
        
        // Listen for component meta changes
        document.addEventListener('component-meta-changed', (e) => {
            this.handleMetaChange(e.detail.componentId, e.detail.meta);
        });
    }
    
    /**
     * Handle state changes with intelligent diffing
     */
    async onStateChange(newState) {
        // Skip if rendering is disabled
        if (this.disableRendering) {
            console.log('Rendering is disabled, skipping state change');
            return;
        }
        
        // Check if already rendering
        if (this.isRendering) {
            // Queue the state change for later
            console.log('Already rendering, queueing state change');
            this.renderQueue.add(newState);
            return;
        }
        
        // Debounce rapid state changes
        if (this.renderDebounceTimer) {
            clearTimeout(this.renderDebounceTimer);
        }
        
        this.renderDebounceTimer = setTimeout(async () => {
            // Calculate changes
            const changes = this.calculateChanges(newState, this.lastState);
            
            if (changes.length === 0) {
                console.log('No changes detected, skipping render');
                return;
            }
            
            console.log(`Processing ${changes.length} changes`);
            
            // Process changes
            await this.processChanges(changes, newState);
            
            // Update last state
            this.lastState = this.cloneState(newState);
            
            // Process any queued renders
            if (this.renderQueue.size > 0) {
                const nextState = Array.from(this.renderQueue)[this.renderQueue.size - 1];
                this.renderQueue.clear();
                await this.onStateChange(nextState);
            }
        }, 16); // 16ms debounce (one frame)
    }
    
    /**
     * Calculate what changed between states
     */
    calculateChanges(newState, oldState) {
        const changes = [];
        
        if (!oldState) {
            // Initial render - add all components
            Object.keys(newState.components || {}).forEach(id => {
                changes.push({ type: 'add', id, component: newState.components[id] });
            });
            return changes;
        }
        
        const newComponents = newState.components || {};
        const oldComponents = oldState.components || {};
        
        // Check for additions
        Object.keys(newComponents).forEach(id => {
            if (!oldComponents[id]) {
                changes.push({ type: 'add', id, component: newComponents[id] });
            } else {
                // Check for updates
                const newComp = newComponents[id];
                const oldComp = oldComponents[id];
                
                // Check if data changed
                if (JSON.stringify(newComp.data) !== JSON.stringify(oldComp.data)) {
                    changes.push({ type: 'update', id, component: newComp, oldData: oldComp.data });
                }
                
                // Check if order changed
                if (newComp.order !== oldComp.order) {
                    changes.push({ type: 'reorder', id, newOrder: newComp.order, oldOrder: oldComp.order });
                }
            }
        });
        
        // Check for removals
        Object.keys(oldComponents).forEach(id => {
            if (!newComponents[id]) {
                changes.push({ type: 'remove', id });
            }
        });
        
        return changes;
    }
    
    /**
     * Process changes efficiently
     */
    async processChanges(changes, state) {
        this.isRendering = true;
        this.renderStartTime = Date.now();
        
        try {
            // Use requestAnimationFrame for DOM updates
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // Before processing, check for orphaned DOM elements
            this.cleanupOrphanedElements(state);
            
            // Group changes by type for efficient processing
            const grouped = {
                add: [],
                update: [],
                remove: [],
                reorder: []
            };
            
            changes.forEach(change => {
                grouped[change.type].push(change);
            });
            
            // Batch DOM operations
            const fragment = document.createDocumentFragment();
            
            // Process removals first (fast)
            if (grouped.remove.length > 0) {
                this.batchRemove(grouped.remove);
            }
            
            // Process additions (potentially slow - optimize)
            if (grouped.add.length > 0) {
                await this.batchAdd(grouped.add, fragment);
            }
            
            // Process updates (fast)
            if (grouped.update.length > 0) {
                await this.batchUpdate(grouped.update);
            }
            
            // Process reorders last
            if (grouped.reorder.length > 0) {
                this.batchReorder(state);
            }
            
            // Update empty state
            this.updateEmptyState();
            
        } catch (error) {
            console.error('Error processing changes:', error);
            // Ensure we don't get stuck even on error
        } finally {
            // ALWAYS reset isRendering, even on error
            this.isRendering = false;
            this.renderStartTime = null; // Clear render start time
            
            // Process any queued renders after reset
            if (this.renderQueue.size > 0) {
                const nextState = Array.from(this.renderQueue)[this.renderQueue.size - 1];
                this.renderQueue.clear();
                // Use setTimeout to avoid stack overflow
                setTimeout(() => {
                    this.onStateChange(nextState);
                }, 0);
            }
        }
    }
    
    /**
     * Clean up DOM elements that don't exist in state
     */
    cleanupOrphanedElements(state) {
        const stateComponentIds = new Set(Object.keys(state.components || {}));
        const domElements = this.previewContainer.querySelectorAll('[data-component-id]');
        
        domElements.forEach(element => {
            const componentId = element.getAttribute('data-component-id');
            if (!stateComponentIds.has(componentId)) {
                // Check if this is a component being deleted (has the deleting class)
                if (!element.classList.contains('component-deleting')) {
                    console.warn(`Removing orphaned DOM element: ${componentId}`);
                    element.remove();
                    this.componentCache.delete(componentId);
                }
            }
        });
    }
    
    /**
     * Add a component to the DOM
     */
    async addComponent(componentId, component) {
        // Check if already exists
        if (this.previewContainer.querySelector(`[data-component-id="${componentId}"]`)) {
            console.log(`Component ${componentId} already exists in DOM`);
            return null;
        }
        
        console.log(`Adding component: ${componentId}`);
        
        try {
            // Render component HTML
            const html = await renderComponent(component.type, componentId, component.data);
            
            if (!html || html.trim() === '') {
                console.error(`No HTML returned for component ${componentId}`);
                return null;
            }
            
            // Create element
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html.trim();
            const element = tempDiv.firstElementChild;
            
            if (!element) {
                console.error(`Failed to create element for component ${componentId}, HTML was:`, html);
                return null;
            }
            
            // Validate it's a proper element
            if (element.nodeType !== 1) {
                console.error(`Invalid element type for component ${componentId}:`, element.nodeType);
                return null;
            }
            
            // Ensure componentId is set
            if (!element.getAttribute('data-component-id')) {
                element.setAttribute('data-component-id', componentId);
            }
            
            // Set up the element before adding to DOM
            this.setupComponentInteractivity(element);
            this.trackContentEditable(element);
            
            // Cache the element
            this.componentCache.set(componentId, element);
            
            return element;
        } catch (error) {
            console.error(`Error rendering component ${componentId}:`, error);
            return null;
        }
    }
    
    /**
     * Batch add components for performance
     */
    async batchAdd(addChanges, fragment) {
        console.log(`Batch adding ${addChanges.length} components`);
        
        // Render all components in parallel
        const renderPromises = addChanges.map(async (change) => {
            const element = await this.addComponent(change.id, change.component);
            return { element, change };
        });
        
        const results = await Promise.all(renderPromises);
        
        // Log any failed renders
        const failed = results.filter(r => !r.element);
        if (failed.length > 0) {
            console.error(`Failed to render ${failed.length} components:`, failed.map(f => f.change.id));
        }
        
        // Sort by order and add to fragment
        const successful = results
            .filter(r => r.element)
            .sort((a, b) => a.change.component.order - b.change.component.order);
            
        console.log(`Successfully rendered ${successful.length} components`);
        
        if (successful.length === 0) {
            console.warn('No components successfully rendered!');
            return;
        }
        
        // Clone elements before adding to fragment to avoid issues
        const elementsToAdd = [];
        successful.forEach(({ element }) => {
            elementsToAdd.push(element);
            fragment.appendChild(element);
        });
        
        // Single DOM update
        if (fragment.childNodes.length > 0) {
            console.log(`Appending ${fragment.childNodes.length} nodes to preview container`);
            this.previewContainer.appendChild(fragment);
            
            // Verify elements were added
            elementsToAdd.forEach(element => {
                if (!this.previewContainer.contains(element)) {
                    console.error('Element was not added to DOM:', element);
                }
            });
            
            // Trigger animations after DOM update
            requestAnimationFrame(() => {
                elementsToAdd.forEach(element => {
                    if (this.previewContainer.contains(element)) {
                        element.classList.add('component-added');
                    }
                });
            });
        } else {
            console.error('Fragment has no child nodes after adding components!');
        }
    }
    
    /**
     * Batch remove components
     */
    batchRemove(removeChanges) {
        removeChanges.forEach(change => {
            const element = this.previewContainer.querySelector(`[data-component-id="${change.id}"]`);
            if (element) {
                element.remove();
                this.componentCache.delete(change.id);
            } else {
                // Component not in DOM but in state - this is expected if already cleaned up
                // Still remove from cache if it exists
                this.componentCache.delete(change.id);
            }
        });
    }
    
    /**
     * Batch update components
     */
    async batchUpdate(updateChanges) {
        // Updates are usually fast, can process individually
        for (const change of updateChanges) {
            await this.updateComponent(change.id, change.component, change.oldData);
        }
    }
    
    /**
     * Batch reorder components
     */
    batchReorder(state) {
        const components = Object.entries(state.components)
            .map(([id, comp]) => ({ id, ...comp }))
            .sort((a, b) => a.order - b.order);
        
        // Create a fragment with all components in correct order
        const fragment = document.createDocumentFragment();
        
        components.forEach(component => {
            const element = this.previewContainer.querySelector(`[data-component-id="${component.id}"]`);
            if (element) {
                fragment.appendChild(element);
            }
        });
        
        // Single DOM update
        this.previewContainer.appendChild(fragment);
    }
    
    /**
     * Update a component in the DOM
     */
    async updateComponent(componentId, component, oldData) {
        const element = this.previewContainer.querySelector(`[data-component-id="${componentId}"]`);
        if (!element) {
            console.log(`Component ${componentId} not found, adding instead`);
            const newElement = await this.addComponent(componentId, component);
            if (newElement) {
                // Find the correct position and insert
                const insertPoint = this.findInsertionPoint(component.order);
                this.previewContainer.insertBefore(newElement, insertPoint);
                newElement.classList.add('component-added');
            }
            return;
        }
        
        // Update only changed data attributes
        Object.entries(component.data).forEach(([key, value]) => {
            if (oldData[key] !== value) {
                const field = element.querySelector(`[data-setting="${key}"]`);
                if (field) {
                    // Don't update if field is currently being edited
                    if (field !== document.activeElement) {
                        if (field.getAttribute('contenteditable') === 'true') {
                            field.textContent = value;
                        } else if (field.tagName === 'IMG') {
                            field.src = value;
                        } else if (field.tagName === 'A') {
                            field.href = value;
                        }
                    }
                }
            }
        });
        
        // Handle meta state changes
        const meta = enhancedStateManager.getComponent(componentId)?.meta;
        if (meta) {
            if (meta.isDeleting) {
                element.classList.add('component-deleting');
            } else {
                element.classList.remove('component-deleting');
            }
            
            if (meta.isMoving) {
                element.classList.add('component-moving');
            } else {
                element.classList.remove('component-moving');
            }
        }
    }
    
    /**
     * Remove a component from the DOM
     */
    async removeComponent(componentId) {
        const element = this.previewContainer.querySelector(`[data-component-id="${componentId}"]`);
        if (!element) return;
        
        console.log(`Removing component: ${componentId}`);
        
        // Add removing class for animation
        element.classList.add('component-removing');
        
        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Remove from DOM
        element.remove();
        
        // Remove from cache
        this.componentCache.delete(componentId);
    }
    
    /**
     * Reorder components in the DOM
     */
    async reorderComponents(state) {
        const components = Object.entries(state.components)
            .map(([id, comp]) => ({ id, ...comp }))
            .sort((a, b) => a.order - b.order);
        
        // Move each component to its correct position
        components.forEach((component, index) => {
            const element = this.previewContainer.querySelector(`[data-component-id="${component.id}"]`);
            if (element) {
                const currentIndex = Array.from(this.previewContainer.children).indexOf(element);
                if (currentIndex !== index) {
                    const referenceNode = this.previewContainer.children[index];
                    this.previewContainer.insertBefore(element, referenceNode || null);
                    
                    // Add animation class
                    element.classList.add('component-reordered');
                    setTimeout(() => element.classList.remove('component-reordered'), 300);
                }
            }
        });
    }
    
    /**
     * Find insertion point based on order
     */
    findInsertionPoint(order) {
        const components = Array.from(this.previewContainer.querySelectorAll('[data-component-id]'));
        
        for (const component of components) {
            const componentId = component.getAttribute('data-component-id');
            const componentData = enhancedStateManager.getComponent(componentId);
            
            if (componentData && componentData.order > order) {
                return component;
            }
        }
        
        return null; // Insert at end
    }
    
    /**
     * Setup component interactivity
     */
    setupComponentInteractivity(element) {
        const componentId = element.getAttribute('data-component-id');
        
        // Skip if already interactive
        if (element.hasAttribute('data-interactive')) return;
        
        element.setAttribute('data-interactive', 'true');
        
        // Delegate control button clicks
        element.addEventListener('click', (e) => {
            const controlBtn = e.target.closest('.control-btn');
            if (!controlBtn) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // Check if component still exists in state
            if (!enhancedStateManager.getComponent(componentId)) {
                // This is normal during deletion animation - just return silently
                return;
            }
            
            const action = controlBtn.textContent.trim();
            
            // Use the enhanced component manager
            if (window.enhancedComponentManager) {
                window.enhancedComponentManager.handleControlAction(action, componentId);
            } else if (window.componentManager) {
                // Fallback to regular component manager
                window.componentManager.handleControlAction(action, componentId);
            }
        });
        
        // Setup element selection
        if (window.setupElementSelection) {
            window.setupElementSelection();
        }
    }
    
    /**
     * Track contenteditable changes
     */
    trackContentEditable(element) {
        const editables = element.querySelectorAll('[contenteditable="true"]');
        
        editables.forEach(editable => {
            // Store original content on focus
            editable.addEventListener('focus', () => {
                editable.setAttribute('data-original-content', editable.textContent);
            });
            
            // Update state on blur
            editable.addEventListener('blur', () => {
                const originalContent = editable.getAttribute('data-original-content');
                const newContent = editable.textContent;
                
                if (originalContent !== newContent) {
                    const componentId = element.getAttribute('data-component-id');
                    const settingKey = editable.getAttribute('data-setting');
                    
                    if (componentId && settingKey) {
                        enhancedStateManager.updateComponent(componentId, settingKey, newContent);
                    }
                }
            });
        });
    }
    
    /**
     * Update empty state
     */
    updateEmptyState(force = false) {
        const hasComponents = this.previewContainer.querySelector('[data-component-id]') !== null;
        const emptyState = document.getElementById('empty-state');
        
        if (!hasComponents || force) {
            if (!emptyState) {
                this.createEmptyState();
            } else {
                emptyState.style.display = 'flex';
            }
            this.previewContainer.classList.remove('has-components');
        } else {
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            this.previewContainer.classList.add('has-components');
        }
    }
    
    /**
     * Create empty state element
     */
    createEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.id = 'empty-state';
        emptyState.className = 'empty-state';
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
        
        this.previewContainer.appendChild(emptyState);
        
        // Setup empty state buttons
        this.setupEmptyStateButtons();
    }
    
    /**
     * Setup empty state button event listeners
     */
    setupEmptyStateButtons() {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            const addBtn = document.getElementById('add-first-component');
            const loadBtn = document.getElementById('load-template');
            
            if (addBtn && !addBtn.hasAttribute('data-listener-attached')) {
                addBtn.setAttribute('data-listener-attached', 'true');
                addBtn.addEventListener('click', () => {
                    console.log('Add Component button clicked');
                    document.dispatchEvent(new CustomEvent('show-component-library'));
                });
                console.log('Add Component button listener attached');
            }
            
            if (loadBtn && !loadBtn.hasAttribute('data-listener-attached')) {
                loadBtn.setAttribute('data-listener-attached', 'true');
                loadBtn.addEventListener('click', () => {
                    console.log('Load Template button clicked');
                    document.dispatchEvent(new CustomEvent('show-template-library'));
                });
                console.log('Load Template button listener attached');
            }
        }, 100);
    }
    
    /**
     * Handle meta changes
     */
    handleMetaChange(componentId, meta) {
        const element = this.previewContainer.querySelector(`[data-component-id="${componentId}"]`);
        if (!element) return;
        
        if (meta.isDeleting) {
            element.classList.add('component-deleting');
            element.style.opacity = '0.5';
            element.style.pointerEvents = 'none';
        } else {
            element.classList.remove('component-deleting');
            element.style.opacity = '';
            element.style.pointerEvents = '';
        }
        
        if (meta.isMoving) {
            element.classList.add('component-moving');
        } else {
            element.classList.remove('component-moving');
        }
    }
    
    /**
     * Force render all components
     */
    forceRender() {
        const state = enhancedStateManager.getState();
        this.lastState = null; // Force full render
        this.onStateChange(state);
    }
    
    /**
     * Clone state for comparison
     */
    cloneState(state) {
        return JSON.parse(JSON.stringify(state));
    }
    
    /**
     * Destroy the renderer
     */
    destroy() {
        if (this.stateUnsubscribe) {
            this.stateUnsubscribe();
        }
        
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        
        if (this.renderDebounceTimer) {
            clearTimeout(this.renderDebounceTimer);
        }
        
        this.initialized = false;
        this.componentCache.clear();
        this.renderQueue.clear();
        this.isRendering = false;
        this.renderStartTime = null;
    }
}

// Export singleton instance
export const enhancedComponentRenderer = new EnhancedComponentRenderer();