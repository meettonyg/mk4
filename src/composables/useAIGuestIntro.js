/**
 * useAIGuestIntro - Composable for AI guest introduction generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Supports multi-length slot-based generation with economical token usage:
 * - Short (30-45s): 5 variations
 * - Medium (60-90s): 3 variations
 * - Long (2-3 min): 2 variations
 *
 * @package GMKB
 * @subpackage Composables
 * @version 3.0.0
 * @since 2.2.0
 */

import { ref, computed, reactive, watch } from 'vue';
import { useAIStore } from '../stores/ai';

/**
 * Get REST URL from available sources
 */
function getRestUrl() {
  const url = window.gmkbData?.restUrl
    || window.gmkbProfileData?.apiUrl
    || window.gmkbStandaloneTools?.apiBase
    || window.gmkbPublicData?.restUrl
    || '/wp-json/gmkb/v2/';
  return url.endsWith('/') ? url : url + '/';
}

/**
 * Get nonce from available sources
 */
function getNonce(context) {
  if (context === 'builder') {
    return window.gmkbData?.restNonce
      || window.gmkbData?.nonce
      || window.gmkbProfileData?.nonce
      || window.gmkbStandaloneTools?.restNonce
      || '';
  }
  return window.gmkbPublicNonce
    || window.gmkbPublicData?.publicNonce
    || window.gmkbStandaloneTools?.nonce
    || '';
}

/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
  return !!(
    window.gmkbData?.postId
    || window.gmkbData?.post_id
    || window.gmkbProfileData?.postId
    || window.gmkbStandaloneTools?.isLoggedIn
  );
}

/**
 * Length slot configuration
 */
export const LENGTH_SLOTS = {
  short: {
    id: 'short',
    label: 'Short (30-45s)',
    description: 'Punchy intro for fast-paced shows',
    wordRange: '50-80',
    variationCount: 5
  },
  medium: {
    id: 'medium',
    label: 'Medium (60-90s)',
    description: 'Balanced intro with credibility',
    wordRange: '100-150',
    variationCount: 3
  },
  long: {
    id: 'long',
    label: 'Long (2-3 min)',
    description: 'Comprehensive keynote intro',
    wordRange: '200-350',
    variationCount: 2
  }
};

/**
 * Tone options
 */
export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional & Polished' },
  { value: 'conversational', label: 'Conversational & High-Energy' },
  { value: 'warm', label: 'Warm & Story-driven' },
  { value: 'authoritative', label: 'Authoritative & Results-focused' }
];

/**
 * Hook style options
 */
export const HOOK_STYLE_OPTIONS = [
  { value: 'question', label: 'Provocative Question' },
  { value: 'statistic', label: 'Shocking Statistic' },
  { value: 'problem', label: 'The Problem/Solution Gap' },
  { value: 'authority', label: 'Direct Authority Intro' }
];

/**
 * Guest intro generation composable with slot-based architecture
 *
 * @returns {object} Reactive state and methods for guest intro generation
 *
 * @example
 * const { generateForSlot, slots, activeSlot, lockSlot } = useAIGuestIntro();
 * await generateForSlot('short', { guestName: 'John Smith', ... });
 */
