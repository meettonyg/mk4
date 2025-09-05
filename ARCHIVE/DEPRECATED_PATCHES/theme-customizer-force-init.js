/**
 * Theme Customizer Force Initialize
 * Emergency fix to ensure theme customizer loads
 */

(function() {
    'use strict';
    
    console.log('🚨 Theme Customizer Force Init: Starting...');
    
    // Wait for DOM and dependencies
    function forceInitThemeCustomizer() {
        console.log('🔧 Attempting to force initialize theme customizer...');
        
        // Check if ThemeCustomizer class exists
        if (typeof window.ThemeCustomizer === 'undefined') {
            console.error('❌ ThemeCustomizer class not found! Theme scripts may not be loaded.');
            return false;
        }
        
        // Create instance if it doesn't exist
        if (!window.themeCustomizer) {
            try {
                window.themeCustomizer = new window.ThemeCustomizer();
                console.log('✅ Theme Customizer instance created successfully');
            } catch (error) {
                console.error('❌ Failed to create Theme Customizer:', error);
                return false;
            }
        } else {
            console.log('ℹ️ Theme Customizer already exists');
        }
        
        // Hook up the theme button manually
        const themeBtn = document.getElementById('global-theme-btn');
        if (themeBtn) {
            // Remove all existing listeners
            const newBtn = themeBtn.cloneNode(true);
            themeBtn.parentNode.replaceChild(newBtn, themeBtn);
            
            // Add new click handler
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎨 Theme button clicked - opening customizer...');
                
                if (window.themeCustomizer && window.themeCustomizer.open) {
                    window.themeCustomizer.open();
                    console.log('✅ Theme Customizer opened');
                } else {
                    console.error('❌ Theme Customizer not available');
                    alert('Theme customizer is still loading. Please try again in a moment.');
                }
            });
            
            console.log('✅ Theme button handler attached');
        } else {
            console.error('❌ Theme button not found');
        }
        
        return true;
    }
    
    // Try multiple initialization points
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceInitThemeCustomizer);
    } else {
        // DOM already loaded, try immediately
        forceInitThemeCustomizer();
    }
    
    // Also try after a delay to ensure all scripts are loaded
    setTimeout(forceInitThemeCustomizer, 1000);
    setTimeout(forceInitThemeCustomizer, 3000);
    
    // Add console command for manual testing
    window.forceOpenThemeCustomizer = function() {
        if (!window.themeCustomizer) {
            if (window.ThemeCustomizer) {
                window.themeCustomizer = new window.ThemeCustomizer();
            } else {
                console.error('ThemeCustomizer class not available');
                return;
            }
        }
        
        if (window.themeCustomizer && window.themeCustomizer.open) {
            window.themeCustomizer.open();
            console.log('Theme Customizer force opened');
        }
    };
    
    console.log('💡 To manually open theme customizer, run: forceOpenThemeCustomizer()');
    
})();
