<template>
    <div class="profile-list-app">
        <!-- Page Header -->
        <div class="guestify-page-header">
            <h1 class="guestify-page-title">Your Guest Profiles</h1>
            <p class="guestify-page-subtitle">
                Create and manage different expertise profiles for your podcast guest appearances
            </p>
            <!-- Profile limit indicator -->
            <p v-if="store.limitStatus && !store.isUnlimited" class="guestify-limit-indicator">
                {{ store.profileCount }} of {{ store.profileLimit }} profiles used
                <span v-if="store.membershipTier" class="tier-badge">{{ store.membershipTier.name }}</span>
            </p>
        </div>

        <!-- Toolbar -->
        <div v-if="!store.isLoading && !store.lastError && store.hasProfiles" class="pit-toolbar">
            <div class="pit-toolbar-left">
                <div class="pit-search-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" class="pit-search-icon" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        class="pit-search-input"
                        placeholder="Search profiles..."
                        :value="store.searchQuery"
                        @input="store.setSearchQuery($event.target.value)"
                    />
                </div>
            </div>
            <div class="pit-toolbar-right">
                <div class="pit-view-toggle">
                    <button
                        class="pit-view-btn"
                        :class="{ 'pit-view-btn-active': store.viewMode === 'cards' }"
                        @click="store.setViewMode('cards')"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Cards
                    </button>
                    <button
                        class="pit-view-btn"
                        :class="{ 'pit-view-btn-active': store.viewMode === 'table' }"
                        @click="store.setViewMode('table')"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                        Table
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="store.isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading profiles...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="store.lastError" class="error-banner">
            <p>{{ store.lastError }}</p>
            <button @click="store.loadProfiles()" class="retry-button">
                Retry
            </button>
        </div>

        <!-- Table View -->
        <ProfileTableView
            v-else-if="store.viewMode === 'table' && store.hasProfiles"
            :profiles="store.filteredProfiles"
            @delete="handleDelete"
        />

        <!-- Card Grid View -->
        <div v-else class="guestify-card-grid">
            <!-- Profile Cards -->
            <ProfileCard
                v-for="profile in store.filteredProfiles"
                :key="profile.id"
                :profile="profile"
                @delete="handleDelete"
            />

            <!-- Add New Profile Card (only show if can create) -->
            <div
                v-if="store.canCreateProfile"
                class="guestify-profile-card guestify-add-card"
                @click="store.openCreateModal()"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="guestify-add-icon" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <p class="guestify-add-title">Create New Profile</p>
                <p class="guestify-add-subtitle">Add another expertise area</p>
            </div>

            <!-- Upgrade CTA Card (show when at limit) -->
            <div
                v-else-if="store.isAtLimit"
                class="guestify-profile-card guestify-upgrade-card"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="guestify-upgrade-icon" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
                <p class="guestify-upgrade-title">Profile Limit Reached</p>
                <p class="guestify-upgrade-subtitle">
                    You've used all {{ store.profileLimit }} profile{{ store.profileLimit === 1 ? '' : 's' }} on your {{ store.membershipTier?.name || 'current' }} plan
                </p>
                <a :href="store.upgradeLink" class="guestify-upgrade-button">
                    Upgrade to Create Unlimited One Sheets
                </a>
            </div>
        </div>

        <!-- Create Profile Modal -->
        <CreateProfileModal
            v-if="store.showCreateModal"
            @close="store.closeCreateModal()"
            @create="handleCreate"
        />
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProfileListStore } from './stores/profileList.js';
import ProfileCard from './components/ProfileCard.vue';
import ProfileTableView from './components/ProfileTableView.vue';
import CreateProfileModal from './components/CreateProfileModal.vue';

// Store
const store = useProfileListStore();

// Load profiles on mount
onMounted(() => {
    store.loadProfiles();
});

// Handle delete
const handleDelete = async (profileId) => {
    if (confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
        await store.deleteProfile(profileId);
    }
};

// Handle create
const handleCreate = async () => {
    await store.createProfile();
};
</script>

<style scoped>
.profile-list-app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.guestify-page-header {
    margin-bottom: 20px;
}

