/**
 * Section-Component Integration
 * Handles dragging components into sections and managing component-section relationships
 * 
 * @version 1.0.0
 * @package GMKB/UI
 */

class SectionComponentIntegration {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.sectionLayoutManager = null;
        this.sectionRenderer = null;
        this.componentManager = null;
        this.draggedComponent = null;
        
        this.logger.info('🔗 Section-Component Integration initializing');
        this.initializeIntegration();
    }
    
    initializeIntegration() {
        // Wait for systems to be ready
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // Listen for component drag events
        document.addEventListener('gmkb:component-drag-start', (event) => {
            this.onComponentDragStart(event.detail);
        });
        
        document.addEventListener('gmkb:component-drag-end', (event) => {
            this.onComponentDragEnd(event.detail);
        });
        
        // Try immediate init if systems ready
        if (window.sectionLayoutManager && window.enhancedComponentManager) {
            this.onCoreSystemsReady();
        }
    }
    
    onCoreSystemsReady() {
        this.sectionLayoutManager = window.sectionLayoutManager;
        this.sectionRenderer = window.sectionRenderer;
        this.componentManager = window.enhancedComponentManager;
        
        if (!this.sectionLayoutManager || !this.componentManager) {
            this.logger.warn('⚠️ Required systems not available for section-component integration');
            return;
        }
        
        this.setupSectionDropZones();
        this.setupComponentDragging();
        
        this.logger.info('✅ Section-Component Integration ready');
    }
    
    /**
     * Setup drop zones for sections
     */
    setupSectionDropZones() {
        // Use event delegation for section drop zones
        document.addEventListener('dragover', (e) => {
            // Robust event target validation - prevent closest() errors
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            if (!e.target.closest || typeof e.target.closest !== 'function') return;
            
            const section = e.target.closest('.gmkb-section');
            const column = e.target.closest('.gmkb-section__column, .gmkb-section__content');
            
            if (section && column) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                // Add visual feedback
                column.classList.add('gmkb-section__column--drag-over');
            }
        });
        
        document.addEventListener('dragleave', (e) => {
            // Robust event target validation - prevent closest() errors
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            if (!e.target.closest || typeof e.target.closest !== 'function') return;
            
            const column = e.target.closest('.gmkb-section__column, .gmkb-section__content');
            if (column) {
                column.classList.remove('gmkb-section__column--drag-over');
            }
        });
        
        document.addEventListener('drop', (e) => {
            // Robust event target validation - prevent closest() errors
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            if (!e.target.closest || typeof e.target.closest !== 'function') return;
            
            const section = e.target.closest('.gmkb-section');
            const column = e.target.closest('.gmkb-section__column, .gmkb-section__content');
            
            if (section && column) {
                e.preventDefault();
                column.classList.remove('gmkb-section__column--drag-over');
                
                const sectionId = section.dataset.sectionId;
                const columnNumber = parseInt(column.dataset.column) || 1;
                
                // Handle the drop
                this.handleComponentDropInSection(sectionId, columnNumber, e);
            }
        });
        
        this.logger.info('📦 Drop zones configured for sections');
    }
    
    /**
     * Setup component dragging
     */
    setupComponentDragging() {
        // Make existing components draggable
        document.addEventListener('mouseenter', (e) => {
            // Robust event target validation - prevent closest() errors
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            if (!e.target.closest || typeof e.target.closest !== 'function') return;
            
            const component = e.target.closest('.gmkb-component');
            if (component && !component.hasAttribute('draggable')) {
                component.setAttribute('draggable', 'true');
                
                // Add drag handle if not present
                if (!component.querySelector('.gmkb-component__drag-handle')) {
                    const handle = document.createElement('div');
                    handle.className = 'gmkb-component__drag-handle';
                    handle.innerHTML = '<span class="dashicons dashicons-move"></span>';
                    handle.title = 'Drag to move';
                    component.appendChild(handle);
                }
            }
        }, true);
        
        // Component drag start
        document.addEventListener('dragstart', (e) => {
            // Robust event target validation - prevent closest() errors
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            if (!e.target.closest || typeof e.target.closest !== 'function') return;
            
            const component = e.target.closest('.gmkb-component');
            if (component) {
                this.draggedComponent = {
                    id: component.dataset.componentId,
                    element: component,
                    originalParent: component.parentElement,
                    originalSection: component.closest('.gmkb-section')?.dataset.sectionId
                };
                
                component.classList.add('gmkb-component--dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', component.dataset.componentId);
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('gmkb:component-drag-start', {
                    detail: { componentId: component.dataset.componentId }
                }));
            }
        });
        
        // Component drag end
        document.addEventListener('dragend', (e) => {
            // Robust event target validation - prevent closest() errors
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            if (!e.target.closest || typeof e.target.closest !== 'function') return;
            
            const component = e.target.closest('.gmkb-component');
            if (component) {
                component.classList.remove('gmkb-component--dragging');
                
                // Clean up any drag-over classes
                document.querySelectorAll('.gmkb-section__column--drag-over').forEach(col => {
                    col.classList.remove('gmkb-section__column--drag-over');
                });
                
                document.dispatchEvent(new CustomEvent('gmkb:component-drag-end', {
                    detail: { componentId: component.dataset.componentId }
                }));
                
                this.draggedComponent = null;
            }
        });
        
        this.logger.info('🎯 Component dragging configured');
    }
    
    /**
     * Handle component drop in section
     */
    handleComponentDropInSection(sectionId, columnNumber, event) {
        // Get component ID from drag data or current drag state
        let componentId = event.dataTransfer.getData('text/plain');
        
        if (!componentId && this.draggedComponent) {
            componentId = this.draggedComponent.id;
        }
        
        if (!componentId) {
            // Check if this is a new component from library
            const componentType = event.dataTransfer.getData('component-type');
            if (componentType) {
                // Create new component directly in section
                this.createComponentInSection(componentType, sectionId, columnNumber);
                return;
            }
            
            this.logger.warn('⚠️ No component ID found for drop');
            return;
        }
        
        // Assign component to section
        const success = this.sectionLayoutManager.assignComponentToSection(
            componentId,
            sectionId,
            columnNumber
        );
        
        if (success) {
            this.logger.info(`✅ Component ${componentId} assigned to section ${sectionId}, column ${columnNumber}`);
            
            // Move component element to section column
            this.moveComponentToSectionColumn(componentId, sectionId, columnNumber);
            
            // Update state
            this.updateComponentState(componentId, sectionId, columnNumber);
        } else {
            this.logger.error(`❌ Failed to assign component ${componentId} to section ${sectionId}`);
        }
    }
    
    /**
     * Create new component directly in section
     */
    createComponentInSection(componentType, sectionId, columnNumber) {
        if (!this.componentManager) {
            this.logger.error('❌ Component manager not available');
            return;
        }
        
        // Create component with section assignment
        const componentId = `${componentType}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Add component via component manager
        this.componentManager.addComponent(componentType, {
            targetSectionId: sectionId,
            targetColumn: columnNumber
        });
        
        this.logger.info(`📦 Creating new ${componentType} component in section ${sectionId}`);
    }
    
    /**
     * Move component element to section column
     */
    moveComponentToSectionColumn(componentId, sectionId, columnNumber) {
        const component = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!component) {
            this.logger.warn(`⚠️ Component element not found: ${componentId}`);
            return;
        }
        
        const section = document.querySelector(`[data-section-id="${sectionId}"]`);
        if (!section) {
            this.logger.warn(`⚠️ Section element not found: ${sectionId}`);
            return;
        }
        
        // Find target column
        let targetContainer;
        const sectionInner = section.querySelector('.gmkb-section__inner');
        
        if (sectionInner) {
            const columns = sectionInner.querySelectorAll('.gmkb-section__column');
            if (columns.length > 0) {
                targetContainer = columns[Math.min(columnNumber - 1, columns.length - 1)];
            } else {
                targetContainer = sectionInner.querySelector('.gmkb-section__content') || sectionInner;
            }
        }
        
        if (targetContainer) {
            // Remove empty placeholder if present
            const emptyPlaceholder = targetContainer.querySelector('.gmkb-section__empty');
            if (emptyPlaceholder) {
                emptyPlaceholder.remove();
            }
            
            // Move component
            targetContainer.appendChild(component);
            
            this.logger.info(`🔄 Moved component ${componentId} to section ${sectionId} column ${columnNumber}`);
        }
    }
    
    /**
     * Update component state after moving
     */
    updateComponentState(componentId, sectionId, columnNumber) {
        // Dispatch event for state update
        document.dispatchEvent(new CustomEvent('gmkb:component-moved-to-section', {
            detail: {
                componentId,
                sectionId,
                columnNumber,
                timestamp: Date.now()
            }
        }));
        
        // Trigger auto-save
        if (window.GMKB && window.GMKB.autoSave) {
            window.GMKB.autoSave();
        }
    }
    
    /**
     * Handle component drag start
     */
    onComponentDragStart(detail) {
        this.logger.debug('🎯 Component drag started:', detail);
    }
    
    /**
     * Handle component drag end
     */
    onComponentDragEnd(detail) {
        this.logger.debug('🎯 Component drag ended:', detail);
    }
    
    /**
     * Get components in section
     */
    getComponentsInSection(sectionId) {
        if (!this.sectionLayoutManager) return [];
        
        const section = this.sectionLayoutManager.getSection(sectionId);
        return section ? section.components : [];
    }
    
    /**
     * Debug info
     */
    getDebugInfo() {
        return {
            sectionsAvailable: !!this.sectionLayoutManager,
            componentsAvailable: !!this.componentManager,
            draggedComponent: this.draggedComponent,
            sectionsWithComponents: this.sectionLayoutManager ? 
                this.sectionLayoutManager.getAllSections().map(s => ({
                    id: s.section_id,
                    components: s.components.length
                })) : []
        };
    }
}

// Initialize
window.SectionComponentIntegration = SectionComponentIntegration;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionComponentIntegration = new SectionComponentIntegration();
    });
} else {
    window.sectionComponentIntegration = new SectionComponentIntegration();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionComponentIntegration;
}