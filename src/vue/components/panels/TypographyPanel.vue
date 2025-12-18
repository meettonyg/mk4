<template>
  <div class="panel-content">
    <h3>Typography Settings</h3>
    <p class="panel-description">Customize fonts, sizes, and text styling</p>

    <!-- Profile Branding Section - PHASE 7: Typography Integration (2025-12-16) -->
    <div v-if="hasProfileFonts" class="section profile-branding-section">
      <h4>Profile Branding</h4>
      <p class="branding-description">
        Apply your brand fonts from the Profile Branding tab.
        <span v-if="brandingSummary.fontCount > 0">
          {{ brandingSummary.fontCount }} font(s) available.
        </span>
      </p>
      <div class="branding-actions">
        <button
          class="apply-branding-btn"
          @click="applyProfileFonts"
          title="Apply your profile brand fonts to this theme"
        >
          <span class="btn-icon">🔤</span>
          Apply Profile Brand Fonts
        </button>
      </div>
    </div>

    <!-- Font Family -->
    <div class="section">
      <h4>Font Family</h4>

      <div class="control-group">
        <label>
          <span class="label-text">Primary Font (Body Text)</span>
          <select
            class="form-control"
            :value="currentFontFamily"
            @change="updateTypography('fontFamily', $event.target.value)"
          >
            <optgroup label="System Fonts">
              <option value="system-ui, -apple-system, sans-serif">System Default</option>
              <option value="'Georgia', serif">Georgia</option>
            </optgroup>
            <optgroup label="Sans-Serif">
              <option value="'Inter', sans-serif">Inter</option>
              <option value="'Lato', sans-serif">Lato</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
              <option value="'Oswald', sans-serif">Oswald</option>
              <option value="'Poppins', sans-serif">Poppins</option>
              <option value="'Raleway', sans-serif">Raleway</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Roboto Condensed', sans-serif">Roboto Condensed</option>
              <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
              <option value="'Ubuntu', sans-serif">Ubuntu</option>
            </optgroup>
            <optgroup label="Serif">
              <option value="'Amiri', serif">Amiri</option>
              <option value="'Lora', serif">Lora</option>
              <option value="'Merriweather', serif">Merriweather</option>
              <option value="'Playfair Display', serif">Playfair Display</option>
              <option value="'Roboto Slab', serif">Roboto Slab</option>
            </optgroup>
            <optgroup label="Display">
              <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
              <option value="'Bonbon', cursive">Bonbon</option>
            </optgroup>
          </select>
        </label>
      </div>

      <div class="control-group">
        <label>
          <span class="label-text">Heading Font</span>
          <select
            class="form-control"
            :value="currentHeadingFamily"
            @change="updateTypography('headingFamily', $event.target.value)"
          >
            <option value="inherit">Same as body</option>
            <optgroup label="Sans-Serif">
              <option value="'Inter', sans-serif">Inter</option>
              <option value="'Lato', sans-serif">Lato</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
              <option value="'Oswald', sans-serif">Oswald</option>
              <option value="'Poppins', sans-serif">Poppins</option>
              <option value="'Raleway', sans-serif">Raleway</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Roboto Condensed', sans-serif">Roboto Condensed</option>
              <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
              <option value="'Ubuntu', sans-serif">Ubuntu</option>
            </optgroup>
            <optgroup label="Serif">
              <option value="'Amiri', serif">Amiri</option>
              <option value="'Georgia', serif">Georgia</option>
              <option value="'Lora', serif">Lora</option>
              <option value="'Merriweather', serif">Merriweather</option>
              <option value="'Playfair Display', serif">Playfair Display</option>
              <option value="'Roboto Slab', serif">Roboto Slab</option>
            </optgroup>
            <optgroup label="Display">
              <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
              <option value="'Bonbon', cursive">Bonbon</option>
            </optgroup>
          </select>
        </label>
      </div>
    </div>
    
    <!-- Font Sizes -->
    <div class="section">
      <h4>Font Sizes</h4>
      
      <div class="control-group">
        <label>
          <span class="label-text">Base Font Size</span>
          <div class="range-control">
            <input 
              type="range" 
              class="form-range"
              min="12" 
              max="20" 
              :value="currentTheme.typography.baseFontSize"
              @input="updateTypography('baseFontSize', Number($event.target.value))"
            >
            <span class="range-value">{{ currentTheme.typography.baseFontSize }}px</span>
          </div>
        </label>
        <p class="control-description">Controls the base size for all text</p>
      </div>
      
      <div class="control-group">
        <label>
          <span class="label-text">Heading Scale</span>
          <div class="range-control">
            <input 
              type="range" 
              class="form-range"
              min="1.1" 
              max="1.5" 
              step="0.05"
              :value="currentTheme.typography.headingScale"
              @input="updateTypography('headingScale', Number($event.target.value))"
            >
            <span class="range-value">{{ currentTheme.typography.headingScale.toFixed(2) }}x</span>
          </div>
        </label>
        <p class="control-description">Multiplier for heading sizes (H1 → H6)</p>
      </div>
    </div>
    
    <!-- Text Properties -->
    <div class="section">
      <h4>Text Properties</h4>
      
      <div class="control-group">
        <label>
          <span class="label-text">Line Height</span>
          <div class="range-control">
            <input 
              type="range" 
              class="form-range"
              min="1.2" 
              max="2" 
              step="0.1"
              :value="currentTheme.typography.lineHeight"
              @input="updateTypography('lineHeight', Number($event.target.value))"
            >
            <span class="range-value">{{ currentTheme.typography.lineHeight.toFixed(1) }}</span>
          </div>
        </label>
        <p class="control-description">Space between lines of text</p>
      </div>
      
      <div class="control-group">
        <label>
          <span class="label-text">Font Weight</span>
          <select 
            class="form-control"
            :value="currentTheme.typography.fontWeight"
            @change="updateTypography('fontWeight', Number($event.target.value))"
          >
            <option :value="300">Light (300)</option>
            <option :value="400">Regular (400)</option>
            <option :value="500">Medium (500)</option>
            <option :value="600">Semi-Bold (600)</option>
            <option :value="700">Bold (700)</option>
          </select>
        </label>
        <p class="control-description">Default weight for body text</p>
      </div>
    </div>
    
    <!-- ROOT FIX: Preview removed - use main left preview panel -->
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useThemeStore } from '../../../stores/theme';

