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
 * Get topic title (handles both string and object formats)
 * Exported for use in components
 * @param {string|object} topic Topic string or object
 * @returns {string|null} Topic title
 */
export const getTopicTitle = (topic) => {
  if (!topic) return null;
  if (typeof topic === 'string') return topic;
  return topic.title || topic.text || null;
};

/**
 * Get topic category
 * Exported for use in components
 * @param {string|object} topic Topic string or object
 * @returns {string} Topic category or default 'Topic'
 */
export const getTopicCategory = (topic) => {
  if (!topic || typeof topic === 'string') return 'Topic';
  return topic.category || 'Topic';
};

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

  // Parsed topics array - supports both string arrays and topic objects with categories
  const topics = computed(() => {
    const content = generator.generatedContent.value;
    if (!content) return [];

    // If already an array, return as-is (handles both string arrays and object arrays)
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

  // Individual topic accessors (use exported getTopicTitle helper)
  const topic1 = computed(() => getTopicTitle(topics.value[0]));
  const topic2 = computed(() => getTopicTitle(topics.value[1]));
  const topic3 = computed(() => getTopicTitle(topics.value[2]));
  const topic4 = computed(() => getTopicTitle(topics.value[3]));
  const topic5 = computed(() => getTopicTitle(topics.value[4]));
  const topic6 = computed(() => getTopicTitle(topics.value[5]));
  const topic7 = computed(() => getTopicTitle(topics.value[6]));
  const topic8 = computed(() => getTopicTitle(topics.value[7]));
  const topic9 = computed(() => getTopicTitle(topics.value[8]));
  const topic10 = computed(() => getTopicTitle(topics.value[9]));

  // Topics count
  const topicsCount = computed(() => topics.value.length);

  // Has topics check
  const hasTopics = computed(() => topics.value.length > 0);

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
    hasTopics,
    topic1,
    topic2,
    topic3,
    topic4,
    topic5,
    topic6,
    topic7,
    topic8,
    topic9,
    topic10,
    topicsCount,
    topicsAsObject,

    // Topics-specific methods
    generate,
    getTopic,
    reset
  };
}

export default useAITopics;
