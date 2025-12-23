<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Professional Biography Generator"
    subtitle="Create compelling professional biographies in multiple lengths using AI"
    intro-text="Generate professional biographies in three different lengths (short, medium, and long) based on your authority hook, impact intro, and professional details. Each biography will be tailored to showcase your expertise and connect with your target audience."
    generator-type="biography"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Authority Hook Section -->
      <AuthorityHookSection
        :hook-text="authorityHookText"
        :show-badge="!!authorityHookText"
        @update:components="handleAuthorityHookUpdate"
      />

      <!-- Personal Info Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Personal Information</h3>

        <div class="generator__field">
          <label class="generator__field-label">Your Name *</label>
          <input
            v-model="name"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Dr. Jane Smith"
          />
        </div>

        <div class="generator__field">
          <label class="generator__field-label">What do you do? *</label>
          <textarea
            v-model="authorityHookText"
            class="generator__field-input generator__field-textarea"
            placeholder="e.g., I help busy executives achieve work-life balance through proven mindfulness techniques..."
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Describe who you help and what transformation you provide.
          </p>
        </div>
      </div>

      <!-- Biography Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Biography Settings</h3>

        <div class="generator__settings-grid">
          <div class="generator__field">
            <label class="generator__field-label">Tone</label>
            <select v-model="tone" class="generator__field-input">
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="authoritative">Authoritative</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <div class="generator__field">
            <label class="generator__field-label">Length</label>
            <select v-model="length" class="generator__field-input">
              <option value="short">Short (50-75 words)</option>
              <option value="medium">Medium (100-150 words)</option>
              <option value="long">Long (200-300 words)</option>
            </select>
          </div>

          <div class="generator__field">
            <label class="generator__field-label">Point of View</label>
            <select v-model="pov" class="generator__field-input">
              <option value="third">Third Person (He/She/They)</option>
              <option value="first">First Person (I/My)</option>
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
          {{ isGenerating ? 'Generating...' : 'Generate Biography with AI' }}
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
        title="Crafting Your Perfect Biography"
        subtitle="Your professional biography is an essential marketing tool that combines your Authority Hook and Impact Intro into a comprehensive narrative."
        :formula="biographyFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Biography Structures:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="biography-generator__results">
        <div class="biography-generator__results-header">
          <h3>Your Generated Biographies</h3>
          <p>Three versions optimized for different use cases</p>
        </div>

        <!-- Length Tabs -->
        <div v-if="hasMultipleBios" class="biography-generator__tabs">
          <button
            v-for="len in availableLengths"
            :key="len"
            type="button"
            class="biography-generator__tab"
            :class="{ 'biography-generator__tab--active': length === len }"
            @click="length = len"
          >
            {{ len }}
          </button>
        </div>

        <!-- Biography Content -->
        <div class="biography-generator__content">
          <p>{{ currentBio }}</p>
        </div>

        <!-- Actions -->
        <div class="biography-generator__actions">
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
    title="Biography Generator"
    description="Create a professional biography that establishes your credibility and expertise."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Biography"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Name Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Name</label>
        <input
          v-model="name"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Dr. Jane Smith"
        />
      </div>

      <!-- Authority Hook (simplified) -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">What do you do?</label>
        <textarea
          v-model="authorityHookText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., I help busy executives achieve work-life balance through proven mindfulness techniques..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Describe who you help and what transformation you provide.
        </span>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" />

      <!-- Length Selector -->
      <AiLengthSelector v-model="length" />

      <!-- POV Selector -->
      <AiPovSelector v-model="pov" />

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
        v-if="currentBio"
        :content="currentBio"
        format="text"
        show-count
      />
    </template>

    <!-- Results Actions -->
    <template #results-actions>
      <div class="gmkb-ai-results__tabs" v-if="hasMultipleBios">
        <button
          v-for="len in availableLengths"
          :key="len"
          type="button"
          class="gmkb-ai-results__tab"
          :class="{ 'gmkb-ai-results__tab--active': length === len }"
          @click="length = len"
        >
          {{ len }}
        </button>
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAIBiography } from '../../../composables/useAIBiography';
import { useAuthorityHook } from '../../../composables/useAuthorityHook';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../components/ai/AiToneSelector.vue';
import AiLengthSelector from '../../components/ai/AiLengthSelector.vue';
import AiPovSelector from '../../components/ai/AiPovSelector.vue';
import AiGenerateButton from '../../components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, AuthorityHookSection } from '../_shared';

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
  },

  /**
   * Initial name value
   */
  initialName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['applied', 'generated']);

// Use composables
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  biographies,
  currentBio,
  hasContent,
  generate,
  copyToClipboard,
  tone,
  length,
  pov,
  setTone,
  setLength,
  setPOV
} = useAIBiography();

const { authorityHookSummary, syncFromStore } = useAuthorityHook();

