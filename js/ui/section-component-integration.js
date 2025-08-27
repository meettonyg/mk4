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
     * Setup drop zones for sections and main preview area
     */
    setupSectionDropZones() {
        // Use event delegation for section drop zones and main preview
        document.addEventListener('dragover', (e) => {
            // Robust event target validation - prevent closest() errors
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            if (!e.target.closest || typeof e.target.closest !== 'function') return;
            
            const section = e.target.closest('.gmkb-section');
            const column = e.target.closest('.gmkb-section__column, .gmkb-section__content');
            const previewContainer = e.target.closest('#media-kit-preview, #saved-components-container, .preview-container');
            
            if (section && column) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                // Add visual feedback
                column.classList.add('gmkb-section__column--drag-over');
            } else if (previewContainer && !section) {
                // ROOT FIX: Also handle drops on main preview container
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                // Add visual feedback to main container
                previewContainer.classList.add('gmkb-preview--drag-over');
            }
        });
        
        document.addEventListener('dragleave', (e) => {
            // Robust event target validation - prevent closest() errors
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            if (!e.target.closest || typeof e.target.closest !== 'function') return;
            
            const column = e.target.closest('.gmkb-section__column, .gmkb-section__content');
            const previewContainer = e.target.closest('#media-kit-preview, #saved-components-container, .preview-container');
            
            if (column) {
                column.classList.remove('gmkb-section__column--drag-over');
            } else if (previewContainer) {
                // ROOT FIX: Remove drag-over state from main container
                previewContainer.classList.remove('gmkb-preview--drag-over');
            }
        });
        
        document.addEventListener('drop', (e) => {
            // Robust event target validation - prevent closest() errors
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            if (!e.target.closest || typeof e.target.closest !== 'function') return;
            
            const section = e.target.closest('.gmkb-section');
            const column = e.target.closest('.gmkb-section__column, .gmkb-section__content');
            const previewContainer = e.target.closest('#media-kit-preview, #saved-components-container, .preview-container');
            
            if (section && column) {
                e.preventDefault();
                column.classList.remove('gmkb-section__column--drag-over');
                
                // ROOT FIX: Enhanced validation inspired by Gemini feedback
                // Validate we have a proper section element
                if (!section.classList.contains('gmkb-section')) {
                    this.logger.warn('⚠️ Drop target does not have gmkb-section class');
                    return;
                }
                
                // ROOT FIX: Handle both camelCase and hyphenated data attributes
                const sectionId = section.dataset.sectionId || section.getAttribute('data-section-id');
                const columnNumber = parseInt(column.dataset.column) || parseInt(column.getAttribute('data-column')) || 1;
                
                // ROOT FIX: Enhanced validation - ensure we have valid section ID and column
                if (!sectionId || sectionId.trim() === '') {
                    this.logger.error('❌ No valid section ID found on drop target', {
                        element: section.outerHTML.substring(0, 200),
                        availableDataset: Object.keys(section.dataset),
                        attributes: section.getAttributeNames(),
                        classList: section.className,
                        sectionId: sectionId
                    });
                    return;
                }
                
                if (isNaN(columnNumber) || columnNumber < 1) {
                    this.logger.warn(`⚠️ Invalid column number (${columnNumber}), defaulting to 1`);
                    columnNumber = 1;
                }
                
                this.logger.info(`🎯 Drop detected in section: ${sectionId}, column: ${columnNumber}`);
                
                // Handle the drop
                this.handleComponentDropInSection(sectionId, columnNumber, e);
            } else if (previewContainer && !section) {
                // ROOT FIX: Handle drops on main preview container (outside sections)
                e.preventDefault();
                previewContainer.classList.remove('gmkb-preview--drag-over');
                
                this.logger.info('🎯 Drop detected in main preview container');
                
                // Handle the drop in main container
                this.handleComponentDropInMainContainer(e);
            }
        });
        
        this.logger.info('📦 Drop zones configured for sections and main preview');
    }
    
    /**
     * Setup component dragging
     * ROOT FIX: Enhanced to support dragging from main container to sections and component library
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
        
        // ROOT FIX: Also make component library items draggable
        const makeComponentLibraryDraggable = () => {
            const libraryItems = document.querySelectorAll('.component-card, .component-item');
            libraryItems.forEach(item => {
                if (!item.hasAttribute('draggable')) {
                    item.setAttribute('draggable', 'true');
                    item.style.cursor = 'move';
                }
            });
        };
        
        // Initial setup
        makeComponentsDraggable();
        makeComponentLibraryDraggable();
        
        // Watch for new components via mutation observer
        const observer = new MutationObserver(() => {
            makeComponentsDraggable();
            makeComponentLibraryDraggable();
        });
        
        const containers = [
            document.getElementById('saved-components-container'),
            document.getElementById('gmkb-sections-container'),
            document.getElementById('component-grid'), // ROOT FIX: Watch component library too
            document.querySelector('.component-library'), // Alternative component library selector
            document.getElementById('component-library-overlay') // Modal content
        ].filter(Boolean);
        
        containers.forEach(container => {
            observer.observe(container, { childList: true, subtree: true });
        });
        
        // ROOT CAUSE FIX: Component drag start - properly set data for ALL components and library items
        document.addEventListener('dragstart', (e) => {
            // Robust event target validation - prevent closest() errors
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            
            // ROOT FIX: Check for component by data attribute, not class
            const component = e.target.closest('[data-component-id]');
            const libraryItem = e.target.closest('.component-card, .component-item');
            
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
            } else if (libraryItem) {
                // ROOT FIX: Handle component library items being dragged
                const componentType = libraryItem.dataset.componentType || libraryItem.dataset.component || '';
                
                if (componentType) {
                    // Visual feedback for library item
                    libraryItem.classList.add('gmkb-component--dragging');
                    libraryItem.style.opacity = '0.5';
                    
                    // Set transfer data for new component creation
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData('text/plain', componentType);
                    e.dataTransfer.setData('component-type', componentType);
                    e.dataTransfer.setData('new-component', 'true');
                    
                    this.logger.info(`🎯 Started dragging library item: ${componentType}`);
                    
                    // Dispatch event
                    document.dispatchEvent(new CustomEvent('gmkb:library-drag-start', {
                        detail: { componentType }
                    }));
                }
            }
        });
        
        // ROOT CAUSE FIX: Component drag end - cleanup for ALL components and library items
        document.addEventListener('dragend', (e) => {
            // Robust event target validation
            if (!e || !e.target) return;
            if (!e.target.nodeType || e.target.nodeType !== Node.ELEMENT_NODE) return;
            
            const component = e.target.closest('[data-component-id]');
            const libraryItem = e.target.closest('.component-card, .component-item');
            
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
            } else if (libraryItem) {
                // Remove visual feedback from library item
                libraryItem.classList.remove('gmkb-component--dragging');
                libraryItem.style.opacity = '';
                
                // Clean up any drag-over classes
                document.querySelectorAll('.gmkb-section__column--drag-over').forEach(col => {
                    col.classList.remove('gmkb-section__column--drag-over');
                });
                
                this.logger.info(`🎯 Finished dragging library item`);
                
                document.dispatchEvent(new CustomEvent('gmkb:library-drag-end', {}));
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
            const isNewComponent = event.dataTransfer?.getData('new-component') === 'true';
            
            // Fallback to DOM data attributes if dataTransfer fails
            if (!componentId && !componentType) {
                const draggedElement = document.querySelector('.gmkb-component--dragging');
                if (draggedElement) {
                    componentId = draggedElement.dataset.componentId;
                    componentType = draggedElement.dataset.componentType;
                }
            }
            
            if ((componentType && !componentId) || isNewComponent) {
                // This is a new component from library - create atomically
                this.logger.info(`Creating new ${componentType} component in section ${sectionId}`);
                const newComponentId = await this.createComponentInSection(componentType, sectionId, columnNumber);
                this.logger.info(`New component created successfully: ${newComponentId}`);
                return;
            }
            
            if (!componentId && !componentType) {
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
            
            // ROOT FIX: Validate section exists before assignment with retry mechanism
            if (!this.sectionLayoutManager) {
                this.logger.error('❌ SectionLayoutManager not available');
                return;
            }
            
            // ROOT CAUSE FIX: Implement section lookup with fallback and retry mechanism
            let sectionExists = this.sectionLayoutManager.getSection(sectionId);
            
            // If section doesn't exist, try to find it by DOM or wait briefly for registration
            if (!sectionExists) {
                this.logger.warn(`⚠️ Section ${sectionId} not found in manager, attempting recovery...`);
                
                // Try to find section in DOM to verify it exists
                const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
                if (sectionElement) {
                    this.logger.info(`🔍 Found section ${sectionId} in DOM, attempting to register it`);
                    
                    // Try to extract section data from DOM and register it
                    const sectionType = sectionElement.dataset.sectionType || 'full_width';
                    
                    // Register section in layout manager if it's missing
                    try {
                        const registeredSection = this.sectionLayoutManager.registerSection(sectionId, sectionType, {
                            section_id: sectionId,
                            section_type: sectionType,
                            created_at: Date.now()
                        });
                        
                        if (registeredSection) {
                            this.logger.info(`✅ Successfully registered section ${sectionId} from DOM`);
                            sectionExists = registeredSection;
                        }
                    } catch (regError) {
                        this.logger.error(`❌ Failed to register section ${sectionId} from DOM:`, regError);
                    }
                }
                
                // Final check after recovery attempt
                if (!sectionExists) {
                    const availableSections = this.sectionLayoutManager.getAllSections().map(s => s.section_id);
                    this.logger.error(`❌ Section ${sectionId} still not found after recovery. Available sections:`, availableSections);
                    
                    // Show user-friendly error message
                    if (window.showToast) {
                        window.showToast(`Section not found. Please try refreshing the page.`, 'error', 5000);
                    }
                    return;
                }
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
                
                // ROOT FIX: Refresh section to ensure proper display
                if (window.sectionRenderer && window.sectionRenderer.refreshSection) {
                    window.sectionRenderer.refreshSection(sectionId);
                }
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
     * ROOT FIX: Handle component drop in main container (outside sections)
     */
    async handleComponentDropInMainContainer(event) {
        try {
            // Get component data from drag event
            let componentId = event.dataTransfer?.getData('text/plain');
            let componentType = event.dataTransfer?.getData('component-type');
            const isNewComponent = event.dataTransfer?.getData('new-component') === 'true';
            
            if ((componentType && !componentId) || isNewComponent) {
                // This is a new component from library - create in main container
                this.logger.info(`Creating new ${componentType} component in main container`);
                
                if (this.componentManager && this.componentManager.addComponent) {
                    const newComponentId = await this.componentManager.addComponent(componentType, {
                        // No section targeting for main container
                        dragDropCreated: true,
                        timestamp: Date.now()
                    });
                    this.logger.info(`New component created successfully: ${newComponentId}`);
                }
                return;
            }
            
            if (componentId) {
                // This is an existing component being moved to main container
                this.logger.info(`Moving existing component ${componentId} to main container`);
                
                // Update component to remove section targeting
                if (this.componentManager && this.componentManager.getComponent) {
                    const component = this.componentManager.getComponent(componentId);
                    if (component && component.props) {
                        // Clear section targeting
                        delete component.props.targetSectionId;
                        delete component.props.targetColumn;
                    }
                }
                
                // Move component element to main container
                this.moveComponentToMainContainer(componentId);
            }
            
        } catch (error) {
            this.logger.error('Component drop in main container failed:', error);
        }
    }
    
    /**
     * Move component element to main container
     */
    moveComponentToMainContainer(componentId) {
        const component = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!component) {
            this.logger.warn(`⚠️ Component element not found: ${componentId}`);
            return;
        }
        
        const mainContainer = document.getElementById('saved-components-container') || 
                             document.getElementById('media-kit-preview') ||
                             document.querySelector('.preview-container');
        
        if (mainContainer) {
            // Move component to main container
            mainContainer.appendChild(component);
            
            this.logger.info(`🔄 Moved component ${componentId} to main container`);
            
            // Update state
            this.updateComponentState(componentId, null, null);
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
        const eventName = sectionId ? 'gmkb:component-moved-to-section' : 'gmkb:component-moved-to-main';
        document.dispatchEvent(new CustomEvent(eventName, {
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