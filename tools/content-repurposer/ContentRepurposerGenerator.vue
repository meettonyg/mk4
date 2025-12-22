<template>
  <SimpleGenerator
    type="content_repurpose"
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
  title: 'Content Repurposer',
  description: 'Transform existing content into new formats for different platforms.',
  buttonText: 'Repurpose Content',
  loadingText: 'Transforming your content...',
  resultFormat: 'text',
  showTone: false,
  fields: [
    {
      name: 'originalContent',
      label: 'Original Content',
      type: 'textarea',
      placeholder: 'Paste your original content here (blog post, article, transcript, etc.)',
      required: true,
      rows: 5
    },
    {
      name: 'targetFormat',
      label: 'Target Format',
      type: 'select',
      options: [
        { value: 'social_posts', label: 'Social Media Posts' },
        { value: 'email', label: 'Email Newsletter' },
        { value: 'linkedin_article', label: 'LinkedIn Article' },
        { value: 'twitter_thread', label: 'Twitter/X Thread' },
        { value: 'video_script', label: 'Video Script' },
        { value: 'podcast_outline', label: 'Podcast Outline' }
      ],
      default: 'social_posts'
    }
  ]
};
</script>
