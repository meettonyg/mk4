/**
 * useAITopics - Composable for AI topics generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Wraps useAIGenerator with topics-specific logic.
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
 * Topics generation composable
 *
 * @returns {object} Reactive state and methods for topics generation
 *
 * @example
 * const { generate, topics, isGenerating } = useAITopics();
 * await generate({ expertise: 'Digital marketing' });
 */
export function useAITopics() {
  const aiStore = useAIStore();
  const generator = useAIGenerator('topics');

  // Topics-specific state
  const expertise = ref('');
  const customContext = ref('');

  // Parsed topics array
  const topics = computed(() => {
    const content = generator.generatedContent.value;
    if (!content) return [];

    // If already an array, return as-is
    if (Array.isArray(content)) {
      return content;
    }

    // If string, try to parse as array or split by newlines
    if (typeof content === 'string') {
      // Try to split by numbered items
      const matches = content.match(/\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/gs);
      if (matches) {
        return matches.map(m => m.replace(/^\d+\.\s*/, '').trim());
      }
      // Fallback to newline split
      return content.split('\n').map(t => t.trim()).filter(t => t.length > 0);
    }

    return [];
  });

  // Individual topic accessors
  const topic1 = computed(() => topics.value[0] || null);
  const topic2 = computed(() => topics.value[1] || null);
  const topic3 = computed(() => topics.value[2] || null);
  const topic4 = computed(() => topics.value[3] || null);
  const topic5 = computed(() => topics.value[4] || null);

  // Topics count
  const topicsCount = computed(() => topics.value.length);

  /**
   * Generate topics with current settings
   * @param {object} overrides Optional parameter overrides
   * @returns {Promise<array>} Generated topics
   */
  const generate = async (overrides = {}) => {
    const params = {
      expertise: overrides.expertise || expertise.value,
      authorityHook: overrides.authorityHook || aiStore.authorityHook,
      customContext: overrides.customContext || customContext.value
    };

    return generator.generate(params);
  };

  /**
   * Get topic by index (1-based for user-friendly access)
   * @param {number} index 1-based index
   * @returns {string|null} Topic at index
   */
  const getTopic = (index) => {
    return topics.value[index - 1] || null;
  };

  /**
   * Get topics as object with numbered keys
   * @returns {object} Topics object {topic_1: '...', topic_2: '...', ...}
   */
  const topicsAsObject = computed(() => {
    const obj = {};
    topics.value.forEach((topic, index) => {
      obj[`topic_${index + 1}`] = topic;
    });
    return obj;
  });

  /**
   * Reset all topics state
   */
  const reset = () => {
    generator.reset();
    expertise.value = '';
    customContext.value = '';
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

    // Topics-specific state
    expertise,
    customContext,

    // Topics-specific computed
    topics,
    topic1,
    topic2,
    topic3,
    topic4,
    topic5,
    topicsCount,
    topicsAsObject,

    // Topics-specific methods
    generate,
    getTopic,
    reset
  };
}

export default useAITopics;
