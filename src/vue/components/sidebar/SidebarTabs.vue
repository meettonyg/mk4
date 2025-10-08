<template>
  <div class="gmkb-sidebar" :class="{ 'dark-mode': isDarkMode }">
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
    
    <!-- Search - Only for Components Tab -->
    <div v-if="activeTab === 'components'" class="search-container">
      <div class="search-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search Widget..."
          class="search-input"
        />
      </div>
    </div>
    
    <!-- Tab Content -->
    <div class="sidebar-content">
      <!-- COMPONENTS TAB -->
      <div v-show="activeTab === 'components'" class="tab-panel">
        <div
          v-for="[categoryId, category] in Object.entries(categories)"
          :key="categoryId"
          class="category-section"
        >
          <button
            @click="toggleCategory(categoryId)"
            class="category-header"
          >
            <svg 
              class="chevron-icon" 
              :class="{ expanded: expandedCategories.includes(categoryId) }"
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <span class="category-label">{{ category.label }}</span>
            <span v-if="category.badge" class="pro-badge">{{ category.badge }}</span>
          </button>

          <div v-show="expandedCategories.includes(categoryId)" class="components-grid">
            <div
              v-for="component in category.components"
              :key="component.id"
              :draggable="!component.isPro"
              @dragstart="onDragStart($event, component.id)"
              @dragend="onDragEnd"
              @click="!component.isPro && addComponent(component.id)"
              class="component-card"
              :class="{ 'is-pro': component.isPro, 'is-dragging': draggingComponent === component.id }"
            >
              <div v-if="component.isPro" class="lock-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              
              <div class="component-icon-wrapper">
                <i :class="component.icon"></i>
              </div>
              
              <span class="component-label">{{ component.label }}</span>
            </div>
          </div>
        </div>

        <!-- Premium Upsell -->
        <div class="premium-cta">
          <div class="premium-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <h3>Unlock Premium</h3>
          </div>
          <p>Get advanced components and unlimited customization.</p>
          <button class="premium-button">Upgrade to Pro</button>
        </div>
      </div>

      <!-- LAYOUT TAB -->
      <div v-show="activeTab === 'layout'" class="tab-panel layout-panel">
        <div class="panel-section">
          <h3 class="panel-section-title">Section Layouts</h3>
          <div class="layout-list">
            <button
              v-for="layout in sectionLayouts"
              :key="layout.id"
              @click="selectLayout(layout.id)"
              class="layout-card"
              :class="{ active: selectedLayout === layout.id }"
            >
              <div class="layout-preview">
                <div
                  v-for="(col, index) in layout.columns"
                  :key="index"
                  class="layout-column"
                  :style="{ width: `${col.width}%` }"
                ></div>
              </div>
              
              <div class="layout-info">
                <div class="layout-name">{{ layout.label }}</div>
                <div class="layout-description">{{ layout.description }}</div>
              </div>

              <div v-if="selectedLayout === layout.id" class="selected-check">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>
          </div>

          <div class="layout-actions">
            <button @click="addSection" class="action-btn action-btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Section
            </button>
            <button @click="duplicateSection" class="action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Duplicate
            </button>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="panel-section-title">Current Sections ({{ sections.length }})</h3>
          <div class="section-list">
            <div
              v-for="(section, index) in sections"
              :key="section.section_id"
              class="section-item"
            >
              <button class="drag-handle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="5" r="1"></circle>
                  <circle cx="9" cy="12" r="1"></circle>
                  <circle cx="9" cy="19" r="1"></circle>
                  <circle cx="15" cy="5" r="1"></circle>
                  <circle cx="15" cy="12" r="1"></circle>
                  <circle cx="15" cy="19" r="1"></circle>
                </svg>
              </button>
              
              <div class="section-number">{{ index + 1 }}</div>
              
              <div class="section-details">
                <div class="section-name">{{ getSectionLabel(section.type) }}</div>
                <div class="section-meta">{{ getComponentCount(section) }} component{{ getComponentCount(section) !== 1 ? 's' : '' }}</div>
              </div>

              <button @click="removeSection(section.section_id)" class="delete-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SETTINGS TAB -->
      <div v-show="activeTab === 'settings'" class="tab-panel design-panel">
        <div class="panel-section">
          <h3 class="panel-section-title">Active Theme</h3>
          <div class="theme-list">
            <button
              v-for="theme in themes"
              :key="theme.id"
              @click="selectTheme(theme.id)"
              class="theme-card"
              :class="{ active: selectedTheme === theme.id }"
            >
              <div class="theme-swatch" :style="{ backgroundColor: theme.color }"></div>
              <span class="theme-name">{{ theme.name }}</span>
              <div v-if="selectedTheme === theme.id" class="selected-check">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
          <button class="secondary-btn">Browse All Themes</button>
        </div>

        <div class="panel-section">
          <h3 class="panel-section-title">Global Spacing</h3>
          <div class="input-group">
            <label class="input-label">Max Width</label>
            <input type="text" class="text-input" value="900px" />
          </div>
          <div class="input-group">
            <label class="input-label">Section Spacing</label>
            <input type="text" class="text-input" value="30px" />
          </div>
          <div class="input-group">
            <label class="input-label">Container Padding</label>
            <input type="text" class="text-input" value="20px" />
          </div>
        </div>

        <div class="panel-section">
          <h3 class="panel-section-title">Customize</h3>
          <button class="customize-btn">
            <div class="customize-icon">🎨</div>
            <span>Global Colors</span>
          </button>
          <button class="customize-btn">
            <div class="customize-icon">📝</div>
            <span>Global Fonts</span>
          </button>
          <button class="customize-btn">
            <div class="customize-icon">⚙️</div>
            <span>Advanced Settings</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Action Button -->
    <div class="sidebar-footer">
      <button class="footer-action-btn" @click="handleFooterAction">
        <span class="plus-icon">+</span>
        {{ getFooterButtonText }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue';
import { useMediaKitStore } from '../../../stores/mediaKit';
import { useThemeStore } from '../../../stores/theme';
import UnifiedComponentRegistry from '../../../services/UnifiedComponentRegistry';

export default {
  name: 'SidebarTabs',
  
  setup() {
    const store = useMediaKitStore();
    const themeStore = useThemeStore();
    const isDarkMode = inject('isDarkMode', ref(false));
    
    // State
    const activeTab = ref('components');
    const searchTerm = ref('');
    const expandedCategories = ref(['basic']);
    const selectedLayout = ref('full_width');
    const selectedTheme = ref(computed({
      get: () => store.theme || 'professional_clean',
      set: (value) => { store.theme = value; }
    }));
    const draggingComponent = ref(null);
    
    // Tabs
    const tabs = [
      { id: 'components', label: 'Components', icon: '☰' },
      { id: 'layout', label: 'Layout', icon: '📐' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];
    
    // Dynamic categories from registry (NO FALLBACKS - all icons in component.json)
    const categories = computed(() => {
      const registryComponents = UnifiedComponentRegistry.getAll();
      
      const basic = [];
      const media = [];
      const premium = [];
      
      registryComponents.forEach(comp => {
        const componentData = {
          id: comp.type,
          // Read icon directly from component.json (required field)
          icon: comp.icon || 'fa-solid fa-cube',
          // Read label directly from component.json
          label: comp.name || comp.type,
          isPro: comp.isPremium || false
        };
        
        // Categorize components
        if (comp.isPremium) {
          premium.push(componentData);
        } else if (['logo-grid', 'testimonials', 'contact', 'questions'].includes(comp.type)) {
          media.push(componentData);
        } else {
          basic.push(componentData);
        }
      });
      
      return {
        basic: {
          label: 'Basic',
          components: basic
        },
        media: {
          label: 'Media & Content',
          components: media
        },
        premium: {
          label: 'Premium',
          badge: 'PRO',
          components: premium
        }
      };
    });
    
    // Section Layouts
    const sectionLayouts = [
      { id: 'full_width', label: 'Full Width', columns: [{ width: 100 }], description: '100%' },
      { id: 'two_column', label: 'Two Column', columns: [{ width: 50 }, { width: 50 }], description: '50% / 50%' },
      { id: 'main_sidebar', label: 'Main + Sidebar', columns: [{ width: 70 }, { width: 30 }], description: '70% / 30%' },
      { id: 'sidebar_main', label: 'Sidebar + Main', columns: [{ width: 30 }, { width: 70 }], description: '30% / 70%' },
      { id: 'three_column', label: 'Three Column', columns: [{ width: 33 }, { width: 34 }, { width: 33 }], description: '33% / 33% / 33%' }
    ];
    
    // Themes
    const themes = computed(() => {
      if (themeStore.availableThemes && themeStore.availableThemes.length > 0) {
        return themeStore.availableThemes;
      }
      return [
        { id: 'professional_clean', name: 'Professional Clean', color: '#4f46e5' },
        { id: 'creative_bold', name: 'Creative Bold', color: '#f97316' },
        { id: 'minimal_elegant', name: 'Minimal Elegant', color: '#18181b' },
        { id: 'modern_dark', name: 'Modern Dark', color: '#8b5cf6' }
      ];
    });
    
    // Computed
    const sections = computed(() => store.sections || []);
    
    const getFooterButtonText = computed(() => {
      if (activeTab.value === 'components') return 'Add Component';
      if (activeTab.value === 'layout') return 'Add Section';
      return 'Save Changes';
    });
    
    // Methods
    const toggleCategory = (categoryId) => {
      const index = expandedCategories.value.indexOf(categoryId);
      if (index > -1) {
        expandedCategories.value.splice(index, 1);
      } else {
        expandedCategories.value.push(categoryId);
      }
    };
    
    const onDragStart = (event, componentId) => {
      draggingComponent.value = componentId;
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('component-type', componentId);
      event.dataTransfer.setData('text/plain', componentId);
      event.dataTransfer.setData('application/json', JSON.stringify({ type: componentId }));
      console.log('✅ Drag started:', componentId);
    };
    
    const onDragEnd = () => {
      draggingComponent.value = null;
    };
    
    const addComponent = (componentId) => {
      // Ensure we have at least one section
      if (store.sections.length === 0) {
        store.addSection('full_width');
      }
      
      // Add component to first section
      const firstSection = store.sections[0];
      store.addComponent({
        type: componentId,
        sectionId: firstSection.section_id
      });
      
      console.log('✅ Added component:', componentId);
    };
    
    const selectLayout = (layoutId) => {
      selectedLayout.value = layoutId;
      console.log('✅ Selected layout:', layoutId);
    };
    
    const selectTheme = (themeId) => {
      selectedTheme.value.value = themeId;
      store.theme = themeId;
      store._trackChange();
      
      document.dispatchEvent(new CustomEvent('gmkb:change-theme', {
        detail: { themeId }
      }));
      
      console.log('✅ Selected theme:', themeId);
    };
    
    const addSection = () => {
      if (selectedLayout.value) {
        store.addSection(selectedLayout.value);
        console.log('✅ Added section:', selectedLayout.value);
      }
    };
    
    const duplicateSection = () => {
      if (sections.value.length > 0) {
        const lastSection = sections.value[sections.value.length - 1];
        store.addSection(lastSection.type);
        console.log('✅ Duplicated section');
      }
    };
    
    const removeSection = (sectionId) => {
      if (confirm('Remove this section?')) {
        store.removeSection(sectionId);
        console.log('✅ Removed section:', sectionId);
      }
    };
    
    const getSectionLabel = (type) => {
      const labels = {
        'full_width': 'Full Width',
        'two_column': 'Two Column',
        'three_column': 'Three Column',
        'main_sidebar': 'Main + Sidebar',
        'sidebar_main': 'Sidebar + Main'
      };
      return labels[type] || type;
    };
    
    const getComponentCount = (section) => {
      return section.components?.length || 0;
    };
    
    const handleFooterAction = () => {
      if (activeTab.value === 'components') {
        console.log('Add component action');
      } else if (activeTab.value === 'layout') {
        addSection();
      } else {
        console.log('Save changes');
      }
    };
    
    // Refresh components from registry
    const refreshComponents = () => {
      console.log('✅ Refreshed components from registry');
    };
    
    // Event handlers
    const handleComponentsDiscovered = () => {
      refreshComponents();
    };
    
    // Lifecycle
    onMounted(() => {
      document.addEventListener('gmkb:components-discovered', handleComponentsDiscovered);
      refreshComponents();
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('gmkb:components-discovered', handleComponentsDiscovered);
    });
    
    return {
      isDarkMode,
      activeTab,
      searchTerm,
      expandedCategories,
      selectedLayout,
      selectedTheme,
      draggingComponent,
      tabs,
      categories,
      sectionLayouts,
      themes,
      sections,
      getFooterButtonText,
      toggleCategory,
      onDragStart,
      onDragEnd,
      addComponent,
      selectLayout,
      selectTheme,
      addSection,
      duplicateSection,
      removeSection,
      getSectionLabel,
      getComponentCount,
      handleFooterAction
    };
  }
};
</script>

<style scoped>
/* Global box-sizing reset */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Base Sidebar Container - LIGHT MODE DEFAULT */
.gmkb-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.gmkb-sidebar.dark-mode {
  background: #0f172a;
  border-right-color: #334155;
}

/* Tab Navigation */
.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

.dark-mode .sidebar-tabs {
  border-bottom-color: #334155;
  background: #1e293b;
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
  border-bottom: 2px solid transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 500;
}

.tab-button:hover {
  color: #111827;
  background: rgba(0, 0, 0, 0.02);
}

.dark-mode .tab-button {
  color: #9ca3af;
}

.dark-mode .tab-button:hover {
  color: #f3f4f6;
  background: rgba(255, 255, 255, 0.05);
}

.tab-button.active {
  color: #ec4899;
  border-bottom-color: #ec4899;
  background: white;
}

.dark-mode .tab-button.active {
  background: #0f172a;
}

/* Search Container */
.search-container {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.dark-mode .search-container {
  border-bottom-color: #334155;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.dark-mode .search-input {
  background: #1e293b;
  border-color: #334155;
  color: #f3f4f6;
}

/* Sidebar Content */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.tab-panel {
  padding-bottom: 16px;
}

/* Category Section */
.category-section {
  border-bottom: 1px solid #e5e7eb;
}

.dark-mode .category-section {
  border-bottom-color: #334155;
}

.category-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.category-header:hover {
  background: #f9fafb;
}

.dark-mode .category-header:hover {
  background: #1e293b;
}

.chevron-icon {
  color: #9ca3af;
  transition: transform 0.2s;
}

.chevron-icon.expanded {
  transform: rotate(90deg);
}

.category-label {
  flex: 1;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #374151;
}

.dark-mode .category-label {
  color: #d1d5db;
}

.pro-badge {
  padding: 2px 6px;
  background: linear-gradient(to right, #ec4899, #a855f7);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
}

/* Components Grid */
.components-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px 12px 16px;
}

.component-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: move;
  transition: all 0.2s;
}

.component-card:hover {
  border-color: #ec4899;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.component-card.is-pro {
  opacity: 0.6;
  cursor: not-allowed;
}

.component-card.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.dark-mode .component-card {
  background: #1e293b;
  border-color: #334155;
}

.lock-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #9ca3af;
}

.component-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 0;
}

