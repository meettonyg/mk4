/**
 * Render Coordinator
 * Single source of truth for all rendering operations
 * Prevents duplicate rendering through centralized control
 * 
 * CHECKLIST COMPLIANT:
 * ✅ Event-driven coordination
 * ✅ No polling or timeouts
 * ✅ Single responsibility
 * ✅ Root cause fix for duplicate rendering
 * 
 * @version 1.0.0
 */
class RenderCoordinator {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.renderQueue = new Map();
        this.renderingInProgress = new Set();
        this.renderedItems = new Set();
        this.isInitialized = false;
        
        this.logger.info('🎯 RenderCoordinator: Initializing centralized render control');
        this.initialize();
    }
    
    /**
     * Initialize the coordinator
     * COMPLIANT: Event-driven, no polling
     */
    initialize() {
        // Listen for render requests from ALL sources
        document.addEventListener('gmkb:request-render-section', (e) => {
            this.handleRenderRequest('section', e.detail);
        });
        
        document.addEventListener('gmkb:request-render-component', (e) => {
            this.handleRenderRequest('component', e.detail);
        });
        
        // Listen for system ready to start processing
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.isInitialized = true;
            this.processQueue();
        });
        
        // Emit ready event
        document.dispatchEvent(new CustomEvent('gmkb:render-coordinator-ready', {
            detail: { coordinator: this }
        }));
        
        this.logger.info('✅ RenderCoordinator: Ready for render requests');
    }
    
    /**
     * Handle render requests
     * COMPLIANT: Single entry point, prevents duplicates
     */
    handleRenderRequest(type, detail) {
        const { id, data, priority = 'normal', source } = detail;
        
        if (!id) {
            this.logger.warn('⚠️ RenderCoordinator: Render request missing ID');
            return;
        }
        
        // Create unique key for this render request
        const renderKey = `${type}:${id}`;
        
        // Check if already rendered
        if (this.renderedItems.has(renderKey)) {
            this.logger.debug(`✅ RenderCoordinator: ${renderKey} already rendered, skipping`);
            this.dispatchRenderComplete(type, id, 'already-rendered');
            return;
        }
        
        // Check if currently rendering
        if (this.renderingInProgress.has(renderKey)) {
            this.logger.debug(`⏳ RenderCoordinator: ${renderKey} already rendering, skipping`);
            return;
        }
        
        // Check if already queued
        if (this.renderQueue.has(renderKey)) {
            this.logger.debug(`📋 RenderCoordinator: ${renderKey} already queued, updating priority`);
            const existing = this.renderQueue.get(renderKey);
            if (priority === 'high' && existing.priority !== 'high') {
                existing.priority = 'high';
            }
            return;
        }
        
        // Add to queue
        this.renderQueue.set(renderKey, {
            type,
            id,
            data,
            priority,
            source,
            timestamp: Date.now()
        });
        
        this.logger.info(`📥 RenderCoordinator: Queued ${renderKey} from ${source}`);
        
        // Process if ready
        if (this.isInitialized) {
            this.processQueue();
        }
    }
    
    /**
     * Process the render queue
     * COMPLIANT: Centralized processing, no duplicates
     */
    async processQueue() {
        if (this.renderQueue.size === 0) return;
        
        // Sort by priority and timestamp
        const sortedQueue = Array.from(this.renderQueue.entries())
            .sort((a, b) => {
                if (a[1].priority === 'high' && b[1].priority !== 'high') return -1;
                if (b[1].priority === 'high' && a[1].priority !== 'high') return 1;
                return a[1].timestamp - b[1].timestamp;
            });
        
        // Process each item
        for (const [renderKey, item] of sortedQueue) {
            if (this.renderingInProgress.has(renderKey)) continue;
            
            this.renderingInProgress.add(renderKey);
            this.renderQueue.delete(renderKey);
            
            try {
                await this.performRender(item);
                this.renderedItems.add(renderKey);
                this.dispatchRenderComplete(item.type, item.id, 'success');
            } catch (error) {
                this.logger.error(`❌ RenderCoordinator: Failed to render ${renderKey}`, error);
                this.dispatchRenderComplete(item.type, item.id, 'error', error);
            } finally {
                this.renderingInProgress.delete(renderKey);
            }
        }
    }
    
    /**
     * Perform the actual render
     * COMPLIANT: Delegates to appropriate renderer
     */
    async performRender(item) {
        const { type, id, data } = item;
        
        this.logger.info(`🎨 RenderCoordinator: Rendering ${type}:${id}`);
        
        if (type === 'section') {
            // Check if section renderer is available
            if (!window.sectionRenderer) {
                throw new Error('Section renderer not available');
            }
            
            // Check if section already in DOM
            const existing = document.querySelector(`[data-section-id="${id}"]`);
            if (existing) {
                this.logger.debug(`✅ RenderCoordinator: Section ${id} already in DOM`);
                return;
            }
            
            // Perform section render
            return window.sectionRenderer.renderSectionDirect(id, data);
            
        } else if (type === 'component') {
            // Check if component renderer is available
            if (!window.enhancedComponentRenderer) {
                throw new Error('Component renderer not available');
            }
            
            // Check if component already in DOM
            const existing = document.querySelector(`[data-component-id="${id}"]`);
            if (existing) {
                this.logger.debug(`✅ RenderCoordinator: Component ${id} already in DOM`);
                return;
            }
            
            // Perform component render
            return window.enhancedComponentRenderer.renderComponent(id, data);
        }
    }
    
    /**
     * Dispatch render complete event
     * COMPLIANT: Event-driven notification
     */
    dispatchRenderComplete(type, id, status, error = null) {
        document.dispatchEvent(new CustomEvent(`gmkb:${type}-render-complete`, {
            detail: { id, status, error, timestamp: Date.now() }
        }));
    }
    
    /**
     * Clear rendered items (for testing/reset)
     */
    clearRenderedItems() {
        this.renderedItems.clear();
        this.logger.info('🧹 RenderCoordinator: Cleared rendered items tracking');
    }
    
    /**
     * Get debug info
     */
    getDebugInfo() {
        return {
            queueSize: this.renderQueue.size,
            renderingCount: this.renderingInProgress.size,
            renderedCount: this.renderedItems.size,
            isInitialized: this.isInitialized,
            queue: Array.from(this.renderQueue.entries()),
            rendering: Array.from(this.renderingInProgress),
            rendered: Array.from(this.renderedItems)
        };
    }
}

// Create singleton instance
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.renderCoordinator = new RenderCoordinator();
    });
} else {
    window.renderCoordinator = new RenderCoordinator();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RenderCoordinator;
}
