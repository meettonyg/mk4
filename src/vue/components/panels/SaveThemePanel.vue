<template>
  <div class="panel-content">
    <h3>Save Custom Theme</h3>
    <p class="panel-description">Save your customizations as a new theme</p>
    
    <!-- Save Options -->
    <div class="section">
      <h4>Theme Details</h4>
      
      <div class="control-group">
        <label>
          <span class="label-text">Theme Name</span>
          <input 
            type="text" 
            class="form-control"
            v-model="themeName"
            placeholder="My Custom Theme"
          >
        </label>
      </div>
      
      <div class="control-group">
        <label>
          <span class="label-text">Description</span>
          <textarea 
            class="form-control"
            v-model="themeDescription"
            placeholder="Describe your theme..."
            rows="3"
          ></textarea>
        </label>
      </div>
    </div>
    
    <!-- Save Actions -->
    <div class="section">
      <h4>Save Options</h4>
      
      <div class="action-buttons">
        <button 
          class="action-btn save-new"
          @click="saveAsNew"
          :disabled="!themeName"
        >
          <span class="action-icon">💾</span>
          <div class="action-content">
            <strong>Save as New Theme</strong>
            <p>Create a new custom theme with your changes</p>
          </div>
        </button>
        
        <button 
          class="action-btn export"
          @click="exportTheme"
        >
          <span class="action-icon">📥</span>
          <div class="action-content">
            <strong>Export as JSON</strong>
            <p>Download theme for backup or sharing</p>
          </div>
        </button>
      </div>
      
      <div v-if="themeStore.activeTheme?.isCustom" class="action-buttons">
        <button 
          class="action-btn update"
          @click="updateCurrent"
        >
          <span class="action-icon">✏️</span>
          <div class="action-content">
            <strong>Update Current Theme</strong>
            <p>Overwrite "{{ themeStore.activeTheme.name }}" with changes</p>
          </div>
        </button>
      </div>
    </div>
    
    <!-- Theme Summary -->
    <div class="section">
      <h4>Theme Summary</h4>
      <div class="summary-container">
        <div class="summary-preview">
          <div class="color-palette">
            <div 
              v-for="(color, key) in mainColors" 
              :key="key"
              class="color-sample"
              :style="{ background: color }"
              :title="key"
            ></div>
          </div>
          
          <div class="summary-details">
            <div class="detail-item">
              <span class="detail-label">Base Theme:</span>
              <span class="detail-value">{{ baseThemeName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Font:</span>
              <span class="detail-value">{{ fontInfo }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Border Style:</span>
              <span class="detail-value">{{ borderInfo }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Customizations:</span>
              <span class="detail-value">{{ customizationCount }} changes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Success Message -->
    <Transition name="fade">
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useThemeStore } from '../../../stores/theme';

const themeStore = useThemeStore();

const themeName = ref('');
const themeDescription = ref('');
const successMessage = ref('');

const currentTheme = computed(() => themeStore.mergedTheme);

const mainColors = computed(() => {
  const theme = currentTheme.value;
  if (!theme || !theme.colors) {
    return {
      primary: '#3b82f6',
      secondary: '#2563eb',
      background: '#ffffff',
      text: '#1e293b',
      surface: '#f8fafc'
    };
  }
  return {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    background: theme.colors.background,
    text: theme.colors.text,
    surface: theme.colors.surface
  };
});

const baseThemeName = computed(() => {
  const baseTheme = themeStore.availableThemes.find(t => t.id === themeStore.activeThemeId);
  return baseTheme?.name || 'Custom';
});

const fontInfo = computed(() => {
  const font = currentTheme.value.typography.fontFamily;
  const match = font.match(/['"]([^'"]+)['"]/);
  return match ? match[1] : 'System';
});

const borderInfo = computed(() => {
  return currentTheme.value.effects.borderRadius;
});

const customizationCount = computed(() => {
  const customizations = themeStore.tempCustomizations;
  let count = 0;
  Object.values(customizations).forEach(category => {
    count += Object.keys(category).length;
  });
  return count;
});

const saveAsNew = async () => {
  if (!themeName.value) return;
  
  try {
    const newTheme = await themeStore.saveAsCustomTheme(
      themeName.value,
      themeDescription.value
    );
    
    successMessage.value = `Theme "${newTheme.name}" saved successfully!`;
    themeName.value = '';
    themeDescription.value = '';
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    
    if (window.showToast) {
      window.showToast(`Theme "${newTheme.name}" saved!`, 'success');
    }
  } catch (error) {
    console.error('Failed to save theme:', error);
    if (window.showToast) {
      window.showToast('Failed to save theme', 'error');
    }
  }
};

const updateCurrent = async () => {
  if (!themeStore.activeTheme?.isCustom) return;
  
  try {
    // Update the current custom theme with new values
    const updatedTheme = {
      ...themeStore.activeTheme,
      ...currentTheme.value
    };
    
    await themeStore.saveCustomThemeToDatabase(updatedTheme);
    
    successMessage.value = 'Theme updated successfully!';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    
    if (window.showToast) {
      window.showToast('Theme updated!', 'success');
    }
  } catch (error) {
    console.error('Failed to update theme:', error);
    if (window.showToast) {
      window.showToast('Failed to update theme', 'error');
    }
  }
};

const exportTheme = () => {
  themeStore.exportTheme();
  
  successMessage.value = 'Theme exported to file!';
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
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

textarea.form-control {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.action-buttons {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.action-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #f0f9ff;
  transform: translateX(4px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.save-new {
  border-color: #10b981;
}

.action-btn.save-new:hover:not(:disabled) {
  border-color: #10b981;
  background: #f0fdf4;
}

.action-btn.export {
  border-color: #8b5cf6;
}

.action-btn.export:hover {
  border-color: #8b5cf6;
  background: #faf5ff;
}

.action-btn.update {
  border-color: #f59e0b;
}

.action-btn.update:hover {
  border-color: #f59e0b;
  background: #fffbeb;
}

.action-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.action-content strong {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.action-content p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.summary-container {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

.summary-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.color-palette {
  display: flex;
  gap: 4px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
}

.color-sample {
  flex: 1;
  position: relative;
}

.summary-details {
  display: grid;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-label {
  color: #6b7280;
}

.detail-value {
  color: #1f2937;
  font-weight: 500;
}

.success-message {
  background: #10b981;
  color: white;
  padding: 12px 16px;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  margin-top: 20px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
