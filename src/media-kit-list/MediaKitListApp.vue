<template>
    <div class="media-kit-list-app">
        <!-- Page Header -->
        <div class="gmkb-page-header">
            <h1 class="gmkb-page-title">Your Media Kits</h1>
            <p class="gmkb-page-subtitle">
                Create and manage your professional media kits for podcast appearances
            </p>
        </div>

        <!-- Toolbar -->
        <div v-if="!store.isLoading && !store.lastError && store.hasMediaKits" class="pit-toolbar">
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
                        placeholder="Search media kits..."
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
            <p>Loading media kits...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="store.lastError" class="error-banner">
            <p>{{ store.lastError }}</p>
            <button @click="store.loadMediaKits()" class="retry-button">
                Retry
            </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="!store.hasMediaKits && !store.isLoading" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <h2>No Media Kits Yet</h2>
            <p>Create your first media kit to showcase your expertise to podcast hosts.</p>
            <a v-if="store.showCreate" :href="store.createUrl" class="gmkb-create-button">
                Create Your First Media Kit
            </a>
        </div>

        <!-- Table View -->
        <MediaKitTableView
            v-else-if="store.viewMode === 'table' && store.hasMediaKits"
            :mediakits="store.filteredMediaKits"
            @delete="handleDelete"
        />

        <!-- Media Kit Grid -->
        <div v-else class="gmkb-card-grid">
            <!-- Media Kit Cards -->
            <MediaKitCard
                v-for="mediakit in store.filteredMediaKits"
                :key="mediakit.id"
                :mediakit="mediakit"
                @delete="handleDelete"
            />

            <!-- Add New Media Kit Card -->
            <a
                v-if="store.showCreate"
                :href="store.createUrl"
                class="gmkb-card gmkb-add-card"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="gmkb-add-icon" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <p class="gmkb-add-title">Create New Media Kit</p>
                <p class="gmkb-add-subtitle">Start from a template</p>
            </a>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useMediaKitListStore } from './stores/mediaKitList.js';
import MediaKitCard from './components/MediaKitCard.vue';
import MediaKitTableView from './components/MediaKitTableView.vue';

// Store
const store = useMediaKitListStore();

// Load media kits on mount
onMounted(() => {
    store.loadMediaKits();
});

// Handle delete
const handleDelete = async (mediakitId) => {
    if (confirm('Are you sure you want to delete this media kit? This action cannot be undone.')) {
        await store.deleteMediaKit(mediakitId);
    }
};
</script>

<style scoped>
.media-kit-list-app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.gmkb-page-header {
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

.gmkb-page-title {
    font-size: 28px;
    font-weight: 600;
    color: #4A5568;
    margin: 0 0 8px 0;
}

.gmkb-page-subtitle {
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

/* Empty State */
.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px dashed #e2e8f0;
}

.empty-icon {
    width: 64px;
    height: 64px;
    color: #94a3b8;
    margin-bottom: 16px;
}

.empty-state h2 {
    font-size: 20px;
    font-weight: 600;
    color: #4A5568;
    margin: 0 0 8px 0;
}

.empty-state p {
    font-size: 15px;
    color: #64748b;
    margin: 0 0 24px 0;
}

.gmkb-create-button {
    display: inline-block;
    background: linear-gradient(135deg, #ED8936, #DD6B20);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(237, 137, 54, 0.3);
}

.gmkb-create-button:hover {
    background: linear-gradient(135deg, #DD6B20, #C05621);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(237, 137, 54, 0.4);
    color: white;
    text-decoration: none;
}

/* Card Grid */
.gmkb-card-grid {
    display: flex;
    flex-wrap: wrap;
    margin: -10px;
}

.gmkb-add-card {
    flex: 1 0 calc(33.333% - 20px);
    max-width: calc(33.333% - 20px);
    margin: 10px;
    min-width: 280px;
    min-height: 200px;
    background-color: #ffffff;
    border: 2px dashed #cbd6e2;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
}

.gmkb-add-card:hover {
    border-color: #ED8936;
    background-color: #fffbf5;
    text-decoration: none;
}

.gmkb-add-icon {
    width: 32px;
    height: 32px;
    color: #ED8936;
    margin-bottom: 12px;
}

.gmkb-add-title {
    font-size: 14px;
    font-weight: 500;
    color: #4A5568;
    margin: 0 0 4px 0;
}

.gmkb-add-subtitle {
    font-size: 12px;
    color: #516f90;
    margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
    .gmkb-add-card {
        flex: 1 0 calc(50% - 20px);
        max-width: calc(50% - 20px);
    }
}

@media (max-width: 768px) {
    .gmkb-add-card {
        flex: 1 0 calc(100% - 20px);
        max-width: calc(100% - 20px);
    }
}
</style>
