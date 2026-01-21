/**
 * useAIOffers - Composable for AI offers/packages generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Wraps useAIGenerator with offers-specific logic.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.2.0
 */

import { ref, computed } from 'vue';
import { useAIStore } from '../stores/ai';
import { getRestUrl, getToolNonce, isUserLoggedIn } from '../utils/ai';

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
 * const { generate, offers, isGenerating } = useAIOffers();
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

  // Parsed offers array
  const offers = computed(() => {
    const content = generatedContent.value;
    if (!content) return [];

    // If already an array of objects, return as-is
    if (Array.isArray(content)) {
      return content.map((offer, index) => ({
        id: `offer_${index + 1}`,
        name: offer.name || offer.title || `Package ${index + 1}`,
        description: offer.description || offer.outcome || '',
        deliverables: offer.includes || offer.deliverables || [],
        idealClient: offer.idealFor || offer.idealClient || '',
        tier: index === 0 ? 'entry' : (index === 1 ? 'signature' : 'premium'),
        ...offer
      }));
    }

    // If string, try to parse structured offers
    if (typeof content === 'string') {
      const parsed = [];

      // Try to split by package headers
      const sections = content.split(/(?=(?:Package|Tier|Option|Level)\s*\d|(?:Basic|Standard|Premium|Enterprise|Entry|Signature))/i);

      sections.forEach((section, index) => {
        section = section.trim();
        if (section.length < 20) return;

        // Try to extract title
        const titleMatch = section.match(/^(.+?)[\n:]/m);
        const title = titleMatch ? titleMatch[1].trim() : `Package ${index + 1}`;
        const description = titleMatch ? section.replace(titleMatch[0], '').trim() : section;

        parsed.push({
          id: `offer_${index + 1}`,
          name: title,
          description,
          deliverables: [],
          idealClient: '',
          tier: index === 0 ? 'entry' : (index === 1 ? 'signature' : 'premium')
        });
      });

      // If no structured offers found, create single offer
      if (parsed.length === 0) {
        parsed.push({
          id: 'offer_1',
          name: 'Service Package',
          description: content,
          deliverables: [],
          idealClient: '',
          tier: 'signature'
        });
      }

      return parsed;
    }

    return [];
  });

  // Individual package accessors
  const entryPackage = computed(() =>
    offers.value.find(o => o.tier === 'entry') || offers.value[0] || null
  );

  const signaturePackage = computed(() =>
    offers.value.find(o => o.tier === 'signature') || offers.value[1] || null
  );

  const premiumPackage = computed(() =>
    offers.value.find(o => o.tier === 'premium') || offers.value[2] || null
  );

  // Offers count
  const offersCount = computed(() => offers.value.length);
  const hasOffers = computed(() => offers.value.length > 0);

  /**
   * Generate offers with current settings
   * @param {object} overrides Optional parameter overrides
   * @param {string} context Optional context ('builder' or 'public')
   * @returns {Promise<array>} Generated offers
   */
  const generate = async (overrides = {}, context) => {
    const requestContext = context || (isUserLoggedIn() ? 'builder' : 'public');

    const params = {
      services: overrides.services || services.value,
      authorityHook: overrides.authorityHook || aiStore.authorityHookSummary,
      audience: overrides.audienceChallenges || overrides.audience || '',
      customContext: overrides.customContext || customContext.value,
      priceRange: overrides.priceRange || '',
      delivery: overrides.delivery || '',
      count: overrides.count || 3,
      type: overrides.type || 'packages'
    };

    isGenerating.value = true;
    error.value = null;

    try {
      const restUrl = getRestUrl();
      const nonce = getToolNonce(requestContext);

      const response = await fetch(`${restUrl}ai/tool/generate`, {
        method: 'POST',
        credentials: requestContext === 'builder' ? 'same-origin' : 'omit',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': requestContext === 'builder' ? nonce : ''
        },
        body: JSON.stringify({
          tool: 'offers',
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
   * Get offer by tier
   * @param {string} tier Tier name (entry, signature, premium)
   * @returns {object|null} Offer for tier
   */
  const getOfferByTier = (tier) => {
    return offers.value.find(o => o.tier === tier) || null;
  };

  /**
   * Get offer by index
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
  };

  return {
    // From base generator
    isGenerating,
    error,
    usageRemaining,
    resetTime,

    // Offers-specific state
    services,
    customContext,

    // Offers-specific computed
    offers,
    entryPackage,
    signaturePackage,
    premiumPackage,
    offersCount,
    hasOffers,

    // Offers-specific methods
    generate,
    copyToClipboard,
    getOfferByTier,
    getOfferByIndex,
    addService,
    removeService,
    setServices,
    reset,

    // Constants
    PACKAGE_TIERS
  };
}

export default useAIOffers;
