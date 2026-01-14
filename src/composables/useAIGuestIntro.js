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
import { useAIGenerator } from './useAIGenerator';
import { useAIStore } from '../stores/ai';

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
  const generator = useAIGenerator('guest_intro');

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

  // Slot state: variations, locked intro, and status per slot
  const slots = reactive({
    short: {
      status: 'empty', // 'empty', 'generating', 'ready', 'locked'
      variations: [],
      lockedIntro: null,
      preview: 'Click to generate 5 variations'
    },
    medium: {
      status: 'empty',
      variations: [],
      lockedIntro: null,
      preview: 'Click to generate 3 variations'
    },
    long: {
      status: 'empty',
      variations: [],
      lockedIntro: null,
      preview: 'Click to generate 2 variations'
    }
  });

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
   * Generate variations for a specific slot
   * @param {string} slotId Slot to generate for ('short', 'medium', 'long')
   * @param {object} overrides Optional parameter overrides
   * @param {string} context API context ('builder' or 'public')
   * @returns {Promise<object>} Generation result
   */
  const generateForSlot = async (slotId = null, overrides = {}, context = 'public') => {
    const targetSlot = slotId || activeSlot.value;

    // Set slot to generating state
    slots[targetSlot].status = 'generating';
    slots[targetSlot].preview = 'Generating variations...';

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

      const result = await generator.generate(params, context);

      // Parse the result
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
    } catch (err) {
      slots[targetSlot].status = 'empty';
      slots[targetSlot].preview = 'Generation failed - click to retry';
      throw err;
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

    try {
      const params = {
        currentDraft: variation.text,
        refinementInstructions: instructions,
        length: activeSlot.value,
        tone: tone.value
      };

      const result = await generator.generate(params, 'public');

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

    // Load from authority hook fields if available
    if (profileData.hook_who) {
      // Don't overwrite if already set via store
    }

    // Load any existing intros
    if (profileData.introduction_short) {
      slots.short.lockedIntro = {
        id: 0,
        label: 'From Profile',
        text: profileData.introduction_short,
        wordCount: profileData.introduction_short.split(/\s+/).length
      };
      slots.short.status = 'locked';
      slots.short.preview = profileData.introduction_short.substring(0, 60) + '...';
    }

    if (profileData.introduction) {
      slots.medium.lockedIntro = {
        id: 0,
        label: 'From Profile',
        text: profileData.introduction,
        wordCount: profileData.introduction.split(/\s+/).length
      };
      slots.medium.status = 'locked';
      slots.medium.preview = profileData.introduction.substring(0, 60) + '...';
    }

    if (profileData.introduction_long) {
      slots.long.lockedIntro = {
        id: 0,
        label: 'From Profile',
        text: profileData.introduction_long,
        wordCount: profileData.introduction_long.split(/\s+/).length
      };
      slots.long.status = 'locked';
      slots.long.preview = profileData.introduction_long.substring(0, 60) + '...';
    }
  };

  /**
   * Get data for saving to profile
   * @returns {object} Profile-saveable data
   */
  const getProfileSaveData = () => {
    const data = {};

    if (slots.short.lockedIntro) {
      data.introduction_short = slots.short.lockedIntro.text;
    }
    if (slots.medium.lockedIntro) {
      data.introduction = slots.medium.lockedIntro.text;
    }
    if (slots.long.lockedIntro) {
      data.introduction_long = slots.long.lockedIntro.text;
    }

    return data;
  };

  /**
   * Reset all state
   */
  const reset = () => {
    generator.reset();

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
      // Store as impact intro
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
    // Base generator state
    isGenerating: generator.isGenerating,
    error: generator.error,
    usageRemaining: generator.usageRemaining,
    resetTime: generator.resetTime,

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
