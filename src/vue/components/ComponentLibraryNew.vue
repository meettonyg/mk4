<template>
  <Teleport to="body">
    <!-- Modal Overlay -->
    <Transition name="modal-fade">
      <div 
        v-if="isOpen" 
        class="gmkb-modal-overlay" 
        @click.self="close"
      >
        <!-- Modal Content -->
        <Transition name="modal-slide">
          <div v-if="isOpen" class="gmkb-modal-container">
            <!-- Header -->
            <div class="gmkb-modal-header">
              <h2 class="gmkb-modal-title">
                <svg class="gmkb-modal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="12" y1="3" x2="12" y2="21"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                </svg>
                Component Library
              </h2>
              <button 
                class="gmkb-modal-close" 
                @click="close"
                aria-label="Close modal"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Search and Filter Bar -->
            <div class="gmkb-library-controls">
              <div class="gmkb-search-wrapper">
                <svg class="gmkb-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input 
                  v-model="searchTerm"
                  type="text" 
                  class="gmkb-search-input"
                  placeholder="Search components..."
                  @input="filterComponents"
                />
              </div>
              
              <select 
                v-model="selectedCategory" 
                class="gmkb-category-select"
                @change="filterComponents"
              >
                <option value="all">All Categories</option>
                <option 
                  v-for="(label, key) in categories" 
                  :key="key" 
                  :value="key"
                >
                  {{ label }}
                </option>
              </select>
            </div>

            <!-- Component Grid -->
            <div class="gmkb-library-body">
              <div v-if="filteredComponents.length > 0" class="gmkb-component-grid">
                <div
                  v-for="component in filteredComponents"
                  :key="component.type"
                  class="gmkb-component-card"
                  :class="{ 'gmkb-component-card--premium': component.isPremium }"
                >
                  <div class="gmkb-component-card-header">
                    <div class="gmkb-component-icon">
                      <component :is="getIcon(component.icon)" />
                    </div>
                    <span 
                      v-if="component.isPremium" 
                      class="gmkb-premium-badge"
                    >
                      PRO
                    </span>
                  </div>
                  
                  <h3 class="gmkb-component-name">{{ component.name }}</h3>
                  <p class="gmkb-component-description">{{ component.description }}</p>
                  
                  <button 
                    class="gmkb-add-button"
                    :class="{ 'gmkb-add-button--premium': component.isPremium }"
                    @click="addComponent(component)"
                    :disabled="component.isPremium && !hasPremiumAccess"
                  >
                    <svg class="gmkb-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Component
                  </button>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="gmkb-empty-state">
                <svg class="gmkb-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p class="gmkb-empty-message">No components found matching your search.</p>
                <button 
                  class="gmkb-reset-button" 
                  @click="resetFilters"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="gmkb-modal-footer">
              <div class="gmkb-component-count">
                {{ filteredComponents.length }} of {{ components.length }} components
              </div>
              <button 
                class="gmkb-close-button" 
                @click="close"
              >
                Done
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, h } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import UnifiedComponentRegistry from '../../services/UnifiedComponentRegistry';

// Simple icon components as render functions
const icons = {
  layout: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' })
  ]),
  user: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '12', cy: '7', r: '4' })
  ]),
  list: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('line', { x1: '8', y1: '6', x2: '21', y2: '6' }),
    h('line', { x1: '8', y1: '12', x2: '21', y2: '12' }),
    h('line', { x1: '8', y1: '18', x2: '21', y2: '18' }),
    h('line', { x1: '3', y1: '6', x2: '3.01', y2: '6' }),
    h('line', { x1: '3', y1: '12', x2: '3.01', y2: '12' }),
    h('line', { x1: '3', y1: '18', x2: '3.01', y2: '18' })
  ]),
  mail: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
    h('polyline', { points: '22,6 12,13 2,6' })
  ]),
  'help-circle': () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
    h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
  ]),
  // Add more icons as needed...
  default: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' })
  ])
};

