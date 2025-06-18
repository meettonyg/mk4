/**
 * Enhanced Component Manager
 * Pure state management - no DOM manipulation
 */

import enhancedStateManager from './enhanced-state-manager.js';
import { dataBindingEngine } from '../services/data-binding-engine.js';
import { schemaValidator } from './schema-validator.js';
import { performanceMonitor } from '../utils/performance-monitor.js';

class EnhancedComponentManager {
    constructor() {
        this.componentRegistry = new Map();
        this.loadedSchemas = new Map();
        this.initialized = false;
        this.controlDebounceTimer = null;
        this.schemaLoadingPromises = new Map(); // Prevent duplicate loads
        this.pendingActions = new Set(); // Track pending actions
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
                // Also register by directory name if different
                if (component.directory && component.directory !== component.name) {
                    this.componentRegistry.set(component.directory, component);
                }
            });
            console.log(`Loaded ${this.componentRegistry.size} components from guestifyData`);
            console.log('Available components:', Array.from(this.componentRegistry.keys()));
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
                        // Also register by directory name if different
                        if (component.directory && component.directory !== component.name) {
                            this.componentRegistry.set(component.directory, component);
                        }
                    });
                    console.log(`Loaded ${this.componentRegistry.size} components via AJAX`);
                    console.log('Available components:', Array.from(this.componentRegistry.keys()));
                }
            }
        } catch (error) {
            console.error('Failed to load component registry:', error);
        }
        
        // If no components found, register known components from directory structure
        // This ensures the system works even if server data is missing
        if (this.componentRegistry.size === 0) {
            console.log('No components loaded from server, registering known components...');
            const knownComponents = [
                'biography', 'booking-calendar', 'call-to-action', 'contact', 
                'guest-intro', 'hero', 'logo-grid', 'photo-gallery', 
                'podcast-player', 'questions', 'social', 'stats', 
                'testimonials', 'topics', 'video-intro'
            ];
            
            knownComponents.forEach(componentName => {
                this.componentRegistry.set(componentName, {
                    name: componentName,
                    directory: componentName,
                    fallback: true
                });
            });
            
            console.log(`Registered ${this.componentRegistry.size} fallback components`);
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
        
        // Check against dynamically loaded component registry
        // This includes ALL components discovered from the server
        const isValid = this.componentRegistry.has(mappedType) || 
                       this.componentRegistry.has(componentType) ||
                       this.loadedSchemas.has(mappedType) ||
                       this.loadedSchemas.has(componentType);
        
        if (!isValid) {
            console.log(`Component type '${componentType}' (mapped: '${mappedType}') not found in:`);
            console.log('- Registry:', Array.from(this.componentRegistry.keys()));
            console.log('- Loaded schemas:', Array.from(this.loadedSchemas.keys()));
        }
        
        return isValid;
    }
    
    /**
     * Add a component (state only - no DOM manipulation)
     */
    async addComponent(componentType, targetZoneId = null) {
        const perfEnd = performanceMonitor.start('component-add', { type: componentType });
        
        // Validate component type
        if (!this.isValidComponentType(componentType)) {
            console.error(`Invalid component type: ${componentType}`);
            perfEnd();
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
            
            perfEnd();
            return componentId;
            
        } catch (error) {
            console.error('Error adding component:', error);
            perfEnd();
            throw error;
        }
    }
    
    /**
     * Remove a component (state only - no DOM manipulation)
     */
    async removeComponent(componentId) {
        const perfEnd = performanceMonitor.start('component-remove', { componentId });
        
        // Check for pending actions
        if (enhancedStateManager.isPendingAction('delete', componentId)) {
            console.log(`Delete action already pending for ${componentId}`);
            perfEnd();
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
            perfEnd();
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
        }, 150); // Reduced debounce time for better responsiveness
    }
    
    /**
     * Execute control action
     */
    async executeControlAction(action, componentId) {
        const perfEnd = performanceMonitor.start('control-action', { action, componentId });
        
        // Save any active edits first
        await this.saveActiveEditableContent();
        
        try {
            switch (action) {
                case 'delete':
                    if (confirm('Are you sure you want to delete this component?')) {
                        // Force DOM cleanup before state removal
                        const element = document.querySelector(`[data-component-id="${componentId}"]`);
                        if (element) {
                            element.classList.add('component-deleting');
                            element.style.opacity = '0.5';
                            element.style.pointerEvents = 'none';
                        }
                        
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
        } finally {
            perfEnd();
        }
    }
    
    /**
     * Duplicate a component
     */
    async duplicateComponent(sourceComponentId) {
        const perfEnd = performanceMonitor.start('component-duplicate', { sourceComponentId });
        
        const sourceComponent = enhancedStateManager.getComponent(sourceComponentId);
        if (!sourceComponent) {
            console.error('Source component not found');
            perfEnd();
            return;
        }
        
        const newComponentId = this.generateComponentId(sourceComponent.type);
        // Deep clone the data to ensure all nested properties are copied
        const newData = JSON.parse(JSON.stringify(sourceComponent.data || {}));
        
        console.log('Duplicating component:', sourceComponentId, 'with data:', newData);
        
        // Get the order for the new component
        const components = enhancedStateManager.getOrderedComponents();
        const sourceIndex = components.findIndex(c => c.id === sourceComponentId);
        const newOrder = sourceIndex >= 0 ? sourceIndex + 1 : components.length;
        
        // Use the proper state manager method to add the component
        await enhancedStateManager.batchUpdate(async () => {
            // First init the component with proper notification
            enhancedStateManager.initComponent(newComponentId, sourceComponent.type, newData, true);
            
            // Then update the order of all components
            const allComponents = enhancedStateManager.getOrderedComponents();
            const componentIds = allComponents.map(c => c.id);
            
            // Find where the new component was placed
            const newIndex = componentIds.indexOf(newComponentId);
            if (newIndex > -1) {
                // Remove from current position
                componentIds.splice(newIndex, 1);
                // Insert after source component
                const sourceCurrentIndex = componentIds.indexOf(sourceComponentId);
                componentIds.splice(sourceCurrentIndex + 1, 0, newComponentId);
                
                // Reorder with proper notification
                enhancedStateManager.reorderComponents(componentIds);
            }
        });
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('component-duplicated', {
            detail: { sourceComponentId, newComponentId }
        }));
        
        perfEnd();
        return newComponentId;
    }
    
    /**
     * Move component up or down
     */
    async moveComponent(componentId, direction) {
        const perfEnd = performanceMonitor.start('component-move', { componentId, direction });
        
        const components = enhancedStateManager.getOrderedComponents();
        const currentIndex = components.findIndex(c => c.id === componentId);
        
        if (currentIndex === -1) {
            perfEnd();
            return;
        }
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        if (newIndex < 0 || newIndex >= components.length) {
            perfEnd();
            return;
        }
        
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
        
        perfEnd();
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
     * Load component schema with deduplication
     */
    async loadComponentSchema(componentType) {
        // Check cache
        if (this.loadedSchemas.has(componentType)) {
            performanceMonitor.trackCache('schema', true);
            const perfEnd = performanceMonitor.start('schema-load-cached', { type: componentType });
            const schema = this.loadedSchemas.get(componentType);
            perfEnd();
            return schema;
        }
        
        performanceMonitor.trackCache('schema', false);
        
        // If already loading, return the existing promise
        if (this.schemaLoadingPromises.has(componentType)) {
            return this.schemaLoadingPromises.get(componentType);
        }
        
        // Create loading promise
        const loadingPromise = this._loadSchemaInternal(componentType);
        this.schemaLoadingPromises.set(componentType, loadingPromise);
        
        const perfEnd = performanceMonitor.start('schema-load', { type: componentType });
        
        try {
            const schema = await loadingPromise;
            this.loadedSchemas.set(componentType, schema);
            this.schemaLoadingPromises.delete(componentType);
            perfEnd();
            return schema;
        } catch (error) {
            this.schemaLoadingPromises.delete(componentType);
            perfEnd();
            throw error;
        }
    }
    
    async _loadSchemaInternal(componentType) {
        // First check localized schemas from PHP
        if (window.guestifyData?.componentSchemas?.[componentType]) {
            const schema = window.guestifyData.componentSchemas[componentType];
            console.log(`Loaded schema for ${componentType} from localized data`);
            
            // Validate schema in non-blocking way
            this.validateSchemaAsync(componentType, schema);
            
            return schema;
        }
        
        // Provide fallback schemas for components that truly don't exist on server
        // Remove schemas for components that actually exist (social, questions, contact, etc.)
        const fallbackSchemas = {
            // Only include schemas for components that genuinely need fallbacks
            // Most components should load from server
        };
        
        // Check if we have a fallback schema
        if (fallbackSchemas[componentType]) {
            console.log(`Using fallback schema for ${componentType}`);
            return fallbackSchemas[componentType];
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
                        
                        // Validate schema in non-blocking way
                        this.validateSchemaAsync(componentType, schema);
                        
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
     * Save active contenteditable content - batched for performance
     */
    async saveActiveEditableContent() {
        const activeElement = document.activeElement;
        
        if (activeElement && activeElement.contentEditable === 'true') {
            activeElement.blur();
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Batch save all editable content
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        const updates = [];

        editableElements.forEach(element => {
            const componentEl = element.closest('[data-component-id]');
            if (componentEl) {
                const componentId = componentEl.getAttribute('data-component-id');
                const fieldName = element.getAttribute('data-field-name');
                if (componentId && fieldName) {
                    updates.push({
                        componentId,
                        fieldName,
                        value: element.innerHTML
                    });
                }
            }
        });

        // Batch update state
        if (updates.length > 0) {
            await enhancedStateManager.batchUpdate(async () => {
                updates.forEach(update => {
                    enhancedStateManager.updateComponentData(
                        update.componentId,
                        update.fieldName,
                        update.value
                    );
                });
            });
        }
        
        return new Promise(resolve => setTimeout(resolve, 50));
    }
    
    /**
     * Generate unique component ID
     */
    generateComponentId(type) {
        return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Validate schema asynchronously to avoid blocking
     */
    async validateSchemaAsync(componentType, schema) {
        // Run validation in next tick to avoid blocking
        setTimeout(() => {
            try {
                schemaValidator.validateSchema(componentType, schema);
            } catch (error) {
                console.error(`Schema validation error for ${componentType}:`, error);
            }
        }, 0);
    }
    
    /**
     * Get schema validation summary (for debugging)
     */
    getSchemaValidationSummary() {
        return schemaValidator.getValidationSummary();
    }
}

// Export singleton instance
export const enhancedComponentManager = new EnhancedComponentManager();