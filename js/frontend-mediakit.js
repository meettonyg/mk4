/**
 * Frontend Media Kit Display JavaScript
 * 
 * ROOT IMPLEMENTATION: Minimal JS for component interactions
 * 
 * CHECKLIST COMPLIANCE:
 * ✅ No Polling: Event-driven only
 * ✅ Event-Driven: All interactions via event listeners
 * ✅ Simplicity First: Minimal code, only essential features
 * ✅ No Global Object Sniffing: Direct DOM queries
 */

(function() {
    'use strict';
    
    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMediaKitFrontend);
    } else {
        initMediaKitFrontend();
    }
    
    function initMediaKitFrontend() {
        // Check if we're on a media kit page
        const container = document.querySelector('.gmkb-frontend-wrapper');
        if (!container) {
            return;
        }
        
        const postId = container.dataset.postId;
        
        if (window.gmkbFrontend && window.gmkbFrontend.isMediaKit) {
            console.log('Media Kit Frontend: Initialized for post ' + postId);
        }
        
        // Initialize component interactions
        initComponentInteractions();
        
        // Initialize lazy loading for images
        initLazyLoading();
        
        // Initialize smooth scroll for anchor links
        initSmoothScroll();
    }
    
    /**
     * Initialize basic component interactions
     */
    function initComponentInteractions() {
        // Add click tracking for components
        document.querySelectorAll('.gmkb-component').forEach(component => {
            component.addEventListener('click', function(e) {
                // Only track if clicked element is not a link
                if (e.target.tagName !== 'A') {
                    const componentId = this.dataset.componentId;
                    const componentType = this.dataset.componentType;
                    
                    // Dispatch custom event for tracking
                    const event = new CustomEvent('gmkb:component-clicked', {
                        detail: {
                            id: componentId,
                            type: componentType
                        }
                    });
                    document.dispatchEvent(event);
                }
            });
        });
        
        // Add hover effects for interactive components
        document.querySelectorAll('.gmkb-component--social a, .gmkb-component--call-to-action button').forEach(element => {
            element.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    /**
     * Initialize lazy loading for images
     */
    function initLazyLoading() {
        // Check if browser supports Intersection Observer
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('.gmkb-component img[data-src]');
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
    
    /**
     * Initialize smooth scroll for anchor links
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    /**
     * Utility: Debounce function for performance
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Listen for print events to optimize layout
    window.addEventListener('beforeprint', function() {
        document.body.classList.add('gmkb-printing');
    });
    
    window.addEventListener('afterprint', function() {
        document.body.classList.remove('gmkb-printing');
    });
    
})();