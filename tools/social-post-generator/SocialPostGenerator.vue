<template>
  <SimpleGenerator
    type="social_post"
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
  title: 'Social Post Generator',
  description: 'Create engaging social media posts for multiple platforms.',
  buttonText: 'Generate Posts',
  loadingText: 'Creating your posts...',
  resultFormat: 'cards',
  showTone: true,
  fields: [
    {
      name: 'topic',
      label: 'Post Topic',
      type: 'textarea',
      placeholder: 'What do you want to post about?',
      required: true,
      rows: 2
    },
    {
      name: 'platform',
      label: 'Platform',
      type: 'select',
      options: [
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'twitter', label: 'Twitter/X' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'all', label: 'All Platforms' }
      ],
      default: 'linkedin'
    },
    {
      name: 'callToAction',
      label: 'Call to Action',
      type: 'text',
      placeholder: 'e.g., Comment below, Visit my website',
      required: false
    },
    {
      name: 'hashtags',
      label: 'Include Hashtags?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes, include relevant hashtags' },
        { value: 'no', label: 'No hashtags' }
      ],
      default: 'yes'
    }
  ]
};
</script>
