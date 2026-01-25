/**
 * Brand Kit Store
 *
 * Pinia store for managing Brand Kit state in Vue components.
 * Wraps BrandKitService with reactive state management.
 *
 * @module stores/brandKit
 * @version 1.0.0
 */

import { defineStore } from 'pinia';
import brandKitService from '../services/BrandKitService.js';

export const useBrandKitStore = defineStore('brandKit', {
  state: () => ({
    // List of brand kits
    brandKits: [],

    // Currently selected/active brand kit (for editing)
    activeBrandKit: null,

    // Currently selected brand kit ID (for profile association)
    selectedBrandKitId: null,

    // Schema data
    schema: null,

    // Loading states
    isLoading: false,
    isLoadingMedia: false,
    isSaving: false,

    // Error state
    error: null,

    // Editor state
    editorOpen: false,
    editorMode: 'view', // 'view', 'edit', 'create'

    // Unsaved changes tracking
    hasUnsavedChanges: false,

    // Temporary edit state (for cancel functionality)
    editBuffer: null,
  }),

  getters: {
    /**
     * Get brand kit by ID
     */
    getBrandKitById: (state) => (id) => {
      return state.brandKits.find((kit) => kit.id === id);
    },

    /**
     * Get brand kits owned by current user
     */
    ownedBrandKits: (state) => {
      return state.brandKits.filter((kit) => kit.ownership === 'owned');
    },

    /**
     * Get organization-shared brand kits
     */
    organizationBrandKits: (state) => {
      return state.brandKits.filter((kit) => kit.ownership === 'organization');
    },

    /**
     * Check if active brand kit has media
     */
    hasMedia: (state) => {
      return state.activeBrandKit?.media?.length > 0;
    },

    /**
     * Get media grouped by category
     */
    mediaByCategory: (state) => {
      if (!state.activeBrandKit?.media) return {};

      return state.activeBrandKit.media.reduce((acc, item) => {
        const cat = item.category || 'uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});
    },

    /**
     * Get primary headshot from active brand kit
     */
    primaryHeadshot: (state) => {
      if (!state.activeBrandKit?.media) return null;
      const headshots = state.activeBrandKit.media.filter((m) => m.category === 'headshot');
      return headshots.find((h) => h.is_primary) || headshots[0] || null;
    },

    /**
     * Get all headshots from active brand kit
     */
    headshots: (state) => {
      if (!state.activeBrandKit?.media) return [];
      return state.activeBrandKit.media.filter((m) => m.category === 'headshot');
    },

    /**
     * Get all logos from active brand kit
     */
    logos: (state) => {
      if (!state.activeBrandKit?.media) return [];
      return state.activeBrandKit.media.filter((m) => m.category === 'logo');
    },

    /**
     * Get logos by tag
     */
    logosByTag: (state) => (tag) => {
      if (!state.activeBrandKit?.media) return [];
      return state.activeBrandKit.media.filter(
        (m) => m.category === 'logo' && m.tags?.includes(tag)
      );
    },

    /**
     * Get color from active brand kit
     */
    getColor: (state) => (colorKey) => {
      return state.activeBrandKit?.[colorKey] || state.schema?.defaults?.[colorKey] || null;
    },

    /**
     * Get all colors from active brand kit
     */
    colors: (state) => {
      if (!state.activeBrandKit) return {};

      const colorKeys = [
        'color_primary',
        'color_secondary',
        'color_accent',
        'color_background',
        'color_surface',
        'color_text',
        'color_text_muted',
        'color_link',
      ];

      return colorKeys.reduce((acc, key) => {
        acc[key] = state.activeBrandKit[key] || '';
        return acc;
      }, {});
    },

    /**
     * Get fonts from active brand kit
     */
    fonts: (state) => {
      if (!state.activeBrandKit) return {};

      return {
        font_primary: state.activeBrandKit.font_primary || '',
        font_heading: state.activeBrandKit.font_heading || '',
        font_accent: state.activeBrandKit.font_accent || '',
      };
    },
  },

  actions: {
    /**
     * Load all brand kits
     */
    async loadBrandKits(forceRefresh = false) {
      this.isLoading = true;
      this.error = null;

      try {
        this.brandKits = await brandKitService.getAll(forceRefresh);
      } catch (err) {
        this.error = err.message;
        console.error('[BrandKitStore] Failed to load brand kits:', err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Load a single brand kit with full media
     */
    async loadBrandKit(id) {
      this.isLoading = true;
      this.error = null;

      try {
        this.activeBrandKit = await brandKitService.get(id);
        this.selectedBrandKitId = id;
      } catch (err) {
        this.error = err.message;
        console.error('[BrandKitStore] Failed to load brand kit:', err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Load schema data
     */
    async loadSchema() {
      if (this.schema) return this.schema;

      try {
        this.schema = await brandKitService.getSchema();
        return this.schema;
      } catch (err) {
        console.error('[BrandKitStore] Failed to load schema:', err);
        return null;
      }
    },

    /**
     * Create a new brand kit
     */
    async createBrandKit(data) {
      this.isSaving = true;
      this.error = null;

      try {
        const newKit = await brandKitService.create(data);

        // Add to list
        this.brandKits.push({ ...newKit, ownership: 'owned' });

        // Set as active
        this.activeBrandKit = newKit;
        this.selectedBrandKitId = newKit.id;

        return newKit;
      } catch (err) {
        this.error = err.message;
        console.error('[BrandKitStore] Failed to create brand kit:', err);
        throw err;
      } finally {
        this.isSaving = false;
      }
    },

    /**
     * Update active brand kit
     */
    async updateBrandKit(data) {
      if (!this.activeBrandKit?.id) {
        throw new Error('No active brand kit to update');
      }

      this.isSaving = true;
      this.error = null;

      try {
        const updated = await brandKitService.update(this.activeBrandKit.id, data);

        // Update active
        this.activeBrandKit = { ...this.activeBrandKit, ...updated };

        // Update in list
        const index = this.brandKits.findIndex((k) => k.id === updated.id);
        if (index !== -1) {
          this.brandKits[index] = { ...this.brandKits[index], ...updated };
        }

        this.hasUnsavedChanges = false;

        return updated;
      } catch (err) {
        this.error = err.message;
        console.error('[BrandKitStore] Failed to update brand kit:', err);
        throw err;
      } finally {
        this.isSaving = false;
      }
    },

    /**
     * Delete a brand kit
     */
    async deleteBrandKit(id, force = false) {
      this.isSaving = true;
      this.error = null;

      try {
        await brandKitService.delete(id, force);

        // Remove from list
        this.brandKits = this.brandKits.filter((k) => k.id !== id);

        // Clear active if deleted
        if (this.activeBrandKit?.id === id) {
          this.activeBrandKit = null;
          this.selectedBrandKitId = null;
        }

        return true;
      } catch (err) {
        this.error = err.message;
        console.error('[BrandKitStore] Failed to delete brand kit:', err);
        throw err;
      } finally {
        this.isSaving = false;
      }
    },

    /**
     * Duplicate a brand kit
     */
    async duplicateBrandKit(id) {
      this.isSaving = true;
      this.error = null;

      try {
        const newKit = await brandKitService.duplicate(id);

        // Add to list
        this.brandKits.push({ ...newKit, ownership: 'owned' });

        return newKit;
      } catch (err) {
        this.error = err.message;
        console.error('[BrandKitStore] Failed to duplicate brand kit:', err);
        throw err;
      } finally {
        this.isSaving = false;
      }
    },

    /**
     * Add media to active brand kit
     */
    async addMedia(mediaData) {
      if (!this.activeBrandKit?.id) {
        throw new Error('No active brand kit');
      }

      this.isLoadingMedia = true;

      try {
        const result = await brandKitService.addMedia(this.activeBrandKit.id, mediaData);

        // Update active brand kit media
        this.activeBrandKit.media = result.media;

        return result;
      } catch (err) {
        this.error = err.message;
        console.error('[BrandKitStore] Failed to add media:', err);
        throw err;
      } finally {
        this.isLoadingMedia = false;
      }
    },

    /**
     * Update media entry
     */
    async updateMedia(mediaEntryId, data) {
      if (!this.activeBrandKit?.id) {
        throw new Error('No active brand kit');
      }

      this.isLoadingMedia = true;

      try {
        const result = await brandKitService.updateMedia(
          this.activeBrandKit.id,
          mediaEntryId,
          data
        );

        // Update active brand kit media
        this.activeBrandKit.media = result.media;

        return result;
      } catch (err) {
        this.error = err.message;
        console.error('[BrandKitStore] Failed to update media:', err);
        throw err;
      } finally {
        this.isLoadingMedia = false;
      }
    },

    /**
     * Remove media from brand kit
     */
    async removeMedia(mediaEntryId) {
      if (!this.activeBrandKit?.id) {
        throw new Error('No active brand kit');
      }

      this.isLoadingMedia = true;

      try {
        const result = await brandKitService.removeMedia(this.activeBrandKit.id, mediaEntryId);

        // Update active brand kit media
        this.activeBrandKit.media = result.media;

        return result;
      } catch (err) {
        this.error = err.message;
        console.error('[BrandKitStore] Failed to remove media:', err);
        throw err;
      } finally {
        this.isLoadingMedia = false;
      }
    },

    /**
     * Reorder media
     */
    async reorderMedia(order) {
      if (!this.activeBrandKit?.id) {
        throw new Error('No active brand kit');
      }

      try {
        const result = await brandKitService.reorderMedia(this.activeBrandKit.id, order);

        // Update active brand kit media
        this.activeBrandKit.media = result.media;

        return result;
      } catch (err) {
        this.error = err.message;
        console.error('[BrandKitStore] Failed to reorder media:', err);
        throw err;
      }
    },

    /**
     * Select a brand kit (for profile association)
     */
    selectBrandKit(id) {
      this.selectedBrandKitId = id;
    },

    /**
     * Open editor
     */
    openEditor(brandKitId = null, mode = 'edit') {
      if (brandKitId) {
        this.loadBrandKit(brandKitId);
      } else if (mode === 'create') {
        // Initialize empty brand kit for creation
        this.activeBrandKit = {
          name: '',
          color_primary: '#3b82f6',
          color_secondary: '#2563eb',
          color_accent: '#f59e0b',
          color_background: '#ffffff',
          color_surface: '#f8fafc',
          color_text: '#1e293b',
          color_text_muted: '#64748b',
          color_link: '#3b82f6',
          font_primary: 'Inter',
          font_heading: 'Inter',
          font_accent: '',
          media: [],
        };
      }

      this.editorMode = mode;
      this.editorOpen = true;
      this.editBuffer = this.activeBrandKit ? { ...this.activeBrandKit } : null;
    },

    /**
     * Close editor
     */
    closeEditor(discardChanges = false) {
      if (discardChanges && this.editBuffer) {
        this.activeBrandKit = this.editBuffer;
      }

      this.editorOpen = false;
      this.editorMode = 'view';
      this.editBuffer = null;
      this.hasUnsavedChanges = false;
    },

    /**
     * Mark as having unsaved changes
     */
    markDirty() {
      this.hasUnsavedChanges = true;
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    },

    /**
     * Get CSS variables for active brand kit
     */
    getCSSVariables() {
      if (!this.activeBrandKit) return {};
      return brandKitService.getCSSVariables(this.activeBrandKit);
    },

    /**
     * Apply brand kit to element
     */
    applyToElement(element = document.documentElement) {
      if (!this.activeBrandKit) return;
      brandKitService.applyToElement(this.activeBrandKit, element);
    },
  },
});
