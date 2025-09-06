/**
 * Consolidated Modal Extras
 * Combines: template-library.js, global-settings.js, export.js
 * 
 * ROOT FIX: Single file for extra modal functionality
 * Follows project checklist: No polling, event-driven, simplified code
 * 
 * @version 3.0.0-consolidated
 * @package GMKB
 */

(function() {
    'use strict';
    
    // ============================================
    // PART 1: Template Library
    // ============================================
    
    function setupTemplateLibrary() {
        // ROOT FIX: Use existing modal from PHP partial, don't create new one
        const existingModal = document.getElementById('template-library-modal');
        if (existingModal) {
            console.log('✅ Template Library: Found existing modal from PHP partial');
            setupExistingTemplateModal();
        } else {
            // Fallback: Create modal if PHP partial missing
            console.log('⚠️ Template Library: Creating fallback modal');
            createTemplateModal();
        }
        
        // Listen for show event
        document.addEventListener('show-template-library', () => {
            showTemplateLibrary();
        });
        
        // ROOT FIX: Setup proper event delegation for template selection
        setupTemplateSelectionHandlers();
    }

    function createTemplateModal() {
        const modal = document.createElement('div');
        modal.id = 'template-library-modal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal modal--large">
                <div class="modal__header">
                    <h2 class="modal__title">Choose a Template</h2>
                    <button class="modal__close" id="close-template-library" type="button">×</button>
                </div>
                <div class="modal__body">
                    <div class="template-grid" id="template-grid">
                        <!-- Templates will be populated here -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    function showTemplateLibrary() {
        const modal = document.getElementById('template-library-modal');
        if (modal) {
            // ROOT FIX: Populate templates with proper PHP structure
            populateTemplatesForPHPModal();
            if (window.GMKB_Modals && window.GMKB_Modals.show) {
                window.GMKB_Modals.show('template-library-modal');
            } else {
                modal.style.display = 'flex';
                modal.classList.add('library-modal--open');
            }
        } else {
            console.error('❌ Template Library: Modal not found');
        }
    }

    function hideTemplateLibrary() {
        if (window.GMKB_Modals && window.GMKB_Modals.hide) {
            window.GMKB_Modals.hide('template-library-modal');
        } else {
            const modal = document.getElementById('template-library-modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('modal--open');
                modal.classList.remove('library-modal--open');
            }
        }
    }
    
    // ROOT FIX: Setup existing template modal from PHP partial
    function setupExistingTemplateModal() {
        const modal = document.getElementById('template-library-modal');
        if (!modal) return;
        
        // Setup close button
        const closeBtn = modal.querySelector('#close-template-library');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                hideTemplateLibrary();
            });
        }
        
        // Setup Load Template button
        const loadBtn = modal.querySelector('#load-template-button');
        if (loadBtn) {
            loadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleLoadTemplate();
            });
        }
        
        // Setup Cancel button
        const cancelBtn = modal.querySelector('#cancel-template-button');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                hideTemplateLibrary();
            });
        }
    }
    
    // ROOT FIX: Setup template selection handlers for PHP structure
    function setupTemplateSelectionHandlers() {
        document.addEventListener('click', (e) => {
            // Handle template card clicks
            const templateCard = e.target.closest('.template-card');
            if (templateCard && templateCard.closest('#template-library-modal')) {
                // Remove active class from all cards
                document.querySelectorAll('.template-card').forEach(card => {
                    card.classList.remove('template-card--active');
                });
                // Add active class to clicked card
                templateCard.classList.add('template-card--active');
                
                // Enable Load Template button
                const loadBtn = document.querySelector('#load-template-button');
                if (loadBtn) {
                    loadBtn.disabled = false;
                    loadBtn.classList.add('btn--primary');
                    loadBtn.classList.remove('btn--disabled');
                }
            }
        });
    }
    
    // ROOT FIX: Populate templates for PHP modal structure
    function populateTemplatesForPHPModal() {
        const grid = document.getElementById('template-grid');
        if (!grid) {
            console.error('Template grid not found');
            return;
        }
        
        // Check if templates already exist (from PHP)
        const existingCards = grid.querySelectorAll('.template-card');
        if (existingCards.length > 0) {
            console.log('Templates already populated from PHP');
            return;
        }
        
        // Populate with default templates if empty
        const templates = [
            {
                id: 'professional-speaker',
                name: 'Professional Speaker',
                description: 'Complete speaker media kit with bio, topics, and social links'
            },
            {
                id: 'podcast-host',
                name: 'Podcast Host',
                description: 'Media kit focused on podcasting with stats and social presence'
            },
            {
                id: 'minimal-professional',
                name: 'Minimal Professional',
                description: 'Clean, simple layout with essential components only'
            }
        ];
        
        grid.innerHTML = templates.map(template => `
            <div class="template-card" data-template="${template.id}">
                <div class="template-preview">
                    <div class="template-preview-content">
                        <div class="preview-hero"></div>
                        <div class="preview-bio"></div>
                        <div class="preview-topics"></div>
                    </div>
                </div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <p>${template.description}</p>
                </div>
            </div>
        `).join('');
    }
    
    // ROOT FIX: Handle Load Template button click
    function handleLoadTemplate() {
        const activeCard = document.querySelector('.template-card--active');
        if (!activeCard) {
            if (window.showToast) {
                window.showToast('Please select a template first', 'warning');
            } else {
                alert('Please select a template first');
            }
            return;
        }
        
        const templateId = activeCard.dataset.template;
        console.log('Loading template:', templateId);
        
        // Apply the selected template
        applyTemplate(templateId);
        
        // Close modal
        hideTemplateLibrary();
    }
    
    // ROOT FIX: Apply template to media kit
    function applyTemplate(templateId) {
        console.log('Applying template:', templateId);
        
        // Show loading message
        if (window.showToast) {
            window.showToast('Loading template...', 'info', 2000);
        }
        
        // Template configurations
        const templates = {
            'professional-speaker': {
                components: [
                    { type: 'hero', props: {} },
                    { type: 'biography', props: {} },
                    { type: 'topics', props: {} },
                    { type: 'contact', props: {} },
                    { type: 'social', props: {} }
                ],
                theme: 'professional_clean'
            },
            'podcast-host': {
                components: [
                    { type: 'hero', props: {} },
                    { type: 'stats', props: {} },
                    { type: 'biography', props: {} },
                    { type: 'topics', props: {} },
                    { type: 'social', props: {} },
                    { type: 'podcast-player', props: {} }
                ],
                theme: 'creative_bold'
            },
            'minimal-professional': {
                components: [
                    { type: 'hero', props: {} },
                    { type: 'biography', props: {} },
                    { type: 'contact', props: {} }
                ],
                theme: 'minimal_elegant'
            }
        };
        
        const template = templates[templateId];
        if (!template) {
            console.error('Template not found:', templateId);
            return;
        }
        
        // Clear existing components
        if (window.enhancedComponentManager) {
            const state = window.enhancedStateManager?.getState();
            if (state?.components) {
                Object.keys(state.components).forEach(id => {
                    window.enhancedComponentManager.removeComponent(id, true); // Skip confirmation
                });
            }
        }
        
        // Add template components
        if (window.enhancedComponentManager && template.components) {
            template.components.forEach((component, index) => {
                setTimeout(() => {
                    window.enhancedComponentManager.addComponent(component.type, component.props);
                }, index * 100); // Stagger component addition
            });
        }
        
        // Apply theme if available
        if (template.theme && window.themeManager) {
            window.themeManager.loadTheme(template.theme);
        }
        
        // Show success message
        setTimeout(() => {
            if (window.showToast) {
                window.showToast('Template loaded successfully!', 'success', 3000);
            }
        }, 1000);
    }

    // Keep original populateTemplates for fallback modal
    function populateTemplates() {
        const grid = document.getElementById('template-grid');
        if (!grid) return;
        
        const templates = window.templateLoader ? window.templateLoader.getTemplates() : [];
        
        grid.innerHTML = templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-card__preview">
                    <div class="template-card__placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                    </div>
                </div>
                <div class="template-card__info">
                    <h3 class="template-card__name">${template.name}</h3>
                    <p class="template-card__description">${template.description}</p>
                </div>
                <button class="template-card__select">Use This Template</button>
            </div>
        `).join('');
        
        // Add blank template option
        grid.innerHTML += `
            <div class="template-card template-card--blank" data-template-id="blank">
                <div class="template-card__preview">
                    <div class="template-card__placeholder template-card__placeholder--blank">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-dasharray="3 3"></rect>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                    </div>
                </div>
                <div class="template-card__info">
                    <h3 class="template-card__name">Blank Canvas</h3>
                    <p class="template-card__description">Start from scratch and build your own</p>
                </div>
                <button class="template-card__select">Start Blank</button>
            </div>
        `;
    }

    async function selectTemplate(templateId) {
        if (templateId === 'blank') {
            hideTemplateLibrary();
            return;
        }
        
        const modal = document.getElementById('template-library-modal');
        const modalBody = modal.querySelector('.modal__body');
        const originalContent = modalBody.innerHTML;
        
        modalBody.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading template...</p>
            </div>
        `;
        
        try {
            if (window.templateLoader) {
                await window.templateLoader.loadTemplate(templateId);
            }
            hideTemplateLibrary();
        } catch (error) {
            console.error('Failed to load template:', error);
            modalBody.innerHTML = `
                <div class="error-state">
                    <p>Failed to load template. Please try again.</p>
                    <button class="btn btn--primary" onclick="location.reload()">Refresh</button>
                </div>
            `;
            setTimeout(() => {
                modalBody.innerHTML = originalContent;
            }, 3000);
        }
    }

    // ============================================
    // PART 2: Global Settings
    // ============================================
    
    class GlobalSettings {
        constructor() {
            this.modal = null;
            this.form = null;
            this.openButton = null;
            this.isInitialized = false;
        }

        async init() {
            if (this.isInitialized) return Promise.resolve();
            
            console.log('🗺 GMKB: Initializing Global Settings...');
            
            try {
                this.modal = document.getElementById('global-settings-modal');
                this.openButton = document.getElementById('global-theme-btn') || 
                                 document.getElementById('global-settings-button') || 
                                 document.getElementById('global-settings-btn');
                
                if (!this.modal) {
                    console.warn('⚠️ GMKB: Global Settings modal not found');
                    return Promise.resolve();
                }
                
                if (this.openButton) {
                    this.openButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.show();
                    });
                }
                
                this.form = document.getElementById('global-settings-form');
                if (this.form) {
                    this.setupFormListeners();
                }
                
                this.isInitialized = true;
                console.log('✅ GMKB: Global Settings initialized');
                return Promise.resolve();
                
            } catch (error) {
                console.warn('⚠️ GMKB: Global Settings initialization failed:', error);
                return Promise.resolve();
            }
        }
        
        setupFormListeners() {
            if (!this.form) return;
            
            let updateTimeout;
            const debouncedUpdate = () => {
                if (updateTimeout) clearTimeout(updateTimeout);
                updateTimeout = setTimeout(() => {
                    this.updateSettings();
                }, 300);
            };
            
            this.form.addEventListener('input', debouncedUpdate);
            this.form.addEventListener('change', debouncedUpdate);
            
            const paletteOptions = this.modal.querySelectorAll('.palette-option');
            paletteOptions.forEach(option => {
                option.addEventListener('click', () => {
                    paletteOptions.forEach(opt => opt.classList.remove('palette-option--active'));
                    option.classList.add('palette-option--active');
                    debouncedUpdate();
                });
            });
        }
        
        show() {
            if (window.GMKB_Modals && window.GMKB_Modals.show) {
                window.GMKB_Modals.show('global-settings-modal');
            } else if (this.modal) {
                this.modal.style.display = 'flex';
                this.modal.classList.add('modal--open');
                document.body.classList.add('modal-open');
            }
        }
        
        hide() {
            if (window.GMKB_Modals && window.GMKB_Modals.hide) {
                window.GMKB_Modals.hide('global-settings-modal');
            } else if (this.modal) {
                this.modal.style.display = 'none';
                this.modal.classList.remove('modal--open');
                document.body.classList.remove('modal-open');
            }
        }
        
        updateSettings() {
            try {
                if (!this.form) return;
                
                const formData = new FormData(this.form);
                const settings = {};
                
                for (const [key, value] of formData.entries()) {
                    settings[key] = value;
                }
                
                const activePalette = this.modal.querySelector('.palette-option--active');
                if (activePalette) {
                    settings.colorPalette = activePalette.dataset.palette;
                }
                
                console.log('🎨 GMKB: Global settings updated:', settings);
                
                if (window.GMKB?.systems?.StateManager) {
                    window.GMKB.systems.StateManager.updateGlobalSettings(settings);
                }
                
            } catch (error) {
                console.warn('⚠️ GMKB: Error updating global settings:', error);
            }
        }
    }

    // ============================================
    // PART 3: Export Modal
    // ============================================
    
    let exportModalElement;

    function initExportSystem() {
        console.log('🔄 Initializing Export System...');
        exportModalElement = document.getElementById('export-modal');

        if (!exportModalElement) {
            console.error('Export modal element not found');
            return;
        }

        setupExportEventListeners();
        console.log('✅ Export System Initialized');
    }

    function setupExportEventListeners() {
        if (!exportModalElement) return;
        
        const closeButtons = exportModalElement.querySelectorAll('.modal__close, [data-modal-close]');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.GMKB_Modals?.hide) {
                    window.GMKB_Modals.hide('export-modal');
                }
            });
        });

        const exportButton = exportModalElement.querySelector('#export-button');
        if (exportButton) {
            exportButton.addEventListener('click', handleExport);
        }

        const formatSelectors = exportModalElement.querySelectorAll('input[name="export-format"]');
        formatSelectors.forEach(radio => {
            radio.addEventListener('change', handleFormatChange);
        });
    }

    function handleExport() {
        if (!exportModalElement) return;
        
        const selectedFormat = exportModalElement.querySelector('input[name="export-format"]:checked');
        if (!selectedFormat) {
            alert('Please select an export format.');
            return;
        }

        const format = selectedFormat.value;
        console.log(`🚀 Starting export for format: ${format}`);
        alert(`Exporting as ${format}... (This is a placeholder)`);

        if (window.GMKB_Modals?.hide) {
            window.GMKB_Modals.hide('export-modal');
        }
    }

    function handleFormatChange(e) {
        const selectedFormat = e.target.value;
        console.log(`Format changed to: ${selectedFormat}`);
    }

    // ============================================
    // PART 4: Template Styles
    // ============================================
    
    const templateStyles = `
        /* ROOT FIX: Styles for PHP template modal structure */
        .library-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            align-items: center;
            justify-content: center;
        }
        
        .library-modal--open {
            display: flex !important;
        }
        
        .library {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 1200px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .library__header {
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .library__title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 20px;
            font-weight: 600;
            color: #111827;
        }
        
        .library__title svg {
            width: 24px;
            height: 24px;
        }
        
        .library__close {
            background: none;
            border: none;
            font-size: 24px;
            color: #6b7280;
            cursor: pointer;
            padding: 4px 8px;
            transition: color 0.2s;
        }
        
        .library__close:hover {
            color: #111827;
        }
        
        .library__content {
            flex: 1;
            overflow: hidden;
            display: flex;
        }
        
        .library__main {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
        }
        
        .library__section-header {
            margin-bottom: 20px;
        }
        
        .library__section-header h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: #111827;
        }
        
        .library__section-header p {
            margin: 0;
            color: #6b7280;
        }
        
        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }
        
        .template-card {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
        }
        
        .template-card:hover {
            border-color: #3b82f6;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .template-card--active {
            border-color: #3b82f6;
            background: #eff6ff;
        }
        
        .template-preview {
            height: 120px;
            background: #f9fafb;
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .template-preview-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .preview-hero,
        .preview-bio,
        .preview-topics,
        .preview-stats,
        .preview-social {
            background: #d1d5db;
            border-radius: 2px;
            flex: 1;
        }
        
        .preview-hero {
            flex: 2;
            background: #3b82f6;
        }
        
        .preview-bio {
            background: #6b7280;
        }
        
        .preview-topics {
            background: #9ca3af;
        }
        
        .template-info {
            padding: 16px;
        }
        
        .template-info h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: #111827;
        }
        
        .template-info p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
        }
        
        .library__footer {
            padding: 16px 24px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }
        
        .library__footer .btn {
            padding: 8px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }
        
        .library__footer .btn--secondary {
            background: white;
            border: 1px solid #d1d5db;
            color: #374151;
        }
        
        .library__footer .btn--secondary:hover {
            background: #f9fafb;
        }
        
        .library__footer .btn--primary {
            background: #3b82f6;
            color: white;
        }
        
        .library__footer .btn--primary:hover {
            background: #2563eb;
        }
        
        .library__footer .btn--primary:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        
        /* Original template styles for fallback modal */
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
            padding: 20px;
        }
        
        .template-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.2s;
            cursor: pointer;
        }
        
        .template-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #cbd5e1;
        }
        
        .template-card__preview {
            height: 160px;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .template-card__placeholder {
            color: #64748b;
        }
        
        .template-card__placeholder--blank {
            color: #cbd5e1;
        }
        
        .template-card__info {
            padding: 20px;
        }
        
        .template-card__name {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 8px 0;
        }
        
        .template-card__description {
            font-size: 14px;
            color: #64748b;
            margin: 0 0 16px 0;
            line-height: 1.5;
        }
        
        .template-card__select {
            width: calc(100% - 40px);
            padding: 10px 16px;
            background: #0ea5e9;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
            margin: 0 20px 20px 20px;
        }
        
        .template-card__select:hover {
            background: #0284c7;
        }
        
        .template-card--blank .template-card__select {
            background: transparent;
            color: #64748b;
            border: 1px solid #e2e8f0;
        }
        
        .template-card--blank .template-card__select:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
        }
        
        .loading-state,
        .error-state {
            text-align: center;
            padding: 60px 20px;
            color: #64748b;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top-color: #0ea5e9;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;

    // Add template styles if not already added
    if (!document.getElementById('gmkb-template-styles')) {
        const style = document.createElement('style');
        style.id = 'gmkb-template-styles';
        style.textContent = templateStyles;
        document.head.appendChild(style);
    }

    // ============================================
    // PART 5: Initialize and Export
    // ============================================
    
    // Create global settings instance
    const globalSettings = new GlobalSettings();
    
    // Initialize all systems
    function initializeModalExtras() {
        setupTemplateLibrary();
        globalSettings.init();
        initExportSystem();
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeModalExtras);
    } else {
        initializeModalExtras();
    }
    
    // Also listen for GMKB ready
    document.addEventListener('gmkb:ready', initializeModalExtras, { once: true });
    
    // Export global APIs
    window.templateLibrary = {
        setup: setupTemplateLibrary,
        show: showTemplateLibrary,
        hide: hideTemplateLibrary
    };
    
    window.globalSettings = globalSettings;
    window.GMKBGlobalSettings = globalSettings;
    
    window.GMKBExportSystem = {
        init: initExportSystem,
        setupEventListeners: setupExportEventListeners,
        handleExport,
        handleFormatChange
    };
    
    console.log('✅ Consolidated Modal Extras: Ready (template-library + global-settings + export)');
    
})();
