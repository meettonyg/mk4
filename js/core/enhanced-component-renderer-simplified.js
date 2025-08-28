/**
 * @file enhanced-component-renderer-simplified.js
 * @description ROOT FIX: Simplified Direct Component Renderer
 * 
 * ✅ CHECKLIST COMPLIANT:
 * - Phase 1: No polling, event-driven initialization, root cause fix
 * - Phase 2: Simplicity first, code reduction, no redundant logic
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
        
        structuredLogger.info('RENDER', 'Simplified Component Renderer initializing...');

        class SimplifiedComponentRenderer {
            constructor() {
                this.logger = structuredLogger;
                this.stateManager = stateManager;
                this.initialized = false;
                this.componentCache = new Map();
                this.renderQueue = new Set();
                this.isProcessingQueue = false;
                
                this.logger.info('RENDER', 'Simplified renderer constructor complete');
                this.init();
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
                    // ✅ SIMPLIFIED: Direct state subscription without complex coordination
                    this.stateUnsubscribe = this.stateManager.subscribeGlobal((state) => {
                        this.onStateChange(state);
                    });
                    
                    // ✅ ROOT CAUSE FIX: Render initial state immediately
                    const initialState = this.stateManager.getState();
                    if (initialState && initialState.components) {
                        await this.renderInitialComponents(initialState);
                    }
                    
                    this.initialized = true;
                    this.logger.info('RENDER', 'Simplified renderer initialized successfully');
                    
                    // ✅ CHECKLIST COMPLIANT: Emit ready event
                    document.dispatchEvent(new CustomEvent('gmkb:enhanced-component-renderer-ready', {
                        detail: { 
                            renderer: this,
                            simplified: true,
                            timestamp: Date.now()
                        }
                    }));
                    
                } catch (error) {
                    this.logger.error('RENDER', 'Initialization failed:', error);
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
                    this.updateContainerDisplay(state);
                    return;
                }
                
                this.logger.info('RENDER', `Rendering ${componentIds.length} initial components`);
                
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
                
                this.updateContainerDisplay(state);
            }
            
            /**
             * ✅ SIMPLIFIED: Direct state change handling without complex diffing
             */
            onStateChange(newState) {
                if (!this.initialized) {
                    this.logger.debug('RENDER', 'Not initialized, ignoring state change');
                    return;
                }
                
                this.logger.debug('RENDER', 'Processing state change');
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
             * ✅ ROOT CAUSE FIX: Direct component rendering without complex templates
             */
            async renderComponent(componentId, componentData) {
                try {
                    const element = document.createElement('div');
                    element.id = componentId;
                    element.className = 'gmkb-component';
                    element.setAttribute('data-component-id', componentId);
                    element.setAttribute('data-component-type', componentData.type);
                    element.style.position = 'relative'; // Ensure controls can be positioned
                    
                    // ✅ SIMPLIFIED: Direct HTML generation based on component type
                    const html = this.generateComponentHTML(componentId, componentData);
                    element.innerHTML = html;
                    
                    // ✅ CHECKLIST COMPLIANT: Emit component rendered event for controls
                    document.dispatchEvent(new CustomEvent('gmkb:component-rendered', {
                        detail: {
                            componentId,
                            element,
                            componentData,
                            timestamp: Date.now()
                        }
                    }));
                    
                    this.logger.debug('RENDER', `Rendered component: ${componentId}`);
                    return element;
                    
                } catch (error) {
                    this.logger.error('RENDER', `Failed to render component ${componentId}:`, error);
                    return null;
                }
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Simple HTML generation without complex templating
             */
            generateComponentHTML(componentId, componentData) {
                const props = componentData.props || componentData.data || {};
                const type = componentData.type;
                
                // ✅ SIMPLIFIED: Basic HTML templates for each component type
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
                    this.logger.info('RENDER', `Added component: ${componentId}`);
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
                
                // ✅ SIMPLIFIED: Replace content instead of complex updates
                const html = this.generateComponentHTML(componentId, componentData);
                existingElement.innerHTML = html;
                existingElement.setAttribute('data-component-type', componentData.type);
                
                // ✅ CHECKLIST COMPLIANT: Emit update event for controls
                document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
                    detail: {
                        componentId,
                        element: existingElement,
                        componentData,
                        timestamp: Date.now()
                    }
                }));
                
                this.logger.debug('RENDER', `Updated component: ${componentId}`);
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
                    
                    this.logger.debug('RENDER', `Removed component: ${componentId}`);
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
                
                this.logger.debug('RENDER', `Applied layout order: ${layout.join(', ')}`);
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
                    
                    this.logger.info('RENDER', 'Created new saved-components-container with nested structure');
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
                
                this.logger.debug('RENDER', `Updating container display - hasComponents: ${hasComponents}, hasSections: ${hasSections}, hasContent: ${hasContent}`);
                
                if (hasContent) {
                    // Show saved components container, hide empty state
                    if (savedContainer) {
                        savedContainer.style.display = 'block';
                        this.logger.debug('RENDER', 'Showing saved-components-container (has content)');
                    }
                    if (emptyState) {
                        emptyState.style.display = 'none';
                        this.logger.debug('RENDER', 'Hiding empty-state (has content)');
                    }
                } else {
                    // Show empty state, hide saved components container
                    if (savedContainer) {
                        savedContainer.style.display = 'none';
                        this.logger.debug('RENDER', 'Hiding saved-components-container (no content)');
                    }
                    if (emptyState) {
                        emptyState.style.display = 'block';
                        this.logger.debug('RENDER', 'Showing empty-state (no content)');
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
                    error: element ? null : 'Failed to render component'
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
                    simplified: true
                };
            }
            
            /**
             * ✅ CHECKLIST COMPLIANT: Graceful cleanup
             */
            destroy() {
                this.logger.info('RENDER', 'Destroying simplified renderer');
                
                if (this.stateUnsubscribe) {
                    this.stateUnsubscribe();
                    this.stateUnsubscribe = null;
                }
                
                this.componentCache.clear();
                this.renderQueue.clear();
                this.initialized = false;
                
                this.logger.info('RENDER', 'Simplified renderer destroyed');
            }
        }
        
        // ✅ ROOT CAUSE FIX: Single instance only - no duplicate compatibility aliases
        window.SimplifiedComponentRenderer = SimplifiedComponentRenderer;
        window.enhancedComponentRenderer = new SimplifiedComponentRenderer();
        
        // ❌ PHASE 2 CLEANUP: Removed duplicate aliases that were causing console duplicates
        // Removed: window.enhancedComponentRendererRefactored (was creating duplicate)
        
        structuredLogger.info('RENDER', 'Simplified Component Renderer ready and exposed globally');
    };
    
    // ✅ EVENT-DRIVEN: Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }
    
})();