export function useAIGuestIntro() {
  const aiStore = useAIStore();

  // ========================================
  // Generation State (replaces useAIGenerator)
  // ========================================
  const isGenerating = ref(false);
  const error = ref(null);
  const usageRemaining = ref(null);
  const resetTime = ref(null);

  // ========================================
  // Form State
  // ========================================

  // Guest & Episode Info
  const guestName = ref('');
  const guestTitle = ref('');
  const episodeTitle = ref('');
  const topic = ref('');

  // Settings
  const tone = ref('professional');
  const hookStyle = ref('question');
  const notes = ref('');

  // ========================================
  // Slot-based State
  // ========================================

  // Active slot selection
  const activeSlot = ref('short');

  /**
   * Create initial slot state from LENGTH_SLOTS config
   * This ensures slots stay in sync with the configuration
   */
  const createInitialSlotState = () => {
    return Object.keys(LENGTH_SLOTS).reduce((acc, key) => {
      acc[key] = {
        status: 'empty', // 'empty', 'generating', 'ready', 'locked'
        variations: [],
        lockedIntro: null,
        preview: `Click to generate ${LENGTH_SLOTS[key].variationCount} variations`
      };
      return acc;
    }, {});
  };

  // Slot state: variations, locked intro, and status per slot
  const slots = reactive(createInitialSlotState());

  // Refinement state
  const refinementText = ref('');
  const isRefining = ref(false);

  // ========================================
  // Computed Properties
  // ========================================

  // Currently active slot data
  const currentSlot = computed(() => slots[activeSlot.value]);

  // Check if current slot has variations
  const hasVariations = computed(() => {
    return currentSlot.value.variations.length > 0;
  });

  // Check if any slot has a locked intro
  const hasAnyLocked = computed(() => {
    return Object.values(slots).some(slot => slot.lockedIntro);
  });

  // Get all locked intros
  const lockedIntros = computed(() => {
    const locked = {};
    Object.entries(slots).forEach(([key, slot]) => {
      if (slot.lockedIntro) {
        locked[key] = slot.lockedIntro;
      }
    });
    return locked;
  });

  // Check if form has minimum data for generation
  const canGenerate = computed(() => {
    // Need guest name and at least one of: title, topic, or authority hook
    const hasName = guestName.value.trim().length > 0;
    const hasContext = guestTitle.value.trim().length > 0 ||
                       topic.value.trim().length > 0 ||
                       aiStore.hasValidAuthorityHook;
    return hasName && hasContext;
  });

  // Get slot config for active slot
  const activeSlotConfig = computed(() => LENGTH_SLOTS[activeSlot.value]);

  // Legacy compatibility: single introduction (for integrated mode)
  const introduction = computed(() => {
    const slot = currentSlot.value;
    if (slot.lockedIntro) return slot.lockedIntro.text;
    if (slot.variations.length > 0) return slot.variations[0].text;
    return null;
  });

  const hasIntroduction = computed(() => !!introduction.value);

  // Word count of current introduction
  const wordCount = computed(() => {
    if (!introduction.value) return 0;
    return introduction.value.split(/\s+/).filter(w => w.length > 0).length;
  });

  // ========================================
  // Generation Methods
  // ========================================

  /**
   * Generate variations for a specific slot using the tool-based API
   * @param {string} slotId Slot to generate for ('short', 'medium', 'long')
   * @param {object} overrides Optional parameter overrides
   * @param {string} contextOverride API context ('builder' or 'public')
   * @returns {Promise<object>} Generation result
   */
  const generateForSlot = async (slotId = null, overrides = {}, contextOverride = null) => {
    const targetSlot = slotId || activeSlot.value;
    const context = contextOverride || (isUserLoggedIn() ? 'builder' : 'public');

    // Set slot to generating state
    slots[targetSlot].status = 'generating';
    slots[targetSlot].preview = 'Generating variations...';
    isGenerating.value = true;
    error.value = null;

    try {
      const params = {
        guestName: overrides.guestName || guestName.value,
        guestTitle: overrides.guestTitle || guestTitle.value,
        episodeTitle: overrides.episodeTitle || episodeTitle.value,
        topic: overrides.topic || topic.value,
        authorityHook: overrides.authorityHook || aiStore.authorityHook,
        impactIntro: overrides.impactIntro || {
          credentials: aiStore.impactIntro.credentials.join(', '),
          mission: aiStore.impactIntro.achievements.join(', ')
        },
        length: targetSlot,
        tone: overrides.tone || tone.value,
        hookStyle: overrides.hookStyle || hookStyle.value,
        notes: overrides.notes || notes.value
      };

      const restUrl = getRestUrl();
      const nonce = getNonce(context);

      // Call the tool-based API endpoint (uses prompts.php)
      const response = await fetch(`${restUrl}ai/tool/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': context === 'builder' ? nonce : ''
        },
        body: JSON.stringify({
          tool: 'guest-intro',
          params,
          context,
          nonce: context === 'public' ? nonce : undefined
        })
      });

      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        const errorMessage = data.message || `Generation failed (${response.status})`;
        error.value = errorMessage;
        throw new Error(errorMessage);
      }

      // Handle successful response
      if (data.success && data.data?.content) {
        const result = data.data.content;

        // Update usage info
        if (data.usage) {
          usageRemaining.value = data.usage.remaining;
          resetTime.value = data.usage.reset_time;
          aiStore.updateUsage(data.usage);
        }

        // Parse the result - expect variations array from prompts.php parser
        if (result && result.variations) {
          slots[targetSlot].variations = result.variations;
          slots[targetSlot].status = 'ready';
          slots[targetSlot].preview = `${result.variations.length} variations ready`;
        } else if (result && typeof result === 'string') {
          // Legacy single result format
          slots[targetSlot].variations = [{
            id: 1,
            label: 'Generated',
            text: result,
            wordCount: result.split(/\s+/).length
          }];
          slots[targetSlot].status = 'ready';
          slots[targetSlot].preview = '1 variation ready';
        }

        return result;
      }

      throw new Error('Unexpected response format from AI service');
    } catch (err) {
      slots[targetSlot].status = 'empty';
      slots[targetSlot].preview = 'Generation failed - click to retry';
      error.value = err.message;
      throw err;
    } finally {
      isGenerating.value = false;
    }
  };

  /**
   * Refine an existing variation with instructions
   * @param {number} variationIndex Index of variation to refine
   * @param {string} instructions Refinement instructions
   * @returns {Promise<object>} Refined variation
   */
  const refineVariation = async (variationIndex, instructions) => {
    const slot = currentSlot.value;
    const variation = slot.variations[variationIndex];

    if (!variation || !instructions.trim()) {
      return null;
    }

    isRefining.value = true;
    const context = isUserLoggedIn() ? 'builder' : 'public';

    try {
      const params = {
        currentDraft: variation.text,
        refinementInstructions: instructions,
        length: activeSlot.value,
        tone: tone.value
      };

      const restUrl = getRestUrl();
      const nonce = getNonce(context);

      const response = await fetch(`${restUrl}ai/tool/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': context === 'builder' ? nonce : ''
        },
        body: JSON.stringify({
          tool: 'guest-intro',
          params,
          context,
          nonce: context === 'public' ? nonce : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Refinement failed');
      }

      const result = data.data?.content;

      // Update the variation in place
      if (result && result.variations && result.variations.length > 0) {
        const refined = result.variations[0];
        slots[activeSlot.value].variations[variationIndex] = {
          ...variation,
          text: refined.text,
          wordCount: refined.wordCount,
          label: variation.label + ' (Refined)'
        };
      }

      refinementText.value = '';
      return result;
    } finally {
      isRefining.value = false;
    }
  };

  /**
   * Regenerate variations for current slot
   */
  const regenerate = async () => {
    return generateForSlot(activeSlot.value);
  };

  // ========================================
  // Lock/Unlock Methods
  // ========================================

  /**
   * Lock a variation as the chosen intro for this slot
   * @param {number} variationIndex Index of variation to lock
   */
  const lockVariation = (variationIndex) => {
    const slot = slots[activeSlot.value];
    const variation = slot.variations[variationIndex];

    if (variation) {
      slot.lockedIntro = {
        ...variation,
        lockedAt: Date.now()
      };
      slot.status = 'locked';
      slot.preview = variation.text.substring(0, 60) + '...';
    }
  };

  /**
   * Unlock the current slot
   */
  const unlockSlot = () => {
    const slot = slots[activeSlot.value];
    slot.lockedIntro = null;
    slot.status = slot.variations.length > 0 ? 'ready' : 'empty';
    slot.preview = slot.variations.length > 0
      ? `${slot.variations.length} variations ready`
      : `Click to generate ${LENGTH_SLOTS[activeSlot.value].variationCount} variations`;
  };

  /**
   * Check if a slot is locked
   * @param {string} slotId Slot to check
   * @returns {boolean}
   */
  const isSlotLocked = (slotId) => {
    return !!slots[slotId].lockedIntro;
  };

  // ========================================
  // Clipboard Methods
  // ========================================

  /**
   * Copy a variation to clipboard
   * @param {number} variationIndex Index of variation to copy
   * @returns {Promise<boolean>}
   */
  const copyVariation = async (variationIndex) => {
    const slot = currentSlot.value;
    const variation = slot.variations[variationIndex];

    if (!variation) return false;

    try {
      await navigator.clipboard.writeText(variation.text);
      return true;
    } catch (err) {
      console.error('[useAIGuestIntro] Failed to copy:', err);
      return false;
    }
  };

  /**
   * Copy locked intro to clipboard
   * @returns {Promise<boolean>}
   */
  const copyLockedIntro = async () => {
    const slot = currentSlot.value;

    if (!slot.lockedIntro) return false;

    try {
      await navigator.clipboard.writeText(slot.lockedIntro.text);
      return true;
    } catch (err) {
      console.error('[useAIGuestIntro] Failed to copy locked intro:', err);
      return false;
    }
  };

  // ========================================
  // Form Setters (for programmatic use)
  // ========================================

  const setGuestName = (value) => { guestName.value = value; };
  const setGuestTitle = (value) => { guestTitle.value = value; };
  const setEpisodeTitle = (value) => { episodeTitle.value = value; };
  const setTopic = (value) => { topic.value = value; };
  const setTone = (value) => { tone.value = value; };
  const setHookStyle = (value) => { hookStyle.value = value; };
  const setNotes = (value) => { notes.value = value; };

  /**
   * Load data from profile data
   * @param {object} profileData Profile data object
   */
  const loadFromProfileData = (profileData) => {
    if (!profileData) return;

    // Load name
    const firstName = profileData.first_name || '';
    const lastName = profileData.last_name || '';
    if (firstName || lastName) {
      guestName.value = `${firstName} ${lastName}`.trim();
    }

    // Load title
    if (profileData.guest_title || profileData.title) {
      guestTitle.value = profileData.guest_title || profileData.title;
    }

    // Note: Authority hook fields (hook_who, hook_what, etc.) are loaded
    // by useAuthorityHook composable, not here, to avoid duplication

    /**
     * Helper to load an intro from profile into a slot
     * @param {string} slotId Slot to load into
     * @param {string} profileKey Profile data key to read from
     */
    const loadIntroFromProfile = (slotId, profileKey) => {
      if (profileData[profileKey]) {
        slots[slotId].lockedIntro = {
          id: 0,
          label: 'From Profile',
          text: profileData[profileKey],
          wordCount: profileData[profileKey].split(/\s+/).length
        };
        slots[slotId].status = 'locked';
        slots[slotId].preview = profileData[profileKey].substring(0, 60) + '...';
      }
    };

    // Load any existing intros from profile
    loadIntroFromProfile('short', 'introduction_short');
    loadIntroFromProfile('medium', 'introduction');
    loadIntroFromProfile('long', 'introduction_long');
  };

  /**
   * Get data for saving to profile
   * Keys match the source keys in meta.json fieldMapping:
   * - short -> introduction_short
   * - medium -> introduction
   * - long -> introduction_long
   * @returns {object} Profile-saveable data
   */
  const getProfileSaveData = () => {
    const data = {};

    if (slots.short.lockedIntro) {
      data.short = slots.short.lockedIntro.text;
    }
    if (slots.medium.lockedIntro) {
      data.medium = slots.medium.lockedIntro.text;
    }
    if (slots.long.lockedIntro) {
      data.long = slots.long.lockedIntro.text;
    }

    return data;
  };

  /**
   * Reset all state
   */
  const reset = () => {
    // Reset generation state
    isGenerating.value = false;
    error.value = null;

    // Reset form
    guestName.value = '';
    guestTitle.value = '';
    episodeTitle.value = '';
    topic.value = '';
    tone.value = 'professional';
    hookStyle.value = 'question';
    notes.value = '';

    // Reset slots
    Object.keys(slots).forEach(key => {
      slots[key] = {
        status: 'empty',
        variations: [],
        lockedIntro: null,
        preview: `Click to generate ${LENGTH_SLOTS[key].variationCount} variations`
      };
    });

    // Reset refinement
    refinementText.value = '';
    activeSlot.value = 'short';
  };

  // ========================================
  // Legacy Compatibility (for integrated mode)
  // ========================================

  /**
   * Legacy generate method for backwards compatibility
   * @param {object} params Legacy params
   * @param {string} context API context
   */
  const generate = async (params = {}, context = 'public') => {
    // Map legacy params to new structure
    if (params.name) guestName.value = params.name;
    if (params.biography) {
      // Parse biography as context
      topic.value = params.biography;
    }
    if (params.credentials) {
      // Legacy compatibility: 'credentials' field from Widget.vue is mapped to
      // guestTitle in the new model since Widget used credentials for the
      // guest's primary professional title/position
      guestTitle.value = params.credentials;
    }
    if (params.tagline) notes.value = params.tagline;

    return generateForSlot('medium', {}, context);
  };

  /**
   * Legacy copy to clipboard
   */
  const copyToClipboard = async () => {
    const text = introduction.value;
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('[useAIGuestIntro] Failed to copy:', err);
      return false;
    }
  };

  return {
    // Generation state
    isGenerating,
    error,
    usageRemaining,
    resetTime,

    // Form state
    guestName,
    guestTitle,
    episodeTitle,
    topic,
    tone,
    hookStyle,
    notes,

    // Slot state
    activeSlot,
    slots,
    currentSlot,
    hasVariations,
    hasAnyLocked,
    lockedIntros,
    canGenerate,
    activeSlotConfig,

    // Refinement state
    refinementText,
    isRefining,

    // Generation methods
    generateForSlot,
    refineVariation,
    regenerate,

    // Lock/Unlock methods
    lockVariation,
    unlockSlot,
    isSlotLocked,

    // Clipboard methods
    copyVariation,
    copyLockedIntro,

    // Form setters
    setGuestName,
    setGuestTitle,
    setEpisodeTitle,
    setTopic,
    setTone,
    setHookStyle,
    setNotes,

    // Profile methods
    loadFromProfileData,
    getProfileSaveData,
    reset,

    // Legacy compatibility
    introduction,
    hasIntroduction,
    wordCount,
    generate,
    copyToClipboard,

    // Constants
    LENGTH_SLOTS,
    TONE_OPTIONS,
    HOOK_STYLE_OPTIONS
  };
}

export default useAIGuestIntro;
