<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Podcast Show Notes Generator"
    subtitle="Create comprehensive show notes for podcast episodes using AI"
    intro-text="Generate professional podcast show notes that include episode summaries, key takeaways, timestamps, and resources. Make your episodes more discoverable and provide value to your listeners with well-structured show notes."
    generator-type="podcast_notes"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Episode Details Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Episode Details</h3>

        <div class="generator__field">
          <label class="generator__field-label">Episode Title *</label>
          <input
            v-model="episodeTitle"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Ep 42: How to Scale Your Business"
          />
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Guest Name (if applicable)</label>
          <input
            v-model="guestName"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Jane Smith"
          />
          <p class="generator__field-helper">
            Leave blank for solo episodes.
          </p>
        </div>
      </div>

      <!-- Episode Content Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Episode Content</h3>

        <div class="generator__field">
          <label class="generator__field-label">Topics Covered *</label>
          <textarea
            v-model="topicsCovered"
            class="generator__field-input generator__field-textarea"
            placeholder="What topics were discussed in this episode?"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            List the main topics and themes discussed.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Key Takeaways</label>
          <textarea
            v-model="keyTakeaways"
            class="generator__field-input generator__field-textarea"
            placeholder="What are the main insights or action items?"
            rows="2"
          ></textarea>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Resources Mentioned</label>
          <textarea
            v-model="resources"
            class="generator__field-input generator__field-textarea"
            placeholder="Books, tools, links mentioned in the episode"
            rows="2"
          ></textarea>
        </div>
      </div>

      <!-- Show Notes Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Show Notes Settings</h3>

        <div class="generator__field">
          <label class="generator__field-label">Tone</label>
          <select v-model="tone" class="generator__field-input">
            <option value="professional">Professional</option>
            <option value="conversational">Conversational</option>
            <option value="casual">Casual</option>
            <option value="enthusiastic">Enthusiastic</option>
          </select>
        </div>
      </div>

      <!-- Generate Button -->
      <div class="generator__actions">
        <button
          type="button"
          class="generator__button generator__button--call-to-action"
          :class="{ 'generator__button--loading': isGenerating }"
          :disabled="!canGenerate || isGenerating"
          @click="handleGenerate"
        >
          <svg v-if="!isGenerating" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {{ isGenerating ? 'Writing show notes...' : 'Generate Show Notes with AI' }}
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="generator__error">
        <p>{{ error }}</p>
        <button type="button" class="generator__button generator__button--outline" @click="handleGenerate">
          Try Again
        </button>
      </div>
    </template>

    <!-- Right Panel: Guidance -->
    <template #right>
      <GuidancePanel
        title="Creating Effective Show Notes"
        subtitle="Professional show notes help your episodes get discovered and provide value to your audience long after the episode airs."
        :formula="podcastNotesFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Show Notes Formats:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="podcast-notes-generator__results">
        <div class="podcast-notes-generator__results-header">
          <h3>Your Generated Show Notes</h3>
          <p>Professional show notes ready to publish</p>
        </div>

        <!-- Show Notes Content -->
        <div class="podcast-notes-generator__content">
          <pre>{{ generatedContent }}</pre>
        </div>

        <!-- Actions -->
        <div class="podcast-notes-generator__actions">
          <button
            type="button"
            class="generator__button generator__button--outline"
            @click="handleCopy"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy to Clipboard
          </button>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
    title="Podcast Show Notes Generator"
    description="Create comprehensive show notes for podcast episodes."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="PodcastNotes"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Episode Title Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Episode Title</label>
        <input
          v-model="episodeTitle"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Ep 42: How to Scale Your Business"
        />
      </div>

      <!-- Guest Name Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Guest Name (if applicable)</label>
        <input
          v-model="guestName"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Jane Smith"
        />
      </div>

      <!-- Topics Covered Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Topics Covered</label>
        <textarea
          v-model="topicsCovered"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What topics were discussed in this episode?"
          rows="3"
        ></textarea>
      </div>

      <!-- Key Takeaways Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Key Takeaways</label>
        <textarea
          v-model="keyTakeaways"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What are the main insights or action items?"
          rows="2"
        ></textarea>
      </div>

      <!-- Resources Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Resources Mentioned</label>
        <textarea
          v-model="resources"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Books, tools, links mentioned in the episode"
          rows="2"
        ></textarea>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <AiResultsDisplay
        v-if="generatedContent"
        :content="generatedContent"
        format="text"
        show-count
      />
    </template>
  </AiWidgetFrame>

  <!-- Embedded Mode: Landing page form (simplified, used with EmbeddedToolWrapper) -->
  <div v-else class="gmkb-embedded-form">
    <!-- Simplified 2-field form for landing page -->
    <div class="gmkb-embedded-fields">
      <div
        v-for="field in embeddedFields"
        :key="field.key"
        class="gmkb-embedded-field"
      >
        <label class="gmkb-embedded-label">{{ field.label }}</label>
        <input
          v-if="field.type === 'input'"
          v-model="field.key === 'episodeTitle' ? episodeTitle : topicsCovered"
          type="text"
          class="gmkb-embedded-input"
          :placeholder="field.placeholder"
          @input="handleEmbeddedFieldChange"
        />
        <textarea
          v-else
          v-model="field.key === 'episodeTitle' ? episodeTitle : topicsCovered"
          class="gmkb-embedded-input gmkb-embedded-textarea"
          :placeholder="field.placeholder"
          rows="3"
          @input="handleEmbeddedFieldChange"
        ></textarea>
      </div>
    </div>

    <!-- Results display for embedded mode -->
    <div v-if="hasContent" class="gmkb-embedded-result">
      <div class="gmkb-embedded-result__content">
        {{ generatedContent }}
      </div>
    </div>

    <!-- Error display -->
    <div v-if="error" class="gmkb-embedded-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useAIGenerator } from '../../src/composables/useAIGenerator';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
