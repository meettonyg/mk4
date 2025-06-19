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
        this.schemaLoadingPromises = new Map();
        this.pendingActions = new Set();
    }

    async init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        await this.loadComponentRegistry();
        this.setupEventListeners();
        console.log('EnhancedComponentManager initialized');
    }

    async loadComponentRegistry() {
        if (window.guestifyData?.components) {
            window.guestifyData.components.forEach(comp => {
                this.componentRegistry.set(comp.type, comp);
            });
        }
        if (window.guestifyData?.componentSchemas) {
            Object.entries(window.guestifyData.componentSchemas).forEach(([type, schema]) => {
                this.loadedSchemas.set(type, schema);
            });
        }
    }

    setupEventListeners() {
        document.body.addEventListener('click', async (event) => {
            // **FIX**: Look for control-btn class instead of data-action
            const button = event.target.closest('.control-btn');
            if (!button || this.pendingActions.has('component-action')) return;

            // **FIX**: Get action from title attribute
            const title = button.getAttribute('title');
            const componentId = button.closest('[data-component-id]')?.dataset.componentId;

            if (!componentId || !title) return;

            console.log(`Control action: ${title} on component: ${componentId}`);

            this.pendingActions.add('component-action');
            try {
                switch (title) {
                    case 'Move Up':
                        await this.moveComponent(componentId, 'up');
                        break;
                    case 'Move Down':
                        await this.moveComponent(componentId, 'down');
                        break;
                    case 'Duplicate':
                        await this.duplicateComponent(componentId);
                        break;
                    case 'Delete':
                        await this.removeComponent(componentId);
                        break;
                }
            } finally {
                setTimeout(() => this.pendingActions.delete('component-action'), 100);
            }
        });
    }

    getAvailableComponents() {
        return Array.from(this.componentRegistry.values());
    }

    async loadSchema(componentType) {
        if (this.loadedSchemas.has(componentType)) {
            return this.loadedSchemas.get(componentType);
        }
        if (this.schemaLoadingPromises.has(componentType)) {
            return this.schemaLoadingPromises.get(componentType);
        }

        const promise = (async () => {
            try {
                const restUrl = `${window.guestifyData.rest_url}guestify/v1/components/${componentType}/schema`;
                const response = await fetch(restUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const schema = await response.json();
                this.loadedSchemas.set(componentType, schema);
                return schema;
            } catch (error) {
                console.error(`Failed to load schema for ${componentType}:`, error);
                throw error;
            } finally {
                this.schemaLoadingPromises.delete(componentType);
            }
        })();

        this.schemaLoadingPromises.set(componentType, promise);
        return promise;
    }

    async addComponent(componentType, insertAfterId = null) {
        const perfEnd = performanceMonitor.start('component-add');
        try {
            const schema = await this.loadSchema(componentType);
            if (!schema) {
                throw new Error(`Schema not found for component: ${componentType}`);
            }

            const id = this.generateComponentId(componentType);

            const componentData = {};
            if (schema.settings) {
                Object.entries(schema.settings).forEach(([key, setting]) => {
                    if (setting.default !== undefined) {
                        componentData[key] = setting.default;
                    }
                });
            }

            // **FIX**: Remove duplicate initComponent call - addComponent will handle it
            // await enhancedStateManager.initComponent(id, componentType, componentData, true);
            await enhancedStateManager.addComponent(id, componentType, componentData, insertAfterId);

            perfEnd({ componentId: id, componentType });
            return id;

        } catch (error) {
            console.error(`Error adding component ${componentType}:`, error);
            perfEnd({ error: true });
            return null;
        }
    }
    
    async removeComponent(componentId) {
        const perfEnd = performanceMonitor.start('component-remove', { componentId });
        await enhancedStateManager.removeComponent(componentId);
        perfEnd();
    }
    
    async duplicateComponent(componentId) {
        const perfEnd = performanceMonitor.start('component-duplicate', { componentId });
        const originalState = enhancedStateManager.getStateForComponent(componentId);
        if (!originalState) return;

        const newId = await this.addComponent(originalState.type, componentId);
        
        const dataToCopy = { ...originalState.data };
        
        await enhancedStateManager.batchUpdate(async () => {
             Object.entries(dataToCopy).forEach(([key, value]) => {
                enhancedStateManager.updateComponentData(newId, key, value, true);
            });
        });
        
        perfEnd({ newComponentId: newId });
    }
    
    async moveComponent(componentId, direction) {
        const perfEnd = performanceMonitor.start('component-move', { componentId, direction });
        await enhancedStateManager.moveComponent(componentId, direction);
        perfEnd();
    }
    
    generateComponentId(type) {
        return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

export const enhancedComponentManager = new EnhancedComponentManager();