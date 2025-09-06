/**
 * Component Options UI
 * Phase 2 Completion: Component Configuration UI Panel
 * 
 * Dynamically generates UI controls based on component schema.json files
 * Integrates with the existing design panel system
 * 
 * @version 2.1.0
 * @package GMKB/System
 */

class ComponentOptionsUI {
    
    /**
     * Get component from state manager
     */
    getComponent(componentId) {
        if (window.enhancedStateManager) {
            return window.enhancedStateManager.getComponentById(componentId);
        }
        return null;
    }
    constructor() {
        this.logger = window.structuredLogger || console;
        this.currentComponentId = null;
        this.currentComponentType = null;
        this.panelContainer = null;
        this.isInitialized = false;
        
        // Wait for dependencies
        this.waitForDependencies();
    }
    
    /**
     * Wait for required dependencies to be available
     */
    waitForDependencies() {
        const checkDependencies = () => {
            if (window.componentConfigurationManager && 
                window.enhancedStateManager && 
                window.dataBindingEngine) {
                this.init();
            } else {
                setTimeout(checkDependencies, 100);
            }
        };
        checkDependencies();
    }
    
    /**
     * Initialize the component options UI
     */
    init() {
        if (this.isInitialized) return;
        
        this.logger.info('COMPONENT_OPTIONS_UI', 'Initializing Component Options UI');
        
        // Listen for edit component events from controls
        document.addEventListener('gmkb:component-edit-requested', this.handleEditComponent.bind(this));
        document.addEventListener('gmkb:design-panel-opened', this.handlePanelOpened.bind(this));
        
        // Listen for component selection changes
        document.addEventListener('gmkb:component-selected', this.handleComponentSelected.bind(this));
        
        this.isInitialized = true;
        this.logger.info('COMPONENT_OPTIONS_UI', 'Component Options UI initialized');
    }
    
    /**
     * Handle edit component event
     */
    handleEditComponent(event) {
        const { componentId } = event.detail;
        
        // Get component type from state
        const component = this.getComponent(componentId);
        if (!component) {
            this.logger.warn('COMPONENT_OPTIONS_UI', 'Component not found', { componentId });
            return;
        }
        
        const componentType = component.type;
        this.openOptionsPanel(componentId, componentType);
    }
    
    /**
     * Handle design panel opened event
     */
    handlePanelOpened(event) {
        const { componentId, componentType } = event.detail;
        if (componentId && componentType) {
            // Integrate with existing design panel
            this.currentComponentId = componentId;
            this.currentComponentType = componentType;
            this.enhanceExistingPanel(componentId, componentType);
        }
    }
    
    /**
     * Handle component selected event
     */
    handleComponentSelected(event) {
        const { componentId, componentType } = event.detail;
        if (this.panelContainer && this.panelContainer.classList.contains('show')) {
            this.renderOptionsUI(componentId, componentType);
        }
    }
    
    /**
     * Open the options panel for a component
     */
    openOptionsPanel(componentId, componentType) {
        this.currentComponentId = componentId;
        this.currentComponentType = componentType;
        
        // Dispatch component selected event to trigger existing design panel
        document.dispatchEvent(new CustomEvent('gmkb:component-selected', {
            detail: {
                componentId,
                componentType,
                source: 'component-options-ui'
            }
        }));
        
        // Wait for design panel to load, then enhance it
        setTimeout(() => {
            this.enhanceExistingPanel(componentId, componentType);
        }, 500);
    }
    
