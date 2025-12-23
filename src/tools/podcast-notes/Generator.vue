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
    v-else
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAIGenerator } from '../../composables/useAIGenerator';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../vue/components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel } from '../_shared';

const props = defineProps({
  /**
   * Mode: 'integrated' or 'standalone'
   */
  mode: {
    type: String,
    default: 'standalone'
  },

  /**
   * Component ID to apply results to (integrated mode)
   */
  componentId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated']);

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
</style>
