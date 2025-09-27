// src/stores/versions.js
import { defineStore } from 'pinia';
import { useMediaKitStore } from './mediaKit';

export const useVersionStore = defineStore('versions', {
  state: () => ({
    versions: [], // Max 20 versions
    currentVersion: null,
    autoSaveInterval: 300000, // 5 minutes
    lastAutoSave: null,
    autoSaveTimer: null,
    isLoadingVersion: false,
    isSavingVersion: false,
    versionComparison: null
  }),

  getters: {
    /**
     * Get sorted versions (newest first)
     */
    sortedVersions: (state) => {
      return [...state.versions].sort((a, b) => b.timestamp - a.timestamp);
    },

    /**
     * Check if auto-save is due
     */
    isAutoSaveDue: (state) => {
      if (!state.lastAutoSave) return true;
      return Date.now() - state.lastAutoSave > state.autoSaveInterval;
    },

    /**
     * Get version by ID
     */
    getVersionById: (state) => (versionId) => {
      return state.versions.find(v => v.id === versionId);
    }
  },

  actions: {
    /**
     * Initialize version system
     */
    async initialize() {
      // Load versions from WordPress
      await this.loadVersionsFromServer();
      
      // Start auto-save timer
      this.startAutoSave();
    },

    /**
     * Save a new version
     */
    async saveVersion(name = 'Auto-save', type = 'manual') {
      if (this.isSavingVersion) return;
      
      this.isSavingVersion = true;

      try {
        const mediaKitStore = useMediaKitStore();
        
        const snapshot = {
          id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          type, // manual, auto, before_major_change
          timestamp: Date.now(),
          created: new Date().toISOString(),
          state: this.createSnapshot(mediaKitStore),
          size: 0, // Will be calculated
          author: window.gmkbData?.currentUser?.display_name || 'Unknown'
        };

        // Calculate size
        snapshot.size = JSON.stringify(snapshot.state).length;

        // Save to WordPress if connected
        if (window.gmkbData?.postId) {
          await this.syncToWordPress(snapshot);
        }

        // Add to local versions
        this.versions.unshift(snapshot);
        
        // Maintain max version limit
        if (this.versions.length > 20) {
          const removed = this.versions.pop();
          // Delete from server if needed
          if (window.gmkbData?.postId) {
            await this.deleteVersionFromServer(removed.id);
          }
        }

        // Update last auto-save time
        if (type === 'auto') {
          this.lastAutoSave = Date.now();
        }

        return snapshot;

      } catch (error) {
        console.error('Failed to save version:', error);
        throw error;
      } finally {
        this.isSavingVersion = false;
      }
    },

    /**
     * Create a snapshot of current state
     */
    createSnapshot(mediaKitStore) {
      return {
        components: JSON.parse(JSON.stringify(mediaKitStore.components)),
        sections: JSON.parse(JSON.stringify(mediaKitStore.sections)),
        theme: mediaKitStore.theme,
        themeCustomizations: JSON.parse(JSON.stringify(mediaKitStore.themeCustomizations)),
        globalSettings: JSON.parse(JSON.stringify(mediaKitStore.globalSettings))
      };
    },

    /**
     * Restore a version
     */
    async restoreVersion(versionId) {
      if (this.isLoadingVersion) return;
      
      const version = this.getVersionById(versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      this.isLoadingVersion = true;

      try {
        const mediaKitStore = useMediaKitStore();
        
        // Save current state before restore
        await this.saveVersion('Before restore', 'auto');

        // Restore the state
        await mediaKitStore.replaceState(version.state);

        // Update current version
        this.currentVersion = versionId;

        // Notify user
        if (window.gmkbData?.showNotifications) {
          mediaKitStore.showNotification(`Restored version: ${version.name}`, 'success');
        }

        return true;

      } catch (error) {
        console.error('Failed to restore version:', error);
        throw error;
      } finally {
        this.isLoadingVersion = false;
      }
    },

    /**
     * Compare two versions
     */
    compareVersions(versionId1, versionId2) {
      const v1 = this.getVersionById(versionId1);
      const v2 = this.getVersionById(versionId2);

      if (!v1 || !v2) {
        throw new Error('One or both versions not found');
      }

      // Create diff object
      const diff = {
        id: `diff_${versionId1}_${versionId2}`,
        version1: {
          id: v1.id,
          name: v1.name,
          timestamp: v1.timestamp
        },
        version2: {
          id: v2.id,
          name: v2.name,
          timestamp: v2.timestamp
        },
        changes: this.calculateDiff(v1.state, v2.state)
      };

      this.versionComparison = diff;
      return diff;
    },

    /**
     * Calculate diff between two states
     */
    calculateDiff(state1, state2) {
      const changes = {
        components: {
          added: [],
          removed: [],
          modified: []
        },
        sections: {
          added: [],
          removed: [],
          modified: []
        },
        theme: null,
        themeCustomizations: []
      };

      // Compare components
      const components1 = Object.keys(state1.components);
      const components2 = Object.keys(state2.components);

      // Added components
      changes.components.added = components2.filter(id => !components1.includes(id));
      
      // Removed components
      changes.components.removed = components1.filter(id => !components2.includes(id));
      
      // Modified components
      components1.forEach(id => {
        if (components2.includes(id)) {
          if (JSON.stringify(state1.components[id]) !== JSON.stringify(state2.components[id])) {
            changes.components.modified.push(id);
          }
        }
      });

      // Compare sections
      const sections1Ids = state1.sections.map(s => s.id || s.section_id);
      const sections2Ids = state2.sections.map(s => s.id || s.section_id);

      changes.sections.added = sections2Ids.filter(id => !sections1Ids.includes(id));
      changes.sections.removed = sections1Ids.filter(id => !sections2Ids.includes(id));

      // Compare theme
      if (state1.theme !== state2.theme) {
        changes.theme = {
          old: state1.theme,
          new: state2.theme
        };
      }

      // Compare theme customizations
      const customKeys1 = Object.keys(state1.themeCustomizations || {});
      const customKeys2 = Object.keys(state2.themeCustomizations || {});
      const allKeys = [...new Set([...customKeys1, ...customKeys2])];

      allKeys.forEach(key => {
        const val1 = state1.themeCustomizations?.[key];
        const val2 = state2.themeCustomizations?.[key];
        
        if (val1 !== val2) {
          changes.themeCustomizations.push({
            key,
            old: val1,
            new: val2
          });
        }
      });

      return changes;
    },

    /**
     * Delete a version
     */
    async deleteVersion(versionId) {
      const index = this.versions.findIndex(v => v.id === versionId);
      if (index === -1) return;

      const version = this.versions[index];
      
      // Delete from server if connected
      if (window.gmkbData?.postId) {
        await this.deleteVersionFromServer(versionId);
      }

      // Remove from local store
      this.versions.splice(index, 1);

      // Clear current version if it was deleted
      if (this.currentVersion === versionId) {
        this.currentVersion = null;
      }

      return true;
    },

    /**
     * Start auto-save timer
     */
    startAutoSave() {
      // Clear existing timer
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
      }

      // Set up new timer
      this.autoSaveTimer = setInterval(async () => {
        if (this.isAutoSaveDue) {
          const mediaKitStore = useMediaKitStore();
          
          // Only auto-save if there are changes
          if (mediaKitStore.hasUnsavedChanges) {
            try {
              await this.saveVersion('Auto-save', 'auto');
            } catch (error) {
              console.error('Auto-save failed:', error);
            }
          }
        }
      }, 60000); // Check every minute
    },

    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }
    },

    /**
     * Save version to WordPress
     */
    async syncToWordPress(snapshot) {
      if (!window.gmkbData?.postId) return;

      const response = await fetch(`${window.gmkbData.ajaxUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'gmkb_save_version',
          nonce: window.gmkbData.nonce,
          post_id: window.gmkbData.postId,
          version: JSON.stringify(snapshot)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save version to server');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.data || 'Server error');
      }

      return result.data;
    },

    /**
     * Load versions from WordPress
     */
    async loadVersionsFromServer() {
      if (!window.gmkbData?.postId) return;

      try {
        const response = await fetch(`${window.gmkbData.ajaxUrl}?` + new URLSearchParams({
          action: 'gmkb_load_versions',
          nonce: window.gmkbData.nonce,
          post_id: window.gmkbData.postId
        }));

        if (!response.ok) {
          throw new Error('Failed to load versions from server');
        }

        const result = await response.json();
        if (result.success && result.data) {
          this.versions = result.data;
        }
      } catch (error) {
        console.error('Failed to load versions:', error);
      }
    },

    /**
     * Delete version from server
     */
    async deleteVersionFromServer(versionId) {
      if (!window.gmkbData?.postId) return;

      try {
        const response = await fetch(`${window.gmkbData.ajaxUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            action: 'gmkb_delete_version',
            nonce: window.gmkbData.nonce,
            post_id: window.gmkbData.postId,
            version_id: versionId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to delete version from server');
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.data || 'Server error');
        }

        return true;
      } catch (error) {
        console.error('Failed to delete version from server:', error);
        throw error;
      }
    },

    /**
     * Save version before major changes
     */
    async saveBeforeMajorChange(changeName) {
      await this.saveVersion(`Before ${changeName}`, 'before_major_change');
    },

    /**
     * Clear version comparison
     */
    clearComparison() {
      this.versionComparison = null;
    },

    /**
     * Reset all versions
     */
    resetVersions() {
      this.versions = [];
      this.currentVersion = null;
      this.lastAutoSave = null;
      this.versionComparison = null;
      this.stopAutoSave();
    }
  }
});
