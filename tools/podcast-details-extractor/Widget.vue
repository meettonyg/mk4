<template>
  <AiWidgetFrame
    title="Podcast Details Extractor"
    description="Extract podcast information and contact details from a URL."
    :mode="mode"
    :is-loading="isExtracting"
    :has-results="hasResults"
    :error="error"
    target-component="PodcastDetails"
    :show-cta="!hasResults"
    @copy="copyAllDetails"
    @retry="onExtract"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- URL Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Podcast URL</label>
        <input
          v-model="podcastUrl"
          type="url"
          class="gmkb-ai-input"
          placeholder="e.g., https://podcasts.apple.com/us/podcast/..."
          @keyup.enter="onExtract"
        />
        <span class="gmkb-ai-hint">
          Apple Podcasts or Google Podcasts URL
        </span>
      </div>

      <!-- Extract Button -->
      <button
        type="button"
        class="gmkb-ai-button gmkb-ai-button--primary gmkb-ai-button--full"
        :class="{ 'gmkb-ai-button--loading': isExtracting }"
        :disabled="!canExtract || isExtracting"
        @click="onExtract"
      >
        <svg v-if="!isExtracting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        {{ isExtracting ? 'Extracting...' : 'Extract Details' }}
      </button>
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasResults" class="podcast-widget__results">
        <!-- Header with image -->
        <div class="podcast-widget__header">
          <img
            v-if="podcastInfo.image"
            :src="podcastInfo.image"
            :alt="podcastInfo.title"
            class="podcast-widget__image"
          />
          <div class="podcast-widget__info">
            <strong class="podcast-widget__title">{{ podcastInfo.title }}</strong>
            <span v-if="podcastInfo.itunes_category" class="podcast-widget__category">
              {{ podcastInfo.itunes_category }}
            </span>
          </div>
        </div>

        <!-- Key details -->
        <div class="podcast-widget__details">
          <div v-if="podcastInfo.itunes_owner_email" class="podcast-widget__detail">
            <span class="podcast-widget__label">Email:</span>
            <a :href="'mailto:' + podcastInfo.itunes_owner_email" class="podcast-widget__value podcast-widget__value--link">
              {{ podcastInfo.itunes_owner_email }}
            </a>
            <button
              type="button"
              class="podcast-widget__copy-btn"
              @click="copyEmail"
              :title="emailCopied ? 'Copied!' : 'Copy email'"
            >
              <svg v-if="!emailCopied" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          </div>

          <div v-if="podcastInfo.itunes_owner_name" class="podcast-widget__detail">
            <span class="podcast-widget__label">Owner:</span>
            <span class="podcast-widget__value">{{ podcastInfo.itunes_owner_name }}</span>
          </div>

          <div v-if="podcastInfo.lastBuildDate" class="podcast-widget__detail">
            <span class="podcast-widget__label">Last Episode:</span>
            <span class="podcast-widget__value">{{ formatDate(podcastInfo.lastBuildDate, { year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
          </div>

          <div v-if="podcastInfo.link" class="podcast-widget__detail">
            <span class="podcast-widget__label">Website:</span>
            <a :href="podcastInfo.link" target="_blank" rel="noopener" class="podcast-widget__value podcast-widget__value--link">
              Visit Site
            </a>
          </div>
        </div>

        <!-- Description (truncated) -->
        <div v-if="podcastInfo.description" class="podcast-widget__description">
          {{ truncatedDescription }}
        </div>
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
/**
 * Podcast Details Extractor - Widget Component
 *
 * Compact widget for extracting podcast information from URLs.
 * Part of the /tools/ self-contained architecture.
 *
 * @package GMKB
 * @subpackage Tools
 * @version 2.0.0
 */

import { usePodcastExtractor } from './usePodcastExtractor.js';

// Shared AI Components
import AiWidgetFrame from '@ai/AiWidgetFrame.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'standalone'
  },
  componentId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['applied', 'extracted']);

// Use shared composable
const {
  podcastUrl,
  podcastInfo,
  isExtracting,
  error,
  emailCopied,
  canExtract,
  hasResults,
  truncatedDescription,
  formatDate,
  handleExtract,
  copyEmail,
  copyAllDetails
} = usePodcastExtractor();

/**
 * Handle extract and emit event
 */
const onExtract = async () => {
  const result = await handleExtract();
  if (result) {
    emit('extracted', {
      url: podcastUrl.value,
      info: result
    });
  }
};
</script>

<style scoped>
/* Widget Results */
.podcast-widget__results {
  padding: 12px;
}

.podcast-widget__header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gmkb-ai-border, #e5e7eb);
}

.podcast-widget__image {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.podcast-widget__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.podcast-widget__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--gmkb-ai-text-primary, #1f2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.podcast-widget__category {
  font-size: 12px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

.podcast-widget__details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.podcast-widget__detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.podcast-widget__label {
  color: var(--gmkb-ai-text-secondary, #64748b);
  flex-shrink: 0;
}

.podcast-widget__value {
  color: var(--gmkb-ai-text-primary, #1f2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.podcast-widget__value--link {
  color: var(--gmkb-ai-primary, #6366f1);
  text-decoration: none;
}

.podcast-widget__value--link:hover {
  text-decoration: underline;
}

.podcast-widget__copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: transparent;
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: 4px;
  cursor: pointer;
  color: var(--gmkb-ai-text-secondary, #64748b);
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.podcast-widget__copy-btn:hover {
  border-color: var(--gmkb-ai-primary, #6366f1);
  color: var(--gmkb-ai-primary, #6366f1);
}

.podcast-widget__description {
  font-size: 12px;
  line-height: 1.5;
  color: var(--gmkb-ai-text-secondary, #64748b);
  padding: 10px;
  background: var(--gmkb-ai-bg-secondary, #f9fafb);
  border-radius: 6px;
}

/* Button styles */
.gmkb-ai-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.gmkb-ai-button--primary {
  background: var(--gmkb-ai-primary, #6366f1);
  color: white;
}

.gmkb-ai-button--primary:hover:not(:disabled) {
  background: var(--gmkb-ai-primary-dark, #4f46e5);
}

.gmkb-ai-button--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gmkb-ai-button--full {
  width: 100%;
}

.gmkb-ai-button--loading {
  opacity: 0.7;
}
</style>
