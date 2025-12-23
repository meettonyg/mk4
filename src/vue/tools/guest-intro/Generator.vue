<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Guest Introduction Generator"
    subtitle="Create host-ready introductions that build anticipation and establish credibility using AI"
    intro-text="Generate compelling introductions designed to be read aloud by podcast hosts or event MCs. Each introduction establishes credibility, creates anticipation, and sets the stage for an engaging conversation."
    generator-type="guest-intro"
    :has-results="hasIntroduction"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Guest Information Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Guest Information</h3>

        <div class="generator__field">
          <label class="generator__field-label">Guest Name *</label>
          <input
            v-model="name"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Dr. Jane Smith"
          />
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Short Biography *</label>
          <textarea
            v-model="biography"
            class="generator__field-input generator__field-textarea"
            placeholder="e.g., Dr. Jane Smith is a leadership coach and author who has helped over 500 executives transform their careers..."
            rows="4"
          ></textarea>
          <p class="generator__field-helper">
            Provide a brief bio to pull key information from.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Key Credentials</label>
          <input
            v-model="credentials"
            type="text"
            class="generator__field-input"
            placeholder="e.g., PhD, ICF Certified Coach, TEDx Speaker"
          />
          <p class="generator__field-helper">
            Comma-separated list of credentials to highlight.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Tagline (Optional)</label>
          <input
            v-model="tagline"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Helping leaders lead with purpose"
          />
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
          {{ isGenerating ? 'Crafting introduction...' : 'Generate Introduction with AI' }}
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
        title="Crafting the Perfect Guest Introduction"
        subtitle="A powerful guest introduction establishes credibility, creates anticipation, and sets the stage for a memorable conversation."
        :formula="introFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Guest Introductions:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="guest-intro-generator__results">
        <div class="guest-intro-generator__results-header">
          <h3>Your Generated Introduction</h3>
          <p>Ready to be read aloud by your host</p>
        </div>

        <!-- Introduction Content -->
        <div class="guest-intro-generator__content">
          <p>{{ introduction }}</p>
        </div>

        <!-- Read-aloud tip -->
        <div class="guest-intro-generator__tip">
          <svg class="guest-intro-generator__tip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>This introduction is designed to be read aloud by a podcast host or event MC.</span>
        </div>

        <!-- Actions -->
        <div class="guest-intro-generator__actions">
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
          <button
            type="button"
            class="generator__button generator__button--outline"
            @click="handleGenerate"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Regenerate
          </button>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else
    title="Guest Introduction Generator"
    description="Create a host-ready introduction that builds anticipation and establishes credibility."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasIntroduction"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Guest Intro"
    :show-cta="!hasIntroduction"
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
        <label class="gmkb-ai-label gmkb-ai-label--required">Guest Name</label>
        <input
          v-model="name"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Dr. Jane Smith"
        />
      </div>

      <!-- Biography Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Short Biography</label>
        <textarea
          v-model="biography"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., Dr. Jane Smith is a leadership coach and author who has helped over 500 executives transform their careers..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Provide a brief bio to pull key information from.
        </span>
      </div>

      <!-- Credentials Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Key Credentials</label>
        <input
          v-model="credentials"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., PhD, ICF Certified Coach, TEDx Speaker"
        />
        <span class="gmkb-ai-hint">
          Comma-separated list of credentials to highlight.
        </span>
      </div>

      <!-- Tagline Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Tagline (Optional)</label>
        <input
          v-model="tagline"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Helping leaders lead with purpose"
        />
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate Introduction"
        loading-text="Crafting introduction..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasIntroduction" class="gmkb-ai-intro">
        <div class="gmkb-ai-intro__content">
          <AiResultsDisplay
            :content="introduction"
            format="text"
            show-count
          />
        </div>

        <!-- Read-aloud tip -->
        <div class="gmkb-ai-intro__tip">
          <svg class="gmkb-ai-intro__tip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>This introduction is designed to be read aloud by a podcast host or event MC.</span>
        </div>
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAIGuestIntro } from '../../../composables/useAIGuestIntro';
import { useImpactIntro } from '../../../composables/useImpactIntro';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../components/ai/AiResultsDisplay.vue';

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
  },

  /**
   * Initial name
   */
  initialName: {
    type: String,
    default: ''
  },

  /**
   * Initial biography
   */
  initialBiography: {
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
  introduction,
  hasIntroduction,
  generate,
  copyToClipboard
} = useAIGuestIntro();

