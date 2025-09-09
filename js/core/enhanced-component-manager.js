/**
 * @file enhanced-component-manager.js
 * @description ROOT FIX: Simplified component manager for adding/removing components
 * Phase 1: Architectural Integrity & Race Condition Prevention - COMPLETE
 */

(function() {
    'use strict';
    
    // ROOT FIX: Emergency logger fallback
    const logger = window.structuredLogger || {
        info: (category, message, data) => console.log(`[${category}] ${message}`, data || ''),
        debug: (category, message, data) => console.debug(`[${category}] ${message}`, data || ''),
        warn: (category, message, data) => console.warn(`[${category}] ${message}`, data || ''),
        error: (category, message, error, data) => console.error(`[${category}] ${message}`, error, data || '')
    };

    class EnhancedComponentManager {
        constructor() {
            this.components = new Map();
            this.isInitialized = false;
            this.componentCounter = 0;
            this.cachedWordPressData = null;
            this.isCurrentlyRendering = false;
            
            logger.info('COMPONENT', 'Enhanced Component Manager created');
        }

        /**
         * Initialize the component manager
         */
        initialize() {
            if (this.isInitialized) {
                logger.warn('COMPONENT', 'Component manager already initialized');
                return;
            }
            
            // ROOT FIX: Listen for section rendered events to move orphaned components
            document.addEventListener('gmkb:section-rendered', (event) => {
                const { sectionId } = event.detail;
                logger.info('COMPONENT', `Received gmkb:section-rendered event for section ${sectionId}`);
                this.moveOrphanedComponentsToSection(sectionId);
            });
            
            // ROOT FIX: Listen for section-rendered-display-update which fires after section DOM is ready
            document.addEventListener('gmkb:section-rendered-display-update', (event) => {
                const { sectionId } = event.detail;
                logger.info('COMPONENT', `Received gmkb:section-rendered-display-update event for section ${sectionId}`);
                if (sectionId) {
                    // Section DOM is ready, move any orphaned components
                    this.moveOrphanedComponentsToSection(sectionId);
                }
            });
            
            // ROOT FIX: Also listen for the section-registered event since that's what the state manager dispatches
            document.addEventListener('gmkb:section-registered', (event) => {
                const { sectionId, source, componentId } = event.detail;
                if (source === 'state-manager-auto-create') {
                    logger.info('COMPONENT', `Received gmkb:section-registered from state-manager for section ${sectionId}`);
                    
                    // ROOT FIX: If we know which component triggered this section creation, move it immediately
                    if (componentId) {
                        logger.info('COMPONENT', `Section ${sectionId} was created for component ${componentId}, moving it now`);
                        requestAnimationFrame(() => {
                            const moveSuccess = this.moveComponentToCorrectSection(componentId, sectionId, 1);
                            if (moveSuccess) {
                                logger.info('COMPONENT', `Successfully moved component ${componentId} to newly created section ${sectionId}`);
                            } else {
                                // Try the general orphaned components check
                                this.moveOrphanedComponentsToSection(sectionId);
                            }
                        });
                    } else {
                        // Give DOM a moment to update
                        requestAnimationFrame(() => {
                            this.moveOrphanedComponentsToSection(sectionId);
                        });
                    }
                }
            });

            try {
                if (!window.enhancedStateManager) {
                    throw new Error('Enhanced state manager not available');
                }
                
                const stateManagerReady = window.enhancedStateManager.isInitialized || 
                                         (window.enhancedStateManager.getState && 
                                          typeof window.enhancedStateManager.getState === 'function');
                
                if (!stateManagerReady) {
                    try {
                        const testState = window.enhancedStateManager.getState();
                        if (!testState) {
                            throw new Error('State manager returned no state');
                        }
                        logger.debug('COMPONENT', 'State manager verified via getState() call');
                    } catch (stateError) {
                        throw new Error('Enhanced state manager not ready: ' + stateError.message);
                    }
                }

                this.synchronizeWithState();
                this.isInitialized = true;
                logger.info('COMPONENT', 'Enhanced Component Manager initialized successfully');

                document.dispatchEvent(new CustomEvent('gmkb:component-manager-ready', {
                    detail: {
                        timestamp: Date.now(),
                        manager: this,
                        architecture: 'event-driven',
                        syncedComponents: this.components.size
                    }
                }));

                logger.info('COMPONENT', 'Component manager ready event dispatched');

            } catch (error) {
                logger.error('COMPONENT', 'Failed to initialize component manager', error);
                throw error;
            }
        }

        /**
         * Load existing component from saved state
         * ROOT FIX: This properly renders components that already exist in saved state
         * Unlike addComponent, this uses the existing ID and doesn't generate a new one
         */
        async loadExistingComponent(componentId, componentType, props = {}, sectionId = null, columnNumber = 1) {
            try {
                if (!this.isInitialized) {
                    this.initialize();
                }
                
                logger.info('COMPONENT', `Loading existing component: ${componentId} (${componentType})`);
                
                // Create component data with existing ID
                const componentData = {
                    id: componentId,
                    type: componentType,
                    props: props,
                    timestamp: Date.now(),
                    sectionId: sectionId || null,
                    columnNumber: columnNumber || null
                };
                
                // Render component via AJAX
                const html = await this.renderComponentOnServer(componentType, props, componentId);
                
                if (!html) {
                    throw new Error(`Failed to render existing component: ${componentType}`);
                }
                
                // Add to preview with proper section assignment
                this.addComponentToPreview(componentId, html, sectionId, columnNumber);
                
                // Track the component
                this.components.set(componentId, componentData);
                
                // Don't update state (it's already there) and don't auto-save (we're loading, not changing)
                
                logger.info('COMPONENT', `Successfully loaded existing component: ${componentId}`);
                return componentId;
                
            } catch (error) {
                logger.error('COMPONENT', `Failed to load existing component: ${componentId}`, error);
                throw error;
            }
        }
        
        /**
         * Add component with section assignment
         */
        async addComponent(componentType, props = {}, podsData = null) {
            // ROOT FIX: Handle case where componentType is passed as an object (from tests)
            if (typeof componentType === 'object' && componentType !== null) {
                // Extract type from object if it has a type property
                if (componentType.type) {
                    props = { ...componentType, ...props };
                    componentType = componentType.type;
                } else if (componentType.componentType) {
                    props = { ...componentType, ...props };
                    componentType = componentType.componentType;
                } else {
                    // Default to 'hero' if we can't determine the type
                    logger.warn('COMPONENT', 'Component type passed as object without type property, defaulting to hero', componentType);
                    componentType = 'hero';
                }
            }
            
            // Ensure componentType is a string
            componentType = String(componentType);
            try {
                if (!this.isInitialized) {
                    this.initialize();
                }
                
                if (this.isCurrentlyRendering) {
                    logger.warn('COMPONENT', `Component rendering in progress, queuing ${componentType}`);
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return this.addComponent(componentType, props, podsData);
                }
                
                this.isCurrentlyRendering = true;

                const targetSectionId = props.targetSectionId;
                const targetColumn = props.targetColumn || 1;
                
                if (targetSectionId) {
                    const sectionValidation = await this.validateSectionForComponent(targetSectionId, targetColumn);
                    if (!sectionValidation.isValid) {
                        logger.warn('COMPONENT', `Section validation failed for ${targetSectionId}: ${sectionValidation.reason}. Will add to main container.`);
                        props.targetSectionId = null;
                        props.targetColumn = null;
                    } else {
                        logger.info('COMPONENT', `Section validated for component: ${targetSectionId}, column ${targetColumn}`);
                    }
                }

                const componentId = this.generateComponentId(componentType);
                
                logger.info('COMPONENT', `Adding component with configuration: ${componentType}`, { 
                    componentId, 
                    targetSectionId: props.targetSectionId, 
                    hasPodsData: !!podsData 
                });

                // Create component data
                const componentData = {
                    id: componentId,
                    type: componentType,
                    props: { ...this.getDefaultProps(componentType), ...props },
                    timestamp: Date.now(),
                    sectionId: props.targetSectionId || null,
                    columnNumber: props.targetColumn || null
                };

                // Render component via AJAX
                const html = await this.renderComponentOnServer(componentType, componentData.props, componentId);
                
                if (!html) {
                    throw new Error(`Failed to render component: ${componentType}`);
                }

                // ROOT CAUSE FIX: Add to preview first, then handle section assignment
                this.addComponentToPreview(componentId, html, componentData.sectionId, componentData.columnNumber);
                
                // ROOT CAUSE FIX: If component has a section but it doesn't exist yet (auto-created section)
                // The state manager will create it and dispatch events
                // We need to ensure the component gets moved once the section is rendered
                if (componentData.sectionId && !document.querySelector(`[data-section-id="${componentData.sectionId}"]`)) {
                    logger.info('COMPONENT', `Section ${componentData.sectionId} not in DOM yet, registering for deferred move`);
                    // Register this component for moving once its section is rendered
                    if (!this.pendingComponentMoves) {
                        this.pendingComponentMoves = new Map();
                    }
                    this.pendingComponentMoves.set(componentId, {
                        sectionId: componentData.sectionId,
                        columnNumber: componentData.columnNumber || 1
                    });
                }
                
                // ROOT CAUSE FIX: Event-driven section assignment without timeouts
                if (componentData.sectionId && window.sectionLayoutManager) {
                    try {
                        const assignmentSuccess = window.sectionLayoutManager.assignComponentToSection(
                            componentId, 
                            componentData.sectionId, 
                            componentData.columnNumber || 1
                        );
                        if (assignmentSuccess) {
                            logger.info('COMPONENT', `Component assigned to section: ${componentData.sectionId}`);
                            // Move component to correct container immediately
                            this.moveComponentToCorrectSection(componentId, componentData.sectionId, componentData.columnNumber || 1);
                        } else {
                            logger.warn('COMPONENT', `Section assignment failed for ${componentData.sectionId}`);
                        }
                    } catch (assignmentError) {
                        logger.warn('COMPONENT', `Section assignment error:`, assignmentError.message);
                    }
                }

                // Update state and internal tracking
                if (window.enhancedStateManager) {
                    window.enhancedStateManager.addComponent(componentData);
                }
                this.components.set(componentId, componentData);

                // Auto-save
                try {
                    await this.autoSaveState('component_added', { componentId, componentType });
                    logger.info('COMPONENT', `Component auto-saved: ${componentType}`, { componentId });
                } catch (saveError) {
                    logger.warn('COMPONENT', `Auto-save failed:`, saveError.message);
                }

                document.dispatchEvent(new CustomEvent('componentAdded', {
                    detail: { 
                        componentId, 
                        componentType, 
                        props: componentData.props
                    }
                }));

                logger.info('COMPONENT', `Component added successfully: ${componentType}`, { componentId });
                return componentId;

            } catch (error) {
                logger.error('COMPONENT', `Failed to add component: ${componentType}`, error);
                throw error;
            } finally {
                this.isCurrentlyRendering = false;
            }
        }

        /**
         * Move orphaned components to their assigned section
         * ROOT FIX: Called when a section is rendered to collect its components
         */
        moveOrphanedComponentsToSection(sectionId) {
            try {
                // ROOT FIX: First check for pending component moves
                if (this.pendingComponentMoves && this.pendingComponentMoves.size > 0) {
                    const pendingForThisSection = [];
                    this.pendingComponentMoves.forEach((moveData, componentId) => {
                        if (moveData.sectionId === sectionId) {
                            pendingForThisSection.push({ componentId, ...moveData });
                        }
                    });
                    
                    if (pendingForThisSection.length > 0) {
                        logger.info('COMPONENT', `Found ${pendingForThisSection.length} pending components for section ${sectionId}`);
                        pendingForThisSection.forEach(({ componentId, sectionId, columnNumber }) => {
                            const moveSuccess = this.moveComponentToCorrectSection(componentId, sectionId, columnNumber);
                            if (moveSuccess) {
                                this.pendingComponentMoves.delete(componentId);
                                logger.info('COMPONENT', `Successfully moved pending component ${componentId} to section ${sectionId}`);
                            }
                        });
                    }
                }
                
                // Get all components that should be in this section from state
                const state = window.enhancedStateManager?.getState();
                if (!state || !state.sections) {
                    logger.debug('COMPONENT', `No state/sections for orphaned component check`);
                    return;
                }
                
                const section = state.sections.find(s => s.section_id === sectionId);
                if (!section) {
                    logger.debug('COMPONENT', `Section ${sectionId} not found in state`);
                    return;
                }
                
                if (!section.components || section.components.length === 0) {
                    logger.debug('COMPONENT', `Section ${sectionId} has no components assigned`);
                    return;
                }
                
                logger.info('COMPONENT', `Checking for orphaned components in section ${sectionId} (${section.components.length} components)`);
                
                // ROOT FIX: Log the actual component assignments for debugging
                logger.info('COMPONENT', `Section ${sectionId} components:`, section.components);
                
                let movedCount = 0;
                
                // Check each component that should be in this section
                section.components.forEach(componentAssignment => {
                    const { component_id, column } = componentAssignment;
                    const componentElement = document.getElementById(component_id);
                    
                    if (componentElement) {
                        // Check if component is not already in the correct section
                        const currentSection = componentElement.closest('[data-section-id]');
                        if (!currentSection || currentSection.dataset.sectionId !== sectionId) {
                            logger.info('COMPONENT', `Component ${component_id} is orphaned, moving to section ${sectionId}`);
                            // Move to correct section
                            const moveSuccess = this.moveComponentToCorrectSection(component_id, sectionId, column || 1);
                            if (moveSuccess) {
                                movedCount++;
                            }
                        } else {
                            logger.debug('COMPONENT', `Component ${component_id} already in correct section`);
                        }
                    } else {
                        logger.warn('COMPONENT', `Component ${component_id} not found in DOM`);
                    }
                });
                
                if (movedCount > 0) {
                    logger.info('COMPONENT', `Moved ${movedCount} orphaned components to section ${sectionId}`);
                }
            } catch (error) {
                logger.error('COMPONENT', `Failed to move orphaned components to section ${sectionId}:`, error);
            }
        }
        
        /**
         * Move component to correct section container
         */
        moveComponentToCorrectSection(componentId, sectionId, columnNumber = 1) {
            try {
                const componentElement = document.getElementById(componentId);
                if (!componentElement) {
                    logger.warn('COMPONENT', `Component element ${componentId} not found`);
                    return false;
                }
                
                const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
                if (!sectionElement) {
                    logger.warn('COMPONENT', `Section ${sectionId} not found`);
                    return false;
                }
                
                const sectionInner = sectionElement.querySelector('.gmkb-section__inner');
                if (!sectionInner) {
                    logger.warn('COMPONENT', `Section ${sectionId} has no inner container`);
                    return false;
                }
                
                const columns = sectionInner.querySelectorAll('.gmkb-section__column');
                let targetColumn;
                
                if (columns.length > 0) {
                    const targetColumnIndex = Math.min(columnNumber - 1, columns.length - 1);
                    targetColumn = columns[targetColumnIndex];
                } else {
                    targetColumn = sectionInner.querySelector('.gmkb-section__content') || sectionInner;
                }
                
                if (!targetColumn) {
                    logger.warn('COMPONENT', `No target column found in section ${sectionId}`);
                    return false;
                }
                
                // Move component to target column
                targetColumn.appendChild(componentElement);
                
                // Remove empty placeholder
                const emptyPlaceholder = targetColumn.querySelector('.gmkb-section__empty');
                if (emptyPlaceholder) {
                    emptyPlaceholder.remove();
                }
                
                logger.info('COMPONENT', `Moved component ${componentId} to section ${sectionId}`);
                return true;
                
            } catch (error) {
                logger.error('COMPONENT', `Failed to move component:`, error);
                return false;
            }
        }

        /**
         * Add component to preview with intelligent container selection
         */
        addComponentToPreview(componentId, html, sectionId = null, columnNumber = null) {
            let targetContainer = null;
            let containerType = 'unknown';
            
            if (sectionId) {
                const section = document.querySelector(`[data-section-id="${sectionId}"]`);
                
                if (section) {
                    const sectionInner = section.querySelector('.gmkb-section__inner');
                    
                    if (sectionInner) {
                        const columns = sectionInner.querySelectorAll('.gmkb-section__column');
                        
                        if (columns.length > 0) {
                            const targetColumnIndex = Math.min((columnNumber || 1) - 1, columns.length - 1);
                            targetContainer = columns[targetColumnIndex];
                            containerType = `section-column-${targetColumnIndex + 1}`;
                        } else {
                            targetContainer = sectionInner.querySelector('.gmkb-section__content') || sectionInner;
                            containerType = 'section-content';
                        }
                    } else {
                        targetContainer = section;
                        containerType = 'section-direct';
                    }
                    
                    logger.info('COMPONENT', `Found section container: ${containerType}`);
                } else {
                    logger.warn('COMPONENT', `Section ${sectionId} not found in DOM`);
                    
                    // Try to render section if it exists in state
                    if (window.sectionRenderer && window.sectionLayoutManager) {
                        const sectionData = window.sectionLayoutManager.getSection(sectionId);
                        if (sectionData) {
                            try {
                                window.sectionRenderer.renderSection(sectionId);
                                // Retry finding the section after rendering
                                const renderedSection = document.querySelector(`[data-section-id="${sectionId}"]`);
                                if (renderedSection) {
                                    const sectionInner = renderedSection.querySelector('.gmkb-section__inner');
                                    if (sectionInner) {
                                        const columns = sectionInner.querySelectorAll('.gmkb-section__column');
                                        if (columns.length > 0) {
                                            targetContainer = columns[Math.min((columnNumber || 1) - 1, columns.length - 1)];
                                            containerType = 'section-column-rendered';
                                        } else {
                                            targetContainer = sectionInner.querySelector('.gmkb-section__content') || sectionInner;
                                            containerType = 'section-content-rendered';
                                        }
                                    }
                                }
                            } catch (renderError) {
                                logger.error('COMPONENT', `Failed to render section ${sectionId}:`, renderError);
                            }
                        }
                    }
                }
            }
            
            // ROOT CAUSE FIX: Smart fallback selection - avoid duplication when targeting sections
            if (!targetContainer) {
                // ROOT FIX: If we have a target section ID, don't use fallback - create proper section targeting
                if (sectionId && window.sectionLayoutManager) {
                    logger.info('COMPONENT', `No container found for section ${sectionId}, will retry after DOM update`);
                    // Let the component be added to saved-components-container temporarily
                    // The section assignment will move it to the correct location
                    targetContainer = document.getElementById('saved-components-container');
                    containerType = 'temporary-for-section-assignment';
            } else {
            // Try to find existing sections to use instead of saved-components-container
            if (window.sectionLayoutManager) {
            const availableSections = window.sectionLayoutManager.getAllSections() || [];
            
            for (const section of availableSections) {
            const sectionElement = document.querySelector(`[data-section-id="${section.section_id}"]`);
            if (sectionElement) {
            const sectionInner = sectionElement.querySelector('.gmkb-section__inner');
            if (sectionInner) {
            const columns = sectionInner.querySelectorAll('.gmkb-section__column');
            if (columns.length > 0) {
                targetContainer = columns[0];
                    containerType = 'fallback-section-first-column';
                        logger.info('COMPONENT', `Using fallback section ${section.section_id}`);
                            break;
                            } else {
                                    targetContainer = sectionInner.querySelector('.gmkb-section__content') || sectionInner;
                                    containerType = 'fallback-section-content';
                                    logger.info('COMPONENT', `Using fallback section ${section.section_id} content`);
                                    break;
                            }
            }
                    }
                }
            }
            
            // Final fallback to saved-components-container
            if (!targetContainer) {
                targetContainer = document.getElementById('saved-components-container') || 
                                    document.getElementById('media-kit-preview');
                        containerType = targetContainer.id === 'saved-components-container' ? 'saved-components' : 'media-kit-preview';
                    
                    if (!targetContainer) {
                        throw new Error('No target container found for component');
                    }
                    
                    logger.info('COMPONENT', `Using final fallback: ${containerType}`);
                }
            }
        }
            
            // Check for existing component
            const existingComponent = document.getElementById(componentId);
            if (existingComponent) {
                logger.warn('COMPONENT', `Component ${componentId} already exists`);
                if (sectionId) {
                    const currentSection = existingComponent.closest('[data-section-id]');
                    if (!currentSection || currentSection.dataset.sectionId !== sectionId) {
                        this.moveComponentToCorrectSection(componentId, sectionId, columnNumber || 1);
                    }
                }
                return;
            }
            
            // Hide empty state
            const emptyState = document.getElementById('empty-state');
            if (emptyState && emptyState.style.display !== 'none') {
                emptyState.style.display = 'none';
            }
            
            // Remove section placeholder
            if (targetContainer.closest('[data-section-id]')) {
                const emptyPlaceholder = targetContainer.querySelector('.gmkb-section__empty');
                if (emptyPlaceholder) {
                    emptyPlaceholder.remove();
                }
            }
            
            // Show containers if hidden
            if (targetContainer.id === 'saved-components-container') {
                targetContainer.style.display = 'block';
            } else if (targetContainer.closest('[data-section-id]')) {
                const section = targetContainer.closest('[data-section-id]');
                if (section && section.style.display === 'none') {
                    section.style.display = 'block';
                }
            }

            // Parse and add component HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html.trim();
            const componentElement = tempDiv.firstElementChild;
            
            if (componentElement) {
                componentElement.id = componentId;
                componentElement.setAttribute('data-component-id', componentId);
                
                if (sectionId) {
                    componentElement.setAttribute('data-target-section', sectionId);
                    componentElement.setAttribute('data-target-column', (columnNumber || 1).toString());
                }
                
                try {
                    targetContainer.appendChild(componentElement);
                    
                    const containerInfo = {
                        id: targetContainer.id || 'no-id',
                        className: targetContainer.className,
                        containerType: containerType,
                        sectionId: targetContainer.closest('[data-section-id]')?.dataset?.sectionId || 'none',
                        requestedSection: sectionId || 'none'
                    };
                    
                    logger.info('COMPONENT', `Component ${componentId} added to container`, containerInfo);
                    
                    // Verify placement and fix if needed
                    if (sectionId) {
                        setTimeout(() => {
                            const actualSection = componentElement.closest('[data-section-id]');
                            if (!actualSection || actualSection.dataset.sectionId !== sectionId) {
                                logger.warn('COMPONENT', `Component not in correct section, attempting move`);
                                const moveSuccess = this.moveComponentToCorrectSection(componentId, sectionId, columnNumber || 1);
                                if (moveSuccess && window.sectionLayoutManager) {
                                    window.sectionLayoutManager.assignComponentToSection(componentId, sectionId, columnNumber || 1);
                                }
                            }
                            
                            // Refresh section
                            if (window.sectionRenderer && window.sectionRenderer.refreshSection) {
                                window.sectionRenderer.refreshSection(sectionId);
                            }
                        }, 150);
                        
                        // Notify section system
                        document.dispatchEvent(new CustomEvent('gmkb:component-added-to-section', {
                            detail: {
                                componentId,
                                sectionId,
                                columnNumber: columnNumber || 1,
                                timestamp: Date.now()
                            }
                        }));
                    }
                    
                    // Attach controls
                    setTimeout(() => {
                        if (window.componentControlsManager && window.componentControlsManager.attachControlsToComponent) {
                            window.componentControlsManager.attachControlsToComponent(componentId);
                        }
                    }, 200);
                    
                } catch (appendError) {
                    logger.error('COMPONENT', `Failed to append ${componentId}:`, appendError);
                    throw appendError;
                }
                
            } else {
                logger.error('COMPONENT', `Failed to parse HTML for ${componentId}`);
                
                // Create fallback element
                const fallbackElement = document.createElement('div');
                fallbackElement.id = componentId;
                fallbackElement.setAttribute('data-component-id', componentId);
                fallbackElement.className = 'media-kit-component media-kit-fallback';
                fallbackElement.innerHTML = `<p>Component ${componentId} (render error)</p>`;
                
                targetContainer.appendChild(fallbackElement);
                logger.info('COMPONENT', `Fallback element created for ${componentId}`);
            }
        }

        /**
         * Remove component
         */
        async removeComponent(componentId) {
            try {
                let componentData = this.components.get(componentId);
                
                if (!componentData && window.enhancedStateManager) {
                    const stateComponent = window.enhancedStateManager.getComponent(componentId);
                    if (stateComponent) {
                        componentData = stateComponent;
                    }
                }

                logger.info('COMPONENT', `Removing component: ${componentId}`, { type: componentData?.type || 'unknown' });

                this.removeComponentFromPreview(componentId);

                if (window.enhancedStateManager) {
                    window.enhancedStateManager.removeComponent(componentId);
                }

                this.components.delete(componentId);

                try {
                    await this.autoSaveState('component_removed', { componentId, componentType: componentData?.type || 'unknown' });
                    logger.info('COMPONENT', `Component removal auto-saved: ${componentId}`);
                } catch (saveError) {
                    logger.warn('COMPONENT', `Auto-save failed:`, saveError.message);
                }

                document.dispatchEvent(new CustomEvent('componentRemoved', {
                    detail: { 
                        componentId, 
                        componentType: componentData?.type || 'unknown' 
                    }
                }));

                logger.info('COMPONENT', `Successfully deleted component: ${componentId}`);

            } catch (error) {
                logger.error('COMPONENT', `Failed to remove component: ${componentId}`, error);
                throw error;
            }
        }

        /**
         * Remove component from preview
         */
        removeComponentFromPreview(componentId) {
            const componentWrapper = document.querySelector(`[data-component-id="${componentId}"]`);
            
            if (componentWrapper) {
                componentWrapper.remove();
                logger.debug('COMPONENT', `Component removed from preview: ${componentId}`);
            }

            // ROOT FIX: Show empty state only if no components AND no sections remain
            const previewContainer = document.getElementById('media-kit-preview');
            const remainingComponents = document.querySelectorAll('[data-component-id]');
            
            // Check sections
            const state = window.enhancedStateManager?.getState();
            const hasSections = state && state.sections && state.sections.length > 0;
            
            if ((!remainingComponents || remainingComponents.length === 0) && !hasSections) {
                // No components and no sections - show empty state
            const emptyState = document.getElementById('empty-state');
            const savedComponentsContainer = document.getElementById('saved-components-container');
            
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            if (savedComponentsContainer) {
                savedComponentsContainer.style.display = 'none';
            }
            
            logger.info('COMPONENT', 'No components or sections remain - showing empty state');
        } else if (!remainingComponents || remainingComponents.length === 0) {
            // No components but sections exist - keep sections visible
            logger.info('COMPONENT', 'No components but sections remain - keeping sections visible');
        }
        }

        /**
         * Render component on server
         */
        async renderComponentOnServer(componentType, props, componentId) {
            try {
                const wpData = this.getWordPressData();

                if (!wpData.ajaxUrl || !wpData.nonce) {
                    throw new Error('AJAX URL or nonce not available');
                }

                const formData = new FormData();
                formData.append('action', 'guestify_render_component');
                formData.append('nonce', wpData.nonce);
                formData.append('component', componentType);
                formData.append('props', JSON.stringify({ ...props, component_id: componentId }));
                
                if (wpData.postId) {
                    formData.append('post_id', wpData.postId);
                }

                const response = await fetch(wpData.ajaxUrl, {
                    method: 'POST',
                    body: formData
                });

                const responseData = await response.json();

                if (responseData.success && responseData.data && responseData.data.html) {
                    return responseData.data.html;
                } else {
                    throw new Error(responseData.data?.message || 'Server render failed');
                }

            } catch (error) {
                logger.warn('COMPONENT', `Server render failed for ${componentType}, using fallback`, error.message);
                return this.createFallbackComponent(componentType, props, componentId);
            }
        }

        /**
         * Create fallback component HTML
         */
        createFallbackComponent(componentType, props, componentId) {
            // ROOT FIX: Ensure componentType is a string before using charAt
            componentType = String(componentType || 'component');
            const componentName = componentType.charAt(0).toUpperCase() + componentType.slice(1);
            
            return `
                <div class="media-kit-component media-kit-${componentType}" data-component-id="${componentId}" data-component-type="${componentType}">
                    <div class="component-content">
                        <div class="component-header">
                            <h3>${componentName} Component</h3>
                        </div>
                        <div class="component-body">
                            <p>This is a placeholder for the ${componentName.toLowerCase()} component.</p>
                            ${this.getFallbackComponentContent(componentType, props)}
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Get fallback component content
         */
        getFallbackComponentContent(componentType, props) {
            switch (componentType) {
                case 'hero':
                    return `<div class="hero-content"><h1>${props.title || 'Professional Headline'}</h1><p>${props.subtitle || 'Your expertise'}</p></div>`;
                case 'biography':
                    return `<div class="biography-content"><p>${props.bio || 'Share your professional story...'}</p></div>`;
                case 'contact':
                    return `<div class="contact-content"><p>Email: ${props.email || 'your@email.com'}</p></div>`;
                default:
                    return '<p>Component content will appear here.</p>';
            }
        }

        /**
         * Generate unique component ID
         */
        generateComponentId(componentType) {
            this.componentCounter++;
            return `${componentType}-${Date.now()}-${this.componentCounter}`;
        }

        /**
         * Validate section for component
         */
        async validateSectionForComponent(sectionId, columnNumber = 1) {
            try {
                if (!window.sectionLayoutManager) {
                    return { isValid: false, reason: 'Section layout manager not available' };
                }
                
                const section = window.sectionLayoutManager.getSection(sectionId);
                if (!section) {
                    return { isValid: false, reason: `Section ${sectionId} does not exist` };
                }
                
                const maxColumns = section.layout?.columns || 1;
                if (columnNumber > maxColumns) {
                    return { isValid: false, reason: `Column ${columnNumber} exceeds capacity (${maxColumns})` };
                }
                
                const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
                if (!sectionElement && window.sectionRenderer) {
                    try {
                        await window.sectionRenderer.renderSection(sectionId);
                    } catch (renderError) {
                        return { isValid: false, reason: `Could not render section: ${renderError.message}` };
                    }
                }
                
                return { isValid: true, section: section, maxColumns: maxColumns };
                
            } catch (error) {
                return { isValid: false, reason: `Validation error: ${error.message}` };
            }
        }

        /**
         * Get default props for component type
         */
        getDefaultProps(componentType) {
            const defaults = {
                hero: { title: 'Professional Headline', subtitle: 'Your expertise', buttonText: 'Get In Touch' },
                biography: { bio: 'Share your professional story here...' },
                contact: { email: '', phone: '', website: '' },
                topics: { topics: [] }
            };
            return defaults[componentType] || {};
        }

        /**
         * Synchronize with state manager
         * ROOT FIX: Don't clear components - merge instead to prevent loss during duplication
         */
        synchronizeWithState() {
            try {
                if (!window.enhancedStateManager) {
                    logger.warn('COMPONENT', 'State manager not available for synchronization');
                    return;
                }

                const currentState = window.enhancedStateManager.getState();
                if (!currentState || !currentState.components) {
                    logger.info('COMPONENT', 'No components in state to synchronize');
                    return;
                }

                const stateComponents = currentState.components;
                const stateComponentIds = Object.keys(stateComponents);
                
                logger.info('COMPONENT', `Synchronizing with ${stateComponentIds.length} components from state`);

                // ROOT FIX: Don't clear components - merge instead
                // Only remove components that no longer exist in state
                const managerComponentIds = Array.from(this.components.keys());
                const toRemove = managerComponentIds.filter(id => !stateComponentIds.includes(id));
                
                toRemove.forEach(id => {
                    this.components.delete(id);
                    logger.debug('COMPONENT', `Removed component not in state: ${id}`);
                });

                // Add or update components from state
                stateComponentIds.forEach(componentId => {
                    const componentData = stateComponents[componentId];
                    if (componentData && componentData.type) {
                        const normalizedComponent = {
                            id: componentId,
                            type: componentData.type,
                            props: componentData.props || {},
                            timestamp: componentData.timestamp || Date.now()
                        };
                        
                        this.components.set(componentId, normalizedComponent);
                        logger.debug('COMPONENT', `Synchronized component: ${componentId} (${componentData.type})`);
                    }
                });

                logger.info('COMPONENT', `Synchronization complete: ${this.components.size} components tracked`);

            } catch (error) {
                logger.error('COMPONENT', 'Failed to synchronize with state manager', error);
            }
        }

        /**
         * Get component by ID
         */
        getComponent(componentId) {
            if (!this.components.has(componentId) && window.enhancedStateManager) {
                const stateComponent = window.enhancedStateManager.getComponent(componentId);
                if (stateComponent) {
                    const normalizedComponent = {
                        id: componentId,
                        type: stateComponent.type,
                        props: stateComponent.props || {},
                        timestamp: stateComponent.timestamp || Date.now()
                    };
                    this.components.set(componentId, normalizedComponent);
                    return normalizedComponent;
                }
            }
            return this.components.get(componentId);
        }

        /**
         * Get WordPress data
         */
        getWordPressData() {
            if (this.cachedWordPressData) {
                return this.cachedWordPressData;
            }

            let wpData = null;
            
            if (window.gmkbData && window.gmkbData.ajaxUrl && window.gmkbData.nonce) {
                wpData = window.gmkbData;
            } else if (window.guestifyData && window.guestifyData.ajaxUrl && window.guestifyData.nonce) {
                wpData = window.guestifyData;
            } else if (window.MKCG && window.MKCG.ajaxUrl && window.MKCG.nonce) {
                wpData = window.MKCG;
            } else {
                throw new Error('WordPress data not available');
            }

            if (!wpData.ajaxUrl || !wpData.nonce) {
                throw new Error('WordPress data missing required fields');
            }

            this.cachedWordPressData = wpData;
            return wpData;
        }

        /**
         * Auto-save state
         */
        async autoSaveState(action, metadata = {}) {
            try {
                if (!window.enhancedStateManager) {
                    throw new Error('State manager not available for auto-save');
                }

                const currentState = window.enhancedStateManager.getState();
                if (!currentState) {
                    throw new Error('No state available for auto-save');
                }

                const wpData = this.getWordPressData();

                const formData = new FormData();
                formData.append('action', 'guestify_save_media_kit');
                formData.append('nonce', wpData.nonce);
                formData.append('post_id', wpData.postId);
                formData.append('state', JSON.stringify(currentState));
                formData.append('auto_save', 'true');
                formData.append('trigger_action', action);
                formData.append('trigger_metadata', JSON.stringify(metadata));

                const response = await fetch(wpData.ajaxUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const responseData = await response.json();

                if (responseData.success) {
                    document.dispatchEvent(new CustomEvent('gmkb:auto-save-success', {
                        detail: { action, metadata, response: responseData.data }
                    }));
                    return responseData.data;
                } else {
                    throw new Error(responseData.data?.message || 'Auto-save failed');
                }

            } catch (error) {
                logger.error('COMPONENT', `Auto-save failed after ${action}:`, error);
                document.dispatchEvent(new CustomEvent('gmkb:auto-save-failed', {
                    detail: { action, metadata, error: error.message }
                }));
                throw error;
            }
        }

        /**
         * Manual save
         */
        async manualSave() {
            try {
                logger.info('COMPONENT', 'Manual save requested');
                await this.autoSaveState('manual_save', { source: 'save_button' });
                logger.info('COMPONENT', 'Manual save completed successfully');
                return true;
            } catch (error) {
                logger.error('COMPONENT', 'Manual save failed:', error);
                throw error;
            }
        }

        /**
         * Check if ready
         */
        isReady() {
            return this.isInitialized && window.enhancedStateManager;
        }
    }

    // Initialize globally
    window.EnhancedComponentManager = EnhancedComponentManager;
    window.enhancedComponentManager = new EnhancedComponentManager();
    
    // Event-driven initialization
    let componentManagerInitialized = false;
    
    const initializeComponentManager = () => {
        if (componentManagerInitialized) return;
        
        const isStateManagerReady = window.enhancedStateManager && 
                                   (window.enhancedStateManager.isInitialized || 
                                    (window.enhancedStateManager.getState && 
                                     typeof window.enhancedStateManager.getState === 'function'));
        
        if (isStateManagerReady) {
            if (window.enhancedComponentManager.isInitialized) {
                componentManagerInitialized = true;
                return;
            }
            
            try {
                componentManagerInitialized = true;
                window.enhancedComponentManager.initialize();
                logger.info('COMPONENT', 'Component Manager initialized successfully');
            } catch (error) {
                componentManagerInitialized = false;
                logger.error('COMPONENT', 'Failed to initialize component manager:', error);
            }
        } else {
            if (!componentManagerInitialized) {
                document.addEventListener('gmkb:state-manager-ready', () => {
                    if (!componentManagerInitialized && !window.enhancedComponentManager.isInitialized) {
                        try {
                            componentManagerInitialized = true;
                            window.enhancedComponentManager.initialize();
                            logger.info('COMPONENT', 'Component Manager initialized via state manager ready event');
                        } catch (error) {
                            componentManagerInitialized = false;
                            logger.error('COMPONENT', 'Failed to initialize component manager via event:', error);
                        }
                    }
                }, { once: true });
            }
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeComponentManager);
    } else {
        initializeComponentManager();
    }
    
    // Listen for component events
    document.addEventListener('gmkb:add-component', async (event) => {
        const { componentType, props, source, podsData } = event.detail;
        
        logger.info('COMPONENT', `Received add-component event from ${source}`, {
            componentType, props, hasPodsData: !!podsData
        });
        
        try {
            if (window.enhancedComponentManager.isReady()) {
                await window.enhancedComponentManager.addComponent(componentType, props, podsData);
            } else {
                window.enhancedComponentManager.initialize();
                await window.enhancedComponentManager.addComponent(componentType, props, podsData);
            }
        } catch (error) {
            logger.error('COMPONENT', `Failed to add component via event: ${componentType}`, error);
        }
    });
    
    // ROOT FIX: Listen for move up/down events
    document.addEventListener('gmkb:component-move-up-requested', (event) => {
        const { componentId } = event.detail;
        logger.info('COMPONENT', `Move up requested for: ${componentId}`);
        
        try {
            const componentElement = document.getElementById(componentId);
            if (!componentElement) {
                logger.warn('COMPONENT', `Component ${componentId} not found for move up`);
                return;
            }
            
            // ROOT FIX: Get the actual container (could be .gmkb-section__components or similar)
            const container = componentElement.parentElement;
            
            // Get siblings that are components only (have data-component-id)
            const siblings = Array.from(container.children).filter(child => 
                child.hasAttribute('data-component-id') || child.id?.match(/^[a-z-]+-\d{13}-\d+$/)
            );
            
            const currentIndex = siblings.indexOf(componentElement);
            
            // ROOT FIX: Only move if there's actually a previous sibling component
            if (currentIndex > 0 && siblings.length > 1) {
                // Move up by swapping with previous sibling
                container.insertBefore(componentElement, siblings[currentIndex - 1]);
                logger.info('COMPONENT', `Moved ${componentId} up (position ${currentIndex} to ${currentIndex - 1})`);
                
                // Update state to match new DOM order
                if (window.enhancedStateManager) {
                    window.enhancedStateManager.updateComponentOrder();
                }
                
                // Auto-save the new order
                if (window.enhancedComponentManager) {
                    window.enhancedComponentManager.autoSaveState('component_moved', {
                        componentId,
                        direction: 'up',
                        newPosition: currentIndex - 1
                    });
                }
            } else {
                logger.info('COMPONENT', `Cannot move ${componentId} up - already at top or only component`);
            }
        } catch (error) {
            logger.error('COMPONENT', `Failed to move component up: ${componentId}`, error);
        }
    });
    
    document.addEventListener('gmkb:component-move-down-requested', (event) => {
        const { componentId } = event.detail;
        logger.info('COMPONENT', `Move down requested for: ${componentId}`);
        
        try {
            const componentElement = document.getElementById(componentId);
            if (!componentElement) {
                logger.warn('COMPONENT', `Component ${componentId} not found for move down`);
                return;
            }
            
            // ROOT FIX: Get the actual container (could be .gmkb-section__components or similar)
            const container = componentElement.parentElement;
            
            // Get siblings that are components only (have data-component-id)
            const siblings = Array.from(container.children).filter(child => 
                child.hasAttribute('data-component-id') || child.id?.match(/^[a-z-]+-\d{13}-\d+$/)
            );
            
            const currentIndex = siblings.indexOf(componentElement);
            
            // ROOT FIX: Only move if there's actually a next sibling component
            if (currentIndex < siblings.length - 1 && siblings.length > 1) {
                // Move down by swapping with next sibling
                const nextSibling = siblings[currentIndex + 1];
                container.insertBefore(nextSibling, componentElement);
                logger.info('COMPONENT', `Moved ${componentId} down (position ${currentIndex} to ${currentIndex + 1})`);
                
                // Update state to match new DOM order
                if (window.enhancedStateManager) {
                    window.enhancedStateManager.updateComponentOrder();
                }
                
                // Auto-save the new order
                if (window.enhancedComponentManager) {
                    window.enhancedComponentManager.autoSaveState('component_moved', {
                        componentId,
                        direction: 'down',
                        newPosition: currentIndex + 1
                    });
                }
            } else {
                logger.info('COMPONENT', `Cannot move ${componentId} down - already at bottom or only component`);
            }
        } catch (error) {
            logger.error('COMPONENT', `Failed to move component down: ${componentId}`, error);
        }
    });
    
    // ROOT FIX: Listen for duplicate and delete events
    document.addEventListener('gmkb:component-duplicate-requested', async (event) => {
        const { componentId } = event.detail;
        logger.info('COMPONENT', `Duplicate requested for: ${componentId}`);
        
        try {
            const originalComponent = window.enhancedComponentManager.getComponent(componentId);
            if (!originalComponent) {
                logger.warn('COMPONENT', `Component ${componentId} not found for duplication`);
                return;
            }
            
            // Get component data from state
            const stateComponent = window.enhancedStateManager?.getComponent(componentId);
            const componentData = stateComponent || originalComponent;
            
            // ROOT FIX: Get the section ID from the original component to place duplicate in same section
            const originalElement = document.getElementById(componentId);
            const sectionElement = originalElement?.closest('[data-section-id]');
            const sectionId = componentData.sectionId || sectionElement?.dataset.sectionId || null;
            
            // Create duplicate with new ID and same section assignment
            const duplicateProps = { 
                ...componentData.props,
                targetSectionId: sectionId  // Ensure duplicate goes to same section
            };
            
            // Use addComponent which properly renders through server
            const duplicateId = await window.enhancedComponentManager.addComponent(
                componentData.type,
                duplicateProps
            );
            
            logger.info('COMPONENT', `Duplicated ${componentId} as ${duplicateId} in section ${sectionId}`);
            
            // The component should be properly rendered with controls via addComponent
            // No need for manual DOM manipulation
            
        } catch (error) {
            logger.error('COMPONENT', `Failed to duplicate component: ${componentId}`, error);
        }
    });
    
    document.addEventListener('gmkb:component-delete-requested', async (event) => {
        const { componentId, reason, sectionId, skipConfirmation } = event.detail;
        logger.info('COMPONENT', `Delete requested for: ${componentId}`, { reason, sectionId });
        
        try {
            // ROOT FIX: Skip confirmation if requested (e.g., when deleting entire section)
            if (!skipConfirmation) {
                // Confirm deletion only for individual component deletions
                if (!confirm('Are you sure you want to delete this component?')) {
                    return;
                }
            }
            
            await window.enhancedComponentManager.removeComponent(componentId);
            logger.info('COMPONENT', `Deleted component: ${componentId}`, { reason });
            
        } catch (error) {
            logger.error('COMPONENT', `Failed to delete component: ${componentId}`, error);
        }
    });
    
    // ROOT FIX: Listen for edit request
    document.addEventListener('gmkb:component-edit-requested', (event) => {
        const { componentId } = event.detail;
        logger.info('COMPONENT', `Edit requested for: ${componentId}`);
        
        // This is handled by gmkb-init.js, but we log it here
        document.dispatchEvent(new CustomEvent('gmkb:edit-component', {
            detail: { componentId }
        }));
    });
    
    // State sync when both managers ready
    const setupStateChangeListener = () => {
        if (window.enhancedStateManager && window.enhancedComponentManager && window.enhancedComponentManager.isInitialized) {
            window.enhancedStateManager.subscribeGlobal((state) => {
                const stateComponentIds = Object.keys(state.components || {});
                const managerComponentIds = Array.from(window.enhancedComponentManager.components.keys());
                
                const missingInManager = stateComponentIds.filter(id => !managerComponentIds.includes(id));
                if (missingInManager.length > 0) {
                    logger.info('COMPONENT', `Auto-syncing ${missingInManager.length} missing components from state`);
                    window.enhancedComponentManager.synchronizeWithState();
                }
            });
        }
    };
    
    document.addEventListener('gmkb:component-manager-ready', setupStateChangeListener, { once: true });
    
    if (window.enhancedComponentManager && window.enhancedComponentManager.isInitialized) {
        setupStateChangeListener();
    }

    if (window.gmkbData?.debugMode) {
        console.log('Enhanced Component Manager: Available globally and ready');
        console.log('Enhanced Component Manager: Event listeners for gmkb:add-component ready');
    }

})();