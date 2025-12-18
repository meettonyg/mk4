/**
 * Tests for Onboarding Pinia Store
 *
 * @package GMKB
 * @since 2.2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useOnboardingStore } from '@/onboarding/stores/onboarding.js';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock responses
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
            profile_photo: { complete: true, points: 10, max_points: 10, group: 'foundation' },
            biography: { complete: true, points: 8, max_points: 8, group: 'foundation' },
            topic_1: { complete: false, points: 0, max_points: 6, group: 'messaging' },
            linkedin: { complete: false, points: 0, max_points: 5, group: 'outreach' },
        },
    },
};

const mockTasksResponse = {
    success: true,
    data: {
        tasks: {
            profile_photo: { label: 'Add Profile Photo', points: 10, group: 'foundation' },
            biography: { label: 'Write Biography', points: 8, group: 'foundation' },
            topic_1: { label: 'Add Topic 1', points: 6, group: 'messaging' },
            linkedin: { label: 'Add LinkedIn', points: 5, group: 'outreach' },
        },
        groups: {
            foundation: { label: 'Foundation', icon: '🏗️' },
            messaging: { label: 'Messaging', icon: '💬' },
            outreach: { label: 'Outreach', icon: '🌐' },
        },
    },
};

const mockRewardsResponse = {
    success: true,
    data: [
        { id: 1, title: 'First Steps', threshold: 10, unlocked: true },
        { id: 2, title: 'Getting Started', threshold: 25, unlocked: true },
        { id: 3, title: 'Making Progress', threshold: 50, unlocked: false },
        { id: 4, title: 'Expert', threshold: 100, unlocked: false },
    ],
};

const mockProfileStrengthResponse = {
    success: true,
    data: {
        profile_id: 123,
        percentage: 60,
        fields: {
            authority_hook: true,
            biography: true,
            topic_1: false,
        },
    },
};

describe('useOnboardingStore', () => {
    beforeEach(() => {
        // Create fresh pinia for each test
        setActivePinia(createPinia());
        vi.clearAllMocks();

        // Default mock implementation
        mockFetch.mockImplementation((url) => {
            if (url.includes('/onboarding/progress')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockProgressResponse),
                });
            }
            if (url.includes('/onboarding/tasks')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTasksResponse),
                });
            }
            if (url.includes('/onboarding/rewards')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockRewardsResponse),
                });
            }
            if (url.includes('/onboarding/profile-strength')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockProfileStrengthResponse),
                });
            }
            if (url.includes('/onboarding/complete/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true }),
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
        it('should have correct default values', () => {
            const store = useOnboardingStore();

            expect(store.apiUrl).toBe('/wp-json/');
            expect(store.nonce).toBe(null);
            expect(store.progress).toBe(null);
            expect(store.tasks).toEqual({});
            expect(store.rewards).toEqual([]);
            expect(store.isLoading).toBe(false);
            expect(store.lastError).toBe(null);
        });
    });

    describe('Getters', () => {
        it('should return total points from progress', async () => {
            const store = useOnboardingStore();
            await store.fetchProgress(true);

            expect(store.totalPoints).toBe(45);
        });

        it('should return max points from progress', async () => {
            const store = useOnboardingStore();
            await store.fetchProgress(true);

            expect(store.maxPoints).toBe(100);
        });

        it('should return percentage from progress', async () => {
            const store = useOnboardingStore();
            await store.fetchProgress(true);

            expect(store.percentage).toBe(45);
        });

        it('should return 0 when no progress data', () => {
            const store = useOnboardingStore();

            expect(store.totalPoints).toBe(0);
            expect(store.maxPoints).toBe(100);
            expect(store.percentage).toBe(0);
        });

        it('should count completed tasks', async () => {
            const store = useOnboardingStore();
            await store.fetchProgress(true);

            expect(store.completedTasksCount).toBe(2);
        });

        it('should count total tasks', async () => {
            const store = useOnboardingStore();
            await store.fetchProgress(true);

            expect(store.totalTasksCount).toBe(4);
        });

        it('should organize tasks by group', async () => {
            const store = useOnboardingStore();
            await store.fetchProgress(true);

            const groups = store.tasksByGroup;

            expect(groups).toHaveProperty('foundation');
            expect(groups).toHaveProperty('messaging');
            expect(groups).toHaveProperty('outreach');

            expect(groups.foundation.tasks).toHaveLength(2);
            expect(groups.foundation.completedCount).toBe(2);
            expect(groups.messaging.tasks).toHaveLength(1);
            expect(groups.messaging.completedCount).toBe(0);
        });

        it('should get unlocked rewards', async () => {
            const store = useOnboardingStore();
            await store.fetchRewards();

            expect(store.unlockedRewards).toHaveLength(2);
            expect(store.unlockedRewards[0].title).toBe('First Steps');
        });

        it('should get locked rewards', async () => {
            const store = useOnboardingStore();
            await store.fetchRewards();

            expect(store.lockedRewards).toHaveLength(2);
            expect(store.lockedRewards[0].title).toBe('Making Progress');
        });

        it('should get next reward', async () => {
            const store = useOnboardingStore();
            await store.fetchRewards();

            expect(store.nextReward).not.toBeNull();
            expect(store.nextReward.title).toBe('Making Progress');
            expect(store.nextReward.threshold).toBe(50);
        });

        it('should calculate points until next reward', async () => {
            const store = useOnboardingStore();
            await store.fetchProgress(true);
            await store.fetchRewards();

            // 45 points earned, next reward at 50 = 5 points needed
            expect(store.pointsUntilNextReward).toBe(5);
        });

        it('should check if data is stale', () => {
            const store = useOnboardingStore();

            // No lastFetched = stale
            expect(store.isStale).toBe(true);

            // Set recent fetch time
            store.lastFetched = Date.now();
            expect(store.isStale).toBe(false);

            // Set old fetch time
            store.lastFetched = Date.now() - 120000; // 2 minutes ago
            expect(store.isStale).toBe(true);
        });

        it('should get profile strength percentage', async () => {
            const store = useOnboardingStore();
            await store.fetchProfileStrength(123);

            expect(store.profileStrengthPercentage).toBe(60);
        });

        it('should get profile strength fields', async () => {
            const store = useOnboardingStore();
            await store.fetchProfileStrength(123);

            const fields = store.profileStrengthFields;
            expect(fields.authority_hook).toBe(true);
            expect(fields.biography).toBe(true);
            expect(fields.topic_1).toBe(false);
        });
    });

    describe('Actions', () => {
        it('should set configuration', () => {
            const store = useOnboardingStore();

            store.setConfig({
                apiUrl: 'http://custom.local/wp-json/',
                nonce: 'test-nonce',
            });

            expect(store.apiUrl).toBe('http://custom.local/wp-json/');
            expect(store.nonce).toBe('test-nonce');
        });

        it('should fetch progress', async () => {
            const store = useOnboardingStore();

            await store.fetchProgress(true);

            expect(mockFetch).toHaveBeenCalled();
            expect(store.progress).toEqual(mockProgressResponse.data);
            expect(store.lastFetched).not.toBe(null);
        });

        it('should skip fetch if not stale and not forced', async () => {
            const store = useOnboardingStore();

            // First fetch
            await store.fetchProgress(true);
            const firstFetchTime = store.lastFetched;

            // Clear mock to check if it's called again
            mockFetch.mockClear();

            // Second fetch without force
            await store.fetchProgress(false);

            // Should not have fetched again
            expect(mockFetch).not.toHaveBeenCalled();
            expect(store.lastFetched).toBe(firstFetchTime);
        });

        it('should skip fetch if already loading', async () => {
            const store = useOnboardingStore();
            store.isLoading = true;

            await store.fetchProgress(true);

            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should handle fetch error', async () => {
            const store = useOnboardingStore();
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await store.fetchProgress(true);

            expect(store.lastError).toBe('Network error');
            expect(store.isLoading).toBe(false);
        });

        it('should fetch rewards', async () => {
            const store = useOnboardingStore();

            await store.fetchRewards();

            expect(store.rewards).toHaveLength(4);
            expect(store.rewards[0].title).toBe('First Steps');
        });

        it('should fetch profile strength with profile ID', async () => {
            const store = useOnboardingStore();

            await store.fetchProfileStrength(123);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/onboarding/profile-strength?profile_id=123'),
                expect.any(Object)
            );
            expect(store.profileStrength.percentage).toBe(60);
        });

        it('should complete a task', async () => {
            const store = useOnboardingStore();
            await store.fetchProgress(true);

            const result = await store.completeTask('topic_1');

            expect(result).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/onboarding/complete/topic_1'),
                expect.objectContaining({ method: 'POST' })
            );
        });

        it('should set active group', () => {
            const store = useOnboardingStore();

            store.setActiveGroup('foundation');

            expect(store.activeGroup).toBe('foundation');
        });

        it('should initialize store with all data', async () => {
            const store = useOnboardingStore();

            await store.initialize();

            expect(store.progress).not.toBe(null);
            expect(store.rewards).toHaveLength(4);
        });
    });

    describe('API Request', () => {
        it('should include nonce in headers when set', async () => {
            const store = useOnboardingStore();
            store.setConfig({ nonce: 'test-nonce-123' });

            await store.fetchProgress(true);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-WP-Nonce': 'test-nonce-123',
                    }),
                })
            );
        });

        it('should construct correct API URL', async () => {
            const store = useOnboardingStore();
            store.setConfig({ apiUrl: 'http://example.com/wp-json/' });

            await store.fetchProgress(true);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('http://example.com/wp-json/gmkb/v2/onboarding/progress'),
                expect.any(Object)
            );
        });

        it('should handle HTTP errors', async () => {
            const store = useOnboardingStore();
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ message: 'Unauthorized' }),
            });

            await store.fetchProgress(true);

            expect(store.lastError).toBe('Unauthorized');
        });
    });

    describe('Cache Control', () => {
        it('should set lastFetched after successful fetch', async () => {
            const store = useOnboardingStore();

            expect(store.lastFetched).toBe(null);

            await store.fetchProgress(true);

            expect(store.lastFetched).not.toBe(null);
            expect(typeof store.lastFetched).toBe('number');
        });

        it('should respect cache timeout', async () => {
            const store = useOnboardingStore();
            store.cacheTimeout = 1000; // 1 second

            await store.fetchProgress(true);
            mockFetch.mockClear();

            // Immediately after, should not fetch
            await store.fetchProgress(false);
            expect(mockFetch).not.toHaveBeenCalled();

            // Simulate time passing
            store.lastFetched = Date.now() - 2000; // 2 seconds ago

            // Now should fetch
            await store.fetchProgress(false);
            expect(mockFetch).toHaveBeenCalled();
        });
    });
});
