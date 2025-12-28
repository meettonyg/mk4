<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Offers"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @close="$emit('close')"
  >
    <template #content>
      <div class="offers-editor">
        <!-- Offer Selection -->
        <div class="editor-section">
      <h4 class="editor-section-title">Select Offers</h4>

      <div v-if="isLoadingOffers" class="loading-state">
        <div class="spinner"></div>
        Loading offers...
      </div>

      <div v-else-if="availableOffers.length === 0 && !showAddForm" class="empty-state">
        <p>No offers found. Create your first offer below.</p>
        <button type="button" class="create-link" @click="showAddForm = true">
          + Add Offer
        </button>
      </div>

      <div v-else class="offers-selector">
        <div class="search-box">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search offers..."
            class="search-input"
          />
        </div>

        <div class="offers-checklist">
          <label
            v-for="offer in filteredOffers"
            :key="offer.id"
            class="offer-checkbox"
            :class="{ 'is-selected': isSelected(offer.id) }"
          >
            <input
              type="checkbox"
              :checked="isSelected(offer.id)"
              @change="toggleOffer(offer.id)"
            />
            <span class="offer-info">
              <span class="offer-name">{{ offer.title }}</span>
              <span class="offer-meta">
                <span v-if="offer.type" class="offer-type">{{ offer.type }}</span>
                <span v-if="offer.retail_value">${{ offer.retail_value }}</span>
              </span>
            </span>
          </label>
        </div>

        <p class="selection-count">
          {{ selectedOfferIds.length }} offer{{ selectedOfferIds.length !== 1 ? 's' : '' }} selected
        </p>

        <button type="button" class="add-offer-btn" @click="showAddForm = true" v-if="!showAddForm">
          + Add New Offer
        </button>
      </div>

      <!-- Add Offer Form -->
      <div v-if="showAddForm" class="add-offer-form">
        <h5 class="form-title">Add New Offer</h5>

        <div class="field-group">
          <label class="field-label">Offer Title *</label>
          <input
            v-model="newOffer.title"
            type="text"
            class="field-input"
            placeholder="e.g., Free Consultation Call"
          />
        </div>

        <div class="field-group">
          <label class="field-label">Type</label>
          <select v-model="newOffer.type" class="field-select">
            <option value="">Select type...</option>
            <option value="gift">Gift</option>
            <option value="prize">Prize</option>
            <option value="deal">Deal</option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">URL</label>
          <input
            v-model="newOffer.url"
            type="url"
            class="field-input"
            placeholder="https://..."
          />
        </div>

        <div class="field-row">
          <div class="field-group field-half">
            <label class="field-label">Retail Value ($)</label>
            <input
              v-model.number="newOffer.retail_value"
              type="number"
              class="field-input"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div class="field-group field-half">
            <label class="field-label">CTA Text</label>
            <input
              v-model="newOffer.cta_text"
              type="text"
              class="field-input"
              placeholder="Get Offer"
            />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">Description</label>
          <textarea
            v-model="newOffer.description"
            class="field-textarea"
            placeholder="Brief description of the offer..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="cancelAddOffer">
            Cancel
          </button>
          <button
            type="button"
            class="btn-save"
            @click="saveNewOffer"
            :disabled="!newOffer.title || isSavingOffer"
          >
            {{ isSavingOffer ? 'Saving...' : 'Save Offer' }}
          </button>
        </div>

        <p v-if="saveError" class="error-message">{{ saveError }}</p>
      </div>
    </div>

    <!-- Layout Options -->
    <div class="editor-section">
      <h4 class="editor-section-title">Layout</h4>

      <div class="field-group">
        <label class="field-label">Display Style</label>
        <select v-model="localData.layout" class="field-select" @change="updateData">
          <option value="grid">Grid</option>
          <option value="list">List</option>
          <option value="featured">Featured (Single)</option>
          <option value="carousel">Carousel</option>
        </select>
      </div>

      <div v-if="localData.layout === 'grid'" class="field-group">
        <label class="field-label">Columns</label>
        <select v-model="localData.columns" class="field-select" @change="updateData">
          <option value="1">1 Column</option>
          <option value="2">2 Columns</option>
          <option value="3">3 Columns</option>
          <option value="4">4 Columns</option>
        </select>
      </div>

      <div class="field-group">
        <label class="field-label">Card Style</label>
        <select v-model="localData.cardStyle" class="field-select" @change="updateData">
          <option value="bordered">Bordered</option>
          <option value="elevated">Elevated (Shadow)</option>
          <option value="flat">Flat</option>
          <option value="gradient">Gradient</option>
        </select>
      </div>
    </div>

    <!-- Content Options -->
    <div class="editor-section">
      <h4 class="editor-section-title">Content</h4>

      <div class="field-group">
        <label class="field-label">Section Title</label>
        <input
          v-model="localData.customTitle"
          type="text"
          class="field-input"
          placeholder="Special Offers"
          @input="updateData"
        />
      </div>

      <div class="field-group">
        <label class="field-label">Title Alignment</label>
        <select v-model="localData.titleAlignment" class="field-select" @change="updateData">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div class="field-group">
        <label class="field-label">Filter by Type</label>
        <select v-model="localData.filterByType" class="field-select" @change="updateData">
          <option value="all">All Types</option>
          <option value="gift">Gifts Only</option>
          <option value="prize">Prizes Only</option>
          <option value="deal">Deals Only</option>
        </select>
      </div>

      <div class="field-group">
        <label class="field-label">Max Offers to Show</label>
        <input
          v-model.number="localData.maxOffers"
          type="number"
          class="field-input"
          min="1"
          max="20"
          @input="updateData"
        />
      </div>
    </div>

    <!-- Display Options -->
    <div class="editor-section">
      <h4 class="editor-section-title">Display Options</h4>

      <label class="checkbox-field">
        <input type="checkbox" v-model="localData.showImage" @change="updateData" />
        <span>Show Images</span>
      </label>

      <label class="checkbox-field">
        <input type="checkbox" v-model="localData.showValue" @change="updateData" />
        <span>Show Value</span>
      </label>

      <label class="checkbox-field">
        <input type="checkbox" v-model="localData.showDescription" @change="updateData" />
        <span>Show Description</span>
      </label>

      <label class="checkbox-field">
        <input type="checkbox" v-model="localData.showExpiry" @change="updateData" />
        <span>Show Expiry Date</span>
      </label>

      <label class="checkbox-field">
        <input type="checkbox" v-model="localData.showCTA" @change="updateData" />
        <span>Show CTA Button</span>
      </label>
    </div>
      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import ComponentEditorTemplate from '../../src/vue/components/sidebar/editors/ComponentEditorTemplate.vue';

