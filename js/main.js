/**
 * @file main.js - WordPress-Native Media Kit Builder (VANILLA JS)
 * @description Pure vanilla JavaScript following Gemini's recommendations
 * @version 2.1.0-vanilla-js-final
 * 
 * ARCHITECTURE:
 * ✅ ZERO DEPENDENCIES - Pure vanilla JavaScript
 * ✅ Single initialization flow - NO competing systems
 * ✅ Browser's native CustomEvent system - NO custom event buses
 * ✅ Native DOMContentLoaded - NO jQuery dependencies
 * ✅ Object.freeze() namespace protection
 * ✅ WordPress wp_localize_script data integration
 * ✅ Clean, modern JavaScript approach
 * ✅ ROOT FIX: Event-driven race condition elimination
 * ✅ DESIGN PANEL: Full component editing integration
 */

// IMMEDIATE DEBUG LOG - Should appear first
console.log('%c🚀 GMKB main.js LOADING (VANILLA JS)...', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 3px;');
console.log('📜 Script URL:', document.currentScript?.src || 'unknown');
console.log('📜 Load time:', new Date().toISOString());
console.log('🔧 RACE CONDITION FIX: Template path resolved, clean architecture active');
console.log('✅ VANILLA JS: Zero dependencies, following Gemini recommendations');

// Use strict-mode, self-executing function to protect scope
(function() {
    'use strict';

    console.log('🚀 GMKB: Vanilla JS initialization starting...');
    console.log('📆 WordPress data available:', !!window.gmkbData);

    /**
     * 1. The Global Namespace
     * Simple, clean, and protected from modification after setup
     */
    const GMKB = {
        systems: {},
        
        // Use the browser's native event system - reliable and debuggable
        dispatch(eventName, detail) {
            const event = new CustomEvent(eventName, { detail });
            document.dispatchEvent(event);
            console.debug(`📢 GMKB: Dispatched '${eventName}'`, detail);
        },
        
        subscribe(eventName, callback) {
            document.addEventListener(eventName, callback);
            console.debug(`📡 GMKB: Subscribed to '${eventName}'`);
        },
        
        // Simple debugging helper
        getStatus() {
            return {
                systems: Object.keys(this.systems),
                wordPressData: !!window.gmkbData,
                architecture: 'vanilla-js-final',
                timestamp: Date.now()
            };
        }
    };

    /**
     * 2. Core Systems - Pure Vanilla JS
     */
    const StateManager = {
        state: {
            components: {},
            layout: [],
            globalSettings: {}
        },
        
        init() {
            console.log('📋 StateManager: Initialized (Server-Integrated)');
            
            // Load saved state from WordPress data first, then localStorage
            if (window.gmkbData && window.gmkbData.savedState) {
                const savedState = window.gmkbData.savedState;
                this.state = { ...this.state, ...savedState };
                console.log('🔄 StateManager: Loaded state from WordPress database', savedState);
                
                // If we have components, they will be rendered by ComponentManager
                if (savedState.components && Object.keys(savedState.components).length > 0) {
                    console.log('✅ StateManager: Found', Object.keys(savedState.components).length, 'existing components');
                    // Dispatch event to trigger component loading after ComponentManager is ready
                    GMKB.dispatch('gmkb:saved-state-loaded', {
                        componentCount: Object.keys(savedState.components).length,
                        state: savedState
                    });
                }
            } else {
                // Fallback to localStorage if no WordPress data
                const loadedFromStorage = this.loadFromStorage();
                console.log('📝 StateManager: No WordPress state found, trying localStorage');
                
                // ROOT FIX: Always check for saved components after loading
                if (loadedFromStorage && Object.keys(this.state.components).length > 0) {
                    console.log('✅ StateManager: Found', Object.keys(this.state.components).length, 'existing components from localStorage');
                    GMKB.dispatch('gmkb:saved-state-loaded', {
                        componentCount: Object.keys(this.state.components).length,
                        state: this.state,
                        source: 'localStorage'
                    });
                } else {
                    console.log('📝 StateManager: No saved components found in localStorage');
                }
            }
        },
        
        getState() {
            return this.state;
        },
        
        setState(newState) {
            this.state = { ...this.state, ...newState };
            this.saveToStorage();
            GMKB.dispatch('gmkb:state-changed', { state: this.state });
        },
        
        addComponent(component) {
            const id = component.id || 'component-' + Date.now();
            this.state.components[id] = { ...component, id };
            
            if (!this.state.layout.includes(id)) {
                this.state.layout.push(id);
            }
            
            this.saveToStorage();
            GMKB.dispatch('gmkb:component-added', { id, component: this.state.components[id] });
            GMKB.dispatch('gmkb:state-changed', { state: this.state });
            
            return id;
        },
        
        removeComponent(id) {
            if (this.state.components[id]) {
                delete this.state.components[id];
                this.state.layout = this.state.layout.filter(cid => cid !== id);
                
                this.saveToStorage();
                GMKB.dispatch('gmkb:component-removed', { id });
                GMKB.dispatch('gmkb:state-changed', { state: this.state });
                
                return true;
            }
            return false;
        },
        
        updateComponent(id, updates) {
            if (this.state.components[id]) {
                this.state.components[id] = { ...this.state.components[id], ...updates };
                
                this.saveToStorage();
                GMKB.dispatch('gmkb:component-updated', { id, component: this.state.components[id] });
                GMKB.dispatch('gmkb:state-changed', { state: this.state });
                
                return true;
            }
            return false;
        },
        
        saveToStorage() {
            try {
                localStorage.setItem('gmkb-state', JSON.stringify(this.state));
                
                // Also save to WordPress database if possible
                this.saveToWordPress();
                
                return true;
            } catch (error) {
                console.warn('💾 StateManager: Failed to save to localStorage:', error);
                return false;
            }
        },
        
        async saveToWordPress() {
            if (!window.gmkbData || !window.gmkbData.postId) {
                console.log('💾 StateManager: No post ID available for WordPress save');
                return false;
            }
            
            try {
                console.log('💾 StateManager: Saving state to WordPress database...');
                
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'guestify_save_media_kit',
                        nonce: window.gmkbData.nonce,
                        post_id: window.gmkbData.postId,
                        state: JSON.stringify(this.state)
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    console.log('✅ StateManager: Saved state to WordPress database');
                    return true;
                } else {
                    console.warn('⚠️ StateManager: WordPress save failed:', data);
                    return false;
                }
            } catch (error) {
                console.error('❌ StateManager: Error saving to WordPress:', error);
                return false;
            }
        },
        
        loadFromStorage() {
            try {
                const saved = localStorage.getItem('gmkb-state');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.state = { ...this.state, ...data };
                    console.log('💾 StateManager: Loaded state from localStorage');
                    console.log('💾 StateManager: Components in loaded state:', Object.keys(data.components || {}).length);
                    console.log('💾 StateManager: Full loaded data:', data);
                    return true;
                }
            } catch (error) {
                console.warn('💾 StateManager: Failed to load from localStorage:', error);
            }
            console.log('💾 StateManager: No saved state found in localStorage');
            return false;
        }
    };

    const ComponentManager = {
        availableComponents: {},
        
        init() {
            console.log('🧩 ComponentManager: Initialized (Server-Integrated)');
            // Load available components from server on initialization
            this.loadAvailableComponents();
        },
        
        async loadAvailableComponents() {
            try {
                console.log('🔄 ComponentManager: Loading available components from server...');
                
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'guestify_get_components',
                        nonce: window.gmkbData.nonce
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.components) {
                    this.availableComponents = data.components;
                    console.log('✅ ComponentManager: Loaded', Object.keys(data.components).length, 'available components');
                    
                    // Populate component library modal
                    this.populateComponentLibrary(data.components, data.categories || {});
                    
                    // Dispatch event that components are loaded
                    GMKB.dispatch('gmkb:components-loaded', {
                        components: data.components,
                        categories: data.categories
                    });
                    
                    // ROOT FIX: Dispatch available components ready event
                    GMKB.dispatch('gmkb:available-components-ready', {
                        components: data.components,
                        count: Object.keys(data.components).length,
                        timestamp: Date.now()
                    });
                } else {
                    console.error('❌ ComponentManager: Failed to load components:', data);
                }
            } catch (error) {
                console.error('❌ ComponentManager: Error loading components:', error);
                // Fallback to hardcoded components for development
                this.loadFallbackComponents();
            }
        },
        
        loadFallbackComponents() {
            console.log('🔄 ComponentManager: Loading fallback components...');
            this.availableComponents = {
                'hero': { name: 'Hero Section', category: 'essential', icon: 'hero-icon.svg' },
                'biography': { name: 'Biography', category: 'essential', icon: 'bio-icon.svg' },
                'topics': { name: 'Speaking Topics', category: 'essential', icon: 'topics-icon.svg' },
                'social': { name: 'Social Links', category: 'contact', icon: 'social-icon.svg' },
                'call-to-action': { name: 'Call to Action', category: 'engagement', icon: 'cta-icon.svg' }
            };
            this.populateComponentLibrary(this.availableComponents, {
                'essential': Object.values(this.availableComponents).filter(c => c.category === 'essential'),
                'contact': Object.values(this.availableComponents).filter(c => c.category === 'contact'),
                'engagement': Object.values(this.availableComponents).filter(c => c.category === 'engagement')
            });
            
            // ROOT FIX: Dispatch available components ready event for fallback too
            GMKB.dispatch('gmkb:available-components-ready', {
                components: this.availableComponents,
                count: Object.keys(this.availableComponents).length,
                source: 'fallback',
                timestamp: Date.now()
            });
        },
        
        populateComponentLibrary(components, categories) {
            const componentGrid = document.getElementById('component-grid');
            if (!componentGrid) {
                console.warn('🧩 ComponentManager: Component grid not found');
                return;
            }
            
            // Hide loading state
            const loadingState = document.getElementById('component-grid-loading');
            if (loadingState) {
                loadingState.style.display = 'none';
            }
            
            // Clear existing content
            componentGrid.innerHTML = '';
            
            // Create component cards
            Object.entries(components).forEach(([key, component]) => {
                const componentCard = document.createElement('div');
                componentCard.className = 'component-item';
                componentCard.setAttribute('data-component-type', key);
                componentCard.setAttribute('data-category', component.category || 'other');
                
                componentCard.innerHTML = `
                    <div class="component-item__preview">
                        <div class="component-preview-icon">
                            ${this.getComponentIcon(key)}
                        </div>
                    </div>
                    <div class="component-item__info">
                        <h4 class="component-item__name">${component.name || key}</h4>
                        <p class="component-item__description">${component.description || 'No description available'}</p>
                        ${component.isPremium ? '<span class="premium-badge">Pro</span>' : ''}
                    </div>
                    <div class="component-item__actions">
                        <button class="btn btn--small btn--primary add-component-btn" data-component="${key}">
                            Add Component
                        </button>
                    </div>
                `;
                
                componentGrid.appendChild(componentCard);
            });
            
            console.log('✅ ComponentManager: Populated component library with', Object.keys(components).length, 'components');
        },
        
        getComponentIcon(componentType) {
            const icons = {
                'hero': '🎯',
                'biography': '👤', 
                'topics': '📚',
                'social': '🔗',
                'call-to-action': '📢',
                'contact': '📞',
                'gallery': '🖼️',
                'testimonials': '💭',
                'stats': '📊'
            };
            return icons[componentType] || '📄';
        },
        
        async addComponent(type, data = {}, skipServerRender = false) {
            const component = {
                id: 'component-' + Date.now(),
                type,
                data,
                timestamp: Date.now()
            };
            
            const id = StateManager.addComponent(component);
            
            // If skipServerRender is true, use fallback rendering (for backwards compatibility)
            if (skipServerRender) {
                this.renderComponentFallback(id);
            } else {
                // Use server-side rendering for real components
                await this.renderComponent(id);
            }
            
            console.log(`🧩 ComponentManager: Added component '${type}' with ID: ${id}`);
            return id;
        },
        
        removeComponent(id) {
            // Remove from DOM - VANILLA JS
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
            
            // Remove from state
            const success = StateManager.removeComponent(id);
            
            if (success) {
                console.log(`🧩 ComponentManager: Removed component with ID: ${id}`);
                
                // Show empty state if no components left
                const state = StateManager.getState();
                if (Object.keys(state.components).length === 0) {
                    const emptyState = document.getElementById('empty-state');
                    if (emptyState) {
                        emptyState.style.display = 'block';
                    }
                }
            }
            
            return success;
        },
        
        async updateComponent(id, updates) {
            const success = StateManager.updateComponent(id, updates);
            
            if (success) {
                await this.renderComponent(id);
                console.log(`🧩 ComponentManager: Updated component with ID: ${id}`);
            }
            
            return success;
        },
        
        async renderComponent(id) {
            const component = StateManager.getState().components[id];
            if (!component) {
                console.warn(`🧩 ComponentManager: Cannot render - component ${id} not found`);
                return false;
            }
            
            try {
                console.log(`🔄 ComponentManager: Server-rendering component ${id} (${component.type})...`);
                
                // Call server to render component
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'guestify_render_component',
                        nonce: window.gmkbData.nonce,
                        component: component.type,
                        props: JSON.stringify({
                            ...component.data,
                            post_id: window.gmkbData.postId
                        })
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.data && data.data.html) {
                    // Server-side rendering successful
                    this.insertRenderedComponent(id, data.data.html, component);
                    console.log(`✅ ComponentManager: Server-rendered component ${id}`);
                    return true;
                } else {
                    console.warn(`⚠️ ComponentManager: Server rendering failed for ${id}, using fallback`);
                    this.renderComponentFallback(id);
                    return false;
                }
            } catch (error) {
                console.error(`❌ ComponentManager: Error rendering component ${id}:`, error);
                this.renderComponentFallback(id);
                return false;
            }
        },
        
        insertRenderedComponent(id, html, component) {
            const previewContainer = document.getElementById('media-kit-preview');
            if (!previewContainer) {
                console.warn('🧩 ComponentManager: Preview container not found');
                return false;
            }
            
            // Hide empty state if this is the first component
            const emptyState = document.getElementById('empty-state');
            if (emptyState && Object.keys(StateManager.getState().components).length === 1) {
                emptyState.style.display = 'none';
            }
            
            // Create or update component element
            let componentElement = document.getElementById(id);
            if (!componentElement) {
                componentElement = document.createElement('div');
                componentElement.id = id;
                componentElement.className = 'media-kit-component mk-component';
                componentElement.setAttribute('data-component-type', component.type);
                componentElement.setAttribute('data-component-id', id);
                previewContainer.appendChild(componentElement);
            }
            
            // Insert server-rendered HTML with component controls wrapper
            componentElement.innerHTML = `
                <div class="component-wrapper" data-component-id="${id}">
                    <div class="component-controls">
                        <button class="component-control-btn remove-component" onclick="window.GMKB.systems.ComponentManager.removeComponent('${id}')" title="Remove Component">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <button class="component-control-btn edit-component" onclick="window.GMKB.systems.ComponentManager.editComponent('${id}')" title="Edit Component">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="component-content">
                        ${html}
                    </div>
                </div>
            `;
            
            return true;
        },
        
        renderComponentFallback(id) {
            const component = StateManager.getState().components[id];
            if (!component) return false;
            
            const { type, data } = component;
            
            // Simple fallback templates for development
            const templates = {
                hero: `
                    <div class="component-hero fallback">
                        <h1>${data.title || 'Your Name'}</h1>
                        <p>${data.subtitle || 'Your Title/Expertise'}</p>
                        <p class="fallback-notice">⚠️ Using fallback template - server rendering failed</p>
                    </div>
                `,
                biography: `
                    <div class="component-biography fallback">
                        <h3>Biography</h3>
                        <p>${data.content || 'Your professional biography...'}</p>
                        <p class="fallback-notice">⚠️ Using fallback template - server rendering failed</p>
                    </div>
                `,
                topics: `
                    <div class="component-topics fallback">
                        <h3>Speaking Topics</h3>
                        <ul>
                            ${(data.topics || ['Topic 1', 'Topic 2', 'Topic 3']).map(topic => `<li>${topic}</li>`).join('')}
                        </ul>
                        <p class="fallback-notice">⚠️ Using fallback template - server rendering failed</p>
                    </div>
                `
            };
            
            const html = templates[type] || `
                <div class="component-generic fallback">
                    <h3>${type.charAt(0).toUpperCase() + type.slice(1)} Component</h3>
                    <p>Component: ${id}</p>
                    <p>Type: ${type}</p>
                    <p class="fallback-notice">⚠️ Using fallback template - server rendering failed</p>
                </div>
            `;
            
            this.insertRenderedComponent(id, html, component);
            console.log(`⚠️ ComponentManager: Used fallback template for ${id}`);
            return true;
        },
        
        async editComponent(id) {
            // ROOT FIX: Enhanced debugging for edit component
            console.log('🛠️ ComponentManager: EDIT BUTTON CLICKED for component:', id);
            console.log('🛠️ ComponentManager: Current state components:', Object.keys(StateManager.getState().components));
            
            const component = StateManager.getState().components[id];
            if (!component) {
                console.warn(`🛠️ ComponentManager: Cannot edit - component ${id} not found`);
                console.warn('🛠️ ComponentManager: Available components:', StateManager.getState().components);
                return false;
            }
            
            console.log('🛠️ ComponentManager: Found component:', component);
            
            try {
                console.log(`🛠️ ComponentManager: Loading design panel for ${component.type} (${id})...`);
                
                // Switch to design tab
                this.switchToDesignTab();
                
                // Show loading state in design panel
                this.showDesignPanelLoading(component);
                
                console.log('🛠️ ComponentManager: Making AJAX request to load design panel...');
                console.log('🛠️ ComponentManager: AJAX URL:', window.gmkbData.ajaxUrl);
                console.log('🛠️ ComponentManager: Nonce:', window.gmkbData.nonce);
                
                // Load design panel from server
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'guestify_render_design_panel',
                        nonce: window.gmkbData.nonce,
                        component: component.type,
                        post_id: window.gmkbData.postId,
                        component_id: id
                    })
                });
                
                console.log('🛠️ ComponentManager: AJAX response status:', response.status);
                
                const data = await response.json();
                console.log('🛠️ ComponentManager: AJAX response data:', data);
                
                if (data.success && data.data && data.data.html) {
                    // Load design panel content
                    this.loadDesignPanelContent(data.data.html, component, id);
                    console.log(`✅ ComponentManager: Design panel loaded for ${component.type}`);
                    return true;
                } else {
                    console.warn(`⚠️ ComponentManager: Design panel not found for ${component.type}`);
                    console.warn('🛠️ ComponentManager: Server response:', data);
                    this.showDesignPanelError(component, data.data?.message || data.message || 'Design panel not available');
                    return false;
                }
                
            } catch (error) {
                console.error(`❌ ComponentManager: Error loading design panel for ${id}:`, error);
                this.showDesignPanelError(component, error.message);
                return false;
            }
        },
        
        switchToDesignTab() {
            // Find and activate design tab
            const designTabButton = document.querySelector('.sidebar__tab[data-tab="design"]');
            const designTabContent = document.getElementById('design-tab');
            
            if (designTabButton && designTabContent) {
                // Remove active class from all tabs
                document.querySelectorAll('.sidebar__tab').forEach(tab => {
                    tab.classList.remove('sidebar__tab--active');
                });
                
                // Hide all tab contents
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                // Activate design tab
                designTabButton.classList.add('sidebar__tab--active');
                designTabContent.style.display = 'block';
                
                console.log('🎛️ ComponentManager: Switched to design tab');
            }
        },
        
        showDesignPanelLoading(component) {
            const elementEditor = document.getElementById('element-editor');
            if (!elementEditor) return;
            
            elementEditor.innerHTML = `
                <div class="element-editor__title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="loading-spinner">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 12l2 2 4-4"></path>
                    </svg>
                    Loading ${component.type.charAt(0).toUpperCase() + component.type.slice(1)} Editor
                </div>
                <div class="element-editor__subtitle">Please wait while we load the design panel...</div>
                
                <div class="form-section">
                    <div class="loading-state">
                        <div class="loading-progress">
                            <div class="loading-progress-bar"></div>
                        </div>
                        <p class="loading-text">Loading component editor...</p>
                    </div>
                </div>
                
                <style>
                .loading-spinner {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loading-progress {
                    width: 100%;
                    height: 4px;
                    background: #e5e7eb;
                    border-radius: 2px;
                    overflow: hidden;
                    margin: 16px 0;
                }
                .loading-progress-bar {
                    height: 100%;
                    background: #3b82f6;
                    border-radius: 2px;
                    animation: loading-progress 2s ease-in-out infinite;
                }
                @keyframes loading-progress {
                    0% { width: 0%; }
                    50% { width: 60%; }
                    100% { width: 100%; }
                }
                .loading-text {
                    text-align: center;
                    color: #6b7280;
                    font-size: 14px;
                    margin: 0;
                }
                </style>
            `;
        },
        
        loadDesignPanelContent(html, component, componentId) {
            const elementEditor = document.getElementById('element-editor');
            if (!elementEditor) return;
            
            // Load the design panel HTML
            elementEditor.innerHTML = html;
            
            // Add component metadata to the design panel
            elementEditor.dataset.componentId = componentId;
            elementEditor.dataset.componentType = component.type;
            
            // Dispatch event for component-specific initialization
            GMKB.dispatch('gmkb:design-panel-loaded', {
                componentId: componentId,
                componentType: component.type,
                component: component,
                panelElement: elementEditor
            });
            
            console.log(`📋 ComponentManager: Design panel content loaded for ${component.type}`);
            
            // Initialize any JavaScript in the loaded panel
            this.initializeDesignPanelScripts(elementEditor);
        },
        
        showDesignPanelError(component, errorMessage) {
            const elementEditor = document.getElementById('element-editor');
            if (!elementEditor) return;
            
            elementEditor.innerHTML = `
                <div class="element-editor__title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    ${component.type.charAt(0).toUpperCase() + component.type.slice(1)} Editor Error
                </div>
                <div class="element-editor__subtitle">Unable to load the design panel</div>
                
                <div class="form-section">
                    <div class="error-state">
                        <p class="error-message">${errorMessage}</p>
                        <div class="error-actions">
                            <button class="btn btn--secondary btn--small" onclick="window.GMKB.systems.ComponentManager.editComponent('${component.id}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                </svg>
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
                
                <style>
                .error-state {
                    text-align: center;
                    padding: 20px;
                }
                .error-message {
                    color: #ef4444;
                    margin-bottom: 16px;
                    padding: 12px;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 6px;
                }
                .error-actions {
                    display: flex;
                    justify-content: center;
                }
                </style>
            `;
        },
        
        initializeDesignPanelScripts(panelElement) {
            // Execute any script tags in the loaded design panel
            const scripts = panelElement.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.textContent.trim()) {
                    try {
                        // Create new script element to ensure execution
                        const newScript = document.createElement('script');
                        newScript.textContent = script.textContent;
                        document.head.appendChild(newScript);
                        document.head.removeChild(newScript);
                    } catch (error) {
                        console.warn('Error executing design panel script:', error);
                    }
                }
            });
            
            console.log('🔧 ComponentManager: Design panel scripts initialized');
        },
        
        // Load saved components from state and render them
        async loadSavedComponents() {
            const state = StateManager.getState();
            const componentIds = Object.keys(state.components);
            
            if (componentIds.length === 0) {
                console.log('📝 ComponentManager: No saved components to load');
                return;
            }
            
            console.log(`🔄 ComponentManager: Loading ${componentIds.length} saved components...`);
            
            // Hide empty state
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Render each component in layout order
            for (const componentId of state.layout) {
                if (state.components[componentId]) {
                    await this.renderComponent(componentId);
                }
            }
            
            console.log(`✅ ComponentManager: Loaded ${componentIds.length} saved components`);
        }
    };

    const Renderer = {
        init() {
            console.log('🎨 Renderer: Initialized (Vanilla JS)');
            
            // Listen for state changes and re-render
            GMKB.subscribe('gmkb:state-changed', (event) => {
                this.renderAll();
            });
        },
        
        renderAll() {
            const state = StateManager.getState();
            const previewContainer = document.getElementById('media-kit-preview');
            
            if (!previewContainer) {
                console.warn('🎨 Renderer: Preview container not found');
                return;
            }
            
            // Show empty state if no components
            const emptyState = document.getElementById('empty-state');
            if (Object.keys(state.components).length === 0) {
                if (emptyState) {
                    emptyState.style.display = 'block';
                }
            } else {
                if (emptyState) {
                    emptyState.style.display = 'none';
                }
                
                // Render components in layout order
                state.layout.forEach(componentId => {
                    ComponentManager.renderComponent(componentId);
                });
            }
        }
    };

    const UIManager = {
        init() {
            console.log('🎛️ UIManager: Initialized (Server-Integrated)');
            this.initializeButtons();
            this.initializeModals();
            this.initializeEventListeners();
        },
        
        initializeEventListeners() {
            // ROOT FIX: Event-driven coordination state tracking
            this.eventState = {
                savedStateLoaded: false,
                availableComponentsReady: false,
                savedStateData: null
            };
            
            // Listen for saved state loaded event
            GMKB.subscribe('gmkb:saved-state-loaded', (event) => {
                console.log('🔄 UIManager: Saved state loaded event received', event.detail);
                this.eventState.savedStateLoaded = true;
                this.eventState.savedStateData = event.detail;
                this.checkReadyToLoadComponents();
            });
            
            // ROOT FIX: Listen for available components ready event
            GMKB.subscribe('gmkb:available-components-ready', (event) => {
                console.log('✅ UIManager: Available components ready event received', event.detail);
                this.eventState.availableComponentsReady = true;
                this.checkReadyToLoadComponents();
            });
            
            // Listen for components loaded event to update UI state
            GMKB.subscribe('gmkb:components-loaded', (event) => {
                console.log('✅ UIManager: Available components loaded', event.detail);
                this.updateComponentLibraryHandlers();
            });
            
            // Listen for components rendered event
            GMKB.subscribe('gmkb:components-rendered', (event) => {
                console.log('✅ UIManager: Components rendered successfully', event.detail);
            });
        },
        
        // ROOT FIX: Event-driven coordination - NO setTimeout polling
        async checkReadyToLoadComponents() {
            // Only proceed if BOTH events have fired
            if (this.eventState.savedStateLoaded && this.eventState.availableComponentsReady) {
                console.log('🎯 UIManager: Both events ready - loading saved components');
                
                if (GMKB.systems.ComponentManager && GMKB.systems.ComponentManager.loadSavedComponents) {
                    try {
                        await GMKB.systems.ComponentManager.loadSavedComponents();
                        console.log('✅ UIManager: Saved components loaded successfully');
                    } catch (error) {
                        console.error('❌ UIManager: Error loading saved components:', error);
                    }
                }
                
                // Reset state for future use
                this.eventState.savedStateLoaded = false;
                this.eventState.availableComponentsReady = false;
                this.eventState.savedStateData = null;
            } else {
                console.log('⏳ UIManager: Waiting for both events - savedState:', this.eventState.savedStateLoaded, 'availableComponents:', this.eventState.availableComponentsReady);
            }
        },
        
        initializeButtons() {
            // Save button - VANILLA JS event listeners
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn && !saveBtn.dataset.gmkbInitialized) {
                saveBtn.addEventListener('click', () => {
                    const success = StateManager.saveToStorage();
                    console.log(success ? '💾 Save successful' : '❌ Save failed');
                    
                    // Show user feedback with vanilla JS
                    const originalText = saveBtn.textContent;
                    saveBtn.textContent = success ? 'Saved!' : 'Save Failed';
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        saveBtn.textContent = originalText;
                    }, 2000);
                });
                saveBtn.dataset.gmkbInitialized = 'true';
            }
            
            // Component library button
            const addComponentBtn = document.getElementById('add-component-btn');
            if (addComponentBtn && !addComponentBtn.dataset.gmkbInitialized) {
                addComponentBtn.addEventListener('click', () => {
                    this.showComponentLibrary();
                });
                addComponentBtn.dataset.gmkbInitialized = 'true';
            }
            
            // First component button (in empty state)
            const addFirstComponentBtn = document.getElementById('add-first-component');
            if (addFirstComponentBtn && !addFirstComponentBtn.dataset.gmkbInitialized) {
                addFirstComponentBtn.addEventListener('click', () => {
                    this.showComponentLibrary();
                });
                addFirstComponentBtn.dataset.gmkbInitialized = 'true';
            }
            
            // Auto-generate button
            const autoGenerateBtn = document.getElementById('auto-generate-btn');
            if (autoGenerateBtn && !autoGenerateBtn.dataset.gmkbInitialized) {
                autoGenerateBtn.addEventListener('click', async () => {
                    console.log('🎆 Auto-generate clicked (Server-Integrated mode)');
                    await this.handleAutoGenerate(autoGenerateBtn);
                });
                autoGenerateBtn.dataset.gmkbInitialized = 'true';
            }
            
            // MKCG Auto-generate button in dashboard
            const mkcgAutoGenerateBtn = document.getElementById('mkcg-auto-generate-dashboard');
            if (mkcgAutoGenerateBtn && !mkcgAutoGenerateBtn.dataset.gmkbInitialized) {
                mkcgAutoGenerateBtn.addEventListener('click', async () => {
                    console.log('🎆 MKCG Auto-generate clicked');
                    await this.handleAutoGenerate(mkcgAutoGenerateBtn);
                });
                mkcgAutoGenerateBtn.dataset.gmkbInitialized = 'true';
            }
        },
        
        initializeModals() {
            // Component library modal close functionality - VANILLA JS
            const modal = document.getElementById('component-library-overlay');
            if (modal) {
                // Close button
                const closeBtn = modal.querySelector('.close-modal, .library__close, #close-library');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                }
                
                // Backdrop click
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
                
                // ESC key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && modal.style.display === 'flex') {
                        modal.style.display = 'none';
                    }
                });
            }
            
            // Component selection will be handled by updateComponentLibraryHandlers
            // after components are loaded from server
            this.updateComponentLibraryHandlers();
        },
        
        showComponentLibrary() {
            const modal = document.getElementById('component-library-overlay');
            if (modal) {
                modal.style.display = 'flex';
            } else {
                console.warn('🎛️ UIManager: Component library modal not found');
            }
        },
        
        updateComponentLibraryHandlers() {
            // Update component selection handlers after components are loaded
            const componentButtons = document.querySelectorAll('.component-item .add-component-btn');
            
            componentButtons.forEach(button => {
                if (!button.dataset.gmkbInitialized) {
                    button.addEventListener('click', async () => {
                        const componentType = button.dataset.component || 
                                            button.parentElement.parentElement.dataset.componentType || 
                                            'generic';
                        
                        console.log('🔄 UIManager: Adding component:', componentType);
                        
                        // Show loading state on button
                        const originalText = button.textContent;
                        button.textContent = 'Adding...';
                        button.disabled = true;
                        
                        try {
                            // Use server-side rendering (not fallback)
                            await GMKB.systems.ComponentManager.addComponent(componentType, {}, false);
                            
                            // Close modal
                            const modal = document.getElementById('component-library-overlay');
                            if (modal) {
                                modal.style.display = 'none';
                            }
                            
                            console.log('✅ UIManager: Component added successfully');
                        } catch (error) {
                            console.error('❌ UIManager: Error adding component:', error);
                            alert('Failed to add component. Please try again.');
                        } finally {
                            // Reset button state
                            button.textContent = originalText;
                            button.disabled = false;
                        }
                    });
                    button.dataset.gmkbInitialized = 'true';
                }
            });
            
            console.log('✅ UIManager: Updated', componentButtons.length, 'component selection handlers');
        },
        
        async handleAutoGenerate(button) {
            // Get post ID for MKCG data
            const postId = window.gmkbData?.postId;
            
            if (!postId) {
                console.warn('⚠️ UIManager: No post ID available for auto-generation');
                alert('Auto-generation requires a post ID. Please ensure you\'re editing a specific post.');
                return;
            }
            
            // Show loading state
            const originalText = button.textContent;
            button.textContent = 'Generating...';
            button.disabled = true;
            
            try {
                console.log('🎆 UIManager: Starting auto-generation for post', postId);
                
                // Define components to auto-generate (in order)
                const componentsToGenerate = [
                    { type: 'hero', data: { auto_generated: true } },
                    { type: 'biography', data: { auto_generated: true } },
                    { type: 'topics', data: { auto_generated: true } },
                    { type: 'social', data: { auto_generated: true } }
                ];
                
                let successCount = 0;
                
                // Generate each component
                for (const component of componentsToGenerate) {
                    try {
                        console.log(`🔄 UIManager: Generating ${component.type} component...`);
                        
                        await GMKB.systems.ComponentManager.addComponent(
                            component.type, 
                            { ...component.data, post_id: postId },
                            false // Use server-side rendering
                        );
                        
                        successCount++;
                        
                        // Small delay between components for better UX
                        await new Promise(resolve => setTimeout(resolve, 300));
                        
                    } catch (error) {
                        console.warn(`⚠️ UIManager: Failed to generate ${component.type}:`, error);
                        // Continue with other components even if one fails
                    }
                }
                
                console.log(`✅ UIManager: Auto-generation complete. Generated ${successCount} components.`);
                
                // Show success message
                button.textContent = `Generated ${successCount} components!`;
                
                // Reset button after delay
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('❌ UIManager: Auto-generation error:', error);
                alert('Auto-generation failed. Please try adding components manually.');
                
                // Reset button
                button.textContent = originalText;
                button.disabled = false;
            }
        }
    };

    /**
     * 3. Main Application Logic - Server-Integrated VANILLA JS
     */
    async function initializeApplication() {
        console.log('🚀 GMKB: Vanilla JS application initializing...');
        
        // Validate WordPress data is available
        if (!window.gmkbData) {
            console.error('❌ GMKB: WordPress data (gmkbData) not available - check enqueue.php');
            showInitializationError('WordPress data not available');
            return false;
        }
        
        console.log('✅ GMKB: WordPress data validated:', {
            ajaxUrl: !!window.gmkbData.ajaxUrl,
            nonce: !!window.gmkbData.nonce,
            postId: window.gmkbData.postId,
            architecture: window.gmkbData.architecture,
            vanillaJS: window.gmkbData.vanillaJS
        });

        try {
            // Initialize core systems
            GMKB.systems.StateManager = StateManager;
            GMKB.systems.ComponentManager = ComponentManager;
            GMKB.systems.Renderer = Renderer;
            GMKB.systems.UIManager = UIManager;
            
            // Initialize each system in proper order
            console.log('🔄 GMKB: Initializing systems...');
            
            // ROOT FIX: Initialize UIManager FIRST (sets up event listeners)
            UIManager.init();
            
            // 1. Initialize StateManager second (will dispatch saved-state events to ready listeners)
            StateManager.init();
            
            // 2. Initialize ComponentManager (loads available components and handles saved state)
            await ComponentManager.init();
            
            // 3. Initialize Renderer last
            Renderer.init();

            // Attach to global scope and protect it
            window.GMKB = GMKB;
            Object.freeze(window.GMKB);
            
            console.log('🔒 GMKB: Namespace protected with Object.freeze()');

            // All systems are ready - announce it
            GMKB.dispatch('gmkb:ready', {
                timestamp: Date.now(),
                architecture: 'server-integrated-vanilla-js',
                systems: Object.keys(GMKB.systems),
                wordpressData: !!window.gmkbData,
                postId: window.gmkbData?.postId || null
            });
            
            // Update body class to indicate readiness - VANILLA JS
            document.body.classList.add('gmkb-ready');
            document.body.classList.remove('gmkb-initializing');
            
            console.log('🎉 GMKB: Server-Integrated application ready!');
            console.log('📊 Status:', GMKB.getStatus());
            console.log('🚀 Features: Server-side rendering, AJAX integration, WordPress state persistence');
            
            return true;
            
        } catch (error) {
            console.error('❌ GMKB: Initialization error:', error);
            showInitializationError(error.message);
            return false;
        }
    }
    
    /**
     * Show user-friendly initialization error
     */
    function showInitializationError(message) {
        const previewContainer = document.getElementById('media-kit-preview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="initialization-error" style="
                    padding: 40px;
                    text-align: center;
                    background: #fee;
                    border: 2px solid #f88;
                    border-radius: 8px;
                    margin: 20px;
                    color: #d44;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                ">
                    <h2>⚠️ Initialization Error</h2>
                    <p><strong>The Media Kit Builder failed to start properly.</strong></p>
                    <p>Error: ${message}</p>
                    <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px; text-align: left;">
                        <strong>🔧 Diagnostics:</strong><br>
                        WordPress Data: ${!!window.gmkbData ? '✅' : '❌'}<br>
                        Vanilla JS: ${window.gmkbData?.vanillaJS ? '✅' : '❌'}<br>
                        Architecture: ${window.gmkbData?.architecture || 'Unknown'}<br>
                        Builder Page: ${window.gmkbData?.isBuilderPage ? '✅' : '❌'}
                    </div>
                    <button onclick="location.reload()" style="
                        background: #d44;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Reload Builder</button>
                </div>
            `;
        }
    }

    /**
     * 4. Entry Point - Server-Integrated VANILLA JS
     * Wait for DOM to be fully loaded - NO jQuery
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async function() {
            console.log('📄 DOM ready - starting GMKB server-integrated initialization...');
            await initializeApplication();
        });
    } else {
        // DOM already loaded
        console.log('📄 DOM already ready - starting GMKB server-integrated initialization...');
        (async () => {
            await initializeApplication();
        })();
    }
    
    // Also listen for WordPress readiness event from enqueue.php
    document.addEventListener('gmkb:wordpress-ready', function(event) {
        console.log('✅ WordPress readiness event received:', event.detail);
    });

    // Expose utility functions for debugging and testing
    window.gmkbUtils = {
        addTestComponent: function(type = 'hero') {
            if (window.GMKB && window.GMKB.systems.ComponentManager) {
                return window.GMKB.systems.ComponentManager.addComponent(type, {
                    title: 'Test Component (Vanilla JS)',
                    content: 'This is a test component added via gmkbUtils.addTestComponent() using pure vanilla JavaScript'
                });
            }
            console.warn('⚠️ GMKB not ready - cannot add test component');
            return null;
        },
        
        saveState: function() {
            if (window.GMKB && window.GMKB.systems.StateManager) {
                return window.GMKB.systems.StateManager.saveToStorage();
            }
            return false;
        },
        
        loadState: function() {
            if (window.GMKB && window.GMKB.systems.StateManager) {
                return window.GMKB.systems.StateManager.loadFromStorage();
            }
            return false;
        },
        
        getStatus: function() {
            return {
                gmkbReady: !!window.GMKB,
                wordPressData: !!window.gmkbData,
                systems: window.GMKB ? Object.keys(window.GMKB.systems) : [],
                architecture: 'server-integrated-vanilla-js',
                serverIntegration: true,
                ajaxEndpoints: !!window.gmkbData?.ajaxUrl,
                postId: window.gmkbData?.postId || null,
                timestamp: Date.now()
            };
        },
        
        clearState: function() {
            try {
                localStorage.removeItem('gmkb-state');
                location.reload();
                return true;
            } catch (error) {
                console.error('Failed to clear state:', error);
                return false;
            }
        }
    };

    console.log('✅ GMKB: Vanilla JS main.js loaded successfully');
    console.log('🛠️ Debug commands available:');
    console.log('  gmkbUtils.addTestComponent() - Add test component');
    console.log('  gmkbUtils.saveState() - Save current state');
    console.log('  gmkbUtils.loadState() - Load saved state');
    console.log('  gmkbUtils.getStatus() - Get system status');
    console.log('  gmkbUtils.clearState() - Clear saved state and reload');

})(); // End vanilla JS IIFE
