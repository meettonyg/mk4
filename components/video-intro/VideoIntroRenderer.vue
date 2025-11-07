<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--videointro" :data-component-id="componentId">
    <div class="component-root video-intro-content">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    <div class="video-container">
      <iframe
        v-if="videoUrl"
        :src="videoUrl"
        frameborder="0"
        allowfullscreen
        class="video-embed"
      ></iframe>
      <p v-else class="video-placeholder">Add your video URL</p>
    </div>
    <p v-if="description" class="video-description">{{ description }}</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'VideoIntroRenderer',
  props: {
    // STANDARD INTERFACE: All components accept the same props structure
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    },
    props: {
      type: Object,
      default: () => ({})
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    // Optional editing state
    isEditing: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // COMPOSITION API: Access Pods data via composable
    const podsData = usePodsData();
    
    // TITLE: Component data > default
    const title = computed(() => {
      return props.data?.title || '';
    });
    
    // VIDEO URL: Priority is component data > Pods fallback > empty
    const videoUrl = computed(() => {
      // Priority 1: Component data (user customization)
      if (props.data?.videoUrl) {
        return props.data.videoUrl;
      }
      
      // Priority 2: Pods data (from database)
      if (podsData.rawPodsData?.value) {
        const rawData = podsData.rawPodsData.value;
        // Check for video intro URL in Pods
        return rawData.video_intro_url || rawData.intro_video_url || '';
      }
      
      // Priority 3: Empty
      return '';
    });
    
    // DESCRIPTION: Component data > Pods fallback > empty
    const description = computed(() => {
      // Priority 1: Component data
      if (props.data?.description) {
        return props.data.description;
      }
      
      // Priority 2: Pods data
      if (podsData.rawPodsData?.value) {
        const rawData = podsData.rawPodsData.value;
        return rawData.video_intro_description || '';
      }
      
      // Priority 3: Empty
      return '';
    });
    
    return {
      title,
      videoUrl,
      description
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles */
</style>
