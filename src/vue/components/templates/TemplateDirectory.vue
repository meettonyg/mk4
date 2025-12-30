<template>
  <div class="gmkb-template-directory">
    <!-- Header with gradient background -->
    <header class="directory-header">
      <div class="brand">
        <span class="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </span>
        <span class="brand-text">Media Kit</span>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="directory-hero">
      <h1>Choose a Starting Point</h1>
      <p>Select a template below to get started, or choose a blank canvas to build from scratch</p>
    </section>

    <!-- Search -->
    <div class="directory-search">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search templates..."
          class="search-input"
          @input="handleSearch"
        />
        <button
          v-if="searchQuery"
          class="search-clear"
          @click="clearSearch"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <TemplateFilters
      :categories="categories"
      :active-category="templateStore.activeFilter"
      @select="handleFilterChange"
    />

    <!-- Template Grid -->
    <div class="directory-grid-wrapper">
      <div class="directory-grid">
        <!-- Blank Canvas Card -->
        <BlankCanvasCard @select="handleBlankSelect" />

        <!-- Template Cards -->
        <TemplateCard
          v-for="template in filteredTemplates"
          :key="template.id"
          :template="template"
          :deletable="template.type === 'user'"
          @select="handleTemplateSelect"
          @demo="handleTemplateDemo"
          @delete="handleTemplateDelete"
        />

        <!-- Loading State -->
        <div v-if="templateStore.isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading templates...</p>
        </div>

        <!-- Empty State -->
        <div
          v-if="!templateStore.isLoading && filteredTemplates.length === 0"
          class="empty-state"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
          <p>No templates found</p>
          <span v-if="searchQuery">Try a different search term</span>
          <span v-else>Check back later for new templates</span>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="templateStore.error" class="error-banner">
      <span>{{ templateStore.error }}</span>
      <button @click="retryFetch">Retry</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useTemplateStore } from '../../../stores/templates';
import { useUIStore } from '../../../stores/ui';
import TemplateFilters from './TemplateFilters.vue';
import TemplateCard from './TemplateCard.vue';
import BlankCanvasCard from './BlankCanvasCard.vue';

const templateStore = useTemplateStore();
const uiStore = useUIStore();

// Local state
const searchQuery = ref('');
let searchTimeout = null;

// Categories for filter
const categories = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'corporate', label: 'Corporate', icon: 'building' },
  { id: 'creative', label: 'Creative', icon: 'palette' },
  { id: 'minimal', label: 'Minimal', icon: 'minus' },
  { id: 'portfolio', label: 'Portfolio', icon: 'briefcase' },
  { id: 'saved', label: 'My Templates', icon: 'bookmark' }
];

// Computed
const filteredTemplates = computed(() => templateStore.filteredTemplates);

// Handlers
const handleSearch = () => {
  // Debounce search
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    templateStore.setSearchQuery(searchQuery.value);
  }, 300);
};

const clearSearch = () => {
  searchQuery.value = '';
  templateStore.setSearchQuery('');
};

const handleFilterChange = (category) => {
  templateStore.setFilter(category);
};

const handleBlankSelect = () => {
  templateStore.initializeBlank();
};

const handleTemplateSelect = async (template) => {
  try {
    await templateStore.initializeFromTemplate(template.id);
  } catch (err) {
    console.error('Failed to load template:', err);
    uiStore.showToast('Failed to load template', 'error');
  }
};

const handleTemplateDemo = (template) => {
  uiStore.openTemplateDemo(template.id);
};

const handleTemplateDelete = async (template) => {
  if (!confirm(`Delete "${template.name}"? This cannot be undone.`)) {
    return;
  }

  try {
    await templateStore.deleteUserTemplate(template.id);
    uiStore.showToast('Template deleted', 'success');
  } catch (err) {
    console.error('Failed to delete template:', err);
    uiStore.showToast('Failed to delete template', 'error');
  }
};

const retryFetch = () => {
  templateStore.fetchTemplates();
};

// Lifecycle
onMounted(() => {
  if (!templateStore.hasTemplates) {
    templateStore.fetchTemplates();
  }
});

// Sync search query from store
watch(() => templateStore.searchQuery, (newVal) => {
  if (searchQuery.value !== newVal) {
    searchQuery.value = newVal;
  }
});
</script>

<style scoped>
.gmkb-template-directory {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  flex-direction: column;
}

/* Header */
.directory-header {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
}

.brand-icon {
  opacity: 0.9;
}

.brand-text {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Hero */
.directory-hero {
  text-align: center;
  padding: 2rem 2rem 1.5rem;
}

.directory-hero h1 {
  color: white;
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: -0.03em;
}

.directory-hero p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin: 0;
  max-width: 500px;
  margin: 0 auto;
}

/* Search */
.directory-search {
  padding: 0 2rem 1rem;
  display: flex;
  justify-content: center;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  color: white;
  font-size: 0.9375rem;
  outline: none;
  transition: all 0.15s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.search-clear {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s ease;
}

.search-clear:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* Grid Wrapper */
.directory-grid-wrapper {
  flex: 1;
  background: #f8f9fa;
  border-radius: 24px 24px 0 0;
  margin-top: 1rem;
  padding: 2rem;
  min-height: 400px;
}

/* Grid */
.directory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Loading State */
.loading-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  text-align: center;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.125rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 0.25rem;
}

.empty-state span {
  font-size: 0.875rem;
}

/* Error Banner */
.error-banner {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-banner button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.error-banner button:hover {
  background: #b91c1c;
}

/* Responsive */
@media (max-width: 768px) {
  .directory-hero h1 {
    font-size: 1.75rem;
  }

  .directory-hero p {
    font-size: 0.9375rem;
  }

  .directory-grid-wrapper {
    padding: 1.5rem 1rem;
    border-radius: 16px 16px 0 0;
  }

  .directory-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
}
</style>
