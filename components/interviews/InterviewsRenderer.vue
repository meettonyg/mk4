<template>
  <div class="component-root interviews-component">
    <h2 v-if="title" class="interviews-title" :style="{ textAlign: titleAlignment }">
      {{ title }}
    </h2>

    <!-- Loading State -->
    <div v-if="isLoading" class="interviews-loading">
      <div class="interviews-spinner"></div>
      <p>Loading interviews...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="displayInterviews.length === 0" class="interviews-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
      <p>No interviews available</p>
    </div>

    <!-- Grid Layout -->
    <div
      v-else-if="layout === 'grid'"
      class="interviews-grid"
      :class="`grid-${columns}`"
    >
      <div
        v-for="(interview, index) in displayInterviews"
        :key="interview.id"
        class="episode-card"
        :class="cardStyleClass"
      >
        <!-- Thumbnail -->
        <img
          v-if="interview.image || interview.image_url"
          :src="interview.image || interview.image_url"
          :alt="interview.episode_title || interview.title"
          class="episode-thumbnail"
          loading="lazy"
        />
        <div v-else class="episode-thumbnail-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          </svg>
        </div>

        <div class="episode-info">
          <!-- Date -->
          <div v-if="showDate && interview.publish_date" class="episode-date">
            {{ formatDate(interview.publish_date) }}
          </div>

          <!-- Title -->
          <h3 class="episode-title">{{ interview.episode_title || interview.title }}</h3>

          <!-- Expandable Description -->
          <div v-if="interview.description" class="episode-expand">
            <input
              :id="`ep-toggle-${index}`"
              type="checkbox"
              class="episode-toggle-input"
              v-model="expandedDescriptions[interview.id]"
            />
            <label :for="`ep-toggle-${index}`" class="episode-toggle-label">
              <span class="toggle-show">Show description</span>
              <span class="toggle-hide">Hide description</span>
              <svg class="toggle-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </label>
            <div class="episode-description-content">
              <p>{{ interview.description }}</p>
            </div>
          </div>

          <!-- Audio Player -->
          <div v-if="interview.audio_url" class="episode-player">
            <audio controls preload="none">
              <source :src="interview.audio_url" type="audio/mpeg" />
              Your browser does not support audio.
            </audio>
          </div>

          <!-- Fallback Listen Button (when no audio_url) -->
          <a
            v-else-if="showListenButton && interview.episode_url"
            :href="interview.episode_url"
            class="interview-cta"
            target="_blank"
            rel="noopener"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Listen Now
          </a>
        </div>

        <!-- Actions (Duration) -->
        <div class="episode-actions">
          <div v-if="showDuration && interview.duration" class="episode-duration">
            <svg class="duration-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ interview.duration }}
          </div>
        </div>
      </div>
    </div>

    <!-- List Layout -->
    <div v-else-if="layout === 'list'" class="interviews-list">
      <div
        v-for="(interview, index) in displayInterviews"
        :key="interview.id"
        class="episode-card episode-card-list"
        :class="cardStyleClass"
      >
        <!-- Thumbnail -->
        <img
          v-if="interview.image || interview.image_url"
          :src="interview.image || interview.image_url"
          :alt="interview.episode_title || interview.title"
          class="episode-thumbnail episode-thumbnail-small"
          loading="lazy"
        />
        <div v-else class="episode-thumbnail-placeholder episode-thumbnail-small">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          </svg>
        </div>

        <div class="episode-info">
          <!-- Date -->
          <div v-if="showDate && interview.publish_date" class="episode-date">
            {{ formatDate(interview.publish_date) }}
          </div>

          <!-- Title -->
          <h3 class="episode-title">{{ interview.episode_title || interview.title }}</h3>

          <!-- Podcast Name -->
          <div v-if="showPodcastName && interview.podcast_name" class="episode-podcast">
            {{ interview.podcast_name }}
          </div>

          <!-- Expandable Description -->
          <div v-if="interview.description" class="episode-expand">
            <input
              :id="`ep-toggle-list-${index}`"
              type="checkbox"
              class="episode-toggle-input"
              v-model="expandedDescriptions[interview.id]"
            />
            <label :for="`ep-toggle-list-${index}`" class="episode-toggle-label">
              <span class="toggle-show">Show description</span>
              <span class="toggle-hide">Hide description</span>
              <svg class="toggle-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </label>
            <div class="episode-description-content">
              <p>{{ interview.description }}</p>
            </div>
          </div>

          <!-- Audio Player -->
          <div v-if="interview.audio_url" class="episode-player">
            <audio controls preload="none">
              <source :src="interview.audio_url" type="audio/mpeg" />
              Your browser does not support audio.
            </audio>
          </div>

          <!-- Fallback Listen Button -->
          <a
            v-else-if="showListenButton && interview.episode_url"
            :href="interview.episode_url"
            class="interview-cta interview-cta-small"
            target="_blank"
            rel="noopener"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Listen Now
          </a>

          <!-- Duration -->
          <div v-if="showDuration && interview.duration" class="episode-duration episode-duration-inline">
            <svg class="duration-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ interview.duration }}
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Layout (Single) -->
    <div v-else-if="layout === 'featured' && displayInterviews[0]" class="interviews-featured">
      <div class="episode-card episode-card-featured" :class="cardStyleClass">
        <!-- Thumbnail -->
        <img
          v-if="displayInterviews[0].image || displayInterviews[0].image_url"
          :src="displayInterviews[0].image || displayInterviews[0].image_url"
          :alt="displayInterviews[0].episode_title || displayInterviews[0].title"
          class="episode-thumbnail episode-thumbnail-featured"
          loading="lazy"
        />
        <div v-else class="episode-thumbnail-placeholder episode-thumbnail-featured">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          </svg>
        </div>

        <div class="episode-info episode-info-featured">
          <!-- Date -->
          <div v-if="showDate && displayInterviews[0].publish_date" class="episode-date">
            {{ formatDate(displayInterviews[0].publish_date) }}
          </div>

          <!-- Title -->
          <h3 class="episode-title episode-title-featured">
            {{ displayInterviews[0].episode_title || displayInterviews[0].title }}
          </h3>

          <!-- Podcast Name -->
          <div v-if="showPodcastName && displayInterviews[0].podcast_name" class="episode-podcast episode-podcast-featured">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            {{ displayInterviews[0].podcast_name }}
          </div>

          <!-- Expandable Description -->
          <div v-if="displayInterviews[0].description" class="episode-expand">
            <input
              id="ep-toggle-featured"
              type="checkbox"
              class="episode-toggle-input"
              v-model="expandedDescriptions[displayInterviews[0].id]"
            />
            <label for="ep-toggle-featured" class="episode-toggle-label">
              <span class="toggle-show">Show description</span>
              <span class="toggle-hide">Hide description</span>
              <svg class="toggle-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </label>
            <div class="episode-description-content">
              <p>{{ displayInterviews[0].description }}</p>
            </div>
          </div>

          <!-- Audio Player -->
          <div v-if="displayInterviews[0].audio_url" class="episode-player">
            <audio controls preload="none">
              <source :src="displayInterviews[0].audio_url" type="audio/mpeg" />
              Your browser does not support audio.
            </audio>
          </div>

          <!-- Fallback Listen Button -->
          <a
            v-else-if="showListenButton && displayInterviews[0].episode_url"
            :href="displayInterviews[0].episode_url"
            class="interview-cta interview-cta-featured"
            target="_blank"
            rel="noopener"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Listen to Episode
          </a>
        </div>

        <!-- Duration -->
        <div class="episode-actions episode-actions-featured">
          <div v-if="showDuration && displayInterviews[0].duration" class="episode-duration">
            <svg class="duration-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ displayInterviews[0].duration }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';

