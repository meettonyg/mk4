<template>
  <div v-if="isOpen" class="library-modal" id="component-library-overlay" @click.self="close">
    <div class="library">
      <div class="library__header">
        <div class="library__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
          </svg>
          Component Library
        </div>
        <div class="library__controls">
          <select class="library__filter" v-model="selectedCategory">
            <option value="all">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ formatCategory(cat) }}
            </option>
          </select>
          <div class="library__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search components..." 
              v-model="searchTerm"
              @input="filterComponents"
            />
          </div>
          <button class="library__close" @click="close">&times;</button>
        </div>
      </div>
      
      <div class="library__content">
        <div class="library__sidebar">
          <ul class="category-list">
            <li 
              class="category-item"
              :class="{ 'category-item--active': selectedCategory === 'all' }"
              @click="selectedCategory = 'all'"
            >
              All Components
            </li>
            <li 
              v-for="cat in categories"
              :key="cat"
              class="category-item"
              :class="{ 'category-item--active': selectedCategory === cat }"
              @click="selectedCategory = cat"
            >
              {{ formatCategory(cat) }}
            </li>
          </ul>
        </div>
        
        <div class="library__main">
          <div class="components-grid" id="component-grid">
            <div
              v-for="component in filteredComponents"
              :key="component.type"
              class="component-card"
              :class="{ 'component-card--premium': component.isPremium }"
              :data-component-type="component.type"
              :data-category="component.category"
            >
              <div class="component-card__icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
              </div>
              <h3 class="component-card__title">{{ component.name }}</h3>
              <p class="component-card__description">{{ component.description }}</p>
              <button 
                class="add-component-btn" 
                @click="addComponent(component.type)"
              >
                Add
              </button>
            </div>
            
            <!-- Show empty state if no components match filter -->
            <div v-if="filteredComponents.length === 0" class="no-results">
              <p>No components found matching "{{ searchTerm || formatCategory(selectedCategory) }}"</p>
              <button @click="clearFilters" class="btn btn--secondary">Clear Filters</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="library__footer">
        <button class="btn btn--secondary" @click="close">Cancel</button>
        <!-- Add Selected button removed - each component has its own Add button -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';

export default {
  name: 'ComponentLibrary',
  
  setup() {
    const store = useMediaKitStore();
    const isOpen = ref(false);
    const selectedCategory = ref('all');
    const searchTerm = ref('');
    const components = ref([]);
    
    // Get components from store or window data
    onMounted(() => {
      // ROOT FIX: Components are discovered and stored in GMKB.components Map
      console.log('ComponentLibrary: Looking for discovered components...');
      
      // Check if GMKB exists with discovered components
      if (window.GMKB && window.GMKB.components && window.GMKB.components.size > 0) {
        // Convert Map to Array for Vue reactivity
        const componentMap = window.GMKB.components;
        const componentArray = [];
        
        componentMap.forEach((component, type) => {
          componentArray.push({
            type: type,
            name: component.name || type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            description: component.description || '',
            category: component.category || 'general',
            isPremium: component.isPremium || false,
            icon: component.icon || ''
          });
        });
        
        components.value = componentArray;
        console.log('✅ Found', components.value.length, 'components from GMKB.components');
      } 
      // Fallback to gmkbData/gmkbVueData
      else if ((window.gmkbData && window.gmkbData.components) || 
               (window.gmkbVueData && window.gmkbVueData.components)) {
        const sourceData = window.gmkbData || window.gmkbVueData;
        components.value = Array.isArray(sourceData.components) 
          ? sourceData.components 
          : Object.values(sourceData.components);
        console.log('✅ Found', components.value.length, 'components from gmkbData/gmkbVueData');
      } else {
        console.warn('❌ No components found in any expected location');
        console.log('Available globals:', {
          'window.GMKB': !!window.GMKB,
          'window.GMKB.components': window.GMKB ? !!window.GMKB.components : false,
          'window.gmkbData': !!window.gmkbData,
          'window.gmkbVueData': !!window.gmkbVueData
        });
      }
      
      // Listen for component library open event
      document.addEventListener('gmkb:open-component-library', open);
    });
    
    // Get unique categories
    const categories = computed(() => {
      const cats = new Set();
      components.value.forEach(comp => {
        if (comp.category && comp.category !== 'all') {
          cats.add(comp.category);
        }
      });
      return Array.from(cats).sort();
    });
    
    // Filter components based on category and search
    const filteredComponents = computed(() => {
      let filtered = components.value;
      
      // Filter by category
      if (selectedCategory.value !== 'all') {
        filtered = filtered.filter(comp => comp.category === selectedCategory.value);
      }
      
      // Filter by search term
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();
        filtered = filtered.filter(comp => 
          comp.name.toLowerCase().includes(term) ||
          comp.description.toLowerCase().includes(term)
        );
      }
      
      return filtered;
    });
    
    // Methods
    const open = () => {
      isOpen.value = true;
      document.body.style.overflow = 'hidden';
      // Reset filters when opening
      selectedCategory.value = 'all';
      searchTerm.value = '';
    };
    
    const close = () => {
      isOpen.value = false;
      document.body.style.overflow = '';
    };
    
    const addComponent = (type) => {
      console.log('Adding component:', type);
      store.addComponent({ type });
      // Don't close immediately - let user add multiple components
      // close();
    };
    
    const formatCategory = (cat) => {
      return cat.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };
    
    const filterComponents = () => {
      // Triggered by search input - filtering is reactive via computed property
    };
    
    const clearFilters = () => {
      selectedCategory.value = 'all';
      searchTerm.value = '';
    };
    
    // Expose method globally for compatibility
    window.openComponentLibrary = open;
    
    return {
      isOpen,
      selectedCategory,
      searchTerm,
      components,
      categories,
      filteredComponents,
      open,
      close,
      addComponent,
      formatCategory,
      filterComponents,
      clearFilters
    };
  }
};
</script>

<style scoped>
/* Core styles are loaded from component-library.css and modals.css */
/* Additional Vue-specific styles */

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.no-results p {
  margin: 0 0 16px;
  font-size: 14px;
}

.no-results .btn {
  font-size: 13px;
}
</style>