const props = defineProps({
  componentId: { type: String, required: true },
  data: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['update', 'close']);
const store = useMediaKitStore();

// Active tab state
const activeTab = ref('content');

// Local state
const isLoadingOffers = ref(false);
const availableOffers = ref([]);
const searchTerm = ref('');
const showAddForm = ref(false);
const isSavingOffer = ref(false);
const saveError = ref('');

const newOffer = reactive({
  title: '',
  type: '',
  url: '',
  retail_value: null,
  cta_text: '',
  description: '',
});

const localData = reactive({
  selectedOfferIds: [],
  layout: 'grid',
  columns: '3',
  cardStyle: 'elevated',
  customTitle: 'Special Offers',
  titleAlignment: 'center',
  filterByType: 'all',
  maxOffers: 6,
  showImage: true,
  showValue: true,
  showDescription: true,
  showExpiry: true,
  showCTA: true,
  ...props.data
});

const selectedOfferIds = computed({
  get: () => localData.selectedOfferIds || [],
  set: (val) => { localData.selectedOfferIds = val; }
});

const filteredOffers = computed(() => {
  if (!searchTerm.value) return availableOffers.value;
  const term = searchTerm.value.toLowerCase();
  return availableOffers.value.filter(o =>
    o.title.toLowerCase().includes(term) ||
    (o.type && o.type.toLowerCase().includes(term))
  );
});

const isSelected = (id) => selectedOfferIds.value.includes(id);

const toggleOffer = (id) => {
  const idx = selectedOfferIds.value.indexOf(id);
  if (idx === -1) {
    selectedOfferIds.value = [...selectedOfferIds.value, id];
  } else {
    selectedOfferIds.value = selectedOfferIds.value.filter(i => i !== id);
  }
  updateData();
};

const updateData = () => {
  const updatedData = { ...localData };

  // Embed full offer data for rendering
  if (selectedOfferIds.value.length > 0) {
    updatedData.offersData = availableOffers.value.filter(o =>
      selectedOfferIds.value.includes(o.id)
    );
  }

  emit('update', updatedData);

  // Also update store directly
  if (store.components[props.componentId]) {
    store.updateComponent(props.componentId, { data: updatedData });
  }
};

const fetchOffers = async () => {
  isLoadingOffers.value = true;
  try {
    // Use correct property names from gmkbData
    const restUrl = window.gmkbData?.restUrl || '/wp-json/';
    const baseUrl = restUrl.endsWith('/') ? restUrl : restUrl + '/';
    const nonce = window.gmkbData?.restNonce || '';

    // Fetch all statuses (publish, draft, private) so user sees all their offers
    const response = await fetch(`${baseUrl}gmkb/v2/offers?per_page=100&status=any`, {
      headers: {
        'X-WP-Nonce': nonce,
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });

    if (response.ok) {
      const data = await response.json();
      availableOffers.value = Array.isArray(data) ? data : (data.offers || []);
    }
  } catch (error) {
    console.error('Failed to fetch offers:', error);
  } finally {
    isLoadingOffers.value = false;
  }
};

const resetNewOfferForm = () => {
  newOffer.title = '';
  newOffer.type = '';
  newOffer.url = '';
  newOffer.retail_value = null;
  newOffer.cta_text = '';
  newOffer.description = '';
  saveError.value = '';
};

const cancelAddOffer = () => {
  showAddForm.value = false;
  resetNewOfferForm();
};

const saveNewOffer = async () => {
  if (!newOffer.title) return;

  isSavingOffer.value = true;
  saveError.value = '';

  try {
    // Use correct property names from gmkbData
    const restUrl = window.gmkbData?.restUrl || '/wp-json/';
    const baseUrl = restUrl.endsWith('/') ? restUrl : restUrl + '/';
    const nonce = window.gmkbData?.restNonce || '';

    const response = await fetch(`${baseUrl}gmkb/v2/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        title: newOffer.title,
        type: newOffer.type || undefined,
        url: newOffer.url || undefined,
        retail_value: newOffer.retail_value || undefined,
        cta_text: newOffer.cta_text || undefined,
        description: newOffer.description || undefined,
        status: 'publish',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.offer) {
        // Add the new offer to the list and select it
        availableOffers.value.unshift(data.offer);
        selectedOfferIds.value = [...selectedOfferIds.value, data.offer.id];
        updateData();

        // Reset form and hide
        showAddForm.value = false;
        resetNewOfferForm();
      } else {
        saveError.value = data.message || 'Failed to create offer';
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      saveError.value = errorData.message || 'Failed to create offer';
    }
  } catch (error) {
    console.error('Failed to save offer:', error);
    saveError.value = 'Network error. Please try again.';
  } finally {
    isSavingOffer.value = false;
  }
};

// Initialize
onMounted(() => {
  fetchOffers();
});

// Sync props changes
watch(() => props.data, (newData) => {
  Object.assign(localData, newData);
}, { deep: true });
</script>

<style scoped>
.offers-editor {
  padding: 1rem;
}

.editor-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.editor-section:last-child {
  border-bottom: none;
}

.editor-section-title {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Loading/Empty States */
.loading-state,
.empty-state {
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.create-link {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
}

/* Search */
.search-box {
  margin-bottom: 0.75rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Offers Checklist */
.offers-checklist {
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.offer-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f3f4f6;
}

.offer-checkbox:last-child {
  border-bottom: none;
}

.offer-checkbox:hover {
  background: #f9fafb;
}

.offer-checkbox.is-selected {
  background: #eff6ff;
}

.offer-checkbox input {
  flex-shrink: 0;
}

.offer-info {
  flex: 1;
  min-width: 0;
}

.offer-name {
  display: block;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.offer-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.offer-type {
  text-transform: capitalize;
}

.selection-count {
  margin: 0.75rem 0 0;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Field Groups */
.field-group {
  margin-bottom: 1rem;
}

.field-label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field-input,
.field-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #fff;
}

.field-input:focus,
.field-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Checkbox Fields */
.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.checkbox-field input {
  width: 16px;
  height: 16px;
}

/* Add Offer Button */
.add-offer-btn {
  display: block;
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.625rem 1rem;
  background: transparent;
  color: #3b82f6;
  border: 1px dashed #3b82f6;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.add-offer-btn:hover {
  background: #eff6ff;
}

/* Add Offer Form */
.add-offer-form {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.form-title {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.field-row {
  display: flex;
  gap: 0.75rem;
}

.field-half {
  flex: 1;
}

.field-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 70px;
}

.field-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-cancel,
.btn-save {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-save {
  background: #3b82f6;
  color: #fff;
  border: none;
}

.btn-save:hover:not(:disabled) {
  background: #2563eb;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.8rem;
  border-radius: 4px;
}
</style>
