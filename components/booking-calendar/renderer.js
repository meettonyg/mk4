/**
 * @file renderer.js
 * @description Booking Calendar Component Self-Registering Renderer
 */
(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'booking-calendar';
    
    const schema = {
        dataBindings: {
            title: 'booking_title',
            calendarUrl: 'calendar_url',
            embedCode: 'calendar_embed',
            availability: 'availability_text'
        },
        layouts: ['default', 'embedded', 'link', 'minimal'],
        defaults: {
            title: 'Book a Speaking Engagement',
            layout: 'default',
            buttonText: 'Check Availability'
        }
    };
    
    function renderComponent(data, options = {}) {
        const title = data.title || schema.defaults.title;
        const calendarUrl = data.calendarUrl || data.calendar_url || '';
        const embedCode = data.embedCode || data.calendar_embed || '';
        const availability = data.availability || data.availability_text || '';
        const layout = options.layout || schema.defaults.layout;
        const buttonText = options.buttonText || schema.defaults.buttonText;
        
        let html = `<div class="gmkb-booking-calendar gmkb-booking-calendar--${layout}">
            <h3>${escapeHtml(title)}</h3>`;
        
        if (embedCode && layout === 'embedded') {
            html += `<div class="gmkb-booking-calendar__embed">${embedCode}</div>`;
        } else if (calendarUrl) {
            html += `<div class="gmkb-booking-calendar__link-container">`;
            if (availability) {
                html += `<p class="gmkb-booking-calendar__availability">${escapeHtml(availability)}</p>`;
            }
            html += `<a href="${escapeHtml(calendarUrl)}" target="_blank" class="gmkb-booking-calendar__button">
                ${escapeHtml(buttonText)}
            </a>`;
            html += `</div>`;
        } else {
            html += '<p>Booking calendar not configured.</p>';
        }
        
        html += '</div>';
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