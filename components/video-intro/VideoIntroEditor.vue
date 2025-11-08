<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Video Intro"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @back="handleBack"
  >
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Section Settings</h4>
          <div class="field-group">
            <label>Title</label>
            <input v-model="localData.title" @input="updateComponent" type="text" placeholder="e.g., Watch My Introduction" />
          </div>
          <div class="field-group">
            <label>Description</label>
            <textarea v-model="localData.description" @input="updateComponent" rows="2" placeholder="Optional..."/>
          </div>
        </section>

        <section class="editor-section">
          <h4>Video Source</h4>
          
          <!-- Pods Data Toggle -->
          <div v-if="podsVideoUrl" class="pods-data-toggle">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="localData.usePodsData" 
                @change="updateComponent"
              />
              <span>Use video from Pods ({{ podsVideoUrl.substring(0, 50) }}...)</span>
            </label>
          </div>

          <!-- Video URL Input -->
          <div v-if="!localData.usePodsData || !podsVideoUrl">
            <p class="help-text">Supports YouTube, Vimeo, or direct video URLs</p>
            <div class="field-group">
              <label>Video URL *</label>
              <input 
                v-model="localData.video_url" 
                @input="updateComponent" 
                type="text" 
                placeholder="https://youtube.com/watch?v=..." 
              />
            </div>
          </div>

          <!-- Show Pods URL -->
          <div v-else class="pods-video-display">
            <div class="field-group">
              <label>Video URL (from Pods)</label>
              <div class="pods-value">
                <i class="fas fa-link"></i>
                <span>{{ podsVideoUrl }}</span>
              </div>
              <p class="field-hint">This video is loaded from your guest profile. Uncheck above to use a custom URL.</p>
            </div>
          </div>

          <div class="field-group">
            <label>Thumbnail URL (Optional)</label>
            <input 
              v-model="localData.thumbnail" 
              @input="updateComponent" 
              type="text" 
              placeholder="https://example.com/thumb.jpg" 
            />
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useMediaKitStore } from '@/stores/mediaKit';
import { usePodsData } from '@/composables/usePodsData';
import ComponentEditorTemplate from '@/vue/components/sidebar/editors/ComponentEditorTemplate.vue';

const props = defineProps({ componentId: { type: String, required: true } });
const emit = defineEmits(['close']);
const store = useMediaKitStore();
const activeTab = ref('content');

/**
 * Convert video URL to embed format
 * Supports YouTube and Vimeo
 */
const convertToEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  const cleanUrl = url.trim();
  
  // Already an embed URL
  if (cleanUrl.includes('/embed/')) {
    return cleanUrl;
  }
  
  // YouTube patterns
  // youtube.com/watch?v=VIDEO_ID
  let match = cleanUrl.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  
  // youtu.be/VIDEO_ID
  match = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  
  // Vimeo patterns
  // vimeo.com/VIDEO_ID
  match = cleanUrl.match(/vimeo\.com\/(\d+)/);
  if (match) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  
  // Return original URL if no pattern matched (might be a direct video file)
  return cleanUrl;
};

// Load Pods data - use the videoIntro computed ref directly
const podsDataComposable = usePodsData();
const podsVideoIntroUrl = podsDataComposable.videoIntro;

const localData = ref({ 
  title: 'Watch My Introduction', 
  description: '', 
  video_url: '', 
  thumbnail: '',
  usePodsData: true // Default to using Pods data if available
});

// Get video URL from Pods - access the computed ref directly
const podsVideoUrl = computed(() => {
  return podsVideoIntroUrl.value || '';
});

// Determine effective video URL (Pods or custom) and convert to embed format
const effectiveVideoUrl = computed(() => {
  let url = '';
  if (localData.value.usePodsData && podsVideoUrl.value) {
    url = podsVideoUrl.value;
  } else {
    url = localData.value.video_url || '';
  }
  return convertToEmbedUrl(url);
});

const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component?.data) {
    localData.value = {
      title: component.data.title || 'Watch My Introduction',
      description: component.data.description || '',
      video_url: component.data.video_url || component.data.url || '',
      thumbnail: component.data.thumbnail || component.data.poster || '',
      usePodsData: component.data.usePodsData !== false // Default to true
    };
  }
  
  // If no custom video URL and Pods has data, use Pods
  if (!localData.value.video_url && podsVideoUrl.value) {
    localData.value.usePodsData = true;
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

watch(podsVideoUrl, () => {
  // If using Pods data and Pods value changes, trigger update
  if (localData.value.usePodsData) {
    updateComponent();
  }
});

let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    const dataToSave = {
      ...localData.value,
      // Store the effective URL for preview/frontend
      video_url: effectiveVideoUrl.value
    };
    store.updateComponent(props.componentId, { data: dataToSave });
    store.isDirty = true;
  }, 300);
};

const handleBack = () => emit('close');
</script>

<style scoped>
.content-fields { padding: 20px; }
.editor-section { background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e5e7eb; }
body.dark-mode .editor-section { background: #1e293b; border-color: #334155; }
.editor-section h4 { margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #475569; text-transform: uppercase; }
body.dark-mode .editor-section h4 { color: #94a3b8; }
.help-text { margin: -8px 0 12px 0; font-size: 12px; color: #64748b; }
.field-group { margin-bottom: 12px; }
.field-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #64748b; }
.field-group input, .field-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; background: white; color: #1f2937; font-family: inherit; }
body.dark-mode .field-group input, body.dark-mode .field-group textarea { background: #0f172a; border-color: #334155; color: #f3f4f6; }
.field-group textarea { resize: vertical; }

/* Pods Data Toggle */
.pods-data-toggle {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

body.dark-mode .pods-data-toggle {
  background: #0c4a6e;
  border-color: #0369a1;
}

.toggle-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #0369a1;
  font-weight: 500;
}

body.dark-mode .toggle-label {
  color: #7dd3fc;
}

.toggle-label input[type="checkbox"] {
  margin-top: 2px;
  cursor: pointer;
  width: auto;
}

.toggle-label span {
  flex: 1;
  word-break: break-all;
}

/* Pods Video Display */
.pods-video-display {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

body.dark-mode .pods-video-display {
  background: #0f172a;
  border-color: #334155;
}

.pods-value {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #64748b;
  word-break: break-all;
}

body.dark-mode .pods-value {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.pods-value i {
  color: #0284c7;
  flex-shrink: 0;
}

body.dark-mode .pods-value i {
  color: #38bdf8;
}

.field-hint {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

body.dark-mode .field-hint {
  color: #94a3b8;
}
</style>
