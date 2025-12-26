<template>
  <SimpleGenerator
    type="persona"
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
  title: 'Ideal Client Persona Generator',
  description: 'Define your ideal client avatar with detailed demographics and psychographics.',
  buttonText: 'Generate Persona',
  loadingText: 'Building your ideal client profile...',
  resultFormat: 'text',
  showTone: false,
  fields: [
    {
      name: 'services',
      label: 'Your Services/Offers',
      type: 'textarea',
      placeholder: 'What do you offer? What problems do you solve?',
      required: true,
      rows: 3
    },
    {
      name: 'industry',
      label: 'Industry/Niche',
      type: 'text',
      placeholder: 'e.g., tech startups, healthcare, coaching',
      required: false
    },
    {
      name: 'currentClients',
      label: 'Current Best Clients',
      type: 'textarea',
      placeholder: 'Describe your best current clients (optional)',
      hint: 'This helps create a more accurate persona.',
      required: false,
      rows: 2
    }
  ]
};
</script>
