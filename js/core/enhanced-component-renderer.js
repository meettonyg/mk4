/**
 * @file enhanced-component-renderer.js
 * @description Intelligent diff-based rendering with optimized updates. This is the primary renderer
 * for the new architecture, handling state changes and DOM updates efficiently.
 *
 * This version includes fixes for module imports to align with the new architecture.
 */

// FIX: Corrected import to use the named export for dynamicComponentLoader.
import {
    dynamicComponentLoader
} from '../components/dynamic-component-loader.js';
// FIX: Corrected import to use the named export for enhancedStateManager.
import {
    enhancedStateManager
} from './enhanced-state-manager.js';
import {
    performanceMonitor
} from '../utils/performance-monitor.js';

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
        this.renderDebounceTimer = null;
        this.renderStartTime = null;
        this.healthCheckInterval = null;
    }

    init() {
        if (this.initialized) return;

        this.previewContainer = document.getElementById('media-kit-preview');
        if (!this.previewContainer) return;

        this.initializeFromDOM();

        this.stateUnsubscribe = enhancedStateManager.subscribeGlobal((state) => {
            this.onStateChange(state);
        });

        this.healthCheckInterval = setInterval(() => this.healthCheck(), 5000);
        this.initialized = true;
    }

    initializeFromDOM() {
        const initialState = enhancedStateManager.getState();
        if (initialState) {
            this.lastState = this.cloneState(initialState);
            Array.from(this.previewContainer.children).forEach(element => {
                if (element.id && this.lastState.components[element.id]) {
                    this.componentCache.set(element.id, element);
                }
            });

            this.updateEmptyState(initialState);
        }

        this.setupEmptyStateListeners();
    }

    onStateChange(newState) {
        if (!this.initialized || this.disableRendering) return;

        if (this.renderDebounceTimer) {
            clearTimeout(this.renderDebounceTimer);
        }

        this.renderDebounceTimer = setTimeout(async () => {
            if (this.isRendering) {
                this.renderQueue.add(newState);
                return;
            }

            const changes = this.diffState(this.lastState, newState);

            if (!changes.added.size && !changes.removed.size && !changes.updated.size && !changes.moved.size) {
                return;
            }

            this.isRendering = true;
            this.renderStartTime = Date.now();

            try {
                await this.processChanges(changes, newState);
                this.lastState = this.cloneState(newState);
            } catch (error) {
                console.error('Error during rendering process:', error);
            } finally {
                this.isRendering = false;
                this.renderStartTime = null;

                if (this.renderQueue.size > 0) {
                    const nextState = this.renderQueue.values().next().value;
                    this.renderQueue.clear();
                    this.onStateChange(nextState);
                }
            }
        }, 50);
    }

    diffState(oldState, newState) {
        const changes = {
            added: new Set(),
            removed: new Set(),
            updated: new Set(),
            moved: new Set()
        };

        if (!oldState) {
            Object.keys(newState.components).forEach(id => changes.added.add(id));
            return changes;
        }

        const oldKeys = new Set(Object.keys(oldState.components));
        const newKeys = new Set(Object.keys(newState.components));

        newKeys.forEach(key => {
            if (!oldKeys.has(key)) {
                changes.added.add(key);
            }
        });

        oldKeys.forEach(key => {
            if (!newKeys.has(key)) {
                changes.removed.add(key);
            }
        });

        newKeys.forEach(key => {
            if (oldKeys.has(key) && JSON.stringify(oldState.components[key]) !== JSON.stringify(newState.components[key])) {
                changes.updated.add(key);
            }
        });

        const oldLayout = oldState.layout || [];
        const newLayout = newState.layout || enhancedStateManager.getLayout();

        if (JSON.stringify(oldLayout) !== JSON.stringify(newLayout)) {
            newLayout.forEach(id => {
                if (!changes.added.has(id) && !changes.removed.has(id)) {
                    changes.moved.add(id);
                }
            });
        }
        return changes;
    }

    async processChanges(changes, newState) {
        if (changes.removed.size > 0) {
            this.removeComponents(changes.removed);
        }
        if (changes.added.size > 0) {
            await this.renderNewComponents(changes.added, newState);
        }
        if (changes.updated.size > 0) {
            await this.updateComponents(changes.updated, newState);
        }
        if (changes.moved.size > 0) {
            const state = enhancedStateManager.getState();
            this.reorderComponents(state.layout);
        }
        this.cleanupOrphanedElements(newState);

        this.updateEmptyState(newState);
    }

    removeComponents(componentIds) {
        componentIds.forEach(id => {
            const element = this.componentCache.get(id) || document.getElementById(id);
            if (element) {
                element.remove();
                this.componentCache.delete(id);
            }
        });
    }

    async renderNewComponents(componentIds, newState) {
        const fragment = document.createDocumentFragment();
        const renderPromises = Array.from(componentIds).map(id => {
            const componentState = newState.components[id];
            if (!componentState) {
                console.error(`State for new component ${id} not found!`);
                return null;
            }
            // FIX: Use the new dynamicComponentLoader instance
            return this.renderComponentWithLoader(id, componentState.type, componentState.data);
        });

        const renderedComponents = await Promise.all(renderPromises);
        renderedComponents.forEach(comp => {
            if (comp) {
                fragment.appendChild(comp.element);
                this.componentCache.set(comp.id, comp.element);
            }
        });

        this.previewContainer.appendChild(fragment);

        const state = enhancedStateManager.getState();
        this.reorderComponents(state.layout);
    }

    async updateComponents(componentIds, newState) {
        const updatePromises = Array.from(componentIds).map(async (id) => {
            const componentState = newState.components[id];
            const oldElement = this.componentCache.get(id) || document.getElementById(id);
            if (oldElement && componentState) {
                const {
                    element: newElement
                    // FIX: Use the new dynamicComponentLoader instance
                } = await this.renderComponentWithLoader(id, componentState.type, componentState.data);
                if (oldElement.innerHTML !== newElement.innerHTML) {
                    oldElement.replaceWith(newElement);
                    this.componentCache.set(id, newElement);
                }
            }
        });
        await Promise.all(updatePromises);
    }

    reorderComponents(layout) {
        if (!Array.isArray(layout)) {
            console.error('Renderer Error: reorderComponents called with invalid layout:', layout);
            const state = enhancedStateManager.getState();
            layout = state.layout || [];
            if (!Array.isArray(layout) || layout.length === 0) {
                console.warn('Unable to determine component layout');
                return;
            }
        }

        const perfEnd = performanceMonitor.start('reorder-components', {
            count: layout.length
        });

        const elementMap = new Map();
        Array.from(this.previewContainer.children).forEach(child => {
            elementMap.set(child.id, child);
        });

        layout.forEach((componentId, index) => {
            const element = elementMap.get(componentId);
            if (element) {
                const expectedPosition = this.previewContainer.children[index];
                if (element !== expectedPosition) {
                    this.previewContainer.insertBefore(element, expectedPosition || null);
                }
            }
        });

        perfEnd();
    }

    /**
     * Renders a component using the dynamic component loader.
     * @param {string} id - The unique ID of the component instance.
     * @param {string} type - The component type.
     * @param {object} props - The properties for the component.
     * @returns {Promise<{id: string, element: HTMLElement}>}
     */
    async renderComponentWithLoader(id, type, props) {
        try {
            // FIX: Correctly call the method on the imported loader instance
            const element = await dynamicComponentLoader.renderComponent({
                type,
                id,
                props
            });
            if (!element) throw new Error('Template produced no element');
            return {
                id,
                element
            };
        } catch (error) {
            console.error(`Error rendering component ${id} (${type}):`, error);
            const errorElement = document.createElement('div');
            errorElement.id = id;
            errorElement.className = 'component-error';
            errorElement.textContent = `Error rendering ${type}.`;
            return {
                id,
                element: errorElement
            };
        }
    }

    cloneState(state) {
        return state ? JSON.parse(JSON.stringify(state)) : null;
    }

    cleanupOrphanedElements(state) {
        const componentIdsInState = new Set(Object.keys(state.components));
        for (const child of this.previewContainer.children) {
            if (!componentIdsInState.has(child.id)) {
                child.remove();
                this.componentCache.delete(child.id);
            }
        }
    }

    healthCheck() {
        if (this.isRendering) {
            const renderDuration = Date.now() - this.renderStartTime;
            if (renderDuration > 10000) {
                this.isRendering = false;
                this.renderQueue.clear();
            }
        }
    }

    destroy() {
        if (this.stateUnsubscribe) this.stateUnsubscribe();
        if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
        if (this.renderDebounceTimer) clearTimeout(this.renderDebounceTimer);
        this.initialized = false;
        this.componentCache.clear();
        this.renderQueue.clear();
        this.isRendering = false;
    }

    /**
     * Update empty state visibility based on component count
     */
    updateEmptyState(state) {
        const emptyStateEl = document.getElementById('empty-state');
        const dropZone = document.querySelector('.drop-zone--primary');

        if (!emptyStateEl) return;

        const hasComponents = Object.keys(state.components || {}).length > 0;

        if (hasComponents) {
            // Hide empty state
            emptyStateEl.style.display = 'none';
            if (dropZone) dropZone.style.display = 'none';
        } else {
            // Show empty state
            emptyStateEl.style.display = 'flex';
            if (dropZone) dropZone.style.display = 'none'; // Keep drop zone hidden
        }
    }

    /**
     * Setup event listeners for empty state buttons
     */
    setupEmptyStateListeners() {
        const addFirstComponentBtn = document.getElementById('add-first-component');
        const loadTemplateBtn = document.getElementById('load-template');

        if (addFirstComponentBtn && !addFirstComponentBtn.hasAttribute('data-listener-attached')) {
            addFirstComponentBtn.setAttribute('data-listener-attached', 'true');
            addFirstComponentBtn.addEventListener('click', () => {
                console.log('Add first component clicked');
                // Trigger component library modal directly via event
                const event = new CustomEvent('show-component-library');
                document.dispatchEvent(event);
            });
        }

        if (loadTemplateBtn && !loadTemplateBtn.hasAttribute('data-listener-attached')) {
            loadTemplateBtn.setAttribute('data-listener-attached', 'true');
            loadTemplateBtn.addEventListener('click', () => {
                console.log('Load template clicked');
                // Trigger template library modal
                const event = new CustomEvent('show-template-library');
                document.dispatchEvent(event);
            });
        }
    }
}

export const enhancedComponentRenderer = new EnhancedComponentRenderer();
