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
  computed: {
    title() {
      return this.data.title || 'Watch My Introduction'
    },
    description() {
      return this.data.description || ''
    },
    videoUrl() {
      return this.data.video_url || this.data.url || ''
    },
    thumbnailUrl() {
      return this.data.thumbnail || this.data.poster || ''
    },
    isYouTube() {
      return this.videoUrl.includes('youtube.com') || this.videoUrl.includes('youtu.be')
    },
    isVimeo() {
      return this.videoUrl.includes('vimeo.com')
    },
    youtubeEmbedUrl() {
      if (!this.isYouTube) return ''
      
      let videoId = ''
      if (this.videoUrl.includes('youtube.com/watch?v=')) {
        videoId = this.videoUrl.split('watch?v=')[1].split('&')[0]
      } else if (this.videoUrl.includes('youtu.be/')) {
        videoId = this.videoUrl.split('youtu.be/')[1].split('?')[0]
      }
      
      return `https://www.youtube.com/embed/${videoId}`
    },
    vimeoEmbedUrl() {
      if (!this.isVimeo) return ''
      
      const videoId = this.videoUrl.split('vimeo.com/')[1].split('?')[0]
      return `https://player.vimeo.com/video/${videoId}`
    }
  }
}
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
