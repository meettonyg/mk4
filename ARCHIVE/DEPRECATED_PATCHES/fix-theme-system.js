/**
 * Theme System Diagnostic and Fix
 * ROOT CAUSE FIX: Ensure theme system is properly initialized
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    console.log('🔍 Theme System Diagnostic Starting...');
    
    // Check if theme manager exists
    if (window.themeManager) {
        console.log('✅ Theme Manager exists');
        console.log('   Available themes:', window.themeManager.getAvailableThemes());
        console.log('   Current theme:', window.themeManager.getCurrentTheme());
    } else {
        console.log('❌ Theme Manager not found - initializing...');
        
        // Try to initialize theme manager
        if (window.ThemeManager) {
            window.themeManager = new ThemeManager();
            console.log('✅ Theme Manager initialized');
        } else {
            console.log('❌ ThemeManager class not found');
        }
    }
    
    // Check if theme customizer exists
    if (window.themeCustomizer) {
        console.log('✅ Theme Customizer exists');
        
        // Check if open method exists
        if (typeof window.themeCustomizer.open === 'function') {
            console.log('✅ Theme Customizer has open() method');
        } else if (typeof window.themeCustomizer.openCustomizer === 'function') {
            console.log('⚠️ Theme Customizer has openCustomizer() but not open() - fixing...');
            // Already fixed in our edit
        }
    } else {
        console.log('❌ Theme Customizer not found - initializing...');
        
        // Try to initialize theme customizer
        if (window.ThemeCustomizer) {
            window.themeCustomizer = new ThemeCustomizer();
            console.log('✅ Theme Customizer initialized');
        } else {
            console.log('❌ ThemeCustomizer class not found');
        }
    }
    
    // Check toolbar integration
    if (window.consolidatedToolbar) {
        console.log('✅ Toolbar exists');
        
        // Check theme button
        const themeBtn = document.getElementById('global-theme-btn');
        if (themeBtn) {
            console.log('✅ Theme button found in DOM');
            
            // Remove old event listeners and add new one
            const newBtn = themeBtn.cloneNode(true);
            themeBtn.parentNode.replaceChild(newBtn, themeBtn);
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🎨 Theme button clicked - opening customizer...');
                
                if (window.themeCustomizer && window.themeCustomizer.open) {
                    window.themeCustomizer.open();
                } else if (window.themeCustomizer && window.themeCustomizer.openCustomizer) {
                    window.themeCustomizer.openCustomizer();
                } else {
                    // Fallback: Try to toggle theme dropdown
                    const dropdown = document.querySelector('.gmkb-theme-dropdown');
                    if (dropdown) {
                        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                        console.log('✅ Toggled theme dropdown');
                    } else {
                        console.log('❌ No theme UI available');
                        alert('Theme system is loading. Please try again in a moment.');
                    }
                }
            });
            
            console.log('✅ Theme button event handler re-attached');
        } else {
            console.log('❌ Theme button not found in DOM');
        }
    } else {
        console.log('⚠️ Toolbar not found');
    }
    
    // Load themes from discovery if not loaded
    if (window.themeManager && window.themeManager.themes.size === 0) {
        console.log('📚 Loading themes from discovery...');
        
        // Try to load themes via AJAX
        if (window.gmkbData && window.gmkbData.ajaxUrl) {
            fetch(window.gmkbData.ajaxUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'gmkb_get_discovered_themes',
                    nonce: window.gmkbData.nonce || ''
                })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success && result.data.themes) {
                    console.log(`✅ Loaded ${Object.keys(result.data.themes).length} themes from server`);
                    
                    // Add themes to theme manager
                    Object.entries(result.data.themes).forEach(([themeId, themeData]) => {
                        window.themeManager.themes.set(themeId, themeData);
                    });
                    
                    // Apply default theme
                    window.themeManager.applyTheme('professional_clean');
                    console.log('✅ Applied professional_clean theme');
                    
                    // Update theme customizer if it exists
                    if (window.themeCustomizer && window.themeCustomizer.populateThemeList) {
                        window.themeCustomizer.populateThemeList();
                        console.log('✅ Updated theme list in customizer');
                    }
                } else {
                    console.log('⚠️ No themes returned from server');
                }
            })
            .catch(error => {
                console.error('❌ Error loading themes:', error);
            });
        }
    }
    
    // Create emergency theme button if needed
    if (!document.querySelector('.gmkb-theme-switcher') && !document.getElementById('global-theme-btn')) {
        console.log('📦 Creating emergency theme button...');
        
        const toolbar = document.querySelector('.gmkb-toolbar-actions') || document.querySelector('.toolbar__actions');
        if (toolbar) {
            const emergencyBtn = document.createElement('button');
            emergencyBtn.className = 'btn btn--secondary';
            emergencyBtn.innerHTML = '🎨 Theme';
            emergencyBtn.style.marginRight = '10px';
            emergencyBtn.onclick = function() {
                if (window.themeCustomizer && window.themeCustomizer.open) {
                    window.themeCustomizer.open();
                } else {
                    alert('Theme system is initializing. Please wait...');
                    // Try to initialize
                    if (window.ThemeCustomizer && !window.themeCustomizer) {
                        window.themeCustomizer = new ThemeCustomizer();
                        setTimeout(() => {
                            if (window.themeCustomizer.open) {
                                window.themeCustomizer.open();
                            }
                        }, 500);
                    }
                }
            };
            
            toolbar.insertBefore(emergencyBtn, toolbar.firstChild);
            console.log('✅ Emergency theme button created');
        }
    }
    
    // Final diagnostic summary
    console.log('\n📊 Theme System Diagnostic Summary:');
    console.log('- Theme Manager:', window.themeManager ? '✅' : '❌');
    console.log('- Theme Customizer:', window.themeCustomizer ? '✅' : '❌');
    console.log('- Theme Button:', document.getElementById('global-theme-btn') ? '✅' : '❌');
    console.log('- Themes Loaded:', window.themeManager ? window.themeManager.themes.size : 0);
    
    // Export diagnostic function
    window.diagnoseThemeSystem = function() {
        console.group('🎨 Theme System Status');
        console.log('ThemeManager:', window.themeManager);
        console.log('ThemeCustomizer:', window.themeCustomizer);
        console.log('Available Themes:', window.themeManager?.getAvailableThemes());
        console.log('Current Theme:', window.themeManager?.getCurrentTheme());
        console.log('Theme Button:', document.getElementById('global-theme-btn'));
        console.log('Theme Dropdown:', document.querySelector('.gmkb-theme-dropdown'));
        console.groupEnd();
    };
    
    // Export manual fix function
    window.fixThemeSystem = function() {
        console.log('🔧 Attempting to fix theme system...');
        
        // Initialize theme manager if needed
        if (!window.themeManager && window.ThemeManager) {
            window.themeManager = new ThemeManager();
            console.log('✅ Theme Manager initialized');
        }
        
        // Initialize theme customizer if needed
        if (!window.themeCustomizer && window.ThemeCustomizer) {
            window.themeCustomizer = new ThemeCustomizer();
            console.log('✅ Theme Customizer initialized');
        }
        
        // Re-attach button handler
        const themeBtn = document.getElementById('global-theme-btn');
        if (themeBtn) {
            themeBtn.onclick = function(e) {
                e.preventDefault();
                if (window.themeCustomizer && window.themeCustomizer.open) {
                    window.themeCustomizer.open();
                } else {
                    console.error('Theme customizer not available');
                }
            };
            console.log('✅ Theme button handler re-attached');
        }
        
        console.log('✅ Theme system fix complete');
    };
    
    console.log('\n💡 Available commands:');
    console.log('- diagnoseThemeSystem() - Check theme system status');
    console.log('- fixThemeSystem() - Attempt to fix theme issues');
    
})();
