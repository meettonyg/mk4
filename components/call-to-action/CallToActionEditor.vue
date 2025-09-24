<template>
  <div class="cta-editor">
    <div class="editor-header">
      <h3>Edit Call to Action</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Headline -->
      <div class="field-group">
        <label for="cta-headline">Headline</label>
        <input 
          id="cta-headline"
          v-model="localData.headline" 
          @input="updateComponent"
          placeholder="e.g., Ready to Get Started?"
        >
      </div>
      
      <!-- Subheadline -->
      <div class="field-group">
        <label for="cta-subheadline">Subheadline</label>
        <input 
          id="cta-subheadline"
          v-model="localData.subheadline" 
          @input="updateComponent"
          placeholder="Supporting text for your CTA"
        >
      </div>
      
      <!-- Description -->
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
      
      <!-- Primary Button -->
      <div class="field-group">
        <label>Primary Button</label>
        <div class="button-fields">
          <input 
            v-model="localData.primaryButtonText" 
            @input="updateComponent"
            placeholder="Button text"
            class="button-field"
          >
          <input 
            v-model="localData.primaryButtonUrl" 
            @input="updateComponent"
            placeholder="Button URL"
            type="url"
            class="button-field"
          >
        </div>
      </div>
      
      <!-- Secondary Button (Optional) -->
      <div class="field-group">
        <label>Secondary Button (Optional)</label>
        <div class="button-fields">
          <input 
            v-model="localData.secondaryButtonText" 
            @input="updateComponent"
            placeholder="Button text"
            class="button-field"
          >
          <input 
            v-model="localData.secondaryButtonUrl" 
            @input="updateComponent"
            placeholder="Button URL"
            type="url"
            class="button-field"
          >
        </div>
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
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
          <input 
            id="background-color"
            v-model="localData.backgroundColor" 
            @input="updateComponent"
            type="color"
          >
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
    store.hasUnsavedChanges = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.cta-editor {
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

.field-group input[type="color"] {
  width: 100px;
  height: 40px;
  cursor: pointer;
}

.button-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.button-field {
  margin: 0 !important;
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
