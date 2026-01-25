<template>
  <div class="brand-kit-editor" :class="{ 'is-loading': store.isLoading }">
    <!-- Header -->
    <div class="editor-header">
      <div class="header-title">
        <input
          v-if="isEditing"
          v-model="localName"
          type="text"
          class="name-input"
          placeholder="Brand Kit Name"
          @input="markDirty"
        />
        <h1 v-else>{{ brandKit?.name || 'New Brand Kit' }}</h1>
      </div>
      <div class="header-actions">
        <button v-if="!isEditing" class="btn btn-secondary" @click="startEditing">
          Edit
        </button>
        <template v-else>
          <button class="btn btn-secondary" @click="cancelEditing" :disabled="store.isSaving">
            Cancel
          </button>
          <button class="btn btn-primary" @click="saveChanges" :disabled="store.isSaving">
            <span v-if="store.isSaving">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </template>
        <button class="close-btn" @click="handleClose" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading brand kit...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn btn-secondary" @click="store.clearError">Dismiss</button>
    </div>

    <!-- Editor Content -->
    <template v-else>
      <!-- Tabs -->
      <div class="editor-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="editor-content">
        <!-- Colors Tab -->
        <div v-show="activeTab === 'colors'" class="tab-panel">
          <div class="section-header">
            <h2>Color Customization</h2>
            <p class="section-description">Customize your brand colors</p>
          </div>

          <h3 class="section-label">CUSTOM COLORS</h3>
          <div class="color-grid">
            <div v-for="(config, key) in colorFields" :key="key" class="color-field">
              <label :for="key">{{ config.label }}</label>
              <div class="color-input-group">
                <input
                  type="color"
                  :id="key"
                  :value="localColors[key] || config.default"
                  @input="updateColor(key, $event.target.value)"
                  :disabled="!isEditing"
                  class="color-picker"
                />
                <input
                  type="text"
                  :value="localColors[key] || config.default"
                  @input="updateColor(key, $event.target.value)"
                  :disabled="!isEditing"
                  class="color-hex"
                  placeholder="#000000"
                />
              </div>
              <p class="field-description">{{ config.description }}</p>
            </div>
          </div>

          <!-- Color Presets -->
          <h3 class="section-label">QUICK PRESETS</h3>
          <div class="preset-grid">
            <button
              v-for="preset in colorPresets"
              :key="preset.name"
              class="preset-btn"
              :style="{ backgroundColor: preset.primary }"
              @click="applyPreset(preset)"
              :disabled="!isEditing"
              :title="preset.name"
            >
              {{ preset.name }}
            </button>
          </div>
        </div>

        <!-- Fonts Tab -->
        <div v-show="activeTab === 'fonts'" class="tab-panel">
          <div class="section-header">
            <h2>Typography</h2>
            <p class="section-description">Choose fonts that represent your brand identity</p>
          </div>

          <h3 class="section-label">FONT SELECTION</h3>

          <div class="font-fields">
            <div class="font-field">
              <label for="font_primary">Primary Font (Body Text)</label>
              <select
                id="font_primary"
                v-model="localFonts.font_primary"
                @change="markDirty"
                :disabled="!isEditing"
              >
                <option value="">Select a font...</option>
                <optgroup label="System Fonts">
                  <option value="system-ui">System UI</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                </optgroup>
                <optgroup label="Google Fonts">
                  <option v-for="font in googleFonts" :key="font" :value="font">
                    {{ font }}
                  </option>
                </optgroup>
              </select>
              <div v-if="localFonts.font_primary" class="font-preview">
                <p :style="{ fontFamily: localFonts.font_primary }">
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>

            <div class="font-field">
              <label for="font_heading">Heading Font</label>
              <select
                id="font_heading"
                v-model="localFonts.font_heading"
                @change="markDirty"
                :disabled="!isEditing"
              >
                <option value="">Same as primary</option>
                <optgroup label="System Fonts">
                  <option value="system-ui">System UI</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                </optgroup>
                <optgroup label="Google Fonts">
                  <option v-for="font in googleFonts" :key="font" :value="font">
                    {{ font }}
                  </option>
                </optgroup>
              </select>
              <div v-if="localFonts.font_heading" class="font-preview heading-preview">
                <h3 :style="{ fontFamily: localFonts.font_heading }">Heading Preview</h3>
              </div>
            </div>

            <div class="font-field">
              <label for="font_accent">Accent Font (Optional)</label>
              <select
                id="font_accent"
                v-model="localFonts.font_accent"
                @change="markDirty"
                :disabled="!isEditing"
              >
                <option value="">None</option>
                <optgroup label="Display Fonts">
                  <option v-for="font in displayFonts" :key="font" :value="font">
                    {{ font }}
                  </option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        <!-- Media Tab -->
        <div v-show="activeTab === 'media'" class="tab-panel">
          <div class="section-header">
            <h2>Media Library</h2>
            <p class="section-description">Manage your brand assets: headshots, logos, and photos</p>
          </div>

          <!-- Category Filters -->
          <h3 class="section-label">CATEGORY</h3>
          <div class="media-filters">
            <button
              v-for="cat in mediaCategories"
              :key="cat.id"
              class="filter-btn"
              :class="{ active: mediaFilter === cat.id }"
              @click="mediaFilter = cat.id"
            >
              {{ cat.label }}
              <span v-if="mediaCounts[cat.id]" class="filter-count">
                {{ mediaCounts[cat.id] }}
              </span>
            </button>
          </div>

          <!-- Media Grid -->
          <div class="media-section">
            <div v-if="filteredMedia.length === 0" class="media-empty">
              <p>No {{ mediaFilter === 'all' ? 'media' : mediaFilter + 's' }} yet.</p>
              <button v-if="isEditing" class="btn btn-primary" @click="openMediaUploader">
                + Add Media
              </button>
            </div>

            <div v-else class="media-grid">
              <div
                v-for="item in filteredMedia"
                :key="item.id"
                class="media-item"
                :class="{ 'is-primary': item.is_primary }"
              >
                <div class="media-preview">
                  <img :src="item.sizes?.thumbnail?.url || item.url" :alt="item.alt || item.label" />
                  <span v-if="item.is_primary" class="primary-badge">Primary</span>
                </div>
                <div class="media-info">
                  <span class="media-label">{{ item.label || 'Untitled' }}</span>
                  <span class="media-category">{{ item.category }}</span>
                </div>
                <div v-if="isEditing" class="media-actions">
                  <button
                    v-if="!item.is_primary"
                    class="action-btn"
                    @click="setAsPrimary(item)"
                    title="Set as primary"
                  >
                    ★
                  </button>
                  <button class="action-btn edit-btn" @click="editMedia(item)" title="Edit">
                    ✎
                  </button>
                  <button class="action-btn delete-btn" @click="removeMedia(item)" title="Remove">
                    ×
                  </button>
                </div>
              </div>

              <!-- Add Media Button -->
              <button v-if="isEditing" class="media-add-btn" @click="openMediaUploader">
                <span class="add-icon">+</span>
                <span>Add Media</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Preview Panel (always visible on right side on desktop) -->
        <div class="preview-panel">
          <h3>Live Preview</h3>
          <div
            class="preview-card"
            :style="{
              '--preview-primary': localColors.color_primary,
              '--preview-secondary': localColors.color_secondary,
              '--preview-background': localColors.color_background,
              '--preview-text': localColors.color_text,
              '--preview-surface': localColors.color_surface,
              '--preview-font-primary': localFonts.font_primary || 'Inter',
              '--preview-font-heading': localFonts.font_heading || localFonts.font_primary || 'Inter',
            }"
          >
            <div class="preview-header">
              <div class="preview-avatar">
                <img
                  v-if="store.primaryHeadshot"
                  :src="store.primaryHeadshot.sizes?.thumbnail?.url || store.primaryHeadshot.url"
                  alt="Headshot"
                />
                <span v-else class="avatar-placeholder">👤</span>
              </div>
              <div class="preview-title">
                <h4>Sample Heading</h4>
                <p>This is body text in your brand font.</p>
              </div>
            </div>
            <div class="preview-content">
              <button class="preview-btn primary">Primary Button</button>
              <button class="preview-btn secondary">Secondary</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useBrandKitStore } from '../../stores/brandKit.js';

