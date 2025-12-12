<template>
  <div class="offer-manager">
    <!-- Header -->
    <div class="offer-manager__header">
      <div class="offer-manager__title-row">
        <h2 class="offer-manager__title">Offers</h2>
        <button
          type="button"
          class="offer-manager__btn offer-manager__btn--primary"
          @click="openCreateModal"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Offer
        </button>
      </div>

      <p class="offer-manager__subtitle">
        Create and manage reusable offers that can be linked to any profile.
      </p>
    </div>

    <!-- Toolbar -->
    <div class="offer-manager__toolbar">
      <!-- Search -->
      <div class="offer-manager__search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search offers..."
          class="offer-manager__search-input"
          @input="handleSearchDebounced"
        />
      </div>

      <!-- Filters -->
      <div class="offer-manager__filters">
        <select v-model="filters.status" class="offer-manager__filter" @change="applyFilters">
          <option value="any">All Status</option>
          <option value="publish">Active</option>
          <option value="draft">Draft</option>
        </select>

        <select v-model="filters.type" class="offer-manager__filter" @change="applyFilters">
          <option value="">All Types</option>
          <option value="gift">Gifts</option>
          <option value="prize">Prizes</option>
          <option value="deal">Deals</option>
        </select>
      </div>

      <!-- View Toggle -->
      <div class="offer-manager__view-toggle">
        <button
          type="button"
          class="offer-manager__view-btn"
          :class="{ 'offer-manager__view-btn--active': viewMode === 'grid' }"
          @click="viewMode = 'grid'"
          title="Grid view"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </button>
        <button
          type="button"
          class="offer-manager__view-btn"
          :class="{ 'offer-manager__view-btn--active': viewMode === 'list' }"
          @click="viewMode = 'list'"
          title="List view"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Bulk Actions (when items selected) -->
    <div v-if="selectedOffers.length > 0" class="offer-manager__bulk-bar">
      <span class="offer-manager__bulk-count">
        {{ selectedOffers.length }} selected
      </span>
      <div class="offer-manager__bulk-actions">
        <button
          type="button"
          class="offer-manager__bulk-btn"
          @click="bulkPublish"
        >
          Publish
        </button>
        <button
          type="button"
          class="offer-manager__bulk-btn offer-manager__bulk-btn--danger"
          @click="bulkDelete"
        >
          Delete
        </button>
        <button
          type="button"
          class="offer-manager__bulk-btn offer-manager__bulk-btn--ghost"
          @click="clearSelection"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && offers.length === 0" class="offer-manager__loading">
      <div class="offer-manager__spinner"></div>
      <span>Loading offers...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && offers.length === 0" class="offer-manager__empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
      <h3>No offers yet</h3>
      <p>Create your first offer to get started.</p>
      <button
        type="button"
        class="offer-manager__btn offer-manager__btn--primary"
        @click="openCreateModal"
      >
        Create Offer
      </button>
    </div>

    <!-- Offers Grid/List -->
    <div
      v-else
      class="offer-manager__content"
      :class="{
        'offer-manager__content--grid': viewMode === 'grid',
        'offer-manager__content--list': viewMode === 'list',
      }"
    >
      <OfferCard
        v-for="offer in offers"
        :key="offer.id"
        :offer="offer"
        :selected="selectedOffers.includes(offer.id)"
        :selectable="isSelectMode"
        :show-actions="!isSelectMode"
        @click="handleOfferClick(offer)"
        @edit="openEditModal(offer)"
        @duplicate="handleDuplicate(offer)"
        @delete="handleDelete(offer)"
        @select="handleSelect(offer, $event)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="offer-manager__pagination">
      <button
        type="button"
        class="offer-manager__page-btn"
        :disabled="pagination.page === 1"
        @click="goToPage(pagination.page - 1)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <span class="offer-manager__page-info">
        Page {{ pagination.page }} of {{ pagination.pages }}
      </span>

      <button
        type="button"
        class="offer-manager__page-btn"
        :disabled="pagination.page === pagination.pages"
        @click="goToPage(pagination.page + 1)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="offer-manager__error">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{{ error }}</span>
      <button type="button" @click="error = null">Dismiss</button>
    </div>

    <!-- Editor Modal -->
    <OfferEditor
      :is-open="editorOpen"
      :offer="currentOffer"
      @close="closeEditor"
      @saved="handleSaved"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirmOpen" class="offer-manager__confirm-overlay" @click.self="closeDeleteConfirm">
      <div class="offer-manager__confirm">
        <h3>Delete Offer</h3>
        <p>
          Are you sure you want to delete "{{ offerToDelete?.title }}"?
          This action cannot be undone.
        </p>
        <div class="offer-manager__confirm-actions">
          <button
            type="button"
            class="offer-manager__btn offer-manager__btn--secondary"
            @click="closeDeleteConfirm"
          >
            Cancel
          </button>
          <button
            type="button"
            class="offer-manager__btn offer-manager__btn--danger"
            :disabled="isDeleting"
            @click="confirmDelete"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useOffers } from '../../../composables/useOffers.js';
