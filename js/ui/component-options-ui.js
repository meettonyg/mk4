/**
 * Component Options UI Panel
 * PHASE 2: Configuration interface for component customization
 * 
 * Provides real-time component configuration editing with live preview
 * 
 * @version 2.0.0-phase2
 * @package GMKB/UI
 */

class ComponentOptionsUI {
    constructor() {
        this.logger = window.structuredLogger || console;
        this.stateManager = window.enhancedStateManager;
        this.configManager = window.componentConfigurationManager;
        this.currentComponentId = null;
        this.currentSchema = null;
        this.isUpdating = false;
        
        this.logger.info('UI', 'Component Options UI initializing');
        this.init();
    }
    
    updateTopicsInDOM(componentId, topics) {
        // Find the topics component in the preview
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentElement) return;
        
        const topicsContainer = componentElement.querySelector('.topics-container');
        if (!topicsContainer) return;
        
        // Clear existing topics
        topicsContainer.innerHTML = '';
        
        // Add updated topics
        if (topics && topics.length > 0) {
            topics.forEach((topic, index) => {
                const topicDiv = document.createElement('div');
                topicDiv.className = 'topic-item';
                topicDiv.setAttribute('data-topic-index', index);
                topicDiv.setAttribute('data-topic-number', index + 1);
                
                topicDiv.innerHTML = `
                    <div class="topic-content">
                        <div class="topic-title" 
                             contenteditable="true" 
                             data-topic-number="${index + 1}"
                             data-original-value="${topic.replace(/"/g, '&quot;')}">
                            ${topic}
                        </div>
                    </div>
                `;
                
                topicsContainer.appendChild(topicDiv);
            });
        } else {
            topicsContainer.innerHTML = `
                <div class="no-topics-message">
                    <p>No topics found. Click 'Edit' to add your speaking topics.</p>
                </div>
            `;
        }
        
