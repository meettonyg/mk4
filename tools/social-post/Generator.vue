<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Social Post Generator"
    subtitle="Create engaging social media posts for multiple platforms using AI"
    intro-text="Generate platform-optimized social media posts that capture attention and drive engagement. Whether you need content for LinkedIn, Twitter/X, Instagram, or Facebook, our AI crafts compelling posts tailored to each platform's unique style and audience."
    generator-type="social-post"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Post Topic Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Post Content</h3>

        <div class="generator__field">
          <label class="generator__field-label">Post Topic *</label>
          <textarea
            v-model="formData.topic"
            class="generator__field-input generator__field-textarea"
            placeholder="What do you want to post about? Be specific about your message or value proposition..."
            rows="4"
          ></textarea>
          <p class="generator__field-helper">
            Describe the main message, insight, or value you want to share with your audience.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Call to Action</label>
          <input
            v-model="formData.callToAction"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Comment below, Visit my website, Download the guide"
          />
          <p class="generator__field-helper">
            Optional: Add a specific action you want readers to take.
          </p>
        </div>
      </div>

      <!-- Post Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Post Settings</h3>

        <div class="generator__settings-grid">
          <div class="generator__field">
            <label class="generator__field-label">Platform</label>
            <select v-model="formData.platform" class="generator__field-input">
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter/X</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="all">All Platforms</option>
            </select>
          </div>

          <div class="generator__field">
            <label class="generator__field-label">Tone</label>
            <select v-model="formData.tone" class="generator__field-input">
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="authoritative">Authoritative</option>
              <option value="friendly">Friendly</option>
              <option value="inspirational">Inspirational</option>
            </select>
          </div>

          <div class="generator__field">
            <label class="generator__field-label">Hashtags</label>
            <select v-model="formData.hashtags" class="generator__field-input">
              <option value="yes">Yes, include relevant hashtags</option>
              <option value="no">No hashtags</option>
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
          {{ isGenerating ? 'Creating Your Posts...' : 'Generate Social Posts with AI' }}
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
        title="Crafting Viral Social Posts"
        subtitle="Transform your ideas into engagement-driving social media content that resonates with your audience and amplifies your message."
        :formula="socialPostFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Social Post Structures:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="social-post-generator__results">
        <div class="social-post-generator__results-header">
          <h3>Your Generated Social Posts</h3>
          <p>Platform-optimized content ready to publish</p>
        </div>

        <!-- Platform Tabs (if multiple platforms) -->
        <div v-if="hasMultiplePosts" class="social-post-generator__tabs">
          <button
            v-for="post in displayPosts"
            :key="post.platform"
            type="button"
            class="social-post-generator__tab"
            :class="{ 'social-post-generator__tab--active': selectedPlatform === post.platform }"
            @click="selectedPlatform = post.platform"
          >
            {{ post.platform }}
          </button>
        </div>

        <!-- Post Content -->
        <div v-if="currentPost" class="social-post-generator__content">
          <div class="social-post-generator__platform-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {{ currentPost.platform }}
          </div>
          <div class="social-post-generator__text">
            {{ currentPost.content }}
          </div>
          <div v-if="currentPost.characterCount" class="social-post-generator__meta">
            Character count: {{ currentPost.characterCount }}
          </div>
        </div>

        <!-- Actions -->
        <div class="social-post-generator__actions">
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
    title="Social Post Generator"
    description="Create engaging social media posts for multiple platforms."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Social Post"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Topic Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Post Topic</label>
        <textarea
          v-model="formData.topic"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What do you want to post about?"
          rows="2"
        ></textarea>
      </div>

      <!-- Platform Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Platform</label>
        <select v-model="formData.platform" class="gmkb-ai-input gmkb-ai-select">
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter/X</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="all">All Platforms</option>
        </select>
      </div>

      <!-- Call to Action Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Call to Action</label>
        <input
          v-model="formData.callToAction"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Comment below, Visit my website"
        />
      </div>

      <!-- Hashtags Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Include Hashtags?</label>
        <select v-model="formData.hashtags" class="gmkb-ai-input gmkb-ai-select">
          <option value="yes">Yes, include relevant hashtags</option>
          <option value="no">No hashtags</option>
        </select>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="formData.tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate Posts"
        loading-text="Creating your posts..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasContent" class="gmkb-ai-results">
        <AiResultsDisplay
          :content="displayContent"
          format="cards"
          :selected-index="selectedIndex"
          @select="handleSelect"
        />
      </div>
    </template>

    <!-- Results Actions -->
    <template #results-actions>
      <div class="gmkb-ai-results__tabs" v-if="hasMultiplePosts">
        <button
          v-for="post in displayPosts"
          :key="post.platform"
          type="button"
          class="gmkb-ai-results__tab"
          :class="{ 'gmkb-ai-results__tab--active': selectedIndex === displayPosts.indexOf(post) }"
          @click="handleSelect(displayPosts.indexOf(post))"
        >
          {{ post.platform }}
        </button>
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, reactive, watch, inject } from 'vue';
import { useAIGenerator } from '../../src/composables/useAIGenerator';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

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

