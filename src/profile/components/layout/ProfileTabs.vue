<template>
    <div class="tabs">
        <!-- Tab Navigation -->
        <div class="tabs-header">
            <label
                v-for="tab in tabs"
                :key="tab.id"
                :class="{ active: activeTab === tab.id }"
                @click="$emit('change', tab.id)"
            >
                {{ tab.label }}
            </label>
        </div>

        <!-- Tab Content Panels - Explicit slots for reliable rendering -->
        <div class="tab-content overview" :class="{ active: activeTab === 'overview' }">
            <slot name="overview">
                <p class="empty-slot">Overview content not provided</p>
            </slot>
        </div>

        <div class="tab-content value" :class="{ active: activeTab === 'value' }">
            <slot name="value">
                <p class="empty-slot">Value content not provided</p>
            </slot>
        </div>

        <div class="tab-content messaging" :class="{ active: activeTab === 'messaging' }">
            <slot name="messaging">
                <p class="empty-slot">Messaging content not provided</p>
            </slot>
        </div>

        <div class="tab-content branding" :class="{ active: activeTab === 'branding' }">
            <slot name="branding">
                <p class="empty-slot">Branding content not provided</p>
            </slot>
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
/* ==============================
   Tabs Container
   (matching interview-detail.css pattern)
============================== */
.tabs {
    margin: 0;
    padding: 0;
    border-radius: 0 0 8px 8px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    border-top: none;
    position: relative;
}

/* Tab Header Navigation */
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

/* Tab Labels */
.tabs-header label {
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
    user-select: none;
}

.tabs-header label:hover {
    color: #0ea5e9;
    background-color: rgba(14, 165, 233, 0.05);
}

/* Active Tab Label */
.tabs-header label.active {
    color: #14b8a6;
    font-weight: 600;
    border-bottom-color: #14b8a6;
    background-color: rgba(20, 184, 166, 0.05);
}

/* ==============================
   Tab Content Panels
============================== */

/* Hide all tab content by default */
.tab-content {
    display: none;
    background: #fff;
    padding: 24px;
}

/* Show tab content when active class is present */
.tab-content.active {
    display: block;
    animation: fadeIn 0.3s ease;
}

/* Fade-in animation for tab content */
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

/* Empty slot fallback (for debugging) */
.empty-slot {
    color: #94a3b8;
    font-style: italic;
    text-align: center;
    padding: 40px 20px;
}

/* Responsive */
@media (max-width: 640px) {
    .tabs-header label {
        padding: 12px 16px;
        font-size: 13px;
    }

    .tab-content {
        padding: 16px;
    }
}
</style>
