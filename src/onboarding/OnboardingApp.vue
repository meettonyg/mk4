<template>
    <div class="dashboard-container" :class="{ 'is-loading': store.isLoading }">
        <!-- Sidebar -->
        <div class="sidebar">
            <!-- Rewards Section -->
            <div class="rewards-header">
                <h2>Guestify Rewards</h2>
                <div class="current-points">
                    <span>Your Points:</span>
                    <span class="points-badge">{{ store.totalPoints }}</span>
                </div>
            </div>

            <div class="rewards-list">
                <div
                    v-for="reward in sortedRewards"
                    :key="reward.id"
                    class="reward-item"
                    :class="{
                        'unlocked': reward.unlocked,
                        'locked': !reward.unlocked,
                        'next': isNextReward(reward)
                    }"
                >
                    <div v-if="reward.unlocked" class="task-checkmark"><i class="fas fa-check"></i></div>
                    <div v-else class="task-checkbox"></div>

                    <a
                        v-if="reward.unlocked && reward.download_url"
                        :href="reward.download_url"
                        class="reward-link"
                        target="_blank"
                    >
                        <div class="reward-info">
                            <div class="reward-points">{{ reward.threshold }} Points</div>
                            <div class="reward-title">{{ reward.title }}</div>
                            <div class="reward-description">{{ reward.description }}</div>
                        </div>
                    </a>
                    <div v-else class="reward-info">
                        <div class="reward-points">
                            {{ reward.threshold }} Points
                            <i v-if="!reward.unlocked" class="lock-icon fas fa-lock"></i>
                        </div>
                        <div class="reward-title">{{ reward.title }}</div>
                        <div class="reward-description">{{ reward.description }}</div>
                    </div>
                </div>
            </div>

            <!-- CTA Section -->
            <div class="sidebar-cta">
                <h2>FREE Quick Start Call</h2>
                <p>Get started fast with a FREE walkthrough by a Guestify specialist.</p>
                <a href="/onboarding/walkthrough/" class="cta-button">Schedule a FREE Call</a>
            </div>

            <div class="sidebar-spacer"></div>

            <!-- Bottom Links -->
            <div class="sidebar-bottom">
                <a href="/account/" class="sidebar-link">
                    <span class="fas fa-users"></span> Invite your team
                </a>
                <a href="/account/" class="sidebar-link">
                    <span class="fas fa-clipboard-list"></span> View your plan
                </a>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Loading State -->
            <div v-if="store.isLoading && !store.progress" class="loading-overlay">
                <div class="loading-spinner"></div>
                <p>Loading your progress...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="store.lastError" class="error-banner">
                <p>{{ store.lastError }}</p>
                <button @click="store.fetchProgress(true)" class="cta-button">Retry</button>
            </div>

            <template v-else>
                <!-- Progress Section -->
                <div class="progress-section">
                    <div class="progress-section-header">
                        <h2 class="progress-title">Your Guest Interview progress</h2>
                    </div>

                    <div class="progress-bar-container">
                        <div class="progress-bar" :style="{ width: store.percentage + '%' }"></div>
                    </div>

                    <div class="progress-stats-row">
                        <div class="progress-points">Points: {{ store.totalPoints }}/{{ store.maxPoints }}</div>
                        <div class="progress-percentage">{{ store.percentage }}%</div>
                    </div>

                    <a
                        href="#"
                        class="toggle-details-link"
                        @click.prevent="toggleDetails"
                    >
                        {{ showDetails ? 'Hide Details' : 'Show Details' }}
                    </a>

                    <!-- Progress Breakdown Table -->
                    <div v-show="showDetails" class="progress-container">
                        <div class="progress-header">
                            <h2 class="progress-title">Progress Breakdown</h2>
                        </div>

                        <table class="progress-table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Points</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="task in allTasks" :key="task.id">
                                    <td>{{ task.label }}</td>
                                    <td>{{ task.complete ? task.points : `0/${task.max_points}` }}</td>
                                    <td :class="task.complete ? 'status-complete' : 'status-incomplete'">
                                        <span :class="task.complete ? 'check-icon' : 'x-icon'">
                                            <i :class="task.complete ? 'fas fa-check' : 'fas fa-times'"></i>
                                        </span>
                                        {{ task.complete ? 'Complete' : 'Incomplete' }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table class="progress-table summary-section">
                            <tbody>
                                <tr>
                                    <td>Total Base Points</td>
                                    <td colspan="2">{{ store.totalPoints }}/{{ store.maxPoints }}</td>
                                </tr>
                                <tr>
                                    <td>Percentage</td>
                                    <td colspan="2">{{ store.percentage }}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Task Cards -->
                <div
                    v-for="(group, groupId) in store.tasksByGroup"
                    :key="groupId"
                    class="task-card"
                >
                    <div class="task-card-header">
                        <div class="task-card-icon">
                            <span class="icon-emoji">{{ group.icon }}</span>
                        </div>
                        <h2 class="task-card-title">{{ group.label }}</h2>
                    </div>

                    <div
                        v-for="task in group.tasks"
                        :key="task.id"
                        class="task-item"
                    >
                        <div v-if="task.complete" class="task-checkmark"><i class="fas fa-check"></i></div>
                        <div v-else class="task-checkbox"></div>

                        <div class="task-content">
                            <div class="task-title">
                                <a v-if="task.action_url" :href="task.action_url">
                                    {{ task.label }}
                                </a>
                                <span v-else>{{ task.label }}</span>
                            </div>
                            <div v-if="task.description" class="task-description">
                                {{ task.description }}
                            </div>
                            <div class="task-progress-container">
                                <div class="task-progress-bar">
                                    <div
                                        class="task-progress"
                                        :style="{ width: (task.complete ? 100 : 0) + '%' }"
                                    ></div>
                                </div>
                                <div class="task-time-wrapper">
                                    <div class="task-percentage">{{ task.complete ? 100 : 0 }}%</div>
                                    <div class="task-time">
                                        {{ task.complete ? 'Completed' : getTimeEstimate(task) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOnboardingStore } from './stores/onboarding.js';

// Store
const store = useOnboardingStore();

// Local state
const showDetails = ref(false);

// Toggle details visibility
const toggleDetails = () => {
    showDetails.value = !showDetails.value;
};

// Sorted rewards by threshold
const sortedRewards = computed(() => {
    return [...store.rewards].sort((a, b) => a.threshold - b.threshold);
});

// Check if reward is the next to unlock
const isNextReward = (reward) => {
    if (reward.unlocked) return false;
    const locked = sortedRewards.value.filter((r) => !r.unlocked);
    return locked.length > 0 && locked[0].id === reward.id;
};

// Get all tasks as flat array
const allTasks = computed(() => {
    const tasks = [];
    Object.values(store.tasksByGroup).forEach(group => {
        tasks.push(...group.tasks);
    });
    return tasks;
});

// Get time estimate for incomplete task
const getTimeEstimate = (task) => {
    // Default estimates based on task type
    const estimates = {
        profile: 'About 5 minutes',
        survey: 'About 2 minutes',
        search: 'About 1 minute',
        import: 'About 1 minute',
        pitch: 'About 3 minutes',
    };
    return estimates[task.id] || 'About 1 minute left';
};

// Initialize on mount
onMounted(async () => {
    // Get config from window if available
    if (window.gmkbOnboardingData) {
        store.setConfig({
            apiUrl: window.gmkbOnboardingData.apiUrl || '/wp-json/',
            nonce: window.gmkbOnboardingData.nonce,
        });
    } else if (window.gmkbData) {
        store.setConfig({
            apiUrl: window.gmkbData.restUrl || '/wp-json/',
            nonce: window.gmkbData.restNonce,
        });
    }

    await store.initialize();
});
</script>

<style scoped>
/* Dashboard Container - Sidebar + Main Content Layout */
.dashboard-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f9fafb;
    color: #1e293b;
    line-height: 1.5;
}

.dashboard-container.is-loading {
    opacity: 0.7;
}

/* Sidebar Styles */
.sidebar {
    width: 320px;
    background-color: transparent;
    color: #33475b;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    height: 100vh;
    position: sticky;
    top: 0;
    border-right: 1px solid #e5e7eb;
    padding: 0;
}

/* Rewards Header */
.rewards-header {
    padding: 16px 24px;
    margin-bottom: 12px;
    background-color: #f8fafc;
    border-top: 1px solid #eaf0f6;
    border-bottom: 1px solid #eaf0f6;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.rewards-header h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #33475b;
}

.current-points {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #516f90;
    font-size: 14px;
}

.points-badge {
    background-color: #ff7a59;
    color: white;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 10px;
    font-size: 14px;
}

/* Rewards List */
.rewards-list {
    margin: 0;
    padding: 0 24px;
}

.reward-item {
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 6px;
    border: 1px solid #eaf0f6;
    display: flex;
    align-items: flex-start;
    transition: all 0.2s;
    background-color: #fff;
}

.reward-item:hover {
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
    transform: translateY(-3px);
}

.reward-item.locked {
    opacity: 0.7;
}

.reward-item.next {
    border-color: #ff7a59;
    border-width: 2px;
}

.reward-link {
    text-decoration: none;
    color: inherit;
}

.reward-info {
    flex: 1;
}

.reward-points {
    font-weight: bold;
    color: #ff7a59;
    margin-bottom: 4px;
    font-size: 14px;
}

.lock-icon {
    margin-left: 4px;
    font-style: normal;
}

.reward-title {
    font-weight: 600;
    margin-bottom: 2px;
    font-size: 14px;
    color: #33475b;
}

.reward-description {
    font-size: 12px;
    color: #516f90;
    font-style: italic;
}

/* Task Checkbox/Checkmark */
.task-checkbox {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #cbd5e1;
    margin-right: 12px;
    flex-shrink: 0;
    margin-top: 2px;
}

.task-checkmark {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(16, 185, 129, 0.3);
}

/* Sidebar CTA */
.sidebar-cta {
    padding: 20px 24px;
    margin: 16px 0 0 0;
    background-color: #f8fafc;
    border-top: 1px solid #eaf0f6;
    border-bottom: 1px solid #eaf0f6;
}

.sidebar-cta h2 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #33475b;
}

