/**
 * @file template-loader.js
 * @description Manages loading preset templates into the media kit.
 *
 * This version has been updated to use the new featureFlags object and the
 * enhancedStateManager, resolving module import errors and aligning with the new architecture.
 * It also defers DOM element lookups until the DOM is ready.
 * 
 * Phase 2B Enhancement: Integrated comprehensive logging
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
import { structuredLogger } from '../utils/structured-logger.js';
import { errorBoundary } from '../utils/error-boundary.js';
import { eventBus } from '../core/event-bus.js';

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
        const initStart = performance.now();
        structuredLogger.info('TEMPLATE', 'Setting up Template Loader');
        
        try {
            // Assign DOM elements inside init(), which is called after the DOM is ready.
            this.modal = document.getElementById('template-library-modal');
            this.grid = document.getElementById('template-grid');
            this.loadButton = document.getElementById('load-template-button');
            this.cancelButton = document.getElementById('cancel-template-button');
            this.openButton = document.getElementById('load-template-btn') || document.getElementById('load-template');

            if (!featureFlags.ENABLE_PRESET_TEMPLATES) {
                structuredLogger.warn('TEMPLATE', 'Template library feature is disabled');
                return Promise.resolve();
            }
        
            // Validate required elements
            if (!this.modal) {
                structuredLogger.error('TEMPLATE', 'Modal not found', null, { elementId: 'template-library-modal' });
                throw new Error('Template Loader: Modal not found (template-library-modal)');
            }
            
            if (!this.grid) {
                structuredLogger.error('TEMPLATE', 'Grid not found', null, { elementId: 'template-grid' });
                throw new Error('Template Loader: Grid not found (template-grid)');
            }
            
            structuredLogger.debug('TEMPLATE', 'DOM elements validated', {
                modal: !!this.modal,
                grid: !!this.grid,
                loadButton: !!this.loadButton,
                cancelButton: !!this.cancelButton,
                openButton: !!this.openButton
            });

            // The button in the empty state dispatches a custom event - using event bus.
            eventBus.on('ui:show-template-library', () => {
                structuredLogger.debug('TEMPLATE', 'Show template library event received via event bus');
                this.show();
            });
            
            // Empty state "Load Template" button (in preview area) - same ID as toolbar button
            const emptyStateTemplateButton = document.getElementById('load-template');
            if (emptyStateTemplateButton && !emptyStateTemplateButton.hasAttribute('data-listener-attached')) {
                emptyStateTemplateButton.addEventListener('click', () => {
                    structuredLogger.debug('UI', 'Empty state Load Template button clicked');
                    this.show();
                });
                emptyStateTemplateButton.setAttribute('data-listener-attached', 'true');
                structuredLogger.debug('TEMPLATE', 'Empty state button listener attached');
            }
        
            // Setup main open button
            if (this.openButton) {
                this.openButton.addEventListener('click', () => {
                    structuredLogger.debug('UI', 'Template loader open button clicked');
                    this.show();
                });
                this.openButton.setAttribute('data-listener-attached', 'true');
                structuredLogger.debug('TEMPLATE', 'Open button listener attached');
            }

            // Setup modal buttons
            if (this.loadButton) {
                this.loadButton.addEventListener('click', () => {
                    structuredLogger.debug('UI', 'Load template button clicked');
                    this.loadSelectedTemplate();
                });
            }
            
            if (this.cancelButton) {
                this.cancelButton.addEventListener('click', () => {
                    structuredLogger.debug('UI', 'Cancel template button clicked');
                    this.hide();
                });
            }
        
            // CLOSE BUTTON (× in upper right)
            const closeButton = document.getElementById('close-template-library');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    structuredLogger.debug('UI', 'Template library close button (×) clicked');
                    this.hide();
                });
            } else {
                structuredLogger.warn('TEMPLATE', 'Close button not found', { elementId: 'close-template-library' });
            }

            this.populateTemplateGrid();
            
            structuredLogger.info('TEMPLATE', 'Template Loader setup complete', {
                duration: performance.now() - initStart,
                templatesAvailable: window.guestifyData?.templates?.length || 0
            });
            
            return Promise.resolve();
            
        } catch (error) {
            structuredLogger.error('TEMPLATE', 'Template Loader initialization failed', error);
            throw error;
        }
    }

    show() {
        if (this.modal) {
            structuredLogger.debug('TEMPLATE', 'Showing template library modal');
            showModal('template-library-modal'); // Pass the ID string, not the element
        } else {
            structuredLogger.error('TEMPLATE', 'Cannot show modal - not initialized');
        }
    }

    hide() {
        if (this.modal) {
            structuredLogger.debug('TEMPLATE', 'Hiding template library modal');
            hideModal('template-library-modal'); // Pass the ID string, not the element
        }
    }

    populateTemplateGrid() {
        if (!this.grid || !window.guestifyData || !window.guestifyData.templates) {
            structuredLogger.warn('TEMPLATE', 'Cannot populate template grid', {
                hasGrid: !!this.grid,
                hasGuestifyData: !!window.guestifyData,
                hasTemplates: !!window.guestifyData?.templates
            });
            return;
        }

        this.grid.innerHTML = '';
        const templates = window.guestifyData.templates;
        
        structuredLogger.debug('TEMPLATE', 'Populating template grid', {
            templateCount: templates.length
        });
        
        templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.dataset.templateId = template.id;
            // Use CSS placeholder instead of missing images
            const thumbnailHtml = template.thumbnail ? 
                `<img src="${template.thumbnail}" alt="${template.name}" class="template-thumbnail" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : '';
            
            card.innerHTML = `
                ${thumbnailHtml}
                <div class="template-thumbnail-placeholder" style="${template.thumbnail ? 'display:none;' : 'display:flex;'} width:100%; height:150px; background:#f3f4f6; align-items:center; justify-content:center; color:#6b7280; font-size:14px; text-align:center; padding:20px;">
                    <div>
                        <div style="font-size:48px; margin-bottom:10px;">📄</div>
                        <div>${template.name}</div>
                    </div>
                </div>
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
        
        structuredLogger.debug('TEMPLATE', 'Template selected', { templateId });
    }

    async loadSelectedTemplate() {
        if (!this.selectedTemplate) {
            structuredLogger.warn('TEMPLATE', 'No template selected for loading');
            showToast('Please select a template first.', 'error');
            return;
        }

        const loadStart = performance.now();
        structuredLogger.info('TEMPLATE', 'Loading template', { templateId: this.selectedTemplate });

        try {
            const templateUrl = `${window.guestifyData.pluginUrl}templates/presets/${this.selectedTemplate}.json`;
            const response = await fetch(templateUrl);
            
            if (!response.ok) {
                throw new Error(`Template file not found for ${this.selectedTemplate} (${response.status})`);
            }
            
            const templateData = await response.json();
            structuredLogger.debug('TEMPLATE', 'Template data loaded', {
                templateId: this.selectedTemplate,
                hasLayout: !!templateData?.layout,
                componentCount: templateData?.components?.length || 0
            });

            if (templateData && templateData.layout && templateData.components) {
                enhancedStateManager.setInitialState(templateData);
                
                structuredLogger.info('TEMPLATE', 'Template loaded successfully', {
                    templateId: this.selectedTemplate,
                    duration: performance.now() - loadStart,
                    componentsLoaded: templateData.components.length
                });
                
                showToast(`Template '${this.selectedTemplate}' loaded successfully.`, 'success');
                this.hide();
            } else {
                throw new Error('Invalid template file format.');
            }
        } catch (error) {
            structuredLogger.error('TEMPLATE', 'Error loading template', error, {
                templateId: this.selectedTemplate,
                duration: performance.now() - loadStart
            });
            showToast(`Error loading template: ${error.message}`, 'error');
        }
    }
}

export const templateLoader = new TemplateLoader();
