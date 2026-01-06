<template>
  <div class="gmkb-standalone-scope">
    <EmbeddedToolWrapper
      :intents="intents"
      :default-heading="defaultHeading"
      :default-description="defaultDescription"
      :is-generating="isGenerating"
      :can-generate="canGenerate"
      :generate-button-text="buttonText"
      :preview-content="previewContent"
      :result-label="resultLabel"
      :content-noun="contentNoun"
      :preview-label="previewLabel"
      :tool-slug="toolSlug"
      :is-logged-in="isLoggedIn"
      :supports-profile-save="supportsProfileSave"
      :related-tools="relatedTools"
      :testimonial="testimonial"
      register-url="/register/"
      :social-login-html="socialLoginHtml"
      @intent-change="handleIntentChange"
      @generate="handleGenerate"
      @save-click="handleSaveClick"
      @gate-shown="handleGateShown"
      @gate-signup="handleGateSignup"
    >
      <template #form="{ profileData }">
        <component
          :is="generatorComponent"
          ref="generator"
          mode="embedded"
          :intent="currentIntent"
          :profile-data="profileData"
          @preview-update="handlePreviewUpdate"
          @generated="handleGenerated"
          @update:can-generate="handleCanGenerateUpdate"
        />
      </template>
      <template #preview>
        <p v-if="previewContent" class="preview-hook" v-html="previewContent"></p>
      </template>
    </EmbeddedToolWrapper>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import EmbeddedToolWrapper from './EmbeddedToolWrapper.vue';
import { buildRelatedTools } from '../index.js';

const props = defineProps({
  toolSlug: { type: String, required: true },
  intents: { type: Array, default: () => [] },
  meta: { type: Object, default: () => ({}) },
  generatorComponent: { type: Object, required: true },
  isLoggedIn: { type: Boolean, default: false },
  socialLoginHtml: { type: String, default: '' }
});

const emit = defineEmits(['generated', 'save-click', 'gate-shown', 'gate-signup']);

// State
const currentIntent = ref(props.intents[0] || null);
const previewContent = ref('');
const isGenerating = ref(false);
const canGenerate = ref(false);
const generator = ref(null);

// Computed from meta
const supportsProfileSave = computed(() => props.meta.supportsProfileSave ?? true);
const buttonText = computed(() => props.meta.buttonText || `Generate ${props.meta.name || 'Content'}`);
const testimonial = computed(() => props.meta.socialProof?.testimonial || null);
const relatedTools = computed(() => buildRelatedTools(props.meta.relatedToolSlugs || [], props.toolSlug));

// Tool display name derivatives
const toolDisplayName = computed(() => props.meta.name || 'Content');
const contentNoun = computed(() =>
  toolDisplayName.value.toLowerCase()
    .replace(' generator', '')
    .replace(' builder', '')
    .replace(' writer', '')
);
const resultLabel = computed(() => `Your ${toolDisplayName.value}`);
const previewLabel = computed(() => `Sample ${toolDisplayName.value}`);
const defaultHeading = computed(() => props.meta.hero?.contextHeading || `Create your ${contentNoun.value}`);
const defaultDescription = computed(() => props.meta.hero?.contextDescription || '');

// Event handlers
function handleIntentChange(intent) {
  currentIntent.value = intent;
}

function handlePreviewUpdate({ previewHtml }) {
  previewContent.value = previewHtml;
}

function handleGenerate() {
  if (generator.value?.handleGenerate) {
    isGenerating.value = true;
    generator.value.handleGenerate()
      .catch((err) => {
        console.error('[EmbeddedToolApp] Generation failed:', err);
        isGenerating.value = false;
      });
  }
}

function handleGenerated(data) {
  isGenerating.value = false;

  // Update preview content based on generated data
  if (data) {
    // Handle topics array
    if (data.topics && Array.isArray(data.topics)) {
      previewContent.value = data.topics
        .map((topic, i) => `<strong>${i + 1}.</strong> ${topic}`)
        .join('<br><br>');
    }
    // Handle single content (hook, bio, tagline, etc.)
    else if (data.hook || data.content || data.result) {
      previewContent.value = data.hook || data.content || data.result;
    }
    // Handle questions array
    else if (data.questions && Array.isArray(data.questions)) {
      previewContent.value = data.questions
        .map((q, i) => `<strong>${i + 1}.</strong> ${q}`)
        .join('<br><br>');
    }
  }

  emit('generated', data);
}

function handleCanGenerateUpdate(value) {
  canGenerate.value = value;
}

function handleSaveClick() {
  emit('save-click', { tool: props.toolSlug });
}

function handleGateShown(data) {
  emit('gate-shown', { tool: props.toolSlug, ...data });
}

function handleGateSignup() {
  emit('gate-signup', { tool: props.toolSlug });
}
</script>