.dark-mode .component-icon-wrapper {  
  background: transparent;
}

.component-icon-wrapper i {
  font-size: 24px;
  color: #6b7280;
  opacity: 0.7;
  transition: all 0.2s;
}

.component-card:hover .component-icon-wrapper i {
  color: #374151;
  opacity: 1;
}

.dark-mode .component-icon-wrapper i {
  color: #9ca3af;
  opacity: 0.6;
}

.dark-mode .component-card:hover .component-icon-wrapper i {
  color: #d1d5db;
  opacity: 1;
}

.component-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: #374151;
  line-height: 1.3;
}

.dark-mode .component-label {
  color: #d1d5db;
}

/* Premium CTA */
.premium-cta {
  margin: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
  border-radius: 8px;
  color: white;
}

.premium-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.premium-header h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.premium-cta p {
  font-size: 12px;
  opacity: 0.9;
  margin: 0 0 12px;
}

.premium-button {
  width: 100%;
  padding: 8px;
  background: white;
  color: #ec4899;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.premium-button:hover {
  background: #f9fafb;
}

/* Layout Panel */
.panel-section {
  margin: 16px;
  margin-bottom: 24px;
}

.panel-section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #374151;
  margin: 0 0 12px;
}

.dark-mode .panel-section-title {
  color: #d1d5db;
}

