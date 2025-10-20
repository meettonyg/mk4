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
    
    <!-- ROOT FIX: Preview removed - use main left preview panel -->
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