const props = defineProps({
  componentId: { type: String, required: true },
  data: { type: Object, default: () => ({}) },
  props: { type: Object, default: () => ({}) },
  settings: { type: Object, default: () => ({}) },
  isEditing: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false }
});

const store = useMediaKitStore();
const isLoading = ref(false);
const fetchedInterviews = ref([]);
const expandedDescriptions = reactive({});

// Component options
const title = computed(() => props.data?.customTitle || props.props?.customTitle || 'Featured Interviews');
const titleAlignment = computed(() => props.data?.titleAlignment || props.props?.titleAlignment || 'center');
const layout = computed(() => props.data?.layout || props.props?.layout || 'grid');
const columns = computed(() => props.data?.columns || props.props?.columns || '2');
const maxInterviews = computed(() => props.data?.maxInterviews || props.props?.maxInterviews || 6);
const cardStyle = computed(() => props.data?.cardStyle || props.props?.cardStyle || 'elevated');
const showPodcastName = computed(() => props.data?.showPodcastName !== false && props.props?.showPodcastName !== false);
const showHostName = computed(() => props.data?.showHostName !== false && props.props?.showHostName !== false);
const showDate = computed(() => props.data?.showDate !== false && props.props?.showDate !== false);
const showDuration = computed(() => props.data?.showDuration !== false && props.props?.showDuration !== false);
const showTopics = computed(() => props.data?.showTopics !== false && props.props?.showTopics !== false);
const showListenButton = computed(() => props.data?.showListenButton !== false && props.props?.showListenButton !== false);