.sidebar-cta p {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
    color: #516f90;
}

.cta-button {
    display: inline-block;
    background-color: #ff7a59;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    text-align: center;
    width: 100%;
    transition: background-color 0.2s ease;
    border: none;
    cursor: pointer;
}

.cta-button:hover {
    background-color: #ff8f73;
}

.sidebar-spacer {
    flex: 1;
}

.sidebar-bottom {
    padding: 16px 24px;
    margin-top: auto;
    border-top: 1px solid #eaf0f6;
}

.sidebar-link {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #516f90;
    text-decoration: none;
    margin-bottom: 14px;
    transition: color 0.2s ease;
}

.sidebar-link:hover {
    color: #33475b;
}

.sidebar-link span {
    margin-right: 8px;
}

/* Main Content */
.main-content {
    flex: 1;
    padding: 40px;
    max-width: 900px;
    margin: 0 auto;
}

/* Loading */
.loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
}

.loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e2e8f0;
    border-top-color: #14b8a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Error Banner */
.error-banner {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.error-banner p {
    color: #dc2626;
    margin: 0;
}

/* Progress Section */
.progress-section {
    margin-bottom: 35px;
}

.progress-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.progress-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.progress-bar-container {
    height: 20px;
    background-color: #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 8px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #0ea5e9 100%);
    border-radius: 10px;
    transition: width 0.5s ease;
}

.progress-stats-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.progress-points,
.progress-percentage {
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.toggle-details-link {
    display: inline-block;
    font-size: 14px;
    color: #007bff;
    cursor: pointer;
    text-decoration: none;
    margin-bottom: 8px;
}

.toggle-details-link:hover {
    text-decoration: underline;
}

/* Progress Breakdown Table */
.progress-container {
    font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    max-width: 800px;
    margin: 16px auto 0;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 20px;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e5e7eb;
}

.progress-table {
    width: 100%;
    border-collapse: collapse;
}

.progress-table th {
    text-align: left;
    padding: 10px 8px;
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
    border-bottom: 2px solid #e5e7eb;
}

.progress-table th:nth-child(2) {
    text-align: center;
}

.progress-table th:last-child {
    text-align: right;
}

.progress-table tr {
    border-bottom: 1px solid #f0f0f0;
}

.progress-table tr:last-child {
    border-bottom: none;
}

.progress-table td {
    padding: 10px 8px;
    font-size: 14px;
    vertical-align: middle;
}

.progress-table td:first-child {
    width: 40%;
    font-weight: 500;
    color: #4b5563;
}

.progress-table td:nth-child(2) {
    text-align: center;
    width: 20%;
}

.progress-table td:last-child {
    text-align: right;
    width: 40%;
}

.check-icon {
    color: #10b981;
    font-weight: bold;
    margin-right: 4px;
}

.x-icon {
    color: #ef4444;
    font-weight: bold;
    margin-right: 4px;
}

.status-complete {
    color: #10b981;
}

.status-incomplete {
    color: #ef4444;
}

.summary-section {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 2px solid #e5e7eb;
    background-color: #f9fafb;
}

.summary-section td {
    font-weight: 600;
}

/* Task Cards */
.task-card {
    background-color: white;
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    border: 1px solid #f1f5f9;
}

.task-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
}

.task-card-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
}

