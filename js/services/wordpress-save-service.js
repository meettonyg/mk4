/**
 * WordPress Save Service
 * ROOT CAUSE FIX: Bridges the gap between JavaScript state and WordPress database
 * Ensures components persist to database and survive page reloads
 */

(function() {
    'use strict';
    
    class WordPressSaveService {
        constructor() {
            this.isSaving = false;
            this.lastSaveTime = 0;
            this.hasUnsavedChanges = false;
            this.autoSaveInterval = null;
            this.init();
        }
        
        init() {
            // Listen for save button click
            document.addEventListener('click', (e) => {
                if (e.target.id === 'save-btn' || e.target.closest('#save-btn')) {
                    e.preventDefault();
                    this.saveToWordPress();
                }
            });
            
            // Listen for state changes to track unsaved changes
            if (window.enhancedStateManager) {
                window.enhancedStateManager.subscribeGlobal((state) => {
                    if (Object.keys(state.components || {}).length > 0) {
                        this.hasUnsavedChanges = true;
                        this.updateSaveStatus('unsaved');
                    }
                });
            }
            
            // Auto-save every 30 seconds if there are changes
            this.autoSaveInterval = setInterval(() => {
                if (this.hasUnsavedChanges && !this.isSaving) {
                    this.saveToWordPress(true); // silent auto-save
                }
            }, 30000);
            
            // Save before page unload if there are unsaved changes
            window.addEventListener('beforeunload', (e) => {
                if (this.hasUnsavedChanges && !this.isSaving) {
                    e.preventDefault();
                    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                }
            });
            
            // Listen for manual save events from other components
            document.addEventListener('gmkb:save-requested', () => {
                this.saveToWordPress();
            });
            
            console.log('✅ WordPress Save Service initialized');
            
            // Emit ready event
            document.dispatchEvent(new CustomEvent('gmkb:save-service-ready', {
                detail: { saveService: this }
            }));
        }
        
        /**
         * Update UI save status indicator
         */
        updateSaveStatus(status) {
            const statusDot = document.querySelector('.toolbar__status-dot');
            const statusText = document.querySelector('.toolbar__status span');
            
            switch(status) {
                case 'saving':
                    if (statusDot) {
                        statusDot.style.backgroundColor = '#fbbf24';
                        statusDot.style.animation = 'pulse 1s infinite';
                    }
                    if (statusText) statusText.textContent = 'Saving...';
                    break;
                    
                case 'saved':
                    if (statusDot) {
                        statusDot.style.backgroundColor = '#10b981';
                        statusDot.style.animation = 'none';
                    }
                    if (statusText) statusText.textContent = 'Saved';
                    break;
                    
                case 'error':
                    if (statusDot) {
                        statusDot.style.backgroundColor = '#ef4444';
                        statusDot.style.animation = 'none';
                    }
                    if (statusText) statusText.textContent = 'Save Error';
                    break;
                    
                case 'unsaved':
                    if (statusDot) {
                        statusDot.style.backgroundColor = '#f59e0b';
                        statusDot.style.animation = 'none';
                    }
                    if (statusText) statusText.textContent = 'Unsaved Changes';
                    break;
            }
        }
        
        /**
         * Get post ID from various sources
         */
        getPostId() {
            // Try multiple sources for post ID
            const sources = [
                // From gmkbData
                window.gmkbData?.postId,
                window.gmkbData?.post_id,
                // From URL parameters
                new URLSearchParams(window.location.search).get('mkcg_id'),
                new URLSearchParams(window.location.search).get('post_id'),
                new URLSearchParams(window.location.search).get('p'),
                new URLSearchParams(window.location.search).get('page_id'),
                new URLSearchParams(window.location.search).get('media_kit_id'),
                // From body data attribute
                document.body.getAttribute('data-post-id')
            ];
            
            for (const id of sources) {
                if (id && !isNaN(id)) {
                    return parseInt(id);
                }
            }
            
            return null;
        }
        
        /**
         * Main save function
         */
        async saveToWordPress(silent = false) {
            if (this.isSaving) {
                console.log('Save already in progress, skipping...');
                return;
            }
            
            // Check if we have a state manager
            if (!window.enhancedStateManager) {
                console.error('State manager not available');
                if (!silent) {
                    alert('Cannot save: System not fully initialized');
                }
                return;
            }
            
            this.isSaving = true;
            
            if (!silent) {
                this.updateSaveStatus('saving');
            }
            
            try {
                // Get current state
                const state = window.enhancedStateManager.getState();
                
                // Get post ID
                const postId = this.getPostId();
                
                if (!postId) {
                    throw new Error('No post ID found. Cannot save media kit.');
                }
                
                // Check if we have any components to save
                const componentCount = Object.keys(state.components || {}).length;
                
                console.log(`💾 Saving to WordPress: Post ID ${postId}, ${componentCount} components`);
                
                // Prepare the request
                const ajaxUrl = window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php';
                const nonce = window.gmkbData?.nonce || '';
                
                if (!nonce) {
                    throw new Error('Security nonce not found. Cannot save.');
                }
                
                // Create form data for WordPress AJAX
                const formData = new FormData();
                formData.append('action', 'guestify_save_media_kit');
                formData.append('nonce', nonce);
                formData.append('post_id', postId);
                formData.append('state', JSON.stringify(state));
                
                // Send the request
                const response = await fetch(ajaxUrl, {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    this.hasUnsavedChanges = false;
                    this.lastSaveTime = Date.now();
                    
                    if (!silent) {
                        this.updateSaveStatus('saved');
                        
                        // Show success toast if available
                        if (window.showToast) {
                            window.showToast(`Media kit saved successfully (${componentCount} components)`, 'success');
                        }
                    }
                    
                    console.log('✅ Saved to WordPress:', result.data);
                    
                    // Dispatch save success event
                    document.dispatchEvent(new CustomEvent('gmkb:save-success', {
                        detail: {
                            postId: postId,
                            componentCount: componentCount,
                            timestamp: this.lastSaveTime
                        }
                    }));
                    
                } else {
                    throw new Error(result.data || 'Save failed');
                }
                
            } catch (error) {
                console.error('❌ Save error:', error);
                
                this.updateSaveStatus('error');
                
                if (!silent) {
                    // Show error toast if available
                    if (window.showToast) {
                        window.showToast('Failed to save: ' + error.message, 'error');
                    } else {
                        alert('Failed to save media kit:\n' + error.message);
                    }
                }
                
                // Dispatch save error event
                document.dispatchEvent(new CustomEvent('gmkb:save-error', {
                    detail: {
                        error: error.message,
                        timestamp: Date.now()
                    }
                }));
                
            } finally {
                this.isSaving = false;
                
                // Reset status after a delay if it was a successful save
                if (!this.hasUnsavedChanges && !silent) {
                    setTimeout(() => {
                        this.updateSaveStatus('saved');
                    }, 3000);
                }
            }
        }
        
        /**
         * Force save (public method for other components to use)
         */
        forceSave() {
            return this.saveToWordPress(false);
        }
        
        /**
         * Check if there are unsaved changes
         */
        hasChanges() {
            return this.hasUnsavedChanges;
        }
        
        /**
         * Clean up on destroy
         */
        destroy() {
            if (this.autoSaveInterval) {
                clearInterval(this.autoSaveInterval);
                this.autoSaveInterval = null;
            }
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.wordPressSaveService = new WordPressSaveService();
        });
    } else {
        // DOM already loaded, initialize immediately
        window.wordPressSaveService = new WordPressSaveService();
    }
    
    // Add CSS for pulse animation if not already present
    if (!document.querySelector('#save-service-styles')) {
        const style = document.createElement('style');
        style.id = 'save-service-styles';
        style.textContent = `
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
            }
            
            .toolbar__status-dot {
                transition: background-color 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
})();
