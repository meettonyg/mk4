/**
 * useAIAuthorityHooks - Composable for AI authority hook generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Wraps useAIGenerator with authority-hook-specific parsing logic.
 *
 * Similar to useAITopics.js - parses string API responses into structured arrays.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.2.0
 */

import { ref, computed } from 'vue';
import { useAIGenerator } from './useAIGenerator';

/**
 * Authority Hook generation composable
 *
 * @returns {object} Reactive state and methods for authority hook generation
 *
 * @example
 * const { generate, hooks, isGenerating, hasHooks } = useAIAuthorityHooks();
 * await generate({ who: 'entrepreneurs', what: 'scale their business' });
 */
export function useAIAuthorityHooks() {
  const generator = useAIGenerator('authority_hook');

  // Authority hook-specific state for form fields
  const who = ref('');
  const what = ref('');
  const when = ref('');
  const how = ref('');

  /**
   * Parsed hooks array
   * Converts string response from API into array of hook objects { text, angle? }
   */
  const hooks = computed(() => {
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

    // If string, parse into array of hook objects
    if (typeof content === 'string') {
      // Try to match numbered items (e.g., "1. Hook text here")
      // Use a regex that captures the hook text after the number
      const matches = content.match(/\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/gs);
      if (matches && matches.length > 0) {
        return matches.map(m => {
          // Remove the number prefix (e.g., "1. ")
          const fullContent = m.replace(/^\d+\.\s*/, '').trim();

          // Check if content has HOOK:/ANGLE: format (for structured responses)
          // e.g., "HOOK: I help... ANGLE: Results-focused"
          const parts = fullContent.split(/\nANGLE:\s*/i);
          const text = parts[0].replace(/^HOOK:\s*/i, '').trim();
          const angle = parts.length > 1 ? parts[1].trim() : '';

          return { text, angle };
        });
      }

      // Fallback: split by newlines for non-numbered lists
      const lines = content.split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (lines.length > 0) {
        // Return a consistent object shape even for the fallback
        return lines.map(text => ({ text, angle: '' }));
      }
    }

    return [];
  });

  // Has hooks check - true if we have any parsed hooks
  const hasHooks = computed(() => hooks.value.length > 0);

  // Hooks count
  const hooksCount = computed(() => hooks.value.length);

  /**
   * Generate authority hooks with provided parameters
   * @param {object} params Generation parameters (who, what, when, how, count)
   * @returns {Promise<any>} Raw generated content
   */
  const generate = async (params = {}) => {
    // Use provided params or fall back to local state
    const generateParams = {
      who: params.who ?? who.value,
      what: params.what ?? what.value,
      when: params.when ?? when.value,
      how: params.how ?? how.value,
      count: params.count ?? 5
    };

    return generator.generate(generateParams);
  };

  /**
   * Get hook by index (0-based)
   * @param {number} index 0-based index
   * @returns {object|null} Hook object at index or null
   */
  const getHook = (index) => {
    return hooks.value[index] || null;
  };

  /**
   * Get all hooks as formatted text (for copying)
   * @returns {string} Numbered list of hooks
   */
  const getHooksAsText = () => {
    return hooks.value
      .map((hook, index) => `${index + 1}. ${hook.text}`)
      .join('\n');
  };

  /**
   * Reset all state
   */
  const reset = () => {
    generator.reset();
    who.value = '';
    what.value = '';
    when.value = '';
    how.value = '';
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

    // Authority hook-specific state
    who,
    what,
    when,
    how,

    // Authority hook-specific computed
    hooks,
    hasHooks,
    hooksCount,

    // Authority hook-specific methods
    generate,
    getHook,
    getHooksAsText,
    reset
  };
}

export default useAIAuthorityHooks;
