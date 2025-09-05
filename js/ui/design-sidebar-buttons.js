/**
 * Design Sidebar Button Handlers
 * Phase 4: Theme Layer System
 * 
 * ROOT CAUSE FIX: Handles Global Theme Settings and Load Template buttons
 * Event-driven theme and template management
 * 
 * @version 1.0.0
 * @package GMKB/UI
 */

(function() {
    'use strict';
    
    class DesignSidebarButtons {
        constructor() {
            this.logger = window.structuredLogger || console;
            this.isInitialized = false;
            
            this.logger.info('DESIGN_SIDEBAR', 'Initializing Design Sidebar Buttons');
            
            // Wait for DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                this.init();
            }
        }
        
        /**
         * Initialize button handlers
         * Following checklist: Event-Driven Initialization, No Polling
         */
        init() {
            if (this.isInitialized) return;
            
            this.isInitialized = true;
            
            // Setup Global Theme Settings button
            this.setupGlobalThemeButton();
            
            // Setup Load Template button
            this.setupLoadTemplateButton();
            
            this.logger.info('DESIGN_SIDEBAR', 'Design Sidebar Buttons initialized');
        }
        
        /**
         * Setup Global Theme Settings button
         * Following checklist: Event-Driven, Root Cause Fix
         */
        setupGlobalThemeButton() {
            const button = document.getElementById('global-settings-btn');
            if (!button) {
                this.logger.warn('DESIGN_SIDEBAR', 'Global Theme Settings button not found');
                return;
            }
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleGlobalThemeClick();
            });
            
            this.logger.info('DESIGN_SIDEBAR', 'Global Theme Settings button handler attached');
        }
        
        /**
         * Setup Load Template button
         * Following checklist: Event-Driven, Root Cause Fix
         */
        setupLoadTemplateButton() {
            const button = document.getElementById('load-template');
            if (!button) {
                this.logger.warn('DESIGN_SIDEBAR', 'Load Template button not found');
                return;
            }
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLoadTemplateClick();
            });
            
            this.logger.info('DESIGN_SIDEBAR', 'Load Template button handler attached');
        }
        
        /**
         * Handle Global Theme Settings button click
         * Following checklist: Simplicity First, No Redundant Logic
         */
        handleGlobalThemeClick() {
            this.logger.info('DESIGN_SIDEBAR', 'Global Theme Settings button clicked');
            
            // Try Phase 4 Theme Customizer first
            if (window.themeCustomizer) {
                window.themeCustomizer.open();
                this.logger.info('DESIGN_SIDEBAR', 'Opened Theme Customizer');
                return;
            }
            
            // Try to dispatch event for theme customizer
            if (window.themeManager) {
                document.dispatchEvent(new CustomEvent('gmkb:open-theme-customizer', {
                    detail: { source: 'design-sidebar' }
                }));
                this.logger.info('DESIGN_SIDEBAR', 'Dispatched theme customizer event');
                return;
            }
            
            // Fallback to modal approach
            const modal = document.getElementById('global-settings-modal');
            if (modal && window.GMKB_Modals) {
                window.GMKB_Modals.show('global-settings-modal');
                this.logger.info('DESIGN_SIDEBAR', 'Opened global settings modal');
            } else {
                // Show message
                if (window.showToast) {
                    window.showToast('Theme settings are not available yet', 'warning', 3000);
                } else {
                    alert('Theme settings are not available yet');
                }
                this.logger.warn('DESIGN_SIDEBAR', 'No theme system available');
            }
        }
        
        /**
         * Handle Load Template button click
         * Following checklist: Simplicity First, Root Cause Fix
         */
        handleLoadTemplateClick() {
            this.logger.info('DESIGN_SIDEBAR', 'Load Template button clicked');
            
            // Check if template library exists
            const templateModal = document.getElementById('template-library-modal');
            if (templateModal && window.GMKB_Modals) {
                window.GMKB_Modals.show('template-library-modal');
                this.logger.info('DESIGN_SIDEBAR', 'Opened template library modal');
                return;
            }
            
            // Try to load templates via AJAX
            this.loadTemplatesFromServer();
        }
        
        /**
         * Load templates from server
         * Following checklist: WordPress Integration, Graceful Failure
         */
        async loadTemplatesFromServer() {
            if (!window.gmkbData || !window.gmkbData.ajaxUrl) {
                this.logger.warn('DESIGN_SIDEBAR', 'WordPress data not available for template loading');
                if (window.showToast) {
                    window.showToast('Template loading not available', 'warning');
                }
                return;
            }
            
            try {
                // Show loading state
                if (window.showToast) {
                    window.showToast('Loading templates...', 'info', 2000);
                }
                
                const formData = new FormData();
                formData.append('action', 'gmkb_get_templates');
                formData.append('nonce', window.gmkbData.nonce);
                
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.showTemplateSelector(data.data.templates);
                } else {
                    throw new Error(data.data || 'Failed to load templates');
                }
                
            } catch (error) {
                this.logger.error('DESIGN_SIDEBAR', 'Failed to load templates', error);
                
                // Show predefined templates as fallback
                this.showPredefinedTemplates();
            }
        }
        
        /**
         * Show template selector
         * Following checklist: Simplicity First
         */
        showTemplateSelector(templates) {
            // Create simple template selector modal
            const modal = document.createElement('div');
            modal.className = 'template-selector-modal';
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 24px;
                border-radius: 8px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 10000;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            `;
            
            modal.innerHTML = `
                <h2 style="margin-top: 0;">Select a Template</h2>
                <div class="template-list" style="display: grid; gap: 16px; margin: 20px 0;">
                    ${templates.map(template => `
                        <div class="template-item" data-template-id="${template.id}" style="
                            padding: 16px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: all 0.2s;
                        " onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#e5e7eb'">
                            <h3 style="margin: 0 0 8px 0;">${template.name}</h3>
                            <p style="margin: 0; color: #6b7280;">${template.description}</p>
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button onclick="this.closest('.template-selector-modal').remove()" style="
                        padding: 8px 16px;
                        border: 1px solid #d1d5db;
                        background: white;
                        border-radius: 6px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
            `;
            
            // Add click handlers for templates
            modal.querySelectorAll('.template-item').forEach(item => {
                item.addEventListener('click', () => {
                    const templateId = item.dataset.templateId;
                    this.loadTemplate(templateId);
                    modal.remove();
                });
            });
            
            // Add backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'template-selector-backdrop';
            backdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
            `;
            backdrop.addEventListener('click', () => {
                modal.remove();
                backdrop.remove();
            });
            
            document.body.appendChild(backdrop);
            document.body.appendChild(modal);
        }
        
        /**
         * Show predefined templates
         * Following checklist: Graceful Failure
         */
        showPredefinedTemplates() {
            const templates = [
                {
                    id: 'professional',
                    name: 'Professional Speaker',
                    description: 'Clean, professional layout for keynote speakers'
                },
                {
                    id: 'creative',
                    name: 'Creative Expert',
                    description: 'Bold, creative design for thought leaders'
                },
                {
                    id: 'minimal',
                    name: 'Minimalist',
                    description: 'Simple, elegant layout focused on content'
                },
                {
                    id: 'corporate',
                    name: 'Corporate Executive',
                    description: 'Traditional layout for business leaders'
                }
            ];
            
            this.showTemplateSelector(templates);
        }
        
        /**
         * Load selected template
         * Following checklist: Event-Driven, Centralized State
         */
        async loadTemplate(templateId) {
            this.logger.info('DESIGN_SIDEBAR', 'Loading template:', templateId);
            
            // Show loading state
            if (window.showToast) {
                window.showToast('Loading template...', 'info', 2000);
            }
            
            try {
                // Load template configuration
                const templateConfig = await this.getTemplateConfig(templateId);
                
                // Apply template components
                if (templateConfig.components && window.enhancedComponentManager) {
                    // Clear existing components
                    const state = window.enhancedStateManager?.getState();
                    if (state?.components) {
                        Object.keys(state.components).forEach(id => {
                            window.enhancedComponentManager.removeComponent(id);
                        });
                    }
                    
                    // Add template components
                    for (const component of templateConfig.components) {
                        await window.enhancedComponentManager.addComponent(component.type, component.props);
                    }
                }
                
                // Apply template theme
                if (templateConfig.theme && window.themeManager) {
                    window.themeManager.applyTheme(templateConfig.theme);
                }
                
                // Apply template sections
                if (templateConfig.sections && window.sectionLayoutManager) {
                    templateConfig.sections.forEach(section => {
                        window.sectionLayoutManager.createSection(section.type, section.options);
                    });
                }
                
                if (window.showToast) {
                    window.showToast('Template loaded successfully!', 'success', 3000);
                }
                
            } catch (error) {
                this.logger.error('DESIGN_SIDEBAR', 'Failed to load template', error);
                if (window.showToast) {
                    window.showToast('Failed to load template', 'error', 5000);
                }
            }
        }
        
        /**
         * Get template configuration
         * Following checklist: Schema Compliance
         */
        async getTemplateConfig(templateId) {
            // Predefined template configurations
            const templates = {
                professional: {
                    theme: 'professional_clean',
                    components: [
                        { type: 'hero', props: { layout: 'center' } },
                        { type: 'biography', props: { style: 'professional' } },
                        { type: 'topics', props: { columns: 2 } },
                        { type: 'contact', props: { style: 'minimal' } }
                    ],
                    sections: [
                        { type: 'full_width', options: {} }
                    ]
                },
                creative: {
                    theme: 'creative_bold',
                    components: [
                        { type: 'hero', props: { layout: 'asymmetric' } },
                        { type: 'biography', props: { style: 'creative' } },
                        { type: 'topics', props: { columns: 3 } },
                        { type: 'social', props: { style: 'colorful' } },
                        { type: 'contact', props: { style: 'bold' } }
                    ],
                    sections: [
                        { type: 'full_width', options: {} },
                        { type: 'two_column', options: { ratio: '60-40' } }
                    ]
                },
                minimal: {
                    theme: 'minimal_elegant',
                    components: [
                        { type: 'hero', props: { layout: 'minimal' } },
                        { type: 'biography', props: { style: 'minimal' } },
                        { type: 'contact', props: { style: 'minimal' } }
                    ],
                    sections: [
                        { type: 'full_width', options: { padding: 'large' } }
                    ]
                },
                corporate: {
                    theme: 'professional_clean',
                    components: [
                        { type: 'hero', props: { layout: 'corporate' } },
                        { type: 'biography', props: { style: 'formal' } },
                        { type: 'topics', props: { columns: 2, style: 'list' } },
                        { type: 'testimonials', props: {} },
                        { type: 'contact', props: { style: 'professional' } }
                    ],
                    sections: [
                        { type: 'full_width', options: {} },
                        { type: 'three_column', options: {} }
                    ]
                }
            };
            
            return templates[templateId] || templates.professional;
        }
    }
    
    // Initialize
    window.designSidebarButtons = new DesignSidebarButtons();
    
    console.log('✅ Design Sidebar Buttons: Ready (Theme Settings & Template Loading)');
    
})();