const themeStore = useThemeStore();

const currentTheme = computed(() => themeStore.mergedTheme);

// PHASE 7: Profile Branding Integration (2025-12-16)
const brandingSummary = computed(() => themeStore.getProfileBrandingSummary());
const hasProfileFonts = computed(() => brandingSummary.value.fontCount > 0);

/**
 * Font family options map for normalizing values
 * Maps font names to their full CSS values used in dropdown options
 */
const fontFamilyMap = {
  'Inter': "'Inter', sans-serif",
  'Lato': "'Lato', sans-serif",
  'Montserrat': "'Montserrat', sans-serif",
  'Open Sans': "'Open Sans', sans-serif",
  'Oswald': "'Oswald', sans-serif",
  'Poppins': "'Poppins', sans-serif",
  'Raleway': "'Raleway', sans-serif",
  'Roboto': "'Roboto', sans-serif",
  'Roboto Condensed': "'Roboto Condensed', sans-serif",
  'Source Sans Pro': "'Source Sans Pro', sans-serif",
  'Ubuntu': "'Ubuntu', sans-serif",
  'Amiri': "'Amiri', serif",
  'Georgia': "'Georgia', serif",
  'Lora': "'Lora', serif",
  'Merriweather': "'Merriweather', serif",
  'Playfair Display': "'Playfair Display', serif",
  'Roboto Slab': "'Roboto Slab', serif",
  'Bebas Neue': "'Bebas Neue', sans-serif",
  'Bonbon': "'Bonbon', cursive",
};

/**
 * Normalize font family value to match dropdown option
 * Extracts the font name and maps it to the standard format
 */
const normalizeFontFamily = (value) => {
  if (!value) return 'system-ui, -apple-system, sans-serif';

  // Extract font name from value like "'Amiri', sans-serif" or "Amiri"
  const match = value.match(/['"]?([^'"]+)['"]?/);
  if (match) {
    const fontName = match[1].trim();
    // Check if we have a mapping for this font
    if (fontFamilyMap[fontName]) {
      return fontFamilyMap[fontName];
    }
  }

  // Return original value if no mapping found
  return value;
};

/**
 * Get current font family value, normalized to match dropdown options
 */
const currentFontFamily = computed(() => {
  return normalizeFontFamily(currentTheme.value.typography.fontFamily);
});

/**
 * Get current heading family value, normalized to match dropdown options
 */
const currentHeadingFamily = computed(() => {
  const value = currentTheme.value.typography.headingFamily;
  if (!value || value === 'inherit') return 'inherit';
  return normalizeFontFamily(value);
});

const applyProfileFonts = () => {
  const result = themeStore.applyProfileBranding({ colors: false, fonts: true });
  if (result.success) {
    console.log('[TypographyPanel] Profile fonts applied:', result.applied);
  }
};

const updateTypography = (key, value) => {
  themeStore.updateTypography(key, value);
};

// ROOT FIX: previewStyles removed - using main left preview
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

.control-group {
  margin-bottom: 20px;
}

.control-group label {
  display: block;
}

.label-text {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #1f2937;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.range-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-range {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.form-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.form-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.range-value {
  min-width: 60px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
}

.control-description {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #9ca3af;
}

/* ROOT FIX: Preview CSS removed - using main left preview */

/* PHASE 7: Profile Branding Section Styles (2025-12-16) */
.profile-branding-section {
  background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%);
  border: 1px solid #e879f9;
  border-radius: 12px;
  padding: 16px;
}

.branding-description {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #a21caf;
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
  background: linear-gradient(135deg, #c026d3 0%, #a21caf 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(162, 28, 175, 0.2);
}

.apply-branding-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(162, 28, 175, 0.3);
}

.apply-branding-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 16px;
}
</style>
