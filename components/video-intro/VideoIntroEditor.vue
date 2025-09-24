<template>
  <div class="video-intro-editor">
    <div class="editor-header">
      <h3>Edit Video Introduction</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Video Title -->
      <div class="field-group">
        <label for="video-title">Video Title</label>
        <input 
          id="video-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., Welcome Message"
        >
      </div>
      
      <!-- Video URL -->
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
      
      <!-- Thumbnail -->
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
      
      <!-- Description -->
      <div class="field-group">
        <label for="video-description">Description</label>
        <textarea 
          id="video-description"
          v-model="localData.description" 
          @input="updateComponent"
          rows="4"
          placeholder="Brief description or transcript..."
        />
      </div>
      
      <!-- Call to Action -->
      <div class="field-group">
        <label>Call to Action (Optional)</label>
        <div class="cta-fields">
          <input 
            v-model="localData.ctaText" 
            @input="updateComponent"
            placeholder="Button text"
            class="cta-field"
          >
          <input 
            v-model="localData.ctaUrl" 
            @input="updateComponent"
            placeholder="Button URL"
            class="cta-field"
          >
        </div>
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
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
    store.hasUnsavedChanges = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.video-intro-editor {
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

.field-help {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.media-btn {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
}

.media-btn:hover {
  background: var(--gmkb-color-primary, #3b82f6);
  color: white;
  border-color: var(--gmkb-color-primary, #3b82f6);
}

.cta-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cta-field {
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
