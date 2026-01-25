<template>
  <div class="brand-kit-selector">
    <!-- Loading State -->
    <div v-if="store.isLoading" class="loading-state">
      <div class="spinner-small"></div>
      <span>Loading brand kits...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="brandKits.length === 0" class="empty-state">
      <div class="empty-icon">🎨</div>
      <h3>No Brand Kits Yet</h3>
      <p>Create a brand kit to manage your colors, fonts, and media assets.</p>
      <button class="btn btn-primary" @click="createNew">
        <span class="btn-icon">+</span>
        Create Brand Kit
      </button>
    </div>

    <!-- Brand Kit Selection -->
    <template v-else>
      <!-- Currently Selected -->
      <div v-if="selectedBrandKit" class="selected-kit">
        <div class="kit-preview">
          <div class="color-swatches">
            <span
              class="swatch"
              :style="{ backgroundColor: selectedBrandKit.color_primary }"
            ></span>
            <span
              class="swatch"
              :style="{ backgroundColor: selectedBrandKit.color_secondary }"
            ></span>
            <span
              class="swatch"
              :style="{ backgroundColor: selectedBrandKit.color_accent }"
            ></span>
          </div>
          <div class="kit-info">
            <h4>{{ selectedBrandKit.name }}</h4>
            <p class="kit-meta">
              <span v-if="selectedBrandKit.font_primary">
                Font: {{ selectedBrandKit.font_primary }}
              </span>
              <span v-if="selectedBrandKit.media_summary?.total">
                {{ selectedBrandKit.media_summary.total }} media items
              </span>
            </p>
          </div>
        </div>
        <div class="kit-actions">
          <button class="btn btn-secondary btn-sm" @click="editSelected" title="Edit Brand Kit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            Edit
          </button>
          <button class="btn btn-text btn-sm" @click="showDropdown = !showDropdown">
            Change
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :class="{ rotated: showDropdown }"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      <!-- No Selection -->
      <div v-else class="no-selection">
        <p>No brand kit selected</p>
        <button class="btn btn-primary" @click="showDropdown = true">Select Brand Kit</button>
      </div>

      <!-- Dropdown -->
      <div v-if="showDropdown" class="kit-dropdown" v-click-outside="closeDropdown">
        <div class="dropdown-header">
          <h4>Select Brand Kit</h4>
          <button class="close-btn" @click="showDropdown = false">×</button>
        </div>

        <div class="kit-list">
          <!-- User's Brand Kits -->
          <div v-if="ownedKits.length" class="kit-group">
            <h5 class="group-label">Your Brand Kits</h5>
            <button
              v-for="kit in ownedKits"
              :key="kit.id"
              class="kit-option"
              :class="{ selected: kit.id === modelValue }"
              @click="selectKit(kit.id)"
            >
              <div class="option-swatches">
                <span class="swatch" :style="{ backgroundColor: kit.color_primary }"></span>
                <span class="swatch" :style="{ backgroundColor: kit.color_secondary }"></span>
              </div>
              <div class="option-info">
                <span class="option-name">{{ kit.name }}</span>
                <span class="option-font">{{ kit.font_primary || 'Default' }}</span>
              </div>
              <span v-if="kit.id === modelValue" class="check-icon">✓</span>
            </button>
          </div>

          <!-- Organization Brand Kits -->
          <div v-if="orgKits.length" class="kit-group">
            <h5 class="group-label">Organization</h5>
            <button
              v-for="kit in orgKits"
              :key="kit.id"
              class="kit-option"
              :class="{ selected: kit.id === modelValue }"
              @click="selectKit(kit.id)"
            >
              <div class="option-swatches">
                <span class="swatch" :style="{ backgroundColor: kit.color_primary }"></span>
                <span class="swatch" :style="{ backgroundColor: kit.color_secondary }"></span>
              </div>
              <div class="option-info">
                <span class="option-name">{{ kit.name }}</span>
                <span class="option-badge">Shared</span>
              </div>
              <span v-if="kit.id === modelValue" class="check-icon">✓</span>
            </button>
          </div>
        </div>

        <div class="dropdown-footer">
          <button class="btn btn-text" @click="createNew">
            <span class="btn-icon">+</span>
            Create New Brand Kit
          </button>
        </div>
      </div>
    </template>

    <!-- Editor Modal -->
    <Teleport to="body">
      <div v-if="showEditor" class="editor-modal">
        <div class="modal-backdrop" @click="closeEditor"></div>
        <div class="modal-content">
          <BrandKitEditor
            :brand-kit-id="editingKitId"
            :mode="editorMode"
            @close="closeEditor"
            @saved="onEditorSaved"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useBrandKitStore } from '../../stores/brandKit.js';
