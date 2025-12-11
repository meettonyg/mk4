/**
 * useProfileContext Composable
 *
 * Provides Vue components with access to profile context, selection,
 * and AI save functionality.
 *
 * @since 2.2.0
 *
 * @example
 * // In a Vue component
 * const {
 *   profileId,
 *   profiles,
 *   hasContext,
 *   needsSelection,
 *   saveToProfile,
 *   saveToComponent
 * } = useProfileContext();
 *
 * // Save generated topics
 * await saveToProfile('topics', generatedTopics);
 */

import { ref, computed, onMounted } from 'vue';
import profileContextService from '../services/ProfileContextService.js';
import aiSaveBridge from '../services/AISaveBridge.js';
import { useMediaKitStore } from '../stores/mediaKit.js';

export function useProfileContext() {
  // Get reactive state from service
  const {
    currentProfileId,
    profiles,
    isLoading,
    error,
    context,
    hasContext,
    needsSelection
  } = profileContextService.getReactiveState();

  // Local state for save operations
  const isSaving = ref(false);
  const saveError = ref(null);
  const lastSaveResult = ref(null);

  // Get media kit store (may be null if not in builder context)
  let mediaKitStore = null;
  try {
    mediaKitStore = useMediaKitStore();
  } catch (e) {
    // Not in a context where the store is available
  }

  /**
   * Initialize the profile context service
   */
  const initialize = async () => {
    await profileContextService.initialize();
  };

  /**
   * Fetch available profiles for the current user
   */
  const fetchProfiles = async () => {
    return await profileContextService.fetchUserProfiles();
  };

  /**
   * Set the active profile for saving
   */
  const setProfile = (profileId) => {
    profileContextService.setActiveProfile(profileId);
  };

  /**
   * Save AI-generated content to the current profile
   *
   * @param {string} type - AI tool type (topics, biography, questions, etc.)
   * @param {*} data - Generated content to save
   * @param {Object} options - Additional options
   * @returns {Promise<{success: boolean, saved: Object, errors: Array}>}
   */
  const saveToProfile = async (type, data, options = {}) => {
    const targetProfileId = options.profileId || currentProfileId.value;

    if (!targetProfileId) {
      const err = new Error('No profile selected. Please select a profile first.');
      saveError.value = err.message;
      throw err;
    }

    isSaving.value = true;
    saveError.value = null;

    try {
      const result = await aiSaveBridge.saveToProfile(targetProfileId, type, data);
      lastSaveResult.value = result;

      if (!result.success) {
        saveError.value = result.errors.join(', ');
      }

      return result;

    } catch (err) {
      saveError.value = err.message;
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Save AI-generated content to a component (for Media Kit Builder)
   *
   * @param {string} componentId - Component ID to update
   * @param {string} type - AI tool type
   * @param {*} data - Generated content
   * @returns {{success: boolean, updated: Object}}
   */
  const saveToComponent = (componentId, type, data) => {
    if (!mediaKitStore) {
      throw new Error('Media Kit store not available. Are you in the builder context?');
    }

    return aiSaveBridge.saveToComponent(mediaKitStore, componentId, type, data);
  };

  /**
   * Smart save - automatically determines where to save
   *
   * @param {string} type - AI tool type
   * @param {*} data - Generated content
   * @param {Object} options - Options (componentId for builder context)
   */
  const smartSave = async (type, data, options = {}) => {
    isSaving.value = true;
    saveError.value = null;

    try {
      const result = await aiSaveBridge.smartSave(type, data, {
        store: mediaKitStore,
        componentId: options.componentId,
        profileId: options.profileId || currentProfileId.value
      });

      lastSaveResult.value = result;
      return result;

    } catch (err) {
      saveError.value = err.message;
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Check if we're in Media Kit Builder context
   */
  const isInBuilder = computed(() => context.value === 'media-kit');

  /**
   * Check if we're in Profile Editor context
   */
  const isInProfileEditor = computed(() => context.value === 'profile-editor');

  /**
   * Check if we're in standalone context (AI tools page)
   */
  const isStandalone = computed(() => context.value === 'standalone');

  /**
   * Get the current profile data
   */
  const currentProfile = computed(() => {
    if (!currentProfileId.value) return null;
    return profiles.value.find(p => p.id === currentProfileId.value);
  });

  // Initialize on mount if in a component context
  onMounted(() => {
    initialize();
  });

  return {
    // State
    profileId: currentProfileId,
    profiles,
    currentProfile,
    isLoading,
    error,
    context,

    // Computed flags
    hasContext,
    needsSelection,
    isInBuilder,
    isInProfileEditor,
    isStandalone,

    // Save state
    isSaving,
    saveError,
    lastSaveResult,

    // Methods
    initialize,
    fetchProfiles,
    setProfile,
    saveToProfile,
    saveToComponent,
    smartSave,

    // Services (for advanced use)
    profileContextService,
    aiSaveBridge
  };
}

export default useProfileContext;
