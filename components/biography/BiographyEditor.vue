<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Biography"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @close="handleClose"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <!-- SIMPLIFIED: Biography text only -->
        <section class="editor-section">
          <div class="section-header">
            <h4>Biography Text</h4>
            <button
              type="button"
              class="ai-generate-btn"
              @click="showAiModal = true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Generate with AI
            </button>
          </div>

          <div class="field-group">
            <label for="bio-text">Biography</label>
            <textarea
              id="bio-text"
              v-model="localData.biography"
              @input="updateComponent"
              rows="12"
              placeholder="Enter biography text..."
            />
            <p class="field-hint">Write your biography here. This will be displayed on the frontend.</p>
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>

  <!-- AI Generation Modal -->
  <AiModal v-model="showAiModal" title="Generate Biography with AI">
    <BiographyGenerator
      mode="integrated"
      :component-id="componentId"
      @applied="handleAiApplied"
    />
  </AiModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '@stores/mediaKit';
import ComponentEditorTemplate from '@/vue/components/sidebar/editors/ComponentEditorTemplate.vue';
import { AiModal, BiographyGenerator } from '@/vue/components/ai';

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

// AI Modal state
const showAiModal = ref(false);

// SIMPLIFIED: Local data state - biography text only
const localData = ref({
  biography: ''
});

// Initialize local data from store
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    // Load biography text only
    localData.value = {
      biography: component.data.biography || component.data.bio || component.data.content || ''
    };
  }
};

// Watch for component changes
watch(() => props.componentId, () => {
  loadComponentData();
}, { immediate: true });

// Update component in store with debouncing
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  updateTimeout = setTimeout(() => {
    // SIMPLIFIED: Only save biography text
    store.updateComponent(props.componentId, {
      data: {
        biography: localData.value.biography,
        // Aliases for compatibility
        bio: localData.value.biography,
        content: localData.value.biography
      }
    });
    
    store.isDirty = true;
  }, 300);
};

// Handle close button
const handleClose = () => {
  emit('close');
};

// Handle AI content applied
const handleAiApplied = (data) => {
  if (data.content) {
    localData.value.biography = data.content;
    updateComponent();
  }
  showAiModal.value = false;
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

.field-group input[type="text"],
.field-group input[type="url"],
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

body.dark-mode .field-group input[type="text"],
body.dark-mode .field-group input[type="url"],
body.dark-mode .field-group textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
}

.field-group input:focus,
.field-group textarea:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.field-group textarea {
  resize: vertical;
  min-height: 120px;
}

.field-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
}

body.dark-mode .field-hint {
  color: #64748b;
}

/* Section Header with AI Button */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
}

.ai-generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-generate-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
}

.ai-generate-btn svg {
  flex-shrink: 0;
}

body.dark-mode .ai-generate-btn {
  color: #818cf8;
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.25);
}

body.dark-mode .ai-generate-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.35);
}
</style>
