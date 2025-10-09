<template>
  <div class="video-intro-editor">
    <div class="editor-header">
      <h3>Video Introduction Component</h3>
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
          <h4>Video Settings</h4>
          
          <div class="field-group">
            <label for="video-title">Video Title</label>
            <input 
              id="video-title"
              v-model="localData.title" 
              @input="updateComponent"
              placeholder="e.g., Welcome Message"
            >
          </div>
          
          <div class="field-group">
            <label for="video-url">Video URL</label>
            <input 
              id="video-url"
              v-model="localData.videoUrl" 
              @input="updateComponent"
              placeholder="YouTube, Vimeo, or direct video URL"
            >
            <small class="field-help">Supports YouTube, Vimeo, or MP4 files</small>
          </div>
          
          <div class="field-group">
            <label for="thumbnail">Video Thumbnail</label>
            <input 
              id="thumbnail"
              v-model="localData.thumbnail" 
              @input="updateComponent"
              placeholder="Thumbnail image URL (optional)"
            >
            <button @click="openMediaLibrary" class="media-btn">
              Choose from Media Library
            </button>
          </div>
        </section>

        <section class="editor-section">
          <h4>Description</h4>
          
          <div class="field-group">
            <label for="video-description">Video Description</label>
            <textarea 
              id="video-description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="4"
              placeholder="Brief description or transcript..."
            />
          </div>
        </section>
        
        <section class="editor-section">
          <h4>Call to Action (Optional)</h4>
          
          <div class="field-group">
            <label for="cta-text">Button Text</label>
            <input 
              id="cta-text"
              v-model="localData.ctaText" 
              @input="updateComponent"
              placeholder="e.g., Watch Full Episode"
            >
          </div>
          
          <div class="field-group">
            <label for="cta-url">Button URL</label>
            <input 
              id="cta-url"
              v-model="localData.ctaUrl" 
              @input="updateComponent"
              placeholder="https://"
            >
          </div>
        </section>
        
        <section class="editor-section">
          <h4>Playback Options</h4>
          
          <div class="field-group">
            <label for="aspect-ratio">Aspect Ratio</label>
            <select 
              id="aspect-ratio"
              v-model="localData.aspectRatio" 
              @change="updateComponent"
            >
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="9:16">9:16 (Vertical)</option>
            </select>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.autoplay" 
                @change="updateComponent"
              >
              Autoplay (Muted)
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.loop" 
                @change="updateComponent"
              >
              Loop Video
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showControls" 
                @change="updateComponent"
              >
              Show Player Controls
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showPlayButton" 
                @change="updateComponent"
              >
              Show Play Button Overlay
            </label>
          </div>
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'video-intro'"
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

const localData = ref({
  title: '',
  videoUrl: '',
  thumbnail: '',
  description: '',
  ctaText: '',
  ctaUrl: '',
  aspectRatio: '16:9',
  autoplay: false,
  loop: false,
  showControls: true,
  showPlayButton: true
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || '',
      videoUrl: component.data.videoUrl || component.data.url || '',
      thumbnail: component.data.thumbnail || '',
      description: component.data.description || '',
      ctaText: component.data.ctaText || '',
      ctaUrl: component.data.ctaUrl || '',
      aspectRatio: component.data.aspectRatio || '16:9',
      autoplay: component.data.autoplay || false,
      loop: component.data.loop || false,
      showControls: component.data.showControls !== false,
      showPlayButton: component.data.showPlayButton !== false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Open WordPress Media Library for thumbnail
const openMediaLibrary = () => {
  if (window.wp && window.wp.media) {
    const frame = window.wp.media({
      title: 'Select Video Thumbnail',
      button: {
        text: 'Use this image'
      },
      multiple: false
    });
    
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      localData.value.thumbnail = attachment.url;
      updateComponent();
    });
    
    frame.open();
  } else {
    alert('WordPress Media Library not available. Please enter an image URL manually.');
  }
};

// Update component
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        title: localData.value.title,
        videoUrl: localData.value.videoUrl,
        url: localData.value.videoUrl, // Legacy compatibility
        thumbnail: localData.value.thumbnail,
        description: localData.value.description,
        ctaText: localData.value.ctaText,
        ctaUrl: localData.value.ctaUrl,
        aspectRatio: localData.value.aspectRatio,
        autoplay: localData.value.autoplay,
        loop: localData.value.loop,
        showControls: localData.value.showControls,
        showPlayButton: localData.value.showPlayButton
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
.video-intro-editor {
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

.field-help {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.media-btn {
  margin-top: 8px;
  width: 100%;
  padding: var(--gmkb-spacing-sm, 8px) 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
  font-weight: 500;
}

.media-btn:hover {
  background: var(--gmkb-color-primary, #3b82f6);
  color: white;
  border-color: var(--gmkb-color-primary, #3b82f6);
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
