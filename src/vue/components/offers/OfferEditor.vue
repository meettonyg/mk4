<template>
  <div v-if="isOpen" class="offer-editor-overlay" @click.self="handleClose">
    <div class="offer-editor" :class="{ 'offer-editor--loading': isLoading }">
      <!-- Header -->
      <div class="offer-editor__header">
        <h2 class="offer-editor__title">
          {{ isEdit ? 'Edit Offer' : 'Create New Offer' }}
        </h2>
        <button type="button" class="offer-editor__close" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="offer-editor__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="offer-editor__tab"
          :class="{ 'offer-editor__tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Content -->
      <div class="offer-editor__content">
        <!-- Basic Tab -->
        <div v-show="activeTab === 'basic'" class="offer-editor__section">
          <div class="offer-editor__field">
            <label class="offer-editor__label">Offer Title *</label>
            <input
              v-model="form.title"
              type="text"
              class="offer-editor__input"
              placeholder="e.g., Free E-Book Download"
            />
          </div>

          <div class="offer-editor__row">
            <div class="offer-editor__field">
              <label class="offer-editor__label">Type *</label>
              <select v-model="form.type" class="offer-editor__select">
                <option value="">Select type...</option>
                <option value="gift">Gift (Free)</option>
                <option value="prize">Prize (Win)</option>
                <option value="deal">Deal (Discount)</option>
              </select>
            </div>

            <div class="offer-editor__field">
              <label class="offer-editor__label">Status</label>
              <select v-model="form.status" class="offer-editor__select">
                <option value="draft">Draft</option>
                <option value="publish">Active</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div class="offer-editor__field">
            <label class="offer-editor__label">Format</label>
            <select v-model="form.format" class="offer-editor__select">
              <option value="">Select format...</option>
              <option value="discount">Price Discount</option>
              <option value="trial">Trial / Introductory</option>
              <option value="content">Content (E-Book, Course, etc.)</option>
              <option value="event">Event (Training, Summit)</option>
              <option value="consultation">Consultation</option>
              <option value="addon">Add-on / Bonus</option>
              <option value="delivery">Delivery Incentive</option>
            </select>
          </div>

          <div class="offer-editor__field">
            <label class="offer-editor__label">Description</label>
            <textarea
              v-model="form.description"
              class="offer-editor__textarea"
              rows="4"
              placeholder="Describe your offer..."
            ></textarea>
          </div>

          <div class="offer-editor__row">
            <div class="offer-editor__field">
              <label class="offer-editor__label">Retail Value ($)</label>
              <input
                v-model.number="form.retail_value"
                type="number"
                min="0"
                step="0.01"
                class="offer-editor__input"
                placeholder="0.00"
              />
            </div>

            <div class="offer-editor__field">
              <label class="offer-editor__label">Cost to Recipient ($)</label>
              <input
                v-model.number="form.price_cost"
                type="number"
                min="0"
                step="0.01"
                class="offer-editor__input"
                placeholder="0.00"
              />
            </div>
          </div>

          <div v-if="form.type === 'deal'" class="offer-editor__field">
            <label class="offer-editor__label">Discount Percentage</label>
            <input
              v-model.number="form.discount_percent"
              type="number"
              min="0"
              max="100"
              class="offer-editor__input"
              placeholder="e.g., 25"
            />
          </div>

          <!-- Image Upload Placeholder -->
          <div class="offer-editor__field">
            <label class="offer-editor__label">Featured Image</label>
            <div class="offer-editor__image-upload">
              <div v-if="form.image?.url" class="offer-editor__image-preview">
                <img :src="form.image.url" alt="Offer image" />
                <button type="button" class="offer-editor__image-remove" @click="removeImage">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <button v-else type="button" class="offer-editor__image-button" @click="openMediaLibrary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Select Image</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Details Tab -->
        <div v-show="activeTab === 'details'" class="offer-editor__section">
          <div class="offer-editor__field">
            <label class="offer-editor__label">Call to Action Text</label>
            <input
              v-model="form.cta_text"
              type="text"
              class="offer-editor__input"
              placeholder="e.g., Get Your Free Copy"
            />
          </div>

          <div class="offer-editor__field">
            <label class="offer-editor__label">Landing Page URL *</label>
            <input
              v-model="form.url"
              type="url"
              class="offer-editor__input"
              placeholder="https://..."
            />
          </div>

          <div class="offer-editor__field">
            <label class="offer-editor__label">Promo Code</label>
            <input
              v-model="form.code"
              type="text"
              class="offer-editor__input"
              placeholder="e.g., PODCAST25"
            />
          </div>

          <div class="offer-editor__field">
            <label class="offer-editor__label">How to Redeem</label>
            <textarea
              v-model="form.redemption_instructions"
              class="offer-editor__textarea"
              rows="3"
              placeholder="Instructions for redeeming this offer..."
            ></textarea>
          </div>

          <div class="offer-editor__field">
            <label class="offer-editor__label">Video URL (Optional)</label>
            <input
              v-model="form.video_url"
              type="url"
              class="offer-editor__input"
              placeholder="https://youtube.com/..."
            />
          </div>

          <div class="offer-editor__field">
            <label class="offer-editor__label">Reason for Offer</label>
            <input
              v-model="form.reason"
              type="text"
              class="offer-editor__input"
              placeholder="e.g., Holiday special, Thank you gift"
            />
          </div>
        </div>

        <!-- Availability Tab -->
        <div v-show="activeTab === 'availability'" class="offer-editor__section">
          <div class="offer-editor__field">
            <label class="offer-editor__label">Expiry Date</label>
            <input
              v-model="form.expiry_date"
              type="date"
              class="offer-editor__input"
            />
          </div>

          <div class="offer-editor__field">
            <label class="offer-editor__label">Quantity Limit</label>
            <input
              v-model.number="form.quantity_limit"
              type="number"
              min="0"
              class="offer-editor__input"
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div class="offer-editor__field">
            <label class="offer-editor__label">Scarcity Message</label>
            <input
              v-model="form.scarcity_text"
              type="text"
              class="offer-editor__input"
              placeholder="e.g., Only 10 spots available!"
            />
          </div>

          <div class="offer-editor__field">
            <label class="offer-editor__label">Internal Notes (Admin Only)</label>
            <textarea
              v-model="form.notes"
              class="offer-editor__textarea"
              rows="3"
              placeholder="Notes for your reference..."
            ></textarea>
          </div>
        </div>

        <!-- Presets -->
        <div v-if="!isEdit && activeTab === 'basic'" class="offer-editor__presets">
          <label class="offer-editor__label">Quick Start Templates</label>
          <div class="offer-editor__preset-buttons">
            <button
              v-for="preset in presets"
              :key="preset.id"
              type="button"
              class="offer-editor__preset"
              @click="applyPreset(preset)"
            >
              {{ preset.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="offer-editor__footer">
        <div v-if="error" class="offer-editor__error">
          {{ error }}
        </div>
        <div class="offer-editor__actions">
          <button type="button" class="offer-editor__btn offer-editor__btn--secondary" @click="handleClose">
            Cancel
          </button>
          <button
            type="button"
            class="offer-editor__btn offer-editor__btn--primary"
            :disabled="isSaving || !isValid"
            @click="handleSave"
          >
            <span v-if="isSaving" class="offer-editor__spinner"></span>
            {{ isSaving ? 'Saving...' : (isEdit ? 'Update Offer' : 'Create Offer') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useOffers } from '../../../composables/useOffers.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  offer: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'saved']);

const { createOffer, updateOffer, isSaving, error } = useOffers();

const isEdit = computed(() => !!props.offer?.id);
const activeTab = ref('basic');
const isLoading = ref(false);

const tabs = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'details', label: 'Details' },
  { id: 'availability', label: 'Availability' },
];

// Form state
const defaultForm = {
  title: '',
  type: '',
  status: 'draft',
  format: '',
  description: '',
  retail_value: null,
  price_cost: null,
  discount_percent: null,
  cta_text: '',
  url: '',
  code: '',
  redemption_instructions: '',
  video_url: '',
  reason: '',
  expiry_date: '',
  quantity_limit: null,
  scarcity_text: '',
  notes: '',
  image: null,
  image_id: null,
};

const form = reactive({ ...defaultForm });

// Presets for quick start
const presets = [
  {
    id: 'ebook',
    name: 'Free E-Book',
    data: {
      type: 'gift',
      format: 'content',
      cta_text: 'Download Now',
      price_cost: 0,
    },
  },
  {
    id: 'consultation',
    name: 'Free Consultation',
    data: {
      type: 'gift',
      format: 'consultation',
      cta_text: 'Book Your Call',
      price_cost: 0,
    },
  },
  {
    id: 'discount',
    name: 'Discount Code',
    data: {
      type: 'deal',
      format: 'discount',
      cta_text: 'Get Discount',
      discount_percent: 20,
    },
  },
  {
    id: 'giveaway',
    name: 'Giveaway Prize',
    data: {
      type: 'prize',
      cta_text: 'Enter to Win',
      price_cost: 0,
    },
  },
];

// Validation
const isValid = computed(() => {
  return form.title.trim() && form.url.trim();
});

// Watch for prop changes to populate form
watch(() => props.offer, (newOffer) => {
  if (newOffer) {
    Object.keys(defaultForm).forEach(key => {
      if (key === 'image' && newOffer.image) {
        form.image = newOffer.image;
        form.image_id = newOffer.image.id;
      } else if (newOffer[key] !== undefined) {
        form[key] = newOffer[key];
      }
    });
  } else {
    resetForm();
  }
}, { immediate: true });

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    activeTab.value = 'basic';
    if (!props.offer) {
      resetForm();
    }
  }
});

