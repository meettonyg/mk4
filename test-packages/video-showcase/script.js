/**
 * Video Showcase Component Script
 * 
 * @package GMKB/Components
 */

(function() {
    'use strict';
    
    // Component initialization
    function initVideoShowcase() {
        const components = document.querySelectorAll('.gmkb-video-showcase');
        
        components.forEach(component => {
            // Get component settings
            const grid = component.querySelector('.gmkb-video-showcase__grid');
            if (!grid) return;
            
            const layout = grid.dataset.layout || 'grid';
            const columns = parseInt(grid.dataset.columns) || 2;
            
            // Initialize based on layout
            if (layout === 'carousel') {
                initCarousel(component);
            }
            
            // Handle responsive video sizing
            handleResponsiveVideos(component);
        });
    }
    
    // Initialize carousel layout
    function initCarousel(component) {
        console.log('Video Showcase: Carousel layout initialized');
        // Carousel logic would go here
    }
    
    // Handle responsive video sizing
    function handleResponsiveVideos(component) {
        const videos = component.querySelectorAll('.gmkb-video-showcase__video-wrapper');
        
        videos.forEach(video => {
            // Maintain aspect ratio
            const iframe = video.querySelector('iframe');
            if (iframe) {
                iframe.addEventListener('load', function() {
                    console.log('Video loaded');
                });
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoShowcase);
    } else {
        initVideoShowcase();
    }
    
    // Reinitialize when new components are added
    document.addEventListener('gmkb:component-added', function(event) {
        if (event.detail && event.detail.type === 'video-showcase') {
            setTimeout(initVideoShowcase, 100);
        }
    });
    
    // Export for global access
    window.VideoShowcaseComponent = {
        init: initVideoShowcase,
        version: '1.0.0'
    };
})();
