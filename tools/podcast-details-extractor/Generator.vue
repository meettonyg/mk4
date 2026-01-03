<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Podcast Details Extractor"
    subtitle="Extract podcast information and contact details from Apple or Google Podcasts URLs"
    intro-text="Enter a podcast URL to extract the show title, description, owner email, category, and more. Use this information to craft personalized pitches and research potential podcast opportunities."
    generator-type="podcast-details-extractor"
    :has-results="hasResults"
    :is-loading="isExtracting"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- URL Input Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Podcast URL</h3>

        <div class="generator__field">
          <label class="generator__field-label">Apple Podcasts or Google Podcasts URL *</label>
          <input
            v-model="podcastUrl"
            type="url"
            class="generator__field-input"
            placeholder="e.g., https://podcasts.apple.com/us/podcast/the-tim-ferriss-show/id863897795"
            @keyup.enter="onExtract"
          />
          <p class="generator__field-helper">
            Paste a podcast URL from Apple Podcasts or Google Podcasts
          </p>
        </div>
      </div>

      <!-- Extract Button -->
      <div class="generator__actions">
        <button
          type="button"
          class="generator__button generator__button--call-to-action"
          :class="{ 'generator__button--loading': isExtracting }"
          :disabled="!canExtract || isExtracting"
          @click="onExtract"
        >
          <svg v-if="!isExtracting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          {{ isExtracting ? 'Extracting...' : 'Extract Podcast Details' }}
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="generator__error">
        <p>{{ error }}</p>
        <button type="button" class="generator__button generator__button--outline" @click="onExtract">
          Try Again
        </button>
      </div>
    </template>

    <!-- Right Panel: Guidance -->
    <template #right>
      <GuidancePanel
        title="How to Use This Tool"
        subtitle="Extract valuable podcast information for your outreach campaigns."
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Supported URL Formats:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="podcast-extractor__results">
        <div class="podcast-extractor__results-header">
          <h3>Podcast Details</h3>
          <p>Information extracted from the podcast RSS feed</p>
        </div>

        <!-- Podcast Header -->
        <div class="podcast-extractor__header">
          <div v-if="podcastInfo.image" class="podcast-extractor__image">
            <img :src="podcastInfo.image" :alt="podcastInfo.title + ' cover'" />
          </div>
          <div class="podcast-extractor__title-section">
            <h2 class="podcast-extractor__title">{{ podcastInfo.title }}</h2>
            <p v-if="podcastInfo.itunes_category" class="podcast-extractor__category">
              Category: {{ podcastInfo.itunes_category }}
            </p>
          </div>
        </div>

        <!-- Description -->
        <div v-if="podcastInfo.description" class="podcast-extractor__section">
          <h4>Description</h4>
          <p>{{ podcastInfo.description }}</p>
        </div>

        <!-- Key Details -->
        <div class="podcast-extractor__details">
          <dl>
            <template v-if="podcastInfo.lastBuildDate">
              <dt>Last Episode</dt>
              <dd>{{ formatDate(podcastInfo.lastBuildDate) }}</dd>
            </template>
            <template v-if="podcastInfo.language">
              <dt>Language</dt>
              <dd>{{ podcastInfo.language }}</dd>
            </template>
            <template v-if="podcastInfo.itunes_explicit">
              <dt>Explicit</dt>
              <dd>{{ podcastInfo.itunes_explicit }}</dd>
            </template>
            <template v-if="podcastInfo.link">
              <dt>Website</dt>
              <dd><a :href="podcastInfo.link" target="_blank" rel="noopener">{{ podcastInfo.link }}</a></dd>
            </template>
            <template v-if="podcastInfo.itunes_owner_name">
              <dt>Owner</dt>
              <dd>{{ podcastInfo.itunes_owner_name }}</dd>
            </template>
            <template v-if="podcastInfo.itunes_owner_email">
              <dt>Email</dt>
              <dd>
                <a :href="'mailto:' + podcastInfo.itunes_owner_email">{{ podcastInfo.itunes_owner_email }}</a>
                <button
                  type="button"
                  class="podcast-extractor__copy-btn"
                  @click="copyEmail"
                  :title="emailCopied ? 'Copied!' : 'Copy email'"
                >
                  <svg v-if="!emailCopied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
              </dd>
            </template>
            <template v-if="podcastInfo.itunes_author">
              <dt>Author</dt>
              <dd>{{ podcastInfo.itunes_author }}</dd>
            </template>
          </dl>
        </div>

        <!-- Actions -->
        <div class="podcast-extractor__actions">
          <button
            type="button"
            class="generator__button generator__button--outline"
            @click="copyAllDetails"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy All Details
          </button>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
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
        {{ isExtracting ? 'Extracting...' : 'Extract Details' }}
      </button>
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasResults" class="podcast-extractor__compact-results">
        <div class="podcast-extractor__compact-header">
          <img v-if="podcastInfo.image" :src="podcastInfo.image" :alt="podcastInfo.title" class="podcast-extractor__compact-image" />
          <div>
            <strong>{{ podcastInfo.title }}</strong>
            <span v-if="podcastInfo.itunes_category">{{ podcastInfo.itunes_category }}</span>
          </div>
        </div>
        <div v-if="podcastInfo.itunes_owner_email" class="podcast-extractor__compact-email">
          <strong>Email:</strong> {{ podcastInfo.itunes_owner_email }}
        </div>
        <div v-if="podcastInfo.itunes_owner_name" class="podcast-extractor__compact-owner">
          <strong>Owner:</strong> {{ podcastInfo.itunes_owner_name }}
        </div>
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Embedded Mode: Landing page form -->
  <div v-else class="gmkb-embedded-form">
    <div class="gmkb-embedded-fields">
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.url || 'Podcast URL' }} *</label>
        <input
          v-model="podcastUrl"
          type="url"
          class="gmkb-embedded-input"
          :placeholder="currentIntent?.formPlaceholders?.url || 'e.g., https://podcasts.apple.com/us/podcast/...'"
        />
      </div>
    </div>
    <div v-if="error" class="gmkb-embedded-error">{{ error }}</div>
  </div>
