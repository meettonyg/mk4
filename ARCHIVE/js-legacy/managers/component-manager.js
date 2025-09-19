/**
 * @file component-manager.js - Component Management System
 * @description Handles component rendering, editing, and lifecycle management
 */

// ROOT FIX: Access global objects instead of ES6 imports
// GMKB and StateManager will be available globally

const ComponentManager = {
    availableComponents: {},
    
    // ROOT FIX: Global action listeners flag
    globalActionListenersSetup: false,
    
    init() {
        console.log('🧩 ComponentManager: Initialized (Server-Integrated)');
        
        // ROOT FIX: Setup global action listeners ONCE during initialization
        this.initializeGlobalActionListeners();
        
        // ROOT FIX: Load available components for library ONLY (no rendering triggers)
        this.loadAvailableComponentsForLibrary();
    },
    
    /**
     * ROOT FIX: Initialize global action listeners for ComponentManager
     */
    initializeGlobalActionListeners() {
        if (this.globalActionListenersSetup) {
            console.log('ℹ️ ComponentManager: Global action listeners already setup');
            return;
        }
        
        console.log('🚀 ComponentManager: Setting up global action listeners...');
        
        const globalHandlers = {
            'gmkb:component-edit-requested': (event) => {
                const componentId = event.detail.componentId;
                console.log(`🎨 ComponentManager: Edit requested for ${componentId}`);
                this.editComponent(componentId);
            },
            
            'gmkb:component-move-up-requested': (event) => {
                const componentId = event.detail.componentId;
                console.log(`⬆️ ComponentManager: Move up requested for ${componentId}`);
                this.moveComponentUp(componentId);
            },
            
            'gmkb:component-move-down-requested': (event) => {
                const componentId = event.detail.componentId;
                console.log(`⬇️ ComponentManager: Move down requested for ${componentId}`);
                this.moveComponentDown(componentId);
            },
            
            'gmkb:component-duplicate-requested': (event) => {
                const componentId = event.detail.componentId;
                console.log(`📋 ComponentManager: Duplicate requested for ${componentId}`);
                this.duplicateComponent(componentId);
            },
            
            'gmkb:component-delete-requested': (event) => {
                const componentId = event.detail.componentId;
                console.log(`🗑️ ComponentManager: Delete requested for ${componentId}`);
                this.deleteComponent(componentId);
            }
        };
        
        // Subscribe to all events globally using GMKB
        Object.entries(globalHandlers).forEach(([eventName, handler]) => {
            if (window.GMKB) {
                window.GMKB.subscribe(eventName, handler);
            }
        });
        
        this.globalActionListenersSetup = true;
        console.log('✅ ComponentManager: Global action listeners setup complete');
    },
    
    /**
     * ROOT FIX: Load available components for library only - no rendering triggers
     * This method ONLY populates the component library and does NOT trigger any component rendering
     */
    async loadAvailableComponentsForLibrary() {
        try {
            console.log('🔄 ComponentManager: Loading available components for library ONLY (no renders)...');
            
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
            console.log('🔍 ComponentManager: Server response for library:', data);
            
            // ROOT FIX: Handle both wp_send_json_success and direct return formats
            let components, categories;
            
            if (data.success && data.data) {
                components = data.data.components || {};
                categories = data.data.categories || {};
                console.log('✅ ComponentManager: Using wp_send_json_success format');
            } else if (data.success && data.components) {
                components = data.components || {};
                categories = data.categories || {};
                console.log('✅ ComponentManager: Using direct return format');
            } else if (data.components) {
                components = data.components || {};
                categories = data.categories || {};
                console.log('✅ ComponentManager: Using legacy format');
            } else {
                throw new Error('Invalid response format: ' + JSON.stringify(data));
            }
            
            this.availableComponents = components;
            console.log('✅ ComponentManager: Loaded', Object.keys(components).length, 'available components for library');
            console.log('📋 ComponentManager: Component types:', Object.keys(components));
            
            // ROOT FIX: ONLY populate component library - NO rendering events
            this.populateComponentLibraryOnly(components, categories);
            
            console.log('✅ ComponentManager: Library population complete - NO component renders triggered');
            
        } catch (error) {
            console.error('❌ ComponentManager: Error loading components for library:', error);
            this.loadFallbackComponentsForLibrary();
        }
    },
    
    /**
     * ROOT FIX: Load fallback components for library only - no rendering triggers
     */
    loadFallbackComponentsForLibrary() {
        console.log('🔄 ComponentManager: Loading fallback components for library only...');
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
        
        this.populateComponentLibraryOnly(this.availableComponents, categories);
        
        console.log('⚠️ ComponentManager: Using fallback components for library only:', Object.keys(this.availableComponents));
    },
    
    /**
     * ROOT FIX: Populate component library without triggering any rendering events
     * This method ONLY updates the component library DOM - NO component rendering
     */
    populateComponentLibraryOnly(components, categories) {
        const componentGrid = document.getElementById('component-grid');
        if (!componentGrid) {
            console.warn('🧩 ComponentManager: Component grid not found - library not populated');
            return;
        }
        
        console.log('📋 ComponentManager: Populating component library ONLY (no renders)...');
        
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
            componentCard.className = 'component-item component-card';
            componentCard.setAttribute('data-component-type', key);
            componentCard.setAttribute('data-component', key);
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
            
            // Make component card draggable
            componentCard.draggable = true;
            
            componentGrid.appendChild(componentCard);
        });
        
        console.log('✅ ComponentManager: Library populated with', Object.keys(components).length, 'components - NO rendering triggered');
        
        // Set up drag handlers for newly populated components
        if (window.DragDropManager && window.DragDropManager.updateComponentLibraryDragHandlers) {
            window.DragDropManager.updateComponentLibraryDragHandlers();
        }
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
        // ROOT FIX: Generate unique component ID first
        const componentId = `${type}-${Date.now()}-${Math.floor(Math.random() * 100)}`;
        
        // ROOT FIX: Get current state to check sections
        const currentState = window.enhancedStateManager ? window.enhancedStateManager.getState() : 
                           (window.StateManager ? window.StateManager.getState() : null);
        
        if (!currentState) {
            console.error('❌ ComponentManager: No state manager available');
            return null;
        }
        
        // ROOT FIX: ALWAYS ensure we have a section for the component
        let targetSectionId = null;
        let sections = currentState.sections || [];
        
        if (sections.length === 0) {
            // No sections exist - create a default one
            console.log('🔧 ComponentManager: No sections found, creating default section');
            const defaultSection = {
                section_id: `section_${Date.now()}`,
                section_type: 'full_width',
                layout: {
                    width: 'full_width',
                    max_width: '100%',
                    padding: '40px 20px',
                    columns: 1,
                    column_gap: '0px'
                },
                section_options: {
                    background_type: 'none',
                    background_color: 'transparent',
                    spacing_top: 'medium',
                    spacing_bottom: 'medium'
                },
                responsive: {
                    mobile: { padding: '20px 15px' },
                    tablet: { padding: '30px 20px' }
                },
                components: [],
                created_at: Date.now(),
                updated_at: Date.now()
            };
            
            // Add default section to state
            sections = [defaultSection];
            targetSectionId = defaultSection.section_id;
            
            // Update sections in state manager
            if (window.enhancedStateManager) {
                window.enhancedStateManager.updateSections(sections);
            }
            
            console.log(`✅ ComponentManager: Created default section ${targetSectionId}`);
        } else {
            // Use first available section
            targetSectionId = sections[0].section_id;
            console.log(`🎯 ComponentManager: Using existing section ${targetSectionId}`);
        }
        
        // ROOT FIX: Create component WITH section assignment
        const component = {
            id: componentId,
            type,
            data,
            props: data, // Include props for rendering
            timestamp: Date.now(),
            sectionId: targetSectionId, // ROOT FIX: ALWAYS assign to a section
            columnNumber: 1 // Default to first column
        };
        
        console.log(`🔧 ComponentManager: Creating component ${componentId} with section ${targetSectionId}`);
        
        // ROOT FIX: Add component to state WITH section assignment
        let id = null;
        if (window.enhancedStateManager) {
            window.enhancedStateManager.addComponent(component);
            id = componentId;
        } else if (window.StateManager) {
            id = window.StateManager.addComponent(component);
        }
        
        if (!id) {
            console.error('❌ ComponentManager: Failed to add component to state');
            return null;
        }
        
        // ROOT FIX: Update section's component list
        const updatedSections = sections.map(section => {
            if (section.section_id === targetSectionId) {
                if (!section.components) section.components = [];
                
                // Check if component already in section
                const existingIndex = section.components.findIndex(c => c.component_id === componentId);
                if (existingIndex === -1) {
                    // Add component to section
                    section.components.push({
                        component_id: componentId,
                        column: 1,
                        order: section.components.length,
                        assigned_at: Date.now()
                    });
                    console.log(`✅ ComponentManager: Added ${componentId} to section ${targetSectionId} components list`);
                }
            }
            return section;
        });
        
        // Update sections in state manager
        if (window.enhancedStateManager) {
            window.enhancedStateManager.updateSections(updatedSections);
        }
        
        // ROOT FIX: Dispatch event for SectionLayoutManager
        document.dispatchEvent(new CustomEvent('gmkb:component-added', {
            detail: {
                componentId: componentId,
                componentType: type,
                targetSectionId: targetSectionId,
                timestamp: Date.now()
            }
        }));
        
        // If skipServerRender is true, use fallback rendering (for backwards compatibility)
        if (skipServerRender) {
            this.renderComponentFallback(id);
        } else {
            // Use server-side rendering for real components
            await this.renderComponent(id);
        }
        
        console.log(`✅ ComponentManager: Added component '${type}' with ID: ${id} to section ${targetSectionId}`);
        return id;
    },
    
    removeComponent(id) {
        // Remove from DOM - VANILLA JS
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
        
        // Remove from state
        const success = window.StateManager ? window.StateManager.removeComponent(id) : false;
        
        if (success) {
            console.log(`🧩 ComponentManager: Removed component with ID: ${id}`);
            
            // ROOT FIX: Simplified empty state management (no UIManager dependency)
            const previewContainer = document.getElementById('media-kit-preview');
            const remainingComponents = previewContainer?.querySelectorAll('[data-component-id]');
            
            if (!remainingComponents || remainingComponents.length === 0) {
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'block';
                    console.log('✅ ComponentManager: Showing empty state - no components remaining');
                }
            }
        }
        
        return success;
    },
    
    /**
     * ROOT FIX: Load saved components with single-render guarantee
     * This method ensures each component is rendered EXACTLY ONCE
     */
    async loadSavedComponents() {
        const state = window.StateManager ? window.StateManager.getState() : { components: {}, layout: [] };
        const componentIds = Object.keys(state.components);
        
        if (componentIds.length === 0) {
            console.log('📝 ComponentManager: No saved components to load');
            return;
        }
        
        console.log(`🔄 ComponentManager: ROOT FIX - Single-render loading of ${componentIds.length} saved components...`);
        
        // Hide empty state
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        // ROOT FIX: Track rendered components to prevent duplicate renders
        const renderedComponents = new Set();
        
        // Render each component in layout order - ONCE ONLY
        for (const componentId of state.layout) {
            if (state.components[componentId] && !renderedComponents.has(componentId)) {
                console.log(`🎨 ComponentManager: Single-rendering component ${componentId}`);
                await this.renderComponent(componentId);
                renderedComponents.add(componentId);
                
                // Small delay to prevent race conditions
                await new Promise(resolve => setTimeout(resolve, 10));
            } else if (renderedComponents.has(componentId)) {
                console.log(`⚠️ ComponentManager: Skipping duplicate render of ${componentId}`);
            }
        }
        
        console.log(`✅ ComponentManager: ROOT FIX - Successfully single-rendered ${renderedComponents.size} components`);
    },
    
    /**
     * ROOT FIX: Enhanced component rendering with comprehensive loading state management
     * @param {string} componentId - Component ID to render
     * @returns {Promise<boolean>} Success status
     */
    async renderComponent(componentId) {
        try {
            const state = window.StateManager ? window.StateManager.getState() : { components: {}, layout: [] };
            const component = state.components[componentId];
            
            if (!component) {
                console.error(`❌ ComponentManager: Component ${componentId} not found in state`);
                return false;
            }
            
            console.log(`🎨 ComponentManager: Enhanced rendering for ${componentId} (${component.type})`);
            
            // Validate required data for non-topics components
            if (!window.gmkbData?.ajaxUrl || !window.gmkbData?.nonce) {
                console.error(`❌ ComponentManager: Missing WordPress AJAX data for ${componentId}`);
                return this.renderComponentFallback(componentId);
            }
            
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
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.data && data.data.html) {
                // ROOT FIX: Pass script data from AJAX response to DOM insertion
                const ajaxScripts = data.data.scripts || null;
                
                // Insert rendered HTML into DOM with script data
                this.insertComponentIntoDOM(componentId, data.data.html, component, ajaxScripts);
                
                console.log(`✅ ComponentManager: Successfully rendered ${componentId} via server`);
                if (ajaxScripts && ajaxScripts.length > 0) {
                    console.log(`📜 ComponentManager: ${ajaxScripts.length} scripts included in AJAX response`);
                }
                return true;
            } else {
                console.warn(`⚠️ ComponentManager: Server rendering failed for ${componentId}:`, data);
                
                // Fallback to client-side rendering
                const fallbackSuccess = this.renderComponentFallback(componentId);
                if (fallbackSuccess) {
                    console.log(`✅ ComponentManager: Fallback rendering succeeded for ${componentId}`);
                    return true;
                } else {
                    console.error(`❌ ComponentManager: Both server and fallback rendering failed for ${componentId}`);
                    return false;
                }
            }
            
        } catch (error) {
            console.error(`❌ ComponentManager: Error rendering ${componentId}:`, error);
            
            // Fallback to client-side rendering on error
            const fallbackSuccess = this.renderComponentFallback(componentId);
            if (fallbackSuccess) {
                console.log(`✅ ComponentManager: Fallback rendering succeeded after error for ${componentId}`);
                return true;
            } else {
                console.error(`❌ ComponentManager: All rendering methods failed for ${componentId}`);
                return false;
            }
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
     * @param {Array} ajaxScripts - Script data from AJAX response (optional)
     */
    insertComponentIntoDOM(componentId, html, component, ajaxScripts = null) {
        const previewContainer = document.getElementById('media-kit-preview');
        if (!previewContainer) {
            console.error('❌ ComponentManager: Preview container not found');
            return;
        }
        
        // ROOT FIX: Remove existing element if present (no controls preservation needed)
        const existingElement = document.getElementById(componentId);
        if (existingElement) {
            console.log(`🔄 ComponentManager: Removing existing element ${componentId} for clean re-render`);
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
        
        // ROOT FIX: Update the data-component-id of inner elements to match state ID
        const innerComponentElement = componentElement.querySelector('[data-component-id]');
        if (innerComponentElement && innerComponentElement.getAttribute('data-component-id') !== componentId) {
            console.log(`🔧 ComponentManager: Updating inner component ID from ${innerComponentElement.getAttribute('data-component-id')} to ${componentId}`);
            innerComponentElement.setAttribute('data-component-id', componentId);
        }
        
        // Append to preview container
        previewContainer.appendChild(componentElement);
        
        // ROOT FIX: Attach component interaction handlers immediately
        this.attachComponentHandlers(componentElement, componentId);
        
        // ROOT FIX: Load component scripts - prioritize AJAX scripts if available
        if (ajaxScripts && ajaxScripts.length > 0) {
            console.log(`📜 ComponentManager: Loading ${ajaxScripts.length} scripts from AJAX response for ${component.type}`);
            this.loadComponentScriptsFromAjaxData(ajaxScripts, componentId);
        } else {
            // Fallback to original script loading method
            this.loadComponentScripts(component.type, componentId);
        }
        
        // ROOT FIX: Simplified empty state management (no UIManager dependency)
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
            console.log('✅ ComponentManager: Hiding empty state - components present');
        }
        
        console.log(`✅ ComponentManager: Inserted ${componentId} into DOM with dynamic controls`);
    },
    
    /**
     * ROOT FIX: Attach interaction handlers using ComponentControlsManager
     * EVENT-DRIVEN: Wait for ComponentControlsManager via events, no polling
     * @param {HTMLElement} componentElement - Component DOM element
     * @param {string} componentId - Component ID
     */
    attachComponentHandlers(componentElement, componentId) {
        // ROOT FIX: Check if handlers already attached to prevent duplicates
        if (componentElement.hasAttribute('data-handlers-attached')) {
            console.log(`ℹ️ ComponentManager: Handlers already attached to ${componentId}, skipping`);
            return;
        }
        
        // Mark as having handlers attached
        componentElement.setAttribute('data-handlers-attached', 'true');
        
        // ROOT FIX: Find the actual component element to attach controls to
        let targetElement = componentElement;
        
        // If this is a wrapper, find the actual component inside
        const actualComponent = componentElement.querySelector('.topics-component, .hero-component, .biography-component, .social-component, .editable-element');
        if (actualComponent) {
            targetElement = actualComponent;
            console.log(`🎯 ComponentManager: Found actual component element for controls: ${targetElement.className}`);
        }
        
        // Use the actual component's data-component-id if available
        let targetComponentId = targetElement.getAttribute('data-component-id') || componentId;
        
        // ROOT FIX: Event-driven ComponentControlsManager integration
        if (window.componentControlsManager) {
            // ComponentControlsManager is ready - attach immediately
            if (window.GMKB) {
                window.GMKB.attachControlsImmediately(targetElement, targetComponentId);
            }
        } else {
            // ROOT FIX: Listen for ComponentControlsManager ready event (NO POLLING)
            const handleControlsManagerReady = () => {
                if (window.componentControlsManager) {
                    console.log(`✅ ComponentManager: ComponentControlsManager ready for ${targetComponentId}`);
                    if (window.GMKB) {
                        window.GMKB.attachControlsImmediately(targetElement, targetComponentId);
                    }
                    // Remove listener after successful attachment
                    document.removeEventListener('DOMContentLoaded', handleControlsManagerReady);
                    document.removeEventListener('gmkb:component-controls-manager-ready', handleControlsManagerReady);
                }
            };
            
            // ROOT FIX: Multiple event listeners for different loading scenarios
            document.addEventListener('gmkb:component-controls-manager-ready', handleControlsManagerReady);
            document.addEventListener('DOMContentLoaded', handleControlsManagerReady);
            
            // ROOT FIX: Also check on next tick in case manager loads very quickly
            Promise.resolve().then(() => {
                if (window.componentControlsManager) {
                    handleControlsManagerReady();
                }
            });
            
            console.log(`⏳ ComponentManager: Waiting for ComponentControlsManager via events for ${targetComponentId}`);
        }
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
    
    loadComponentScripts(componentType, componentId) {
        // Placeholder for component script loading
        console.log(`📜 ComponentManager: Loading scripts for ${componentType} (${componentId})`);
    },
    
    loadComponentScriptsFromAjaxData(ajaxScripts, componentId) {
        // Placeholder for AJAX script loading
        console.log(`📜 ComponentManager: Loading AJAX scripts for ${componentId}`, ajaxScripts);
    },
    
    // Component action methods (placeholders for actual implementations)
    editComponent(componentId) {
        console.log(`✏️ ComponentManager: Edit component ${componentId}`);
        // Implementation will be added based on existing functionality
    },
    
    moveComponentUp(componentId) {
        console.log(`⬆️ ComponentManager: Move component up ${componentId}`);
        // Implementation will be added based on existing functionality
    },
    
    moveComponentDown(componentId) {
        console.log(`⬇️ ComponentManager: Move component down ${componentId}`);
        // Implementation will be added based on existing functionality
    },
    
    duplicateComponent(componentId) {
        console.log(`📋 ComponentManager: Duplicate component ${componentId}`);
        // Implementation will be added based on existing functionality
    },
    
    deleteComponent(componentId) {
        console.log(`🗑️ ComponentManager: Delete component ${componentId}`);
        // Implementation will be added based on existing functionality
    }
};

// ROOT FIX: Make ComponentManager available globally instead of using ES6 export
window.ComponentManager = ComponentManager;

console.log('✅ ComponentManager: Available globally and ready');
