/**
 * Theme Customizer UI
 * Phase 4: Theme Layer System
 * 
 * User interface for theme selection and customization
 * ROOT CAUSE FIX: Event-driven theme management without global dependencies
 * 
 * @version 4.0.0-phase4
 * @package GMKB/UI
 */

(function() {
    'use strict';
    
    console.log('🎨 Theme Customizer: Script loaded');
    
    class ThemeCustomizer {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.themeManager = null;
        this.customizerPanel = null;
        this.isOpen = false;
        
        this.logger.info('🎨 PHASE 4: ThemeCustomizer initializing');
        this.initializeCustomizer();
    }
    
    /**
     * Initialize the theme customizer
     * Following checklist: Event-Driven Initialization, Dependency-Awareness
     */
    initializeCustomizer() {
        // Wait for theme manager to be ready
        document.addEventListener('gmkb:theme-applied', () => {
            if (!this.themeManager && window.themeManager) {
                this.themeManager = window.themeManager;
                this.setupUI();
            }
        });
        
        // Listen for toolbar theme button click
        document.addEventListener('gmkb:open-theme-customizer', () => {
            this.open();
        });
        
        // Listen for keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + T to open theme customizer
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggle();
            }
        });
        
        this.logger.info('✅ PHASE 4: ThemeCustomizer initialized');
    }
    
    /**
     * Setup UI elements
     * Following checklist: Simplicity First, No Redundant Logic
     */
    setupUI() {
        // Create customizer panel if it doesn't exist
        if (!document.getElementById('gmkb-theme-customizer')) {
            this.createCustomizerPanel();
        }
        
        // Add theme button to toolbar if not exists
        this.addToolbarButton();
    }
    
    /**
     * Create the customizer panel
     * Following checklist: Root Cause Fix, No Direct Manipulation
     */
    createCustomizerPanel() {
        const panel = document.createElement('div');
        panel.id = 'gmkb-theme-customizer';
        panel.className = 'gmkb-theme-customizer';
        panel.innerHTML = `
            <div class="gmkb-theme-customizer__overlay"></div>
            <div class="gmkb-theme-customizer__panel">
                <div class="gmkb-theme-customizer__header">
                    <h3 class="gmkb-theme-customizer__title">Theme Customizer</h3>
                    <button class="gmkb-theme-customizer__close" aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="gmkb-theme-customizer__tabs">
                    <button class="gmkb-theme-customizer__tab active" data-tab="presets">
                        Preset Themes
                    </button>
                    <button class="gmkb-theme-customizer__tab" data-tab="customize">
                        Customize
                    </button>
                    <button class="gmkb-theme-customizer__tab" data-tab="advanced">
                        Advanced
                    </button>
                </div>
                
                <div class="gmkb-theme-customizer__content">
                    <!-- Presets Tab -->
                    <div class="gmkb-theme-customizer__tab-panel active" data-panel="presets">
                        <div class="gmkb-theme-customizer__themes">
                            <!-- Theme cards will be inserted here -->
                        </div>
                    </div>
                    
                    <!-- Customize Tab -->
                    <div class="gmkb-theme-customizer__tab-panel" data-panel="customize">
                        <div class="gmkb-theme-customizer__customize">
                            <div class="gmkb-theme-customizer__section">
                                <h4>Colors</h4>
                                <div class="gmkb-theme-customizer__colors">
                                    <div class="gmkb-theme-customizer__color-group">
                                        <label>Primary Color</label>
                                        <input type="color" data-property="colors.primary" />
                                    </div>
                                    <div class="gmkb-theme-customizer__color-group">
                                        <label>Secondary Color</label>
                                        <input type="color" data-property="colors.secondary" />
                                    </div>
                                    <div class="gmkb-theme-customizer__color-group">
                                        <label>Accent Color</label>
                                        <input type="color" data-property="colors.accent" />
                                    </div>
                                    <div class="gmkb-theme-customizer__color-group">
                                        <label>Text Color</label>
                                        <input type="color" data-property="colors.text" />
                                    </div>
                                    <div class="gmkb-theme-customizer__color-group">
                                        <label>Background</label>
                                        <input type="color" data-property="colors.background" />
                                    </div>
                                    <div class="gmkb-theme-customizer__color-group">
                                        <label>Surface</label>
                                        <input type="color" data-property="colors.surface" />
                                    </div>
                                </div>
                            </div>
                            
                            <div class="gmkb-theme-customizer__section">
                                <h4>Typography</h4>
                                <div class="gmkb-theme-customizer__typography">
                                    <div class="gmkb-theme-customizer__input-group">
                                        <label>Primary Font</label>
                                        <select data-property="typography.primary_font.family">
                                            <option value="system-ui, sans-serif">System Default</option>
                                            <option value="Inter, sans-serif">Inter</option>
                                            <option value="Roboto, sans-serif">Roboto</option>
                                            <option value="Poppins, sans-serif">Poppins</option>
                                            <option value="Montserrat, sans-serif">Montserrat</option>
                                        </select>
                                    </div>
                                    <div class="gmkb-theme-customizer__input-group">
                                        <label>Font Scale</label>
                                        <input type="range" min="1" max="1.5" step="0.05" 
                                               data-property="typography.font_scale" />
                                        <span class="gmkb-theme-customizer__value">1.2</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="gmkb-theme-customizer__section">
                                <h4>Effects</h4>
                                <div class="gmkb-theme-customizer__effects">
                                    <div class="gmkb-theme-customizer__input-group">
                                        <label>Border Radius</label>
                                        <select data-property="effects.border_radius">
                                            <option value="0px">None</option>
                                            <option value="4px">Small</option>
                                            <option value="8px">Medium</option>
                                            <option value="16px">Large</option>
                                            <option value="24px">Extra Large</option>
                                        </select>
                                    </div>
                                    <div class="gmkb-theme-customizer__input-group">
                                        <label>Shadows</label>
                                        <select data-property="effects.shadow">
                                            <option value="none">None</option>
                                            <option value="0 1px 3px rgba(0,0,0,0.1)">Subtle</option>
                                            <option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
                                            <option value="0 10px 20px rgba(0,0,0,0.15)">Large</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Advanced Tab -->
                    <div class="gmkb-theme-customizer__tab-panel" data-panel="advanced">
                        <div class="gmkb-theme-customizer__advanced">
                            <div class="gmkb-theme-customizer__actions">
                                <button class="gmkb-btn gmkb-btn--secondary" data-action="export">
                                    Export Theme
                                </button>
                                <button class="gmkb-btn gmkb-btn--secondary" data-action="import">
                                    Import Theme
                                </button>
                                <button class="gmkb-btn gmkb-btn--secondary" data-action="reset">
                                    Reset to Default
                                </button>
                            </div>
                            
                            <div class="gmkb-theme-customizer__custom">
                                <h4>Create Custom Theme</h4>
                                <div class="gmkb-theme-customizer__input-group">
                                    <label>Theme Name</label>
                                    <input type="text" id="custom-theme-name" placeholder="My Custom Theme" />
                                </div>
                                <div class="gmkb-theme-customizer__input-group">
                                    <label>Base Theme</label>
                                    <select id="custom-theme-base">
                                        <option value="default">Default</option>
                                        <option value="professional_clean">Professional Clean</option>
                                        <option value="creative_bold">Creative Bold</option>
                                        <option value="minimal_elegant">Minimal Elegant</option>
                                        <option value="modern_dark">Modern Dark</option>
                                    </select>
                                </div>
                                <button class="gmkb-btn gmkb-btn--primary" data-action="create">
                                    Create Custom Theme
                                </button>
                            </div>
                            
                            <input type="file" id="theme-import-file" accept=".json" style="display: none;" />
                        </div>
                    </div>
                </div>
                
                <div class="gmkb-theme-customizer__footer">
                    <button class="gmkb-btn gmkb-btn--secondary" data-action="cancel">Cancel</button>
                    <button class="gmkb-btn gmkb-btn--primary" data-action="save">Save Changes</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.customizerPanel = panel;
        
        // Bind events
        this.bindEvents();
        
        // Load themes
        this.loadThemes();
    }
    
    /**
     * Bind event handlers
     * Following checklist: Event-Driven, No Direct Manipulation
     */
    bindEvents() {
        if (!this.customizerPanel) return;
        
        // Close button
        this.customizerPanel.querySelector('.gmkb-theme-customizer__close').addEventListener('click', () => {
            this.close();
        });
        
        // Overlay click
        this.customizerPanel.querySelector('.gmkb-theme-customizer__overlay').addEventListener('click', () => {
            this.close();
        });
        
        // Tab switching
        this.customizerPanel.querySelectorAll('.gmkb-theme-customizer__tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Color inputs
        this.customizerPanel.querySelectorAll('input[type="color"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateThemeProperty(e.target.dataset.property, e.target.value);
            });
        });
        
        // Select inputs
        this.customizerPanel.querySelectorAll('select[data-property]').forEach(select => {
            select.addEventListener('change', (e) => {
                this.updateThemeProperty(e.target.dataset.property, e.target.value);
            });
        });
        
        // Range inputs
        this.customizerPanel.querySelectorAll('input[type="range"]').forEach(range => {
            range.addEventListener('input', (e) => {
                const value = e.target.value;
                this.updateThemeProperty(e.target.dataset.property, value);
                // Update display value
                const valueSpan = e.target.parentElement.querySelector('.gmkb-theme-customizer__value');
                if (valueSpan) {
                    valueSpan.textContent = value;
                }
            });
        });
        
        // Action buttons
        this.customizerPanel.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleAction(e.target.dataset.action);
            });
        });
        
        // Import file input
        const fileInput = this.customizerPanel.querySelector('#theme-import-file');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleImport(e.target.files[0]);
            });
        }
    }
    
    /**
     * Load available themes
     * Following checklist: Simplicity First
     */
    loadThemes() {
        if (!this.themeManager) return;
        
        const themes = this.themeManager.getAvailableThemes();
        const currentTheme = this.themeManager.getCurrentTheme();
        const container = this.customizerPanel.querySelector('.gmkb-theme-customizer__themes');
        
        container.innerHTML = themes.map(theme => `
            <div class="gmkb-theme-customizer__theme-card ${currentTheme?.theme_id === theme.theme_id ? 'active' : ''}" 
                 data-theme="${theme.theme_id}">
                <div class="gmkb-theme-customizer__theme-preview">
                    <div class="gmkb-theme-customizer__theme-colors">
                        <span style="background: ${theme.colors.primary}"></span>
                        <span style="background: ${theme.colors.secondary}"></span>
                        <span style="background: ${theme.colors.accent}"></span>
                        <span style="background: ${theme.colors.background}"></span>
                    </div>
                </div>
                <h4 class="gmkb-theme-customizer__theme-name">${theme.theme_name}</h4>
                <button class="gmkb-btn gmkb-btn--primary gmkb-btn--small">Apply Theme</button>
            </div>
        `).join('');
        
        // Bind theme card clicks
        container.querySelectorAll('.gmkb-theme-customizer__theme-card button').forEach(button => {
            button.addEventListener('click', (e) => {
                const themeId = e.target.closest('.gmkb-theme-customizer__theme-card').dataset.theme;
                this.applyTheme(themeId);
            });
        });
    }
    
    /**
     * Add toolbar button
     * Following checklist: Event-Driven
     */
    addToolbarButton() {
        const toolbar = document.querySelector('.gmkb-toolbar__actions');
        if (!toolbar || toolbar.querySelector('[data-action="theme"]')) return;
        
        const button = document.createElement('button');
        button.className = 'gmkb-toolbar__button';
        button.setAttribute('data-action', 'theme');
        button.setAttribute('aria-label', 'Theme Settings');
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM10 4a6 6 0 016 6c0 .34-.03.67-.09 1H13a1 1 0 00-1 1v1.07A4 4 0 0110 4z"/>
            </svg>
            <span>Theme</span>
        `;
        
        button.addEventListener('click', () => {
            this.toggle();
        });
        
        toolbar.appendChild(button);
    }
    
    /**
     * Open the customizer
     */
    open() {
        if (!this.customizerPanel) {
            this.setupUI();
        }
        
        this.customizerPanel.classList.add('open');
        this.isOpen = true;
        
        // Load current theme values
        this.loadCurrentValues();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('gmkb:theme-customizer-opened'));
    }
    
    /**
     * Close the customizer
     */
    close() {
        if (this.customizerPanel) {
            this.customizerPanel.classList.remove('open');
        }
        this.isOpen = false;
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('gmkb:theme-customizer-closed'));
    }
    
    /**
     * Toggle the customizer
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * Switch tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        this.customizerPanel.querySelectorAll('.gmkb-theme-customizer__tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update panels
        this.customizerPanel.querySelectorAll('.gmkb-theme-customizer__tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === tabName);
        });
    }
    
    /**
     * Apply a theme
     */
    applyTheme(themeId) {
        document.dispatchEvent(new CustomEvent('gmkb:theme-change-requested', {
            detail: { themeId }
        }));
        
        // Update UI
        this.loadThemes();
        this.loadCurrentValues();
    }
    
    /**
     * Update theme property
     */
    updateThemeProperty(property, value) {
        if (!this.themeManager) return;
        
        this.themeManager.updateThemeProperty(property, value);
    }
    
    /**
     * Load current theme values into inputs
     */
    loadCurrentValues() {
        if (!this.themeManager) return;
        
        const theme = this.themeManager.getCurrentTheme();
        if (!theme) return;
        
        // Update color inputs
        this.customizerPanel.querySelectorAll('input[type="color"]').forEach(input => {
            const property = input.dataset.property;
            const value = this.getNestedProperty(theme, property);
            if (value) {
                input.value = value;
            }
        });
        
        // Update selects
        this.customizerPanel.querySelectorAll('select[data-property]').forEach(select => {
            const property = select.dataset.property;
            const value = this.getNestedProperty(theme, property);
            if (value) {
                select.value = value;
            }
        });
        
        // Update range inputs
        this.customizerPanel.querySelectorAll('input[type="range"]').forEach(range => {
            const property = range.dataset.property;
            const value = this.getNestedProperty(theme, property);
            if (value) {
                range.value = value;
                const valueSpan = range.parentElement.querySelector('.gmkb-theme-customizer__value');
                if (valueSpan) {
                    valueSpan.textContent = value;
                }
            }
        });
    }
    
    /**
     * Get nested property value
     */
    getNestedProperty(obj, path) {
        const parts = path.split('.');
        let value = obj;
        
        for (const part of parts) {
            if (value && typeof value === 'object') {
                value = value[part];
            } else {
                return null;
            }
        }
        
        return value;
    }
    
    /**
     * Handle action buttons
     */
    handleAction(action) {
        switch (action) {
            case 'save':
                this.saveChanges();
                break;
            case 'cancel':
                this.close();
                break;
            case 'export':
                this.exportTheme();
                break;
            case 'import':
                document.getElementById('theme-import-file').click();
                break;
            case 'reset':
                this.applyTheme('default');
                break;
            case 'create':
                this.createCustomTheme();
                break;
        }
    }
    
    /**
     * Save changes
     */
    saveChanges() {
        // Changes are already applied in real-time
        // This could save to database if needed
        this.close();
        
        // Show success message
        if (window.showToast) {
            window.showToast('Theme changes saved', 'success');
        }
    }
    
    /**
     * Export current theme
     */
    exportTheme() {
        if (!this.themeManager) return;
        
        const theme = this.themeManager.getCurrentTheme();
        if (!theme) return;
        
        document.dispatchEvent(new CustomEvent('gmkb:export-theme', {
            detail: { themeId: theme.theme_id }
        }));
    }
    
    /**
     * Handle theme import
     */
    handleImport(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const themeJson = e.target.result;
                document.dispatchEvent(new CustomEvent('gmkb:import-theme', {
                    detail: { themeJson }
                }));
                
                // Refresh themes list
                setTimeout(() => {
                    this.loadThemes();
                }, 100);
                
                if (window.showToast) {
                    window.showToast('Theme imported successfully', 'success');
                }
            } catch (error) {
                this.logger.error('Failed to import theme:', error);
                if (window.showToast) {
                    window.showToast('Failed to import theme', 'error');
                }
            }
        };
        reader.readAsText(file);
    }
    
    /**
     * Create custom theme
     */
    createCustomTheme() {
        const name = document.getElementById('custom-theme-name').value;
        const baseTheme = document.getElementById('custom-theme-base').value;
        
        if (!name) {
            if (window.showToast) {
                window.showToast('Please enter a theme name', 'warning');
            }
            return;
        }
        
        document.dispatchEvent(new CustomEvent('gmkb:create-custom-theme', {
            detail: {
                baseTheme,
                overrides: {
                    theme_name: name
                }
            }
        }));
        
        // Refresh themes list
        setTimeout(() => {
            this.loadThemes();
        }, 100);
        
        if (window.showToast) {
            window.showToast(`Custom theme "${name}" created`, 'success');
        }
    }
    }
    
    // Global instance
    window.ThemeCustomizer = ThemeCustomizer;
    
    // ROOT FIX: Initialize immediately to be available for toolbar
    // The instance will wait internally for its dependencies
    if (!window.themeCustomizer) {
        window.themeCustomizer = new ThemeCustomizer();
        console.log('✅ Theme Customizer: Instance created immediately and available globally');
    }
    
    // Also ensure initialization after DOM/events for components that might recreate it
    function ensureThemeCustomizer() {
        if (!window.themeCustomizer) {
            window.themeCustomizer = new ThemeCustomizer();
            console.log('✅ Theme Customizer: Late initialization completed');
        }
    }
    
    // Backup initialization points
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureThemeCustomizer);
    }
    document.addEventListener('gmkb:theme-applied', ensureThemeCustomizer);
    document.addEventListener('gmkb:ready', ensureThemeCustomizer);
    
    // Export for use in modules
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ThemeCustomizer;
    }
    
    console.log('🎨 Theme Customizer: Setup complete');
    
})();
