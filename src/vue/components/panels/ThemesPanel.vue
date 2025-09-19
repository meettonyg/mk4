<template>
  <div class="panel-content">
    <h3>Select Theme</h3>
    <p class="panel-description">Choose a base theme or one of your custom themes</p>
    
    <!-- Built-in Themes -->
    <div class="theme-section">
      <h4>Built-in Themes</h4>
      <div class="theme-grid">
        <div 
          v-for="theme in themeStore.availableThemes" 
          :key="theme.id"
          :class="['theme-card', { active: themeStore.activeThemeId === theme.id }]"
          @click="selectTheme(theme.id)"
        >
          <div class="theme-preview">
            <div class="preview-colors">
              <div class="color-swatch primary" :style="{ background: theme.colors.primary }"></div>
              <div class="color-swatch secondary" :style="{ background: theme.colors.secondary }"></div>
              <div class="color-swatch background" :style="{ background: theme.colors.background }"></div>
              <div class="color-swatch text" :style="{ background: theme.colors.text }"></div>
            </div>
          </div>
          <div class="theme-info">
            <h5>{{ theme.name }}</h5>
            <p>{{ theme.description }}</p>
          </div>
          <div v-if="themeStore.activeThemeId === theme.id" class="active-badge">
            Active
          </div>
        </div>
      </div>
    </div>
    
    <!-- Custom Themes -->
    <div v-if="themeStore.customThemes.length > 0" class="theme-section">
      <h4>Custom Themes</h4>
      <div class="theme-grid">
        <div 
          v-for="theme in themeStore.customThemes" 
          :key="theme.id"
          :class="['theme-card custom', { active: themeStore.activeThemeId === theme.id }]"
          @click="selectTheme(theme.id)"
        >
          <div class="theme-preview">
            <div class="preview-colors">
              <div class="color-swatch primary" :style="{ background: theme.colors.primary }"></div>
              <div class="color-swatch secondary" :style="{ background: theme.colors.secondary }"></div>
              <div class="color-swatch background" :style="{ background: theme.colors.background }"></div>
              <div class="color-swatch text" :style="{ background: theme.colors.text }"></div>
            </div>
          </div>
          <div class="theme-info">
            <h5>{{ theme.name }}</h5>
            <p>{{ theme.description || 'Custom theme' }}</p>
          </div>
          <div class="theme-actions">
            <button 
              v-if="themeStore.activeThemeId === theme.id" 
              class="active-badge"
            >
              Active
            </button>
            <button 
              class="delete-btn" 
              @click.stop="deleteTheme(theme.id)"
              title="Delete theme"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Import Theme -->
    <div class="import-section">
      <h4>Import Theme</h4>
      <div class="import-controls">
        <input 
          type="file" 
          ref="fileInput" 
          accept=".json" 
          @change="handleFileImport"
          style="display: none"
        >
        <button class="btn btn-secondary" @click="$refs.fileInput.click()">
          📁 Choose File
        </button>
        <span v-if="importFileName" class="file-name">{{ importFileName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useThemeStore } from '../../../stores/theme';

const themeStore = useThemeStore();
const importFileName = ref('');

const selectTheme = (themeId) => {
  themeStore.selectTheme(themeId);
};

const deleteTheme = (themeId) => {
  if (confirm('Are you sure you want to delete this custom theme?')) {
    themeStore.deleteCustomTheme(themeId);
  }
};

const handleFileImport = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  importFileName.value = file.name;
  
  try {
    const text = await file.text();
    const themeData = JSON.parse(text);
    
    const imported = themeStore.importTheme(themeData);
    
    if (window.showToast) {
      window.showToast(`Theme "${imported.name}" imported successfully!`, 'success');
    }
  } catch (error) {
    console.error('Failed to import theme:', error);
    if (window.showToast) {
      window.showToast('Failed to import theme. Please check the file format.', 'error');
    }
  }
  
  // Reset file input
  event.target.value = '';
  importFileName.value = '';
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

.theme-section {
  margin-bottom: 32px;
}

.theme-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.theme-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.theme-card:hover {
  border-color: #93c5fd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-card.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.theme-preview {
  margin-bottom: 12px;
}

.preview-colors {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}

.color-swatch {
  width: 100%;
  height: 100%;
  position: relative;
}

.theme-info h5 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.theme-info p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.active-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #3b82f6;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  border: none;
}

.theme-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
}

.delete-btn {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  padding: 0;
}

.delete-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

.import-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.import-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-name {
  font-size: 14px;
  color: #6b7280;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}
</style>
