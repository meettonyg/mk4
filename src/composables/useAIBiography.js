/**
 * useAIBiography - Composable for AI biography generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Wraps useAIGenerator with biography-specific logic.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.2.0
 */

import { ref, computed } from 'vue';
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
 * Length options for biography
 */
export const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (50-75 words)', description: 'Social media, brief intros' },
  { value: 'medium', label: 'Medium (150-200 words)', description: 'Speaker profiles, websites' },
  { value: 'long', label: 'Long (300-400 words)', description: 'Press kits, formal intros' }
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
 * Biography generation composable
 *
 * @returns {object} Reactive state and methods for biography generation
 *
 * @example
 * const { generate, biographies, isGenerating } = useAIBiography();
 * await generate({ name: 'John Smith', tone: 'professional', length: 'medium' });
 */
export function useAIBiography() {
  const aiStore = useAIStore();
  const generator = useAIGenerator('biography');

  // Biography-specific state
  const tone = ref(aiStore.preferences.defaultTone || 'professional');
  const length = ref(aiStore.preferences.defaultLength || 'medium');
  const pov = ref(aiStore.preferences.defaultPOV || 'third');
  const name = ref('');

  // Parsed biographies (short, medium, long)
  const biographies = computed(() => {
    const content = generator.generatedContent.value;
    if (!content) return null;

    // If already an object with length keys, return as-is
    if (typeof content === 'object' && (content.short || content.medium || content.long)) {
      return content;
    }

    // If string, wrap in the requested length
    if (typeof content === 'string') {
      return { [length.value]: content };
    }

    return content;
  });

  // Get specific length biography
  const shortBio = computed(() => biographies.value?.short || null);
  const mediumBio = computed(() => biographies.value?.medium || null);
  const longBio = computed(() => biographies.value?.long || null);

  // Get currently selected length biography
  const currentBio = computed(() => {
    if (!biographies.value) return null;
    return biographies.value[length.value] || Object.values(biographies.value)[0];
  });

  /**
   * Generate biography with current settings
   * @param {object} overrides Optional parameter overrides
   * @returns {Promise<object>} Generated biographies
   */
  const generate = async (overrides = {}) => {
    const params = {
      name: overrides.name || name.value,
      authorityHook: overrides.authorityHook || aiStore.authorityHook,
      tone: overrides.tone || tone.value,
      length: overrides.length || length.value,
      pov: overrides.pov || pov.value
    };

    return generator.generate(params);
  };

  /**
   * Generate all three lengths at once
   * @param {object} overrides Optional parameter overrides
   * @returns {Promise<object>} All biographies
   */
  const generateAll = async (overrides = {}) => {
    const params = {
      name: overrides.name || name.value,
      authorityHook: overrides.authorityHook || aiStore.authorityHook,
      tone: overrides.tone || tone.value,
      length: 'all', // Special flag for all lengths
      pov: overrides.pov || pov.value
    };

    return generator.generate(params);
  };

  /**
   * Set and save tone preference
   * @param {string} newTone Tone value
   */
  const setTone = (newTone) => {
    tone.value = newTone;
    aiStore.updatePreferences({ defaultTone: newTone });
  };

  /**
   * Set and save length preference
   * @param {string} newLength Length value
   */
  const setLength = (newLength) => {
    length.value = newLength;
    aiStore.updatePreferences({ defaultLength: newLength });
  };

  /**
   * Set and save POV preference
   * @param {string} newPOV POV value
   */
  const setPOV = (newPOV) => {
    pov.value = newPOV;
    aiStore.updatePreferences({ defaultPOV: newPOV });
  };

  /**
   * Reset all biography state
   */
  const reset = () => {
    generator.reset();
    name.value = '';
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

    // Biography-specific state
    tone,
    length,
    pov,
    name,

    // Biography-specific computed
    biographies,
    shortBio,
    mediumBio,
    longBio,
    currentBio,

    // Biography-specific methods
    generate,
    generateAll,
    setTone,
    setLength,
    setPOV,
    reset,

    // Options for UI
    TONE_OPTIONS,
    LENGTH_OPTIONS,
    POV_OPTIONS
  };
}

export default useAIBiography;
