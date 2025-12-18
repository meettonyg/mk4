/**
 * Profile Strength Composable (Cialdini Influence Model)
 *
 * Provides reactive access to profile quality scoring based on psychological
 * influence principles. This is SEPARATE from onboarding gamification points.
 *
 * Purpose: "Is my profile good enough to get a 'Yes' from podcast hosts?"
 *
 * The Four Pillars:
 * 1. Identity & Liking (20%)   - "I am a real, relatable human"
 * 2. Authority & Expertise (30%) - "I am an expert you can trust"
 * 3. Reciprocity & Value (30%)   - "I give value to your audience"
 * 4. Validation & Social Proof (20%) - "Others trust me"
 *
 * @package GMKB
 * @since 2.2.0
 */

import { ref, computed, onMounted, watch } from 'vue';

/**
 * Use profile strength scoring
 *
 * @param {Object} options Configuration options
 * @param {number} options.profileId Profile ID to score (required)
 * @param {boolean} options.autoFetch Auto-fetch on mount (default: true)
 * @returns {Object} Profile strength state and methods
 */
export function useProfileStrength(options = {}) {
    const { profileId = null, autoFetch = true } = options;

    // State
    const isLoading = ref(false);
    const error = ref(null);
    const strength = ref(null);
    const schema = ref(null);

    // API configuration
    const apiUrl = ref('/wp-json/');
    const nonce = ref(null);

    // Initialize config from globals
    const initConfig = () => {
        if (window.gmkbData) {
            apiUrl.value = window.gmkbData.restUrl || '/wp-json/';
            nonce.value = window.gmkbData.restNonce;
        } else if (window.wpApiSettings) {
            apiUrl.value = window.wpApiSettings.root || '/wp-json/';
            nonce.value = window.wpApiSettings.nonce;
        }
    };

    // =========================================================================
    // Computed Properties
    // =========================================================================

    /**
     * Total score (0-100)
     */
    const totalScore = computed(() => {
        return strength.value?.total_score ?? 0;
    });

    /**
     * Percentage (same as totalScore since max is 100)
     */
    const percentage = computed(() => {
        return strength.value?.percentage ?? 0;
    });

    /**
     * Profile status object
     */
    const status = computed(() => {
        return strength.value?.status ?? {
            level: 'unknown',
            label: 'Unknown',
            message: '',
            color: 'gray',
        };
    });

    /**
     * Status level string
     */
    const statusLevel = computed(() => status.value.level);

    /**
     * Status label for display
     */
    const statusLabel = computed(() => status.value.label);

    /**
     * Status color for UI
     */
    const statusColor = computed(() => status.value.color);

    /**
     * Is profile publishable (Identity pillar complete)
     */
    const isPublishable = computed(() => {
        return strength.value?.is_publishable ?? false;
    });

    /**
     * Is profile complete (80%+)
     */
    const isComplete = computed(() => {
        return strength.value?.is_complete ?? false;
    });

    /**
     * All pillars data
     */
    const pillars = computed(() => {
        return strength.value?.pillars ?? {};
    });

    /**
     * Identity pillar score
     */
    const identityScore = computed(() => {
        return pillars.value.identity?.score ?? 0;
    });

    /**
     * Authority pillar score
     */
    const authorityScore = computed(() => {
        return pillars.value.authority?.score ?? 0;
    });

    /**
     * Value pillar score
     */
    const valueScore = computed(() => {
        return pillars.value.value?.score ?? 0;
    });

    /**
     * Proof pillar score
     */
    const proofScore = computed(() => {
        return pillars.value.proof?.score ?? 0;
    });

    /**
     * Missing fields across all pillars
     */
    const missingFields = computed(() => {
        return strength.value?.missing_fields ?? [];
    });

    /**
     * Prioritized recommendations (top 5)
     */
    const recommendations = computed(() => {
        return strength.value?.recommendations ?? [];
    });

    /**
     * Critical recommendations (identity pillar)
     */
    const criticalRecommendations = computed(() => {
        return recommendations.value.filter((r) => r.priority === 'critical');
    });

    /**
     * High priority recommendations
     */
    const highPriorityRecommendations = computed(() => {
        return recommendations.value.filter((r) => r.priority === 'high');
    });

    /**
     * Next best action to improve score
     */
    const nextAction = computed(() => {
        return recommendations.value[0] ?? null;
    });

    /**
     * Points available to earn from recommendations
     */
    const pointsAvailable = computed(() => {
        return recommendations.value.reduce((sum, r) => sum + (r.points || 0), 0);
    });

    // =========================================================================
    // API Methods
    // =========================================================================

    /**
     * Make API request with proper headers
     */
    const apiRequest = async (method, endpoint) => {
        const url = `${apiUrl.value.replace(/\/$/, '')}/gmkb/v2${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
        };

        if (nonce.value) {
            headers['X-WP-Nonce'] = nonce.value;
        }

        const response = await fetch(url, {
            method,
            headers,
            credentials: 'same-origin',
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${response.status}`);
        }

        return response.json();
    };

    /**
     * Fetch profile strength score
     */
    const fetchStrength = async (specificProfileId = null) => {
        const pid = specificProfileId || profileId;

        if (!pid) {
            error.value = 'Profile ID is required';
            return null;
        }

        isLoading.value = true;
        error.value = null;

        try {
            const response = await apiRequest('GET', `/profile/${pid}/strength`);

            if (response.success) {
                strength.value = response.data;
                return response.data;
            }

            throw new Error(response.message || 'Failed to fetch profile strength');
        } catch (e) {
            error.value = e.message;
            console.error('Failed to fetch profile strength:', e);
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Fetch the scoring schema
     */
    const fetchSchema = async () => {
        try {
            const response = await apiRequest('GET', '/profile/strength-schema');

            if (response.success) {
                schema.value = response.data;
                return response.data;
            }
        } catch (e) {
            console.error('Failed to fetch strength schema:', e);
        }
        return null;
    };

    /**
     * Refresh strength data
     */
    const refresh = async () => {
        return fetchStrength();
    };

    // =========================================================================
    // Lifecycle
    // =========================================================================

    onMounted(() => {
        initConfig();
        if (autoFetch && profileId) {
            fetchStrength();
        }
    });

    // Watch for profile ID changes
    watch(
        () => profileId,
        (newId) => {
            if (newId && autoFetch) {
                fetchStrength(newId);
            }
        }
    );

    // =========================================================================
    // Return
    // =========================================================================

    return {
        // State
        isLoading,
        error,
        strength,
        schema,

        // Computed - Scores
        totalScore,
        percentage,
        status,
        statusLevel,
        statusLabel,
        statusColor,
        isPublishable,
        isComplete,

        // Computed - Pillars
        pillars,
        identityScore,
        authorityScore,
        valueScore,
        proofScore,

        // Computed - Recommendations
        missingFields,
        recommendations,
        criticalRecommendations,
        highPriorityRecommendations,
        nextAction,
        pointsAvailable,

        // Methods
        fetchStrength,
        fetchSchema,
        refresh,
    };
}

export default useProfileStrength;
