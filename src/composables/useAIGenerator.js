/**
 * useAIGenerator - Core composable for AI content generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Provides the core logic for making AI generation API calls.
 * Works in both integrated (builder) and standalone (free tools) modes.
 *
 * Validation rules are now defined in each tool's meta.json for tool independence.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.2.0
 */

import { ref, computed } from 'vue';
import { useAIStore } from '../stores/ai';
import { toolModules } from '../../tools/index.js';

/**
 * Get REST URL from available sources
 * Ensures trailing slash for proper URL concatenation
 * @returns {string} REST API base URL
 */
function getRestUrl() {
  const url = window.gmkbData?.restUrl
    || window.gmkbProfileData?.apiUrl
    || window.gmkbStandaloneTools?.apiBase
    || window.gmkbPublicData?.restUrl
    || '/wp-json/gmkb/v2/';

  // Ensure trailing slash for proper URL concatenation
  return url.endsWith('/') ? url : url + '/';
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
      || window.gmkbStandaloneTools?.restNonce
      || '';
  }
  return window.gmkbPublicNonce
    || window.gmkbPublicData?.publicNonce
    || window.gmkbStandaloneTools?.nonce
    || '';
}

/**
 * Check if user is logged in from available sources
 * @returns {boolean}
 */
function isUserLoggedIn() {
  return !!(
    window.gmkbData?.postId
    || window.gmkbData?.post_id
    || window.gmkbProfileData?.postId
    || window.gmkbStandaloneTools?.isLoggedIn
  );
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
 * Get validation configuration from a tool's meta.json
 * @param {string} type - The API type (e.g., 'biography', 'topics')
 * @returns {Object|null} Validation config or null if not found
 */
function getValidationConfig(type) {
  // Find the tool module by apiType
  for (const [, module] of Object.entries(toolModules)) {
    if (module.meta?.apiType === type && module.meta?.validation) {
      return module.meta.validation;
    }
  }
  return null;
}

/**
 * Apply validation based on declarative config from tool meta
 * @param {Object} config - Validation configuration from meta.json
 * @param {Object} params - Parameters to validate
 * @returns {{valid: boolean, message?: string}}
 */
function applyValidation(config, params) {
  if (!config) {
    // No validation config, assume valid
    return { valid: true };
  }

  // Check 'anyOf' validation - at least one of these fields must have a value
  if (config.anyOf && Array.isArray(config.anyOf)) {
    const hasAnyValue = config.anyOf.some(field => {
      const value = params[field];
      return value !== undefined && value !== null && value !== '';
    });

    if (!hasAnyValue) {
      return {
        valid: false,
        message: config.errorMessage || `At least one of these fields is required: ${config.anyOf.join(', ')}`
      };
    }
  }

  // Check 'required' validation - all of these fields must have values
  if (config.required && Array.isArray(config.required)) {
    const missingFields = config.required.filter(field => {
      const value = params[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return {
        valid: false,
        message: config.errorMessage || `Required fields missing: ${missingFields.join(', ')}`
      };
    }
  }

  return { valid: true };
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
   * For logged-in users, use 'builder' context to leverage authenticated REST API
   * @returns {string} 'builder' or 'public'
   */
  const getContext = () => {
    return isUserLoggedIn() ? 'builder' : 'public';
  };

  /**
   * Validate required fields for the content type
   * Uses validation config from tool's meta.json for tool independence
   * @param {object} params Parameters to validate
   * @returns {{valid: boolean, message?: string}}
   */
  const validateFields = (params) => {
    if (!params || typeof params !== 'object') {
      return { valid: false, message: 'Parameters are required' };
    }

    // Get validation config from tool meta
    const validationConfig = getValidationConfig(type);

    // Apply validation using tool-defined rules
    return applyValidation(validationConfig, params);
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
