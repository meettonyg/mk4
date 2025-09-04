/**
 * Section Edit Panel
 * Phase 3: Section Layer System - Edit Interface
 * 
 * Provides UI for editing section properties in the left sidebar
 * 
 * @version 3.1.0-phase3-sidebar
 * @package GMKB/JS/UI
 */

class SectionEditPanel {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.currentSectionId = null;
        this.currentSection = null;
        this.panelElement = null;
        this.isOpen = false;
        
        this.logger.info('✏️ PHASE 3: SectionEditPanel initializing for sidebar');
        this.initializePanel();
    }
    
    /**
     * Initialize the edit panel
     * Following checklist: Event-Driven Initialization, DOM Creation
     */
    initializePanel() {
        // Wait for sidebar to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.createPanelElement();
                this.setupEventListeners();
                this.injectPanelStyles();
            });
        } else {
            this.createPanelElement();
            this.setupEventListeners();
            this.injectPanelStyles();
        }
        
        this.logger.info('✅ PHASE 3: SectionEditPanel initialized');
    }
    
    /**
     * Create the panel DOM element in sidebar
     * Following checklist: DOM Creation, User Interface
     */
    createPanelElement() {
        // Check if panel already exists
        if (document.getElementById('section-edit-panel')) {
            this.panelElement = document.getElementById('section-edit-panel');
            return;
        }
        
        // ROOT FIX: Find the sidebar content area where tabs are
        let sidebarContainer = document.querySelector('.sidebar__content');
        
        if (!sidebarContainer) {
            // Try alternate selector
            sidebarContainer = document.querySelector('.sidebar-content');
        }
        
        if (!sidebarContainer) {
            // Look for the sidebar itself
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                // Find or create content area
                sidebarContainer = sidebar.querySelector('.sidebar__content');
                if (!sidebarContainer) {
                    // Create content area if it doesn't exist
                    sidebarContainer = document.createElement('div');
                    sidebarContainer.className = 'sidebar__content';
                    sidebar.appendChild(sidebarContainer);
                }
            }
        }
        
        if (!sidebarContainer) {
            this.logger.error('❌ PHASE 3: No sidebar container found for section edit panel');
            // Fallback: create as floating panel attached to body
            sidebarContainer = document.body;
            this.isFloating = true;
        }
        
        const panel = document.createElement('div');
        panel.id = 'section-edit-panel';
        panel.className = 'tab-content gmkb-panel section-edit-panel'; // Add tab-content class
        panel.style.display = 'none';
        panel.setAttribute('data-panel-type', 'section-edit');
        panel.setAttribute('data-tab', 'section-edit'); // Add data-tab for tab system
        
        panel.innerHTML = `
            <div class="gmkb-panel-header section-edit-panel__header">
                <button class="gmkb-panel-back section-edit-panel__back" aria-label="Back">
                    <span class="dashicons dashicons-arrow-left-alt2"></span>
                </button>
                <h3 class="gmkb-panel-title section-edit-panel__title">Edit Section</h3>
                <button class="gmkb-panel-close section-edit-panel__close" aria-label="Close">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
            
            <div class="gmkb-panel-content section-edit-panel__content">
                <!-- Layout Settings -->
                <div class="gmkb-field-group section-edit-group">
                    <h4 class="gmkb-field-group-title section-edit-group__title">Layout</h4>
                    
                    <div class="gmkb-field section-edit-field">
                        <label for="section-width" class="gmkb-field-label">Width</label>
                        <select id="section-width" class="gmkb-control section-edit-control">
                            <option value="full_width">Full Width</option>
                            <option value="constrained">Constrained</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    
                    <div class="gmkb-field section-edit-field" id="max-width-field">
                        <label for="section-max-width" class="gmkb-field-label">Max Width</label>
                        <input type="text" id="section-max-width" class="gmkb-control section-edit-control" placeholder="1200px">
                    </div>
                    
                    <div class="gmkb-field section-edit-field">
                        <label for="section-padding" class="gmkb-field-label">Padding</label>
                        <div class="gmkb-field-row section-edit-padding-controls">
                            <input type="text" id="section-padding-top" class="gmkb-control gmkb-control--small" placeholder="Top">
                            <input type="text" id="section-padding-right" class="gmkb-control gmkb-control--small" placeholder="Right">
                            <input type="text" id="section-padding-bottom" class="gmkb-control gmkb-control--small" placeholder="Bottom">
                            <input type="text" id="section-padding-left" class="gmkb-control gmkb-control--small" placeholder="Left">
                        </div>
                    </div>
                    
                    <div class="gmkb-field section-edit-field" id="column-gap-field">
                        <label for="section-column-gap" class="gmkb-field-label">Column Gap</label>
                        <input type="text" id="section-column-gap" class="gmkb-control section-edit-control" placeholder="40px">
                    </div>
                </div>
                
                <!-- Background Settings -->
                <div class="gmkb-field-group section-edit-group">
                    <h4 class="gmkb-field-group-title section-edit-group__title">Background</h4>
                    
                    <div class="gmkb-field section-edit-field">
                        <label for="section-bg-type" class="gmkb-field-label">Background Type</label>
                        <select id="section-bg-type" class="gmkb-control section-edit-control">
                            <option value="none">None</option>
                            <option value="color">Color</option>
                            <option value="gradient">Gradient</option>
                            <option value="image">Image</option>
                        </select>
                    </div>
                    
                    <div class="gmkb-field section-edit-field" id="bg-color-field" style="display: none;">
                        <label for="section-bg-color" class="gmkb-field-label">Background Color</label>
                        <div class="gmkb-field-row section-edit-color-wrapper">
                            <input type="color" id="section-bg-color" class="gmkb-control gmkb-control--color">
                            <input type="text" id="section-bg-color-text" class="gmkb-control" placeholder="#ffffff">
                        </div>
                    </div>
                    
                    <div class="gmkb-field section-edit-field" id="bg-gradient-field" style="display: none;">
                        <label for="section-bg-gradient" class="gmkb-field-label">Gradient</label>
                        <div class="gmkb-field-column">
                            <div class="gmkb-field-row">
                                <input type="color" id="section-bg-gradient-start" class="gmkb-control gmkb-control--color">
                                <input type="color" id="section-bg-gradient-end" class="gmkb-control gmkb-control--color">
                            </div>
                            <select id="section-bg-gradient-direction" class="gmkb-control section-edit-control">
                                <option value="to bottom">Top to Bottom</option>
                                <option value="to right">Left to Right</option>
                                <option value="135deg">Diagonal</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="gmkb-field section-edit-field" id="bg-image-field" style="display: none;">
                        <label for="section-bg-image" class="gmkb-field-label">Background Image URL</label>
                        <input type="text" id="section-bg-image" class="gmkb-control section-edit-control" placeholder="https://...">
                    </div>
                </div>
                
                <!-- Spacing Settings -->
                <div class="gmkb-field-group section-edit-group">
                    <h4 class="gmkb-field-group-title section-edit-group__title">Spacing</h4>
                    
                    <div class="gmkb-field section-edit-field">
                        <label for="section-spacing-top" class="gmkb-field-label">Spacing Top</label>
                        <select id="section-spacing-top" class="gmkb-control section-edit-control">
                            <option value="none">None</option>
                            <option value="small">Small (20px)</option>
                            <option value="medium">Medium (40px)</option>
                            <option value="large">Large (60px)</option>
                            <option value="xlarge">Extra Large (80px)</option>
                        </select>
                    </div>
                    
                    <div class="gmkb-field section-edit-field">
                        <label for="section-spacing-bottom" class="gmkb-field-label">Spacing Bottom</label>
                        <select id="section-spacing-bottom" class="gmkb-control section-edit-control">
                            <option value="none">None</option>
                            <option value="small">Small (20px)</option>
                            <option value="medium">Medium (40px)</option>
                            <option value="large">Large (60px)</option>
                            <option value="xlarge">Extra Large (80px)</option>
                        </select>
                    </div>
                </div>
                
                <!-- Advanced Settings -->
                <div class="gmkb-field-group section-edit-group">
                    <h4 class="gmkb-field-group-title section-edit-group__title">Advanced</h4>
                    
                    <div class="gmkb-field section-edit-field">
                        <label for="section-custom-class" class="gmkb-field-label">Custom CSS Class</label>
                        <input type="text" id="section-custom-class" class="gmkb-control section-edit-control" placeholder="my-custom-class">
                    </div>
                    
                    <div class="gmkb-field section-edit-field">
                        <label for="section-min-height" class="gmkb-field-label">Minimum Height</label>
                        <input type="text" id="section-min-height" class="gmkb-control section-edit-control" placeholder="auto">
                    </div>
                </div>
            </div>
            
            <div class="gmkb-panel-footer section-edit-panel__footer">
                <button class="gmkb-btn gmkb-btn--secondary section-edit-btn--secondary" id="section-edit-cancel">Cancel</button>
                <button class="gmkb-btn gmkb-btn--primary section-edit-btn--primary" id="section-edit-apply">Apply Changes</button>
            </div>
        `;
        
        // Append to sidebar container
        sidebarContainer.appendChild(panel);
        this.panelElement = panel;
        
        // Register with tab/panel system if available
        if (window.tabManager || window.panelManager) {
            const manager = window.tabManager || window.panelManager;
            if (manager.registerPanel) {
                manager.registerPanel('section-edit', panel, 'Edit Section');
            }
        }
    }
    
    /**
     * Setup event listeners
     * Following checklist: Event-Driven, No Polling
     */
    setupEventListeners() {
        // Listen for section edit requests
        document.addEventListener('gmkb:section-edit-requested', (e) => {
            this.openPanel(e.detail.sectionId);
        });
        
        // Panel controls
        if (this.panelElement) {
            // Back button
            const backBtn = this.panelElement.querySelector('.section-edit-panel__back');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.goBack();
                });
            }
            
            // Close button
            this.panelElement.querySelector('.section-edit-panel__close').addEventListener('click', () => {
                this.closePanel();
            });
            
            // Cancel button
            this.panelElement.querySelector('#section-edit-cancel').addEventListener('click', () => {
                this.closePanel();
            });
            
            // Apply button
            this.panelElement.querySelector('#section-edit-apply').addEventListener('click', () => {
                this.applyChanges();
            });
            
            // Background type change
            this.panelElement.querySelector('#section-bg-type').addEventListener('change', (e) => {
                this.handleBackgroundTypeChange(e.target.value);
            });
            
            // Width change
            this.panelElement.querySelector('#section-width').addEventListener('change', (e) => {
                this.handleWidthChange(e.target.value);
            });
            
            // Color sync
            this.panelElement.querySelector('#section-bg-color').addEventListener('input', (e) => {
                this.panelElement.querySelector('#section-bg-color-text').value = e.target.value;
            });
            
            this.panelElement.querySelector('#section-bg-color-text').addEventListener('input', (e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    this.panelElement.querySelector('#section-bg-color').value = e.target.value;
                }
            });
        }
        
        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') {
                this.closePanel();
            }
        });
    }
    
    /**
     * Open the edit panel for a section
     * Following checklist: User Experience, State Management
     */
    openPanel(sectionId) {
        if (!window.sectionLayoutManager) {
            this.logger.error('❌ PHASE 3: Section layout manager not available');
            return;
        }
        
        const section = window.sectionLayoutManager.getSection(sectionId);
        if (!section) {
            this.logger.error(`❌ PHASE 3: Section ${sectionId} not found`);
            return;
        }
        
        this.currentSectionId = sectionId;
        this.currentSection = section;
        
        // Populate form with current values
        this.populateForm(section);
        
        // ROOT FIX: Hide other tab panels using the tab system
        const allTabs = document.querySelectorAll('.tab-content');
        allTabs.forEach(tab => {
            tab.style.display = 'none';
            tab.classList.remove('active', 'tab-content--active');
        });
        
        // Also hide any floating panels
        const allPanels = document.querySelectorAll('.gmkb-panel, .gmkb-sidebar-panel');
        allPanels.forEach(panel => {
            if (panel.id !== 'section-edit-panel') {
                panel.style.display = 'none';
                panel.classList.remove('active');
            }
        });
        
        // Show this panel
        this.panelElement.style.display = 'block';
        this.panelElement.classList.add('active', 'tab-content--active');
        this.isOpen = true;
        
        // Update tab indicators if they exist
        const tabs = document.querySelectorAll('.sidebar__tab');
        tabs.forEach(tab => {
            tab.classList.remove('sidebar__tab--active');
        });
        
        // Dispatch event for panel system
        document.dispatchEvent(new CustomEvent('gmkb:panel-opened', {
            detail: { panelId: 'section-edit', title: 'Edit Section', sectionId }
        }));
        
        this.logger.info(`✏️ PHASE 3: Opened edit panel for section ${sectionId}`);
    }
    
    /**
     * Go back to previous panel
     * Following checklist: User Experience, Navigation
     */
    goBack() {
        this.closePanel();
        
        // Show the Layout tab/panel
        const layoutTab = document.querySelector('[data-tab="layout"], [data-panel="layout"]');
        if (layoutTab) {
            layoutTab.click();
        } else {
            // Show first available tab
            const firstTab = document.querySelector('.gmkb-tab, .gmkb-sidebar-tab');
            if (firstTab) {
                firstTab.click();
            }
        }
    }
    
    /**
     * Populate form with section data
     * Following checklist: Data Binding, Form Population
     */
    populateForm(section) {
        const layout = section.layout || {};
        const options = section.section_options || {};
        
        // Layout settings
        this.setFieldValue('section-width', layout.width || 'full_width');
        this.setFieldValue('section-max-width', layout.max_width || '1200px');
        
        // Parse padding
        const padding = layout.padding || '40px 20px';
        const paddingParts = padding.split(' ');
        if (paddingParts.length === 1) {
            this.setFieldValue('section-padding-top', paddingParts[0]);
            this.setFieldValue('section-padding-right', paddingParts[0]);
            this.setFieldValue('section-padding-bottom', paddingParts[0]);
            this.setFieldValue('section-padding-left', paddingParts[0]);
        } else if (paddingParts.length === 2) {
            this.setFieldValue('section-padding-top', paddingParts[0]);
            this.setFieldValue('section-padding-right', paddingParts[1]);
            this.setFieldValue('section-padding-bottom', paddingParts[0]);
            this.setFieldValue('section-padding-left', paddingParts[1]);
        } else if (paddingParts.length === 4) {
            this.setFieldValue('section-padding-top', paddingParts[0]);
            this.setFieldValue('section-padding-right', paddingParts[1]);
            this.setFieldValue('section-padding-bottom', paddingParts[2]);
            this.setFieldValue('section-padding-left', paddingParts[3]);
        }
        
        // Column gap (only for multi-column sections)
        if (layout.columns > 1) {
            document.getElementById('column-gap-field').style.display = 'block';
            this.setFieldValue('section-column-gap', layout.column_gap || '40px');
        } else {
            document.getElementById('column-gap-field').style.display = 'none';
        }
        
        // Background settings
        this.setFieldValue('section-bg-type', options.background_type || 'none');
        this.handleBackgroundTypeChange(options.background_type || 'none');
        
        if (options.background_color) {
            this.setFieldValue('section-bg-color', options.background_color);
            this.setFieldValue('section-bg-color-text', options.background_color);
        }
        
        // Spacing settings
        this.setFieldValue('section-spacing-top', options.spacing_top || 'medium');
        this.setFieldValue('section-spacing-bottom', options.spacing_bottom || 'medium');
        
        // Advanced settings
        this.setFieldValue('section-custom-class', options.custom_class || '');
        this.setFieldValue('section-min-height', layout.min_height || '');
        
        // Handle width change
        this.handleWidthChange(layout.width || 'full_width');
    }
    
    /**
     * Apply changes to section
     * Following checklist: State Management, Event-Driven
     */
    applyChanges() {
        if (!this.currentSectionId || !window.sectionLayoutManager) {
            return;
        }
        
        // Gather form values
        const updates = {
            layout: {
                width: this.getFieldValue('section-width'),
                max_width: this.getFieldValue('section-max-width'),
                padding: this.getPaddingValue(),
                column_gap: this.currentSection.layout.columns > 1 ? this.getFieldValue('section-column-gap') : undefined,
                min_height: this.getFieldValue('section-min-height') || undefined
            },
            section_options: {
                background_type: this.getFieldValue('section-bg-type'),
                background_color: this.getBackgroundColor(),
                spacing_top: this.getFieldValue('section-spacing-top'),
                spacing_bottom: this.getFieldValue('section-spacing-bottom'),
                custom_class: this.getFieldValue('section-custom-class') || undefined
            }
        };
        
        // Remove undefined values
        Object.keys(updates.layout).forEach(key => {
            if (updates.layout[key] === undefined) {
                delete updates.layout[key];
            }
        });
        
        Object.keys(updates.section_options).forEach(key => {
            if (updates.section_options[key] === undefined) {
                delete updates.section_options[key];
            }
        });
        
        // Apply updates
        window.sectionLayoutManager.updateSectionConfiguration(this.currentSectionId, updates);
        
        this.logger.info(`✅ PHASE 3: Applied changes to section ${this.currentSectionId}`);
        
        // Show success message
        this.showSuccess('Section updated successfully');
        
        // Go back to previous panel
        this.goBack();
    }
    
    /**
     * Close the edit panel
     * Following checklist: User Experience, State Cleanup
     */
    closePanel() {
        this.panelElement.style.display = 'none';
        this.panelElement.classList.remove('active', 'gmkb-panel--open');
        this.isOpen = false;
        this.currentSectionId = null;
        this.currentSection = null;
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('gmkb:panel-closed', {
            detail: { panelId: 'section-edit' }
        }));
        
        this.logger.info('🔒 PHASE 3: Closed section edit panel');
    }
    
    /**
     * Handle background type change
     * Following checklist: Dynamic UI Updates
     */
    handleBackgroundTypeChange(type) {
        // Hide all background fields
        document.getElementById('bg-color-field').style.display = 'none';
        document.getElementById('bg-gradient-field').style.display = 'none';
        document.getElementById('bg-image-field').style.display = 'none';
        
        // Show relevant field
        switch (type) {
            case 'color':
                document.getElementById('bg-color-field').style.display = 'block';
                break;
            case 'gradient':
                document.getElementById('bg-gradient-field').style.display = 'block';
                break;
            case 'image':
                document.getElementById('bg-image-field').style.display = 'block';
                break;
        }
    }
    
    /**
     * Handle width change
     * Following checklist: Dynamic UI Updates
     */
    handleWidthChange(width) {
        const maxWidthField = document.getElementById('max-width-field');
        if (width === 'full_width') {
            maxWidthField.style.display = 'none';
        } else {
            maxWidthField.style.display = 'block';
        }
    }
    
    /**
     * Get padding value from individual fields
     * Following checklist: Form Data Collection
     */
    getPaddingValue() {
        const top = this.getFieldValue('section-padding-top') || '40px';
        const right = this.getFieldValue('section-padding-right') || '20px';
        const bottom = this.getFieldValue('section-padding-bottom') || '40px';
        const left = this.getFieldValue('section-padding-left') || '20px';
        
        return `${top} ${right} ${bottom} ${left}`;
    }
    
    /**
     * Get background color based on type
     * Following checklist: Conditional Logic
     */
    getBackgroundColor() {
        const type = this.getFieldValue('section-bg-type');
        
        if (type === 'color') {
            return this.getFieldValue('section-bg-color-text') || this.getFieldValue('section-bg-color');
        } else if (type === 'gradient') {
            const start = this.getFieldValue('section-bg-gradient-start') || '#295cff';
            const end = this.getFieldValue('section-bg-gradient-end') || '#1c0d5a';
            const direction = this.getFieldValue('section-bg-gradient-direction') || 'to bottom';
            return `linear-gradient(${direction}, ${start}, ${end})`;
        } else if (type === 'image') {
            const url = this.getFieldValue('section-bg-image');
            return url ? `url(${url})` : 'transparent';
        }
        
        return 'transparent';
    }
    
    /**
     * Helper: Set field value
     */
    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = value || '';
        }
    }
    
    /**
     * Helper: Get field value
     */
    getFieldValue(fieldId) {
        const field = document.getElementById(fieldId);
        return field ? field.value : '';
    }
    
    /**
     * Show success message
     * Following checklist: User Feedback
     */
    showSuccess(message) {
        if (window.enhancedToast) {
            window.enhancedToast.showSuccess(message);
        } else if (window.showToast) {
            window.showToast(message, 'success');
        } else {
            console.log('✅', message);
        }
    }
    
    /**
     * Inject panel styles
     * Following checklist: Visual Design, CSS
     */
    injectPanelStyles() {
        if (document.getElementById('section-edit-panel-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'section-edit-panel-styles';
        styles.innerHTML = `
            /* Section Edit Panel - Sidebar Integration */
            .section-edit-panel {
                position: relative;
                width: 100%;
                height: 100%;
                background: #fff;
                display: none;
                flex-direction: column;
            }
            
            .section-edit-panel.active {
                display: flex !important;
            }
            
            .section-edit-panel__header {
                padding: 15px;
                border-bottom: 1px solid #e1e1e1;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #f8f9fa;
            }
            
            .section-edit-panel__back {
                background: none;
                border: none;
                cursor: pointer;
                padding: 5px;
                margin-right: 10px;
                color: #666;
                transition: color 0.2s;
            }
            
            .section-edit-panel__back:hover {
                color: #295cff;
            }
            
            .section-edit-panel__title {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #333;
                flex: 1;
            }
            
            .section-edit-panel__close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 5px;
                color: #666;
                transition: color 0.2s;
            }
            
            .section-edit-panel__close:hover {
                color: #dc3545;
            }
            
            .section-edit-panel__content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }
            
            .section-edit-group {
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }
            
            .section-edit-group:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            
            .section-edit-group__title {
                margin: 0 0 15px 0;
                font-size: 13px;
                font-weight: 600;
                color: #555;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .section-edit-field {
                margin-bottom: 15px;
            }
            
            .section-edit-field label,
            .gmkb-field-label {
                display: block;
                margin-bottom: 5px;
                font-size: 12px;
                color: #666;
                font-weight: 500;
            }
            
            .section-edit-control,
            .gmkb-control {
                width: 100%;
                padding: 8px 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
                transition: border-color 0.2s;
                background: #fff;
            }
            
            .section-edit-control:focus,
            .gmkb-control:focus {
                outline: none;
                border-color: #295cff;
                box-shadow: 0 0 0 2px rgba(41, 92, 255, 0.1);
            }
            
            .gmkb-control--small {
                width: calc(25% - 6px);
                display: inline-block;
                margin-right: 8px;
            }
            
            .gmkb-control--small:last-child {
                margin-right: 0;
            }
            
            .gmkb-control--color {
                width: 50px;
                height: 36px;
                padding: 2px;
                cursor: pointer;
            }
            
            .section-edit-padding-controls,
            .gmkb-field-row {
                display: flex;
                gap: 8px;
            }
            
            .section-edit-color-wrapper {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .gmkb-field-column {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .section-edit-panel__footer {
                padding: 15px;
                border-top: 1px solid #e1e1e1;
                background: #f8f9fa;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .section-edit-btn--primary,
            .section-edit-btn--secondary {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .section-edit-btn--primary,
            .gmkb-btn--primary {
                background: #295cff;
                color: white;
            }
            
            .section-edit-btn--primary:hover,
            .gmkb-btn--primary:hover {
                background: #1a4bff;
            }
            
            .section-edit-btn--secondary,
            .gmkb-btn--secondary {
                background: #f1f1f1;
                color: #666;
            }
            
            .section-edit-btn--secondary:hover,
            .gmkb-btn--secondary:hover {
                background: #e8e8e8;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Global instance
window.SectionEditPanel = SectionEditPanel;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionEditPanel = new SectionEditPanel();
    });
} else {
    window.sectionEditPanel = new SectionEditPanel();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionEditPanel;
}
