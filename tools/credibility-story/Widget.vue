<template>
  <SimpleGenerator
    type="credibility_story"
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
  title: 'Credibility Story Generator',
  description: 'Build stories that establish your expertise and authority.',
  buttonText: 'Generate Credibility Story',
  loadingText: 'Crafting your credibility narrative...',
  resultFormat: 'text',
  showTone: true,
  fields: [
    {
      name: 'expertise',
      label: 'Area of Expertise',
      type: 'text',
      placeholder: 'e.g., leadership development, digital marketing',
      required: true
    },
    {
      name: 'experience',
      label: 'Key Experience',
      type: 'textarea',
      placeholder: 'A specific experience that demonstrates your expertise',
      required: true,
      rows: 3
    },
    {
      name: 'lesson',
      label: 'Key Lesson/Insight',
      type: 'textarea',
      placeholder: 'What insight did you gain from this experience?',
      hint: 'This becomes the takeaway for your audience.',
      required: true,
      rows: 2
    }
  ]
};
</script>
