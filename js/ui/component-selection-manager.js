/**
 * Component Selection Manager
 * PHASE 2: Handles component selection for configuration
 * 
 * Manages component selection state and triggers configuration UI
 * 
 * @version 2.0.0-phase2
 * @package GMKB/UI
 */

class ComponentSelectionManager {
    constructor() {
        this.logger = window.structuredLogger || console;
        this.selectedComponentId = null;
        this.selectedElement = null;
        this.isUpdating = false; // ROOT FIX: Track update state to prevent deselection
        
        this.logger.info('UI', '🎯 [PHASE 2] ComponentSelectionManager initializing');
        this.init();
    }
    
    /**
     * Initialize selection manager
     */
    init() {
        // Listen for component rendered events to attach selection handlers
        document.addEventListener('gmkb:component-rendered', (event) => {
            this.attachSelectionHandler(event.detail.element, event.detail.componentId);
            
            // ROOT FIX: If this is the component being updated, restore selection
            if (this.isUpdating && event.detail.componentId === this.selectedComponentId) {
                this.restoreSelection(event.detail.componentId);
            }
        });
        
        // Listen for component updated events
        document.addEventListener('gmkb:component-updated', (event) => {
            this.attachSelectionHandler(event.detail.element, event.detail.componentId);
        });
        
        // ROOT FIX: Listen for update lifecycle events
        document.addEventListener('gmkb:before-component-update', (event) => {
            if (event.detail.componentId === this.selectedComponentId) {
                this.isUpdating = true;
                this.logger.debug('UI', `🔄 [PHASE 2] Component update starting for ${event.detail.componentId}`);
            }
        });
        
        document.addEventListener('gmkb:after-component-update', (event) => {
            if (event.detail.componentId === this.selectedComponentId) {
                // Restore selection after a brief delay to ensure DOM is updated
                setTimeout(() => {
                    this.restoreSelection(event.detail.componentId);
                    this.isUpdating = false;
                }, 50);
            }
        });
        
        // Listen for clicks outside components to deselect
        document.addEventListener('click', (event) => {
            this.handleGlobalClick(event);
        });
        
        // Listen for force rerender events to refresh selection
        document.addEventListener('gmkb:force-component-rerender', (event) => {
            this.handleComponentRerender(event.detail);
        });
        
        this.logger.info('UI', '✅ [PHASE 2] ComponentSelectionManager initialized');
    }
    
    /**
     * Attach selection handler to component element
     */
    attachSelectionHandler(element, componentId) {
        if (!element || !componentId) return;
        
        // Remove existing selection handler
        element.removeEventListener('click', element._selectionHandler);
        
        // Create new selection handler
        element._selectionHandler = (event) => {
            // Don't trigger selection if clicking on control buttons
            if (event.target.closest('.element-controls') || 
                event.target.closest('.control-btn') ||
                event.target.classList.contains('control-btn')) {
                return;
            }
            
            event.stopPropagation();
            this.selectComponent(componentId, element);
        };
        
        // Attach handler
        element.addEventListener('click', element._selectionHandler);
        
        // Add visual selection indicator
        element.style.cursor = 'pointer';
        element.title = 'Click to configure this component';
        
        this.logger.debug('UI', `🎯 [PHASE 2] Selection handler attached to ${componentId}`);
    }
    
    /**
     * Select a component
     */
    selectComponent(componentId, element) {
        // Deselect previous component
        this.deselectCurrentComponent();
        
        // Select new component
        this.selectedComponentId = componentId;
        this.selectedElement = element;
        
        // Add visual selection state
        element.classList.add('selected', 'gmkb-component--selected');
        
        // Get component type
        const componentType = element.dataset.componentType || element.getAttribute('data-component-type');
        
        // Dispatch selection event
        document.dispatchEvent(new CustomEvent('gmkb:component-selected', {
            detail: {
                componentId,
                componentType,
                element,
                timestamp: Date.now()
            }
        }));
        
        this.logger.info('UI', `✅ [PHASE 2] Selected component: ${componentType} (${componentId})`);
        
        // Show toast notification
        if (window.showToast) {
            window.showToast(`Selected ${componentType} component`, 'info');
        }
    }
    
