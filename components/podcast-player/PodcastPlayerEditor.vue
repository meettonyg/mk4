<template>
  <div class="podcast-player-editor">
    <div class="editor-header">
      <h3>Edit Podcast Player</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Podcast Title -->
      <div class="field-group">
        <label for="podcast-title">Episode Title</label>
        <input 
          id="podcast-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., Episode 42: Interview with..."
        >
      </div>
      
      <!-- Audio URL -->
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
      
      <!-- Episode Details -->
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
      
      <!-- Description -->
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
      
      <!-- Subscribe Links -->
      <div class="field-group">
        <label>Podcast Platform Links</label>
        <div class="platform-links">
          <input 
            v-model="localData.spotifyUrl" 
            @input="updateComponent"
            placeholder="Spotify URL"
            class="platform-field"
          >
          <input 
            v-model="localData.appleUrl" 
            @input="updateComponent"
            placeholder="Apple Podcasts URL"
            class="platform-field"
          >
          <input 
            v-model="localData.googleUrl" 
            @input="updateComponent"
            placeholder="Google Podcasts URL"
            class="platform-field"
          >
          <input 
            v-model="localData.rssUrl" 
            @input="updateComponent"
            placeholder="RSS Feed URL"
            class="platform-field"
          >
        </div>
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
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
    store.hasUnsavedChanges = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.podcast-player-editor {
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

.platform-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.platform-field {
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
