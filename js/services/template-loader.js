/**
 * @file template-loader.js
 * @description Manages loading preset templates into the media kit.
 *
 * This version has been updated to use the new featureFlags object and the
 * enhancedStateManager, resolving module import errors and aligning with the new architecture.
 * It also defers DOM element lookups until the DOM is ready.
 */

import {
    enhancedStateManager
} from '../core/enhanced-state-manager.js';
import {
    featureFlags
} from '../core/feature-flags.js';
import {
    hideModal,
    showModal
} from '../modals/modal-base.js';
import {
    showToast
} from '../utils/toast-polyfill.js';

class TemplateLoader {
    constructor() {
        // Define properties but don't assign DOM elements yet.
        this.modal = null;
        this.grid = null;
        this.loadButton = null;
        this.cancelButton = null;
        this.openButton = null;
        this.selectedTemplate = null;
    }

    async init() {
        console.log('📁 Setting up Template Loader...');
        
        // Assign DOM elements inside init(), which is called after the DOM is ready.
        this.modal = document.getElementById('template-library-modal');
        this.grid = document.getElementById('template-grid');
        this.loadButton = document.getElementById('load-template-button');
        this.cancelButton = document.getElementById('cancel-template-button');
        this.openButton = document.getElementById('load-template-btn') || document.getElementById('load-template');

        if (!featureFlags.ENABLE_PRESET_TEMPLATES) {
            console.warn('Template library feature is disabled.');
            return Promise.resolve();
        }
        
        // Validate required elements
        if (!this.modal) {
            throw new Error('Template Loader: Modal not found (template-library-overlay)');
        }
        
        if (!this.grid) {
            throw new Error('Template Loader: Grid not found (template-grid)');
        }

        // The button in the empty state dispatches a custom event.
        document.addEventListener('show-template-library', () => this.show());
        
        // Empty state "Load Template" button (in preview area) - same ID as toolbar button
        const emptyStateTemplateButton = document.getElementById('load-template');
        if (emptyStateTemplateButton && !emptyStateTemplateButton.hasAttribute('data-listener-attached')) {
            emptyStateTemplateButton.addEventListener('click', () => {
                console.log('Empty state Load Template button clicked');
                this.show();
            });
            emptyStateTemplateButton.setAttribute('data-listener-attached', 'true');
            console.log('✅ Template Loader: Empty state button listener attached');
        }
        
        // Setup main open button
        if (this.openButton) {
            this.openButton.addEventListener('click', () => this.show());
            this.openButton.setAttribute('data-listener-attached', 'true');
            console.log('✅ Template Loader: Open button listener attached');
        }

        // Setup modal buttons
        if (this.loadButton) {
            this.loadButton.addEventListener('click', () => this.loadSelectedTemplate());
        }
        
        if (this.cancelButton) {
            this.cancelButton.addEventListener('click', () => this.hide());
        }
        
        // CLOSE BUTTON (× in upper right)
        const closeButton = document.getElementById('close-template-library');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                console.log('Template library close button (×) clicked');
                this.hide();
            });
        } else {
            console.warn('Template library close button not found (close-template-library)');
        }

        this.populateTemplateGrid();
        console.log('✅ Template Loader: Setup complete');
        return Promise.resolve();
    }

    show() {
        if (this.modal) {
            showModal('template-library-modal'); // Pass the ID string, not the element
        }
    }

    hide() {
        if (this.modal) {
            hideModal('template-library-modal'); // Pass the ID string, not the element
        }
    }

    populateTemplateGrid() {
        if (!this.grid || !window.guestifyData || !window.guestifyData.templates) {
            return;
        }

        this.grid.innerHTML = '';
        window.guestifyData.templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.dataset.templateId = template.id;
            card.innerHTML = `
                <img src="${template.thumbnail || ''}" alt="${template.name}" class="template-thumbnail">
                <div class="template-name">${template.name}</div>
            `;
            card.addEventListener('click', () => {
                this.selectTemplate(card, template.id);
            });
            this.grid.appendChild(card);
        });
    }

    selectTemplate(cardElement, templateId) {
        const currentlySelected = this.grid.querySelector('.template-card.selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }

        cardElement.classList.add('selected');
        this.selectedTemplate = templateId;
    }

    async loadSelectedTemplate() {
        if (!this.selectedTemplate) {
            showToast('Please select a template first.', 'error');
            return;
        }

        try {
            const response = await fetch(`${window.guestifyData.pluginUrl}templates/presets/${this.selectedTemplate}.json`);
            if (!response.ok) {
                throw new Error(`Template file not found for ${this.selectedTemplate}`);
            }
            const templateData = await response.json();

            if (templateData && templateData.layout && templateData.components) {
                enhancedStateManager.setInitialState(templateData);
                showToast(`Template '${this.selectedTemplate}' loaded successfully.`, 'success');
                this.hide();
            } else {
                throw new Error('Invalid template file format.');
            }
        } catch (error) {
            console.error('Error loading template:', error);
            showToast(`Error loading template: ${error.message}`, 'error');
        }
    }
}

export const templateLoader = new TemplateLoader();
