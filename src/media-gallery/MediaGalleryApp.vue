<template>
  <div class="media-gallery-app">
    <!-- Header -->
    <div class="app-header">
      <div class="header-content">
        <h1>Media Gallery</h1>
        <p class="header-description">
          Upload and manage your brand media assets. Link them to multiple brand kits.
        </p>
      </div>
      <button class="btn btn-primary" @click="openUploader">
        + Upload Media
      </button>
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
          <option value="">All Media</option>
          <option value="unlinked">Unlinked Only</option>
          <option v-for="kit in brandKits" :key="kit.id" :value="kit.id">
            {{ kit.name || 'Untitled' }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !mediaItems.length" class="loading-state">
      <div class="spinner"></div>
      <p>Loading media...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="error = null">Dismiss</button>
    </div>

    <!-- Media Grid -->
    <div v-else-if="filteredMedia.length > 0" class="media-grid">
      <div
        v-for="item in filteredMedia"
        :key="item.id"
        class="media-card"
        :class="{ 'is-selected': selectedMedia?.id === item.id }"
        @click="selectMedia(item)"
      >
        <div class="card-preview">
          <img
            :src="item.sizes?.medium?.url || item.sizes?.thumbnail?.url || item.url"
            :alt="item.alt || item.label || 'Media'"
            loading="lazy"
          />
          <span class="category-badge">{{ item.category }}</span>
          <span v-if="item.linked_brand_kits?.length" class="link-badge">
            {{ item.linked_brand_kits.length }} kit{{ item.linked_brand_kits.length > 1 ? 's' : '' }}
          </span>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ item.label || 'Untitled' }}</h3>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🖼️</div>
      <h2>No Media Found</h2>
      <p v-if="selectedCategory || selectedBrandKitId">
        No media matches your current filters.
      </p>
      <p v-else>
        Upload your first media to start building your brand library.
      </p>
      <div class="empty-actions">
        <button v-if="selectedCategory || selectedBrandKitId" class="btn btn-secondary" @click="clearFilters">
          Clear Filters
        </button>
        <button class="btn btn-primary" @click="openUploader">
          + Upload Media
        </button>
      </div>
    </div>

    <!-- Media Detail Sidebar -->
    <Teleport to="body">
      <div v-if="selectedMedia" class="detail-sidebar">
        <div class="sidebar-backdrop" @click="selectedMedia = null"></div>
        <div class="sidebar-content">
          <div class="sidebar-header">
            <h2>Media Details</h2>
            <button class="close-btn" @click="selectedMedia = null">×</button>
          </div>

          <div class="sidebar-body">
            <!-- Preview -->
            <div class="detail-preview">
              <img :src="selectedMedia.sizes?.large?.url || selectedMedia.url" :alt="selectedMedia.alt" />
            </div>

            <!-- Edit Form -->
            <div class="detail-form">
              <div class="form-group">
                <label>Label</label>
                <input
                  type="text"
                  v-model="editForm.label"
                  placeholder="Enter a label..."
                />
              </div>

              <div class="form-group">
                <label>Alt Text</label>
                <input
                  type="text"
                  v-model="editForm.alt"
                  placeholder="Describe the image..."
                />
              </div>

              <div class="form-group">
                <label>Category</label>
                <select v-model="editForm.category">
                  <option v-for="cat in categories.slice(1)" :key="cat.id" :value="cat.id">
                    {{ cat.label }}
                  </option>
                </select>
              </div>

              <button class="btn btn-primary btn-full" @click="saveMediaDetails" :disabled="isSaving">
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>

            <!-- Brand Kit Links -->
            <div class="detail-section">
              <h3>LINKED BRAND KITS</h3>
              <div v-if="selectedMedia.linked_brand_kits?.length" class="linked-kits">
                <div
                  v-for="kitId in selectedMedia.linked_brand_kits"
                  :key="kitId"
                  class="linked-kit"
                >
                  <span>{{ getBrandKitName(kitId) }}</span>
                  <button class="unlink-btn" @click="unlinkFromBrandKit(selectedMedia.id, kitId)">
                    Unlink
                  </button>
                </div>
              </div>
              <p v-else class="no-links">Not linked to any brand kits</p>

              <!-- Add to Brand Kit -->
              <div class="add-to-kit">
                <select v-model="linkToBrandKitId">
                  <option value="">Link to brand kit...</option>
                  <option
                    v-for="kit in availableBrandKits"
                    :key="kit.id"
                    :value="kit.id"
                  >
                    {{ kit.name || 'Untitled' }}
                  </option>
                </select>
                <button
                  class="btn btn-secondary"
                  @click="linkToBrandKit"
                  :disabled="!linkToBrandKitId"
                >
                  Link
                </button>
              </div>
            </div>

            <!-- Delete -->
            <div class="detail-section danger-zone">
              <button class="btn btn-danger btn-full" @click="confirmDelete">
                Delete Media
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Upload Modal -->
    <Teleport to="body">
      <div v-if="showUploader" class="upload-modal">
        <div class="modal-backdrop" @click="closeUploader"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Upload Media</h2>
            <button class="close-btn" @click="closeUploader">×</button>
          </div>
          <div class="modal-body">
            <div class="upload-form">
              <div class="form-group">
                <label>Category</label>
                <select v-model="uploadCategory">
                  <option v-for="cat in categories.slice(1)" :key="cat.id" :value="cat.id">
                    {{ cat.label }}
                  </option>
                </select>
              </div>

              <div class="form-group" v-if="brandKits.length">
                <label>Link to Brand Kit (Optional)</label>
                <select v-model="uploadBrandKitId">
                  <option value="">Don't link</option>
                  <option v-for="kit in brandKits" :key="kit.id" :value="kit.id">
                    {{ kit.name || 'Untitled' }}
                  </option>
                </select>
              </div>

              <button class="btn btn-primary btn-full" @click="openWordPressMediaLibrary">
                Select from Media Library
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { mediaLibraryService } from '../services/MediaLibraryService.js';
import { useBrandKitStore } from '../stores/brandKit.js';

