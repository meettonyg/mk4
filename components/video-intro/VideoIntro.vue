<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root video-intro-component"
  >
    <h2 v-if="title" class="video-title">{{ title }}</h2>
    <p v-if="description" class="video-description">{{ description }}</p>
    
    <div class="video-wrapper">
      <!-- YouTube embed -->
      <iframe v-if="isYouTube"
        :src="youtubeEmbedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        title="YouTube video player"
      ></iframe>
      
      <!-- Vimeo embed -->
      <iframe v-else-if="isVimeo"
        :src="vimeoEmbedUrl"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
        title="Vimeo video player"
      ></iframe>
      
      <!-- Regular video -->
      <video v-else-if="videoUrl"
        controls
        :poster="thumbnailUrl"
      >
        <source :src="videoUrl" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      
      <!-- Fallback placeholder -->
      <div v-else class="video-placeholder">
        <div class="placeholder-icon">▶️</div>
        <p>Add your video URL to display content here</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

const props = defineProps({
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
  isEditing: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

// Store and composables
const store = useMediaKitStore();
const { rawPodsData, fullName } = usePodsData();

// Extract data from both data and props for compatibility
const title = computed(() => {
  if (props.data?.title || props.props?.title) {
    return props.data?.title || props.props?.title;
  }
  if (fullName.value) return `Meet ${fullName.value}`;
  return 'Watch My Introduction';
});

const description = computed(() => props.data?.description || props.props?.description || '');

const videoUrl = computed(() => {
  // Check component data first
  const url = props.data?.video_url || props.data?.url || 
               props.props?.video_url || props.props?.url;
  if (url) return url;
  
  // Check Pods data for video fields
  return rawPodsData.value?.intro_video_url || 
         rawPodsData.value?.video_url || 
         rawPodsData.value?.youtube_url || '';
});

const thumbnailUrl = computed(() => {
  const thumb = props.data?.thumbnail || props.data?.poster || 
                props.props?.thumbnail || props.props?.poster;
  if (thumb) return thumb;
  
  return rawPodsData.value?.video_thumbnail || '';
});

const isYouTube = computed(() => {
  return videoUrl.value.includes('youtube.com') || videoUrl.value.includes('youtu.be');
});

const isVimeo = computed(() => {
  return videoUrl.value.includes('vimeo.com');
});

const youtubeEmbedUrl = computed(() => {
  if (!isYouTube.value) return '';
  
  let videoId = '';
  if (videoUrl.value.includes('youtube.com/watch?v=')) {
    videoId = videoUrl.value.split('watch?v=')[1].split('&')[0];
  } else if (videoUrl.value.includes('youtu.be/')) {
    videoId = videoUrl.value.split('youtu.be/')[1].split('?')[0];
  } else if (videoUrl.value.includes('youtube.com/embed/')) {
    videoId = videoUrl.value.split('youtube.com/embed/')[1].split('?')[0];
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
});

const vimeoEmbedUrl = computed(() => {
  if (!isVimeo.value) return '';
  
  const matches = videoUrl.value.match(/vimeo\.com\/(\d+)/);
  const videoId = matches ? matches[1] : '';
  return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
});

// Lifecycle
onMounted(() => {
  if (store.components[props.componentId]) {
    document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
      detail: {
        type: 'video-intro',
        id: props.componentId,
        podsDataUsed: !props.data.video_url && !!rawPodsData.value?.intro_video_url
      }
    }));
  }
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.video-intro-component {
  /* Styles applied via inline styles from ComponentStyleService */
  max-width: 900px;
  margin: 0 auto;
}

.video-title {
  text-align: center;
  /* font-size and font-weight inherited from component-root */
  margin: 0 0 1rem 0;
  color: inherit;
}

.video-description {
  text-align: center;
  opacity: 0.8; /* Use opacity instead of fixed color */
  margin: 0 0 2rem 0;
  /* line-height inherited from component-root */
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  border-radius: var(--component-border-radius, 8px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.video-wrapper iframe,
.video-wrapper video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: var(--component-border-radius, 8px);
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--component-border-radius, 8px);
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.video-placeholder p {
  opacity: 0.8; /* Use opacity instead of fixed color */
  text-align: center;
  padding: 0 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .video-title {
    font-size: 1.5rem;
  }
  
  .placeholder-icon {
    font-size: 3rem;
  }
}
</style>