export default {
  name: 'ComponentLibrary',
  
  setup() {
    const store = useMediaKitStore();
    
    // State
    const isOpen = ref(false);
    const searchTerm = ref('');
    const selectedCategory = ref('all');
    const hasPremiumAccess = ref(window.gmkbData?.hasPremiumAccess || false);
    
    // Get components and categories from unified registry
    const components = ref(UnifiedComponentRegistry.getAll());
    const categories = ref(UnifiedComponentRegistry.getCategories().reduce((acc, cat) => {
      acc[cat.slug] = cat.name;
      return acc;
    }, {}));
    
    // Computed
    const filteredComponents = computed(() => {
      let filtered = components.value;
      
      // Filter by category
      if (selectedCategory.value !== 'all') {
        filtered = filtered.filter(c => c.category === selectedCategory.value);
      }
      
      // Filter by search term
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term) ||
          c.type.toLowerCase().includes(term)
        );
      }
      
      return filtered;
    });
    
    // Methods
    const open = () => {
      isOpen.value = true;
      document.body.style.overflow = 'hidden';
    };
    
    const close = () => {
      isOpen.value = false;
      document.body.style.overflow = '';
      resetFilters();
    };
    
    const addComponent = (component) => {
      if (component.isPremium && !hasPremiumAccess.value) {
        // Show upgrade prompt
        if (window.confirm('This is a premium component. Would you like to upgrade to Pro?')) {
          window.location.href = '/upgrade';
        }
        return;
      }
      
      // Add component with default data
      store.addComponent({
        type: component.type,
        data: component.defaultData || {}
      });
      
      // Show success message
      showToast(`Added ${component.name}`, 'success');
      
      // Don't close modal - allow adding multiple components
    };
    
    const filterComponents = () => {
      // Triggered automatically by computed property
    };
    
    const resetFilters = () => {
      searchTerm.value = '';
      selectedCategory.value = 'all';
    };
    
    const getIcon = (iconName) => {
      return icons[iconName] || icons.default;
    };
    
    const showToast = (message, type = 'info') => {
      // Use existing toast system if available
      if (window.showToast) {
        window.showToast(message, type);
      } else {
        console.log(`[${type}] ${message}`);
      }
    };
    
    // Keyboard handler
    const handleKeydown = (e) => {
      if (e.key === 'Escape' && isOpen.value) {
        close();
      }
    };
    
    // Lifecycle
    onMounted(() => {
      // Register global open function
      window.openComponentLibrary = open;
      
      // Listen for open events
      document.addEventListener('gmkb:open-component-library', open);
      document.addEventListener('keydown', handleKeydown);
      
      console.log('✅ Vue Component Library ready');
    });
    
    onUnmounted(() => {
      document.removeEventListener('gmkb:open-component-library', open);
      document.removeEventListener('keydown', handleKeydown);
      delete window.openComponentLibrary;
    });
    
    return {
      isOpen,
      searchTerm,
      selectedCategory,
      components,
      categories,
      filteredComponents,
      hasPremiumAccess,
      open,
      close,
      addComponent,
      filterComponents,
      resetFilters,
      getIcon
    };
  }
};
</script>

<style scoped>
/* Modal Overlay */
.gmkb-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

/* Modal Container */
.gmkb-modal-container {
  background: #1e293b;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Header */
.gmkb-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #334155;
}

.gmkb-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.gmkb-modal-icon {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.gmkb-modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.gmkb-modal-close:hover {
  background: #334155;
  color: #f1f5f9;
}

.gmkb-modal-close svg {
  width: 20px;
  height: 20px;
}

/* Controls */
.gmkb-library-controls {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #334155;
}

.gmkb-search-wrapper {
  flex: 1;
  position: relative;
}

.gmkb-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #64748b;
}

.gmkb-search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 14px;
  transition: all 0.2s;
}

.gmkb-search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #1e293b;
}

.gmkb-category-select {
  padding: 10px 16px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-category-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Body */
.gmkb-library-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Component Grid */
.gmkb-component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

/* Component Card */
.gmkb-component-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.gmkb-component-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.gmkb-component-card--premium {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
}

.gmkb-component-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.gmkb-component-icon {
  width: 40px;
  height: 40px;
  padding: 8px;
  background: #1e293b;
  border-radius: 8px;
  color: #3b82f6;
}

.gmkb-component-card--premium .gmkb-component-icon {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.gmkb-premium-badge {
  padding: 4px 8px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
}

.gmkb-component-name {
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 8px 0;
}

.gmkb-component-description {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0 0 16px 0;
  flex: 1;
}

.gmkb-add-button {
  width: 100%;
  padding: 10px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.gmkb-add-button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.gmkb-add-button--premium {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

.gmkb-add-button--premium:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
}

.gmkb-add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gmkb-button-icon {
  width: 16px;
  height: 16px;
}

/* Empty State */
.gmkb-empty-state {
  text-align: center;
  padding: 60px 20px;
}

.gmkb-empty-icon {
  width: 64px;
  height: 64px;
  color: #475569;
  margin: 0 auto 20px;
}

.gmkb-empty-message {
  color: #94a3b8;
  font-size: 16px;
  margin: 0 0 20px 0;
}

.gmkb-reset-button {
  padding: 10px 20px;
  background: #334155;
  color: #f1f5f9;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-reset-button:hover {
  background: #475569;
}

/* Footer */
.gmkb-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-top: 1px solid #334155;
}

.gmkb-component-count {
  color: #64748b;
  font-size: 13px;
}

.gmkb-close-button {
  padding: 10px 24px;
  background: #334155;
  color: #f1f5f9;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-close-button:hover {
  background: #475569;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-slide-enter-from {
  transform: scale(0.95);
  opacity: 0;
}

.modal-slide-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .gmkb-modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .gmkb-component-grid {
    grid-template-columns: 1fr;
  }
  
  .gmkb-library-controls {
    flex-direction: column;
  }
}
</style>
