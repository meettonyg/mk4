<template>
  <div class="interviews-editor">
    <!-- Interview Selection -->
    <div class="editor-section">
      <h4 class="editor-section-title">Select Interviews</h4>

      <div v-if="isLoadingInterviews" class="loading-state">
        <div class="spinner"></div>
        Loading interviews...
      </div>

      <div v-else-if="availableInterviews.length === 0" class="empty-state">
        <p>No interviews found. Create interviews in the Interviews Manager first.</p>
        <a href="/wp-admin/edit.php?post_type=gmkb_interview" target="_blank" class="create-link">
          Create Interviews
        </a>
      </div>

      <div v-else class="interviews-selector">
        <div class="search-box">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search interviews..."
            class="search-input"
          />
        </div>

        <div class="interviews-checklist">
          <label
            v-for="interview in filteredInterviews"
            :key="interview.id"
            class="interview-checkbox"
            :class="{ 'is-selected': isSelected(interview.id) }"
          >
            <input
              type="checkbox"
              :checked="isSelected(interview.id)"
              @change="toggleInterview(interview.id)"
            />
            <span class="interview-info">
              <span class="interview-name">{{ interview.title }}</span>
              <span class="interview-meta">
                <span v-if="interview.podcast_name" class="interview-podcast">{{ interview.podcast_name }}</span>
                <span v-if="interview.publish_date" class="interview-date">{{ formatDate(interview.publish_date) }}</span>
              </span>
            </span>
          </label>
        </div>

        <p class="selection-count">
          {{ selectedInterviewIds.length }} interview{{ selectedInterviewIds.length !== 1 ? 's' : '' }} selected
        </p>
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
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';

const props = defineProps({
  componentId: { type: String, required: true },
  data: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['update']);
const store = useMediaKitStore();

// Local state
const isLoadingInterviews = ref(false);
const availableInterviews = ref([]);
const searchTerm = ref('');

const localData = reactive({
  selectedInterviewIds: [],
  layout: 'grid',
  columns: '2',
  cardStyle: 'elevated',
  customTitle: 'Featured Interviews',
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

const filteredInterviews = computed(() => {
  if (!searchTerm.value) return availableInterviews.value;
  const term = searchTerm.value.toLowerCase();
  return availableInterviews.value.filter(i =>
    i.title.toLowerCase().includes(term) ||
    (i.podcast_name && i.podcast_name.toLowerCase().includes(term)) ||
    (i.host_name && i.host_name.toLowerCase().includes(term))
  );
});

const isSelected = (id) => selectedInterviewIds.value.includes(id);

const toggleInterview = (id) => {
  const idx = selectedInterviewIds.value.indexOf(id);
  if (idx === -1) {
    selectedInterviewIds.value = [...selectedInterviewIds.value, id];
  } else {
    selectedInterviewIds.value = selectedInterviewIds.value.filter(i => i !== id);
  }
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

const fetchInterviews = async () => {
  isLoadingInterviews.value = true;
  try {
    const apiUrl = window.gmkbData?.apiUrl || '/wp-json/';
    const response = await fetch(`${apiUrl}gmkb/v2/interviews?per_page=100`, {
      headers: { 'X-WP-Nonce': window.gmkbData?.nonce || '' }
    });

    if (response.ok) {
      const data = await response.json();
      availableInterviews.value = Array.isArray(data) ? data : (data.interviews || []);
    }
  } catch (error) {
    console.error('Failed to fetch interviews:', error);
  } finally {
    isLoadingInterviews.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Initialize
onMounted(() => {
  fetchInterviews();
});

// Sync props changes
watch(() => props.data, (newData) => {
  Object.assign(localData, newData);
}, { deep: true });
</script>

<style scoped>
.interviews-editor {
  padding: 1rem;
}

.editor-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.editor-section:last-child {
  border-bottom: none;
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

/* Search */
.search-box {
  margin-bottom: 0.75rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

/* Interviews Checklist */
.interviews-checklist {
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.interview-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f3f4f6;
}

.interview-checkbox:last-child {
  border-bottom: none;
}

.interview-checkbox:hover {
  background: #f9fafb;
}

.interview-checkbox.is-selected {
  background: #f5f3ff;
}

.interview-checkbox input {
  flex-shrink: 0;
}

.interview-info {
  flex: 1;
  min-width: 0;
}

.interview-name {
  display: block;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.interview-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.interview-podcast {
  color: #8b5cf6;
}

.selection-count {
  margin: 0.75rem 0 0;
  font-size: 0.75rem;
  color: #6b7280;
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
  background: #fff;
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
