/**
 * Template Store - Template Directory State Management
 *
 * Manages template fetching, filtering, and instantiation for the
 * Carrd-like template directory feature.
 *
 * @package GMKB
 * @version 2.0.1
 */

import { defineStore } from 'pinia';
import { useMediaKitStore } from './mediaKit';
import { useThemeStore } from './theme';
import { useUIStore } from './ui';
import { mergeWithDefaults } from '../utils/componentSchema';

export const useTemplateStore = defineStore('templates', {
    state: () => ({
        // Template data
        templates: [],        // Built-in templates
        userTemplates: [],    // User-saved templates

        // Loading state
        isLoading: false,
        error: null,

        // Filtering state
        activeFilter: 'all',  // Category filter
        searchQuery: '',      // Search query

        // Selected template
        selectedTemplateId: null
    }),

    getters: {
        /**
         * Combine built-in and user templates
         */
        allTemplates: (state) => {
            return [
                ...state.templates,
                ...state.userTemplates.map(t => ({ ...t, type: 'user' }))
            ];
        },

        /**
         * Filter templates by category and search query
         */
        filteredTemplates: (state) => {
            let results = [
                ...state.templates,
                ...state.userTemplates.map(t => ({ ...t, type: 'user' }))
            ];

            // Filter by category
            if (state.activeFilter !== 'all') {
                results = results.filter(t => t.category === state.activeFilter);
            }

            // Filter by search query
            if (state.searchQuery) {
                const query = state.searchQuery.toLowerCase();
                results = results.filter(t =>
                    t.name.toLowerCase().includes(query) ||
                    (t.description && t.description.toLowerCase().includes(query)) ||
                    (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
                );
            }

            // Sort by sort_order
            return results.sort((a, b) =>
                (a.sort_order || 100) - (b.sort_order || 100)
            );
        },

        /**
         * Get template by ID
         */
        getById: (state) => (id) => {
            return state.templates.find(t => t.id === id) ||
                   state.userTemplates.find(t => t.id === id);
        },

        /**
         * Get available categories from templates
         */
        availableCategories: (state) => {
            const categories = new Set(['all']);
            state.templates.forEach(t => {
                if (t.category) categories.add(t.category);
            });
            return Array.from(categories);
        },

        /**
         * Premium templates only
         */
        premiumTemplates: (state) => {
            return state.templates.filter(t => t.is_premium);
        },

        /**
         * Free templates only
         */
        freeTemplates: (state) => {
            return state.templates.filter(t => !t.is_premium);
        },

        /**
         * User's saved templates
         */
        savedTemplates: (state) => {
            return state.userTemplates;
        },

        /**
         * Check if templates are loaded
         */
        hasTemplates: (state) => {
            return state.templates.length > 0;
        }
    },

    actions: {
        /**
         * Centralized fetch helper with REST API authentication
         * Reduces code duplication across all API methods (DRY principle)
         *
         * @param {string} endpoint - API endpoint (relative to restUrl)
         * @param {Object} options - Fetch options (method, body, headers, etc.)
         * @returns {Promise<Response>} Fetch response
         */
        async _fetchWithAuth(endpoint, options = {}) {
            const restUrl = window.gmkbData?.restUrl || '/wp-json/';
            const nonce = window.gmkbData?.restNonce || '';
            const url = `${restUrl}${endpoint}`;

            const fetchOptions = {
                ...options,
                headers: {
                    ...options.headers,
                    'X-WP-Nonce': nonce
                }
            };

            return fetch(url, fetchOptions);
        },

        /**
         * Fetch all templates from the API
         */
        async fetchTemplates() {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await this._fetchWithAuth('gmkb/v1/templates');

                if (!response.ok) {
                    throw new Error(`Failed to fetch templates: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    // Separate built-in and user templates
                    this.templates = data.templates.filter(t => t.type === 'built_in');
                    this.userTemplates = data.templates.filter(t => t.type === 'user');
                    console.log('✅ Templates loaded:', this.templates.length, 'built-in,', this.userTemplates.length, 'user');
                } else {
                    throw new Error(data.message || 'Unknown error');
                }
            } catch (err) {
                this.error = err.message;
                console.error('❌ Template fetch error:', err);

                // Fallback: Try to load from theme store if API fails
                this._loadFallbackTemplates();
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Fallback: Load templates from theme store if API unavailable
         */
        _loadFallbackTemplates() {
            const themeStore = useThemeStore();

            if (themeStore.availableThemes && themeStore.availableThemes.length > 0) {
                this.templates = themeStore.availableThemes.map(theme => ({
                    id: theme.theme_id || theme.id,
                    type: 'built_in',
                    name: theme.theme_name || theme.name,
                    description: theme.description || '',
                    category: theme.category || 'portfolio',
                    tags: theme.metadata?.tags || [],
                    is_premium: theme.metadata?.is_premium || false,
                    is_new: theme.metadata?.is_new || false,
                    sort_order: theme.metadata?.sort_order || 100,
                    has_default_content: !!theme.defaultContent,
                    thumbnail_image: null,
                    preview_image: null
                }));

                console.log('⚠️ Using fallback templates from theme store:', this.templates.length);
            }
        },

        /**
         * Fetch single template with full content
         */
        async fetchTemplate(templateId) {
            try {
                const response = await this._fetchWithAuth(`gmkb/v1/templates/${templateId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch template: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.template) {
                    return data.template;
                }

                throw new Error('Template not found');
            } catch (err) {
                console.error('❌ Fetch template error:', err);
                throw err;
            }
        },

        /**
         * CRITICAL: Initialize builder from a template
         * Generates fresh UUIDs for all sections/components
         *
         * IMPORTANT: This method handles two different template structures:
         * - Starter templates: sections at root level (template.sections)
         * - User templates: sections nested (template.defaultContent.sections or template.content.defaultContent.sections)
         */
        async initializeFromTemplate(templateId) {
            const mediaKitStore = useMediaKitStore();
            const themeStore = useThemeStore();
            const uiStore = useUIStore();

            console.log('🎯 Initializing from template:', templateId);

            try {
                // 1. Fetch full template data
                const template = await this.fetchTemplate(templateId);

                if (!template) {
                    throw new Error(`Template not found: ${templateId}`);
                }

                // 2. Reset current builder state
                mediaKitStore.sections = [];
                mediaKitStore.components = {};

                // 3. Apply theme styles (fall back to 'professional_clean' for starter templates)
                const themeId = template.theme_id || template.theme || 'professional_clean';
                themeStore.selectTheme(themeId);

                // 4. Apply theme customizations if present
                if (template.themeCustomizations) {
                    mediaKitStore.themeCustomizations = template.themeCustomizations;
                }

                // 5. CRITICAL FIX: Resolve sections from different possible structures
                // - Starter templates (flat): sections at root level
                // - User templates (nested): sections inside defaultContent
                const sectionsSource = template.sections ||
                                       template.defaultContent?.sections ||
                                       template.content?.defaultContent?.sections;

                if (!sectionsSource || !Array.isArray(sectionsSource)) {
                    throw new Error('Template data structure invalid: No sections found. Expected template.sections, template.defaultContent.sections, or template.content.defaultContent.sections');
                }

                // 6. Instantiate sections with fresh IDs
                if (sectionsSource.length > 0) {
                    for (const sectionDef of sectionsSource) {
                        const sectionId = this._generateId('sec');

                        const section = {
                            section_id: sectionId,
                            layout: sectionDef.type,
                            type: sectionDef.type,
                            components: [],
                            columns: {},
                            settings: {
                                background: sectionDef.background || 'default'
                            }
                        };

                        // Handle full_width sections
                        if (sectionDef.components) {
                            for (const compDef of sectionDef.components) {
                                const compId = this._generateId('comp');
                                section.components.push(compId);

                                // ROOT FIX: Merge template settings with DEFAULT_SETTINGS
                                // This ensures components have proper style/advanced structure
                                mediaKitStore.components[compId] = {
                                    component_id: compId,
                                    type: compDef.type,
                                    section_id: sectionId,
                                    settings: mergeWithDefaults(compDef.settings || {}),
                                    data: compDef.data || {},
                                    customization: {}
                                };
                            }
                        }

                        // Handle multi-column sections
                        if (sectionDef.columns) {
                            // Store column ratio if provided (for section settings)
                            if (sectionDef.columns.ratio) {
                                section.settings.columnRatio = sectionDef.columns.ratio;
                            }

                            for (const [colNum, colComponents] of Object.entries(sectionDef.columns)) {
                                // Skip non-column entries like 'ratio'
                                if (!Array.isArray(colComponents)) {
                                    continue;
                                }

                                section.columns[colNum] = [];

                                for (const compDef of colComponents) {
                                    const compId = this._generateId('comp');
                                    section.columns[colNum].push(compId);

                                    // ROOT FIX: Merge template settings with DEFAULT_SETTINGS
                                    // This ensures components have proper style/advanced structure
                                    mediaKitStore.components[compId] = {
                                        component_id: compId,
                                        type: compDef.type,
                                        section_id: sectionId,
                                        column: parseInt(colNum),
                                        settings: mergeWithDefaults(compDef.settings || {}),
                                        data: compDef.data || {},
                                        customization: {}
                                    };
                                }
                            }
                        }

                        mediaKitStore.sections.push(section);
                    }
                }

                // 7. Mark as dirty (unsaved)
                mediaKitStore.isDirty = true;

                // 8. Set selected template
                this.selectedTemplateId = templateId;

                // 9. Navigate to builder
                uiStore.showBuilder();

                console.log('✅ Template initialized successfully:', {
                    sections: mediaKitStore.sections.length,
                    components: Object.keys(mediaKitStore.components).length
                });

                return template;

            } catch (err) {
                console.error('❌ Template initialization error:', err);
                throw err;
            }
        },

        /**
         * Initialize a blank media kit
         */
        initializeBlank() {
            const mediaKitStore = useMediaKitStore();
            const themeStore = useThemeStore();
            const uiStore = useUIStore();

            console.log('🎯 Initializing blank media kit');

            // Reset state
            mediaKitStore.sections = [];
            mediaKitStore.components = {};
            mediaKitStore.themeCustomizations = {
                colors: {},
                typography: {},
                spacing: {},
                effects: {}
            };

            // Default theme
            themeStore.selectTheme('professional_clean');

            // Add single empty section
            const sectionId = this._generateId('sec');
            mediaKitStore.sections.push({
                section_id: sectionId,
                layout: 'full_width',
                type: 'full_width',
                components: [],
                columns: {}
            });

            // Mark as dirty
            mediaKitStore.isDirty = true;

            // Clear selected template
            this.selectedTemplateId = null;

            // Navigate to builder
            uiStore.showBuilder();

            console.log('✅ Blank media kit initialized');
        },

        /**
         * Save current design as a template
         */
        async saveAsTemplate(name, description = '') {
            const mediaKitStore = useMediaKitStore();
            const themeStore = useThemeStore();

            console.log('💾 Saving as template:', name);

            try {
                const response = await this._fetchWithAuth('gmkb/v1/templates/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        content: {
                            theme: themeStore.activeThemeId,
                            themeCustomizations: mediaKitStore.themeCustomizations,
                            defaultContent: {
                                sections: this._normalizeContentForSave(
                                    mediaKitStore.sections,
                                    mediaKitStore.components
                                )
                            }
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to save template: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    // Refresh templates list
                    await this.fetchTemplates();
                    console.log('✅ Template saved successfully, ID:', data.id);
                    return data;
                }

                throw new Error(data.message || 'Save failed');

            } catch (err) {
                console.error('❌ Save template error:', err);
                throw err;
            }
        },

        /**
         * Delete a user template
         */
        async deleteUserTemplate(templateId) {
            console.log('🗑️ Deleting template:', templateId);

            try {
                const response = await this._fetchWithAuth(`gmkb/v1/templates/user/${templateId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete template: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    // Remove from local state
                    this.userTemplates = this.userTemplates.filter(t => t.id !== templateId);
                    console.log('✅ Template deleted successfully');
                    return data;
                }

                throw new Error(data.message || 'Delete failed');

            } catch (err) {
                console.error('❌ Delete template error:', err);
                throw err;
            }
        },

        /**
         * Set the active filter
         */
        setFilter(category) {
            this.activeFilter = category;
        },

        /**
         * Set the search query
         */
        setSearchQuery(query) {
            this.searchQuery = query;
        },

        /**
         * Clear all filters
         */
        clearFilters() {
            this.activeFilter = 'all';
            this.searchQuery = '';
        },

        /**
         * Generate unique ID for sections/components
         */
        _generateId(prefix) {
            return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        },

        /**
         * Normalize content for saving (remove IDs, create clean structure)
         */
        _normalizeContentForSave(sections, components) {
            return sections.map(section => {
                const normalized = {
                    type: section.layout
                };

                // Handle full_width sections
                if (section.components && section.components.length > 0) {
                    normalized.components = section.components.map(compId => {
                        const comp = components[compId];
                        if (!comp) return null;
                        return {
                            type: comp.type,
                            settings: comp.settings || {},
                            data: comp.data || {}
                        };
                    }).filter(Boolean);
                }

                // Handle multi-column sections
                if (section.columns && Object.keys(section.columns).length > 0) {
                    normalized.columns = {};
                    for (const [colNum, colCompIds] of Object.entries(section.columns)) {
                        normalized.columns[colNum] = colCompIds.map(compId => {
                            const comp = components[compId];
                            if (!comp) return null;
                            return {
                                type: comp.type,
                                settings: comp.settings || {},
                                data: comp.data || {}
                            };
                        }).filter(Boolean);
                    }
                }

                return normalized;
            });
        }
    }
});
