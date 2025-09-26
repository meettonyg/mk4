<template>
  <div class="gmkb-sidebar">
    <!-- Tab Navigation -->
    <div class="sidebar-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- Tab Content -->
    <div class="sidebar-content">
      <!-- Components Tab -->
      <div v-show="activeTab === 'components'" class="tab-panel">
        <ComponentList />
        
        <!-- Add Component Button -->
        <div class="sidebar-actions">
          <button @click="openComponentLibrary" class="primary-action-btn">
            <span>➕</span> Add Component
          </button>
        </div>
      </div>
      
      <!-- Layout Tab -->
      <div v-show="activeTab === 'layout'" class="tab-panel">
        <div class="layout-panel">
          <h3>Sections</h3>
          
          <div class="layout-options">
            <button 
              v-for="layout in layouts" 
              :key="layout.value"
              @click="addSection(layout.value)"
              class="layout-option"
              :title="layout.label"
            >
              <div class="layout-icon" v-html="layout.icon"></div>
              <span>{{ layout.label }}</span>
            </button>
          </div>
          
          <!-- Section List -->
          <div class="section-list">
            <h4>Current Sections ({{ sectionCount }})</h4>
            <div 
              v-for="(section, index) in sections" 
              :key="section.section_id"
              class="section-item"
            >
              <span class="section-number">{{ index + 1 }}</span>
              <span class="section-type">{{ getSectionLabel(section.type) }}</span>
              <button @click="removeSection(section.section_id)" class="remove-btn" title="Remove">
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Settings Tab -->
      <div v-show="activeTab === 'settings'" class="tab-panel">
        <div class="settings-panel">
          <h3>Media Kit Settings</h3>
          
          <!-- Theme Selection -->
          <div class="setting-group">
            <label>Theme</label>
            <select v-model="selectedTheme" @change="updateTheme" class="setting-select">
              <option value="professional_clean">Professional Clean</option>
              <option value="creative_bold">Creative Bold</option>
              <option value="minimal_elegant">Minimal Elegant</option>
              <option value="modern_dark">Modern Dark</option>
            </select>
          </div>
          
          <!-- Auto-save Toggle -->
          <div class="setting-group">
            <label class="toggle-label">
              <input type="checkbox" v-model="autoSave" class="toggle-input" />
              <span>Auto-save</span>
            </label>
          </div>
          
          <!-- Export/Import -->
          <div class="setting-group">
            <button class="setting-btn">Export Media Kit</button>
            <button class="setting-btn">Import Media Kit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useMediaKitStore } from '../../../stores/mediaKit';
import ComponentList from './ComponentList.vue';

export default {
  name: 'SidebarTabs',
  components: {
    ComponentList
  },
  
  setup() {
    const store = useMediaKitStore();
    
    // Tab configuration
    const tabs = [
      { id: 'components', label: 'Components', icon: '📦' },
      { id: 'layout', label: 'Layout', icon: '🎨' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];
    
    const activeTab = ref('components');
    
    // Layout options
    const layouts = [
      { 
        value: 'full_width', 
        label: 'Full Width', 
        icon: '<svg viewBox="0 0 24 24" width="32" height="32"><rect x="3" y="8" width="18" height="8" fill="currentColor"/></svg>' 
      },
      { 
        value: 'two_column', 
        label: '2 Column', 
        icon: '<svg viewBox="0 0 24 24" width="32" height="32"><rect x="3" y="8" width="8" height="8" fill="currentColor"/><rect x="13" y="8" width="8" height="8" fill="currentColor"/></svg>' 
      },
      { 
        value: 'three_column', 
        label: '3 Column', 
        icon: '<svg viewBox="0 0 24 24" width="32" height="32"><rect x="2" y="8" width="5" height="8" fill="currentColor"/><rect x="9" y="8" width="6" height="8" fill="currentColor"/><rect x="17" y="8" width="5" height="8" fill="currentColor"/></svg>' 
      }
    ];
    
    // Computed
    const sections = computed(() => store.sections);
    const sectionCount = computed(() => store.sectionCount);
    const selectedTheme = ref(store.theme);
    const autoSave = ref(true);
    
    // Methods
    const openComponentLibrary = () => {
      store.setComponentLibraryOpen(true);
      document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
    };
    
    const addSection = (type) => {
      store.addSection(type);
      console.log('Added section:', type);
    };
    
    const removeSection = (sectionId) => {
      if (confirm('Remove this section?')) {
        store.removeSection(sectionId);
      }
    };
    
    const getSectionLabel = (type) => {
      const labels = {
        'full_width': 'Full Width',
        'two_column': 'Two Column',
        'three_column': 'Three Column'
      };
      return labels[type] || type;
    };
    
    const updateTheme = () => {
      store.theme = selectedTheme.value;
      // Trigger theme change event
      document.dispatchEvent(new CustomEvent('gmkb:theme-changed', {
        detail: { theme: selectedTheme.value }
      }));
    };
    
    return {
      tabs,
      activeTab,
      layouts,
      sections,
      sectionCount,
      selectedTheme,
      autoSave,
      openComponentLibrary,
      addSection,
      removeSection,
      getSectionLabel,
      updateTheme
    };
  }
};
</script>

<style scoped>
.gmkb-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

/* Tab Navigation */
.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.02);
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-size: 13px;
  font-weight: 500;
}

/* Tab Content */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Sidebar Actions */
.sidebar-actions {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.primary-action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.primary-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
}

/* Layout Panel */
.layout-panel {
  padding: 16px;
}

.layout-panel h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.layout-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.layout-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.layout-option:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.layout-icon {
  width: 32px;
  height: 32px;
}

.layout-option span {
  font-size: 11px;
  font-weight: 500;
}

/* Section List */
.section-list {
  margin-top: 24px;
}

.section-list h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
}

.section-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
}

.section-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
}

.section-type {
  flex: 1;
  font-size: 13px;
  color: #cbd5e1;
}

.remove-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 4px;
  color: #ef4444;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

/* Settings Panel */
.settings-panel {
  padding: 16px;
}

.settings-panel h3 {
  margin: 0 0 20px 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #94a3b8;
}

.setting-select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  cursor: pointer;
}

.setting-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.setting-btn {
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.setting-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
