<template>
  <SimpleGenerator
    type="youtube_description"
    :config="config"
    :mode="mode"
    :component-id="componentId"
    @applied="$emit('applied', $event)"
    @generated="$emit('generated', $event)"
  />
</template>

<script setup>
import SimpleGenerator from './SimpleGenerator.vue';

defineProps({
  mode: { type: String, default: 'standalone' },
  componentId: { type: String, default: null }
});

defineEmits(['applied', 'generated']);

const config = {
  title: 'YouTube Description Generator',
  description: 'Create SEO-optimized YouTube video descriptions.',
  buttonText: 'Generate Description',
  loadingText: 'Writing your description...',
  resultFormat: 'text',
  showTone: false,
  fields: [
    {
      name: 'videoTitle',
      label: 'Video Title',
      type: 'text',
      placeholder: 'What is your video called?',
      required: true
    },
    {
      name: 'videoContent',
      label: 'Video Content Summary',
      type: 'textarea',
      placeholder: 'What is the video about? Key topics covered?',
      required: true,
      rows: 3
    },
    {
      name: 'timestamps',
      label: 'Include Timestamps?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes, generate timestamps' },
        { value: 'no', label: 'No timestamps' }
      ],
      default: 'yes'
    },
    {
      name: 'links',
      label: 'Links to Include',
      type: 'textarea',
      placeholder: 'Any links you want mentioned (website, social, etc.)',
      required: false,
      rows: 2
    }
  ]
};
</script>
