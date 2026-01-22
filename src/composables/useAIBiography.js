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
    title: '',
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
   * Requires name AND at least one of the 6 W's (Authority Hook or Impact Intro)
   */
  const canGenerate = computed(() => {
    const hasName = name.value.trim();
    const hasAuthorityHook = authorityHook.who || authorityHook.what || authorityHook.when || authorityHook.how;
    const hasImpactIntro = impactIntro.where || impactIntro.why;
    return hasName && (hasAuthorityHook || hasImpactIntro);
  });

  /**
   * Generate biography variations for a specific slot
   * @param {string} slotName - 'short', 'medium', or 'long'
   * @param {object} overrides - Optional parameter overrides
   * @returns {Promise<array>} Generated variations
   */
  const generateForSlot = async (slotName, overrides = {}) => {
    console.log('[useAIBiography] generateForSlot called with slotName:', slotName);

    const slot = slots[slotName];
    if (!slot) {
      console.error('[useAIBiography] Invalid slot name:', slotName, 'Available slots:', Object.keys(slots));
      return [];
    }

    const variationCount = getVariationCount(slotName);

    // Update status
    slot.status = SLOT_STATUS.GENERATING;
    activeSlot.value = slotName;

    const params = {
      name: overrides.name || name.value,
      title: optionalFields.title,
      // Pass the raw object with who/what/when/how fields, not the summary string
      // The PHP backend expects an object to build the authority hook section
      authorityHook: {
        who: authorityHook.who,
        what: authorityHook.what,
        when: authorityHook.when,
        how: authorityHook.how
      },
      impactIntro: impactIntroSummary.value,
      organization: optionalFields.organization,
      existingBio: optionalFields.existingBio,
      additionalNotes: optionalFields.additionalNotes,
      tone: overrides.tone || tone.value,
      length: slotName,
      pov: overrides.pov || pov.value,
      variationCount
    };

    console.log('[useAIBiography] Calling generator.generate with params:', params);

    try {
      const result = await generator.generate(params);
      console.log('[useAIBiography] generator.generate result:', result);

      // Parse variations from result
      const variations = parseVariations(result, slotName);
      slot.variations = variations;
      slot.status = SLOT_STATUS.HAS_VARIATIONS;

      console.log('[useAIBiography] Parsed variations:', variations);
      return variations;
    } catch (error) {
      console.error('[useAIBiography] Generation error:', error);
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
      // Pass the raw object with who/what/when/how fields, not the summary string
      authorityHook: {
        who: authorityHook.who,
        what: authorityHook.what,
        when: authorityHook.when,
        how: authorityHook.how
      },
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
   * Uses explicit delimiters to avoid issues with content containing "OPTION" text
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
      // Strategy 1: Look for explicit delimiter pattern "---" or "***" between variations
      const explicitDelimiterPattern = /(?:^|\n)[-*]{3,}\s*\n/;
      if (explicitDelimiterPattern.test(result)) {
        const sections = result.split(explicitDelimiterPattern).filter(s => s.trim().length > 0);
        if (sections.length > 1) {
          return sections.map((text, index) => ({
            id: `${slotName}-${index}`,
            text: cleanVariationText(text),
            label: getVariationLabel(index, slotName)
          }));
        }
      }

      // Strategy 2: Split by "OPTION X:" at the START of a line (more robust than mid-text matching)
      // This avoids false positives when "option" appears in the biography content
      const optionHeaderPattern = /(?:^|\n)\s*OPTION\s+(\d+)\s*[:\-]\s*/gi;
      const optionMatches = [...result.matchAll(optionHeaderPattern)];

      if (optionMatches.length > 1) {
        const variations = [];
        for (let i = 0; i < optionMatches.length; i++) {
          const startIndex = optionMatches[i].index + optionMatches[i][0].length;
          const endIndex = i < optionMatches.length - 1 ? optionMatches[i + 1].index : result.length;
          const text = result.substring(startIndex, endIndex).trim();
          if (text.length > 0) {
            variations.push({
              id: `${slotName}-${i}`,
              text: cleanVariationText(text),
              label: getVariationLabel(i, slotName)
            });
          }
        }
        if (variations.length > 0) {
          return variations;
        }
      }

      // Strategy 3: Split by numbered list pattern (1., 2., 3., etc.) at line start
      const numberedPattern = /(?:^|\n)\s*(\d+)\.\s+/g;
      const numberedMatches = [...result.matchAll(numberedPattern)];

      if (numberedMatches.length > 1) {
        const variations = [];
        for (let i = 0; i < numberedMatches.length; i++) {
          const startIndex = numberedMatches[i].index + numberedMatches[i][0].length;
          const endIndex = i < numberedMatches.length - 1 ? numberedMatches[i + 1].index : result.length;
          const text = result.substring(startIndex, endIndex).trim();
          // Use a reasonable minimum (20 chars) to filter out false positives but not short valid bios
          if (text.length >= 20) {
            variations.push({
              id: `${slotName}-${i}`,
              text: cleanVariationText(text),
              label: getVariationLabel(i, slotName)
            });
          }
        }
        if (variations.length > 0) {
          return variations;
        }
      }

      // Strategy 4: Split by double newlines (paragraph-based)
      // Use a minimum of 20 characters to avoid filtering out legitimate short bios
      const paragraphs = result.split(/\n\n+/).filter(p => p.trim().length >= 20);
      if (paragraphs.length > 1) {
        return paragraphs.map((text, index) => ({
          id: `${slotName}-${index}`,
          text: cleanVariationText(text),
          label: getVariationLabel(index, slotName)
        }));
      }

      // Single variation fallback
      return [{
        id: `${slotName}-0`,
        text: cleanVariationText(result),
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
   * Clean variation text by removing option headers and extra whitespace
   */
  function cleanVariationText(text) {
    return text
      .replace(/^OPTION\s+\d+\s*[:\-]\s*/i, '') // Remove leading "OPTION X:" if present
      .replace(/^\d+\.\s*/, '') // Remove leading "1." if present
      .trim();
  }

  /**
   * Get a label for a variation based on index and slot type
   * Generates dynamic labels based on the slot length
   */
  function getVariationLabel(index, slotName) {
    const slotLabels = {
      short: ['CONCISE', 'PUNCHY', 'SNAPPY', 'BRIEF', 'COMPACT'],
      medium: ['BALANCED', 'PROFESSIONAL', 'ENGAGING'],
      long: ['COMPREHENSIVE', 'DETAILED']
    };

    const labels = slotLabels[slotName] || slotLabels.medium;
    const label = labels[index] || `STYLE ${index + 1}`;

    return `OPTION ${index + 1}: ${label}`;
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
    optionalFields.title = '';
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
   * Handles multiple field name variations from different profile sources
   */
  const populateFromProfile = (profileData) => {
    if (!profileData) return;

    // Name - check multiple field variations
    const firstName = profileData.first_name || profileData.firstName || '';
    const lastName = profileData.last_name || profileData.lastName || '';
    const fullName = profileData.full_name || profileData.fullName || profileData.name || '';
    name.value = fullName || [firstName, lastName].filter(Boolean).join(' ');

    // Title/Role
    const title = profileData.guest_title || profileData.title || profileData.professional_title || '';
    if (title) optionalFields.title = title;

    // Organization/Company
    const org = profileData.organization || profileData.company || profileData.org || '';
    if (org) optionalFields.organization = org;

    // Authority Hook - check multiple field name patterns
    const hookWho = profileData.hook_who || profileData.hookWho || profileData.who || '';
    const hookWhat = profileData.hook_what || profileData.hookWhat || profileData.what || '';
    const hookWhen = profileData.hook_when || profileData.hookWhen || profileData.when || '';
    const hookHow = profileData.hook_how || profileData.hookHow || profileData.how || '';

    if (hookWho) authorityHook.who = hookWho;
    if (hookWhat) authorityHook.what = hookWhat;
    if (hookWhen) authorityHook.when = hookWhen;
    if (hookHow) authorityHook.how = hookHow;

    // Impact Intro (WHERE & WHY) - check multiple field name patterns
    // Primary: hook_where/hook_why (profile schema uses hook_ prefix for all 6 W's)
    // Also check: impact_where/impact_why, where/why, and nested impact_intro object
    const impactData = profileData.impact_intro || profileData.impactIntro || {};
    const whereVal = profileData.hook_where || profileData.hookWhere ||
                     profileData.impact_where || profileData.impactWhere ||
                     impactData.where || profileData.where ||
                     profileData.credentials || profileData.achievements || '';
    const whyVal = profileData.hook_why || profileData.hookWhy ||
                   profileData.impact_why || profileData.impactWhy ||
                   impactData.why || profileData.why ||
                   profileData.mission || profileData.purpose || '';

    console.log('[useAIBiography] populateFromProfile - Profile data keys:', Object.keys(profileData));
    console.log('[useAIBiography] populateFromProfile - hook_where:', profileData.hook_where);
    console.log('[useAIBiography] populateFromProfile - hook_why:', profileData.hook_why);
    console.log('[useAIBiography] populateFromProfile - whereVal resolved to:', whereVal);
    console.log('[useAIBiography] populateFromProfile - whyVal resolved to:', whyVal);

    if (whereVal) impactIntro.where = whereVal;
    if (whyVal) impactIntro.why = whyVal;

    console.log('[useAIBiography] populateFromProfile - Set impactIntro.where to:', impactIntro.where);
    console.log('[useAIBiography] populateFromProfile - Set impactIntro.why to:', impactIntro.why);

    // Existing biography for reference
    const existingBio = profileData.biography || profileData.bio || '';
    if (existingBio) optionalFields.existingBio = existingBio;

    // Pre-populate locked bios if they exist
    if (profileData.biography_short || profileData.biographyShort) {
      slots.short.locked = true;
      slots.short.lockedBio = profileData.biography_short || profileData.biographyShort;
      slots.short.status = SLOT_STATUS.LOCKED;
    }
    if (profileData.biography) {
      slots.medium.locked = true;
      slots.medium.lockedBio = profileData.biography;
      slots.medium.status = SLOT_STATUS.LOCKED;
    }
    if (profileData.biography_long || profileData.biographyLong) {
      slots.long.locked = true;
      slots.long.lockedBio = profileData.biography_long || profileData.biographyLong;
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
