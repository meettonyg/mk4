/**
 * useAIBiography - Composable for AI biography generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Wraps useAIGenerator with biography-specific logic.
 *
 * Enhanced for slot-based generation, refinement feedback loop, and variations.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 2.0.0
 * @since 2.2.0
 */

import { ref, computed, reactive } from 'vue';
import { useAIGenerator } from './useAIGenerator';
import { useAIStore } from '../stores/ai';

/**
 * Tone options for biography generation
 */
export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'friendly', label: 'Friendly & Approachable' },
  { value: 'bold', label: 'Bold & Confident' }
];

/**
 * Length options for biography with variation counts
 */
export const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (50 words)', description: 'Social media, brief intros', wordCount: 50, variations: 5 },
  { value: 'medium', label: 'Medium (150 words)', description: 'Speaker profiles, websites', wordCount: 150, variations: 3 },
  { value: 'long', label: 'Long (300 words)', description: 'Press kits, formal intros', wordCount: 300, variations: 2 }
];

/**
 * POV (Point of View) options
 */
export const POV_OPTIONS = [
  { value: 'first', label: 'First Person (I/My)' },
  { value: 'second', label: 'Second Person (You/Your)' },
  { value: 'third', label: 'Third Person (He/She/They)' }
];

/**
 * Get variation count for a given length
 */
export function getVariationCount(length) {
  const option = LENGTH_OPTIONS.find(o => o.value === length);
  return option?.variations || 3;
}

/**
 * Slot status states
 */
export const SLOT_STATUS = {
  EMPTY: 'empty',
  GENERATING: 'generating',
  HAS_VARIATIONS: 'has_variations',
  LOCKED: 'locked'
};

/**
 * Biography generation composable with slot-based architecture
 *
 * @returns {object} Reactive state and methods for biography generation
 *
 * @example
 * const { generateForSlot, slots, activeSlot, lockBio } = useAIBiography();
 * await generateForSlot('short');
 */
