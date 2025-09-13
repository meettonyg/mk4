/**
 * Theme Manager
 * Phase 4: Theme Layer System
 * 
 * ROOT CAUSE FIX: Centralized theme management with CSS custom properties
 * Event-driven theme switching without polling or global object dependencies
 * 
 * @version 4.0.0-phase4
 * @package GMKB/System
 */

class ThemeManager {
    constructor() {
        this.currentTheme = null;
        this.themes = new Map();
        this.customProperties = new Map();
        this.logger = window.StructuredLogger || console;
        
        // ROOT CAUSE FIX: Default theme to prevent blank states
        this.defaultTheme = {
            theme_id: 'default',
            theme_name: 'Default Theme',
            version: '1.0.0',
            typography: {
                primary_font: {
                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    weights: [300, 400, 600, 700]
                },
                heading_font: {
                    family: 'inherit',
                    weights: [400, 600, 700, 800]
                },
                font_scale: 1.2,
                line_height: {
                    body: 1.6,
                    heading: 1.2
                }
            },
            colors: {
                primary: '#295cff',
                secondary: '#1c0d5a',
                accent: '#295cff',
                text: '#333333',
                text_light: '#666666',
                background: '#ffffff',
                surface: '#f8f9fa',
                border: '#e1e5e9'
            },
            spacing: {
                base_unit: '8px',
                component_gap: '40px',
                section_gap: '80px'
            },
            effects: {
                border_radius: '8px',
                shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transitions: 'all 0.3s ease'
            }
        };
        
        this.logger.info('🎨 PHASE 4: ThemeManager initializing');
        this.initializeManager();
    }
    
