/**
 * useAIConversionOffers - Composable for AI conversion offers generation
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Wraps useAIGenerator with conversion-offers-specific logic for
 * tiered funnel generation (Lead Magnet, Core Offer, High-Ticket).
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.3.0
 */

import { ref, computed } from 'vue';
import { useAIGenerator } from './useAIGenerator';

/**
 * Minimum character length for a valid offer section when parsing text
 */
const MIN_OFFER_SECTION_LENGTH = 30;

/**
 * Offer tier configurations
 */
export const OFFER_TIERS = {
  'lead-magnet': {
    label: 'Lead Magnet',
    priceHint: 'Free',
    complexity: 'Simple freebie or low-barrier entry',
    promptContext: 'Create a compelling free lead magnet that captures immediate interest and provides quick wins. Focus on solving one specific pain point with immediate value.'
  },
  'core-offer': {
    label: 'Core Offer',
    priceHint: '$500-$2,500',
    complexity: 'Main service or product offering',
    promptContext: 'Create a core service offering that delivers your signature transformation. This should be your main revenue driver with clear outcomes and defined deliverables.'
  },
  'high-ticket': {
    label: 'High-Ticket',
    priceHint: '$5,000+',
    complexity: 'Premium consulting or VIP experience',
    promptContext: 'Create a premium, high-touch offering with exclusive access and personalized attention. Include VIP elements, comprehensive support, and transformational outcomes.'
  }
};

/**
 * Business type contexts for generation
 */
export const BUSINESS_CONTEXTS = {
  consulting: 'strategic advisory and implementation support',
  coaching: 'personal development and accountability partnerships',
  training: 'skill development and educational programs',
  service: 'done-for-you professional services',
  product: 'digital products and resources'
};

/**
 * Conversion offers generation composable
 *
 * @returns {object} Reactive state and methods for conversion offers generation
 *
 * @example
 * const { generate, generateForTier, tierOffers, isGenerating } = useAIConversionOffers();
 * await generateForTier({
 *   tier: 'lead-magnet',
 *   authorityHook: 'I help SaaS founders increase revenue by 40%',
 *   businessType: 'consulting'
 * });
 */
