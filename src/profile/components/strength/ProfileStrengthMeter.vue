<template>
    <div class="profile-strength-meter" :class="[`status-${statusLevel}`]">
        <!-- Header -->
        <div class="strength-header">
            <h3 class="strength-title">Profile Strength</h3>
            <div class="strength-badge" :class="statusColor">
                {{ statusLabel }}
            </div>
        </div>

        <!-- Overall Score Circle -->
        <div class="strength-score-container">
            <div class="score-circle" :class="statusColor">
                <svg viewBox="0 0 36 36" class="circular-chart">
                    <path
                        class="circle-bg"
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        class="circle-progress"
                        :stroke-dasharray="`${percentage}, 100`"
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <div class="score-value">
                    <span class="score-number">{{ percentage }}</span>
                    <span class="score-percent">%</span>
                </div>
            </div>
            <p class="score-message">{{ status.message }}</p>
        </div>

        <!-- Pillar Breakdown -->
        <div class="pillars-container" v-if="showPillars">
            <div
                v-for="pillar in pillarList"
                :key="pillar.id"
                class="pillar-item"
                :class="{ complete: pillar.percentage === 100 }"
            >
                <div class="pillar-header">
                    <span class="pillar-icon">{{ pillarIcons[pillar.id] }}</span>
                    <span class="pillar-label">{{ pillar.label }}</span>
                    <span class="pillar-score">{{ pillar.score }}/{{ pillar.max }}</span>
                </div>
                <div class="pillar-bar">
                    <div class="pillar-progress" :style="{ width: `${pillar.percentage}%` }"></div>
                </div>
            </div>
        </div>

        <!-- Recommendations -->
        <div class="recommendations-container" v-if="showRecommendations && recommendations.length > 0">
            <h4 class="recommendations-title">Improve Your Score</h4>
            <ul class="recommendations-list">
                <li
                    v-for="(rec, index) in displayedRecommendations"
                    :key="index"
                    class="recommendation-item"
                    :class="`priority-${rec.priority}`"
                >
                    <span class="rec-icon">{{ priorityIcons[rec.priority] }}</span>
                    <span class="rec-message">{{ rec.message }}</span>
                    <span class="rec-points">+{{ rec.points }}</span>
                </li>
            </ul>
        </div>

        <!-- Not Publishable Warning -->
        <div class="publishable-warning" v-if="!isPublishable && showWarning">
            <span class="warning-icon">!</span>
            <span class="warning-text">Complete your basic info to make your profile publishable</span>
        </div>

        <!-- Loading State -->
        <div class="loading-overlay" v-if="isLoading">
            <div class="loading-spinner"></div>
        </div>
    </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { useProfileStrength } from '@/composables/useProfileStrength.js';

const props = defineProps({
    profileId: {
        type: Number,
        required: true,
    },
    showPillars: {
        type: Boolean,
        default: true,
    },
    showRecommendations: {
        type: Boolean,
        default: true,
    },
    maxRecommendations: {
        type: Number,
        default: 3,
    },
    showWarning: {
        type: Boolean,
        default: true,
    },
    autoRefresh: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['score-loaded', 'score-changed']);

// Use the composable
const {
    isLoading,
    error,
    percentage,
    status,
    statusLevel,
    statusLabel,
    statusColor,
    isPublishable,
    pillars,
    recommendations,
    fetchStrength,
} = useProfileStrength({
    profileId: props.profileId,
    autoFetch: true,
});

// Pillar icons mapping
const pillarIcons = {
    identity: '👤',
    authority: '🏆',
    value: '🎁',
    proof: '✓',
};

// Priority icons
const priorityIcons = {
    critical: '⚠',
    high: '↑',
    medium: '→',
    low: '○',
};

// Convert pillars object to array for v-for
const pillarList = computed(() => {
    const order = ['identity', 'authority', 'value', 'proof'];
    return order
        .filter((id) => pillars.value[id])
        .map((id) => ({
            id,
            ...pillars.value[id],
        }));
});

// Limit displayed recommendations
const displayedRecommendations = computed(() => {
    return recommendations.value.slice(0, props.maxRecommendations);
});

// Watch for score changes
watch(percentage, (newVal, oldVal) => {
    if (oldVal !== undefined && newVal !== oldVal) {
        emit('score-changed', {
            oldScore: oldVal,
            newScore: newVal,
            status: status.value,
        });
    }
});

// Emit when score loads
watch(
    () => isLoading.value,
    (loading) => {
        if (!loading && percentage.value !== undefined) {
            emit('score-loaded', {
                score: percentage.value,
                status: status.value,
                pillars: pillars.value,
            });
        }
    }
);

// Expose refresh method
defineExpose({
    refresh: fetchStrength,
});
</script>

<style scoped>
.profile-strength-meter {
    position: relative;
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.strength-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.strength-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.strength-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    text-transform: uppercase;
}

.strength-badge.gray {
    background: #f0f0f0;
    color: #666;
}
.strength-badge.orange {
    background: #fff3e0;
    color: #e65100;
}
.strength-badge.yellow {
    background: #fffde7;
    color: #f9a825;
}
.strength-badge.blue {
    background: #e3f2fd;
    color: #1565c0;
}
.strength-badge.green {
    background: #e8f5e9;
    color: #2e7d32;
}

.strength-score-container {
    text-align: center;
    margin-bottom: 20px;
}

.score-circle {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 12px;
}

.circular-chart {
    width: 100%;
    height: 100%;
}

.circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 3;
}

