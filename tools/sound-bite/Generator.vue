<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'default'"
    title="Sound Bite Generator"
    subtitle="Create memorable quotes and one-liners for media appearances using AI"
    intro-text="Generate powerful, quotable sound bites designed for podcasts, interviews, and media appearances. Each sound bite combines a unique insight with an element of contrast or surprise to make your message memorable and shareable."
    generator-type="sound_bite"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Topic Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Topic Information</h3>

        <div class="generator__field">
          <label class="generator__field-label">Topic or Theme *</label>
          <input
            v-model="topic"
            type="text"
            class="generator__field-input"
            placeholder="e.g., leadership, innovation, work-life balance"
          />
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Your Expertise/Perspective *</label>
          <textarea
            v-model="expertise"
            class="generator__field-input generator__field-textarea"
            placeholder="What unique perspective do you bring to this topic?"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Your sound bites will reflect your unique point of view.
          </p>
        </div>
      </div>

      <!-- Media Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Media Settings</h3>

        <div class="generator__settings-grid">
          <div class="generator__field">
            <label class="generator__field-label">Media Context</label>
            <select v-model="context" class="generator__field-input">
              <option value="podcast">Podcast Interview</option>
              <option value="news">News/Press</option>
              <option value="social">Social Media</option>
              <option value="keynote">Keynote/Speech</option>
            </select>
          </div>
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
          {{ isGenerating ? 'Creating memorable quotes...' : 'Generate Sound Bites with AI' }}
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
        title="Creating Memorable Sound Bites"
        subtitle="A powerful sound bite is a quotable statement that captures attention and sticks in people's minds long after your interview or appearance ends."
        :formula="soundBiteFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Sound Bites:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="sound-bite-generator__results">
        <div class="sound-bite-generator__results-header">
          <h3>Your Generated Sound Bites</h3>
          <p>Quotable statements optimized for {{ contextLabel }}</p>
        </div>

        <!-- Sound Bites Grid -->
        <div class="sound-bite-generator__grid">
          <div
            v-for="(soundBite, index) in soundBites"
            :key="index"
            class="sound-bite-generator__card"
          >
            <div class="sound-bite-generator__card-header">
              <span class="sound-bite-generator__card-number">{{ index + 1 }}</span>
            </div>
            <div class="sound-bite-generator__card-content">
              <p>"{{ soundBite }}"</p>
            </div>
            <div class="sound-bite-generator__card-actions">
              <button
                type="button"
                class="generator__button generator__button--outline generator__button--small"
                @click="handleCopySingle(soundBite)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="sound-bite-generator__actions">
          <button
            type="button"
            class="generator__button generator__button--outline"
            @click="handleCopyAll"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy All Sound Bites
          </button>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
    title="Sound Bite Generator"
    description="Create memorable quotes and one-liners for media appearances."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="SoundBite"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopyAll"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Topic Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Topic or Theme</label>
        <input
          v-model="topic"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., leadership, innovation, work-life balance"
        />
      </div>

      <!-- Expertise Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Expertise/Perspective</label>
        <textarea
          v-model="expertise"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What unique perspective do you bring to this topic?"
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Your sound bites will reflect your unique point of view.
        </span>
      </div>

      <!-- Context Selector -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Media Context</label>
        <select v-model="context" class="gmkb-ai-input">
          <option value="podcast">Podcast Interview</option>
          <option value="news">News/Press</option>
          <option value="social">Social Media</option>
          <option value="keynote">Keynote/Speech</option>
        </select>
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      >
        Generate Sound Bites
      </AiGenerateButton>
    </div>

    <!-- Results -->
    <template #results>
      <div class="gmkb-ai-results__cards">
        <div
          v-for="(soundBite, index) in soundBites"
          :key="index"
          class="gmkb-ai-results__card"
        >
          <div class="gmkb-ai-results__card-number">{{ index + 1 }}</div>
          <div class="gmkb-ai-results__card-content">
            <p>"{{ soundBite }}"</p>
          </div>
        </div>
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Embedded Mode: Landing page form (simplified, used with EmbeddedToolWrapper) -->
  <div v-else class="gmkb-embedded-form">
    <!-- Simplified 2-field form for landing page -->
    <div class="gmkb-embedded-fields">
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.topic || 'Topic or Key Message' }} *</label>
        <input
          v-model="topic"
          type="text"
          class="gmkb-embedded-input"
          :placeholder="currentIntent?.formPlaceholders?.topic || 'e.g., Why authentic leadership matters'"
        />
      </div>

      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.expertise || 'Your Expertise (Optional)' }}</label>
        <textarea
          v-model="expertise"
          class="gmkb-embedded-input gmkb-embedded-textarea"
          :placeholder="currentIntent?.formPlaceholders?.expertise || 'e.g., Leadership coach with 20 years experience...'"
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- Results display for embedded mode -->
    <div v-if="hasContent" class="gmkb-embedded-result">
      <div class="gmkb-embedded-result__content">
        <div
          v-for="(soundBite, index) in soundBites"
          :key="index"
          class="gmkb-embedded-result__item"
        >
          "{{ soundBite }}"
        </div>
      </div>
    </div>

    <!-- Error display -->
    <div v-if="error" class="gmkb-embedded-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useAIGenerator } from '../../src/composables/useAIGenerator';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
