<template>
    <div class="tabs">
        <!-- Tab Headers -->
        <div class="tabs-header">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                class="tab-button"
                :class="{ active: activeTab === tab.id }"
                @click="$emit('change', tab.id)"
            >
                {{ tab.label }}
            </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
            <div v-show="activeTab === 'overview'" class="tab-panel">
                <slot name="overview" />
            </div>
            <div v-show="activeTab === 'value'" class="tab-panel">
                <slot name="value" />
            </div>
            <div v-show="activeTab === 'messaging'" class="tab-panel">
                <slot name="messaging" />
            </div>
            <div v-show="activeTab === 'branding'" class="tab-panel">
                <slot name="branding" />
            </div>
        </div>
    </div>
</template>

<script setup>
const tabs = [
    { id: 'overview', label: 'Profile Overview' },
    { id: 'value', label: 'Value' },
    { id: 'messaging', label: 'Messaging' },
    { id: 'branding', label: 'Branding' },
];

defineProps({
    activeTab: {
        type: String,
        default: 'overview',
    },
});

defineEmits(['change']);
</script>

<style scoped>
.tabs {
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    border-radius: 0 0 8px 8px;
    border-top: none;
}

.tabs-header {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.tabs-header::-webkit-scrollbar {
    display: none;
}

.tab-button {
    padding: 16px 24px;
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
    color: #64748b;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.tab-button:hover {
    color: #0284c7;
    background-color: rgba(2, 132, 199, 0.05);
}

.tab-button.active {
    color: #14b8a6;
    font-weight: 600;
    border-bottom-color: #14b8a6;
    background-color: rgba(20, 184, 166, 0.05);
}

.tab-content {
    background: #fff;
}

.tab-panel {
    padding: 24px;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 640px) {
    .tab-button {
        padding: 12px 16px;
        font-size: 13px;
    }

    .tab-panel {
        padding: 16px;
    }
}
</style>
