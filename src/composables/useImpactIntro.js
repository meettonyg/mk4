/**
 * useImpactIntro - Composable for Impact Intro (credentials/achievements) management
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Manages credentials and achievements for guest introductions.
 * Shared across AI generators that need credential context.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.2.0
 */

import { ref, computed, watch } from 'vue';
import { useAIStore } from '../stores/ai';

/**
 * Common credential types for suggestions
 */
export const CREDENTIAL_TYPES = [
  { value: 'degree', label: 'Degree/Education', examples: ['PhD', 'MBA', 'Masters in Psychology'] },
  { value: 'certification', label: 'Certification', examples: ['PMP', 'CPA', 'ICF Certified Coach'] },
  { value: 'title', label: 'Professional Title', examples: ['CEO', 'Founder', 'Director'] },
  { value: 'publication', label: 'Publication', examples: ['Author of...', 'Featured in Forbes', 'TEDx Speaker'] },
  { value: 'award', label: 'Award/Recognition', examples: ['Award-winning', 'Top 40 Under 40', 'Inc 500'] },
  { value: 'experience', label: 'Experience', examples: ['20+ years', 'Former VP at Google', 'Worked with Fortune 500'] }
];

/**
 * Example credentials for the "Examples" section in the Credential Manager
 * These are clickable chips that users can add to their credentials
 */
export const CREDENTIAL_EXAMPLES = [
  { text: 'helped 200+ startups land funding', category: 'results' },
  { text: 'my strategies have helped over 500 coaches generate six-figure businesses', category: 'results' },
  { text: 'my latest book became an Amazon bestseller', category: 'achievement' },
  { text: 'our organization has provided clean water to 200,000+ people', category: 'impact' },
  { text: 'trained 10,000+ professionals worldwide', category: 'results' },
  { text: 'built and sold 3 successful companies', category: 'achievement' }
];

/**
 * Impact Intro composable
 *
 * @returns {object} Reactive state and methods for credentials/achievements management
 *
 * @example
 * const { credentials, achievements, addCredential } = useImpactIntro();
 * addCredential('PhD in Psychology');
 */
