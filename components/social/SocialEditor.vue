<template>
  <div class="social-editor">
    <div class="editor-header">
      <h3>Edit Social Links</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Section Title -->
      <div class="field-group">
        <label for="social-title">Section Title</label>
        <input 
          id="social-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., Connect With Me"
        >
      </div>
      
      <!-- Social Networks -->
      <div class="field-group">
        <label>Social Networks</label>
        
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
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
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
    store.hasUnsavedChanges = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.social-editor {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gmkb-spacing-md, 16px) 20px;
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

.field-group > label {
  display: block;
  margin-bottom: 12px;
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

.advanced-section {
  margin-top: 24px;
  padding: var(--gmkb-spacing-md, 16px);
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