const resetForm = () => {
  Object.assign(form, defaultForm);
};

const applyPreset = (preset) => {
  Object.assign(form, preset.data);
};

const handleClose = () => {
  emit('close');
};

const handleSave = async () => {
  if (!isValid.value) return;

  try {
    const data = {
      title: form.title,
      type: form.type,
      status: form.status,
      format: form.format,
      description: form.description,
      retail_value: form.retail_value,
      price_cost: form.price_cost,
      discount_percent: form.discount_percent,
      cta_text: form.cta_text,
      url: form.url,
      code: form.code,
      redemption_instructions: form.redemption_instructions,
      video_url: form.video_url,
      reason: form.reason,
      expiry_date: form.expiry_date,
      quantity_limit: form.quantity_limit,
      scarcity_text: form.scarcity_text,
      notes: form.notes,
      image_id: form.image_id,
    };

    let result;
    if (isEdit.value) {
      result = await updateOffer(props.offer.id, data);
    } else {
      result = await createOffer(data);
    }

    if (result.success) {
      emit('saved', result.offer);
      emit('close');
    }
  } catch (err) {
    console.error('Failed to save offer:', err);
  }
};

const openMediaLibrary = () => {
  // Open WordPress media library
  if (window.wp && window.wp.media) {
    const frame = window.wp.media({
      title: 'Select Offer Image',
      button: { text: 'Use Image' },
      multiple: false,
    });

    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      form.image = {
        id: attachment.id,
        url: attachment.url,
        alt: attachment.alt,
        sizes: attachment.sizes,
      };
      form.image_id = attachment.id;
    });

    frame.open();
  } else {
    console.warn('WordPress media library not available');
  }
};

