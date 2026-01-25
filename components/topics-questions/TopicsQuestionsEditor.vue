<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Topics & Questions"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @close="handleClose"
  >
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Display Mode</h4>
          <div class="field-group">
            <label>Default View</label>
            <select v-model="localData.displayMode" @change="updateComponent">
              <option value="topics">Topics Only</option>
              <option value="questions">Questions Only</option>
              <option value="combined">Topics & Questions</option>
            </select>
          </div>
          <div class="field-group">
            <label><input type="checkbox" v-model="localData.showModeSelector" @change="updateComponent" /> Show Mode Selector</label>
          </div>
        </section>
        <section class="editor-section">
          <h4>Topics</h4>
          <div class="field-group">
            <label>Topics Title</label>
            <input v-model="localData.topicsTitle" @input="updateComponent" placeholder="Topics of Expertise" />
          </div>
          <div class="field-group">
            <label>Topics Display Style</label>
            <select v-model="localData.topicsDisplay" @change="updateComponent">
              <option value="cards">Cards</option>
              <option value="list">List</option>
            </select>
          </div>
          <div v-for="i in 5" :key="`topic_${i}`" class="field-group">
            <label>Topic {{ i }}</label>
            <input v-model="localData[`topic_${i}`]" @input="updateComponent" />
          </div>
        </section>
        <section class="editor-section">
          <h4>Questions</h4>
          <div class="field-group">
            <label>Questions Title</label>
            <input v-model="localData.questionsTitle" @input="updateComponent" placeholder="Interview Questions" />
          </div>
          <div class="field-group">
            <label>Questions Display Style</label>
            <select v-model="localData.questionsDisplay" @change="updateComponent">
              <option value="list">List</option>
              <option value="accordion">Accordion</option>
            </select>
          </div>
          <div v-for="i in 10" :key="`question_${i}`" class="field-group">
            <label>Question {{ i }}</label>
            <input v-model="localData[`question_${i}`]" @input="updateComponent" />
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

const localData = ref({
  displayMode: 'combined',
  showModeSelector: true,
  topicsTitle: 'Topics of Expertise',
  topicsDisplay: 'cards',
  questionsTitle: 'Interview Questions',
  questionsDisplay: 'list'
});

for (let i = 1; i <= 5; i++) localData.value[`topic_${i}`] = '';
for (let i = 1; i <= 10; i++) localData.value[`question_${i}`] = '';

const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component?.data) {
    Object.assign(localData.value, component.data);
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

const handleClose = () => emit('close');
</script>

<style scoped>
.content-fields { padding: 20px; }
.editor-section { background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e5e7eb; }
body.dark-mode .editor-section { background: #1e293b; border-color: #334155; }
.editor-section h4 { margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #475569; text-transform: uppercase; }
body.dark-mode .editor-section h4 { color: #94a3b8; }
.field-group { margin-bottom: 12px; }
.field-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #64748b; }
.field-group input, .field-group select { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; background: white; color: #1f2937; font-family: inherit; }
body.dark-mode .field-group input, body.dark-mode .field-group select { background: #0f172a; border-color: #334155; color: #f3f4f6; }
.field-group input[type="checkbox"] { width: auto; margin-right: 8px; }
</style>
