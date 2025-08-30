/**
 * Section Renderer
 * Phase 3: Section Layer System - Visual Rendering
 * 
 * ROOT FIX: Missing renderer component that actually creates DOM elements for sections
 * This was the root cause of sections not appearing visually
 * 
 * @version 3.0.0-phase3-renderer
 * @package GMKB/System
 */

class SectionRenderer {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.sectionLayoutManager = null;
        this.componentRenderer = null;
        this.renderedSections = new Set();
        this.containerElement = null;
        
        this.logger.info('🎨 PHASE 3: SectionRenderer initializing');
        this.initializeRenderer();
    }
    
    /**
     * Initialize the section renderer
     * Following checklist: Event-Driven Initialization, Dependency-Awareness
     */
    initializeRenderer() {
        // Wait for core systems to be ready
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // Listen for section events
        document.addEventListener('gmkb:section-registered', (event) => {
            this.onSectionRegistered(event.detail);
        });
        
        document.addEventListener('gmkb:section-updated', (event) => {
            this.onSectionUpdated(event.detail);
        });
        
        document.addEventListener('gmkb:section-removed', (event) => {
            this.onSectionRemoved(event.detail);
        });
        
        document.addEventListener('gmkb:sections-reordered', (event) => {
            this.onSectionsReordered(event.detail);
        });
        
        // ROOT FIX: Also try immediate initialization if systems are already ready
        if (window.sectionLayoutManager && window.enhancedComponentRenderer) {
            this.onCoreSystemsReady();
        }
        
        this.logger.info('✅ PHASE 3: SectionRenderer initialized');
    }
    
    /**
     * Handle core systems ready event
     * Following checklist: Dependency-Awareness, No Global Object Sniffing
     */
    onCoreSystemsReady() {
        this.sectionLayoutManager = window.sectionLayoutManager;
        this.componentRenderer = window.enhancedComponentRenderer;
        
        // ROOT FIX: Ensure DOM is ready before looking for container
        const tryFindContainer = () => {
            this.containerElement = this.findContainerElement();
            
            if (!this.containerElement) {
                // Try again after a short delay if DOM not ready
                if (this.containerRetries < 5) {
                    this.containerRetries++;
                    this.logger.warn(`⏳ PHASE 3: Container not found, retry ${this.containerRetries}/5`);
                    setTimeout(tryFindContainer, 100);
                } else {
                    this.logger.error('❌ PHASE 3: No container element found for sections after retries');
                }
                return;
            }
            
            this.logger.info('🎯 PHASE 3: Section renderer ready - container found:', {
                containerId: this.containerElement.id,
                containerClass: this.containerElement.className,
                parent: this.containerElement.parentElement?.id
            });
            
            // Render any existing sections
            this.renderExistingSections();
        };
        
        // Start looking for container
        this.containerRetries = 0;
        tryFindContainer();
    }
    
    /**
     * Find the container element for sections
     * Following checklist: Root Cause Fix
     */
    findContainerElement() {
        // ROOT FIX: Look for the container that exists in the PHP template
        let container = document.getElementById('gmkb-sections-container');
        
        if (!container) {
            // Try alternate selectors
            container = document.querySelector('.gmkb-sections-container');
        }
        
        if (!container) {
            // Fall back to saved components container
            const savedComponentsContainer = document.getElementById('saved-components-container');
            if (savedComponentsContainer) {
                // Find or create sections container within saved components container
                container = savedComponentsContainer.querySelector('#gmkb-sections-container');
                
                if (!container) {
                    // The container should exist from PHP template, but create if missing
                    container = document.createElement('div');
                    container.id = 'gmkb-sections-container';
                    container.className = 'gmkb-sections-container';
                    savedComponentsContainer.appendChild(container);
                    
                    this.logger.info('📦 PHASE 3: Created sections container in saved-components-container');
                }
            }
        }
        
        if (!container) {
            // Last resort: create in media kit preview
            const mediaKitPreview = document.getElementById('media-kit-preview');
            if (mediaKitPreview) {
                container = document.createElement('div');
                container.id = 'gmkb-sections-container';
                container.className = 'gmkb-sections-container';
                mediaKitPreview.appendChild(container);
                
                this.logger.info('📦 PHASE 3: Created sections container in media-kit-preview');
            }
        }
        
        return container;
    }
    
    /**
     * Render existing sections from state
     * Following checklist: Centralized State, Schema Compliance
     */
    renderExistingSections() {
        if (!this.sectionLayoutManager) return;
        
        const sections = this.sectionLayoutManager.getSectionsInOrder();
        
        if (sections.length > 0) {
            this.logger.info(`📐 PHASE 3: Rendering ${sections.length} existing sections`);
            sections.forEach(section => {
                this.renderSection(section);
            });
        } else {
            this.logger.info('📐 PHASE 3: No existing sections to render');
        }
    }
    
    /**
     * Handle section registered event
     * Following checklist: Event-Driven, Real-time Updates, Root Cause Fix
     */
    onSectionRegistered(detail) {
        const { sectionId, configuration } = detail;
        
        this.logger.info(`📐 PHASE 3: Rendering newly registered section ${sectionId}`);
        
        // ROOT CAUSE FIX: Always use section ID for consistency
        // renderSection will fetch the proper section object internally
        this.renderSection(sectionId);
        
        // ROOT CAUSE FIX: Ensure section is properly registered with drag-drop system
        // Small delay to ensure DOM is ready for drag-drop integration
        setTimeout(() => {
            if (window.sectionComponentIntegration) {
                this.logger.debug(`🔗 PHASE 3: Section ${sectionId} ready for drag-drop integration`);
            }
        }, 100);
    }
    
    /**
     * Render a section to DOM
     * Following checklist: DOM Manipulation, Visual Consistency, Root Cause Fix
     */
    renderSection(sectionOrId) {
        if (!this.containerElement) {
            this.logger.error('❌ PHASE 3: Cannot render section - no container element');
            return;
        }
        
        // ROOT CAUSE FIX: Handle both section object and section ID
        let section = sectionOrId;
        
        // If a string ID was passed, fetch the actual section object
        if (typeof sectionOrId === 'string') {
            if (this.sectionLayoutManager) {
                section = this.sectionLayoutManager.getSection(sectionOrId);
                if (!section) {
                    this.logger.error(`❌ PHASE 3: Section not found: ${sectionOrId}`);
                    return;
                }
            } else {
                this.logger.error('❌ PHASE 3: Cannot fetch section - SectionLayoutManager not available');
                return;
            }
        }
        
        // Validate section object
        if (!section || typeof section !== 'object') {
            this.logger.error('❌ PHASE 3: Invalid section parameter', sectionOrId);
            return;
        }
        
        // ROOT FIX: Ensure containers are visible when rendering sections
        this.ensureContainersVisible();
        
        // Check if section already rendered
        if (this.renderedSections.has(section.section_id)) {
            this.logger.debug(`🔄 PHASE 3: Section ${section.section_id} already rendered, updating`);
            this.updateSectionElement(section);
            return;
        }
        
        // Create section element
        const sectionElement = this.createSectionElement(section);
        
        if (!sectionElement) {
            this.logger.error(`❌ PHASE 3: Failed to create section element for ${section.section_id}`);
            return;
        }
        
        // Add to container
        this.containerElement.appendChild(sectionElement);
        
        // Track rendered section
        this.renderedSections.add(section.section_id);
        
        // Apply CSS styles
        this.applySectionStyles(sectionElement, section);
        
        // Render components in this section
        this.renderSectionComponents(sectionElement, section);
        
        this.logger.info(`✅ PHASE 3: Section ${section.section_id} rendered successfully`);
        
        // Dispatch rendered event
        this.dispatchSectionEvent('gmkb:section-rendered', {
            sectionId: section.section_id,
            element: sectionElement
        });
    }
    
    /**
     * Create section DOM element
     * Following checklist: DOM Creation, Semantic HTML, Graceful Failure
     */
    createSectionElement(section) {
        // ROOT CAUSE FIX: Validate section structure before processing
        if (!section || !section.section_id) {
            this.logger.error('❌ PHASE 3: Invalid section object - missing required properties', section);
            return null;
        }
        
        // ROOT CAUSE FIX: Ensure section has proper structure with defaults
        if (!section.layout) {
            this.logger.warn(`⚠️ PHASE 3: Section ${section.section_id} missing layout - applying defaults`);
            
            // Get defaults from SectionLayoutManager if available
            const sectionType = section.section_type || 'full_width';
            if (this.sectionLayoutManager) {
                const defaults = this.sectionLayoutManager.getDefaultSectionConfiguration(sectionType);
                section.layout = defaults.layout || { columns: 1 };
                section.section_options = section.section_options || defaults.section_options || {};
                section.responsive = section.responsive || defaults.responsive || {};
            } else {
                // Fallback minimal defaults
                section.layout = { columns: 1 };
                section.section_options = section.section_options || {};
                section.responsive = section.responsive || {};
            }
        }
        
        const sectionElement = document.createElement('section');
        
        // Set identifiers
        sectionElement.id = `section-${section.section_id}`;
        sectionElement.dataset.sectionId = section.section_id;
        sectionElement.dataset.sectionType = section.section_type || 'full_width';
        
        // Add classes
        sectionElement.className = [
            'gmkb-section',
            `gmkb-section--${section.section_type || 'full_width'}`,
            section.section_options?.custom_class || ''
        ].filter(Boolean).join(' ');
        
        // Create inner container for layout
        const innerContainer = document.createElement('div');
        innerContainer.className = 'gmkb-section__inner';
        
        // Handle column layouts - with defensive check
        const columnCount = section.layout?.columns || 1;
        if (columnCount > 1) {
            for (let i = 1; i <= columnCount; i++) {
                const column = document.createElement('div');
                column.className = `gmkb-section__column gmkb-section__column--${i}`;
                column.dataset.column = i;
                innerContainer.appendChild(column);
            }
        } else {
            // Single column or custom layout
            innerContainer.classList.add('gmkb-section__content');
        }
        
        sectionElement.appendChild(innerContainer);
        
        // Add section controls (edit, remove, etc.)
        this.addSectionControls(sectionElement, section);
        
        return sectionElement;
    }
    
    /**
     * Add interactive controls to section
     * Following checklist: User Experience, Interactivity
     */
    addSectionControls(sectionElement, section) {
        const controls = document.createElement('div');
        controls.className = 'gmkb-section__controls';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'gmkb-section__control gmkb-section__control--edit';
        editBtn.innerHTML = '<span class="dashicons dashicons-edit"></span>';
        editBtn.title = 'Edit Section';
        editBtn.addEventListener('click', () => {
            this.handleSectionEdit(section.section_id);
        });
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'gmkb-section__control gmkb-section__control--remove';
        removeBtn.innerHTML = '<span class="dashicons dashicons-trash"></span>';
        removeBtn.title = 'Remove Section';
        removeBtn.addEventListener('click', () => {
            this.handleSectionRemove(section.section_id);
        });
        
        // Move handle
        const moveHandle = document.createElement('div');
        moveHandle.className = 'gmkb-section__control gmkb-section__control--move';
        moveHandle.innerHTML = '<span class="dashicons dashicons-move"></span>';
        moveHandle.title = 'Drag to Reorder';
        
        controls.appendChild(editBtn);
        controls.appendChild(removeBtn);
        controls.appendChild(moveHandle);
        
        sectionElement.appendChild(controls);
    }
    
    /**
     * Apply CSS styles to section
     * Following checklist: Visual Consistency, Responsive Design
     */
    applySectionStyles(sectionElement, section) {
        if (!this.sectionLayoutManager) return;
        
        // Generate and apply CSS
        const css = this.sectionLayoutManager.generateSectionCSS(section.section_id);
        
        if (css) {
            const innerElement = sectionElement.querySelector('.gmkb-section__inner');
            if (innerElement) {
                innerElement.style.cssText = css;
            }
        }
        
        // Add responsive classes
        this.addResponsiveClasses(sectionElement, section);
    }
    
    /**
     * Add responsive classes for breakpoints
     * Following checklist: Responsive Design, Mobile-First
     */
    addResponsiveClasses(sectionElement, section) {
        const responsive = section.responsive || {};
        
        // Add data attributes for responsive behavior
        if (responsive.mobile) {
            sectionElement.dataset.mobileColumns = responsive.mobile.columns || '';
        }
        
        if (responsive.tablet) {
            sectionElement.dataset.tabletColumns = responsive.tablet.columns || '';
        }
    }
    
    /**
     * Render components within a section
     * Following checklist: Component Integration, Layout Management
     */
    renderSectionComponents(sectionElement, section) {
        if (!section.components || section.components.length === 0) {
            // Add placeholder for empty sections
            this.addEmptySectionPlaceholder(sectionElement);
            return;
        }
        
        section.components.forEach(componentAssignment => {
            const { component_id, column } = componentAssignment;
            
            // Find target container based on layout
            let targetContainer;
            
            if (section.layout.columns > 1) {
                targetContainer = sectionElement.querySelector(`.gmkb-section__column[data-column="${column}"]`);
            } else {
                targetContainer = sectionElement.querySelector('.gmkb-section__content');
            }
            
            if (targetContainer) {
                // Move or render component in this section
                this.moveComponentToSection(component_id, targetContainer);
            }
        });
    }
    
    /**
     * Move component to section container
     * Following checklist: DOM Manipulation, Component Management
     */
    moveComponentToSection(componentId, targetContainer) {
        // Find existing component element
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        
        if (componentElement) {
            // Move existing component
            targetContainer.appendChild(componentElement);
            this.logger.debug(`🔄 PHASE 3: Moved component ${componentId} to section`);
        } else {
            // Component not yet rendered, add placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'gmkb-component-placeholder';
            placeholder.dataset.componentId = componentId;
            placeholder.textContent = `Component: ${componentId}`;
            targetContainer.appendChild(placeholder);
            
            this.logger.debug(`📍 PHASE 3: Added placeholder for component ${componentId}`);
        }
    }
    
    /**
     * Add placeholder for empty sections
     * Following checklist: User Experience, Visual Feedback, ROOT FIX: Click functionality
     */
    addEmptySectionPlaceholder(sectionElement) {
        const innerElement = sectionElement.querySelector('.gmkb-section__inner, .gmkb-section__content');
        
        if (innerElement && !innerElement.querySelector('.gmkb-section__empty')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'gmkb-section__empty';
            placeholder.innerHTML = `
                <div class="gmkb-section__empty-icon">
                    <span class="dashicons dashicons-plus-alt2"></span>
                </div>
                <div class="gmkb-section__empty-text">
                    Drop components here or click to add
                </div>
            `;
            
            // ROOT FIX: Make clickable to add components via modal
            placeholder.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleAddComponentToSection(sectionElement.dataset.sectionId);
            });
            
            // ROOT FIX: Add cursor pointer for click affordance
            placeholder.style.cursor = 'pointer';
            
            innerElement.appendChild(placeholder);
            
            this.logger.debug('PHASE 3: Added clickable placeholder to section');
        }
    }
    
    /**
     * Update existing section element
     * Following checklist: DOM Updates, Performance
     */
    updateSectionElement(section) {
        const sectionElement = document.getElementById(`section-${section.section_id}`);
        
        if (!sectionElement) {
            // Section not rendered yet, render it
            this.renderSection(section);
            return;
        }
        
        // Update styles
        this.applySectionStyles(sectionElement, section);
        
        // Update components
        const innerElement = sectionElement.querySelector('.gmkb-section__inner');
        if (innerElement) {
            // Clear and re-render components
            innerElement.querySelectorAll('.gmkb-section__column, .gmkb-section__content').forEach(col => {
                col.innerHTML = '';
            });
            
            this.renderSectionComponents(sectionElement, section);
        }
        
        this.logger.debug(`🔄 PHASE 3: Updated section ${section.section_id}`);
    }
    
    /**
     * Handle section updated event
     * Following checklist: Event-Driven Updates, Real-time Sync
     */
    onSectionUpdated(detail) {
        const { sectionId, section } = detail;
        this.updateSectionElement(section);
    }
    
    /**
     * Handle section removed event
     * Following checklist: DOM Cleanup, Memory Management
     */
    onSectionRemoved(detail) {
        const { sectionId } = detail;
        
        const sectionElement = document.getElementById(`section-${sectionId}`);
        if (sectionElement) {
            // Move components back to unassigned area
            const components = sectionElement.querySelectorAll('[data-component-id]');
            components.forEach(comp => {
                // Move to temporary holding area or delete
                const holdingArea = document.getElementById('unassigned-components');
                if (holdingArea) {
                    holdingArea.appendChild(comp);
                }
            });
            
            // Remove section element
            sectionElement.remove();
            
            // Update tracking
            this.renderedSections.delete(sectionId);
            
            this.logger.info(`🗑️ PHASE 3: Removed section ${sectionId} from DOM`);
        }
    }
    
    /**
     * Handle sections reordered event
     * Following checklist: DOM Reordering, Visual Consistency
     */
    onSectionsReordered(detail) {
        const { newOrder } = detail;
        
        if (!this.containerElement) return;
        
        // Reorder DOM elements to match new order
        newOrder.forEach((sectionId, index) => {
            const sectionElement = document.getElementById(`section-${sectionId}`);
            if (sectionElement) {
                this.containerElement.appendChild(sectionElement);
            }
        });
        
        this.logger.info(`🔄 PHASE 3: Reordered ${newOrder.length} sections in DOM`);
    }
    
    /**
     * Handle section edit
     * Following checklist: User Interaction, Modal Management
     */
    handleSectionEdit(sectionId) {
        this.logger.info(`✏️ PHASE 3: Editing section ${sectionId}`);
        
        // Dispatch event for section editor
        this.dispatchSectionEvent('gmkb:section-edit-requested', {
            sectionId
        });
    }
    
    /**
     * Handle section remove
     * Following checklist: User Confirmation, Safe Deletion
     */
    handleSectionRemove(sectionId) {
        if (confirm('Are you sure you want to remove this section?')) {
            if (this.sectionLayoutManager) {
                this.sectionLayoutManager.removeSection(sectionId);
            }
        }
    }
    
    /**
     * Handle add component to section
     * Following checklist: Component Management, User Experience, ROOT FIX: Use modal system
     */
    handleAddComponentToSection(sectionId) {
        this.logger.info(`➕ PHASE 3: Adding component to section ${sectionId}`);
        
        // ROOT FIX: Open component library modal with section targeting
        if (window.modalBase && window.modalBase.openModal) {
            // Store the target section ID for the modal
            window.targetSectionForComponent = sectionId;
            window.modalBase.openModal('component-library');
            this.logger.info(`🎨 PHASE 3: Opened component library for section ${sectionId}`);
        } else if (window.enhancedComponentManager) {
            // Fallback: Add a default component directly
            const availableTypes = ['hero', 'biography', 'topics', 'contact'];
            const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            
            window.enhancedComponentManager.addComponent(randomType, {
                targetSectionId: sectionId,
                targetColumn: 1,
                clickToAdd: true
            });
            
            this.logger.info(`🎲 PHASE 3: Added random ${randomType} component to section ${sectionId}`);
        } else {
            // Last resort: dispatch event
            this.dispatchSectionEvent('gmkb:add-component-to-section', {
                sectionId
            });
        }
    }
    
    /**
     * Dispatch section-related events
     * Following checklist: Event-Driven, Documentation
     */
    dispatchSectionEvent(eventType, detail) {
        const event = new CustomEvent(eventType, {
            detail: {
                ...detail,
                timestamp: Date.now(),
                source: 'SectionRenderer'
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Render sections - PUBLIC API METHOD
     * @param {Array} sections - Optional array of sections to render
     */
    renderSections(sections = null) {
        if (sections && Array.isArray(sections)) {
            // Render specific sections
            sections.forEach(section => {
                this.renderSection(section);
            });
        } else {
            // Render all sections
            this.renderAllSections();
        }
    }
    
    /**
     * Render all sections (utility method)
     * Following checklist: Batch Operations, Performance
     */
    renderAllSections() {
        this.logger.info('🎨 PHASE 3: Rendering all sections');
        
        // Clear container
        if (this.containerElement) {
            this.containerElement.innerHTML = '';
            this.renderedSections.clear();
        }
        
        // Render all sections
        this.renderExistingSections();
    }
    
    /**
     * Auto-create sections for existing components
     * Following checklist: Migration, Backward Compatibility
     */
    autoCreateSectionsForExistingComponents() {
        if (!window.enhancedStateManager || !this.sectionLayoutManager) {
            this.logger.warn('⚠️ PHASE 3: Cannot auto-create sections - dependencies not ready');
            return;
        }
        
        const state = window.enhancedStateManager.getState();
        const components = Object.values(state.components || {});
        
        if (components.length > 0 && (!state.sections || state.sections.length === 0)) {
            this.logger.info(`🔧 PHASE 3: Auto-creating sections for ${components.length} existing components`);
            
            // Create a default section
            const defaultSectionId = `section_default_${Date.now()}`;
            const defaultSection = this.sectionLayoutManager.registerSection(
                defaultSectionId, 
                'full_width'
            );
            
            // Assign all components to this section
            components.forEach(component => {
                this.sectionLayoutManager.assignComponentToSection(
                    component.id, 
                    defaultSectionId
                );
            });
            
            this.logger.info(`✅ PHASE 3: Created default section with ${components.length} components`);
        }
    }
    
    /**
     * ROOT FIX: Refresh section to properly display components
     * This ensures components added via the component library modal are visible
     * @param {string} sectionId - Section ID to refresh
     */
    refreshSection(sectionId) {
        if (!sectionId) {
            this.logger.warn('⚠️ PHASE 3: Cannot refresh section - no sectionId provided');
            return;
        }
        
        this.logger.info(`🔄 PHASE 3: Refreshing section ${sectionId}`);
        
        // Get the section data
        if (!this.sectionLayoutManager) {
            this.logger.error('❌ PHASE 3: Cannot refresh - SectionLayoutManager not available');
            return;
        }
        
        const section = this.sectionLayoutManager.getSection(sectionId);
        if (!section) {
            this.logger.error(`❌ PHASE 3: Section ${sectionId} not found for refresh`);
            return;
        }
        
        // Find the section element in DOM
        const sectionElement = document.getElementById(`section-${sectionId}`) || 
                              document.querySelector(`[data-section-id="${sectionId}"]`);
        
        if (!sectionElement) {
            this.logger.warn(`⚠️ PHASE 3: Section element not found in DOM, re-rendering section ${sectionId}`);
            // Section not in DOM, render it fresh
            this.renderSection(section);
            return;
        }
        
        // ROOT FIX: Clear and re-render components in the section
        const innerElement = sectionElement.querySelector('.gmkb-section__inner');
        if (!innerElement) {
            this.logger.warn(`⚠️ PHASE 3: No inner element in section ${sectionId}`);
            return;
        }
        
        // Get all columns or content area
        const columns = innerElement.querySelectorAll('.gmkb-section__column');
        const contentArea = innerElement.querySelector('.gmkb-section__content');
        
        // ROOT FIX: Remove empty placeholders if components exist
        if (section.components && section.components.length > 0) {
            const emptyPlaceholders = innerElement.querySelectorAll('.gmkb-section__empty');
            emptyPlaceholders.forEach(placeholder => placeholder.remove());
        }
        
        // ROOT FIX: Move any orphaned components to their correct positions
        if (section.components && section.components.length > 0) {
            section.components.forEach(componentAssignment => {
                const { component_id, column } = componentAssignment;
                
                // Find the component element
                const componentElement = document.querySelector(`[data-component-id="${component_id}"]`);
                
                if (componentElement) {
                    // Determine target container based on layout
                    let targetContainer;
                    
                    if (columns.length > 0) {
                        // Multi-column layout
                        const targetColumn = Math.min(column || 1, columns.length) - 1;
                        targetContainer = columns[targetColumn];
                    } else if (contentArea) {
                        // Single column layout
                        targetContainer = contentArea;
                    } else {
                        // Fallback to inner element
                        targetContainer = innerElement;
                    }
                    
                    // Move component if it's not already in the correct container
                    if (componentElement.parentElement !== targetContainer) {
                        targetContainer.appendChild(componentElement);
                        this.logger.debug(`🔄 PHASE 3: Moved component ${component_id} to correct position in section ${sectionId}`);
                    }
                }
            });
        } else {
            // No components, ensure placeholder is shown
            this.addEmptySectionPlaceholder(sectionElement);
        }
        
        // Update styles
        this.applySectionStyles(sectionElement, section);
        
        this.logger.info(`✅ PHASE 3: Section ${sectionId} refreshed successfully`);
        
        // Dispatch refresh event
        this.dispatchSectionEvent('gmkb:section-refreshed', {
            sectionId,
            componentCount: section.components?.length || 0
        });
    }
    
    /**
     * ROOT FIX: Ensure all necessary containers are visible for sections
     */
    ensureContainersVisible() {
        // Show the main saved components container
        const savedComponentsContainer = document.getElementById('saved-components-container');
        if (savedComponentsContainer && savedComponentsContainer.style.display === 'none') {
            savedComponentsContainer.style.display = 'block';
            this.logger.info('📦 PHASE 3: Made saved-components-container visible for sections');
        }
        
        // Show the sections container (this.containerElement)
        if (this.containerElement && this.containerElement.style.display === 'none') {
            this.containerElement.style.display = 'block';
            this.logger.info('📦 PHASE 3: Made sections container visible');
        }
        
        // Show the main preview container
        const previewContainer = document.getElementById('media-kit-preview');
        if (previewContainer && previewContainer.style.display === 'none') {
            previewContainer.style.display = 'block';
            this.logger.info('📦 PHASE 3: Made media-kit-preview visible');
        }
        
        // Hide empty state if it exists
        const emptyState = document.getElementById('empty-state');
        if (emptyState && emptyState.style.display !== 'none') {
            emptyState.style.display = 'none';
            this.logger.info('🚫 PHASE 3: Hidden empty state for sections');
        }
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            containerElement: this.containerElement?.id || 'none',
            renderedSections: Array.from(this.renderedSections),
            renderedSectionCount: this.renderedSections.size,
            domSectionCount: document.querySelectorAll('.gmkb-section').length,
            sectionLayoutManagerAvailable: !!this.sectionLayoutManager,
            componentRendererAvailable: !!this.componentRenderer,
            containerVisible: this.containerElement ? this.containerElement.style.display !== 'none' : false,
            savedComponentsContainerVisible: document.getElementById('saved-components-container')?.style.display !== 'none'
        };
    }
}

// Global instance
window.SectionRenderer = SectionRenderer;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionRenderer = new SectionRenderer();
    });
} else {
    window.sectionRenderer = new SectionRenderer();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionRenderer;
}
