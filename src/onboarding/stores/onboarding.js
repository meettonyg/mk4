/**
 * Onboarding Pinia Store
 *
 * Manages state for the onboarding gamification dashboard.
 * Fetches data from /gmkb/v2/onboarding/* endpoints.
 */

import { defineStore } from 'pinia';

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
    }),

    getters: {
        /**
         * Total points earned
         */
        totalPoints: (state) => {
            return state.progress?.points?.earned ?? 0;
        },

        /**
         * Maximum possible points
         */
        maxPoints: (state) => {
            return state.progress?.points?.possible ?? 100;
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
            return Math.max(0, next.threshold - (state.progress?.points?.earned || 0));
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
                    this.rewards = response.data || [];
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
    },
});
