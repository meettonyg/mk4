<template>
  <div class="testimonials-editor">
    <div class="editor-header">
      <h3>Edit Testimonials</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Section Title -->
      <div class="field-group">
        <label for="testimonials-title">Section Title</label>
        <input 
          id="testimonials-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., What People Are Saying"
        >
      </div>
      
      <!-- Testimonials List -->
      <div class="field-group">
        <label>Testimonials</label>
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
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
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
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();
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
    store.hasUnsavedChanges = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.testimonials-editor {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.editor-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.editor-fields {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.field-group {
  margin-bottom: 20px;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 13px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-group input,
.field-group textarea,
.field-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.testimonials-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.testimonial-item {
  padding: 16px;
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
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.add-btn:hover {
  background: #e0f2fe;
}

.advanced-section {
  margin-top: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.advanced-section summary {
  cursor: pointer;
  font-weight: 500;
  color: #475569;
  font-size: 14px;
  user-select: none;
}
</style>
