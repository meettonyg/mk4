<template>
  <div class="gmkb-media-gallery">
    <!-- Gallery Header -->
    <div class="gmkb-media-gallery__header">
      <h3 class="gmkb-media-gallery__title">Media Library</h3>
      <div class="gmkb-media-gallery__actions">
        <button
          type="button"
          class="gmkb-media-gallery__btn gmkb-media-gallery__btn--upload"
          @click="handleUpload"
          :disabled="uploading"
        >
          <i class="fa fa-upload"></i>
          {{ uploading ? 'Uploading...' : 'Upload New' }}
        </button>
        <button
          type="button"
          class="gmkb-media-gallery__btn gmkb-media-gallery__btn--close"
          @click="$emit('close')"
        >
          <i class="fa fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="gmkb-media-gallery__filters">
      <input
        v-model="searchQuery"
        type="text"
        class="gmkb-media-gallery__search"
        placeholder="Search media..."
        @input="debouncedSearch"
      />
      <select v-model="filterType" class="gmkb-media-gallery__filter">
        <option value="">All Types</option>
        <option value="image/jpeg">JPEG</option>
        <option value="image/png">PNG</option>
        <option value="image/gif">GIF</option>
        <option value="image/webp">WebP</option>
      </select>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="gmkb-media-gallery__upload-progress">
      <div class="gmkb-media-gallery__progress-bar">
        <div
          class="gmkb-media-gallery__progress-fill"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
      <p class="gmkb-media-gallery__progress-text">
        Uploading... {{ uploadProgress }}%
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error || uploadError" class="gmkb-media-gallery__error">
      <i class="fa fa-exclamation-triangle"></i>
      {{ error || uploadError }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="gmkb-media-gallery__loading">
      <div class="gmkb-media-gallery__spinner"></div>
      <p>Loading media library...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && filteredMedia.length === 0" class="gmkb-media-gallery__empty">
      <i class="fa fa-images"></i>
      <h4>No media found</h4>
      <p v-if="searchQuery">Try a different search term</p>
      <p v-else>Upload your first image to get started</p>
      <button
        type="button"
        class="gmkb-media-gallery__btn gmkb-media-gallery__btn--primary"
        @click="handleUpload"
      >
        <i class="fa fa-upload"></i>
        Upload Media
      </button>
    </div>

    <!-- Media Grid -->
    <div v-else class="gmkb-media-gallery__grid">
      <div
        v-for="media in filteredMedia"
        :key="media.id"
        class="gmkb-media-gallery__item"
        :class="{
          'gmkb-media-gallery__item--selected': isSelected(media.id)
        }"
        @click="handleSelect(media)"
      >
        <!-- Image Thumbnail -->
        <div class="gmkb-media-gallery__item-image">
          <img
            :src="media.thumbnail || media.url"
            :alt="media.alt || media.title"
            loading="lazy"
          />
          
          <!-- Selection Indicator -->
          <div v-if="isSelected(media.id)" class="gmkb-media-gallery__item-check">
            <i class="fa fa-check"></i>
          </div>
        </div>

        <!-- Image Info -->
        <div class="gmkb-media-gallery__item-info">
          <p class="gmkb-media-gallery__item-title" :title="media.title">
            {{ media.title }}
          </p>
          <p class="gmkb-media-gallery__item-meta">
            {{ formatFileSize(media.filesize) }}
            <span v-if="media.width && media.height">
              • {{ media.width }}×{{ media.height }}
            </span>
          </p>
        </div>

        <!-- Delete Button -->
        <button
          type="button"
          class="gmkb-media-gallery__item-delete"
          @click.stop="handleDelete(media.id)"
          title="Delete"
        >
          <i class="fa fa-trash"></i>
        </button>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasMore && !loading" class="gmkb-media-gallery__load-more">
      <button
        type="button"
        class="gmkb-media-gallery__btn gmkb-media-gallery__btn--secondary"
        @click="loadMore"
        :disabled="loadingMore"
      >
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>

    <!-- Footer Actions -->
    <div v-if="multiple || selectedMedia.length > 0" class="gmkb-media-gallery__footer">
      <p class="gmkb-media-gallery__selected-count">
        {{ selectedMedia.length }} item{{ selectedMedia.length !== 1 ? 's' : '' }} selected
      </p>
      <div class="gmkb-media-gallery__footer-actions">
        <button
          type="button"
          class="gmkb-media-gallery__btn gmkb-media-gallery__btn--secondary"
          @click="clearSelection"
        >
          Clear Selection
        </button>
        <button
          type="button"
          class="gmkb-media-gallery__btn gmkb-media-gallery__btn--primary"
          @click="confirmSelection"
          :disabled="selectedMedia.length === 0"
        >
          Insert Selected
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useMediaUpload } from '@/composables/useMediaUpload';

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  allowedTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  }
});

