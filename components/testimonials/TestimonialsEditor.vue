<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Testimonials"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @back="handleBack"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Section Settings</h4>
          
          <div class="field-group">
            <label for="testimonials-title">Section Title</label>
            <input 
              id="testimonials-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="e.g., What People Say"
            />
          </div>
          
          <div class="field-group">
            <label for="testimonials-description">Description</label>
            <textarea 
              id="testimonials-description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="2"
              placeholder="Optional description..."
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Testimonials</h4>
          <p class="help-text">Add testimonials to showcase</p>
          
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
              
              <div class="field-group">
                <label>Quote *</label>
                <textarea 
                  v-model="testimonial.text" 
                  @input="updateComponent"
                  rows="3"
                  placeholder="Testimonial text..."
                />
              </div>
              
              <div class="field-group">
                <label>Author Name *</label>
                <input 
                  v-model="testimonial.author" 
                  @input="updateComponent"
                  type="text"
                  placeholder="John Doe"
                />
              </div>
              
              <div class="field-group">
                <label>Author Title</label>
                <input 
                  v-model="testimonial.title" 
                  @input="updateComponent"
                  type="text"
                  placeholder="CEO, Company Name"
                />
              </div>
              
              <div class="field-group">
                <label>Author Image URL</label>
                <input 
                  v-model="testimonial.image" 
                  @input="updateComponent"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                />
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
          <h4>Carousel Options</h4>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.autoplay" 
                @change="updateComponent"
              />
              Auto-play Carousel
            </label>
          </div>
          
          <div v-if="localData.autoplay" class="field-group">
            <label for="autoplay-interval">Auto-play Interval (ms)</label>
            <input 
              id="autoplay-interval"
              v-model.number="localData.autoplayInterval" 
              @input="updateComponent"
              type="number"
              min="2000"
              step="1000"
              placeholder="5000"
            />
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import ComponentEditorTemplate from '../../src/vue/components/sidebar/editors/ComponentEditorTemplate.vue';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

const store = useMediaKitStore();

// Active tab state
const activeTab = ref('content');

const localData = ref({
  title: 'What People Say',
  description: '',
  testimonials: [],
  autoplay: true,
  autoplayInterval: 5000
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'What People Say',
      description: component.data.description || '',
      testimonials: Array.isArray(component.data.testimonials) 
        ? [...component.data.testimonials]
        : [],
      autoplay: component.data.autoplay !== false,
      autoplayInterval: component.data.autoplayInterval || 5000
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Add testimonial
const addTestimonial = () => {
  localData.value.testimonials.push({
    text: '',
    author: '',
    title: '',
    image: ''
  });
  updateComponent();
};

// Remove testimonial
const removeTestimonial = (index) => {
  localData.value.testimonials.splice(index, 1);
  updateComponent();
};

// Update component with debouncing
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        title: localData.value.title,
        description: localData.value.description,
        testimonials: localData.value.testimonials.filter(t => t.text && t.author),
        autoplay: localData.value.autoplay,
        autoplayInterval: localData.value.autoplayInterval
      }
    });
    store.isDirty = true;
  }, 300);
};

// Handle back button
const handleBack = () => {
  emit('close');
};
</script>

<style scoped>
.content-fields {
  padding: 20px;
}

.editor-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .editor-section {
  background: #1e293b;
  border-color: #334155;
}

.editor-section:last-child {
  margin-bottom: 0;
}

.editor-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

body.dark-mode .editor-section h4 {
  color: #94a3b8;
}

.help-text {
  margin: -8px 0 16px 0;
  font-size: 12px;
  color: #64748b;
}

body.dark-mode .help-text {
  color: #94a3b8;
}

.field-group {
  margin-bottom: 12px;
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

body.dark-mode .field-group label {
  color: #94a3b8;
}

.field-group input,
.field-group select,
.field-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #1f2937;
  transition: all 0.2s;
  font-family: inherit;
}

body.dark-mode .field-group input,
body.dark-mode .field-group select,
body.dark-mode .field-group textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.field-group textarea {
  resize: vertical;
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

body.dark-mode .testimonial-item {
  background: #0f172a;
  border-color: #334155;
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

body.dark-mode .testimonial-number {
  color: #60a5fa;
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

body.dark-mode .remove-btn {
  background: #450a0a;
  border-color: #7f1d1d;
  color: #fca5a5;
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
  width: 100%;
}

.add-btn:hover {
  background: #e0f2fe;
}

body.dark-mode .add-btn {
  background: #0c4a6e;
  border-color: #0369a1;
  color: #7dd3fc;
}
</style>
