/**
 * Fix Theme Customizer Initialization
 * 
 * ROOT CAUSE FIX: Ensures Theme Customizer is properly initialized
 * when toolbar Theme button is clicked
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    console.log('🔧 Theme Customizer Init Fix: Loading...');
    
    // Monitor toolbar theme button clicks
    document.addEventListener('click', function(e) {
        // Check if it's the theme button
        const button = e.target.closest('[data-action="theme"], #global-theme-btn, .gmkb-toolbar__button[aria-label*="Theme"]');
        if (!button) return;
        
        console.log('🔧 Theme Customizer Init Fix: Theme button clicked');
        
        // Check if theme customizer exists
        if (!window.themeCustomizer) {
            console.log('⚠️ Theme Customizer not found, attempting to initialize...');
            
            // Check if ThemeCustomizer class exists
            if (window.ThemeCustomizer) {
                window.themeCustomizer = new window.ThemeCustomizer();
                console.log('✅ Theme Customizer initialized successfully');
                
                // Try to open it
                if (window.themeCustomizer && window.themeCustomizer.open) {
                    setTimeout(() => {
                        window.themeCustomizer.open();
                    }, 100);
                }
            } else {
                console.error('❌ ThemeCustomizer class not found');
                
                // Try to dispatch event as fallback
                document.dispatchEvent(new CustomEvent('gmkb:open-theme-customizer', {
                    detail: { source: 'toolbar-fix' }
                }));
            }
        }
    });
    
    // Also listen for the custom event
    document.addEventListener('gmkb:open-theme-customizer', function(e) {
        console.log('🔧 Theme Customizer Init Fix: Custom event received');
        
        if (!window.themeCustomizer && window.ThemeCustomizer) {
            window.themeCustomizer = new window.ThemeCustomizer();
            console.log('✅ Theme Customizer initialized from event');
            
            // Open it
            setTimeout(() => {
                if (window.themeCustomizer && window.themeCustomizer.open) {
                    window.themeCustomizer.open();
                }
            }, 100);
        }
    });
    
    // Debug helper
    window.debugThemeSystem = function() {
        console.group('🎨 Theme System Debug');
        console.log('ThemeManager class:', typeof window.ThemeManager);
        console.log('themeManager instance:', typeof window.themeManager);
        console.log('ThemeCustomizer class:', typeof window.ThemeCustomizer);
        console.log('themeCustomizer instance:', typeof window.themeCustomizer);
        
        if (window.themeManager) {
            console.log('Current theme:', window.themeManager.getCurrentTheme());
            console.log('Available themes:', window.themeManager.getAvailableThemes().map(t => t.theme_id));
        }
        
        const themeButton = document.querySelector('[data-action="theme"], #global-theme-btn');
        console.log('Theme button found:', !!themeButton);
        
        console.groupEnd();
    };
    
    console.log('✅ Theme Customizer Init Fix: Ready');
    console.log('💡 Use debugThemeSystem() to check theme system status');
    
})();
