/**
 * useAIGuestIntro - Composable for AI guest introduction generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Wraps useAIGenerator with guest intro-specific logic.
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
 * Guest intro generation composable
 *
 * @returns {object} Reactive state and methods for guest intro generation
 *
 * @example
 * const { generate, introduction, isGenerating } = useAIGuestIntro();
 * await generate({ name: 'John Smith', biography: '...', credentials: ['PhD', 'Author'] });
 */
export function useAIGuestIntro() {
  const aiStore = useAIStore();
  const generator = useAIGenerator('guest_intro');

  // Guest intro-specific state
  const name = ref('');
  const biography = ref('');
  const tagline = ref('');

  // Credentials come from AI store's impact intro
  const credentials = computed(() => aiStore.impactIntro.credentials);

  // The generated introduction
  const introduction = computed(() => {
    const content = generator.generatedContent.value;
    if (!content) return null;

    // Return as string
    if (typeof content === 'string') {
      return content;
    }

    // If object with intro key
    if (typeof content === 'object' && content.intro) {
      return content.intro;
    }

    return String(content);
  });

  // Word count of introduction
  const wordCount = computed(() => {
    if (!introduction.value) return 0;
    return introduction.value.split(/\s+/).filter(w => w.length > 0).length;
  });

  // Character count
  const charCount = computed(() => {
    if (!introduction.value) return 0;
    return introduction.value.length;
  });

  /**
   * Generate guest intro with current settings
   * @param {object} overrides Optional parameter overrides
   * @returns {Promise<string>} Generated introduction
   */
  const generate = async (overrides = {}) => {
    const params = {
      name: overrides.name || name.value,
      biography: overrides.biography || biography.value,
      credentials: overrides.credentials || credentials.value,
      tagline: overrides.tagline || tagline.value,
      authorityHook: overrides.authorityHook || aiStore.authorityHook
    };

    return generator.generate(params);
  };

  /**
   * Set name
   * @param {string} newName Name value
   */
  const setName = (newName) => {
    name.value = newName;
  };

  /**
   * Set biography
   * @param {string} newBio Biography text
   */
  const setBiography = (newBio) => {
    biography.value = newBio;
  };

  /**
   * Set tagline
   * @param {string} newTagline Tagline text
   */
  const setTagline = (newTagline) => {
    tagline.value = newTagline;
  };

  /**
   * Load data from podsData
   * @param {object} podsData Pods data object
   */
  const loadFromPodsData = (podsData) => {
    if (!podsData) return;

    // Load name
    const firstName = podsData.first_name || '';
    const lastName = podsData.last_name || '';
    if (firstName || lastName) {
      name.value = `${firstName} ${lastName}`.trim();
    }

    // Load biography
    if (podsData.biography) {
      biography.value = podsData.biography;
    }

    // Load tagline
    if (podsData.tagline) {
      tagline.value = podsData.tagline;
    }
  };

  /**
   * Reset all guest intro state
   */
  const reset = () => {
    generator.reset();
    name.value = '';
    biography.value = '';
    tagline.value = '';
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

    // Guest intro-specific state
    name,
    biography,
    tagline,
    credentials,

    // Guest intro-specific computed
    introduction,
    wordCount,
    charCount,

    // Guest intro-specific methods
    generate,
    setName,
    setBiography,
    setTagline,
    loadFromPodsData,
    reset
  };
}

export default useAIGuestIntro;
