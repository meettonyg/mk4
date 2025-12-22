<template>
  <SimpleGenerator
    type="brand_story"
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
  title: 'Brand Story Generator',
  description: 'Craft your compelling origin story that connects with your audience.',
  buttonText: 'Generate Brand Story',
  loadingText: 'Crafting your story...',
  resultFormat: 'text',
  showTone: true,
  fields: [
    {
      name: 'background',
      label: 'Your Background',
      type: 'textarea',
      placeholder: 'Where did you start? What was your journey?',
      required: true,
      rows: 3
    },
    {
      name: 'transformation',
      label: 'Your Transformation Moment',
      type: 'textarea',
      placeholder: 'What pivotal moment led you to do what you do now?',
      hint: 'The turning point that shaped your mission.',
      required: true,
      rows: 3
    },
    {
      name: 'mission',
      label: 'Your Mission',
      type: 'textarea',
      placeholder: 'Why do you do what you do? Who do you serve?',
      required: false,
      rows: 2
    }
  ]
};
</script>
