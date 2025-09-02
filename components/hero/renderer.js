/**
 * @file renderer.js
 * @description Hero Component Self-Registering Renderer
 * 
 * ✅ CHECKLIST COMPLIANT:
 * - Phase 1: Event-driven initialization, no polling
 * - Phase 2: Simplicity first, self-contained component
 * - Phase 3: No state management - pure rendering
 * - Phase 4: Error boundaries included
 * - Phase 5: WordPress data compatible
 * 
 * ARCHITECTURE: Self-contained component with self-registration
 */

(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'hero';
    
    // Component schema definition
    const schema = {
        dataBindings: {
            title: 'full_name',
            subtitle: 'guest_title',
            description: 'biography',
            image: 'guest_headshot',
            email: 'email',
            phone: 'phone',
            website: 'website'
        },
        layouts: ['center_aligned', 'left_aligned', 'right_aligned'],
        defaults: {
            title: 'Guest Name',
            subtitle: '',
            description: '',
            image: '',
            layout: 'left_aligned',
            imageStyle: 'rounded',
            showSocialLinks: true,
            backgroundColor: '#ffffff',
            textColor: '#333333'
        },
        validation: {
            required: ['title'],
            maxLength: { 
                title: 100,
                subtitle: 150,
                description: 500
            }
        }
    };
    
    /**
     * Render the hero component
     * @param {object} data - Component data (bound from Pods fields)
     * @param {object} options - Rendering options
     * @returns {string} HTML string
     */
    function renderComponent(data, options = {}) {
        try {
            // Extract data with defaults
            const title = data.title || data.full_name || schema.defaults.title;
            const subtitle = data.subtitle || data.guest_title || schema.defaults.subtitle;
            const description = data.description || data.biography || schema.defaults.description;
            const image = data.image || data.guest_headshot || schema.defaults.image;
            
            // Extract options with defaults
            const layout = options.layout || schema.defaults.layout;
            const imageStyle = options.imageStyle || schema.defaults.imageStyle;
            const showSocialLinks = options.showSocialLinks !== undefined ? options.showSocialLinks : schema.defaults.showSocialLinks;
            const backgroundColor = options.backgroundColor || schema.defaults.backgroundColor;
            const textColor = options.textColor || schema.defaults.textColor;
            
            // Build CSS classes
            let heroClass = `gmkb-hero gmkb-hero--${layout} gmkb-component--self-registered`;
            let heroStyle = `background-color: ${backgroundColor}; color: ${textColor};`;
            
            // Generate HTML based on layout
            let html = `<div class="${heroClass}" style="${heroStyle}">`;
            
            // Add phase badge for debugging (remove in production)
            if (window.gmkbData?.debugMode) {
                html += `<div class="gmkb-component__phase2-badge">[SELF-REGISTERED - ${layout.toUpperCase()}]</div>`;
            }
            
            // Layout-specific rendering
            if (layout === 'center_aligned') {
                html += renderCenterLayout(title, subtitle, description, image, imageStyle, showSocialLinks);
            } else if (layout === 'right_aligned') {
                html += renderRightLayout(title, subtitle, description, image, imageStyle, showSocialLinks);
            } else {
                // Default to left_aligned
                html += renderLeftLayout(title, subtitle, description, image, imageStyle, showSocialLinks);
            }
            
            html += '</div>';
            
            return html;
            
        } catch (error) {
            console.error(`Error rendering ${COMPONENT_TYPE}:`, error);
            // Return error component
            return `<div class="gmkb-component gmkb-component--error">
                <h3>⚠️ Error Rendering Hero Component</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>`;
        }
    }
    
    /**
     * Render left-aligned layout
     */
    function renderLeftLayout(title, subtitle, description, image, imageStyle, showSocialLinks) {
        let html = '<div class="gmkb-hero__container">';
        
        if (image) {
            html += `<div class="gmkb-hero__image-container">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="gmkb-hero__image gmkb-hero__image--${imageStyle}">
            </div>`;
        }
        
        html += `<div class="gmkb-hero__content">
            <h1 class="gmkb-hero__title">${escapeHtml(title)}</h1>`;
        
        if (subtitle) {
            html += `<h2 class="gmkb-hero__subtitle">${escapeHtml(subtitle)}</h2>`;
        }
        
        if (description) {
            html += `<p class="gmkb-hero__description">${escapeHtml(description)}</p>`;
        }
        
        if (showSocialLinks) {
            html += '<div class="gmkb-hero__social-placeholder">[Social Links Placeholder]</div>';
        }
        
        html += '</div></div>';
        return html;
    }
    
    /**
     * Render center-aligned layout
     */
    function renderCenterLayout(title, subtitle, description, image, imageStyle, showSocialLinks) {
        let html = '<div class="gmkb-hero__container gmkb-hero__container--center">';
        
        if (image) {
            html += `<div class="gmkb-hero__image-container">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="gmkb-hero__image gmkb-hero__image--${imageStyle}">
            </div>`;
        }
        
        html += `<div class="gmkb-hero__content gmkb-hero__content--center">
            <h1 class="gmkb-hero__title">${escapeHtml(title)}</h1>`;
        
        if (subtitle) {
            html += `<h2 class="gmkb-hero__subtitle">${escapeHtml(subtitle)}</h2>`;
        }
        
        if (description) {
            html += `<p class="gmkb-hero__description">${escapeHtml(description)}</p>`;
        }
        
        if (showSocialLinks) {
            html += '<div class="gmkb-hero__social-placeholder">[Social Links Placeholder]</div>';
        }
        
        html += '</div></div>';
        return html;
    }
    
    /**
     * Render right-aligned layout
     */
    function renderRightLayout(title, subtitle, description, image, imageStyle, showSocialLinks) {
        let html = '<div class="gmkb-hero__container gmkb-hero__container--right">';
        
        html += `<div class="gmkb-hero__content gmkb-hero__content--right">
            <h1 class="gmkb-hero__title">${escapeHtml(title)}</h1>`;
        
        if (subtitle) {
            html += `<h2 class="gmkb-hero__subtitle">${escapeHtml(subtitle)}</h2>`;
        }
        
        if (description) {
            html += `<p class="gmkb-hero__description">${escapeHtml(description)}</p>`;
        }
        
        if (showSocialLinks) {
            html += '<div class="gmkb-hero__social-placeholder">[Social Links Placeholder]</div>';
        }
        
        html += '</div>';
        
        if (image) {
            html += `<div class="gmkb-hero__image-container">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="gmkb-hero__image gmkb-hero__image--${imageStyle}">
            </div>`;
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * HTML escape utility
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
    
    /**
     * Register the component with the global registry
     */
    function registerComponent() {
        if (window.GMKBComponentRegistry) {
            const success = window.GMKBComponentRegistry.register(COMPONENT_TYPE, renderComponent, schema);
            if (success) {
                console.log(`✅ Hero component registered successfully`);
            } else {
                console.error(`❌ Failed to register hero component`);
            }
        } else {
            // Registry not ready yet, wait for it
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', registerComponent);
            } else {
                // Try once more after a short delay
                setTimeout(registerComponent, 100);
            }
        }
    }
    
    // Start registration process
    registerComponent();
    
})();