// This provides reactive updates when profile is selected from dropdown
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

const props = defineProps({
  /**
   * Mode: 'integrated', 'standalone', or 'embedded'
   * - standalone: Full two-panel layout with guidance
   * - integrated: Compact widget for embedding in other components
   * - embedded: Landing page embed with simplified form
   */
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated', 'embedded'].includes(v)
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
  generate: generateContent,
  copyToClipboard
} = useAIGenerator('sound_bite');

// Computed to get sound bites array from generated content
const soundBites = computed(() => {
  if (!generatedContent.value) return [];
  if (Array.isArray(generatedContent.value)) return generatedContent.value;
  if (typeof generatedContent.value === 'string') {
    // Split by newlines if it's a string
    return generatedContent.value.split('\n').filter(line => line.trim());
  }
  return [generatedContent.value];
});

// Copy single sound bite to clipboard
const copySingleToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Local state
const topic = ref('');
const expertise = ref('');
const context = ref('podcast');

/**
 * Sound bite formula for guidance panel
 */
const soundBiteFormula = '<span class="generator__highlight">[INSIGHT]</span> + <span class="generator__highlight">[CONTRAST/SURPRISE]</span> = Memorable Sound Bite';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Sound Bites Matter',
    description: 'In today\'s fast-paced media landscape, attention spans are short. A powerful sound bite can become the memorable quote that defines your message, gets shared on social media, and positions you as a thought leader. It\'s the difference between being forgotten and being remembered.'
  },
  {
    title: 'What Makes Them Quotable',
    description: 'The best sound bites combine a unique insight with an element of contrast or surprise. They challenge conventional thinking, offer a fresh perspective, or present a familiar concept in an unexpected way. They\'re concise, specific, and immediately understandable.'
  },
  {
    title: 'When to Use Sound Bites',
    description: 'Deploy your sound bites strategically during podcast interviews, media appearances, keynote speeches, and social media posts. Have 3-5 prepared sound bites ready for each topic you discuss. Practice delivering them naturally so they sound spontaneous, not rehearsed.'
  }
];

/**
 * Example sound bites for guidance panel
 */
const examples = [
  {
    title: 'Leadership Example:',
    description: '"Great leaders don\'t create followers—they create more leaders. The moment you start counting your followers instead of developing your team\'s leadership capacity, you\'ve stopped leading and started collecting."'
  },
  {
    title: 'Innovation Example:',
    description: '"Innovation isn\'t about having the best idea in the room—it\'s about creating a room where the best ideas feel safe to emerge. Most companies don\'t have an innovation problem; they have a psychological safety problem."'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return topic.value.trim() && expertise.value.trim();
});

/**
 * Context label for display
 */
const contextLabel = computed(() => {
  const labels = {
    podcast: 'Podcast Interview',
    news: 'News/Press',
    social: 'Social Media',
    keynote: 'Keynote/Speech'
  };
  return labels[context.value] || context.value;
});

/**
 * Embedded mode field configuration
 * In embedded mode, we show a simplified 2-field form (topic, expertise)
 */
