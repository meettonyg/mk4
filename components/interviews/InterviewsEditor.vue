<template>
  <div class="interviews-editor">
    <div class="editor-header">
      <h3>Featured Interviews</h3>
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
    <!-- Interview Selection with Dropdown UI -->
    <div class="editor-section">
      <h4 class="editor-section-title">Select Interviews</h4>

      <div v-if="isLoadingInterviews" class="loading-state">
        <div class="spinner"></div>
        Loading interviews from portfolio...
      </div>

      <div v-else-if="availableInterviews.length === 0" class="empty-state">
        <p>No interviews found in your portfolio.</p>
        <a href="/wp-admin/admin.php?page=showauthority-appearances" target="_blank" class="create-link">
          Add Interviews to Portfolio
        </a>
      </div>

      <div v-else class="interviews-selector">
        <!-- Selected Interviews as Cards -->
        <div v-if="selectedInterviewCards.length > 0" class="selected-interviews-cards">
          <div
            v-for="interview in selectedInterviewCards"
            :key="interview.id"
            class="featured-card"
          >
            <div class="featured-card-content">
              <div class="featured-card-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                </svg>
              </div>
              <div class="featured-card-info">
                <div class="featured-card-title">{{ interview.podcast_name || 'Podcast' }}</div>
                <div class="featured-card-subtitle">{{ interview.title || interview.episode_title }}</div>
              </div>
            </div>
            <button
              @click="removeFromSelection(interview.id)"
              class="featured-card-remove"
              title="Remove"
              type="button"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-else class="empty-selection-state">
          <p>No interviews selected.</p>
        </div>

        <!-- Dropdown Selector - Auto-add on select -->
        <div class="add-interview-dropdown">
          <label class="dropdown-label">Add from Portfolio</label>
          <select
            v-model="selectedForAdd"
            class="dropdown-select"
            :disabled="availableInterviews.length === 0"
            @change="addSelectedInterview"
          >
            <option value="" disabled>Select an interview...</option>
            <option
              v-for="interview in unselectedInterviews"
              :key="interview.id"
              :value="interview.id"
            >
              {{ interview.podcast_name }} - {{ truncate(interview.episode_title || interview.title, 30) }}
            </option>
          </select>
          <p class="selection-hint">
            {{ selectedInterviewIds.length }} selected
          </p>
        </div>

        <!-- Link to Portfolio -->
        <a href="/wp-admin/admin.php?page=showauthority-appearances" target="_blank" class="portfolio-link">
          + Add new to Portfolio
        </a>
      </div>
    </div>

    <!-- Layout Options -->
    <div class="editor-section">
      <h4 class="editor-section-title">Layout</h4>

      <div class="field-group">
        <label class="field-label">Display Style</label>
        <select v-model="localData.layout" class="field-select" @change="updateData">
          <option value="grid">Grid</option>
          <option value="list">List</option>
          <option value="featured">Featured (Single)</option>
        </select>
      </div>

      <div v-if="localData.layout === 'grid'" class="field-group">
        <label class="field-label">Columns</label>
        <select v-model="localData.columns" class="field-select" @change="updateData">
          <option value="1">1 Column</option>
          <option value="2">2 Columns</option>
          <option value="3">3 Columns</option>
        </select>
      </div>

      <div class="field-group">
        <label class="field-label">Card Style</label>
        <select v-model="localData.cardStyle" class="field-select" @change="updateData">
          <option value="bordered">Bordered</option>
          <option value="elevated">Elevated (Shadow)</option>
          <option value="flat">Flat</option>
          <option value="gradient">Gradient</option>
        </select>
      </div>
    </div>

    <!-- Content Options -->
    <div class="editor-section">
      <h4 class="editor-section-title">Content</h4>

      <div class="field-group">
        <label class="field-label">Section Title</label>
        <input
          v-model="localData.customTitle"
          type="text"
          class="field-input"
          placeholder="Featured Interviews"
          @input="updateData"
        />
      </div>

      <div class="field-group">
        <label class="field-label">Title Alignment</label>
        <select v-model="localData.titleAlignment" class="field-select" @change="updateData">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div class="field-group">
        <label class="field-label">Max Interviews to Show</label>
        <input
          v-model.number="localData.maxInterviews"
          type="number"
          class="field-input"
          min="1"
          max="20"
          @input="updateData"
        />
      </div>
    </div>

    <!-- Display Options -->
    <div class="editor-section">
      <h4 class="editor-section-title">Display Options</h4>

      <label class="checkbox-field">
        <input type="checkbox" v-model="localData.showPodcastName" @change="updateData" />
        <span>Show Podcast Name</span>
      </label>

      <label class="checkbox-field">
        <input type="checkbox" v-model="localData.showHostName" @change="updateData" />
        <span>Show Host Name</span>
      </label>

      <label class="checkbox-field">
        <input type="checkbox" v-model="localData.showDate" @change="updateData" />
        <span>Show Date</span>
      </label>

      <label class="checkbox-field">
        <input type="checkbox" v-model="localData.showDuration" @change="updateData" />
        <span>Show Duration</span>
      </label>

      <label class="checkbox-field">
        <input type="checkbox" v-model="localData.showTopics" @change="updateData" />
        <span>Show Topics</span>
      </label>

      <label class="checkbox-field">
        <input type="checkbox" v-model="localData.showListenButton" @change="updateData" />
        <span>Show Listen Button</span>
      </label>
    </div>
      </div>

      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'interviews'"
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { apiRequest } from '../../src/utils/api.js';
import BaseStylePanel from '../../src/vue/components/sidebar/editors/BaseStylePanel.vue';
import BaseAdvancedPanel from '../../src/vue/components/sidebar/editors/BaseAdvancedPanel.vue';

