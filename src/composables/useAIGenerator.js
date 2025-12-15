/**
 * useAIGenerator - Core composable for AI content generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Provides the core logic for making AI generation API calls.
 * Works in both integrated (builder) and standalone (free tools) modes.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.2.0
 */

import { ref, computed } from 'vue';
import { useAIStore } from '../stores/ai';

/**
 * Get REST URL from available sources
 * @returns {string} REST API base URL
 */
function getRestUrl() {
  return window.gmkbData?.restUrl
    || window.gmkbProfileData?.apiUrl
    || window.gmkbPublicData?.restUrl
    || '/wp-json/gmkb/v2/';
}

/**
 * Get nonce from available sources
 * @param {string} context 'builder' or 'public'
 * @returns {string} Security nonce
 */
function getNonce(context) {
  if (context === 'builder') {
    return window.gmkbData?.restNonce
      || window.gmkbData?.nonce
      || window.gmkbProfileData?.nonce
      || '';
  }
  return window.gmkbPublicNonce || window.gmkbPublicData?.publicNonce || '';
}

/**
 * Generate cache key from type and params
 * @param {string} type Content type
 * @param {object} params Parameters
 * @returns {string} Cache key
 */
function generateCacheKey(type, params) {
  const paramsStr = JSON.stringify(params, Object.keys(params).sort());
  return `${type}_${btoa(paramsStr).substring(0, 32)}`;
}

/**
 * Core AI Generator composable
 *
 * @param {string} type - Content type (biography, topics, questions, etc.)
 * @returns {object} Reactive state and methods
 *
 * @example
 * const { generate, isGenerating, generatedContent, error } = useAIGenerator('biography');
 * await generate({ name: 'John', tone: 'professional' });
 */
