/**
 * useOffers Composable
 *
 * Provides Vue components with access to the Offers API.
 * Handles CRUD operations for offers and profile-offer relationships.
 *
 * @since 3.1.0
 *
 * @example
 * const {
 *   offers,
 *   isLoading,
 *   fetchOffers,
 *   createOffer,
 *   updateOffer,
 *   deleteOffer
 * } = useOffers();
 */

import { ref, computed, reactive } from 'vue';
import { apiRequest } from '../utils/api.js';

export function useOffers() {
  // State
  const offers = ref([]);
  const currentOffer = ref(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref(null);
  const pagination = reactive({
    total: 0,
    pages: 1,
    page: 1,
    perPage: 20,
  });

  // Filters
  const filters = reactive({
    status: 'any',
    type: '',
    search: '',
  });

  /**
   * Fetch all offers for current user
   */
  const fetchOffers = async (options = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({
        status: options.status || filters.status,
        type: options.type || filters.type,
        per_page: options.perPage || pagination.perPage,
        page: options.page || pagination.page,
      });

      const result = await apiRequest(`offers?${params}`);

      if (result.success) {
        offers.value = result.offers;
        pagination.total = result.total;
        pagination.pages = result.pages;
        pagination.page = result.page;
      }

      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch single offer by ID
   */
  const fetchOffer = async (offerId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`offers/${offerId}`);

      if (result.success) {
        currentOffer.value = result.offer;
      }

      return result.offer;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Create new offer
   */
  const createOffer = async (offerData) => {
    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest('offers', {
        method: 'POST',
        body: offerData,
      });

      if (result.success) {
        // Add to local list
        offers.value.unshift(result.offer);
        currentOffer.value = result.offer;
      }

      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Update existing offer
   */
  const updateOffer = async (offerId, offerData) => {
    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`offers/${offerId}`, {
        method: 'PUT',
        body: offerData,
      });

      if (result.success) {
        // Update in local list
        const index = offers.value.findIndex(o => o.id === offerId);
        if (index !== -1) {
          offers.value[index] = result.offer;
        }
        currentOffer.value = result.offer;
      }

      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Delete offer (move to trash)
   */
  const deleteOffer = async (offerId) => {
    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`offers/${offerId}`, {
        method: 'DELETE',
      });

      if (result.success) {
        // Remove from local list
        offers.value = offers.value.filter(o => o.id !== offerId);
        if (currentOffer.value?.id === offerId) {
          currentOffer.value = null;
        }
      }

      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Bulk delete offers (single API request for better performance)
   */
  const bulkDeleteOffers = async (offerIds) => {
    if (!offerIds || offerIds.length === 0) {
      return { success: true, deleted: [], deleted_count: 0 };
    }

    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest('offers/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: offerIds }),
      });

      if (result.success && result.deleted) {
        // Remove deleted offers from local list
        const deletedSet = new Set(result.deleted);
        offers.value = offers.value.filter(o => !deletedSet.has(o.id));

        // Clear current offer if it was deleted
        if (currentOffer.value && deletedSet.has(currentOffer.value.id)) {
          currentOffer.value = null;
        }
      }

      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Duplicate offer
   */
  const duplicateOffer = async (offerId) => {
    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`offers/${offerId}/duplicate`, {
        method: 'POST',
      });

      if (result.success) {
        // Add to local list
        offers.value.unshift(result.offer);
      }

      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Track offer click
   */
  const trackClick = async (offerId) => {
    try {
      return await apiRequest(`offers/${offerId}/track`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to track click:', err);
      // Don't throw - tracking failures shouldn't break UX
    }
  };

  // =========================================================================
  // Profile-Offer Relationships
  // =========================================================================

  /**
   * Get offers linked to a profile
   */
  const getProfileOffers = async (profileId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`profiles/${profileId}/offers`);
      return result.offers || [];
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update all offers linked to a profile
   */
  const updateProfileOffers = async (profileId, offerIds) => {
    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`profiles/${profileId}/offers`, {
        method: 'PUT',
        body: { offer_ids: offerIds },
      });
      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Link single offer to profile
   */
  const linkOfferToProfile = async (profileId, offerId) => {
    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`profiles/${profileId}/offers/${offerId}`, {
        method: 'POST',
      });
      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Unlink offer from profile
   */
  const unlinkOfferFromProfile = async (profileId, offerId) => {
    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`profiles/${profileId}/offers/${offerId}`, {
        method: 'DELETE',
      });
      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  // =========================================================================
  // Computed Properties
  // =========================================================================

  const hasOffers = computed(() => offers.value.length > 0);

  const activeOffers = computed(() =>
    offers.value.filter(o => o.status === 'publish')
  );

  const draftOffers = computed(() =>
    offers.value.filter(o => o.status === 'draft')
  );

  const offersByType = computed(() => {
    const grouped = { gift: [], prize: [], deal: [] };
    offers.value.forEach(offer => {
      if (offer.type && grouped[offer.type]) {
        grouped[offer.type].push(offer);
      }
    });
    return grouped;
  });

  // =========================================================================
  // Filter Methods
  // =========================================================================

  const setFilter = (key, value) => {
    filters[key] = value;
    pagination.page = 1; // Reset to first page
  };

  const clearFilters = () => {
    filters.status = 'any';
    filters.type = '';
    filters.search = '';
    pagination.page = 1;
  };

  const setPage = (page) => {
    pagination.page = page;
  };

  return {
    // State
    offers,
    currentOffer,
    isLoading,
    isSaving,
    error,
    pagination,
    filters,

    // Computed
    hasOffers,
    activeOffers,
    draftOffers,
    offersByType,

    // CRUD Methods
    fetchOffers,
    fetchOffer,
    createOffer,
    updateOffer,
    deleteOffer,
    bulkDeleteOffers,
    duplicateOffer,
    trackClick,

    // Profile Relationship Methods
    getProfileOffers,
    updateProfileOffers,
    linkOfferToProfile,
    unlinkOfferFromProfile,

    // Filter Methods
    setFilter,
    clearFilters,
    setPage,
  };
}

export default useOffers;
