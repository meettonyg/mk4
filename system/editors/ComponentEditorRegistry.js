/**
 * Component Editor Registry
 * PHASE 2: Central registry for component-specific editors
 * 
 * Manages registration and retrieval of custom component editors
 * Follows checklist: Simple, centralized, no redundant logic
 * 
 * @version 2.0.0-phase2
 */

class ComponentEditorRegistry {
    constructor() {
        this.editors = new Map();
        this.logger = window.structuredLogger || console;
        
        this.logger.info('EDITOR_REGISTRY', 'Component Editor Registry initialized');
    }
    
    /**
     * Register a custom editor for a component type
     */
    register(componentType, editorClass) {
        if (!componentType || !editorClass) {
            this.logger.error('EDITOR_REGISTRY', 'Invalid registration - missing type or class');
            return false;
        }
        
        // Verify the editor extends BaseComponentEditor
        if (!editorClass.prototype || typeof editorClass.prototype.render !== 'function') {
            this.logger.error('EDITOR_REGISTRY', `Editor for ${componentType} must have a render() method`);
            return false;
        }
        
        this.editors.set(componentType, editorClass);
        this.logger.info('EDITOR_REGISTRY', `Registered editor for ${componentType}`);
        
        // Dispatch event for systems that need to know
        document.dispatchEvent(new CustomEvent('gmkb:editor-registered', {
            detail: {
                componentType,
                timestamp: Date.now()
            }
        }));
        
        return true;
    }
    
    /**
     * Get editor class for a component type
     */
    getEditor(componentType) {
        return this.editors.get(componentType);
    }
    
    /**
     * Check if a component type has a custom editor
     */
    hasEditor(componentType) {
        return this.editors.has(componentType);
    }
    
    /**
     * Get all registered component types
     */
    getRegisteredTypes() {
        return Array.from(this.editors.keys());
    }
    
    /**
     * Create an editor instance
     */
    async createEditor(componentType, containerEl, componentId, initialData, onUpdate) {
        const EditorClass = this.getEditor(componentType);
        
        if (!EditorClass) {
            this.logger.warn('EDITOR_REGISTRY', `No custom editor registered for ${componentType}`);
            return null;
        }
        
        try {
            const editor = new EditorClass(containerEl, componentId, initialData, onUpdate);
            
            // If the editor extends ComponentLifecycle, use performRender
            if (editor.performRender && typeof editor.performRender === 'function') {
                await editor.performRender();
                this.logger.info('EDITOR_REGISTRY', `Created and rendered lifecycle-compliant editor for ${componentType}`);
            } else if (editor.render && typeof editor.render === 'function') {
                // Fallback for non-lifecycle editors
                await editor.render();
                this.logger.info('EDITOR_REGISTRY', `Created and rendered legacy editor for ${componentType}`);
            }
            
            return editor;
        } catch (error) {
            this.logger.error('EDITOR_REGISTRY', `Failed to create editor for ${componentType}:`, error);
            return null;
        }
    }
}

// Create global instance
window.componentEditorRegistry = new ComponentEditorRegistry();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentEditorRegistry;
}
