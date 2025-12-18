/**
 * Tests for useProfileStrength composable (Cialdini Model)
 *
 * @package GMKB
 * @since 2.2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { useProfileStrength } from '@/composables/useProfileStrength.js';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock strength response
const mockStrengthResponse = {
    success: true,
    data: {
        profile_id: 123,
        total_score: 65,
        percentage: 65,
        status: {
            level: 'good',
            label: 'Good',
            message: 'A few additions will make you stand out',
            color: 'yellow',
        },
        pillars: {
            identity: {
                id: 'identity',
                label: 'Identity & Liking',
                score: 20,
                max: 20,
                percentage: 100,
                fields: { first_name: true, guest_title: true, headshot_primary: true, biography: true },
                missing: [],
            },
            authority: {
                id: 'authority',
                label: 'Authority & Expertise',
                score: 15,
                max: 30,
                percentage: 50,
                fields: { authority_hook: true, impact_intro: false },
                missing: [
                    {
                        field: 'impact_intro',
                        label: 'Impact Intro',
                        points: 15,
                        pillar: 'authority',
                    },
                ],
            },
            value: {
                id: 'value',
                label: 'Reciprocity & Value',
                score: 20,
                max: 30,
                percentage: 67,
                fields: { topics: 3, questions: 3, offer: false },
                missing: [{ field: 'offer', label: 'Audience Offer', points: 5, pillar: 'value' }],
            },
            proof: {
                id: 'proof',
                label: 'Validation & Social Proof',
                score: 10,
                max: 20,
                percentage: 50,
                fields: { social: 2, website: true, logos: false },
                missing: [{ field: 'logos', label: 'Featured In Logos', points: 5, pillar: 'proof' }],
            },
        },
        missing_fields: [
            { field: 'impact_intro', label: 'Impact Intro', points: 15, pillar: 'authority' },
            { field: 'offer', label: 'Audience Offer', points: 5, pillar: 'value' },
            { field: 'logos', label: 'Featured In Logos', points: 5, pillar: 'proof' },
        ],
        recommendations: [
            { priority: 'high', field: 'impact_intro', label: 'Impact Intro', points: 15, message: 'Summarize your expertise' },
            { priority: 'medium', field: 'offer', label: 'Audience Offer', points: 5, message: 'Add a free resource' },
            { priority: 'low', field: 'logos', label: 'Featured Logos', points: 5, message: 'Add logos of publications' },
        ],
        is_complete: false,
        is_publishable: true,
    },
};

// Mock schema response
const mockSchemaResponse = {
    success: true,
    data: {
        pillars: [
            { id: 'identity', label: 'Identity & Liking', max_points: 20 },
            { id: 'authority', label: 'Authority & Expertise', max_points: 30 },
            { id: 'value', label: 'Reciprocity & Value', max_points: 30 },
            { id: 'proof', label: 'Validation & Social Proof', max_points: 20 },
        ],
        total_points: 100,
        thresholds: {
            draft: 0,
            needs_work: 1,
            good: 50,
            strong: 70,
            excellent: 90,
        },
    },
};

describe('useProfileStrength', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup window.gmkbData
        window.gmkbData = {
            restUrl: 'http://test.local/wp-json/',
            restNonce: 'test-nonce',
        };

        // Default mock implementation
        mockFetch.mockImplementation((url) => {
            if (url.includes('/profile/') && url.includes('/strength')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockStrengthResponse),
                });
            }
            if (url.includes('/profile/strength-schema')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockSchemaResponse),
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
            const { isLoading, error, strength, totalScore, percentage } = useProfileStrength({
                profileId: 123,
                autoFetch: false,
            });

            expect(isLoading.value).toBe(false);
            expect(error.value).toBe(null);
            expect(strength.value).toBe(null);
            expect(totalScore.value).toBe(0);
            expect(percentage.value).toBe(0);
        });

        it('should return all expected properties', () => {
            const result = useProfileStrength({ profileId: 123, autoFetch: false });

            // State
            expect(result).toHaveProperty('isLoading');
            expect(result).toHaveProperty('error');
            expect(result).toHaveProperty('strength');
            expect(result).toHaveProperty('schema');

            // Computed - Scores
            expect(result).toHaveProperty('totalScore');
            expect(result).toHaveProperty('percentage');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('statusLevel');
            expect(result).toHaveProperty('statusLabel');
            expect(result).toHaveProperty('statusColor');
            expect(result).toHaveProperty('isPublishable');
            expect(result).toHaveProperty('isComplete');

            // Computed - Pillars
            expect(result).toHaveProperty('pillars');
            expect(result).toHaveProperty('identityScore');
            expect(result).toHaveProperty('authorityScore');
            expect(result).toHaveProperty('valueScore');
            expect(result).toHaveProperty('proofScore');

            // Computed - Recommendations
            expect(result).toHaveProperty('missingFields');
            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('nextAction');
            expect(result).toHaveProperty('pointsAvailable');

            // Methods
            expect(result).toHaveProperty('fetchStrength');
            expect(result).toHaveProperty('fetchSchema');
            expect(result).toHaveProperty('refresh');
        });
    });

    describe('Computed Properties', () => {
        it('should calculate total score from strength data', async () => {
            const { totalScore, fetchStrength } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength();
            await nextTick();

            expect(totalScore.value).toBe(65);
        });

        it('should calculate percentage from strength data', async () => {
            const { percentage, fetchStrength } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength();
            await nextTick();

            expect(percentage.value).toBe(65);
        });

        it('should extract status information', async () => {
            const { status, statusLevel, statusLabel, statusColor, fetchStrength } = useProfileStrength({
                profileId: 123,
                autoFetch: false,
            });

            await fetchStrength();
            await nextTick();

            expect(status.value.level).toBe('good');
            expect(statusLevel.value).toBe('good');
            expect(statusLabel.value).toBe('Good');
            expect(statusColor.value).toBe('yellow');
        });

        it('should determine isPublishable correctly', async () => {
            const { isPublishable, fetchStrength } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength();
            await nextTick();

            expect(isPublishable.value).toBe(true);
        });

        it('should determine isComplete correctly', async () => {
            const { isComplete, fetchStrength } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength();
            await nextTick();

            expect(isComplete.value).toBe(false);
        });

        it('should extract pillar scores', async () => {
            const { identityScore, authorityScore, valueScore, proofScore, fetchStrength } = useProfileStrength({
                profileId: 123,
                autoFetch: false,
            });

            await fetchStrength();
            await nextTick();

            expect(identityScore.value).toBe(20);
            expect(authorityScore.value).toBe(15);
            expect(valueScore.value).toBe(20);
            expect(proofScore.value).toBe(10);
        });

        it('should get recommendations', async () => {
            const { recommendations, fetchStrength } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength();
            await nextTick();

            expect(recommendations.value).toHaveLength(3);
            expect(recommendations.value[0].priority).toBe('high');
        });

        it('should get next action', async () => {
            const { nextAction, fetchStrength } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength();
            await nextTick();

            expect(nextAction.value).not.toBeNull();
            expect(nextAction.value.field).toBe('impact_intro');
            expect(nextAction.value.points).toBe(15);
        });

        it('should calculate points available', async () => {
            const { pointsAvailable, fetchStrength } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength();
            await nextTick();

            // 15 + 5 + 5 = 25
            expect(pointsAvailable.value).toBe(25);
        });

        it('should filter critical recommendations', async () => {
            // Mock response with critical recommendation
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        success: true,
                        data: {
                            ...mockStrengthResponse.data,
                            recommendations: [
                                { priority: 'critical', field: 'first_name', points: 5, message: 'Add name' },
                                { priority: 'high', field: 'impact_intro', points: 15, message: 'Add intro' },
                            ],
                        },
                    }),
            });

            const { criticalRecommendations, fetchStrength } = useProfileStrength({
                profileId: 123,
                autoFetch: false,
            });

            await fetchStrength();
            await nextTick();

            expect(criticalRecommendations.value).toHaveLength(1);
            expect(criticalRecommendations.value[0].priority).toBe('critical');
        });
    });

    describe('API Methods', () => {
        it('should fetch strength from API', async () => {
            const { fetchStrength, strength } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength();
            await nextTick();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/profile/123/strength'),
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'same-origin',
                })
            );

            expect(strength.value).toEqual(mockStrengthResponse.data);
        });

        it('should fetch with specific profile ID', async () => {
            const { fetchStrength } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength(456);

            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/profile/456/strength'), expect.any(Object));
        });

        it('should handle missing profile ID', async () => {
            const { fetchStrength, error } = useProfileStrength({ autoFetch: false });

            await fetchStrength();
            await nextTick();

            expect(error.value).toBe('Profile ID is required');
        });

        it('should handle API errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const { fetchStrength, error, isLoading } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength();
            await nextTick();

            expect(error.value).toBe('Network error');
            expect(isLoading.value).toBe(false);
        });

        it('should set loading state during fetch', async () => {
            let resolvePromise;
            mockFetch.mockReturnValueOnce(
                new Promise((resolve) => {
                    resolvePromise = resolve;
                })
            );

            const { fetchStrength, isLoading } = useProfileStrength({ profileId: 123, autoFetch: false });

            const fetchPromise = fetchStrength();
            await nextTick();

            expect(isLoading.value).toBe(true);

            resolvePromise({
                ok: true,
                json: () => Promise.resolve(mockStrengthResponse),
            });

            await fetchPromise;
            await nextTick();

            expect(isLoading.value).toBe(false);
        });

        it('should fetch schema', async () => {
            // Reset mock for this specific test
            mockFetch.mockReset();
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSchemaResponse),
            });

            const { fetchSchema, schema } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchSchema();
            await nextTick();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/profile/strength-schema'),
                expect.any(Object)
            );

            expect(schema.value).toEqual(mockSchemaResponse.data);
        });

        it('should refresh data', async () => {
            const { refresh } = useProfileStrength({ profileId: 123, autoFetch: false });

            await refresh();
            await nextTick();

            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/profile/123/strength'), expect.any(Object));
        });
    });

    describe('Pillar Calculations', () => {
        it('should have all four pillars', async () => {
            const { pillars, fetchStrength } = useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength();
            await nextTick();

            expect(pillars.value).toHaveProperty('identity');
            expect(pillars.value).toHaveProperty('authority');
            expect(pillars.value).toHaveProperty('value');
            expect(pillars.value).toHaveProperty('proof');
        });

        it('should sum pillar scores to total', async () => {
            const { totalScore, identityScore, authorityScore, valueScore, proofScore, fetchStrength } =
                useProfileStrength({ profileId: 123, autoFetch: false });

            await fetchStrength();
            await nextTick();

            const sum = identityScore.value + authorityScore.value + valueScore.value + proofScore.value;
            expect(sum).toBe(totalScore.value);
        });
    });
});
