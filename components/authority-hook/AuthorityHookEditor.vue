<template>
  <div class="authority-hook-editor">
    <div class="editor-header">
      <h3>Edit Authority Hook</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Hook Headline -->
      <div class="field-group">
        <label for="headline">Hook Headline</label>
        <input 
          id="headline"
          v-model="localData.headline" 
          @input="updateComponent"
          placeholder="e.g., Trusted by Industry Leaders"
        >
      </div>
      
      <!-- Subheadline -->
      <div class="field-group">
        <label for="subheadline">Subheadline</label>
        <input 
          id="subheadline"
          v-model="localData.subheadline" 
          @input="updateComponent"
          placeholder="Supporting credibility statement"
        >
      </div>
      
      <!-- Credentials List -->
      <div class="field-group">
        <label>Credentials & Achievements</label>
        <div class="credentials-list">
          <div 
            v-for="(credential, index) in localData.credentials" 
            :key="index"
            class="credential-item"
          >
            <input 
              v-model="credential.title" 
              @input="updateComponent"
              placeholder="Achievement title"
              class="credential-field"
            >
            <input 
              v-model="credential.description" 
              @input="updateComponent"
              placeholder="Brief description"
              class="credential-field"
            >
            <input 
              v-model="credential.icon" 
              @input="updateComponent"
              placeholder="Icon (emoji or class)"
              class="credential-icon"
            >
            <button 
              @click="removeCredential(index)"
              class="remove-btn"
              title="Remove credential"
            >×</button>
          </div>
          
          <button 
            @click="addCredential"
            class="add-btn"
          >
            + Add Credential
          </button>
        </div>
      </div>
      
      <!-- Trust Indicators -->
      <div class="field-group">
        <label>Trust Indicators</label>
        <div class="trust-fields">
          <input 
            v-model="localData.yearsExperience" 
            @input="updateComponent"
            placeholder="Years of experience (e.g., 15+)"
            class="trust-field"
          >
          <input 
            v-model="localData.clientsServed" 
            @input="updateComponent"
            placeholder="Clients served (e.g., 500+)"
            class="trust-field"
          >
          <input 
            v-model="localData.successRate" 
            @input="updateComponent"
            placeholder="Success rate (e.g., 98%)"
            class="trust-field"
          >
        </div>
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
        <div class="field-group">
          <label for="layout">Layout Style</label>
          <select 
            id="layout"
            v-model="localData.layout" 
            @change="updateComponent"
          >
            <option value="centered">Centered</option>
            <option value="grid">Grid</option>
            <option value="timeline">Timeline</option>
            <option value="cards">Cards</option>
          </select>
        </div>
        
        <div class="field-group">
          <label for="emphasis">Visual Emphasis</label>
          <select 
            id="emphasis"
            v-model="localData.emphasis" 
            @change="updateComponent"
          >
            <option value="subtle">Subtle</option>
            <option value="moderate">Moderate</option>
            <option value="bold">Bold</option>
          </select>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.showIcons" 
              @change="updateComponent"
            >
            Show Icons
          </label>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.animateOnScroll" 
              @change="updateComponent"
            >
            Animate on Scroll
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
  headline: 'Trusted by Industry Leaders',
  subheadline: '',
  credentials: [],
  yearsExperience: '',
  clientsServed: '',
  successRate: '',
  layout: 'centered',
  emphasis: 'moderate',
  showIcons: true,
  animateOnScroll: true
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      headline: component.data.headline || 'Trusted by Industry Leaders',
      subheadline: component.data.subheadline || '',
      credentials: Array.isArray(component.data.credentials) 
        ? [...component.data.credentials] 
        : [],
      yearsExperience: component.data.yearsExperience || '',
      clientsServed: component.data.clientsServed || '',
      successRate: component.data.successRate || '',
      layout: component.data.layout || 'centered',
      emphasis: component.data.emphasis || 'moderate',
      showIcons: component.data.showIcons !== false,
      animateOnScroll: component.data.animateOnScroll !== false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Add credential
const addCredential = () => {
  localData.value.credentials.push({
    title: '',
    description: '',
    icon: ''
  });
  updateComponent();
};

// Remove credential
const removeCredential = (index) => {
  localData.value.credentials.splice(index, 1);
  updateComponent();
};

// Update component
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        headline: localData.value.headline,
        subheadline: localData.value.subheadline,
        credentials: localData.value.credentials.filter(c => c.title || c.description),
        yearsExperience: localData.value.yearsExperience,
        clientsServed: localData.value.clientsServed,
        successRate: localData.value.successRate,
        layout: localData.value.layout,
        emphasis: localData.value.emphasis,
        showIcons: localData.value.showIcons,
        animateOnScroll: localData.value.animateOnScroll
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
.authority-hook-editor {
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

.credentials-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.credential-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.credential-field {
  flex: 1;
  margin: 0 !important;
}

.credential-icon {
  width: 60px !important;
  margin: 0 !important;
}

.trust-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trust-field {
  margin: 0 !important;
}

.remove-btn {
  width: 32px;
  height: 38px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
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
