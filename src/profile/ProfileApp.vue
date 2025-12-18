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

            <!-- Main Layout with Sidebar -->
            <div class="profile-layout">
                <!-- Main Content Area -->
                <div class="profile-main">
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
                </div>

                <!-- Sidebar with Profile Strength Meter -->
                <aside class="profile-sidebar">
                    <ProfileStrengthMeter
                        v-if="store.postData?.id"
                        ref="strengthMeterRef"
                        :profile-id="store.postData.id"
                        :show-pillars="true"
                        :show-recommendations="true"
                        :max-recommendations="3"
                        @score-loaded="handleStrengthLoaded"
                        @score-changed="handleStrengthChanged"
                    />

                    <!-- Quick Actions -->
                    <div class="sidebar-actions">
                        <a
                            v-if="mediaKitUrl"
                            :href="mediaKitUrl"
                            target="_blank"
                            class="sidebar-action-btn primary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Preview Media Kit
                        </a>
                        <a href="/app/onboarding/" class="sidebar-action-btn secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 20V10"></path>
                                <path d="M18 20V4"></path>
                                <path d="M6 20v-4"></path>
                            </svg>
                            Onboarding Progress
                        </a>
                    </div>
                </aside>
            </div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useProfileStore } from './stores/profile.js';

// Components
import ProfileHeader from './components/layout/ProfileHeader.vue';
import ProfileTabs from './components/layout/ProfileTabs.vue';
import SaveIndicator from './components/layout/SaveIndicator.vue';
import OverviewTab from './components/overview/OverviewTab.vue';
import ValueTab from './components/value/ValueTab.vue';
import MessagingTab from './components/messaging/MessagingTab.vue';
import BrandingTab from './components/branding/BrandingTab.vue';
import ProfileStrengthMeter from './components/strength/ProfileStrengthMeter.vue';

// Props
const props = defineProps({
    postId: {
        type: Number,
        required: true,
    },
});

// Store
const store = useProfileStore();

// Refs
const strengthMeterRef = ref(null);

// Computed
const mediaKitUrl = computed(() => {
    return store.postData?.permalink || null;
});

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

// Refresh strength meter when profile is saved
watch(() => store.lastSaved, () => {
    if (strengthMeterRef.value) {
        strengthMeterRef.value.refresh();
    }
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

// Handle strength score loaded
const handleStrengthLoaded = (data) => {
    console.log('Profile strength loaded:', data.score, data.status.label);
};

// Handle strength score changed
const handleStrengthChanged = (data) => {
    console.log('Profile strength changed:', data.oldScore, '->', data.newScore);
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

/* Layout with Sidebar */
.profile-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 24px;
    margin-top: 0;
}

.profile-main {
    min-width: 0;
}

.profile-sidebar {
    position: sticky;
    top: 24px;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Sidebar Actions */
.sidebar-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.sidebar-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
}

.sidebar-action-btn svg {
    width: 18px;
    height: 18px;
}

.sidebar-action-btn.primary {
    background: #14b8a6;
    color: white;
}

.sidebar-action-btn.primary:hover {
    background: #0d9488;
}

.sidebar-action-btn.secondary {
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

.sidebar-action-btn.secondary:hover {
    background: #f1f5f9;
    color: #334155;
}

/* Responsive */
@media (max-width: 1024px) {
    .profile-layout {
        grid-template-columns: 1fr;
    }

    .profile-sidebar {
        position: static;
        order: -1;
    }
}
</style>
