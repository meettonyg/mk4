/**
 * Universal Component Bi-Directional Sync System
 * Enables contenteditable and sync for ALL component types
 * 
 * PHASE 1 COMPLIANT: Event-driven, no polling, works with any component
 * ARCHITECTURE: Component-agnostic, uses data attributes for universal compatibility
 */
(function() {
    'use strict';
    
    console.log('🌐 Universal Bi-Directional Sync System initializing...');
    
    class UniversalComponentSync {
        constructor() {
            this.syncedComponents = new Map();
            this.editableFields = new Map();
            this.initialized = false;
            
            // Component field mappings - defines what fields are editable for each component type
            this.componentFieldMappings = {
                'topics': {
                    fields: ['title', 'description'],
                    selectors: {
                        preview: '.gmkb-topics__item h4, .gmkb-topics__item p, .topic-item h4, .topic-item p',
                        sidebar: 'input[type="text"], .topic-input, .topics-sidebar__topic-input, textarea'
                    },
                    isListBased: true
                },
                'hero': {
                    fields: ['title', 'subtitle', 'description'],
                    selectors: {
                        preview: '.gmkb-hero__title, .gmkb-hero__subtitle, .gmkb-hero__description',
                        sidebar: 'input[name="title"], input[name="subtitle"], textarea[name="description"]'
                    },
                    isListBased: false
                },
                'biography': {
                    fields: ['title', 'content'],
                    selectors: {
                        preview: '.gmkb-biography h3, .gmkb-biography__content',
                        sidebar: 'input[name="title"], textarea[name="content"]'
                    },
                    isListBased: false
                },
                'contact': {
                    fields: ['email', 'phone', 'website', 'address'],
                    selectors: {
                        preview: '.gmkb-contact__item a, .gmkb-contact__item',
                        sidebar: 'input[name="email"], input[name="phone"], input[name="website"], input[name="address"]'
                    },
                    isListBased: false
                },
                'questions': {
                    fields: ['question'],
                    selectors: {
                        preview: '.gmkb-questions li, .gmkb-questions__item',
                        sidebar: '.question-input'
                    },
                    isListBased: true
                },
                'social': {
                    fields: ['platform', 'url'],
                    selectors: {
                        preview: '.gmkb-social-links__item',
                        sidebar: 'input[name="platform"], input[name="url"]'
                    },
                    isListBased: true
                },
                'guest-intro': {
                    fields: ['name', 'title', 'introduction'],
                    selectors: {
                        preview: '.gmkb-guest-intro h2, .gmkb-guest-intro__title, .gmkb-guest-intro__introduction',
                        sidebar: 'input[name="name"], input[name="title"], textarea[name="introduction"]'
                    },
                    isListBased: false
                },
                'authority-hook': {
                    fields: ['headline', 'subheadline'],
                    selectors: {
                        preview: '.gmkb-authority-hook h2, .gmkb-authority-hook h3',
                        sidebar: 'input[name="headline"], input[name="subheadline"]'
                    },
                    isListBased: false
                },
                'testimonials': {
                    fields: ['quote', 'author'],
                    selectors: {
                        preview: 'blockquote, .testimonial-author',
                        sidebar: '.testimonial-quote, .testimonial-author'
                    },
                    isListBased: true
                },
                'stats': {
                    fields: ['value', 'label'],
                    selectors: {
                        preview: '.gmkb-stats__value, .gmkb-stats__label',
                        sidebar: '.stat-value, .stat-label'
                    },
                    isListBased: true
                },
                'portfolio': {
                    fields: ['title', 'description'],
                    selectors: {
                        preview: '.gmkb-portfolio__item h4, .gmkb-portfolio__item p',
                        sidebar: '.portfolio-title, .portfolio-description'
                    },
                    isListBased: true
                },
                'call-to-action': {
                    fields: ['title', 'buttonText'],
                    selectors: {
                        preview: '.gmkb-cta h3, .gmkb-cta__button',
                        sidebar: 'input[name="title"], input[name="buttonText"]'
                    },
                    isListBased: false
                },
                // Add more component types as needed
            };
            
            this.init();
        }
        
        init() {
            // Wait for DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        }
        
        setup() {
            // Listen for component editor ready (Phase 2 Component Options UI)
            document.addEventListener('gmkb:component-editor-ready', (event) => {
                if (event.detail) {
                    console.log(`📝 Component editor ready for ${event.detail.componentType}`);
                    setTimeout(() => this.initializeComponentSync(
                        event.detail.componentId,
                        event.detail.componentType
                    ), 100);
                }
            });
            
            // Listen for ANY component update
            document.addEventListener('gmkb:component-updated', (event) => {
                if (event.detail && event.detail.componentData) {
                    console.log(`🔄 ${event.detail.componentData.type} component updated, refreshing sync...`);
                    setTimeout(() => this.refreshComponentSync(
                        event.detail.componentId, 
                        event.detail.componentData.type
                    ), 100);
                }
            });
            
            // Listen for ANY component render
            document.addEventListener('gmkb:component-rendered', (event) => {
                if (event.detail && event.detail.componentData) {
                    console.log(`🎨 ${event.detail.componentData.type} component rendered, enabling editing...`);
                    setTimeout(() => this.enablePreviewEditing(
                        event.detail.componentId, 
                        event.detail.componentData.type
                    ), 100);
                }
            });
            
            // Initialize for all existing components on page load
            setTimeout(() => this.scanAndInitializeAllComponents(), 1000);
        }
        
        scanAndInitializeAllComponents() {
            console.log('🔍 Scanning for existing components to enable editing...');
            
            // Find all rendered components
            const components = document.querySelectorAll('[data-component-id]');
            components.forEach(component => {
                const componentId = component.getAttribute('data-component-id');
                const componentType = component.getAttribute('data-component-type');
                
                if (componentId && componentType) {
                    this.enablePreviewEditing(componentId, componentType);
                }
            });
            
            console.log(`✅ Enabled editing for ${components.length} existing components`);
        }
        
        initializeComponentSync(componentId, componentType) {
            const mapping = this.componentFieldMappings[componentType];
            if (!mapping) {
                console.log(`⚠️ No field mapping defined for component type: ${componentType}`);
                return;
            }
            
            // Find sidebar elements
            const sidebarElements = this.findSidebarElements(componentType, mapping);
            
            // Find preview elements
            const previewElements = this.findPreviewElements(componentId, componentType, mapping);
            
            // Set up bidirectional sync
            this.setupSync(componentId, componentType, sidebarElements, previewElements, mapping);
            
            // Store in map
            this.syncedComponents.set(componentId, {
                type: componentType,
                sidebarElements,
                previewElements,
                mapping
            });
            
            console.log(`✅ Initialized sync for ${componentType} component: ${componentId}`);
        }
        
        findSidebarElements(componentType, mapping) {
            const elements = {};
            
            // ROOT FIX: Check for Phase 2 Component Options UI first
            let panel = document.querySelector('.component-options__content');
            if (!panel) {
                // Fallback to old design panel
                panel = document.querySelector('#element-editor');
            }
            if (!panel) {
                panel = document.querySelector('.element-editor__content, .design-panel__content, .component-options');
            }
            if (!panel) {
                console.log('⚠️ No sidebar panel found');
                return elements;
            }
            
            // Find elements based on mapping
            if (mapping.isListBased) {
                // For list-based components, find input containers
                const containers = panel.querySelectorAll('.topic-editor__field, .list-item, .item-editor, [data-item-index]');
                if (containers.length > 0) {
                    elements.items = [];
                    containers.forEach(container => {
                        const input = container.querySelector('input[type="text"], textarea');
                        if (input) {
                            elements.items.push(input);
                        }
                    });
                    console.log(`📝 Found ${elements.items.length} inputs in sidebar`);
                } else {
                    // Direct input selection fallback
                    const inputs = panel.querySelectorAll('input[type="text"]:not([type="hidden"]):not([readonly])');
                    if (inputs.length > 0) {
                        elements.items = Array.from(inputs);
                        console.log(`📝 Found ${inputs.length} inputs (fallback)`);
                    }
                }
            } else {
                // For single-field components, find individual inputs
                mapping.fields.forEach(field => {
                    const selector = `input[name="${field}"], textarea[name="${field}"], [data-field="${field}"]`;
                    const element = panel.querySelector(selector);
                    if (element) {
                        elements[field] = element;
                    }
                });
            }
            
            // Fallback to generic selectors from mapping
            if (Object.keys(elements).length === 0 && mapping.selectors.sidebar) {
                const fallbackElements = panel.querySelectorAll(mapping.selectors.sidebar);
                if (fallbackElements.length > 0) {
                    if (mapping.isListBased) {
                        elements.items = Array.from(fallbackElements);
                    } else {
                        mapping.fields.forEach((field, index) => {
                            if (fallbackElements[index]) {
                                elements[field] = fallbackElements[index];
                            }
                        });
                    }
                }
            }
            
            console.log(`📝 Found ${Object.keys(elements).length} sidebar elements for ${componentType}`);
            return elements;
        }
        
        findPreviewElements(componentId, componentType, mapping) {
            const elements = {};
            
            // Find component container
            const component = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!component) {
                console.log(`⚠️ Component ${componentId} not found in preview`);
                return elements;
            }
            
            // Find elements based on mapping
            if (mapping.selectors.preview) {
                const previewElements = component.querySelectorAll(mapping.selectors.preview);
                
                if (mapping.isListBased) {
                    elements.items = Array.from(previewElements);
                } else {
                    mapping.fields.forEach((field, index) => {
                        if (previewElements[index]) {
                            elements[field] = previewElements[index];
                        }
                    });
                }
            }
            
            console.log(`🎨 Found ${Object.keys(elements).length} preview elements for ${componentType}`);
            return elements;
        }
        
        enablePreviewEditing(componentId, componentType) {
            const mapping = this.componentFieldMappings[componentType];
            if (!mapping) {
                // For unknown component types, make all text elements editable
                this.enableGenericEditing(componentId);
                return;
            }
            
            const previewElements = this.findPreviewElements(componentId, componentType, mapping);
            
            // Make elements editable
            if (mapping.isListBased && previewElements.items) {
                previewElements.items.forEach(element => {
                    this.makeElementEditable(element, componentId, componentType);
                });
            } else {
                Object.values(previewElements).forEach(element => {
                    this.makeElementEditable(element, componentId, componentType);
                });
            }
            
            // Store editable fields
            this.editableFields.set(componentId, previewElements);
        }
        
        enableGenericEditing(componentId) {
            const component = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!component) return;
            
            // Make all text elements editable
            const textElements = component.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, blockquote, a, button');
            textElements.forEach(element => {
                // Skip if element has children that shouldn't be made editable
                if (element.querySelector('input, select, textarea, img, svg')) return;
                
                this.makeElementEditable(element, componentId, 'generic');
            });
            
            console.log(`✅ Enabled generic editing for component: ${componentId}`);
        }
        
        makeElementEditable(element, componentId, componentType) {
            if (!element || element.hasAttribute('data-sync-enabled')) return;
            
            // Make element editable
            element.setAttribute('contenteditable', 'true');
            element.setAttribute('data-sync-enabled', 'true');
            element.setAttribute('data-component-id', componentId);
            element.setAttribute('data-component-type', componentType);
            
            // Style for editing
            element.style.cursor = 'text';
            element.style.outline = 'none';
            element.style.minHeight = '20px';
            element.style.position = 'relative';
            
            // Add visual feedback
            element.addEventListener('mouseenter', () => {
                element.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                element.style.boxShadow = 'inset 0 0 0 1px rgba(59, 130, 246, 0.2)';
            });
            
            element.addEventListener('mouseleave', () => {
                if (element !== document.activeElement) {
                    element.style.backgroundColor = '';
                    element.style.boxShadow = '';
                }
            });
            
            element.addEventListener('focus', () => {
                element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                element.style.boxShadow = 'inset 0 0 0 2px rgba(59, 130, 246, 0.4)';
                
                // Show editing tooltip
                this.showEditingTooltip(element);
            });
            
            element.addEventListener('blur', () => {
                element.style.backgroundColor = '';
                element.style.boxShadow = '';
                
                // Hide tooltip
                this.hideEditingTooltip();
                
                // Trigger sync
                this.handlePreviewChange(element, componentId, componentType);
            });
            
            // Handle enter key
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    element.blur();
                }
            });
            
            // Handle input changes
            element.addEventListener('input', () => {
                this.handlePreviewChange(element, componentId, componentType);
            });
        }
        
        showEditingTooltip(element) {
            // Remove existing tooltip
            this.hideEditingTooltip();
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'gmkb-editing-tooltip';
            tooltip.innerHTML = '✏️ Editing - Press Enter to save';
            tooltip.style.cssText = `
                position: absolute;
                top: -30px;
                left: 0;
                background: #1e293b;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 10000;
                pointer-events: none;
            `;
            
            element.style.position = 'relative';
            element.appendChild(tooltip);
        }
        
        hideEditingTooltip() {
            const tooltips = document.querySelectorAll('.gmkb-editing-tooltip');
            tooltips.forEach(tooltip => tooltip.remove());
        }
        
        setupSync(componentId, componentType, sidebarElements, previewElements, mapping) {
            // Set up sidebar to preview sync
            if (mapping.isListBased) {
                if (sidebarElements.items) {
                    sidebarElements.items.forEach((item, index) => {
                        this.setupSidebarItemSync(item, index, previewElements, componentId);
                    });
                }
            } else {
                Object.entries(sidebarElements).forEach(([field, element]) => {
                    this.setupSidebarFieldSync(element, field, previewElements, componentId);
                });
            }
            
            // Set up preview to sidebar sync
            if (mapping.isListBased) {
                if (previewElements.items) {
                    previewElements.items.forEach((item, index) => {
                        this.setupPreviewItemSync(item, index, sidebarElements, componentId);
                    });
                }
            } else {
                Object.entries(previewElements).forEach(([field, element]) => {
                    this.setupPreviewFieldSync(element, field, sidebarElements, componentId);
                });
            }
        }
        
        setupSidebarItemSync(item, index, previewElements, componentId) {
            // For topics, the item IS the input element directly
            const input = item.tagName === 'INPUT' || item.tagName === 'TEXTAREA' ? item : item.querySelector('input, textarea');
            
            if (input) {
                const syncHandler = () => {
                    if (previewElements.items && previewElements.items[index]) {
                        const previewElement = previewElements.items[index];
                        if (previewElement.textContent !== input.value) {
                            previewElement.textContent = input.value;
                            this.showSyncFeedback(previewElement, 'updated');
                            this.updateComponentState(componentId);
                            console.log(`🔄 Synced sidebar → preview: Topic ${index + 1}`);
                        }
                    }
                };
                
                input.addEventListener('input', syncHandler);
                input.addEventListener('blur', syncHandler);
                input.addEventListener('change', syncHandler);
            }
        }
        
        setupSidebarFieldSync(element, field, previewElements, componentId) {
            const syncHandler = () => {
                if (previewElements[field]) {
                    const previewElement = previewElements[field];
                    const value = element.value || element.textContent;
                    
                    if (previewElement.textContent !== value) {
                        previewElement.textContent = value;
                        this.showSyncFeedback(previewElement, 'updated');
                        this.updateComponentState(componentId);
                    }
                }
            };
            
            element.addEventListener('input', syncHandler);
            element.addEventListener('blur', syncHandler);
        }
        
        setupPreviewItemSync(item, index, sidebarElements, componentId) {
            // Already handled by makeElementEditable
        }
        
        setupPreviewFieldSync(element, field, sidebarElements, componentId) {
            // Already handled by makeElementEditable
        }
        
        handlePreviewChange(element, componentId, componentType) {
            const value = element.textContent.trim();
            
            // Find corresponding sidebar element and update it
            const syncedComponent = this.syncedComponents.get(componentId);
            if (syncedComponent) {
                // Update sidebar based on which preview element changed
                this.updateSidebarFromPreview(element, value, syncedComponent);
            }
            
            // Update component state
            this.updateComponentState(componentId);
            
            // Show sync feedback
            this.showSyncFeedback(element, 'synced');
        }
        
        updateSidebarFromPreview(previewElement, value, syncedComponent) {
            // Find which field this preview element corresponds to
            const { sidebarElements, previewElements, mapping } = syncedComponent;
            
            if (mapping.isListBased) {
                // Find index of this preview element
                const index = previewElements.items?.indexOf(previewElement);
                if (index >= 0 && sidebarElements.items && sidebarElements.items[index]) {
                    const sidebarItem = sidebarElements.items[index];
                    const input = sidebarItem.querySelector('input, textarea');
                    if (input && input.value !== value) {
                        input.value = value;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        this.showSyncFeedback(input, 'updated');
                    }
                }
            } else {
                // Find which field this element belongs to
                Object.entries(previewElements).forEach(([field, element]) => {
                    if (element === previewElement && sidebarElements[field]) {
                        const sidebarElement = sidebarElements[field];
                        if (sidebarElement.value !== value) {
                            sidebarElement.value = value;
                            sidebarElement.dispatchEvent(new Event('input', { bubbles: true }));
                            this.showSyncFeedback(sidebarElement, 'updated');
                        }
                    }
                });
            }
        }
        
        showSyncFeedback(element, type) {
            const colors = {
                updated: '#22c55e',
                synced: '#3b82f6',
                error: '#ef4444'
            };
            
            const originalTransition = element.style.transition;
            const originalBackground = element.style.backgroundColor;
            const originalBorder = element.style.borderColor;
            
            element.style.transition = 'all 0.3s ease';
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.style.borderColor = colors[type];
            } else {
                element.style.backgroundColor = `${colors[type]}20`;
            }
            
            setTimeout(() => {
                element.style.transition = originalTransition;
                element.style.backgroundColor = originalBackground;
                element.style.borderColor = originalBorder;
            }, 300);
        }
        
        updateComponentState(componentId) {
            if (!window.enhancedStateManager) return;
            
            const state = window.enhancedStateManager.getState();
            const component = state.components[componentId];
            if (!component) return;
            
            // Get all current values from preview
            const editableFields = this.editableFields.get(componentId);
            if (!editableFields) return;
            
            const updatedData = {};
            
            if (editableFields.items) {
                // List-based component
                updatedData.items = editableFields.items.map(element => ({
                    value: element.textContent.trim()
                }));
            } else {
                // Field-based component
                Object.entries(editableFields).forEach(([field, element]) => {
                    updatedData[field] = element.textContent.trim();
                });
            }
            
            // Update component in state
            const updatedComponent = {
                ...component,
                props: {
                    ...component.props,
                    ...updatedData
                },
                data: {
                    ...component.data,
                    ...updatedData
                }
            };
            
            window.enhancedStateManager.updateComponent(componentId, updatedComponent);
            console.log(`📊 Updated ${component.type} component state with synced data`);
        }
        
        refreshComponentSync(componentId, componentType) {
            // Re-initialize sync for this component
            this.initializeComponentSync(componentId, componentType);
        }
        
        // Public API
        debug() {
            console.log('🔍 Universal Component Sync Status:');
            console.log(`  Initialized: ${this.initialized}`);
            console.log(`  Synced components: ${this.syncedComponents.size}`);
            console.log(`  Component types supported: ${Object.keys(this.componentFieldMappings).length}`);
            
            this.syncedComponents.forEach((data, componentId) => {
                console.log(`  ${componentId} (${data.type}):`);
                console.log(`    Sidebar elements:`, data.sidebarElements);
                console.log(`    Preview elements:`, data.previewElements);
            });
        }
        
        forceSync(componentId, direction = 'both') {
            const syncedComponent = this.syncedComponents.get(componentId);
            if (!syncedComponent) {
                console.log(`⚠️ Component ${componentId} not found in synced components`);
                return;
            }
            
            console.log(`🔄 Force syncing ${componentId} (${direction})...`);
            
            // Implementation depends on the specific needs
            // This is a placeholder for the force sync logic
        }
        
        enableAllComponents() {
            this.scanAndInitializeAllComponents();
        }
    }
    
    // Initialize the universal sync system
    window.UniversalComponentSync = new UniversalComponentSync();
    
    // Expose global API
    window.ComponentSync = {
        debug: () => window.UniversalComponentSync.debug(),
        forceSync: (componentId, direction) => window.UniversalComponentSync.forceSync(componentId, direction),
        enableAll: () => window.UniversalComponentSync.enableAllComponents(),
        addComponentType: (type, mapping) => {
            window.UniversalComponentSync.componentFieldMappings[type] = mapping;
            console.log(`✅ Added support for ${type} component type`);
        },
        // Manual sync initialization for when panel is ready
        initTopicsSync: () => {
            const componentId = document.querySelector('[data-component-type="topics"]')?.getAttribute('data-component-id');
            if (componentId) {
                window.UniversalComponentSync.initializeComponentSync(componentId, 'topics');
                console.log(`✅ Manually initialized topics sync for ${componentId}`);
                return true;
            }
            console.log('⚠️ No topics component found');
            return false;
        },
        // Force refresh sync for a component
        refreshSync: (componentId, componentType) => {
            window.UniversalComponentSync.initializeComponentSync(componentId, componentType);
            console.log(`🔄 Refreshed sync for ${componentId}`);
        }
    };
    
    console.log('✅ Universal Bi-Directional Sync System loaded');
    console.log('💡 Use ComponentSync.debug() to check status');
    console.log('💡 Use ComponentSync.enableAll() to enable editing for all components');
    console.log('💡 Edit any text in the preview and it will sync to the sidebar!');
})();