/**
 * WordPress Save Integration
 * ROOT FIX: Centralized save handler that coordinates between toolbar and WordPress AJAX
 * 
 * @version 1.0.0
 * @package GMKB
 */

(function() {
    'use strict';
    
    // Wait for dependencies
    const waitForDependencies = (callback) => {
        const checkDependencies = () => {
            if (window.enhancedStateManager && window.gmkbData) {
                callback();
            } else {
                setTimeout(checkDependencies, 100);
            }
        };
        checkDependencies();
    };
    
    class WordPressSaveIntegration {
        constructor() {
            this.logger = window.structuredLogger || console;
            this.saveInProgress = false;
            this.lastSaveTime = null;
            
            this.setupEventListeners();
            this.logger.info('WORDPRESS_SAVE', 'WordPress Save Integration initialized');
        }
        
        setupEventListeners() {
            // Listen for save requests from toolbar
            document.addEventListener('gmkb:save-requested', (event) => {
                this.handleSaveRequest(event.detail);
            });
            
            // Listen for manual save events from component manager
            document.addEventListener('gmkb:manual-save-start', () => {
                this.saveInProgress = true;
            });
            
            document.addEventListener('gmkb:auto-save-success', () => {
                this.saveInProgress = false;
                this.lastSaveTime = Date.now();
            });
            
            document.addEventListener('gmkb:auto-save-failed', () => {
                this.saveInProgress = false;
            });
        }
        
        async handleSaveRequest(detail) {
            const { source, timestamp, onComplete, onError } = detail;
            
            if (this.saveInProgress) {
                this.logger.warn('WORDPRESS_SAVE', 'Save already in progress');
                if (onError) {
                    onError({ error: 'Save already in progress' });
                }
                return;
            }
            
            try {
                this.saveInProgress = true;
                this.logger.info('WORDPRESS_SAVE', `Save requested from ${source}`);
                
                // Get current state
                const state = window.enhancedStateManager?.getState();
                if (!state) {
                    throw new Error('No state available to save');
                }
                
                // Get WordPress data
                const wpData = window.gmkbData;
                if (!wpData || !wpData.ajaxUrl || !wpData.nonce) {
                    throw new Error('WordPress data not available');
                }
                
                const postId = wpData.postId || wpData.post_id || 0;
                if (!postId) {
                    throw new Error('No post ID available');
                }
                
                // Prepare save data
                const formData = new FormData();
                formData.append('action', 'guestify_save_media_kit'); // ROOT FIX: Use correct action name
                formData.append('nonce', wpData.nonce);
                formData.append('post_id', postId);
                formData.append('state', JSON.stringify(state));
                formData.append('save_source', source);
                formData.append('timestamp', timestamp || Date.now());
                
                this.logger.info('WORDPRESS_SAVE', 'Sending save request to WordPress', {
                    postId,
                    componentCount: Object.keys(state.components || {}).length,
                    source
                });
                
                // Send AJAX request
                const response = await fetch(wpData.ajaxUrl, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const responseData = await response.json();
                
                if (responseData.success) {
                    this.lastSaveTime = Date.now();
                    this.logger.info('WORDPRESS_SAVE', 'Save successful', responseData.data);
                    
                    // Notify success
                    if (onComplete) {
                        onComplete(responseData.data);
                    }
                    
                    // Dispatch success event
                    document.dispatchEvent(new CustomEvent('gmkb:save-complete', {
                        detail: {
                            source,
                            timestamp: this.lastSaveTime,
                            response: responseData.data
                        }
                    }));
                    
                } else {
                    const errorMessage = responseData.data?.message || responseData.data || 'Save failed';
                    throw new Error(errorMessage);
                }
                
            } catch (error) {
                this.logger.error('WORDPRESS_SAVE', 'Save failed', error);
                
                if (onError) {
                    onError({ error: error.message });
                }
                
                // Dispatch error event
                document.dispatchEvent(new CustomEvent('gmkb:save-error', {
                    detail: {
                        source,
                        error: error.message
                    }
                }));
                
            } finally {
                this.saveInProgress = false;
            }
        }
        
        // Manual save method for direct calls
        async save(source = 'manual') {
            return new Promise((resolve, reject) => {
                this.handleSaveRequest({
                    source,
                    timestamp: Date.now(),
                    onComplete: resolve,
                    onError: reject
                });
            });
        }
        
        // Check if save is in progress
        isSaving() {
            return this.saveInProgress;
        }
        
        // Get last save time
        getLastSaveTime() {
            return this.lastSaveTime;
        }
    }
    
    // Initialize when dependencies are ready
    waitForDependencies(() => {
        window.wordPressSaveIntegration = new WordPressSaveIntegration();
        
        // Also expose a simple save function globally
        window.saveMediaKit = async (source = 'manual') => {
            return window.wordPressSaveIntegration.save(source);
        };
        
        console.log('✅ WordPress Save Integration: Ready');
    });
    
})();