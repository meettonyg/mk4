/**
 * WordPress-Vue Bridge
 * Provides promise-based communication between Vue app and WordPress backend
 * Architecture-compliant: Event-driven, no polling, single responsibility
 */

(function() {
    'use strict';

    // Initialize bridge with error-safe defaults
    window.gmkbBridge = {
        /**
         * Fetch initial state from WordPress
         * @returns {Promise} Initial state data including components, themes, and saved state
         */
        async getInitialState() {
            return this._makeRequest('gmkb_get_initial_state', {
                post_id: this._getPostId()
            });
        },

        /**
         * Save media kit state to WordPress
         * @param {Object} state - The complete media kit state to save
         * @returns {Promise} Save operation result
         */
        async saveMediaKit(state) {
            return this._makeRequest('gmkb_save_media_kit', {
                post_id: this._getPostId(),
                state: JSON.stringify(state)
            });
        },

        /**
         * Get available component definitions
         * @returns {Promise} Component library data
         */
        async getComponents() {
            return this._makeRequest('gmkb_get_components');
        },

        /**
         * Get available themes
         * @returns {Promise} Theme definitions
         */
        async getThemes() {
            return this._makeRequest('gmkb_get_themes');
        },

        /**
         * Get Pods data for dynamic content
         * @returns {Promise} Pods field data
         */
        async getPodsData() {
            return this._makeRequest('gmkb_get_pods_data', {
                post_id: this._getPostId()
            });
        },

        /**
         * Update single component
         * @param {string} componentId - Component ID to update
         * @param {Object} data - Component data
         * @returns {Promise} Update result
         */
        async updateComponent(componentId, data) {
            return this._makeRequest('gmkb_update_component', {
                post_id: this._getPostId(),
                component_id: componentId,
                data: JSON.stringify(data)
            });
        },

        /**
         * Delete component
         * @param {string} componentId - Component ID to delete
         * @returns {Promise} Delete result
         */
        async deleteComponent(componentId) {
            return this._makeRequest('gmkb_delete_component', {
                post_id: this._getPostId(),
                component_id: componentId
            });
        },

        /**
         * Internal: Make AJAX request with error handling
         * @private
         */
        _makeRequest(action, data = {}) {
            return new Promise((resolve, reject) => {
                // Validate environment
                if (!this._validateEnvironment()) {
                    return reject(new Error('WordPress environment not properly initialized'));
                }

                // Prepare request data
                const requestData = {
                    action: action,
                    nonce: window.gmkbData.nonce,
                    ...data
                };

                // Make AJAX request
                jQuery.ajax({
                    url: window.gmkbData.ajaxUrl,
                    type: 'POST',
                    data: requestData,
                    dataType: 'json',
                    timeout: 30000, // 30 second timeout
                    
                    success: (response) => {
                        if (response.success) {
                            resolve(response.data);
                        } else {
                            const error = new Error(response.data?.message || 'Request failed');
                            error.code = response.data?.code || 'UNKNOWN_ERROR';
                            reject(error);
                        }
                    },
                    
                    error: (xhr, status, error) => {
                        console.error(`Bridge request failed: ${action}`, { status, error });
                        
                        let errorMessage = 'Network request failed';
                        if (status === 'timeout') {
                            errorMessage = 'Request timed out';
                        } else if (xhr.status === 403) {
                            errorMessage = 'Permission denied';
                        } else if (xhr.status === 404) {
                            errorMessage = 'Endpoint not found';
                        }
                        
                        reject(new Error(errorMessage));
                    }
                });
            });
        },

        /**
         * Internal: Validate WordPress environment
         * @private
         */
        _validateEnvironment() {
            if (typeof jQuery === 'undefined') {
                console.error('jQuery is required for WordPress bridge');
                return false;
            }

            if (!window.gmkbData) {
                console.error('WordPress data object (gmkbData) not found');
                return false;
            }

            if (!window.gmkbData.ajaxUrl) {
                console.error('AJAX URL not configured');
                return false;
            }

            if (!window.gmkbData.nonce) {
                console.error('Security nonce not configured');
                return false;
            }

            return true;
        },

        /**
         * Internal: Get current post ID
         * @private
         */
        _getPostId() {
            return window.gmkbData?.postId || window.gmkbData?.post_id || 0;
        },

        /**
         * Initialize bridge and emit ready event
         */
        initialize() {
            if (!this._validateEnvironment()) {
                console.error('Bridge initialization failed: Invalid environment');
                
                // Emit failure event
                document.dispatchEvent(new CustomEvent('gmkb:bridge:failed', {
                    detail: { reason: 'Invalid environment' }
                }));
                
                return false;
            }

            // Emit ready event
            document.dispatchEvent(new CustomEvent('gmkb:bridge:ready', {
                detail: { bridge: this }
            }));

            console.log('WordPress-Vue bridge initialized successfully');
            return true;
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.gmkbBridge.initialize();
        });
    } else {
        // DOM already loaded
        setTimeout(() => {
            window.gmkbBridge.initialize();
        }, 0);
    }

})();