const removeImage = () => {
  form.image = null;
  form.image_id = null;
};
</script>

<style scoped>
.offer-editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.offer-editor {
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.offer-editor--loading {
  pointer-events: none;
  opacity: 0.7;
}

.offer-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.offer-editor__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.offer-editor__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.offer-editor__close:hover {
  background: #f3f4f6;
  color: #111827;
}

.offer-editor__tabs {
  display: flex;
  gap: 4px;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.offer-editor__tab {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.offer-editor__tab:hover {
  color: #111827;
  background: #fff;
}

.offer-editor__tab--active {
  color: #111827;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.offer-editor__content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.offer-editor__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.offer-editor__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.offer-editor__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.offer-editor__label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.offer-editor__input,
.offer-editor__select,
.offer-editor__textarea {
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.15s;
}

.offer-editor__input:focus,
.offer-editor__select:focus,
.offer-editor__textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.offer-editor__textarea {
  resize: vertical;
  min-height: 80px;
}

.offer-editor__image-upload {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.offer-editor__image-preview {
  position: relative;
  display: inline-block;
}

.offer-editor__image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 6px;
}

.offer-editor__image-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.offer-editor__image-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.15s;
}

.offer-editor__image-button:hover {
  color: #3b82f6;
}

.offer-editor__presets {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.offer-editor__preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.offer-editor__preset {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #3b82f6;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.15s;
}

.offer-editor__preset:hover {
  background: #dbeafe;
}

.offer-editor__footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.offer-editor__error {
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #dc2626;
  background: #fef2f2;
  border-radius: 6px;
}

.offer-editor__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.offer-editor__btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.offer-editor__btn--secondary {
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
}

.offer-editor__btn--secondary:hover {
  background: #f3f4f6;
}

.offer-editor__btn--primary {
  color: #fff;
  background: #3b82f6;
  border: 1px solid #3b82f6;
}

.offer-editor__btn--primary:hover:not(:disabled) {
  background: #2563eb;
}

.offer-editor__btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.offer-editor__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
