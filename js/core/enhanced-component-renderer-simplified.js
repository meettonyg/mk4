/**
 * @file enhanced-component-renderer-simplified.js
 * @description ROOT FIX: Simplified Direct Component Renderer with Phase 2 Integration
 * 
 * ✅ CHECKLIST COMPLIANT:
 * - Phase 1: No polling, event-driven initialization, root cause fix
 * - Phase 2: Configuration-driven rendering with data binding
 * - Phase 3: Centralized state through state manager only
 * - Phase 4: Graceful failure, actionable errors
 * - Phase 5: Correct WordPress integration
 * 
 * ARCHITECTURE: Component-agnostic renderer that respects component self-containment
 */

(function() {
    'use strict';
    
    // ✅ CHECKLIST COMPLIANT: Event-driven initialization only
    const initWhenReady = () => {
        if (window.structuredLogger && window.enhancedStateManager) {
            initializeSimplifiedRenderer();
            return;
        }
        
        // ✅ NO POLLING: Listen for dependency ready events only
        document.addEventListener('gmkb:core-systems-ready', () => {
            if (window.structuredLogger && window.enhancedStateManager) {
                initializeSimplifiedRenderer();
            }
        }, { once: true });
    };
    
    const initializeSimplifiedRenderer = () => {
        const structuredLogger = window.structuredLogger;
        const stateManager = window.enhancedStateManager;
        
        if (!structuredLogger || !stateManager) {
            console.error('❌ CRITICAL: Dependencies not available for simplified renderer');
            return;
        }
        
        structuredLogger.info('RENDER', '🎨 [PHASE 2] Simplified Component Renderer initializing...');

        class SimplifiedComponentRenderer {
            constructor() {
                this.logger = structuredLogger;
                this.stateManager = stateManager;
                this.initialized = false;
                this.componentCache = new Map();
                this.renderQueue = new Set();
                this.isProcessingQueue = false;
                
                this.logger.info('RENDER', '🎨 [PHASE 2] Simplified renderer constructor complete');
                this.init();
            }
            
            /**
             * ✅ PHASE 2: Handle forced component rerender from options UI
             */
            async handleForceRerender(detail) {
                const { componentId, componentData } = detail;
                
                if (!componentId) {
                    this.logger.warn('RENDER', '⚠️ [PHASE 2] Force rerender: no component ID provided');
                    return;
                }
                
                this.logger.debug('RENDER', `🔄 [PHASE 2] Force rerender requested for ${componentId}`);
                
                // Force update the component
                await this.updateComponent(componentId, componentData);
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Direct initialization without service coordination
             */
            async init() {
                if (this.initialized) {
                    this.logger.debug('RENDER', 'Already initialized');
                    return;
                }
                
                try {
                    // ✅ ROOT FIX: Initialize container display based on initial state
                    this.initializeContainerDisplay();
                    
                    // ✅ SIMPLIFIED: Direct state subscription without complex coordination
                    this.stateUnsubscribe = this.stateManager.subscribeGlobal((state) => {
                        this.onStateChange(state);
                    });
                    
                    // PHASE 2: Listen for forced component rerenders from options UI
                    document.addEventListener('gmkb:force-component-rerender', (event) => {
                        this.handleForceRerender(event.detail);
                    });
                    
                    // ROOT FIX: Listen for all sections removed to update container display
                    document.addEventListener('gmkb:all-sections-removed', () => {
                        const state = this.stateManager.getState();
                        this.updateContainerDisplay(state);
                    });
                    
                    // ✅ ROOT CAUSE FIX: Render initial state immediately
                    const initialState = this.stateManager.getState();
                    if (initialState && initialState.components) {
                        await this.renderInitialComponents(initialState);
                    }
                    
                    this.initialized = true;
                    this.logger.info('RENDER', '✅ [PHASE 2] Simplified renderer initialized successfully');
                    
                    // ✅ CHECKLIST COMPLIANT: Emit ready event
                    document.dispatchEvent(new CustomEvent('gmkb:enhanced-component-renderer-ready', {
                        detail: { 
                            renderer: this,
                            simplified: true,
                            phase2: true,
                            timestamp: Date.now()
                        }
                    }));
                    
                } catch (error) {
                    this.logger.error('RENDER', '❌ [PHASE 2] Initialization failed:', error);
                }
            }
            
            /**
             * ✅ ROOT FIX: Initialize container display based on actual state
             * Containers are always present in DOM (rendered by PHP), we only control visibility
             */
            initializeContainerDisplay() {
                const initialState = this.stateManager.getState();
                const savedContainer = document.getElementById('saved-components-container');
                const emptyState = document.getElementById('empty-state');
                
                // ROOT FIX: Both containers should always exist (rendered by PHP)
                if (!savedContainer || !emptyState) {
                    this.logger.error('RENDER', '❌ Required containers missing from DOM', {
                        savedContainer: !!savedContainer,
                        emptyState: !!emptyState
                    });
                    // Don't try to create them - this is a template error that needs fixing
                    return;
                }
                
                // Check for content
                const hasComponents = initialState?.components && Object.keys(initialState.components).length > 0;
                const hasSections = initialState?.sections && Array.isArray(initialState.sections) && initialState.sections.length > 0;
                const hasContent = hasComponents || hasSections;
                
                this.logger.info('RENDER', `🎆 Initializing container visibility - hasComponents: ${hasComponents}, hasSections: ${hasSections}`);
                
                // ROOT FIX: Simple visibility toggle - containers always exist
                if (hasContent) {
                    // Show saved container, hide empty state
                    savedContainer.style.display = 'block';
                    emptyState.style.display = 'none';
                    this.logger.info('RENDER', '✅ Showing saved-components-container (has content)');
                } else {
                    // Show empty state, hide saved container
                    savedContainer.style.display = 'none';
                    emptyState.style.display = 'block';
                    this.logger.info('RENDER', '✅ Showing empty-state (no content)');
                }
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Direct initial rendering without service coordination
             */
            async renderInitialComponents(state) {
                const components = state.components || {};
                const componentIds = Object.keys(components);
                
                if (componentIds.length === 0) {
                    this.logger.debug('RENDER', 'No components to render initially');
                    // Container display already handled by initializeContainerDisplay
                    return;
                }
                
                this.logger.info('RENDER', `🎨 [PHASE 2] Rendering ${componentIds.length} initial components`);
                
                const container = this.getOrCreateContainer();
                if (!container) {
                    this.logger.error('RENDER', 'Could not find or create components container');
                    return;
                }
                
                // ✅ SIMPLIFIED: Direct rendering without complex batching
                for (const componentId of componentIds) {
                    const componentData = components[componentId];
                    if (componentData && componentData.type) {
                        const element = await this.renderComponent(componentId, componentData);
                        if (element) {
                            container.appendChild(element);
                            this.componentCache.set(componentId, element);
                        }
                    }
                }
                
                // ROOT CAUSE FIX: After initial render, ensure controls are attached
                // This handles the case where components render before controls manager is ready
                const ensureControlsAttached = () => {
                    if (window.componentControlsManager && window.componentControlsManager.isInitialized) {
                        for (const [componentId, element] of this.componentCache) {
                            if (!element.querySelector('.component-controls')) {
                                const success = window.componentControlsManager.attachControls(element, componentId);
                                if (success) {
                                    this.logger.debug('RENDER', `✅ Controls attached to ${componentId} after initial render`);
                                }
                            }
                        }
                    }
                };
                
                // Check if controls manager is already ready
                if (window.componentControlsManager && window.componentControlsManager.isInitialized) {
                    ensureControlsAttached();
                } else {
                    // Wait for controls manager to be ready
                    document.addEventListener('gmkb:component-controls-ready', ensureControlsAttached, { once: true });
                }
                
                // Container display is managed by initializeContainerDisplay and updateContainerDisplay
            }
            
            /**
             * ✅ SIMPLIFIED: Direct state change handling without complex diffing
             */
            onStateChange(newState) {
                if (!this.initialized) {
                    this.logger.debug('RENDER', 'Not initialized, ignoring state change');
                    return;
                }
                
                this.logger.debug('RENDER', '🔄 [PHASE 2] Processing state change');
                this.processStateChange(newState);
            }
            
            /**
             * ✅ SIMPLIFIED: Direct state processing without service coordination
             * ANTI-DUPLICATION: Respect section-managed components
             * ROOT FIX: Properly handle duplicated components
             */
            async processStateChange(newState) {
                const components = newState.components || {};
                const componentIds = Object.keys(components);
                const container = this.getOrCreateContainer();
                
                if (!container) {
                    this.logger.error('RENDER', 'Components container not available');
                    return;
                }
                
                // ✅ SIMPLIFIED: Smart update approach - don't remove everything
                const currentComponents = Array.from(this.componentCache.keys());
                
                // Remove components that no longer exist in state (unless in sections)
                for (const componentId of currentComponents) {
                    if (!components[componentId] && !this.isComponentInSection(componentId)) {
                        this.removeComponent(componentId);
                    }
                }
                
                // Add or update components (unless handled by sections)
                for (const componentId of componentIds) {
                    const componentData = components[componentId];
                    if (componentData && componentData.type) {
                        // Skip if component is managed by sections
                        if (this.isComponentInSection(componentId)) {
                            continue;
                        }
                        
                        // ROOT FIX: Check if component exists in DOM but not in cache (duplication case)
                        const existingElement = document.getElementById(componentId);
                        if (existingElement && !this.componentCache.has(componentId)) {
                            // Component exists in DOM but not in cache - add to cache
                            this.componentCache.set(componentId, existingElement);
                            this.logger.debug('RENDER', `Added existing DOM element to cache: ${componentId}`);
                            
                            // ROOT FIX: Ensure controls are attached to duplicated component
                            if (window.componentControlsManager && window.componentControlsManager.isInitialized) {
                                setTimeout(() => {
                                    const success = window.componentControlsManager.attachControls(existingElement, componentId);
                                    if (success) {
                                        this.logger.debug('RENDER', `Controls attached to duplicated component: ${componentId}`);
                                    }
                                }, 100);
                            }
                            continue;
                        }
                        
                        if (this.componentCache.has(componentId)) {
                            await this.updateComponent(componentId, componentData);
                        } else {
                            await this.addComponent(componentId, componentData);
                        }
                    }
                }
                
                // ✅ SIMPLIFIED: Direct layout ordering (only for non-section components)
                const nonSectionComponents = componentIds.filter(id => !this.isComponentInSection(id));
                this.applyLayout(newState.layout || nonSectionComponents);
                this.updateContainerDisplay(newState);
            }
            
            /**
             * ARCHITECTURE: Check if component requires server-side rendering
             * Components declare this requirement via configuration, not hardcoded logic
             */
            async checkServerRenderRequirement(componentType) {
                // Check component's own configuration file
                if (window.gmkbData?.componentSchemas?.[componentType]?.requiresServerRender) {
                    return true;
                }
                
                // Check if component has self-registered for server rendering
                if (window.gmkbServerRenderComponents?.has(componentType)) {
                    return true;
                }
                
                // Check configuration manager for component schema
                const configManager = window.componentConfigurationManager;
                if (configManager) {
                    const schema = configManager.getComponentSchema?.(componentType);
                    if (schema?.requiresServerRender) {
                        return true;
                    }
                }
                
                // Default: client-side rendering
                return false;
            }
            
            /**
             * ✅ PHASE 2: Configuration-driven component rendering
             * ARCHITECTURE: Component-agnostic - checks configuration for rendering requirements
             */
            async renderComponent(componentId, componentData) {
                try {
                    const element = document.createElement('div');
                    element.id = componentId;
                    element.className = 'gmkb-component';
                    element.setAttribute('data-component-id', componentId);
                    element.setAttribute('data-component-type', componentData.type);
                    element.style.position = 'relative'; // Ensure controls can be positioned
                    
                    // ARCHITECTURE: Check component configuration for rendering requirements
                    const requiresServerRender = await this.checkServerRenderRequirement(componentData.type);
                    
                    let html;
                    if (requiresServerRender) {
                        // Component has indicated it needs server-side rendering for data
                        this.logger.debug('RENDER', `Component ${componentData.type} requires server rendering`);
                        html = await this.fetchServerRenderedHTML(componentId, componentData);
                        if (!html) {
                            // Fallback to client-side if server unavailable
                            this.logger.warn('RENDER', `Server rendering failed for ${componentData.type}, falling back to client-side`);
                            html = await this.generateConfigurationDrivenHTML(componentId, componentData);
                        }
                    } else {
                        // ✅ PHASE 2: Standard configuration-driven HTML generation
                        html = await this.generateConfigurationDrivenHTML(componentId, componentData);
                    }
                    
                    element.innerHTML = html;
                    
                    // ✅ ROOT FIX: Attach controls immediately after rendering
                    // This ensures controls are always present, not relying on events
                    if (window.componentControlsManager && window.componentControlsManager.isInitialized) {
                        const success = window.componentControlsManager.attachControls(element, componentId);
                        if (!success) {
                            this.logger.warn('RENDER', `Failed to attach controls to ${componentId}`);
                        }
                    } else {
                        // ROOT CAUSE FIX: ComponentControlsManager not ready yet
                        // Listen for it to be ready and then attach controls
                        const attachWhenReady = () => {
                            if (window.componentControlsManager && window.componentControlsManager.isInitialized) {
                                const success = window.componentControlsManager.attachControls(element, componentId);
                                if (success) {
                                    this.logger.info('RENDER', `✅ Controls attached to ${componentId} after manager ready`);
                                }
                            }
                        };
                        
                        // Listen for controls manager ready event
                        document.addEventListener('gmkb:component-controls-ready', attachWhenReady, { once: true });
                        
                        // Also check if it became ready while we were setting up the listener
                        if (window.componentControlsManager && window.componentControlsManager.isInitialized) {
                            attachWhenReady();
                        }
                    }
                    
                    // ✅ CHECKLIST COMPLIANT: Emit component rendered event for other systems
                    document.dispatchEvent(new CustomEvent('gmkb:component-rendered', {
                        detail: {
                            componentId,
                            element,
                            componentData,
                            phase2: true,
                            timestamp: Date.now()
                        }
                    }));
                    
                    this.logger.debug('RENDER', `✅ [PHASE 2] Rendered component: ${componentId}`);
                    return element;
                    
                } catch (error) {
                    this.logger.error('RENDER', `❌ Failed to render component ${componentId}:`, error);
                    // Fallback to basic rendering if Phase 2 fails
                    return this.renderBasicComponent(componentId, componentData);
                }
            }
            
            /**
             * ARCHITECTURE: Generic server-side rendering for data-dependent components
             * Works for any component that declares server render requirement
             */
            async fetchServerRenderedHTML(componentId, componentData) {
                try {
                    // Get post ID from global context or state
                    const postId = window.gmkbData?.postId || 
                                  document.body.getAttribute('data-post-id') || 
                                  new URLSearchParams(window.location.search).get('post_id') || 
                                  new URLSearchParams(window.location.search).get('mkcg_id') || 
                                  0;
                    
                    if (!postId) {
                        this.logger.warn('RENDER', 'No post ID available for server rendering');
                        return null;
                    }
                    
                    const formData = new FormData();
                    formData.append('action', 'guestify_render_component');
                    formData.append('component', componentData.type);
                    formData.append('post_id', postId);
                    formData.append('nonce', window.gmkbData?.nonce || '');
                    formData.append('props', JSON.stringify({
                        ...componentData.props,
                        component_id: componentId,
                        post_id: postId
                    }));
                    
                    const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (result.success && result.data?.html) {
                        this.logger.debug('RENDER', `✅ Server-rendered HTML fetched for ${componentId}`);
                        return result.data.html;
                    } else {
                        this.logger.warn('RENDER', `Failed to fetch server HTML for ${componentId}`);
                        return null;
                    }
                } catch (error) {
                    this.logger.error('RENDER', `Error fetching server HTML: ${error.message}`);
                    return null;
                }
            }
            
            /**
             * ✅ PHASE 2: Configuration-driven HTML generation with data binding
             */
            async generateConfigurationDrivenHTML(componentId, componentData) {
                const componentType = componentData.type;
                
                // Get configuration manager and data binding engine
                const configManager = window.componentConfigurationManager;
                const dataBindingEngine = window.dataBindingEngine;
                
                if (!configManager || !dataBindingEngine) {
                    this.logger.warn('RENDER', '⚠️ [PHASE 2] Configuration systems not available, falling back to basic rendering');
                    return this.generateBasicComponentHTML(componentId, componentData);
                }
                
                // Register or get component configuration
                let componentConfig = configManager.getComponentConfiguration(componentId);
                if (!componentConfig) {
                    componentConfig = configManager.registerConfiguration(componentId, componentType);
                    if (!componentConfig) {
                        this.logger.warn('RENDER', `⚠️ [PHASE 2] Could not create configuration for ${componentType}`);
                        return this.generateBasicComponentHTML(componentId, componentData);
                    }
                }
                
                // Bind data using configuration
                const sourceData = componentData.props || componentData.data || {};
                const boundData = dataBindingEngine.bindComponentData(
                    componentId, 
                    componentType, 
                    componentConfig.dataBindings,
                    sourceData
                );
                
                // Generate HTML using configuration and bound data
                const html = this.generateConfiguredHTML(componentType, boundData, componentConfig.componentOptions);
                
                this.logger.debug('RENDER', `🔗 [PHASE 2] Generated configured HTML for ${componentType}`, {
                    componentId,
                    boundDataKeys: Object.keys(boundData),
                    hasOptions: !!componentConfig.componentOptions
                });
                
                return html;
            }
            
            /**
             * ✅ PHASE 2: Generate HTML using component configuration and options
             * ARCHITECTURE: Component-agnostic - delegates to registry for self-registered components
             * MIGRATION COMPLETE: All components now use self-registration, no hardcoded methods
             */
            generateConfiguredHTML(componentType, boundData, componentOptions = {}) {
                // Primary: Use component registry for all rendering
                if (window.GMKBComponentRegistry) {
                    try {
                        const renderer = window.GMKBComponentRegistry.getRenderer(componentType);
                        return renderer(boundData, componentOptions);
                    } catch (error) {
                        this.logger.error('RENDER', `Registry render failed for ${componentType}:`, error);
                        // Return error component
                        return this.renderErrorComponent(componentType, error);
                    }
                }
                
                // Fallback: Registry not available (should never happen)
                this.logger.error('RENDER', 'Component registry not available!');
                return `<div class="gmkb-component gmkb-component--error">
                    <h3>⚠️ Component Registry Error</h3>
                    <p>Unable to render ${componentType} - registry not available</p>
                </div>`;
            }
            
            /**
             * Render error component
             */
            renderErrorComponent(type, error) {
                return `<div class="gmkb-component gmkb-component--error">
                    <h3>⚠️ Error Rendering ${type}</h3>
                    <p>${this.escapeHtml(error.message)}</p>
                </div>`;
            }
            
            // ===============================================
            // 📦 LEGACY METHODS - CAN BE DELETED
            // All component rendering now handled by GMKBComponentRegistry
            // These methods are no longer used as of 2025-02-02
            // Keeping temporarily for emergency rollback only
            // DELETE AFTER: 2025-02-09 (one week stability period)
            // ===============================================
            
            /**
             * DEPRECATED - Kept only as emergency fallback
             * Remove this method once registry is stable in production
             */
            generateConfiguredTopicsHTML(boundData, options = {}) {
                const title = boundData.title || 'Speaking Topics';
                const topics = boundData.topics || [];
                const layout = options.layout || 'grid';
                const maxTopics = options.maxTopics || 20;
                const showPriority = options.showPriority || false;
                const columnsDesktop = options.columnsDesktop || '3';
                
                let html = `<div class="gmkb-topics gmkb-topics--${layout} gmkb-component--configured">
                    <h3 class="gmkb-topics__title">${this.escapeHtml(title)}</h3>
                    <div class="gmkb-component__phase2-badge">[PHASE 2 CONFIGURED]</div>`;
                
                if (topics.length > 0) {
                    const displayTopics = topics.slice(0, maxTopics);
                    
                    if (layout === 'grid') {
                        html += `<div class="gmkb-topics__grid" style="grid-template-columns: repeat(${columnsDesktop}, 1fr);">`;
                        displayTopics.forEach(topic => {
                            const topicTitle = topic.topic_title || topic.title || '';
                            const topicDescription = topic.topic_description || topic.description || '';
                            const priority = showPriority && topic.priority ? `<span class="gmkb-topics__priority">${topic.priority}</span>` : '';
                            html += `<div class="gmkb-topics__item">
                                ${priority}
                                <h4>${this.escapeHtml(topicTitle)}</h4>
                                <p>${this.escapeHtml(topicDescription)}</p>
                            </div>`;
                        });
                        html += '</div>';
                    } else if (layout === 'list') {
                        html += '<ul class="gmkb-topics__list">';
                        displayTopics.forEach(topic => {
                            const topicTitle = topic.topic_title || topic.title || '';
                            const topicDescription = topic.topic_description || topic.description || '';
                            const priority = showPriority && topic.priority ? `<span class="gmkb-topics__priority">${topic.priority}</span>` : '';
                            html += `<li class="gmkb-topics__item">
                                ${priority}
                                <h4>${this.escapeHtml(topicTitle)}</h4>
                                <p>${this.escapeHtml(topicDescription)}</p>
                            </li>`;
                        });
                        html += '</ul>';
                    } else if (layout === 'tags') {
                        html += '<div class="gmkb-topics__tags">';
                        displayTopics.forEach(topic => {
                            const topicTitle = topic.topic_title || topic.title || '';
                            html += `<span class="gmkb-topics__tag">${this.escapeHtml(topicTitle)}</span>`;
                        });
                        html += '</div>';
                    }
                } else {
                    html += '<p class="gmkb-topics__empty">No topics configured yet.</p>';
                }
                
                html += '</div>';
                return html;
            }
            
            /**
             * ✅ PHASE 2: Generate configured hero HTML with layout and styling options
             */
            generateConfiguredHeroHTML(boundData, options = {}) {
                const title = boundData.title || boundData.full_name || 'Guest Name';
                const subtitle = boundData.subtitle || boundData.guest_title || '';
                const description = boundData.description || boundData.biography || '';
                const image = boundData.image || boundData.guest_headshot || '';
                const layout = options.layout || 'left_aligned';
                const imageStyle = options.imageStyle || 'rounded';
                const showSocialLinks = options.showSocialLinks !== false;
                const backgroundColor = options.backgroundColor || '#ffffff';
                const textColor = options.textColor || '#333333';
                
                let heroClass = `gmkb-hero gmkb-hero--${layout} gmkb-component--configured`;
                let heroStyle = `background-color: ${backgroundColor}; color: ${textColor};`;
                
                let html = `<div class="${heroClass}" style="${heroStyle}">
                    <div class="gmkb-component__phase2-badge">[PHASE 2 CONFIGURED - ${layout.toUpperCase()}]</div>`;
                
                if (layout === 'left_aligned') {
                    html += '<div class="gmkb-hero__container">';
                    if (image) {
                        html += `<div class="gmkb-hero__image-container">
                            <img src="${this.escapeHtml(image)}" alt="${this.escapeHtml(title)}" class="gmkb-hero__image gmkb-hero__image--${imageStyle}">
                        </div>`;
                    }
                    html += `<div class="gmkb-hero__content">
                        <h1 class="gmkb-hero__title">${this.escapeHtml(title)}</h1>`;
                    if (subtitle) {
                        html += `<h2 class="gmkb-hero__subtitle">${this.escapeHtml(subtitle)}</h2>`;
                    }
                    if (description) {
                        html += `<p class="gmkb-hero__description">${this.escapeHtml(description)}</p>`;
                    }
                    if (showSocialLinks) {
                        html += '<div class="gmkb-hero__social-placeholder">[Social Links Enabled]</div>';
                    }
                    html += '</div></div>';
                } else if (layout === 'center_aligned') {
                    html += '<div class="gmkb-hero__container gmkb-hero__container--center">';
                    if (image) {
                        html += `<div class="gmkb-hero__image-container">
                            <img src="${this.escapeHtml(image)}" alt="${this.escapeHtml(title)}" class="gmkb-hero__image gmkb-hero__image--${imageStyle}">
                        </div>`;
                    }
                    html += `<div class="gmkb-hero__content gmkb-hero__content--center">
                        <h1 class="gmkb-hero__title">${this.escapeHtml(title)}</h1>`;
                    if (subtitle) {
                        html += `<h2 class="gmkb-hero__subtitle">${this.escapeHtml(subtitle)}</h2>`;
                    }
                    if (description) {
                        html += `<p class="gmkb-hero__description">${this.escapeHtml(description)}</p>`;
                    }
                    if (showSocialLinks) {
                        html += '<div class="gmkb-hero__social-placeholder">[Social Links Enabled]</div>';
                    }
                    html += '</div></div>';
                } else { // right_aligned
                    html += '<div class="gmkb-hero__container gmkb-hero__container--right">';
                    html += `<div class="gmkb-hero__content gmkb-hero__content--right">
                        <h1 class="gmkb-hero__title">${this.escapeHtml(title)}</h1>`;
                    if (subtitle) {
                        html += `<h2 class="gmkb-hero__subtitle">${this.escapeHtml(subtitle)}</h2>`;
                    }
                    if (description) {
                        html += `<p class="gmkb-hero__description">${this.escapeHtml(description)}</p>`;
                    }
                    if (showSocialLinks) {
                        html += '<div class="gmkb-hero__social-placeholder">[Social Links Enabled]</div>';
                    }
                    html += '</div>';
                    if (image) {
                        html += `<div class="gmkb-hero__image-container">
                            <img src="${this.escapeHtml(image)}" alt="${this.escapeHtml(title)}" class="gmkb-hero__image gmkb-hero__image--${imageStyle}">
                        </div>`;
                    }
                    html += '</div>';
                }
                
                html += '</div>';
                return html;
            }
            
            /**
             * ✅ PHASE 2: Generate configured contact HTML with layout and display options
             */
            generateConfiguredContactHTML(boundData, options = {}) {
                const title = 'Contact Information';
                const email = boundData.email || '';
                const phone = boundData.phone || '';
                const website = boundData.website || '';
                const location = boundData.location || '';
                const layout = options.layout || 'vertical';
                const showIcons = options.showIcons !== false;
                const showLabels = options.showLabels !== false;
                
                let html = `<div class="gmkb-contact gmkb-contact--${layout} gmkb-component--configured">
                    <h3 class="gmkb-contact__title">${this.escapeHtml(title)}</h3>
                    <div class="gmkb-component__phase2-badge">[PHASE 2 CONFIGURED - ${layout.toUpperCase()}]</div>`;
                
                const contactItems = [];
                
                if (email) {
                    const icon = showIcons ? '<span class="gmkb-contact__icon">📧</span>' : '';
                    const label = showLabels ? '<strong>Email:</strong> ' : '';
                    contactItems.push(`<div class="gmkb-contact__item">
                        ${icon}${label}<a href="mailto:${this.escapeHtml(email)}">${this.escapeHtml(email)}</a>
                    </div>`);
                }
                
                if (phone) {
                    const icon = showIcons ? '<span class="gmkb-contact__icon">📞</span>' : '';
                    const label = showLabels ? '<strong>Phone:</strong> ' : '';
                    contactItems.push(`<div class="gmkb-contact__item">
                        ${icon}${label}<a href="tel:${this.escapeHtml(phone)}">${this.escapeHtml(phone)}</a>
                    </div>`);
                }
                
                if (website) {
                    const icon = showIcons ? '<span class="gmkb-contact__icon">🌐</span>' : '';
                    const label = showLabels ? '<strong>Website:</strong> ' : '';
                    contactItems.push(`<div class="gmkb-contact__item">
                        ${icon}${label}<a href="${this.escapeHtml(website)}" target="_blank" rel="noopener">${this.escapeHtml(website)}</a>
                    </div>`);
                }
                
                if (location) {
                    const icon = showIcons ? '<span class="gmkb-contact__icon">📍</span>' : '';
                    const label = showLabels ? '<strong>Location:</strong> ' : '';
                    contactItems.push(`<div class="gmkb-contact__item">
                        ${icon}${label}${this.escapeHtml(location)}
                    </div>`);
                }
                
                if (contactItems.length > 0) {
                    if (layout === 'grid') {
                        html += '<div class="gmkb-contact__grid">' + contactItems.join('') + '</div>';
                    } else if (layout === 'horizontal') {
                        html += '<div class="gmkb-contact__horizontal">' + contactItems.join('') + '</div>';
                    } else {
                        // vertical layout
                        html += '<div class="gmkb-contact__info">' + contactItems.join('') + '</div>';
                    }
                } else {
                    html += '<p class="gmkb-contact__empty">No contact information available.</p>';
                }
                
                html += '</div>';
                return html;
            }
            
            /**
             * ✅ PHASE 2: Generate configured default component HTML
             */
            generateConfiguredDefaultHTML(componentType, boundData, options = {}) {
                const displayName = componentType.charAt(0).toUpperCase() + componentType.slice(1);
                const layout = options.layout || 'default';
                
                return `<div class="gmkb-component-${componentType} gmkb-component-${componentType}--${layout} gmkb-component--configured">
                    <h3 class="gmkb-component__title">${this.escapeHtml(displayName)} Component</h3>
                    <div class="gmkb-component__phase2-badge">[PHASE 2 CONFIGURED]</div>
                    <div class="gmkb-component__content">
                        <p class="gmkb-component__status">✅ Configuration-driven rendering active</p>
                        <div class="gmkb-component__data">
                            <strong>Bound Data Keys:</strong> ${Object.keys(boundData).join(', ')}<br>
                            <strong>Component Options:</strong> ${Object.keys(options).join(', ')}<br>
                            <strong>Layout:</strong> ${layout}
                        </div>
                    </div>
                </div>`;
            }
            
            // Simplified methods for other component types
            generateConfiguredBiographyHTML(boundData, options = {}) {
                return this.generateConfiguredDefaultHTML('biography', boundData, options);
            }
            
            generateConfiguredSocialLinksHTML(boundData, options = {}) {
                return this.generateConfiguredDefaultHTML('social-links', boundData, options);
            }
            
            generateConfiguredPortfolioHTML(boundData, options = {}) {
                return this.generateConfiguredDefaultHTML('portfolio', boundData, options);
            }
            
            /**
             * ✅ FALLBACK: Basic HTML generation (legacy compatibility)
             */
            generateBasicComponentHTML(componentId, componentData) {
                const props = componentData.props || componentData.data || {};
                const type = componentData.type;
                
                // ✅ SIMPLIFIED: Basic HTML templates for each component type (unchanged for fallback)
                switch (type) {
                    case 'topics':
                        return this.generateTopicsHTML(props);
                    case 'hero':
                        return this.generateHeroHTML(props);
                    case 'biography':
                        return this.generateBiographyHTML(props);
                    case 'social-links':
                        return this.generateSocialLinksHTML(props);
                    case 'contact':
                        return this.generateContactHTML(props);
                    case 'portfolio':
                        return this.generatePortfolioHTML(props);
                    default:
                        return this.generateDefaultHTML(type, props);
                }
            }
            
            /**
             * ✅ FALLBACK: Render basic component if Phase 2 fails completely
             */
            renderBasicComponent(componentId, componentData) {
                try {
                    const element = document.createElement('div');
                    element.id = componentId;
                    element.className = 'gmkb-component gmkb-component--fallback';
                    element.setAttribute('data-component-id', componentId);
                    element.setAttribute('data-component-type', componentData.type);
                    element.style.position = 'relative';
                    
                    const html = this.generateBasicComponentHTML(componentId, componentData);
                    element.innerHTML = html;
                    
                    this.logger.warn('RENDER', `⚠️ [FALLBACK] Rendered basic component: ${componentId}`);
                    return element;
                    
                } catch (error) {
                    this.logger.error('RENDER', `❌ [FALLBACK] Failed to render basic component ${componentId}:`, error);
                    return null;
                }
            }
            
            /**
             * ✅ SIMPLIFIED: Direct HTML templates without complex processing
             */
            generateTopicsHTML(props) {
                const title = props.title || 'Speaking Topics';
                const topics = props.topics || [];
                
                let html = `<div class="gmkb-topics">
                    <h3 class="gmkb-topics__title">${this.escapeHtml(title)}</h3>`;
                
                if (topics.length > 0) {
                    html += '<ul class="gmkb-topics__list">';
                    topics.forEach(topic => {
                        const topicTitle = topic.topic_title || topic.title || '';
                        const topicDescription = topic.topic_description || topic.description || '';
                        html += `<li class="gmkb-topics__item">
                            <h4>${this.escapeHtml(topicTitle)}</h4>
                            <p>${this.escapeHtml(topicDescription)}</p>
                        </li>`;
                    });
                    html += '</ul>';
                } else {
                    html += '<p class="gmkb-topics__empty">No topics configured yet.</p>';
                }
                
                html += '</div>';
                return html;
            }
            
            generateHeroHTML(props) {
                const title = props.title || props.full_name || 'Guest Name';
                const subtitle = props.subtitle || props.guest_title || '';
                const description = props.description || props.biography || '';
                const image = props.image || props.guest_headshot || '';
                
                return `<div class="gmkb-hero">
                    ${image ? `<img src="${this.escapeHtml(image)}" alt="${this.escapeHtml(title)}" class="gmkb-hero__image">` : ''}
                    <div class="gmkb-hero__content">
                        <h1 class="gmkb-hero__title">${this.escapeHtml(title)}</h1>
                        ${subtitle ? `<h2 class="gmkb-hero__subtitle">${this.escapeHtml(subtitle)}</h2>` : ''}
                        ${description ? `<p class="gmkb-hero__description">${this.escapeHtml(description)}</p>` : ''}
                    </div>
                </div>`;
            }
            
            generateBiographyHTML(props) {
                const title = props.title || 'Biography';
                const content = props.biography || props.content || '';
                
                return `<div class="gmkb-biography">
                    <h3 class="gmkb-biography__title">${this.escapeHtml(title)}</h3>
                    <div class="gmkb-biography__content">${this.escapeHtml(content)}</div>
                </div>`;
            }
            
            generateSocialLinksHTML(props) {
                const title = props.title || 'Connect With Me';
                const links = props.links || [];
                
                let html = `<div class="gmkb-social-links">
                    <h3 class="gmkb-social-links__title">${this.escapeHtml(title)}</h3>`;
                
                if (links.length > 0) {
                    html += '<ul class="gmkb-social-links__list">';
                    links.forEach(link => {
                        const url = link.url || '';
                        const platform = link.platform || link.name || 'Link';
                        html += `<li><a href="${this.escapeHtml(url)}" target="_blank" rel="noopener">${this.escapeHtml(platform)}</a></li>`;
                    });
                    html += '</ul>';
                } else {
                    html += '<p class="gmkb-social-links__empty">No social links configured.</p>';
                }
                
                html += '</div>';
                return html;
            }
            
            generateContactHTML(props) {
                const title = props.title || 'Contact Information';
                const email = props.email || '';
                const phone = props.phone || '';
                const website = props.website || '';
                
                return `<div class="gmkb-contact">
                    <h3 class="gmkb-contact__title">${this.escapeHtml(title)}</h3>
                    <div class="gmkb-contact__info">
                        ${email ? `<p><strong>Email:</strong> <a href="mailto:${this.escapeHtml(email)}">${this.escapeHtml(email)}</a></p>` : ''}
                        ${phone ? `<p><strong>Phone:</strong> <a href="tel:${this.escapeHtml(phone)}">${this.escapeHtml(phone)}</a></p>` : ''}
                        ${website ? `<p><strong>Website:</strong> <a href="${this.escapeHtml(website)}" target="_blank" rel="noopener">${this.escapeHtml(website)}</a></p>` : ''}
                    </div>
                </div>`;
            }
            
            generatePortfolioHTML(props) {
                const title = props.title || 'Portfolio';
                const items = props.items || [];
                
                let html = `<div class="gmkb-portfolio">
                    <h3 class="gmkb-portfolio__title">${this.escapeHtml(title)}</h3>`;
                
                if (items.length > 0) {
                    html += '<div class="gmkb-portfolio__grid">';
                    items.forEach(item => {
                        const itemTitle = item.title || '';
                        const itemDescription = item.description || '';
                        const itemImage = item.image || '';
                        html += `<div class="gmkb-portfolio__item">
                            ${itemImage ? `<img src="${this.escapeHtml(itemImage)}" alt="${this.escapeHtml(itemTitle)}">` : ''}
                            <h4>${this.escapeHtml(itemTitle)}</h4>
                            <p>${this.escapeHtml(itemDescription)}</p>
                        </div>`;
                    });
                    html += '</div>';
                } else {
                    html += '<p class="gmkb-portfolio__empty">No portfolio items configured.</p>';
                }
                
                html += '</div>';
                return html;
            }
            
            generateDefaultHTML(type, props) {
                return `<div class="gmkb-component-${type}">
                    <h3>${this.escapeHtml(type.charAt(0).toUpperCase() + type.slice(1))} Component</h3>
                    <p>Component data: ${JSON.stringify(props)}</p>
                </div>`;
            }
            
            /**
             * ✅ SECURITY: HTML escaping
             */
            escapeHtml(text) {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Direct component addition without complex service calls
             * SECTION-AWARE: Place components in their assigned sections
             */
            async addComponent(componentId, componentData) {
                // ROOT FIX: Check if component already exists in DOM (from section system)
                const existingInDOM = document.getElementById(componentId) || 
                                     document.querySelector(`[data-component-id="${componentId}"]`);
                
                if (existingInDOM) {
                    this.logger.debug('RENDER', `Component ${componentId} already exists in DOM - skipping duplicate creation`);
                    this.componentCache.set(componentId, existingInDOM);
                    return;
                }
                
                // ROOT FIX: Check if component has section assignment
                const sectionId = componentData.sectionId;
                let targetContainer;
                
                if (sectionId) {
                    // Component should be in a section
                    const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
                    if (sectionElement) {
                        // ROOT FIX: Look for the correct section container structure
                        // Section renderer creates: .gmkb-section__inner with either .gmkb-section__content or .gmkb-section__column
                        const innerContainer = sectionElement.querySelector('.gmkb-section__inner');
                        
                        if (innerContainer) {
                            // Check for columns first (multi-column layout)
                            const columns = innerContainer.querySelectorAll('.gmkb-section__column');
                            if (columns.length > 0) {
                                // Multi-column layout - use first column by default
                                targetContainer = columns[0];
                                this.logger.debug('RENDER', `Placing component ${componentId} in section ${sectionId} column 1`);
                            } else {
                                // Single column layout - use content area
                                targetContainer = innerContainer.querySelector('.gmkb-section__content');
                                if (!targetContainer) {
                                    // Fallback to inner container itself
                                    targetContainer = innerContainer;
                                }
                                this.logger.debug('RENDER', `Placing component ${componentId} in section ${sectionId} content area`);
                            }
                        } else {
                            // No inner container, use section element itself
                            targetContainer = sectionElement;
                            this.logger.warn('RENDER', `Section ${sectionId} has no inner container, using section element`);
                        }
                    } else {
                        // Section doesn't exist yet, render it first
                        this.logger.warn('RENDER', `Section ${sectionId} not found for component ${componentId}`);
                        // Fall back to main container
                        targetContainer = this.getOrCreateContainer();
                    }
                } else {
                    // No section assignment, use main container
                    targetContainer = this.getOrCreateContainer();
                }
                
                if (!targetContainer) {
                    this.logger.error('RENDER', 'Cannot add component - no container available');
                    return;
                }
                
                const element = await this.renderComponent(componentId, componentData);
                if (element) {
                    // Add section ID as data attribute if assigned
                    if (sectionId) {
                        element.setAttribute('data-section-id', sectionId);
                    }
                    targetContainer.appendChild(element);
                    this.componentCache.set(componentId, element);
                    this.logger.info('RENDER', `✅ [PHASE 2] Added component: ${componentId} to ${sectionId || 'main container'}`);
                }
            }
            
            /**
             * ROOT FIX: Check if component is handled by section system
             */
            isComponentInSection(componentId) {
                // Check if component exists within any section
                const sectionElements = document.querySelectorAll('[data-section-id]');
                
                for (const section of sectionElements) {
                    const componentInSection = section.querySelector(`[data-component-id="${componentId}"]`);
                    if (componentInSection) {
                        this.logger.debug('RENDER', `Component ${componentId} found in section ${section.dataset.sectionId}`);
                        return true;
                    }
                }
                
                return false;
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Direct component update without complex diffing
             * ARCHITECTURE: Component-agnostic - checks configuration for rendering requirements
             * ROOT FIX: Preserve selection state through destructive re-rendering
             */
            async updateComponent(componentId, componentData) {
                // ROOT FIX: Check if component is in a section first
                if (this.isComponentInSection(componentId)) {
                    this.logger.debug('RENDER', `Component ${componentId} is in section - skipping update`);
                    return;
                }
                
                const existingElement = this.componentCache.get(componentId);
                if (!existingElement) {
                    this.logger.debug('RENDER', `Component ${componentId} not in cache, adding instead`);
                    await this.addComponent(componentId, componentData);
                    return;
                }
                
                // ROOT FIX: Check if this component is currently selected
                const isSelected = existingElement.classList.contains('selected') || 
                                 existingElement.classList.contains('gmkb-component--selected');
                
                // ROOT FIX: Dispatch before-update event to prevent deselection
                document.dispatchEvent(new CustomEvent('gmkb:before-component-update', {
                    detail: { componentId, isSelected, timestamp: Date.now() }
                }));
                
                // ROOT CAUSE FIX: Preserve controls during update
                // Save existing controls before updating
                const existingControls = existingElement.querySelector('.component-controls');
                
                // ARCHITECTURE: Check component configuration for rendering requirements
                const requiresServerRender = await this.checkServerRenderRequirement(componentData.type);
                
                let html;
                if (requiresServerRender) {
                    // Component has indicated it needs server-side rendering for data
                    html = await this.fetchServerRenderedHTML(componentId, componentData);
                    if (!html) {
                        // Fallback to client-side if server unavailable
                        html = await this.generateConfigurationDrivenHTML(componentId, componentData);
                    }
                } else {
                    // ✅ PHASE 2: Standard configuration-driven HTML generation
                    html = await this.generateConfigurationDrivenHTML(componentId, componentData);
                }
                
                // ROOT FIX: Use a more surgical approach for selected components
                // Instead of destroying everything with innerHTML, try to preserve structure
                if (isSelected) {
                    // For selected components, try to update content more carefully
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    
                    // Try to preserve selection classes while updating content
                    const oldClasses = existingElement.className;
                    existingElement.innerHTML = html;
                    existingElement.className = oldClasses; // Restore all classes including selection
                } else {
                    // For non-selected components, use normal innerHTML replacement
                    existingElement.innerHTML = html;
                }
                
                existingElement.setAttribute('data-component-type', componentData.type);
                
                // ROOT CAUSE FIX: Restore controls after innerHTML update
                if (existingControls) {
                    // Controls existed, re-add them
                    existingElement.appendChild(existingControls);
                    this.logger.debug('RENDER', `✅ Preserved existing controls for ${componentId}`);
                } else {
                    // No controls existed, try to attach new ones
                    // ✅ ROOT FIX: Re-attach controls after update (innerHTML clears them)
                    if (window.componentControlsManager && window.componentControlsManager.isInitialized) {
                        const success = window.componentControlsManager.attachControls(existingElement, componentId);
                        if (!success) {
                            this.logger.warn('RENDER', `Failed to re-attach controls to ${componentId} after update`);
                        }
                    } else {
                        // Controls manager not ready, wait for it
                        document.addEventListener('gmkb:component-controls-ready', () => {
                            if (!existingElement.querySelector('.component-controls')) {
                                window.componentControlsManager.attachControls(existingElement, componentId);
                            }
                        }, { once: true });
                    }
                }
                
                // ROOT FIX: If component was selected, restore selection
                if (isSelected) {
                    existingElement.classList.add('selected', 'gmkb-component--selected');
                    // Re-trigger selection event to ensure design panel knows component is still selected
                    setTimeout(() => {
                        document.dispatchEvent(new CustomEvent('gmkb:component-selected', {
                            detail: {
                                componentId,
                                componentType: componentData.type,
                                element: existingElement,
                                timestamp: Date.now(),
                                isRestoration: true
                            }
                        }));
                    }, 10);
                }
                
                // ROOT FIX: Dispatch after-update event to allow re-selection
                document.dispatchEvent(new CustomEvent('gmkb:after-component-update', {
                    detail: { componentId, isSelected, timestamp: Date.now() }
                }));
                
                // ✅ CHECKLIST COMPLIANT: Emit update event for other systems
                document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
                    detail: {
                        componentId,
                        element: existingElement,
                        componentData,
                        phase2: true,
                        timestamp: Date.now()
                    }
                }));
                
                this.logger.debug('RENDER', `🔄 [PHASE 2] Updated component: ${componentId}`);
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Direct component removal without complex cleanup
             */
            removeComponent(componentId) {
                const element = this.componentCache.get(componentId);
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                    this.componentCache.delete(componentId);
                    
                    // ✅ CHECKLIST COMPLIANT: Emit removal event
                    document.dispatchEvent(new CustomEvent('gmkb:component-removed', {
                        detail: {
                            componentId,
                            timestamp: Date.now()
                        }
                    }));
                    
                    this.logger.debug('RENDER', `🗑️ [PHASE 2] Removed component: ${componentId}`);
                }
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Simple layout application without complex reordering
             */
            applyLayout(layout) {
                if (!Array.isArray(layout) || layout.length === 0) {
                    this.logger.debug('RENDER', 'No layout to apply');
                    return;
                }
                
                const container = this.getOrCreateContainer();
                if (!container) return;
                
                // ✅ SIMPLIFIED: Re-append elements in layout order
                layout.forEach(componentId => {
                    const element = this.componentCache.get(componentId);
                    if (element && element.parentNode === container) {
                        container.appendChild(element); // Re-appending moves to end
                    }
                });
                
                this.logger.debug('RENDER', `🎯 [PHASE 2] Applied layout order: ${layout.join(', ')}`);
            }
            
            /**
             * ✅ ROOT FIX: Get the component container
             * Containers are always rendered by PHP, we just find them
             */
            getOrCreateContainer() {
                // First try to find the direct container inside saved-components-container
                let container = document.getElementById('components-direct-container');
                
                if (container) {
                    this.logger.debug('RENDER', 'Found components-direct-container');
                    return container;
                }
                
                // Fallback to saved-components-container itself
                container = document.getElementById('saved-components-container');
                
                if (container) {
                    this.logger.debug('RENDER', 'Using saved-components-container as fallback');
                    return container;
                }
                
                // If containers don't exist, this is a template error
                this.logger.error('RENDER', '❌ Component containers missing from DOM - template error');
                return null;
            }
            
            /**
             * ✅ SIMPLIFIED: Update container visibility based on state
             * Containers always exist, we only toggle visibility
             */
            updateContainerDisplay(state) {
                const savedContainer = document.getElementById('saved-components-container');
                const emptyState = document.getElementById('empty-state');
                
                // Both containers must exist (rendered by PHP)
                if (!savedContainer || !emptyState) {
                    this.logger.error('RENDER', '❌ Cannot update display - containers missing');
                    return;
                }
                
                const hasComponents = state.components && Object.keys(state.components).length > 0;
                const hasSections = state.sections && Array.isArray(state.sections) && state.sections.length > 0;
                const hasContent = hasComponents || hasSections;
                
                this.logger.debug('RENDER', `📊 Updating display - hasComponents: ${hasComponents}, hasSections: ${hasSections}`);
                
                // Simple visibility toggle
                if (hasContent) {
                    savedContainer.style.display = 'block';
                    emptyState.style.display = 'none';
                    this.logger.debug('RENDER', '👁️ Showing saved-components-container');
                } else {
                    savedContainer.style.display = 'none';
                    emptyState.style.display = 'block';
                    this.logger.debug('RENDER', '👁️ Showing empty-state');
                }
            }
            
            /**
             * ✅ PUBLIC API: Render single component (for external use)
             */
            async renderSingleComponent(componentConfig) {
                const componentId = componentConfig.id || `component_${Date.now()}`;
                const componentData = {
                    type: componentConfig.type,
                    props: componentConfig.props || componentConfig.data || {}
                };
                
                const element = await this.renderComponent(componentId, componentData);
                
                return {
                    success: !!element,
                    id: componentId,
                    element: element,
                    error: element ? null : 'Failed to render component',
                    phase2: true
                };
            }
            
            /**
             * ✅ DIAGNOSTICS: Simple stats without complex tracking
             */
            getStats() {
                return {
                    initialized: this.initialized,
                    cachedComponents: this.componentCache.size,
                    componentIds: Array.from(this.componentCache.keys()),
                    queueSize: this.renderQueue.size,
                    isProcessingQueue: this.isProcessingQueue,
                    simplified: true,
                    phase2: true,
                    configurationDriven: true
                };
            }
            
            /**
             * ✅ CHECKLIST COMPLIANT: Graceful cleanup
             */
            destroy() {
                this.logger.info('RENDER', '🔄 [PHASE 2] Destroying simplified renderer');
                
                if (this.stateUnsubscribe) {
                    this.stateUnsubscribe();
                    this.stateUnsubscribe = null;
                }
                
                this.componentCache.clear();
                this.renderQueue.clear();
                this.initialized = false;
                
                this.logger.info('RENDER', '✅ [PHASE 2] Simplified renderer destroyed');
            }
        }
        
        // ✅ ROOT CAUSE FIX: Single instance only - no duplicate compatibility aliases
        window.SimplifiedComponentRenderer = SimplifiedComponentRenderer;
        window.enhancedComponentRenderer = new SimplifiedComponentRenderer();
        
        structuredLogger.info('RENDER', '🚀 [PHASE 2] Simplified Component Renderer ready with configuration-driven rendering!');
    };
    
    // ✅ EVENT-DRIVEN: Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }
    
})();
