<template>
  <SimpleGenerator
    type="blog"
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
  title: 'Blog Post Generator',
  description: 'Create engaging blog content that showcases your expertise.',
  buttonText: 'Generate Blog Post',
  loadingText: 'Writing your blog post...',
  resultFormat: 'text',
  showTone: true,
  fields: [
    {
      name: 'topic',
      label: 'Blog Topic',
      type: 'text',
      placeholder: 'e.g., 5 Ways to Improve Team Communication',
      required: true
    },
    {
      name: 'keyPoints',
      label: 'Key Points to Cover',
      type: 'textarea',
      placeholder: 'What main points should the blog address?',
      required: true,
      rows: 3
    },
    {
      name: 'audience',
      label: 'Target Audience',
      type: 'text',
      placeholder: 'e.g., business owners, HR managers',
      required: false
    },
    {
      name: 'length',
      label: 'Post Length',
      type: 'select',
      options: [
        { value: 'short', label: 'Short (300-500 words)' },
        { value: 'medium', label: 'Medium (600-900 words)' },
        { value: 'long', label: 'Long (1000-1500 words)' }
      ],
      default: 'medium'
    }
  ]
};
</script>
