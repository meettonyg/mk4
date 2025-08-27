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
        // ROOT CAUSE FIX: Removed draggedComponent property to eliminate dual data sources
        
        this.logger.info('Section-Component Integration initializing');
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
                
                // ROOT FIX: Handle both camelCase and hyphenated data attributes
                const sectionId = section.dataset.sectionId || section.getAttribute('data-section-id');
                const columnNumber = parseInt(column.dataset.column) || parseInt(column.getAttribute('data-column')) || 1;
                
                // ROOT FIX: Validate section ID before proceeding
                if (!sectionId) {
                    this.logger.error('❌ No section ID found on drop target', {
                        element: section.outerHTML.substring(0, 200),
                        availableDataset: Object.keys(section.dataset),
                        attributes: section.getAttributeNames(),
                        classList: section.className
                    });
                    return;
                }
                
                this.logger.info(`🎯 Drop detected in section: ${sectionId}, column: ${columnNumber}`);
                
                // Handle the drop
                this.handleComponentDropInSection(sectionId, columnNumber, e);
            }
        });
        
        this.logger.info('📦 Drop zones configured for sections');
    }
    
    /**
     * Setup component dragging
     * ROOT FIX: Enhanced to support dragging from main container to sections
     */
    setupComponentDragging() {
        // ROOT FIX: Make ALL components draggable, including those in saved-components-container
        const makeComponentsDraggable = () => {
            const components = document.querySelectorAll('[data-component-id]');
            components.forEach(component => {
                if (!component.hasAttribute('draggable')) {
                    component.setAttribute('draggable', 'true');
                    component.style.cursor = 'move';
                }
            });
        };
        
        // Initial setup
        makeComponentsDraggable();
        
        // Watch for new components via mutation observer
        const observer = new MutationObserver(() => {
            makeComponentsDraggable();
        });
        
        const containers = [
            document.getElementById('saved-components-container'),
            document.getElementById('gmkb-sections-container')
        ].filter(Boolean);
        
        containers.forEach(container => {
            observer.observe(container, { childList: true, subtree: true });
        });
        
        // ROOT CAUSE FIX: Component drag start - properly set data for ALL components
        document.addEventListener('dragstart', (e) => {
            // Robust event target validation - prevent closest() errors
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            
            // ROOT FIX: Check for component by data attribute, not class
            const component = e.target.closest('[data-component-id]');
            if (component) {
                const componentId = component.dataset.componentId;
                const componentType = component.dataset.componentType || '';
                
                // Visual feedback
                component.classList.add('gmkb-component--dragging');
                component.style.opacity = '0.5';
                
                // Set transfer data
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', componentId);
                e.dataTransfer.setData('component-id', componentId);
                e.dataTransfer.setData('component-type', componentType);
                
                // Store in dataset for fallback
                component.dataset.dragStartTime = Date.now();
                
                this.logger.info(`🎯 Started dragging component: ${componentId}`);
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('gmkb:component-drag-start', {
                    detail: { componentId, componentType }
                }));
            }
        });
        
        // ROOT CAUSE FIX: Component drag end - cleanup for ALL components
        document.addEventListener('dragend', (e) => {
            // Robust event target validation
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            
            const component = e.target.closest('[data-component-id]');
            if (component) {
                // Remove visual feedback
                component.classList.remove('gmkb-component--dragging');
                component.style.opacity = '';
                
                // Clean up drag data
                delete component.dataset.dragStartTime;
                
                // Clean up any drag-over classes
                document.querySelectorAll('.gmkb-section__column--drag-over').forEach(col => {
                    col.classList.remove('gmkb-section__column--drag-over');
                });
                
                this.logger.info(`🎯 Finished dragging component: ${component.dataset.componentId}`);
                
                document.dispatchEvent(new CustomEvent('gmkb:component-drag-end', {
                    detail: { componentId: component.dataset.componentId }
                }));
            }
        });
        
        this.logger.info('🎯 Component dragging configured for all components');
    }
    
    /**
     * ROOT CAUSE FIX: Handle component drop in section with single data source
     * Eliminates race condition between dataTransfer and draggedComponent
     */
    async handleComponentDropInSection(sectionId, columnNumber, event) {
        try {
            // ROOT FIX: Additional validation
            if (!sectionId) {
                this.logger.error('❌ handleComponentDropInSection called with undefined sectionId');
                return;
            }
            
            // ROOT CAUSE FIX: Use only HTML5 dataTransfer as single source of truth
            let componentId = event.dataTransfer?.getData('text/plain');
            let componentType = event.dataTransfer?.getData('component-type');
            
            // Fallback to DOM data attributes if dataTransfer fails
            if (!componentId && !componentType) {
                const draggedElement = document.querySelector('.gmkb-component--dragging');
                if (draggedElement) {
                    componentId = draggedElement.dataset.componentId;
                    componentType = draggedElement.dataset.componentType;
                }
            }
            
            if (componentType && !componentId) {
                // This is a new component from library - create atomically
                this.logger.info(`Creating new ${componentType} component in section ${sectionId}`);
                const newComponentId = await this.createComponentInSection(componentType, sectionId, columnNumber);
                this.logger.info(`New component created successfully: ${newComponentId}`);
                return;
            }
            
            if (!componentId) {
                this.logger.warn('No component ID or type found for drop');
                return;
            }
            
            // This is an existing component being moved
            this.logger.info(`Moving existing component ${componentId} to section ${sectionId}`);
            
            // ROOT CAUSE FIX: Use enhanced component manager for atomic move
            if (this.componentManager && this.componentManager.addComponent) {
                // Update component props to reflect new section assignment
                const component = this.componentManager.getComponent(componentId);
                if (component) {
                    // Update component with new section targeting
                    component.props.targetSectionId = sectionId;
                    component.props.targetColumn = columnNumber;
                }
            }
            
            // ROOT FIX: Validate section exists before assignment
            if (!this.sectionLayoutManager) {
                this.logger.error('❌ SectionLayoutManager not available');
                return;
            }
            
            // ROOT FIX: Check if section exists before attempting assignment
            const sectionExists = this.sectionLayoutManager.getSection(sectionId);
            if (!sectionExists) {
                this.logger.error(`❌ Section ${sectionId} does not exist. Available sections:`, 
                    this.sectionLayoutManager.getAllSections().map(s => s.section_id));
                return;
            }
            
            // Assign component to section
            const success = this.sectionLayoutManager.assignComponentToSection(
                componentId,
                sectionId,
                columnNumber
            );
            
            if (success) {
                this.logger.info(`✅ Component ${componentId} successfully assigned to section ${sectionId}, column ${columnNumber}`);
                
                // Move component element to section column
                this.moveComponentToSectionColumn(componentId, sectionId, columnNumber);
                
                // Update state
                this.updateComponentState(componentId, sectionId, columnNumber);
            } else {
                this.logger.error(`❌ Failed to assign component ${componentId} to section ${sectionId}`);
            }
            
        } catch (error) {
            this.logger.error('Component drop handling failed:', error);
            
            // Show user-friendly error message
            if (window.showToast) {
                window.showToast('Failed to add component to section', 'error', 3000);
            }
        }
    }
    
    /**
     * ROOT CAUSE FIX: Create new component atomically in section
     * Uses the enhanced component manager's atomic creation method
     */
    async createComponentInSection(componentType, sectionId, columnNumber) {
        if (!this.componentManager) {
            this.logger.error('❌ Component manager not available');
            throw new Error('Component manager not available');
        }
        
        try {
            this.logger.info(`📦 Creating new ${componentType} component atomically in section ${sectionId}`);
            
            // ROOT CAUSE FIX: Use atomic component creation with section validation
            const componentId = await this.componentManager.addComponent(componentType, {
                targetSectionId: sectionId,
                targetColumn: columnNumber
            });
            
            this.logger.info(`✅ Component ${componentId} created atomically in section ${sectionId}`);
            return componentId;
            
        } catch (error) {
            this.logger.error(`❌ Failed to create component ${componentType} in section ${sectionId}:`, error);
            throw error;
        }
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
        this.logger.debug('Component drag started:', detail);
    }
    
    /**
     * Handle component drag end
     */
    onComponentDragEnd(detail) {
        this.logger.debug('Component drag ended:', detail);
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
            currentlyDragging: document.querySelector('.gmkb-component--dragging')?.dataset.componentId || null,
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