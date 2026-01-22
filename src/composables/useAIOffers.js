/**
 * useAIOffers - Composable for AI offers/packages generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Handles offers generation with multiple variations per tier.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 2.0.0
 * @since 2.2.0
 */

import { ref, computed, reactive } from 'vue';
import { useAIStore } from '../stores/ai';
import { getRestUrl, getToolNonce, getRestNonce, isUserLoggedIn } from '../utils/ai';

/**
 * Package tier labels
 */
export const PACKAGE_TIERS = {
  entry: { label: 'Entry Level', description: 'Perfect for getting started' },
  signature: { label: 'Signature Package', description: 'Most popular choice' },
  premium: { label: 'Premium Package', description: 'Comprehensive solution' }
};

/**
 * Offers generation composable
 *
 * @returns {object} Reactive state and methods for offers generation
 *
 * @example
 * const { generate, offersByTier, isGenerating } = useAIOffers();
 * await generate({ services: ['Coaching', 'Consulting', 'Speaking'] });
 */
export function useAIOffers() {
  const aiStore = useAIStore();

  // Generation state
  const isGenerating = ref(false);
  const error = ref(null);
  const usageRemaining = ref(null);
  const resetTime = ref(null);
  const generatedContent = ref(null);

  // Offers-specific state
  const services = ref([]);
  const customContext = ref('');

  // Selected variation index for each tier
  const selectedVariations = reactive({
    entry: 0,
    signature: 0,
    premium: 0
  });

  /**
   * Parse content into offers by tier structure
   * Handles both new format {entry: [], signature: [], premium: []}
   * and legacy array format [{tier: 'entry', ...}, ...]
   */
  const offersByTier = computed(() => {
    const content = generatedContent.value;
    if (!content) {
      return { entry: [], signature: [], premium: [] };
    }

    // New format: already grouped by tier
    if (content && typeof content === 'object' && !Array.isArray(content)) {
      if (content.entry || content.signature || content.premium) {
        return {
          entry: content.entry || [],
          signature: content.signature || [],
          premium: content.premium || []
        };
      }
    }

    // Legacy format: flat array
    if (Array.isArray(content)) {
      const result = { entry: [], signature: [], premium: [] };
      content.forEach((offer, index) => {
        const tier = offer.tier || (index === 0 ? 'entry' : (index === 1 ? 'signature' : 'premium'));
        const normalizedOffer = {
          id: offer.id || `${tier}_${result[tier].length}`,
          tier,
          variationIndex: result[tier].length,
          name: offer.name || offer.title || `Package ${index + 1}`,
          description: offer.description || '',
          deliverables: offer.deliverables || offer.includes || [],
          idealClient: offer.idealClient || offer.idealFor || '',
          ...offer
        };
        if (result[tier]) {
          result[tier].push(normalizedOffer);
        }
      });
      return result;
    }

    // String format: try to parse (legacy fallback)
    if (typeof content === 'string') {
      const result = { entry: [], signature: [], premium: [] };
      const sections = content.split(/(?=(?:Package|Tier|Option|Level)\s*\d|(?:Basic|Standard|Premium|Enterprise|Entry|Signature))/i);
      const tierNames = ['entry', 'signature', 'premium'];

      sections.forEach((section, index) => {
        section = section.trim();
        if (section.length < 20 || index >= 3) return;

        const tier = tierNames[index] || 'entry';
        const titleMatch = section.match(/^(.+?)[\n:]/m);
        const name = titleMatch ? titleMatch[1].trim() : `Package ${index + 1}`;
        const description = titleMatch ? section.replace(titleMatch[0], '').trim() : section;

        result[tier].push({
          id: `${tier}_0`,
          tier,
          variationIndex: 0,
          name,
          description,
          deliverables: [],
          idealClient: ''
        });
      });

      return result;
    }

    return { entry: [], signature: [], premium: [] };
  });

  /**
   * Flat array of all offers (for backward compatibility)
   */
  const offers = computed(() => {
    const byTier = offersByTier.value;
    const result = [];

    ['entry', 'signature', 'premium'].forEach(tier => {
      const variations = byTier[tier] || [];
      const selectedIndex = selectedVariations[tier];
      const selected = variations[selectedIndex] || variations[0];
      if (selected) {
        result.push(selected);
      }
    });

    return result;
  });

  /**
   * Get variations for a specific tier
   */
  const getVariationsForTier = (tier) => {
    return offersByTier.value[tier] || [];
  };

  /**
   * Get currently selected offer for a tier
   */
  const getSelectedOffer = (tier) => {
    const variations = offersByTier.value[tier] || [];
    const selectedIndex = selectedVariations[tier];
    return variations[selectedIndex] || variations[0] || null;
  };

  /**
   * Select a variation for a tier
   */
  const selectVariation = (tier, index) => {
    if (selectedVariations.hasOwnProperty(tier)) {
      selectedVariations[tier] = index;
    }
  };

  // Individual package accessors (selected variation for each tier)
  const entryPackage = computed(() => getSelectedOffer('entry'));
  const signaturePackage = computed(() => getSelectedOffer('signature'));
  const premiumPackage = computed(() => getSelectedOffer('premium'));

  // Offers count (total variations across all tiers)
  const offersCount = computed(() => {
    const byTier = offersByTier.value;
    return (byTier.entry?.length || 0) +
           (byTier.signature?.length || 0) +
           (byTier.premium?.length || 0);
  });

  // Check if offers were generated
  const hasOffers = computed(() => offersCount.value > 0);

  /**
   * Generate offers with current settings
   * @param {object} overrides Optional parameter overrides
   * @param {string} context Optional context ('builder' or 'public')
   * @returns {Promise<object>} Generated offers grouped by tier
   */
  const generate = async (overrides = {}, context) => {
    // Reset selected variations
    selectedVariations.entry = 0;
    selectedVariations.signature = 0;
    selectedVariations.premium = 0;

    const requestContext = context || (isUserLoggedIn() ? 'builder' : 'public');

    // Extract individual hook fields for validation
    const hookFields = overrides.authorityHookFields || {};

    const params = {
      services: overrides.services || services.value,
      authorityHook: overrides.authorityHook || aiStore.authorityHookSummary,
      customContext: overrides.customContext || customContext.value,
      // Pass individual hook fields for validation
      hookWho: hookFields.who || '',
      hookWhat: hookFields.what || '',
      hookWhen: hookFields.when || '',
      hookHow: hookFields.how || '',
      // Pass additional offer-specific params
      audienceChallenges: overrides.audienceChallenges || '',
      priceRange: overrides.priceRange || '',
      delivery: overrides.delivery || ''
    };

    isGenerating.value = true;
    error.value = null;

    try {
      const restUrl = getRestUrl();
      const nonce = getToolNonce(requestContext);
      const restNonce = getRestNonce();

      // Make API request - always include X-WP-Nonce header (matches useAIGenerator pattern)
      const response = await fetch(`${restUrl}ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': restNonce
        },
        body: JSON.stringify({
          type: 'offers',
          params,
          context: requestContext,
          nonce: requestContext === 'public' ? nonce : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || `Generation failed (${response.status})`;
        error.value = errorMessage;
        throw new Error(errorMessage);
      }

      if (data.success && data.data?.content) {
        generatedContent.value = data.data.content;

        if (data.usage) {
          usageRemaining.value = data.usage.remaining;
          resetTime.value = data.usage.reset_time;
          aiStore.updateUsage(data.usage);
        }

        return data.data.content;
      }

      throw new Error('Unexpected response format from AI service');
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isGenerating.value = false;
    }
  };

  /**
   * Copy generated offers to clipboard
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
      return true;
    } catch (err) {
      console.error('[useAIOffers] Failed to copy:', err);
      return false;
    }
  };

  /**
   * Get offer by tier (returns selected variation)
   * @param {string} tier Tier name (entry, signature, premium)
   * @returns {object|null} Selected offer for tier
   */
  const getOfferByTier = (tier) => {
    return getSelectedOffer(tier);
  };

  /**
   * Get offer by index from flat offers array
   * @param {number} index Index (0-based)
   * @returns {object|null} Offer at index
   */
  const getOfferByIndex = (index) => {
    return offers.value[index] || null;
  };

  /**
   * Add service to list
   * @param {string} service Service to add
   */
  const addService = (service) => {
    if (service && !services.value.includes(service)) {
      services.value.push(service);
    }
  };

  /**
   * Remove service from list
   * @param {string} service Service to remove
   */
  const removeService = (service) => {
    const index = services.value.indexOf(service);
    if (index > -1) {
      services.value.splice(index, 1);
    }
  };

  /**
   * Set services from array
   * @param {array} newServices Services array
   */
  const setServices = (newServices) => {
    services.value = [...newServices];
  };

  /**
   * Reset all offers state
   */
  const reset = () => {
    generatedContent.value = null;
    error.value = null;
    services.value = [];
    customContext.value = '';
    selectedVariations.entry = 0;
    selectedVariations.signature = 0;
    selectedVariations.premium = 0;
  };

  return {
    // Generation state
    isGenerating,
    error,
    usageRemaining,
    resetTime,

    // Offers-specific state
    services,
    customContext,
    selectedVariations,

    // Offers-specific computed
    offersByTier,
    offers,
    hasOffers,
    entryPackage,
    signaturePackage,
    premiumPackage,
    offersCount,

    // Offers-specific methods
    generate,
    copyToClipboard,
    getOfferByTier,
    getOfferByIndex,
    getVariationsForTier,
    getSelectedOffer,
    selectVariation,
    addService,
    removeService,
    setServices,
    reset,

    // Constants
    PACKAGE_TIERS
  };
}

export default useAIOffers;
