/**
 * @file toolbar-interactions.js
 * @description Handles all toolbar button interactions including save, export, undo/redo, etc.
 * 
 * ROOT FIX: Connects save button to actual save functionality with proper user feedback
 */

import { structuredLogger } from '../utils/structured-logger.js';
import { eventBus } from '../core/event-bus.js';

// Toast function with fallback
let showToast = (message, type = 'info', duration = 3000) => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // For errors, also show browser alert as fallback
    if (type === 'error') {
        setTimeout(() => {
            if (confirm(`Error: ${message}\n\nClick OK to see more details in console.`)) {
                console.error('Detailed error information available in console.');
            }
        }, 100);
    }
};

// Try to load the actual toast polyfill
try {
    import('../utils/toast-polyfill.js').then(({ showToast: importedShowToast }) => {
        showToast = importedShowToast;
        console.log('✅ Toast polyfill loaded successfully');
    }).catch(error => {
        console.warn('⚠️ Toast polyfill not available, using fallback', error);
    });
} catch (error) {
    console.warn('⚠️ Failed to load toast polyfill, using fallback');
}

class ToolbarInteractions {
    constructor() {
        this.logger = structuredLogger;
        this.isInitialized = false;
        this.saveInProgress = false;
        this.lastSaveTime = null;
        
        // Button references
        this.saveBtn = null;
        this.exportBtn = null;
        this.undoBtn = null;
        this.redoBtn = null;
        this.themeBtn = null;
        this.shareBtn = null;
        this.statusIndicator = null;
        
        // Auto-save settings
        this.autoSaveEnabled = true;
        this.autoSaveInterval = 30000; // 30 seconds
        this.autoSaveTimer = null;
        
        // ROOT FIX: Event-driven initialization to prevent race conditions
        this.waitForGMKBReady();
    }
    
