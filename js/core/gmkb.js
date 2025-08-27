/**
 * @file gmkb.js - Global Namespace & Event Bus
 * @description GMKB global namespace with event handling and component actions
 */

/**
 * The Global Namespace
 * Simple, clean, and protected from modification after setup
 */
const GMKB = {
    systems: {},
    
    // ROOT FIX: Global action listeners flag
    globalActionListenersSetup: false,
    
    // Use the browser's native event system - reliable and debuggable
    dispatch(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
        console.debug(`📢 GMKB: Dispatched '${eventName}'`, detail);
    },
    
    subscribe(eventName, callback) {
        document.addEventListener(eventName, callback);
        console.debug(`📡 GMKB: Subscribed to '${eventName}'`);
    },
    
    /**
     * ROOT FIX: Initialize global action listeners immediately on load
     * Call this once during system initialization
     */
    initializeGlobalActionListeners() {
        // Prevent duplicate initialization
        if (this.globalActionListenersSetup) {
            console.log('ℹ️ GMKB: Global action listeners already initialized');
            return;
        }
        
        console.log('🚀 GMKB: Initializing global component action listeners...');
        
        // Global event handlers for ALL components
        const globalHandlers = {
            'gmkb:component-edit-requested': (event) => {
                const componentId = event.detail.componentId;
                console.log(`📋 GLOBAL: Edit requested for ${componentId}`);
                this.handleEditComponent(componentId);
            },
            
            'gmkb:component-move-up-requested': (event) => {
                const componentId = event.detail.componentId;
                console.log(`⬆️ GLOBAL: Move up requested for ${componentId}`);
                this.handleMoveComponent(componentId, 'up');
            },
            
            'gmkb:component-move-down-requested': (event) => {
                const componentId = event.detail.componentId;
                console.log(`⬇️ GLOBAL: Move down requested for ${componentId}`);
                this.handleMoveComponent(componentId, 'down');
            },
            
            'gmkb:component-duplicate-requested': (event) => {
                const componentId = event.detail.componentId;
                console.log(`📋 GLOBAL: Duplicate requested for ${componentId}`);
                this.handleDuplicateComponentEnhanced(componentId);
            },
            
            'gmkb:component-delete-requested': (event) => {
                const componentId = event.detail.componentId;
                console.log(`🗑️ GLOBAL: Delete requested for ${componentId}`);
                this.handleDeleteComponent(componentId);
            }
        };
        
        // Subscribe to all events globally
        Object.entries(globalHandlers).forEach(([eventName, handler]) => {
            this.subscribe(eventName, handler);
        });
        
        this.globalActionListenersSetup = true;
        console.log('✅ GMKB: Global component action listeners initialized successfully');
    },
    
    /**
     * ROOT FIX: Handle edit component action
     * @param {string} componentId - Component ID to edit
     */
    handleEditComponent(componentId) {
        console.log(`🎨 Opening editor for component: ${componentId}`);
        
        // Find the component element
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentElement) {
            console.error(`Component element not found: ${componentId}`);
            return;
        }
        
        // For now, make the component directly editable
        const editableElements = componentElement.querySelectorAll('[contenteditable], input, textarea, select');
        if (editableElements.length > 0) {
            editableElements[0].focus();
            console.log(`✅ Focused first editable element in ${componentId}`);
        } else {
            // Add a simple edit indicator
            componentElement.style.outline = '2px solid #007cba';
            setTimeout(() => {
                componentElement.style.outline = '';
            }, 2000);
            console.log(`✅ Highlighted component ${componentId} for editing`);
        }
    },
    
    /**
     * ROOT FIX: Handle move component action
     * @param {string} componentId - Component ID to move
     * @param {string} direction - 'up' or 'down'
     */
    handleMoveComponent(componentId, direction) {
        console.log(`📦 Moving component ${componentId} ${direction}`);
        
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentElement) {
            console.error(`Component element not found: ${componentId}`);
            return;
        }
        
        const container = componentElement.closest('.media-kit, #media-kit-preview');
        if (!container) {
            console.error('Media kit container not found');
            return;
        }
        
        const allComponents = Array.from(container.querySelectorAll('[data-component-id]'));
        const currentIndex = allComponents.indexOf(componentElement);
        
        if (direction === 'up' && currentIndex > 0) {
            // Move up
            const previousComponent = allComponents[currentIndex - 1];
            container.insertBefore(componentElement, previousComponent);
            console.log(`✅ Moved ${componentId} up`);
        } else if (direction === 'down' && currentIndex < allComponents.length - 1) {
            // Move down
            const nextComponent = allComponents[currentIndex + 1];
            container.insertBefore(componentElement, nextComponent.nextSibling);
            console.log(`✅ Moved ${componentId} down`);
        } else {
            console.log(`⚠️ Cannot move ${componentId} ${direction} - already at ${direction === 'up' ? 'top' : 'bottom'}`);
        }
        
        // Visual feedback
        componentElement.style.transform = 'scale(1.02)';
        componentElement.style.transition = 'transform 0.2s ease';
        setTimeout(() => {
            componentElement.style.transform = '';
            componentElement.style.transition = '';
        }, 200);
    },
    
    /**
     * ROOT FIX: Enhanced duplicate handler with state management
     * @param {string} componentId - Component ID to duplicate
     */
    handleDuplicateComponentEnhanced(componentId) {
        console.log(`📄 GLOBAL: Duplicating component: ${componentId}`);
        
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentElement) {
            console.error(`Component element not found: ${componentId}`);
            return;
        }
        
        // Get component from state for proper duplication
        const state = window.GMKB?.systems?.StateManager?.getState?.() || window.StateManager?.getState();
        const component = state?.components?.[componentId];
        
        if (component) {
            // Use ComponentManager's duplicate method if available
            if (window.GMKB?.systems?.ComponentManager?.duplicateComponent) {
                window.GMKB.systems.ComponentManager.duplicateComponent(componentId);
            } else if (window.ComponentManager?.duplicateComponent) {
                window.ComponentManager.duplicateComponent(componentId);
            } else {
                // Fallback to DOM-only duplication
                this.fallbackDuplicateComponent(componentElement, componentId);
            }
        } else {
            // Fallback to DOM-only duplication
            this.fallbackDuplicateComponent(componentElement, componentId);
        }
    },
    
    /**
     * ROOT FIX: Fallback duplicate method for DOM-only scenarios
     * @param {HTMLElement} componentElement - Component DOM element
     * @param {string} componentId - Component ID
     */
    fallbackDuplicateComponent(componentElement, componentId) {
        console.log(`🔧 GLOBAL: Using fallback duplication for ${componentId}`);
        
        // Create a copy
        const duplicatedElement = componentElement.cloneNode(true);
        
        // Generate new ID
        const newId = componentId + '-copy-' + Date.now();
        duplicatedElement.setAttribute('data-component-id', newId);
        
        // Update any existing IDs in the duplicated content
        const elementsWithId = duplicatedElement.querySelectorAll('[id]');
        elementsWithId.forEach(el => {
            el.id = el.id + '-copy-' + Date.now();
        });
        
        // Insert after the original
        componentElement.parentNode.insertBefore(duplicatedElement, componentElement.nextSibling);
        
        // Visual feedback
        duplicatedElement.style.opacity = '0.5';
        duplicatedElement.style.transform = 'scale(0.95)';
        duplicatedElement.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            duplicatedElement.style.opacity = '1';
            duplicatedElement.style.transform = 'scale(1)';
            
            // Attach controls to the new component
            if (window.componentControlsManager) {
                window.componentControlsManager.attachControls(duplicatedElement, newId);
            }
            
            console.log(`✅ GLOBAL: Fallback duplication complete: ${componentId} → ${newId}`);
        }, 100);
    },
    
    /**
     * ROOT FIX: Handle duplicate component action (LEGACY SUPPORT)
     * @param {string} componentId - Component ID to duplicate
     */
    handleDuplicateComponent(componentId) {
        // ROOT FIX: Delegate to enhanced handler
        this.handleDuplicateComponentEnhanced(componentId);
    },
    
    /**
     * ROOT FIX: Handle delete component action
     * @param {string} componentId - Component ID to delete
     */
    handleDeleteComponent(componentId) {
        console.log(`🗑️ Deleting component: ${componentId}`);
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete this component?`)) {
            console.log('Delete cancelled by user');
            return;
        }
        
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentElement) {
            console.error(`Component element not found: ${componentId}`);
            return;
        }
        
        // Visual feedback before deletion
        componentElement.style.opacity = '0.5';
        componentElement.style.transform = 'scale(0.9)';
        componentElement.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            componentElement.remove();
            console.log(`✅ Deleted component ${componentId}`);
            
            // Check if we need to show empty state
            const container = document.querySelector('.media-kit, #media-kit-preview');
            const remainingComponents = container?.querySelectorAll('[data-component-id]');
            
            if (!remainingComponents || remainingComponents.length === 0) {
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'block';
                    console.log('✅ Showing empty state - no components remaining');
                }
            }
        }, 300);
    },
    
    /**
     * ROOT FIX: Request control attachment via event system
     * @param {HTMLElement} componentElement - Component DOM element
     * @param {string} componentId - Component ID
     */
    requestControlAttachment(componentElement, componentId) {
        this.dispatch('gmkb:attach-controls-requested', {
            componentElement,
            componentId,
            timestamp: Date.now(),
            source: 'GMKB'
        });
    },
    
    /**
     * ROOT FIX: Attach controls immediately when ComponentControlsManager is available
     * @param {HTMLElement} componentElement - Component DOM element
     * @param {string} componentId - Component ID
     */
    attachControlsImmediately(componentElement, componentId) {
        const success = window.componentControlsManager.attachControls(componentElement, componentId);
        if (success) {
            console.log(`✅ GMKB: Dynamic controls attached to ${componentId} via ComponentControlsManager`);
            console.log(`✅ GMKB: Root-level fix complete for ${componentId} - no hardcoded HTML`);
        } else {
            console.warn(`⚠️ GMKB: Failed to attach dynamic controls to ${componentId}`);
            // Fallback to event-based attachment
            this.requestControlAttachment(componentElement, componentId);
        }
    },
    
    // Simple debugging helper
    getStatus() {
        return {
            systems: Object.keys(this.systems),
            wordPressData: !!window.gmkbData,
            architecture: 'vanilla-js-final',
            timestamp: Date.now()
        };
    }
};

// ROOT FIX: Make GMKB available globally instead of using ES6 export
window.GMKB = GMKB;

// ROOT FIX: Initialize global action listeners immediately when GMKB loads
// This ensures toolbar auto-save and other systems can use GMKB immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        GMKB.initializeGlobalActionListeners();
    });
} else {
    // DOM already loaded, initialize immediately
    GMKB.initializeGlobalActionListeners();
}

console.log('✅ GMKB Core: Global namespace established and ready');
