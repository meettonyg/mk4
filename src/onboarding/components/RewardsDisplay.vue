<template>
    <div class="rewards-display">
        <!-- Progress bar showing overall completion -->
        <div class="rewards-progress">
            <div class="progress-track">
                <div
                    class="progress-fill"
                    :style="{ width: `${currentPoints}%` }"
                ></div>
                <!-- Reward markers -->
                <div
                    v-for="reward in sortedRewards"
                    :key="reward.id"
                    class="reward-marker"
                    :class="{ 'is-unlocked': reward.unlocked }"
                    :style="{ left: `${reward.threshold}%` }"
                    :title="`${reward.title} - ${reward.threshold} points`"
                >
                    <span class="marker-icon">{{ reward.icon || '🎁' }}</span>
                </div>
            </div>
            <div class="progress-labels">
                <span>0</span>
                <span>100 points</span>
            </div>
        </div>

        <!-- Rewards grid -->
        <div class="rewards-grid">
            <div
                v-for="reward in sortedRewards"
                :key="reward.id"
                class="reward-card"
                :class="{
                    'is-unlocked': reward.unlocked,
                    'is-next': isNextReward(reward),
                }"
            >
                <div class="reward-icon">{{ reward.icon || '🎁' }}</div>
                <div class="reward-info">
                    <h4 class="reward-title">{{ reward.title }}</h4>
                    <p class="reward-threshold">
                        <template v-if="reward.unlocked">
                            <span class="unlocked-badge">Unlocked!</span>
                        </template>
                        <template v-else>
                            {{ reward.threshold }} points
                        </template>
                    </p>
                </div>
                <div v-if="reward.unlocked && reward.url" class="reward-action">
                    <a :href="reward.url" target="_blank" class="claim-button">
                        Claim
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                </div>
                <div v-else-if="!reward.unlocked" class="reward-lock">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    rewards: {
        type: Array,
        default: () => [],
    },
    currentPoints: {
        type: Number,
        default: 0,
    },
});

const sortedRewards = computed(() => {
    return [...props.rewards].sort((a, b) => a.threshold - b.threshold);
});

const isNextReward = (reward) => {
    if (reward.unlocked) return false;

    const locked = sortedRewards.value.filter((r) => !r.unlocked);
    return locked.length > 0 && locked[0].id === reward.id;
};
</script>

<style scoped>
.rewards-display {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* Progress Bar */
.rewards-progress {
    padding: 20px 0;
}

.progress-track {
    position: relative;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    margin-bottom: 8px;
}

.progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, #14b8a6, #0d9488);
    border-radius: 4px;
    transition: width 0.5s ease-out;
}

.reward-marker {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 32px;
    height: 32px;
    background: white;
    border: 3px solid #e2e8f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    z-index: 1;
}

.reward-marker.is-unlocked {
    border-color: #22c55e;
    background: #f0fdf4;
}

.marker-icon {
    font-size: 16px;
}

.progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #94a3b8;
}

/* Rewards Grid */
.rewards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.reward-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f8fafc;
    border: 2px solid transparent;
    border-radius: 12px;
    transition: all 0.2s;
}

.reward-card.is-unlocked {
    background: #f0fdf4;
    border-color: #22c55e;
}

.reward-card.is-next {
    border-color: #14b8a6;
    background: #f0fdfa;
}

.reward-icon {
    font-size: 32px;
    filter: grayscale(100%);
    opacity: 0.5;
    transition: all 0.3s;
}

.reward-card.is-unlocked .reward-icon {
    filter: none;
    opacity: 1;
}

.reward-card.is-next .reward-icon {
    filter: none;
    opacity: 0.8;
}

.reward-info {
    flex: 1;
    min-width: 0;
}

.reward-title {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 4px 0;
}

.reward-card:not(.is-unlocked) .reward-title {
    color: #64748b;
}

.reward-threshold {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
}

.unlocked-badge {
    color: #22c55e;
    font-weight: 600;
}

.reward-action {
    flex-shrink: 0;
}

.claim-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: #22c55e;
    color: white;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s;
}

.claim-button:hover {
    background: #16a34a;
}

.reward-lock {
    flex-shrink: 0;
    color: #cbd5e1;
}

/* Responsive */
@media (max-width: 480px) {
    .rewards-grid {
        grid-template-columns: 1fr;
    }

    .reward-marker {
        width: 24px;
        height: 24px;
    }

    .marker-icon {
        font-size: 12px;
    }
}
</style>