// This provides reactive updates when profile is selected from dropdown
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

const props = defineProps({
  /**
   * Mode: 'standalone', 'integrated', or 'embedded'
   * - standalone: Full two-panel layout with guidance
   * - integrated: Compact widget for embedding in other components
   * - embedded: Landing page embed with simplified form
   */
  mode: {
    type: String,
    default: 'standalone',
    validator: (v) => ['standalone', 'integrated', 'embedded'].includes(v)
  },

  /**
   * Component ID to apply results to (integrated mode)
   */
  componentId: {
    type: String,
    default: null
  },

  /**
   * Intent object for embedded mode
   * Contains: { id, label, contextHeading, contextDescription, formPlaceholders, formLabels }
   */
  intent: {
    type: Object,
    default: null
  },

  /**
   * Profile data for pre-population (embedded mode)
   * Passed from EmbeddedToolWrapper via scoped slot
   */
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'change', 'preview-update', 'update:can-generate']);

// Use composable
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  generatedContent,
  hasContent,
  generate,
  copyToClipboard
} = useAIGenerator('podcast_notes');

// Local state
const episodeTitle = ref('');
const guestName = ref('');
const topicsCovered = ref('');
const keyTakeaways = ref('');
const resources = ref('');
const tone = ref('professional');

/**
 * Podcast notes formula for guidance panel
 */
const podcastNotesFormula = '<span class="generator__highlight">[EPISODE SUMMARY]</span> + <span class="generator__highlight">[KEY TAKEAWAYS]</span> + <span class="generator__highlight">[TIMESTAMPS]</span> + <span class="generator__highlight">[RESOURCES]</span> = <span class="generator__highlight">Complete Show Notes</span>';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Show Notes Matter',
    description: 'Show notes are essential for podcast discovery and SEO. They help potential listeners find your episodes through search engines, provide context for sharing on social media, and give your audience a reference guide for the resources and insights discussed in each episode.'
  },
  {
    title: 'What Listeners Want',
    description: 'Great show notes should include a compelling episode summary, clear key takeaways or action items, timestamps for easy navigation to specific topics, and links to all resources, tools, or people mentioned. This makes your content more valuable and shareable.'
  },
  {
    title: 'Optimizing for Podcast Directories',
    description: 'Well-structured show notes improve your podcast\'s visibility in directories like Apple Podcasts, Spotify, and Google Podcasts. Include relevant keywords naturally, format content with clear headings, and make sure the first 2-3 sentences are compelling since they often appear in search results.'
  }
];

/**
 * Example show notes formats for guidance panel
 */
const examples = [
  {
    title: 'Interview-Style Episode:',
    description: 'Start with guest introduction and credentials, followed by episode summary highlighting main discussion points. Include timestamped segments for major topics, list key insights with action items, and close with guest contact info and resources mentioned.'
  },
  {
    title: 'Solo Episode Format:',
    description: 'Open with a hook that teases the main topic, provide episode overview with clear structure, use bullet points for key takeaways, include timestamps for different segments, and end with a call-to-action (subscribe, review, visit website) plus any relevant links.'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return episodeTitle.value.trim() && topicsCovered.value.trim();
});

/**
 * Embedded mode field configuration
 * In embedded mode, we show a simplified 2-field form (episodeTitle, topicsCovered)
 */