.circle-progress {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    transition: stroke-dasharray 0.6s ease;
}

.score-circle.gray .circle-progress {
    stroke: #9e9e9e;
}
.score-circle.orange .circle-progress {
    stroke: #ff9800;
}
.score-circle.yellow .circle-progress {
    stroke: #ffc107;
}
.score-circle.blue .circle-progress {
    stroke: #2196f3;
}
.score-circle.green .circle-progress {
    stroke: #4caf50;
}

.score-value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.score-number {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
}

.score-percent {
    font-size: 16px;
    color: #666;
}

.score-message {
    font-size: 14px;
    color: #666;
    margin: 0;
}

.pillars-container {
    margin-bottom: 20px;
}

.pillar-item {
    margin-bottom: 12px;
}

.pillar-item.complete .pillar-progress {
    background: #4caf50;
}

.pillar-header {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    font-size: 13px;
}

.pillar-icon {
    margin-right: 8px;
}

.pillar-label {
    flex: 1;
    color: #333;
}

.pillar-score {
    color: #666;
    font-size: 12px;
}

.pillar-bar {
    height: 6px;
    background: #eee;
    border-radius: 3px;
    overflow: hidden;
}

.pillar-progress {
    height: 100%;
    background: #2196f3;
    border-radius: 3px;
    transition: width 0.4s ease;
}

.recommendations-container {
    border-top: 1px solid #eee;
    padding-top: 16px;
}

.recommendations-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0 0 12px 0;
}

.recommendations-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.recommendation-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    font-size: 13px;
    border-bottom: 1px solid #f5f5f5;
}

.recommendation-item:last-child {
    border-bottom: none;
}

.rec-icon {
    width: 20px;
    text-align: center;
    margin-right: 8px;
}

.priority-critical .rec-icon {
    color: #f44336;
}
.priority-high .rec-icon {
    color: #ff9800;
}
.priority-medium .rec-icon {
    color: #2196f3;
}
.priority-low .rec-icon {
    color: #9e9e9e;
}

.rec-message {
    flex: 1;
    color: #333;
}

.rec-points {
    font-weight: 600;
    color: #4caf50;
    font-size: 12px;
}

.publishable-warning {
    display: flex;
    align-items: center;
    background: #fff3e0;
    border: 1px solid #ffcc80;
    border-radius: 8px;
    padding: 12px;
    margin-top: 16px;
}

.warning-icon {
    width: 24px;
    height: 24px;
    background: #ff9800;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 12px;
    flex-shrink: 0;
}

.warning-text {
    font-size: 13px;
    color: #e65100;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
}

.loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #eee;
    border-top-color: #2196f3;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Compact variant */
.profile-strength-meter.compact .strength-score-container {
    display: flex;
    align-items: center;
    text-align: left;
}

.profile-strength-meter.compact .score-circle {
    width: 60px;
    height: 60px;
    margin: 0 16px 0 0;
}

.profile-strength-meter.compact .score-number {
    font-size: 20px;
}

.profile-strength-meter.compact .score-percent {
    font-size: 12px;
}
</style>
