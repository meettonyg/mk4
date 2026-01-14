/**
 * useAITagline - Composable for AI tagline generation
 *
 * Enhanced version with:
 * - 6 W's Authority Framework support
 * - Refinement loop for iterative improvements
 * - Locked tagline state management
 * - Style focus and tone options
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
 * Style focus options for tagline generation
 */
export const STYLE_FOCUS_OPTIONS = [
  { value: 'problem', label: 'Problem-Focused' },
  { value: 'solution', label: 'Solution-Focused' },
  { value: 'outcome', label: 'Outcome-Focused' },
  { value: 'authority', label: 'Authority-Focused' }
];

/**
 * Tone options for tagline generation
 */
export const TONE_OPTIONS = [
  { value: 'bold', label: 'Bold & Direct' },
  { value: 'professional', label: 'Professional & Polished' },
  { value: 'clever', label: 'Conversational & Clever' },
  { value: 'inspirational', label: 'Inspirational' }
];

/**
 * Intent options for tagline types
 */
export const INTENT_OPTIONS = [
  { value: 'brand', label: 'Brand Tagline' },
  { value: 'podcast', label: 'Podcast Hook' },
  { value: 'course', label: 'Course/Book Title' }
];

/**
 * Tagline generation composable with refinement loop
 *
 * @returns {object} Reactive state and methods for tagline generation
 *
 * @example
 * const { generate, refine, taglines, lockedTagline, isGenerating } = useAITagline();
 * await generate({ who: 'SaaS founders', what: 'scale to 7-figures' });
 * await refine('Make them shorter and punchier');
 */
