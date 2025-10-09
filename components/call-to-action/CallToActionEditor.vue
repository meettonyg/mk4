<template>
  <div class="cta-editor">
    <div class="editor-header">
      <h3>Call to Action Component</h3>
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
          <h4>Headlines</h4>
          
          <div class="field-group">
            <label for="cta-headline">Headline</label>
            <input 
              id="cta-headline"
              v-model="localData.headline" 
              @input="updateComponent"
              placeholder="e.g., Ready to Get Started?"
            >
          </div>
          
          <div class="field-group">
            <label for="cta-subheadline">Subheadline</label>
            <input 
              id="cta-subheadline"
              v-model="localData.subheadline" 
              @input="updateComponent"
              placeholder="Supporting text for your CTA"
            >
          </div>
          
          <div class="field-group">
            <label for="cta-description">Description</label>
            <textarea 
              id="cta-description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="4"
              placeholder="Additional details or benefits..."
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Primary Button</h4>
          
          <div class="field-group">
            <label for="primary-text">Button Text</label>
            <input 
              id="primary-text"
              v-model="localData.primaryButtonText" 
              @input="updateComponent"
              placeholder="e.g., Get Started Now"
            >
          </div>
          
          <div class="field-group">
            <label for="primary-url">Button URL</label>
            <input 
              id="primary-url"
              v-model="localData.primaryButtonUrl" 
              @input="updateComponent"
              type="url"
              placeholder="https://"
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Secondary Button (Optional)</h4>
          
          <div class="field-group">
            <label for="secondary-text">Button Text</label>
            <input 
              id="secondary-text"
              v-model="localData.secondaryButtonText" 
              @input="updateComponent"
              placeholder="e.g., Learn More"
            >
          </div>
          
          <div class="field-group">
            <label for="secondary-url">Button URL</label>
            <input 
              id="secondary-url"
              v-model="localData.secondaryButtonUrl" 
              @input="updateComponent"
              type="url"
              placeholder="https://"
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
          <div class="field-group">
            <label for="cta-style">Style</label>
            <select 
              id="cta-style"
              v-model="localData.style" 
              @change="updateComponent"
            >
              <option value="default">Default</option>
              <option value="gradient">Gradient Background</option>
              <option value="bordered">Bordered Box</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          
          <div class="field-group">
            <label for="cta-alignment">Text Alignment</label>
            <select 
              id="cta-alignment"
              v-model="localData.alignment" 
              @change="updateComponent"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          <div class="field-group">
            <label for="background-color">Background Color</label>
            <div class="color-input-wrapper">
              <input 
                id="background-color"
                v-model="localData.backgroundColor" 
                @input="updateComponent"
                type="color"
                class="color-swatch"
              >
              <input 
                v-model="localData.backgroundColor" 
                @input="updateComponent"
                type="text"
                class="color-text"
                placeholder="#3b82f6"
              >
            </div>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.fullWidth" 
                @change="updateComponent"
              >
              Full Width Section
            </label>
          </div>
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'call-to-action'"
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
  headline: '',
  subheadline: '',
  description: '',
  primaryButtonText: '',
  primaryButtonUrl: '',
  secondaryButtonText: '',
  secondaryButtonUrl: '',
  style: 'default',
  alignment: 'center',
  backgroundColor: '#3b82f6',
  fullWidth: false
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      headline: component.data.headline || component.data.title || '',
      subheadline: component.data.subheadline || component.data.subtitle || '',
      description: component.data.description || component.data.content || '',
      primaryButtonText: component.data.primaryButtonText || component.data.buttonText || '',
      primaryButtonUrl: component.data.primaryButtonUrl || component.data.buttonUrl || '',
      secondaryButtonText: component.data.secondaryButtonText || '',
      secondaryButtonUrl: component.data.secondaryButtonUrl || '',
      style: component.data.style || 'default',
      alignment: component.data.alignment || 'center',
      backgroundColor: component.data.backgroundColor || '#3b82f6',
      fullWidth: component.data.fullWidth || false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Update component
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        ...localData.value,
        // Legacy field compatibility
        title: localData.value.headline,
        subtitle: localData.value.subheadline,
        content: localData.value.description,
        buttonText: localData.value.primaryButtonText,
        buttonUrl: localData.value.primaryButtonUrl
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
.cta-editor {
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
.field-group textarea:focus,
.field-group select:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-group textarea {
  resize: vertical;
  font-family: inherit;
}

.color-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-swatch {
  width: 48px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.color-text {
  flex: 1;
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