const props = defineProps({
  brandKitId: {
    type: [Number, String],
    default: null,
  },
  mode: {
    type: String,
    default: 'view',
    validator: (v) => ['view', 'edit', 'create'].includes(v),
  },
  initialTab: {
    type: String,
    default: 'colors',
    validator: (v) => ['colors', 'fonts', 'media'].includes(v),
  },
});

const emit = defineEmits(['close', 'saved']);

const store = useBrandKitStore();

// Local state
const activeTab = ref(props.initialTab);
const mediaFilter = ref('all');
const isEditing = ref(props.mode === 'edit' || props.mode === 'create');

// Local editable copies
const localName = ref('');
const localColors = ref({});
const localFonts = ref({});

// Tabs (no icons - consistent with Theme Customizer)
const tabs = [
  { id: 'colors', label: 'Colors' },
  { id: 'fonts', label: 'Typography' },
  { id: 'media', label: 'Media' },
];

// Color field definitions
const colorFields = {
  color_primary: {
    label: 'Primary Color',
    description: 'Main brand color for buttons and accents',
    default: '#3b82f6',
  },
  color_secondary: {
    label: 'Secondary Color',
    description: 'Secondary brand color',
    default: '#2563eb',
  },
  color_accent: {
    label: 'Accent Color',
    description: 'Accent color for highlights',
    default: '#f59e0b',
  },
  color_background: {
    label: 'Background',
    description: 'Page background color',
    default: '#ffffff',
  },
  color_surface: {
    label: 'Surface',
    description: 'Card and panel backgrounds',
    default: '#f8fafc',
  },
  color_text: {
    label: 'Text Color',
    description: 'Primary text color',
    default: '#1e293b',
  },
  color_text_muted: {
    label: 'Muted Text',
    description: 'Secondary text color',
    default: '#64748b',
  },
  color_link: {
    label: 'Link Color',
    description: 'Hyperlink color',
    default: '#3b82f6',
  },
};

