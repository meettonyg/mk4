/**
 * Enhanced Design Panel System
 * Uses schema-driven data binding for automatic updates
 */

import { dataBindingEngine } from '../services/data-binding-engine.js';
import { stateManager } from '../services/state-manager.js';

class DesignPanelSystem {
    constructor() {
        this.currentComponentId = null;
        this.currentComponentType = null;
        this.panelContainer = null;
        this.componentSchemas = new Map();
    }

    /**
     * Initialize the design panel system
     */
    init() {
        this.panelContainer = document.querySelector('.design-panel-content');
        
        // Subscribe to global state changes
        stateManager.subscribeGlobal((state) => {
            this.onStateChange(state);
        });
        
        // Listen for component selection events
        document.addEventListener('component-selected', (e) => {
            this.loadComponentPanel(e.detail.componentId, e.detail.componentType);
        });
        
        // Initialize existing components on page load
        this.initializeExistingComponents();
    }

    /**
     * Initialize existing components from the DOM
     */
    async initializeExistingComponents() {
        const components = document.querySelectorAll('[data-component-id]');
        
        for (const component of components) {
            const componentId = component.getAttribute('data-component-id');
            const componentType = component.getAttribute('data-component-type');
            
            if (componentId && componentType) {
                await this.initializeComponent(componentId, componentType);
            }
        }
    }

    /**
     * Initialize a component with its schema
     * @param {string} componentId - Component instance ID
     * @param {string} componentType - Component type
     */
    async initializeComponent(componentId, componentType) {
        // Load schema if not already loaded
        if (!this.componentSchemas.has(componentType)) {
            const schema = await this.loadComponentSchema(componentType);
            if (schema) {
                this.componentSchemas.set(componentType, schema);
            }
        }
        
        const schema = this.componentSchemas.get(componentType);
        if (schema) {
            await dataBindingEngine.initializeComponent(componentId, componentType, schema);
        }
    }

