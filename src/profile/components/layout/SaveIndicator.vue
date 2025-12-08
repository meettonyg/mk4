<template>
    <div class="save-indicator" :class="status">
        <div class="save-status">
            <!-- Saving -->
            <template v-if="status === 'saving'">
                <div class="spinner"></div>
                <span>Saving...</span>
            </template>

            <!-- Unsaved -->
            <template v-else-if="status === 'unsaved'">
                <div class="dot unsaved"></div>
                <span>Unsaved changes</span>
                <button class="save-button" @click="$emit('save')">
                    Save Now
                </button>
            </template>

            <!-- Saved -->
            <template v-else>
                <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ lastSavedText }}</span>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        default: 'saved',
        validator: (v) => ['saving', 'unsaved', 'saved'].includes(v),
    },
    lastSaved: {
        type: Date,
        default: null,
    },
});

defineEmits(['save']);

const lastSavedText = computed(() => {
    if (!props.lastSaved) return 'All changes saved';

    const now = new Date();
    const diffMs = now - props.lastSaved;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    if (diffSec < 10) return 'Just saved';
    if (diffSec < 60) return 'Saved seconds ago';
    if (diffMin < 5) return `Saved ${diffMin} min ago`;
    return 'All changes saved';
});
</script>

<style scoped>
.save-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    transition: all 0.3s ease;
}

.save-indicator.unsaved {
    border-color: #fbbf24;
    background: #fffbeb;
}

.save-indicator.saving {
    border-color: #60a5fa;
    background: #eff6ff;
}

.save-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #64748b;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.dot.unsaved {
    background: #f59e0b;
}

.check-icon {
    width: 16px;
    height: 16px;
    color: #10b981;
}

.save-button {
    background: #14b8a6;
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    margin-left: 8px;
    transition: background 0.2s;
}

.save-button:hover {
    background: #0d9488;
}
</style>