/* Toolbar Styles */
.pit-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 16px;
    flex-wrap: wrap;
}

.pit-toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 200px;
}

.pit-toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.pit-search-wrapper {
    position: relative;
    flex: 1;
    max-width: 300px;
}

.pit-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: #94a3b8;
    pointer-events: none;
}

.pit-search-input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    color: #334155;
    background: #fff;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.pit-search-input:focus {
    outline: none;
    border-color: #ED8936;
    box-shadow: 0 0 0 3px rgba(237, 137, 54, 0.1);
}

.pit-search-input::placeholder {
    color: #94a3b8;
}

.pit-view-toggle {
    display: flex;
    background: #f1f5f9;
    border-radius: 6px;
    padding: 2px;
}

.pit-view-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    background: transparent;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pit-view-btn svg {
    width: 16px;
    height: 16px;
}

.pit-view-btn:hover {
    color: #334155;
}

.pit-view-btn-active {
    background: #fff;
    color: #334155;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.guestify-page-title {
    font-size: 28px;
    font-weight: 600;
    color: #4A5568;
    margin: 0 0 8px 0;
}

.guestify-page-subtitle {
    font-size: 16px;
    color: #516f90;
    margin: 0;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #516f90;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #ED8936;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
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
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.error-banner p {
    color: #dc2626;
    margin: 0;
}

.retry-button {
    background: #dc2626;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.retry-button:hover {
    background: #b91c1c;
}

.guestify-card-grid {
    display: flex;
    flex-wrap: wrap;
    margin: -10px;
}

.guestify-add-card {
    flex: 1 0 calc(33.333% - 20px);
    max-width: calc(33.333% - 20px);
    margin: 10px;
    min-width: 280px;
    min-height: 200px;
    background-color: #ffffff;
    border: 1px dashed #cbd6e2;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.guestify-add-card:hover {
    border-color: #ED8936;
    background-color: #fffbf5;
}

.guestify-add-icon {
    width: 32px;
    height: 32px;
    color: #ED8936;
    margin-bottom: 12px;
}

.guestify-add-title {
    font-size: 14px;
    font-weight: 500;
    color: #4A5568;
    margin: 0 0 4px 0;
}

.guestify-add-subtitle {
    font-size: 12px;
    color: #516f90;
    margin: 0;
}

/* Profile Limit Indicator */
.guestify-limit-indicator {
    font-size: 14px;
    color: #516f90;
    margin: 8px 0 0 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.tier-badge {
    background: linear-gradient(135deg, #ED8936, #F6AD55);
    color: white;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
}

/* Upgrade Card Styles */
.guestify-upgrade-card {
    flex: 1 0 calc(33.333% - 20px);
    max-width: calc(33.333% - 20px);
    margin: 10px;
    min-width: 280px;
    min-height: 200px;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border: 2px dashed #ED8936;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    text-align: center;
}

.guestify-upgrade-icon {
    width: 40px;
    height: 40px;
    color: #ED8936;
    margin-bottom: 16px;
}

.guestify-upgrade-title {
    font-size: 16px;
    font-weight: 600;
    color: #4A5568;
    margin: 0 0 8px 0;
}

.guestify-upgrade-subtitle {
    font-size: 14px;
    color: #516f90;
    margin: 0 0 16px 0;
    line-height: 1.4;
}

.guestify-upgrade-button {
    display: inline-block;
    background: linear-gradient(135deg, #ED8936, #DD6B20);
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(237, 137, 54, 0.3);
}

.guestify-upgrade-button:hover {
    background: linear-gradient(135deg, #DD6B20, #C05621);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(237, 137, 54, 0.4);
    color: white;
    text-decoration: none;
}

/* Responsive */
@media (max-width: 1024px) {
    .guestify-add-card,
    .guestify-upgrade-card {
        flex: 1 0 calc(50% - 20px);
        max-width: calc(50% - 20px);
    }
}

@media (max-width: 768px) {
    .guestify-add-card,
    .guestify-upgrade-card {
        flex: 1 0 calc(100% - 20px);
        max-width: calc(100% - 20px);
    }
}
</style>
