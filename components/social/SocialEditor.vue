<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Social Links"
    :show-typography="false"
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
            <label for="social-title">Section Title</label>
            <input 
              id="social-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="e.g., Connect With Me"
            />
          </div>
          
          <div class="field-group">
            <label for="social-description">Description</label>
            <textarea 
              id="social-description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="2"
              placeholder="Optional description..."
            />
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
            />
          </div>
        </section>
        
        <section class="editor-section">
          <h4>Display Options</h4>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showLabels" 
                @change="updateComponent"
              />
              Show Network Names
            </label>
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

const socialNetworks = {
  facebook: { name: 'Facebook', icon: '👤', placeholder: 'https://facebook.com/username' },
  twitter: { name: 'Twitter/X', icon: '🐦', placeholder: 'https://twitter.com/username' },
  linkedin: { name: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/username' },
  instagram: { name: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/username' },
  youtube: { name: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/@channel' },
  tiktok: { name: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@username' },
  pinterest: { name: 'Pinterest', icon: '📌', placeholder: 'https://pinterest.com/username' }
};

const localData = ref({
  title: 'Connect With Me',
  description: '',
  facebook: '',
  twitter: '',
  linkedin: '',
  instagram: '',
  youtube: '',
  tiktok: '',
  pinterest: '',
  showLabels: false
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Connect With Me',
      description: component.data.description || '',
      facebook: component.data.facebook || '',
      twitter: component.data.twitter || '',
      linkedin: component.data.linkedin || '',
      instagram: component.data.instagram || '',
      youtube: component.data.youtube || '',
      tiktok: component.data.tiktok || '',
      pinterest: component.data.pinterest || '',
      showLabels: component.data.showLabels || false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Update component with debouncing
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
  min-height: 60px;
}

.social-network {
  margin-bottom: 16px;
}

.social-network:last-child {
  margin-bottom: 0;
}

.network-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.network-icon {
  font-size: 18px;
}

.network-name {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

body.dark-mode .network-name {
  color: #94a3b8;
}

.social-network input {
  width: 100%;
}
</style>
