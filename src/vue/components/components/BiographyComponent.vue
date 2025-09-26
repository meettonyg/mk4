<template>
  <div class="biography-component">
    <h2 class="bio-title">{{ title || 'Biography' }}</h2>
    <div class="bio-content" v-html="formattedContent"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  content: String,
  bio: String
});

const formattedContent = computed(() => {
  const text = props.content || props.bio || 'Biography content will appear here.';
  // Convert line breaks to paragraphs
  return text.split('\n\n').map(p => `<p>${p}</p>`).join('');
});
</script>

<style scoped>
.biography-component {
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.bio-title {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.bio-content :deep(p) {
  margin: 0 0 12px;
  line-height: 1.6;
  color: #4b5563;
}

.bio-content :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
