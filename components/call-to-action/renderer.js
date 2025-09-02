/**
 * @file renderer.js
 * @description Call to Action Component Self-Registering Renderer
 */
(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'call-to-action';
    
    const schema = {
        dataBindings: {
            title: 'cta_title',
            text: 'cta_text',
            buttonText: 'cta_button_text',
            buttonUrl: 'cta_button_url'
        },
        layouts: ['default', 'centered', 'banner', 'minimal'],
        defaults: {
            title: 'Ready to Get Started?',
            text: '',
            buttonText: 'Contact Us',
            buttonUrl: '#contact',
            layout: 'default'
        }
    };
    
    function renderComponent(data, options = {}) {
        const title = data.title || schema.defaults.title;
        const text = data.text || data.cta_text || schema.defaults.text;
        const buttonText = data.buttonText || data.cta_button_text || schema.defaults.buttonText;
        const buttonUrl = data.buttonUrl || data.cta_button_url || schema.defaults.buttonUrl;
        const layout = options.layout || schema.defaults.layout;
        
        let html = `<div class="gmkb-cta gmkb-cta--${layout}">`;
        
        if (layout === 'centered') {
            html += '<div class="gmkb-cta__content gmkb-cta__content--centered">';
        } else if (layout === 'banner') {
            html += '<div class="gmkb-cta__banner">';
        } else {
            html += '<div class="gmkb-cta__content">';
        }
        
        html += `<h3 class="gmkb-cta__title">${escapeHtml(title)}</h3>`;
        
        if (text) {
            html += `<p class="gmkb-cta__text">${escapeHtml(text)}</p>`;
        }
        
        if (buttonText) {
            html += `<a href="${escapeHtml(buttonUrl)}" class="gmkb-cta__button">${escapeHtml(buttonText)}</a>`;
        }
        
        html += '</div></div>';
        return html;
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
    
    window.GMKBComponentRegistry?.register(COMPONENT_TYPE, renderComponent, schema) || 
    setTimeout(() => window.GMKBComponentRegistry?.register(COMPONENT_TYPE, renderComponent, schema), 100);
})();