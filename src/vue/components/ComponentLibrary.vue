<template>
  <div class="component-library-modal" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Component Library</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <!-- Search -->
        <div class="search-bar">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search components..."
            class="search-input"
          >
        </div>
        
        <!-- Categories -->
        <div class="categories">
          <button 
            v-for="category in categories"
            :key="category"
            class="category-btn"
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
        
        <!-- Component Grid -->
        <div class="component-grid">
          <div 
            v-for="component in filteredComponents"
            :key="component.type"
            class="component-card"
            @click="selectComponent(component)"
          >
            <div class="component-icon">
              <i :class="`fa ${component.icon}`"></i>
            </div>
            <h3 class="component-name">{{ component.name }}</h3>
            <p class="component-description">{{ component.description }}</p>
            <span v-if="component.premium" class="premium-badge">Premium</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  components: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'select']);

// Local state
const searchQuery = ref('');
const selectedCategory = ref('All');

// Computed
const categories = computed(() => {
  const cats = ['All'];
  const uniqueCats = new Set(props.components.map(c => c.category));
  return [...cats, ...Array.from(uniqueCats)];
});

const filteredComponents = computed(() => {
  let filtered = props.components;
  
  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
  }
  
  // Filter by category
  if (selectedCategory.value !== 'All') {
    filtered = filtered.filter(c => c.category === selectedCategory.value);
  }
  
  return filtered;
});

// Methods
function selectComponent(component) {
  emit('select', component.type);
}
</script>

<style scoped>
.component-library-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.categories {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 6px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: #f9fafb;
}

.category-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.component-card {
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.component-card:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
}

.component-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #6b7280;
}

.component-name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.component-description {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.premium-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  background: #fbbf24;
  color: #92400e;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
</style>
