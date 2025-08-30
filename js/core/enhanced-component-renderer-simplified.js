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
             * This ensures the correct container is visible from the start
             */
            initializeContainerDisplay() {
                const initialState = this.stateManager.getState();
                const savedContainer = document.getElementById('saved-components-container');
                const emptyState = document.getElementById('empty-state');
                
                if (!savedContainer && !emptyState) {
                    this.logger.warn('RENDER', '⚠️ No containers found to initialize');
                    return;
                }
                
                // Check for content
                const hasComponents = initialState?.components && Object.keys(initialState.components).length > 0;
                const hasSections = initialState?.sections && Object.keys(initialState.sections).length > 0;
                const hasContent = hasComponents || hasSections;
                
                this.logger.info('RENDER', `🎆 ROOT FIX: Initializing containers - hasComponents: ${hasComponents}, hasSections: ${hasSections}`);
                
                if (hasContent) {
                    // We have content - show saved container, hide empty state
                    if (savedContainer) {
                        savedContainer.style.display = 'block';
                        this.logger.info('RENDER', '✅ ROOT FIX: Showing saved-components-container on init (has content)');
                    }
                    if (emptyState) {
                        emptyState.style.display = 'none';
                        this.logger.info('RENDER', '🚫 ROOT FIX: Hiding empty-state on init (has content)');
                    }
                } else {
                    // No content - show empty state, hide saved container
                    if (emptyState) {
                        emptyState.style.display = 'block';
                        this.logger.info('RENDER', '✅ ROOT FIX: Showing empty-state on init (no content)');
                    }
                    if (savedContainer) {
                        savedContainer.style.display = 'none';
                        this.logger.info('RENDER', '🚫 ROOT FIX: Hiding saved-components-container on init (no content)');
                    }
                }
                
                // Verify at least one container is visible
                const savedVisible = savedContainer && savedContainer.style.display !== 'none';
                const emptyVisible = emptyState && emptyState.style.display !== 'none';
                
                if (!savedVisible && !emptyVisible) {
                    // Emergency fallback - ensure empty state is visible
                    this.logger.error('RENDER', '🚨 ROOT FIX: No container visible! Forcing empty state visible');
                    if (emptyState) {
                        emptyState.style.display = 'block';
                    }
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
             */
            async processStateChange(newState) {
                const components = newState.components || {};
                const componentIds = Object.keys(components);
                const container = this.getOrCreateContainer();
                
                if (!container) {
                    this.logger.error('RENDER', 'Components container not available');
                    return;
                }
                
                // ✅ SIMPLIFIED: Clear and re-render approach - but respect sections
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
             * ✅ PHASE 2: Configuration-driven component rendering
             * ROOT CAUSE FIX: Uses ComponentConfigurationManager and DataBindingEngine
             */
            async renderComponent(componentId, componentData) {
                try {
                    const element = document.createElement('div');
                    element.id = componentId;
                    element.className = 'gmkb-component';
                    element.setAttribute('data-component-id', componentId);
                    element.setAttribute('data-component-type', componentData.type);
                    element.style.position = 'relative'; // Ensure controls can be positioned
                    
                    // ✅ PHASE 2: Configuration-driven HTML generation
                    const html = await this.generateConfigurationDrivenHTML(componentId, componentData);
                    element.innerHTML = html;
                    
                    // ✅ ROOT FIX: Attach controls immediately after rendering
                    // This ensures controls are always present, not relying on events
                    if (window.componentControlsManager && window.componentControlsManager.isInitialized) {
                        const success = window.componentControlsManager.attachControls(element, componentId);
                        if (!success) {
                            this.logger.warn('RENDER', `Failed to attach controls to ${componentId}`);
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
             */
            generateConfiguredHTML(componentType, boundData, componentOptions = {}) {
                const layout = componentOptions.layout || 'default';
                
                switch (componentType) {
                    case 'topics':
                        return this.generateConfiguredTopicsHTML(boundData, componentOptions);
                    case 'hero':
                        return this.generateConfiguredHeroHTML(boundData, componentOptions);
                    case 'biography':
                        return this.generateConfiguredBiographyHTML(boundData, componentOptions);
                    case 'contact':
                        return this.generateConfiguredContactHTML(boundData, componentOptions);
                    case 'social-links':
                        return this.generateConfiguredSocialLinksHTML(boundData, componentOptions);
                    case 'portfolio':
                        return this.generateConfiguredPortfolioHTML(boundData, componentOptions);
                    default:
                        return this.generateConfiguredDefaultHTML(componentType, boundData, componentOptions);
                }
            }
            
            // ===============================================
            // ✅ PHASE 2: CONFIGURED HTML GENERATION METHODS
            // ===============================================
            
            /**
             * ✅ PHASE 2: Generate configured topics HTML with layout options
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
             * ANTI-DUPLICATION: Skip if component already exists in DOM
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
                
                // ROOT FIX: Check if this is a section-targeted component
                if (this.isComponentInSection(componentId)) {
                    this.logger.debug('RENDER', `Component ${componentId} handled by section system - skipping`);
                    return;
                }
                
                const container = this.getOrCreateContainer();
                if (!container) {
                    this.logger.error('RENDER', 'Cannot add component - container not available');
                    return;
                }
                
                const element = await this.renderComponent(componentId, componentData);
                if (element) {
                    container.appendChild(element);
                    this.componentCache.set(componentId, element);
                    this.logger.info('RENDER', `✅ [PHASE 2] Added component: ${componentId}`);
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
             * ANTI-DUPLICATION: Only update if not handled by sections
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
                
                // ✅ PHASE 2: Use configuration-driven HTML generation for updates too
                const html = await this.generateConfigurationDrivenHTML(componentId, componentData);
                existingElement.innerHTML = html;
                existingElement.setAttribute('data-component-type', componentData.type);
                
                // ✅ ROOT FIX: Re-attach controls after update (innerHTML clears them)
                if (window.componentControlsManager && window.componentControlsManager.isInitialized) {
                    const success = window.componentControlsManager.attachControls(existingElement, componentId);
                    if (!success) {
                        this.logger.warn('RENDER', `Failed to re-attach controls to ${componentId} after update`);
                    }
                }
                
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
             * ✅ ROOT CAUSE FIX: Direct container management without complex states
             * Enhanced to find the correct nested container structure
             */
            getOrCreateContainer() {
                // First try to find the direct container inside saved-components-container
                let container = document.getElementById('components-direct-container');
                
                if (container) {
                    this.logger.debug('RENDER', 'Found components-direct-container');
                    return container;
                }
                
                // Fallback to saved-components-container
                container = document.getElementById('saved-components-container');
                
                if (container) {
                    this.logger.debug('RENDER', 'Found saved-components-container');
                    return container;
                }
                
                // Create container if none exists
                const preview = document.getElementById('media-kit-preview');
                if (preview) {
                    container = document.createElement('div');
                    container.id = 'saved-components-container';
                    container.className = 'gmkb-components-container';
                    container.style.display = 'block';
                    container.style.minHeight = '400px';
                    
                    // Create nested structure
                    const directContainer = document.createElement('div');
                    directContainer.id = 'components-direct-container';
                    directContainer.className = 'components-direct-container';
                    container.appendChild(directContainer);
                    
                    const sectionsContainer = document.createElement('div');
                    sectionsContainer.id = 'gmkb-sections-container';
                    sectionsContainer.className = 'gmkb-sections-container';
                    container.appendChild(sectionsContainer);
                    
                    preview.appendChild(container);
                    
                    this.logger.info('RENDER', '📦 [PHASE 2] Created new container with nested structure');
                    return directContainer; // Return the direct container for components
                }
                
                return null;
            }
            
            /**
             * ✅ SIMPLIFIED: Direct empty state management
             * Enhanced to work with nested container structure and consider sections
             */
            updateContainerDisplay(state) {
                const savedContainer = document.getElementById('saved-components-container');
                const emptyState = document.getElementById('empty-state');
                const hasComponents = state.components && Object.keys(state.components).length > 0;
                const hasSections = state.sections && Array.isArray(state.sections) && state.sections.length > 0;
                const hasContent = hasComponents || hasSections;
                
                this.logger.debug('RENDER', `📊 [PHASE 2] Updating display - hasComponents: ${hasComponents}, hasSections: ${hasSections}, hasContent: ${hasContent}`);
                
                if (hasContent) {
                    // Show saved components container, hide empty state
                    if (savedContainer) {
                        savedContainer.style.display = 'block';
                        this.logger.debug('RENDER', '👁️ [PHASE 2] Showing saved-components-container (has content)');
                    }
                    if (emptyState) {
                        emptyState.style.display = 'none';
                        this.logger.debug('RENDER', '🚫 [PHASE 2] Hiding empty-state (has content)');
                    }
                } else {
                    // Show empty state, hide saved components container
                    if (savedContainer) {
                        savedContainer.style.display = 'none';
                        this.logger.debug('RENDER', '🚫 [PHASE 2] Hiding saved-components-container (no content)');
                    }
                    if (emptyState) {
                        emptyState.style.display = 'block';
                        this.logger.debug('RENDER', '👁️ [PHASE 2] Showing empty-state (no content)');
                    }
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