</template>

<script setup>
import { computed, watch, defineExpose } from 'vue';
import { usePodcastExtractor } from './usePodcastExtractor.js';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel } from '../_shared';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'standalone',
    validator: (v) => ['standalone', 'integrated', 'embedded'].includes(v)
  },
  componentId: {
    type: String,
    default: null
  },
  intent: {
    type: Object,
    default: null
  },
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['applied', 'extracted', 'preview-update', 'update:can-generate', 'generated']);

// Use shared composable
const {
  podcastUrl,
  podcastInfo,
  isExtracting,
  error,
  emailCopied,
  canExtract,
  hasResults,
  formatDate,
  handleExtract,
  copyEmail,
  copyAllDetails
} = usePodcastExtractor();

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Find a Podcast',
    description: 'Browse Apple Podcasts or Google Podcasts and find a show you\'d like to pitch. Copy the URL from your browser\'s address bar.'
  },
  {
    title: 'Extract the Details',
    description: 'Paste the URL above and click "Extract Podcast Details". We\'ll fetch the RSS feed and pull out all the important information.'
  },
  {
    title: 'Use for Outreach',
    description: 'Use the owner email and show details to craft a personalized pitch. Reference specific episodes or the show\'s focus to stand out.'
  }
];

/**
 * Example URLs
 */
const examples = [
  {
    title: 'Apple Podcasts:',
    description: 'https://podcasts.apple.com/us/podcast/the-tim-ferriss-show/id863897795'
  },
  {
    title: 'Google Podcasts:',
    description: 'https://podcasts.google.com/feed/aHR0cHM6Ly...'
  }
];

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
    // Emit generated event for EmbeddedToolWrapper compatibility
    emit('generated', {
      url: podcastUrl.value,
      info: result
    });
    // Emit preview update with podcast info for display
    emit('preview-update', {
      previewHtml: result.title ? `<strong>${result.title}</strong>` + (result.itunes_owner_email ? `<br>Email: ${result.itunes_owner_email}` : '') : ''
    });
  }
};

/**
 * Method exposed for EmbeddedToolWrapper to call
 * Alias for onExtract to match expected interface
 */
const handleGenerate = onExtract;

const currentIntent = computed(() => props.intent || null);

/**
 * Watch canExtract and emit update:can-generate for EmbeddedToolWrapper
 */
watch(canExtract, (newValue) => {
  emit('update:can-generate', newValue);
}, { immediate: true });

/**
 * Expose handleGenerate for parent components to call via ref
 */
