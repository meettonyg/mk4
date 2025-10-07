<template>
  <div class="gmkb-video-intro-component" :data-component-id="componentId">
    <div class="video-container">
      <h2 v-if="title" class="video-title">{{ title }}</h2>
      <p v-if="description" class="video-description">{{ description }}</p>
      
      <div class="video-wrapper">
        <!-- YouTube embed -->
        <iframe v-if="isYouTube"
          :src="youtubeEmbedUrl"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        
        <!-- Vimeo embed -->
        <iframe v-else-if="isVimeo"
          :src="vimeoEmbedUrl"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
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
          <p>Video content will appear here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'VideoIntroRenderer',
  props: {
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    // Store and composables
    const store = useMediaKitStore();
    const { rawPodsData, fullName } = usePodsData();
    
    // Computed properties
    const title = computed(() => {
      if (props.data?.title) return props.data.title;
      // ROOT FIX: Use Pods data as fallback
      if (fullName.value) return `Meet ${fullName.value}`;
      return 'Watch My Introduction';
    });
    
    const description = computed(() => {
      return props.data?.description || '';
    });
    
    const videoUrl = computed(() => {
      // Check component data first
      if (props.data?.video_url || props.data?.url) {
        return props.data.video_url || props.data.url;
      }
      // ROOT FIX: Check Pods data for video fields
      return rawPodsData.value?.intro_video_url || 
             rawPodsData.value?.video_url || 
             rawPodsData.value?.youtube_url || '';
    });
    
    const thumbnailUrl = computed(() => {
      // Check component data first
      if (props.data?.thumbnail || props.data?.poster) {
        return props.data.thumbnail || props.data.poster;
      }
      // ROOT FIX: Check Pods data for thumbnail
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
      // ROOT FIX: No polling or global checking - use event-driven approach
      if (store.components[props.componentId]) {
        console.log('VideoIntro component mounted:', props.componentId);
        
        // Check if using Pods data
        const usingPodsData = !props.data.video_url && rawPodsData.value?.intro_video_url;
        
        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'video-intro',
            id: props.componentId,
            podsDataUsed: usingPodsData
          }
        }));
      }
    });
    
    return {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      isYouTube,
      isVimeo,
      youtubeEmbedUrl,
      vimeoEmbedUrl
    };
  }
};
</script>

<style scoped>
.gmkb-video-intro-component {
  padding: 2rem;
  background: var(--gmkb-color-surface, #fff);
}

.video-container {
  max-width: 900px;
  margin: 0 auto;
}

.video-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-xl, 2rem);
  margin-bottom: 1rem;
}

.video-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  margin-bottom: 2rem;
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0,0,0,0.1));
}

.video-wrapper iframe,
.video-wrapper video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--gmkb-color-background, #f8f9fa);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.video-placeholder p {
  color: var(--gmkb-color-text-light, #666);
}
</style>
