/**
 * GMKB Frontend Lazy Loading
 * Performance optimization for media kit display
 * 
 * @package GMKB
 * @since 2.1.0
 */

(function() {
    'use strict';
    
    // Configuration
    const config = {
        rootMargin: window.gmkbFrontend?.lazyOffset ? `${window.gmkbFrontend.lazyOffset}px` : '200px',
        threshold: 0.01
    };
    
    // Components to lazy load
    const lazyComponents = new Set();
    
    /**
     * Initialize lazy loading
     */
    function init() {
        // Check for IntersectionObserver support
        if (!('IntersectionObserver' in window)) {
            // Fallback: Load all components immediately
            loadAllComponents();
            return;
        }
        
        // Find all lazy components
        const components = document.querySelectorAll('.gmkb-lazy');
        if (components.length === 0) return;
        
        // Create observer
        const observer = new IntersectionObserver(handleIntersection, config);
        
        // Observe each component
        components.forEach(component => {
            lazyComponents.add(component);
            observer.observe(component);
            
            // Add placeholder if needed
            if (!component.querySelector('.gmkb-lazy-placeholder')) {
                addPlaceholder(component);
            }
        });
    }
    
    /**
     * Handle intersection events
     */
    function handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const component = entry.target;
                
                // Load component
                loadComponent(component);
                
                // Stop observing
                observer.unobserve(component);
                lazyComponents.delete(component);
            }
        });
    }
    
    /**
     * Load a single component
     */
    function loadComponent(component) {
        const componentId = component.dataset.componentId;
        const componentType = component.dataset.componentType;
        
        // Check if component needs AJAX loading
        if (component.dataset.lazyLoad === 'ajax') {
            loadComponentViaAjax(component, componentId, componentType);
        } else {
            // Just reveal the component
            revealComponent(component);
        }
    }
    
    /**
     * Load component via AJAX
     */
    function loadComponentViaAjax(component, componentId, componentType) {
        const postId = component.closest('[data-media-kit-id]')?.dataset.mediaKitId;
        
        if (!postId || !componentType) {
            revealComponent(component);
            return;
        }
        
        // Prepare data
        const data = new FormData();
        data.append('action', 'gmkb_render_frontend_component');
        data.append('nonce', window.gmkbFrontend?.nonce || '');
        data.append('type', componentType);
        data.append('id', componentId);
        data.append('post_id', postId);
        
        // Get component props if stored
        const propsElement = component.querySelector('[data-component-props]');
        if (propsElement) {
            data.append('props', propsElement.dataset.componentProps);
        }
        
        // Fetch component HTML
        fetch(window.gmkbFrontend?.ajaxUrl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: data
        })
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data.html) {
                // Replace placeholder with actual content
                const placeholder = component.querySelector('.gmkb-lazy-placeholder');
                if (placeholder) {
                    placeholder.remove();
                }
                
                // Insert HTML
                component.innerHTML = result.data.html;
                
                // Reveal component
                revealComponent(component);
            } else {
                // Fallback: Just reveal what's there
                revealComponent(component);
            }
        })
        .catch(error => {
            console.error('Failed to load component:', error);
            revealComponent(component);
        });
    }
    
    /**
     * Reveal component with animation
     */
    function revealComponent(component) {
        // Remove placeholder
        const placeholder = component.querySelector('.gmkb-lazy-placeholder');
        if (placeholder) {
            placeholder.style.opacity = '0';
            setTimeout(() => placeholder.remove(), 300);
        }
        
        // Add loaded class
        component.classList.add('gmkb-lazy--loaded');
        
        // Trigger custom event
        component.dispatchEvent(new CustomEvent('gmkb:component-loaded', {
            bubbles: true,
            detail: {
                componentId: component.dataset.componentId,
                componentType: component.dataset.componentType
            }
        }));
    }
    
    /**
     * Add loading placeholder
     */
    function addPlaceholder(component) {
        const placeholder = document.createElement('div');
        placeholder.className = 'gmkb-lazy-placeholder';
        
        // Set min height based on component type
        const componentType = component.dataset.componentType;
        const heights = {
            'hero': '400px',
            'biography': '300px',
            'topics': '250px',
            'social': '150px',
            'contact': '200px'
        };
        
        placeholder.style.minHeight = heights[componentType] || '200px';
        
        // Insert as first child
        component.insertBefore(placeholder, component.firstChild);
    }
    
    /**
     * Fallback: Load all components immediately
     */
    function loadAllComponents() {
        const components = document.querySelectorAll('.gmkb-lazy');
        components.forEach(component => {
            component.classList.add('gmkb-lazy--loaded');
        });
    }
    
    /**
     * Public API
     */
    window.gmkbLazyLoad = {
        init: init,
        loadComponent: loadComponent,
        loadAll: loadAllComponents
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
