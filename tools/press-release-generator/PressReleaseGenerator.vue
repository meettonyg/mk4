<template>
  <SimpleGenerator
    type="press_release"
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
  title: 'Press Release Generator',
  description: 'Create professional press releases for announcements and news.',
  buttonText: 'Generate Press Release',
  loadingText: 'Writing your press release...',
  resultFormat: 'text',
  showTone: false,
  fields: [
    {
      name: 'headline',
      label: 'Announcement Headline',
      type: 'text',
      placeholder: 'e.g., Company X Launches Revolutionary New Product',
      required: true
    },
    {
      name: 'announcement',
      label: 'What Are You Announcing?',
      type: 'textarea',
      placeholder: 'Describe the news, launch, event, or milestone...',
      required: true,
      rows: 3
    },
    {
      name: 'quotes',
      label: 'Key Quote',
      type: 'textarea',
      placeholder: 'A quote from you or a key stakeholder',
      required: false,
      rows: 2
    },
    {
      name: 'companyInfo',
      label: 'Company/Person Background',
      type: 'textarea',
      placeholder: 'Brief description of who is making the announcement',
      hint: 'This becomes the boilerplate section.',
      required: true,
      rows: 2
    }
  ]
};
</script>