        this.logger.info('UI', `Updated ${topics.length} topics in DOM for ${componentId}`);
    }
    
    init() {
        // Wait for core systems
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // Listen for component selection events
        document.addEventListener('gmkb:component-selected', (event) => {
            this.onComponentSelected(event.detail);
        });
        
        // Listen for component deselection
        document.addEventListener('gmkb:component-deselected', () => {
            this.onComponentDeselected();
        });
        
        this.logger.info('UI', 'ComponentOptionsUI initialized');
    }
    
    onCoreSystemsReady() {
        this.setupUI();
    }
    
    setupUI() {
        this.createOptionsPanel();
        this.attachEventListeners();
    }
    
    createOptionsPanel() {
        // Find the design sidebar - ROOT FIX: Correct ID from template
        const designTab = document.getElementById('design-tab');
        if (!designTab) {
            this.logger.warn('UI', 'Design tab not found');
            return;
        }
        
        // Create options panel container
        const optionsPanel = document.createElement('div');
        optionsPanel.id = 'component-options-panel';
        optionsPanel.className = 'component-options-panel';
        optionsPanel.innerHTML = this.getOptionsPanelHTML();
        
        // Insert at the top of design tab
        designTab.insertBefore(optionsPanel, designTab.firstChild);
        
        this.logger.info('UI', 'Component options panel created');
    }
    
    getOptionsPanelHTML() {
        return `
            <div class="options-panel">
                <div class="options-panel__header">
                    <h3 class="options-panel__title">Component Options</h3>
                    <div class="options-panel__badge">[PHASE 2]</div>
                </div>
                
                <div class="options-panel__content">
                    <div class="options-panel__no-selection">
                        <p>Select a component to customize its options</p>
                    </div>
                    
                    <div class="options-panel__form" style="display: none;">
                        <div class="component-info">
                            <h4 class="component-info__type"></h4>
                            <p class="component-info__description"></p>
                        </div>
                        
                        <div class="options-sections"></div>
                        
                        <div class="options-panel__actions">
                            <button type="button" class="btn btn--secondary" id="reset-component-options">
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const resetBtn = document.getElementById('reset-component-options');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetComponentToDefaults();
            });
        }
    }
    
    onComponentSelected(detail) {
        const { componentId, componentType } = detail;
        
        this.currentComponentId = componentId;
        this.currentSchema = this.configManager?.getSchema(componentType);
        
        if (!this.currentSchema) {
            this.logger.warn('UI', `No schema found for ${componentType}`);
            return;
        }
        
        this.showComponentOptions(componentId, componentType);
    }
    
    onComponentDeselected() {
        this.currentComponentId = null;
        this.currentSchema = null;
        this.hideComponentOptions();
    }
    
    showComponentOptions(componentId, componentType) {
        const optionsPanel = document.getElementById('component-options-panel');
        if (!optionsPanel) return;
        
        const noSelectionDiv = optionsPanel.querySelector('.options-panel__no-selection');
        const formDiv = optionsPanel.querySelector('.options-panel__form');
        
        if (noSelectionDiv) noSelectionDiv.style.display = 'none';
        if (formDiv) formDiv.style.display = 'block';
        
        this.updateComponentInfo(componentType);
        this.generateOptionsForm(componentId, componentType);
    }
    
    hideComponentOptions() {
        const optionsPanel = document.getElementById('component-options-panel');
        if (!optionsPanel) return;
        
        const noSelectionDiv = optionsPanel.querySelector('.options-panel__no-selection');
        const formDiv = optionsPanel.querySelector('.options-panel__form');
        
        if (noSelectionDiv) noSelectionDiv.style.display = 'block';
        if (formDiv) formDiv.style.display = 'none';
    }
    
    updateComponentInfo(componentType) {
        if (!this.currentSchema) return;
        
        const typeElement = document.querySelector('.component-info__type');
        const descElement = document.querySelector('.component-info__description');
        
        if (typeElement) {
            typeElement.textContent = this.currentSchema.name || componentType;
        }
        
        if (descElement) {
            descElement.textContent = this.currentSchema.description || 'Configure component options';
        }
    }
    
    generateOptionsForm(componentId, componentType) {
        const sectionsContainer = document.querySelector('.options-sections');
        if (!sectionsContainer) return;
        
        const schema = this.currentSchema;
        if (!schema || !schema.componentOptions) {
            sectionsContainer.innerHTML = '<p>No configuration options available for this component.</p>';
            return;
        }
        
        // Get current configuration or defaults
        const currentConfig = this.configManager?.getComponentConfiguration(componentId) || {};
        const componentOptions = currentConfig.componentOptions || {};
        
        // Group options by sections
        const sections = schema.sections || {};
        const optionsBySection = {};
        
        // Initialize sections
        Object.keys(sections).forEach(sectionKey => {
            optionsBySection[sectionKey] = [];
        });
        
        // Add a default section for options without a section
        optionsBySection['general'] = [];
        
        // Group options into sections
        Object.entries(schema.componentOptions).forEach(([optionKey, optionDef]) => {
            const section = optionDef.section || 'general';
            if (!optionsBySection[section]) {
                optionsBySection[section] = [];
            }
            optionsBySection[section].push({ key: optionKey, ...optionDef });
        });
        
        // Generate HTML for sections
        let html = '';
        
        // Check if this component has a custom content editor
        if (window.componentEditorRegistry && window.componentEditorRegistry.hasEditor(componentType)) {
            // Add a container for the custom editor
            html += `
                <div class="options-section" data-section="content-editor">
                    <div id="custom-content-editor"></div>
                </div>
            `;
        }
        
        Object.entries(optionsBySection).forEach(([sectionKey, options]) => {
            if (options.length === 0) return;
            
            const sectionInfo = sections[sectionKey] || { title: 'General Options', order: 999 };
            
            html += `
                <div class="options-section" data-section="${sectionKey}">
                    <div class="options-section__header">
                        <h4 class="options-section__title">
                            ${sectionInfo.icon ? `<span class="section-icon">${this.getIcon(sectionInfo.icon)}</span>` : ''}
                            ${sectionInfo.title}
                        </h4>
                        ${sectionInfo.description ? `<p class="options-section__description">${sectionInfo.description}</p>` : ''}
                    </div>
                    <div class="options-section__content">
            `;
            
            // Generate controls for each option
            options.forEach(option => {
                const currentValue = componentOptions[option.key] !== undefined ? 
                    componentOptions[option.key] : option.default;
                
                html += this.generateControl(option, currentValue, componentId);
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        sectionsContainer.innerHTML = html;
        
        // Attach event listeners to controls
        this.attachControlListeners(componentId, componentType);
        
        // Load custom content editor if available
        this.loadCustomEditor(componentId, componentType);
        
        this.logger.info('UI', `Generated options form for ${componentType}`);
    }
    
    loadCustomEditor(componentId, componentType) {
        if (!window.componentEditorRegistry || !window.componentEditorRegistry.hasEditor(componentType)) {
            return;
        }
        
        const editorContainer = document.getElementById('custom-content-editor');
        if (!editorContainer) {
            return;
        }
        
        // Clean up any existing editor first
        if (this.currentEditor && this.currentEditor.destroy) {
            this.currentEditor.destroy();
            this.currentEditor = null;
            this.currentEditorComponentId = null;
        }
        
        // Clear the container
        editorContainer.innerHTML = '';
        
        // Get component data
        const component = window.enhancedStateManager?.getState()?.components?.[componentId];
        if (!component) {
            this.logger.warn('UI', `Component ${componentId} not found in state`);
            return;
        }
        
        // For Topics component, check if we have the actual topics data from the DOM
        let componentData = component.props || component.data || {};
        if (componentType === 'topics') {
            // Try to get topics data from the rendered component in the DOM
            const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (componentElement) {
                // Look for topic-title elements which contain the actual topic text
                const topicElements = componentElement.querySelectorAll('.topic-title');
                if (topicElements.length > 0) {
                    const domTopics = [];
                    topicElements.forEach(el => {
                        const text = el.textContent.trim();
                        if (text) domTopics.push(text);
                    });
                    if (domTopics.length > 0) {
                        componentData = { ...componentData, topics: domTopics };
                        this.logger.info('UI', `Loaded ${domTopics.length} topics from DOM for ${componentId}`);
                    }
                } else {
                    // Fallback: Check if topics are in the component props already
                    if (component.props?.topics && component.props.topics.length > 0) {
                        componentData = { ...componentData, topics: component.props.topics };
                        this.logger.info('UI', `Using ${component.props.topics.length} topics from component props`);
                    }
                }
            }
        }
        
        // Create update callback  
        const onUpdate = (componentId, newData) => {
            // Update component props using the correct method
            if (window.enhancedComponentManager && window.enhancedComponentManager.updateComponentProps) {
                window.enhancedComponentManager.updateComponentProps(componentId, newData);
                
                // For Topics component, manually update the DOM immediately
                if (componentType === 'topics' && newData.topics) {
                    this.updateTopicsInDOM(componentId, newData.topics);
                }
            } else if (window.updateComponentProps) {
                window.updateComponentProps(componentId, newData);
                
                // For Topics component, manually update the DOM immediately  
                if (componentType === 'topics' && newData.topics) {
                    this.updateTopicsInDOM(componentId, newData.topics);
                }
            } else {
                this.logger.error('UI', 'No update method available for component props');
            }
        };
        
        // Create the custom editor
        const editor = window.componentEditorRegistry.createEditor(
            componentType,
            editorContainer,
            componentId,
            componentData,
            onUpdate
        );
        
        if (editor) {
            editor.render();
            this.currentEditor = editor;
            this.currentEditorComponentId = componentId;
            this.logger.info('UI', `Loaded custom editor for ${componentType}`);
        }
    }
    
    generateControl(option, currentValue, componentId) {
        let controlHtml = '';
        
        controlHtml += `
            <div class="option-field" data-option="${option.key}">
                <label class="option-field__label">
                    ${option.label}
                    ${option.preview ? '<span class="preview-indicator">👁</span>' : ''}
                </label>
                ${option.description ? `<p class="option-field__description">${option.description}</p>` : ''}
        `;
        
        switch (option.type) {
            case 'select':
                controlHtml += `
                    <select class="form-select" data-option-key="${option.key}">
                        ${Object.entries(option.options || {}).map(([value, label]) => 
                            `<option value="${value}" ${currentValue === value ? 'selected' : ''}>${label}</option>`
                        ).join('')}
                    </select>
                `;
                break;
                
            case 'boolean':
                controlHtml += `
                    <label class="toggle-switch">
                        <input type="checkbox" data-option-key="${option.key}" 
                            ${currentValue ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                        <span class="toggle-label">${option.label}</span>
                    </label>
                `;
                break;
                
            case 'number':
                controlHtml += `
                    <div class="number-input-container">
                        <input type="number" class="form-input" data-option-key="${option.key}"
                            value="${currentValue}" 
                            ${option.min !== undefined ? `min="${option.min}"` : ''}
                            ${option.max !== undefined ? `max="${option.max}"` : ''}>
                        ${option.min !== undefined || option.max !== undefined ? 
                            `<div class="number-input-range">Range: ${option.min || 0} - ${option.max || '∞'}</div>` : ''}
                    </div>
                `;
                break;
                
            case 'color':
                controlHtml += `
                    <div class="color-input-container">
                        <input type="color" class="form-color" data-option-key="${option.key}"
                            value="${currentValue || '#000000'}">
                        <input type="text" class="form-input color-text-input" 
                            value="${currentValue || '#000000'}" 
                            data-option-key="${option.key}-text">
                    </div>
                `;
                break;
                
            case 'text':
            case 'string':
                controlHtml += `
                    <input type="text" class="form-input" data-option-key="${option.key}"
                        value="${currentValue || ''}" 
                        placeholder="${option.placeholder || ''}">
                `;
                break;
                
            case 'textarea':
                controlHtml += `
                    <textarea class="form-textarea" data-option-key="${option.key}"
                        placeholder="${option.placeholder || ''}">${currentValue || ''}</textarea>
                `;
                break;
                
            case 'multiselect':
                controlHtml += `
                    <div class="multiselect-container">
                        ${Object.entries(option.options || {}).map(([value, label]) => `
                            <label class="multiselect-option">
                                <input type="checkbox" value="${value}" data-option-key="${option.key}"
                                    ${(currentValue || []).includes(value) ? 'checked' : ''}>
                                <span class="multiselect-label">${label}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                break;
                
            default:
                controlHtml += `<p class="form-help-text">Unsupported control type: ${option.type}</p>`;
        }
        
        controlHtml += `</div>`;
        
        return controlHtml;
    }
    
    attachControlListeners(componentId, componentType) {
        const controls = document.querySelectorAll('[data-option-key]');
        
        controls.forEach(control => {
            const optionKey = control.dataset.optionKey;
            
            // Skip text inputs for color pickers (they're handled separately)
            if (optionKey.endsWith('-text')) return;
            
            control.addEventListener('change', (e) => {
                this.handleOptionChange(componentId, componentType, optionKey, e.target);
            });
            
            // For text inputs, also listen to input event for real-time updates
            if (control.type === 'text' || control.type === 'number' || control.tagName === 'TEXTAREA') {
                control.addEventListener('input', (e) => {
                    this.handleOptionChange(componentId, componentType, optionKey, e.target);
                });
            }
        });
        
        // Handle color picker text inputs
        document.querySelectorAll('[data-option-key$="-text"]').forEach(textInput => {
            const colorInput = textInput.previousElementSibling;
            if (colorInput && colorInput.type === 'color') {
                textInput.addEventListener('input', (e) => {
                    colorInput.value = e.target.value;
                    const optionKey = colorInput.dataset.optionKey;
                    this.handleOptionChange(componentId, componentType, optionKey, colorInput);
                });
                
                colorInput.addEventListener('change', (e) => {
                    textInput.value = e.target.value;
                });
            }
        });
    }
    
    handleOptionChange(componentId, componentType, optionKey, control) {
        let value;
        
        if (control.type === 'checkbox' && !control.closest('.multiselect-container')) {
            value = control.checked;
        } else if (control.type === 'number') {
            value = parseFloat(control.value);
        } else if (control.closest('.multiselect-container')) {
            // Handle multiselect
            const container = control.closest('.multiselect-container');
            const checkboxes = container.querySelectorAll(`[data-option-key="${optionKey}"]`);
            value = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
        } else {
            value = control.value;
        }
        
        // Update configuration
        if (this.configManager) {
            const updates = {
                componentOptions: {
                    [optionKey]: value
                }
            };
            
            this.configManager.updateComponentConfiguration(componentId, updates);
            
            // Trigger component re-render with new options
            document.dispatchEvent(new CustomEvent('gmkb:component-options-changed', {
                detail: {
                    componentId,
                    componentType,
                    option: optionKey,
                    value,
                    timestamp: Date.now()
                }
            }));
            
            // Show feedback
            control.classList.add('update-success');
            setTimeout(() => {
                control.classList.remove('update-success');
            }, 1000);
        }
        
        this.logger.info('UI', `Option changed: ${optionKey} = ${value}`);
    }
    
    getIcon(iconName) {
        const icons = {
            'edit': '✏️',
            'layout': '📐',
            'palette': '🎨',
            'settings': '⚙️',
            'list': '📋',
            'grid': '⊞',
            'typography': '🔤',
            'contact': '📧'
        };
        
        return icons[iconName] || '📌';
    }
    
    resetComponentToDefaults() {
        this.logger.info('UI', 'Reset to defaults clicked');
    }
}

// Initialize safely
try {
    window.ComponentOptionsUI = ComponentOptionsUI;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.componentOptionsUI = new ComponentOptionsUI();
            console.log('ComponentOptionsUI initialized on DOM ready');
        });
    } else {
        window.componentOptionsUI = new ComponentOptionsUI();
        console.log('ComponentOptionsUI initialized immediately');
    }
} catch (error) {
    console.error('ComponentOptionsUI initialization failed:', error);
}
