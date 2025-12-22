<template>
  <SimpleGenerator
    type="interview_prep"
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
  title: 'Interview Prep Generator',
  description: 'Prepare talking points and key messages for your next interview.',
  buttonText: 'Generate Interview Prep',
  loadingText: 'Preparing your talking points...',
  resultFormat: 'text',
  showTone: true,
  fields: [
    {
      name: 'showName',
      label: 'Show/Publication Name',
      type: 'text',
      placeholder: 'e.g., The Tim Ferriss Show, Forbes',
      required: false
    },
    {
      name: 'topics',
      label: 'Topics to Discuss',
      type: 'textarea',
      placeholder: 'What topics will you be discussing?',
      required: true,
      rows: 2
    },
    {
      name: 'keyMessages',
      label: 'Key Messages',
      type: 'textarea',
      placeholder: 'What are the main points you want to convey?',
      hint: 'These will be woven into your talking points.',
      required: true,
      rows: 3
    },
    {
      name: 'callToAction',
      label: 'Call to Action',
      type: 'text',
      placeholder: 'What do you want listeners to do after?',
      required: false
    }
  ]
};
</script>