const props = defineProps({
  componentId: { type: String, required: true },
  data: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['update', 'close']);
const store = useMediaKitStore();

// Tab state
const activeTab = ref('content');
const tabs = [
  { id: 'content', label: 'Content' },
  { id: 'style', label: 'Style' },
  { id: 'advanced', label: 'Advanced' }
];

const closeEditor = () => {
  store.closeEditPanel();
};

// Check if editing a profile (guests post type) - interviews should sync with profile
const isProfilePost = computed(() => window.gmkbData?.postType === 'guests');
const profileId = computed(() => isProfilePost.value ? window.gmkbData?.postId : null);

// Local state
const isLoadingInterviews = ref(false);
const availableInterviews = ref([]);
const selectedForAdd = ref('');

const localData = reactive({
  selectedInterviewIds: [],
  layout: 'grid',
  columns: '2',
  cardStyle: 'elevated',
  customTitle: 'Featured Interviews',
  titleAlignment: 'center',
  maxInterviews: 6,
  showPodcastName: true,
  showHostName: true,
  showDate: true,
  showDuration: true,
  showTopics: true,
  showListenButton: true,
  ...props.data
});

const selectedInterviewIds = computed({
  get: () => localData.selectedInterviewIds || [],
  set: (val) => { localData.selectedInterviewIds = val; }
});

// Hydrate selected IDs into full interview objects for card display
const selectedInterviewCards = computed(() => {
  return selectedInterviewIds.value
    .map(id => availableInterviews.value.find(i => i.id === id))
    .filter(Boolean);
});

const isSelected = (id) => selectedInterviewIds.value.includes(id);

// Filter out already-selected interviews for the dropdown
const unselectedInterviews = computed(() => {
  return availableInterviews.value.filter(i => !isSelected(i.id));
});

// Truncate helper for compact display
const truncate = (str, len) => {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
};

// Add from dropdown
const addSelectedInterview = () => {
  if (!selectedForAdd.value) return;
  if (!isSelected(selectedForAdd.value)) {
    selectedInterviewIds.value = [...selectedInterviewIds.value, selectedForAdd.value];
    updateData();
  }
  selectedForAdd.value = '';
};

// Remove from selection
const removeFromSelection = (idToRemove) => {
  selectedInterviewIds.value = selectedInterviewIds.value.filter(id => id !== idToRemove);
  updateData();
};

const updateData = () => {
  const updatedData = { ...localData };

  // Embed full interview data for rendering
  if (selectedInterviewIds.value.length > 0) {
    updatedData.interviewsData = availableInterviews.value.filter(i =>
      selectedInterviewIds.value.includes(i.id)
    );
  }

  emit('update', updatedData);

  // Also update store directly
  if (store.components[props.componentId]) {
    store.updateComponent(props.componentId, { data: updatedData });
  }
};

// Load profile's featured interviews (for syncing with profile page)
const loadProfileInterviews = async () => {
  if (!profileId.value) return;

  try {
    const result = await apiRequest(`profiles/${profileId.value}/interviews`);
    const profileInterviewIds = (result.interviews || []).map(i => i.id);
    if (profileInterviewIds.length > 0) {
      selectedInterviewIds.value = profileInterviewIds;
    }
  } catch (error) {
    console.error('Failed to load profile interviews:', error);
  }
};

// Sync selected interviews to profile's featured interviews
const syncToProfile = async () => {
  if (!profileId.value) return;

  try {
    await apiRequest(`profiles/${profileId.value}/interviews`, {
      method: 'PUT',
      body: { interview_ids: selectedInterviewIds.value }
    });
  } catch (error) {
    console.error('Failed to sync interviews to profile:', error);
  }
};

// Watch for interview selection changes and sync to profile
watch(selectedInterviewIds, () => {
  if (profileId.value) {
    syncToProfile();
  }
  // Always update component data so renderer gets interviewsData
  updateData();
}, { deep: true });

const fetchInterviews = async () => {
  isLoadingInterviews.value = true;
  try {
    // Pass profile_id so API can get interviews for the profile's owner
    const postId = window.gmkbData?.postId || '';
    const result = await apiRequest(`interviews?per_page=100&profile_id=${postId}`);
    availableInterviews.value = result.interviews || [];
  } catch (error) {
    console.error('Failed to fetch interviews:', error);
  } finally {
    isLoadingInterviews.value = false;
  }
};

// Initialize
onMounted(async () => {
  await fetchInterviews();

  // If editing a profile, load profile's featured interviews for sync
  // Only load if no interviews are already selected in component data
  if (profileId.value && selectedInterviewIds.value.length === 0) {
    await loadProfileInterviews();
  }

  // Ensure renderer gets interview data after everything is loaded
  updateData();
});

// Sync props changes
watch(() => props.data, (newData) => {
  Object.assign(localData, newData);
}, { deep: true });
</script>

<style scoped>
.interviews-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
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
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.editor-section:last-child {
  margin-bottom: 0;
}

.editor-section-title {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Loading/Empty States */
.loading-state,
.empty-state {
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.create-link {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: #8b5cf6;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
}

/* Selected Interviews Cards */
.selected-interviews-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.featured-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.featured-card:hover {
  border-color: #8b5cf6;
}

.featured-card-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.featured-card-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f3ff;
  border-radius: 4px;
  color: #8b5cf6;
  flex-shrink: 0;
}

.featured-card-info {
  flex: 1;
  min-width: 0;
}

.featured-card-title {
  font-weight: 600;
  color: #111827;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.featured-card-subtitle {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.featured-card-remove {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  flex-shrink: 0;
  margin-left: 4px;
}

.featured-card-remove:hover {
  background: #fef2f2;
  color: #ef4444;
}

.empty-selection-state {
  padding: 12px;
  text-align: center;
  background: #f9fafb;
  border: 1px dashed #e5e7eb;
  border-radius: 6px;
  margin-bottom: 10px;
}

.empty-selection-state p {
  margin: 0;
  color: #6b7280;
  font-size: 0.75rem;
}

/* Dropdown Selector */
.add-interview-dropdown {
  margin-bottom: 10px;
}

.dropdown-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.dropdown-select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.8rem;
  background: white;
  color: #374151;
  cursor: pointer;
}

.dropdown-select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

.dropdown-select:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.selection-hint {
  margin: 4px 0 0;
  font-size: 0.7rem;
  color: #6b7280;
}

/* Portfolio Link */
.portfolio-link {
  display: block;
  padding: 8px;
  color: #8b5cf6;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  transition: all 0.2s;
  margin-top: 8px;
}

.portfolio-link:hover {
  background: #f5f3ff;
  border-color: #8b5cf6;
}

/* Field Groups */
.field-group {
  margin-bottom: 1rem;
}

.field-label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field-input,
.field-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #ffffff;
}

.field-input:focus,
.field-select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

/* Checkbox Fields */
.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.checkbox-field input {
  width: 16px;
  height: 16px;
}
</style>
