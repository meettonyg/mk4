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
    
    <!-- Live Preview -->
    <div class="section">
      <h4>Typography Preview</h4>
      <div class="preview-container" :style="previewStyles">
        <h1>Heading Level 1</h1>
        <h2>Heading Level 2</h2>
        <h3>Heading Level 3</h3>
        <p class="lead">
          This is a lead paragraph with slightly larger text to make it stand out from regular body text.
        </p>
        <p>
          This is regular body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p class="small">
          This is small text, typically used for captions or secondary information.
        </p>
      </div>
    </div>
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

const previewStyles = computed(() => {
  const theme = currentTheme.value;
  const baseSize = theme.typography.baseFontSize;
  const scale = theme.typography.headingScale;
  
  return {
    '--font-family': theme.typography.fontFamily,
    '--heading-family': theme.typography.headingFamily === 'inherit' 
      ? theme.typography.fontFamily 
      : theme.typography.headingFamily,
    '--font-size-base': `${baseSize}px`,
    '--font-size-h1': `${baseSize * Math.pow(scale, 4)}px`,
    '--font-size-h2': `${baseSize * Math.pow(scale, 3)}px`,
    '--font-size-h3': `${baseSize * Math.pow(scale, 2)}px`,
    '--font-size-lead': `${baseSize * 1.25}px`,
    '--font-size-small': `${baseSize * 0.875}px`,
    '--line-height': theme.typography.lineHeight,
    '--font-weight': theme.typography.fontWeight,
    'fontFamily': theme.typography.fontFamily,
    'lineHeight': theme.typography.lineHeight,
    'fontSize': `${baseSize}px`,
    'fontWeight': theme.typography.fontWeight
  };
});
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

.preview-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.preview-container h1 {
  font-family: var(--heading-family);
  font-size: var(--font-size-h1);
  line-height: 1.2;
  margin: 0 0 16px 0;
  color: #1f2937;
}

.preview-container h2 {
  font-family: var(--heading-family);
  font-size: var(--font-size-h2);
  line-height: 1.3;
  margin: 0 0 12px 0;
  color: #1f2937;
}

.preview-container h3 {
  font-family: var(--heading-family);
  font-size: var(--font-size-h3);
  line-height: 1.4;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.preview-container p {
  margin: 0 0 12px 0;
  color: #4b5563;
}

.preview-container p.lead {
  font-size: var(--font-size-lead);
  color: #374151;
}

.preview-container p.small {
  font-size: var(--font-size-small);
  color: #6b7280;
}
</style>
