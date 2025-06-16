/**
 * Schema-Driven Data Binding Engine
 * Automatically binds design panel inputs to preview elements based on component schema
 */

import { stateManager } from './state-manager.js';

class DataBindingEngine {
    constructor() {
        this.bindings = new Map();
        this.componentSchemas = new Map();
    }

    /**
     * Initialize data binding for a component
     * @param {string} componentId - Unique component instance ID
     * @param {string} componentType - Component type (e.g., 'hero', 'stats')
     * @param {Object} schema - Component schema from component.json
     */
    async initializeComponent(componentId, componentType, schema) {
        this.componentSchemas.set(componentId, schema);
        
        // Set default values in state
        const initialState = {};
        Object.entries(schema.settings || {}).forEach(([key, setting]) => {
            initialState[key] = setting.default || '';
        });
        
        stateManager.initComponent(componentId, componentType, initialState);
        
        // Create bindings for this component
        this.createBindings(componentId, schema);
    }

    /**
     * Create bindings between inputs and preview elements
     * @param {string} componentId - Component instance ID
     * @param {Object} schema - Component schema
     */
    createBindings(componentId, schema) {
        const componentBindings = new Map();
        
        Object.entries(schema.settings || {}).forEach(([settingKey, settingConfig]) => {
            const binding = {
                settingKey,
                type: settingConfig.type,
                previewSelector: settingConfig.previewSelector,
                updateMethod: settingConfig.updateMethod,
                classPrefix: settingConfig.classPrefix,
                options: settingConfig.options,
                transform: settingConfig.transform
            };
            
            componentBindings.set(settingKey, binding);
        });
        
        this.bindings.set(componentId, componentBindings);
    }

    /**
     * Bind design panel inputs to state and preview
     * @param {HTMLElement} panelElement - Design panel container
     * @param {string} componentId - Component instance ID
     */
    bindDesignPanel(panelElement, componentId) {
        const componentBindings = this.bindings.get(componentId);
        if (!componentBindings) return;

        // Find all inputs with data-setting attribute
        const inputs = panelElement.querySelectorAll('[data-setting]');
        
        inputs.forEach(input => {
            const settingKey = input.getAttribute('data-setting');
            const binding = componentBindings.get(settingKey);
            
            if (!binding) return;
            
            // Set initial value from state
            const currentValue = stateManager.getComponentSetting(componentId, settingKey);
            this.setInputValue(input, binding.type, currentValue);
            
            // Add event listener for changes
            const eventType = this.getEventType(binding.type);
            input.addEventListener(eventType, (e) => {
                const value = this.getInputValue(input, binding.type);
                
                // Update state (which will trigger preview update)
                stateManager.updateComponent(componentId, settingKey, value);
            });
        });
        
        // Subscribe to state changes for this component
        stateManager.subscribe(componentId, (state) => {
            this.updatePreview(componentId, state);
        });
    }

    /**
     * Update preview based on state changes
     * @param {string} componentId - Component instance ID
     * @param {Object} state - Component state
     */
    updatePreview(componentId, state) {
        const componentBindings = this.bindings.get(componentId);
        if (!componentBindings) return;
        
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentElement) return;
        