// Color presets
const colorPresets = [
  { name: 'Blue', primary: '#3b82f6', secondary: '#2563eb' },
  { name: 'Green', primary: '#10b981', secondary: '#059669' },
  { name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed' },
  { name: 'Red', primary: '#ef4444', secondary: '#dc2626' },
  { name: 'Orange', primary: '#f97316', secondary: '#ea580c' },
  { name: 'Pink', primary: '#ec4899', secondary: '#db2777' },
  { name: 'Teal', primary: '#14b8a6', secondary: '#0d9488' },
  { name: 'Indigo', primary: '#6366f1', secondary: '#4f46e5' },
];

// Google Fonts list
const googleFonts = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Oswald',
  'Playfair Display',
  'Merriweather',
  'Source Sans Pro',
  'Ubuntu',
  'Nunito',
  'Work Sans',
];

const displayFonts = ['Playfair Display', 'Merriweather', 'Crimson Text', 'Libre Baskerville'];

// Media categories (no icons - consistent with Theme Customizer)
const mediaCategories = [
  { id: 'all', label: 'All' },
  { id: 'headshot', label: 'Headshots' },
  { id: 'logo', label: 'Logos' },
  { id: 'photo', label: 'Photos' },
  { id: 'background', label: 'Backgrounds' },
];

// Computed
const brandKit = computed(() => store.activeBrandKit);