export function useAIGenerator(type) {
  // Get AI store
  const aiStore = useAIStore();

  // Local reactive state
  const isGenerating = ref(false);
  const generatedContent = ref(null);
  const rawContent = ref(null);
  const error = ref(null);
  const usageRemaining = ref(null);
  const resetTime = ref(null);

  /**
   * Determine context (builder or public)
   * @returns {string} 'builder' or 'public'
   */
  const getContext = () => {
    const isBuilderContext = window.gmkbData?.postId
      || window.gmkbData?.post_id
      || window.gmkbProfileData?.postId;
    return isBuilderContext ? 'builder' : 'public';
  };

  /**
   * Validate required fields for the content type
   * @param {object} params Parameters to validate
   * @returns {{valid: boolean, message?: string}}
   */
  const validateFields = (params) => {
    if (!params || typeof params !== 'object') {
      return { valid: false, message: 'Parameters are required' };
    }

    // Type-specific validation
    switch (type) {
      case 'biography':
        if (!params.name && !params.authorityHook) {
          return { valid: false, message: 'Name or authority hook is required for biography generation' };
        }
        break;

      case 'topics':
        if (!params.expertise && !params.authorityHook) {
          return { valid: false, message: 'Expertise or authority hook is required for topics generation' };
        }
        break;

      case 'questions':
        if (!params.topics && !params.authorityHook) {
          return { valid: false, message: 'Topics or authority hook is required for questions generation' };
        }
        break;

      case 'tagline':
        if (!params.authorityHook && !params.name) {
          return { valid: false, message: 'Authority hook or name is required for tagline generation' };
        }
        break;

      case 'guest_intro':
        if (!params.biography && !params.credentials) {
          return { valid: false, message: 'Biography or credentials is required for guest intro generation' };
        }
        break;

      case 'offers':
        if (!params.services && !params.authorityHook) {
          return { valid: false, message: 'Services or authority hook is required for offers generation' };
        }
        break;

      case 'authority_hook':
        if (!params.who && !params.what) {
          return { valid: false, message: 'At least "who" or "what" is required for authority hook generation' };
        }
        break;
    }

    return { valid: true };
  };

  /**
   * Generate content using AI API
   * @param {object} params Generation parameters
   * @param {string} contextOverride Optional context override
   * @returns {Promise<any>} Generated content
   */
  const generate = async (params, contextOverride = null) => {
    const context = contextOverride || getContext();

    // Validate parameters
    const validation = validateFields(params);
    if (!validation.valid) {
      error.value = validation.message;
      throw new Error(validation.message);
    }

    // Check cache first
    const cacheKey = generateCacheKey(type, params);
    const cached = aiStore.getCachedResult(cacheKey);
    if (cached) {
      generatedContent.value = cached;
      console.log(`[useAIGenerator] Returning cached result for ${type}`);
      return cached;
    }

    // Set loading state
    isGenerating.value = true;
    error.value = null;
    aiStore.setGenerating(true, type);

    try {
      const restUrl = getRestUrl();
      const nonce = getNonce(context);

      // Build request body
      const body = {
        type,
        params,
        context,
        nonce: context === 'public' ? nonce : undefined
      };

      console.log(`[useAIGenerator] Generating ${type} content...`, { context, restUrl });

      // Make API request
      const response = await fetch(`${restUrl}ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': context === 'builder' ? nonce : ''
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        const errorMessage = data.message || `Generation failed (${response.status})`;
        error.value = errorMessage;
        aiStore.setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Handle successful response
      if (data.success && data.data) {
        generatedContent.value = data.data.content;
        rawContent.value = data.data.content;

        // Update usage info
        if (data.usage) {
          usageRemaining.value = data.usage.remaining;
          resetTime.value = data.usage.reset_time;
          aiStore.updateUsage(data.usage);
        }

        // Cache the result
        aiStore.cacheResult(cacheKey, data.data.content);

        // Add to history
        aiStore.addToHistory({
          type,
          params,
          content: data.data.content
        });

        console.log(`[useAIGenerator] ${type} generated successfully`);
        return data.data.content;
      }

      // Unexpected response format
      throw new Error('Unexpected response format from AI service');

    } catch (err) {
      console.error(`[useAIGenerator] Error generating ${type}:`, err);
      error.value = err.message;
      aiStore.setError(err.message);
      throw err;

    } finally {
      isGenerating.value = false;
      aiStore.setGenerating(false);
    }
  };

  /**
   * Copy generated content to clipboard
   * @returns {Promise<boolean>} Success status
   */
  const copyToClipboard = async () => {
    if (!generatedContent.value) {
      return false;
    }

    try {
      const textToCopy = typeof generatedContent.value === 'string'
        ? generatedContent.value
        : JSON.stringify(generatedContent.value, null, 2);

      await navigator.clipboard.writeText(textToCopy);
      console.log('[useAIGenerator] Copied to clipboard');
      return true;
    } catch (err) {
      console.error('[useAIGenerator] Failed to copy:', err);
      return false;
    }
  };

  /**
   * Reset state
   */
  const reset = () => {
    generatedContent.value = null;
    rawContent.value = null;
    error.value = null;
  };

  /**
   * Regenerate with same params (from history)
   * @returns {Promise<any>}
   */
  const regenerate = async () => {
    const lastGeneration = aiStore.getHistoryByType(type)[0];
    if (lastGeneration) {
      // Clear cache for this key to force regeneration
      const cacheKey = generateCacheKey(type, lastGeneration.params);
      delete aiStore.cachedResults[cacheKey];

      return generate(lastGeneration.params);
    }
    throw new Error('No previous generation to regenerate');
  };

  // Computed properties
  const hasContent = computed(() => !!generatedContent.value);
  const hasError = computed(() => !!error.value);
  const isRateLimited = computed(() => usageRemaining.value === 0);

  return {
    // State
    isGenerating,
    generatedContent,
    rawContent,
    error,
    usageRemaining,
    resetTime,

    // Computed
    hasContent,
    hasError,
    isRateLimited,

    // Methods
    generate,
    validateFields,
    copyToClipboard,
    reset,
    regenerate,
    getContext
  };
}

export default useAIGenerator;
