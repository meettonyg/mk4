/**
 * GMKB Frontend Animations
 * Scroll-triggered animations for sections and components
 * 
 * @package GMKB
 * @since 2.1.0
 */

(function() {
    'use strict';
    
    // Configuration
    const config = {
        rootMargin: '-50px',
        threshold: 0.1,
        duration: window.gmkbFrontend?.animationDuration || 600
    };
    
    // Elements to animate
    const animatedElements = new Set();
    
    /**
     * Initialize animations
     */
    function init() {
        // Check for IntersectionObserver support
        if (!('IntersectionObserver' in window)) {
            // Fallback: Show all elements immediately
            showAllElements();
            return;
        }
        
        // Find all animated elements
        const elements = document.querySelectorAll('.gmkb-animate');
        if (elements.length === 0) return;
        
        // Create observer
        const observer = new IntersectionObserver(handleIntersection, config);
        
        // Observe each element
        elements.forEach(element => {
            animatedElements.add(element);
            observer.observe(element);
        });
        
        // Also handle section animations
        initSectionAnimations();
        initScrollAnimations();
    }
    
    /**
     * Handle intersection events
     */
    function handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Animate element
                animateElement(element);
                
                // Stop observing
                observer.unobserve(element);
                animatedElements.delete(element);
            }
        });
    }
    
    /**
     * Animate a single element
     */
    function animateElement(element) {
        // Add visible class
        element.classList.add('gmkb-animate--visible');
        
        // Check for specific animation type
        const animationType = element.dataset.animation;
        if (animationType) {
            element.style.animationDuration = `${config.duration}ms`;
        }
        
        // Trigger custom event
        element.dispatchEvent(new CustomEvent('gmkb:element-animated', {
            bubbles: true,
            detail: {
                element: element,
                animation: animationType
            }
        }));
    }
    
    /**
     * Initialize section-specific animations
     */
    function initSectionAnimations() {
        const sections = document.querySelectorAll('.gmkb-section');
        
        sections.forEach((section, index) => {
            // Add staggered delay for sections
            const delay = index * 100;
            
            // Check if section has background parallax
            if (section.dataset.parallax === 'true') {
                initParallax(section);
            }
            
            // Add reveal animation with delay
            if (section.classList.contains('gmkb-animate')) {
                section.style.transitionDelay = `${delay}ms`;
            }
        });
    }
    
    /**
     * Initialize parallax effect
     */
    function initParallax(section) {
        const speed = parseFloat(section.dataset.parallaxSpeed) || 0.5;
        
        // Create parallax update function
        const updateParallax = () => {
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate parallax offset
            const visible = rect.bottom > 0 && rect.top < windowHeight;
            if (visible) {
                const offset = (rect.top / windowHeight) * 100 * speed;
                section.style.backgroundPositionY = `${offset}%`;
            }
        };
        
        // Throttle scroll events
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        // Attach scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial update
        updateParallax();
    }
    
    /**
     * Animate on scroll for specific elements
     */
    function initScrollAnimations() {
        const scrollElements = document.querySelectorAll('[data-scroll-animation]');
        
        scrollElements.forEach(element => {
            const animation = element.dataset.scrollAnimation;
            const offset = parseInt(element.dataset.scrollOffset) || 0;
            
            // Create scroll handler
            const checkScroll = () => {
                const rect = element.getBoundingClientRect();
                const triggerPoint = window.innerHeight - offset;
                
                if (rect.top < triggerPoint && !element.classList.contains('animated')) {
                    element.classList.add('animated', `animation-${animation}`);
                }
            };
            
            // Check on scroll
            window.addEventListener('scroll', checkScroll, { passive: true });
            
            // Check initially
            checkScroll();
        });
    }
    
    /**
     * Fallback: Show all elements immediately
     */
    function showAllElements() {
        const elements = document.querySelectorAll('.gmkb-animate');
        elements.forEach(element => {
            element.classList.add('gmkb-animate--visible');
        });
    }
    
    /**
     * Trigger animation manually
     */
    function triggerAnimation(element) {
        if (element && element.classList.contains('gmkb-animate')) {
            animateElement(element);
        }
    }
    
    /**
     * Reset animation
     */
    function resetAnimation(element) {
        if (element) {
            element.classList.remove('gmkb-animate--visible', 'animated');
            // Force reflow
            void element.offsetWidth;
        }
    }
    
    /**
     * Public API
     */
    window.gmkbAnimations = {
        init: init,
        trigger: triggerAnimation,
        reset: resetAnimation,
        showAll: showAllElements
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