// Form data
const formData = reactive({
  topic: '',
  platform: 'linkedin',
  callToAction: '',
  hashtags: 'yes',
  tone: 'professional'
});

// Use the AI generator composable
const {
  isGenerating,
  generatedContent,
  error,
  usageRemaining,
  resetTime,
  hasContent,
  generate,
  copyToClipboard
} = useAIGenerator('social_post');

// Selection state for integrated mode
const selectedIndex = ref(0);
const selectedPlatform = ref('linkedin');

/**
 * Social post formula for guidance panel
 */
const socialPostFormula = '<span class="generator__highlight">[HOOK]</span> + <span class="generator__highlight">[VALUE]</span> + <span class="generator__highlight">[ENGAGEMENT CTA]</span> = Viral Social Post';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Social Media Matters',
    description: 'Social media is where your audience gathers, engages, and makes decisions. A compelling post can position you as a thought leader, drive traffic to your offers, and build meaningful connections with your target market. Every post is an opportunity to provide value and strengthen your brand.'
  },
  {
    title: 'What Makes Posts Engage',
    description: 'The best social posts combine a strong hook that stops the scroll, valuable content that resonates with your audience\'s needs, and a clear call-to-action that drives engagement. Platform-specific formatting (hashtags, character limits, visual emphasis) amplifies your reach and impact.'
  },
  {
    title: 'Platform-Specific Tips',
    description: 'LinkedIn favors professional insights and thought leadership. Twitter/X rewards brevity and timely commentary. Instagram emphasizes visual storytelling and authentic connection. Facebook values community-building and conversation. Tailor your message to match platform culture and audience expectations.'
  }
];

/**
 * Example social posts for guidance panel
 */
const examples = [
  {
    title: 'Thought Leadership Post:',
    description: '🔥 Hot take: [Contrarian insight] \n\nMost people think [common belief]. But after [experience/data], I\'ve learned [truth]. \n\nHere\'s what actually works: [3 key points]\n\n👉 What\'s been your experience? Comment below.'
  },
  {
    title: 'Value-First Post:',
    description: 'Struggling with [common problem]? \n\nI used to [relate to problem]. Then I discovered [solution framework].\n\nHere are the 3 steps that changed everything:\n1. [Step one]\n2. [Step two]\n3. [Step three]\n\nTry this and let me know your results! 💪'
  }
];

/**
 * Parse generated content into posts array
 */
const displayPosts = computed(() => {
  if (!generatedContent.value) return [];

  // If it's already an array, return as-is
  if (Array.isArray(generatedContent.value)) {
    return generatedContent.value.map(item => ({
      platform: item.platform || formData.platform,
      content: item.content || item,
      characterCount: (item.content || item).length
    }));
  }

  // If it's a string, parse it
  const content = generatedContent.value;

  // Try to split by platform headers
  const platformPattern = /(?:^|\n)(?:#+\s*)?(LinkedIn|Twitter|Instagram|Facebook|Twitter\/X)(?:\s*Post)?:?\s*\n/gi;
  const matches = [...content.matchAll(platformPattern)];

  if (matches.length > 0) {
    const posts = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const platform = match[1].toLowerCase().replace(/\/x$/, '').trim();
      const startIdx = match.index + match[0].length;
      const endIdx = i < matches.length - 1 ? matches[i + 1].index : content.length;
      const postContent = content.substring(startIdx, endIdx).trim();

      posts.push({
        platform: platform === 'twitter' ? 'Twitter/X' : platform.charAt(0).toUpperCase() + platform.slice(1),
        content: postContent,
        characterCount: postContent.length
      });
    }
    return posts;
  }

  // Single post
  return [{
    platform: formData.platform === 'all' ? 'Multi-Platform' :
             formData.platform.charAt(0).toUpperCase() + formData.platform.slice(1),
    content: content,
    characterCount: content.length
  }];
});

