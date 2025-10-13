<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Podcast Player"
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
            <input v-model="localData.title" @input="updateComponent" placeholder="Podcast Episodes" />
          </div>
          <div class="field-group">
            <label>Description</label>
            <textarea v-model="localData.description" @input="updateComponent" rows="2"/>
          </div>
        </section>
        <section class="editor-section">
          <h4>Episodes</h4>
          <p class="help-text">Add up to 5 episodes</p>
          <div class="episodes-list">
            <div v-for="(episode, index) in localData.episodes" :key="index" class="episode-item">
              <div class="episode-header">
                <span class="episode-number">Episode {{ index + 1 }}</span>
                <button @click="removeEpisode(index)" class="remove-btn">×</button>
              </div>
              <div class="field-group">
                <label>Title *</label>
                <input v-model="episode.title" @input="updateComponent" />
              </div>
              <div class="field-group">
                <label>Description</label>
                <textarea v-model="episode.description" @input="updateComponent" rows="2"/>
              </div>
              <div class="field-group">
                <label>Audio URL</label>
                <input v-model="episode.audio_url" @input="updateComponent" type="url" placeholder="https://example.com/episode.mp3" />
              </div>
              <div class="field-group">
                <label>Spotify URL</label>
                <input v-model="episode.spotify_url" @input="updateComponent" type="url" />
              </div>
              <div class="field-group">
                <label>Apple Podcasts URL</label>
                <input v-model="episode.apple_url" @input="updateComponent" type="url" />
              </div>
              <div class="field-group">
                <label>Duration</label>
                <input v-model="episode.duration" @input="updateComponent" placeholder="45:30" />
              </div>
            </div>
            <button v-if="localData.episodes.length < 5" @click="addEpisode" class="add-btn">+ Add Episode</button>
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

const props = defineProps({ componentId: { type: String, required: true } });
const emit = defineEmits(['close']);
const store = useMediaKitStore();
const activeTab = ref('content');

const localData = ref({ title: 'Podcast Episodes', description: '', episodes: [] });

const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component?.data) {
    localData.value = {
      title: component.data.title || 'Podcast Episodes',
      description: component.data.description || '',
      episodes: Array.isArray(component.data.episodes) ? [...component.data.episodes] : []
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

const addEpisode = () => {
  localData.value.episodes.push({
    title: '',
    description: '',
    audio_url: '',
    spotify_url: '',
    apple_url: '',
    duration: ''
  });
  updateComponent();
};

const removeEpisode = (index) => {
  localData.value.episodes.splice(index, 1);
  updateComponent();
};

let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        title: localData.value.title,
        description: localData.value.description,
        episodes: localData.value.episodes.filter(e => e.title)
      }
    });
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
.episodes-list { display: flex; flex-direction: column; gap: 16px; }
.episode-item { padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb; }
body.dark-mode .episode-item { background: #0f172a; border-color: #334155; }
.episode-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.episode-number { font-weight: 600; color: #3b82f6; font-size: 14px; }
.remove-btn { width: 24px; height: 24px; background: #fef2f2; border: 1px solid #fecaca; color: #ef4444; border-radius: 4px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
.remove-btn:hover { background: #fee2e2; }
.add-btn { padding: 12px; background: #f0f9ff; border: 1px solid #bae6fd; color: #0284c7; border-radius: 6px; cursor: pointer; font-weight: 500; width: 100%; }
.add-btn:hover { background: #e0f2fe; }
</style>
