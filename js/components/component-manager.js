/**
 * Enhanced Component Manager
 * Manages component lifecycle with centralized state management
 */

import { stateManager } from '../services/state-manager.js';
import { dataBindingEngine } from '../services/data-binding-engine.js';
import { selectElement } from '../ui/element-editor.js';
import { renderComponent } from './dynamic-component-loader.js';

class ComponentManager {
    constructor() {
        this.componentRegistry = new Map();
        this.loadedSchemas = new Map();
        this.initialized = false;
    }

    /**
     * Initialize the component manager
     */
    async init() {
        if (this.initialized) {
            console.log('ComponentManager already initialized');
            return;
        }
        
        this.initialized = true;
        
        // Load component registry
        await this.loadComponentRegistry();
        
        // Subscribe to state changes
        stateManager.subscribeGlobal((state) => {
            this.onStateChange(state);
        });
        
        // Listen for component events
        this.setupEventListeners();
    }

    /**
     * Load available components from the server
     */
    async loadComponentRegistry() {
        // Check if components are already available from guestifyData
        if (window.guestifyData && window.guestifyData.components) {
            // Use pre-loaded components
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
                    action: 'guestify_get_components', // Match the registered action
                    nonce: nonce
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    data.data.forEach(component => {
                        this.componentRegistry.set(component.name, component);
                    });
                    console.log(`Loaded ${this.componentRegistry.size} components via AJAX`);
                } else {
                    console.error('Component loading failed:', data.data || 'Unknown error');
                }
            } else {
                console.error('Component loading failed with status:', response.status);
            }
        } catch (error) {
            console.error('Failed to load component registry:', error);
            // Try to load from component discovery if available
            this.loadFromDiscovery();
        }
    }
    
    /**
     * Load components from discovery system
     */
    loadFromDiscovery() {
        // Check if component data is available from PHP
        const componentElements = document.querySelectorAll('[data-component-type]');
        const foundTypes = new Set();
        
        componentElements.forEach(el => {
            const type = el.getAttribute('data-component-type');
            if (type && !foundTypes.has(type)) {
                foundTypes.add(type);
                this.componentRegistry.set(type, {
                    name: type,
                    type: type
                });
            }
        });
        
        if (foundTypes.size > 0) {
            console.log(`Discovered ${foundTypes.size} component types from DOM`);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for component add requests
        document.addEventListener('add-component', async (e) => {
            await this.addComponent(e.detail.type, e.detail.targetId, e.detail.position);
        });
        
        // Listen for component remove requests
        document.addEventListener('remove-component', (e) => {
            this.removeComponent(e.detail.componentId);
        });
        
        // Listen for component reorder
        document.addEventListener('reorder-components', (e) => {
            this.reorderComponents(e.detail.componentIds);
        });
    }

    /**
     * Add a component to the media kit
     * @param {string} componentType - Component type
     * @param {string} targetId - Target container or component ID
     * @param {string} position - Position relative to target ('before', 'after', 'inside')
     */
    async addComponent(componentType, targetId = null, position = 'inside') {
        console.log(`Adding component: ${componentType}`);
        
        // Map common component aliases
        const componentMap = {
            'bio': 'biography',
            'calendar': 'booking-calendar',
            'cta': 'call-to-action',
            'gallery': 'photo-gallery',
            'podcast': 'podcast-player',
            'video': 'video-intro',
            'hero-section': 'hero',  // Map Hero Section to hero
            'Hero Section': 'hero'   // Handle display name too
        };
        
        // Use mapped name if available
        const mappedType = componentMap[componentType] || componentType;
        const componentId = this.generateComponentId(mappedType);
        
        try {
            // Load component schema if not already loaded
            if (!this.loadedSchemas.has(mappedType)) {
                const schema = await this.loadComponentSchema(mappedType);
                if (schema) {
                    this.loadedSchemas.set(mappedType, schema);
                } else {
                    // Create a minimal schema if loading fails
                    console.warn(`Schema not found for ${mappedType}, using minimal schema`);
                    const minimalSchema = {
                        name: mappedType.charAt(0).toUpperCase() + mappedType.slice(1),
                        type: mappedType,
                        settings: {}
                    };
                    this.loadedSchemas.set(mappedType, minimalSchema);
                }
            }
            
            const schema = this.loadedSchemas.get(mappedType);
            
            // Batch the component initialization to prevent multiple renders
            await stateManager.batchUpdate(async () => {
                // Initialize component in state manager first
                stateManager.initComponent(componentId, mappedType, {}, true);
                
                // Initialize component in data binding engine (if schema has settings)
                if (schema.settings && Object.keys(schema.settings).length > 0) {
                    await dataBindingEngine.initializeComponent(componentId, mappedType, schema);
                }
            });
            
            // Wait for the component to be rendered by the state change
            await new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    const element = document.querySelector(`[data-component-id="${componentId}"]`);
                    if (element) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 50);
                
                // Timeout after 2 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 2000);
            });
            
            // Now select the component
            const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (componentElement) {
                selectElement(componentElement);
                
                // Dispatch component selected event for design panel
                document.dispatchEvent(new CustomEvent('component-selected', {
                    detail: { componentId, componentType: mappedType }
                }));
            }
            
            // Show success notification
            this.showNotification(`${schema.name} component added successfully`);
            
            // Return the component ID for the caller
            return componentId;
            
        } catch (error) {
            console.error('Error adding component:', error);
            this.showNotification('Failed to add component', 'error');
            throw error; // Re-throw to be caught by addComponentToZone
        }
    }

    /**
     * Add component to a drop zone (legacy support)
     * @param {string} componentType - Component type
     * @param {HTMLElement} zone - Drop zone element
     */
    async addComponentToZone(componentType, zone) {
        console.log(`Adding component ${componentType} to zone`);
        
        try {
            // Simply add the component to state
            // The Component Renderer will handle all DOM updates
            const componentId = await this.addComponent(componentType);
            
            // Return the component ID for the caller
            return componentId;
            
        } catch (error) {
            console.error('Failed to add component to zone:', error);
            throw error;
        }
    }

    /**
     * Remove a component
     * @param {string} componentId - Component ID
     */
    removeComponent(componentId) {
        // Remove from state
        stateManager.removeComponent(componentId);
        
        // Remove from DOM
        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
            // Animate removal
            element.style.opacity = '0';
            element.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                element.remove();
                this.showNotification('Component removed');
            }, 200);
        }
    }

    /**
     * Reorder components
     * @param {Array<string>} componentIds - Ordered array of component IDs
     */
    reorderComponents(componentIds) {
        stateManager.reorderComponents(componentIds);
        
        // Reorder in DOM
        const container = document.getElementById('media-kit-preview');
        if (!container) return;
        
        componentIds.forEach((id, index) => {
            const element = document.querySelector(`[data-component-id="${id}"]`);
            if (element) {
                container.appendChild(element);
            }
        });
    }

    /**
     * Duplicate a component
     * @param {string} sourceComponentId - ID of component to duplicate
     */
    async duplicateComponent(sourceComponentId) {
        const sourceComponent = stateManager.getComponent(sourceComponentId);
        if (!sourceComponent) return;
        
        const newComponentId = this.generateComponentId(sourceComponent.type);
        
        // Copy component data
        const newData = { ...sourceComponent.data };
        
        // Initialize new component with copied data
        const schema = this.loadedSchemas.get(sourceComponent.type);
        if (schema) {
            stateManager.initComponent(newComponentId, sourceComponent.type, newData);
            
            // Just update the state - Component Renderer will handle the DOM
            // The component will be rendered automatically by the state change
            
            this.showNotification('Component duplicated');
        }
    }

    /**
     * Load component schema
     * @param {string} componentType - Component type
     * @returns {Object|null} Component schema
     */
    async loadComponentSchema(componentType) {
        try {
            // Try multiple possible paths
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
                        console.log(`Loaded schema for ${componentType} from ${path}`);
                        return schema;
                    }
                } catch (e) {
                    // Try next path
                }
            }
            
            console.warn(`Could not load schema for ${componentType} from any path`);
        } catch (error) {
            console.error(`Failed to load schema for ${componentType}:`, error);
        }
        return null;
    }

    // REMOVED: insertComponentIntoDOM method
    // All DOM manipulation is now handled by Component Renderer

    // REMOVED: makeComponentInteractive method
    // Component interactivity is now handled by Component Renderer

    /**
     * Handle control button actions
     * @param {string} action - Action to perform
     * @param {string} componentId - Component ID
     */
    async handleControlAction(action, componentId) {
        // Save any active contenteditable changes before any action
        await this.saveActiveEditableContent();
        
        switch (action) {
            case '×':
            case 'delete':
                if (confirm('Are you sure you want to delete this component?')) {
                    this.removeComponent(componentId);
                }
                break;
                
            case '⧉':
            case 'duplicate':
                this.duplicateComponent(componentId);
                break;
                
            case '↑':
            case 'moveUp':
                await this.moveComponent(componentId, 'up');
                break;
                
            case '↓':
            case 'moveDown':
                await this.moveComponent(componentId, 'down');
                break;
        }
    }

    /**
     * Move component up or down
     * @param {string} componentId - Component ID
     * @param {string} direction - 'up' or 'down'
     */
    async moveComponent(componentId, direction) {
        // Save any active contenteditable changes before moving
        await this.saveActiveEditableContent();
        
        const components = stateManager.getOrderedComponents();
        const currentIndex = components.findIndex(c => c.id === componentId);
        
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        if (newIndex < 0 || newIndex >= components.length) return;
        
        // Swap positions
        const componentIds = components.map(c => c.id);
        [componentIds[currentIndex], componentIds[newIndex]] = [componentIds[newIndex], componentIds[currentIndex]];
        
        this.reorderComponents(componentIds);
    }

    /**
     * Find setting key for an editable element
     * @param {HTMLElement} element - Editable element
     * @param {string} componentId - Component ID
     * @returns {string|null} Setting key
     */
    findSettingKeyForElement(element, componentId) {
        // Check if element has data-setting attribute
        if (element.hasAttribute('data-setting')) {
            return element.getAttribute('data-setting');
        }
        
        // Try to infer from class name
        const component = stateManager.getComponent(componentId);
        if (!component) return null;
        
        const schema = this.loadedSchemas.get(component.type);
        if (!schema || !schema.settings) return null;
        
        // Look for matching selector
        for (const [key, setting] of Object.entries(schema.settings)) {
            if (setting.previewSelector) {
                const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
                const matches = componentElement.querySelectorAll(setting.previewSelector);
                
                if (Array.from(matches).includes(element)) {
                    return key;
                }
            }
        }
        
        return null;
    }

    /**
     * Save any active contenteditable content
     * This ensures unsaved changes are preserved before actions like move/delete
     */
    saveActiveEditableContent() {
        // Find the currently focused element
        const activeElement = document.activeElement;
        
        // Check if it's a contenteditable element
        if (activeElement && activeElement.contentEditable === 'true') {
            // Trigger blur to save the content
            activeElement.blur();
            
            // Small delay to ensure state is updated
            return new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Also check for any contenteditable with unsaved changes
        const editables = document.querySelectorAll('[contenteditable="true"]');
        editables.forEach(editable => {
            const originalContent = editable.getAttribute('data-original-content');
            if (originalContent !== null && originalContent !== editable.textContent) {
                // Trigger blur to save changes
                editable.blur();
            }
        });
        
        return Promise.resolve();
    }
    
    /**
     * Generate unique component ID
     * @param {string} type - Component type
     * @returns {string} Unique ID
     */
    generateComponentId(type) {
        return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Show notification
     * @param {string} message - Message to show
     * @param {string} type - Notification type ('success', 'error', 'info')
     */
    showNotification(message, type = 'success') {
        // Use history service's toast if available
        if (window.historyService && window.historyService.showToast) {
            window.historyService.showToast(message);
        } else {
            // Fallback to console
            console.log(`[${type}] ${message}`);
        }
    }

    /**
     * Handle state changes
     * @param {Object} state - New state
     */
    onStateChange(state) {
        // Could be used for updating UI based on global state changes
    }

    /**
     * Get component template (legacy support)
     * @deprecated Use renderComponent instead
     */
    getComponentTemplate(componentType) {
        console.warn('getComponentTemplate is deprecated. Use renderComponent instead.');
        return '<div>Legacy template - please update to use renderComponent</div>';
    }
}

// Create singleton instance
let componentManager = null;

// Ensure single initialization
function getComponentManager() {
    if (!componentManager) {
        componentManager = new ComponentManager();
    }
    return componentManager;
}

// Initialize only once when DOM is ready
let initialized = false;
function initializeOnce() {
    if (initialized) return;
    initialized = true;
    
    const manager = getComponentManager();
    manager.init().catch(error => {
        console.error('Component manager initialization failed:', error);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOnce);
} else {
    initializeOnce();
}

// Get the singleton for exports
componentManager = getComponentManager();

// Export functions for backward compatibility
export async function addComponentToZone(componentType, zone) {
    return componentManager.addComponentToZone(componentType, zone);
}

export function getComponentTemplate(componentType) {
    return componentManager.getComponentTemplate(componentType);
}

// Export the manager instance for direct access
export { componentManager };