const emit = defineEmits(['select', 'close']);

// Media upload composable
const {
  uploading,
  uploadProgress,
  uploadError,
  uploadedFiles,
  openFilePicker,
  deleteMedia: deleteMediaFile
} = useMediaUpload();

// State
const loading = ref(false);
const loadingMore = ref(false);
const error = ref(null);
const mediaItems = ref([]);
const selectedMedia = ref([...props.selectedIds]);
const searchQuery = ref('');
const filterType = ref('');
const page = ref(1);
const perPage = ref(20);
const totalPages = ref(1);

// Computed
const hasMore = computed(() => page.value < totalPages.value);

const filteredMedia = computed(() => {
  let items = [...mediaItems.value];

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter(item =>
      item.title?.toLowerCase().includes(query) ||
      item.filename?.toLowerCase().includes(query) ||
      item.alt?.toLowerCase().includes(query)
    );
  }

  // Filter by type
  if (filterType.value) {
    items = items.filter(item => item.mime_type === filterType.value);
  }

  return items;
});

// Methods
async function loadMediaLibrary(reset = false) {
  if (reset) {
    loading.value = true;
    page.value = 1;
    mediaItems.value = [];
  } else {
    loadingMore.value = true;
  }

  error.value = null;

  try {
    const nonce = window.gmkbData?.restNonce || wp.apiSettings?.nonce;
    if (!nonce) {
      throw new Error('WordPress REST API nonce not available');
    }

    const params = new URLSearchParams({
      per_page: perPage.value,
      page: page.value,
      media_type: 'image',
      orderby: 'date',
      order: 'desc'
    });

    const response = await fetch(`/wp-json/wp/v2/media?${params}`, {
      headers: {
        'X-WP-Nonce': nonce
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load media library');
    }

    const media = await response.json();
    const totalPagesHeader = response.headers.get('X-WP-TotalPages');
    totalPages.value = totalPagesHeader ? parseInt(totalPagesHeader) : 1;

    // Normalize media objects
    const normalizedMedia = media.map(item => ({
      id: item.id,
      url: item.source_url,
      thumbnail: item.media_details?.sizes?.thumbnail?.source_url || item.source_url,
      medium: item.media_details?.sizes?.medium?.source_url || item.source_url,
      large: item.media_details?.sizes?.large?.source_url || item.source_url,
      full: item.source_url,
      title: item.title?.rendered || item.slug,
      alt: item.alt_text || '',
      caption: item.caption?.rendered || '',
      description: item.description?.rendered || '',
      filename: item.slug,
      filesize: item.media_details?.filesize || 0,
      mime_type: item.mime_type,
      width: item.media_details?.width,
      height: item.media_details?.height,
      date: item.date
    }));

    if (reset) {
      mediaItems.value = normalizedMedia;
    } else {
      mediaItems.value.push(...normalizedMedia);
    }

    console.log(`📚 Loaded ${normalizedMedia.length} media items (page ${page.value}/${totalPages.value})`);
  } catch (err) {
    console.error('Failed to load media library:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

async function loadMore() {
  page.value++;
  await loadMediaLibrary(false);
}

function isSelected(mediaId) {
  return selectedMedia.value.includes(mediaId);
}

function handleSelect(media) {
  if (props.multiple) {
    const index = selectedMedia.value.indexOf(media.id);
    if (index > -1) {
      selectedMedia.value.splice(index, 1);
    } else {
      selectedMedia.value.push(media.id);
    }
  } else {
    selectedMedia.value = [media.id];
    confirmSelection();
  }
}

function clearSelection() {
  selectedMedia.value = [];
}

function confirmSelection() {
  const selected = mediaItems.value.filter(item =>
    selectedMedia.value.includes(item.id)
  );
  emit('select', props.multiple ? selected : selected[0]);
}

async function handleUpload() {
  try {
    const uploaded = await openFilePicker({
      multiple: props.multiple,
      accept: props.allowedTypes.join(','),
      allowedTypes: props.allowedTypes
    });

    if (uploaded && uploaded.length > 0) {
      await loadMediaLibrary(true);
      
      if (props.multiple) {
        selectedMedia.value = uploaded.map(m => m.id);
      } else {
        selectedMedia.value = [uploaded[0].id];
        confirmSelection();
      }
    }
  } catch (err) {
    console.error('Upload failed:', err);
    error.value = err.message;
  }
}

async function handleDelete(mediaId) {
  if (!confirm('Are you sure you want to delete this media item?')) {
    return;
  }

  try {
    await deleteMediaFile(mediaId);
    mediaItems.value = mediaItems.value.filter(item => item.id !== mediaId);
    selectedMedia.value = selectedMedia.value.filter(id => id !== mediaId);
    console.log(`✅ Deleted media: ${mediaId}`);
  } catch (err) {
    console.error('Failed to delete media:', err);
    error.value = err.message;
  }
}

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

let searchTimeout;
function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    console.log(`🔍 Searching: "${searchQuery.value}"`);
  }, 300);
}

watch(uploadedFiles, (newFiles) => {
  if (newFiles && newFiles.length > 0) {
    mediaItems.value.unshift(...newFiles);
  }
});

onMounted(() => {
  loadMediaLibrary(true);
});
</script>

<style scoped>
.gmkb-media-gallery {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.gmkb-media-gallery__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.gmkb-media-gallery__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.gmkb-media-gallery__actions {
  display: flex;
  gap: 10px;
}

.gmkb-media-gallery__filters {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.gmkb-media-gallery__search {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.gmkb-media-gallery__filter {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
}

.gmkb-media-gallery__upload-progress {
  padding: 15px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.gmkb-media-gallery__progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.gmkb-media-gallery__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.gmkb-media-gallery__progress-text {
  margin: 0;
  font-size: 14px;
  color: #666;
  text-align: center;
}

.gmkb-media-gallery__error {
  padding: 15px 20px;
  background: #fee;
  color: #c33;
  border-bottom: 1px solid #fcc;
  display: flex;
  align-items: center;
  gap: 10px;
}

.gmkb-media-gallery__loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  color: #666;
}

.gmkb-media-gallery__spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.gmkb-media-gallery__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  color: #666;
  text-align: center;
}

.gmkb-media-gallery__empty i {
  font-size: 48px;
  color: #ddd;
  margin-bottom: 15px;
}

.gmkb-media-gallery__empty h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.gmkb-media-gallery__empty p {
  margin: 0 0 20px 0;
  font-size: 14px;
}

.gmkb-media-gallery__grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 20px;
  overflow-y: auto;
}

.gmkb-media-gallery__item {
  position: relative;
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gmkb-media-gallery__item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gmkb-media-gallery__item--selected {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.gmkb-media-gallery__item-image {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background: #f0f0f0;
  overflow: hidden;
}

.gmkb-media-gallery__item-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gmkb-media-gallery__item-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #667eea;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.gmkb-media-gallery__item-info {
  padding: 10px;
}

.gmkb-media-gallery__item-title {
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gmkb-media-gallery__item-meta {
  margin: 0;
  font-size: 11px;
  color: #999;
}

.gmkb-media-gallery__item-delete {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 4px;
  color: #c33;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gmkb-media-gallery__item:hover .gmkb-media-gallery__item-delete {
  opacity: 1;
}

.gmkb-media-gallery__item-delete:hover {
  background: #c33;
  color: #fff;
}

.gmkb-media-gallery__load-more {
  padding: 20px;
  text-align: center;
  border-top: 1px solid #e0e0e0;
}

.gmkb-media-gallery__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.gmkb-media-gallery__selected-count {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.gmkb-media-gallery__footer-actions {
  display: flex;
  gap: 10px;
}

.gmkb-media-gallery__btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.gmkb-media-gallery__btn--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.gmkb-media-gallery__btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.gmkb-media-gallery__btn--secondary {
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
}

.gmkb-media-gallery__btn--secondary:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.gmkb-media-gallery__btn--upload {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.gmkb-media-gallery__btn--close {
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
  padding: 8px 12px;
}

.gmkb-media-gallery__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
