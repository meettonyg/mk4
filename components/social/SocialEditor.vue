<template>
  <div class="social-editor">
    <div class="editor-header">
      <h3>Social Links Component</h3>
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
            <label for="social-title">Section Title</label>
            <input 
              id="social-title"
              v-model="localData.title" 
              @input="updateComponent"
              placeholder="e.g., Connect With Me"
            >
          </div>
        </section>
        
        <section class="editor-section">
          <h4>Social Networks</h4>
          
          <div class="social-network" v-for="(network, key) in socialNetworks" :key="key">
            <div class="network-header">
              <span class="network-icon">{{ network.icon }}</span>
              <span class="network-name">{{ network.name }}</span>
            </div>
            <input 
              v-model="localData[key]" 
              @input="updateComponent"
              :placeholder="network.placeholder"
              type="url"
            >
          </div>
        </section>
        
        <section class="editor-section">
          <h4>Display Options</h4>
          
          <div class="field-group">
            <label for="icon-style">Icon Style</label>
            <select 
              id="icon-style"
              v-model="localData.iconStyle" 
              @change="updateComponent"
            >
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="text-only">Text Only</option>
            </select>
          </div>
          
          <div class="field-group">
            <label for="icon-size">Icon Size</label>
            <select 
              id="icon-size"
              v-model="localData.iconSize" 
              @change="updateComponent"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          
          <div class="field-group">
            <label for="alignment">Alignment</label>
            <select 
              id="alignment"
              v-model="localData.alignment" 
              @change="updateComponent"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showLabels" 
                @change="updateComponent"
              >
              Show Network Names
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.openInNewTab" 
                @change="updateComponent"
              >
              Open Links in New Tab
            </label>
          </div>
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'social'"
          :show-typography="false"
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

const socialNetworks = {
  linkedin: { name: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/username' },
  twitter: { name: 'Twitter/X', icon: '🐦', placeholder: 'https://twitter.com/username' },
  facebook: { name: 'Facebook', icon: '👤', placeholder: 'https://facebook.com/username' },
  instagram: { name: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/username' },
  youtube: { name: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/@channel' },
  tiktok: { name: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@username' },
  github: { name: 'GitHub', icon: '💻', placeholder: 'https://github.com/username' },
  website: { name: 'Website', icon: '🌐', placeholder: 'https://example.com' }
};

const localData = ref({
  title: 'Connect With Me',
  linkedin: '',
  twitter: '',
  facebook: '',
  instagram: '',
  youtube: '',
  tiktok: '',
  github: '',
  website: '',
  iconStyle: 'rounded',
  iconSize: 'medium',
  alignment: 'center',
  showLabels: false,
  openInNewTab: true
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Connect With Me',
      linkedin: component.data.linkedin || '',
      twitter: component.data.twitter || '',
      facebook: component.data.facebook || '',
      instagram: component.data.instagram || '',
      youtube: component.data.youtube || '',
      tiktok: component.data.tiktok || '',
      github: component.data.github || '',
      website: component.data.website || '',
      iconStyle: component.data.iconStyle || 'rounded',
      iconSize: component.data.iconSize || 'medium',
      alignment: component.data.alignment || 'center',
      showLabels: component.data.showLabels || false,
      openInNewTab: component.data.openInNewTab !== false
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
      data: { ...localData.value }
    });
    store.isDirty = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.social-editor {
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

.social-network {
  margin-bottom: 12px;
}

.network-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.network-icon {
  font-size: 16px;
}

.network-name {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
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
