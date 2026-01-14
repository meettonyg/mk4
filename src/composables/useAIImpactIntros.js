/**
 * useAIImpactIntros - Composable for AI impact intro generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Wraps useAIGenerator with impact-intro-specific parsing logic.
 *
 * Similar to useAIAuthorityHooks.js - parses string API responses into structured arrays.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.2.0
 */

import { ref, computed } from 'vue';
import { useAIGenerator } from './useAIGenerator';

/**
 * Impact Intro generation composable
 *
 * @returns {object} Reactive state and methods for impact intro generation
 *
 * @example
 * const { generate, intros, isGenerating, hasIntros } = useAIImpactIntros();
 * await generate({ where: 'helped 200+ SaaS founders...', why: 'make growth accessible...' });
 */
export function useAIImpactIntros() {
  const generator = useAIGenerator('impact_intro');

  // Impact intro-specific state for form fields
  const where = ref('');  // Results/achievements: "I've [WHERE]"
  const why = ref('');    // Mission/purpose: "My mission is [WHY]"

  /**
   * Parsed intros array
   * Converts string response from API into array of intro objects { text }
   */
  const intros = computed(() => {
    const content = generator.generatedContent.value;
    if (!content) return [];

    // If already an array of objects, return as-is
    if (Array.isArray(content)) {
      // Ensure each item has a 'text' property
      return content.map(item => {
        if (typeof item === 'string') {
          return { text: item };
        }
        return item;
      });
    }

    // If string, parse into array of intro objects
    if (typeof content === 'string') {
      // Try to match numbered items (e.g., "1. Intro text here")
      // Use a regex that captures the intro text after the number
      const matches = content.match(/\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/gs);
      if (matches && matches.length > 0) {
        return matches.map(m => {
          // Remove the number prefix (e.g., "1. ")
          const text = m.replace(/^\d+\.\s*/, '').trim();
          return { text };
        });
      }

      // Fallback: split by newlines for non-numbered lists
      const lines = content.split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (lines.length > 0) {
        return lines.map(text => ({ text }));
      }
    }

    return [];
  });

  // Has intros check - true if we have any parsed intros
  const hasIntros = computed(() => intros.value.length > 0);

  // Intros count
  const introsCount = computed(() => intros.value.length);

  /**
   * Generate live preview from current field values
   * Formula: "I've [WHERE]. My mission is [WHY]."
   */
  const introPreview = computed(() => {
    const whereVal = where.value?.trim() || '[your results/achievements]';
    const whyVal = why.value?.trim() || '[your mission]';
    return `I've ${whereVal}. My mission is ${whyVal}.`;
  });

  /**
   * Check if minimum data is available for generation
   */
  const hasMinimumData = computed(() => {
    return !!(where.value?.trim() || why.value?.trim());
  });

  /**
   * Generate impact intros with provided parameters
   * @param {object} params Generation parameters (where, why, count)
   * @returns {Promise<any>} Raw generated content
   */
  const generate = async (params = {}) => {
    // Use provided params or fall back to local state
    const generateParams = {
      where: params.where ?? where.value,
      why: params.why ?? why.value,
      count: params.count ?? 5
    };

    return generator.generate(generateParams);
  };

  /**
   * Get intro by index (0-based)
   * @param {number} index 0-based index
   * @returns {object|null} Intro object at index or null
   */
  const getIntro = (index) => {
    return intros.value[index] || null;
  };

  /**
   * Get all intros as formatted text (for copying)
   * @returns {string} Numbered list of intros
   */
  const getIntrosAsText = () => {
    return intros.value
      .map((intro, index) => `${index + 1}. ${intro.text}`)
      .join('\n');
  };

  /**
   * Reset all state
   */
  const reset = () => {
    generator.reset();
    where.value = '';
    why.value = '';
  };

  return {
    // From base generator
    isGenerating: generator.isGenerating,
    generatedContent: generator.generatedContent,
    rawContent: generator.rawContent,
    error: generator.error,
    usageRemaining: generator.usageRemaining,
    resetTime: generator.resetTime,
    hasContent: generator.hasContent,
    hasError: generator.hasError,
    isRateLimited: generator.isRateLimited,
    copyToClipboard: generator.copyToClipboard,
    regenerate: generator.regenerate,
    getContext: generator.getContext,

    // Impact intro-specific state
    where,
    why,

    // Impact intro-specific computed
    intros,
    hasIntros,
    introsCount,
    introPreview,
    hasMinimumData,

    // Impact intro-specific methods
    generate,
    getIntro,
    getIntrosAsText,
    reset
  };
}

export default useAIImpactIntros;
