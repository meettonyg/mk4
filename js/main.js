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
            
            // ROOT FIX: Check localStorage FIRST (where previous components are saved)
            let hasLocalStorageData = false;
            const localStorageLoaded = this.loadFromStorage();
            
            if (localStorageLoaded && Object.keys(this.state.components).length > 0) {
                hasLocalStorageData = true;
                console.log('🔄 StateManager: Loaded state from localStorage (PRIORITY)', {
                    components: Object.keys(this.state.components).length,
                    layout: this.state.layout.length
                });
                
                // Dispatch event for saved components from localStorage
                GMKB.dispatch('gmkb:saved-state-loaded', {
                    componentCount: Object.keys(this.state.components).length,
                    state: this.state,
                    source: 'localStorage'
                });
            } else {
                console.log('📝 StateManager: No components found in localStorage');
            }
            
            // SECONDARY: Check WordPress database (only if localStorage was empty)
            if (!hasLocalStorageData && window.gmkbData && window.gmkbData.savedState) {
                const savedState = window.gmkbData.savedState;
                
                if (savedState.components && Object.keys(savedState.components).length > 0) {
                    this.state = { ...this.state, ...savedState };
                    console.log('🔄 StateManager: Loaded state from WordPress database (FALLBACK)', savedState);
                    
                    // Dispatch event for saved components from WordPress
                    GMKB.dispatch('gmkb:saved-state-loaded', {
                        componentCount: Object.keys(savedState.components).length,
                        state: savedState,
                        source: 'wordpress'
                    });
                } else {
                    console.log('📝 StateManager: WordPress database state is empty');
                }
            }
            
            // Final check: if no components found anywhere
            if (Object.keys(this.state.components).length === 0) {
                console.log('📝 StateManager: No saved components found in any source (localStorage or WordPress)');
            } else {
                console.log('✅ StateManager: Successfully loaded', Object.keys(this.state.components).length, 'components');
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
                console.log('🔍 ComponentManager: Server response:', data);
                
                // Show debug information if available
                if (data.debug || (data.data && data.data.debug)) {
                    const debugInfo = data.debug || data.data.debug;
                    console.log('🔍 ComponentManager: Debug info:', debugInfo);
                    
                    if (debugInfo.components_dir_exists === false) {
                        console.error('❌ ComponentManager: Components directory does not exist:', debugInfo.components_dir);
                    }
                    if (debugInfo.components_dir_readable === false) {
                        console.error('❌ ComponentManager: Components directory not readable:', debugInfo.components_dir);
                    }
                }
                
                // ROOT FIX: Handle both wp_send_json_success and direct return formats
                let components, categories;
                
                if (data.success && data.data) {
                    // wp_send_json_success format: {success: true, data: {components: ..., categories: ...}}
                    components = data.data.components || {};
                    categories = data.data.categories || {};
                    console.log('✅ ComponentManager: Using wp_send_json_success format');
                } else if (data.success && data.components) {
                    // Direct return format: {success: true, components: ..., categories: ...}
                    components = data.components || {};
                    categories = data.categories || {};
                    console.log('✅ ComponentManager: Using direct return format');
                } else if (data.components) {
                    // Legacy format: {components: ..., categories: ...}
                    components = data.components || {};
                    categories = data.categories || {};
                    console.log('✅ ComponentManager: Using legacy format');
                } else {
                    throw new Error('Invalid response format: ' + JSON.stringify(data));
                }
                
                this.availableComponents = components;
                console.log('✅ ComponentManager: Loaded', Object.keys(components).length, 'available components');
                console.log('📋 ComponentManager: Component types:', Object.keys(components));
                
                // Populate component library modal
                this.populateComponentLibrary(components, categories);
                
                // Dispatch event that components are loaded
                GMKB.dispatch('gmkb:components-loaded', {
                    components: components,
                    categories: categories
                });
                
                // ROOT FIX: Dispatch available components ready event
                GMKB.dispatch('gmkb:available-components-ready', {
                    components: components,
                    count: Object.keys(components).length,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                console.error('❌ ComponentManager: Error loading components:', error);
                console.error('❌ ComponentManager: Error details:', {
                    message: error.message,
                    stack: error.stack
                });
                // Fallback to hardcoded components for development
                this.loadFallbackComponents();
            }
        },
        
        loadFallbackComponents() {
            console.log('🔄 ComponentManager: Loading fallback components...');
            this.availableComponents = {
                'hero': { name: 'Hero Section', category: 'essential', icon: 'hero-icon.svg', description: 'Add a compelling header with your name and expertise' },
                'biography': { name: 'Biography', category: 'essential', icon: 'bio-icon.svg', description: 'Share your professional background and story' },
                'topics': { name: 'Speaking Topics', category: 'essential', icon: 'topics-icon.svg', description: 'Showcase your areas of expertise' },
                'social': { name: 'Social Links', category: 'contact', icon: 'social-icon.svg', description: 'Connect with your social media profiles' },
                'call-to-action': { name: 'Call to Action', category: 'engagement', icon: 'cta-icon.svg', description: 'Encourage visitors to take action' }
            };
            
            const categories = {
                'essential': Object.values(this.availableComponents).filter(c => c.category === 'essential'),
                'contact': Object.values(this.availableComponents).filter(c => c.category === 'contact'),
                'engagement': Object.values(this.availableComponents).filter(c => c.category === 'engagement')
            };
            
            this.populateComponentLibrary(this.availableComponents, categories);
            
            console.log('⚠️ ComponentManager: Using fallback components:', Object.keys(this.availableComponents));
            
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
        },
        
        /**
         * ROOT FIX: Render component using server-side AJAX integration
         * @param {string} componentId - Component ID to render
         * @returns {Promise<boolean>} Success status
         */
        async renderComponent(componentId) {
            try {
                const state = StateManager.getState();
                const component = state.components[componentId];
                
                if (!component) {
                    console.error(`❌ ComponentManager: Component ${componentId} not found in state`);
                    return false;
                }
                
                console.log(`🎨 ComponentManager: Rendering component ${componentId} (${component.type})`);
                
                // Make AJAX call to render component server-side
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
                            post_id: window.gmkbData.postId,
                            component_id: componentId
                        })
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.data && data.data.html) {
                    // Insert rendered HTML into DOM
                    this.insertComponentIntoDOM(componentId, data.data.html, component);
                    
                    console.log(`✅ ComponentManager: Successfully rendered ${componentId} via server`);
                    return true;
                } else {
                    console.warn(`⚠️ ComponentManager: Server rendering failed for ${componentId}, trying fallback`);
                    console.warn('Server response:', data);
                    
                    // Fallback to client-side rendering
                    return this.renderComponentFallback(componentId);
                }
                
            } catch (error) {
                console.error(`❌ ComponentManager: Error rendering ${componentId}:`, error);
                
                // Fallback to client-side rendering on error
                return this.renderComponentFallback(componentId);
            }
        },
        
        /**
         * ROOT FIX: Fallback component rendering (client-side)
         * @param {string} componentId - Component ID to render
         * @returns {boolean} Success status
         */
        renderComponentFallback(componentId) {
            try {
                const state = StateManager.getState();
                const component = state.components[componentId];
                
                if (!component) {
                    console.error(`❌ ComponentManager: Component ${componentId} not found for fallback`);
                    return false;
                }
                
                console.log(`🔧 ComponentManager: Using fallback rendering for ${componentId} (${component.type})`);
                
                // Generate basic HTML for the component type
                const fallbackHtml = this.generateFallbackHTML(component);
                
                // Insert into DOM
                this.insertComponentIntoDOM(componentId, fallbackHtml, component);
                
                console.log(`✅ ComponentManager: Fallback rendering complete for ${componentId}`);
                return true;
                
            } catch (error) {
                console.error(`❌ ComponentManager: Fallback rendering failed for ${componentId}:`, error);
                return false;
            }
        },
        
        /**
         * ROOT FIX: Insert rendered component HTML into the DOM
         * @param {string} componentId - Component ID
         * @param {string} html - Rendered HTML
         * @param {Object} component - Component data
         */
        insertComponentIntoDOM(componentId, html, component) {
            const previewContainer = document.getElementById('media-kit-preview');
            if (!previewContainer) {
                console.error('❌ ComponentManager: Preview container not found');
                return;
            }
            
            // Remove existing component if it exists
            const existingElement = document.getElementById(componentId);
            if (existingElement) {
                existingElement.remove();
            }
            
            // Create wrapper element
            const componentElement = document.createElement('div');
            componentElement.id = componentId;
            componentElement.className = 'media-kit-component';
            componentElement.setAttribute('data-component-type', component.type);
            componentElement.setAttribute('data-component-id', componentId);
            
            // Insert the component HTML
            componentElement.innerHTML = html;
            
            // Append to preview container
            previewContainer.appendChild(componentElement);
            
            // Attach component interaction handlers
            this.attachComponentHandlers(componentElement, componentId);
            
            // Hide empty state since we have components
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            console.log(`✅ ComponentManager: Inserted ${componentId} into DOM`);
        },
        
        /**
         * ROOT FIX: Attach interaction handlers to component elements
         * @param {HTMLElement} componentElement - Component DOM element
         * @param {string} componentId - Component ID
         */
        attachComponentHandlers(componentElement, componentId) {
            // Add component controls overlay with improved design
            const controlsOverlay = document.createElement('div');
            controlsOverlay.className = 'component-controls';
            controlsOverlay.innerHTML = `
                <div class="component-controls__toolbar">
                    <button class="component-control component-control--edit" data-action="edit" title="Edit Component">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <div class="component-control-group">
                        <button class="component-control component-control--move-up" data-action="move-up" title="Move Up">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="18,15 12,9 6,15"/>
                            </svg>
                        </button>
                        <button class="component-control component-control--move-down" data-action="move-down" title="Move Down">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6,9 12,15 18,9"/>
                            </svg>
                        </button>
                    </div>
                    <button class="component-control component-control--duplicate" data-action="duplicate" title="Duplicate Component">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                    </button>
                    <button class="component-control component-control--delete" data-action="delete" title="Delete Component">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                </div>
            `;
            
            // Insert controls at the beginning of component
            componentElement.insertBefore(controlsOverlay, componentElement.firstChild);
            
            // Attach event listeners
            controlsOverlay.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.closest('[data-action]')?.dataset.action;
                
                if (!action) return;
                
                // Disable button temporarily to prevent double-clicks
                const button = e.target.closest('[data-action]');
                if (button) {
                    button.disabled = true;
                    setTimeout(() => {
                        button.disabled = false;
                    }, 500);
                }
                
                switch (action) {
                    case 'edit':
                        this.editComponent(componentId);
                        break;
                    case 'move-up':
                        this.moveComponentUp(componentId);
                        break;
                    case 'move-down':
                        this.moveComponentDown(componentId);
                        break;
                    case 'duplicate':
                        this.duplicateComponent(componentId);
                        break;
                    case 'delete':
                        this.deleteComponent(componentId);
                        break;
                }
            });
            
            // Show controls on hover with improved animations
            componentElement.addEventListener('mouseenter', () => {
                controlsOverlay.classList.add('component-controls--visible');
            });
            
            componentElement.addEventListener('mouseleave', () => {
                controlsOverlay.classList.remove('component-controls--visible');
            });
            
            console.log(`✅ ComponentManager: Enhanced handlers attached to ${componentId}`);
        },
        
        /**
         * ROOT FIX: Generate fallback HTML for component types
         * @param {Object} component - Component data
         * @returns {string} Fallback HTML
         */
        generateFallbackHTML(component) {
            const data = component.data || {};
            const type = component.type;
            
            const fallbackTemplates = {
                'hero': `
                    <div class="hero-component">
                        <h1 class="hero-title">${data.title || 'Your Name Here'}</h1>
                        <p class="hero-subtitle">${data.subtitle || 'Professional Speaker & Expert'}</p>
                        <p class="hero-description">${data.description || 'Add your professional description here.'}</p>
                    </div>
                `,
                'biography': `
                    <div class="biography-component">
                        <h2>About Me</h2>
                        <p>${data.bio || 'Share your professional background and expertise here.'}</p>
                    </div>
                `,
                'topics': `
                    <div class="topics-component">
                        <h2>Speaking Topics</h2>
                        <div class="topics-list">
                            ${(data.topics || ['Topic 1', 'Topic 2', 'Topic 3']).map(topic => 
                                `<div class="topic-item">
                                    <h3>${topic}</h3>
                                    <p>Description for ${topic}</p>
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                `,
                'social': `
                    <div class="social-component">
                        <h2>Connect With Me</h2>
                        <div class="social-links">
                            <a href="#" class="social-link">🐦 Twitter</a>
                            <a href="#" class="social-link">💼 LinkedIn</a>
                            <a href="#" class="social-link">📸 Instagram</a>
                        </div>
                    </div>
                `,
                'call-to-action': `
                    <div class="cta-component">
                        <h2>${data.title || 'Ready to Book Me?'}</h2>
                        <p>${data.description || 'Let\'s discuss how I can add value to your event.'}</p>
                        <button class="cta-button">${data.buttonText || 'Contact Me'}</button>
                    </div>
                `
            };
            
            return fallbackTemplates[type] || `
                <div class="generic-component">
                    <h2>${type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Component</h2>
                    <p>This component is ready for customization.</p>
                </div>
            `;
        },
        
        /**
         * ROOT FIX: Edit component (opens design panel)
         * @param {string} componentId - Component ID to edit
         */
        async editComponent(componentId) {
            console.log(`✏️ ComponentManager: Opening editor for ${componentId}`);
            
            const state = StateManager.getState();
            const component = state.components[componentId];
            
            if (!component) {
                console.error(`Component ${componentId} not found`);
                return;
            }
            
            try {
                // Load design panel from server
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'guestify_render_design_panel',
                        nonce: window.gmkbData.nonce,
                        component: component.type
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.data && data.data.html) {
                    this.showDesignPanel(data.data.html, componentId);
                } else {
                    // Fallback design panel
                    this.showDesignPanel(this.getGenericDesignPanel(component), componentId);
                }
                
            } catch (error) {
                console.error('Error loading design panel:', error);
                this.showDesignPanel(this.getGenericDesignPanel(component), componentId);
            }
        },
        
        /**
         * ROOT FIX: Show design panel modal
         * @param {string} html - Design panel HTML
         * @param {string} componentId - Component ID being edited
         */
        showDesignPanel(html, componentId) {
            // Create or get design panel modal
            let modal = document.getElementById('design-panel-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'design-panel-modal';
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                    <div class="modal-content design-panel-modal">
                        <div class="modal-header">
                            <h3>Edit Component</h3>
                            <button class="modal-close" data-action="close">×</button>
                        </div>
                        <div class="modal-body" id="design-panel-content">
                            <!-- Design panel content goes here -->
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn--secondary" data-action="cancel">Cancel</button>
                            <button class="btn btn--primary" data-action="save">Save Changes</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Attach modal event listeners
                modal.addEventListener('click', (e) => {
                    const action = e.target.dataset.action;
                    if (action === 'close' || action === 'cancel' || e.target === modal) {
                        modal.style.display = 'none';
                    } else if (action === 'save') {
                        this.saveComponentChanges(componentId);
                        modal.style.display = 'none';
                    }
                });
            }
            
            // Insert design panel content
            const contentContainer = modal.querySelector('#design-panel-content');
            contentContainer.innerHTML = html;
            
            // Show modal
            modal.style.display = 'flex';
            
            console.log(`✅ ComponentManager: Design panel opened for ${componentId}`);
        },
        
        /**
         * ROOT FIX: Get generic design panel HTML
         * @param {Object} component - Component data
         * @returns {string} Generic design panel HTML
         */
        getGenericDesignPanel(component) {
            return `
                <div class="design-panel-content">
                    <h4>Edit ${component.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                    <p>This component supports inline editing. Click directly on text in the preview to edit it.</p>
                    <div class="form-group">
                        <label>Component Type:</label>
                        <input type="text" value="${component.type}" readonly class="form-input" />
                    </div>
                    <div class="form-group">
                        <label>Component ID:</label>
                        <input type="text" value="${component.id}" readonly class="form-input" />
                    </div>
                </div>
            `;
        },
        
        /**
         * ROOT FIX: Save component changes from design panel
         * @param {string} componentId - Component ID
         */
        saveComponentChanges(componentId) {
            console.log(`💾 ComponentManager: Saving changes for ${componentId}`);
            
            // Get form data from design panel
            const modal = document.getElementById('design-panel-modal');
            if (!modal) return;
            
            const formData = {};
            const inputs = modal.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                if (input.name) {
                    formData[input.name] = input.value;
                }
            });
            
            // Update component in state
            StateManager.updateComponent(componentId, { data: formData });
            
            console.log(`✅ ComponentManager: Saved changes for ${componentId}`);
        },
        
        /**
         * ROOT FIX: Move component up in layout
         * @param {string} componentId - Component ID to move up
         */
        moveComponentUp(componentId) {
            const state = StateManager.getState();
            const currentIndex = state.layout.indexOf(componentId);
            
            if (currentIndex <= 0) {
                console.log(`⚠️ ComponentManager: Cannot move ${componentId} up - already at top`);
                return;
            }
            
            console.log(`⬆️ ComponentManager: Moving ${componentId} up`);
            
            const newLayout = [...state.layout];
            // Swap with previous item
            [newLayout[currentIndex], newLayout[currentIndex - 1]] = 
            [newLayout[currentIndex - 1], newLayout[currentIndex]];
            
            StateManager.setState({ layout: newLayout });
            this.reorderComponentsInDOM();
            
            // Visual feedback
            const element = document.getElementById(componentId);
            if (element) {
                element.classList.add('component-moved');
                setTimeout(() => {
                    element.classList.remove('component-moved');
                }, 300);
            }
        },
        
        /**
         * ROOT FIX: Move component down in layout
         * @param {string} componentId - Component ID to move down
         */
        moveComponentDown(componentId) {
            const state = StateManager.getState();
            const currentIndex = state.layout.indexOf(componentId);
            
            if (currentIndex === -1 || currentIndex >= state.layout.length - 1) {
                console.log(`⚠️ ComponentManager: Cannot move ${componentId} down - already at bottom`);
                return;
            }
            
            console.log(`⬇️ ComponentManager: Moving ${componentId} down`);
            
            const newLayout = [...state.layout];
            // Swap with next item
            [newLayout[currentIndex], newLayout[currentIndex + 1]] = 
            [newLayout[currentIndex + 1], newLayout[currentIndex]];
            
            StateManager.setState({ layout: newLayout });
            this.reorderComponentsInDOM();
            
            // Visual feedback
            const element = document.getElementById(componentId);
            if (element) {
                element.classList.add('component-moved');
                setTimeout(() => {
                    element.classList.remove('component-moved');
                }, 300);
            }
        },
        
        /**
         * ROOT FIX: Duplicate component
         * @param {string} componentId - Component ID to duplicate
         */
        async duplicateComponent(componentId) {
            console.log(`📋 ComponentManager: Duplicating ${componentId}`);
            
            const state = StateManager.getState();
            const component = state.components[componentId];
            
            if (!component) {
                console.error(`Component ${componentId} not found for duplication`);
                return;
            }
            
            // Create new component with duplicated data
            const duplicatedComponent = {
                ...component,
                id: 'component-' + Date.now(),
                data: { ...component.data }
            };
            
            // Add to state
            const newId = StateManager.addComponent(duplicatedComponent);
            
            // Render the duplicated component
            await this.renderComponent(newId);
            
            console.log(`✅ ComponentManager: Duplicated ${componentId} as ${newId}`);
        },
        
        /**
         * ROOT FIX: Delete component
         * @param {string} componentId - Component ID to delete
         */
        deleteComponent(componentId) {
            if (confirm('Are you sure you want to delete this component?')) {
                console.log(`🗑️ ComponentManager: Deleting ${componentId}`);
                this.removeComponent(componentId);
            }
        },
        
        /**
         * ROOT FIX: Reorder components in DOM to match layout state
         */
        reorderComponentsInDOM() {
            const state = StateManager.getState();
            const previewContainer = document.getElementById('media-kit-preview');
            
            if (!previewContainer) return;
            
            // Reorder DOM elements to match layout order
            state.layout.forEach((componentId, index) => {
                const element = document.getElementById(componentId);
                if (element) {
                    previewContainer.appendChild(element);
                }
            });
            
            console.log('✅ ComponentManager: DOM reordered to match layout');
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
                savedStateData: null,
                hasSavedComponents: false // Track if we actually have saved components
            };
            
            // Listen for saved state loaded event
            GMKB.subscribe('gmkb:saved-state-loaded', (event) => {
                console.log('🔄 UIManager: Saved state loaded event received', event.detail);
                this.eventState.savedStateLoaded = true;
                this.eventState.savedStateData = event.detail;
                this.eventState.hasSavedComponents = true; // We have components to load
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
            console.log('🎯 UIManager: Checking readiness - savedState:', this.eventState.savedStateLoaded, 'availableComponents:', this.eventState.availableComponentsReady, 'hasSavedComponents:', this.eventState.hasSavedComponents);
            
            // If we have saved components, wait for both events
            if (this.eventState.hasSavedComponents) {
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
                    
                    this.resetEventState();
                }
            } else {
                // No saved components - just need available components to be ready to show empty state
                if (this.eventState.availableComponentsReady) {
                    console.log('🎯 UIManager: No saved components - ensuring empty state is visible');
                    this.ensureEmptyStateVisible();
                    this.resetEventState();
                }
            }
        },
        
        resetEventState() {
            // Reset state for future use
            this.eventState.savedStateLoaded = false;
            this.eventState.availableComponentsReady = false;
            this.eventState.savedStateData = null;
            this.eventState.hasSavedComponents = false;
        },
        
        ensureEmptyStateVisible() {
            const emptyState = document.getElementById('empty-state');
            const previewContainer = document.getElementById('media-kit-preview');
            
            if (emptyState && previewContainer) {
                // Make sure empty state is visible
                emptyState.style.display = 'block';
                
                // Clear any existing components that shouldn't be there
                const existingComponents = previewContainer.querySelectorAll('.media-kit-component');
                if (existingComponents.length === 0) {
                    console.log('✅ UIManager: Empty state properly displayed');
                } else {
                    console.log('⚠️ UIManager: Found unexpected components in empty state:', existingComponents.length);
                }
            } else {
                console.warn('⚠️ UIManager: Empty state or preview container not found');
            }
        },
        
        initializeButtons() {
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
