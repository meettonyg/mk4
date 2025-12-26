/**
 * useAuthorityHook - Composable for Authority Hook management
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Manages the "Who/What/When/How/Where/Why" framework for positioning.
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
 * Authority Hook field definitions
 * Note: This must be an array (not object) for Vue v-for iteration to work correctly
 * Each field needs an explicit 'key' property to bind to hookFields[field.key]
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
  },
  {
    key: 'where',
    label: 'WHERE does this apply?',
    placeholder: 'e.g., in their business, in their personal life, in their industry',
    description: 'The context or area where your help is applied'
  },
  {
    key: 'why',
    label: 'WHY does this matter?',
    placeholder: 'e.g., because everyone deserves success, because time is precious',
    description: 'The deeper purpose or meaning behind your work'
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

  // Create refs that sync with store
  const who = ref(aiStore.authorityHook.who);
  const what = ref(aiStore.authorityHook.what);
  const when = ref(aiStore.authorityHook.when);
  const how = ref(aiStore.authorityHook.how);
  const where = ref(aiStore.authorityHook.where);
  const why = ref(aiStore.authorityHook.why);

  // Watch for changes and sync to store
  watch(who, (val) => aiStore.updateAuthorityHook('who', val));
  watch(what, (val) => aiStore.updateAuthorityHook('what', val));
  watch(when, (val) => aiStore.updateAuthorityHook('when', val));
  watch(how, (val) => aiStore.updateAuthorityHook('how', val));
  watch(where, (val) => aiStore.updateAuthorityHook('where', val));
  watch(why, (val) => aiStore.updateAuthorityHook('why', val));

  // Computed: Get complete authority hook object
  const authorityHook = computed(() => ({
    who: who.value,
    what: what.value,
    when: when.value,
    how: how.value,
    where: where.value,
    why: why.value
  }));

  // Computed: Formatted summary sentence
  const authorityHookSummary = computed(() => {
    const parts = [];

    if (who.value) parts.push(`I help ${who.value}`);
    if (what.value) parts.push(what.value);
    if (when.value) parts.push(`when ${when.value}`);
    if (how.value) parts.push(`by ${how.value}`);
    if (where.value) parts.push(`in ${where.value}`);
    if (why.value) parts.push(`because ${why.value}`);

    return parts.length > 0 ? parts.join(' ') + '.' : '';
  });

  // Computed: Check if minimum fields are filled
  const isValid = computed(() => {
    return !!(who.value || what.value);
  });

  // Computed: Check if fully complete
  const isComplete = computed(() => {
    return !!(who.value && what.value && when.value && how.value && where.value && why.value);
  });

  // Computed: Completion percentage
  const completionPercentage = computed(() => {
    const fields = [who.value, what.value, when.value, how.value, where.value, why.value];
    const filled = fields.filter(f => f && f.trim().length > 0).length;
    return Math.round((filled / 6) * 100);
  });

  // Computed: Get filled fields
  const filledFields = computed(() => {
    const fields = [];
    if (who.value) fields.push('who');
    if (what.value) fields.push('what');
    if (when.value) fields.push('when');
    if (how.value) fields.push('how');
    if (where.value) fields.push('where');
    if (why.value) fields.push('why');
    return fields;
  });

  // Computed: Get empty fields
  const emptyFields = computed(() => {
    const all = ['who', 'what', 'when', 'how', 'where', 'why'];
    return all.filter(f => !authorityHook.value[f]);
  });

  /**
   * Set a specific field
   * @param {string} field Field name
   * @param {string} value Field value
   */
  const setField = (field, value) => {
    const fieldMap = { who, what, when, how, where, why };
    if (fieldMap[field]) {
      fieldMap[field].value = value;
    }
  };

  /**
   * Set all fields at once
   * @param {object} hook Authority hook object
   */
  const setAll = (hook) => {
    if (hook.who !== undefined) who.value = hook.who;
    if (hook.what !== undefined) what.value = hook.what;
    if (hook.when !== undefined) when.value = hook.when;
    if (hook.how !== undefined) how.value = hook.how;
    if (hook.where !== undefined) where.value = hook.where;
    if (hook.why !== undefined) why.value = hook.why;
  };

  /**
   * Reset all fields
   */
  const reset = () => {
    who.value = '';
    what.value = '';
    when.value = '';
    how.value = '';
    where.value = '';
    why.value = '';
    aiStore.resetAuthorityHook();
  };

  /**
   * Load from pods data
   * @param {object} podsData Pods data object
   */
  const loadFromPodsData = (podsData) => {
    if (!podsData) return;

    // Load from various possible field names
    if (podsData.hook_who || podsData.guest_title) {
      who.value = podsData.hook_who || podsData.guest_title || '';
    }
    if (podsData.hook_what) what.value = podsData.hook_what;
    if (podsData.hook_when) when.value = podsData.hook_when;
    if (podsData.hook_how) how.value = podsData.hook_how;
    if (podsData.hook_where) where.value = podsData.hook_where;
    if (podsData.hook_why) why.value = podsData.hook_why;
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
    where.value = aiStore.authorityHook.where;
    why.value = aiStore.authorityHook.why;
  };

  return {
    // Individual fields
    who,
    what,
    when,
    how,
    where,
    why,

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
    loadFromPodsData,
    copySummaryToClipboard,
    syncFromStore,

    // Field definitions for UI
    AUTHORITY_HOOK_FIELDS
  };
}

export default useAuthorityHook;