// Selected interview IDs (from component data or profile association)
const selectedInterviewIds = computed(() => {
  return props.data?.selectedInterviewIds || props.props?.selectedInterviewIds || props.data?.interviews || [];
});

// Card style class
const cardStyleClass = computed(() => `card-${cardStyle.value}`);

// Display interviews (limited)
const displayInterviews = computed(() => {
  let interviews = [];

  // Use embedded interviews data if available
  if (Array.isArray(props.data?.interviewsData) && props.data.interviewsData.length > 0) {
    interviews = props.data.interviewsData;
  } else if (fetchedInterviews.value.length > 0) {
    interviews = fetchedInterviews.value;
  }

  // Limit
  return interviews.slice(0, maxInterviews.value);
});

// Fetch interviews from API
const fetchInterviews = async () => {
  if (!selectedInterviewIds.value.length && !props.data?.profileId) return;

  isLoading.value = true;
  try {
    const apiUrl = window.gmkbData?.apiUrl || '/wp-json/';
    let url;

    if (selectedInterviewIds.value.length > 0) {
      // Fetch specific interviews
      url = `${apiUrl}gmkb/v2/interviews?include=${selectedInterviewIds.value.join(',')}`;
    } else if (props.data?.profileId) {
      // Fetch profile's featured interviews
      url = `${apiUrl}gmkb/v2/profiles/${props.data.profileId}/interviews`;
    }

    const response = await fetch(url, {
      headers: { 'X-WP-Nonce': window.gmkbData?.nonce || '' }
    });

    if (response.ok) {
      const data = await response.json();
      fetchedInterviews.value = Array.isArray(data) ? data : (data.interviews || []);
    }
  } catch (error) {
    console.error('Failed to fetch interviews:', error);
  } finally {
    isLoading.value = false;
  }
};

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Lifecycle
onMounted(() => {
  if (!props.data?.interviewsData?.length) {
    fetchInterviews();
  }

  document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
    detail: { type: 'interviews', id: props.componentId, hasData: displayInterviews.value.length > 0 }
  }));
});

// Re-fetch when selection changes
watch(selectedInterviewIds, () => {
  if (!props.data?.interviewsData?.length) {
    fetchInterviews();
  }
}, { deep: true });
</script>

<style scoped>
.interviews-component {
  width: 100%;
}

.interviews-title {
  margin: 0 0 1.5rem 0;
  color: inherit;
}

/* Loading */
.interviews-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: inherit;
  opacity: 0.6;
}

.interviews-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.interviews-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: inherit;
  opacity: 0.5;
}

.interviews-empty svg {
  margin-bottom: 1rem;
}

/* Grid Layout */
.interviews-grid {
  display: grid;
  gap: 1.5rem;
}

.interviews-grid.grid-1 { grid-template-columns: 1fr; }
.interviews-grid.grid-2 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
.interviews-grid.grid-3 { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }

