<template>
    <div
        class="task-card"
        :class="{
            'is-complete': task.complete,
            'is-critical': task.critical,
        }"
    >
        <div class="task-status">
            <div v-if="task.complete" class="status-icon completed">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <div v-else class="status-icon pending">
                <span class="points-badge">+{{ task.max_points }}</span>
            </div>
        </div>

        <div class="task-content">
            <h3 class="task-title">
                {{ task.label }}
                <span v-if="task.critical" class="critical-badge">Critical</span>
            </h3>
            <p v-if="task.description" class="task-description">
                {{ task.description }}
            </p>
        </div>

        <div class="task-action">
            <template v-if="task.complete">
                <span class="earned-points">{{ task.points }} pts</span>
            </template>
            <template v-else-if="task.action_url">
                <a :href="task.action_url" class="action-button">
                    {{ task.action_label || 'Start' }}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
            </template>
            <template v-else-if="task.manual">
                <button
                    class="action-button"
                    @click="$emit('complete', task.id)"
                    :disabled="isCompleting"
                >
                    {{ isCompleting ? 'Saving...' : 'Mark Done' }}
                </button>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    task: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['complete']);

const isCompleting = ref(false);
</script>

<style scoped>
.task-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 10px;
    transition: all 0.2s;
}

.task-card:hover {
    background: #f1f5f9;
}

.task-card.is-complete {
    background: #f0fdf4;
}

.task-card.is-critical {
    border-left: 3px solid #f59e0b;
}

.task-card.is-critical.is-complete {
    border-left-color: #22c55e;
}

/* Status Icon */
.task-status {
    flex-shrink: 0;
}

.status-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.status-icon.completed {
    background: #22c55e;
    color: white;
}

.status-icon.pending {
    background: white;
    border: 2px solid #e2e8f0;
}

.points-badge {
    font-size: 12px;
    font-weight: 700;
    color: #14b8a6;
}

/* Content */
.task-content {
    flex: 1;
    min-width: 0;
}

.task-title {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.task-card.is-complete .task-title {
    color: #15803d;
}

.critical-badge {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #fef3c7;
    color: #b45309;
    padding: 2px 6px;
    border-radius: 4px;
}

.task-card.is-complete .critical-badge {
    background: #dcfce7;
    color: #15803d;
}

.task-description {
    font-size: 13px;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
}

/* Action */
.task-action {
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.earned-points {
    font-size: 14px;
    font-weight: 600;
    color: #22c55e;
}

.action-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #14b8a6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
}

.action-button:hover {
    background: #0d9488;
}

.action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Responsive */
@media (max-width: 480px) {
    .task-card {
        flex-wrap: wrap;
    }

    .task-action {
        width: 100%;
        margin-top: 12px;
    }

    .action-button {
        width: 100%;
        justify-content: center;
    }
}
</style>