export function useAIConversionOffers() {
  const generator = useAIGenerator('conversion-offers');

  // Local state
  const tierOffers = ref({
    'lead-magnet': [],
    'core-offer': [],
    'high-ticket': []
  });
  const lockedOffers = ref({});
  const activeTier = ref('core-offer');

  // Parsed offers for current generation
  const offers = computed(() => {
    return normalizeOffers(generator.generatedContent.value);
  });

  /**
   * Parse text-based offer responses
   * @param {string} text Raw text content
   * @param {object} options Parsing options
   * @returns {array} Parsed offers
   */
  function parseTextOffers(text, options = {}) {
    const { idPrefix = 'offer', tier = null } = options;
    const offers = [];
    const sections = text.split(/(?=(?:Option|Offer|Package|Tier)\s*\d|(?:\d+\.\s))/i);

    sections.forEach((section, index) => {
      section = section.trim();
      if (section.length < MIN_OFFER_SECTION_LENGTH) return;

      // Try to extract title
      const titleMatch = section.match(/^(?:Option|Offer|Package|Tier)?\s*\d*[.:\s]*(.+?)[\n:]/im);
      const title = titleMatch ? titleMatch[1].trim() : `Offer ${index + 1}`;

      // Extract description (remaining text after title)
      const description = titleMatch
        ? section.replace(titleMatch[0], '').trim()
        : section;

      // Try to extract investment
      const investmentMatch = description.match(/\$[\d,]+(?:\.\d{2})?(?:\s*[-\/]\s*\$[\d,]+)?|\bfree\b/i);
      const investment = investmentMatch ? investmentMatch[0] : '';

      const offer = {
        id: `${idPrefix}_${index + 1}`,
        title,
        description: description.replace(investmentMatch?.[0] || '', '').trim(),
        investment
      };

      if (tier) {
        offer.tier = tier;
      }

      offers.push(offer);
    });

    return offers;
  }

  /**
   * Normalize offer content from any format (array, JSON string, or text)
   * @param {any} content Raw content to normalize
   * @param {object} options Normalization options
   * @returns {array} Normalized offers
   */
  function normalizeOffers(content, options = {}) {
    const {
      idPrefix = 'offer',
      tier = null,
      defaultLabel = 'Offer',
      defaultInvestment = '',
      defaultDelivery = ''
    } = options;

    if (!content) return [];

    // If already an array, normalize each offer
    if (Array.isArray(content)) {
      return content.map((offer, index) => {
        const normalized = {
          id: `${idPrefix}_${index + 1}`,
          title: offer.title || offer.name || `${defaultLabel} ${index + 1}`,
          description: offer.description || offer.value || '',
          investment: offer.investment || offer.price || defaultInvestment,
          duration: offer.duration || offer.timeline || '',
          delivery: offer.delivery || offer.format || defaultDelivery,
          includes: offer.includes || [],
          ...offer
        };
        // Override id after spread to ensure correct format
        normalized.id = `${idPrefix}_${index + 1}`;
        if (tier) {
          normalized.tier = tier;
        }
        return normalized;
      });
    }

    // If string, try to parse as JSON first
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          return normalizeOffers(parsed, options);
        }
      } catch {
        // Not JSON, parse as text
        return parseTextOffers(content, { idPrefix, tier });
      }
    }

    return [];
  }

  /**
   * Generate offers for all tiers at once
   * @param {object} params Generation parameters
   * @returns {Promise<object>} Generated offers by tier
   */
  const generate = async (params = {}) => {
    const results = {};

    for (const tier of Object.keys(OFFER_TIERS)) {
      try {
        const tierResult = await generateForTier({
          ...params,
          tier,
          tierConfig: OFFER_TIERS[tier]
        });
        results[tier] = tierResult;
        tierOffers.value[tier] = tierResult;
      } catch (err) {
        console.error(`Error generating ${tier}:`, err);
        results[tier] = [];
      }
    }

    return results;
  };

  /**
   * Generate offers for a specific tier
   * @param {object} options Generation options
   * @returns {Promise<array>} Generated offers for the tier
   */
  const generateForTier = async (options = {}) => {
    const {
      tier = 'core-offer',
      tierConfig = OFFER_TIERS[tier],
      authorityHook = '',
      businessType = 'consulting',
      priceRange = 'midrange',
      deliveryMethod = 'online',
      audienceChallenges = '',
      count = 3,
      refinement = '',
      previousOffers = []
    } = options;

    // Build context for generation
    const businessContext = BUSINESS_CONTEXTS[businessType] || businessType;

    const params = {
      tier,
      tierLabel: tierConfig.label,
      tierContext: tierConfig.promptContext,
      priceHint: tierConfig.priceHint,
      authorityHook,
      businessType,
      businessContext,
      priceRange,
      deliveryMethod,
      audienceChallenges,
      count,
      refinement,
      previousOffers: previousOffers.length > 0
        ? previousOffers.map(o => o.title).join(', ')
        : ''
    };

    try {
      const result = await generator.generate(params);

      // Parse and normalize the offers using shared helper
      const parsedOffers = normalizeOffers(result, {
        idPrefix: tier,
        tier,
        defaultLabel: tierConfig.label,
        defaultInvestment: tierConfig.priceHint,
        defaultDelivery: deliveryMethod
      });

      // Update tier offers
      tierOffers.value[tier] = parsedOffers;
      activeTier.value = tier;

      return parsedOffers;
    } catch (err) {
      console.error(`Error generating ${tier} offers:`, err);
      throw err;
    }
  };

  /**
   * Lock an offer for a specific tier
   * @param {string} tier Tier identifier
   * @param {object} offer Offer to lock
   */
  const lockOffer = (tier, offer) => {
    lockedOffers.value[tier] = { ...offer };
    tierOffers.value[tier] = [];
  };

  /**
   * Unlock a tier's offer
   * @param {string} tier Tier identifier
   */
  const unlockOffer = (tier) => {
    delete lockedOffers.value[tier];
  };

  /**
   * Get offer by tier
   * @param {string} tier Tier identifier
   * @returns {object|null} Locked offer or first generated offer for tier
   */
  const getOfferByTier = (tier) => {
    return lockedOffers.value[tier] || tierOffers.value[tier]?.[0] || null;
  };

  /**
   * Check if a tier has offers
   * @param {string} tier Tier identifier
   * @returns {boolean}
   */
  const tierHasOffers = (tier) => {
    return !!(lockedOffers.value[tier] || tierOffers.value[tier]?.length);
  };

  /**
   * Get all locked offers
   * @returns {object} Locked offers by tier
   */
  const getLockedOffers = () => {
    return { ...lockedOffers.value };
  };

  /**
   * Get funnel summary for saving
   * @returns {object} Summary of locked offers
   */
  const getFunnelSummary = () => {
    return {
      leadMagnet: lockedOffers.value['lead-magnet'] || null,
      coreOffer: lockedOffers.value['core-offer'] || null,
      highTicket: lockedOffers.value['high-ticket'] || null,
      isComplete: Object.keys(lockedOffers.value).length === 3
    };
  };

  /**
   * Reset all state
   */
  const reset = () => {
    generator.reset?.();
    tierOffers.value = {
      'lead-magnet': [],
      'core-offer': [],
      'high-ticket': []
    };
    lockedOffers.value = {};
    activeTier.value = 'core-offer';
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

    // Conversion offers state
    tierOffers,
    lockedOffers,
    activeTier,
    offers,

    // Methods
    generate,
    generateForTier,
    lockOffer,
    unlockOffer,
    getOfferByTier,
    tierHasOffers,
    getLockedOffers,
    getFunnelSummary,
    reset,

    // Constants
    OFFER_TIERS,
    BUSINESS_CONTEXTS
  };
}

export default useAIConversionOffers;
