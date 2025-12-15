/**
 * useInterviews Composable
 *
 * Provides Vue components with access to the Interviews API.
 * Handles CRUD operations for interviews and profile-interview relationships.
 *
 * @since 3.2.0
 *
 * @example
 * const {
 *   interviews,
 *   isLoading,
 *   fetchInterviews,
 *   createInterview,
 *   updateInterview,
 *   deleteInterview,
 *   getProfileInterviews,
 *   updateProfileInterviews
 * } = useInterviews();
 */

import { ref, computed, reactive } from 'vue';

// API helper
const getApiUrl = () => {
  // Check gmkbData (media kit builder), gmkbProfileData (profile editor), or fallback
  const restUrl = window.gmkbData?.restUrl || window.gmkbProfileData?.apiUrl || '/wp-json/';
  return restUrl.endsWith('/') ? restUrl : restUrl + '/';
};

const getNonce = () => {
  // Check gmkbData (media kit builder), gmkbProfileData (profile editor), or wpApiSettings fallback
  return window.gmkbData?.restNonce || window.gmkbProfileData?.nonce || window.wpApiSettings?.nonce || '';
};

const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}gmkb/v2/${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': getNonce(),
    },
    credentials: 'same-origin',
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export function useInterviews() {
  // State
  const interviews = ref([]);
  const currentInterview = ref(null);
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
    search: '',
  });

  /**
   * Fetch all interviews for current user
   */
  const fetchInterviews = async (options = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({
        status: options.status || filters.status,
        per_page: options.perPage || pagination.perPage,
        page: options.page || pagination.page,
      });

      const result = await apiRequest(`interviews?${params}`);

      if (result.success) {
        interviews.value = result.interviews;
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
   * Fetch single interview by ID
   */
  const fetchInterview = async (interviewId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`interviews/${interviewId}`);

      if (result.success) {
        currentInterview.value = result.interview;
      }

      return result.interview;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Create new interview
   */
  const createInterview = async (interviewData) => {
    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest('interviews', {
        method: 'POST',
        body: interviewData,
      });

      if (result.success) {
        // Add to local list
        interviews.value.unshift(result.interview);
        currentInterview.value = result.interview;
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
   * Update existing interview
   */
  const updateInterview = async (interviewId, interviewData) => {
    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`interviews/${interviewId}`, {
        method: 'PUT',
        body: interviewData,
      });

      if (result.success) {
        // Update in local list
        const index = interviews.value.findIndex(i => i.id === interviewId);
        if (index !== -1) {
          interviews.value[index] = result.interview;
        }
        currentInterview.value = result.interview;
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
   * Delete interview (move to trash)
   */
  const deleteInterview = async (interviewId) => {
    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`interviews/${interviewId}`, {
        method: 'DELETE',
      });

      if (result.success) {
        // Remove from local list
        interviews.value = interviews.value.filter(i => i.id !== interviewId);
        if (currentInterview.value?.id === interviewId) {
          currentInterview.value = null;
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

  // =========================================================================
  // Profile-Interview Relationships
  // =========================================================================

  /**
   * Get featured interviews linked to a profile
   */
  const getProfileInterviews = async (profileId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`profiles/${profileId}/interviews`);
      return result.interviews || [];
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update featured interviews linked to a profile
   */
  const updateProfileInterviews = async (profileId, interviewIds) => {
    isSaving.value = true;
    error.value = null;

    try {
      const result = await apiRequest(`profiles/${profileId}/interviews`, {
        method: 'PUT',
        body: { interview_ids: interviewIds },
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

  const hasInterviews = computed(() => interviews.value.length > 0);

  const publishedInterviews = computed(() =>
    interviews.value.filter(i => i.status === 'publish')
  );

  const draftInterviews = computed(() =>
    interviews.value.filter(i => i.status === 'draft')
  );

  // =========================================================================
  // Filter Methods
  // =========================================================================

  const setFilter = (key, value) => {
    filters[key] = value;
    pagination.page = 1; // Reset to first page
  };

  const clearFilters = () => {
    filters.status = 'any';
    filters.search = '';
    pagination.page = 1;
  };

  const setPage = (page) => {
    pagination.page = page;
  };

  return {
    // State
    interviews,
    currentInterview,
    isLoading,
    isSaving,
    error,
    pagination,
    filters,

    // Computed
    hasInterviews,
    publishedInterviews,
    draftInterviews,

    // CRUD Methods
    fetchInterviews,
    fetchInterview,
    createInterview,
    updateInterview,
    deleteInterview,

    // Profile Relationship Methods
    getProfileInterviews,
    updateProfileInterviews,

    // Filter Methods
    setFilter,
    clearFilters,
    setPage,
  };
}

export default useInterviews;
