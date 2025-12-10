/**
 * useAITagline - Composable for AI tagline generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Wraps useAIGenerator with tagline-specific logic.
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
 * Tone options for tagline generation
 */
export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'bold', label: 'Bold & Confident' },
  { value: 'friendly', label: 'Friendly & Approachable' },
  { value: 'authoritative', label: 'Authoritative' }
];

/**
 * Tagline generation composable
 *
 * @returns {object} Reactive state and methods for tagline generation
 *
 * @example
 * const { generate, taglines, selectedTagline, isGenerating } = useAITagline();
 * await generate({ name: 'John Smith', tone: 'bold' });
 */
export function useAITagline() {
  const aiStore = useAIStore();
  const generator = useAIGenerator('tagline');

  // Tagline-specific state
  const tone = ref(aiStore.preferences.defaultTone || 'professional');
  const name = ref('');
  const selectedIndex = ref(0);

  // Parsed taglines array
  const taglines = computed(() => {
    const content = generator.generatedContent.value;
    if (!content) return [];

    // If already an array, return as-is
    if (Array.isArray(content)) {
      return content;
    }

    // If string, try to parse as array or split by newlines
    if (typeof content === 'string') {
      // Try to split by numbered items
      const matches = content.match(/\d+\.\s*["']?(.+?)["']?(?=\n\d+\.|\n\n|$)/gs);
      if (matches) {
        return matches.map(m =>
          m.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim()
        );
      }
      // Fallback to newline split
      return content.split('\n')
        .map(t => t.replace(/^[-•*]\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(t => t.length > 5 && t.length < 200);
    }

    return [];
  });

  // Currently selected tagline
  const selectedTagline = computed(() => {
    if (taglines.value.length === 0) return null;
    return taglines.value[selectedIndex.value] || taglines.value[0];
  });

  // Primary tagline (first one)
  const primaryTagline = computed(() => taglines.value[0] || null);

  // Taglines count
  const taglinesCount = computed(() => taglines.value.length);

  /**
   * Generate taglines with current settings
   * @param {object} overrides Optional parameter overrides
   * @returns {Promise<array>} Generated taglines
   */
  const generate = async (overrides = {}) => {
    const params = {
      name: overrides.name || name.value,
      authorityHook: overrides.authorityHook || aiStore.authorityHook,
      tone: overrides.tone || tone.value
    };

    const result = await generator.generate(params);
    selectedIndex.value = 0; // Reset selection after new generation
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
    if (!selectedTagline.value) return false;

    try {
      await navigator.clipboard.writeText(selectedTagline.value);
      return true;
    } catch (err) {
      console.error('[useAITagline] Failed to copy:', err);
      return false;
    }
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
   * Reset all tagline state
   */
  const reset = () => {
    generator.reset();
    name.value = '';
    selectedIndex.value = 0;
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

    // Tagline-specific state
    tone,
    name,
    selectedIndex,

    // Tagline-specific computed
    taglines,
    selectedTagline,
    primaryTagline,
    taglinesCount,

    // Tagline-specific methods
    generate,
    selectTagline,
    selectNext,
    selectPrevious,
    copySelectedToClipboard,
    setTone,
    reset,

    // Options for UI
    TONE_OPTIONS
  };
}

export default useAITagline;
