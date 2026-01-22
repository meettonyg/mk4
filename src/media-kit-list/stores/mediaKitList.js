/**
 * Media Kit List Pinia Store
 *
 * Manages state for the Media Kit List view
 */

import { defineStore } from 'pinia';

export const useMediaKitListStore = defineStore('mediaKitList', {
    state: () => ({
        // Configuration
        nonce: null,
        apiUrl: '/wp-json/',
        createUrl: '/templates/',
        showCreate: true,

        // Media kits data
        mediakits: [],

        // UI state
        isLoading: false,
        isDeleting: false,

        // Errors
        lastError: null,
    }),

    getters: {
        /**
         * Get media kits sorted by modified date
         */
        sortedMediaKits: (state) => {
            return [...state.mediakits].sort((a, b) => {
                return new Date(b.modified) - new Date(a.modified);
            });
        },

        /**
         * Check if user has any media kits
         */
        hasMediaKits: (state) => state.mediakits.length > 0,

        /**
         * Get media kit count
         */
        mediaKitCount: (state) => state.mediakits.length,

        /**
         * Get published media kits
         */
        publishedMediaKits: (state) => {
            return state.mediakits.filter(mk => mk.status === 'publish');
        },

        /**
         * Get draft media kits
         */
        draftMediaKits: (state) => {
            return state.mediakits.filter(mk => mk.status === 'draft');
        },
    },

    actions: {
        /**
         * Set configuration
         */
        setConfig({ nonce, apiUrl, createUrl, showCreate }) {
            if (nonce) this.nonce = nonce;
            if (apiUrl) this.apiUrl = apiUrl;
            if (createUrl) this.createUrl = createUrl;
            if (typeof showCreate === 'boolean') this.showCreate = showCreate;
        },

        /**
         * Load all media kits
         */
        async loadMediaKits() {
            this.isLoading = true;
            this.lastError = null;

            try {
                const response = await this.apiRequest('GET', '/mediakits');

                if (response.success) {
                    this.mediakits = response.mediakits || [];
                    console.log(`Loaded ${this.mediakits.length} media kits`);
                } else {
                    throw new Error(response.message || 'Failed to load media kits');
                }
            } catch (error) {
                console.error('Failed to load media kits:', error);
                this.lastError = error.message;
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Delete a media kit
         */
        async deleteMediaKit(mediakitId) {
            this.isDeleting = true;

            try {
                // Note: This would need a delete endpoint - for now just remove from UI
                // const response = await this.apiRequest('DELETE', `/mediakit/${mediakitId}`);

                // Remove from list
                this.mediakits = this.mediakits.filter(mk => mk.id !== mediakitId);
                return true;
            } catch (error) {
                console.error('Failed to delete media kit:', error);
                this.lastError = error.message;
                return false;
            } finally {
                this.isDeleting = false;
            }
        },

        /**
         * Make API request with proper headers
         */
        async apiRequest(method, endpoint, body = null) {
            const url = `${this.apiUrl.replace(/\/$/, '')}/gmkb/v2${endpoint}`;

            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            };

            // Add nonce if available
            if (this.nonce) {
                options.headers['X-WP-Nonce'] = this.nonce;
            }

            // Add body for POST/PUT/DELETE
            if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return response.json();
        },
    },
});
