/**
 * Consolidated Toolbar System
 * Combines: toolbar.js and toolbar-interactions.js
 * 
 * ROOT FIX: Single file for all toolbar functionality to reduce script count
 * Follows project checklist: No polling, event-driven, simplified code
 * 
 * @version 3.0.0-consolidated
 * @package GMKB
 */

(function() {
    'use strict';
    
    // ============================================
    // PART 1: Core Toolbar Class
    // ============================================
    
    class ConsolidatedToolbar {
        constructor() {
            // Core dependencies
            this.logger = window.structuredLogger || console;
            this.eventBus = window.eventBus;
            
            // State flags
            this.isInitialized = false;
            this.saveInProgress = false;
            this.lastSaveTime = null;
            this._toolbarInitialized = false;
            this._devicePreviewInitialized = false;
            
            // Button references
            this.buttons = {};
            this.statusIndicator = null;
            
            // Auto-save settings
            this.autoSaveEnabled = true;
            this.autoSaveInterval = 30000; // 30 seconds
            this.autoSaveTimer = null;
            
            // Toast function with fallback
            this.showToast = window.showToast || function(message, type = 'info', duration = 3000) {
                console.log(`[${type.toUpperCase()}] ${message}`);
                if (type === 'error') {
                    setTimeout(() => alert(`Error: ${message}`), 100);
                }
            };
            
            // Initialize when ready
            this.waitForDependencies(() => {
                this.init();
            });
        }
        
        /**
         * Wait for required dependencies
         */
        waitForDependencies(callback) {
            const checkDependencies = () => {
                // Check for essential dependencies
                if (document.readyState !== 'loading') {
                    // Add small delay for template rendering
                    setTimeout(callback, 100);
                } else {
                    document.addEventListener('DOMContentLoaded', () => {
                        setTimeout(callback, 100);
                    });
                }
            };
            checkDependencies();
        }
        
        /**
         * Initialize toolbar system
         */
        init() {
            if (this.isInitialized) {
                this.logger.warn('TOOLBAR', 'Already initialized');
                return;
            }
            
            this.logger.info('TOOLBAR', 'Initializing consolidated toolbar system');
            
            // Mark as initialized early to prevent duplicates
            this.isInitialized = true;
            window._toolbarInitialized = true;
            
            // Setup all toolbar components
            this.getButtonReferences();
            this.setupDevicePreviewToggle();
            this.setupButtonHandlers();
            this.setupKeyboardShortcuts();
            this.setupButtonStateMonitoring();
            this.setupAutoSave();
            this.setupStateListeners();
            this.setupExistingModalHandlers();
            
            // Update initial states
            this.updateButtonStates();
            
            this.logger.info('TOOLBAR', 'Toolbar system initialized successfully');
            
            // Emit initialization event
            if (this.eventBus) {
                this.eventBus.emit('toolbar:initialized', {
                    buttons: this.getButtonStatus(),
                    autoSaveEnabled: this.autoSaveEnabled
                });
            }
        }
        
        /**
         * Get references to toolbar buttons
         */
        getButtonReferences() {
            const buttonIds = {
                saveBtn: 'save-btn',
                exportBtn: 'export-btn',
                undoBtn: 'undo-btn',
                redoBtn: 'redo-btn',
                themeBtn: 'global-theme-btn',
                shareBtn: 'share-btn'
            };
            
            Object.entries(buttonIds).forEach(([key, id]) => {
                this.buttons[key] = document.getElementById(id);
                if (this.buttons[key]) {
                    this.logger.debug('TOOLBAR', `Found button: ${id}`);
                }
            });
            
            this.statusIndicator = document.querySelector('.toolbar__status');
        }
        
        /**
         * Setup device preview toggle (from toolbar.js)
         */
        setupDevicePreviewToggle() {
            if (this._devicePreviewInitialized) return;
            
            const previewButtons = document.querySelectorAll('.toolbar__preview-btn');
            const previewContainer = document.getElementById('preview-container') || 
                                  document.querySelector('.preview__container, .preview');
            
            if (!previewButtons.length || !previewContainer) {
                this.logger.warn('TOOLBAR', 'Preview elements not found');
                return;
            }
            
            this._devicePreviewInitialized = true;
            
            previewButtons.forEach(button => {
                if (button.hasAttribute('data-preview-listener-attached')) return;
                button.setAttribute('data-preview-listener-attached', 'true');
                
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const previewMode = button.getAttribute('data-preview');
                    if (!previewMode) return;
                    
                    // Update button states
                    previewButtons.forEach(btn => btn.classList.remove('toolbar__preview-btn--active'));
                    button.classList.add('toolbar__preview-btn--active');
                    
                    // Update preview container
                    previewContainer.classList.remove('preview--desktop', 'preview--tablet', 'preview--mobile');
                    previewContainer.classList.add('preview--' + previewMode);
                    previewContainer.setAttribute('data-preview-mode', previewMode);
                    
                    // Emit event
                    document.dispatchEvent(new CustomEvent('gmkb:preview-changed', {
                        detail: { mode: previewMode, timestamp: Date.now() }
                    }));
                    
                    // Show feedback
                    const modeNames = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };
                    this.showToast(`Switched to ${modeNames[previewMode]} view`, 'info', 2000);
                });
            });
        }
        
        /**
         * Setup all button handlers
         */
        setupButtonHandlers() {
            // Save button
            if (this.buttons.saveBtn) {
                this.buttons.saveBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleSaveClick();
                });
            }
            
            // Export button
            if (this.buttons.exportBtn) {
                this.buttons.exportBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleExportClick();
                });
            }
            
            // Undo button
            if (this.buttons.undoBtn) {
                this.buttons.undoBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleUndoClick();
                });
            }
            
            // Redo button
            if (this.buttons.redoBtn) {
                this.buttons.redoBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleRedoClick();
                });
            }
            
            // Theme button
            if (this.buttons.themeBtn) {
                this.buttons.themeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleThemeClick();
                });
            }
            
            // Share button
            if (this.buttons.shareBtn) {
                this.buttons.shareBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleShareClick();
                });
            }
        }
        
        /**
         * Handle save button click
         */
        handleSaveClick() {
            if (this.saveInProgress) {
                this.logger.warn('TOOLBAR', 'Save already in progress');
                return;
            }
            
            try {
                this.logger.info('TOOLBAR', 'Save button clicked');
                this.setSavingState(true);
                
                // Check GMKB system
                if (!window.GMKB || !window.GMKB.dispatch) {
                    throw new Error('GMKB system not available. Please refresh the page.');
                }
                
                // Dispatch save request
                window.GMKB.dispatch('gmkb:save-requested', {
                    source: 'toolbar',
                    timestamp: Date.now(),
                    onComplete: (response) => {
                        this.handleSaveSuccess();
                    },
                    onError: (error) => {
                        this.handleSaveError(new Error(error.error || 'Save failed'));
                    }
                });
                
            } catch (error) {
                this.handleSaveError(error);
            }
        }
        
        /**
         * Handle save success
         */
        handleSaveSuccess() {
            this.lastSaveTime = new Date();
            this.setSavingState(false);
            this.updateStatusIndicator('saved', 'Saved');
            this.showToast('Media kit saved successfully!', 'success', 3000);
            
            if (this.eventBus) {
                this.eventBus.emit('toolbar:save-success', {
                    timestamp: this.lastSaveTime,
                    source: 'manual'
                });
            }
            
            setTimeout(() => this.updateStatusIndicator('ready', 'Ready'), 3000);
        }
        
        /**
         * Handle save error
         */
        handleSaveError(error) {
            this.setSavingState(false);
            this.updateStatusIndicator('error', 'Save Failed');
            this.showToast('Save failed: ' + error.message, 'error', 8000);
            this.logger.error('TOOLBAR', 'Save failed', error);
            
            setTimeout(() => this.updateStatusIndicator('ready', 'Ready'), 8000);
        }
        
        /**
         * Set saving state with visual feedback
         */
        setSavingState(isSaving) {
            this.saveInProgress = isSaving;
            if (!this.buttons.saveBtn) return;
            
            const saveText = this.buttons.saveBtn.querySelector('span');
            
            if (isSaving) {
                this.buttons.saveBtn.disabled = true;
                this.buttons.saveBtn.classList.add('saving');
                if (saveText) saveText.textContent = 'Saving...';
                this.updateStatusIndicator('saving', 'Saving...');
            } else {
                this.buttons.saveBtn.disabled = false;
                this.buttons.saveBtn.classList.remove('saving');
                if (saveText) saveText.textContent = 'Save';
            }
        }
        
        /**
         * Handle export button click
         */
        handleExportClick() {
            const exportModal = document.getElementById('export-modal');
            if (exportModal) {
                this.showModal(exportModal);
                if (this.eventBus) {
                    this.eventBus.emit('toolbar:export-requested', { timestamp: new Date() });
                }
            } else {
                this.showToast('Export functionality not available', 'warning');
            }
        }
        
        /**
         * Handle undo button click
         */
        handleUndoClick() {
            if (window.stateHistory?.undo) {
                const success = window.stateHistory.undo();
                if (success) {
                    this.showToast('Action undone', 'info', 2000);
                    this.updateButtonStates();
                }
            }
        }
        
        /**
         * Handle redo button click
         */
        handleRedoClick() {
            if (window.stateHistory?.redo) {
                const success = window.stateHistory.redo();
                if (success) {
                    this.showToast('Action redone', 'info', 2000);
                    this.updateButtonStates();
                }
            }
        }
        
        /**
         * Handle theme button click
         * ROOT FIX: Simplified since theme customizer now loads before toolbar
         */
        handleThemeClick() {
            this.logger.info('TOOLBAR', 'Theme button clicked');
            
            // Theme customizer should always exist since it loads before toolbar
            if (window.themeCustomizer && window.themeCustomizer.open) {
                this.logger.info('TOOLBAR', 'Opening Theme Customizer');
                window.themeCustomizer.open();
                if (this.eventBus) {
                    this.eventBus.emit('toolbar:theme-requested', { timestamp: new Date() });
                }
            } else {
                // This should not happen with proper script loading order
                this.logger.error('TOOLBAR', 'Theme Customizer not available - check script loading order');
                this.showToast('Theme settings not available', 'error');
                
                // Dispatch event as last resort
                document.dispatchEvent(new CustomEvent('gmkb:open-theme-customizer', {
                    detail: { source: 'toolbar-error' }
                }));
            }
        }
        
        /**
         * Handle share button click
         */
        handleShareClick() {
            const url = window.location.href;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(() => {
                    this.showToast('Media kit URL copied to clipboard!', 'success', 3000);
                }).catch(() => {
                    this.showShareDialog(url);
                });
            } else {
                this.showShareDialog(url);
            }
        }
        
        /**
         * Show share dialog
         */
        showShareDialog(url) {
            const dialog = document.createElement('div');
            dialog.className = 'share-dialog-temp';
            dialog.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: white; padding: 24px; border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 10000;
                max-width: 400px; width: 90%;
            `;
            
            dialog.innerHTML = `
                <h3>Share Media Kit</h3>
                <p>Copy this URL to share:</p>
                <input type="text" value="${url}" readonly style="width:100%; padding:8px;">
                <div style="margin-top:16px; text-align:right;">
                    <button onclick="this.closest('.share-dialog-temp').remove()">Close</button>
                </div>
            `;
            
            document.body.appendChild(dialog);
            dialog.querySelector('input').select();
        }
        
        /**
         * Setup keyboard shortcuts
         */
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + S for save
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    this.handleSaveClick();
                }
                // Ctrl/Cmd + Z for undo
                else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleUndoClick();
                }
                // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z for redo
                else if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
                        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
                    e.preventDefault();
                    this.handleRedoClick();
                }
                // Ctrl/Cmd + E for export
                else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                    e.preventDefault();
                    this.handleExportClick();
                }
            });
        }
        
        /**
         * Setup button state monitoring
         */
        setupButtonStateMonitoring() {
            const updateStates = () => {
                // Update undo button
                if (this.buttons.undoBtn) {
                    const canUndo = window.stateHistory?.canUndo() || false;
                    this.buttons.undoBtn.disabled = !canUndo;
                }
                
                // Update redo button
                if (this.buttons.redoBtn) {
                    const canRedo = window.stateHistory?.canRedo() || false;
                    this.buttons.redoBtn.disabled = !canRedo;
                }
            };
            
            // Listen for state changes
            document.addEventListener('gmkb:state-changed', updateStates);
            document.addEventListener('history:snapshot-captured', updateStates);
            document.addEventListener('history:undo', updateStates);
            document.addEventListener('history:redo', updateStates);
            document.addEventListener('history-state-changed', updateStates);
            
            // Initial update
            setTimeout(updateStates, 500);
            
            // Expose globally
            window.updateUndoRedoButtons = updateStates;
        }
        
        /**
         * Setup auto-save functionality
         */
        setupAutoSave() {
            if (!this.autoSaveEnabled) return;
            
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer);
            }
            
            this.autoSaveTimer = setInterval(() => {
                this.performAutoSave();
            }, this.autoSaveInterval);
        }
        
        /**
         * Perform auto-save
         */
        performAutoSave() {
            if (this.saveInProgress) return;
            
            // Check if there's content to save
            const state = window.enhancedStateManager?.getState();
            if (!state || Object.keys(state.components || {}).length === 0) return;
            
            this.updateStatusIndicator('saving', 'Auto-saving...');
            
            if (window.GMKB?.dispatch) {
                window.GMKB.dispatch('gmkb:save-requested', {
                    source: 'auto-save',
                    timestamp: Date.now(),
                    onComplete: () => {
                        this.lastSaveTime = new Date();
                        this.updateStatusIndicator('saved', 'Auto-saved');
                        this.showToast('Auto-saved', 'info', 1500);
                        setTimeout(() => this.updateStatusIndicator('ready', 'Ready'), 2000);
                    },
                    onError: () => {
                        this.updateStatusIndicator('ready', 'Ready');
                    }
                });
            }
        }
        
        /**
         * Setup state change listeners
         */
        setupStateListeners() {
            if (this.eventBus) {
                this.eventBus.on('state:changed', () => this.updateButtonStates());
                this.eventBus.on('state:component-added', () => this.updateButtonStates());
                this.eventBus.on('state:component-removed', () => this.updateButtonStates());
                this.eventBus.on('state:component-updated', () => this.updateButtonStates());
            }
        }
        
        /**
         * Update button states
         */
        updateButtonStates() {
            // Update undo/redo
            if (window.updateUndoRedoButtons) {
                window.updateUndoRedoButtons();
            }
            
            // Update save button
            if (this.buttons.saveBtn) {
                const state = window.enhancedStateManager?.getState();
                const hasContent = state && Object.keys(state.components || {}).length > 0;
                this.buttons.saveBtn.disabled = !hasContent || this.saveInProgress;
            }
        }
        
        /**
         * Update status indicator
         */
        updateStatusIndicator(status, text) {
            if (!this.statusIndicator) return;
            
            const statusDot = this.statusIndicator.querySelector('.toolbar__status-dot');
            const statusText = this.statusIndicator.querySelector('span');
            
            if (statusText) statusText.textContent = text;
            
            if (statusDot) {
                const colors = {
                    saving: '#f59e0b',
                    saved: '#10b981',
                    error: '#dc2626',
                    ready: '#10b981'
                };
                statusDot.style.background = colors[status] || colors.ready;
                statusDot.style.animation = status === 'saving' ? 'pulse 1s ease-in-out infinite' : '';
            }
        }
        
        /**
         * Setup existing modal handlers
         */
        setupExistingModalHandlers() {
            const knownModalIds = [
                'global-settings-modal',
                'export-modal',
                'component-library-overlay',
                'template-library-modal'
            ];
            
            knownModalIds.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    this.setupModalCloseHandlers(modal);
                }
            });
        }
        
        /**
         * Setup modal close handlers
         */
        setupModalCloseHandlers(modal) {
            if (!modal || modal.hasAttribute('data-close-handlers-setup')) return;
            modal.setAttribute('data-close-handlers-setup', 'true');
            
            // Close button
            const closeBtn = modal.querySelector('.modal__close, .library__close, [data-close-modal]');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.hideModal(modal);
                });
            }
            
            // Backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
            
            // ESC key
            const escHandler = (e) => {
                if (e.key === 'Escape' && modal.style.display === 'flex') {
                    this.hideModal(modal);
                }
            };
            document.addEventListener('keydown', escHandler);
            modal._escHandler = escHandler;
        }
        
        /**
         * Show modal
         */
        showModal(modal) {
            modal.style.display = 'flex';
            modal.classList.add('modal--open');
            this.setupModalCloseHandlers(modal);
        }
        
        /**
         * Hide modal
         */
        hideModal(modal) {
            if (!modal) return;
            modal.style.display = 'none';
            modal.classList.remove('modal--open', 'show');
            
            if (modal._escHandler) {
                document.removeEventListener('keydown', modal._escHandler);
                delete modal._escHandler;
            }
            
            modal.removeAttribute('data-close-handlers-setup');
            
            document.dispatchEvent(new CustomEvent('gmkb:modal-closed', {
                detail: { modalId: modal.id, timestamp: Date.now() }
            }));
        }
        
        /**
         * Get button status for debugging
         */
        getButtonStatus() {
            const status = {};
            Object.entries(this.buttons).forEach(([key, btn]) => {
                status[key] = {
                    exists: !!btn,
                    disabled: btn?.disabled || false
                };
            });
            status.saveInProgress = this.saveInProgress;
            return status;
        }
        
        /**
         * Enable/disable auto-save
         */
        setAutoSave(enabled) {
            this.autoSaveEnabled = enabled;
            if (enabled) {
                this.setupAutoSave();
            } else if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer);
                this.autoSaveTimer = null;
            }
            this.logger.info('TOOLBAR', `Auto-save ${enabled ? 'enabled' : 'disabled'}`);
        }
        
        /**
         * Debug method
         */
        debug() {
            console.group('🔧 Consolidated Toolbar Debug');
            console.log('Initialized:', this.isInitialized);
            console.log('Save in progress:', this.saveInProgress);
            console.log('Auto-save enabled:', this.autoSaveEnabled);
            console.log('Button status:', this.getButtonStatus());
            console.log('Last save:', this.lastSaveTime?.toLocaleString() || 'Never');
            console.groupEnd();
        }
    }
    
    // ============================================
    // PART 2: Initialize and Export
    // ============================================
    
    // Create singleton instance
    const toolbar = new ConsolidatedToolbar();
    
    // Expose globally
    window.consolidatedToolbar = toolbar;
    
    // Clean exports only (no legacy)
    window.triggerSave = () => toolbar.handleSaveClick();
    window.triggerExport = () => toolbar.handleExportClick();
    window.setAutoSave = (enabled) => toolbar.setAutoSave(enabled);
    
    // Global toolbar API
    window.GMKBToolbar = {
        init: () => toolbar.init(),
        save: () => toolbar.handleSaveClick(),
        export: () => toolbar.handleExportClick(),
        undo: () => toolbar.handleUndoClick(),
        redo: () => toolbar.handleRedoClick(),
        setAutoSave: (enabled) => toolbar.setAutoSave(enabled),
        debug: () => toolbar.debug()
    };
    
    console.log('✅ Consolidated Toolbar System: Ready (combines toolbar.js + toolbar-interactions.js)');
    
})();