import OfferCard from './OfferCard.vue';
import OfferEditor from './OfferEditor.vue';

const props = defineProps({
  profileId: {
    type: [Number, String],
    default: null,
  },
  selectionMode: {
    type: Boolean,
    default: false,
  },
  initialSelected: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['select', 'selection-change']);

const {
  offers,
  isLoading,
  isSaving,
  error,
  pagination,
  filters,
  fetchOffers,
  deleteOffer,
  duplicateOffer,
  setFilter,
  setPage,
} = useOffers();

// Local state
const viewMode = ref('grid');
const searchQuery = ref('');
const editorOpen = ref(false);
const currentOffer = ref(null);
const deleteConfirmOpen = ref(false);
const offerToDelete = ref(null);
const isDeleting = ref(false);
const selectedOffers = ref([...props.initialSelected]);

// Computed
const isSelectMode = computed(() => props.selectionMode || selectedOffers.value.length > 0);

// Initialize
onMounted(() => {
  fetchOffers();
});

// Watch for filter changes from parent
watch(() => props.initialSelected, (newSelected) => {
  selectedOffers.value = [...newSelected];
}, { deep: true });

// Debounced search
let searchTimeout = null;
const handleSearchDebounced = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    setFilter('search', searchQuery.value);
    fetchOffers();
  }, 300);
};

const applyFilters = () => {
  fetchOffers();
};

// Pagination
const goToPage = (page) => {
  setPage(page);
  fetchOffers({ page });
};

// Modal handlers
const openCreateModal = () => {
  currentOffer.value = null;
  editorOpen.value = true;
};

const openEditModal = (offer) => {
  currentOffer.value = offer;
  editorOpen.value = true;
};

const closeEditor = () => {
  editorOpen.value = false;
  currentOffer.value = null;
};

const handleSaved = (offer) => {
  fetchOffers();
};

// Click handler
const handleOfferClick = (offer) => {
  if (props.selectionMode) {
    toggleSelection(offer.id);
  } else {
    emit('select', offer);
  }
};

// Selection handlers
const toggleSelection = (offerId) => {
  const index = selectedOffers.value.indexOf(offerId);
  if (index === -1) {
    selectedOffers.value.push(offerId);
  } else {
    selectedOffers.value.splice(index, 1);
  }
  emit('selection-change', selectedOffers.value);
};

const handleSelect = (offer, selected) => {
  if (selected) {
    if (!selectedOffers.value.includes(offer.id)) {
      selectedOffers.value.push(offer.id);
    }
  } else {
    const index = selectedOffers.value.indexOf(offer.id);
    if (index !== -1) {
      selectedOffers.value.splice(index, 1);
    }
  }
  emit('selection-change', selectedOffers.value);
};

const clearSelection = () => {
  selectedOffers.value = [];
  emit('selection-change', []);
};

// Duplicate handler
const handleDuplicate = async (offer) => {
  try {
    await duplicateOffer(offer.id);
  } catch (err) {
    console.error('Failed to duplicate offer:', err);
  }
};

// Delete handlers
const handleDelete = (offer) => {
  offerToDelete.value = offer;
  deleteConfirmOpen.value = true;
};

const closeDeleteConfirm = () => {
  deleteConfirmOpen.value = false;
  offerToDelete.value = null;
};

const confirmDelete = async () => {
  if (!offerToDelete.value) return;

  isDeleting.value = true;
  try {
    await deleteOffer(offerToDelete.value.id);
    closeDeleteConfirm();
  } catch (err) {
    console.error('Failed to delete offer:', err);
  } finally {
    isDeleting.value = false;
  }
};

// Bulk actions
const bulkPublish = async () => {
  // Would need bulk update API endpoint
  console.log('Bulk publish:', selectedOffers.value);
  clearSelection();
};

const bulkDelete = async () => {
  if (!confirm(`Delete ${selectedOffers.value.length} offers? This cannot be undone.`)) {
    return;
  }

  for (const id of selectedOffers.value) {
    try {
      await deleteOffer(id);
    } catch (err) {
      console.error(`Failed to delete offer ${id}:`, err);
    }
  }
  clearSelection();
};