.layout-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.layout-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.layout-card:hover {
  border-color: #ec4899;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.layout-card.active {
  border-color: #ec4899;
  background: #fdf2f8;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.15);
}

.dark-mode .layout-card {
  background: #1e293b;
  border-color: #334155;
}

.dark-mode .layout-card.active {
  background: rgba(236, 72, 153, 0.1);
}

.layout-preview {
  width: 64px;
  height: 48px;
  display: flex;
  gap: 2px;
  padding: 6px;
  background: #f3f4f6;
  border-radius: 4px;
  flex-shrink: 0;
}

.dark-mode .layout-preview {
  background: #334155;
}

.layout-column {
  background: #9ca3af;
  border-radius: 2px;
}

.dark-mode .layout-column {
  background: #6b7280;
}

.layout-info {
  flex: 1;
  text-align: left;
}

.layout-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.dark-mode .layout-name {
  color: #f3f4f6;
}

.layout-description {
  font-size: 12px;
  color: #6b7280;
}

.dark-mode .layout-description {
  color: #9ca3af;
}

.selected-check {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ec4899;
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
}

/* Action Buttons */
.layout-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.dark-mode .action-btn {
  background: #1e293b;
  border-color: #334155;
  color: #d1d5db;
}

.dark-mode .action-btn:hover {
  background: #334155;
}

