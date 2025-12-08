/**
 * Profile List Pinia Store
 *
 * Manages state for the Profile List view
 */

import { defineStore } from 'pinia';

export const useProfileListStore = defineStore('profileList', {
    state: () => ({
        // Configuration
        nonce: null,
        apiUrl: '/wp-json/',
        createUrl: '/app/profiles/guest/profile/',

        // Profiles data
        profiles: [],

        // UI state
        isLoading: false,
        isCreating: false,
        showCreateModal: false,

        // Errors
        lastError: null,

        // New profile form
        newProfile: {
            first_name: '',
            last_name: '',
        },
    }),

    getters: {
        /**
         * Get profiles sorted by modified date
         */
        sortedProfiles: (state) => {
            return [...state.profiles].sort((a, b) => {
                return new Date(b.modified) - new Date(a.modified);
            });
        },

        /**
         * Check if user has any profiles
         */
        hasProfiles: (state) => state.profiles.length > 0,

        /**
         * Get profile count
         */
        profileCount: (state) => state.profiles.length,
    },

    actions: {
        /**
         * Set configuration
         */
        setConfig({ nonce, apiUrl, createUrl }) {
            if (nonce) this.nonce = nonce;
            if (apiUrl) this.apiUrl = apiUrl;
            if (createUrl) this.createUrl = createUrl;
        },

        /**
         * Load all profiles
         */
        async loadProfiles() {
            this.isLoading = true;
            this.lastError = null;

            try {
                const response = await this.apiRequest('GET', '/profiles');

                if (response.success) {
                    this.profiles = response.profiles || [];
                    console.log(`Loaded ${this.profiles.length} profiles`);
                } else {
                    throw new Error(response.message || 'Failed to load profiles');
                }
            } catch (error) {
                console.error('Failed to load profiles:', error);
                this.lastError = error.message;
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Create a new profile
         */
        async createProfile() {
            this.isCreating = true;
            this.lastError = null;

            try {
                const response = await this.apiRequest('POST', '/profiles', {
                    first_name: this.newProfile.first_name,
                    last_name: this.newProfile.last_name,
                });

                if (response.success && response.profile) {
                    // Add to list
                    this.profiles.unshift(response.profile);

                    // Reset form
                    this.newProfile = { first_name: '', last_name: '' };
                    this.showCreateModal = false;

                    // Navigate to edit page
                    if (response.profile.editUrl) {
                        window.location.href = response.profile.editUrl;
                    }

                    return response.profile;
                } else {
                    throw new Error(response.message || 'Failed to create profile');
                }
            } catch (error) {
                console.error('Failed to create profile:', error);
                this.lastError = error.message;
                return null;
            } finally {
                this.isCreating = false;
            }
        },

        /**
         * Delete a profile
         */
        async deleteProfile(profileId) {
            try {
                const response = await this.apiRequest('DELETE', `/profile/${profileId}`);

                if (response.success) {
                    // Remove from list
                    this.profiles = this.profiles.filter(p => p.id !== profileId);
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to delete profile');
                }
            } catch (error) {
                console.error('Failed to delete profile:', error);
                this.lastError = error.message;
                return false;
            }
        },

        /**
         * Open create modal
         */
        openCreateModal() {
            this.newProfile = { first_name: '', last_name: '' };
            this.showCreateModal = true;
        },

        /**
         * Close create modal
         */
        closeCreateModal() {
            this.showCreateModal = false;
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