    /**
     * ROOT FIX: Wait for GMKB system to be ready before initializing
     */
    waitForGMKBReady() {
        console.log('🔧 TOOLBAR: Waiting for GMKB system to be ready...');
        
        // Multiple event strategies to ensure reliable initialization
        const initializeWhenReady = () => {
            // Check if GMKB system is available
            if (typeof window.GMKB !== 'undefined' && window.GMKB.systems) {
                console.log('✅ TOOLBAR: GMKB system ready, initializing toolbar...');
                this.init();
                return true;
            }
            return false;
        };
        
        // Strategy 1: Listen for GMKB ready events
        document.addEventListener('gmkb:ready', () => {
            console.log('🎯 TOOLBAR: Received gmkb:ready event');
            initializeWhenReady();
        });
        
        document.addEventListener('gmkb:all-systems-ready', () => {
            console.log('🎯 TOOLBAR: Received gmkb:all-systems-ready event');
            initializeWhenReady();
        });
        
        // Strategy 2: Fallback - DOM ready with delay
        const fallbackInit = () => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    // Add delay to ensure template rendering is complete
                    setTimeout(() => {
                        if (!this.isInitialized) {
                            console.log('⚠️ TOOLBAR: Using fallback DOM ready initialization');
                            this.init();
                        
            }
                    }, 1000);
                });
            } else {
                // DOM already ready, wait a bit for template
                setTimeout(() => {
                    if (!this.isInitialized) {
                        console.log('⚠️ TOOLBAR: Using fallback immediate initialization');
                        this.init();
                    }
                }, 500);
            }
        };
        
        // Strategy 3: Try immediate initialization if GMKB already ready
        if (!initializeWhenReady()) {
            // GMKB not ready yet, set up fallback
            fallbackInit();
        }
    }
    
    /**
     * Initialize toolbar interactions
     */
    init() {
        if (this.isInitialized) {
            this.logger.warn('TOOLBAR', 'Toolbar interactions already initialized');
            return;
        }
        
        try {
            this.logger.info('TOOLBAR', 'Initializing toolbar interactions');
            
            // Get button references
            this.getButtonReferences();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup auto-save
            this.setupAutoSave();
            
            // Setup state change listeners
            this.setupStateListeners();
            
            // Update initial button states
            this.updateButtonStates();
            
            this.isInitialized = true;
            this.logger.info('TOOLBAR', 'Toolbar interactions initialized successfully');
            
            // Emit initialization event
            eventBus.emit('toolbar:initialized', {
                buttons: this.getButtonStatus(),
                autoSaveEnabled: this.autoSaveEnabled
            });
            
        } catch (error) {
            this.logger.error('TOOLBAR', 'Failed to initialize toolbar interactions', error);
        }
    }
    
    /**
     * ROOT FIX: Get references to toolbar buttons with graceful error handling
     */
    getButtonReferences() {
        // ROOT FIX: Enhanced button detection with null safety
        console.log('🔍 TOOLBAR: Looking for toolbar buttons...');
        
        const buttonIds = {
            saveBtn: 'save-btn',
            exportBtn: 'export-btn', 
            undoBtn: 'undo-btn',
            redoBtn: 'redo-btn',
            themeBtn: 'global-theme-btn',
            shareBtn: 'share-btn'
        };
        
        // Safely get button references
        Object.entries(buttonIds).forEach(([property, id]) => {
            const element = document.getElementById(id);
            this[property] = element;
            
            if (element) {
                console.log(`✅ TOOLBAR: Found ${id} button`);
            } else {
                console.warn(`⚠️ TOOLBAR: Button not found: ${id}`);
            }
        });
        
        // Get status indicator with graceful fallback
        this.statusIndicator = document.querySelector('.toolbar__status');
        if (this.statusIndicator) {
            console.log('✅ TOOLBAR: Found status indicator');
        } else {
            console.warn('⚠️ TOOLBAR: Status indicator not found');
        }
        
        // Log button availability with enhanced diagnostics
        const buttonStatus = {
            save: !!this.saveBtn,
            export: !!this.exportBtn,
            undo: !!this.undoBtn,
            redo: !!this.redoBtn,
            theme: !!this.themeBtn,
            share: !!this.shareBtn,
            status: !!this.statusIndicator
        };
        
        const foundCount = Object.values(buttonStatus).filter(Boolean).length;
        const totalCount = Object.keys(buttonStatus).length;
        
        console.log(`📊 TOOLBAR: Button detection complete: ${foundCount}/${totalCount} found`);
        this.logger.debug('TOOLBAR', 'Button references obtained', buttonStatus);
        
        // ROOT FIX: Enhanced missing button handling
        if (!this.saveBtn) {
            this.logger.error('TOOLBAR', 'CRITICAL: Save button (#save-btn) not found! Save functionality will not work.');
            console.error('❌ TOOLBAR: Save button missing - check template rendering timing');
        }
        
        // ROOT FIX: Provide helpful diagnostics if most buttons are missing
        if (foundCount < totalCount / 2) {
            console.group('🔍 TOOLBAR: Button Detection Diagnostics');
            console.warn(`Only ${foundCount}/${totalCount} toolbar buttons found`);
            console.log('DOM State:', document.readyState);
            console.log('Toolbar container exists:', !!document.querySelector('.toolbar'));
            console.log('Template loaded:', !!document.querySelector('.builder'));
            console.groupEnd();
        }
        
        return buttonStatus;
    }
    
    /**
     * ROOT FIX: Setup modal close handlers for any modal
     * @param {HTMLElement} modal - Modal element to setup close handlers for
     */
    setupModalCloseHandlers(modal) {
        if (!modal || modal.hasAttribute('data-close-handlers-setup')) {
            return; // Already setup or invalid modal
        }
        
        console.log('🔧 TOOLBAR: Setting up close handlers for modal:', modal.id);
        
        // Mark as setup to prevent duplicates
        modal.setAttribute('data-close-handlers-setup', 'true');
        
        // Close button handler
        const closeBtn = modal.querySelector('.modal__close, .library__close, [data-close-modal]');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideModal(modal);
            });
        }
        
        // Backdrop click handler
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal(modal);
            }
        });
        
        // ESC key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.hideModal(modal);
            }
        });
        
        console.log('✅ TOOLBAR: Close handlers setup complete for modal:', modal.id);
    }
    
    /**
     * ROOT FIX: Hide modal properly
     * @param {HTMLElement} modal - Modal element to hide
     */
    hideModal(modal) {
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.classList.remove('modal--open');
        console.log('✅ TOOLBAR: Modal hidden:', modal.id);
    }
    
    /**
     * Setup event listeners for all toolbar buttons
     */
    setupEventListeners() {
        // CRITICAL FIX: Save button click handler
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSaveClick();
            });
            this.logger.info('TOOLBAR', '✅ Save button click handler attached');
        }
        
        // Export button
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleExportClick();
            });
            this.logger.debug('TOOLBAR', 'Export button click handler attached');
        }
        
        // Undo button
        if (this.undoBtn) {
            this.undoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleUndoClick();
            });
            this.logger.debug('TOOLBAR', 'Undo button click handler attached');
        }
        
        // Redo button
        if (this.redoBtn) {
            this.redoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRedoClick();
            });
            this.logger.debug('TOOLBAR', 'Redo button click handler attached');
        }
        
        // Theme settings button
        if (this.themeBtn) {
            this.themeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleThemeClick();
            });
            this.logger.debug('TOOLBAR', 'Theme button click handler attached');
        }
        
        // Share button
        if (this.shareBtn) {
            this.shareBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleShareClick();
            });
            this.logger.debug('TOOLBAR', 'Share button click handler attached');
        }
        
        // ROOT FIX: Preview toggle handlers for device buttons
        this.setupPreviewToggle();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    /**
     * Handle save button click - ROOT FIX: Event-driven approach
     */
    handleSaveClick() {
        if (this.saveInProgress) {
            this.logger.warn('TOOLBAR', 'Save already in progress, ignoring click');
            return;
        }
        
        try {
            this.logger.info('TOOLBAR', 'Save button clicked - dispatching save request event');
            
            // Set saving state
            this.setSavingState(true);
            
            // ROOT FIX: Check GMKB system availability
            if (!window.GMKB || !window.GMKB.dispatch) {
                throw new Error('GMKB system not available. Please refresh the page.');
            }
            
            // ROOT FIX: Dispatch save request event with callbacks
            window.GMKB.dispatch('gmkb:save-requested', {
                source: 'toolbar',
                timestamp: Date.now(),
                
                // Success callback
                onComplete: (response) => {
                    this.logger.info('TOOLBAR', 'Save completed successfully', response);
                    this.handleSaveSuccess();
                },
                
                // Error callback
                onError: (errorResponse) => {
                    this.logger.error('TOOLBAR', 'Save failed via event system', errorResponse);
                    const error = new Error(errorResponse.error || 'Save failed');
                    this.handleSaveError(error);
                }
            });
            
            console.log('✅ TOOLBAR: Save request dispatched successfully');
            
        } catch (error) {
            this.logger.error('TOOLBAR', 'Save failed', error, {
                errorType: error.name,
                errorMessage: error.message,
                stackTrace: error.stack?.split('\n').slice(0, 3)
            });
            this.handleSaveError(error);
            this.setSavingState(false);
        }
    }
    
    // ROOT FIX: Removed performSave method - now using event-driven approach
    
    /**
     * Set saving state with visual feedback
     */
    setSavingState(isSaving) {
        this.saveInProgress = isSaving;
        
        if (!this.saveBtn) return;
        
        const saveText = this.saveBtn.querySelector('span');
        const saveIcon = this.saveBtn.querySelector('svg');
        
        if (isSaving) {
            // Show saving state
            this.saveBtn.disabled = true;
            this.saveBtn.classList.add('saving');
            
            if (saveText) {
                saveText.textContent = 'Saving...';
            }
            
            if (saveIcon) {
                saveIcon.style.animation = 'spin 1s linear infinite';
            }
            
            // Update status indicator
            this.updateStatusIndicator('saving', 'Saving...');
            
        } else {
            // Restore normal state
            this.saveBtn.disabled = false;
            this.saveBtn.classList.remove('saving');
            
            if (saveText) {
                saveText.textContent = 'Save';
            }
            
            if (saveIcon) {
                saveIcon.style.animation = '';
            }
        }
    }
    
    /**
     * Handle successful save
     */
    handleSaveSuccess() {
        this.lastSaveTime = new Date();
        
        // Reset saving state
        this.setSavingState(false);
        
        this.logger.info('TOOLBAR', 'Save completed successfully', {
            timestamp: this.lastSaveTime.toISOString()
        });
        
        // Update status indicator
        this.updateStatusIndicator('saved', 'Saved');
        
        // Show success toast
        showToast('Media kit saved successfully!', 'success', 3000);
        
        // Emit save success event
        eventBus.emit('toolbar:save-success', {
            timestamp: this.lastSaveTime,
            source: 'manual'
        });
        
        // Reset status after delay
        setTimeout(() => {
            this.updateStatusIndicator('ready', 'Ready');
        }, 3000);
    }
    
    /**
     * Handle save error with enhanced diagnostics
     */
    handleSaveError(error) {
        // Reset saving state
        this.setSavingState(false);
        
        this.logger.error('TOOLBAR', 'Save error occurred', error, {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
        
        // Update status indicator
        this.updateStatusIndicator('error', 'Save Failed');
        
        // Enhanced error messages based on error type
        let userMessage = 'Save failed: ' + error.message;
        let suggestions = [];
        
        if (error.message.includes('GMKB system')) {
            suggestions.push('Try refreshing the page');
            suggestions.push('Check browser console for initialization errors');
        } else if (error.message.includes('localStorage')) {
            suggestions.push('Try in incognito/private browsing mode');
            suggestions.push('Clear browser storage and refresh');
        } else if (error.message.includes('WordPress database')) {
            suggestions.push('Check your internet connection');
            suggestions.push('Verify you are logged into WordPress');
        }
        
        // Show error toast with suggestions
        const fullMessage = suggestions.length > 0 
            ? `${userMessage}\n\nSuggestions:\n${suggestions.map(s => '• ' + s).join('\n')}`
            : userMessage;
            
        showToast(fullMessage, 'error', 8000);
        
        // Show diagnostic suggestion in console
        console.group('💾 Save Error Diagnostics');
        console.error('Save failed:', error.message);
        console.log('Check browser console for detailed error information');
        console.groupEnd();
        
        // Emit save error event
        eventBus.emit('toolbar:save-error', {
            error: error.message,
            timestamp: new Date(),
            source: 'manual',
            suggestions
        });
        
        // Reset status after delay
        setTimeout(() => {
            this.updateStatusIndicator('ready', 'Ready');
        }, 8000);
    }
    
    /**
     * Update status indicator
     */
    updateStatusIndicator(status, text) {
        if (!this.statusIndicator) return;
        
        const statusDot = this.statusIndicator.querySelector('.toolbar__status-dot');
        const statusText = this.statusIndicator.querySelector('span');
        
        // Update text
        if (statusText) {
            statusText.textContent = text;
        }
        
        // Update dot color based on status
        if (statusDot) {
            statusDot.className = 'toolbar__status-dot';
            
            switch (status) {
                case 'saving':
                    statusDot.style.background = '#f59e0b';
                    statusDot.style.animation = 'pulse 1s ease-in-out infinite';
                    break;
                case 'saved':
                    statusDot.style.background = '#10b981';
                    statusDot.style.animation = '';
                    break;
                case 'error':
                    statusDot.style.background = '#dc2626';
                    statusDot.style.animation = 'pulse 0.5s ease-in-out infinite';
                    break;
                case 'ready':
                default:
                    statusDot.style.background = '#10b981';
                    statusDot.style.animation = '';
                    break;
            }
        }
        
        this.logger.debug('TOOLBAR', `Status updated: ${status} - ${text}`);
    }
    
    /**
     * Handle export button click - ROOT FIX
     */
    handleExportClick() {
        this.logger.info('TOOLBAR', 'Export button clicked');
        
        try {
            // ROOT FIX: Use modal overlay with proper display method
            const exportModal = document.getElementById('export-modal');
            if (exportModal) {
                // Show export modal with proper flex display for centering
                exportModal.style.display = 'flex';
                exportModal.classList.add('modal--open');
                
                console.log('✅ TOOLBAR: Export modal opened');
                
                // Setup close handlers if not already done
                this.setupModalCloseHandlers(exportModal);
                
                // Emit event for export modal to initialize
                eventBus.emit('toolbar:export-requested', {
                    timestamp: new Date()
                });
                
            } else {
                console.error('❌ TOOLBAR: Export modal not found in DOM');
                // Fallback: direct export using save service
                const saveService = window.saveService;
                if (saveService && saveService.exportState) {
                    saveService.exportState();
                } else {
                    showToast('Export functionality not available', 'warning');
                }
            }
        } catch (error) {
            this.logger.error('TOOLBAR', 'Export failed', error);
            showToast(`Export failed: ${error.message}`, 'error');
        }
    }
    
    /**
     * Handle undo button click
     */
    handleUndoClick() {
        this.logger.info('TOOLBAR', 'Undo button clicked');
        
        try {
            const stateHistory = window.stateHistory;
            if (stateHistory && stateHistory.undo) {
                const success = stateHistory.undo();
                if (success) {
                    showToast('Action undone', 'info', 2000);
                    this.updateButtonStates();
                } else {
                    showToast('Nothing to undo', 'warning', 2000);
                }
            } else {
                showToast('Undo functionality not available', 'warning');
            }
        } catch (error) {
            this.logger.error('TOOLBAR', 'Undo failed', error);
            showToast(`Undo failed: ${error.message}`, 'error');
        }
    }
    
    /**
     * Handle redo button click
     */
    handleRedoClick() {
        this.logger.info('TOOLBAR', 'Redo button clicked');
        
        try {
            const stateHistory = window.stateHistory;
            if (stateHistory && stateHistory.redo) {
                const success = stateHistory.redo();
                if (success) {
                    showToast('Action redone', 'info', 2000);
                    this.updateButtonStates();
                } else {
                    showToast('Nothing to redo', 'warning', 2000);
                }
            } else {
                showToast('Redo functionality not available', 'warning');
            }
        } catch (error) {
            this.logger.error('TOOLBAR', 'Redo failed', error);
            showToast(`Redo failed: ${error.message}`, 'error');
        }
    }
    
    /**
     * Handle theme button click - ROOT FIX
     */
    handleThemeClick() {
        this.logger.info('TOOLBAR', 'Theme button clicked');
        
        try {
            // ROOT FIX: Use modal overlay with proper display method
            const themeModal = document.getElementById('global-settings-modal');
            if (themeModal) {
                // Show theme modal with proper flex display for centering
                themeModal.style.display = 'flex';
                themeModal.classList.add('modal--open');
                
                console.log('✅ TOOLBAR: Global settings modal opened');
                
                // Setup close handlers if not already done
                this.setupModalCloseHandlers(themeModal);
                
                // Emit event for theme modal to initialize
                eventBus.emit('toolbar:theme-requested', {
                    timestamp: new Date()
                });
                
            } else {
                console.error('❌ TOOLBAR: Global settings modal not found in DOM');
                showToast('Theme settings not available', 'warning');
            }
        } catch (error) {
            this.logger.error('TOOLBAR', 'Theme settings failed', error);
            showToast(`Theme settings failed: ${error.message}`, 'error');
        }
    }
    
    /**
     * Handle share button click
     */
    handleShareClick() {
        this.logger.info('TOOLBAR', 'Share button clicked');
        
        try {
            // Get current state
            const stateManager = window.enhancedStateManager;
            if (!stateManager) {
                throw new Error('State manager not available');
            }
            
            const state = stateManager.getState();
            const componentCount = Object.keys(state.components || {}).length;
            
            if (componentCount === 0) {
                showToast('Add some components before sharing', 'warning');
                return;
            }
            
            // Create shareable URL (placeholder implementation)
            const shareUrl = window.location.href;
            
            // Copy to clipboard if available
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    showToast('Media kit URL copied to clipboard!', 'success', 3000);
                }).catch(() => {
                    this.showShareDialog(shareUrl);
                });
            } else {
                this.showShareDialog(shareUrl);
            }
            
        } catch (error) {
            this.logger.error('TOOLBAR', 'Share failed', error);
            showToast(`Share failed: ${error.message}`, 'error');
        }
    }
    
    /**
     * Show share dialog with URL
     */
    showShareDialog(url) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 400px;
            width: 90%;
        `;
        
        dialog.innerHTML = `
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #1e293b;">Share Media Kit</h3>
            <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">Copy this URL to share your media kit:</p>
            <input type="text" value="${url}" readonly style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                font-size: 14px;
                background: #f8fafc;
                margin-bottom: 16px;
            ">
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button id="copy-url-btn" style="
                    padding: 8px 16px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">Copy URL</button>
                <button id="close-share-btn" style="
                    padding: 8px 16px;
                    background: #f1f5f9;
                    color: #64748b;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">Close</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Copy button
        dialog.querySelector('#copy-url-btn').addEventListener('click', () => {
            const input = dialog.querySelector('input');
            input.select();
            document.execCommand('copy');
            showToast('URL copied to clipboard!', 'success', 2000);
            document.body.removeChild(dialog);
        });
        
        // Close button
        dialog.querySelector('#close-share-btn').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        // Focus input
        const input = dialog.querySelector('input');
        input.focus();
        input.select();
    }
    
    /**
     * ROOT FIX: Setup preview toggle functionality for device buttons
     */
    setupPreviewToggle() {
        console.log('📱 TOOLBAR: Setting up preview toggle functionality');
        
        const previewButtons = document.querySelectorAll('.toolbar__preview-btn');
        const previewContainer = document.getElementById('preview-container') || document.querySelector('.preview__container');
        
        if (previewButtons.length === 0) {
            console.warn('⚠️ TOOLBAR: No preview buttons found');
            return;
        }
        
        if (!previewContainer) {
            console.warn('⚠️ TOOLBAR: Preview container not found');
            return;
        }
        
        console.log(`🔍 TOOLBAR: Found ${previewButtons.length} preview buttons and preview container`);
        
        previewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const previewMode = button.dataset.preview;
                
                if (!previewMode) {
                    console.warn('⚠️ TOOLBAR: Preview button missing data-preview attribute');
                    return;
                }
                
                console.log(`📱 TOOLBAR: Switching to ${previewMode} preview mode`);
                
                // Remove active class from all buttons
                previewButtons.forEach(btn => {
                    btn.classList.remove('toolbar__preview-btn--active');
                });
                
                // Add active class to clicked button
                button.classList.add('toolbar__preview-btn--active');
                
                // Remove all preview mode classes from container
                previewContainer.classList.remove('preview--desktop', 'preview--tablet', 'preview--mobile');
                
                // Add the selected preview mode class
                previewContainer.classList.add(`preview--${previewMode}`);
                
                // Update preview container data attribute for CSS targeting
                previewContainer.setAttribute('data-preview-mode', previewMode);
                
                // Emit event for other systems
                if (typeof eventBus !== 'undefined' && eventBus.emit) {
                    eventBus.emit('toolbar:preview-changed', {
                        mode: previewMode,
                        timestamp: new Date()
                    });
                }
                
                // Visual feedback
                this.showPreviewFeedback(previewMode);
            });
        });
        
        console.log('✅ TOOLBAR: Preview toggle setup complete');
    }
    
    /**
     * ROOT FIX: Show preview mode feedback
     * @param {string} mode - Preview mode (desktop, tablet, mobile)
     */
    showPreviewFeedback(mode) {
        const modeNames = {
            desktop: 'Desktop View',
            tablet: 'Tablet View', 
            mobile: 'Mobile View'
        };
        
        const modeName = modeNames[mode] || mode;
        
        // Show brief toast notification
        showToast(`Switched to ${modeName}`, 'info', 2000);
        
        console.log(`✅ TOOLBAR: Preview mode changed to ${modeName}`);
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S or Cmd+S for save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.handleSaveClick();
                return;
            }
            
            // Ctrl+Z or Cmd+Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.handleUndoClick();
                return;
            }
            
            // Ctrl+Y or Cmd+Shift+Z for redo
            if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                this.handleRedoClick();
                return;
            }
            
            // Ctrl+E or Cmd+E for export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.handleExportClick();
                return;
            }
        });
        
        this.logger.debug('TOOLBAR', 'Keyboard shortcuts enabled: Ctrl+S (save), Ctrl+Z (undo), Ctrl+Y (redo), Ctrl+E (export)');
    }
    
    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        if (!this.autoSaveEnabled) return;
        
        // Clear any existing timer
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.performAutoSave();
        }, this.autoSaveInterval);
        
        this.logger.info('TOOLBAR', `Auto-save enabled with ${this.autoSaveInterval}ms interval`);
    }
    
    /**
     * Perform auto-save
     */
    async performAutoSave() {
        // Skip if manual save in progress
        if (this.saveInProgress) {
            this.logger.debug('TOOLBAR', 'Skipping auto-save - manual save in progress');
            return;
        }
        
        try {
            // ROOT FIX: Use GMKB event system for auto-save too
            if (!window.GMKB || !window.GMKB.dispatch) {
                this.logger.warn('TOOLBAR', 'GMKB system not available for auto-save');
                return;
            }
            
            // Check if there's content to save by checking state
            const stateManager = window.GMKB?.systems?.StateManager;
            if (!stateManager) {
                this.logger.debug('TOOLBAR', 'StateManager not available for auto-save check');
                return;
            }
            
            const currentState = stateManager.getState();
            if (!currentState || Object.keys(currentState.components || {}).length === 0) {
                // No content to save
                return;
            }
            
            this.logger.debug('TOOLBAR', 'Performing auto-save');
            
            // Show subtle auto-save indicator
            this.updateStatusIndicator('saving', 'Auto-saving...');
            
            // Dispatch auto-save request
            window.GMKB.dispatch('gmkb:save-requested', {
                source: 'auto-save',
                timestamp: Date.now(),
                
                onComplete: (response) => {
                    this.lastSaveTime = new Date();
                    this.updateStatusIndicator('saved', 'Auto-saved');
                    
                    // Show brief auto-save toast
                    showToast('Auto-saved', 'info', 1500);
                    
                    // Emit auto-save success event
                    eventBus.emit('toolbar:save-success', {
                        timestamp: this.lastSaveTime,
                        source: 'auto'
                    });
                    
                    // Reset status after delay
                    setTimeout(() => {
                        this.updateStatusIndicator('ready', 'Ready');
                    }, 2000);
                },
                
                onError: (errorResponse) => {
                    this.logger.warn('TOOLBAR', 'Auto-save failed', errorResponse);
                    this.updateStatusIndicator('ready', 'Ready');
                }
            });
            
        } catch (error) {
            this.logger.warn('TOOLBAR', 'Auto-save failed', error);
            // Don't show error toast for auto-save failures to avoid annoying user
            this.updateStatusIndicator('ready', 'Ready');
        }
    }
    
    /**
     * Setup state change listeners
     */
    setupStateListeners() {
        // Listen for state changes to update button states
        eventBus.on('state:changed', () => {
            this.updateButtonStates();
        });
        
        // Listen for component changes to enable auto-save
        eventBus.on('state:component-added', () => {
            this.updateButtonStates();
        });
        
        eventBus.on('state:component-removed', () => {
            this.updateButtonStates();
        });
        
        eventBus.on('state:component-updated', () => {
            this.updateButtonStates();
        });
    }
    
    /**
     * Update button states based on current application state
     */
    updateButtonStates() {
        try {
            const stateManager = window.enhancedStateManager;
            const stateHistory = window.stateHistory;
            
            // Update undo/redo buttons
            if (this.undoBtn && stateHistory) {
                this.undoBtn.disabled = !stateHistory.canUndo();
            }
            
            if (this.redoBtn && stateHistory) {
                this.redoBtn.disabled = !stateHistory.canRedo();
            }
            
            // Update save button based on whether there are changes
            if (this.saveBtn && stateManager) {
                const state = stateManager.getState();
                const hasContent = state && Object.keys(state.components || {}).length > 0;
                
                // Save button is always enabled if there's content
                this.saveBtn.disabled = !hasContent || this.saveInProgress;
            }
            
        } catch (error) {
            this.logger.warn('TOOLBAR', 'Error updating button states', error);
        }
    }
    
    /**
     * Get button status for debugging
     */
    getButtonStatus() {
        return {
            save: {
                exists: !!this.saveBtn,
                disabled: this.saveBtn?.disabled || false,
                inProgress: this.saveInProgress
            },
            export: {
                exists: !!this.exportBtn,
                disabled: this.exportBtn?.disabled || false
            },
            undo: {
                exists: !!this.undoBtn,
                disabled: this.undoBtn?.disabled || false
            },
            redo: {
                exists: !!this.redoBtn,
                disabled: this.redoBtn?.disabled || false
            },
            theme: {
                exists: !!this.themeBtn,
                disabled: this.themeBtn?.disabled || false
            },
            share: {
                exists: !!this.shareBtn,
                disabled: this.shareBtn?.disabled || false
            }
        };
    }
    
    /**
     * Enable/disable auto-save
     */
    setAutoSave(enabled) {
        this.autoSaveEnabled = enabled;
        
        if (enabled) {
            this.setupAutoSave();
        } else {
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer);
                this.autoSaveTimer = null;
            }
        }
        
        this.logger.info('TOOLBAR', `Auto-save ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Get save statistics
     */
    getSaveStats() {
        return {
            lastSaveTime: this.lastSaveTime,
            saveInProgress: this.saveInProgress,
            autoSaveEnabled: this.autoSaveEnabled,
            autoSaveInterval: this.autoSaveInterval
        };
    }
    
    /**
     * Debug toolbar interactions
     */
    debug() {
        console.group('%c🔧 Toolbar Interactions Debug', 'font-size: 14px; font-weight: bold; color: #3b82f6');
        
        console.log('Initialization:', {
            initialized: this.isInitialized,
            saveInProgress: this.saveInProgress,
            autoSaveEnabled: this.autoSaveEnabled
        });
        
        console.log('\nButton Status:');
        console.table(this.getButtonStatus());
        
        console.log('\nSave Statistics:');
        console.table(this.getSaveStats());
        
        if (this.lastSaveTime) {
            console.log(`\nLast save: ${this.lastSaveTime.toLocaleString()}`);
        }
        
        console.groupEnd();
    }
    
    /**
     * Cleanup - remove event listeners and timers
     */
    destroy() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        
        // Remove event listeners (buttons will be garbage collected)
        this.isInitialized = false;
        
        this.logger.info('TOOLBAR', 'Toolbar interactions destroyed');
    }
}

// Create and export singleton instance
export const toolbarInteractions = new ToolbarInteractions();

// Expose globally for debugging
window.toolbarInteractions = toolbarInteractions;

// Export convenience functions
export const triggerSave = () => toolbarInteractions.handleSaveClick();
export const triggerExport = () => toolbarInteractions.handleExportClick();
export const setAutoSave = (enabled) => toolbarInteractions.setAutoSave(enabled);
