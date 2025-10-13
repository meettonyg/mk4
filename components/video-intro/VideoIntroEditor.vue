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
          <h4>Video URL</h4>
          <p class="help-text">Supports YouTube, Vimeo, or direct video URLs</p>
          <div class="field-group">
            <label>Video URL *</label>
            <input v-model="localData.video_url" @input="updateComponent" type="url" placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div class="field-group">
            <label>Thumbnail URL (Optional)</label>
            <input v-model="localData.thumbnail" @input="updateComponent" type="url" placeholder="https://example.com/thumb.jpg" />
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

const localData = ref({ title: 'Watch My Introduction', description: '', video_url: '', thumbnail: '' });

const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component?.data) {
    localData.value = {
      title: component.data.title || 'Watch My Introduction',
      description: component.data.description || '',
      video_url: component.data.video_url || component.data.url || '',
      thumbnail: component.data.thumbnail || component.data.poster || ''
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, { data: { ...localData.value } });
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
</style>
