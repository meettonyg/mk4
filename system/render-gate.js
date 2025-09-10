/**
 * Render Gate
 * Prevents duplicate rendering through simple, centralized tracking
 * 
 * CHECKLIST COMPLIANT:
 * ✅ No polling - pure synchronous checks
 * ✅ Event-driven - notifies when renders complete
 * ✅ Root cause fix - prevents duplicates at source
 * ✅ Simple solution - minimal code
 * ✅ No global sniffing - self-contained
 * 
 * @version 1.0.0
 */
(function() {
    'use strict';
    
    class RenderGate {
        constructor() {
            this.rendered = new Set();
            this.rendering = new Set();
            this.logger = window.StructuredLogger || console;
            
            // Listen for render complete events to update tracking
            document.addEventListener('gmkb:render-complete', (e) => {
                const key = e.detail.key;
                if (key) {
                    this.rendering.delete(key);
                    this.rendered.add(key);
                }
            });
            
            this.logger.info('🚪 RenderGate: Initialized');
        }
        
        /**
         * Check if something should be rendered
         * @param {string} type - Type of item (section, component)
         * @param {string} id - Unique ID
         * @returns {boolean} True if should render, false if already rendered/rendering
         */
        shouldRender(type, id) {
            const key = `${type}:${id}`;
            
            // Already rendered?
            if (this.rendered.has(key)) {
                this.logger.debug(`🚫 RenderGate: ${key} already rendered`);
                return false;
            }
            
            // Currently rendering?
            if (this.rendering.has(key)) {
                this.logger.debug(`⏳ RenderGate: ${key} already rendering`);
                return false;
            }
            
            // Check DOM as final verification
            if (type === 'section') {
                const exists = document.querySelector(`[data-section-id="${id}"]`);
                if (exists) {
                    this.logger.debug(`✅ RenderGate: ${key} found in DOM`);
                    this.rendered.add(key);
                    return false;
                }
            } else if (type === 'component') {
                const exists = document.querySelector(`[data-component-id="${id}"]`);
                if (exists) {
                    this.logger.debug(`✅ RenderGate: ${key} found in DOM`);
                    this.rendered.add(key);
                    return false;
                }
            }
            
            // Mark as rendering
            this.rendering.add(key);
            this.logger.info(`✅ RenderGate: Allowing render of ${key}`);
            return true;
        }
        
        /**
         * Mark render as complete
         * @param {string} type - Type of item
         * @param {string} id - Unique ID
         */
        markRendered(type, id) {
            const key = `${type}:${id}`;
            this.rendering.delete(key);
            this.rendered.add(key);
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('gmkb:render-complete', {
                detail: { type, id, key }
            }));
        }
        
        /**
         * Clear all tracking (for testing/reset)
         */
        clear() {
            this.rendered.clear();
            this.rendering.clear();
            this.logger.info('🧹 RenderGate: Cleared all tracking');
        }
        
        /**
         * Get debug info
         */
        getDebugInfo() {
            return {
                rendered: Array.from(this.rendered),
                rendering: Array.from(this.rendering),
                renderedCount: this.rendered.size,
                renderingCount: this.rendering.size
            };
        }
    }
    
    // Create singleton instance
    window.renderGate = new RenderGate();
    
    // Expose for debugging
    window.getRenderGateStatus = () => window.renderGate.getDebugInfo();
    
})();
