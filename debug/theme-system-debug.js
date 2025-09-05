/**
 * Debug: Theme System Test
 * Quick test script to verify Phase 4 Theme System functionality
 */

(function() {
    'use strict';
    
    console.log('🔍 Theme System Debug Script Loaded');
    
    // Add global debug commands
    window.testThemeSystem = function() {
        console.group('🎨 Theme System Status');
        
        // Check if ThemeManager is loaded
        console.log('ThemeManager class:', typeof window.ThemeManager !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');
        console.log('themeManager instance:', window.themeManager ? '✅ Created' : '❌ Not created');
        
        // Check if ThemeCustomizer is loaded
        console.log('ThemeCustomizer class:', typeof window.ThemeCustomizer !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');
        console.log('themeCustomizer instance:', window.themeCustomizer ? '✅ Created' : '❌ Not created');
        
        // Check if the customizer panel exists in DOM
        const panel = document.getElementById('gmkb-theme-customizer');
        console.log('Customizer panel in DOM:', panel ? '✅ Exists' : '❌ Not found');
        
        // Check toolbar button
        const themeBtn = document.getElementById('global-theme-btn');
        console.log('Theme button in toolbar:', themeBtn ? '✅ Found' : '❌ Not found');
        
        console.groupEnd();
        
        return {
            manager: !!window.themeManager,
            customizer: !!window.themeCustomizer,
            panel: !!panel,
            button: !!themeBtn
        };
    };
    
    // Force open theme customizer
    window.openThemeCustomizer = function() {
        console.log('🎨 Attempting to open Theme Customizer...');
        
        if (window.themeCustomizer && window.themeCustomizer.open) {
            window.themeCustomizer.open();
            console.log('✅ Called themeCustomizer.open()');
        } else if (window.ThemeCustomizer) {
            console.log('⚠️ ThemeCustomizer class exists but no instance, creating one...');
            window.themeCustomizer = new window.ThemeCustomizer();
            if (window.themeCustomizer.open) {
                window.themeCustomizer.open();
                console.log('✅ Created instance and opened');
            }
        } else {
            console.error('❌ Theme Customizer not available');
        }
    };
    
    // Force initialize theme system
    window.initThemeSystem = function() {
        console.log('🔧 Force initializing theme system...');
        
        // Initialize ThemeManager
        if (window.ThemeManager && !window.themeManager) {
            window.themeManager = new window.ThemeManager();
            console.log('✅ ThemeManager initialized');
        }
        
        // Initialize ThemeCustomizer
        if (window.ThemeCustomizer && !window.themeCustomizer) {
            window.themeCustomizer = new window.ThemeCustomizer();
            console.log('✅ ThemeCustomizer initialized');
        }
        
        // Try to open
        if (window.themeCustomizer && window.themeCustomizer.open) {
            window.themeCustomizer.open();
            console.log('✅ Theme Customizer opened');
        }
    };
    
    // Auto-test on load
    setTimeout(() => {
        const status = window.testThemeSystem();
        if (!status.customizer) {
            console.warn('⚠️ Theme Customizer not initialized. Run initThemeSystem() to force initialization.');
        }
    }, 2000);
    
    console.log('📝 Debug commands available:');
    console.log('  - testThemeSystem() : Check theme system status');
    console.log('  - openThemeCustomizer() : Force open the customizer');
    console.log('  - initThemeSystem() : Force initialize all components');
    
})();
