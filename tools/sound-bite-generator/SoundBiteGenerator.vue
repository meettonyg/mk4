<template>
  <SimpleGenerator
    type="sound_bite"
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
  title: 'Sound Bite Generator',
  description: 'Create memorable quotes and one-liners for media appearances.',
  buttonText: 'Generate Sound Bites',
  loadingText: 'Creating memorable quotes...',
  resultFormat: 'cards',
  showTone: false,
  fields: [
    {
      name: 'topic',
      label: 'Topic or Theme',
      type: 'text',
      placeholder: 'e.g., leadership, innovation, work-life balance',
      required: true
    },
    {
      name: 'expertise',
      label: 'Your Expertise/Perspective',
      type: 'textarea',
      placeholder: 'What unique perspective do you bring to this topic?',
      hint: 'Your sound bites will reflect your unique point of view.',
      required: true,
      rows: 3
    },
    {
      name: 'context',
      label: 'Media Context',
      type: 'select',
      options: [
        { value: 'podcast', label: 'Podcast Interview' },
        { value: 'news', label: 'News/Press' },
        { value: 'social', label: 'Social Media' },
        { value: 'keynote', label: 'Keynote/Speech' }
      ],
      default: 'podcast'
    }
  ]
};
</script>
