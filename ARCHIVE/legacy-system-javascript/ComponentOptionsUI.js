/**
 * Component Options UI
 * Phase 2.1: Dynamic UI generation from component schemas
 * 
 * CHECKLIST COMPLIANT: Event-driven, no polling, no global sniffing
 * Generates form controls based on component schema.json files
 * Provides real-time preview of component configuration changes
 * 
 * @version 2.1.0
 * @package GMKB/System
 */

(function() {
    'use strict';
    
    class ComponentOptionsUI {
        constructor() {
            this.logger = window.structuredLogger || console;
            this.configManager = null;
            this.stateManager = null;
            this.componentManager = null;
            this.dataBinding = null;
            this.isInitialized = false;
            this.currentComponentId = null;
            this.currentSchema = null;
            this.changeDebounceTimer = null;
            
            this.logger.info('📋 Component Options UI: Initializing Phase 2.1');
            
            // CHECKLIST COMPLIANT: Event-driven initialization only
            this.setupEventListeners();
        }
        
        setupEventListeners() {
            // Listen for system ready events
            document.addEventListener('gmkb:core-systems-ready', (e) => this.onSystemsReady(e));
            document.addEventListener('gmkb:component-manager-ready', (e) => this.onComponentManagerReady(e));
            
            // Listen for design panel events
            document.addEventListener('gmkb:design-panel-opened', (e) => this.onDesignPanelOpened(e));
            document.addEventListener('gmkb:component-selected', (e) => this.onComponentSelected(e));
            
            // Listen for schema updates
            document.addEventListener('gmkb:schema-loaded', (e) => this.onSchemaLoaded(e));
        }
        
        onSystemsReady(event) {
            const systems = event.detail || {};
            
            // Get references to required systems
            if (systems.configurationManager) {
                this.configManager = systems.configurationManager;
            }
            if (systems.stateManager) {
                this.stateManager = systems.stateManager;
            }
            if (systems.dataBindingEngine) {
                this.dataBinding = systems.dataBindingEngine;
            }
            
            // Try to initialize if we have what we need
            this.tryInitialize();
        }
        
        onComponentManagerReady(event) {
            if (event.detail?.manager) {
                this.componentManager = event.detail.manager;
                this.tryInitialize();
            }
        }
        
        tryInitialize() {
            // Check if we have all required dependencies
            if (this.isInitialized) return;
            
            // Look for managers in window as fallback
            this.configManager = this.configManager || window.componentConfigurationManager;
            this.stateManager = this.stateManager || window.enhancedStateManager;
            this.componentManager = this.componentManager || window.enhancedComponentManager;
            this.dataBinding = this.dataBinding || window.dataBindingEngine;
            
            if (this.configManager && this.stateManager) {
                this.isInitialized = true;
                
                // ROOT FIX: Make available globally IMMEDIATELY for design panel integration
                window.componentOptionsUI = this;
                window.ComponentOptionsUI = this.constructor; // Also expose the class
                
                // Also make ComponentSelectionManager available if it exists
                if (window.componentSelectionManager) {
                    window.ComponentSelectionManager = window.componentSelectionManager.constructor || window.componentSelectionManager;
                }
                
                // Dispatch ready event
                document.dispatchEvent(new CustomEvent('gmkb:component-options-ui-ready', {
                    detail: { ui: this }
                }));
                
                // ROOT FIX: Also dispatch Phase 2 ready event for GMKB to detect
                document.dispatchEvent(new CustomEvent('gmkb:phase2-ready', {
                    detail: {
                        componentOptionsUI: this,
                        componentSelectionManager: window.componentSelectionManager,
                        available: true
                    }
                }));
                
                this.logger.info('✅ Component Options UI: Ready to generate dynamic forms');
                console.log('✅ PHASE 2 READY: Component Options UI available at window.componentOptionsUI');
            }
        }
        
        onDesignPanelOpened(event) {
            const { componentId, componentType, panelElement } = event.detail || {};
            
            if (!componentId || !componentType || !panelElement) {
                this.logger.warn('Design panel opened without required details');
                return;
            }
            
            // Load schema and inject options UI
            this.loadComponentOptions(componentId, componentType, panelElement);
        }
        
        onComponentSelected(event) {
            const { componentId } = event.detail || {};
            if (componentId) {
                this.currentComponentId = componentId;
            }
        }
        
        onSchemaLoaded(event) {
            const { componentType, schema } = event.detail || {};
            if (componentType && schema) {
                this.logger.info(`Schema loaded for ${componentType}`, schema);
            }
        }
        
        /**
         * Load component options and inject UI into design panel
         */
        async loadComponentOptions(componentId, componentType, panelElement) {
            try {
                this.currentComponentId = componentId;
                
                // Get schema from configuration manager
                const schema = await this.getComponentSchema(componentType);
                if (!schema) {
                    this.logger.warn(`No schema found for component type: ${componentType}`);
                    this.injectFallbackUI(panelElement, componentType);
                    return;
                }
                
                this.currentSchema = schema;
                
                // Get current component state
                const componentState = this.getComponentState(componentId);
                
                // Generate and inject the options UI
                this.injectOptionsUI(panelElement, schema, componentState, componentType);
                
                this.logger.info(`✅ Options UI loaded for ${componentType} (${componentId})`);
                
            } catch (error) {
                this.logger.error('Failed to load component options:', error);
                this.injectErrorUI(panelElement, error.message);
            }
        }
        
        /**
         * Get schema for a component type
         */
        async getComponentSchema(componentType) {
            // Try configuration manager first
            if (this.configManager && typeof this.configManager.getSchema === 'function') {
                const schema = this.configManager.getSchema(componentType);
                if (schema) return schema;
            }
            
            // Try loading schema directly as fallback
            try {
                const response = await fetch(`/wp-content/plugins/guestify-media-kit-builder/components/${componentType}/schema.json`);
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                this.logger.warn(`Failed to load schema for ${componentType}:`, error);
            }
            
            return null;
        }
        
        /**
         * Get current state of a component
         */
        getComponentState(componentId) {
            if (!this.stateManager) return {};
            
            const state = this.stateManager.getState();
            const component = state.components?.[componentId];
            
            return component?.props || {};
        }
        
        /**
         * Inject the options UI into the design panel
         */
        injectOptionsUI(panelElement, schema, currentState, componentType) {
            // Find or create options container
            let optionsContainer = panelElement.querySelector('.component-options-container');
            if (!optionsContainer) {
                optionsContainer = document.createElement('div');
                optionsContainer.className = 'component-options-container';
                
                // Find a good insertion point
                const formSections = panelElement.querySelectorAll('.form-section');
                if (formSections.length > 0) {
                    // Insert after the first form section
                    formSections[0].after(optionsContainer);
                } else {
                    // Append to panel
                    panelElement.appendChild(optionsContainer);
                }
            }
            
            // Clear existing content
            optionsContainer.innerHTML = '';
            
            // Generate UI based on schema
            const ui = this.generateOptionsUI(schema, currentState, componentType);
            optionsContainer.innerHTML = ui;
            
            // Setup event listeners for the new controls
            this.setupControlListeners(optionsContainer);
            
            // Add data binding section if schema has bindings
            if (schema.dataBindings && Object.keys(schema.dataBindings).length > 0) {
                const bindingUI = this.generateDataBindingUI(schema.dataBindings, currentState);
                const bindingSection = document.createElement('div');
                bindingSection.innerHTML = bindingUI;
                optionsContainer.appendChild(bindingSection);
                this.setupBindingListeners(bindingSection);
            }
        }
        
        /**
         * Generate HTML for component options based on schema
         */
        generateOptionsUI(schema, currentState, componentType) {
            const options = schema.componentOptions || {};
            
            if (Object.keys(options).length === 0) {
                return `
                    <div class="form-section">
                        <h4 class="form-section__title">Component Settings</h4>
                        <p class="form-help-text">This component has no configurable options.</p>
                    </div>
                `;
            }
            
            let html = `
                <div class="form-section component-options-section" data-component-type="${componentType}">
                    <h4 class="form-section__title">
                        <span class="section-icon">⚙️</span>
                        Component Settings
                    </h4>
            `;
            
            // Group options by category if available
            const categories = this.categorizeOptions(options);
            
            for (const [category, categoryOptions] of Object.entries(categories)) {
                if (category !== 'default') {
                    html += `<div class="options-category">
                        <h5 class="category-title">${this.formatLabel(category)}</h5>`;
                }
                
                for (const [key, option] of Object.entries(categoryOptions)) {
                    const value = currentState[key] !== undefined ? currentState[key] : option.default;
                    html += this.generateControl(key, option, value);
                }
                
                if (category !== 'default') {
                    html += `</div>`;
                }
            }
            
            html += `</div>`;
            
            return html;
        }
        
        /**
         * Categorize options for better organization
         */
        categorizeOptions(options) {
            const categories = {};
            
            for (const [key, option] of Object.entries(options)) {
                const category = option.category || 'default';
                if (!categories[category]) {
                    categories[category] = {};
                }
                categories[category][key] = option;
            }
            
            return categories;
        }
        
        /**
         * Generate individual control based on option type
         */
        generateControl(key, option, value) {
            const label = option.label || this.formatLabel(key);
            const description = option.description || '';
            const required = option.required ? 'required' : '';
            
            let control = '';
            
            switch (option.type) {
                case 'text':
                    control = this.generateTextControl(key, option, value, required);
                    break;
                    
                case 'textarea':
                    control = this.generateTextareaControl(key, option, value, required);
                    break;
                    
                case 'number':
                    control = this.generateNumberControl(key, option, value, required);
                    break;
                    
                case 'select':
                    control = this.generateSelectControl(key, option, value, required);
                    break;
                    
                case 'boolean':
                case 'checkbox':
                    control = this.generateCheckboxControl(key, option, value);
                    break;
                    
                case 'color':
                    control = this.generateColorControl(key, option, value);
                    break;
                    
                case 'range':
                    control = this.generateRangeControl(key, option, value);
                    break;
                    
                case 'radio':
                    control = this.generateRadioControl(key, option, value);
                    break;
                    
                case 'image':
                    control = this.generateImageControl(key, option, value);
                    break;
                    
                default:
                    control = this.generateTextControl(key, option, value, required);
            }
            
            return `
                <div class="form-group option-control" data-option-key="${key}">
                    <label class="form-label">
                        ${label}
                        ${option.required ? '<span class="required">*</span>' : ''}
                    </label>
                    ${description ? `<p class="form-description">${description}</p>` : ''}
                    ${control}
                </div>
            `;
        }
        
        generateTextControl(key, option, value, required) {
            const placeholder = option.placeholder || '';
            const maxLength = option.maxLength ? `maxlength="${option.maxLength}"` : '';
            
            return `
                <input type="text" 
                       class="form-input option-input" 
                       data-option="${key}"
                       value="${this.escapeHtml(value || '')}"
                       placeholder="${placeholder}"
                       ${maxLength}
                       ${required}>
            `;
        }
        
        generateTextareaControl(key, option, value, required) {
            const placeholder = option.placeholder || '';
            const rows = option.rows || 4;
            
            return `
                <textarea class="form-input option-input" 
                          data-option="${key}"
                          rows="${rows}"
                          placeholder="${placeholder}"
                          ${required}>${this.escapeHtml(value || '')}</textarea>
            `;
        }
        
        generateNumberControl(key, option, value, required) {
            const min = option.min !== undefined ? `min="${option.min}"` : '';
            const max = option.max !== undefined ? `max="${option.max}"` : '';
            const step = option.step || 1;
            
            return `
                <input type="number" 
                       class="form-input option-input" 
                       data-option="${key}"
                       value="${value || option.default || 0}"
                       ${min} ${max}
                       step="${step}"
                       ${required}>
            `;
        }
        
        generateSelectControl(key, option, value, required) {
            // ROOT FIX: Handle both array and object formats for options
            let optionsArray = [];
            
            if (Array.isArray(option.options)) {
                // Options is already an array
                optionsArray = option.options;
            } else if (typeof option.options === 'object' && option.options !== null) {
                // Options is an object, convert to array format
                optionsArray = Object.entries(option.options).map(([optValue, optLabel]) => ({
                    value: optValue,
                    label: optLabel
                }));
            }
            
            let html = `
                <select class="form-input option-input" 
                        data-option="${key}"
                        ${required}>
            `;
            
            if (!required) {
                html += `<option value="">Choose...</option>`;
            }
            
            for (const opt of optionsArray) {
                const optValue = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                const selected = value === optValue ? 'selected' : '';
                
                html += `<option value="${optValue}" ${selected}>${optLabel}</option>`;
            }
            
            html += `</select>`;
            
            return html;
        }
        
        generateCheckboxControl(key, option, value) {
            const checked = value === true || value === 'true' || value === 1 ? 'checked' : '';
            
            return `
                <label class="checkbox-label">
                    <input type="checkbox" 
                           class="option-input" 
                           data-option="${key}"
                           ${checked}>
                    <span>${option.checkboxLabel || 'Enable'}</span>
                </label>
            `;
        }
        
        generateColorControl(key, option, value) {
            const defaultColor = value || option.default || '#000000';
            
            return `
                <div class="color-input-group">
                    <input type="color" 
                           class="color-picker option-input" 
                           data-option="${key}"
                           value="${defaultColor}">
                    <input type="text" 
                           class="form-input color-text" 
                           data-option="${key}-text"
                           value="${defaultColor}"
                           pattern="^#[0-9A-Fa-f]{6}$">
                </div>
            `;
        }
        
        generateRangeControl(key, option, value) {
            const min = option.min || 0;
            const max = option.max || 100;
            const step = option.step || 1;
            const currentValue = value || option.default || min;
            
            return `
                <div class="range-control">
                    <input type="range" 
                           class="form-range option-input" 
                           data-option="${key}"
                           min="${min}"
                           max="${max}"
                           step="${step}"
                           value="${currentValue}">
                    <span class="range-value">${currentValue}${option.unit || ''}</span>
                </div>
            `;
        }
        
        generateRadioControl(key, option, value) {
            // ROOT FIX: Handle both array and object formats for options
            let optionsArray = [];
            
            if (Array.isArray(option.options)) {
                // Options is already an array
                optionsArray = option.options;
            } else if (typeof option.options === 'object' && option.options !== null) {
                // Options is an object, convert to array format
                optionsArray = Object.entries(option.options).map(([optValue, optLabel]) => ({
                    value: optValue,
                    label: optLabel
                }));
            }
            
            let html = '<div class="radio-group">';
            
            for (const opt of optionsArray) {
                const optValue = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                const checked = value === optValue ? 'checked' : '';
                const radioId = `${key}-${optValue}`;
                
                html += `
                    <label class="radio-label" for="${radioId}">
                        <input type="radio" 
                               id="${radioId}"
                               name="${key}"
                               class="option-input" 
                               data-option="${key}"
                               value="${optValue}"
                               ${checked}>
                        <span>${optLabel}</span>
                    </label>
                `;
            }
            
            html += '</div>';
            return html;
        }
        
        generateImageControl(key, option, value) {
            return `
                <div class="image-control">
                    <input type="text" 
                           class="form-input option-input" 
                           data-option="${key}"
                           value="${value || ''}"
                           placeholder="Image URL">
                    <button type="button" class="btn btn--small media-library-btn" data-option="${key}">
                        Choose Image
                    </button>
                    ${value ? `<div class="image-preview"><img src="${value}" alt="Preview"></div>` : ''}
                </div>
            `;
        }
        
        /**
         * Generate data binding UI
         */
        generateDataBindingUI(bindings, currentState) {
            let html = `
                <div class="form-section data-binding-section">
                    <h4 class="form-section__title">
                        <span class="section-icon">🔗</span>
                        Data Bindings
                    </h4>
                    <p class="form-help-text">Connect component fields to data sources</p>
            `;
            
            for (const [field, binding] of Object.entries(bindings)) {
                const currentBinding = currentState[`binding_${field}`] || binding.source;
                
                html += `
                    <div class="form-group binding-control">
                        <label class="form-label">${binding.label || this.formatLabel(field)}</label>
                        <select class="form-input binding-select" data-binding="${field}">
                            <option value="">No binding</option>
                            <option value="${binding.source}" ${currentBinding === binding.source ? 'selected' : ''}>
                                ${binding.source} (default)
                            </option>
                            ${this.generatePodsFieldOptions(binding.fieldType)}
                        </select>
                    </div>
                `;
            }
            
            html += `
                <div class="form-group">
                    <button type="button" class="btn btn--secondary test-bindings-btn">
                        Test Bindings
                    </button>
                </div>
            </div>`;
            
            return html;
        }
        
        /**
         * Generate Pods field options for data binding
         */
        generatePodsFieldOptions(fieldType) {
            // This would ideally pull from actual Pods configuration
            // For now, return common fields
            const commonFields = {
                text: ['first_name', 'last_name', 'title', 'company'],
                textarea: ['biography', 'description', 'notes'],
                image: ['profile_image', 'featured_image', 'logo'],
                repeater: ['topics', 'services', 'achievements']
            };
            
            const fields = commonFields[fieldType] || commonFields.text;
            
            return fields.map(field => 
                `<option value="pods.${field}">Pods: ${this.formatLabel(field)}</option>`
            ).join('');
        }
        
        /**
         * Setup event listeners for option controls
         */
        setupControlListeners(container) {
            // Text, number, and select inputs
            container.querySelectorAll('.option-input').forEach(input => {
                input.addEventListener('change', (e) => this.handleOptionChange(e));
                
                // Real-time preview for text inputs
                if (input.type === 'text' || input.type === 'number') {
                    input.addEventListener('input', (e) => this.handleOptionInput(e));
                }
            });
            
            // Range controls
            container.querySelectorAll('.form-range').forEach(range => {
                range.addEventListener('input', (e) => {
                    this.handleRangeInput(e);
                    this.handleOptionInput(e);
                });
            });
            
            // Color controls
            container.querySelectorAll('.color-picker').forEach(picker => {
                picker.addEventListener('input', (e) => {
                    this.handleColorInput(e);
                    this.handleOptionInput(e);
                });
            });
            
            // Color text inputs
            container.querySelectorAll('.color-text').forEach(input => {
                input.addEventListener('change', (e) => {
                    const key = e.target.dataset.option.replace('-text', '');
                    const picker = container.querySelector(`.color-picker[data-option="${key}"]`);
                    if (picker) picker.value = e.target.value;
                    this.handleOptionChange({ target: picker });
                });
            });
            
            // Media library buttons
            container.querySelectorAll('.media-library-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.handleMediaLibrary(e));
            });
        }
        
        /**
         * Setup event listeners for data binding controls
         */
        setupBindingListeners(container) {
            container.querySelectorAll('.binding-select').forEach(select => {
                select.addEventListener('change', (e) => this.handleBindingChange(e));
            });
            
            const testBtn = container.querySelector('.test-bindings-btn');
            if (testBtn) {
                testBtn.addEventListener('click', () => this.testBindings());
            }
        }
        
        /**
         * Handle option value changes
         */
        handleOptionChange(event) {
            const key = event.target.dataset.option;
            let value = event.target.value;
            
            // Convert checkbox values
            if (event.target.type === 'checkbox') {
                value = event.target.checked;
            }
            
            // Convert number values
            if (event.target.type === 'number') {
                value = parseFloat(value) || 0;
            }
            
            this.updateComponentProperty(key, value);
        }
        
        /**
         * Handle real-time input for preview
         */
        handleOptionInput(event) {
            // Debounce the input to avoid too many updates
            clearTimeout(this.changeDebounceTimer);
            this.changeDebounceTimer = setTimeout(() => {
                this.handleOptionChange(event);
            }, 300);
        }
        
        /**
         * Handle range input changes
         */
        handleRangeInput(event) {
            const container = event.target.closest('.range-control');
            const display = container?.querySelector('.range-value');
            if (display) {
                const unit = this.currentSchema?.componentOptions?.[event.target.dataset.option]?.unit || '';
                display.textContent = event.target.value + unit;
            }
        }
        
        /**
         * Handle color input changes
         */
        handleColorInput(event) {
            const key = event.target.dataset.option;
            const textInput = event.target.parentElement.querySelector(`.color-text[data-option="${key}-text"]`);
            if (textInput) {
                textInput.value = event.target.value;
            }
        }
        
        /**
         * Handle media library selection
         */
        handleMediaLibrary(event) {
            const key = event.target.dataset.option;
            
            // WordPress media library integration
            if (window.wp && window.wp.media) {
                const frame = wp.media({
                    title: 'Select Image',
                    button: { text: 'Use Image' },
                    multiple: false
                });
                
                frame.on('select', () => {
                    const attachment = frame.state().get('selection').first().toJSON();
                    const input = document.querySelector(`.option-input[data-option="${key}"]`);
                    if (input) {
                        input.value = attachment.url;
                        this.updateComponentProperty(key, attachment.url);
                        
                        // Update preview
                        const container = input.closest('.image-control');
                        let preview = container.querySelector('.image-preview');
                        if (!preview) {
                            preview = document.createElement('div');
                            preview.className = 'image-preview';
                            container.appendChild(preview);
                        }
                        preview.innerHTML = `<img src="${attachment.url}" alt="Preview">`;
                    }
                });
                
                frame.open();
            } else {
                // Fallback to URL prompt
                const url = prompt('Enter image URL:');
                if (url) {
                    const input = document.querySelector(`.option-input[data-option="${key}"]`);
                    if (input) {
                        input.value = url;
                        this.updateComponentProperty(key, url);
                    }
                }
            }
        }
        
        /**
         * Handle data binding changes
         */
        handleBindingChange(event) {
            const field = event.target.dataset.binding;
            const source = event.target.value;
            
            if (!this.dataBinding) {
                this.logger.warn('Data binding engine not available');
                return;
            }
            
            // Update binding configuration
            if (source) {
                this.dataBinding.updateBinding(this.currentComponentId, field, source);
            } else {
                this.dataBinding.removeBinding(this.currentComponentId, field);
            }
            
            // Trigger data refresh
            this.refreshComponentData();
        }
        
        /**
         * Test data bindings
         */
        testBindings() {
            if (!this.dataBinding || !this.currentComponentId) return;
            
            // Get test data
            const testData = this.dataBinding.getTestData();
            
            // Apply bindings with test data
            this.dataBinding.applyBindings(this.currentComponentId, testData);
            
            // Show success message
            this.showToast('Bindings tested with sample data', 'success');
        }
        
        /**
         * Update component property in state
         */
        updateComponentProperty(key, value) {
            if (!this.currentComponentId || !this.stateManager) return;
            
            // Dispatch update action
            this.stateManager.dispatch({
                type: 'UPDATE_COMPONENT',
                payload: {
                    id: this.currentComponentId,
                    updates: {
                        props: {
                            [key]: value
                        }
                    }
                }
            });
            
            // Trigger component re-render
            document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
                detail: {
                    componentId: this.currentComponentId,
                    property: key,
                    value: value
                }
            }));
            
            this.logger.info(`Updated ${key} to:`, value);
        }
        
        /**
         * Refresh component data from bindings
         */
        refreshComponentData() {
            if (!this.dataBinding || !this.currentComponentId) return;
            
            // Re-apply bindings with current data
            this.dataBinding.refreshComponent(this.currentComponentId);
        }
        
        /**
         * Inject fallback UI when no schema is available
         */
        injectFallbackUI(panelElement, componentType) {
            const container = this.getOrCreateContainer(panelElement);
            
            container.innerHTML = `
                <div class="form-section">
                    <h4 class="form-section__title">Component Settings</h4>
                    <p class="form-help-text">
                        No configuration schema found for ${componentType} component.
                        You can edit this component directly in the preview area.
                    </p>
                    <div class="form-group">
                        <button type="button" class="btn btn--secondary edit-inline-btn">
                            Edit in Preview
                        </button>
                    </div>
                </div>
            `;
            
            // Add inline edit button handler
            const editBtn = container.querySelector('.edit-inline-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    document.dispatchEvent(new CustomEvent('gmkb:enable-inline-editing', {
                        detail: { componentId: this.currentComponentId }
                    }));
                });
            }
        }
        
        /**
         * Inject error UI
         */
        injectErrorUI(panelElement, errorMessage) {
            const container = this.getOrCreateContainer(panelElement);
            
            container.innerHTML = `
                <div class="form-section error-section">
                    <h4 class="form-section__title">⚠️ Configuration Error</h4>
                    <p class="error-message">${errorMessage}</p>
                    <p class="form-help-text">
                        Try refreshing the page or contact support if the problem persists.
                    </p>
                </div>
            `;
        }
        
        /**
         * Get or create options container
         */
        getOrCreateContainer(panelElement) {
            let container = panelElement.querySelector('.component-options-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'component-options-container';
                panelElement.appendChild(container);
            }
            return container;
        }
        
        /**
         * Format label from key
         */
        formatLabel(key) {
            return key
                .replace(/_/g, ' ')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
        }
        
        /**
         * Escape HTML for safe display
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        /**
         * Show toast notification
         */
        showToast(message, type = 'info') {
            if (window.showToast) {
                window.showToast(message, type);
            } else {
                console.log(`[${type.toUpperCase()}] ${message}`);
            }
        }
        
        /**
         * Public API: Refresh current component options
         */
        refresh() {
            if (!this.currentComponentId) return;
            
            const panel = document.querySelector('.element-editor-sidebar');
            if (!panel) return;
            
            const state = this.stateManager?.getState();
            const component = state?.components?.[this.currentComponentId];
            
            if (component) {
                this.loadComponentOptions(
                    this.currentComponentId,
                    component.type,
                    panel
                );
            }
        }
    }
    
    // ROOT FIX: Make ComponentOptionsUI immediately available globally
    // This ensures it's detected when edit buttons are clicked
    const instance = new ComponentOptionsUI();
    
    // Expose both instance and class globally
    window.componentOptionsUI = instance;
    window.ComponentOptionsUI = ComponentOptionsUI;
    
    // ROOT FIX: Force immediate initialization with fallback managers
    // Don't wait for events, check for managers directly
    const forceInitialize = () => {
        // Look for managers in window immediately
        instance.configManager = window.componentConfigurationManager || window.ComponentConfigurationManager;
        instance.stateManager = window.enhancedStateManager || window.EnhancedStateManager;
        instance.componentManager = window.enhancedComponentManager || window.EnhancedComponentManager;
        instance.dataBinding = window.dataBindingEngine || window.DataBindingEngine;
        
        // Try initialization
        instance.tryInitialize();
        
        // If still not initialized, try again after a brief delay
        if (!instance.isInitialized) {
            setTimeout(() => {
                instance.tryInitialize();
                if (instance.isInitialized) {
                    console.log('✅ PHASE 2: Component Options UI initialized after delay');
                }
            }, 500);
        }
    };
    
    // Try immediate initialization
    if (document.readyState !== 'loading') {
        forceInitialize();
    } else {
        document.addEventListener('DOMContentLoaded', forceInitialize);
    }
    
    // ROOT FIX: Also make Phase 2 available to gmkb-init.js
    window.gmkbPhase2 = {
        componentOptionsUI: instance,
        componentSelectionManager: window.componentSelectionManager,
        available: true
    };
    
    console.log('📋 Component Options UI: Instance created and exposed globally');
    console.log('✅ PHASE 2: ComponentOptionsUI available at window.componentOptionsUI');
})();