const embeddedFields = computed(() => {
  const defaultLabels = {
    episodeTitle: 'Episode Title',
    topicsCovered: 'Topics Covered'
  };
  const defaultPlaceholders = {
    episodeTitle: 'e.g., Ep 42: How to Scale Your Business',
    topicsCovered: 'What topics were discussed in this episode?'
  };

  return [
    {
      key: 'episodeTitle',
      type: 'input',
      label: props.intent?.formLabels?.episodeTitle || defaultLabels.episodeTitle,
      placeholder: props.intent?.formPlaceholders?.episodeTitle || defaultPlaceholders.episodeTitle
    },
    {
      key: 'topicsCovered',
      type: 'textarea',
      label: props.intent?.formLabels?.topicsCovered || defaultLabels.topicsCovered,
      placeholder: props.intent?.formPlaceholders?.topicsCovered || defaultPlaceholders.topicsCovered
    }
  ];
});

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const titleVal = episodeTitle.value || '[Episode Title]';
  const topicsVal = topicsCovered.value || '[Topics]';

  if (!episodeTitle.value && !topicsCovered.value) {
    return null; // Show default preview
  }

  return `"Professional show notes for <strong>${titleVal}</strong> covering <strong>${topicsVal}</strong>."`;
});

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return episodeTitle.value?.trim() && topicsCovered.value?.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';

    const payload = {
      episodeTitle: episodeTitle.value,
      guestName: guestName.value,
      topicsCovered: topicsCovered.value,
      keyTakeaways: keyTakeaways.value,
      resources: resources.value,
      tone: tone.value
    };

    await generate(payload, context);

    emit('generated', {
      content: generatedContent.value,
      tone: tone.value
    });
  } catch (err) {
    console.error('[PodcastNotesGenerator] Generation failed:', err);
  }
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  await copyToClipboard();
};

/**
 * Handle apply (integrated mode)
 */
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    content: generatedContent.value
  });
};

/**
 * Handle embedded field change
 */
const handleEmbeddedFieldChange = () => {
  emit('change', {
    episodeTitle: episodeTitle.value,
    topicsCovered: topicsCovered.value
  });
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Pre-populate fields from profile data
  // Note: Podcast notes don't typically store in profile, but we support it for consistency
  if (profileData.episode_title) episodeTitle.value = profileData.episode_title;
  if (profileData.guest_name) guestName.value = profileData.guest_name;
  if (profileData.topics_covered) topicsCovered.value = profileData.topics_covered;
  if (profileData.key_takeaways) keyTakeaways.value = profileData.key_takeaways;
  if (profileData.resources) resources.value = profileData.resources;
  if (profileData.tone) tone.value = profileData.tone;
}

/**
 * Watch for field changes in embedded mode and emit preview updates
 */
watch(
  () => [episodeTitle.value, topicsCovered.value],
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: {
          episodeTitle: episodeTitle.value,
          topicsCovered: topicsCovered.value
        }
      });
    }
  },
  { deep: true }
);

/**
 * Watch for profileData prop changes (embedded mode with EmbeddedToolWrapper)
 * Pre-populates form fields when profile data is provided
 */
watch(
  () => props.profileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Watch for injected profile data from EmbeddedToolWrapper (embedded mode)
 * This is the primary reactive source for profile changes in embedded mode
 */
watch(
  injectedProfileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Emit can-generate status changes to parent (for embedded mode)
 */
watch(canGenerateEmbedded, (newValue) => {
  if (props.mode === 'embedded') {
    emit('update:can-generate', !!newValue);
  }
}, { immediate: true });
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

/* Podcast Notes Results */
.podcast-notes-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.podcast-notes-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.podcast-notes-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.podcast-notes-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.podcast-notes-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.podcast-notes-generator__content pre {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}

.podcast-notes-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Embedded Mode Styles (for landing page) */
.gmkb-embedded-form {
  width: 100%;
}

.gmkb-embedded-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gmkb-embedded-field {
  display: flex;
  flex-direction: column;
}

.gmkb-embedded-label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--mkcg-text-primary, #0f172a);
}

.gmkb-embedded-input {
  width: 100%;
  padding: 14px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  box-sizing: border-box;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gmkb-embedded-textarea {
  resize: vertical;
  min-height: 80px;
}

.gmkb-embedded-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gmkb-embedded-input::placeholder {
  color: var(--mkcg-text-light, #94a3b8);
}

.gmkb-embedded-result {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 8px;
}

.gmkb-embedded-result__content {
  font-size: 15px;
  line-height: 1.6;
  color: #166534;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.gmkb-embedded-error {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}
</style>
