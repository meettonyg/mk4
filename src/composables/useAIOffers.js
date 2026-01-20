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
import { useAIGenerator } from './useAIGenerator';
import { useAIStore } from '../stores/ai';

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
  const generator = useAIGenerator('offers');

  // Offers-specific state
  const services = ref([]);
  const customContext = ref('');

  // Parsed offers array
  const offers = computed(() => {
    const content = generator.generatedContent.value;
    if (!content) return [];

    // If already an array of objects, return as-is
    if (Array.isArray(content)) {
      return content.map((offer, index) => ({
        id: `offer_${index + 1}`,
        title: offer.title || `Package ${index + 1}`,
        description: offer.description || offer,
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
          title,
          description,
          tier: index === 0 ? 'entry' : (index === 1 ? 'signature' : 'premium')
        });
      });

      // If no structured offers found, create single offer
      if (parsed.length === 0) {
        parsed.push({
          id: 'offer_1',
          title: 'Service Package',
          description: content,
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

  /**
   * Generate offers with current settings
   * @param {object} overrides Optional parameter overrides
   * @param {string} context Optional context ('builder' or 'public')
   * @returns {Promise<array>} Generated offers
   */
  const generate = async (overrides = {}, context) => {
    // Extract individual hook fields for validation (validation expects hookWho, hookWhat)
    const hookFields = overrides.authorityHookFields || {};

    const params = {
      services: overrides.services || services.value,
      authorityHook: overrides.authorityHook || aiStore.authorityHook,
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

    return generator.generate(params, context);
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
    generator.reset();
    services.value = [];
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

    // Offers-specific state
    services,
    customContext,

    // Offers-specific computed
    offers,
    entryPackage,
    signaturePackage,
    premiumPackage,
    offersCount,

    // Offers-specific methods
    generate,
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
