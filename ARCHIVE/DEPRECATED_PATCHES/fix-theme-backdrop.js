/**
 * Theme Backdrop Fix
 * ROOT CAUSE FIX: Ensures backdrop is properly removed when closing theme customizer
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    console.log('🔧 Theme Backdrop Fix Loading...');
    
    // Function to remove all backdrops
    function removeAllBackdrops() {
        // Remove theme customizer backdrops
        const themeBackdrops = document.querySelectorAll('.gmkb-customizer-backdrop');
        themeBackdrops.forEach(backdrop => {
            console.log('🗑️ Removing theme backdrop');
            backdrop.remove();
        });
        
        // Remove any modal backdrops
        const modalBackdrops = document.querySelectorAll('.modal-backdrop, .gmkb-modal-backdrop');
        modalBackdrops.forEach(backdrop => {
            console.log('🗑️ Removing modal backdrop');
            backdrop.remove();
        });
        
        // Reset body styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.classList.remove('modal-open', 'customizer-open');
        
        console.log('✅ All backdrops removed');
    }
    
    // Enhanced ESC key handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            // Check if theme customizer is open
            const customizer = document.getElementById('gmkb-theme-customizer');
            if (customizer && customizer.style.display === 'flex') {
                console.log('🔑 ESC pressed - closing theme customizer');
                
                // Close the customizer
                customizer.style.display = 'none';
                
                // Remove all backdrops
                removeAllBackdrops();
                
                // Trigger close event if customizer has a close method
                if (window.themeCustomizer && window.themeCustomizer.closeCustomizer) {
                    window.themeCustomizer.closeCustomizer();
                }
            }
        }
    });
    
    // Monitor for orphaned backdrops
    setInterval(() => {
        const backdrops = document.querySelectorAll('.gmkb-customizer-backdrop');
        const customizer = document.getElementById('gmkb-theme-customizer');
        
        // If backdrop exists but customizer is not visible, remove backdrop
        if (backdrops.length > 0 && (!customizer || customizer.style.display !== 'flex')) {
            console.log('⚠️ Found orphaned backdrop - removing...');
            removeAllBackdrops();
        }
        
        // If multiple backdrops exist, keep only one
        if (backdrops.length > 1) {
            console.log('⚠️ Multiple backdrops detected - cleaning up...');
            for (let i = 1; i < backdrops.length; i++) {
                backdrops[i].remove();
            }
        }
    }, 2000); // Check every 2 seconds
    
    // Override the close button handler
    document.addEventListener('click', function(e) {
        // Check if close button was clicked
        if (e.target.matches('.gmkb-close-customizer') || 
            e.target.closest('.gmkb-close-customizer')) {
            console.log('🔘 Close button clicked');
            setTimeout(() => {
                // Give the normal handler time to run, then ensure cleanup
                removeAllBackdrops();
            }, 100);
        }
        
        // Check if Cancel button was clicked
        if (e.target.matches('.gmkb-cancel-customization') || 
            e.target.closest('.gmkb-cancel-customization')) {
            console.log('🔘 Cancel button clicked');
            setTimeout(() => {
                removeAllBackdrops();
            }, 100);
        }
    });
    
    // Export manual fix function
    window.fixBackdrop = function() {
        console.log('🔧 Manual backdrop fix triggered');
        removeAllBackdrops();
        
        // Also hide the customizer if it's open
        const customizer = document.getElementById('gmkb-theme-customizer');
        if (customizer) {
            customizer.style.display = 'none';
        }
        
        console.log('✅ Backdrop fixed');
    };
    
    // Export backdrop status function
    window.checkBackdrop = function() {
        const backdrops = document.querySelectorAll('.gmkb-customizer-backdrop, .modal-backdrop');
        const customizer = document.getElementById('gmkb-theme-customizer');
        
        console.group('🔍 Backdrop Status');
        console.log('Backdrops found:', backdrops.length);
        console.log('Customizer visible:', customizer ? customizer.style.display : 'not found');
        console.log('Body overflow:', document.body.style.overflow || 'normal');
        console.log('Body classes:', document.body.className);
        
        if (backdrops.length > 0) {
            backdrops.forEach((backdrop, index) => {
                console.log(`Backdrop ${index + 1}:`, {
                    class: backdrop.className,
                    zIndex: backdrop.style.zIndex || getComputedStyle(backdrop).zIndex,
                    display: backdrop.style.display || 'block'
                });
            });
        }
        console.groupEnd();
    };
    
    console.log('✅ Theme Backdrop Fix Loaded');
    console.log('💡 Commands available:');
    console.log('   fixBackdrop() - Remove all backdrops');
    console.log('   checkBackdrop() - Check backdrop status');
    
    // Initial cleanup if needed
    const backdrops = document.querySelectorAll('.gmkb-customizer-backdrop');
    const customizer = document.getElementById('gmkb-theme-customizer');
    if (backdrops.length > 0 && (!customizer || customizer.style.display !== 'flex')) {
        console.log('🧹 Initial cleanup - removing orphaned backdrops');
        removeAllBackdrops();
    }
    
})();
