<template>
  <div class="panel-content">
    <h3>Visual Effects</h3>
    <p class="panel-description">Customize borders, shadows, and animations</p>
    
    <!-- Border Settings -->
    <div class="section">
      <h4>Borders</h4>
      
      <div class="control-group">
        <label>
          <span class="label-text">Border Radius</span>
          <select 
            class="form-control"
            :value="currentTheme.effects.borderRadius"
            @change="updateEffects('borderRadius', $event.target.value)"
          >
            <option value="0">None (Sharp)</option>
            <option value="2px">Minimal (2px)</option>
            <option value="4px">Small (4px)</option>
            <option value="6px">Medium (6px)</option>
            <option value="8px">Default (8px)</option>
            <option value="12px">Large (12px)</option>
            <option value="16px">Extra Large (16px)</option>
            <option value="24px">Rounded (24px)</option>
          </select>
        </label>
        <p class="control-description">Corner rounding for cards and buttons</p>
      </div>
    </div>
    
    <!-- Shadow Settings -->
    <div class="section">
      <h4>Shadows</h4>
      
      <div class="control-group">
        <label>
          <span class="label-text">Shadow Intensity</span>
          <select 
            class="form-control"
            :value="currentTheme.effects.shadowIntensity"
            @change="updateEffects('shadowIntensity', $event.target.value)"
          >
            <option value="none">None</option>
            <option value="subtle">Subtle</option>
            <option value="medium">Medium</option>
            <option value="strong">Strong</option>
          </select>
        </label>
        <p class="control-description">Drop shadow strength for elevated elements</p>
      </div>
    </div>
    
    <!-- Animation Settings -->
    <div class="section">
      <h4>Animations</h4>
      
      <div class="control-group">
        <label>
          <span class="label-text">Animation Speed</span>
          <select 
            class="form-control"
            :value="currentTheme.effects.animationSpeed"
            @change="updateEffects('animationSpeed', $event.target.value)"
          >
            <option value="none">No animations</option>
            <option value="fast">Fast (150ms)</option>
            <option value="normal">Normal (300ms)</option>
            <option value="slow">Slow (500ms)</option>
          </select>
        </label>
        <p class="control-description">Transition and animation duration</p>
      </div>
    </div>
    
    <!-- Special Effects -->
    <div class="section">
      <h4>Special Effects</h4>
      
      <div class="control-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="currentTheme.effects.gradients"
            @change="updateEffects('gradients', $event.target.checked)"
          >
          <span class="checkbox-text">Use gradient backgrounds</span>
        </label>
        <p class="control-description">Apply subtle gradients to backgrounds</p>
      </div>
      
      <div class="control-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="currentTheme.effects.blurEffects"
            @change="updateEffects('blurEffects', $event.target.checked)"
          >
          <span class="checkbox-text">Enable blur effects</span>
        </label>
        <p class="control-description">Glassmorphism and backdrop blur (modern browsers)</p>
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

const updateEffects = (key, value) => {
  themeStore.updateEffects(key, value);
};

// ROOT FIX: Preview styles removed - using main left preview
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.control-description {
  margin: 4px 0 0 26px;
  font-size: 12px;
  color: #9ca3af;
}

/* ROOT FIX: Preview CSS removed - using main left preview */
</style>
