<template>
  <SimpleGenerator
    type="seo_optimizer"
    :config="config"
    :mode="mode"
    :component-id="componentId"
    @applied="$emit('applied', $event)"
    @generated="$emit('generated', $event)"
  />
</template>

<script setup>
import SimpleGenerator from '@ai/SimpleGenerator.vue';

defineProps({
  mode: { type: String, default: 'standalone' },
  componentId: { type: String, default: null }
});

defineEmits(['applied', 'generated']);

const config = {
  title: 'SEO Content Optimizer',
  description: 'Optimize your content for search engines with keywords and meta descriptions.',
  buttonText: 'Optimize for SEO',
  loadingText: 'Analyzing and optimizing...',
  resultFormat: 'text',
  showTone: false,
  fields: [
    {
      name: 'content',
      label: 'Content to Optimize',
      type: 'textarea',
      placeholder: 'Paste your content here (blog post, page content, etc.)',
      required: true,
      rows: 5
    },
    {
      name: 'targetKeyword',
      label: 'Target Keyword',
      type: 'text',
      placeholder: 'e.g., executive coaching services',
      required: true
    },
    {
      name: 'outputType',
      label: 'What Do You Need?',
      type: 'select',
      options: [
        { value: 'meta', label: 'Meta Title & Description' },
        { value: 'headers', label: 'Optimized Headers (H1, H2, etc.)' },
        { value: 'full', label: 'Full SEO Analysis & Suggestions' },
        { value: 'keywords', label: 'Related Keywords List' }
      ],
      default: 'full'
    }
  ]
};
</script>