const embeddedFields = computed(() => {
  const defaultLabels = {
    topic: 'Topic or Theme',
    expertise: 'Your Expertise/Perspective'
  };
  const defaultPlaceholders = {
    topic: 'e.g., leadership, innovation, work-life balance',
    expertise: 'What unique perspective do you bring to this topic?'
  };

  return [
    {
      key: 'topic',
      label: props.intent?.formLabels?.topic || defaultLabels.topic,
      placeholder: props.intent?.formPlaceholders?.topic || defaultPlaceholders.topic
    },
    {
      key: 'expertise',
      label: props.intent?.formLabels?.expertise || defaultLabels.expertise,
      placeholder: props.intent?.formPlaceholders?.expertise || defaultPlaceholders.expertise
    }
  ];
});

/**
 * Current intent for embedded mode
 */
const currentIntent = computed(() => props.intent || null);

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const topicVal = topic.value || '[TOPIC]';
  const expertiseVal = expertise.value || '[YOUR PERSPECTIVE]';

  if (!topic.value && !expertise.value) {
    return null; // Show default preview
  }

  return `"<strong>${topicVal}</strong>: ${expertiseVal}"`;
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const generatorContext = props.mode === 'integrated' ? 'builder' : 'public';
    await generateContent({
      topic: topic.value,
      expertise: expertise.value,
      context: context.value
    }, generatorContext);

    emit('generated', {
      content: soundBites.value,
      topic: topic.value,
      context: context.value
    });
  } catch (err) {
    console.error('[SoundBiteGenerator] Generation failed:', err);
  }
};

/**
 * Handle copy all sound bites
 */
const handleCopyAll = async () => {
  await copyToClipboard();
};

/**
 * Handle copy single sound bite
 */
const handleCopySingle = async (soundBite) => {
  await copySingleToClipboard(soundBite);
};

/**
 * Handle apply (integrated mode)
 */
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    content: soundBites.value,
    context: context.value
  });
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Pre-populate fields from profile data
  if (profileData.expertise) {
    expertise.value = profileData.expertise;
  }
  // Note: topic is typically user-specific per use case, not from profile
}

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
 * Watch for field changes in embedded mode and emit preview updates
 */
watch(
  () => [topic.value, expertise.value],
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: {
          topic: topic.value,
          expertise: expertise.value
        }
      });
    }
  },
  { deep: true }
);

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return topic.value?.trim() && expertise.value?.trim();
});

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

.generator__settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--mkcg-space-md, 20px);
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

/* Sound Bite Results */
.sound-bite-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.sound-bite-generator__results-header {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.sound-bite-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.sound-bite-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.sound-bite-generator__grid {
  display: grid;
  gap: var(--mkcg-space-md, 20px);
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.sound-bite-generator__card {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  transition: var(--mkcg-transition-fast, 0.15s ease);
}

.sound-bite-generator__card:hover {
  border-color: var(--mkcg-primary, #1a9bdc);
  box-shadow: 0 2px 8px rgba(26, 155, 220, 0.1);
}

.sound-bite-generator__card-header {
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.sound-bite-generator__card-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: var(--mkcg-font-size-xs, 12px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-primary, #1a9bdc);
  background: rgba(26, 155, 220, 0.1);
  border-radius: 50%;
}

.sound-bite-generator__card-content {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.sound-bite-generator__card-content p {
  margin: 0;
  font-size: var(--mkcg-font-size-base, 16px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
  color: var(--mkcg-text-primary, #2c3e50);
  font-style: italic;
}

.sound-bite-generator__card-actions {
  display: flex;
  justify-content: flex-end;
}

.sound-bite-generator__actions {
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
  justify-content: center;
}

/* Integrated Mode Styles */
.gmkb-ai-results__cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gmkb-ai-results__card {
  padding: 12px;
  background: var(--gmkb-ai-bg-secondary, #f8fafc);
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: 6px;
  transition: all 0.15s ease;
}

.gmkb-ai-results__card:hover {
  border-color: var(--gmkb-ai-primary, #6366f1);
  background: var(--gmkb-ai-bg-primary, #ffffff);
}

.gmkb-ai-results__card-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 600;
  color: var(--gmkb-ai-primary, #6366f1);
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  margin-bottom: 8px;
}

.gmkb-ai-results__card-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--gmkb-ai-text-primary, #1e293b);
  font-style: italic;
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gmkb-embedded-result__item {
  font-size: 15px;
  line-height: 1.6;
  color: #166534;
  font-style: italic;
  padding: 8px 0;
  border-bottom: 1px solid rgba(134, 239, 172, 0.3);
}

.gmkb-embedded-result__item:last-child {
  border-bottom: none;
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
