<template>
    <div class="profile-app" :class="{ 'is-loading': store.isLoading }">
        <!-- Back Button -->
        <a href="/app/profiles/guest/" class="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" class="back-icon" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Profiles
        </a>

        <!-- Loading State -->
        <div v-if="store.isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Loading profile...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="store.lastError" class="error-banner">
            <p>{{ store.lastError }}</p>
            <button @click="store.loadProfile()" class="button secondary-button">
                Retry
            </button>
        </div>

        <!-- Main Content -->
        <template v-else>
            <!-- Profile Header -->
            <ProfileHeader
                :post-data="store.postData"
                :full-name="store.fullName"
                :completeness="store.completeness"
                @edit="handleEditProfile"
            />

            <!-- Tabs -->
            <ProfileTabs
                :active-tab="store.activeTab"
                @change="store.setActiveTab"
            >
                <!-- Overview Tab -->
                <template #overview>
                    <OverviewTab />
                </template>

                <!-- Value Tab -->
                <template #value>
                    <ValueTab />
                </template>

                <!-- Messaging Tab -->
                <template #messaging>
                    <MessagingTab />
                </template>

                <!-- Branding Tab -->
                <template #branding>
                    <BrandingTab />
                </template>
            </ProfileTabs>
        </template>

        <!-- Save Status Indicator -->
        <SaveIndicator
            v-if="!store.isLoading"
            :status="store.saveStatus"
            :last-saved="store.lastSaved"
            @save="handleSave"
        />
    </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useProfileStore } from './stores/profile.js';

// Components
import ProfileHeader from './components/layout/ProfileHeader.vue';
import ProfileTabs from './components/layout/ProfileTabs.vue';
import SaveIndicator from './components/layout/SaveIndicator.vue';
import OverviewTab from './components/overview/OverviewTab.vue';
import ValueTab from './components/value/ValueTab.vue';
import MessagingTab from './components/messaging/MessagingTab.vue';
import BrandingTab from './components/branding/BrandingTab.vue';

// Props
const props = defineProps({
    postId: {
        type: Number,
        required: true,
    },
});

// Store
const store = useProfileStore();

// Load profile on mount
onMounted(async () => {
    store.setConfig({ postId: props.postId });
    await store.loadProfile();

    // Add beforeunload warning for unsaved changes
    window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
});

// Warn about unsaved changes
const handleBeforeUnload = (e) => {
    if (store.isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
    }
};

// Handle edit profile click
const handleEditProfile = () => {
    // Could open a modal or navigate to edit mode
    console.log('Edit profile clicked');
};

// Handle manual save
const handleSave = async () => {
    await store.saveProfile();
};
</script>

<style scoped>
.profile-app {
    position: relative;
    min-height: 400px;
}

.profile-app.is-loading {
    pointer-events: none;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #14b8a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.error-banner {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.error-banner p {
    color: #dc2626;
    margin: 0;
}

.back-button {
    display: inline-flex;
    align-items: center;
    color: #64748b;
    text-decoration: none;
    font-size: 14px;
    margin-bottom: 12px;
}

.back-button:hover {
    color: #334155;
}

.back-icon {
    margin-right: 6px;
}
</style>
