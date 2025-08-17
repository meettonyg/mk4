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

            try {
                // Ensure we have access to state manager
                if (!window.enhancedStateManager) {
                    throw new Error('Enhanced state manager not available');
                }

                this.isInitialized = true;
                logger.info('COMPONENT', 'Enhanced Component Manager initialized successfully');

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
            }
        }

        /**
         * ROOT FIX: Remove component from preview and state
         * @param {string} componentId - Component ID to remove
         */
        async removeComponent(componentId) {
            try {
                if (!this.components.has(componentId)) {
                    logger.warn('COMPONENT', `Component not found for removal: ${componentId}`);
                    return;
                }

                const componentData = this.components.get(componentId);
                
                logger.info('COMPONENT', `Removing component: ${componentId}`, { type: componentData.type });

                // Remove from preview
                this.removeComponentFromPreview(componentId);

                // Update state manager
                if (window.enhancedStateManager) {
                    window.enhancedStateManager.removeComponent(componentId);
                }

                // Remove from local storage
                this.components.delete(componentId);

                // Emit event
                document.dispatchEvent(new CustomEvent('componentRemoved', {
                    detail: { 
                        componentId, 
                        componentType: componentData.type 
                    }
                }));

                logger.info('COMPONENT', `Component removed successfully: ${componentId}`);

            } catch (error) {
                logger.error('COMPONENT', `Failed to remove component: ${componentId}`, error);
                throw error;
            }
        }

        /**
         * ROOT FIX: Render component on server via AJAX
         * @param {string} componentType - Component type
         * @param {Object} props - Component props
         * @param {string} componentId - Component ID
         * @returns {Promise<string>} Rendered HTML
         */
        async renderComponentOnServer(componentType, props, componentId) {
            try {
                // ROOT FIX: Wait for WordPress data to be available
                const data = await this.waitForWordPressData();
                const ajaxUrl = data.ajaxUrl;
                const nonce = data.nonce;

                if (!ajaxUrl || !nonce) {
                    throw new Error('AJAX URL or nonce not available after waiting');
                }

                const formData = new FormData();
                formData.append('action', 'guestify_render_component');
                formData.append('nonce', nonce);
                formData.append('component', componentType);
                formData.append('props', JSON.stringify({ ...props, component_id: componentId }));

                const response = await fetch(ajaxUrl, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success && data.data && data.data.html) {
                    logger.debug('COMPONENT', `Server render successful: ${componentType}`);
                    return data.data.html;
                } else {
                    throw new Error(data.data?.message || 'Server render failed');
                }

            } catch (error) {
                logger.warn('COMPONENT', `Server render failed for ${componentType}, using fallback`, error.message);
                return this.createFallbackComponent(componentType, props, componentId);
            }
        }

        /**
         * ROOT FIX: Create fallback component HTML when server render fails
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
                            <div class="component-controls">
                                <button class="component-control edit-component" data-action="edit" title="Edit Component">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button class="component-control remove-component" data-action="remove" title="Remove Component">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3,6 5,6 21,6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
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
            const previewContainer = document.getElementById('media-kit-preview');
            const emptyState = document.getElementById('empty-state');
            
            if (!previewContainer) {
                throw new Error('Preview container not found');
            }

            // Hide empty state if visible
            if (emptyState) {
                emptyState.style.display = 'none';
            }

            // Create component wrapper
            const componentWrapper = document.createElement('div');
            componentWrapper.className = 'component-wrapper';
            componentWrapper.setAttribute('data-component-id', componentId);
            componentWrapper.innerHTML = html;

            // Add event listeners for component controls
            this.attachComponentEventListeners(componentWrapper, componentId);

            // Add to preview
            previewContainer.appendChild(componentWrapper);

            logger.debug('COMPONENT', `Component added to preview: ${componentId}`);
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
         * Attach event listeners to component controls
         */
        attachComponentEventListeners(componentWrapper, componentId) {
            // Edit button
            const editBtn = componentWrapper.querySelector('.edit-component');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.editComponent(componentId);
                });
            }

            // Remove button
            const removeBtn = componentWrapper.querySelector('.remove-component');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.removeComponent(componentId);
                });
            }
        }

        /**
         * Edit component (placeholder for now)
         */
        editComponent(componentId) {
            logger.info('COMPONENT', `Edit requested for component: ${componentId}`);
            // TODO: Implement component editing interface
            alert('Component editing interface coming soon!');
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
         * Get component by ID
         */
        getComponent(componentId) {
            return this.components.get(componentId);
        }

        /**
         * Get all components
         */
        getAllComponents() {
            return Array.from(this.components.values());
        }

        /**
         * ROOT FIX: Wait for WordPress localized data to be available
         * @returns {Promise<Object>} WordPress data object
         */
        async waitForWordPressData() {
            const maxAttempts = 50; // 5 seconds max wait
            const delay = 100; // 100ms between attempts
            
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                // Check for data in multiple possible locations
                const data = window.guestifyData || window.gmkbData || window.MKCG;
                
                if (data && data.ajaxUrl && data.nonce) {
                    logger.debug('COMPONENT', `WordPress data found on attempt ${attempt + 1}`, { 
                        source: window.guestifyData ? 'guestifyData' : window.gmkbData ? 'gmkbData' : 'MKCG',
                        hasAjaxUrl: !!data.ajaxUrl,
                        hasNonce: !!data.nonce
                    });
                    return data;
                }
                
                // Wait before next attempt
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            // Last resort: check if data exists but is incomplete
            const partialData = window.guestifyData || window.gmkbData || window.MKCG;
            if (partialData) {
                logger.warn('COMPONENT', 'Partial WordPress data found', {
                    hasAjaxUrl: !!partialData.ajaxUrl,
                    hasNonce: !!partialData.nonce,
                    availableKeys: Object.keys(partialData)
                });
            }
            
            throw new Error('WordPress data not available after waiting');
        }

        /**
         * Check if manager is ready
         */
        isReady() {
            return this.isInitialized && window.enhancedStateManager;
        }
    }

    // ROOT FIX: Create and expose globally
    window.EnhancedComponentManager = EnhancedComponentManager;
    window.enhancedComponentManager = new EnhancedComponentManager();
    
    console.log('✅ Enhanced Component Manager: Available globally and ready');

})();
