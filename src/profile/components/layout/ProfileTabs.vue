<template>
    <div class="profile-tabs-component">
        <!-- Hidden Radio Inputs for CSS-only tab switching -->
        <input
            v-for="tab in tabs"
            :key="'radio-' + tab.id"
            type="radio"
            :id="'tab-' + tab.id"
            name="profile-tabs"
            :checked="activeTab === tab.id"
            @change="$emit('change', tab.id)"
        >

        <!-- Tab Navigation -->
        <div class="tabs-header">
            <label
                v-for="tab in tabs"
                :key="'label-' + tab.id"
                :for="'tab-' + tab.id"
            >
                {{ tab.label }}
            </label>
        </div>

        <!-- Tab Content Panels -->
        <div class="tab-content overview">
            <slot name="overview">
                <p class="empty-slot">Overview content not provided</p>
            </slot>
        </div>

        <div class="tab-content value">
            <slot name="value">
                <p class="empty-slot">Value content not provided</p>
            </slot>
        </div>

        <div class="tab-content messaging">
            <slot name="messaging">
                <p class="empty-slot">Messaging content not provided</p>
            </slot>
        </div>

        <div class="tab-content branding">
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

<style>
/* ==============================
   ProfileTabs - CSS-only tab system
   (matching interview-detail.css pattern)

   NOTE: This is unscoped CSS because Vue's scoped CSS
   breaks ID-based sibling selectors (#id:checked ~ .class)
============================== */
.profile-tabs-component {
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

/* Hide radio inputs (CSS-only tab mechanism) */
.profile-tabs-component input[type="radio"] {
    display: none;
}

/* Tab Header Navigation */
.profile-tabs-component .tabs-header {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.profile-tabs-component .tabs-header::-webkit-scrollbar {
    display: none;
}

/* Tab Labels */
.profile-tabs-component .tabs-header label {
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

.profile-tabs-component .tabs-header label:hover {
    color: #0ea5e9;
    background-color: rgba(14, 165, 233, 0.05);
}

/* ==============================
   Tab Content Panels
============================== */

/* Hide all tab content by default */
.profile-tabs-component .tab-content {
    display: none;
    background: #fff;
    padding: 24px;
}

/* Show the selected tab content using CSS sibling selector */
.profile-tabs-component #tab-overview:checked ~ .tab-content.overview,
.profile-tabs-component #tab-value:checked ~ .tab-content.value,
.profile-tabs-component #tab-messaging:checked ~ .tab-content.messaging,
.profile-tabs-component #tab-branding:checked ~ .tab-content.branding {
    display: block;
    animation: profileTabsFadeIn 0.3s ease;
}

/* Active tab label styles using CSS sibling selector */
.profile-tabs-component #tab-overview:checked ~ .tabs-header label[for="tab-overview"],
.profile-tabs-component #tab-value:checked ~ .tabs-header label[for="tab-value"],
.profile-tabs-component #tab-messaging:checked ~ .tabs-header label[for="tab-messaging"],
.profile-tabs-component #tab-branding:checked ~ .tabs-header label[for="tab-branding"] {
    color: #14b8a6;
    font-weight: 600;
    border-bottom-color: #14b8a6;
    background-color: rgba(20, 184, 166, 0.05);
}

/* Fade-in animation for tab content */
@keyframes profileTabsFadeIn {
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
.profile-tabs-component .empty-slot {
    color: #94a3b8;
    font-style: italic;
    text-align: center;
    padding: 40px 20px;
}

/* Responsive */
@media (max-width: 640px) {
    .profile-tabs-component .tabs-header label {
        padding: 12px 16px;
        font-size: 13px;
    }

    .profile-tabs-component .tab-content {
        padding: 16px;
    }
}
</style>
