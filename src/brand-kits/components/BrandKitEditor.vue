<template>
  <div class="brand-kit-editor" :class="{ 'is-loading': store.isLoading }">
    <!-- Header -->
    <div class="editor-header">
      <div class="header-left">
        <button class="back-btn" @click="handleClose" title="Back to Brand Kits">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
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
      </div>
      <div class="header-actions">
        <span v-if="store.hasUnsavedChanges" class="unsaved-indicator">Unsaved changes</span>
        <button v-if="!isEditing" class="btn btn-secondary" @click="startEditing">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
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
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="editor-content">
        <!-- Colors Tab -->
        <div v-show="activeTab === 'colors'" class="tab-panel">
          <div class="panel-header">
            <h2>Brand Colors</h2>
            <p class="panel-description">
              Define your brand's color palette. These colors will be available throughout your
              media kits.
            </p>
          </div>

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
          <div class="presets-section">
            <h3>Quick Presets</h3>
            <div class="preset-grid">
              <button
                v-for="preset in colorPresets"
                :key="preset.name"
                class="preset-btn"
                :style="{ '--preset-color': preset.primary }"
                @click="applyPreset(preset)"
                :disabled="!isEditing"
                :title="preset.name"
              >
                <span class="preset-swatch" :style="{ backgroundColor: preset.primary }"></span>
                <span class="preset-name">{{ preset.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Fonts Tab -->
        <div v-show="activeTab === 'fonts'" class="tab-panel">
          <div class="panel-header">
            <h2>Typography</h2>
            <p class="panel-description">Choose fonts that represent your brand identity.</p>
          </div>

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
          <div class="panel-header">
            <h2>Media Library</h2>
            <p class="panel-description">
              Manage your brand assets: headshots, logos, and photos.
            </p>
          </div>

          <!-- Category Filters -->
          <div class="media-filters">
            <button
              v-for="cat in mediaCategories"
              :key="cat.id"
              class="filter-btn"
              :class="{ active: mediaFilter === cat.id }"
              @click="mediaFilter = cat.id"
            >
              <span class="filter-icon">{{ cat.icon }}</span>
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
});

const emit = defineEmits(['close', 'saved']);

const store = useBrandKitStore();

// Local state
const activeTab = ref('colors');
const mediaFilter = ref('all');
const isEditing = ref(props.mode === 'edit' || props.mode === 'create');

// Local editable copies
const localName = ref('');
const localColors = ref({});
const localFonts = ref({});

// Tabs
const tabs = [
  { id: 'colors', label: 'Colors', icon: '🎨' },
  { id: 'fonts', label: 'Fonts', icon: '🔤' },
  { id: 'media', label: 'Media', icon: '🖼️' },
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

// Media categories
const mediaCategories = [
  { id: 'all', label: 'All', icon: '📁' },
  { id: 'headshot', label: 'Headshots', icon: '👤' },
  { id: 'logo', label: 'Logos', icon: '🏢' },
  { id: 'photo', label: 'Photos', icon: '📷' },
  { id: 'background', label: 'Backgrounds', icon: '🎨' },
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
  background: #f8fafc;
}

/* Header */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.header-title h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}

.name-input {
  font-size: 20px;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid #3b82f6;
  background: transparent;
  padding: 4px 0;
  color: #0f172a;
  width: 300px;
}

.name-input:focus {
  outline: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unsaved-indicator {
  font-size: 13px;
  color: #f59e0b;
  font-style: italic;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
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
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
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

/* Tabs */
.editor-tabs {
  display: flex;
  gap: 4px;
  padding: 0 24px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #334155;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-icon {
  font-size: 16px;
}

/* Content Layout */
.editor-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  flex: 1;
  overflow: hidden;
}

.tab-panel {
  padding: 24px;
  overflow-y: auto;
}

.panel-header {
  margin-bottom: 24px;
}

.panel-header h2 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.panel-description {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Color Grid */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.color-field {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.color-field label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 8px;
}

.color-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.color-picker {
  width: 48px;
  height: 38px;
  padding: 2px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
}

.color-hex {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
}

.color-hex:focus {
  outline: none;
  border-color: #3b82f6;
}

.field-description {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

/* Presets */
.presets-section h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover:not(:disabled) {
  border-color: var(--preset-color);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--preset-color) 20%, transparent);
}

.preset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.preset-swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.preset-name {
  font-size: 13px;
  color: #334155;
}

/* Font Fields */
.font-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.font-field {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.font-field label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 8px;
}

.font-field select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.font-field select:focus {
  outline: none;
  border-color: #3b82f6;
}

.font-preview {
  margin-top: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 6px;
}

.font-preview p,
.font-preview h3 {
  margin: 0;
}

.heading-preview h3 {
  font-size: 24px;
}

/* Media Section */
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
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  color: #64748b;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #cbd5e1;
}

.filter-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.filter-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.2);
}

.media-empty {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.media-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.media-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.media-item.is-primary {
  border-color: #3b82f6;
}

.media-preview {
  position: relative;
  aspect-ratio: 1;
  background: #f8fafc;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.primary-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.media-info {
  padding: 10px;
}

.media-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-category {
  font-size: 11px;
  color: #94a3b8;
  text-transform: capitalize;
}

.media-actions {
  display: flex;
  gap: 4px;
  padding: 0 10px 10px;
}

.action-btn {
  flex: 1;
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:first-child {
  background: #fef3c7;
  color: #d97706;
}

.action-btn.edit-btn {
  background: #e0f2fe;
  color: #0284c7;
}

.action-btn.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.media-add-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  aspect-ratio: 1;
  border: 2px dashed #cbd5e1;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.media-add-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.add-icon {
  font-size: 32px;
  font-weight: 300;
}

/* Preview Panel */
.preview-panel {
  background: white;
  border-left: 1px solid #e2e8f0;
  padding: 24px;
  overflow-y: auto;
}

.preview-panel h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-card {
  background: var(--preview-background, #ffffff);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-header {
  padding: 20px;
  background: var(--preview-surface, #f8fafc);
  display: flex;
  gap: 16px;
  align-items: center;
}

.preview-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--preview-primary, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
}

.preview-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-title h4 {
  margin: 0 0 4px 0;
  font-family: var(--preview-font-heading, Inter);
  color: var(--preview-text, #1e293b);
  font-size: 16px;
}

.preview-title p {
  margin: 0;
  font-family: var(--preview-font-primary, Inter);
  color: var(--preview-text, #1e293b);
  opacity: 0.7;
  font-size: 13px;
}

.preview-content {
  padding: 20px;
  display: flex;
  gap: 12px;
}

.preview-btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-family: var(--preview-font-primary, Inter);
}

.preview-btn.primary {
  background: var(--preview-primary, #3b82f6);
  color: white;
}

.preview-btn.secondary {
  background: transparent;
  color: var(--preview-primary, #3b82f6);
  border: 1px solid var(--preview-primary, #3b82f6);
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