import BrandKitEditor from './BrandKitEditor.vue';

const props = defineProps({
  modelValue: {
    type: [Number, String, null],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const store = useBrandKitStore();

// Local state
const showDropdown = ref(false);
const showEditor = ref(false);
const editingKitId = ref(null);
const editorMode = ref('view');

// Computed
const brandKits = computed(() => store.brandKits);
const ownedKits = computed(() => store.ownedBrandKits);
const orgKits = computed(() => store.organizationBrandKits);

const selectedBrandKit = computed(() => {
  if (!props.modelValue) return null;
  return brandKits.value.find((kit) => kit.id === props.modelValue);
});

// Methods
const selectKit = (kitId) => {
  emit('update:modelValue', kitId);
  emit('change', kitId);
  showDropdown.value = false;
};

const createNew = () => {
  editingKitId.value = null;
  editorMode.value = 'create';
  showEditor.value = true;
  showDropdown.value = false;
};

const editSelected = () => {
  if (!props.modelValue) return;
  editingKitId.value = props.modelValue;
  editorMode.value = 'edit';
  showEditor.value = true;
};

const closeEditor = () => {
  showEditor.value = false;
  editingKitId.value = null;
};

const onEditorSaved = (brandKit) => {
  closeEditor();
  // If this was a new brand kit, select it
  if (editorMode.value === 'create' && brandKit?.id) {
    selectKit(brandKit.id);
  }
  // Refresh the list
  store.loadBrandKits(true);
};

const closeDropdown = () => {
  showDropdown.value = false;
};

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside);
  },
};

// Lifecycle
onMounted(() => {
  store.loadBrandKits();
});

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    store.selectBrandKit(newValue);
  }
);
</script>

<style scoped>
.brand-kit-selector {
  position: relative;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  color: #64748b;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 32px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #0f172a;
}

.empty-state p {
  margin: 0 0 20px 0;
  color: #64748b;
  font-size: 14px;
}

/* Selected Kit */
.selected-kit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  gap: 16px;
}

.kit-preview {
  display: flex;
  align-items: center;
  gap: 16px;
}

.color-swatches {
  display: flex;
  gap: 4px;
}

.swatch {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.kit-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.kit-meta {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.kit-meta span:not(:last-child)::after {
  content: '•';
  margin: 0 8px;
}

.kit-actions {
  display: flex;
  gap: 8px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 13px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-text {
  background: transparent;
  color: #64748b;
}

.btn-text:hover {
  color: #334155;
  background: #f1f5f9;
}

.btn-icon {
  font-size: 16px;
  font-weight: 600;
}

.btn svg.rotated {
  transform: rotate(180deg);
}

/* No Selection */
.no-selection {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fefce8;
  border: 1px solid #fef08a;
  border-radius: 12px;
}

.no-selection p {
  margin: 0;
  color: #854d0e;
  font-size: 14px;
}

/* Dropdown */
.kit-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f1f5f9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  color: #64748b;
}

.close-btn:hover {
  background: #e2e8f0;
}

.kit-list {
  max-height: 300px;
  overflow-y: auto;
}

.kit-group {
  padding: 8px;
}

.group-label {
  margin: 0;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kit-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.kit-option:hover {
  background: #f1f5f9;
}

.kit-option.selected {
  background: #eff6ff;
}

.option-swatches {
  display: flex;
  gap: 2px;
}

.option-swatches .swatch {
  width: 20px;
  height: 20px;
}

.option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-name {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
}

.option-font {
  font-size: 12px;
  color: #64748b;
}

.option-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 4px;
  width: fit-content;
}

.check-icon {
  color: #3b82f6;
  font-weight: 600;
}

.dropdown-footer {
  padding: 12px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.dropdown-footer .btn {
  width: 100%;
  justify-content: center;
}

/* Editor Modal */
.editor-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
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
  max-width: 1200px;
  height: 90vh;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}
</style>
