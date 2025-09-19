<template>
  <div class="panel-content">
    <h3>Spacing & Layout</h3>
    <p class="panel-description">Adjust spacing, padding, and layout dimensions</p>
    
    <!-- Spacing Controls -->
    <div class="section">
      <h4>Spacing Units</h4>
      
      <div class="control-group">
        <label>
          <span class="label-text">Base Unit</span>
          <div class="range-control">
            <input 
              type="range" 
              class="form-range"
              min="4" 
              max="12" 
              :value="currentTheme.spacing.baseUnit"
              @input="updateSpacing('baseUnit', Number($event.target.value))"
            >
            <span class="range-value">{{ currentTheme.spacing.baseUnit }}px</span>
          </div>
        </label>
        <p class="control-description">Base spacing unit for consistent rhythm</p>
      </div>
      
      <div class="control-group">
        <label>
          <span class="label-text">Component Gap</span>
          <div class="range-control">
            <input 
              type="range" 
              class="form-range"
              min="8" 
              max="48" 
              step="4"
              :value="currentTheme.spacing.componentGap"
              @input="updateSpacing('componentGap', Number($event.target.value))"
            >
            <span class="range-value">{{ currentTheme.spacing.componentGap }}px</span>
          </div>
        </label>
        <p class="control-description">Space between components</p>
      </div>
      
      <div class="control-group">
        <label>
          <span class="label-text">Section Padding</span>
          <div class="range-control">
            <input 
              type="range" 
              class="form-range"
              min="16" 
              max="80" 
              step="4"
              :value="currentTheme.spacing.sectionPadding"
              @input="updateSpacing('sectionPadding', Number($event.target.value))"
            >
            <span class="range-value">{{ currentTheme.spacing.sectionPadding }}px</span>
          </div>
        </label>
        <p class="control-description">Inner padding for sections</p>
      </div>
    </div>
    
    <!-- Layout Dimensions -->
    <div class="section">
      <h4>Layout Dimensions</h4>
      
      <div class="control-group">
        <label>
          <span class="label-text">Container Max Width</span>
          <div class="range-control">
            <input 
              type="range" 
              class="form-range"
              min="960" 
              max="1440" 
              step="40"
              :value="currentTheme.spacing.containerMaxWidth"
              @input="updateSpacing('containerMaxWidth', Number($event.target.value))"
            >
            <span class="range-value">{{ currentTheme.spacing.containerMaxWidth }}px</span>
          </div>
        </label>
        <p class="control-description">Maximum width of the content container</p>
      </div>
    </div>
    
    <!-- Visual Preview -->
    <div class="section">
      <h4>Spacing Preview</h4>
      <div class="preview-container">
        <div class="preview-layout" :style="previewStyles">
          <div class="preview-section">
            <div class="preview-component">Component 1</div>
            <div class="preview-component">Component 2</div>
            <div class="preview-component">Component 3</div>
          </div>
        </div>
        <div class="preview-legend">
          <div class="legend-item">
            <span class="legend-color" style="background: rgba(59, 130, 246, 0.2)"></span>
            <span>Section Padding</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: rgba(239, 68, 68, 0.2)"></span>
            <span>Component Gap</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: rgba(16, 185, 129, 0.2)"></span>
            <span>Base Unit</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useThemeStore } from '../../../stores/theme';

const themeStore = useThemeStore();

const currentTheme = computed(() => themeStore.mergedTheme);

const updateSpacing = (key, value) => {
  themeStore.updateSpacing(key, value);
};

const previewStyles = computed(() => {
  const theme = currentTheme.value;
  return {
    '--base-unit': `${theme.spacing.baseUnit}px`,
    '--component-gap': `${theme.spacing.componentGap}px`,
    '--section-padding': `${theme.spacing.sectionPadding}px`,
    '--container-width': `${Math.min(theme.spacing.containerMaxWidth, 600)}px`,
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
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

.preview-layout {
  max-width: var(--container-width);
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.preview-section {
  padding: var(--section-padding);
  background: linear-gradient(
    to right,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(59, 130, 246, 0.1) var(--section-padding),
    transparent var(--section-padding)
  );
  display: flex;
  flex-direction: column;
  gap: var(--component-gap);
}

.preview-component {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: var(--base-unit);
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-component:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: calc(-1 * var(--component-gap));
  left: 0;
  right: 0;
  height: var(--component-gap);
  background: linear-gradient(
    to bottom,
    transparent 30%,
    rgba(239, 68, 68, 0.1) 30%,
    rgba(239, 68, 68, 0.1) 70%,
    transparent 70%
  );
  pointer-events: none;
}

.preview-legend {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}
</style>