    /**
     * Load component schema
     * @param {string} componentType - Component type
     * @returns {Object|null} Component schema
     */
    async loadComponentSchema(componentType) {
        try {
            const response = await fetch(`/wp-content/plugins/guestify-media-kit-builder/components/${componentType}/component.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error(`Failed to load schema for ${componentType}:`, error);
        }
        return null;
    }

    /**
     * Load design panel for a component
     * @param {string} componentId - Component instance ID
     * @param {string} componentType - Component type
     */
    async loadComponentPanel(componentId, componentType) {
        this.currentComponentId = componentId;
        this.currentComponentType = componentType;
        
        // Initialize component if not already done
        if (!stateManager.getComponent(componentId)) {
            await this.initializeComponent(componentId, componentType);
        }
        
        const schema = this.componentSchemas.get(componentType);
        if (!schema) return;
        
        // Check if component has a custom design panel
        const hasCustomPanel = await this.hasCustomDesignPanel(componentType);
        
        if (hasCustomPanel) {
            // Load custom design panel
            await this.loadCustomDesignPanel(componentType, componentId);
        } else {
            // Generate design panel from schema
            this.generateDesignPanel(schema, componentId);
        }
        
        // Bind the design panel to data binding engine
        dataBindingEngine.bindDesignPanel(this.panelContainer, componentId);
        
        // Add component-specific event handlers
        this.attachSpecialHandlers(componentType, componentId);
    }

    /**
     * Check if component has custom design panel
     * @param {string} componentType - Component type
     * @returns {boolean} Has custom panel
     */
    async hasCustomDesignPanel(componentType) {
        try {
            const response = await fetch(`/wp-content/plugins/guestify-media-kit-builder/components/${componentType}/design-panel.php`, {
                method: 'HEAD'
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Load custom design panel
     * @param {string} componentType - Component type
     * @param {string} componentId - Component instance ID
     */
    async loadCustomDesignPanel(componentType, componentId) {
        try {
            const ajaxUrl = window.ajaxurl || window.gmkb_data?.ajax_url || window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php';
            const response = await fetch(ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'gmkb_load_design_panel',
                    component_type: componentType,
                    component_id: componentId,
                    nonce: window.gmkb_data.nonce
                })
            });
            
            if (response.ok) {
                const html = await response.text();
                this.panelContainer.innerHTML = html;
            }
        } catch (error) {
            console.error('Failed to load custom design panel:', error);
            // Fallback to generated panel
            const schema = this.componentSchemas.get(componentType);
            if (schema) {
                this.generateDesignPanel(schema, componentId);
            }
        }
    }

    /**
     * Generate design panel from schema
     * @param {Object} schema - Component schema
     * @param {string} componentId - Component instance ID
     */
    generateDesignPanel(schema, componentId) {
        const panelHTML = `
            <div class="element-editor__header">
                <div class="element-editor__title">
                    ${schema.icon ? `<img src="/wp-content/plugins/guestify-media-kit-builder/components/${this.currentComponentType}/assets/${schema.icon}" width="18" height="18">` : ''}
                    ${schema.name}
                </div>
                <div class="element-editor__subtitle">${schema.description || ''}</div>
            </div>
            <div class="element-editor__body">
                ${dataBindingEngine.generateDesignPanel(schema)}
            </div>
        `;
        
        this.panelContainer.innerHTML = panelHTML;
    }

    /**
     * Attach special handlers for specific input types
     * @param {string} componentType - Component type
     * @param {string} componentId - Component instance ID
     */
    attachSpecialHandlers(componentType, componentId) {
        // Image upload handlers
        const imageUploads = this.panelContainer.querySelectorAll('.image-upload-area');
        imageUploads.forEach(upload => {
            const settingKey = upload.getAttribute('data-setting');
            if (!settingKey) return;
            
            const uploadBtn = upload.querySelector('.upload-btn');
            if (uploadBtn) {
                uploadBtn.addEventListener('click', () => {
                    this.openMediaLibrary(settingKey, componentId);
                });
            }
            
            // Drag and drop
            upload.addEventListener('dragover', (e) => {
                e.preventDefault();
                upload.classList.add('drag-over');
            });
            
            upload.addEventListener('dragleave', () => {
                upload.classList.remove('drag-over');
            });
            
            upload.addEventListener('drop', (e) => {
                e.preventDefault();
                upload.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                    this.handleImageUpload(files[0], settingKey, componentId);
                }
            });
        });
        
        // Color picker sync
        const colorPickers = this.panelContainer.querySelectorAll('.color-picker');
        colorPickers.forEach(picker => {
            const colorInput = picker.querySelector('input[type="color"]');
            const textInput = picker.querySelector('input[type="text"]');
            
            if (colorInput && textInput) {
                // Sync color to text
                colorInput.addEventListener('input', () => {
                    textInput.value = colorInput.value;
                    textInput.dispatchEvent(new Event('input'));
                });
                
                // Sync text to color
                textInput.addEventListener('input', () => {
                    if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
                        colorInput.value = textInput.value;
                    }
                });
            }
        });
        
        // Range slider value display
        const rangeInputs = this.panelContainer.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(range => {
            const valueDisplay = this.panelContainer.querySelector(`[data-setting="${range.getAttribute('data-setting')}-value"]`);
            if (valueDisplay) {
                range.addEventListener('input', () => {
                    valueDisplay.textContent = range.value;
                });
                // Set initial value
                valueDisplay.textContent = range.value;
            }
        });
    }

    /**
     * Open WordPress media library
     * @param {string} settingKey - Setting key for the image
     * @param {string} componentId - Component instance ID
     */
    openMediaLibrary(settingKey, componentId) {
        if (!wp || !wp.media) {
            console.error('WordPress media library not available');
            return;
        }
        
        const frame = wp.media({
            title: 'Select Image',
            button: {
                text: 'Use this image'
            },
            multiple: false
        });
        
        frame.on('select', () => {
            const attachment = frame.state().get('selection').first().toJSON();
            stateManager.updateComponent(componentId, settingKey, attachment.url);
            
            // Update preview in upload area
            this.updateImagePreview(settingKey, attachment.url);
        });
        
        frame.open();
    }

    /**
     * Handle image file upload
     * @param {File} file - Image file
     * @param {string} settingKey - Setting key
     * @param {string} componentId - Component instance ID
     */
    async handleImageUpload(file, settingKey, componentId) {
        const formData = new FormData();
        formData.append('action', 'upload-attachment');
        formData.append('async-upload', file);
        formData.append('name', file.name);
        formData.append('_wpnonce', window.gmkb_data.upload_nonce);
        
        try {
            const response = await fetch(window.ajaxurl, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.url) {
                    stateManager.updateComponent(componentId, settingKey, data.data.url);
                    this.updateImagePreview(settingKey, data.data.url);
                }
            }
        } catch (error) {
            console.error('Image upload failed:', error);
        }
    }

    /**
     * Update image preview in upload area
     * @param {string} settingKey - Setting key
     * @param {string} imageUrl - Image URL
     */
    updateImagePreview(settingKey, imageUrl) {
        const uploadArea = this.panelContainer.querySelector(`[data-setting="${settingKey}"]`);
        if (!uploadArea) return;
        
        // Add preview if it doesn't exist
        let preview = uploadArea.querySelector('.image-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'image-preview';
            uploadArea.appendChild(preview);
        }
        
        preview.innerHTML = `
            <img src="${imageUrl}" alt="Preview">
            <button class="remove-image" data-setting="${settingKey}">×</button>
        `;
        
        // Add remove handler
        const removeBtn = preview.querySelector('.remove-image');
        removeBtn.addEventListener('click', () => {
            stateManager.updateComponent(this.currentComponentId, settingKey, '');
            preview.remove();
        });
    }

    /**
     * Handle state changes
     * @param {Object} state - New state
     */
    onStateChange(state) {
        // Update any UI elements that depend on global state
        this.updateSaveIndicator(state);
    }

    /**
     * Update save indicator based on state
     * @param {Object} state - Current state
     */
    updateSaveIndicator(state) {
        const saveIndicator = document.querySelector('.save-indicator');
        if (!saveIndicator) return;
        
        const lastSaved = localStorage.getItem('gmkb_last_saved');
        const currentStateHash = this.hashState(state);
        const savedStateHash = localStorage.getItem('gmkb_saved_state_hash');
        
        if (currentStateHash !== savedStateHash) {
            saveIndicator.classList.add('unsaved');
            saveIndicator.textContent = 'Unsaved changes';
        } else {
            saveIndicator.classList.remove('unsaved');
            if (lastSaved) {
                const date = new Date(lastSaved);
                saveIndicator.textContent = `Last saved: ${this.formatRelativeTime(date)}`;
            }
        }
    }

    /**
     * Hash state for comparison
     * @param {Object} state - State to hash
     * @returns {string} Hash
     */
    hashState(state) {
        return btoa(JSON.stringify(state)).substring(0, 32);
    }

    /**
     * Format relative time
     * @param {Date} date - Date to format
     * @returns {string} Formatted time
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const designPanelSystem = new DesignPanelSystem();
    designPanelSystem.init();
    
    // Export for global access
    window.gmkbDesignPanel = designPanelSystem;
});