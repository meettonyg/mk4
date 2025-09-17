/**
 * Theme Customizer UI
 * Phase 4: Interactive theme customization interface
 * 
 * ROOT CAUSE FIX: Direct theme manipulation without complex state management
 * Event-driven updates with real-time preview
 * 
 * @version 4.0.0-phase4
 * @package GMKB/UI
 */

(function() {
    'use strict';
    
    class ThemeCustomizer {
        constructor() {
            this.themeManager = null;
            this.customizer = null;
            this.currentTheme = null;
            this.isDirty = false;
            this.logger = window.StructuredLogger || console;
            
            // ROOT CAUSE FIX: Wait for theme manager using event
            if (window.themeManager) {
                this.init();
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    this.waitForThemeManager();
                });
            }
        }
        
        /**
         * Wait for theme manager to be available
         * Following checklist: Event-Driven Initialization, No Polling
         */
        waitForThemeManager() {
            if (window.themeManager) {
                this.init();
            } else {
                // Listen for theme manager ready event
                document.addEventListener('gmkb:theme-applied', () => {
                    if (window.themeManager && !this.themeManager) {
                        this.init();
                    }
                });
            }
        }
        
        /**
         * Initialize the theme customizer
         */
        init() {
            this.themeManager = window.themeManager;
            this.logger.info('🎨 Phase 4: Theme Customizer initializing');
            
            // Create customizer UI
            this.createCustomizerUI();
            
            // Listen for theme changes
            this.attachEventListeners();
            
            // Load current theme
            this.loadCurrentTheme();
            
            this.logger.info('✅ Phase 4: Theme Customizer initialized');
        }
        
        /**
         * Create customizer UI elements
         * Following checklist: Simplicity First, No Redundant Logic
         */
        createCustomizerUI() {
            // Add theme switcher to toolbar
            this.createThemeSwitcher();
            
            // Create customizer panel
            this.createCustomizerPanel();
        }
        
        /**
         * Create theme switcher in toolbar
         */
        createThemeSwitcher() {
            // ROOT FIX: Try multiple toolbar selectors
            let toolbar = document.querySelector('.gmkb-toolbar-actions') || 
                         document.querySelector('.toolbar') || 
                         document.querySelector('#gmkb-toolbar') ||
                         document.querySelector('[data-toolbar]');
            
            if (!toolbar) {
                // Try to find save button and use its parent
                const saveBtn = document.querySelector('#save-btn, .save-btn, [data-action="save"]');
                if (saveBtn) {
                    toolbar = saveBtn.parentElement;
                }
            }
            
            if (!toolbar) {
                this.logger.warn('Toolbar not found for theme switcher - will retry');
                // Retry after a delay
                setTimeout(() => this.createThemeSwitcher(), 1000);
                return;
            }
            
            // Check if theme switcher already exists
            if (toolbar.querySelector('.gmkb-theme-switcher')) {
                return;
            }
            
            const themeSwitcher = document.createElement('div');
            themeSwitcher.className = 'gmkb-theme-switcher';
            themeSwitcher.innerHTML = `
                <button class="gmkb-theme-button" title="Change Theme">
                    <span class="gmkb-icon">🎨</span>
                    <span class="gmkb-theme-name">Theme</span>
                    <span class="gmkb-dropdown-arrow">▼</span>
                </button>
                <div class="gmkb-theme-dropdown" style="display: none;">
                    <div class="gmkb-theme-list">
                        <h4>Built-in Themes</h4>
                        <div class="gmkb-themes-grid"></div>
                    </div>
                    <div class="gmkb-theme-actions">
                        <button class="gmkb-customize-theme">Customize Theme</button>
                        <button class="gmkb-import-theme">Import Theme</button>
                    </div>
                </div>
            `;
            
            // Insert before the save button
            const saveButton = toolbar.querySelector('.gmkb-save-button');
            if (saveButton) {
                toolbar.insertBefore(themeSwitcher, saveButton);
            } else {
                toolbar.appendChild(themeSwitcher);
            }
            
            // Populate themes
            this.populateThemeList();
        }
        
        /**
         * Populate theme list in dropdown
         */
        populateThemeList() {
            const themeGrid = document.querySelector('.gmkb-themes-grid');
            if (!themeGrid || !this.themeManager) return;
            
            const themes = this.themeManager.getAvailableThemes();
            
            themeGrid.innerHTML = themes.map(theme => `
                <div class="gmkb-theme-option" data-theme-id="${theme.theme_id}">
                    <div class="gmkb-theme-preview">
                        <div class="gmkb-theme-colors">
                            <span style="background: ${theme.colors.primary}"></span>
                            <span style="background: ${theme.colors.secondary}"></span>
                            <span style="background: ${theme.colors.accent}"></span>
                            <span style="background: ${theme.colors.background}"></span>
                        </div>
                    </div>
                    <div class="gmkb-theme-info">
                        <h5>${theme.theme_name}</h5>
                        ${theme.theme_id === this.themeManager.getCurrentTheme()?.theme_id ? '<span class="gmkb-active-indicator">Active</span>' : ''}
                    </div>
                </div>
            `).join('');
        }
        
        /**
         * Create customizer panel
         */
        createCustomizerPanel() {
            // Check if panel already exists
            if (document.getElementById('gmkb-theme-customizer')) {
                return;
            }
            
            const panel = document.createElement('div');
            panel.id = 'gmkb-theme-customizer';
            panel.className = 'gmkb-theme-customizer-panel';
            panel.style.display = 'none';
            
            panel.innerHTML = `
                <div class="gmkb-customizer-header">
                    <h3>Customize Theme</h3>
                    <button class="gmkb-close-customizer">✕</button>
                </div>
                <div class="gmkb-customizer-body">
                    <div class="gmkb-customizer-section">
                        <h4>Typography</h4>
                        <div class="gmkb-control-group">
                            <label>Primary Font</label>
                            <input type="text" class="gmkb-font-primary" data-property="typography.primary_font.family" />
                        </div>
                        <div class="gmkb-control-group">
                            <label>Heading Font</label>
                            <input type="text" class="gmkb-font-heading" data-property="typography.heading_font.family" />
                        </div>
                        <div class="gmkb-control-group">
                            <label>Font Scale</label>
                            <input type="range" class="gmkb-font-scale" data-property="typography.font_scale" 
                                min="0.8" max="1.5" step="0.05" />
                            <span class="gmkb-range-value">1.2</span>
                        </div>
                    </div>
                    
                    <div class="gmkb-customizer-section">
                        <h4>Colors</h4>
                        <div class="gmkb-color-grid">
                            <div class="gmkb-control-group">
                                <label>Primary</label>
                                <input type="color" class="gmkb-color-input" data-property="colors.primary" />
                            </div>
                            <div class="gmkb-control-group">
                                <label>Secondary</label>
                                <input type="color" class="gmkb-color-input" data-property="colors.secondary" />
                            </div>
                            <div class="gmkb-control-group">
                                <label>Accent</label>
                                <input type="color" class="gmkb-color-input" data-property="colors.accent" />
                            </div>
                            <div class="gmkb-control-group">
                                <label>Text</label>
                                <input type="color" class="gmkb-color-input" data-property="colors.text" />
                            </div>
                            <div class="gmkb-control-group">
                                <label>Background</label>
                                <input type="color" class="gmkb-color-input" data-property="colors.background" />
                            </div>
                            <div class="gmkb-control-group">
                                <label>Surface</label>
                                <input type="color" class="gmkb-color-input" data-property="colors.surface" />
                            </div>
                        </div>
                    </div>
                    
                    <div class="gmkb-customizer-section">
                        <h4>Spacing</h4>
                        <div class="gmkb-control-group">
                            <label>Component Gap</label>
                            <input type="range" class="gmkb-spacing-input" data-property="spacing.component_gap" 
                                min="16" max="80" step="8" />
                            <span class="gmkb-range-value">40px</span>
                        </div>
                        <div class="gmkb-control-group">
                            <label>Section Gap</label>
                            <input type="range" class="gmkb-spacing-input" data-property="spacing.section_gap" 
                                min="32" max="160" step="16" />
                            <span class="gmkb-range-value">80px</span>
                        </div>
                    </div>
                    
                    <div class="gmkb-customizer-section">
                        <h4>Effects</h4>
                        <div class="gmkb-control-group">
                            <label>Border Radius</label>
                            <input type="range" class="gmkb-effect-input" data-property="effects.border_radius" 
                                min="0" max="32" step="4" />
                            <span class="gmkb-range-value">8px</span>
                        </div>
                    </div>
                </div>
                <div class="gmkb-customizer-footer">
                    <button class="gmkb-reset-theme">Reset to Default</button>
                    <div class="gmkb-customizer-actions">
                        <button class="gmkb-cancel-customization">Cancel</button>
                        <button class="gmkb-save-custom-theme">Save as Custom Theme</button>
                        <button class="gmkb-apply-changes" disabled>Apply Changes</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(panel);
            
            // Add customizer styles
            this.addCustomizerStyles();
        }
        
        /**
         * Add customizer styles
         */
        addCustomizerStyles() {
            if (document.getElementById('gmkb-theme-customizer-styles')) {
                return;
            }
            
            const styles = document.createElement('style');
            styles.id = 'gmkb-theme-customizer-styles';
            styles.textContent = `
                /* Theme Switcher */
                .gmkb-theme-switcher {
                    position: relative;
                    margin-right: 16px;
                }
                
                .gmkb-theme-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: var(--gmkb-color-surface, #f3f4f6);
                    border: 1px solid var(--gmkb-color-border, #e5e7eb);
                    border-radius: var(--gmkb-border-radius, 8px);
                    cursor: pointer;
                    transition: var(--gmkb-transitions, all 0.3s ease);
                }
                
                .gmkb-theme-button:hover {
                    background: var(--gmkb-color-surface-hover, #e5e7eb);
                }
                
                .gmkb-theme-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    width: 320px;
                    background: var(--gmkb-color-background, white);
                    border: 1px solid var(--gmkb-color-border, #e5e7eb);
                    border-radius: var(--gmkb-border-radius, 8px);
                    box-shadow: var(--gmkb-shadow-lg, 0 10px 40px rgba(0,0,0,0.1));
                    z-index: 1000;
                }
                
                .gmkb-theme-list {
                    padding: 16px;
                }
                
                .gmkb-themes-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-top: 12px;
                }
                
                .gmkb-theme-option {
                    border: 2px solid transparent;
                    border-radius: 8px;
                    padding: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .gmkb-theme-option:hover {
                    border-color: var(--gmkb-color-primary, #295cff);
                    background: var(--gmkb-color-surface, #f9fafb);
                }
                
                .gmkb-theme-colors {
                    display: flex;
                    height: 32px;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .gmkb-theme-colors span {
                    flex: 1;
                }
                
                .gmkb-theme-info {
                    margin-top: 8px;
                    text-align: center;
                }
                
                .gmkb-theme-info h5 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 600;
                }
                
                .gmkb-active-indicator {
                    display: inline-block;
                    padding: 2px 8px;
                    background: var(--gmkb-color-success, #10b981);
                    color: white;
                    font-size: 11px;
                    border-radius: 4px;
                    margin-top: 4px;
                }
                
                .gmkb-theme-actions {
                    border-top: 1px solid var(--gmkb-color-border, #e5e7eb);
                    padding: 12px 16px;
                    display: flex;
                    gap: 8px;
                }
                
                .gmkb-theme-actions button {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid var(--gmkb-color-border, #e5e7eb);
                    background: white;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .gmkb-theme-actions button:hover {
                    background: var(--gmkb-color-surface, #f9fafb);
                }
                
                /* Customizer Panel */
                .gmkb-theme-customizer-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 600px;
                    max-width: 90vw;
                    max-height: 90vh;
                    background: var(--gmkb-color-background, white);
                    border: 1px solid var(--gmkb-color-border, #e5e7eb);
                    border-radius: var(--gmkb-border-radius-lg, 16px);
                    box-shadow: var(--gmkb-shadow-lg, 0 20px 60px rgba(0,0,0,0.15));
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                }
                
                .gmkb-customizer-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--gmkb-color-border, #e5e7eb);
                }
                
                .gmkb-customizer-header h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                }
                
                .gmkb-close-customizer {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: none;
                    font-size: 20px;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s ease;
                }
                
                .gmkb-close-customizer:hover {
                    opacity: 1;
                }
                
                .gmkb-customizer-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }
                
                .gmkb-customizer-section {
                    margin-bottom: 32px;
                }
                
                .gmkb-customizer-section h4 {
                    margin: 0 0 16px;
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .gmkb-control-group {
                    margin-bottom: 16px;
                }
                
                .gmkb-control-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--gmkb-color-text-light, #666);
                }
                
                .gmkb-control-group input[type="text"],
                .gmkb-control-group input[type="color"] {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--gmkb-color-border, #e5e7eb);
                    border-radius: 6px;
                    font-size: 14px;
                }
                
                .gmkb-control-group input[type="range"] {
                    width: calc(100% - 60px);
                    margin-right: 12px;
                }
                
                .gmkb-range-value {
                    display: inline-block;
                    width: 48px;
                    font-size: 14px;
                    color: var(--gmkb-color-text-light, #666);
                }
                
                .gmkb-color-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }
                
                .gmkb-color-grid .gmkb-control-group {
                    margin-bottom: 0;
                }
                
                .gmkb-color-input {
                    width: 100%;
                    height: 40px;
                    border: 2px solid var(--gmkb-color-border, #e5e7eb);
                    border-radius: 6px;
                    cursor: pointer;
                }
                
                .gmkb-customizer-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-top: 1px solid var(--gmkb-color-border, #e5e7eb);
                }
                
                .gmkb-customizer-actions {
                    display: flex;
                    gap: 12px;
                }
                
                .gmkb-customizer-footer button {
                    padding: 8px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .gmkb-reset-theme {
                    background: none;
                    color: var(--gmkb-color-text-light, #666);
                    border: 1px solid var(--gmkb-color-border, #e5e7eb);
                }
                
                .gmkb-cancel-customization {
                    background: var(--gmkb-color-surface, #f3f4f6);
                    color: var(--gmkb-color-text, #333);
                }
                
                .gmkb-save-custom-theme {
                    background: var(--gmkb-color-secondary, #1c0d5a);
                    color: white;
                }
                
                .gmkb-apply-changes {
                    background: var(--gmkb-color-primary, #295cff);
                    color: white;
                }
                
                .gmkb-apply-changes:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                /* Modal Backdrop */
                .gmkb-customizer-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    cursor: pointer;
                }
                
                /* Ensure no body scroll when customizer is open */
                body.customizer-open {
                    overflow: hidden;
                }
            `;
            
            document.head.appendChild(styles);
        }
        
        /**
         * Attach event listeners
         * Following checklist: Event-Driven, Root Cause Fix
         */
        attachEventListeners() {
            // Theme switcher toggle
            document.addEventListener('click', (e) => {
                const themeButton = e.target.closest('.gmkb-theme-button');
                if (themeButton) {
                    this.toggleThemeDropdown();
                }
                
                // Theme selection
                const themeOption = e.target.closest('.gmkb-theme-option');
                if (themeOption) {
                    const themeId = themeOption.dataset.themeId;
                    this.selectTheme(themeId);
                }
                
                // Customize theme button
                const customizeBtn = e.target.closest('.gmkb-customize-theme');
                if (customizeBtn) {
                    this.openCustomizer();
                }
                
                // Import theme button
                const importBtn = e.target.closest('.gmkb-import-theme');
                if (importBtn) {
                    this.importTheme();
                }
                
                // Close customizer
                const closeBtn = e.target.closest('.gmkb-close-customizer');
                if (closeBtn) {
                    this.closeCustomizer();
                }
                
                // Apply changes
                const applyBtn = e.target.closest('.gmkb-apply-changes');
                if (applyBtn && !applyBtn.disabled) {
                    this.applyChanges();
                }
                
                // Save custom theme
                const saveBtn = e.target.closest('.gmkb-save-custom-theme');
                if (saveBtn) {
                    this.saveCustomTheme();
                }
                
                // Reset theme
                const resetBtn = e.target.closest('.gmkb-reset-theme');
                if (resetBtn) {
                    this.resetTheme();
                }
                
                // Cancel customization
                const cancelBtn = e.target.closest('.gmkb-cancel-customization');
                if (cancelBtn) {
                    this.closeCustomizer();
                }
                
                // Close dropdown when clicking outside
                const dropdown = document.querySelector('.gmkb-theme-dropdown');
                if (dropdown && dropdown.style.display !== 'none' && 
                    !e.target.closest('.gmkb-theme-switcher')) {
                    dropdown.style.display = 'none';
                }
            });
            
            // Customizer controls
            document.addEventListener('input', (e) => {
                if (e.target.matches('.gmkb-customizer-panel input')) {
                    this.onCustomizerInput(e.target);
                }
            });
            
            // Listen for theme changes from theme manager
            document.addEventListener('gmkb:theme-applied', (e) => {
                this.onThemeApplied(e.detail);
            });
        }
        
        /**
         * Toggle theme dropdown
         */
        toggleThemeDropdown() {
            const dropdown = document.querySelector('.gmkb-theme-dropdown');
            if (!dropdown) return;
            
            const isOpen = dropdown.style.display !== 'none';
            dropdown.style.display = isOpen ? 'none' : 'block';
            
            if (!isOpen) {
                // Update theme list when opening
                this.populateThemeList();
            }
        }
        
        /**
         * Select a theme
         */
        selectTheme(themeId) {
            // Dispatch theme change request
            document.dispatchEvent(new CustomEvent('gmkb:theme-change-requested', {
                detail: { themeId }
            }));
            
            // Close dropdown
            const dropdown = document.querySelector('.gmkb-theme-dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }
        
        /**
        * Open customizer
        */
        open() {
        this.openCustomizer();
        }
        
        /**
        * Internal method to open customizer
        */
        openCustomizer() {
        const panel = document.getElementById('gmkb-theme-customizer');
        if (!panel) return;
        
        // Check if already open
        if (panel.style.display === 'flex') {
            return;
        }
        
        // Remove any existing backdrops first (cleanup)
        const existingBackdrops = document.querySelectorAll('.gmkb-customizer-backdrop');
        existingBackdrops.forEach(backdrop => backdrop.remove());
        
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'gmkb-customizer-backdrop';
        document.body.appendChild(backdrop);
        
        // Add click handler to backdrop to close customizer
        backdrop.addEventListener('click', () => {
            this.closeCustomizer();
        });
        
        // Show panel
            panel.style.display = 'flex';
        
        // Ensure panel is above backdrop
        panel.style.zIndex = '10001';
        backdrop.style.zIndex = '10000';
        
        // Load current theme values
        this.loadCurrentTheme();
        
        // Close dropdown
        const dropdown = document.querySelector('.gmkb-theme-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
        
        // Reset dirty state
        this.isDirty = false;
        this.updateApplyButton();
    }
        
        /**
        * Close customizer
        */
        closeCustomizer() {
        const panel = document.getElementById('gmkb-theme-customizer');
        if (!panel) return;
        
        // Check if there are unsaved changes
        if (this.isDirty) {
        if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
        }
        }
        
        // Hide panel
        panel.style.display = 'none';
        
        // Remove ALL backdrops (in case there are multiple)
        const backdrops = document.querySelectorAll('.gmkb-customizer-backdrop');
        backdrops.forEach(backdrop => {
        backdrop.remove();
        });
        
        // Also remove any lingering modal backdrops
        const modalBackdrops = document.querySelectorAll('.modal-backdrop, .gmkb-modal-backdrop');
        modalBackdrops.forEach(backdrop => {
        backdrop.remove();
        });
        
        // Ensure body is not locked
            document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.classList.remove('modal-open', 'customizer-open');
        
        // Reset to current theme if there were changes
        if (this.isDirty && this.themeManager) {
            const currentThemeId = this.themeManager.getCurrentTheme()?.theme_id;
            if (currentThemeId) {
                this.themeManager.applyTheme(currentThemeId);
            }
        }
        
        // Reset dirty state
        this.isDirty = false;
        this.updateApplyButton();
    }
        
        /**
         * Load current theme values into customizer
         */
        loadCurrentTheme() {
            if (!this.themeManager) return;
            
            const theme = this.themeManager.getCurrentTheme();
            if (!theme) return;
            
            this.currentTheme = theme;
            
            // Update all inputs with current values
            const inputs = document.querySelectorAll('.gmkb-customizer-panel input[data-property]');
            inputs.forEach(input => {
                const property = input.dataset.property;
                const value = this.getNestedProperty(theme, property);
                
                if (value !== undefined) {
                    input.value = value;
                    
                    // Update range value display
                    if (input.type === 'range') {
                        const valueDisplay = input.nextElementSibling;
                        if (valueDisplay && valueDisplay.classList.contains('gmkb-range-value')) {
                            valueDisplay.textContent = typeof value === 'number' ? value : value + 'px';
                        }
                    }
                }
            });
        }
        
        /**
         * Handle customizer input changes
         */
        onCustomizerInput(input) {
            const property = input.dataset.property;
            if (!property) return;
            
            const value = input.value;
            
            // Update range value display
            if (input.type === 'range') {
                const valueDisplay = input.nextElementSibling;
                if (valueDisplay && valueDisplay.classList.contains('gmkb-range-value')) {
                    valueDisplay.textContent = value + (property.includes('scale') ? '' : 'px');
                }
            }
            
            // Apply change immediately for preview
            if (this.themeManager) {
                this.themeManager.updateThemeProperty(property, value);
            }
            
            // Mark as dirty
            this.isDirty = true;
            this.updateApplyButton();
        }
        
        /**
         * Update apply button state
         */
        updateApplyButton() {
            const applyBtn = document.querySelector('.gmkb-apply-changes');
            if (applyBtn) {
                applyBtn.disabled = !this.isDirty;
            }
        }
        
        /**
         * Apply changes
         */
        applyChanges() {
            if (!this.themeManager || !this.isDirty) return;
            
            // The changes are already applied via live preview
            // Just reset the dirty state
            this.isDirty = false;
            this.updateApplyButton();
            
            // Save to database
            this.themeManager.saveThemePreference(this.themeManager.getCurrentTheme().theme_id);
            
            // Show success message
            if (window.showToast) {
                window.showToast('Theme changes applied successfully', 'success');
            }
        }
        
        /**
         * Save as custom theme
         */
        saveCustomTheme() {
            if (!this.themeManager) return;
            
            const themeName = prompt('Enter a name for your custom theme:');
            if (!themeName) return;
            
            const currentTheme = this.themeManager.getCurrentTheme();
            
            // Create custom theme
            document.dispatchEvent(new CustomEvent('gmkb:create-custom-theme', {
                detail: {
                    baseTheme: currentTheme.theme_id,
                    overrides: {
                        theme_name: themeName,
                        ...currentTheme
                    }
                }
            }));
            
            this.closeCustomizer();
        }
        
        /**
         * Reset theme to default values
         */
        resetTheme() {
            if (!this.themeManager || !this.currentTheme) return;
            
            if (!confirm('Are you sure you want to reset to the default theme values?')) {
                return;
            }
            
            // Apply original theme
            this.themeManager.applyTheme(this.currentTheme.theme_id);
            
            // Reload values
            this.loadCurrentTheme();
            
            // Reset dirty state
            this.isDirty = false;
            this.updateApplyButton();
        }
        
        /**
         * Import theme
         */
        importTheme() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const themeJson = e.target.result;
                        
                        // Dispatch import event
                        document.dispatchEvent(new CustomEvent('gmkb:import-theme', {
                            detail: { themeJson }
                        }));
                        
                    } catch (error) {
                        this.logger.error('Failed to import theme:', error);
                        if (window.showToast) {
                            window.showToast('Failed to import theme. Please check the file format.', 'error');
                        }
                    }
                };
                
                reader.readAsText(file);
            });
            
            input.click();
            
            // Close dropdown
            const dropdown = document.querySelector('.gmkb-theme-dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }
        
        /**
         * Handle theme applied event
         */
        onThemeApplied(detail) {
            // Update theme button text
            const themeNameSpan = document.querySelector('.gmkb-theme-name');
            if (themeNameSpan && detail.theme) {
                themeNameSpan.textContent = detail.theme.theme_name;
            }
            
            // Update theme list
            this.populateThemeList();
        }
        
        /**
         * Get nested property from object
         */
        getNestedProperty(obj, path) {
            const parts = path.split('.');
            let current = obj;
            
            for (const part of parts) {
                if (current && typeof current === 'object' && part in current) {
                    current = current[part];
                } else {
                    return undefined;
                }
            }
            
            return current;
        }
    }
    
    // Initialize theme customizer
    window.ThemeCustomizer = ThemeCustomizer;
    window.themeCustomizer = new ThemeCustomizer();
    
})();
