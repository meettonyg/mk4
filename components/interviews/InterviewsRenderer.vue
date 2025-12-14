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
        v-for="interview in displayInterviews"
        :key="interview.id"
        class="interview-card"
        :class="cardStyleClass"
      >
        <div class="interview-content">
          <h3 class="interview-title">{{ interview.title }}</h3>

          <div v-if="showPodcastName && interview.podcast_name" class="interview-podcast">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            {{ interview.podcast_name }}
          </div>

          <div v-if="showHostName && interview.host_name" class="interview-host">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {{ interview.host_name }}
          </div>

          <div class="interview-meta">
            <span v-if="showDate && interview.publish_date" class="interview-date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ formatDate(interview.publish_date) }}
            </span>
            <span v-if="showDuration && interview.duration" class="interview-duration">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ interview.duration }}
            </span>
          </div>

          <div v-if="showTopics && interview.topics && interview.topics.length > 0" class="interview-topics">
            <span v-for="topic in interview.topics.slice(0, 3)" :key="topic" class="topic-tag">
              {{ topic }}
            </span>
          </div>

          <a
            v-if="showListenButton && interview.episode_url"
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
      </div>
    </div>

    <!-- List Layout -->
    <div v-else-if="layout === 'list'" class="interviews-list">
      <div
        v-for="interview in displayInterviews"
        :key="interview.id"
        class="interview-list-item"
        :class="cardStyleClass"
      >
        <div class="interview-list-content">
          <div class="interview-list-header">
            <h3 class="interview-title">{{ interview.title }}</h3>
            <span v-if="showDuration && interview.duration" class="interview-duration-badge">
              {{ interview.duration }}
            </span>
          </div>

          <div class="interview-list-details">
            <span v-if="showPodcastName && interview.podcast_name" class="detail-item">
              {{ interview.podcast_name }}
            </span>
            <span v-if="showHostName && interview.host_name" class="detail-item">
              with {{ interview.host_name }}
            </span>
            <span v-if="showDate && interview.publish_date" class="detail-item">
              {{ formatDate(interview.publish_date) }}
            </span>
          </div>

          <div v-if="showTopics && interview.topics && interview.topics.length > 0" class="interview-topics">
            <span v-for="topic in interview.topics.slice(0, 4)" :key="topic" class="topic-tag">
              {{ topic }}
            </span>
          </div>

          <div class="interview-list-footer">
            <a
              v-if="showListenButton && interview.episode_url"
              :href="interview.episode_url"
              class="interview-cta"
              target="_blank"
              rel="noopener"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Listen Now
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Layout (Single) -->
    <div v-else-if="layout === 'featured' && displayInterviews[0]" class="interviews-featured">
      <div class="interview-featured-card" :class="cardStyleClass">
        <div class="interview-featured-content">
          <h3 class="interview-featured-title">{{ displayInterviews[0].title }}</h3>

          <div v-if="showPodcastName && displayInterviews[0].podcast_name" class="interview-featured-podcast">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            {{ displayInterviews[0].podcast_name }}
          </div>

          <div class="interview-featured-meta">
            <span v-if="showHostName && displayInterviews[0].host_name" class="meta-item">
              with {{ displayInterviews[0].host_name }}
            </span>
            <span v-if="showDate && displayInterviews[0].publish_date" class="meta-item">
              {{ formatDate(displayInterviews[0].publish_date) }}
            </span>
            <span v-if="showDuration && displayInterviews[0].duration" class="meta-item">
              {{ displayInterviews[0].duration }}
            </span>
          </div>

          <div v-if="showTopics && displayInterviews[0].topics && displayInterviews[0].topics.length > 0" class="interview-featured-topics">
            <span v-for="topic in displayInterviews[0].topics" :key="topic" class="topic-tag">
              {{ topic }}
            </span>
          </div>

          <a
            v-if="showListenButton && displayInterviews[0].episode_url"
            :href="displayInterviews[0].episode_url"
            class="interview-featured-cta"
            target="_blank"
            rel="noopener"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Listen to Episode
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
.interviews-grid.grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.interviews-grid.grid-3 { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }

/* Card Styles */
.interview-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--component-border-radius, 12px);
  transition: transform 0.2s, box-shadow 0.2s;
}

.interview-card:hover {
  transform: translateY(-4px);
}

.card-bordered {
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--card-bg, #fff);
}

.card-elevated {
  background: var(--card-bg, #fff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-elevated:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-flat {
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
}

.card-gradient {
  background: linear-gradient(135deg, var(--card-bg, #fff) 0%, rgba(139, 92, 246, 0.05) 100%);
}

/* Interview Content */
.interview-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.interview-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.125rem;
  color: inherit;
  line-height: 1.4;
}

.interview-podcast,
.interview-host {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--primary-color, #8b5cf6);
  margin-bottom: 0.5rem;
}

.interview-host {
  color: inherit;
  opacity: 0.7;
}

.interview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8rem;
  opacity: 0.6;
  margin: 0.75rem 0;
}

.interview-date,
.interview-duration {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.interview-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.topic-tag {
  padding: 0.25rem 0.75rem;
  background: rgba(139, 92, 246, 0.1);
  color: var(--primary-color, #8b5cf6);
  font-size: 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
}

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
  transition: background 0.2s;
  margin-top: auto;
}

.interview-cta:hover {
  background: var(--primary-color-dark, #7c3aed);
}

/* List Layout */
.interviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.interview-list-item {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: var(--component-border-radius, 12px);
}

.interview-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.interview-list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.interview-duration-badge {
  padding: 0.25rem 0.75rem;
  background: rgba(139, 92, 246, 0.1);
  color: var(--primary-color, #8b5cf6);
  font-size: 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}

.interview-list-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: inherit;
  opacity: 0.7;
  margin-bottom: 0.75rem;
}

.detail-item:not(:last-child)::after {
  content: "\2022";
  margin-left: 0.5rem;
}

.interview-list-footer {
  margin-top: auto;
  padding-top: 0.75rem;
}

/* Featured Layout */
.interviews-featured {
  max-width: 600px;
  margin: 0 auto;
}

.interview-featured-card {
  overflow: hidden;
  border-radius: var(--component-border-radius, 16px);
}

.interview-featured-content {
  padding: 2rem;
  text-align: center;
}

.interview-featured-title {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  line-height: 1.3;
}

.interview-featured-podcast {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: var(--primary-color, #8b5cf6);
  margin-bottom: 1rem;
}

.interview-featured-meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 1.5rem;
}

.meta-item:not(:last-child)::after {
  content: "\2022";
  margin-left: 1rem;
}

.interview-featured-topics {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.interview-featured-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: var(--primary-color, #8b5cf6);
  color: #fff;
  text-decoration: none;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.interview-featured-cta:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .interviews-grid {
    grid-template-columns: 1fr !important;
  }

  .interview-list-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .interview-list-details {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-item::after {
    display: none;
  }

  .interview-featured-content {
    padding: 1.5rem;
  }

  .interview-featured-title {
    font-size: 1.25rem;
  }

  .interview-featured-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .meta-item::after {
    display: none;
  }
}
</style>
