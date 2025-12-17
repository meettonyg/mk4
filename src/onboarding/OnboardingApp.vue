<template>
    <div class="onboarding-app" :class="{ 'is-loading': store.isLoading }">
        <!-- Loading State -->
        <div v-if="store.isLoading && !store.progress" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Loading your progress...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="store.lastError" class="error-banner">
            <p>{{ store.lastError }}</p>
            <button @click="store.fetchProgress(true)" class="button secondary-button">
                Retry
            </button>
        </div>

        <!-- Main Content -->
        <template v-else>
            <!-- Header with Progress Ring -->
            <header class="onboarding-header">
                <div class="header-content">
                    <ProgressRing
                        :percentage="store.percentage"
                        :size="120"
                        :strokeWidth="10"
                    />
                    <div class="header-stats">
                        <h1 class="header-title">Your Progress</h1>
                        <div class="stats-row">
                            <span class="stat">
                                <strong>{{ store.totalPoints }}</strong> / {{ store.maxPoints }} points
                            </span>
                            <span class="stat">
                                <strong>{{ store.completedTasksCount }}</strong> / {{ store.totalTasksCount }} tasks
                            </span>
                        </div>
                        <div v-if="store.nextReward" class="next-reward-hint">
                            <span class="reward-icon">{{ store.nextReward.icon || '🎁' }}</span>
                            <span>{{ store.pointsUntilNextReward }} points until <strong>{{ store.nextReward.title }}</strong></span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Task Groups -->
            <section class="task-groups">
                <div
                    v-for="(group, groupId) in store.tasksByGroup"
                    :key="groupId"
                    class="task-group"
                    :class="{ 'is-expanded': expandedGroup === groupId }"
                >
                    <button
                        class="group-header"
                        @click="toggleGroup(groupId)"
                    >
                        <span class="group-icon">{{ group.icon }}</span>
                        <span class="group-label">{{ group.label }}</span>
                        <span class="group-progress">
                            {{ group.completedCount }} / {{ group.tasks.length }}
                        </span>
                        <span class="group-points">
                            {{ group.earnedPoints }} / {{ group.totalPoints }} pts
                        </span>
                        <svg
                            class="chevron"
                            :class="{ 'is-open': expandedGroup === groupId }"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    <div v-show="expandedGroup === groupId" class="group-tasks">
                        <TaskCard
                            v-for="task in group.tasks"
                            :key="task.id"
                            :task="task"
                            @complete="handleTaskComplete"
                        />
                    </div>
                </div>
            </section>

            <!-- Rewards Section -->
            <section class="rewards-section">
                <h2 class="section-title">
                    <span class="section-icon">🎁</span>
                    Rewards
                </h2>
                <RewardsDisplay :rewards="store.rewards" :currentPoints="store.totalPoints" />
            </section>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useOnboardingStore } from './stores/onboarding.js';

// Components
import ProgressRing from './components/ProgressRing.vue';
import TaskCard from './components/TaskCard.vue';
import RewardsDisplay from './components/RewardsDisplay.vue';

// Store
const store = useOnboardingStore();

// Local state
const expandedGroup = ref('foundation'); // Default expanded group

// Toggle group expansion
const toggleGroup = (groupId) => {
    expandedGroup.value = expandedGroup.value === groupId ? null : groupId;
};

// Handle task completion
const handleTaskComplete = async (taskId) => {
    await store.completeTask(taskId);
};

// Initialize on mount
onMounted(async () => {
    // Get config from window if available
    if (window.gmkbData) {
        store.setConfig({
            apiUrl: window.gmkbData.restUrl || '/wp-json/',
            nonce: window.gmkbData.restNonce,
        });
    }

    await store.initialize();
});
</script>

<style scoped>
.onboarding-app {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
}

.onboarding-app.is-loading {
    opacity: 0.7;
    pointer-events: none;
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
    to {
        transform: rotate(360deg);
    }
}

/* Error */
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

/* Header */
.onboarding-header {
    background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 24px;
    color: white;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 32px;
}

.header-stats {
    flex: 1;
}

.header-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 12px 0;
}

.stats-row {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
}

.stat {
    font-size: 16px;
    opacity: 0.9;
}

.stat strong {
    font-weight: 600;
}

.next-reward-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.15);
    padding: 8px 16px;
    border-radius: 8px;
    margin-top: 8px;
}

.reward-icon {
    font-size: 18px;
}

/* Task Groups */
.task-groups {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;
}

.task-group {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
}

.group-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    text-align: left;
    transition: background 0.2s;
}

.group-header:hover {
    background: #f8fafc;
}

.group-icon {
    font-size: 24px;
}

.group-label {
    flex: 1;
    font-weight: 600;
    color: #1e293b;
}

.group-progress {
    font-size: 14px;
    color: #64748b;
}

.group-points {
    font-size: 14px;
    color: #14b8a6;
    font-weight: 600;
    margin-left: 8px;
}

.chevron {
    color: #94a3b8;
    transition: transform 0.2s;
}

.chevron.is-open {
    transform: rotate(180deg);
}

.group-tasks {
    padding: 0 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Rewards Section */
.rewards-section {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 20px 0;
}

.section-icon {
    font-size: 24px;
}

/* Responsive */
@media (max-width: 640px) {
    .onboarding-app {
        padding: 16px;
    }

    .header-content {
        flex-direction: column;
        text-align: center;
    }

    .stats-row {
        justify-content: center;
    }

    .next-reward-hint {
        justify-content: center;
    }

    .group-header {
        flex-wrap: wrap;
    }

    .group-progress,
    .group-points {
        width: 100%;
        margin-top: 8px;
    }
}
</style>
