<template>
  <div class="guest-intro-editor">
    <div class="editor-header">
      <h3>Guest Introduction Component</h3>
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
      <!-- ROOT FIX: Only introduction field editor -->
      <div v-show="activeTab === 'content'" class="tab-panel">
        <section class="editor-section">
          <div class="section-header">
            <h4>Introduction Text</h4>
            <div class="section-actions">
              <button
                v-if="hasProfileData"
                type="button"
                class="profile-load-btn"
                @click="handleLoadFromProfile"
                title="Load introduction from your profile"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Load from Profile
              </button>
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
          </div>

          <div class="field-group">
            <label for="intro-text">Introduction</label>
            <textarea
              id="intro-text"
              v-model="localData.introduction"
              @input="updatePodsField"
              rows="12"
              placeholder="Enter the guest introduction text..."
            />
            <p v-if="isUsingPodsData" class="field-hint field-hint--pods">
              <strong>📄 Profile Field:</strong> Editing this text updates your profile. Changes apply to ALL media kits.
            </p>
            <p v-else class="field-hint field-hint--empty">
              <strong>⚠️ No data:</strong> The 'introduction' field is empty. Add text to populate it.
            </p>
          </div>

          <!-- Save to Profile button below the field -->
          <div v-if="canSaveToProfile" class="section-footer">
            <button
              type="button"
              class="profile-save-btn profile-save-btn--full"
              :class="{ 'is-saving': isSaving }"
              :disabled="isSaving || !localData.introduction"
              @click="handleSaveToProfile"
              title="Save introduction to your profile"
            >
              <svg v-if="!isSaving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              {{ isSaving ? 'Saving...' : 'Save to Profile' }}
            </button>
          </div>
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'guest-intro'"
          :show-typography="true"
        />
      </div>
      
      <!-- ADVANCED TAB -->
      <div v-show="activeTab === 'advanced'" class="tab-panel">
        <BaseAdvancedPanel
          :component-id="componentId"
        />
      </div>
    </div>

    <!-- AI Generation Modal -->
    <AiModal v-model="showAiModal" title="Generate Guest Introduction with AI">
      <GuestIntroGenerator
        mode="integrated"
        :component-id="componentId"
        @applied="handleAiApplied"
      />
    </AiModal>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import BaseStylePanel from '../../src/vue/components/sidebar/editors/BaseStylePanel.vue';
import BaseAdvancedPanel from '../../src/vue/components/sidebar/editors/BaseAdvancedPanel.vue';
import { AiModal } from '../../src/vue/components/ai';
import GuestIntroGenerator from '@tools/guest-intro/Generator.vue';
import { useProfilePrePopulation } from '@composables/useProfilePrePopulation';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();

// Tab state
const activeTab = ref('content');
const showAiModal = ref(false);
const tabs = [
  { id: 'content', label: 'Content' },
  { id: 'style', label: 'Style' },
  { id: 'advanced', label: 'Advanced' }
];

// Profile pre-population and save
const {
  hasProfileData,
  getPrePopulatedData,
  getProfileField,
  canSaveToProfile,
  isSaving,
  saveToProfile
} = useProfilePrePopulation('guest-intro');

// Data from component JSON state (single source of truth)
const localData = ref({
  introduction: ''
});

// Load data from profile
const handleLoadFromProfile = () => {
  const profileData = getPrePopulatedData();
  if (profileData.introduction) {
    localData.value.introduction = profileData.introduction;
    updatePodsField();
  }
};

// Save data to profile
const handleSaveToProfile = async () => {
  if (!localData.value.introduction || !localData.value.introduction.trim()) {
    console.warn('[GuestIntroEditor] No introduction content to save');
    return;
  }

  const result = await saveToProfile({ introduction: localData.value.introduction });

  if (result.success) {
    console.log('[GuestIntroEditor] ✅ Guest introduction saved to profile');
  } else {
    console.error('[GuestIntroEditor] ❌ Failed to save guest introduction:', result.errors);
  }
};

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];

  localData.value = {
    introduction: component?.data?.introduction || component?.props?.introduction || ''
  };
};

// Check if we have introduction data
const isUsingPodsData = computed(() => {
  return !!localData.value.introduction;
});

watch(() => props.componentId, loadComponentData, { immediate: true });

// Update component data
let updateTimeout = null;
const updatePodsField = async () => {
  if (updateTimeout) clearTimeout(updateTimeout);

  updateTimeout = setTimeout(async () => {
    try {
      console.log('[GuestIntroEditor] Updating component data: introduction =', localData.value.introduction);

      // Update component data in store - merge with existing data
      const existingData = store.components[props.componentId]?.data || {};
      store.updateComponent(props.componentId, {
        data: {
          ...existingData,
          introduction: localData.value.introduction
        }
      });

      console.log('✅ Saved introduction to component data');
      store.isDirty = true;
    } catch (error) {
      console.error('❌ Error saving component data:', error);
    }
  }, 500); // Debounce for better UX
};

const closeEditor = () => {
  store.closeEditPanel();
};

// Handle AI content applied
const handleAiApplied = (data) => {
  if (data.introduction) {
    localData.value.introduction = data.introduction;
    updatePodsField();
  }
  showAiModal.value = false;
};
</script>

<style scoped>
.guest-intro-editor {
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
.field-group textarea:focus,
.field-group select:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-group textarea {
  resize: vertical;
  font-family: inherit;
}

.field-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

.field-hint--pods {
  color: #0ea5e9;
  font-style: normal;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 4px;
  border-left: 3px solid #0ea5e9;
}

.field-hint--pods strong {
  color: #0284c7;
}

.field-hint--empty {
  color: #f59e0b;
  font-style: normal;
  padding: 8px 12px;
  background: #fffbeb;
  border-radius: 4px;
  border-left: 3px solid #f59e0b;
}

.field-hint--empty strong {
  color: #d97706;
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

/* Section Header with Action Buttons */
.section-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
}

.section-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.section-actions button {
  width: 100%;
  justify-content: center;
}

.profile-load-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-load-btn:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.profile-load-btn svg {
  flex-shrink: 0;
}

.profile-save-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-save-btn:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
}

.profile-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.profile-save-btn.is-saving {
  opacity: 0.7;
}

.profile-save-btn svg {
  flex-shrink: 0;
}

.profile-save-btn svg.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

/* Section Footer with Save Button */
.section-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.profile-save-btn--full {
  width: 100%;
  justify-content: center;
  padding: 10px 16px;
  font-size: 14px;
}
</style>