    /**
     * Create design panel if it doesn't exist
     */
    createDesignPanel() {
        const panel = document.createElement('div');
        panel.id = 'design-panel';
        panel.className = 'design-panel';
        panel.innerHTML = `
            <div class="design-panel-header">
                <h3>Component Options</h3>
                <button class="design-panel-close" aria-label="Close panel">
                    <span>&times;</span>
                </button>
            </div>
            <div class="design-panel-body">
                <div class="design-panel-content" id="component-options-content">
                    <!-- Options will be rendered here -->
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add close functionality
        const closeBtn = panel.querySelector('.design-panel-close');
        closeBtn.addEventListener('click', () => this.closePanel());
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('show')) {
                this.closePanel();
            }
        });
        
        return panel;
    }
    
    /**
     * Enhance the existing design panel with schema-based options
     */
    enhanceExistingPanel(componentId, componentType) {
        // Find the element-editor panel
        const elementEditor = document.getElementById('element-editor');
        if (!elementEditor) {
            this.logger.warn('COMPONENT_OPTIONS_UI', 'Element editor not found');
            return;
        }
        
        // Check if we should add our enhancements
        const existingEnhancements = elementEditor.querySelector('.component-options-enhancements');
        if (existingEnhancements) {
            // Already enhanced, just update if needed
            return;
        }
        
        // Get schema for this component
        const schema = window.componentConfigurationManager.getSchema(componentType);
        if (!schema || !schema.componentOptions) {
            // No additional options to add
            return;
        }
        
        // Add our enhancements to the existing panel
        this.addSchemaEnhancements(elementEditor, componentId, componentType, schema);
    }
    
    /**
     * Add schema-based enhancements to the existing design panel
     */
    addSchemaEnhancements(panel, componentId, componentType, schema) {
        // Create enhancement container
        const enhancementContainer = document.createElement('div');
        enhancementContainer.className = 'component-options-enhancements';
        
        // Add advanced options section if we have schema options not covered by the basic panel
        const advancedOptions = this.getAdvancedOptions(schema);
        if (advancedOptions.length > 0) {
            const advancedSection = this.createAdvancedOptionsSection(advancedOptions, componentId);
            enhancementContainer.appendChild(advancedSection);
        }
        
        // Add data bindings section if available
        if (schema.dataBindings) {
            const bindingsSection = this.createDataBindingsSectionSimple(schema, componentId);
            enhancementContainer.appendChild(bindingsSection);
        }
        
        // Append to the panel
        panel.appendChild(enhancementContainer);
        
        // Setup event handlers
        this.setupEnhancementHandlers(enhancementContainer, componentId);
    }
    
    /**
     * Get advanced options not covered by the basic panel
     */
    getAdvancedOptions(schema) {
        const advancedOptions = [];
        const basicOptions = ['title', 'subtitle', 'description', 'content']; // Common basic options
        
        Object.entries(schema.componentOptions || {}).forEach(([key, option]) => {
            if (!basicOptions.includes(key)) {
                advancedOptions.push({ key, ...option });
            }
        });
        
        return advancedOptions;
    }
    
    /**
     * Create advanced options section
     */
    createAdvancedOptionsSection(options, componentId) {
        const section = document.createElement('div');
        section.className = 'form-section';
        section.innerHTML = `
            <h4 class="form-section__title">Advanced Options</h4>
        `;
        
        options.forEach(option => {
            const control = this.createSimpleFormControl(option.key, option, null);
            section.appendChild(control);
        });
        
        return section;
    }
    
    /**
     * Create a simple form control element
     */
    createSimpleFormControl(key, option, currentValue) {
        const container = document.createElement('div');
        container.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = option.label || this.humanizeKey(key);
        container.appendChild(label);
        
        let input;
        
        switch (option.type) {
            case 'select':
                input = document.createElement('select');
                input.className = 'form-control';
                Object.entries(option.options || {}).forEach(([value, text]) => {
                    const optionEl = document.createElement('option');
                    optionEl.value = value;
                    optionEl.textContent = text;
                    if (currentValue === value) {
                        optionEl.selected = true;
                    }
                    input.appendChild(optionEl);
                });
                break;
                
            case 'boolean':
                input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'form-checkbox';
                input.checked = currentValue || option.default;
                break;
                
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control';
                input.value = currentValue || option.default || '';
        }
        
        input.setAttribute('data-option-key', key);
        container.appendChild(input);
        
        return container;
    }
    
    /**
     * Create simplified data bindings section
     */
    createDataBindingsSectionSimple(schema, componentId) {
        const section = document.createElement('div');
        section.className = 'form-section';
        section.innerHTML = `
            <h4 class="form-section__title">Data Bindings</h4>
            <p class="form-help-text">Connect component fields to Pods data</p>
        `;
        
        // Add binding info
        const bindingInfo = document.createElement('div');
        bindingInfo.className = 'binding-info';
        
        Object.entries(schema.dataBindings || {}).forEach(([property, field]) => {
            const row = document.createElement('div');
            row.className = 'binding-row-simple';
            row.innerHTML = `
                <span class="binding-property">${this.humanizeKey(property)}</span>
                <span class="binding-arrow">→</span>
                <span class="binding-field">${field}</span>
            `;
            bindingInfo.appendChild(row);
        });
        
        section.appendChild(bindingInfo);
        
        return section;
    }
    
    /**
     * Setup enhancement event handlers
     */
    setupEnhancementHandlers(container, componentId) {
        // Handle advanced option changes
        container.querySelectorAll('[data-option-key]').forEach(input => {
            const key = input.getAttribute('data-option-key');
            
            input.addEventListener('change', () => {
                const value = input.type === 'checkbox' ? input.checked : input.value;
                this.updateComponentOption(componentId, key, value);
            });
        });
    }
    
    /**
     * Update a component option
     */
    updateComponentOption(componentId, key, value) {
        // Update configuration
        const config = window.componentConfigurationManager.getComponentConfiguration(componentId) || {};
        if (!config.componentOptions) {
            config.componentOptions = {};
        }
        config.componentOptions[key] = value;
        
        window.componentConfigurationManager.updateComponentConfiguration(componentId, config);
        
        // Update component state
        if (window.enhancedStateManager) {
            const updates = { props: { [key]: value } };
            window.enhancedStateManager.updateComponent(componentId, updates);
        }
        
        // Trigger re-render
        document.dispatchEvent(new CustomEvent('gmkb:component-option-changed', {
            detail: { componentId, key, value }
        }));
        
        this.logger.info('COMPONENT_OPTIONS_UI', 'Option updated', { componentId, key, value });
    }
    
    /**
     * Render the options UI for a component (standalone version)
     */
    renderOptionsUI(componentId, componentType) {
        const schema = window.componentConfigurationManager.getSchema(componentType);
        if (!schema) {
            this.logger.warn('COMPONENT_OPTIONS_UI', `No schema found for ${componentType}`);
            this.renderNoSchemaMessage();
            return;
        }
        
        // Get current component state
        const componentState = window.enhancedStateManager.getComponentById(componentId);
        const currentConfig = componentState?.props || {};
        
        // Find content container
        const contentContainer = this.panelContainer.querySelector('#component-options-content') ||
                                this.panelContainer.querySelector('.design-panel-content');
        
        if (!contentContainer) {
            this.logger.error('COMPONENT_OPTIONS_UI', 'Content container not found');
            return;
        }
        
        // Clear existing content
        contentContainer.innerHTML = '';
        
        // Create sections
        const sections = [
            { id: 'component-info', title: 'Component Info', content: this.createInfoSection(componentType, schema) },
            { id: 'component-options', title: 'Options', content: this.createOptionsSection(schema, currentConfig, componentId) },
            { id: 'data-bindings', title: 'Data Bindings', content: this.createDataBindingsSection(schema, currentConfig, componentId) }
        ];
        
        // Create tabbed interface
        const tabsHtml = `
            <div class="component-options-tabs">
                <div class="tabs-header">
                    ${sections.map((section, index) => `
                        <button class="tab-button ${index === 0 ? 'active' : ''}" 
                                data-tab="${section.id}">
                            ${section.title}
                        </button>
                    `).join('')}
                </div>
                <div class="tabs-content">
                    ${sections.map((section, index) => `
                        <div class="tab-panel ${index === 0 ? 'active' : ''}" 
                             id="${section.id}">
                            ${section.content}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        contentContainer.innerHTML = tabsHtml;
        
        // Set up tab functionality
        this.setupTabs(contentContainer);
        
        // Set up form controls
        this.setupFormControls(contentContainer, componentId);
    }
    
    /**
     * Create component info section
     */
    createInfoSection(componentType, schema) {
        return `
            <div class="component-info-section">
                <div class="info-item">
                    <label>Type:</label>
                    <span>${componentType}</span>
                </div>
                <div class="info-item">
                    <label>Name:</label>
                    <span>${schema.name || componentType}</span>
                </div>
                ${schema.description ? `
                    <div class="info-item">
                        <label>Description:</label>
                        <span>${schema.description}</span>
                    </div>
                ` : ''}
                <div class="info-item">
                    <label>Component ID:</label>
                    <code>${this.currentComponentId}</code>
                </div>
            </div>
        `;
    }
    
    /**
     * Create options section with form controls
     */
    createOptionsSection(schema, currentConfig, componentId) {
        const componentOptions = schema.componentOptions || {};
        
        if (Object.keys(componentOptions).length === 0) {
            return '<p class="no-options">No configurable options for this component.</p>';
        }
        
        const optionsHtml = Object.entries(componentOptions).map(([key, option]) => {
            const currentValue = currentConfig[key] !== undefined ? currentConfig[key] : option.default;
            return this.createFormControl(key, option, currentValue);
        }).join('');
        
        return `
            <div class="component-options-form">
                ${optionsHtml}
                <div class="form-actions">
                    <button class="btn btn-primary apply-options" data-component-id="${componentId}">
                        Apply Changes
                    </button>
                    <button class="btn btn-secondary reset-options" data-component-id="${componentId}">
                        Reset to Defaults
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Create a form control based on option type
     */
    createFormControl(key, option, currentValue) {
        const label = option.label || this.humanizeKey(key);
        const inputId = `option-${key}`;
        
        let controlHtml = '';
        
        switch (option.type) {
            case 'select':
                controlHtml = `
                    <select id="${inputId}" name="${key}" class="form-control">
                        ${Object.entries(option.options || {}).map(([value, text]) => `
                            <option value="${value}" ${currentValue === value ? 'selected' : ''}>
                                ${text}
                            </option>
                        `).join('')}
                    </select>
                `;
                break;
                
            case 'boolean':
                controlHtml = `
                    <label class="switch">
                        <input type="checkbox" id="${inputId}" name="${key}" 
                               ${currentValue ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                `;
                break;
                
            case 'number':
                controlHtml = `
                    <input type="number" id="${inputId}" name="${key}" 
                           class="form-control"
                           value="${currentValue}"
                           ${option.min !== undefined ? `min="${option.min}"` : ''}
                           ${option.max !== undefined ? `max="${option.max}"` : ''}
                           ${option.step !== undefined ? `step="${option.step}"` : ''}>
                    ${option.min !== undefined || option.max !== undefined ? `
                        <small class="form-help">
                            ${option.min !== undefined ? `Min: ${option.min}` : ''}
                            ${option.min !== undefined && option.max !== undefined ? ' | ' : ''}
                            ${option.max !== undefined ? `Max: ${option.max}` : ''}
                        </small>
                    ` : ''}
                `;
                break;
                
            case 'color':
                controlHtml = `
                    <div class="color-input-wrapper">
                        <input type="color" id="${inputId}" name="${key}" 
                               class="form-control color-picker"
                               value="${currentValue || '#000000'}">
                        <input type="text" class="form-control color-text" 
                               value="${currentValue || '#000000'}"
                               pattern="^#[0-9A-Fa-f]{6}$">
                    </div>
                `;
                break;
                
            case 'text':
            case 'string':
                controlHtml = `
                    <input type="text" id="${inputId}" name="${key}" 
                           class="form-control"
                           value="${currentValue || ''}">
                `;
                break;
                
            case 'textarea':
                controlHtml = `
                    <textarea id="${inputId}" name="${key}" 
                              class="form-control" rows="3">${currentValue || ''}</textarea>
                `;
                break;
                
            default:
                controlHtml = `
                    <input type="text" id="${inputId}" name="${key}" 
                           class="form-control"
                           value="${currentValue || ''}">
                `;
        }
        
        return `
            <div class="form-group">
                <label for="${inputId}">${label}</label>
                ${controlHtml}
            </div>
        `;
    }
    
    /**
     * Create data bindings section
     */
    createDataBindingsSection(schema, currentConfig, componentId) {
        const dataBindings = schema.dataBindings || {};
        
        if (Object.keys(dataBindings).length === 0) {
            return '<p class="no-bindings">No data bindings available for this component.</p>';
        }
        
        // Get available Pods fields
        const availableFields = this.getAvailablePodsFields();
        
        const bindingsHtml = Object.entries(dataBindings).map(([property, defaultField]) => {
            const currentBinding = currentConfig.dataBindings?.[property] || defaultField;
            
            return `
                <div class="binding-row">
                    <div class="binding-property">
                        <label>${this.humanizeKey(property)}</label>
                    </div>
                    <div class="binding-arrow">→</div>
                    <div class="binding-field">
                        <select name="binding-${property}" class="form-control binding-select">
                            <option value="">None</option>
                            ${availableFields.map(field => `
                                <option value="${field.key}" 
                                        ${currentBinding === field.key ? 'selected' : ''}>
                                    ${field.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="binding-preview">
                        <button class="btn btn-sm preview-binding" 
                                data-property="${property}"
                                data-component-id="${componentId}">
                            Preview
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="data-bindings-form">
                ${bindingsHtml}
                <div class="form-actions">
                    <button class="btn btn-primary apply-bindings" data-component-id="${componentId}">
                        Apply Bindings
                    </button>
                    <button class="btn btn-secondary test-bindings" data-component-id="${componentId}">
                        Test All Bindings
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Get available Pods fields
     */
    getAvailablePodsFields() {
        // Get from WordPress data if available
        if (window.gmkbData?.podsFields) {
            return window.gmkbData.podsFields;
        }
        
        // Default common fields
        return [
            { key: 'full_name', label: 'Full Name' },
            { key: 'first_name', label: 'First Name' },
            { key: 'last_name', label: 'Last Name' },
            { key: 'guest_title', label: 'Title/Position' },
            { key: 'biography', label: 'Full Biography' },
            { key: 'biography_short', label: 'Short Biography' },
            { key: 'guest_headshot', label: 'Headshot Image' },
            { key: 'speaking_topics', label: 'Speaking Topics' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'website', label: 'Website' },
            { key: 'social_links', label: 'Social Links' },
            { key: 'cta_button_text', label: 'CTA Button Text' },
            { key: 'cta_button_link', label: 'CTA Button Link' }
        ];
    }
    
    /**
     * Set up tab functionality
     */
    setupTabs(container) {
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabPanels = container.querySelectorAll('.tab-panel');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                button.classList.add('active');
                const targetPanel = container.querySelector(`#${targetTab}`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }
    
    /**
     * Set up form controls and event handlers
     */
    setupFormControls(container, componentId) {
        // Handle real-time updates for form controls
        const inputs = container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Skip binding selects and action buttons
            if (input.classList.contains('binding-select') || 
                input.type === 'button' || 
                input.type === 'submit') {
                return;
            }
            
            // Add real-time preview
            const updatePreview = () => {
                this.updateComponentPreview(componentId, this.collectFormData(container));
            };
            
            if (input.type === 'checkbox') {
                input.addEventListener('change', updatePreview);
            } else {
                input.addEventListener('input', updatePreview);
            }
        });
        
        // Handle color picker sync
        const colorPickers = container.querySelectorAll('.color-picker');
        colorPickers.forEach(picker => {
            const textInput = picker.nextElementSibling;
            if (textInput && textInput.classList.contains('color-text')) {
                picker.addEventListener('input', () => {
                    textInput.value = picker.value;
                    this.updateComponentPreview(componentId, this.collectFormData(container));
                });
                
                textInput.addEventListener('input', () => {
                    if (/^#[0-9A-Fa-f]{6}$/.test(textInput.value)) {
                        picker.value = textInput.value;
                        this.updateComponentPreview(componentId, this.collectFormData(container));
                    }
                });
            }
        });
        
        // Handle apply button
        const applyBtn = container.querySelector('.apply-options');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyOptions(componentId, this.collectFormData(container));
            });
        }
        
        // Handle reset button
        const resetBtn = container.querySelector('.reset-options');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetOptions(componentId);
            });
        }
        
        // Handle apply bindings button
        const applyBindingsBtn = container.querySelector('.apply-bindings');
        if (applyBindingsBtn) {
            applyBindingsBtn.addEventListener('click', () => {
                this.applyBindings(componentId, this.collectBindings(container));
            });
        }
        
        // Handle test bindings button
        const testBindingsBtn = container.querySelector('.test-bindings');
        if (testBindingsBtn) {
            testBindingsBtn.addEventListener('click', () => {
                this.testBindings(componentId);
            });
        }
        
        // Handle preview binding buttons
        const previewBtns = container.querySelectorAll('.preview-binding');
        previewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const property = btn.dataset.property;
                this.previewBinding(componentId, property);
            });
        });
    }
    
    /**
     * Collect form data from the options panel
     */
    collectFormData(container) {
        const formData = {};
        const inputs = container.querySelectorAll('.component-options-form input, .component-options-form select, .component-options-form textarea');
        
        inputs.forEach(input => {
            if (input.name && !input.name.startsWith('binding-')) {
                if (input.type === 'checkbox') {
                    formData[input.name] = input.checked;
                } else {
                    formData[input.name] = input.value;
                }
            }
        });
        
        return formData;
    }
    
    /**
     * Collect data bindings from the panel
     */
    collectBindings(container) {
        const bindings = {};
        const selects = container.querySelectorAll('.binding-select');
        
        selects.forEach(select => {
            const property = select.name.replace('binding-', '');
            if (select.value) {
                bindings[property] = select.value;
            }
        });
        
        return bindings;
    }
    
    /**
     * Update component preview in real-time
     */
    updateComponentPreview(componentId, options) {
        // Update state
        const updates = { props: options };
        window.enhancedStateManager.updateComponent(componentId, updates);
        
        // Trigger re-render
        document.dispatchEvent(new CustomEvent('gmkb:component-options-preview', {
            detail: { componentId, options }
        }));
        
        this.logger.info('COMPONENT_OPTIONS_UI', 'Preview updated', { componentId, options });
    }
    
    /**
     * Apply options permanently
     */
    applyOptions(componentId, options) {
        // Update configuration
        window.componentConfigurationManager.updateComponentConfiguration(componentId, {
            componentOptions: options
        });
        
        // Update state
        window.enhancedStateManager.updateComponent(componentId, { props: options });
        
        // Trigger save
        if (window.enhancedComponentManager?.manualSave) {
            window.enhancedComponentManager.manualSave();
        }
        
        // Show success feedback
        this.showFeedback('Options applied successfully!', 'success');
        
        this.logger.info('COMPONENT_OPTIONS_UI', 'Options applied', { componentId, options });
    }
    
    /**
     * Reset options to defaults
     */
    resetOptions(componentId) {
        const componentType = this.currentComponentType;
        const schema = window.componentConfigurationManager.getSchema(componentType);
        
        if (!schema) return;
        
        // Get default values
        const defaults = {};
        Object.entries(schema.componentOptions || {}).forEach(([key, option]) => {
            if (option.default !== undefined) {
                defaults[key] = option.default;
            }
        });
        
        // Apply defaults
        this.applyOptions(componentId, defaults);
        
        // Re-render the panel
        this.renderOptionsUI(componentId, componentType);
        
        this.showFeedback('Options reset to defaults', 'info');
    }
    
    /**
     * Apply data bindings
     */
    applyBindings(componentId, bindings) {
        // Update configuration
        window.componentConfigurationManager.updateComponentConfiguration(componentId, {
            dataBindings: bindings
        });
        
        // Apply bindings using DataBindingEngine
        if (window.dataBindingEngine) {
            window.dataBindingEngine.bindComponentData(componentId, this.currentComponentType, bindings);
        }
        
        // Trigger save
        if (window.enhancedComponentManager?.manualSave) {
            window.enhancedComponentManager.manualSave();
        }
        
        this.showFeedback('Data bindings applied successfully!', 'success');
        
        this.logger.info('COMPONENT_OPTIONS_UI', 'Bindings applied', { componentId, bindings });
    }
    
    /**
     * Test all bindings with sample data
     */
    testBindings(componentId) {
        if (!window.dataBindingEngine) {
            this.showFeedback('Data binding engine not available', 'error');
            return;
        }
        
        // Get sample data
        const sampleData = window.dataBindingEngine.getSampleData ? 
            window.dataBindingEngine.getSampleData() : 
            this.getDefaultSampleData();
        
        // Apply sample data temporarily
        window.dataBindingEngine.testBindings(componentId, sampleData);
        
        this.showFeedback('Testing with sample data...', 'info');
        
        // Revert after 3 seconds
        setTimeout(() => {
            window.dataBindingEngine.revertTestBindings(componentId);
            this.showFeedback('Test completed, reverted to actual data', 'info');
        }, 3000);
    }
    
    /**
     * Preview a single binding
     */
    previewBinding(componentId, property) {
        const select = this.panelContainer.querySelector(`select[name="binding-${property}"]`);
        if (!select || !select.value) {
            this.showFeedback('Please select a field to preview', 'warning');
            return;
        }
        
        // Get field value
        const fieldValue = window.gmkbData?.currentPost?.[select.value] || `[${select.value}]`;
        
        this.showFeedback(`Preview: ${fieldValue}`, 'info');
    }
    
    /**
     * Get default sample data for testing
     */
    getDefaultSampleData() {
        return {
            full_name: 'John Doe',
            first_name: 'John',
            last_name: 'Doe',
            guest_title: 'Senior Developer',
            biography: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            biography_short: 'Experienced developer and speaker.',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            website: 'https://example.com',
            speaking_topics: ['Web Development', 'JavaScript', 'React', 'Node.js'],
            cta_button_text: 'Book Now',
            cta_button_link: 'https://example.com/booking'
        };
    }
    
    /**
     * Show feedback message
     */
    showFeedback(message, type = 'info') {
        // Use toast if available
        if (window.showToast) {
            window.showToast(message, type, 3000);
            return;
        }
        
        // Otherwise create inline feedback
        const feedback = document.createElement('div');
        feedback.className = `feedback-message feedback-${type}`;
        feedback.textContent = message;
        
        const container = this.panelContainer.querySelector('.design-panel-body');
        if (container) {
            container.insertBefore(feedback, container.firstChild);
            
            setTimeout(() => {
                feedback.remove();
            }, 3000);
        }
    }
    
    /**
     * Close the options panel
     */
    closePanel() {
        if (this.panelContainer) {
            this.panelContainer.classList.remove('show', 'active');
            document.body.classList.remove('design-panel-open');
        }
        
        this.currentComponentId = null;
        this.currentComponentType = null;
        
        // Dispatch closed event
        document.dispatchEvent(new CustomEvent('gmkb:design-panel-closed'));
    }
    
    /**
     * Render no schema message
     */
    renderNoSchemaMessage() {
        const contentContainer = this.panelContainer.querySelector('#component-options-content') ||
                                this.panelContainer.querySelector('.design-panel-content');
        
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="no-schema-message">
                    <p>No configuration schema found for this component type.</p>
                    <p>The component will use default settings.</p>
                </div>
            `;
        }
    }
    
    /**
     * Humanize a key string
     */
    humanizeKey(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
    
    /**
     * Get debug info
     */
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            currentComponentId: this.currentComponentId,
            currentComponentType: this.currentComponentType,
            panelOpen: this.panelContainer?.classList.contains('show') || false
        };
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.componentOptionsUI = new ComponentOptionsUI();
    });
} else {
    window.componentOptionsUI = new ComponentOptionsUI();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentOptionsUI;
}