    /**
     * Initialize the theme manager
     * Following checklist: Event-Driven Initialization, No Polling
     */
    initializeManager() {
        // Load built-in themes
        this.loadBuiltInThemes();
        
        // Listen for theme change requests
        document.addEventListener('gmkb:theme-change-requested', (event) => {
            this.onThemeChangeRequested(event.detail);
        });
        
        // Listen for custom theme creation
        document.addEventListener('gmkb:create-custom-theme', (event) => {
            this.onCreateCustomTheme(event.detail);
        });
        
        // Listen for theme export request
        document.addEventListener('gmkb:export-theme', (event) => {
            this.onExportTheme(event.detail);
        });
        
        // Listen for theme import
        document.addEventListener('gmkb:import-theme', (event) => {
            this.onImportTheme(event.detail);
        });
        
        // ROOT CAUSE FIX: Apply default theme immediately
        this.applyTheme('default');
        
        // Listen for core systems ready to load saved theme
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.loadSavedTheme();
        });
        
        this.logger.info('✅ PHASE 4: ThemeManager initialized');
    }
    
    /**
     * Load built-in themes
     * Following checklist: Simplicity First, No Redundant Logic
     */
    loadBuiltInThemes() {
        // Default theme
        this.themes.set('default', this.defaultTheme);
        
        // ROOT FIX: Load themes from self-contained theme directories via AJAX
        this.loadThemesFromDiscovery();
    }
    
    /**
     * Load themes from theme discovery system
     * Following checklist: Event-Driven, WordPress Integration
     */
    async loadThemesFromDiscovery() {
        try {
            // Make AJAX call to get discovered themes
            const response = await fetch(window.gmkbData?.ajaxUrl || ajaxurl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'gmkb_get_discovered_themes',
                    nonce: window.gmkbData?.nonce || ''
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.data.themes) {
                // Add discovered themes to the themes map
                Object.entries(result.data.themes).forEach(([themeId, themeData]) => {
                    this.themes.set(themeId, themeData);
                });
                
                this.logger.info(`📚 PHASE 4: Loaded ${Object.keys(result.data.themes).length} themes from discovery system`);
                
                // Dispatch event that themes are loaded
                this.dispatchThemeEvent('gmkb:themes-loaded', {
                    themes: Array.from(this.themes.values())
                });
            }
        } catch (error) {
            this.logger.warn('⚠️ PHASE 4: Could not load themes from discovery, using built-in defaults');
            // Fallback to built-in themes defined in JavaScript
            this.loadBuiltInThemesStatically();
        }
    }
    
    /**
     * Load built-in themes statically as fallback
     */
    loadBuiltInThemesStatically() {
        
        // Professional Clean theme
        this.themes.set('professional_clean', {
            theme_id: 'professional_clean',
            theme_name: 'Professional Clean',
            version: '1.0.0',
            typography: {
                primary_font: {
                    family: 'Inter, sans-serif',
                    weights: [300, 400, 600, 700]
                },
                heading_font: {
                    family: 'Montserrat, sans-serif',
                    weights: [400, 600, 700, 800]
                },
                font_scale: 1.25,
                line_height: {
                    body: 1.7,
                    heading: 1.3
                }
            },
            colors: {
                primary: '#2563eb',
                secondary: '#1e40af',
                accent: '#3b82f6',
                text: '#1f2937',
                text_light: '#6b7280',
                background: '#ffffff',
                surface: '#f9fafb',
                border: '#e5e7eb'
            },
            spacing: {
                base_unit: '8px',
                component_gap: '48px',
                section_gap: '96px'
            },
            effects: {
                border_radius: '12px',
                shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transitions: 'all 0.2s ease'
            }
        });
        
        // Creative Bold theme
        this.themes.set('creative_bold', {
            theme_id: 'creative_bold',
            theme_name: 'Creative Bold',
            version: '1.0.0',
            typography: {
                primary_font: {
                    family: 'Poppins, sans-serif',
                    weights: [300, 400, 600, 700, 900]
                },
                heading_font: {
                    family: 'Bebas Neue, sans-serif',
                    weights: [400]
                },
                font_scale: 1.3,
                line_height: {
                    body: 1.8,
                    heading: 1.1
                }
            },
            colors: {
                primary: '#f97316',
                secondary: '#dc2626',
                accent: '#fbbf24',
                text: '#111827',
                text_light: '#4b5563',
                background: '#fffbeb',
                surface: '#fef3c7',
                border: '#fde68a'
            },
            spacing: {
                base_unit: '10px',
                component_gap: '60px',
                section_gap: '120px'
            },
            effects: {
                border_radius: '24px',
                shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
                transitions: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }
        });
        
        // Minimal Elegant theme
        this.themes.set('minimal_elegant', {
            theme_id: 'minimal_elegant',
            theme_name: 'Minimal Elegant',
            version: '1.0.0',
            typography: {
                primary_font: {
                    family: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                    weights: [300, 400, 500]
                },
                heading_font: {
                    family: 'Georgia, serif',
                    weights: [400, 700]
                },
                font_scale: 1.15,
                line_height: {
                    body: 1.75,
                    heading: 1.4
                }
            },
            colors: {
                primary: '#000000',
                secondary: '#333333',
                accent: '#666666',
                text: '#000000',
                text_light: '#666666',
                background: '#ffffff',
                surface: '#fafafa',
                border: '#eeeeee'
            },
            spacing: {
                base_unit: '8px',
                component_gap: '32px',
                section_gap: '64px'
            },
            effects: {
                border_radius: '0px',
                shadow: 'none',
                transitions: 'opacity 0.3s ease'
            }
        });
        
        // Modern Dark theme
        this.themes.set('modern_dark', {
            theme_id: 'modern_dark',
            theme_name: 'Modern Dark',
            version: '1.0.0',
            typography: {
                primary_font: {
                    family: 'SF Pro Display, -apple-system, sans-serif',
                    weights: [300, 400, 600, 700]
                },
                heading_font: {
                    family: 'SF Pro Display, -apple-system, sans-serif',
                    weights: [600, 700, 800, 900]
                },
                font_scale: 1.2,
                line_height: {
                    body: 1.6,
                    heading: 1.2
                }
            },
            colors: {
                primary: '#60a5fa',
                secondary: '#818cf8',
                accent: '#34d399',
                text: '#f3f4f6',
                text_light: '#9ca3af',
                background: '#111827',
                surface: '#1f2937',
                border: '#374151'
            },
            spacing: {
                base_unit: '8px',
                component_gap: '40px',
                section_gap: '80px'
            },
            effects: {
                border_radius: '16px',
                shadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                transitions: 'all 0.3s ease'
            }
        });
        
        this.logger.info(`📚 PHASE 4: Loaded ${this.themes.size} built-in themes (static fallback)`);
        
        // Dispatch event that themes are loaded
        this.dispatchThemeEvent('gmkb:themes-loaded', {
            themes: Array.from(this.themes.values())
        });
    }
    
    /**
     * Apply a theme
     * Following checklist: Root Cause Fix, Event-Driven
     */
    applyTheme(themeId) {
        const theme = this.themes.get(themeId);
        
        if (!theme) {
            this.logger.warn(`⚠️ PHASE 4: Theme ${themeId} not found, using default`);
            this.applyTheme('default');
            return;
        }
        
        this.currentTheme = theme;
        
        // Generate CSS custom properties
        const css = this.generateThemeCSS(theme);
        
        // Apply to document
        this.applyThemeCSS(css);
        
        // Save theme preference
        this.saveThemePreference(themeId);
        
        // Dispatch theme changed event
        this.dispatchThemeEvent('gmkb:theme-applied', {
            themeId: theme.theme_id,
            theme: theme
        });
        
        this.logger.info(`🎨 PHASE 4: Applied theme: ${theme.theme_name}`);
    }
    
    /**
     * Generate CSS from theme configuration
     * Following checklist: Simplicity First, No Redundant Logic
     */
    generateThemeCSS(theme) {
        const cssVars = [];
        
        // Typography variables
        if (theme.typography) {
            const typo = theme.typography;
            cssVars.push(`--gmkb-font-primary: ${typo.primary_font.family}`);
            cssVars.push(`--gmkb-font-heading: ${typo.heading_font.family}`);
            cssVars.push(`--gmkb-font-scale: ${typo.font_scale}`);
            cssVars.push(`--gmkb-line-height-body: ${typo.line_height.body}`);
            cssVars.push(`--gmkb-line-height-heading: ${typo.line_height.heading}`);
            
            // Font sizes based on scale
            const baseSize = 16;
            const scale = typo.font_scale;
            cssVars.push(`--gmkb-font-size-xs: ${Math.round(baseSize * 0.75)}px`);
            cssVars.push(`--gmkb-font-size-sm: ${Math.round(baseSize * 0.875)}px`);
            cssVars.push(`--gmkb-font-size-base: ${baseSize}px`);
            cssVars.push(`--gmkb-font-size-lg: ${Math.round(baseSize * scale)}px`);
            cssVars.push(`--gmkb-font-size-xl: ${Math.round(baseSize * scale * 1.25)}px`);
            cssVars.push(`--gmkb-font-size-2xl: ${Math.round(baseSize * scale * 1.5)}px`);
            cssVars.push(`--gmkb-font-size-3xl: ${Math.round(baseSize * scale * 1.875)}px`);
            cssVars.push(`--gmkb-font-size-4xl: ${Math.round(baseSize * scale * 2.25)}px`);
        }
        
        // Color variables
        if (theme.colors) {
            Object.entries(theme.colors).forEach(([key, value]) => {
                const varName = key.replace(/_/g, '-');
                cssVars.push(`--gmkb-color-${varName}: ${value}`);
            });
        }
        
        // Spacing variables
        if (theme.spacing) {
            Object.entries(theme.spacing).forEach(([key, value]) => {
                const varName = key.replace(/_/g, '-');
                cssVars.push(`--gmkb-spacing-${varName}: ${value}`);
            });
            
            // Generate spacing scale
            const baseUnit = parseInt(theme.spacing.base_unit) || 8;
            for (let i = 1; i <= 12; i++) {
                cssVars.push(`--gmkb-space-${i}: ${baseUnit * i}px`);
            }
        }
        
        // Effects variables
        if (theme.effects) {
            Object.entries(theme.effects).forEach(([key, value]) => {
                const varName = key.replace(/_/g, '-');
                cssVars.push(`--gmkb-${varName}: ${value}`);
            });
        }
        
        return `:root {\n  ${cssVars.join(';\n  ')};\n}`;
    }
    
    /**
     * Apply theme CSS to document
     * Following checklist: Root Cause Fix, No Direct Manipulation
     */
    applyThemeCSS(css) {
        // Remove existing theme style element if exists
        const existingStyle = document.getElementById('gmkb-theme-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Create new style element with higher specificity CSS
        const enhancedCSS = css + `
        
        /* Apply theme to all builder elements */
        .builder-container,
        .preview__container,
        #media-kit-preview,
        #gmkb-sections-container,
        .gmkb-sections-container,
        .media-kit-preview {
            font-family: var(--gmkb-font-primary);
            color: var(--gmkb-color-text);
            background: var(--gmkb-color-background);
        }
        
        /* Apply to all components */
        .component,
        .gmkb-component,
        [data-component-id] {
            background: var(--gmkb-color-surface);
            color: var(--gmkb-color-text);
            border-color: var(--gmkb-color-border);
            border-radius: var(--gmkb-border-radius);
        }
        
        /* Apply to all headings */
        h1, h2, h3, h4, h5, h6,
        .component h1, .component h2, .component h3,
        .gmkb-component h1, .gmkb-component h2, .gmkb-component h3 {
            font-family: var(--gmkb-font-heading);
            color: var(--gmkb-color-text);
        }
        
        /* Apply to buttons */
        button, .btn, .button,
        .toolbar button,
        .component-control {
            background-color: var(--gmkb-color-primary);
            color: white;
            border-radius: var(--gmkb-border-radius);
        }
        
        button:hover, .btn:hover, .button:hover {
            background-color: var(--gmkb-color-primary-hover);
        }
        
        /* Apply to sidebar */
        .sidebar,
        .gmkb-sidebar {
            background: var(--gmkb-color-surface);
            border-color: var(--gmkb-color-border);
        }
        
        /* Apply to toolbar */
        .toolbar,
        .gmkb-toolbar,
        #gmkb-toolbar {
            background: var(--gmkb-color-background);
            border-color: var(--gmkb-color-border);
        }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'gmkb-theme-styles';
        styleElement.textContent = enhancedCSS;
        
        // Append to head with high priority
        document.head.appendChild(styleElement);
        
        // Also apply data attribute for CSS hooks
        document.documentElement.setAttribute('data-gmkb-theme', this.currentTheme.theme_id);
        
        // Apply class to body and main containers for better specificity
        document.body.classList.add('gmkb-theme-active', `gmkb-theme-${this.currentTheme.theme_id}`);
        
        // Find and update main containers
        const containers = document.querySelectorAll('.builder-container, .preview__container, #media-kit-preview, #gmkb-sections-container');
        containers.forEach(container => {
            container.classList.add('gmkb-media-kit-builder');
        });
        
        this.logger.info('🎨 Theme CSS applied with enhanced selectors');
    }
    
    /**
     * Save theme preference
     * Following checklist: Centralized State
     */
    saveThemePreference(themeId) {
        // Save to localStorage for persistence
        try {
            localStorage.setItem('gmkb_theme', themeId);
        } catch (e) {
            this.logger.warn('⚠️ PHASE 4: Could not save theme preference to localStorage');
        }
        
        // Save to state manager if available
        if (window.enhancedStateManager) {
            window.enhancedStateManager.dispatch({
                type: 'SET_THEME',
                payload: {
                    themeId: themeId,
                    theme: this.currentTheme
                }
            });
        }
        
        // Save to WordPress database via AJAX
        this.saveThemeToDatabase(themeId);
    }
    
    /**
     * Save theme to WordPress database
     * Following checklist: WordPress Integration
     */
    saveThemeToDatabase(themeId) {
        if (!window.gmkbData || !window.gmkbData.ajaxUrl) {
            this.logger.warn('⚠️ PHASE 4: Cannot save theme - WordPress data not available');
            return;
        }
        
        const formData = new FormData();
        formData.append('action', 'gmkb_save_theme');
        formData.append('theme_id', themeId);
        formData.append('theme_data', JSON.stringify(this.currentTheme));
        formData.append('post_id', window.gmkbData.postId || 0);
        formData.append('nonce', window.gmkbData.nonce);
        
        fetch(window.gmkbData.ajaxUrl, {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.logger.info('✅ PHASE 4: Theme saved to database');
                
                // Show success message
                if (window.showToast) {
                    window.showToast('Theme saved successfully', 'success', 3000);
                }
            } else {
                throw new Error(data.data || 'Failed to save theme');
            }
        })
        .catch(error => {
            this.logger.error('❌ PHASE 4: Failed to save theme to database:', error);
            if (window.showToast) {
                window.showToast('Failed to save theme settings', 'error', 5000);
            }
        });
    }
    
    /**
     * Load saved theme preference
     * Following checklist: Graceful Failure
     */
    loadSavedTheme() {
        let savedThemeId = null;
        
        // Try localStorage first
        try {
            savedThemeId = localStorage.getItem('gmkb_theme');
        } catch (e) {
            this.logger.debug('Could not read theme from localStorage');
        }
        
        // Try state manager
        if (!savedThemeId && window.enhancedStateManager) {
            const state = window.enhancedStateManager.getState();
            savedThemeId = state.globalSettings?.theme;
        }
        
        if (savedThemeId && this.themes.has(savedThemeId)) {
            this.applyTheme(savedThemeId);
            this.logger.info(`🎨 PHASE 4: Loaded saved theme: ${savedThemeId}`);
        }
    }
    
    /**
     * Create custom theme
     * Following checklist: Schema Compliance
     */
    createCustomTheme(baseThemeId, overrides) {
        const baseTheme = this.themes.get(baseThemeId) || this.defaultTheme;
        
        const customTheme = {
            ...baseTheme,
            theme_id: `custom_${Date.now()}`,
            theme_name: overrides.theme_name || 'Custom Theme',
            version: '1.0.0',
            base_theme: baseThemeId,
            ...overrides
        };
        
        // Deep merge for nested objects
        ['typography', 'colors', 'spacing', 'effects'].forEach(key => {
            if (overrides[key]) {
                customTheme[key] = {
                    ...baseTheme[key],
                    ...overrides[key]
                };
            }
        });
        
        this.themes.set(customTheme.theme_id, customTheme);
        
        this.logger.info(`🎨 PHASE 4: Created custom theme: ${customTheme.theme_name}`);
        
        return customTheme;
    }
    
    /**
     * Export theme configuration
     * Following checklist: Simplicity First
     */
    exportTheme(themeId) {
        const theme = this.themes.get(themeId);
        
        if (!theme) {
            this.logger.warn(`⚠️ PHASE 4: Cannot export - theme ${themeId} not found`);
            return null;
        }
        
        const exportData = {
            ...theme,
            export_date: new Date().toISOString(),
            export_version: '1.0.0'
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    /**
     * Import theme configuration
     * Following checklist: Graceful Failure, Validation
     */
    importTheme(themeJson) {
        try {
            const theme = JSON.parse(themeJson);
            
            // Validate required fields
            if (!theme.theme_id || !theme.theme_name) {
                throw new Error('Invalid theme: missing required fields');
            }
            
            // Generate new ID to avoid conflicts
            const importedTheme = {
                ...theme,
                theme_id: `imported_${Date.now()}`,
                imported: true,
                import_date: new Date().toISOString()
            };
            
            this.themes.set(importedTheme.theme_id, importedTheme);
            
            this.logger.info(`🎨 PHASE 4: Imported theme: ${importedTheme.theme_name}`);
            
            return importedTheme;
        } catch (error) {
            this.logger.error('❌ PHASE 4: Failed to import theme:', error);
            return null;
        }
    }
    
    /**
     * Event handlers
     * Following checklist: Event-Driven, Root Cause Fix
     */
    onThemeChangeRequested(detail) {
        const { themeId } = detail;
        this.applyTheme(themeId);
    }
    
    onCreateCustomTheme(detail) {
        const { baseTheme, overrides } = detail;
        const customTheme = this.createCustomTheme(baseTheme, overrides);
        
        this.dispatchThemeEvent('gmkb:custom-theme-created', {
            theme: customTheme
        });
    }
    
    onExportTheme(detail) {
        const { themeId } = detail;
        const exportData = this.exportTheme(themeId);
        
        if (exportData) {
            // Create download link
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gmkb-theme-${themeId}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }
    
    onImportTheme(detail) {
        const { themeJson } = detail;
        const importedTheme = this.importTheme(themeJson);
        
        if (importedTheme) {
            this.dispatchThemeEvent('gmkb:theme-imported', {
                theme: importedTheme
            });
        }
    }
    
    /**
     * Dispatch theme events
     * Following checklist: Event-Driven
     */
    dispatchThemeEvent(eventType, detail) {
        const event = new CustomEvent(eventType, {
            detail: {
                ...detail,
                timestamp: Date.now(),
                source: 'ThemeManager'
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    /**
     * Get all available themes
     * ROOT FIX: Tests expect theme IDs or simple objects, not full theme objects
     */
    getAvailableThemes() {
        // Return simplified theme list for compatibility
        return Array.from(this.themes.values()).map(theme => {
            if (typeof theme === 'string') return theme;
            // Return simplified object with just essential properties
            return {
                theme_id: theme.theme_id,
                theme_name: theme.theme_name
            };
        });
    }
    
    /**
     * Get theme by ID
     */
    getTheme(themeId) {
        return this.themes.get(themeId);
    }
    
    /**
     * Set theme - PUBLIC API METHOD (alias for applyTheme)
     * This is the method that tests expect to exist
     * ROOT FIX: Handle objects being passed as themeId
     */
    setTheme(themeId) {
        // ROOT FIX: Extract ID if an object is passed
        if (typeof themeId === 'object' && themeId !== null) {
            themeId = themeId.theme_id || themeId.id || 'default';
        }
        
        // Ensure it's a string
        themeId = String(themeId);
        
        // Handle the string "[object Object]" that sometimes gets passed
        if (themeId === '[object Object]') {
            console.warn('Theme ID was [object Object], using default theme');
            themeId = 'default';
        }
        
        return this.applyTheme(themeId);
    }
    
    /**
     * Update current theme property
     * Following checklist: Centralized State, No Direct Manipulation
     */
    updateThemeProperty(propertyPath, value) {
        if (!this.currentTheme) return;
        
        // Parse property path (e.g., "colors.primary")
        const pathParts = propertyPath.split('.');
        let target = this.currentTheme;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
            if (!target[pathParts[i]]) {
                target[pathParts[i]] = {};
            }
            target = target[pathParts[i]];
        }
        
        target[pathParts[pathParts.length - 1]] = value;
        
        // Re-apply theme with changes
        this.applyTheme(this.currentTheme.theme_id);
        
        this.logger.info(`🎨 PHASE 4: Updated theme property: ${propertyPath} = ${value}`);
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            currentTheme: this.currentTheme?.theme_id,
            availableThemes: Array.from(this.themes.keys()),
            themesCount: this.themes.size,
            customPropertiesCount: document.querySelectorAll('#gmkb-theme-styles').length
        };
    }
}

// Global instance
window.ThemeManager = ThemeManager;

// ROOT FIX: Initialize immediately so it's available for other components
// The instance will handle its own internal initialization timing
if (!window.themeManager) {
    window.themeManager = new ThemeManager();
    console.log('✅ Theme Manager: Instance created immediately and available globally');
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