    /**
     * Deselect current component
     */
    deselectCurrentComponent() {
        // ROOT FIX: Don't deselect if we're in the middle of an update
        if (this.isUpdating) {
            this.logger.debug('UI', '🛑 [PHASE 2] Skipping deselection during update');
            return;
        }
        
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected', 'gmkb-component--selected');
        }
        
        if (this.selectedComponentId) {
            // Dispatch deselection event
            document.dispatchEvent(new CustomEvent('gmkb:component-deselected', {
                detail: {
                    componentId: this.selectedComponentId,
                    timestamp: Date.now()
                }
            }));
            
            this.logger.debug('UI', `🚫 [PHASE 2] Deselected component: ${this.selectedComponentId}`);
        }
        
        this.selectedComponentId = null;
        this.selectedElement = null;
    }
    
    /**
     * Handle global clicks for deselection
     */
    handleGlobalClick(event) {
        // Check if click is outside any component
        const clickedComponent = event.target.closest('[data-component-id]');
        
        if (!clickedComponent && this.selectedComponentId) {
            // Clicked outside components - deselect
            this.deselectCurrentComponent();
        }
    }
    
    /**
     * Handle component rerender - reselect if needed
     */
    handleComponentRerender(detail) {
        if (detail.componentId === this.selectedComponentId) {
            // Component was rerendered, need to reselect
            setTimeout(() => {
                const newElement = document.querySelector(`[data-component-id="${this.selectedComponentId}"]`);
                if (newElement) {
                    this.selectedElement = newElement;
                    newElement.classList.add('selected', 'gmkb-component--selected');
                    this.attachSelectionHandler(newElement, this.selectedComponentId);
                    
                    this.logger.debug('UI', `🔄 [PHASE 2] Reselected component after rerender: ${this.selectedComponentId}`);
                }
            }, 100);
        }
    }
    
    /**
     * Get currently selected component
     */
    getSelectedComponent() {
        return {
            componentId: this.selectedComponentId,
            element: this.selectedElement
        };
    }
    
    /**
     * Select component by ID (programmatic selection)
     */
    selectComponentById(componentId) {
        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
            this.selectComponent(componentId, element);
        } else {
            this.logger.warn('UI', `⚠️ [PHASE 2] Cannot select component ${componentId} - element not found`);
        }
    }
    
    /**
     * ROOT FIX: Restore selection after component update
     */
    restoreSelection(componentId) {
        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
            this.selectedElement = element;
            element.classList.add('selected', 'gmkb-component--selected');
            this.attachSelectionHandler(element, componentId);
            
            // Re-dispatch selection event to ensure design panel stays open
            document.dispatchEvent(new CustomEvent('gmkb:component-selected', {
                detail: {
                    componentId,
                    componentType: element.dataset.componentType || element.getAttribute('data-component-type'),
                    element,
                    timestamp: Date.now(),
                    isRestoration: true
                }
            }));
            
            this.logger.debug('UI', `🔄 [PHASE 2] Restored selection after update: ${componentId}`);
        } else {
            this.logger.warn('UI', `⚠️ [PHASE 2] Could not restore selection - element not found: ${componentId}`);
        }
    }
    
    /**
     * Debug method
     */
    getDebugInfo() {
        return {
            selectedComponentId: this.selectedComponentId,
            selectedElement: this.selectedElement?.id,
            hasSelection: !!this.selectedComponentId,
            isUpdating: this.isUpdating
        };
    }
}

// Global instance
window.ComponentSelectionManager = ComponentSelectionManager;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.componentSelectionManager = new ComponentSelectionManager();
    });
} else {
    window.componentSelectionManager = new ComponentSelectionManager();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentSelectionManager;
}