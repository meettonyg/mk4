/**
 * Onboarding Progress Composable
 *
 * Provides reactive access to onboarding progress data including:
 * - Profile strength (for Media Kit display)
 * - Overall onboarding progress
 * - Task completion status
 * - Reward unlock status
 *
 * @package GMKB
 * @since 2.2.0
 */

import { ref, computed, onMounted, watch } from 'vue';

/**
 * Use onboarding progress data
 *
 * @param {Object} options Configuration options
 * @param {number} options.profileId Specific profile ID (optional)
 * @param {boolean} options.autoFetch Auto-fetch on mount (default: true)
 * @returns {Object} Onboarding progress state and methods
 */
export function useOnboardingProgress(options = {}) {
    const { profileId = null, autoFetch = true } = options;

    // State
    const isLoading = ref(false);
    const error = ref(null);
    const progress = ref(null);
    const profileStrength = ref(null);
    const tasks = ref({});
    const rewards = ref([]);

    // API configuration
    const apiUrl = ref('/wp-json/');
    const nonce = ref(null);

    // Initialize config from globals
    const initConfig = () => {
        if (window.gmkbProfileData) {
            // Profile app context
            apiUrl.value = window.gmkbProfileData.apiUrl || '/wp-json/';
            nonce.value = window.gmkbProfileData.nonce;
        } else if (window.gmkbData) {
            // Onboarding/general context
            apiUrl.value = window.gmkbData.restUrl || '/wp-json/';
            nonce.value = window.gmkbData.restNonce;
        } else if (window.wpApiSettings) {
            // WordPress default
            apiUrl.value = window.wpApiSettings.root || '/wp-json/';
            nonce.value = window.wpApiSettings.nonce;
        }
    };

    // Computed properties
    const percentage = computed(() => {
        return progress.value?.points?.percentage ?? 0;
    });

    const totalPoints = computed(() => {
        return progress.value?.points?.earned ?? progress.value?.points?.total ?? 0;
    });

    const maxPoints = computed(() => {
        return progress.value?.points?.possible ?? progress.value?.points?.max ?? 100;
    });

    const completedTasks = computed(() => {
        if (!progress.value?.tasks) return 0;
        return Object.values(progress.value.tasks).filter((t) => t.complete).length;
    });

    const totalTasks = computed(() => {
        if (!progress.value?.tasks) return 0;
        return Object.keys(progress.value.tasks).length;
    });

    const profileStrengthPercentage = computed(() => {
        // API returns { strength: number, max: 100 }
        return profileStrength.value?.strength ?? profileStrength.value?.percentage ?? 0;
    });

    const incompleteFields = computed(() => {
        if (!profileStrength.value?.fields) return [];
        return Object.entries(profileStrength.value.fields)
            .filter(([, complete]) => !complete)
            .map(([field]) => field);
    });

    const unlockedRewards = computed(() => {
        return rewards.value.filter((r) => r.unlocked);
    });

    const nextReward = computed(() => {
        const locked = rewards.value.filter((r) => !r.unlocked).sort((a, b) => a.threshold - b.threshold);
        return locked[0] || null;
    });

    const pointsToNextReward = computed(() => {
        if (!nextReward.value) return 0;
        return Math.max(0, nextReward.value.threshold - totalPoints.value);
    });

    // API request helper
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

    // Fetch overall progress
    const fetchProgress = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const endpoint = profileId ? `/onboarding/progress/${profileId}` : '/onboarding/progress';
            const response = await apiRequest('GET', endpoint);

            if (response.success) {
                progress.value = response.data;
            }
        } catch (e) {
            error.value = e.message;
            console.error('Failed to fetch onboarding progress:', e);
        } finally {
            isLoading.value = false;
        }
    };

    // Fetch profile strength (for Media Kit display)
    const fetchProfileStrength = async (specificProfileId = null) => {
        try {
            const pid = specificProfileId || profileId;
            const endpoint = pid
                ? `/onboarding/profile-strength?profile_id=${pid}`
                : '/onboarding/profile-strength';

            const response = await apiRequest('GET', endpoint);

            if (response.success) {
                profileStrength.value = response.data;
            }
        } catch (e) {
            console.error('Failed to fetch profile strength:', e);
        }
    };

    // Fetch rewards
    const fetchRewards = async () => {
        try {
            const response = await apiRequest('GET', '/onboarding/rewards');

            if (response.success) {
                // API returns { rewards: [...], total_points: ... }
                rewards.value = response.data?.rewards?.list || response.data?.rewards || [];
            }
        } catch (e) {
            console.error('Failed to fetch rewards:', e);
        }
    };

    // Fetch all data
    const fetchAll = async () => {
        await Promise.all([fetchProgress(), fetchProfileStrength(), fetchRewards()]);
    };

    // Refresh after profile update
    const refresh = async () => {
        await fetchAll();
    };

    // Initialize on mount
    onMounted(() => {
        initConfig();
        if (autoFetch) {
            fetchAll();
        }
    });

    // Watch for profile ID changes
    watch(
        () => profileId,
        (newId) => {
            if (newId && autoFetch) {
                fetchProfileStrength(newId);
            }
        }
    );

    return {
        // State
        isLoading,
        error,
        progress,
        profileStrength,
        tasks,
        rewards,

        // Computed
        percentage,
        totalPoints,
        maxPoints,
        completedTasks,
        totalTasks,
        profileStrengthPercentage,
        incompleteFields,
        unlockedRewards,
        nextReward,
        pointsToNextReward,

        // Methods
        fetchProgress,
        fetchProfileStrength,
        fetchRewards,
        fetchAll,
        refresh,
    };
}

export default useOnboardingProgress;
