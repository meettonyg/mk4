<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Booking Calendar"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @close="handleClose"
  >
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Section Settings</h4>
          <div class="field-group">
            <label>Title</label>
            <input v-model="localData.title" @input="updateComponent" placeholder="Book a Meeting" />
          </div>
          <div class="field-group">
            <label>Description</label>
            <textarea v-model="localData.description" @input="updateComponent" rows="2"/>
          </div>
        </section>
        <section class="editor-section">
          <h4>Calendar Integration</h4>
          <div class="field-group">
            <label>Calendar Service</label>
            <select v-model="localData.calendar_service" @change="updateComponent">
              <option value="">None (Use Form)</option>
              <option value="calendly">Calendly</option>
              <option value="google">Google Calendar</option>
            </select>
          </div>
          <div class="field-group">
            <label>Calendar URL</label>
            <input v-model="localData.calendar_url" @input="updateComponent" type="url" placeholder="https://calendly.com/username" />
            <p class="help-text">Your Calendly or Google Calendar booking link</p>
          </div>
        </section>
        <section v-if="!localData.calendar_url" class="editor-section">
          <h4>Fallback Form Settings</h4>
          <p class="help-text">Used when no calendar URL is provided</p>
          <div class="field-group">
            <label>Available Times (one per line)</label>
            <textarea v-model="availableTimesText" @input="updateAvailableTimes" rows="4" placeholder="9:00 AM&#10;10:00 AM&#10;2:00 PM"/>
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import ComponentEditorTemplate from '../../src/vue/components/sidebar/editors/ComponentEditorTemplate.vue';

const props = defineProps({ componentId: { type: String, required: true } });
const emit = defineEmits(['close']);
const store = useMediaKitStore();
const activeTab = ref('content');

const localData = ref({
  title: 'Book a Meeting',
  description: '',
  calendar_service: '',
  calendar_url: '',
  available_times: []
});

const availableTimesText = ref('');

const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component?.data) {
    localData.value = {
      title: component.data.title || 'Book a Meeting',
      description: component.data.description || '',
      calendar_service: component.data.calendar_service || '',
      calendar_url: component.data.calendar_url || component.data.calendly_url || '',
      available_times: component.data.available_times || []
    };
    availableTimesText.value = Array.isArray(localData.value.available_times)
      ? localData.value.available_times.join('\n')
      : '';
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

const updateAvailableTimes = () => {
  localData.value.available_times = availableTimesText.value
    .split('\n')
    .map(t => t.trim())
    .filter(t => t);
  updateComponent();
};

let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, { data: { ...localData.value } });
    store.isDirty = true;
  }, 300);
};

const handleClose = () => emit('close');
</script>

<style scoped>
.content-fields { padding: 20px; }
.editor-section { background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e5e7eb; }
body.dark-mode .editor-section { background: #1e293b; border-color: #334155; }
.editor-section h4 { margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #475569; text-transform: uppercase; }
body.dark-mode .editor-section h4 { color: #94a3b8; }
.help-text { margin: 4px 0 0 0; font-size: 12px; color: #64748b; }
body.dark-mode .help-text { color: #94a3b8; }
.field-group { margin-bottom: 16px; }
.field-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #64748b; }
body.dark-mode .field-group label { color: #94a3b8; }
.field-group input, .field-group select, .field-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; background: white; color: #1f2937; font-family: inherit; }
body.dark-mode .field-group input, body.dark-mode .field-group select, body.dark-mode .field-group textarea { background: #0f172a; border-color: #334155; color: #f3f4f6; }
.field-group textarea { resize: vertical; }
</style>
