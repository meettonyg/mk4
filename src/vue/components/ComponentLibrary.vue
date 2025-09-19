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
          <!-- ROOT FIX: Always render all components, use CSS to show/hide -->
          <div class="components-grid" id="component-grid">
            <div
              v-for="component in components"
              :key="component.type"
              class="component-card"
              :class="{ 
                'component-card--premium': component.isPremium,
                'component-card--hidden': !isComponentVisible(component)
              }"
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
          </div>
          
          <!-- Empty state -->
          <div v-if="filteredComponents.length === 0" class="no-results">
            <p>No components found matching "{{ searchTerm || formatCategory(selectedCategory) }}"</p>
            <button @click="clearFilters" class="btn btn--secondary">Clear Filters</button>
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
import { ref, computed, onMounted, nextTick } from 'vue';
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
      // ROOT FIX: Load components from the correct source based on console output
      console.log('ComponentLibrary Vue component mounted');
      
      // ROOT FIX: Based on console output, gmkbData has 16 components
      // Priority 1: Try gmkbData/gmkbVueData first (this is what's working)
      if ((window.gmkbData && window.gmkbData.components) || 
          (window.gmkbVueData && window.gmkbVueData.components)) {
        const sourceData = window.gmkbData || window.gmkbVueData;
        const rawComponents = Array.isArray(sourceData.components) 
          ? sourceData.components 
          : Object.values(sourceData.components);
        
        // ROOT FIX: Ensure each component has required fields
        components.value = rawComponents.map(comp => ({
          type: comp.type || comp.directory || 'unknown',
          name: comp.name || comp.title || 'Unknown Component',
          description: comp.description || '',
          category: comp.category || 'general',
          isPremium: comp.isPremium || comp.premium || false,
          icon: comp.icon || ''
        }));
        
        console.log('✅ Found', components.value.length, 'components from gmkbData/gmkbVueData');
        
        // ROOT FIX: Log categories if available
        if (sourceData.categories) {
          console.log('✅ Categories available:', sourceData.categories);
        }
        
        // Debug first few components to verify structure
        if (components.value.length > 0) {
          console.log('Sample components:', components.value.slice(0, 3));
          // Show category distribution
          const categoryCount = {};
          components.value.forEach(comp => {
            categoryCount[comp.category] = (categoryCount[comp.category] || 0) + 1;
          });
          console.log('Category distribution:', categoryCount);
        }
      }
      // Fallback: Check if GMKB exists with discovered components
      else if (window.GMKB && window.GMKB.components && window.GMKB.components.size > 0) {
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
      
      // Expose the open function globally
      window.openComponentLibrary = open;
      console.log('✅ Vue ComponentLibrary ready - window.openComponentLibrary is available');
    });
    
    // ROOT FIX: Get unique categories and normalize them for display
    const categories = computed(() => {
      const cats = new Set();
      components.value.forEach(comp => {
        if (comp.category && comp.category !== 'all') {
          // Store the original category value
          cats.add(comp.category);
        }
      });
      // Sort categories in a logical order
      const sortOrder = ['biography', 'hero-sections', 'essential', 'content', 'topics-skills', 'premium'];
      return Array.from(cats).sort((a, b) => {
        const indexA = sortOrder.indexOf(a);
        const indexB = sortOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      });
    });
    
    // ROOT FIX: Make filtering more robust and case-insensitive
    const filteredComponents = computed(() => {
      try {
        // ROOT FIX: Ensure components.value is always an array
        if (!Array.isArray(components.value)) {
          console.warn('Components is not an array:', components.value);
          return [];
        }
        
        // Create a shallow copy to trigger Vue reactivity
        let filtered = components.value.slice();
        
        // Filter by category (case-insensitive and handle hyphens)
        if (selectedCategory.value !== 'all' && selectedCategory.value) {
          const normalizeCategory = (cat) => {
            if (!cat) return '';
            // Convert to lowercase and handle both hyphens and spaces
            return cat.toLowerCase().replace(/[-\s]+/g, '');
          };
          
          const selectedNorm = normalizeCategory(selectedCategory.value);
          
          filtered = filtered.filter(comp => {
            const compCatNorm = normalizeCategory(comp.category);
            // Check exact match after normalization
            return compCatNorm === selectedNorm;
          });
        }
        
        // Filter by search term
        if (searchTerm.value) {
          const term = searchTerm.value.toLowerCase();
          filtered = filtered.filter(comp => {
            const name = (comp.name || '').toLowerCase();
            const desc = (comp.description || '').toLowerCase();
            return name.includes(term) || desc.includes(term);
          });
        }
        
        console.log(`Filtering: category='${selectedCategory.value}', search='${searchTerm.value}', results=${filtered.length}`);
        
        // Use nextTick to ensure DOM updates properly
        nextTick(() => {
          // Force Vue to update the DOM
        });
        
        // ROOT FIX: Always return a valid array
        return filtered || [];
      } catch (error) {
        console.error('Error filtering components:', error);
        return [];
      }
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
    
    // Expose method was moved to onMounted for better timing
    
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
/* Additional Vue-specific styles to ensure proper display */

/* Ensure the library__content displays as flex */
.library__content {
  display: flex !important;
  flex: 1;
  overflow: hidden;
}

/* Ensure sidebar is visible */
.library__sidebar {
  width: 200px !important;
  background: white !important;
  border-right: 1px solid #e2e8f0 !important;
  padding: 20px 0 !important;
  overflow-y: auto !important;
  display: block !important;
  flex-shrink: 0;
}

/* Ensure main content takes remaining space */
.library__main {
  flex: 1 !important;
  padding: 20px !important;
  overflow-y: auto !important;
  background: #f8f9fa !important;
}

/* Ensure header controls are visible */
.library__controls {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
}

/* ROOT FIX: Ensure components grid handles empty state properly */
.components-grid:empty {
  display: none;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
  width: 100%;
}

.no-results p {
  margin: 0 0 16px;
  font-size: 14px;
}

.no-results .btn {
  font-size: 13px;
}

/* ROOT FIX: Ensure component cards are visible */
.component-card {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
</style>