.action-btn-primary {
  flex: 1.5;
}

/* Section List */
.section-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.section-item:hover {
  background: #f9fafb;
}

.dark-mode .section-item {
  background: #1e293b;
  border-color: #334155;
}

.dark-mode .section-item:hover {
  background: #334155;
}

.drag-handle {
  padding: 0;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: move;
}

.section-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 4px;
  color: #06b6d4;
  font-size: 12px;
  font-weight: 600;
}

.section-details {
  flex: 1;
}

.section-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.dark-mode .section-name {
  color: #f3f4f6;
}

.section-meta {
  font-size: 12px;
  color: #6b7280;
}

.dark-mode .section-meta {
  color: #9ca3af;
}

.delete-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
  opacity: 0;
}

.section-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #ef4444;
}

/* Design Panel */
.theme-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.theme-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.theme-card:hover {
  border-color: #ec4899;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.theme-card.active {
  border-color: #ec4899;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.15);
}

.dark-mode .theme-card {
  background: #1e293b;
  border-color: #334155;
}

.theme-swatch {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #d1d5db;
  flex-shrink: 0;
}

.theme-name {
  flex: 1;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.dark-mode .theme-name {
  color: #f3f4f6;
}

.secondary-btn {
  width: 100%;
  padding: 8px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: #f9fafb;
}

.dark-mode .secondary-btn {
  background: #1e293b;
  border-color: #334155;
  color: #d1d5db;
}

/* Input Groups */
.input-group {
  margin-bottom: 12px;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.dark-mode .input-label {
  color: #d1d5db;
}

.text-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.text-input:focus {
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.dark-mode .text-input {
  background: #1e293b;
  border-color: #334155;
  color: #f3f4f6;
}

/* Customize Buttons */
.customize-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
  text-align: left;
}

.customize-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.dark-mode .customize-btn {
  background: #1e293b;
  border-color: #334155;
  color: #d1d5db;
}

.customize-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(236, 72, 153, 0.1);
  border-radius: 6px;
  font-size: 16px;
}

/* Footer */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dark-mode .sidebar-footer {
  border-top-color: #334155;
  background: #1e293b;
}

.footer-action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #ec4899;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.footer-action-btn:hover {
  background: #db2777;
}

.plus-icon {
  font-size: 18px;
  line-height: 1;
}

/* Scrollbar */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.dark-mode .sidebar-content::-webkit-scrollbar-track {
  background: #1e293b;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.dark-mode .sidebar-content::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark-mode .sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
