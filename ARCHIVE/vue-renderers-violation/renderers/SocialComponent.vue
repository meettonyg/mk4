<template>
  <div class="social-component">
    <h2 v-if="showTitle">{{ title }}</h2>
    <div class="social-links">
      <a v-for="(link, platform) in socialLinks" 
         :key="platform"
         :href="link"
         target="_blank"
         class="social-link"
         :title="platform">
        {{ getSocialIcon(platform) }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: String,
  data: { type: Object, default: () => ({}) },
  props: { type: Object, default: () => ({}) },
  settings: { type: Object, default: () => ({}) }
});

const title = computed(() => props.data.title || 'Connect With Me');
const showTitle = computed(() => props.settings.showTitle ?? true);

const socialLinks = computed(() => {
  return props.data.social || props.props.social || {
    twitter: '',
    linkedin: '',
    facebook: '',
    instagram: ''
  };
});

const getSocialIcon = (platform) => {
  const icons = {
    twitter: '𝕏',
    linkedin: '🔗',
    facebook: '📘',
    instagram: '📷',
    youtube: '📺',
    tiktok: '🎵'
  };
  return icons[platform.toLowerCase()] || '🔗';
};
</script>

<style scoped>
.social-component {
  padding: 30px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  text-align: center;
}

.social-component h2 {
  color: var(--gmkb-color-heading, #e2e8f0);
  margin-bottom: 20px;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.social-link {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  font-size: 1.5rem;
  text-decoration: none;
  transition: all 0.3s;
}

.social-link:hover {
  background: var(--gmkb-color-primary, #3b82f6);
  transform: scale(1.1);
}
</style>
