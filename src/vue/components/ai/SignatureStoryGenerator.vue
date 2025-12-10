<template>
  <SimpleGenerator
    type="signature_story"
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
  title: 'Signature Story Generator',
  description: 'Create a powerful client success story that showcases your impact.',
  buttonText: 'Generate Signature Story',
  loadingText: 'Building your success story...',
  resultFormat: 'text',
  showTone: true,
  fields: [
    {
      name: 'clientBackground',
      label: 'Client Background',
      type: 'textarea',
      placeholder: 'Who was the client? What situation were they in?',
      required: true,
      rows: 2
    },
    {
      name: 'challenge',
      label: 'The Challenge',
      type: 'textarea',
      placeholder: 'What problem were they facing?',
      required: true,
      rows: 2
    },
    {
      name: 'solution',
      label: 'Your Solution',
      type: 'textarea',
      placeholder: 'How did you help them?',
      required: true,
      rows: 2
    },
    {
      name: 'results',
      label: 'The Results',
      type: 'textarea',
      placeholder: 'What outcomes did they achieve?',
      hint: 'Include specific numbers or metrics if possible.',
      required: true,
      rows: 2
    }
  ]
};
</script>
