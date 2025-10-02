/**
 * Base Component Editor Class
 * PHASE 2: Foundation for component-specific content editors
 * 
 * Provides a consistent interface for all component editors
 * Follows checklist: Simple, event-driven, no polling
 * 
 * @version 2.0.0-phase2
 */

class BaseComponentEditor {
    constructor(containerEl, componentId, initialData, onUpdate) {
        this.container = containerEl;
        this.componentId = componentId;
        this.data = initialData || {};
        this.onUpdate = onUpdate;
        this.logger = window.structuredLogger || console;
    }
    
    /**
     * Render the editor UI
     * Must be implemented by child classes
     */
    render() {
        throw new Error('Component editor must implement render() method');
    }
    
    /**
     * Update component data and trigger callbacks
     */
    updateData(newData) {
        this.data = { ...this.data, ...newData };
        
        if (this.onUpdate) {
            this.onUpdate(this.componentId, this.data);
        }
        
        // Dispatch event for other systems
        document.dispatchEvent(new CustomEvent('gmkb:component-content-updated', {
            detail: {
                componentId: this.componentId,
                data: this.data,
                timestamp: Date.now()
            }
        }));
        
        this.logger.info('EDITOR', `Content updated for ${this.componentId}`);
    }
    
    /**
     * Clean up when editor is destroyed
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
    
    /**
     * Get current data
     */
    getData() {
        return this.data;
    }
}

// Export for use
window.BaseComponentEditor = BaseComponentEditor;
