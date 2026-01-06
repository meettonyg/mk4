/**
 * useAuthorityHook - Composable for Authority Hook management
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Manages the "Who/What/When/How" framework for positioning.
 * Shared across all AI generators.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.2.0
 */

import { ref, computed, watch } from 'vue';
import { useAIStore } from '../stores/ai';

/**
 * Authority Hook field definitions (4W Framework)
 * Note: This must be an array (not object) for Vue v-for iteration to work correctly
 * Each field needs an explicit 'key' property to bind to hookFields[field.key]
 *
 * Legacy had 4 fields: who, what, when, how
 */
export const AUTHORITY_HOOK_FIELDS = [
  {
    key: 'who',
    label: 'WHO do you help?',
    placeholder: 'e.g., entrepreneurs, busy professionals, creative teams',
    description: 'Your target audience - be specific about who you serve'
  },
  {
    key: 'what',
    label: 'WHAT do you help them achieve?',
    placeholder: 'e.g., scale their business, find work-life balance, innovate faster',
    description: 'The transformation or outcome you deliver'
  },
  {
    key: 'when',
    label: 'WHEN do they need help?',
    placeholder: 'e.g., when they\'re stuck, during rapid growth, at career transitions',
    description: 'The situation or timing when they seek you out'
  },
  {
    key: 'how',
    label: 'HOW do you help them?',
    placeholder: 'e.g., through my proven framework, via 1:1 coaching, with strategic workshops',
    description: 'Your unique method, process, or approach'
  }
];

/**
 * Authority Hook composable
 *
 * @returns {object} Reactive state and methods for authority hook management
 *
 * @example
 * const { who, what, authorityHookSummary, isValid } = useAuthorityHook();
 * who.value = 'entrepreneurs';
 * what.value = 'scale their business';
 */
export function useAuthorityHook() {
  const aiStore = useAIStore();

  // Create refs that sync with store (4W Framework: who, what, when, how)
  const who = ref(aiStore.authorityHook.who);
  const what = ref(aiStore.authorityHook.what);
  const when = ref(aiStore.authorityHook.when);
  const how = ref(aiStore.authorityHook.how);

  // Watch for changes and sync to store
  watch(who, (val) => aiStore.updateAuthorityHook('who', val));
  watch(what, (val) => aiStore.updateAuthorityHook('what', val));
  watch(when, (val) => aiStore.updateAuthorityHook('when', val));
  watch(how, (val) => aiStore.updateAuthorityHook('how', val));

  // Computed: Get complete authority hook object (4W Framework)
  const authorityHook = computed(() => ({
    who: who.value,
    what: what.value,
    when: when.value,
    how: how.value
  }));

  // Computed: Formatted summary sentence (4W Framework)
  const authorityHookSummary = computed(() => {
    const parts = [];

    if (who.value) parts.push(`I help ${who.value}`);
    if (what.value) parts.push(what.value);
    if (when.value) parts.push(`when ${when.value}`);
    if (how.value) parts.push(`by ${how.value}`);

    return parts.length > 0 ? parts.join(' ') + '.' : '';
  });

  // Computed: Check if minimum fields are filled
  const isValid = computed(() => {
    return !!(who.value || what.value);
  });

  // Computed: Check if fully complete (4W Framework)
  const isComplete = computed(() => {
    return !!(who.value && what.value && when.value && how.value);
  });

  // Computed: Completion percentage (4 fields)
  const completionPercentage = computed(() => {
    const fields = [who.value, what.value, when.value, how.value];
    const filled = fields.filter(f => f && f.trim().length > 0).length;
    return Math.round((filled / 4) * 100);
  });

  // Computed: Get filled fields (4W Framework)
  const filledFields = computed(() => {
    const fields = [];
    if (who.value) fields.push('who');
    if (what.value) fields.push('what');
    if (when.value) fields.push('when');
    if (how.value) fields.push('how');
    return fields;
  });

  // Computed: Get empty fields (4W Framework)
  const emptyFields = computed(() => {
    const all = ['who', 'what', 'when', 'how'];
    return all.filter(f => !authorityHook.value[f]);
  });

  /**
   * Set a specific field (4W Framework)
   * @param {string} field Field name
   * @param {string} value Field value
   */
  const setField = (field, value) => {
    const fieldMap = { who, what, when, how };
    if (fieldMap[field]) {
      fieldMap[field].value = value;
    }
  };

  /**
   * Set all fields at once (4W Framework)
   * @param {object} hook Authority hook object
   */
  const setAll = (hook) => {
    if (hook.who !== undefined) who.value = hook.who;
    if (hook.what !== undefined) what.value = hook.what;
    if (hook.when !== undefined) when.value = hook.when;
    if (hook.how !== undefined) how.value = hook.how;
  };

  /**
   * Reset all fields (4W Framework)
   */
  const reset = () => {
    who.value = '';
    what.value = '';
    when.value = '';
    how.value = '';
    aiStore.resetAuthorityHook();
  };

  /**
   * Load from profile data (4W Framework)
   * @param {object} profileData Profile data object (field names are legacy from Pods migration)
   */
  const loadFromProfileData = (profileData) => {
    if (!profileData) return;

    // Load from various possible field names
    // Use property existence checks to allow empty strings to clear fields
    if ('hook_who' in profileData || 'guest_title' in profileData) {
      who.value = profileData.hook_who ?? profileData.guest_title ?? '';
    }
    if ('hook_what' in profileData) {
      what.value = profileData.hook_what ?? '';
    }
    if ('hook_when' in profileData) {
      when.value = profileData.hook_when ?? '';
    }
    if ('hook_how' in profileData) {
      how.value = profileData.hook_how ?? '';
    }
  };

  /**
   * Copy summary to clipboard
   * @returns {Promise<boolean>} Success status
   */
  const copySummaryToClipboard = async () => {
    if (!authorityHookSummary.value) return false;

    try {
      await navigator.clipboard.writeText(authorityHookSummary.value);
      return true;
    } catch (err) {
      console.error('[useAuthorityHook] Failed to copy:', err);
      return false;
    }
  };

  /**
   * Sync from store (useful after store is updated externally)
   */
  const syncFromStore = () => {
    who.value = aiStore.authorityHook.who;
    what.value = aiStore.authorityHook.what;
    when.value = aiStore.authorityHook.when;
    how.value = aiStore.authorityHook.how;
  };

  return {
    // Individual fields (4W Framework)
    who,
    what,
    when,
    how,

    // Computed
    authorityHook,
    authorityHookSummary,
    isValid,
    isComplete,
    completionPercentage,
    filledFields,
    emptyFields,

    // Methods
    setField,
    updateField: setField, // Alias for backwards compatibility with Vue components
    setAll,
    reset,
    loadFromProfileData,
    copySummaryToClipboard,
    syncFromStore,

    // Field definitions for UI
    AUTHORITY_HOOK_FIELDS
  };
}

export default useAuthorityHook;
