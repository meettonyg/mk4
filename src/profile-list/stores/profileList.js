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
        upgradeUrl: '/pricing/',

        // Profiles data
        profiles: [],

        // Limit status
        limitStatus: null,

        // UI state
        isLoading: false,
        isCreating: false,
        showCreateModal: false,
        viewMode: 'cards', // 'cards' or 'table'
        searchQuery: '',

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
         * Get filtered and sorted profiles based on search query
         */
        filteredProfiles: (state) => {
            let filtered = [...state.profiles];

            // Apply search filter
            if (state.searchQuery.trim()) {
                const query = state.searchQuery.toLowerCase();
                filtered = filtered.filter(p =>
                    (p.title && p.title.toLowerCase().includes(query)) ||
                    (p.tagline && p.tagline.toLowerCase().includes(query))
                );
            }

            // Sort by modified date
            return filtered.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        },

        /**
         * Check if user has any profiles
         */
        hasProfiles: (state) => state.profiles.length > 0,

        /**
         * Get profile count
         */
        profileCount: (state) => state.profiles.length,

        /**
         * Check if user can create more profiles
         */
        canCreateProfile: (state) => {
            if (!state.limitStatus) return true;
            return state.limitStatus.can_create;
        },

        /**
         * Check if user is at their profile limit
         */
        isAtLimit: (state) => {
            if (!state.limitStatus) return false;
            return state.limitStatus.at_limit;
        },

        /**
         * Check if user has unlimited profiles
         */
        isUnlimited: (state) => {
            if (!state.limitStatus) return false;
            return state.limitStatus.is_unlimited;
        },

        /**
         * Get profile limit (max allowed)
         */
        profileLimit: (state) => {
            if (!state.limitStatus) return -1;
            return state.limitStatus.profile_limit;
        },

        /**
         * Get remaining profile slots
         */
        remainingSlots: (state) => {
            if (!state.limitStatus) return -1;
            return state.limitStatus.remaining_slots;
        },

        /**
         * Get user's membership tier info
         */
        membershipTier: (state) => {
            if (!state.limitStatus) return null;
            return state.limitStatus.tier;
        },

        /**
         * Get the upgrade URL
         */
        upgradeLink: (state) => {
            if (state.limitStatus?.upgrade_url) {
                return state.limitStatus.upgrade_url;
            }
            return state.upgradeUrl;
        },
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
         * Set view mode
         */
        setViewMode(mode) {
            this.viewMode = mode;
        },

        /**
         * Set search query
         */
        setSearchQuery(query) {
            this.searchQuery = query;
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
                    this.limitStatus = response.limit_status || null;
                    console.log(`Loaded ${this.profiles.length} profiles`);

                    if (this.limitStatus) {
                        console.log(`Profile limits: ${this.limitStatus.current_count}/${this.limitStatus.profile_limit === -1 ? 'unlimited' : this.limitStatus.profile_limit}`);
                    }
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
            // Check limits before attempting creation
            if (this.limitStatus && !this.limitStatus.can_create) {
                this.lastError = `You have reached your profile limit of ${this.limitStatus.profile_limit}. Please upgrade to create more profiles.`;
                return null;
            }

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

                    // Update limit status if returned
                    if (response.limit_status) {
                        this.limitStatus = response.limit_status;
                    }

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

                // Check for limit error in response
                if (error.limit_status) {
                    this.limitStatus = error.limit_status;
                }

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
         * Returns false if at limit, true if modal opened
         */
        openCreateModal() {
            // Check if user can create more profiles
            if (this.limitStatus && !this.limitStatus.can_create) {
                return false;
            }

            this.newProfile = { first_name: '', last_name: '' };
            this.showCreateModal = true;
            return true;
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