        Object.entries(state).forEach(([settingKey, value]) => {
            const binding = componentBindings.get(settingKey);
            if (!binding) return;
            
            this.applyUpdate(componentElement, binding, value);
        });
    }

    /**
     * Apply update to preview element
     * @param {HTMLElement} componentElement - Component container
     * @param {Object} binding - Binding configuration
     * @param {*} value - New value
     */
    applyUpdate(componentElement, binding, value) {
        const elements = componentElement.querySelectorAll(binding.previewSelector);
        
        elements.forEach(element => {
            // Apply any transformation if specified
            const finalValue = binding.transform ? binding.transform(value) : value;
            
            switch (binding.updateMethod) {
                case 'textContent':
                    element.textContent = finalValue;
                    break;
                    
                case 'innerHTML':
                    element.innerHTML = finalValue;
                    break;
                    
                case 'src':
                    element.src = finalValue;
                    break;
                    
                case 'href':
                    element.href = finalValue;
                    break;
                    
                case 'class':
                    // Remove existing classes with prefix
                    if (binding.classPrefix) {
                        const classes = Array.from(element.classList);
                        classes.forEach(cls => {
                            if (cls.startsWith(binding.classPrefix)) {
                                element.classList.remove(cls);
                            }
                        });
                        // Add new class
                        element.classList.add(binding.classPrefix + finalValue);
                    }
                    break;
                    
                case 'visibility':
                    element.style.display = finalValue ? '' : 'none';
                    break;
                    
                default:
                    // Handle style properties (e.g., 'style.backgroundColor')
                    if (binding.updateMethod.startsWith('style.')) {
                        const styleProp = binding.updateMethod.substring(6);
                        element.style[styleProp] = finalValue;
                    }
                    // Handle data attributes (e.g., 'data-value')
                    else if (binding.updateMethod.startsWith('data-')) {
                        const dataAttr = binding.updateMethod.substring(5);
                        element.setAttribute(`data-${dataAttr}`, finalValue);
                    }
                    // Handle regular attributes
                    else {
                        element.setAttribute(binding.updateMethod, finalValue);
                    }
            }
        });
    }

    /**
     * Get appropriate event type for input type
     * @param {string} type - Input type
     * @returns {string} Event type
     */
    getEventType(type) {
        switch (type) {
            case 'checkbox':
            case 'radio':
                return 'change';
            case 'color':
            case 'range':
                return 'input';
            default:
                return 'input';
        }
    }

    /**
     * Get value from input based on type
     * @param {HTMLElement} input - Input element
     * @param {string} type - Input type
     * @returns {*} Input value
     */
    getInputValue(input, type) {
        switch (type) {
            case 'checkbox':
                return input.checked;
            case 'number':
            case 'range':
                return parseFloat(input.value) || 0;
            default:
                return input.value;
        }
    }

    /**
     * Set input value based on type
     * @param {HTMLElement} input - Input element
     * @param {string} type - Input type
     * @param {*} value - Value to set
     */
    setInputValue(input, type, value) {
        switch (type) {
            case 'checkbox':
                input.checked = !!value;
                break;
            default:
                input.value = value || '';
        }
    }

    /**
     * Generate design panel HTML from schema
     * @param {Object} schema - Component schema
     * @returns {string} HTML string
     */
    generateDesignPanel(schema) {
        let html = '';
        const sections = schema.sections || { default: { title: 'Settings', order: 1 } };
        
        // Sort sections by order
        const sortedSections = Object.entries(sections).sort((a, b) => a[1].order - b[1].order);
        
        sortedSections.forEach(([sectionKey, sectionConfig]) => {
            html += `<div class="form-section">
                <h4 class="form-section__title">${sectionConfig.title}</h4>`;
            
            // Get settings for this section
            const sectionSettings = Object.entries(schema.settings || {})
                .filter(([key, setting]) => (setting.section || 'default') === sectionKey);
            
            sectionSettings.forEach(([settingKey, setting]) => {
                html += this.generateInputHTML(settingKey, setting);
            });
            
            html += '</div>';
        });
        
        return html;
    }

    /**
     * Generate HTML for a single input
     * @param {string} key - Setting key
     * @param {Object} config - Setting configuration
     * @returns {string} HTML string
     */
    generateInputHTML(key, config) {
        let html = '<div class="form-group">';
        
        switch (config.type) {
            case 'text':
                html += `
                    <label class="form-label">${config.label}</label>
                    <input type="text" class="form-input" data-setting="${key}" 
                           placeholder="${config.placeholder || ''}">
                `;
                break;
                
            case 'textarea':
                html += `
                    <label class="form-label">${config.label}</label>
                    <textarea class="form-input form-textarea" data-setting="${key}" 
                              rows="${config.rows || 3}" 
                              placeholder="${config.placeholder || ''}"></textarea>
                `;
                break;
                
            case 'select':
                html += `
                    <label class="form-label">${config.label}</label>
                    <select class="form-select" data-setting="${key}">
                        ${config.options.map(opt => 
                            `<option value="${opt.value}">${opt.label}</option>`
                        ).join('')}
                    </select>
                `;
                break;
                
            case 'color':
                html += `
                    <label class="form-label">${config.label}</label>
                    <div class="color-picker">
                        <input type="color" class="color-input" data-setting="${key}">
                        <input type="text" class="form-input" data-setting="${key}-text" 
                               style="flex: 1;">
                    </div>
                `;
                break;
                
            case 'checkbox':
                html += `
                    <label class="form-label">
                        <input type="checkbox" data-setting="${key}">
                        ${config.label}
                    </label>
                `;
                break;
                
            case 'image':
                html += `
                    <label class="form-label">${config.label}</label>
                    <div class="image-upload-area" data-setting="${key}">
                        <button class="upload-btn">Choose Image</button>
                        <span class="upload-text">or drag and drop</span>
                    </div>
                `;
                break;
                
            case 'number':
                html += `
                    <label class="form-label">${config.label}</label>
                    <input type="number" class="form-input" data-setting="${key}" 
                           min="${config.min || ''}" max="${config.max || ''}" 
                           step="${config.step || ''}">
                `;
                break;
                
            case 'range':
                html += `
                    <label class="form-label">${config.label}</label>
                    <input type="range" class="form-range" data-setting="${key}" 
                           min="${config.min || 0}" max="${config.max || 100}" 
                           step="${config.step || 1}">
                    <span class="range-value" data-setting="${key}-value">0</span>
                `;
                break;
        }
        
        if (config.helpText) {
            html += `<p class="form-help-text">${config.helpText}</p>`;
        }
        
        html += '</div>';
        return html;
    }
}

// Export singleton instance
export const dataBindingEngine = new DataBindingEngine();