/* Episode Card - New Design */
.episode-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--component-border-radius, 12px);
  transition: transform 0.2s, box-shadow 0.2s;
}

.episode-card:hover {
  transform: translateY(-2px);
}

/* Card Styles */
.card-bordered {
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--card-bg, #fff);
}

.card-elevated {
  background: var(--card-bg, #fff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-elevated:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-flat {
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
}

.card-gradient {
  background: linear-gradient(135deg, var(--card-bg, #fff) 0%, rgba(139, 92, 246, 0.05) 100%);
}

/* Thumbnail */
.episode-thumbnail {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.episode-thumbnail-placeholder {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 8px 8px 0 0;
  color: #9ca3af;
}

.episode-thumbnail-small {
  width: 80px;
  height: 80px;
  min-width: 80px;
  border-radius: 8px;
}

.episode-thumbnail-featured {
  width: 100%;
  height: 220px;
  border-radius: 12px 12px 0 0;
}

/* Episode Info */
.episode-info {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.episode-info-featured {
  padding: 1.5rem;
  text-align: center;
}

/* Date */
.episode-date {
  font-size: 0.8rem;
  color: var(--primary-color, #3b82f6);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

/* Title */
.episode-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: inherit;
  line-height: 1.4;
}

.episode-title-featured {
  font-size: 1.25rem;
}

/* Podcast Name */
.episode-podcast {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.episode-podcast-featured {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--primary-color, #8b5cf6);
  font-size: 1rem;
  margin-bottom: 1rem;
}

/* Expandable Description */
.episode-expand {
  margin-bottom: 1rem;
}

.episode-toggle-input {
  display: none;
}

.episode-toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  font-size: 0.85rem;
  color: #6b7280;
  transition: color 0.2s;
}

.episode-toggle-label:hover {
  color: var(--primary-color, #3b82f6);
}

.toggle-hide {
  display: none;
}

.toggle-arrow {
  transition: transform 0.2s;
}

.episode-toggle-input:checked ~ .episode-toggle-label .toggle-show {
  display: none;
}

.episode-toggle-input:checked ~ .episode-toggle-label .toggle-hide {
  display: inline;
}

.episode-toggle-input:checked ~ .episode-toggle-label .toggle-arrow {
  transform: rotate(180deg);
}

.episode-description-content {
  display: none;
  padding-top: 0.75rem;
}

.episode-toggle-input:checked ~ .episode-description-content {
  display: block;
}

.episode-description-content p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #4b5563;
}

/* Audio Player */
.episode-player {
  margin-top: auto;
  padding-top: 0.75rem;
}

.episode-player audio {
  width: 100%;
  height: 40px;
  border-radius: 20px;
}

/* Duration */
.episode-actions {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.episode-actions-featured {
  justify-content: center;
  padding: 1rem 1.5rem;
}

.episode-duration {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.episode-duration-inline {
  margin-top: 0.75rem;
}

.duration-icon {
  opacity: 0.7;
}

/* Listen Button (Fallback) */
.interview-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color, #8b5cf6);
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s, transform 0.2s;
  margin-top: auto;
}

.interview-cta:hover {
  background: var(--primary-color-dark, #7c3aed);
  transform: translateY(-1px);
}

.interview-cta-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.interview-cta-featured {
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-size: 1rem;
}

/* List Layout */
.interviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.episode-card-list {
  flex-direction: row;
  align-items: flex-start;
  padding: 1rem;
}

.episode-card-list .episode-info {
  padding: 0 0 0 1rem;
}

/* Featured Layout */
.interviews-featured {
  max-width: 600px;
  margin: 0 auto;
}

.episode-card-featured {
  border-radius: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .interviews-grid {
    grid-template-columns: 1fr !important;
  }

  .episode-card-list {
    flex-direction: column;
  }

  .episode-thumbnail-small {
    width: 100%;
    height: 160px;
    border-radius: 8px;
  }

  .episode-card-list .episode-info {
    padding: 1rem 0 0 0;
  }

  .episode-title-featured {
    font-size: 1.1rem;
  }
}
</style>
