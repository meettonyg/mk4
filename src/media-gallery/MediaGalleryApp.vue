<template>
  <div class="media-gallery-app">
    <!-- Header -->
    <div class="app-header">
      <div class="header-content">
        <h1>Media Gallery</h1>
        <p class="header-description">
          View and manage all your brand media assets in one place.
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="filter-group">
        <label class="filter-label">CATEGORY</label>
        <div class="filter-buttons">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="filter-btn"
            :class="{ active: selectedCategory === cat.id }"
            @click="selectedCategory = cat.id"
          >
            {{ cat.label }}
            <span v-if="getCategoryCount(cat.id)" class="filter-count">
              {{ getCategoryCount(cat.id) }}
            </span>
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">BRAND KIT</label>
        <select v-model="selectedBrandKitId" class="filter-select">
          <option value="">All Brand Kits</option>
          <option v-for="kit in store.brandKits" :key="kit.id" :value="kit.id">
            {{ kit.name || 'Untitled' }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoading && !allMedia.length" class="loading-state">
      <div class="spinner"></div>
      <p>Loading media...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn btn-secondary" @click="store.clearError">Dismiss</button>
    </div>

    <!-- Media Grid -->
    <div v-else-if="filteredMedia.length > 0" class="media-grid">
      <div
        v-for="item in filteredMedia"
        :key="`${item.brandKitId}-${item.id}`"
        class="media-card"
        :class="{ 'is-primary': item.is_primary }"
        @click="openInBrandKit(item)"
      >
        <div class="card-preview">
          <img
            :src="item.sizes?.medium?.url || item.sizes?.thumbnail?.url || item.url"
            :alt="item.alt || item.label || 'Media'"
            loading="lazy"
          />
          <span v-if="item.is_primary" class="primary-badge">Primary</span>
          <span class="category-badge">{{ item.category }}</span>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ item.label || 'Untitled' }}</h3>
          <p class="card-meta">
            <span class="brand-kit-name">{{ getBrandKitName(item.brandKitId) }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🖼️</div>
      <h2>No Media Found</h2>
      <p v-if="selectedCategory || selectedBrandKitId">
        No media matches your current filters. Try adjusting your selection.
      </p>
      <p v-else>
        You haven't added any media to your brand kits yet.
        <br />
        Go to Brand Kits to add headshots, logos, and photos.
      </p>
      <button v-if="selectedCategory || selectedBrandKitId" class="btn btn-secondary" @click="clearFilters">
        Clear Filters
      </button>
    </div>

    <!-- Brand Kit Editor Modal -->
    <Teleport to="body">
      <div v-if="showEditor" class="editor-modal">
        <div class="modal-backdrop" @click="closeEditor"></div>
        <div class="modal-content">
          <BrandKitEditor
            :brand-kit-id="editingBrandKitId"
            mode="edit"
            initial-tab="media"
            @close="closeEditor"
            @saved="onEditorSaved"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useBrandKitStore } from '../stores/brandKit.js';
import BrandKitEditor from '../brand-kits/components/BrandKitEditor.vue';

const props = defineProps({
  initialCategory: {
    type: String,
    default: '',
  },
});

const store = useBrandKitStore();

// Filter state
const selectedCategory = ref(props.initialCategory || '');
const selectedBrandKitId = ref('');

// Editor state
const showEditor = ref(false);
const editingBrandKitId = ref(null);

// Categories
const categories = [
  { id: '', label: 'All' },
  { id: 'headshot', label: 'Headshots' },
  { id: 'logo', label: 'Logos' },
  { id: 'photo', label: 'Photos' },
  { id: 'background', label: 'Backgrounds' },
];

// Computed: Aggregate all media from all brand kits
const allMedia = computed(() => {
  const media = [];
  for (const kit of store.brandKits) {
    if (kit.media && Array.isArray(kit.media)) {
      for (const item of kit.media) {
        media.push({
          ...item,
          brandKitId: kit.id,
          brandKitName: kit.name,
        });
      }
    }
  }
  return media;
});

// Computed: Filter media by category and brand kit
const filteredMedia = computed(() => {
  let result = allMedia.value;

  if (selectedCategory.value) {
    result = result.filter(m => m.category === selectedCategory.value);
  }

  if (selectedBrandKitId.value) {
    result = result.filter(m => m.brandKitId === parseInt(selectedBrandKitId.value));
  }

  return result;
});

// Methods
const getCategoryCount = (categoryId) => {
  if (!categoryId) {
    return allMedia.value.length;
  }
  return allMedia.value.filter(m => m.category === categoryId).length;
};

const getBrandKitName = (brandKitId) => {
  const kit = store.brandKits.find(k => k.id === brandKitId);
  return kit?.name || 'Untitled';
};

const openInBrandKit = (item) => {
  editingBrandKitId.value = item.brandKitId;
  store.loadBrandKit(item.brandKitId);
  showEditor.value = true;
};

const closeEditor = () => {
  showEditor.value = false;
  editingBrandKitId.value = null;
};

const onEditorSaved = async () => {
  closeEditor();
  // Reload all brand kits to refresh media
  await store.loadBrandKits(true);
};

const clearFilters = () => {
  selectedCategory.value = '';
  selectedBrandKitId.value = '';
};

// Initialize
onMounted(async () => {
  await store.loadBrandKits();

  // Load full data for each brand kit to get media
  for (const kit of store.brandKits) {
    if (!kit.media) {
      await store.loadBrandKit(kit.id);
    }
  }
});
</script>

<style scoped>
.media-gallery-app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* Header */
.app-header {
  margin-bottom: 24px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.header-description {
  margin: 0;
  font-size: 15px;
  color: #6b7280;
}

/* Filters */
.filters-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #6b7280;
  transition: all 0.15s;
}

.filter-btn:hover {
  border-color: #9ca3af;
  color: #374151;
}

.filter-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.filter-count {
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.2);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background: white;
  min-width: 180px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
}

/* Loading/Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.media-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
}

.media-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.media-card.is-primary {
  border-color: #3b82f6;
}

.card-preview {
  position: relative;
  aspect-ratio: 1;
  background: #f3f4f6;
  overflow: hidden;
}

.card-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.primary-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.category-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: capitalize;
}

.card-content {
  padding: 12px;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.brand-kit-name {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
}

/* Editor Modal */
.editor-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 1100px;
  height: 85vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
  }

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
