/**
 * @file renderer.js
 * @description Contact Component Self-Registering Renderer
 * 
 * ARCHITECTURE: Self-contained component with self-registration
 */

(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'contact';
    
    const schema = {
        dataBindings: {
            title: 'contact_title',
            email: 'email',
            phone: 'phone',
            website: 'website',
            address: 'address',
            city: 'city',
            state: 'state',
            country: 'country',
            postalCode: 'postal_code'
        },
        layouts: ['vertical', 'horizontal', 'grid', 'card'],
        defaults: {
            title: 'Contact Information',
            layout: 'vertical',
            showIcons: true,
            showLabels: true,
            showMap: false
        },
        validation: {
            required: [],
            email: ['email'],
            url: ['website']
        }
    };
    
    function renderComponent(data, options = {}) {
        try {
            const title = data.title || schema.defaults.title;
            const email = data.email || '';
            const phone = data.phone || '';
            const website = data.website || '';
            const address = data.address || '';
            const city = data.city || '';
            const state = data.state || '';
            const country = data.country || '';
            const postalCode = data.postalCode || data.postal_code || '';
            
            const layout = options.layout || schema.defaults.layout;
            const showIcons = options.showIcons !== undefined ? options.showIcons : schema.defaults.showIcons;
            const showLabels = options.showLabels !== undefined ? options.showLabels : schema.defaults.showLabels;
            
            let html = `<div class="gmkb-contact gmkb-contact--${layout} gmkb-component--self-registered">`;
            
            html += `<h3 class="gmkb-contact__title">${escapeHtml(title)}</h3>`;
            
            if (window.gmkbData?.debugMode) {
                html += `<div class="gmkb-component__phase2-badge">[SELF-REGISTERED - CONTACT]</div>`;
            }
            
            const contactItems = [];
            
            if (email) {
                const icon = showIcons ? '<span class="gmkb-contact__icon">📧</span>' : '';
                const label = showLabels ? '<strong>Email:</strong> ' : '';
                contactItems.push(`<div class="gmkb-contact__item gmkb-contact__item--email">
                    ${icon}${label}<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
                </div>`);
            }
            
            if (phone) {
                const icon = showIcons ? '<span class="gmkb-contact__icon">📞</span>' : '';
                const label = showLabels ? '<strong>Phone:</strong> ' : '';
                contactItems.push(`<div class="gmkb-contact__item gmkb-contact__item--phone">
                    ${icon}${label}<a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>
                </div>`);
            }
            
            if (website) {
                const icon = showIcons ? '<span class="gmkb-contact__icon">🌐</span>' : '';
                const label = showLabels ? '<strong>Website:</strong> ' : '';
                const displayUrl = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
                contactItems.push(`<div class="gmkb-contact__item gmkb-contact__item--website">
                    ${icon}${label}<a href="${escapeHtml(website)}" target="_blank" rel="noopener">${escapeHtml(displayUrl)}</a>
                </div>`);
            }
            
            const fullAddress = [address, city, state, postalCode, country].filter(Boolean).join(', ');
            if (fullAddress) {
                const icon = showIcons ? '<span class="gmkb-contact__icon">📍</span>' : '';
                const label = showLabels ? '<strong>Address:</strong> ' : '';
                contactItems.push(`<div class="gmkb-contact__item gmkb-contact__item--address">
                    ${icon}${label}${escapeHtml(fullAddress)}
                </div>`);
            }
            
            if (contactItems.length > 0) {
                if (layout === 'grid') {
                    html += `<div class="gmkb-contact__grid">${contactItems.join('')}</div>`;
                } else if (layout === 'horizontal') {
                    html += `<div class="gmkb-contact__horizontal">${contactItems.join('')}</div>`;
                } else if (layout === 'card') {
                    html += `<div class="gmkb-contact__card">
                        <div class="gmkb-contact__card-body">${contactItems.join('')}</div>
                    </div>`;
                } else {
                    html += `<div class="gmkb-contact__info">${contactItems.join('')}</div>`;
                }
            } else {
                html += '<p class="gmkb-contact__empty">No contact information available.</p>';
            }
            
            html += '</div>';
            return html;
            
        } catch (error) {
            console.error(`Error rendering ${COMPONENT_TYPE}:`, error);
            return `<div class="gmkb-component gmkb-component--error">
                <h3>⚠️ Error Rendering Contact</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>`;
        }
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
    
    function registerComponent() {
        if (window.GMKBComponentRegistry) {
            const success = window.GMKBComponentRegistry.register(COMPONENT_TYPE, renderComponent, schema);
            if (success) {
                console.log(`✅ Contact component registered successfully`);
            }
        } else {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', registerComponent);
            } else {
                setTimeout(registerComponent, 100);
            }
        }
    }
    
    registerComponent();
})();