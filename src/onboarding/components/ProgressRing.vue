<template>
    <div class="progress-ring-container" :style="containerStyle">
        <svg :width="size" :height="size" class="progress-ring">
            <!-- Background circle -->
            <circle
                class="progress-ring-bg"
                :cx="center"
                :cy="center"
                :r="radius"
                fill="none"
                :stroke-width="strokeWidth"
            />
            <!-- Progress circle -->
            <circle
                class="progress-ring-progress"
                :cx="center"
                :cy="center"
                :r="radius"
                fill="none"
                :stroke-width="strokeWidth"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                stroke-linecap="round"
            />
        </svg>
        <div class="progress-ring-content">
            <span class="percentage">{{ percentage }}%</span>
            <span v-if="label" class="label">{{ label }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    percentage: {
        type: Number,
        default: 0,
        validator: (v) => v >= 0 && v <= 100,
    },
    size: {
        type: Number,
        default: 120,
    },
    strokeWidth: {
        type: Number,
        default: 10,
    },
    label: {
        type: String,
        default: '',
    },
    bgColor: {
        type: String,
        default: 'rgba(255, 255, 255, 0.2)',
    },
    progressColor: {
        type: String,
        default: '#ffffff',
    },
});

const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const progressOffset = computed(() => {
    const progress = props.percentage / 100;
    return circumference.value * (1 - progress);
});

const containerStyle = computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
}));
</script>

<style scoped>
.progress-ring-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.progress-ring {
    transform: rotate(-90deg);
}

.progress-ring-bg {
    stroke: v-bind('props.bgColor');
}

.progress-ring-progress {
    stroke: v-bind('props.progressColor');
    transition: stroke-dashoffset 0.5s ease-out;
}

.progress-ring-content {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.percentage {
    font-size: calc(v-bind('props.size') * 0.22px);
    font-weight: 700;
    color: white;
}

.label {
    font-size: calc(v-bind('props.size') * 0.1px);
    color: rgba(255, 255, 255, 0.8);
    margin-top: 2px;
}
</style>
