<template>
  <SimpleGenerator
    type="elevator_pitch"
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
  title: 'Elevator Pitch Generator',
  description: 'Create a compelling 30-60 second pitch that captures attention.',
  buttonText: 'Generate Pitch',
  loadingText: 'Crafting your pitch...',
  resultFormat: 'text',
  showTone: true,
  fields: [
    {
      name: 'name',
      label: 'Your Name',
      type: 'text',
      placeholder: 'e.g., Jane Smith',
      required: false
    },
    {
      name: 'authorityHook',
      label: 'What You Do',
      type: 'textarea',
      placeholder: 'Describe who you help and what transformation you provide...',
      hint: 'This will be the foundation of your pitch.',
      required: true,
      rows: 3
    },
    {
      name: 'audience',
      label: 'Target Audience',
      type: 'text',
      placeholder: 'e.g., startup founders, busy professionals',
      required: false
    },
    {
      name: 'duration',
      label: 'Pitch Length',
      type: 'select',
      options: [
        { value: '30', label: '30 seconds (short)' },
        { value: '60', label: '60 seconds (standard)' },
        { value: '90', label: '90 seconds (extended)' }
      ],
      default: '60'
    }
  ]
};
</script>
