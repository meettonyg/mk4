<template>
  <div class="podcast-player-editor">
    <div class="editor-header">
      <h3>Podcast Player Component</h3>
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
          <h4>Episode Information</h4>
          
          <div class="field-group">
            <label for="podcast-title">Episode Title</label>
            <input 
              id="podcast-title"
              v-model="localData.title" 
              @input="updateComponent"
              placeholder="e.g., Episode 42: Interview with..."
            >
          </div>
          
          <div class="field-group">
            <label for="audio-url">Audio File URL</label>
            <input 
              id="audio-url"
              v-model="localData.audioUrl" 
              @input="updateComponent"
              placeholder="MP3 or audio file URL"
            >
            <button @click="openMediaLibrary" class="media-btn">
              Choose from Media Library
            </button>
          </div>
          
          <div class="field-group">
            <label for="episode-number">Episode Number</label>
            <input 
              id="episode-number"
              v-model="localData.episodeNumber" 
              @input="updateComponent"
              placeholder="e.g., 42"
            >
          </div>
          
          <div class="field-group">
            <label for="duration">Duration</label>
            <input 
              id="duration"
              v-model="localData.duration" 
              @input="updateComponent"
              placeholder="e.g., 45:30"
            >
          </div>
          
          <div class="field-group">
            <label for="publish-date">Publish Date</label>
            <input 
              id="publish-date"
              v-model="localData.publishDate" 
              @input="updateComponent"
              type="date"
            >
          </div>
          
          <div class="field-group">
            <label for="description">Episode Description</label>
            <textarea 
              id="description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="4"
              placeholder="Brief description or show notes..."
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Podcast Platform Links</h4>
          
          <div class="field-group">
            <label for="spotify">Spotify URL</label>
            <input 
              id="spotify"
              v-model="localData.spotifyUrl" 
              @input="updateComponent"
              placeholder="https://open.spotify.com/..."
            >
          </div>
          
          <div class="field-group">
            <label for="apple">Apple Podcasts URL</label>
            <input 
              id="apple"
              v-model="localData.appleUrl" 
              @input="updateComponent"
              placeholder="https://podcasts.apple.com/..."
            >
          </div>
          
          <div class="field-group">
            <label for="google">Google Podcasts URL</label>
            <input 
              id="google"
              v-model="localData.googleUrl" 
              @input="updateComponent"
              placeholder="https://podcasts.google.com/..."
            >
          </div>
          
          <div class="field-group">
            <label for="rss">RSS Feed URL</label>
            <input 
              id="rss"
              v-model="localData.rssUrl" 
              @input="updateComponent"
              placeholder="https://..."
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Player Options</h4>
          
          <div class="field-group">
            <label for="player-style">Player Style</label>
            <select 
              id="player-style"
              v-model="localData.playerStyle" 
              @change="updateComponent"
            >
              <option value="default">Default</option>
              <option value="minimal">Minimal</option>
              <option value="card">Card Style</option>
              <option value="full">Full Featured</option>
            </select>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showTranscript" 
                @change="updateComponent"
              >
              Show Transcript
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showShareButtons" 
                @change="updateComponent"
              >
              Show Share Buttons
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showDownload" 
                @change="updateComponent"
              >
              Allow Download
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showPlaybackSpeed" 
                @change="updateComponent"
              >
              Show Playback Speed Control
            </label>
          </div>
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'podcast-player'"
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
  audioUrl: '',
  episodeNumber: '',
  duration: '',
  publishDate: '',
  description: '',
  spotifyUrl: '',
  appleUrl: '',
  googleUrl: '',
  rssUrl: '',
  playerStyle: 'default',
  showTranscript: false,
  showShareButtons: true,
  showDownload: true,
  showPlaybackSpeed: true
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || '',
      audioUrl: component.data.audioUrl || component.data.url || '',
      episodeNumber: component.data.episodeNumber || '',
      duration: component.data.duration || '',
      publishDate: component.data.publishDate || '',
      description: component.data.description || '',
      spotifyUrl: component.data.spotifyUrl || '',
      appleUrl: component.data.appleUrl || '',
      googleUrl: component.data.googleUrl || '',
      rssUrl: component.data.rssUrl || '',
      playerStyle: component.data.playerStyle || 'default',
      showTranscript: component.data.showTranscript || false,
      showShareButtons: component.data.showShareButtons !== false,
      showDownload: component.data.showDownload !== false,
      showPlaybackSpeed: component.data.showPlaybackSpeed !== false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Open WordPress Media Library
const openMediaLibrary = () => {
  if (window.wp && window.wp.media) {
    const frame = window.wp.media({
      title: 'Select Audio File',
      button: {
        text: 'Use this audio'
      },
      library: {
        type: 'audio'
      },
      multiple: false
    });
    
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      localData.value.audioUrl = attachment.url;
      if (attachment.title) {
        localData.value.title = attachment.title;
      }
      updateComponent();
    });
    
    frame.open();
  } else {
    alert('WordPress Media Library not available. Please enter an audio URL manually.');
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
        audioUrl: localData.value.audioUrl,
        url: localData.value.audioUrl, // Legacy compatibility
        episodeNumber: localData.value.episodeNumber,
        duration: localData.value.duration,
        publishDate: localData.value.publishDate,
        description: localData.value.description,
        spotifyUrl: localData.value.spotifyUrl,
        appleUrl: localData.value.appleUrl,
        googleUrl: localData.value.googleUrl,
        rssUrl: localData.value.rssUrl,
        playerStyle: localData.value.playerStyle,
        showTranscript: localData.value.showTranscript,
        showShareButtons: localData.value.showShareButtons,
        showDownload: localData.value.showDownload,
        showPlaybackSpeed: localData.value.showPlaybackSpeed
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
.podcast-player-editor {
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