const filteredMedia = computed(() => {
  if (!brandKit.value?.media) return [];
  if (mediaFilter.value === 'all') return brandKit.value.media;
  return brandKit.value.media.filter((m) => m.category === mediaFilter.value);
});

const mediaCounts = computed(() => {
  if (!brandKit.value?.media) return {};
  const counts = { all: brandKit.value.media.length };
  brandKit.value.media.forEach((m) => {
    counts[m.category] = (counts[m.category] || 0) + 1;
  });
  return counts;
});

// Methods
const initializeLocalState = () => {
  if (brandKit.value) {
    localName.value = brandKit.value.name || '';
    localColors.value = { ...store.colors };
    localFonts.value = { ...store.fonts };
  } else {
    // Defaults for new brand kit
    localName.value = '';
    localColors.value = Object.keys(colorFields).reduce((acc, key) => {
      acc[key] = colorFields[key].default;
      return acc;
    }, {});
    localFonts.value = {
      font_primary: 'Inter',
      font_heading: '',
      font_accent: '',
    };
  }
};

const updateColor = (key, value) => {
  localColors.value[key] = value;
  markDirty();
};

const applyPreset = (preset) => {
  localColors.value.color_primary = preset.primary;
  localColors.value.color_secondary = preset.secondary;
  localColors.value.color_link = preset.primary;
  markDirty();
};

const markDirty = () => {
  store.markDirty();
};

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  initializeLocalState();
  store.hasUnsavedChanges = false;
  if (props.mode === 'create') {
    emit('close');
  } else {
    isEditing.value = false;
  }
};

const saveChanges = async () => {
  try {
    const data = {
      name: localName.value,
      ...localColors.value,
      ...localFonts.value,
    };

    if (props.mode === 'create') {
      await store.createBrandKit(data);
    } else {
      await store.updateBrandKit(data);
    }

    isEditing.value = false;
    emit('saved', store.activeBrandKit);
  } catch (err) {
    console.error('Failed to save brand kit:', err);
  }
};

const handleClose = () => {
  if (store.hasUnsavedChanges) {
    if (!confirm('You have unsaved changes. Discard them?')) {
      return;
    }
  }
  store.closeEditor(true);
  emit('close');
};

const openMediaUploader = () => {
  // This would open the WordPress media library or custom uploader
  // For now, we'll use wp.media if available
  if (window.wp?.media) {
    const frame = window.wp.media({
      title: 'Add Media to Brand Kit',
      multiple: true,
      library: { type: 'image' },
    });

    frame.on('select', async () => {
      const selection = frame.state().get('selection').toJSON();
      for (const attachment of selection) {
        await store.addMedia({
          media_id: attachment.id,
          category: mediaFilter.value === 'all' ? 'photo' : mediaFilter.value,
          label: attachment.title || attachment.filename,
          tags: [],
        });
      }
    });

    frame.open();
  }
};

const setAsPrimary = async (item) => {
  await store.updateMedia(item.id, { is_primary: true });
};

const editMedia = (item) => {
  // Open edit modal for media item
  const newLabel = prompt('Enter label:', item.label);
  if (newLabel !== null) {
    store.updateMedia(item.id, { label: newLabel });
  }
};

const removeMedia = async (item) => {
  if (confirm('Remove this media from the brand kit?')) {
    await store.removeMedia(item.id);
  }
};

// Lifecycle
onMounted(async () => {
  await store.loadSchema();

  if (props.brandKitId) {
    await store.loadBrandKit(props.brandKitId);
  }

  initializeLocalState();
});

// Watch for brand kit changes
watch(
  () => store.activeBrandKit,
  () => {
    if (!store.hasUnsavedChanges) {
      initializeLocalState();
    }
  }
);
</script>

<style scoped>
.brand-kit-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

/* Header - matches Theme Customizer */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.header-title h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.name-input {
  font-size: 18px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  padding: 8px 12px;
  color: #111827;
  width: 280px;
}