.task-card-icon {
    margin-right: 18px;
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f1f5f9;
    border-radius: 12px;
}

.icon-emoji {
    font-size: 32px;
}

.task-card-title {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.4;
    margin: 0;
}

/* Task Items */
.task-item {
    display: flex;
    margin-bottom: 24px;
    align-items: flex-start;
    padding-bottom: 24px;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s ease;
}

.task-item:hover {
    background-color: #f8fafc;
    padding-left: 8px;
    padding-right: 8px;
    margin-left: -8px;
    margin-right: -8px;
    border-radius: 8px;
}

.task-item:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
}

.task-content {
    flex: 1;
}

.task-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 10px;
}

.task-title a {
    color: #0066c0;
    text-decoration: none;
    transition: color 0.2s ease;
    font-size: 16px;
    font-weight: 600;
}

.task-title a:hover {
    text-decoration: underline;
    color: #004080;
}

.task-description {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 15px;
    line-height: 1.6;
}

.task-progress-container {
    display: flex;
    align-items: center;
}

.task-progress-bar {
    flex: 1;
    height: 6px;
    background-color: #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    margin-right: 12px;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.task-progress {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #0ea5e9 100%);
    border-radius: 10px;
    transition: width 0.3s ease;
}

.task-time-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 130px;
}

.task-percentage {
    font-size: 12px;
    color: #10b981;
    font-weight: 600;
    margin-bottom: 2px;
}

.task-time {
    font-size: 13px;
    color: #64748b;
    white-space: nowrap;
    text-align: right;
    font-weight: 500;
}

/* Responsive Styles */
@media (max-width: 900px) {
    .dashboard-container {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        height: auto;
        position: relative;
    }

    .main-content {
        width: 100%;
        padding: 20px;
    }

    .sidebar-bottom {
        display: flex;
        justify-content: space-around;
    }

    .sidebar-link {
        margin-bottom: 0;
        margin-right: 20px;
    }
}

@media (max-width: 600px) {
    .task-card {
        padding: 20px;
    }

    .task-card-icon {
        width: 45px;
        height: 45px;
    }

    .task-card-title {
        font-size: 16px;
    }

    .task-title,
    .task-title a {
        font-size: 15px;
    }

    .task-description {
        font-size: 13px;
    }

    .task-time,
    .task-percentage {
        font-size: 12px;
        min-width: 100px;
    }
}
</style>