// Expose methods for parent components
defineExpose({
  refresh: fetchOffers,
  getSelected: () => selectedOffers.value,
  setSelected: (ids) => { selectedOffers.value = ids; },
});
</script>

<style scoped>
.offer-manager {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.offer-manager__header {
  margin-bottom: 24px;
}

.offer-manager__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.offer-manager__title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.offer-manager__subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.offer-manager__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.offer-manager__btn--primary {
  color: #fff;
  background: #3b82f6;
  border: 1px solid #3b82f6;
}

.offer-manager__btn--primary:hover {
  background: #2563eb;
}

.offer-manager__btn--secondary {
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
}

.offer-manager__btn--secondary:hover {
  background: #f3f4f6;
}

.offer-manager__btn--danger {
  color: #fff;
  background: #ef4444;
  border: 1px solid #ef4444;
}

.offer-manager__btn--danger:hover {
  background: #dc2626;
}

.offer-manager__toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.offer-manager__search {
  flex: 1;
  min-width: 200px;
  max-width: 320px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.offer-manager__search svg {
  color: #9ca3af;
  flex-shrink: 0;
}

.offer-manager__search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
}

.offer-manager__search-input::placeholder {
  color: #9ca3af;
}

.offer-manager__filters {
  display: flex;
  gap: 8px;
}

.offer-manager__filter {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.offer-manager__filter:focus {
  outline: none;
  border-color: #3b82f6;
}

.offer-manager__view-toggle {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.offer-manager__view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #fff;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.offer-manager__view-btn:not(:last-child) {
  border-right: 1px solid #d1d5db;
}

.offer-manager__view-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.offer-manager__view-btn--active {
  background: #3b82f6;
  color: #fff;
}

.offer-manager__view-btn--active:hover {
  background: #2563eb;
  color: #fff;
}

.offer-manager__bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
}

.offer-manager__bulk-count {
  font-size: 14px;
  font-weight: 500;
  color: #1e40af;
}

.offer-manager__bulk-actions {
  display: flex;
  gap: 8px;
}

.offer-manager__bulk-btn {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
}

.offer-manager__bulk-btn:hover {
  background: #f3f4f6;
}

.offer-manager__bulk-btn--danger {
  color: #dc2626;
  border-color: #fecaca;
  background: #fef2f2;
}

.offer-manager__bulk-btn--danger:hover {
  background: #fee2e2;
}

.offer-manager__bulk-btn--ghost {
  background: transparent;
  border-color: transparent;
}

.offer-manager__bulk-btn--ghost:hover {
  background: rgba(0, 0, 0, 0.05);
}

.offer-manager__loading,
.offer-manager__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.offer-manager__loading {
  gap: 12px;
}

.offer-manager__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.offer-manager__empty svg {
  color: #d1d5db;
  margin-bottom: 16px;
}

.offer-manager__empty h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.offer-manager__empty p {
  margin: 0 0 20px 0;
  font-size: 14px;
}

.offer-manager__content {
  display: grid;
  gap: 16px;
}

.offer-manager__content--grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.offer-manager__content--list {
  grid-template-columns: 1fr;
}

.offer-manager__content--list :deep(.offer-card) {
  display: flex;
  flex-direction: row;
}

.offer-manager__content--list :deep(.offer-card__image) {
  width: 120px;
  aspect-ratio: 1;
  flex-shrink: 0;
}

.offer-manager__content--list :deep(.offer-card__content) {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.offer-manager__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.offer-manager__page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.offer-manager__page-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #111827;
}

.offer-manager__page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.offer-manager__page-info {
  font-size: 14px;
  color: #6b7280;
}

.offer-manager__error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
}

.offer-manager__error button {
  margin-left: auto;
  padding: 4px 8px;
  font-size: 12px;
  background: transparent;
  border: none;
  color: #dc2626;
  cursor: pointer;
  text-decoration: underline;
}

.offer-manager__confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 20px;
}

.offer-manager__confirm {
  width: 100%;
  max-width: 400px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
}

.offer-manager__confirm h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.offer-manager__confirm p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.offer-manager__confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Responsive */
@media (max-width: 640px) {
  .offer-manager {
    padding: 16px;
  }

  .offer-manager__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .offer-manager__search {
    max-width: none;
  }

  .offer-manager__filters {
    justify-content: space-between;
  }

  .offer-manager__filter {
    flex: 1;
  }

  .offer-manager__content--grid {
    grid-template-columns: 1fr;
  }
}
</style>
