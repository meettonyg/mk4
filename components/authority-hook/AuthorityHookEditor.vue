<template>
  <div class="authority-hook-editor">
    <div class="editor-header">
      <h3>Authority Hook Component</h3>
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
          <h4>Hook Headlines</h4>
          
          <div class="field-group">
            <label for="headline">Hook Headline</label>
            <input 
              id="headline"
              v-model="localData.headline" 
              @input="updateComponent"
              placeholder="e.g., Trusted by Industry Leaders"
            >
          </div>
          
          <div class="field-group">
            <label for="subheadline">Subheadline</label>
            <input 
              id="subheadline"
              v-model="localData.subheadline" 
              @input="updateComponent"
              placeholder="Supporting credibility statement"
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Credentials & Achievements</h4>
          
          <div class="credentials-list">
            <div 
              v-for="(credential, index) in localData.credentials" 
              :key="index"
              class="credential-item"
            >
              <div class="credential-header">
                <span class="credential-number">Credential {{ index + 1 }}</span>
                <button 
                  @click="removeCredential(index)"
                  class="remove-btn"
                  title="Remove credential"
                >×</button>
              </div>
              
              <div class="credential-fields">
                <div class="field-group">
                  <label>Title</label>
                  <input 
                    v-model="credential.title" 
                    @input="updateComponent"
                    placeholder="Achievement title"
                  >
                </div>
                
                <div class="field-group">
                  <label>Description</label>
                  <input 
                    v-model="credential.description" 
                    @input="updateComponent"
                    placeholder="Brief description"
                  >
                </div>
                
                <div class="field-group">
                  <label>Icon</label>
                  <input 
                    v-model="credential.icon" 
                    @input="updateComponent"
                    placeholder="Icon (emoji or class)"
                  >
                </div>
              </div>
            </div>
            
            <button 
              @click="addCredential"
              class="add-btn"
            >
              + Add Credential
            </button>
          </div>
        </section>

        <section class="editor-section">
          <h4>Trust Indicators</h4>
          
          <div class="field-group">
            <label for="years-experience">Years of Experience</label>
            <input 
              id="years-experience"
              v-model="localData.yearsExperience" 
              @input="updateComponent"
              placeholder="e.g., 15+"
            >
          </div>
          
          <div class="field-group">
            <label for="clients-served">Clients Served</label>
            <input 
              id="clients-served"
              v-model="localData.clientsServed" 
              @input="updateComponent"
              placeholder="e.g., 500+"
            >
          </div>
          
          <div class="field-group">
            <label for="success-rate">Success Rate</label>
            <input 
              id="success-rate"
              v-model="localData.successRate" 
              @input="updateComponent"
              placeholder="e.g., 98%"
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
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
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'authority-hook'"
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
    store.isDirty = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.authority-hook-editor {
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
.field-group select:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.credentials-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.credential-item {
  padding: var(--gmkb-spacing-md, 16px);
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.credential-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.credential-number {
  font-weight: 600;
  color: #3b82f6;
  font-size: 14px;
}

.credential-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  flex-shrink: 0;
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
  transition: all 0.2s;
  font-weight: 500;
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