/**
 * Current selected post
 */
const currentPost = computed(() => {
  if (displayPosts.value.length === 0) return null;

  // In standalone mode, use selectedPlatform
  if (props.mode === 'standalone') {
    const post = displayPosts.value.find(p =>
      p.platform.toLowerCase() === selectedPlatform.value.toLowerCase()
    );
    return post || displayPosts.value[0];
  }

  // In integrated mode, use selectedIndex
  return displayPosts.value[selectedIndex.value] || displayPosts.value[0];
});

/**
 * Check if multiple posts were generated
 */
const hasMultiplePosts = computed(() => {
  return displayPosts.value.length > 1;
});

/**
 * Display content for integrated mode
 */
const displayContent = computed(() => {
  return displayPosts.value.map(p => p.content);
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return formData.topic.trim().length > 0;
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate(formData, context);

    // Set initial selected platform based on what was generated
    if (displayPosts.value.length > 0) {
      selectedPlatform.value = displayPosts.value[0].platform.toLowerCase();
    }

    emit('generated', {
      content: generatedContent.value,
      platform: formData.platform
    });
  } catch (err) {
    console.error('[SocialPostGenerator] Generation failed:', err);
  }
};

/**
 * Handle selection (integrated mode)
 */
const handleSelect = (index) => {
  selectedIndex.value = index;
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  const content = currentPost.value?.content || generatedContent.value;
  if (content) {
    await navigator.clipboard.writeText(content);
  }
};

/**
 * Handle apply (integrated mode)
 */
const handleApply = () => {
  const content = currentPost.value?.content || generatedContent.value;

  emit('applied', {
    componentId: props.componentId,
    content,
    platform: formData.platform
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

/* Social Post Results */
.social-post-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.social-post-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.social-post-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.social-post-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.social-post-generator__tabs {
  display: flex;
  gap: var(--mkcg-space-xs, 8px);
  margin-bottom: var(--mkcg-space-md, 20px);
  flex-wrap: wrap;
}

.social-post-generator__tab {
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

.social-post-generator__tab:hover {
  border-color: var(--mkcg-primary, #1a9bdc);
}

.social-post-generator__tab--active {
  color: var(--mkcg-primary, #1a9bdc);
  background: rgba(26, 155, 220, 0.1);
  border-color: var(--mkcg-primary, #1a9bdc);
}

.social-post-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
}

.social-post-generator__platform-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--mkcg-space-xs, 8px);
  padding: 4px 12px;
  font-size: var(--mkcg-font-size-xs, 12px);
  font-weight: var(--mkcg-font-weight-medium, 500);
  text-transform: capitalize;
  color: var(--mkcg-primary, #1a9bdc);
  background: rgba(26, 155, 220, 0.1);
  border-radius: var(--mkcg-radius-sm, 4px);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.social-post-generator__platform-badge svg {
  width: 14px;
  height: 14px;
}

.social-post-generator__text {
  line-height: var(--mkcg-line-height-relaxed, 1.6);
  color: var(--mkcg-text-primary, #2c3e50);
  white-space: pre-wrap;
  margin-bottom: var(--mkcg-space-md, 20px);
}

.social-post-generator__meta {
  padding-top: var(--mkcg-space-md, 20px);
  border-top: 1px solid var(--mkcg-border-light, #e9ecef);
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.social-post-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles */
.gmkb-ai-results {
  margin-top: 16px;
}

.gmkb-ai-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  background: var(--gmkb-ai-bg, #fff);
  cursor: pointer;
}

.gmkb-ai-select:focus {
  outline: none;
  border-color: var(--gmkb-ai-primary, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.gmkb-ai-results__tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
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
