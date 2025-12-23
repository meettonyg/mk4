<template>
  <SimpleGenerator
    type="newsletter"
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
  title: 'Newsletter Writer',
  description: 'Create engaging newsletters that nurture your audience.',
  buttonText: 'Generate Newsletter',
  loadingText: 'Writing your newsletter...',
  resultFormat: 'text',
  showTone: true,
  fields: [
    {
      name: 'topic',
      label: 'Main Topic',
      type: 'text',
      placeholder: 'What is this newsletter about?',
      required: true
    },
    {
      name: 'keyPoints',
      label: 'Key Points/Updates',
      type: 'textarea',
      placeholder: 'What do you want to share with your readers?',
      required: true,
      rows: 3
    },
    {
      name: 'callToAction',
      label: 'Call to Action',
      type: 'text',
      placeholder: 'e.g., Reply to this email, Register for webinar',
      required: false
    },
    {
      name: 'style',
      label: 'Newsletter Style',
      type: 'select',
      options: [
        { value: 'educational', label: 'Educational/Tips' },
        { value: 'personal', label: 'Personal Update' },
        { value: 'curated', label: 'Curated Content' },
        { value: 'promotional', label: 'Promotional' }
      ],
      default: 'educational'
    }
  ]
};
</script>