.name-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

/* Buttons - matches Theme Customizer */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
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
  border-color: #9ca3af;
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
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tabs - matches Theme Customizer */
.editor-tabs {
  display: flex;
  gap: 0;
  padding: 0 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  padding: 14px 20px;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
}

.tab-btn:hover {
  color: #374151;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

/* Content Layout */
.editor-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  flex: 1;
  overflow: hidden;
}

.tab-panel {
  padding: 24px;
  overflow-y: auto;
  background: #ffffff;
}

/* Section Headers - matches Theme Customizer */
.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.section-description {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.section-label {
  margin: 0 0 12px 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Color Grid - matches Theme Customizer */
.color-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.color-field {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.color-field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.color-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.color-picker {
  width: 44px;
  height: 36px;
  padding: 2px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  background: white;
}

.color-picker:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.color-hex {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  color: #374151;
}

.color-hex:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.color-hex:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.field-description {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

/* Presets - matches Theme Customizer colored buttons */
.preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.preset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 32px 16px 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 12px;
  font-weight: 500;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.preset-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Font Fields - matches Theme Customizer */
.font-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.font-field {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.font-field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.font-field select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  color: #374151;
}

.font-field select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.font-field select:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.font-preview {
  margin-top: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.font-preview p,
.font-preview h3 {
  margin: 0;
  color: #111827;
}

.heading-preview h3 {
  font-size: 20px;
}

/* Media Section - matches Theme Customizer */
.media-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
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

.media-empty {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.media-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transition: all 0.15s;
}

.media-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.media-item.is-primary {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.media-preview {
  position: relative;
  aspect-ratio: 1;
  background: #f9fafb;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.primary-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.media-info {
  padding: 8px 10px;
}

.media-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-category {
  font-size: 11px;
  color: #9ca3af;
  text-transform: capitalize;
}

.media-actions {
  display: flex;
  gap: 4px;
  padding: 0 8px 8px;
}

.action-btn {
  flex: 1;
  padding: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}

.action-btn:first-child {
  background: #fef3c7;
  color: #b45309;
}

.action-btn.edit-btn {
  background: #dbeafe;
  color: #1d4ed8;
}

.action-btn.delete-btn {
  background: #fee2e2;
  color: #b91c1c;
}

.action-btn:hover {
  opacity: 0.8;
}

.media-add-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
}

.media-add-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.add-icon {
  font-size: 28px;
  font-weight: 300;
}

/* Preview Panel - matches Theme Customizer */
.preview-panel {
  background: #f9fafb;
  border-left: 1px solid #e5e7eb;
  padding: 20px;
  overflow-y: auto;
}

.preview-panel h3 {
  margin: 0 0 16px 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-card {
  background: var(--preview-background, #ffffff);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.preview-header {
  padding: 16px;
  background: var(--preview-surface, #f9fafb);
  display: flex;
  gap: 12px;
  align-items: center;
}

.preview-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 20px;
}

.preview-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 20px;
}

.preview-title h4 {
  margin: 0 0 2px 0;
  font-family: var(--preview-font-heading, Inter);
  color: var(--preview-text, #111827);
  font-size: 14px;
  font-weight: 600;
}

.preview-title p {
  margin: 0;
  font-family: var(--preview-font-primary, Inter);
  color: var(--preview-text, #111827);
  opacity: 0.6;
  font-size: 12px;
}

.preview-content {
  padding: 16px;
  display: flex;
  gap: 10px;
}

.preview-btn {
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: default;
  border: none;
  font-family: var(--preview-font-primary, Inter);
}

.preview-btn.primary {
  background: var(--preview-primary, #3b82f6);
  color: white;
}

.preview-btn.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

/* Responsive */
@media (max-width: 1024px) {
  .editor-content {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    display: none;
  }
}

@media (max-width: 640px) {
  .editor-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .name-input {
    width: 100%;
  }
}
</style>