const props = defineProps({
  initialCategory: {
    type: String,
    default: '',
  },
});

const brandKitStore = useBrandKitStore();

// State
const mediaItems = ref([]);
const brandKits = ref([]);
const isLoading = ref(false);
const error = ref(null);
const isSaving = ref(false);

// Filter state
const selectedCategory = ref(props.initialCategory || '');
const selectedBrandKitId = ref('');

// Selected media for detail view
const selectedMedia = ref(null);
const editForm = ref({ label: '', alt: '', category: '' });
const linkToBrandKitId = ref('');

// Upload state
const showUploader = ref(false);
const uploadCategory = ref('photo');
const uploadBrandKitId = ref('');

// Categories
const categories = [
  { id: '', label: 'All' },
  { id: 'headshot', label: 'Headshots' },
  { id: 'logo', label: 'Logos' },
  { id: 'photo', label: 'Photos' },
  { id: 'background', label: 'Backgrounds' },
];

// Computed
const filteredMedia = computed(() => {
  let result = mediaItems.value;

  if (selectedCategory.value) {
    result = result.filter(m => m.category === selectedCategory.value);
  }

  if (selectedBrandKitId.value === 'unlinked') {
    result = result.filter(m => !m.linked_brand_kits?.length);
  } else if (selectedBrandKitId.value) {
    result = result.filter(m =>
      m.linked_brand_kits?.includes(parseInt(selectedBrandKitId.value))
    );
  }

  return result;
});

const availableBrandKits = computed(() => {
  if (!selectedMedia.value) return brandKits.value;
  const linkedIds = selectedMedia.value.linked_brand_kits || [];
  return brandKits.value.filter(kit => !linkedIds.includes(kit.id));
});

// Methods
const loadMedia = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    mediaItems.value = await mediaLibraryService.getAll();
  } catch (err) {
    error.value = err.message;
    console.error('Failed to load media:', err);
  } finally {
    isLoading.value = false;
  }
};

const loadBrandKits = async () => {
  try {
    await brandKitStore.loadBrandKits();
    brandKits.value = brandKitStore.brandKits;
  } catch (err) {
    console.error('Failed to load brand kits:', err);
  }
};

const getCategoryCount = (categoryId) => {
  if (!categoryId) return mediaItems.value.length;
  return mediaItems.value.filter(m => m.category === categoryId).length;
};

const getBrandKitName = (kitId) => {
  const kit = brandKits.value.find(k => k.id === kitId);
  return kit?.name || 'Untitled';
};

const selectMedia = (item) => {
  selectedMedia.value = item;
  editForm.value = {
    label: item.label || '',
    alt: item.alt || '',
    category: item.category || 'photo',
  };
  linkToBrandKitId.value = '';
};

const saveMediaDetails = async () => {
  if (!selectedMedia.value) return;

  isSaving.value = true;
  try {
    const updated = await mediaLibraryService.update(selectedMedia.value.id, editForm.value);
    // Update in list
    const index = mediaItems.value.findIndex(m => m.id === selectedMedia.value.id);
    if (index !== -1) {
      mediaItems.value[index] = { ...mediaItems.value[index], ...updated };
    }
    selectedMedia.value = { ...selectedMedia.value, ...updated };
  } catch (err) {
    error.value = err.message;
  } finally {
    isSaving.value = false;
  }
};