export function useImpactIntro() {
  const aiStore = useAIStore();

  // Create refs that sync with store
  const credentials = ref([...aiStore.impactIntro.credentials]);
  const achievements = ref([...aiStore.impactIntro.achievements]);

  // Selection state for credentials (which ones are checked for WHERE field)
  // Uses a Set of credential text values for efficient lookup
  const selectedCredentialSet = ref(new Set(aiStore.impactIntro.credentials));

  // New credential/achievement input state
  const newCredential = ref('');
  const newAchievement = ref('');

  // Watch for changes and sync to store
  watch(credentials, (val) => {
    aiStore.setCredentials(val);
  }, { deep: true });

  watch(achievements, (val) => {
    aiStore.setAchievements(val);
  }, { deep: true });

  // Computed: Credentials as formatted string
  const credentialsSummary = computed(() => {
    return credentials.value.join(', ');
  });

  // Computed: Achievements as formatted string
  const achievementsSummary = computed(() => {
    return achievements.value.join(', ');
  });

  // Computed: Selected credentials count
  const selectedCredentialsCount = computed(() => {
    return selectedCredentialSet.value.size;
  });

  // Computed: Check if a credential is selected
  const isCredentialSelected = (credential) => {
    return selectedCredentialSet.value.has(credential);
  };

  // Computed: Get selected credentials as array
  const selectedCredentials = computed(() => {
    return credentials.value.filter(c => selectedCredentialSet.value.has(c));
  });

  // Computed: Format selected credentials for WHERE field
  // Uses Intl.ListFormat for robust, localized list formatting
  const selectedCredentialsText = computed(() => {
    const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
    return formatter.format(selectedCredentials.value);
  });

  // Computed: Combined summary for guest intro
  const impactSummary = computed(() => {
    const parts = [];
    if (credentials.value.length > 0) {
      parts.push(credentials.value.slice(0, 3).join(', ')); // Top 3 credentials
    }
    if (achievements.value.length > 0) {
      parts.push(achievements.value.slice(0, 2).join(', ')); // Top 2 achievements
    }
    return parts.join(' | ');
  });

  // Computed: Has minimum data for intro
  const hasMinimumData = computed(() => {
    return credentials.value.length > 0 || achievements.value.length > 0;
  });

  // Computed: Total items count
  const totalItems = computed(() => {
    return credentials.value.length + achievements.value.length;
  });

  /**
   * Add a credential
   * @param {string} credential Credential to add
   * @param {boolean} autoSelect Whether to auto-select the credential (default: true)
   * @returns {boolean} Success status
   */
  const addCredential = (credential, autoSelect = true) => {
    const value = credential || newCredential.value;
    if (value && value.trim() && !credentials.value.includes(value.trim())) {
      const trimmedValue = value.trim();
      credentials.value.push(trimmedValue);
      // Auto-select new credentials by default (use Set reassignment for reactivity)
      if (autoSelect) {
        const newSet = new Set(selectedCredentialSet.value);
        newSet.add(trimmedValue);
        selectedCredentialSet.value = newSet;
      }
      newCredential.value = '';
      return true;
    }
    return false;
  };

  /**
   * Toggle credential selection (for checkbox behavior)
   * Uses Set reassignment to trigger Vue reactivity
   * @param {string} credential Credential to toggle
   * @returns {boolean} New selection state
   */
  const toggleCredentialSelection = (credential) => {
    const newSet = new Set(selectedCredentialSet.value);
    const isSelected = newSet.has(credential);

    if (isSelected) {
      newSet.delete(credential);
    } else {
      newSet.add(credential);
    }
    selectedCredentialSet.value = newSet;
    return !isSelected;
  };

  /**
   * Select a credential
   * @param {string} credential Credential to select
   */
  const selectCredential = (credential) => {
    const newSet = new Set(selectedCredentialSet.value);
    newSet.add(credential);
    selectedCredentialSet.value = newSet;
  };

  /**
   * Deselect a credential
   * @param {string} credential Credential to deselect
   */
  const deselectCredential = (credential) => {
    const newSet = new Set(selectedCredentialSet.value);
    newSet.delete(credential);
    selectedCredentialSet.value = newSet;
  };

  /**
   * Select all credentials
   */
  const selectAllCredentials = () => {
    selectedCredentialSet.value = new Set(credentials.value);
  };

  /**
   * Deselect all credentials
   */
  const deselectAllCredentials = () => {
    selectedCredentialSet.value = new Set();
  };

  /**
   * Remove a credential by index
   * @param {number} index Index to remove
   */
  const removeCredential = (index) => {
    if (index >= 0 && index < credentials.value.length) {
      const removed = credentials.value[index];
      credentials.value.splice(index, 1);
      // Also remove from selection set (use reassignment for reactivity)
      const newSet = new Set(selectedCredentialSet.value);
      newSet.delete(removed);
      selectedCredentialSet.value = newSet;
    }
  };

  /**
   * Remove a credential by value
   * @param {string} credential Credential to remove
   */
  const removeCredentialByValue = (credential) => {
    const index = credentials.value.indexOf(credential);
    if (index > -1) {
      credentials.value.splice(index, 1);
      // Also remove from selection set (use reassignment for reactivity)
      const newSet = new Set(selectedCredentialSet.value);
      newSet.delete(credential);
      selectedCredentialSet.value = newSet;
    }
  };

  /**
   * Update credential at index
   * @param {number} index Index to update
   * @param {string} value New value
   */
  const updateCredential = (index, value) => {
    if (index >= 0 && index < credentials.value.length) {
      credentials.value[index] = value;
    }
  };

  /**
   * Reorder credentials
   * @param {number} fromIndex Source index
   * @param {number} toIndex Target index
   */
  const reorderCredentials = (fromIndex, toIndex) => {
    const [item] = credentials.value.splice(fromIndex, 1);
    credentials.value.splice(toIndex, 0, item);
  };

  /**
   * Add an achievement
   * @param {string} achievement Achievement to add
   * @returns {boolean} Success status
   */
  const addAchievement = (achievement) => {
    const value = achievement || newAchievement.value;
    if (value && value.trim() && !achievements.value.includes(value.trim())) {
      achievements.value.push(value.trim());
      newAchievement.value = '';
      return true;
    }
    return false;
  };

  /**
   * Remove an achievement by index
   * @param {number} index Index to remove
   */
  const removeAchievement = (index) => {
    if (index >= 0 && index < achievements.value.length) {
      achievements.value.splice(index, 1);
    }
  };

  /**
   * Remove an achievement by value
   * @param {string} achievement Achievement to remove
   */
  const removeAchievementByValue = (achievement) => {
    const index = achievements.value.indexOf(achievement);
    if (index > -1) {
      achievements.value.splice(index, 1);
    }
  };

  /**
   * Update achievement at index
   * @param {number} index Index to update
   * @param {string} value New value
   */
  const updateAchievement = (index, value) => {
    if (index >= 0 && index < achievements.value.length) {
      achievements.value[index] = value;
    }
  };

  /**
   * Reorder achievements
   * @param {number} fromIndex Source index
   * @param {number} toIndex Target index
   */
  const reorderAchievements = (fromIndex, toIndex) => {
    const [item] = achievements.value.splice(fromIndex, 1);
    achievements.value.splice(toIndex, 0, item);
  };

  /**
   * Set all credentials
   * @param {array} newCredentials Credentials array
   */
  const setCredentials = (newCredentials) => {
    credentials.value = [...newCredentials];
  };

  /**
   * Set all achievements
   * @param {array} newAchievements Achievements array
   */
  const setAchievements = (newAchievements) => {
    achievements.value = [...newAchievements];
  };

  /**
   * Reset all data
   */
  const reset = () => {
    credentials.value = [];
    achievements.value = [];
    selectedCredentialSet.value = new Set();
    newCredential.value = '';
    newAchievement.value = '';
  };

  /**
   * Load from profile data
   * @param {object} profileData Profile data object (field names are legacy from Pods migration)
   */
  const loadFromProfileData = (profileData) => {
    if (!profileData) return;

    // Helper function to extract values from various profile data fields
    // Priority: plural array > hook field (6W's) > numbered fields (field_1, field_2, etc.)
    // Returns null if no relevant fields found, empty array if fields exist but are empty
    const extractValues = (pluralKey, hookKey, singularPrefix) => {
      if (Object.prototype.hasOwnProperty.call(profileData, pluralKey)) {
        const values = profileData[pluralKey];
        return Array.isArray(values)
          ? values.map(v => String(v || '').trim()).filter(Boolean)
          : String(values || '').split(',').map(v => v.trim()).filter(Boolean);
      }

      if (Object.prototype.hasOwnProperty.call(profileData, hookKey)) {
        const value = String(profileData[hookKey] || '').trim();
        return value ? [value] : [];
      }

      const numberedValues = [];
      let hasAnyNumberedField = false;
      for (let i = 1; i <= 5; i++) {
        const fieldName = `${singularPrefix}_${i}`;
        if (Object.prototype.hasOwnProperty.call(profileData, fieldName)) {
          hasAnyNumberedField = true;
          const value = profileData[fieldName];
          if (value && String(value).trim()) {
            numberedValues.push(String(value).trim());
          }
        }
      }
      if (hasAnyNumberedField) {
        return numberedValues;
      }

      return null; // No relevant fields found
    };

    // Load credentials from profile
    const creds = extractValues('credentials', 'hook_where', 'credential');
    if (creds !== null) {
      credentials.value = creds;
      // Select all loaded credentials by default
      selectedCredentialSet.value = new Set(creds);
    }

    // Load achievements/mission from profile
    const achvs = extractValues('achievements', 'hook_why', 'achievement');
    if (achvs !== null) {
      achievements.value = achvs;
    }
  };

  /**
   * Copy summary to clipboard
   * @returns {Promise<boolean>} Success status
   */
  const copySummaryToClipboard = async () => {
    if (!impactSummary.value) return false;

    try {
      await navigator.clipboard.writeText(impactSummary.value);
      return true;
    } catch (err) {
      console.error('[useImpactIntro] Failed to copy:', err);
      return false;
    }
  };

  /**
   * Sync from store (useful after store is updated externally)
   */
  const syncFromStore = () => {
    credentials.value = [...aiStore.impactIntro.credentials];
    achievements.value = [...aiStore.impactIntro.achievements];
  };

  return {
    // State
    credentials,
    achievements,
    newCredential,
    newAchievement,

    // Computed
    credentialsSummary,
    achievementsSummary,
    impactSummary,
    hasMinimumData,
    totalItems,

    // Selection state
    selectedCredentials,
    selectedCredentialsCount,
    selectedCredentialsText,
    isCredentialSelected,

    // Credential methods
    addCredential,
    removeCredential,
    removeCredentialByValue,
    updateCredential,
    reorderCredentials,
    setCredentials,

    // Credential selection methods
    toggleCredentialSelection,
    selectCredential,
    deselectCredential,
    selectAllCredentials,
    deselectAllCredentials,

    // Achievement methods
    addAchievement,
    removeAchievement,
    removeAchievementByValue,
    updateAchievement,
    reorderAchievements,
    setAchievements,

    // General methods
    reset,
    loadFromProfileData,
    copySummaryToClipboard,
    syncFromStore,

    // Constants for UI
    CREDENTIAL_TYPES
  };
}

export default useImpactIntro;