const { credentialsSummary, syncFromStore: syncImpactIntro } = useImpactIntro();

// Local state
const name = ref(props.initialName);
const biography = ref(props.initialBiography);
const credentials = ref('');
const tagline = ref('');

/**
 * Introduction formula for guidance panel
 */
const introFormula = '<span class="generator__highlight">[CREDIBILITY]</span> + <span class="generator__highlight">[RELEVANCE]</span> + <span class="generator__highlight">[HOOK]</span> = Perfect Guest Introduction';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Guest Introductions Matter',
    description: 'The first 30 seconds of your podcast or event set the tone for everything that follows. A compelling guest introduction establishes credibility, creates anticipation, and primes your audience to engage with your guest\'s message. Hosts rely on these introductions to smoothly transition into conversations and build immediate rapport.'
  },
  {
    title: 'What Makes a Great Introduction',
    description: 'The best guest introductions are concise (30-60 seconds when read aloud), highlight 2-3 key credentials or accomplishments, establish relevance to the audience, and create curiosity about what the guest will share. They\'re written in a conversational tone that sounds natural when spoken.'
  },
  {
    title: 'How Hosts Use Your Introduction',
    description: 'Podcast hosts and event MCs will read your introduction word-for-word at the start of your appearance. A well-crafted introduction makes their job easier, ensures your key accomplishments are highlighted, and creates the perfect setup for your conversation. Many hosts prefer to receive introductions in advance rather than improvising.'
  }
];

/**
 * Example guest introductions for guidance panel
 */
const examples = [
  {
    title: 'Business Coach Introduction:',
    description: 'Today I\'m thrilled to welcome Sarah Chen, a business coach who\'s helped over 300 entrepreneurs scale their companies to seven figures. Sarah is the author of "The Sustainable Scale," a TEDx speaker, and the founder of the Growth Lab podcast. She specializes in helping mission-driven founders grow their impact without burning out. Sarah, welcome to the show!'
  },
  {
    title: 'Tech Expert Introduction:',
    description: 'Our guest today is Marcus Rodriguez, the former VP of Engineering at TechFlow and current advisor to over 20 AI startups. Marcus has spent 15 years building products that serve millions of users, and he\'s here to share insights on leading engineering teams through rapid growth. Marcus holds a PhD in Computer Science from MIT and is known for his practical, no-nonsense approach to technical leadership. Marcus, great to have you here!'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return name.value.trim() && biography.value.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      name: name.value,
      biography: biography.value,
      credentials: credentials.value,
      tagline: tagline.value
    }, context);

    emit('generated', {
      introduction: introduction.value
    });
  } catch (err) {
    console.error('[GuestIntroGenerator] Generation failed:', err);
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
    introduction: introduction.value
  });
};

/**
 * Load credentials from store on mount
 */
onMounted(() => {
  syncImpactIntro();
  if (credentialsSummary.value) {
    credentials.value = credentialsSummary.value;
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

/* Guest Intro Results */
.guest-intro-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.guest-intro-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.guest-intro-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.guest-intro-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.guest-intro-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.guest-intro-generator__content p {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
}

.guest-intro-generator__tip {
  display: flex;
  align-items: flex-start;
  gap: var(--mkcg-space-xs, 8px);
  padding: var(--mkcg-space-sm, 12px);
  background: var(--mkcg-bg-secondary, #f8f9fa);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.guest-intro-generator__tip-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--mkcg-primary, #1a9bdc);
}

.guest-intro-generator__actions {
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles */
.gmkb-ai-intro__content {
  margin-bottom: 16px;
}

.gmkb-ai-intro__tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: var(--gmkb-ai-bg-tertiary, #f3f4f6);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

.gmkb-ai-intro__tip-icon {
  flex-shrink: 0;
  margin-top: 1px;
}
</style>
