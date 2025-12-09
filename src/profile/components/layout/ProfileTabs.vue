<template>
    <div class="tabs">
        <!-- Hidden radio buttons for theme CSS compatibility -->
        <input
            type="radio"
            name="tabs"
            id="tab-overview"
            data-tab="overview"
            class="tab-radio"
            :checked="activeTab === 'overview'"
        >
        <input
            type="radio"
            name="tabs"
            id="tab-topics"
            data-tab="value"
            class="tab-radio"
            :checked="activeTab === 'value'"
        >
        <input
            type="radio"
            name="tabs"
            id="tab-messaging"
            data-tab="messaging"
            class="tab-radio"
            :checked="activeTab === 'messaging'"
        >
        <input
            type="radio"
            name="tabs"
            id="tab-branding"
            data-tab="branding"
            class="tab-radio"
            :checked="activeTab === 'branding'"
        >

        <!-- Tab Headers -->
        <div class="tabs-header">
            <label
                v-for="tab in tabs"
                :key="tab.id"
                :for="getRadioId(tab.id)"
                class="tab-button"
                :class="{ active: activeTab === tab.id }"
                @click="$emit('change', tab.id)"
            >
                {{ tab.label }}
            </label>
        </div>

        <!-- Tab Content - Vue controls visibility with v-show -->
        <div v-show="activeTab === 'overview'" class="tab-content overview">
            <div class="tab-content-inner">
                <slot name="overview" />
            </div>
        </div>
        <div v-show="activeTab === 'value'" class="tab-content topics">
            <div class="tab-content-inner">
                <slot name="value" />
            </div>
        </div>
        <div v-show="activeTab === 'messaging'" class="tab-content messaging">
            <div class="tab-content-inner">
                <slot name="messaging" />
            </div>
        </div>
        <div v-show="activeTab === 'branding'" class="tab-content branding">
            <div class="tab-content-inner">
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

// Map tab IDs to radio input IDs (matching original HTML)
const radioIdMap = {
    overview: 'tab-overview',
    value: 'tab-topics',
    messaging: 'tab-messaging',
    branding: 'tab-branding',
};

const getRadioId = (tabId) => radioIdMap[tabId] || `tab-${tabId}`;

defineProps({
    activeTab: {
        type: String,
        default: 'overview',
    },
});

defineEmits(['change']);
</script>

<style scoped>
/* Hide radio inputs visually but keep for theme CSS compatibility */
.tab-radio {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.tabs {
    background-color: #fff;
    border-radius: 0 0 8px 8px;
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

/* Tab content styling - visibility controlled by v-show */
.tab-content {
    background: #fff;
    padding: 24px;
}

.tab-content-inner {
    /* Container for tab slot content */
}

@media (max-width: 640px) {
    .tab-button {
        padding: 12px 16px;
        font-size: 13px;
    }

    .tab-content {
        padding: 16px;
    }
}
</style>
