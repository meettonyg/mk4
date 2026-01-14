/**
 * useAIQuestions - Composable for AI questions generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Wraps useAIGenerator with questions-specific logic.
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
 * Question categories for organization
 */
export const QUESTION_CATEGORIES = {
  introductory: { start: 1, end: 5, label: 'Introductory Questions' },
  expertise: { start: 6, end: 15, label: 'Expertise Questions' },
  stories: { start: 16, end: 20, label: 'Story-Based Questions' },
  actionable: { start: 21, end: 25, label: 'Actionable Questions' }
};

/**
 * Questions generation composable
 *
 * @returns {object} Reactive state and methods for questions generation
 *
 * @example
 * const { generate, questions, isGenerating } = useAIQuestions();
 * await generate({ topics: ['Leadership', 'Innovation'] });
 */
export function useAIQuestions() {
  const aiStore = useAIStore();
  const generator = useAIGenerator('questions');

  // Questions-specific state
  const selectedTopics = ref([]);
  const customContext = ref('');

  // Parsed questions array
  const questions = computed(() => {
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
      return content.split('\n').map(q => q.trim()).filter(q => q.length > 0);
    }

    return [];
  });

  // Questions count
  const questionsCount = computed(() => questions.value.length);

  // Has questions check (alias for hasContent but specific to questions)
  const hasQuestions = computed(() => questions.value.length > 0);

  // Questions by category
  const introductoryQuestions = computed(() =>
    questions.value.slice(QUESTION_CATEGORIES.introductory.start - 1, QUESTION_CATEGORIES.introductory.end)
  );

  const expertiseQuestions = computed(() =>
    questions.value.slice(QUESTION_CATEGORIES.expertise.start - 1, QUESTION_CATEGORIES.expertise.end)
  );

  const storyQuestions = computed(() =>
    questions.value.slice(QUESTION_CATEGORIES.stories.start - 1, QUESTION_CATEGORIES.stories.end)
  );

  const actionableQuestions = computed(() =>
    questions.value.slice(QUESTION_CATEGORIES.actionable.start - 1, QUESTION_CATEGORIES.actionable.end)
  );

  /**
   * Generate questions with current settings
   * @param {object} overrides Optional parameter overrides
   * @returns {Promise<array>} Generated questions
   */
  const generate = async (overrides = {}) => {
    const params = {
      topics: overrides.topics || selectedTopics.value,
      authorityHook: overrides.authorityHook || aiStore.authorityHook,
      customContext: overrides.customContext || customContext.value
    };

    return generator.generate(params);
  };

  /**
   * Get question by index (1-based for user-friendly access)
   * @param {number} index 1-based index
   * @returns {string|null} Question at index
   */
  const getQuestion = (index) => {
    return questions.value[index - 1] || null;
  };

  /**
   * Get questions as object with numbered keys
   * @returns {object} Questions object {question_1: '...', question_2: '...', ...}
   */
  const questionsAsObject = computed(() => {
    const obj = {};
    questions.value.forEach((question, index) => {
      obj[`question_${index + 1}`] = question;
    });
    return obj;
  });

  /**
   * Get questions by category
   * @param {string} category Category key
   * @returns {array} Questions in category
   */
  const getQuestionsByCategory = (category) => {
    const cat = QUESTION_CATEGORIES[category];
    if (!cat) return [];
    return questions.value.slice(cat.start - 1, cat.end);
  };

  /**
   * Add topic to selection
   * @param {string} topic Topic to add
   */
  const addTopic = (topic) => {
    if (topic && !selectedTopics.value.includes(topic)) {
      selectedTopics.value.push(topic);
    }
  };

  /**
   * Remove topic from selection
   * @param {string} topic Topic to remove
   */
  const removeTopic = (topic) => {
    const index = selectedTopics.value.indexOf(topic);
    if (index > -1) {
      selectedTopics.value.splice(index, 1);
    }
  };

  /**
   * Set topics from array
   * @param {array} topics Topics array
   */
  const setTopics = (topics) => {
    selectedTopics.value = [...topics];
  };

  /**
   * Reset all questions state
   */
  const reset = () => {
    generator.reset();
    selectedTopics.value = [];
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

    // Questions-specific state
    selectedTopics,
    customContext,

    // Questions-specific computed
    questions,
    questionsCount,
    hasQuestions,
    introductoryQuestions,
    expertiseQuestions,
    storyQuestions,
    actionableQuestions,
    questionsAsObject,

    // Questions-specific methods
    generate,
    getQuestion,
    getQuestionsByCategory,
    addTopic,
    removeTopic,
    setTopics,
    reset,

    // Constants
    QUESTION_CATEGORIES
  };
}

export default useAIQuestions;
