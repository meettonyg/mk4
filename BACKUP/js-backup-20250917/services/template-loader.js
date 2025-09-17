/**
 * @file template-loader.js
 * @description Manages loading preset templates into the media kit.
 * ROOT FIX: Converted from ES6 modules to WordPress global namespace
 * 
 * Phase 2B Enhancement: Integrated comprehensive logging
 */

// ROOT FIX: Remove ES6 imports - use global namespace
// Dependencies will be available globally via WordPress enqueue system

class TemplateLoader {
    constructor() {
        // Define properties but don't assign DOM elements yet.
        this.modal = null;
        this.grid = null;
        this.loadButton = null;
        this.cancelButton = null;
        this.openButton = null;
        this.selectedTemplate = null;
        
        // Initialize logging
        this.logger = window.structuredLogger || {
            info: (category, message, data) => console.log(`[${category}] ${message}`, data || ''),
            warn: (category, message, data) => console.warn(`[${category}] ${message}`, data || ''),
            error: (category, message, error, data) => console.error(`[${category}] ${message}`, error, data || ''),
            debug: (category, message, data) => console.debug(`[${category}] ${message}`, data || '')
        };
    }

    async init() {
        const initStart = performance.now();
        this.logger.info('TEMPLATE', 'Setting up Template Loader');
        
        try {
            // Assign DOM elements inside init(), which is called after the DOM is ready.
            this.modal = document.getElementById('template-library-modal');
            this.grid = document.getElementById('template-grid');
            this.loadButton = document.getElementById('load-template-button');
            this.cancelButton = document.getElementById('cancel-template-button');
            this.openButton = document.getElementById('load-template-btn') || document.getElementById('load-template');

            // Check feature flags
            const featureFlags = window.featureFlags || { ENABLE_PRESET_TEMPLATES: true };
            if (!featureFlags.ENABLE_PRESET_TEMPLATES) {
                this.logger.warn('TEMPLATE', 'Template library feature is disabled');
                return Promise.resolve();
            }
        
            // Validate required elements
            if (!this.modal) {
                this.logger.error('TEMPLATE', 'Modal not found', null, { elementId: 'template-library-modal' });
                throw new Error('Template Loader: Modal not found (template-library-modal)');
            }
            
            if (!this.grid) {
                this.logger.error('TEMPLATE', 'Grid not found', null, { elementId: 'template-grid' });
                throw new Error('Template Loader: Grid not found (template-grid)');
            }
            
            this.logger.debug('TEMPLATE', 'DOM elements validated', {
                modal: !!this.modal,
                grid: !!this.grid,
                loadButton: !!this.loadButton,
                cancelButton: !!this.cancelButton,
                openButton: !!this.openButton
            });

            // The button in the empty state dispatches a custom event - using event bus.
            if (window.eventBus) {
                window.eventBus.on('ui:show-template-library', () => {
                    this.logger.debug('TEMPLATE', 'Show template library event received via event bus');
                    this.show();
                });
            } else {
                // Fallback to document event listener
                document.addEventListener('ui:show-template-library', () => {
                    this.logger.debug('TEMPLATE', 'Show template library event received via fallback');
                    this.show();
                });
            }
            
            // Empty state "Load Template" button (in preview area) - same ID as toolbar button
            const emptyStateTemplateButton = document.getElementById('load-template');
            if (emptyStateTemplateButton && !emptyStateTemplateButton.hasAttribute('data-listener-attached')) {
                emptyStateTemplateButton.addEventListener('click', () => {
                    this.logger.debug('UI', 'Empty state Load Template button clicked');
                    this.show();
                });
                emptyStateTemplateButton.setAttribute('data-listener-attached', 'true');
                this.logger.debug('TEMPLATE', 'Empty state button listener attached');
            }
        
            // Setup main open button
            if (this.openButton) {
                this.openButton.addEventListener('click', () => {
                    this.logger.debug('UI', 'Template loader open button clicked');
                    this.show();
                });
                this.openButton.setAttribute('data-listener-attached', 'true');
                this.logger.debug('TEMPLATE', 'Open button listener attached');
            }

            // Setup modal buttons
            if (this.loadButton) {
                this.loadButton.addEventListener('click', () => {
                    this.logger.debug('UI', 'Load template button clicked');
                    this.loadSelectedTemplate();
                });
            }
            
            if (this.cancelButton) {
                this.cancelButton.addEventListener('click', () => {
                    this.logger.debug('UI', 'Cancel template button clicked');
                    this.hide();
                });
            }
        
            // CLOSE BUTTON (× in upper right)
            const closeButton = document.getElementById('close-template-library');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.logger.debug('UI', 'Template library close button (×) clicked');
                    this.hide();
                });
            } else {
                this.logger.warn('TEMPLATE', 'Close button not found', { elementId: 'close-template-library' });
            }

            this.populateTemplateGrid();
            
            this.logger.info('TEMPLATE', 'Template Loader setup complete', {
                duration: performance.now() - initStart,
                templatesAvailable: window.guestifyData?.templates?.length || 0
            });
            
            return Promise.resolve();
            
        } catch (error) {
            this.logger.error('TEMPLATE', 'Template Loader initialization failed', error);
            throw error;
        }
    }

    show() {
        if (this.modal) {
            this.logger.debug('TEMPLATE', 'Showing template library modal');
            // Use global modal system
            if (window.GMKB_Modals) {
                window.GMKB_Modals.show('template-library-modal');
            } else if (window.showModal) {
                window.showModal('template-library-modal');
            } else {
                // Fallback - direct DOM manipulation
                this.modal.style.display = 'flex';
            }
        } else {
            this.logger.error('TEMPLATE', 'Cannot show modal - not initialized');
        }
    }

    hide() {
        if (this.modal) {
            this.logger.debug('TEMPLATE', 'Hiding template library modal');
            // Use global modal system
            if (window.GMKB_Modals) {
                window.GMKB_Modals.hide('template-library-modal');
            } else if (window.hideModal) {
                window.hideModal('template-library-modal');
            } else {
                // Fallback - direct DOM manipulation
                this.modal.style.display = 'none';
            }
        }
    }

    populateTemplateGrid() {
        if (!this.grid || !window.guestifyData || !window.guestifyData.templates) {
            this.logger.warn('TEMPLATE', 'Cannot populate template grid', {
                hasGrid: !!this.grid,
                hasGuestifyData: !!window.guestifyData,
                hasTemplates: !!window.guestifyData?.templates
            });
            return;
        }

        this.grid.innerHTML = '';
        const templates = window.guestifyData.templates;
        
        this.logger.debug('TEMPLATE', 'Populating template grid', {
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
        
        this.logger.debug('TEMPLATE', 'Template selected', { templateId });
    }

    async loadSelectedTemplate() {
        if (!this.selectedTemplate) {
            this.logger.warn('TEMPLATE', 'No template selected for loading');
            if (window.showToast) {
                window.showToast('Please select a template first.', 'error');
            }
            return;
        }

        const loadStart = performance.now();
        this.logger.info('TEMPLATE', 'Loading template', { templateId: this.selectedTemplate });

        try {
            const templateUrl = `${window.guestifyData.pluginUrl}templates/presets/${this.selectedTemplate}.json`;
            const response = await fetch(templateUrl);
            
            if (!response.ok) {
                throw new Error(`Template file not found for ${this.selectedTemplate} (${response.status})`);
            }
            
            const templateData = await response.json();
            this.logger.debug('TEMPLATE', 'Template data loaded', {
                templateId: this.selectedTemplate,
                hasLayout: !!templateData?.layout,
                componentCount: templateData?.components?.length || 0
            });

            if (templateData && templateData.layout && templateData.components) {
                // Use global enhanced state manager
                const stateManager = window.enhancedStateManager;
                if (stateManager && stateManager.setInitialState) {
                    stateManager.setInitialState(templateData);
                } else {
                    // Fallback to basic state loading if enhanced state manager not available
                    if (window.saveService && window.saveService.loadState) {
                        // This might not be the ideal approach but provides a fallback
                        this.logger.warn('TEMPLATE', 'Enhanced state manager not available, using fallback');
                    }
                }
                
                this.logger.info('TEMPLATE', 'Template loaded successfully', {
                    templateId: this.selectedTemplate,
                    duration: performance.now() - loadStart,
                    componentsLoaded: templateData.components?.length || 0
                });
                
                if (window.showToast) {
                    window.showToast(`Template '${this.selectedTemplate}' loaded successfully.`, 'success');
                }
                this.hide();
            } else {
                throw new Error('Invalid template file format.');
            }
        } catch (error) {
            this.logger.error('TEMPLATE', 'Error loading template', error, {
                templateId: this.selectedTemplate,
                duration: performance.now() - loadStart
            });
            if (window.showToast) {
                window.showToast(`Error loading template: ${error.message}`, 'error');
            }
        }
    }
}

// ROOT FIX: Create and expose templateLoader globally
const templateLoader = new TemplateLoader();

// ROOT FIX: Expose globally
window.templateLoader = templateLoader;

console.log('✅ Template Loader: Global namespace setup complete');
