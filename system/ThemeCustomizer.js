/**
 * Theme Customizer - Advanced Version
 * Phase 4.1-4.2: Complete Theme Customization System
 * 
 * CHECKLIST COMPLIANT: Event-driven, no polling, no global sniffing
 * Provides comprehensive UI for customizing themes with live preview
 * 
 * @version 4.2.0
 * @package GMKB/System
 */

(function() {
    'use strict';
    
    class ThemeCustomizer {
        constructor() {
            this.logger = window.structuredLogger || console;
            this.themeManager = null;
            this.isInitialized = false;
            this.currentTheme = null;
            this.originalTheme = null;
            this.customizations = {};
            this.unsavedChanges = false;
            this.activePanel = 'themes';
            
            this.logger.info('🎨 Theme Customizer: Initializing Advanced Version 4.2');
            
            // CHECKLIST COMPLIANT: Event-driven initialization only
            this.setupEventListeners();
            
            // Try immediate initialization if theme manager exists
            if (window.themeManager) {
                this.init(window.themeManager);
            }
        }
        
        setupEventListeners() {
            // Listen for theme manager ready
            document.addEventListener('gmkb:themes-loaded', (e) => this.onThemesLoaded(e));
            
            // Listen for core systems ready
            document.addEventListener('gmkb:core-systems-ready', (e) => this.onCoreSystemsReady(e));
            
            // Listen for open requests
            document.addEventListener('gmkb:open-theme-customizer', (e) => this.handleOpenRequest(e));
            
            // Listen for keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                    e.preventDefault();
                    this.open();
                }
            });
        }
        
        onThemesLoaded(event) {
            if (!this.isInitialized && window.themeManager) {
                this.init(window.themeManager);
            }
        }
        
        onCoreSystemsReady(event) {
            if (!this.isInitialized && window.themeManager) {
                this.init(window.themeManager);
            }
        }
        
        init(themeManager) {
            if (this.isInitialized) return;
            
            this.themeManager = themeManager;
            this.isInitialized = true;
            this.currentTheme = themeManager.getCurrentTheme();
            this.originalTheme = {...this.currentTheme};
            
            // Make available globally for toolbar
            window.openThemeSettings = () => this.open();
            
            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('gmkb:theme-customizer-ready', {
                detail: { customizer: this }
            }));
            
            this.logger.info('✅ Theme Customizer: Ready with advanced customization features');
        }
        
        handleOpenRequest(event) {
            this.open(event.detail);
        }
        
        open(options = {}) {
            if (!this.isInitialized || !this.themeManager) {
                this.showError('Theme system is still loading. Please try again.');
                return;
            }
            
            try {
                this.openAdvancedModal();
            } catch (error) {
                this.logger.error('Theme Customizer: Error', error);
                this.showError('Failed to open theme settings.');
            }
        }
        
        openAdvancedModal() {
            const themes = this.themeManager.getAvailableThemes();
            this.currentTheme = this.themeManager.getCurrentTheme();
            this.originalTheme = {...this.currentTheme};
            this.customizations = {};
            this.unsavedChanges = false;
            
            // Remove existing modal
            const existing = document.getElementById('theme-customizer-modal');
            if (existing) existing.remove();
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'gmkb-modal theme-customizer-modal advanced';
            modal.id = 'theme-customizer-modal';
            modal.innerHTML = this.getAdvancedModalHTML(themes);
            
            // Add to page
            document.body.appendChild(modal);
            
            // Setup listeners
            this.setupAdvancedModalListeners(modal);
            
            // Add styles
            this.injectAdvancedStyles();
            
            // Show
            requestAnimationFrame(() => {
                modal.classList.add('show');
                this.showPanel('themes');
            });
            
            this.logger.info('✅ Advanced theme customizer opened');
        }
        
        getAdvancedModalHTML(themes) {
            return `
                <div class="gmkb-modal-overlay"></div>
                <div class="gmkb-modal-content advanced">
                    <div class="gmkb-modal-header">
                        <h2>Theme Customizer</h2>
                        <div class="header-actions">
                            ${this.unsavedChanges ? '<span class="unsaved-indicator">• Unsaved changes</span>' : ''}
                            <button class="gmkb-modal-close" aria-label="Close">×</button>
                        </div>
                    </div>
                    <div class="gmkb-modal-body">
                        <div class="customizer-layout">
                            <div class="customizer-sidebar">
                                <nav class="customizer-nav">
                                    <button class="nav-item active" data-panel="themes">
                                        <span class="nav-icon">🎨</span> Themes
                                    </button>
                                    <button class="nav-item" data-panel="colors">
                                        <span class="nav-icon">🎨</span> Colors
                                    </button>
                                    <button class="nav-item" data-panel="typography">
                                        <span class="nav-icon">📝</span> Typography
                                    </button>
                                    <button class="nav-item" data-panel="spacing">
                                        <span class="nav-icon">📐</span> Spacing
                                    </button>
                                    <button class="nav-item" data-panel="effects">
                                        <span class="nav-icon">✨</span> Effects
                                    </button>
                                    <button class="nav-item" data-panel="custom">
                                        <span class="nav-icon">💾</span> Save Theme
                                    </button>
                                </nav>
                            </div>
                            <div class="customizer-content">
                                ${this.getThemesPanel(themes)}
                                ${this.getColorsPanel()}
                                ${this.getTypographyPanel()}
                                ${this.getSpacingPanel()}
                                ${this.getEffectsPanel()}
                                ${this.getCustomThemePanel()}
                            </div>
                        </div>
                    </div>
                    <div class="gmkb-modal-footer">
                        <button class="btn-secondary reset-btn">Reset to Original</button>
                        <div class="footer-actions">
                            <button class="btn-secondary cancel-btn">Cancel</button>
                            <button class="btn-primary apply-btn">Apply Changes</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        getThemesPanel(themes) {
            return `
                <div class="customizer-panel" data-panel="themes">
                    <h3>Select Base Theme</h3>
                    <div class="theme-grid">
                        ${themes.map(theme => `
                            <div class="theme-option ${theme.theme_id === this.currentTheme?.theme_id ? 'active' : ''}" 
                                 data-theme-id="${theme.theme_id}">
                                <div class="theme-preview" style="background: linear-gradient(135deg, ${theme.colors?.primary || '#295cff'}, ${theme.colors?.secondary || '#1e40af'});">
                                    <div class="theme-name">${theme.theme_name}</div>
                                </div>
                                <div class="theme-meta">
                                    <small>${theme.description || 'No description'}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        getColorsPanel() {
            const colors = this.currentTheme?.colors || {};
            return `
                <div class="customizer-panel" data-panel="colors" style="display: none;">
                    <h3>Color Customization</h3>
                    
                    <div class="color-presets">
                        <h4>Quick Presets</h4>
                        <div class="preset-grid">
                            <button class="color-preset" data-preset="blue">Blue</button>
                            <button class="color-preset" data-preset="green">Green</button>
                            <button class="color-preset" data-preset="purple">Purple</button>
                            <button class="color-preset" data-preset="red">Red</button>
                            <button class="color-preset" data-preset="dark">Dark</button>
                        </div>
                    </div>
                    
                    <div class="color-controls">
                        <h4>Custom Colors</h4>
                        ${this.getColorControl('Primary Color', 'primary', colors.primary || '#295cff')}
                        ${this.getColorControl('Secondary Color', 'secondary', colors.secondary || '#1e40af')}
                        ${this.getColorControl('Background Color', 'background', colors.background || '#ffffff')}
                        ${this.getColorControl('Text Color', 'text', colors.text || '#1f2937')}
                        ${this.getColorControl('Border Color', 'border', colors.border || '#e5e7eb')}
                    </div>
                </div>
            `;
        }
        
        getColorControl(label, key, value) {
            return `
                <div class="control-group">
                    <label>
                        ${label}
                        <div class="color-input-wrapper">
                            <input type="color" class="color-picker" data-color="${key}" value="${value}">
                            <input type="text" class="color-text" data-color="${key}" value="${value}">
                        </div>
                    </label>
                </div>
            `;
        }
        
        getTypographyPanel() {
            const typography = this.currentTheme?.typography || {};
            return `
                <div class="customizer-panel" data-panel="typography" style="display: none;">
                    <h3>Typography Settings</h3>
                    
                    <div class="control-group">
                        <label>
                            Font Family
                            <select class="form-control" data-typography="fontFamily">
                                <option value="system-ui">System Default</option>
                                <option value="'Inter', sans-serif" ${typography.fontFamily?.includes('Inter') ? 'selected' : ''}>Inter</option>
                                <option value="'Roboto', sans-serif" ${typography.fontFamily?.includes('Roboto') ? 'selected' : ''}>Roboto</option>
                                <option value="'Open Sans', sans-serif" ${typography.fontFamily?.includes('Open Sans') ? 'selected' : ''}>Open Sans</option>
                                <option value="'Playfair Display', serif" ${typography.fontFamily?.includes('Playfair') ? 'selected' : ''}>Playfair Display</option>
                                <option value="'Georgia', serif" ${typography.fontFamily?.includes('Georgia') ? 'selected' : ''}>Georgia</option>
                                <option value="'Courier New', monospace" ${typography.fontFamily?.includes('Courier') ? 'selected' : ''}>Courier New</option>
                            </select>
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            Base Font Size
                            <input type="range" class="form-range" data-typography="baseFontSize" 
                                   min="12" max="20" value="${typography.baseFontSize || 16}">
                            <span class="range-value">${typography.baseFontSize || 16}px</span>
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            Heading Scale
                            <input type="range" class="form-range" data-typography="headingScale" 
                                   min="1.1" max="1.5" step="0.05" value="${typography.headingScale || 1.25}">
                            <span class="range-value">${typography.headingScale || 1.25}x</span>
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            Line Height
                            <input type="range" class="form-range" data-typography="lineHeight" 
                                   min="1.2" max="2" step="0.1" value="${typography.lineHeight || 1.6}">
                            <span class="range-value">${typography.lineHeight || 1.6}</span>
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            Font Weight
                            <select class="form-control" data-typography="fontWeight">
                                <option value="300">Light (300)</option>
                                <option value="400" ${typography.fontWeight == 400 ? 'selected' : ''}>Regular (400)</option>
                                <option value="500" ${typography.fontWeight == 500 ? 'selected' : ''}>Medium (500)</option>
                                <option value="600" ${typography.fontWeight == 600 ? 'selected' : ''}>Semi-Bold (600)</option>
                                <option value="700" ${typography.fontWeight == 700 ? 'selected' : ''}>Bold (700)</option>
                            </select>
                        </label>
                    </div>
                </div>
            `;
        }
        
        getSpacingPanel() {
            const spacing = this.currentTheme?.spacing || {};
            return `
                <div class="customizer-panel" data-panel="spacing" style="display: none;">
                    <h3>Spacing & Layout</h3>
                    
                    <div class="control-group">
                        <label>
                            Base Unit
                            <input type="range" class="form-range" data-spacing="baseUnit" 
                                   min="4" max="12" value="${spacing.baseUnit || 8}">
                            <span class="range-value">${spacing.baseUnit || 8}px</span>
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            Component Gap
                            <input type="range" class="form-range" data-spacing="componentGap" 
                                   min="8" max="48" step="4" value="${spacing.componentGap || 24}">
                            <span class="range-value">${spacing.componentGap || 24}px</span>
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            Section Padding
                            <input type="range" class="form-range" data-spacing="sectionPadding" 
                                   min="16" max="80" step="4" value="${spacing.sectionPadding || 40}">
                            <span class="range-value">${spacing.sectionPadding || 40}px</span>
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            Container Max Width
                            <input type="range" class="form-range" data-spacing="containerMaxWidth" 
                                   min="960" max="1440" step="40" value="${spacing.containerMaxWidth || 1200}">
                            <span class="range-value">${spacing.containerMaxWidth || 1200}px</span>
                        </label>
                    </div>
                </div>
            `;
        }
        
        getEffectsPanel() {
            const effects = this.currentTheme?.effects || {};
            return `
                <div class="customizer-panel" data-panel="effects" style="display: none;">
                    <h3>Visual Effects</h3>
                    
                    <div class="control-group">
                        <label>
                            Border Radius
                            <select class="form-control" data-effects="borderRadius">
                                <option value="0">None</option>
                                <option value="4px" ${effects.borderRadius === '4px' ? 'selected' : ''}>Small (4px)</option>
                                <option value="8px" ${effects.borderRadius === '8px' ? 'selected' : ''}>Medium (8px)</option>
                                <option value="12px" ${effects.borderRadius === '12px' ? 'selected' : ''}>Large (12px)</option>
                                <option value="16px" ${effects.borderRadius === '16px' ? 'selected' : ''}>Extra Large (16px)</option>
                            </select>
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            Shadow Intensity
                            <select class="form-control" data-effects="shadowIntensity">
                                <option value="none">None</option>
                                <option value="subtle" ${effects.shadowIntensity === 'subtle' ? 'selected' : ''}>Subtle</option>
                                <option value="medium" ${effects.shadowIntensity === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="strong" ${effects.shadowIntensity === 'strong' ? 'selected' : ''}>Strong</option>
                            </select>
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            Animation Speed
                            <select class="form-control" data-effects="animationSpeed">
                                <option value="0">No animations</option>
                                <option value="fast" ${effects.animationSpeed === 'fast' ? 'selected' : ''}>Fast (150ms)</option>
                                <option value="normal" ${effects.animationSpeed === 'normal' ? 'selected' : ''}>Normal (300ms)</option>
                                <option value="slow" ${effects.animationSpeed === 'slow' ? 'selected' : ''}>Slow (500ms)</option>
                            </select>
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            <input type="checkbox" data-effects="gradients" ${effects.gradients ? 'checked' : ''}>
                            Use gradient backgrounds
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            <input type="checkbox" data-effects="blurEffects" ${effects.blurEffects ? 'checked' : ''}>
                            Enable blur effects
                        </label>
                    </div>
                </div>
            `;
        }
        
        getCustomThemePanel() {
            return `
                <div class="customizer-panel" data-panel="custom" style="display: none;">
                    <h3>Save Custom Theme</h3>
                    
                    <div class="save-options">
                        <div class="control-group">
                            <label>
                                Theme Name
                                <input type="text" class="form-control" id="custom-theme-name" 
                                       placeholder="My Custom Theme" value="">
                            </label>
                        </div>
                        
                        <div class="control-group">
                            <label>
                                Description
                                <textarea class="form-control" id="custom-theme-description" 
                                          placeholder="Describe your theme..." rows="3"></textarea>
                            </label>
                        </div>
                        
                        <div class="control-group">
                            <label>
                                Save As
                                <select class="form-control" id="save-type">
                                    <option value="new">New Theme</option>
                                    <option value="variant">Variant of ${this.currentTheme?.theme_name || 'Current Theme'}</option>
                                    <option value="override">Override Current Theme</option>
                                </select>
                            </label>
                        </div>
                        
                        <div class="button-group">
                            <button class="btn-primary save-theme-btn">Save Theme</button>
                            <button class="btn-secondary export-theme-btn">Export as JSON</button>
                        </div>
                    </div>
                    
                    <div class="import-section">
                        <h4>Import Theme</h4>
                        <div class="control-group">
                            <label>
                                Import from JSON
                                <input type="file" accept=".json" id="import-theme-file" class="form-control">
                            </label>
                            <button class="btn-secondary import-btn">Import Theme</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        setupAdvancedModalListeners(modal) {
            // Panel navigation
            modal.querySelectorAll('.nav-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.showPanel(btn.dataset.panel);
                });
            });
            
            // Theme selection
            modal.querySelectorAll('.theme-option').forEach(option => {
                option.addEventListener('click', () => {
                    const themeId = option.dataset.themeId;
                    this.selectTheme(themeId);
                });
            });
            
            // Color controls
            this.setupColorControls(modal);
            
            // Typography controls
            this.setupTypographyControls(modal);
            
            // Spacing controls
            this.setupSpacingControls(modal);
            
            // Effects controls
            this.setupEffectsControls(modal);
            
            // Save/Export controls
            this.setupSaveControls(modal);
            
            // Footer buttons
            modal.querySelector('.reset-btn')?.addEventListener('click', () => this.resetToOriginal());
            modal.querySelector('.apply-btn')?.addEventListener('click', () => this.applyChanges());
            modal.querySelector('.cancel-btn')?.addEventListener('click', () => this.closeModal());
            modal.querySelector('.gmkb-modal-close')?.addEventListener('click', () => this.closeModal());
            modal.querySelector('.gmkb-modal-overlay')?.addEventListener('click', () => this.closeModal());
            
            // ESC key
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
        }
        
        setupColorControls(modal) {
            // Color presets
            modal.querySelectorAll('.color-preset').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.applyColorPreset(btn.dataset.preset);
                });
            });
            
            // Color pickers
            modal.querySelectorAll('.color-picker').forEach(input => {
                input.addEventListener('input', (e) => {
                    const color = e.target.dataset.color;
                    const value = e.target.value;
                    this.updateColor(color, value);
                    
                    // Update text input
                    const textInput = modal.querySelector(`.color-text[data-color="${color}"]`);
                    if (textInput) textInput.value = value;
                });
            });
            
            // Color text inputs
            modal.querySelectorAll('.color-text').forEach(input => {
                input.addEventListener('change', (e) => {
                    const color = e.target.dataset.color;
                    const value = e.target.value;
                    this.updateColor(color, value);
                    
                    // Update color picker
                    const picker = modal.querySelector(`.color-picker[data-color="${color}"]`);
                    if (picker) picker.value = value;
                });
            });
        }
        
        setupTypographyControls(modal) {
            // Font family
            modal.querySelector('[data-typography="fontFamily"]')?.addEventListener('change', (e) => {
                this.updateTypography('fontFamily', e.target.value);
            });
            
            // Range controls
            modal.querySelectorAll('.form-range[data-typography]').forEach(input => {
                input.addEventListener('input', (e) => {
                    const prop = e.target.dataset.typography;
                    const value = e.target.value;
                    this.updateTypography(prop, value);
                    
                    // Update display
                    const display = e.target.parentElement.querySelector('.range-value');
                    if (display) {
                        display.textContent = prop === 'baseFontSize' ? `${value}px` : 
                                            prop === 'headingScale' ? `${value}x` : value;
                    }
                });
            });
            
            // Font weight
            modal.querySelector('[data-typography="fontWeight"]')?.addEventListener('change', (e) => {
                this.updateTypography('fontWeight', e.target.value);
            });
        }
        
        setupSpacingControls(modal) {
            modal.querySelectorAll('.form-range[data-spacing]').forEach(input => {
                input.addEventListener('input', (e) => {
                    const prop = e.target.dataset.spacing;
                    const value = e.target.value;
                    this.updateSpacing(prop, value);
                    
                    // Update display
                    const display = e.target.parentElement.querySelector('.range-value');
                    if (display) {
                        display.textContent = `${value}px`;
                    }
                });
            });
        }
        
        setupEffectsControls(modal) {
            // Select controls
            modal.querySelectorAll('[data-effects]').forEach(input => {
                if (input.type === 'checkbox') {
                    input.addEventListener('change', (e) => {
                        this.updateEffects(e.target.dataset.effects, e.target.checked);
                    });
                } else {
                    input.addEventListener('change', (e) => {
                        this.updateEffects(e.target.dataset.effects, e.target.value);
                    });
                }
            });
        }
        
        setupSaveControls(modal) {
            // Save theme button
            modal.querySelector('.save-theme-btn')?.addEventListener('click', () => {
                this.saveCustomTheme();
            });
            
            // Export button
            modal.querySelector('.export-theme-btn')?.addEventListener('click', () => {
                this.exportTheme();
            });
            
            // Import button
            modal.querySelector('.import-btn')?.addEventListener('click', () => {
                this.importTheme();
            });
        }
        
        showPanel(panelName) {
            const modal = document.getElementById('theme-customizer-modal');
            if (!modal) return;
            
            // Update nav
            modal.querySelectorAll('.nav-item').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.panel === panelName);
            });
            
            // Update panels
            modal.querySelectorAll('.customizer-panel').forEach(panel => {
                panel.style.display = panel.dataset.panel === panelName ? 'block' : 'none';
            });
            
            this.activePanel = panelName;
        }
        
        selectTheme(themeId) {
            const theme = this.themeManager.getTheme(themeId);
            if (!theme) return;
            
            this.currentTheme = {...theme};
            this.customizations = {};
            this.unsavedChanges = true;
            
            // Update UI
            const modal = document.getElementById('theme-customizer-modal');
            modal.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.themeId === themeId);
            });
            
            // Apply theme
            this.applyTheme(this.currentTheme);
            
            this.logger.info(`Selected theme: ${themeId}`);
        }
        
        updateColor(colorName, value) {
            if (!this.customizations.colors) {
                this.customizations.colors = {};
            }
            this.customizations.colors[colorName] = value;
            this.unsavedChanges = true;
            
            // Apply immediately for preview
            this.applyCustomizations();
        }
        
        updateTypography(prop, value) {
            if (!this.customizations.typography) {
                this.customizations.typography = {};
            }
            this.customizations.typography[prop] = value;
            this.unsavedChanges = true;
            
            this.applyCustomizations();
        }
        
        updateSpacing(prop, value) {
            if (!this.customizations.spacing) {
                this.customizations.spacing = {};
            }
            this.customizations.spacing[prop] = value;
            this.unsavedChanges = true;
            
            this.applyCustomizations();
        }
        
        updateEffects(prop, value) {
            if (!this.customizations.effects) {
                this.customizations.effects = {};
            }
            this.customizations.effects[prop] = value;
            this.unsavedChanges = true;
            
            this.applyCustomizations();
        }
        
        applyColorPreset(preset) {
            const presets = {
                blue: { primary: '#3b82f6', secondary: '#2563eb' },
                green: { primary: '#10b981', secondary: '#059669' },
                purple: { primary: '#8b5cf6', secondary: '#7c3aed' },
                red: { primary: '#ef4444', secondary: '#dc2626' },
                dark: { primary: '#1f2937', secondary: '#111827', background: '#1f2937', text: '#f9fafb' }
            };
            
            const colors = presets[preset];
            if (!colors) return;
            
            Object.keys(colors).forEach(key => {
                this.updateColor(key, colors[key]);
            });
            
            // Update UI
            const modal = document.getElementById('theme-customizer-modal');
            Object.keys(colors).forEach(key => {
                const picker = modal.querySelector(`.color-picker[data-color="${key}"]`);
                const text = modal.querySelector(`.color-text[data-color="${key}"]`);
                if (picker) picker.value = colors[key];
                if (text) text.value = colors[key];
            });
        }
        
        applyCustomizations() {
            const mergedTheme = {
                ...this.currentTheme,
                colors: { ...this.currentTheme.colors, ...this.customizations.colors },
                typography: { ...this.currentTheme.typography, ...this.customizations.typography },
                spacing: { ...this.currentTheme.spacing, ...this.customizations.spacing },
                effects: { ...this.currentTheme.effects, ...this.customizations.effects }
            };
            
            this.applyTheme(mergedTheme);
        }
        
        applyTheme(theme) {
            // Apply via theme manager
            if (this.themeManager) {
                // If it's a custom theme object, update the current theme
                if (typeof theme === 'object' && theme.theme_id) {
                    // Update the theme in theme manager
                    this.themeManager.themes.set(theme.theme_id || 'custom', theme);
                    this.themeManager.applyTheme(theme.theme_id || 'custom');
                } else if (typeof theme === 'string') {
                    // It's just a theme ID
                    this.themeManager.applyTheme(theme);
                } else {
                    console.error('Invalid theme parameter:', theme);
                }
            }
            
            // Also apply CSS variables directly for immediate preview
            const root = document.documentElement;
            if (theme.colors) {
                Object.keys(theme.colors).forEach(key => {
                    const cssKey = key.replace(/_/g, '-');
                    root.style.setProperty(`--gmkb-color-${cssKey}`, theme.colors[key]);
                });
            }
            if (theme.typography) {
                if (theme.typography.fontFamily || theme.typography.primary_font?.family) {
                    const fontFamily = theme.typography.fontFamily || theme.typography.primary_font?.family;
                    root.style.setProperty('--gmkb-font-primary', fontFamily);
                }
                if (theme.typography.heading_font?.family) {
                    root.style.setProperty('--gmkb-font-heading', theme.typography.heading_font.family);
                }
                if (theme.typography.baseFontSize) {
                    root.style.setProperty('--gmkb-font-size-base', `${theme.typography.baseFontSize}px`);
                }
                if (theme.typography.lineHeight || theme.typography.line_height?.body) {
                    const lineHeight = theme.typography.lineHeight || theme.typography.line_height?.body;
                    root.style.setProperty('--gmkb-line-height-body', lineHeight);
                }
            }
            if (theme.spacing) {
                if (theme.spacing.baseUnit || theme.spacing.base_unit) {
                    const baseUnit = theme.spacing.baseUnit || theme.spacing.base_unit;
                    const unitValue = typeof baseUnit === 'string' ? baseUnit : `${baseUnit}px`;
                    root.style.setProperty('--gmkb-spacing-base-unit', unitValue);
                }
                if (theme.spacing.component_gap) {
                    root.style.setProperty('--gmkb-spacing-component-gap', theme.spacing.component_gap);
                }
                if (theme.spacing.section_gap) {
                    root.style.setProperty('--gmkb-spacing-section-gap', theme.spacing.section_gap);
                }
            }
            if (theme.effects) {
                if (theme.effects.border_radius) {
                    root.style.setProperty('--gmkb-border-radius', theme.effects.border_radius);
                }
                if (theme.effects.shadow) {
                    root.style.setProperty('--gmkb-shadow', theme.effects.shadow);
                }
                if (theme.effects.transitions) {
                    root.style.setProperty('--gmkb-transitions', theme.effects.transitions);
                }
            }
        }
        
        resetToOriginal() {
            this.currentTheme = {...this.originalTheme};
            this.customizations = {};
            this.unsavedChanges = false;
            
            this.applyTheme(this.originalTheme);
            
            // Refresh modal
            this.closeModal();
            this.openAdvancedModal();
        }
        
        applyChanges() {
            const mergedTheme = {
                ...this.currentTheme,
                colors: { ...this.currentTheme.colors, ...this.customizations.colors },
                typography: { ...this.currentTheme.typography, ...this.customizations.typography },
                spacing: { ...this.currentTheme.spacing, ...this.customizations.spacing },
                effects: { ...this.currentTheme.effects, ...this.customizations.effects }
            };
            
            // Save to theme manager
            if (this.themeManager) {
                this.themeManager.applyTheme(mergedTheme.theme_id || 'custom', mergedTheme);
                this.themeManager.saveThemeToDatabase(mergedTheme);
            }
            
            this.unsavedChanges = false;
            this.showSuccess('Theme changes applied successfully!');
            this.closeModal();
        }
        
        saveCustomTheme() {
            const modal = document.getElementById('theme-customizer-modal');
            const name = modal.querySelector('#custom-theme-name').value || 'Custom Theme';
            const description = modal.querySelector('#custom-theme-description').value || '';
            const saveType = modal.querySelector('#save-type').value;
            
            const customTheme = {
                theme_id: `custom_${Date.now()}`,
                theme_name: name,
                description: description,
                version: '1.0.0',
                parent: saveType === 'variant' ? this.currentTheme.theme_id : null,
                ...this.currentTheme,
                colors: { ...this.currentTheme.colors, ...this.customizations.colors },
                typography: { ...this.currentTheme.typography, ...this.customizations.typography },
                spacing: { ...this.currentTheme.spacing, ...this.customizations.spacing },
                effects: { ...this.currentTheme.effects, ...this.customizations.effects }
            };
            
            // Save via AJAX
            this.saveThemeToServer(customTheme);
        }
        
        saveThemeToServer(theme) {
            if (!window.gmkbData?.ajaxUrl) {
                this.showError('Cannot save theme - AJAX not configured');
                return;
            }
            
            const formData = new FormData();
            formData.append('action', 'gmkb_save_custom_theme');
            formData.append('nonce', window.gmkbData.nonce);
            formData.append('theme', JSON.stringify(theme));
            
            fetch(window.gmkbData.ajaxUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showSuccess('Custom theme saved successfully!');
                    
                    // Add to theme manager
                    if (this.themeManager) {
                        this.themeManager.addTheme(theme);
                    }
                    
                    // Refresh modal
                    this.closeModal();
                    this.openAdvancedModal();
                } else {
                    this.showError('Failed to save theme: ' + (data.message || 'Unknown error'));
                }
            })
            .catch(error => {
                this.logger.error('Save theme error:', error);
                this.showError('Failed to save theme');
            });
        }
        
        exportTheme() {
            const theme = {
                ...this.currentTheme,
                colors: { ...this.currentTheme.colors, ...this.customizations.colors },
                typography: { ...this.currentTheme.typography, ...this.customizations.typography },
                spacing: { ...this.currentTheme.spacing, ...this.customizations.spacing },
                effects: { ...this.currentTheme.effects, ...this.customizations.effects }
            };
            
            const json = JSON.stringify(theme, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `theme-${theme.theme_name || 'custom'}-${Date.now()}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            this.showSuccess('Theme exported successfully!');
        }
        
        importTheme() {
            const fileInput = document.getElementById('import-theme-file');
            const file = fileInput?.files[0];
            
            if (!file) {
                this.showError('Please select a theme file to import');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const theme = JSON.parse(e.target.result);
                    
                    // Validate theme structure
                    if (!theme.theme_name || !theme.colors) {
                        throw new Error('Invalid theme file');
                    }
                    
                    // Apply imported theme
                    this.currentTheme = theme;
                    this.customizations = {};
                    this.applyTheme(theme);
                    
                    // Refresh modal
                    this.closeModal();
                    this.openAdvancedModal();
                    
                    this.showSuccess('Theme imported successfully!');
                } catch (error) {
                    this.logger.error('Import error:', error);
                    this.showError('Failed to import theme: Invalid file format');
                }
            };
            
            reader.readAsText(file);
        }
        
        closeModal() {
            const modal = document.getElementById('theme-customizer-modal');
            if (!modal) return;
            
            if (this.unsavedChanges) {
                if (!confirm('You have unsaved changes. Close without saving?')) {
                    return;
                }
            }
            
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
            
            // Reset to original if changes weren't saved
            if (this.unsavedChanges) {
                this.applyTheme(this.originalTheme);
            }
        }
        
        injectAdvancedStyles() {
            if (document.getElementById('theme-customizer-advanced-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'theme-customizer-advanced-styles';
            styles.textContent = this.getAdvancedStyles();
            document.head.appendChild(styles);
            
            // Also inject base styles if needed
            if (!document.getElementById('theme-customizer-styles')) {
                this.injectStyles();
            }
        }
        
        getAdvancedStyles() {
            return `
                .theme-customizer-modal.advanced .gmkb-modal-content {
                    max-width: 900px;
                    width: 95%;
                    height: 85vh;
                }
                
                .customizer-layout {
                    display: flex;
                    height: 100%;
                }
                
                .customizer-sidebar {
                    width: 200px;
                    background: #f9fafb;
                    border-right: 1px solid #e5e7eb;
                    padding: 20px 0;
                    flex-shrink: 0;
                }
                
                .customizer-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 20px;
                    background: none;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                    color: #374151;
                }
                
                .nav-item:hover {
                    background: #e5e7eb;
                }
                
                .nav-item.active {
                    background: white;
                    font-weight: 600;
                    border-left: 3px solid #3b82f6;
                    color: #1f2937;
                }
                
                .nav-icon {
                    font-size: 16px;
                }
                
                .customizer-content {
                    flex: 1;
                    padding: 30px;
                    overflow-y: auto;
                }
                
                .customizer-panel h3 {
                    margin: 0 0 20px 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #1f2937;
                }
                
                .customizer-panel h4 {
                    margin: 20px 0 15px 0;
                    font-size: 14px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: #6b7280;
                }
                
                .control-group {
                    margin-bottom: 20px;
                }
                
                .control-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: #374151;
                }
                
                .form-control {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    background: white;
                }
                
                .form-range {
                    width: 100%;
                    margin: 10px 0;
                }
                
                .range-value {
                    float: right;
                    font-size: 13px;
                    color: #6b7280;
                    font-weight: 600;
                }
                
                .color-input-wrapper {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                .color-picker {
                    width: 50px;
                    height: 36px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    cursor: pointer;
                    padding: 2px;
                }
                
                .color-text {
                    flex: 1;
                    font-family: monospace;
                    background: white;
                }
                
                .preset-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                    gap: 10px;
                }
                
                .color-preset {
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    background: white;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                    color: #374151;
                }
                
                .color-preset:hover {
                    background: #f3f4f6;
                    border-color: #9ca3af;
                }
                
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .unsaved-indicator {
                    color: #f59e0b;
                    font-size: 13px;
                    font-weight: 500;
                }
                
                .footer-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .btn-primary, .btn-secondary {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }
                
                .btn-primary:hover {
                    background: #2563eb;
                }
                
                .btn-secondary {
                    background: #6b7280;
                    color: white;
                }
                
                .btn-secondary:hover {
                    background: #4b5563;
                }
                
                .button-group {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
                
                .import-section {
                    margin-top: 40px;
                    padding-top: 40px;
                    border-top: 1px solid #e5e7eb;
                }
                
                .theme-meta {
                    padding: 8px;
                    font-size: 12px;
                    color: #6b7280;
                    text-align: center;
                    background: #f9fafb;
                }
                
                .save-options {
                    background: #f9fafb;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
            `;
        }
        
        injectStyles() {
            if (document.getElementById('theme-customizer-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'theme-customizer-styles';
            styles.textContent = `
                .theme-customizer-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 100000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s, visibility 0.3s;
                }
                
                .theme-customizer-modal.show {
                    opacity: 1;
                    visibility: visible;
                }
                
                .theme-customizer-modal .gmkb-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(2px);
                }
                
                .theme-customizer-modal .gmkb-modal-content {
                    position: relative;
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                
                .theme-customizer-modal .gmkb-modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }
                
                .theme-customizer-modal .gmkb-modal-header h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #1f2937;
                }
                
                .theme-customizer-modal .gmkb-modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #6b7280;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .theme-customizer-modal .gmkb-modal-close:hover {
                    color: #374151;
                }
                
                .theme-customizer-modal .gmkb-modal-body {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                }
                
                .theme-customizer-modal .gmkb-modal-footer {
                    padding: 15px 20px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                    background: #f9fafb;
                }
                
                .theme-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .theme-option {
                    cursor: pointer;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .theme-option:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .theme-option.active {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .theme-preview {
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    text-align: center;
                    padding: 10px;
                    position: relative;
                }
                
                .theme-name {
                    color: white;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                }
            `;
            
            document.head.appendChild(styles);
        }
        
        showError(message) {
            if (window.showToast) {
                window.showToast(message, 'error', 3000);
            } else {
                alert(message);
            }
        }
        
        showSuccess(message) {
            if (window.showToast) {
                window.showToast(message, 'success', 2000);
            }
        }
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.themeCustomizer = new ThemeCustomizer();
        });
    } else {
        window.themeCustomizer = new ThemeCustomizer();
    }
})();