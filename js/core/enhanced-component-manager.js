/**
 * Enhanced Component Manager
 * Pure state management - no DOM manipulation
 */

import enhancedStateManager from './enhanced-state-manager.js';
import { dataBindingEngine } from '../services/data-binding-engine.js';

class EnhancedComponentManager {
    constructor() {
        this.componentRegistry = new Map();
        this.loadedSchemas = new Map();
        this.initialized = false;
        this.controlDebounceTimer = null;
    }
    
    /**
     * Initialize the component manager
     */
    async init() {
        if (this.initialized) {
            console.log('EnhancedComponentManager already initialized');
            return;
        }
        
        this.initialized = true;
        
        // Load component registry
        await this.loadComponentRegistry();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('EnhancedComponentManager initialized');
    }
    
    /**
     * Load available components from the server
     */
    async loadComponentRegistry() {
        // Check if components are already available from guestifyData
        if (window.guestifyData && window.guestifyData.components) {
            window.guestifyData.components.forEach(component => {
                this.componentRegistry.set(component.name, component);
            });
            console.log(`Loaded ${this.componentRegistry.size} components from guestifyData`);
            return;
        }
        
        // Fallback to AJAX if needed
        try {
            const ajaxUrl = window.ajaxurl || window.gmkb_data?.ajax_url || '/wp-admin/admin-ajax.php';
            const nonce = window.gmkb_data?.nonce || window.guestifyData?.nonce || '';
            
            const response = await fetch(ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'guestify_get_components',
                    nonce: nonce
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.components) {
                    data.components.forEach(component => {
                        this.componentRegistry.set(component.name, component);
                    });
                    console.log(`Loaded ${this.componentRegistry.size} components via AJAX`);
                }
            }
        } catch (error) {
            console.error('Failed to load component registry:', error);
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for component add requests
        document.addEventListener('add-component', async (e) => {
            await this.addComponent(e.detail.type, e.detail.targetZoneId);
        });
        
        // Listen for component remove requests
        document.addEventListener('remove-component', async (e) => {
            await this.removeComponent(e.detail.componentId);
        });
        
        // Listen for component reorder
        document.addEventListener('reorder-components', (e) => {
            this.reorderComponents(e.detail.componentIds);
        });
    }
    
    /**
     * Validate component type
     */
    isValidComponentType(componentType) {
        // Map common component aliases
        const componentMap = {
            'bio': 'biography',
            'calendar': 'booking-calendar',
            'cta': 'call-to-action',
            'gallery': 'photo-gallery',
            'podcast': 'podcast-player',
            'video': 'video-intro',
            'hero-section': 'hero',
            'Hero Section': 'hero'
        };
        
        const mappedType = componentMap[componentType] || componentType;
        return this.componentRegistry.has(mappedType) || 
               this.loadedSchemas.has(mappedType) ||
               ['hero', 'biography', 'stats', 'call-to-action', 'topics', 'social-links'].includes(mappedType);
    }
    
    /**
     * Add a component (state only - no DOM manipulation)
     */
    async addComponent(componentType, targetZoneId = null) {
        // Validate component type
        if (!this.isValidComponentType(componentType)) {
            console.error(`Invalid component type: ${componentType}`);
            return null;
        }
        
        // Save any active edits first
        await this.saveActiveEditableContent();
        
        // Map component type aliases
        const componentMap = {
            'bio': 'biography',
            'calendar': 'booking-calendar',
            'cta': 'call-to-action',
            'gallery': 'photo-gallery',
            'podcast': 'podcast-player',
            'video': 'video-intro',
            'hero-section': 'hero',
            'Hero Section': 'hero'
        };
        
        const mappedType = componentMap[componentType] || componentType;
        const componentId = this.generateComponentId(mappedType);
        
        try {
            // Load schema if needed
            const schema = await this.loadComponentSchema(mappedType);
            const initialData = schema ? this.getInitialDataFromSchema(schema) : {};
            
            // Update state only
            await enhancedStateManager.batchUpdate(async () => {
                enhancedStateManager.initComponent(componentId, mappedType, initialData, true);
                
                if (targetZoneId) {
                    enhancedStateManager.replaceDropZone(targetZoneId, componentId);
                }
                
                // Initialize data binding if schema exists
                if (schema && schema.settings && Object.keys(schema.settings).length > 0) {
                    await dataBindingEngine.initializeComponent(componentId, mappedType, schema);
                }
            });
            
            // Dispatch event for other systems
            document.dispatchEvent(new CustomEvent('component-added', {
                detail: { componentId, componentType: mappedType }
            }));
            
            return componentId;
            
        } catch (error) {
            console.error('Error adding component:', error);
            throw error;
        }
    }
    
