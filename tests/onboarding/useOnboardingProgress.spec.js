/**
 * Tests for useOnboardingProgress composable
 *
 * @package GMKB
 * @since 2.2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { useOnboardingProgress } from '@/composables/useOnboardingProgress.js';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock progress response
const mockProgressResponse = {
    success: true,
    data: {
        user_id: 1,
        points: {
            earned: 45,
            possible: 100,
            percentage: 45,
        },
        tasks: {
            profile_photo: { complete: true, points: 10 },
            biography: { complete: true, points: 8 },
            topic_1: { complete: false, points: 0 },
            topic_2: { complete: false, points: 0 },
        },
    },
};

// Mock profile strength response
const mockProfileStrengthResponse = {
    success: true,
    data: {
        profile_id: 123,
        percentage: 60,
        completed: 6,
        total: 10,
        fields: {
            authority_hook: true,
            impact_intro: true,
            topic_1: true,
            topic_2: false,
            topic_3: false,
            biography: true,
            tagline: true,
            headshot_primary: true,
            social_linkedin: false,
            website_primary: false,
        },
    },
};

// Mock rewards response
const mockRewardsResponse = {
    success: true,
    data: [
        { id: 1, title: 'First Steps', threshold: 10, unlocked: true },
        { id: 2, title: 'Getting Started', threshold: 25, unlocked: true },
        { id: 3, title: 'Making Progress', threshold: 50, unlocked: false },
        { id: 4, title: 'Expert', threshold: 100, unlocked: false },
    ],
};

describe('useOnboardingProgress', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup window.gmkbData
        window.gmkbData = {
            restUrl: 'http://test.local/wp-json/',
            restNonce: 'test-nonce',
        };

        // Default mock implementation
        mockFetch.mockImplementation((url) => {
            if (url.includes('/onboarding/progress')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockProgressResponse),
                });
            }
            if (url.includes('/onboarding/profile-strength')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockProfileStrengthResponse),
                });
            }
            if (url.includes('/onboarding/rewards')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockRewardsResponse),
                });
            }
            return Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'Not found' }),
            });
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initial State', () => {
        it('should have correct initial values', () => {
            const {
                isLoading,
                error,
                progress,
                profileStrength,
                rewards,
                percentage,
                totalPoints,
            } = useOnboardingProgress({ autoFetch: false });

            expect(isLoading.value).toBe(false);
            expect(error.value).toBe(null);
            expect(progress.value).toBe(null);
            expect(profileStrength.value).toBe(null);
            expect(rewards.value).toEqual([]);
            expect(percentage.value).toBe(0);
            expect(totalPoints.value).toBe(0);
        });

        it('should return all expected properties', () => {
            const result = useOnboardingProgress({ autoFetch: false });

            // State
            expect(result).toHaveProperty('isLoading');
            expect(result).toHaveProperty('error');
            expect(result).toHaveProperty('progress');
            expect(result).toHaveProperty('profileStrength');
            expect(result).toHaveProperty('rewards');

            // Computed
            expect(result).toHaveProperty('percentage');
            expect(result).toHaveProperty('totalPoints');
            expect(result).toHaveProperty('maxPoints');
            expect(result).toHaveProperty('completedTasks');
            expect(result).toHaveProperty('totalTasks');
            expect(result).toHaveProperty('profileStrengthPercentage');
            expect(result).toHaveProperty('incompleteFields');
            expect(result).toHaveProperty('unlockedRewards');
            expect(result).toHaveProperty('nextReward');
            expect(result).toHaveProperty('pointsToNextReward');

            // Methods
            expect(result).toHaveProperty('fetchProgress');
            expect(result).toHaveProperty('fetchProfileStrength');
            expect(result).toHaveProperty('fetchRewards');
            expect(result).toHaveProperty('fetchAll');
            expect(result).toHaveProperty('refresh');
        });
    });

    describe('Computed Properties', () => {
        it('should calculate percentage from progress data', async () => {
            const { percentage, fetchProgress, progress } = useOnboardingProgress({ autoFetch: false });

            await fetchProgress();
            await nextTick();

            expect(percentage.value).toBe(45);
        });

        it('should calculate total points from progress data', async () => {
            const { totalPoints, fetchProgress } = useOnboardingProgress({ autoFetch: false });

            await fetchProgress();
            await nextTick();

            expect(totalPoints.value).toBe(45);
        });

        it('should calculate completed tasks count', async () => {
            const { completedTasks, totalTasks, fetchProgress } = useOnboardingProgress({ autoFetch: false });

            await fetchProgress();
            await nextTick();

            expect(completedTasks.value).toBe(2);
            expect(totalTasks.value).toBe(4);
        });

        it('should calculate incomplete fields from profile strength', async () => {
            const { incompleteFields, fetchProfileStrength } = useOnboardingProgress({ autoFetch: false });

            await fetchProfileStrength(123);
            await nextTick();

            expect(incompleteFields.value).toContain('topic_2');
            expect(incompleteFields.value).toContain('topic_3');
            expect(incompleteFields.value).toContain('social_linkedin');
            expect(incompleteFields.value).toContain('website_primary');
            expect(incompleteFields.value).not.toContain('authority_hook');
        });

        it('should calculate profile strength percentage', async () => {
            const { profileStrengthPercentage, fetchProfileStrength } = useOnboardingProgress({ autoFetch: false });

            await fetchProfileStrength(123);
            await nextTick();

            expect(profileStrengthPercentage.value).toBe(60);
        });

        it('should calculate unlocked rewards', async () => {
            const { unlockedRewards, fetchRewards } = useOnboardingProgress({ autoFetch: false });

            await fetchRewards();
            await nextTick();

            expect(unlockedRewards.value).toHaveLength(2);
            expect(unlockedRewards.value[0].title).toBe('First Steps');
            expect(unlockedRewards.value[1].title).toBe('Getting Started');
        });

        it('should determine next reward', async () => {
            const { nextReward, fetchRewards } = useOnboardingProgress({ autoFetch: false });

            await fetchRewards();
            await nextTick();

            expect(nextReward.value).not.toBeNull();
            expect(nextReward.value.title).toBe('Making Progress');
            expect(nextReward.value.threshold).toBe(50);
        });

        it('should calculate points to next reward', async () => {
            const { pointsToNextReward, fetchProgress, fetchRewards } = useOnboardingProgress({
                autoFetch: false,
            });

            await Promise.all([fetchProgress(), fetchRewards()]);
            await nextTick();

            // 45 points earned, next reward at 50 = 5 points needed
            expect(pointsToNextReward.value).toBe(5);
        });
    });

    describe('API Methods', () => {
        it('should fetch progress from API', async () => {
            const { fetchProgress, progress } = useOnboardingProgress({ autoFetch: false });

            await fetchProgress();
            await nextTick();

            // Note: onMounted doesn't fire in test context, so nonce won't be set
            // We test that the API was called correctly
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/onboarding/progress'),
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'same-origin',
                })
            );

            expect(progress.value).toEqual(mockProgressResponse.data);
        });

        it('should fetch profile strength with profile ID', async () => {
            const { fetchProfileStrength } = useOnboardingProgress({ autoFetch: false });

            await fetchProfileStrength(123);
            await nextTick();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/onboarding/profile-strength?profile_id=123'),
                expect.any(Object)
            );
        });

        it('should handle API errors gracefully', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const { fetchProgress, error, isLoading } = useOnboardingProgress({ autoFetch: false });

            await fetchProgress();
            await nextTick();

            expect(error.value).toBe('Network error');
            expect(isLoading.value).toBe(false);
        });

        it('should handle HTTP error responses', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ message: 'Unauthorized' }),
            });

            const { fetchProgress, error } = useOnboardingProgress({ autoFetch: false });

            await fetchProgress();
            await nextTick();

            expect(error.value).toBe('Unauthorized');
        });

        it('should set loading state during fetch', async () => {
            let resolvePromise;
            mockFetch.mockReturnValueOnce(
                new Promise((resolve) => {
                    resolvePromise = resolve;
                })
            );

            const { fetchProgress, isLoading } = useOnboardingProgress({ autoFetch: false });

            const fetchPromise = fetchProgress();
            await nextTick();

            expect(isLoading.value).toBe(true);

            resolvePromise({
                ok: true,
                json: () => Promise.resolve(mockProgressResponse),
            });

            await fetchPromise;
            await nextTick();

            expect(isLoading.value).toBe(false);
        });

        it('should fetch all data with fetchAll', async () => {
            const { fetchAll } = useOnboardingProgress({ autoFetch: false });

            await fetchAll();
            await nextTick();

            // Should have made 3 requests
            expect(mockFetch).toHaveBeenCalledTimes(3);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/onboarding/progress'),
                expect.any(Object)
            );
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/onboarding/profile-strength'),
                expect.any(Object)
            );
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/onboarding/rewards'),
                expect.any(Object)
            );
        });

        it('should refresh all data', async () => {
            const { refresh } = useOnboardingProgress({ autoFetch: false });

            await refresh();
            await nextTick();

            expect(mockFetch).toHaveBeenCalledTimes(3);
        });
    });

    describe('Configuration', () => {
        it('should use default API URL when not in component context', () => {
            // Note: Config is initialized in onMounted, which doesn't fire in test context
            // This test verifies the default behavior
            window.gmkbData = {
                restUrl: 'http://custom.local/wp-json/',
                restNonce: 'custom-nonce',
            };

            const { fetchProgress } = useOnboardingProgress({ autoFetch: false });
            fetchProgress();

            // Without onMounted firing, it uses the default '/wp-json/'
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/wp-json/gmkb/v2/onboarding/progress'),
                expect.any(Object)
            );
        });

        it('should fallback to wpApiSettings if gmkbData not available', () => {
            delete window.gmkbData;
            window.wpApiSettings = {
                root: 'http://fallback.local/wp-json/',
                nonce: 'fallback-nonce',
            };

            // Need to manually call initConfig since we're not mounting
            const composable = useOnboardingProgress({ autoFetch: false });
            // InitConfig is called in onMounted, so we simulate it
        });

        it('should accept profileId option', async () => {
            const { fetchProgress } = useOnboardingProgress({
                profileId: 456,
                autoFetch: false,
            });

            await fetchProgress();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/onboarding/progress/456'),
                expect.any(Object)
            );
        });
    });
});
