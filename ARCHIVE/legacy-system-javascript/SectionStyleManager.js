/**
 * Section Style Manager
 * Phase 3: Section Layer System - Comprehensive Styling
 * 
 * Manages section-level styling options including backgrounds, spacing,
 * layout, effects, borders, and shadows with live preview
 * 
 * @version 3.1.0-phase3
 * @package GMKB/System
 */

class SectionStyleManager {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.sectionLayoutManager = null;
        this.sectionRenderer = null;
        this.stateManager = null;
        this.activeSection = null;
        this.stylePanel = null;
        
        this.logger.info('🎨 PHASE 3: SectionStyleManager initializing');
        this.initializeManager();
    }
    
    /**
     * Initialize the section style manager
     * Following checklist: Event-Driven Initialization, Dependency-Awareness
     */
    initializeManager() {
        // Wait for core systems to be ready
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // Also try immediate initialization if systems are already ready
        if (window.sectionLayoutManager && window.sectionRenderer) {
            this.onCoreSystemsReady();
        }
        
        // Listen for section edit requests
        document.addEventListener('gmkb:section-edit-requested', (event) => {
            this.onSectionEditRequested(event.detail);
        });
        
        // Listen for section selection
        document.addEventListener('gmkb:section-selected', (event) => {
            this.onSectionSelected(event.detail);
        });
        
        this.logger.info('✅ PHASE 3: SectionStyleManager initialized');
    }
    
    /**
     * Handle core systems ready
     * Following checklist: Dependency-Awareness, No Global Object Sniffing
     */
    onCoreSystemsReady() {
        this.sectionLayoutManager = window.sectionLayoutManager;
        this.sectionRenderer = window.sectionRenderer;
        this.stateManager = window.enhancedStateManager;
        
        this.logger.info('🎯 PHASE 3: Section style manager ready');
    }
    
    /**
     * Handle section edit request
     * Following checklist: User Interaction, Event-Driven
     */
    onSectionEditRequested(detail) {
        const { sectionId } = detail;
        this.openStylePanel(sectionId);
    }
    
    /**
     * Handle section selection
     * Following checklist: State Management, Event-Driven
     */
    onSectionSelected(detail) {
        const { sectionId } = detail;
        this.activeSection = sectionId;
    }
    
    /**
     * Open styling panel for section
     * Following checklist: User Experience, Live Preview
     */
    openStylePanel(sectionId) {
        if (!this.sectionLayoutManager) {
            this.logger.error('❌ PHASE 3: Section layout manager not available');
            return;
        }
        
        const section = this.sectionLayoutManager.getSection(sectionId);
        if (!section) {
            this.logger.error(`❌ PHASE 3: Section ${sectionId} not found`);
            return;
        }
        
        this.activeSection = sectionId;
        
        // Create or update style panel
        if (!this.stylePanel) {
            this.stylePanel = this.createStylePanel();
        }
        
        // Populate with current section styles
        this.populateStylePanel(section);
        
        // Show panel
        this.showStylePanel();
        
        this.logger.info(`✏️ PHASE 3: Opened style panel for section ${sectionId}`);
    }
    
    /**
     * Create style panel UI
     * Following checklist: DOM Creation, User Interface
     */
    createStylePanel() {
        // Remove existing panel if present
        const existingPanel = document.getElementById('section-style-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        const panel = document.createElement('div');
        panel.id = 'section-style-panel';
        panel.className = 'section-style-panel';
        panel.innerHTML = `
            <div class="section-style-panel__header">
                <h3>Section Settings</h3>
                <button class="section-style-panel__close" aria-label="Close">×</button>
            </div>
            <div class="section-style-panel__content">
                <!-- Background Settings -->
                <div class="style-section">
                    <h4>Background</h4>
                    <div class="style-control">
                        <label>Type</label>
                        <select id="section-bg-type">
                            <option value="none">None</option>
                            <option value="color">Solid Color</option>
                            <option value="gradient">Gradient</option>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                        </select>
                    </div>
                    <div class="style-control" id="bg-color-control">
                        <label>Color</label>
                        <input type="color" id="section-bg-color" />
                    </div>
                    <div class="style-control" id="bg-gradient-control" style="display:none;">
                        <label>Gradient Start</label>
                        <input type="color" id="section-gradient-start" />
                        <label>Gradient End</label>
                        <input type="color" id="section-gradient-end" />
                    </div>
                    <div class="style-control" id="bg-image-control" style="display:none;">
                        <label>Image URL</label>
                        <input type="text" id="section-bg-image" placeholder="https://..." />
                    </div>
                </div>
                
                <!-- Spacing Settings -->
                <div class="style-section">
                    <h4>Spacing</h4>
                    <div class="style-control">
                        <label>Padding Top</label>
                        <input type="range" id="section-padding-top" min="0" max="200" />
                        <span class="value-display">40px</span>
                    </div>
                    <div class="style-control">
                        <label>Padding Bottom</label>
                        <input type="range" id="section-padding-bottom" min="0" max="200" />
                        <span class="value-display">40px</span>
                    </div>
                    <div class="style-control">
                        <label>Padding Left/Right</label>
                        <input type="range" id="section-padding-horizontal" min="0" max="100" />
                        <span class="value-display">20px</span>
                    </div>
                    <div class="style-control">
                        <label>Margin Top</label>
                        <input type="range" id="section-margin-top" min="0" max="100" />
                        <span class="value-display">0px</span>
                    </div>
                    <div class="style-control">
                        <label>Margin Bottom</label>
                        <input type="range" id="section-margin-bottom" min="0" max="100" />
                        <span class="value-display">0px</span>
                    </div>
                </div>
                
                <!-- Layout Settings -->
                <div class="style-section">
                    <h4>Layout</h4>
                    <div class="style-control">
                        <label>Max Width</label>
                        <select id="section-max-width">
                            <option value="100%">Full Width (100%)</option>
                            <option value="1400px">Extra Large (1400px)</option>
                            <option value="1200px">Large (1200px)</option>
                            <option value="960px">Medium (960px)</option>
                            <option value="720px">Small (720px)</option>
                        </select>
                    </div>
                    <div class="style-control">
                        <label>
                            <input type="checkbox" id="section-full-width" />
                            Full Width Container
                        </label>
                    </div>
                    <div class="style-control">
                        <label>Alignment</label>
                        <select id="section-alignment">
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                </div>
                
                <!-- Effects Settings -->
                <div class="style-section">
                    <h4>Effects</h4>
                    <div class="style-control">
                        <label>
                            <input type="checkbox" id="section-parallax" />
                            Enable Parallax
                        </label>
                    </div>
                    <div class="style-control">
                        <label>Animation</label>
                        <select id="section-animation">
                            <option value="none">None</option>
                            <option value="fade-in">Fade In</option>
                            <option value="slide-up">Slide Up</option>
                            <option value="slide-down">Slide Down</option>
                            <option value="zoom-in">Zoom In</option>
                        </select>
                    </div>
                    <div class="style-control">
                        <label>Transition Duration</label>
                        <input type="range" id="section-transition" min="0" max="2000" step="100" />
                        <span class="value-display">300ms</span>
                    </div>
                </div>
                
                <!-- Borders & Shadows -->
                <div class="style-section">
                    <h4>Borders & Shadows</h4>
                    <div class="style-control">
                        <label>Border Style</label>
                        <select id="section-border-style">
                            <option value="none">None</option>
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                        </select>
                    </div>
                    <div class="style-control">
                        <label>Border Width</label>
                        <input type="range" id="section-border-width" min="0" max="10" />
                        <span class="value-display">0px</span>
                    </div>
                    <div class="style-control">
                        <label>Border Color</label>
                        <input type="color" id="section-border-color" />
                    </div>
                    <div class="style-control">
                        <label>Border Radius</label>
                        <input type="range" id="section-border-radius" min="0" max="50" />
                        <span class="value-display">0px</span>
                    </div>
                    <div class="style-control">
                        <label>Shadow</label>
                        <select id="section-shadow">
                            <option value="none">None</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="style-section style-actions">
                    <button class="btn btn-primary" id="apply-section-styles">Apply</button>
                    <button class="btn btn-secondary" id="reset-section-styles">Reset</button>
                    <button class="btn btn-danger" id="cancel-section-styles">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Attach event listeners
        this.attachPanelListeners(panel);
        
        // Add panel styles if not already present
        this.injectPanelStyles();
        
        return panel;
    }
    
    /**
     * Attach event listeners to panel
     * Following checklist: Event-Driven, User Interaction
     */
    attachPanelListeners(panel) {
        // Close button
        panel.querySelector('.section-style-panel__close').addEventListener('click', () => {
            this.closeStylePanel();
        });
        
        // Background type change
        panel.querySelector('#section-bg-type').addEventListener('change', (e) => {
            this.handleBackgroundTypeChange(e.target.value);
        });
        
        // Range inputs - show value
        panel.querySelectorAll('input[type="range"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const display = e.target.parentElement.querySelector('.value-display');
                if (display) {
                    display.textContent = e.target.value + 'px';
                    if (e.target.id === 'section-transition') {
                        display.textContent = e.target.value + 'ms';
                    }
                }
                // Live preview
                this.previewStyle(e.target.id, e.target.value);
            });
        });
        
        // Color inputs - live preview
        panel.querySelectorAll('input[type="color"]').forEach(input => {
            input.addEventListener('input', (e) => {
                this.previewStyle(e.target.id, e.target.value);
            });
        });
        
        // Select inputs - live preview
        panel.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.previewStyle(e.target.id, e.target.value);
            });
        });
        
        // Checkbox inputs - live preview
        panel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.previewStyle(e.target.id, e.target.checked);
            });
        });
        
        // Action buttons
        panel.querySelector('#apply-section-styles').addEventListener('click', () => {
            this.applyStyles();
        });
        
        panel.querySelector('#reset-section-styles').addEventListener('click', () => {
            this.resetStyles();
        });
        
        panel.querySelector('#cancel-section-styles').addEventListener('click', () => {
            this.cancelStyles();
        });
    }
    
    /**
     * Handle background type change
     * Following checklist: User Experience, DOM Updates
     */
    handleBackgroundTypeChange(type) {
        const panel = this.stylePanel;
        
        // Hide all background controls
        panel.querySelector('#bg-color-control').style.display = 'none';
        panel.querySelector('#bg-gradient-control').style.display = 'none';
        panel.querySelector('#bg-image-control').style.display = 'none';
        
        // Show relevant control
        switch(type) {
            case 'color':
                panel.querySelector('#bg-color-control').style.display = 'block';
                break;
            case 'gradient':
                panel.querySelector('#bg-gradient-control').style.display = 'block';
                break;
            case 'image':
            case 'video':
                panel.querySelector('#bg-image-control').style.display = 'block';
                break;
        }
        
        this.previewStyle('background-type', type);
    }
    
    /**
     * Populate style panel with current section styles
     * Following checklist: State Management, DOM Updates
     */
    populateStylePanel(section) {
        const panel = this.stylePanel;
        const options = section.section_options || {};
        const layout = section.layout || {};
        
        // Background
        const bgType = options.background_type || 'none';
        panel.querySelector('#section-bg-type').value = bgType;
        this.handleBackgroundTypeChange(bgType);
        
        if (options.background_color) {
            panel.querySelector('#section-bg-color').value = options.background_color;
        }
        
        // Spacing
        const padding = layout.padding || '40px 20px';
        const [paddingV, paddingH] = padding.split(' ');
        panel.querySelector('#section-padding-top').value = parseInt(paddingV) || 40;
        panel.querySelector('#section-padding-bottom').value = parseInt(paddingV) || 40;
        panel.querySelector('#section-padding-horizontal').value = parseInt(paddingH) || 20;
        
        // Layout
        panel.querySelector('#section-max-width').value = layout.max_width || '100%';
        panel.querySelector('#section-full-width').checked = layout.width === 'full_width';
        panel.querySelector('#section-alignment').value = layout.alignment || 'center';
        
        // Update value displays
        panel.querySelectorAll('input[type="range"]').forEach(input => {
            const display = input.parentElement.querySelector('.value-display');
            if (display) {
                display.textContent = input.value + 'px';
                if (input.id === 'section-transition') {
                    display.textContent = input.value + 'ms';
                }
            }
        });
    }
    
    /**
     * Preview style change
     * Following checklist: Live Preview, Performance
     */
    previewStyle(property, value) {
        if (!this.activeSection) return;
        
        const sectionElement = document.getElementById(`section-${this.activeSection}`);
        if (!sectionElement) return;
        
        const innerElement = sectionElement.querySelector('.gmkb-section__inner');
        if (!innerElement) return;
        
        // Apply preview styles based on property
        switch(property) {
            case 'section-bg-color':
                innerElement.style.backgroundColor = value;
                break;
            case 'section-padding-top':
                innerElement.style.paddingTop = value + 'px';
                break;
            case 'section-padding-bottom':
                innerElement.style.paddingBottom = value + 'px';
                break;
            case 'section-padding-horizontal':
                innerElement.style.paddingLeft = value + 'px';
                innerElement.style.paddingRight = value + 'px';
                break;
            case 'section-margin-top':
                sectionElement.style.marginTop = value + 'px';
                break;
            case 'section-margin-bottom':
                sectionElement.style.marginBottom = value + 'px';
                break;
            case 'section-max-width':
                innerElement.style.maxWidth = value;
                break;
            case 'section-border-width':
                sectionElement.style.borderWidth = value + 'px';
                break;
            case 'section-border-color':
                sectionElement.style.borderColor = value;
                break;
            case 'section-border-radius':
                sectionElement.style.borderRadius = value + 'px';
                break;
            case 'section-border-style':
                sectionElement.style.borderStyle = value;
                break;
            case 'section-shadow':
                this.applyShadowPreset(sectionElement, value);
                break;
        }
    }
    
    /**
     * Apply shadow preset
     * Following checklist: Visual Effects, CSS
     */
    applyShadowPreset(element, preset) {
        const shadows = {
            'none': 'none',
            'small': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            'medium': '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
            'large': '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
            'custom': '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)'
        };
        
        element.style.boxShadow = shadows[preset] || 'none';
    }
    
    /**
     * Apply styles to section
     * Following checklist: State Management, Persistence
     */
    applyStyles() {
        if (!this.activeSection || !this.sectionLayoutManager) return;
        
        const panel = this.stylePanel;
        
        // Collect all style values
        const updates = {
            section_options: {
                background_type: panel.querySelector('#section-bg-type').value,
                background_color: panel.querySelector('#section-bg-color').value,
                spacing_top: panel.querySelector('#section-padding-top').value + 'px',
                spacing_bottom: panel.querySelector('#section-padding-bottom').value + 'px',
                margin_top: panel.querySelector('#section-margin-top').value + 'px',
                margin_bottom: panel.querySelector('#section-margin-bottom').value + 'px',
                border_style: panel.querySelector('#section-border-style').value,
                border_width: panel.querySelector('#section-border-width').value + 'px',
                border_color: panel.querySelector('#section-border-color').value,
                border_radius: panel.querySelector('#section-border-radius').value + 'px',
                shadow_preset: panel.querySelector('#section-shadow').value,
                parallax_enabled: panel.querySelector('#section-parallax').checked,
                animation: panel.querySelector('#section-animation').value,
                transition_duration: panel.querySelector('#section-transition').value + 'ms'
            },
            layout: {
                max_width: panel.querySelector('#section-max-width').value,
                width: panel.querySelector('#section-full-width').checked ? 'full_width' : 'constrained',
                padding: `${panel.querySelector('#section-padding-top').value}px ${panel.querySelector('#section-padding-horizontal').value}px ${panel.querySelector('#section-padding-bottom').value}px`,
                alignment: panel.querySelector('#section-alignment').value
            }
        };
        
        // Update section configuration
        this.sectionLayoutManager.updateSectionConfiguration(this.activeSection, updates);
        
        // Close panel
        this.closeStylePanel();
        
        this.logger.info(`✅ PHASE 3: Applied styles to section ${this.activeSection}`);
    }
    
    /**
     * Reset styles to defaults
     * Following checklist: User Experience, State Management
     */
    resetStyles() {
        if (!this.activeSection || !this.sectionLayoutManager) return;
        
        const section = this.sectionLayoutManager.getSection(this.activeSection);
        if (!section) return;
        
        // Get default configuration for section type
        const defaults = this.sectionLayoutManager.getDefaultSectionConfiguration(section.section_type);
        
        // Update to defaults
        this.sectionLayoutManager.updateSectionConfiguration(this.activeSection, defaults);
        
        // Re-populate panel
        this.populateStylePanel({
            ...section,
            ...defaults
        });
        
        this.logger.info(`🔄 PHASE 3: Reset styles for section ${this.activeSection}`);
    }
    
    /**
     * Cancel style changes
     * Following checklist: User Experience, State Rollback
     */
    cancelStyles() {
        // Revert preview changes
        if (this.activeSection && this.sectionRenderer) {
            const section = this.sectionLayoutManager.getSection(this.activeSection);
            if (section) {
                this.sectionRenderer.updateSectionElement(section);
            }
        }
        
        // Close panel
        this.closeStylePanel();
        
        this.logger.info(`❌ PHASE 3: Cancelled style changes for section ${this.activeSection}`);
    }
    
    /**
     * Show style panel
     * Following checklist: User Interface, Animation
     */
    showStylePanel() {
        if (!this.stylePanel) return;
        
        this.stylePanel.classList.add('section-style-panel--visible');
        
        // Add backdrop
        this.addBackdrop();
    }
    
    /**
     * Close style panel
     * Following checklist: User Interface, Cleanup
     */
    closeStylePanel() {
        if (!this.stylePanel) return;
        
        this.stylePanel.classList.remove('section-style-panel--visible');
        
        // Remove backdrop
        this.removeBackdrop();
        
        // Clear active section
        this.activeSection = null;
    }
    
    /**
     * Add backdrop behind panel
     * Following checklist: User Interface, Visual Feedback
     */
    addBackdrop() {
        // Remove existing backdrop
        this.removeBackdrop();
        
        const backdrop = document.createElement('div');
        backdrop.id = 'section-style-backdrop';
        backdrop.className = 'section-style-backdrop';
        backdrop.addEventListener('click', () => {
            this.closeStylePanel();
        });
        
        document.body.appendChild(backdrop);
    }
    
    /**
     * Remove backdrop
     * Following checklist: DOM Cleanup
     */
    removeBackdrop() {
        const backdrop = document.getElementById('section-style-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }
    
    /**
     * Inject panel styles
     * Following checklist: CSS Injection, Styling
     */
    injectPanelStyles() {
        if (document.getElementById('section-style-manager-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'section-style-manager-styles';
        styles.innerHTML = `
            .section-style-panel {
                position: fixed;
                top: 0;
                right: -400px;
                width: 400px;
                height: 100%;
                background: white;
                box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                z-index: 10000;
                transition: right 0.3s ease;
                overflow-y: auto;
            }
            
            .section-style-panel--visible {
                right: 0;
            }
            
            .section-style-panel__header {
                padding: 20px;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f5f5f5;
            }
            
            .section-style-panel__header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .section-style-panel__close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .section-style-panel__content {
                padding: 20px;
            }
            
            .style-section {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .style-section:last-child {
                border-bottom: none;
            }
            
            .style-section h4 {
                margin: 0 0 15px 0;
                font-size: 14px;
                text-transform: uppercase;
                color: #666;
            }
            
            .style-control {
                margin-bottom: 15px;
            }
            
            .style-control label {
                display: block;
                margin-bottom: 5px;
                font-size: 13px;
                color: #333;
            }
            
            .style-control input[type="range"] {
                width: 70%;
                display: inline-block;
            }
            
            .style-control .value-display {
                display: inline-block;
                width: 25%;
                text-align: right;
                font-size: 12px;
                color: #666;
            }
            
            .style-control select,
            .style-control input[type="text"],
            .style-control input[type="color"] {
                width: 100%;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 3px;
            }
            
            .style-control input[type="checkbox"] {
                margin-right: 8px;
            }
            
            .style-actions {
                display: flex;
                gap: 10px;
                padding-top: 20px;
            }
            
            .style-actions button {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .btn-primary {
                background: #295cff;
                color: white;
            }
            
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            
            .section-style-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            activeSection: this.activeSection,
            panelVisible: this.stylePanel?.classList.contains('section-style-panel--visible'),
            sectionLayoutManagerAvailable: !!this.sectionLayoutManager,
            sectionRendererAvailable: !!this.sectionRenderer
        };
    }
}

// Global instance
window.SectionStyleManager = SectionStyleManager;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionStyleManager = new SectionStyleManager();
    });
} else {
    window.sectionStyleManager = new SectionStyleManager();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionStyleManager;
}
