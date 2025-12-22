<template>
  <SimpleGenerator
    type="email"
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
  title: 'Email Writer',
  description: 'Create professional emails for outreach, follow-ups, and more.',
  buttonText: 'Generate Email',
  loadingText: 'Writing your email...',
  resultFormat: 'text',
  showTone: true,
  fields: [
    {
      name: 'purpose',
      label: 'Email Purpose',
      type: 'select',
      options: [
        { value: 'outreach', label: 'Cold Outreach' },
        { value: 'followup', label: 'Follow-Up' },
        { value: 'introduction', label: 'Self Introduction' },
        { value: 'pitch', label: 'Pitch/Proposal' },
        { value: 'thank_you', label: 'Thank You' },
        { value: 'booking', label: 'Booking Request' }
      ],
      default: 'outreach'
    },
    {
      name: 'recipient',
      label: 'Who Are You Writing To?',
      type: 'text',
      placeholder: 'e.g., podcast host, potential client, event organizer',
      required: true
    },
    {
      name: 'context',
      label: 'Context/Details',
      type: 'textarea',
      placeholder: 'What do they need to know? What are you asking for?',
      required: true,
      rows: 3
    },
    {
      name: 'aboutYou',
      label: 'About You (Brief)',
      type: 'textarea',
      placeholder: 'A brief intro about yourself for context',
      required: false,
      rows: 2
    }
  ]
};
</script>