// Local state
const name = ref(props.initialName);
const authorityHookText = ref('');

/**
 * Biography formula for guidance panel
 */
const biographyFormula = 'I help <span class="generator__highlight">[WHO]</span> achieve <span class="generator__highlight">[RESULT]</span> when <span class="generator__highlight">[WHEN]</span> through <span class="generator__highlight">[HOW]</span>. I\'ve <span class="generator__highlight">[WHERE]</span>. My mission is to <span class="generator__highlight">[WHY]</span>.';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Professional Biographies Matter',
    description: 'Your biography is often the first impression potential clients, podcast hosts, or event organizers have of you. A powerful biography combines your Authority Hook and Impact Intro into a cohesive story that establishes credibility, showcases results, and communicates your purpose.'
  },
  {
    title: 'What Makes a Great Biography',
    description: 'The best biographies are specific, outcome-focused, and authentic. They clearly identify who you help, what results you deliver, what problems you solve, and how you achieve those results.'
  },
  {
    title: 'Using Your Generated Biographies',
    description: 'You\'ll receive three versions: Short (for social media and brief introductions), Medium (for speaker bios and website about pages), and Long (for detailed professional profiles and comprehensive marketing materials).'
  }
];

/**
 * Example biographies for guidance panel
 */
const examples = [
  {
    title: 'Business Coach Biography:',
    description: 'I help ambitious entrepreneurs build scalable businesses without burning out. Through my proven systems, I\'ve guided over 200 business owners to achieve 6-figure growth while working fewer hours.'
  },
  {
    title: 'Marketing Consultant Biography:',
    description: 'I help B2B companies generate qualified leads and increase sales through strategic digital marketing. I\'ve helped over 150 companies achieve an average 300% increase in lead generation within 90 days.'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return name.value.trim() && authorityHookText.value.trim();
});

/**
 * Check if multiple biography lengths are available
 */
const hasMultipleBios = computed(() => {
  return Object.keys(biographies.value).filter(k => biographies.value[k]).length > 1;
});

/**
 * Available lengths that have content
 */
const availableLengths = computed(() => {
  return ['short', 'medium', 'long'].filter(len => biographies.value[len]);
});

/**
 * Handle authority hook component update
 */
const handleAuthorityHookUpdate = (components) => {
  // Build authority hook text from components
  const parts = [];
  if (components.who) parts.push(`I help ${components.who}`);
  if (components.what) parts.push(`achieve ${components.what}`);
  if (components.when) parts.push(`when ${components.when}`);
  if (components.how) parts.push(`through ${components.how}`);
  authorityHookText.value = parts.join(' ');
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      name: name.value,
      authorityHook: authorityHookText.value
    }, context);

    emit('generated', {
      content: currentBio.value,
      length: length.value,
      tone: tone.value,
      pov: pov.value
    });
  } catch (err) {
    console.error('[BiographyGenerator] Generation failed:', err);
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
    content: currentBio.value,
    length: length.value
  });
};

/**
 * Sync authority hook from store on mount
 */
onMounted(() => {
  syncFromStore();
  if (authorityHookSummary.value) {
    authorityHookText.value = authorityHookSummary.value;
  }
});

/**
 * Watch for store changes
 */
watch(authorityHookSummary, (newVal) => {
  if (newVal && !authorityHookText.value) {
    authorityHookText.value = newVal;
  }
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

/* Biography Results */
.biography-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.biography-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.biography-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.biography-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.biography-generator__tabs {
  display: flex;
  gap: var(--mkcg-space-xs, 8px);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.biography-generator__tab {
  padding: var(--mkcg-space-xs, 8px) var(--mkcg-space-md, 20px);
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-medium, 500);
  text-transform: capitalize;
  color: var(--mkcg-text-secondary, #5a6d7e);
  background: transparent;
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius-sm, 4px);
  cursor: pointer;
  transition: var(--mkcg-transition-fast, 0.15s ease);
}

.biography-generator__tab:hover {
  border-color: var(--mkcg-primary, #1a9bdc);
}

.biography-generator__tab--active {
  color: var(--mkcg-primary, #1a9bdc);
  background: rgba(26, 155, 220, 0.1);
  border-color: var(--mkcg-primary, #1a9bdc);
}

.biography-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.biography-generator__content p {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
}

.biography-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles (kept from original) */
.gmkb-ai-results__tabs {
  display: flex;
  gap: 4px;
}

.gmkb-ai-results__tab {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  color: var(--gmkb-ai-text-secondary, #64748b);
  background: transparent;
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gmkb-ai-results__tab:hover {
  border-color: var(--gmkb-ai-primary, #6366f1);
}

.gmkb-ai-results__tab--active {
  color: var(--gmkb-ai-primary, #6366f1);
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--gmkb-ai-primary, #6366f1);
}
</style>
