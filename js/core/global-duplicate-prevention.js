/**
 * @file global-duplicate-prevention.js
 * @description ROOT FIX: Global system to prevent and clean component duplicates
 * 
 * This module provides a global safety net to ensure no component
 * ever has duplicate DOM elements
 */

(function() {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    class GlobalDuplicatePrevention {
        constructor() {
            this.isActive = false;
            this.checkInterval = null;
            this.lastCheckTime = 0;
            this.duplicatesFixed = 0;
            
            // Auto-start prevention
            this.start();
        }
        
        start() {
            if (this.isActive) return;
            
            this.isActive = true;
            
            // Initial check after DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.performCheck());
            } else {
                setTimeout(() => this.performCheck(), 100);
            }
            
            // Periodic checks every 2 seconds
            this.checkInterval = setInterval(() => this.performCheck(), 2000);
            
            // Listen for component render events
            document.addEventListener('gmkb:component-rendered', () => {
                setTimeout(() => this.performCheck(), 50);
            });
            
            document.addEventListener('gmkb:batch-render-completed', () => {
                setTimeout(() => this.performCheck(), 100);
            });
            
            logger.info('DUPLICATE_PREVENTION', 'Global duplicate prevention started');
        }
        
        stop() {
            if (!this.isActive) return;
            
            this.isActive = false;
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
                this.checkInterval = null;
            }
            
            logger.info('DUPLICATE_PREVENTION', 'Global duplicate prevention stopped');
        }
        
        performCheck() {
            const now = Date.now();
            
            // Don't check too frequently
            if (now - this.lastCheckTime < 500) return;
            
            this.lastCheckTime = now;
            
            // Find all components
            const componentMap = new Map();
            const allComponents = document.querySelectorAll('[data-component-id]');
            
            // Group by ID
            allComponents.forEach(element => {
                const id = element.getAttribute('data-component-id');
                if (id) {
                    if (!componentMap.has(id)) {
                        componentMap.set(id, []);
                    }
                    componentMap.get(id).push(element);
                }
            });
            
            // Fix duplicates
            let fixedCount = 0;
            componentMap.forEach((elements, id) => {
                if (elements.length > 1) {
                    logger.warn('DUPLICATE_PREVENTION', `Found ${elements.length} instances of component ${id}`);
                    
                    // Determine which element to keep
                    // Priority: 1) Has controls, 2) In correct container, 3) First element
                    let keepElement = null;
                    let keepScore = -1;
                    
                    elements.forEach(el => {
                        let score = 0;
                        
                        // Check for controls
                        if (el.querySelector('.component-controls--dynamic')) {
                            score += 10;
                        }
                        
                        // Check container
                        const container = el.closest('#saved-components-container, #media-kit-preview');
                        if (container) {
                            score += 5;
                        }
                        
                        // Check if it has content
                        if (el.innerHTML.length > 50) {
                            score += 3;
                        }
                        
                        // Check render time (prefer newer)
                        const renderTime = parseInt(el.getAttribute('data-render-time') || '0');
                        if (renderTime > 0) {
                            score += 1;
                        }
                        
                        if (score > keepScore) {
                            keepScore = score;
                            keepElement = el;
                        }
                    });
                    
                    // Remove all except the keeper
                    elements.forEach(el => {
                        if (el !== keepElement) {
                            el.remove();
                            fixedCount++;
                            this.duplicatesFixed++;
                        }
                    });
                    
                    logger.info('DUPLICATE_PREVENTION', `Kept best instance of ${id} (score: ${keepScore})`);
                }
            });
            
            if (fixedCount > 0) {
                logger.info('DUPLICATE_PREVENTION', `Fixed ${fixedCount} duplicates in this check (total: ${this.duplicatesFixed})`);
            }
        }
        
        getStats() {
            return {
                isActive: this.isActive,
                duplicatesFixed: this.duplicatesFixed,
                lastCheckTime: this.lastCheckTime
            };
        }
    }
    
    // Create and expose globally
    window.globalDuplicatePrevention = new GlobalDuplicatePrevention();
    
    // Convenience functions
    window.stopDuplicatePrevention = () => window.globalDuplicatePrevention.stop();
    window.startDuplicatePrevention = () => window.globalDuplicatePrevention.start();
    window.checkForDuplicates = () => window.globalDuplicatePrevention.performCheck();
    window.getDuplicateStats = () => window.globalDuplicatePrevention.getStats();
    
    logger.info('DUPLICATE_PREVENTION', '✅ Global duplicate prevention system loaded');
    
})();