export function useAIBiography() {
  const aiStore = useAIStore();
  const generator = useAIGenerator('biography');

  // Biography-specific state
  const tone = ref(aiStore.preferences.defaultTone || 'professional');
  const pov = ref(aiStore.preferences.defaultPOV || 'third');
  const name = ref('');

  // Active slot tracking
  const activeSlot = ref('long'); // Default to long

  // Slots state: { short: { status, variations, locked, lockedBio }, ... }
  const slots = reactive({
    short: {
      status: SLOT_STATUS.EMPTY,
      variations: [],
      locked: false,
      lockedBio: null
    },
    medium: {
      status: SLOT_STATUS.EMPTY,
      variations: [],
      locked: false,
      lockedBio: null
    },
    long: {
      status: SLOT_STATUS.EMPTY,
      variations: [],
      locked: false,
      lockedBio: null
    }
  });

  // Form data for Authority Hook (6 W's)
  const authorityHook = reactive({
    who: '',
    what: '',
    when: '',
    how: ''
  });

  // Form data for Impact Intro
  const impactIntro = reactive({
    where: '',
    why: ''
  });

  // Optional fields
  const optionalFields = reactive({
    organization: '',
    existingBio: '',
    additionalNotes: ''
  });

  // Refinement feedback
  const refinementFeedback = ref('');

  /**
   * Get the current active slot data
   */
  const currentSlot = computed(() => slots[activeSlot.value]);

  /**
   * Get variations for the active slot
   */
  const currentVariations = computed(() => currentSlot.value?.variations || []);

  /**
   * Check if active slot has variations
   */
  const hasVariations = computed(() => currentVariations.value.length > 0);

  /**
   * Check if any slot is generating
   */
  const isGenerating = computed(() => {
    return Object.values(slots).some(s => s.status === SLOT_STATUS.GENERATING);
  });

  /**
   * Get count of locked bios
   */
  const lockedCount = computed(() => {
    return Object.values(slots).filter(s => s.locked).length;
  });

  /**
   * Build the authority hook summary
   */
  const authorityHookSummary = computed(() => {
    const parts = [];
    if (authorityHook.who) parts.push(`I help ${authorityHook.who}`);
    if (authorityHook.what) parts.push(`achieve ${authorityHook.what}`);
    if (authorityHook.when) parts.push(`when ${authorityHook.when}`);
    if (authorityHook.how) parts.push(`through ${authorityHook.how}`);
    return parts.length > 0 ? parts.join(' ') + '.' : '';
  });

  /**
   * Build the impact intro summary
   */
  const impactIntroSummary = computed(() => {
    const parts = [];
    if (impactIntro.where) parts.push(`I've ${impactIntro.where}`);
    if (impactIntro.why) parts.push(`My mission is to ${impactIntro.why}`);
    return parts.join('. ') + (parts.length > 0 ? '.' : '');
  });

  /**
   * Check if we have enough data to generate
   */
  const canGenerate = computed(() => {
    return name.value.trim() && (authorityHook.who || authorityHook.what);
  });

  /**
   * Generate biography variations for a specific slot
   * @param {string} slotName - 'short', 'medium', or 'long'
   * @param {object} overrides - Optional parameter overrides
   * @returns {Promise<array>} Generated variations
   */
  const generateForSlot = async (slotName, overrides = {}) => {
    const slot = slots[slotName];
    if (!slot) return [];

    const variationCount = getVariationCount(slotName);

    // Update status
    slot.status = SLOT_STATUS.GENERATING;
    activeSlot.value = slotName;

    const params = {
      name: overrides.name || name.value,
      authorityHook: authorityHookSummary.value,
      impactIntro: impactIntroSummary.value,
      organization: optionalFields.organization,
      existingBio: optionalFields.existingBio,
      additionalNotes: optionalFields.additionalNotes,
      tone: overrides.tone || tone.value,
      length: slotName,
      pov: overrides.pov || pov.value,
      variationCount
    };

    try {
      const result = await generator.generate(params);

      // Parse variations from result
      const variations = parseVariations(result, slotName);
      slot.variations = variations;
      slot.status = SLOT_STATUS.HAS_VARIATIONS;

      return variations;
    } catch (error) {
      slot.status = SLOT_STATUS.EMPTY;
      throw error;
    }
  };

  /**
   * Refine variations with feedback
   * @param {string} feedback - User feedback for refinement
   * @returns {Promise<array>} Refined variations
   */
  const refineVariations = async (feedback) => {
    const slot = slots[activeSlot.value];
    if (!slot || slot.variations.length === 0) return [];

    const variationCount = getVariationCount(activeSlot.value);
    slot.status = SLOT_STATUS.GENERATING;

    const params = {
      name: name.value,
      authorityHook: authorityHookSummary.value,
      impactIntro: impactIntroSummary.value,
      organization: optionalFields.organization,
      tone: tone.value,
      length: activeSlot.value,
      pov: pov.value,
      variationCount,
      // Send current drafts for refinement
      currentDrafts: slot.variations.map(v => v.text),
      refinementFeedback: feedback
    };

    try {
      const result = await generator.generate(params, 'refine');

      const variations = parseVariations(result, activeSlot.value);
      slot.variations = variations;
      slot.status = SLOT_STATUS.HAS_VARIATIONS;
      refinementFeedback.value = '';

      return variations;
    } catch (error) {
      slot.status = SLOT_STATUS.HAS_VARIATIONS; // Keep existing variations
      throw error;
    }
  };

  /**
   * Lock a bio from variations
   * @param {number} variationIndex - Index of variation to lock
   */
  const lockBio = (variationIndex) => {
    const slot = slots[activeSlot.value];
    if (!slot || !slot.variations[variationIndex]) return;

    slot.locked = true;
    slot.lockedBio = slot.variations[variationIndex].text;
    slot.status = SLOT_STATUS.LOCKED;
  };

  /**
   * Unlock a bio slot
   */
  const unlockBio = (slotName = null) => {
    const targetSlot = slotName || activeSlot.value;
    const slot = slots[targetSlot];
    if (!slot) return;

    slot.locked = false;
    slot.lockedBio = null;
    slot.status = slot.variations.length > 0 ? SLOT_STATUS.HAS_VARIATIONS : SLOT_STATUS.EMPTY;
  };

  /**
   * Parse variations from API response
   */
  function parseVariations(result, slotName) {
    // If result is already an array of variations
    if (Array.isArray(result)) {
      return result.map((text, index) => ({
        id: `${slotName}-${index}`,
        text: typeof text === 'string' ? text : text.text || text.content || '',
        label: getVariationLabel(index, slotName)
      }));
    }

    // If result is a string with delimiters
    if (typeof result === 'string') {
      // Try to parse numbered variations (OPTION 1:, OPTION 2:, etc.)
      const optionPattern = /OPTION\s*\d+[:\s]*([^O]+?)(?=OPTION\s*\d+|$)/gi;
      const matches = [...result.matchAll(optionPattern)];

      if (matches.length > 0) {
        return matches.map((match, index) => ({
          id: `${slotName}-${index}`,
          text: match[1].trim(),
          label: getVariationLabel(index, slotName)
        }));
      }

      // Try splitting by double newlines
      const paragraphs = result.split(/\n\n+/).filter(p => p.trim().length > 50);
      if (paragraphs.length > 1) {
        return paragraphs.map((text, index) => ({
          id: `${slotName}-${index}`,
          text: text.trim(),
          label: getVariationLabel(index, slotName)
        }));
      }

      // Single variation
      return [{
        id: `${slotName}-0`,
        text: result.trim(),
        label: getVariationLabel(0, slotName)
      }];
    }

    // If result is object with variations key
    if (result?.variations) {
      return parseVariations(result.variations, slotName);
    }

    // If result is object with content
    if (result?.content) {
      return parseVariations(result.content, slotName);
    }

    return [];
  }

  /**
   * Get a label for a variation based on index
   */
  function getVariationLabel(index, slotName) {
    const labels = {
      0: 'THE STORY-DRIVEN EXECUTIVE',
      1: 'THE RESULTS-FOCUSED STRATEGIST',
      2: 'THE VISIONARY LEADER',
      3: 'THE TRUSTED ADVISOR',
      4: 'THE INDUSTRY PIONEER'
    };
    return `OPTION ${index + 1}: ${labels[index] || `VARIATION ${index + 1}`}`;
  }

  /**
   * Set active slot
   */
  const setActiveSlot = (slotName) => {
    if (slots[slotName]) {
      activeSlot.value = slotName;
    }
  };

  /**
   * Get slot preview text
   */
  const getSlotPreview = (slotName) => {
    const slot = slots[slotName];
    if (!slot) return '';

    if (slot.locked && slot.lockedBio) {
      return slot.lockedBio.substring(0, 80) + '...';
    }
    if (slot.status === SLOT_STATUS.GENERATING) {
      return 'Generating variations...';
    }
    if (slot.variations.length > 0) {
      return `${slot.variations.length} variations ready`;
    }

    const variationCount = getVariationCount(slotName);
    return `Click to generate ${variationCount} variations`;
  };

  /**
   * Get all locked bios for saving
   */
  const getLockedBios = () => {
    const result = {};
    Object.entries(slots).forEach(([key, slot]) => {
      if (slot.locked && slot.lockedBio) {
        result[key] = slot.lockedBio;
      }
    });
    return result;
  };

  /**
   * Copy a specific bio to clipboard
   */
  const copyBio = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('[Biography] Failed to copy:', err);
      return false;
    }
  };

  /**
   * Reset all state
   */
  const reset = () => {
    generator.reset();
    name.value = '';
    authorityHook.who = '';
    authorityHook.what = '';
    authorityHook.when = '';
    authorityHook.how = '';
    impactIntro.where = '';
    impactIntro.why = '';
    optionalFields.organization = '';
    optionalFields.existingBio = '';
    optionalFields.additionalNotes = '';
    refinementFeedback.value = '';

    Object.keys(slots).forEach(key => {
      slots[key] = {
        status: SLOT_STATUS.EMPTY,
        variations: [],
        locked: false,
        lockedBio: null
      };
    });

    activeSlot.value = 'long';
  };

  /**
   * Populate from profile data
   */
  const populateFromProfile = (profileData) => {
    if (!profileData) return;

    // Name
    const firstName = profileData.first_name || '';
    const lastName = profileData.last_name || '';
    name.value = [firstName, lastName].filter(Boolean).join(' ');

    // Authority Hook
    if (profileData.hook_who) authorityHook.who = profileData.hook_who;
    if (profileData.hook_what) authorityHook.what = profileData.hook_what;
    if (profileData.hook_when) authorityHook.when = profileData.hook_when;
    if (profileData.hook_how) authorityHook.how = profileData.hook_how;

    // Impact Intro
    if (profileData.impact_where) impactIntro.where = profileData.impact_where;
    if (profileData.impact_why) impactIntro.why = profileData.impact_why;

    // Optional fields
    if (profileData.organization) optionalFields.organization = profileData.organization;
    if (profileData.biography) optionalFields.existingBio = profileData.biography;

    // Pre-populate locked bios if they exist
    if (profileData.biography_short) {
      slots.short.locked = true;
      slots.short.lockedBio = profileData.biography_short;
      slots.short.status = SLOT_STATUS.LOCKED;
    }
    if (profileData.biography) {
      slots.medium.locked = true;
      slots.medium.lockedBio = profileData.biography;
      slots.medium.status = SLOT_STATUS.LOCKED;
    }
    if (profileData.biography_long) {
      slots.long.locked = true;
      slots.long.lockedBio = profileData.biography_long;
      slots.long.status = SLOT_STATUS.LOCKED;
    }
  };

  /**
   * Set and save tone preference
   */
  const setTone = (newTone) => {
    tone.value = newTone;
    aiStore.updatePreferences({ defaultTone: newTone });
  };

  /**
   * Set and save POV preference
   */
  const setPOV = (newPOV) => {
    pov.value = newPOV;
    aiStore.updatePreferences({ defaultPOV: newPOV });
  };

  // Legacy compatibility
  const length = ref('medium');
  const biographies = computed(() => getLockedBios());
  const currentBio = computed(() => {
    const slot = slots[activeSlot.value];
    return slot?.lockedBio || (slot?.variations[0]?.text || null);
  });
  const hasContent = computed(() => lockedCount.value > 0 || hasVariations.value);

  return {
    // From base generator
    error: generator.error,
    usageRemaining: generator.usageRemaining,
    resetTime: generator.resetTime,
    hasError: generator.hasError,
    isRateLimited: generator.isRateLimited,
    getContext: generator.getContext,

    // Core state
    name,
    tone,
    pov,
    authorityHook,
    impactIntro,
    optionalFields,
    refinementFeedback,

    // Slot-based state
    slots,
    activeSlot,
    currentSlot,
    currentVariations,
    hasVariations,
    isGenerating,
    lockedCount,

    // Computed
    authorityHookSummary,
    impactIntroSummary,
    canGenerate,

    // Methods
    generateForSlot,
    refineVariations,
    lockBio,
    unlockBio,
    setActiveSlot,
    getSlotPreview,
    getLockedBios,
    copyBio,
    reset,
    populateFromProfile,
    setTone,
    setPOV,

    // Legacy compatibility
    length,
    biographies,
    currentBio,
    hasContent,
    generate: (overrides) => generateForSlot(activeSlot.value, overrides),
    copyToClipboard: () => copyBio(currentBio.value),

    // Options for UI
    TONE_OPTIONS,
    LENGTH_OPTIONS,
    POV_OPTIONS,
    SLOT_STATUS
  };
}

export default useAIBiography;
