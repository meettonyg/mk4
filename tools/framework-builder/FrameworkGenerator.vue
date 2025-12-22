<template>
  <SimpleGenerator
    type="framework"
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
  title: 'Framework Builder',
  description: 'Create a proprietary methodology or framework that showcases your unique approach.',
  buttonText: 'Generate Framework',
  loadingText: 'Building your framework...',
  resultFormat: 'text',
  showTone: false,
  fields: [
    {
      name: 'problem',
      label: 'Problem You Solve',
      type: 'textarea',
      placeholder: 'What problem does your framework address?',
      required: true,
      rows: 2
    },
    {
      name: 'approach',
      label: 'Your Approach',
      type: 'textarea',
      placeholder: 'How do you solve this problem? What are your key steps?',
      required: true,
      rows: 3
    },
    {
      name: 'outcome',
      label: 'Desired Outcome',
      type: 'textarea',
      placeholder: 'What results does following your framework produce?',
      required: true,
      rows: 2
    },
    {
      name: 'steps',
      label: 'Number of Steps',
      type: 'select',
      options: [
        { value: '3', label: '3 Steps' },
        { value: '4', label: '4 Steps' },
        { value: '5', label: '5 Steps' },
        { value: '7', label: '7 Steps' }
      ],
      default: '5'
    }
  ]
};
</script>
