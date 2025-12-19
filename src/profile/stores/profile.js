/**
 * Profile Pinia Store
 *
 * Manages all state for the Guest Profile editor
 */

import { defineStore } from 'pinia';
import storageService from '../../services/StorageService';

// Key fields that contribute to profile completeness (matches API calculation)
const REQUIRED_FIELDS = [
    'first_name',
    'last_name',
    'biography',
    'tagline',
    'headshot_primary',
    'topic_1',
    'question_1',
    'social_linkedin',
    'website_primary',
    'why_book_you',
];

export const useProfileStore = defineStore('profile', {
    state: () => ({
        // Configuration
        postId: null,
        nonce: null,
        apiUrl: '/wp-json/',

        // Profile data
        fields: {},
        originalFields: {}, // For dirty checking
        postData: null,
        taxonomies: {},

        // UI state
        isLoading: false,
        isSaving: false,
        isDirty: false,
        activeTab: 'overview',
        editingSection: null, // Which panel is being edited

        // Errors
        errors: {},
        lastError: null,

        // Save status
        lastSaved: null,
        saveQueue: [],
    }),

    getters: {
        /**
         * Get full display name
         */
        fullName: (state) => {
            const parts = [];
            if (state.fields.prefix) parts.push(state.fields.prefix);
            if (state.fields.first_name) parts.push(state.fields.first_name);
            if (state.fields.last_name) parts.push(state.fields.last_name);
            if (state.fields.suffix) parts.push(state.fields.suffix);
            return parts.join(' ') || 'Unnamed Profile';
        },

        /**
         * Check if there are unsaved changes
         */
        hasUnsavedChanges: (state) => state.isDirty,

        /**
         * Get save status for UI
         */
        saveStatus: (state) => {
            if (state.isSaving) return 'saving';
            if (state.isDirty) return 'unsaved';
            return 'saved';
        },

        /**
         * Get field value with fallback
         */
        getField: (state) => (key, defaultValue = '') => {
            return state.fields[key] ?? defaultValue;
        },

        /**
         * Get topics as array (topic_1 through topic_5)
         */
        topics: (state) => {
            const topics = [];
            for (let i = 1; i <= 5; i++) {
                const topic = state.fields[`topic_${i}`];
                const questions = [];
                const startQ = (i - 1) * 5 + 1;
                for (let q = startQ; q < startQ + 5; q++) {
                    questions.push(state.fields[`question_${q}`] || '');
                }
                topics.push({
                    id: i,
                    title: topic || '',
                    questions,
                });
            }
            return topics;
        },

        /**
         * Get social links as structured object
         */
        socialLinks: (state) => ({
            facebook: state.fields.social_facebook || '',
            twitter: state.fields.social_twitter || '',
            instagram: state.fields.social_instagram || '',
            linkedin: state.fields.social_linkedin || '',
            youtube: state.fields.social_youtube || '',
            pinterest: state.fields.social_pinterest || '',
            tiktok: state.fields.social_tiktok || '',
            website1: state.fields.website_primary || '',
            website2: state.fields.website_secondary || '',
        }),

        /**
         * Get brand colors as structured object
         */
        brandColors: (state) => ({
            primary: state.fields.color_primary || '',
            accent: state.fields.color_accent || '',
            contrasting: state.fields.color_contrasting || '',
            background: state.fields.color_background || '',
            header: state.fields.color_header || '',
            headerAccent: state.fields.color_header_accent || '',
            headerText: state.fields.color_header_text || '',
            paragraph: state.fields.color_paragraph || '',
        }),

        /**
         * Get interviews as array
         */
        interviews: (state) => [
            {
                id: 1,
                title: state.fields.episode_1_title || '',
                link: state.fields.episode_1_link || '',
            },
            {
                id: 2,
                title: state.fields.episode_2_title || '',
                link: state.fields.episode_2_link || '',
            },
            {
                id: 3,
                title: state.fields.episode_3_title || '',
                link: state.fields.episode_3_link || '',
            },
        ],

        /**
         * Get offers as array
         */
        offers: (state) => [
            {
                id: 1,
                text: state.fields.offer_1 || '',
                link: state.fields.offer_1_link || '',
            },
            {
                id: 2,
                text: state.fields.offer_2 || '',
                link: state.fields.offer_2_link || '',
            },
        ],

        /**
         * Calculate profile completeness percentage
         */
        completeness: (state) => {
            let filled = 0;
            for (const field of REQUIRED_FIELDS) {
                const value = state.fields[field];
                if (value && (typeof value !== 'object' || value.url)) {
                    filled++;
                }
            }

            return Math.round((filled / REQUIRED_FIELDS.length) * 100);
        },
    },

    actions: {
        /**
         * Set configuration
         */
        setConfig({ postId, nonce, apiUrl }) {
            this.postId = postId;
            if (nonce) this.nonce = nonce;
            if (apiUrl) this.apiUrl = apiUrl;
        },

        /**
         * Load profile data from API
         */
        async loadProfile() {
            if (!this.postId) {
                console.error('Cannot load profile: no postId');
                return;
            }

            this.isLoading = true;
            this.lastError = null;

            try {
                const response = await this.apiRequest('GET', `/profile/${this.postId}`);

                if (response.success && response.data) {
                    // Store original for dirty checking
                    this.originalFields = JSON.parse(JSON.stringify(response.data));
                    this.fields = response.data;

                    // Extract post data and taxonomies
                    if (response.data._post) {
                        this.postData = response.data._post;
                    }
                    if (response.data._taxonomies) {
                        this.taxonomies = response.data._taxonomies;
                    }

                    this.isDirty = false;
                    console.log('✅ Profile loaded:', this.postId);
                } else {
                    throw new Error(response.message || 'Failed to load profile');
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
                this.lastError = error.message;
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Update a single field
         */
        updateField(fieldName, value) {
            this.fields[fieldName] = value;
            this.isDirty = true;
        },

        /**
         * Update multiple fields at once
         */
        updateFields(updates) {
            Object.assign(this.fields, updates);
            this.isDirty = true;
        },

        /**
         * Save a single field to the server
         */
        async saveField(fieldName) {
            if (!this.postId) {
                console.error('Cannot save field: postId not set');
                this.lastError = 'Profile ID not available';
                return false;
            }

            try {
                const response = await this.apiRequest(
                    'POST',
                    `/profile/${this.postId}/field/${fieldName}`,
                    { value: this.fields[fieldName] }
                );

                if (response.success) {
                    this.originalFields[fieldName] = this.fields[fieldName];
                    this.checkDirtyState();
                    return true;
                }
                return false;
            } catch (error) {
                console.error(`Failed to save field ${fieldName}:`, error);
                this.errors[fieldName] = error.message;
                return false;
            }
        },

        /**
         * Save multiple fields to the server
         */
        async saveFields(fieldNames) {
            if (!this.postId) {
                console.error('Cannot save fields: postId not set');
                this.lastError = 'Profile ID not available';
                return false;
            }

            const fieldsToSave = {};
            fieldNames.forEach((name) => {
                fieldsToSave[name] = this.fields[name];
            });

            try {
                const response = await this.apiRequest(
                    'POST',
                    `/profile/${this.postId}/fields`,
                    fieldsToSave
                );

                if (response.success) {
                    // Update originalFields for ALL fields we attempted to save
                    // This ensures dirty state is cleared even if API returns empty updated object
                    fieldNames.forEach((key) => {
                        this.originalFields[key] = JSON.parse(JSON.stringify(this.fields[key]));
                    });
                    this.checkDirtyState();
                    this.lastSaved = new Date();
                    console.log('✅ Profile saved');
                    return true;
                }

                // Handle partial errors
                if (response.errors) {
                    Object.assign(this.errors, response.errors);
                }
                return false;
            } catch (error) {
                console.error('Failed to save fields:', error);
                this.lastError = error.message;
                return false;
            }
        },

        /**
         * Save entire profile
         */
        async saveProfile() {
            if (!this.postId || !this.isDirty) return true;

            this.isSaving = true;
            this.lastError = null;
            this.errors = {};

            try {
                // Only send changed fields
                const changedFields = {};
                Object.keys(this.fields).forEach((key) => {
                    if (key.startsWith('_')) return; // Skip internal fields
                    if (JSON.stringify(this.fields[key]) !== JSON.stringify(this.originalFields[key])) {
                        changedFields[key] = this.fields[key];
                    }
                });

                if (Object.keys(changedFields).length === 0) {
                    this.isDirty = false;
                    return true;
                }

                const response = await this.apiRequest(
                    'POST',
                    `/profile/${this.postId}`,
                    changedFields
                );

                if (response.success) {
                    // Update original fields for changed ones
                    Object.keys(changedFields).forEach((key) => {
                        this.originalFields[key] = this.fields[key];
                    });
                    this.isDirty = false;
                    this.lastSaved = new Date();
                    console.log('✅ Profile saved');
                    return true;
                }

                // Handle partial errors
                if (response.errors) {
                    Object.assign(this.errors, response.errors);
                }
                return false;
            } catch (error) {
                console.error('Failed to save profile:', error);
                this.lastError = error.message;
                return false;
            } finally {
                this.isSaving = false;
            }
        },

        /**
         * Check if profile has unsaved changes
         */
        checkDirtyState() {
            const changedKeys = Object.keys(this.fields).filter((key) => {
                if (key.startsWith('_')) return false;
                return JSON.stringify(this.fields[key]) !== JSON.stringify(this.originalFields[key]);
            });
            this.isDirty = changedKeys.length > 0;
        },

        /**
         * Reset field to original value
         */
        resetField(fieldName) {
            if (this.originalFields[fieldName] !== undefined) {
                this.fields[fieldName] = JSON.parse(JSON.stringify(this.originalFields[fieldName]));
                this.checkDirtyState();
            }
        },

        /**
         * Reset all changes
         */
        resetAll() {
            this.fields = JSON.parse(JSON.stringify(this.originalFields));
            this.isDirty = false;
            this.errors = {};
        },

        /**
         * Get storage key for active tab (namespaced by postId)
         */
        _getTabStorageKey() {
            return this.postId ? `profile-active-tab-${this.postId}` : 'profile-active-tab';
        },

        /**
         * Set active tab and persist to localStorage
         */
        setActiveTab(tabId) {
            this.activeTab = tabId;
            storageService.set(this._getTabStorageKey(), tabId);
        },

        /**
         * Load active tab from localStorage
         */
        loadActiveTabFromStorage() {
            const savedTab = storageService.get(this._getTabStorageKey());
            if (savedTab && ['overview', 'value', 'messaging', 'branding'].includes(savedTab)) {
                this.activeTab = savedTab;
                console.log('✅ Profile: Loaded active tab from storage:', savedTab);
            }
        },

        /**
         * Start editing a section
         */
        startEditing(sectionId) {
            // Save current section first if different
            if (this.editingSection && this.editingSection !== sectionId) {
                // Could trigger auto-save here
            }
            this.editingSection = sectionId;
        },

        /**
         * Stop editing (cancel or after save)
         */
        stopEditing() {
            this.editingSection = null;
        },

        /**
         * Clear error for a field
         */
        clearError(fieldName) {
            delete this.errors[fieldName];
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

            // Add body for POST/PUT
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
