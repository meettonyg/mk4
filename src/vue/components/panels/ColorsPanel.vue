<template>
  <div class="panel-content">
    <h3>Color Customization</h3>
    <p class="panel-description">Customize your theme colors</p>

    <!-- Profile Branding Section - PHASE 4: Branding Integration (2025-12-16) -->
    <div v-if="hasProfileBranding" class="section profile-branding-section">
      <h4>Profile Branding</h4>
      <p class="branding-description">
        Apply your brand colors from the Profile Branding tab.
        <span v-if="brandingSummary.colorCount > 0">
          {{ brandingSummary.colorCount }} color(s) available.
        </span>
      </p>
      <div class="branding-actions">
        <button
          class="apply-branding-btn"
          @click="applyProfileBranding"
          title="Apply your profile brand colors to this theme"
        >
          <span class="btn-icon">🎨</span>
          Apply Profile Brand Colors
        </button>
      </div>
    </div>

    <!-- Color Presets -->
    <div class="section">
      <h4>Quick Presets</h4>
      <div class="preset-grid">
        <button 
          v-for="(preset, name) in themeStore.colorPresets" 
          :key="name"
          class="preset-btn"
          :style="{ 
            background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` 
          }"
          @click="themeStore.applyColorPreset(name)"
          :title="`Apply ${name} preset`"
        >
          <span class="preset-name">{{ name }}</span>
        </button>
      </div>
    </div>
    
    <!-- Custom Colors -->
    <div class="section">
      <h4>Custom Colors</h4>
      <div class="color-controls">
        <div 
          v-for="(colorDef, index) in colorDefinitions" 
          :key="colorDef.key"
          class="color-control"
        >
          <label>
            <span class="label-text">{{ colorDef.label }}</span>
            <div class="color-input-group">
              <input 
                type="color" 
                class="color-picker"
                :value="getColorValue(colorDef.key)"
                @input="updateColor(colorDef.key, $event.target.value)"
              >
              <input 
                type="text" 
                class="color-text"
                :value="getColorValue(colorDef.key)"
                @change="updateColor(colorDef.key, $event.target.value)"
                placeholder="#000000"
              >
              <button 
                v-if="hasCustomization(colorDef.key)"
                class="reset-btn"
                @click="resetColor(colorDef.key)"
                title="Reset to theme default"
              >
                ↺
              </button>
            </div>
          </label>
          <p class="color-description">{{ colorDef.description }}</p>
        </div>
      </div>
    </div>
    
    <!-- ROOT FIX: Preview removed - use main left preview panel -->
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useThemeStore } from '../../../stores/theme';

const themeStore = useThemeStore();

const currentTheme = computed(() => themeStore.mergedTheme);

// PHASE 4: Profile Branding Integration (2025-12-16)
const hasProfileBranding = computed(() => themeStore.hasProfileBranding());
const brandingSummary = computed(() => themeStore.getProfileBrandingSummary());

const applyProfileBranding = () => {
  const result = themeStore.applyProfileBranding({ colors: true, fonts: false });
  if (result.success) {
    console.log('[ColorsPanel] Profile branding applied:', result.applied);
  }
};

// ROOT FIX: Streamlined to ~8 essential color settings per design philosophy
// REMOVED: textLight (auto-generated), border (auto-generated), status colors (dev responsibility)
// ADDED: primaryText (button text), linkColor, linkHover (critical for UX)
const colorDefinitions = [
  { key: 'primary', label: 'Primary Color', description: 'Brand color for buttons and accents' },
  { key: 'primaryText', label: 'Primary Text Color', description: 'Text color on primary buttons (ensure good contrast)' },
  { key: 'secondary', label: 'Secondary Color', description: 'Accent color for secondary actions' },
  { key: 'background', label: 'Page Background', description: 'Main page background' },
  { key: 'surface', label: 'Card Background', description: 'Background for cards and components' },
  { key: 'text', label: 'Text Color', description: 'Primary text color for content' },
  { key: 'linkColor', label: 'Link Color', description: 'Color for text links (typically matches primary)' },
  { key: 'linkHover', label: 'Link Hover Color', description: 'Link color on hover (darker than link color)' }
];

const getColorValue = (key) => {
  if (!currentTheme.value || !currentTheme.value.colors) {
    // Return default colors if theme not ready
    // ROOT FIX: Updated defaults to match streamlined color palette
    const defaults = {
      primary: '#3b82f6',
      primaryText: '#ffffff',
      secondary: '#2563eb',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      linkColor: '#3b82f6',
      linkHover: '#2563eb'
    };
    return defaults[key] || '#000000';
  }
  return currentTheme.value.colors[key] || '#000000';
};

const updateColor = (key, value) => {
  themeStore.updateColor(key, value);
};

const hasCustomization = (key) => {
  return themeStore.tempCustomizations.colors[key] !== undefined;
};

const resetColor = (key) => {
  const newColors = { ...themeStore.tempCustomizations.colors };
  delete newColors[key];
  themeStore.tempCustomizations.colors = newColors;
  themeStore.applyThemeToDOM();
};

// Helper function to determine contrast color
const getContrastColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};
</script>

<style scoped>
.panel-content {
  max-width: 800px;
}

.panel-content h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.panel-description {
  margin: 0 0 24px 0;
  color: #6b7280;
  font-size: 14px;
}

.section {
  margin-bottom: 32px;
}

.section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.preset-btn {
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  overflow: hidden;
}

.preset-btn:hover {
  transform: scale(1.05);
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preset-name {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  text-transform: capitalize;
}

.color-controls {
  display: grid;
  gap: 20px;
}

.color-control label {
  display: block;
}

.label-text {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.color-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-picker {
  width: 50px;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.color-text {
  flex: 1;
  max-width: 150px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
}

.reset-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 18px;
}

.reset-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.color-description {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #9ca3af;
}

/* PHASE 4: Profile Branding Section Styles (2025-12-16) */
.profile-branding-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 16px;
}

.branding-description {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #0369a1;
}

.branding-actions {
  display: flex;
  gap: 8px;
}

.apply-branding-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(3, 105, 161, 0.2);
}

.apply-branding-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(3, 105, 161, 0.3);
}

.apply-branding-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 16px;
}

/* ROOT FIX: Preview CSS removed - using main left preview */
</style>
