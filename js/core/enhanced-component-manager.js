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
            this.cachedWordPressData = null; // ROOT FIX: Cache for WordPress data access
            this.isCurrentlyRendering = false; // ROOT FIX: Track rendering state to prevent concurrent operations
            
            logger.info('COMPONENT', 'Enhanced Component Manager created');
        }

        /**
         * Initialize the component manager
         * ROOT FIX: Add proper ready event dispatch for dependency coordination
         */
        initialize() {
            if (this.isInitialized) {
                logger.warn('COMPONENT', 'Component manager already initialized');
                return;
            }

            try {
                // Ensure we have access to state manager
                if (!window.enhancedStateManager) {
                    throw new Error('Enhanced state manager not available');
                }
                
                // Ensure state manager is initialized
                if (!window.enhancedStateManager.isInitialized) {
                    throw new Error('Enhanced state manager not initialized yet');
                }

                // ROOT FIX: Synchronize with existing state components
                this.synchronizeWithState();

                this.isInitialized = true;
                logger.info('COMPONENT', 'Enhanced Component Manager initialized successfully');

                // ROOT FIX: Dispatch ready event for event-driven coordination
                // This prevents race conditions with component controls
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
         * ROOT FIX: Add component to preview and state
         * @param {string} componentType - Type of component to add
         * @param {Object} props - Component properties
         * @returns {Promise<string>} Component ID
         */
        async addComponent(componentType, props = {}) {
            try {
                if (!this.isInitialized) {
                    this.initialize();
                }
                
                // ROOT FIX: Prevent concurrent component additions
                if (this.isCurrentlyRendering) {
                    logger.warn('COMPONENT', `Component rendering in progress, queuing ${componentType}`);
                    // Wait a bit and retry
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return this.addComponent(componentType, props);
                }
                
                this.isCurrentlyRendering = true;

                // Generate unique component ID
                const componentId = this.generateComponentId(componentType);
                
                logger.info('COMPONENT', `Adding component: ${componentType}`, { componentId, props });

                // Create component data
                const componentData = {
                    id: componentId,
                    type: componentType,
                    props: {
                        ...this.getDefaultProps(componentType),
                        ...props
                    },
                    timestamp: Date.now()
                };

                // ROOT FIX: Render component via AJAX to get actual HTML
                const html = await this.renderComponentOnServer(componentType, componentData.props, componentId);
                
                if (!html) {
                    throw new Error(`Failed to render component: ${componentType}`);
                }

                // Add to preview area
                this.addComponentToPreview(componentId, html);

                // Update state manager
                if (window.enhancedStateManager) {
                    window.enhancedStateManager.addComponent(componentData);
                }

                // Store component reference
                this.components.set(componentId, componentData);

                // ROOT FIX: AUTO-SAVE to database immediately after component addition
                try {
                    await this.autoSaveState('component_added', { componentId, componentType });
                    logger.info('COMPONENT', `Component auto-saved to database: ${componentType}`, { componentId });
                } catch (saveError) {
                    logger.warn('COMPONENT', `Auto-save failed for ${componentType}:`, saveError.message);
                    // Don't fail component addition if save fails - user can manually save
                }

                // Emit event
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
                // ROOT FIX: Always clear the rendering flag
                this.isCurrentlyRendering = false;
            }
        }

        /**
         * ROOT FIX: Remove component from preview and state
         * @param {string} componentId - Component ID to remove
         */
        async removeComponent(componentId) {
            try {
                // ROOT FIX: Get component data with fallback to state manager
                let componentData = this.components.get(componentId);
                
                if (!componentData && window.enhancedStateManager) {
                    // Try to get from state manager if not in component manager
                    const stateComponent = window.enhancedStateManager.getComponent(componentId);
                    if (stateComponent) {
                        componentData = stateComponent;
                        logger.info('COMPONENT', `Found component ${componentId} in state manager for removal`);
                    }
                }
                
                if (!componentData) {
                    logger.warn('COMPONENT', `Component not found for removal: ${componentId}`);
                    // Still try to clean up DOM and state even if not found in component manager
                }

                logger.info('COMPONENT', `Removing component: ${componentId}`, { type: componentData?.type || 'unknown' });

                // Remove from preview
                this.removeComponentFromPreview(componentId);

                // Update state manager
                if (window.enhancedStateManager) {
                    window.enhancedStateManager.removeComponent(componentId);
                }

                // Remove from local storage
                this.components.delete(componentId);

                // ROOT FIX: AUTO-SAVE to database immediately after component removal
                try {
                    await this.autoSaveState('component_removed', { componentId, componentType: componentData?.type || 'unknown' });
                    logger.info('COMPONENT', `Component removal auto-saved to database: ${componentId}`);
                } catch (saveError) {
                    logger.warn('COMPONENT', `Auto-save failed for component removal:`, saveError.message);
                    // Don't fail component removal if save fails - user can manually save
                }

                // Emit event
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
         * ROOT FIX: Direct WordPress data access (CHECKLIST COMPLIANT)
         * Uses WordPress global namespace pattern instead of race-prone event waiting
         * @param {string} componentType - Component type
         * @param {Object} props - Component props
         * @param {string} componentId - Component ID
         * @returns {Promise<string>} Rendered HTML
         */
        async renderComponentOnServer(componentType, props, componentId) {
            try {
                // ROOT FIX: Direct access to WordPress data (already available globally)
                const wpData = this.getWordPressData();
                const ajaxUrl = wpData.ajaxUrl;
                const nonce = wpData.nonce;

                if (!ajaxUrl || !nonce) {
                    throw new Error('AJAX URL or nonce not available from WordPress data');
                }

                logger.debug('COMPONENT', `Rendering ${componentType} server-side`, {
                    hasAjaxUrl: !!ajaxUrl,
                    hasNonce: !!nonce,
                    hasPostId: !!wpData.postId,
                    componentId
                });

                const formData = new FormData();
                formData.append('action', 'guestify_render_component');
                formData.append('nonce', nonce);
                formData.append('component', componentType);
                formData.append('props', JSON.stringify({ ...props, component_id: componentId }));
                
                // ROOT FIX: Add post_id parameter that PHP handlers expect
                if (wpData.postId) {
                    formData.append('post_id', wpData.postId);
                }

                const response = await fetch(ajaxUrl, {
                    method: 'POST',
                    body: formData
                });

                const responseData = await response.json();

                if (responseData.success && responseData.data && responseData.data.html) {
                    logger.debug('COMPONENT', `Server render successful: ${componentType}`);
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
         * ROOT FIX: Create fallback component HTML when server render fails
         * Now delegates control attachment to ComponentControlsManager
         * @param {string} componentType - Component type
         * @param {Object} props - Component props
         * @param {string} componentId - Component ID
         * @returns {string} Fallback HTML
         */
        createFallbackComponent(componentType, props, componentId) {
            const componentName = componentType.charAt(0).toUpperCase() + componentType.slice(1);
            
            return `
                <div class="media-kit-component media-kit-${componentType}" data-component-id="${componentId}" data-component-type="${componentType}">
                    <div class="component-content">
                        <div class="component-header">
                            <h3>${componentName} Component</h3>
                            <!-- ROOT FIX: Controls removed - will be added by ComponentControlsManager -->
                        </div>
                        <div class="component-body">
                            <p>This is a placeholder for the ${componentName.toLowerCase()} component. Edit to customize content.</p>
                            ${this.getFallbackComponentContent(componentType, props)}
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Get component-specific fallback content
         */
        getFallbackComponentContent(componentType, props) {
            switch (componentType) {
                case 'hero':
                    return `
                        <div class="hero-content">
                            <h1>${props.title || 'Your Professional Headline'}</h1>
                            <p>${props.subtitle || 'Tell the world what you do best'}</p>
                            <button class="cta-button">${props.buttonText || 'Get In Touch'}</button>
                        </div>
                    `;
                case 'biography':
                    return `
                        <div class="biography-content">
                            <p>${props.bio || 'Share your professional story and expertise here. This is where you can build credibility and connect with your audience.'}</p>
                        </div>
                    `;
                case 'contact':
                    return `
                        <div class="contact-content">
                            <p>Email: ${props.email || 'your@email.com'}</p>
                            <p>Phone: ${props.phone || '+1 (555) 123-4567'}</p>
                            <p>Website: ${props.website || 'www.yourwebsite.com'}</p>
                        </div>
                    `;
                default:
                    return '<p>Component content will appear here.</p>';
            }
        }

        /**
        * Add component HTML to preview area
        */
        addComponentToPreview(componentId, html) {
        // ROOT FIX: Use the correct container - check for saved-components-container first
        let targetContainer = document.getElementById('saved-components-container');
        
        // If saved container doesn't exist or is hidden, use preview container
        if (!targetContainer || targetContainer.style.display === 'none') {
            targetContainer = document.getElementById('media-kit-preview');
        }
        
        if (!targetContainer) {
            throw new Error('No target container found for component');
        }
        
        // ROOT FIX: Check if component already exists to prevent duplicates
        const existingComponent = document.getElementById(componentId);
        if (existingComponent) {
            logger.warn('COMPONENT', `Component ${componentId} already exists in DOM, not adding duplicate`);
            return;
        }
        
        const emptyState = document.getElementById('empty-state');

        // Hide empty state if visible
        if (emptyState) {
        emptyState.style.display = 'none';
        }
        
        // Show the saved components container if it was hidden
        if (targetContainer.id === 'saved-components-container') {
            targetContainer.style.display = 'block';
        }

        // ROOT CAUSE FIX: Don't create a wrapper - the component IS the wrapper
        // The HTML from server already has the component structure
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const componentElement = tempDiv.firstElementChild;
        
        if (componentElement) {
            // Ensure the element has the correct ID
            componentElement.id = componentId;
            componentElement.setAttribute('data-component-id', componentId);
            
            // Add to the appropriate container
            targetContainer.appendChild(componentElement);
                
            logger.debug('COMPONENT', `Component added to ${targetContainer.id}: ${componentId}`);
        } else {
            logger.error('COMPONENT', `No element found in HTML for component: ${componentId}`);
        }
    }

        /**
         * Remove component from preview area
         */
        removeComponentFromPreview(componentId) {
            const componentWrapper = document.querySelector(`[data-component-id="${componentId}"]`);
            
            if (componentWrapper) {
                componentWrapper.remove();
                logger.debug('COMPONENT', `Component removed from preview: ${componentId}`);
            }

            // Show empty state if no components remain
            const previewContainer = document.getElementById('media-kit-preview');
            const remainingComponents = previewContainer?.querySelectorAll('.component-wrapper');
            
            if (!remainingComponents || remainingComponents.length === 0) {
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'block';
                }
            }
        }

        /**
         * ROOT FIX: Removed conflicting event listener attachment
         * Controls are now managed by ComponentControlsManager exclusively
         * This prevents conflicts between multiple control systems
         */
        // attachComponentEventListeners method removed - ComponentControlsManager handles all control events

        /**
         * ROOT FIX: Edit component - opens design panel in sidebar
         * CHECKLIST COMPLIANT: Event-driven, no polling, root cause fix
         */
        editComponent(componentId) {
            logger.info('COMPONENT', `Edit requested for component: ${componentId}`);
            
            try {
                // ROOT FIX: Get component with automatic sync if needed
                const component = this.getComponent(componentId);
                if (!component) {
                    logger.warn('COMPONENT', `Component not found for editing: ${componentId}`);
                    if (window.showToast) {
                        window.showToast('Component not found', 'error', 3000);
                    }
                    return;
                }
                
                // ROOT FIX: Use the existing design panel in the sidebar
                if (window.designPanel && typeof window.designPanel.load === 'function') {
                    // Select the component element first
                    const componentElement = document.getElementById(componentId);
                    if (componentElement) {
                        // Dispatch component selection event
                        componentElement.click();
                        
                        // Small delay to ensure selection is processed
                        setTimeout(() => {
                            window.designPanel.load(componentId);
                            logger.info('COMPONENT', `Sidebar design panel loaded for ${componentId}`);
                        }, 100);
                    } else {
                        // Just load the design panel directly
                        window.designPanel.load(componentId);
                        logger.info('COMPONENT', `Sidebar design panel loaded for ${componentId} (no element selection)`);
                    }
                } else {
                    // Fallback to modal approach if design panel not available
                    logger.warn('COMPONENT', 'Sidebar design panel not available, using modal fallback');
                    this.openDesignPanel(componentId, component.type);
                }
                
            } catch (error) {
                logger.error('COMPONENT', `Failed to edit component ${componentId}:`, error);
                if (window.showToast) {
                    window.showToast('Failed to open editor', 'error', 3000);
                }
            }
        }
        
        /**
         * ROOT FIX: Open design panel for component editing
         * @param {string} componentId - Component ID to edit
         * @param {string} componentType - Component type
         */
        async openDesignPanel(componentId, componentType) {
            try {
                // First check if we have a design panel modal
                let designPanelModal = document.getElementById('design-panel-modal');
                
                if (!designPanelModal) {
                    // Create design panel modal if it doesn't exist
                    designPanelModal = this.createDesignPanelModal();
                    document.body.appendChild(designPanelModal);
                }
                
                // Load component-specific design panel content
                const panelContent = await this.loadDesignPanelContent(componentType, componentId);
                
                // Update modal content
                const modalBody = designPanelModal.querySelector('.modal-body');
                if (modalBody && panelContent) {
                    modalBody.innerHTML = panelContent;
                    
                    // Set up design panel event listeners
                    this.setupDesignPanelEventListeners(designPanelModal, componentId);
                }
                
                // Show the modal
                designPanelModal.style.display = 'block';
                designPanelModal.classList.add('show');
                document.body.classList.add('modal-open');
                
                logger.info('COMPONENT', `Design panel displayed for ${componentType} component`);
                
            } catch (error) {
                logger.error('COMPONENT', `Failed to open design panel for ${componentId}:`, error);
                throw error;
            }
        }
        
        /**
         * ROOT FIX: Create design panel modal structure
         */
        createDesignPanelModal() {
            const modal = document.createElement('div');
            modal.id = 'design-panel-modal';
            modal.className = 'modal design-panel-modal';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Component</h5>
                            <button type="button" class="close" data-dismiss="modal">
                                <span>&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="loading-panel">
                                <p>Loading design panel...</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="save-design-changes">Save Changes</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add close functionality
            const closeBtn = modal.querySelector('.close');
            const cancelBtn = modal.querySelector('[data-dismiss="modal"]');
            
            [closeBtn, cancelBtn].forEach(btn => {
                if (btn) {
                    btn.addEventListener('click', () => {
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                        document.body.classList.remove('modal-open');
                    });
                }
            });
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                    document.body.classList.remove('modal-open');
                }
            });
            
            return modal;
        }
        
        /**
         * ROOT FIX: Load design panel content from server
         */
        async loadDesignPanelContent(componentType, componentId) {
            try {
                const wpData = this.getWordPressData();
                
                const formData = new FormData();
                formData.append('action', 'guestify_render_design_panel');
                formData.append('nonce', wpData.nonce);
                formData.append('component', componentType);
                formData.append('component_id', componentId);
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
                    logger.warn('COMPONENT', `Design panel content not available for ${componentType}, using fallback`);
                    return this.createFallbackDesignPanel(componentType, componentId);
                }
                
            } catch (error) {
                logger.warn('COMPONENT', `Failed to load design panel for ${componentType}:`, error.message);
                return this.createFallbackDesignPanel(componentType, componentId);
            }
        }
        
        /**
         * ROOT FIX: Create fallback design panel when server content fails
         */
        createFallbackDesignPanel(componentType, componentId) {
            const componentName = componentType.charAt(0).toUpperCase() + componentType.slice(1);
            
            return `
                <div class="design-panel-fallback">
                    <div class="panel-header">
                        <h4>${componentName} Settings</h4>
                        <p>Configure your ${componentType} component</p>
                    </div>
                    
                    <div class="panel-section">
                        <h5>Basic Properties</h5>
                        <div class="form-group">
                            <label for="component-title">Title</label>
                            <input type="text" id="component-title" class="form-control" placeholder="Component title">
                        </div>
                        
                        <div class="form-group">
                            <label for="component-description">Description</label>
                            <textarea id="component-description" class="form-control" rows="3" placeholder="Component description"></textarea>
                        </div>
                    </div>
                    
                    <div class="panel-section">
                        <h5>Actions</h5>
                        <p class="text-muted">Custom settings for this component type are not yet available. You can:</p>
                        <ul class="list-unstyled">
                            <li>• Edit content directly in the preview</li>
                            <li>• Use the toolbar controls to move or duplicate</li>
                            <li>• Save your changes using the main save button</li>
                        </ul>
                    </div>
                </div>
            `;
        }
        
        /**
         * ROOT FIX: Setup design panel event listeners
         */
        setupDesignPanelEventListeners(modal, componentId) {
            const saveBtn = modal.querySelector('#save-design-changes');
            
            if (saveBtn) {
                saveBtn.addEventListener('click', async () => {
                    try {
                        // Collect form data from design panel
                        const formData = this.collectDesignPanelData(modal);
                        
                        if (Object.keys(formData).length > 0) {
                            // Update component with new properties
                            if (window.enhancedStateManager) {
                                window.enhancedStateManager.updateComponent(componentId, formData);
                            }
                            
                            logger.info('COMPONENT', `Design changes saved for ${componentId}`, formData);
                            
                            if (window.showToast) {
                                window.showToast('Component updated successfully', 'success', 3000);
                            }
                        }
                        
                        // Close modal
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                        document.body.classList.remove('modal-open');
                        
                    } catch (error) {
                        logger.error('COMPONENT', `Failed to save design changes for ${componentId}:`, error);
                        
                        if (window.showToast) {
                            window.showToast('Failed to save changes', 'error', 3000);
                        }
                    }
                });
            }
        }
        
        /**
         * ROOT FIX: Collect form data from design panel
         */
        collectDesignPanelData(modal) {
            const formData = {};
            
            // Collect input values
            const inputs = modal.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (input.id && input.value) {
                    const key = input.id.replace('component-', '');
                    formData[key] = input.value;
                }
            });
            
            logger.debug('COMPONENT', 'Collected design panel data:', formData);
            return formData;
        }

        /**
         * Generate unique component ID
         */
        generateComponentId(componentType) {
            this.componentCounter++;
            return `${componentType}-${Date.now()}-${this.componentCounter}`;
        }

        /**
         * Get default props for component type
         */
        getDefaultProps(componentType) {
            const defaults = {
                hero: {
                    title: 'Professional Headline',
                    subtitle: 'Your expertise in one powerful line',
                    buttonText: 'Get In Touch'
                },
                biography: {
                    bio: 'Share your professional story here...'
                },
                contact: {
                    email: '',
                    phone: '',
                    website: ''
                },
                topics: {
                    topics: []
                },
                social: {
                    platforms: []
                },
                testimonials: {
                    testimonials: []
                }
            };

            return defaults[componentType] || {};
        }

        /**
         * ROOT FIX: Synchronize Component Manager with State Manager
         * This fixes the core issue where components exist in state but not in component manager
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

                // Clear existing component tracking to start fresh
                this.components.clear();

                // Add all state components to component manager
                stateComponentIds.forEach(componentId => {
                    const componentData = stateComponents[componentId];
                    if (componentData && componentData.type) {
                        // Ensure component has required properties
                        const normalizedComponent = {
                            id: componentId,
                            type: componentData.type,
                            props: componentData.props || {},
                            timestamp: componentData.timestamp || Date.now()
                        };
                        
                        this.components.set(componentId, normalizedComponent);
                        logger.debug('COMPONENT', `Synchronized component: ${componentId} (${componentData.type})`);
                    } else {
                        logger.warn('COMPONENT', `Skipping invalid component data for ${componentId}`, componentData);
                    }
                });

                logger.info('COMPONENT', `Synchronization complete: ${this.components.size} components now tracked`);
                
                // ROOT FIX: Verify synchronization by checking for mismatches
                const managerIds = Array.from(this.components.keys());
                const missingInManager = stateComponentIds.filter(id => !managerIds.includes(id));
                const extraInManager = managerIds.filter(id => !stateComponentIds.includes(id));
                
                if (missingInManager.length > 0) {
                    logger.warn('COMPONENT', `Components missing in manager after sync: ${missingInManager.join(', ')}`);
                }
                if (extraInManager.length > 0) {
                    logger.warn('COMPONENT', `Extra components in manager after sync: ${extraInManager.join(', ')}`);
                }
                
                if (missingInManager.length === 0 && extraInManager.length === 0) {
                    logger.info('COMPONENT', '✅ Component Manager and State Manager are now synchronized');
                }

            } catch (error) {
                logger.error('COMPONENT', 'Failed to synchronize with state manager', error);
            }
        }

        /**
         * Get component by ID
         */
        getComponent(componentId) {
            // ROOT FIX: If component not found in manager but exists in state, sync and retry
            if (!this.components.has(componentId) && window.enhancedStateManager) {
                const stateComponent = window.enhancedStateManager.getComponent(componentId);
                if (stateComponent) {
                    logger.info('COMPONENT', `Component ${componentId} found in state but not manager, syncing...`);
                    
                    // Add the component to manager from state
                    const normalizedComponent = {
                        id: componentId,
                        type: stateComponent.type,
                        props: stateComponent.props || {},
                        timestamp: stateComponent.timestamp || Date.now()
                    };
                    this.components.set(componentId, normalizedComponent);
                    
                    logger.info('COMPONENT', `Synchronized missing component: ${componentId}`);
                    return normalizedComponent;
                }
            }
            
            return this.components.get(componentId);
        }

        /**
         * Get all components
         */
        getAllComponents() {
            return Array.from(this.components.values());
        }

        /**
         * ROOT FIX: Direct WordPress data access (CHECKLIST COMPLIANT)
         * Uses WordPress global namespace pattern - no race conditions, no timeouts
         * @returns {Object} WordPress data object
         */
        getWordPressData() {
            // ROOT FIX: Cache data once accessed to avoid repeated global object access
            if (this.cachedWordPressData) {
                return this.cachedWordPressData;
            }

            // ROOT FIX: Access WordPress data from global namespace (WordPress standard pattern)
            let wpData = null;
            
            // Primary: Use gmkbData (main WordPress data object)
            if (window.gmkbData && window.gmkbData.ajaxUrl && window.gmkbData.nonce) {
                wpData = window.gmkbData;
                logger.debug('COMPONENT', 'Using gmkbData for WordPress data');
            }
            // Fallback 1: Use guestifyData alias
            else if (window.guestifyData && window.guestifyData.ajaxUrl && window.guestifyData.nonce) {
                wpData = window.guestifyData;
                logger.debug('COMPONENT', 'Using guestifyData for WordPress data');
            }
            // Fallback 2: Use MKCG alias  
            else if (window.MKCG && window.MKCG.ajaxUrl && window.MKCG.nonce) {
                wpData = window.MKCG;
                logger.debug('COMPONENT', 'Using MKCG for WordPress data');
            }
            // Fallback 3: Try to get from window.wordpressDataCache if set by event
            else if (window.wordpressDataCache && window.wordpressDataCache.ajaxUrl && window.wordpressDataCache.nonce) {
                wpData = window.wordpressDataCache;
                logger.debug('COMPONENT', 'Using wordpressDataCache for WordPress data');
            }
            else {
                // ROOT FIX: If no data available, provide meaningful error
                const availableGlobals = Object.keys(window).filter(key => 
                    key.toLowerCase().includes('data') || key === 'MKCG'
                ).join(', ');
                
                logger.error('COMPONENT', 'WordPress data not found in global namespace', {
                    availableGlobals,
                    gmkbDataExists: !!window.gmkbData,
                    guestifyDataExists: !!window.guestifyData,
                    MCKGExists: !!window.MKCG
                });
                
                throw new Error('WordPress data not available. Available globals: ' + availableGlobals);
            }

            // ROOT FIX: Validate required fields
            if (!wpData.ajaxUrl || !wpData.nonce) {
                logger.error('COMPONENT', 'WordPress data missing required fields', {
                    hasAjaxUrl: !!wpData.ajaxUrl,
                    hasNonce: !!wpData.nonce,
                    dataKeys: Object.keys(wpData)
                });
                throw new Error('WordPress data missing required fields (ajaxUrl or nonce)');
            }

            // Cache for future use
            this.cachedWordPressData = wpData;
            
            logger.debug('COMPONENT', 'WordPress data accessed successfully', {
                source: wpData === window.gmkbData ? 'gmkbData' : 
                       wpData === window.guestifyData ? 'guestifyData' : 
                       wpData === window.MKCG ? 'MKCG' : 'other',
                hasAjaxUrl: !!wpData.ajaxUrl,
                hasNonce: !!wpData.nonce,
                hasPostId: !!wpData.postId,
                postId: wpData.postId
            });

            return wpData;
        }

        /**
         * ROOT FIX: Manual save method (for save button)
         * CHECKLIST COMPLIANT: Event-driven, no polling, root cause fix
         */
        async manualSave() {
            try {
                logger.info('COMPONENT', 'Manual save requested');
                
                // ROOT FIX: Emit save start event for render protection
                if (window.eventBus) {
                    window.eventBus.emit('gmkb:manual-save-start', {
                        timestamp: Date.now(),
                        source: 'manual_save_button'
                    });
                }
                
                // ROOT FIX: Temporarily disable rendering during save to prevent state conflicts
                const wasRenderingDisabled = window.enhancedComponentRenderer ? window.enhancedComponentRenderer.disableRendering : false;
                if (window.enhancedComponentRenderer) {
                    window.enhancedComponentRenderer.disableRendering = true;
                }
                
                try {
                    await this.autoSaveState('manual_save', { source: 'save_button' });
                    logger.info('COMPONENT', 'Manual save completed successfully');
                    
                    // ROOT FIX: Brief delay to ensure save completion before re-enabling rendering
                    setTimeout(() => {
                        if (window.enhancedComponentRenderer) {
                            window.enhancedComponentRenderer.disableRendering = wasRenderingDisabled;
                        }
                    }, 100);
                    
                    return true;
                } catch (saveError) {
                    // Re-enable rendering immediately on error
                    if (window.enhancedComponentRenderer) {
                        window.enhancedComponentRenderer.disableRendering = wasRenderingDisabled;
                    }
                    throw saveError;
                }
            } catch (error) {
                logger.error('COMPONENT', 'Manual save failed:', error);
                throw error;
            }
        }

        /**
         * Check if manager is ready
         */
        isReady() {
            return this.isInitialized && window.enhancedStateManager;
        }

        /**
         * ROOT FIX: Auto-save current state to database
         * CHECKLIST COMPLIANT: Event-driven, no polling, root cause fix
         * @param {string} action - Action that triggered the save (component_added, component_removed)
         * @param {Object} metadata - Additional metadata about the action
         */
        async autoSaveState(action, metadata = {}) {
            try {
                // Get current state from state manager
                if (!window.enhancedStateManager) {
                    throw new Error('State manager not available for auto-save');
                }

                const currentState = window.enhancedStateManager.getState();
                if (!currentState) {
                    throw new Error('No state available for auto-save');
                }

                // Get WordPress data for AJAX call
                const wpData = this.getWordPressData();
                
                logger.debug('COMPONENT', `Auto-saving state after ${action}`, {
                    componentCount: Object.keys(currentState.components || {}).length,
                    action,
                    metadata
                });

                // Prepare save request
                const formData = new FormData();
                formData.append('action', 'guestify_save_media_kit');
                formData.append('nonce', wpData.nonce);
                formData.append('post_id', wpData.postId);
                formData.append('state', JSON.stringify(currentState));
                
                // Add metadata for tracking
                formData.append('auto_save', 'true');
                formData.append('trigger_action', action);
                formData.append('trigger_metadata', JSON.stringify(metadata));

                // Make AJAX request to save
                const response = await fetch(wpData.ajaxUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const responseData = await response.json();

                if (responseData.success) {
                    logger.debug('COMPONENT', `Auto-save successful after ${action}`, {
                        components: responseData.data?.components_count || 'unknown',
                        dataSize: responseData.data?.data_size || 'unknown'
                    });
                    
                    // Emit success event
                    document.dispatchEvent(new CustomEvent('gmkb:auto-save-success', {
                        detail: {
                            action,
                            metadata,
                            response: responseData.data
                        }
                    }));
                    
                    return responseData.data;
                } else {
                    throw new Error(responseData.data?.message || 'Auto-save failed');
                }

            } catch (error) {
                logger.error('COMPONENT', `Auto-save failed after ${action}:`, error);
                
                // Emit failure event
                document.dispatchEvent(new CustomEvent('gmkb:auto-save-failed', {
                    detail: {
                        action,
                        metadata,
                        error: error.message
                    }
                }));
                
                throw error;
            }
        }

        /**
         * ROOT FIX: Clear cached WordPress data (useful for testing)
         */
        clearWordPressDataCache() {
            this.cachedWordPressData = null;
            logger.debug('COMPONENT', 'WordPress data cache cleared');
        }
    }

    // ROOT FIX: Create and expose globally
    window.EnhancedComponentManager = EnhancedComponentManager;
    window.enhancedComponentManager = new EnhancedComponentManager();
    
    // ROOT FIX: Event-driven initialization - wait for state manager to be ready
    let componentManagerInitialized = false;
    
    const initializeComponentManager = () => {
        if (componentManagerInitialized) return;
        
        if (window.enhancedStateManager && window.enhancedStateManager.isInitialized) {
            // ROOT FIX: Check if already initialized to prevent double initialization
            if (window.enhancedComponentManager.isInitialized) {
                componentManagerInitialized = true;
                logger.info('COMPONENT', 'Component Manager already initialized, skipping');
                return;
            }
            
            componentManagerInitialized = true;
            window.enhancedComponentManager.initialize();
            logger.info('COMPONENT', 'Component Manager initialized after State Manager ready');
        } else {
            // Listen for state manager ready event
            document.addEventListener('gmkb:state-manager-ready', () => {
                if (!componentManagerInitialized && !window.enhancedComponentManager.isInitialized) {
                    componentManagerInitialized = true;
                    window.enhancedComponentManager.initialize();
                    logger.info('COMPONENT', 'Component Manager initialized via state manager ready event');
                }
            }, { once: true });
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeComponentManager);
    } else {
        // DOM already ready, try to initialize
        initializeComponentManager();
    }
    
    // ROOT FIX: Listen for component addition events from component library
    document.addEventListener('gmkb:add-component', async (event) => {
        const { componentType, props, source } = event.detail;
        
        logger.info('COMPONENT', `Received add-component event from ${source}`, {
            componentType,
            props
        });
        
        try {
            if (window.enhancedComponentManager.isReady()) {
                await window.enhancedComponentManager.addComponent(componentType, props);
                logger.info('COMPONENT', `Successfully added component via event: ${componentType}`);
            } else {
                logger.warn('COMPONENT', 'Component manager not ready, initializing...');
                window.enhancedComponentManager.initialize();
                await window.enhancedComponentManager.addComponent(componentType, props);
            }
        } catch (error) {
            logger.error('COMPONENT', `Failed to add component via event: ${componentType}`, error);
        }
    });
    
    // ROOT FIX: Setup state change listener when both managers are ready
    const setupStateChangeListener = () => {
        if (window.enhancedStateManager && window.enhancedComponentManager && window.enhancedComponentManager.isInitialized) {
            window.enhancedStateManager.subscribeGlobal((state) => {
                // Check for sync issues and fix them automatically
                const stateComponentIds = Object.keys(state.components || {});
                const managerComponentIds = Array.from(window.enhancedComponentManager.components.keys());
                
                // If there are components in state but not in manager, sync them
                const missingInManager = stateComponentIds.filter(id => !managerComponentIds.includes(id));
                if (missingInManager.length > 0) {
                    logger.info('COMPONENT', `Auto-syncing ${missingInManager.length} missing components from state`);
                    window.enhancedComponentManager.synchronizeWithState();
                }
            });
            logger.info('COMPONENT', 'State change listener setup complete');
        }
    };
    
    // Setup listener when component manager is ready
    document.addEventListener('gmkb:component-manager-ready', setupStateChangeListener, { once: true });
    
    // Or setup immediately if already ready
    if (window.enhancedComponentManager && window.enhancedComponentManager.isInitialized) {
        setupStateChangeListener();
    }
    
    // ROOT FIX: Listen for component control action events from ComponentControlsManager
    document.addEventListener('gmkb:component-edit-requested', (event) => {
        const { componentId } = event.detail;
        logger.info('COMPONENT', `Edit requested for component: ${componentId}`);
        
        try {
            if (window.enhancedComponentManager && window.enhancedComponentManager.editComponent) {
                window.enhancedComponentManager.editComponent(componentId);
            } else {
                logger.error('COMPONENT', 'Component manager or editComponent method not available');
                if (window.showToast) {
                    window.showToast('Edit failed - component manager not ready', 'error', 3000);
                }
            }
        } catch (error) {
            logger.error('COMPONENT', `Failed to edit component: ${componentId}`, error);
            if (window.showToast) {
                window.showToast('Failed to open component editor', 'error', 3000);
            }
        }
    });
    
    document.addEventListener('gmkb:component-delete-requested', async (event) => {
        const { componentId } = event.detail;
        logger.info('COMPONENT', `Delete requested for component: ${componentId}`);
        
        try {
            await window.enhancedComponentManager.removeComponent(componentId);
            logger.info('COMPONENT', `Successfully deleted component: ${componentId}`);
        } catch (error) {
            logger.error('COMPONENT', `Failed to delete component: ${componentId}`, error);
        }
    });
    
    document.addEventListener('gmkb:component-duplicate-requested', async (event) => {
        const { componentId } = event.detail;
        logger.info('COMPONENT', `Duplicate requested for component: ${componentId}`);
        
        try {
            // ROOT FIX: Get component with automatic sync if needed
            const originalComponent = window.enhancedComponentManager.getComponent(componentId);
            if (originalComponent) {
                const duplicatedId = await window.enhancedComponentManager.addComponent(
                    originalComponent.type, 
                    { ...originalComponent.props }
                );
                logger.info('COMPONENT', `Successfully duplicated component: ${componentId} → ${duplicatedId}`);
                
                if (window.showToast) {
                    window.showToast('Component duplicated', 'success', 2000);
                }
            } else {
                logger.warn('COMPONENT', `Component not found for duplication: ${componentId}`);
                if (window.showToast) {
                    window.showToast('Component not found for duplication', 'error', 3000);
                }
            }
        } catch (error) {
            logger.error('COMPONENT', `Failed to duplicate component: ${componentId}`, error);
            if (window.showToast) {
                window.showToast('Failed to duplicate component', 'error', 3000);
            }
        }
    });
    
    document.addEventListener('gmkb:component-move-up-requested', (event) => {
        const { componentId } = event.detail;
        logger.info('COMPONENT', `Move up requested for component: ${componentId}`);
        
        try {
            // ROOT FIX: Use correct moveComponent method with 'up' direction
            if (window.enhancedStateManager && window.enhancedStateManager.moveComponent) {
                window.enhancedStateManager.moveComponent(componentId, 'up');
                logger.info('COMPONENT', `Component moved up: ${componentId}`);
                
                // Show user feedback
                if (window.showToast) {
                    window.showToast('Component moved up', 'success', 2000);
                }
            } else {
                logger.error('COMPONENT', 'State manager or moveComponent method not available');
                if (window.showToast) {
                    window.showToast('Move up failed - state manager not ready', 'error', 3000);
                }
            }
        } catch (error) {
            logger.error('COMPONENT', `Failed to move component up: ${componentId}`, error);
            if (window.showToast) {
                window.showToast('Failed to move component up', 'error', 3000);
            }
        }
    });
    
    document.addEventListener('gmkb:component-move-down-requested', (event) => {
        const { componentId } = event.detail;
        logger.info('COMPONENT', `Move down requested for component: ${componentId}`);
        
        try {
            // ROOT FIX: Use correct moveComponent method with 'down' direction
            if (window.enhancedStateManager && window.enhancedStateManager.moveComponent) {
                window.enhancedStateManager.moveComponent(componentId, 'down');
                logger.info('COMPONENT', `Component moved down: ${componentId}`);
                
                // Show user feedback
                if (window.showToast) {
                    window.showToast('Component moved down', 'success', 2000);
                }
            } else {
                logger.error('COMPONENT', 'State manager or moveComponent method not available');
                if (window.showToast) {
                    window.showToast('Move down failed - state manager not ready', 'error', 3000);
                }
            }
        } catch (error) {
            logger.error('COMPONENT', `Failed to move component down: ${componentId}`, error);
            if (window.showToast) {
                window.showToast('Failed to move component down', 'error', 3000);
            }
        }
    });
    
    // ROOT FIX: Add debug function for testing component controls
    window.testComponentControls = function(componentId) {
        if (!componentId) {
            console.log('Usage: testComponentControls("component-id")');
            const availableComponents = window.enhancedComponentManager ? Array.from(window.enhancedComponentManager.components.keys()) : [];
            console.log('Available components:', availableComponents);
            return;
        }
        
        console.group('🧪 Testing Component Controls for:', componentId);
        
        // Test edit
        console.log('Testing edit...');
        document.dispatchEvent(new CustomEvent('gmkb:component-edit-requested', {
            detail: { componentId }
        }));
        
        // Test move up
        setTimeout(() => {
            console.log('Testing move up...');
            document.dispatchEvent(new CustomEvent('gmkb:component-move-up-requested', {
                detail: { componentId }
            }));
        }, 1000);
        
        // Test move down
        setTimeout(() => {
            console.log('Testing move down...');
            document.dispatchEvent(new CustomEvent('gmkb:component-move-down-requested', {
                detail: { componentId }
            }));
        }, 2000);
        
        console.groupEnd();
    };
    
    // ROOT FIX: Complete state synchronization and deletion function
    window.nukAllComponentsForReal = async function() {
        console.log('💣 NUCLEAR DELETION: Synchronizing and clearing ALL data sources...');
        
        try {
            // 1. FORCE SYNCHRONIZATION FIRST
            console.log('🔄 Force synchronizing Component Manager with State Manager...');
            window.enhancedComponentManager.synchronizeWithState();
            
            // 2. DIAGNOSE THE SYNC ISSUE
            console.group('🔍 Pre-deletion State Analysis');
            const managerComponents = Array.from(window.enhancedComponentManager.components.keys());
            const stateComponents = Object.keys(window.enhancedStateManager.getState().components);
            const wpComponents = window.gmkbData?.saved_components?.length || 0;
            const domComponents = document.querySelectorAll('[data-component-id]').length;
            
            console.log('Manager Components:', managerComponents.length, managerComponents);
            console.log('State Components:', stateComponents.length, stateComponents);
            console.log('WordPress Components:', wpComponents);
            console.log('DOM Components:', domComponents);
            console.groupEnd();
            
            // 3. DELETE ALL COMPONENTS FROM SYNCHRONIZED SOURCES
            console.log('🗑️ Deleting all components from synchronized sources...');
            
            const allComponentIds = Array.from(window.enhancedComponentManager.components.keys());
            console.log(`Deleting ${allComponentIds.length} components...`);
            
            // Delete each component properly (this updates both manager and state)
            for (const componentId of allComponentIds) {
                try {
                    await window.enhancedComponentManager.removeComponent(componentId);
                    console.log('✅ Deleted:', componentId);
                } catch (error) {
                    console.warn('⚠️ Failed to delete:', componentId, error.message);
                    // Force remove from state if manager delete failed
                    window.enhancedStateManager.removeComponent(componentId);
                }
            }
            
            // 4. FORCE CLEAR ALL REMAINING DATA
            console.log('🧹 Force clearing all remaining data...');
            
            // Clear State Manager
            window.enhancedStateManager.state.components = {};
            window.enhancedStateManager.state.layout = [];
            window.enhancedStateManager.state.saved_components = [];
            
            // Clear Component Manager
            window.enhancedComponentManager.components.clear();
            
            // Clear WordPress Data
            if (window.gmkbData) {
                window.gmkbData.saved_components = [];
                window.gmkbData.saved_state = {
                    components: {},
                    layout: [],
                    globalSettings: {}
                };
            }
            
            // Clear DOM completely
            const previewContainer = document.getElementById('media-kit-preview');
            if (previewContainer) {
                previewContainer.innerHTML = '';
            }
            
            // Clear localStorage
            localStorage.removeItem('guestifyMediaKitState');
            
            // 5. FORCE DATABASE SAVE
            console.log('💾 Force saving empty state to database...');
            await window.enhancedComponentManager.manualSave();
            
            // 6. VERIFICATION
            console.group('✅ Post-deletion Verification');
            console.log('Manager Components:', window.enhancedComponentManager.components.size);
            console.log('State Components:', Object.keys(window.enhancedStateManager.getState().components).length);
            console.log('DOM Components:', document.querySelectorAll('[data-component-id]').length);
            console.groupEnd();
            
            // 7. Show empty state
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            
            console.log('🎉 NUCLEAR DELETION COMPLETE! All sources synchronized and cleared.');
            console.log('🔄 Refresh the page to verify persistence.');
            
            return true;
            
        } catch (error) {
            console.error('❌ Nuclear deletion failed:', error);
            return false;
        }
    };
    
    // ROOT FIX: Diagnostic function to check sync status
    window.checkComponentSync = function() {
        console.group('🔍 Component Synchronization Status');
        
        const managerComponents = Array.from(window.enhancedComponentManager.components.keys());
        const stateComponents = Object.keys(window.enhancedStateManager.getState().components);
        const wpComponents = window.gmkbData?.saved_components || [];
        const domElements = Array.from(document.querySelectorAll('[data-component-id]')).map(el => el.getAttribute('data-component-id'));
        
        console.log('🎯 Component Manager:', managerComponents.length, 'components');
        console.log('📊 State Manager:', stateComponents.length, 'components');
        console.log('💾 WordPress Data:', wpComponents.length, 'components');
        console.log('🌐 DOM Elements:', domElements.length, 'elements');
        
        // Check for orphaned components
        const orphanedInState = stateComponents.filter(id => !managerComponents.includes(id));
        const orphanedInManager = managerComponents.filter(id => !stateComponents.includes(id));
        const orphanedInDOM = domElements.filter(id => !stateComponents.includes(id));
        
        if (orphanedInState.length > 0) {
            console.warn('⚠️ Orphaned in State Manager:', orphanedInState);
            console.log('🔧 Auto-fixing: Synchronizing Component Manager with State Manager...');
            window.enhancedComponentManager.synchronizeWithState();
        }
        if (orphanedInManager.length > 0) {
            console.warn('⚠️ Orphaned in Component Manager:', orphanedInManager);
        }
        if (orphanedInDOM.length > 0) {
            console.warn('⚠️ Orphaned in DOM:', orphanedInDOM);
        }
        
        const isSync = (managerComponents.length === stateComponents.length && 
                       orphanedInState.length === 0 && 
                       orphanedInManager.length === 0);
        
        console.log(isSync ? '✅ All sources synchronized' : '❌ Sources out of sync');
        console.groupEnd();
        
        return {
            isSync,
            managerCount: managerComponents.length,
            stateCount: stateComponents.length,
            wpCount: wpComponents.length,
            domCount: domElements.length,
            orphanedInState,
            orphanedInManager,
            orphanedInDOM
        };
    };
    
    // ROOT FIX: Create simple toast notification system if none exists
    if (!window.showToast) {
        window.showToast = function(message, type, duration = 3000) {
            console.log(`Toast [${type}]: ${message}`);
            
            // Create visual toast notification
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 24px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                max-width: 300px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            `;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            // Show toast
            setTimeout(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(0)';
            }, 10);
            
            // Hide and remove toast
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
        };
    }
    
    // ROOT FIX: Add auto-sync function for manual triggering
    window.forceComponentSync = function() {
        console.log('🔄 Force synchronizing Component Manager with State Manager...');
        if (window.enhancedComponentManager && window.enhancedComponentManager.synchronizeWithState) {
            window.enhancedComponentManager.synchronizeWithState();
            console.log('✅ Synchronization complete');
            return window.checkComponentSync();
        } else {
            console.error('❌ Component Manager not available');
            return false;
        }
    };

    if (window.gmkbData?.debugMode) {
        console.log('✅ Enhanced Component Manager: Available globally and ready');
        console.log('✅ Enhanced Component Manager: Event listeners for gmkb:add-component ready');
        console.log('🧪 Debug functions available: testComponentControls(), nukAllComponentsForReal(), checkComponentSync(), forceComponentSync()');
    }

})();