defineExpose({
  handleGenerate,
  onExtract
});
</script>

<style scoped>
/* Standalone Mode Styles */
.generator__section {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.generator__section-title {
  font-size: var(--mkcg-font-size-lg, 18px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
}

.generator__actions {
  margin-top: var(--mkcg-space-lg, 30px);
  text-align: center;
}

.generator__error {
  margin-top: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-md, 20px);
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--mkcg-radius, 8px);
  text-align: center;
}

.generator__error p {
  color: #991b1b;
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
}

/* Podcast Results */
.podcast-extractor__results {
  padding: var(--mkcg-space-md, 20px);
}

.podcast-extractor__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.podcast-extractor__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.podcast-extractor__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.podcast-extractor__header {
  display: flex;
  gap: var(--mkcg-space-lg, 30px);
  align-items: flex-start;
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.podcast-extractor__image {
  flex-shrink: 0;
  width: 150px;
  height: 150px;
  border-radius: var(--mkcg-radius, 8px);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.podcast-extractor__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.podcast-extractor__title-section {
  flex: 1;
}

.podcast-extractor__title {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-xl, 24px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.podcast-extractor__category {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-md, 16px);
}

.podcast-extractor__section {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.podcast-extractor__section h4 {
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
  font-size: var(--mkcg-font-size-md, 16px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
}

.podcast-extractor__section p {
  margin: 0;
  line-height: var(--mkcg-line-height-relaxed, 1.6);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.podcast-extractor__details {
  background: var(--mkcg-bg-secondary, #f8fafc);
  border-radius: var(--mkcg-radius, 8px);
  padding: var(--mkcg-space-md, 20px);
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.podcast-extractor__details dl {
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--mkcg-space-sm, 12px) var(--mkcg-space-md, 20px);
}

.podcast-extractor__details dt {
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
}

.podcast-extractor__details dd {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  word-break: break-word;
}

.podcast-extractor__details a {
  color: var(--mkcg-primary, #1a9bdc);
  text-decoration: none;
}

.podcast-extractor__details a:hover {
  text-decoration: underline;
}

.podcast-extractor__copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: var(--mkcg-space-xs, 8px);
  padding: 4px;
  background: transparent;
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: 4px;
  cursor: pointer;
  color: var(--mkcg-text-secondary, #5a6d7e);
  transition: var(--mkcg-transition-fast, 0.15s ease);
}

.podcast-extractor__copy-btn:hover {
  border-color: var(--mkcg-primary, #1a9bdc);
  color: var(--mkcg-primary, #1a9bdc);
}

.podcast-extractor__actions {
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles */
.podcast-extractor__compact-results {
  padding: var(--mkcg-space-sm, 12px);
}

.podcast-extractor__compact-header {
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
  align-items: center;
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.podcast-extractor__compact-image {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}

.podcast-extractor__compact-header strong {
  display: block;
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.podcast-extractor__compact-header span {
  font-size: var(--mkcg-font-size-xs, 12px);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.podcast-extractor__compact-email,
.podcast-extractor__compact-owner {
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
  margin-bottom: var(--mkcg-space-xs, 8px);
}

/* Integrated mode button */
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
  background: var(--mkcg-primary, #1a9bdc);
  color: white;
}

.gmkb-ai-button--primary:hover:not(:disabled) {
  background: var(--mkcg-primary-dark, #1687c1);
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

/* Embedded Mode Styles */
.gmkb-embedded-form { width: 100%; }
.gmkb-embedded-fields { display: flex; flex-direction: column; gap: 20px; }
.gmkb-embedded-field { display: flex; flex-direction: column; }
.gmkb-embedded-label { display: block; font-weight: 600; font-size: 13px; margin-bottom: 8px; color: var(--mkcg-text-primary, #0f172a); }
.gmkb-embedded-input { width: 100%; padding: 14px; border: 1px solid var(--mkcg-border, #e2e8f0); border-radius: 8px; background: var(--mkcg-bg-secondary, #f9fafb); box-sizing: border-box; font-size: 15px; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; }
.gmkb-embedded-input:focus { outline: none; border-color: var(--mkcg-primary, #3b82f6); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.gmkb-embedded-input::placeholder { color: var(--mkcg-text-light, #94a3b8); }
.gmkb-embedded-error { margin-top: 16px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 14px; }
</style>
