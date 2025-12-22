<template>
  <SimpleGenerator
    type="podcast_notes"
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
  title: 'Podcast Show Notes Generator',
  description: 'Create comprehensive show notes for podcast episodes.',
  buttonText: 'Generate Show Notes',
  loadingText: 'Writing show notes...',
  resultFormat: 'text',
  showTone: false,
  fields: [
    {
      name: 'episodeTitle',
      label: 'Episode Title',
      type: 'text',
      placeholder: 'e.g., Ep 42: How to Scale Your Business',
      required: true
    },
    {
      name: 'guestName',
      label: 'Guest Name (if applicable)',
      type: 'text',
      placeholder: 'e.g., Jane Smith',
      required: false
    },
    {
      name: 'topicsCovered',
      label: 'Topics Covered',
      type: 'textarea',
      placeholder: 'What topics were discussed in this episode?',
      required: true,
      rows: 3
    },
    {
      name: 'keyTakeaways',
      label: 'Key Takeaways',
      type: 'textarea',
      placeholder: 'What are the main insights or action items?',
      required: false,
      rows: 2
    },
    {
      name: 'resources',
      label: 'Resources Mentioned',
      type: 'textarea',
      placeholder: 'Books, tools, links mentioned in the episode',
      required: false,
      rows: 2
    }
  ]
};
</script>
