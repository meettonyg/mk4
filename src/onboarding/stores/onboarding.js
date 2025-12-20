/**
 * Onboarding Pinia Store
 *
 * Manages state for the onboarding gamification dashboard.
 * Fetches data from /gmkb/v2/onboarding/* endpoints.
 *
 * Subscribes to EventBus events for automatic progress refresh:
 * - PITCH_SENT: When a pitch is sent via outreach system (bridges to wp_guestify_messages)
 * - IMPORT_COMPLETED: When podcasts are imported from Prospector (bridges to wp_pit_opportunities)
 * - PROFILE_SAVED: When profile fields are updated
 * - TASK_COMPLETED: When an onboarding task is manually completed
 *
 * @package GMKB
 * @since 3.0.0
 */

import { defineStore } from 'pinia';
import { EventBus, EVENTS } from '../../services/EventBus';

export const useOnboardingStore = defineStore('onboarding', {
    state: () => ({
        // Configuration
        apiUrl: '/wp-json/',
        nonce: null,

        // Progress data
        progress: null,
        tasks: {},
        rewards: [],
        profileStrength: null,

        // Task groups for UI organization
        taskGroups: {},

        // UI state
        isLoading: false,
        isLoadingRewards: false,
        activeGroup: null,

        // Errors
        lastError: null,

        // Cache control
        lastFetched: null,
        cacheTimeout: 60000, // 1 minute

        // Event bus subscriptions (for cleanup)
        _eventSubscriptions: [],
        _isSubscribed: false,

        // Background refresh state
        isRefreshing: false,
        refreshDebounceTimer: null,
    }),

    getters: {
        /**
         * Total points earned
         */
        totalPoints: (state) => {
            return state.progress?.points?.total ?? 0;
        },

        /**
         * Maximum possible points
         */
        maxPoints: (state) => {
            return state.progress?.points?.max ?? 100;
        },

        /**
         * Completion percentage
         */
        percentage: (state) => {
            return state.progress?.points?.percentage ?? 0;
        },

        /**
         * Get tasks organized by group
         */
        tasksByGroup: (state) => {
            const groups = {};

            if (!state.progress?.tasks) return groups;

            Object.entries(state.progress.tasks).forEach(([taskId, task]) => {
                const groupId = task.group || 'other';
                if (!groups[groupId]) {
                    groups[groupId] = {
                        id: groupId,
                        label: state.taskGroups[groupId]?.label || groupId,
                        icon: state.taskGroups[groupId]?.icon || '📋',
                        tasks: [],
                        completedCount: 0,
                        totalPoints: 0,
                        earnedPoints: 0,
                    };
                }

                groups[groupId].tasks.push({
                    id: taskId,
                    ...task,
                });

                groups[groupId].totalPoints += task.max_points || 0;
                if (task.complete) {
                    groups[groupId].completedCount++;
                    groups[groupId].earnedPoints += task.points || 0;
                }
            });

            return groups;
        },

        /**
         * Get completed tasks count
         */
        completedTasksCount: (state) => {
            if (!state.progress?.tasks) return 0;
            return Object.values(state.progress.tasks).filter((t) => t.complete).length;
        },

        /**
         * Get total tasks count
         */
        totalTasksCount: (state) => {
            if (!state.progress?.tasks) return 0;
            return Object.keys(state.progress.tasks).length;
        },

        /**
         * Get unlocked rewards
         */
        unlockedRewards: (state) => {
            return state.rewards.filter((r) => r.unlocked);
        },

        /**
         * Get locked rewards
         */
        lockedRewards: (state) => {
            return state.rewards.filter((r) => !r.unlocked);
        },

        /**
         * Next reward to unlock
         */
        nextReward: (state) => {
            const locked = state.rewards
                .filter((r) => !r.unlocked)
                .sort((a, b) => a.threshold - b.threshold);
            return locked[0] || null;
        },

        /**
         * Points until next reward
         */
        pointsUntilNextReward: (state) => {
            const next = state.rewards
                .filter((r) => !r.unlocked)
                .sort((a, b) => a.threshold - b.threshold)[0];

            if (!next) return 0;
            return Math.max(0, next.threshold - (state.progress?.points?.total || 0));
        },

        /**
         * Check if data is stale and needs refresh
         */
        isStale: (state) => {
            if (!state.lastFetched) return true;
            return Date.now() - state.lastFetched > state.cacheTimeout;
        },

        /**
         * Profile strength data (for Media Kit display)
         */
        profileStrengthPercentage: (state) => {
            return state.profileStrength?.percentage ?? 0;
        },

        /**
         * Profile strength fields status
         */
        profileStrengthFields: (state) => {
            return state.profileStrength?.fields ?? {};
        },
    },

    actions: {
        /**
         * Set configuration
         */
        setConfig({ apiUrl, nonce }) {
            if (apiUrl) this.apiUrl = apiUrl;
            if (nonce) this.nonce = nonce;
        },

        /**
         * Fetch onboarding progress from API
         */
        async fetchProgress(force = false) {
            // Skip if already loading or cache is fresh
            if (this.isLoading) return;
            if (!force && !this.isStale) return;

            this.isLoading = true;
            this.lastError = null;

            try {
                // Fetch progress and schema in parallel
                const [progressRes, tasksRes] = await Promise.all([
                    this.apiRequest('GET', '/onboarding/progress'),
                    this.apiRequest('GET', '/onboarding/tasks'),
                ]);

                if (progressRes.success) {
                    this.progress = progressRes.data;
                }

                if (tasksRes.success) {
                    this.tasks = tasksRes.data.tasks || {};
                    this.taskGroups = tasksRes.data.groups || {};
                }

                this.lastFetched = Date.now();
                console.log('✅ Onboarding progress loaded');
            } catch (error) {
                console.error('Failed to load onboarding progress:', error);
                this.lastError = error.message;
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Fetch rewards from API
         */
        async fetchRewards() {
            if (this.isLoadingRewards) return;

            this.isLoadingRewards = true;

            try {
                const response = await this.apiRequest('GET', '/onboarding/rewards');

                if (response.success) {
                    this.rewards = response.data?.rewards?.list || [];
                }
            } catch (error) {
                console.error('Failed to load rewards:', error);
            } finally {
                this.isLoadingRewards = false;
            }
        },

        /**
         * Fetch profile strength (for Media Kit)
         */
        async fetchProfileStrength(profileId = null) {
            try {
                const endpoint = profileId
                    ? `/onboarding/profile-strength?profile_id=${profileId}`
                    : '/onboarding/profile-strength';

                const response = await this.apiRequest('GET', endpoint);

                if (response.success) {
                    this.profileStrength = response.data;
                }

                return response.data;
            } catch (error) {
                console.error('Failed to load profile strength:', error);
                return null;
            }
        },

        /**
         * Complete a manual task
         */
        async completeTask(taskId) {
            try {
                const response = await this.apiRequest('POST', `/onboarding/complete/${taskId}`);

                if (response.success) {
                    // Update local state
                    if (this.progress?.tasks?.[taskId]) {
                        this.progress.tasks[taskId].complete = true;
                        this.progress.tasks[taskId].points = this.tasks[taskId]?.points || 0;
                    }

                    // Refresh progress to get accurate totals
                    await this.fetchProgress(true);

                    return true;
                }

                return false;
            } catch (error) {
                console.error(`Failed to complete task ${taskId}:`, error);
                this.lastError = error.message;
                return false;
            }
        },

        /**
         * Set active task group
         */
        setActiveGroup(groupId) {
            this.activeGroup = groupId;
        },

        /**
         * Initialize store (fetch all data)
         */
        async initialize() {
            await Promise.all([this.fetchProgress(true), this.fetchRewards()]);
        },

        /**
         * Make API request with proper headers
         */
        async apiRequest(method, endpoint, body = null) {
            const url = `${this.apiUrl.replace(/\/$/, '')}/gmkb/v2${endpoint}`;

            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            };

            // Add nonce if available
            if (this.nonce) {
                options.headers['X-WP-Nonce'] = this.nonce;
            }

            // Add body for POST/PUT
            if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return response.json();
        },

        // =========================================================
        // Event Bus Integration
        // =========================================================

        /**
         * Silent background refresh (no loading indicator)
         * Used when events trigger a refresh
         */
        async refreshProgress() {
            // Debounce rapid refreshes (e.g., multiple events firing at once)
            if (this.refreshDebounceTimer) {
                clearTimeout(this.refreshDebounceTimer);
            }

            return new Promise((resolve) => {
                this.refreshDebounceTimer = setTimeout(async () => {
                    // Skip if already refreshing
                    if (this.isRefreshing) {
                        resolve();
                        return;
                    }

                    this.isRefreshing = true;

                    try {
                        // Fetch fresh data without showing loading state
                        const [progressRes, rewardsRes] = await Promise.all([
                            this.apiRequest('GET', '/onboarding/progress'),
                            this.apiRequest('GET', '/onboarding/rewards'),
                        ]);

                        if (progressRes.success) {
                            const oldPoints = this.progress?.points?.total ?? 0;
                            this.progress = progressRes.data;
                            const newPoints = progressRes.data?.points?.total ?? 0;

                            // Check if a new reward was unlocked
                            if (newPoints > oldPoints) {
                                this.checkForNewRewards(oldPoints, newPoints);
                            }
                        }

                        if (rewardsRes.success) {
                            this.rewards = rewardsRes.data?.rewards?.list || [];
                        }

                        this.lastFetched = Date.now();
                        console.log('🔄 Onboarding progress refreshed (background)');

                        // Emit progress updated event
                        EventBus.emit(EVENTS.PROGRESS_UPDATED, {
                            points: this.progress?.points,
                            percentage: this.percentage,
                        });
                    } catch (error) {
                        console.error('Background refresh failed:', error);
                        // Don't set lastError for background refreshes
                    } finally {
                        this.isRefreshing = false;
                        this.refreshDebounceTimer = null;
                        resolve();
                    }
                }, 500); // 500ms debounce
            });
        },

        /**
         * Check if any new rewards were unlocked
         */
        checkForNewRewards(oldPoints, newPoints) {
            const rewards = this.rewards || [];

            rewards.forEach((reward) => {
                // If reward threshold is between old and new points, it was just unlocked
                if (reward.threshold > oldPoints && reward.threshold <= newPoints) {
                    console.log(`🎉 Reward unlocked: ${reward.title}`);
                    EventBus.emit(EVENTS.REWARD_UNLOCKED, {
                        reward,
                        totalPoints: newPoints,
                    });
                }
            });
        },

        /**
         * Subscribe to relevant events for automatic progress updates
         */
        subscribeToEvents() {
            if (this._isSubscribed) {
                console.log('[Onboarding Store] Already subscribed to events');
                return;
            }

            console.log('[Onboarding Store] Subscribing to events...');

            // Define events that should trigger a progress refresh
            const eventsToWatch = [
                EVENTS.PITCH_SENT,
                EVENTS.IMPORT_COMPLETED,
                EVENTS.PROFILE_SAVED,
                EVENTS.TASK_COMPLETED,
                EVENTS.SEARCH_PERFORMED,
                EVENTS.PROFILE_FIELD_UPDATED,
                EVENTS.INTERVIEW_IMPORTED,
            ];

            // Subscribe to each event
            eventsToWatch.forEach((eventName) => {
                const unsubscribe = EventBus.on(eventName, (data) => {
                    console.log(`[Onboarding Store] Event received: ${eventName}`, data);
                    this.refreshProgress();
                });
                this._eventSubscriptions.push(unsubscribe);
            });

            this._isSubscribed = true;
            console.log(`[Onboarding Store] Subscribed to ${eventsToWatch.length} events`);
        },

        /**
         * Unsubscribe from all events (cleanup)
         */
        unsubscribeFromEvents() {
            if (!this._isSubscribed) return;

            console.log('[Onboarding Store] Unsubscribing from events...');

            // Call all unsubscribe functions
            this._eventSubscriptions.forEach((unsubscribe) => {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            });

            this._eventSubscriptions = [];
            this._isSubscribed = false;

            // Clear any pending debounce timer
            if (this.refreshDebounceTimer) {
                clearTimeout(this.refreshDebounceTimer);
                this.refreshDebounceTimer = null;
            }
        },

        /**
         * Initialize store with event subscriptions
         */
        async initializeWithEvents() {
            // Set up event subscriptions
            this.subscribeToEvents();

            // Fetch initial data
            await this.initialize();
        },

        /**
         * Cleanup store (call when component unmounts)
         */
        cleanup() {
            this.unsubscribeFromEvents();
        },
    },
});