export function useAITagline() {
  const aiStore = useAIStore();
  const generator = useAIGenerator('tagline');

  // Form state - 6 W's Authority Framework
  const authorityHook = reactive({
    who: '',
    what: '',
    when: '',
    how: ''
  });

  const impactIntro = reactive({
    where: '',  // Credentials/proof
    why: ''     // Mission/purpose
  });

  const brandContext = reactive({
    industry: '',
    uniqueFactor: '',
    existingTaglines: ''
  });

  // Settings state
  const styleFocus = ref('outcome');
  const tone = ref(aiStore.preferences.defaultTone || 'bold');
  const intent = ref('brand');

  // Selection and locking state
  const selectedIndex = ref(-1);
  const lockedTagline = ref(null);
  const lockedTaglineIndex = ref(-1);

  // Refinement state
  const refinementHistory = ref([]);
  const refinementFeedback = ref('');

  // Generation count for tracking iterations
  const generationCount = ref(0);

  /**
   * Parsed taglines array
   */
  const taglines = computed(() => {
    const content = generator.generatedContent.value;
    if (!content) return [];

    // If already an array of objects with text property
    if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (typeof item === 'string') {
          return { text: item, selected: index === selectedIndex.value };
        }
        return {
          ...item,
          text: item.text || item,
          selected: index === selectedIndex.value
        };
      });
    }

    // If string, parse numbered list
    if (typeof content === 'string') {
      const matches = content.match(/\d+[\.\)]\s*["']?(.+?)["']?(?=\n\d+[\.\)]|\n\n|$)/gs);
      if (matches) {
        return matches.map((m, index) => ({
          text: m.replace(/^\d+[\.\)]\s*/, '').replace(/^["']|["']$/g, '').trim(),
          selected: index === selectedIndex.value
        }));
      }
      // Fallback to newline split
      return content.split('\n')
        .map(t => t.replace(/^[-*]\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(t => t.length > 5 && t.length < 200)
        .map((text, index) => ({ text, selected: index === selectedIndex.value }));
    }

    return [];
  });

  /**
   * Simple taglines array (just text strings)
   */
  const taglinesText = computed(() => taglines.value.map(t => t.text));

  /**
   * Has taglines check
   */
  const hasTaglines = computed(() => taglines.value.length > 0);

  /**
   * Currently selected tagline
   */
  const selectedTagline = computed(() => {
    if (selectedIndex.value < 0 || taglines.value.length === 0) return null;
    return taglines.value[selectedIndex.value]?.text || null;
  });

  /**
   * Primary tagline (first one)
   */
  const primaryTagline = computed(() => taglines.value[0]?.text || null);

  /**
   * Taglines count
   */
  const taglinesCount = computed(() => taglines.value.length);

  /**
   * Check if form has enough data to generate
   */
  const canGenerate = computed(() => {
    // Need at least WHO or WHAT filled
    return (
      authorityHook.who.trim().length > 0 ||
      authorityHook.what.trim().length > 0
    );
  });

  /**
   * Build generation parameters from current state
   */
  const buildParams = (overrides = {}) => {
    return {
      // 6 W's Framework
      who: overrides.who ?? authorityHook.who,
      what: overrides.what ?? authorityHook.what,
      when: overrides.when ?? authorityHook.when,
      how: overrides.how ?? authorityHook.how,
      where: overrides.where ?? impactIntro.where,
      why: overrides.why ?? impactIntro.why,

      // Brand context
      industry: overrides.industry ?? brandContext.industry,
      uniqueFactor: overrides.uniqueFactor ?? brandContext.uniqueFactor,
      existingTaglines: overrides.existingTaglines ?? brandContext.existingTaglines,

      // Settings
      styleFocus: overrides.styleFocus ?? styleFocus.value,
      tone: overrides.tone ?? tone.value,
      intent: overrides.intent ?? intent.value,
      count: overrides.count ?? 10,

      // Legacy support
      authorityHook: overrides.authorityHook || aiStore.authorityHook,

      // Refinement context
      previousTaglines: overrides.previousTaglines ?? [],
      refinementFeedback: overrides.refinementFeedback ?? ''
    };
  };

  /**
   * Generate taglines with current settings
   * @param {object} overrides Optional parameter overrides
   * @param {string} context 'builder' or 'public'
   * @returns {Promise<array>} Generated taglines
   */
  const generate = async (overrides = {}, context = 'public') => {
    const params = buildParams(overrides);

    const result = await generator.generate(params, context);

    // Reset selection and refinement state for new generation
    selectedIndex.value = -1;
    refinementHistory.value = [];
    generationCount.value++;

    return result;
  };

  /**
   * Refine taglines with feedback
   * @param {string} feedback User's refinement instructions
   * @param {string} context 'builder' or 'public'
   * @returns {Promise<array>} Refined taglines
   */
  const refine = async (feedback, context = 'public') => {
    if (!feedback?.trim() || taglinesText.value.length === 0) {
      return null;
    }

    // Store current taglines in history
    refinementHistory.value.push({
      taglines: [...taglinesText.value],
      feedback: feedback
    });

    // Build params with refinement context
    const params = buildParams({
      previousTaglines: taglinesText.value,
      refinementFeedback: feedback
    });

    const result = await generator.generate(params, context);

    // Keep current selection if valid
    if (selectedIndex.value >= taglines.value.length) {
      selectedIndex.value = -1;
    }

    generationCount.value++;
    refinementFeedback.value = '';

    return result;
  };

  /**
   * Select a tagline by index
   * @param {number} index Index to select
   */
  const selectTagline = (index) => {
    if (index >= 0 && index < taglines.value.length) {
      selectedIndex.value = index;
    }
  };

  /**
   * Lock the currently selected tagline as the master tagline
   */
  const lockSelectedTagline = () => {
    if (selectedTagline.value) {
      lockedTagline.value = selectedTagline.value;
      lockedTaglineIndex.value = selectedIndex.value;
    }
  };

  /**
   * Lock a specific tagline by index
   * @param {number} index Index of tagline to lock
   */
  const lockTagline = (index) => {
    if (index >= 0 && index < taglines.value.length) {
      lockedTagline.value = taglines.value[index].text;
      lockedTaglineIndex.value = index;
      selectedIndex.value = index;
    }
  };

  /**
   * Unlock the master tagline
   */
  const unlockTagline = () => {
    lockedTagline.value = null;
    lockedTaglineIndex.value = -1;
  };

  /**
   * Check if a tagline at index is locked
   * @param {number} index Index to check
   */
  const isTaglineLocked = (index) => {
    return lockedTaglineIndex.value === index;
  };

  /**
   * Select next tagline
   */
  const selectNext = () => {
    if (taglines.value.length > 0) {
      selectedIndex.value = (selectedIndex.value + 1) % taglines.value.length;
    }
  };

  /**
   * Select previous tagline
   */
  const selectPrevious = () => {
    if (taglines.value.length > 0) {
      selectedIndex.value = (selectedIndex.value - 1 + taglines.value.length) % taglines.value.length;
    }
  };

  /**
   * Copy selected tagline to clipboard
   * @returns {Promise<boolean>} Success status
   */
  const copySelectedToClipboard = async () => {
    const textToCopy = selectedTagline.value || lockedTagline.value;
    if (!textToCopy) return false;

    try {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    } catch (err) {
      console.error('[useAITagline] Failed to copy:', err);
      return false;
    }
  };

  /**
   * Set style focus preference
   * @param {string} newStyleFocus Style focus value
   */
  const setStyleFocus = (newStyleFocus) => {
    styleFocus.value = newStyleFocus;
  };

  /**
   * Set tone preference
   * @param {string} newTone Tone value
   */
  const setTone = (newTone) => {
    tone.value = newTone;
    aiStore.updatePreferences({ defaultTone: newTone });
  };

  /**
   * Set intent
   * @param {string} newIntent Intent value
   */
  const setIntent = (newIntent) => {
    intent.value = newIntent;
  };

  /**
   * Load authority hook from profile data
   * @param {object} profileData Profile data object
   */
  const loadFromProfile = (profileData) => {
    if (!profileData) return;

    // Load authority hook components
    if (profileData.authority_hook_who) authorityHook.who = profileData.authority_hook_who;
    if (profileData.authority_hook_what) authorityHook.what = profileData.authority_hook_what;
    if (profileData.authority_hook_when) authorityHook.when = profileData.authority_hook_when;
    if (profileData.authority_hook_how) authorityHook.how = profileData.authority_hook_how;

    // Load impact intro
    if (profileData.impact_intro_where) impactIntro.where = profileData.impact_intro_where;
    if (profileData.impact_intro_why) impactIntro.why = profileData.impact_intro_why;

    // Load existing tagline if available
    if (profileData.tagline) {
      lockedTagline.value = profileData.tagline;
    }
  };

  /**
   * Get data to save to profile
   */
  const getProfileData = () => {
    return {
      tagline: lockedTagline.value || selectedTagline.value
    };
  };

  /**
   * Reset all tagline state
   */
  const reset = () => {
    generator.reset();

    // Reset form state
    authorityHook.who = '';
    authorityHook.what = '';
    authorityHook.when = '';
    authorityHook.how = '';
    impactIntro.where = '';
    impactIntro.why = '';
    brandContext.industry = '';
    brandContext.uniqueFactor = '';
    brandContext.existingTaglines = '';

    // Reset selection state
    selectedIndex.value = -1;
    lockedTagline.value = null;
    lockedTaglineIndex.value = -1;

    // Reset refinement state
    refinementHistory.value = [];
    refinementFeedback.value = '';
    generationCount.value = 0;
  };

  return {
    // From base generator
    isGenerating: generator.isGenerating,
    error: generator.error,
    usageRemaining: generator.usageRemaining,
    resetTime: generator.resetTime,
    hasContent: generator.hasContent,
    hasError: generator.hasError,
    isRateLimited: generator.isRateLimited,
    copyToClipboard: generator.copyToClipboard,
    regenerate: generator.regenerate,
    getContext: generator.getContext,

    // Form state (6 W's)
    authorityHook,
    impactIntro,
    brandContext,

    // Settings state
    styleFocus,
    tone,
    intent,

    // Selection state
    selectedIndex,
    lockedTagline,
    lockedTaglineIndex,

    // Refinement state
    refinementHistory,
    refinementFeedback,
    generationCount,

    // Computed
    taglines,
    taglinesText,
    hasTaglines,
    selectedTagline,
    primaryTagline,
    taglinesCount,
    canGenerate,

    // Methods
    generate,
    refine,
    selectTagline,
    lockSelectedTagline,
    lockTagline,
    unlockTagline,
    isTaglineLocked,
    selectNext,
    selectPrevious,
    copySelectedToClipboard,
    setStyleFocus,
    setTone,
    setIntent,
    loadFromProfile,
    getProfileData,
    reset,

    // Options for UI
    STYLE_FOCUS_OPTIONS,
    TONE_OPTIONS,
    INTENT_OPTIONS
  };
}

export default useAITagline;
