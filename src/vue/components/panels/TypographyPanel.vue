<template>
  <div class="panel-content">
    <h3>Typography Settings</h3>
    <p class="panel-description">Customize fonts, sizes, and text styling</p>
    
    <!-- Font Family -->
    <div class="section">
      <h4>Font Family</h4>
      
      <div class="control-group">
        <label>
          <span class="label-text">Primary Font (Body Text)</span>
          <select 
            class="form-control"
            :value="currentTheme.typography.fontFamily"
            @change="updateTypography('fontFamily', $event.target.value)"
          >
            <option value="system-ui, -apple-system, sans-serif">System Default</option>
            <option value="'Inter', system-ui, sans-serif">Inter</option>
            <option value="'Roboto', sans-serif">Roboto</option>
            <option value="'Open Sans', sans-serif">Open Sans</option>
            <option value="'Lato', sans-serif">Lato</option>
            <option value="'Poppins', sans-serif">Poppins</option>
            <option value="'Montserrat', sans-serif">Montserrat</option>
            <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
          </select>
        </label>
      </div>
      
      <div class="control-group">
        <label>
          <span class="label-text">Heading Font</span>
          <select 
            class="form-control"
            :value="currentTheme.typography.headingFamily"
            @change="updateTypography('headingFamily', $event.target.value)"
          >
            <option value="inherit">Same as body</option>
            <option value="'Playfair Display', serif">Playfair Display</option>
            <option value="'Merriweather', serif">Merriweather</option>
            <option value="'Georgia', serif">Georgia</option>
            <option value="'Lora', serif">Lora</option>
            <option value="'Raleway', sans-serif">Raleway</option>
            <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
            <option value="'Oswald', sans-serif">Oswald</option>
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
</style>
