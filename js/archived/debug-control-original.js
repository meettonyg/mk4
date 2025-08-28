/**
 * @file debug-control.js
 * @description Centralized debug control system for GMKB
 * Controls various debug outputs to reduce console noise in production
 */

(function() {
    'use strict';
    
    // Check URL parameters for debug flags
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');
    const debugCategories = urlParams.get('debug_categories');
    
    // Check localStorage for persistent debug settings
    const storedDebugSettings = localStorage.getItem('GMKBDebugSettings');
    const savedSettings = storedDebugSettings ? JSON.parse(storedDebugSettings) : {};
    
    /**
     * Global Debug Control System
     * Usage: GMKBDebug.log('category', 'message', data);
     */
    window.GMKBDebug = {
        // Master switch - can be toggled via URL ?debug=true or localStorage
        enabled: debugParam === 'true' || savedSettings.enabled || false,
        
        // Category-specific switches
        categories: {
            hover: false,       // Component hover events (very noisy)
            init: false,        // Initialization success messages
            render: true,       // Render operations (important)
            state: true,        // State changes (important)
            controls: true,     // Control actions (important)
            component: true,    // Component operations (important)
            error: true,        // Errors (always show)
            perf: false,        // Performance metrics
            loader: false,      // Template loader operations
            save: true,         // Save operations (important)
            ...savedSettings.categories // Override with saved settings
        },
        
        // Log function with category filtering
        log: function(category, ...args) {
            // Always show errors
            if (category === 'error') {
                console.error(...args);
                return;
            }
            
            // Check if category is enabled
            if (this.enabled || this.categories[category]) {
                console.log(...args);
            }
        },
        
        // Convenience methods for common operations
        logHover: function(...args) {
            this.log('hover', ...args);
        },
        
        logInit: function(...args) {
            this.log('init', ...args);
        },
        
        logRender: function(...args) {
            this.log('render', ...args);
        },
        
        logState: function(...args) {
            this.log('state', ...args);
        },
        
        logError: function(...args) {
            this.log('error', ...args);
        },
        
        // Enable/disable debug mode
        enable: function(categories = null) {
            this.enabled = true;
            if (categories) {
                categories.forEach(cat => {
                    if (this.categories.hasOwnProperty(cat)) {
                        this.categories[cat] = true;
                    }
                });
            }
            this.saveSettings();
            console.log('🐛 GMKB Debug enabled');
        },
        
        disable: function() {
            this.enabled = false;
            this.saveSettings();
            console.log('🐛 GMKB Debug disabled');
        },
        
        // Enable specific categories
        enableCategory: function(category) {
            if (this.categories.hasOwnProperty(category)) {
                this.categories[category] = true;
                this.saveSettings();
                console.log(`🐛 GMKB Debug category enabled: ${category}`);
            }
        },
        
        disableCategory: function(category) {
            if (this.categories.hasOwnProperty(category)) {
                this.categories[category] = false;
                this.saveSettings();
                console.log(`🐛 GMKB Debug category disabled: ${category}`);
            }
        },
        
        // Save settings to localStorage
        saveSettings: function() {
            const settings = {
                enabled: this.enabled,
                categories: this.categories
            };
            localStorage.setItem('GMKBDebugSettings', JSON.stringify(settings));
        },
        
        // Clear all debug settings
        reset: function() {
            localStorage.removeItem('GMKBDebugSettings');
            this.enabled = false;
            Object.keys(this.categories).forEach(cat => {
                this.categories[cat] = ['error', 'render', 'state', 'controls', 'component', 'save'].includes(cat);
            });
            console.log('🐛 GMKB Debug settings reset to defaults');
        },
        
        // Show current status
        status: function() {
            console.group('🐛 GMKB Debug Status');
            console.log('Master switch:', this.enabled ? 'ON' : 'OFF');
            console.log('Categories:');
            console.table(this.categories);
            console.log('\nUsage:');
            console.log('- Enable all: GMKBDebug.enable()');
            console.log('- Enable specific: GMKBDebug.enableCategory("hover")');
            console.log('- Disable all: GMKBDebug.disable()');
            console.log('- Reset to defaults: GMKBDebug.reset()');
            console.groupEnd();
        }
    };
    
    // Parse URL debug categories if provided
    if (debugCategories) {
        const cats = debugCategories.split(',');
        cats.forEach(cat => {
            if (GMKBDebug.categories.hasOwnProperty(cat)) {
                GMKBDebug.categories[cat] = true;
            }
        });
    }
    
    // Expose global debug mode flag for legacy code
    window.GMKBDebugMode = GMKBDebug.enabled || GMKBDebug.categories.hover;
    
    // Log initial status if debug is enabled
    if (GMKBDebug.enabled) {
        console.log('🐛 GMKB Debug Control initialized');
        GMKBDebug.status();
    }
    
})();
