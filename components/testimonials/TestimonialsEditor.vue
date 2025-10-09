<template>
  <div class="testimonials-editor">
    <div class="editor-header">
      <h3>Testimonials Component</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <!-- Tab Navigation -->
    <div class="editor-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="editor-content">
      <!-- CONTENT TAB -->
      <div v-show="activeTab === 'content'" class="tab-panel">
        <section class="editor-section">
          <h4>Section Settings</h4>
          
          <div class="field-group">
            <label for="testimonials-title">Section Title</label>
            <input 
              id="testimonials-title"
              v-model="localData.title" 
              @input="updateComponent"
              placeholder="e.g., What People Are Saying"
            >
          </div>
        </section>
      
        <section class="editor-section">
          <h4>Testimonials</h4>
          
          <div class="testimonials-list">
            <div 
              v-for="(testimonial, index) in localData.testimonials" 
              :key="index"
              class="testimonial-item"
            >
              <div class="testimonial-header">
                <span class="testimonial-number">Testimonial {{ index + 1 }}</span>
                <button 
                  @click="removeTestimonial(index)"
                  class="remove-btn"
                  title="Remove testimonial"
                >×</button>
              </div>
              
              <textarea 
                v-model="testimonial.quote" 
                @input="updateComponent"
                placeholder="Enter testimonial quote..."
                rows="3"
                class="testimonial-quote"
              />
              
              <div class="testimonial-fields">
                <input 
                  v-model="testimonial.author" 
                  @input="updateComponent"
                  placeholder="Author name"
                  class="testimonial-field"
                >
                
                <input 
                  v-model="testimonial.title" 
                  @input="updateComponent"
                  placeholder="Title/Position"
                  class="testimonial-field"
                >
                
                <input 
                  v-model="testimonial.company" 
                  @input="updateComponent"
                  placeholder="Company/Organization"
                  class="testimonial-field"
                >
                
                <input 
                  v-model="testimonial.imageUrl" 
                  @input="updateComponent"
                  placeholder="Profile image URL (optional)"
                  class="testimonial-field"
                >
              </div>
              
              <div class="rating-field">
                <label class="sub-label">Rating (optional)</label>
                <select 
                  v-model="testimonial.rating" 
                  @change="updateComponent"
                >
                  <option value="">No rating</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                  <option value="3">⭐⭐⭐ 3 Stars</option>
                </select>
              </div>
            </div>
            
            <button 
              @click="addTestimonial"
              class="add-btn"
            >
              + Add Testimonial
            </button>
          </div>
        </section>
      
        <section class="editor-section">
          <h4>Display Options</h4>
          
          <div class="field-group">
            <label for="display-mode">Display Mode</label>
            <select 
              id="display-mode"
              v-model="localData.displayMode" 
              @change="updateComponent"
            >
              <option value="carousel">Carousel/Slider</option>
              <option value="grid">Grid</option>
              <option value="list">List</option>
              <option value="masonry">Masonry</option>
            </select>
          </div>
          
          <div class="field-group" v-if="localData.displayMode === 'grid'">
            <label for="columns">Columns</label>
            <select 
              id="columns"
              v-model="localData.columns" 
              @change="updateComponent"
            >
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
          </div>
          
          <div class="field-group" v-if="localData.displayMode === 'carousel'">
            <label>
              <input 
                type="checkbox"
                v-model="localData.autoplay" 
                @change="updateComponent"
              >
              Auto-play Carousel
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showImages" 
                @change="updateComponent"
              >
              Show Profile Images
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showQuotes" 
                @change="updateComponent"
              >
              Show Quotation Marks
            </label>
          </div>
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'testimonials'"
          :show-typography="true"
        />
      </div>
      
      <!-- ADVANCED TAB -->
      <div v-show="activeTab === 'advanced'" class="tab-panel">
        <BaseAdvancedPanel
          :component-id="componentId"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import BaseStylePanel from '../../src/vue/components/sidebar/editors/BaseStylePanel.vue';
import BaseAdvancedPanel from '../../src/vue/components/sidebar/editors/BaseAdvancedPanel.vue';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();

// Tab state
const activeTab = ref('content');
const tabs = [
  { id: 'content', label: 'Content' },
  { id: 'style', label: 'Style' },
  { id: 'advanced', label: 'Advanced' }
];

const localData = ref({
  title: 'What People Are Saying',
  testimonials: [],
  displayMode: 'carousel',
  columns: '3',
  autoplay: true,
  showImages: true,
  showQuotes: true
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'What People Are Saying',
      testimonials: Array.isArray(component.data.testimonials) 
        ? [...component.data.testimonials] 
        : [],
      displayMode: component.data.displayMode || 'carousel',
      columns: String(component.data.columns || '3'),
      autoplay: component.data.autoplay !== false,
      showImages: component.data.showImages !== false,
      showQuotes: component.data.showQuotes !== false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Add testimonial
const addTestimonial = () => {
  localData.value.testimonials.push({
    quote: '',
    author: '',
    title: '',
    company: '',
    imageUrl: '',
    rating: ''
  });
  updateComponent();
};

// Remove testimonial
const removeTestimonial = (index) => {
  localData.value.testimonials.splice(index, 1);
  updateComponent();
};

// Update component
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        title: localData.value.title,
        testimonials: localData.value.testimonials.filter(t => t.quote || t.author),
        displayMode: localData.value.displayMode,
        columns: parseInt(localData.value.columns),
        autoplay: localData.value.autoplay,
        showImages: localData.value.showImages,
        showQuotes: localData.value.showQuotes
      }
    });
    store.isDirty = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.testimonials-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gmkb-spacing-md, 16px) 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
}

.editor-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.tab-btn.active {
  color: #3b82f6;
  background: white;
  border-bottom-color: #3b82f6;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
}

.tab-panel {
  padding: 20px;
}

.editor-section {
  background: white;
  border-radius: 8px;
  padding: var(--gmkb-spacing-md, 16px);
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.editor-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-group {
  margin-bottom: 16px;
}

.field-group:last-child {
  margin-bottom: 0;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.field-group input,
.field-group textarea,
.field-group select {
  width: 100%;
  padding: var(--gmkb-spacing-sm, 8px) 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-group textarea {
  resize: vertical;
  font-family: inherit;
}

.testimonials-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.testimonial-item {
  padding: var(--gmkb-spacing-md, 16px);
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.testimonial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.testimonial-number {
  font-weight: 600;
  color: #3b82f6;
  font-size: 14px;
}

.testimonial-quote {
  margin-bottom: 12px !important;
  resize: vertical;
  min-height: 60px;
}

.testimonial-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.testimonial-field {
  margin: 0 !important;
}

.rating-field {
  margin-top: 8px;
}

.sub-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.remove-btn {
  width: 24px;
  height: 24px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

.add-btn {
  padding: var(--gmkb-spacing-md, 12px);
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #e0f2fe;
}

/* Scrollbar styling */
.editor-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.editor-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