const linkToBrandKit = async () => {
  if (!selectedMedia.value || !linkToBrandKitId.value) return;

  try {
    await mediaLibraryService.linkToBrandKit(selectedMedia.value.id, linkToBrandKitId.value);
    // Update linked_brand_kits
    if (!selectedMedia.value.linked_brand_kits) {
      selectedMedia.value.linked_brand_kits = [];
    }
    selectedMedia.value.linked_brand_kits.push(parseInt(linkToBrandKitId.value));
    // Update in list
    const index = mediaItems.value.findIndex(m => m.id === selectedMedia.value.id);
    if (index !== -1) {
      mediaItems.value[index].linked_brand_kits = [...selectedMedia.value.linked_brand_kits];
    }
    linkToBrandKitId.value = '';
  } catch (err) {
    error.value = err.message;
  }
};

const unlinkFromBrandKit = async (mediaId, brandKitId) => {
  try {
    await mediaLibraryService.unlinkFromBrandKit(mediaId, brandKitId);
    // Update linked_brand_kits
    if (selectedMedia.value?.id === mediaId) {
      selectedMedia.value.linked_brand_kits = selectedMedia.value.linked_brand_kits.filter(
        id => id !== brandKitId
      );
    }
    // Update in list
    const index = mediaItems.value.findIndex(m => m.id === mediaId);
    if (index !== -1) {
      mediaItems.value[index].linked_brand_kits = mediaItems.value[index].linked_brand_kits.filter(
        id => id !== brandKitId
      );
    }
  } catch (err) {
    error.value = err.message;
  }
};

const confirmDelete = async () => {
  if (!selectedMedia.value) return;

  if (!confirm('Are you sure you want to delete this media? This will unlink it from all brand kits.')) {
    return;
  }

  try {
    await mediaLibraryService.delete(selectedMedia.value.id);
    mediaItems.value = mediaItems.value.filter(m => m.id !== selectedMedia.value.id);
    selectedMedia.value = null;
  } catch (err) {
    error.value = err.message;
  }
};

const clearFilters = () => {
  selectedCategory.value = '';
  selectedBrandKitId.value = '';
};

const openUploader = () => {
  showUploader.value = true;
};

const closeUploader = () => {
  showUploader.value = false;
};

const openWordPressMediaLibrary = () => {
  if (!window.wp?.media) {
    alert('WordPress media library not available');
    return;
  }

  const frame = window.wp.media({
    title: 'Select Media',
    multiple: true,
    library: { type: 'image' },
  });

  frame.on('select', async () => {
    const selection = frame.state().get('selection').toJSON();

    for (const attachment of selection) {
      try {
        const data = {
          media_id: attachment.id,
          category: uploadCategory.value,
          label: attachment.title || attachment.filename,
          alt: attachment.alt || '',
        };

        if (uploadBrandKitId.value) {
          data.brand_kit_id = uploadBrandKitId.value;
        }

        const created = await mediaLibraryService.create(data);
        mediaItems.value.unshift(created);
      } catch (err) {
        console.error('Failed to add media:', err);
      }
    }

    closeUploader();
  });

  frame.open();
};

// Initialize
onMounted(async () => {
  await Promise.all([loadMedia(), loadBrandKits()]);
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 24px;
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
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-full {
  width: 100%;
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
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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
}

.media-card.is-selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
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

.category-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: capitalize;
}

.link-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.card-content {
  padding: 12px;
}

.card-title {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Detail Sidebar */
.detail-sidebar {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  justify-content: flex-end;
}

.sidebar-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
}

.sidebar-content {
  position: relative;
  width: 400px;
  max-width: 90%;
  height: 100%;
  background: white;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 6px;
}

.close-btn:hover {
  background: #f3f4f6;
}

.sidebar-body {
  padding: 20px;
}

.detail-preview {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
}

.detail-preview img {
  width: 100%;
  display: block;
}

.detail-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.detail-section {
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  margin-top: 20px;
}

.detail-section h3 {
  margin: 0 0 12px 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.linked-kits {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.linked-kit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 13px;
}

.unlink-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.unlink-btn:hover {
  background: #fee2e2;
}

.no-links {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 16px;
}

.add-to-kit {
  display: flex;
  gap: 8px;
}

.add-to-kit select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}

.danger-zone {
  border-top-color: #fee2e2;
}

/* Upload Modal */
.upload-modal {
  position: fixed;
  inset: 0;
  z-index: 10001;
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
  max-width: 500px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-body {
  padding: 20px;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-bar {
    flex-direction: column;
  }

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .sidebar-content {
    width: 100%;
  }
}
</style>