    /**
     * Remove a component (state only - no DOM manipulation)
     */
    async removeComponent(componentId) {
        // Check for pending actions
        if (enhancedStateManager.isPendingAction('delete', componentId)) {
            console.log(`Delete action already pending for ${componentId}`);
            return;
        }
        
        // Save any active edits
        await this.saveActiveEditableContent();
        
        // Mark as pending
        enhancedStateManager.setPendingAction('delete', componentId);
        
        // Update meta state for animation
        enhancedStateManager.updateComponentMeta(componentId, { isDeleting: true });
        
        // Wait for animation
        setTimeout(() => {
            enhancedStateManager.removeComponent(componentId);
            enhancedStateManager.clearPendingAction('delete', componentId);
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('component-removed', {
                detail: { componentId }
            }));
        }, 300);
    }
    
    /**
     * Handle control action with debouncing
     */
    async handleControlAction(action, componentId) {
        // Validate component exists
        if (!enhancedStateManager.getComponent(componentId)) {
            console.warn(`Component ${componentId} not found in state`);
            return;
        }
        
        // Check for pending actions
        const actionMap = {
            '×': 'delete',
            '⧉': 'duplicate',
            '↑': 'moveUp',
            '↓': 'moveDown'
        };
        
        const mappedAction = actionMap[action] || action;
        
        if (enhancedStateManager.isPendingAction(mappedAction, componentId)) {
            console.log(`Action ${mappedAction} already pending for ${componentId}`);
            return;
        }
        
        // Debounce control actions
        if (this.controlDebounceTimer) {
            clearTimeout(this.controlDebounceTimer);
        }
        
        this.controlDebounceTimer = setTimeout(async () => {
            await this.executeControlAction(mappedAction, componentId);
        }, 300);
    }
    
    /**
     * Execute control action
     */
    async executeControlAction(action, componentId) {
        // Save any active edits first
        await this.saveActiveEditableContent();
        
        try {
            switch (action) {
                case 'delete':
                    if (confirm('Are you sure you want to delete this component?')) {
                        // Don't set pending action here - removeComponent will handle it
                        await this.removeComponent(componentId);
                    } else {
                        // Clear the pending action if user cancels
                        enhancedStateManager.clearPendingAction(action, componentId);
                    }
                    break;
                    
                case 'duplicate':
                    // Mark action as pending for other actions
                    enhancedStateManager.setPendingAction(action, componentId);
                    await this.duplicateComponent(componentId);
                    enhancedStateManager.clearPendingAction(action, componentId);
                    break;
                    
                case 'moveUp':
                    enhancedStateManager.setPendingAction(action, componentId);
                    await this.moveComponent(componentId, 'up');
                    enhancedStateManager.clearPendingAction(action, componentId);
                    break;
                    
                case 'moveDown':
                    enhancedStateManager.setPendingAction(action, componentId);
                    await this.moveComponent(componentId, 'down');
                    enhancedStateManager.clearPendingAction(action, componentId);
                    break;
            }
        } catch (error) {
            console.error(`Error executing ${action}:`, error);
            // Clear pending action on error
            enhancedStateManager.clearPendingAction(action, componentId);
        }
    }
    
    /**
     * Duplicate a component
     */
    async duplicateComponent(sourceComponentId) {
        const sourceComponent = enhancedStateManager.getComponent(sourceComponentId);
        if (!sourceComponent) {
            console.error('Source component not found');
            return;
        }
        
        const newComponentId = this.generateComponentId(sourceComponent.type);
        // Deep clone the data to ensure all nested properties are copied
        const newData = JSON.parse(JSON.stringify(sourceComponent.data || {}));
        
        console.log('Duplicating component:', sourceComponentId, 'with data:', newData);
        
        // Get the order for the new component
        const components = enhancedStateManager.getOrderedComponents();
        const sourceIndex = components.findIndex(c => c.id === sourceComponentId);
        
        await enhancedStateManager.batchUpdate(async () => {
            // Initialize new component with empty data first
            enhancedStateManager.initComponent(newComponentId, sourceComponent.type, {}, true);
            
            // Now directly set the component data in state to override any defaults
            if (enhancedStateManager.baseManager.state.components[newComponentId]) {
                enhancedStateManager.baseManager.state.components[newComponentId].data = JSON.parse(JSON.stringify(newData));
                console.log('Directly set duplicated data:', enhancedStateManager.baseManager.state.components[newComponentId].data);
            }
            
            // Calculate new order to place after source
            if (sourceIndex >= 0) {
                // Get fresh component list after adding new component
                const updatedComponents = enhancedStateManager.getOrderedComponents();
                const componentIds = updatedComponents.map(c => c.id);
                const currentNewIndex = componentIds.indexOf(newComponentId);
                
                if (currentNewIndex > -1 && currentNewIndex !== sourceIndex + 1) {
                    // Remove from current position
                    componentIds.splice(currentNewIndex, 1);
                    // Insert after source
                    componentIds.splice(sourceIndex + 1, 0, newComponentId);
                    // Reorder without notification (we're in batch mode)
                    enhancedStateManager.baseManager.reorderComponents(componentIds);
                }
            }
            
            // Skip data binding initialization for now - it might be overwriting data
            // const schema = await this.loadComponentSchema(sourceComponent.type);
            // if (schema && schema.settings && Object.keys(schema.settings).length > 0) {
            //     const { dataBindingEngine } = await import('../services/data-binding-engine.js');
            //     await dataBindingEngine.initializeComponent(newComponentId, sourceComponent.type, schema, newData);
            // }
        });
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('component-duplicated', {
            detail: { sourceComponentId, newComponentId }
        }));
        
        return newComponentId;
    }
    
    /**
     * Move component up or down
     */
    async moveComponent(componentId, direction) {
        const components = enhancedStateManager.getOrderedComponents();
        const currentIndex = components.findIndex(c => c.id === componentId);
        
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        if (newIndex < 0 || newIndex >= components.length) return;
        
        // Update meta state for animation
        enhancedStateManager.updateComponentMeta(componentId, { isMoving: true });
        
        // Swap positions
        const componentIds = components.map(c => c.id);
        [componentIds[currentIndex], componentIds[newIndex]] = [componentIds[newIndex], componentIds[currentIndex]];
        
        // Reorder
        enhancedStateManager.reorderComponents(componentIds);
        
        // Clear moving state after animation
        setTimeout(() => {
            enhancedStateManager.updateComponentMeta(componentId, { isMoving: false });
        }, 300);
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('component-moved', {
            detail: { componentId, direction }
        }));
    }
    
    /**
     * Reorder components
     */
    reorderComponents(componentIds) {
        enhancedStateManager.reorderComponents(componentIds);
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('components-reordered', {
            detail: { componentIds }
        }));
    }
    
    /**
     * Load component schema
     */
    async loadComponentSchema(componentType) {
        // Check cache
        if (this.loadedSchemas.has(componentType)) {
            return this.loadedSchemas.get(componentType);
        }
        
        // First check localized schemas from PHP
        if (window.guestifyData?.componentSchemas?.[componentType]) {
            const schema = window.guestifyData.componentSchemas[componentType];
            this.loadedSchemas.set(componentType, schema);
            console.log(`Loaded schema for ${componentType} from localized data`);
            return schema;
        }
        
        // Fallback to fetching if not in localized data
        try {
            const paths = [
                `/wp-content/plugins/guestify-media-kit-builder/components/${componentType}/component.json`,
                `${window.guestifyData?.pluginUrl || ''}/components/${componentType}/component.json`,
                `${window.location.origin}/wp-content/plugins/guestify-media-kit-builder/components/${componentType}/component.json`
            ];
            
            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        const schema = await response.json();
                        this.loadedSchemas.set(componentType, schema);
                        return schema;
                    }
                } catch (e) {
                    // Try next path
                }
            }
            
            console.warn(`Could not load schema for ${componentType}`);
        } catch (error) {
            console.error(`Failed to load schema for ${componentType}:`, error);
        }
        
        return null;
    }
    
    /**
     * Get initial data from schema
     */
    getInitialDataFromSchema(schema) {
        const initialData = {};
        
        if (schema.settings) {
            Object.entries(schema.settings).forEach(([key, setting]) => {
                if (setting.default !== undefined) {
                    initialData[key] = setting.default;
                } else if (setting.type === 'text' || setting.type === 'textarea') {
                    initialData[key] = '';
                } else if (setting.type === 'number') {
                    initialData[key] = 0;
                } else if (setting.type === 'boolean') {
                    initialData[key] = false;
                }
            });
        }
        
        return initialData;
    }
    
    /**
     * Save active contenteditable content
     */
    async saveActiveEditableContent() {
        const activeElement = document.activeElement;
        
        if (activeElement && activeElement.contentEditable === 'true') {
            activeElement.blur();
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Check for any unsaved changes
        const editables = document.querySelectorAll('[contenteditable="true"][data-original-content]');
        editables.forEach(editable => {
            const originalContent = editable.getAttribute('data-original-content');
            if (originalContent !== null && originalContent !== editable.textContent) {
                editable.blur();
            }
        });
        
        return new Promise(resolve => setTimeout(resolve, 50));
    }
    
    /**
     * Generate unique component ID
     */
    generateComponentId(type) {
        return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Export singleton instance
export const enhancedComponentManager = new EnhancedComponentManager();