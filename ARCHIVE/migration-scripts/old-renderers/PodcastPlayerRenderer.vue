<template>
  <div class="gmkb-podcast-player-component" :data-component-id="componentId">
    <div class="podcast-container">
      <h2 v-if="title" class="podcast-title">{{ title }}</h2>
      <p v-if="description" class="podcast-description">{{ description }}</p>
      
      <div class="podcast-episodes">
        <div
          v-for="(episode, index) in episodes"
          :key="index"
          class="episode-card"
        >
          <div class="episode-header">
            <h3 class="episode-title">{{ episode.title }}</h3>
            <span class="episode-duration">{{ episode.duration || '30:00' }}</span>
          </div>
          
          <p class="episode-description">{{ episode.description }}</p>
          
          <div class="episode-player">
            <audio v-if="episode.audio_url" controls>
              <source :src="episode.audio_url" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
            
            <div v-else class="episode-links">
              <a v-if="episode.spotify_url" 
                 :href="episode.spotify_url" 
                 target="_blank"
                 class="podcast-link spotify">
                Listen on Spotify
              </a>
              <a v-if="episode.apple_url" 
                 :href="episode.apple_url" 
                 target="_blank"
                 class="podcast-link apple">
                Listen on Apple Podcasts
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PodcastPlayerRenderer',
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
      return this.data.title || 'Podcast Episodes'
    },
    description() {
      return this.data.description || ''
    },
    episodes() {
      // Handle array format
      if (Array.isArray(this.data.episodes)) {
        return this.data.episodes
      }
      
      // Build from individual episode fields
      const episodesList = []
      for (let i = 1; i <= 5; i++) {
        if (this.data[`episode_${i}_title`]) {
          episodesList.push({
            title: this.data[`episode_${i}_title`],
            description: this.data[`episode_${i}_description`] || '',
            audio_url: this.data[`episode_${i}_audio_url`] || '',
            spotify_url: this.data[`episode_${i}_spotify_url`] || '',
            apple_url: this.data[`episode_${i}_apple_url`] || '',
            duration: this.data[`episode_${i}_duration`] || ''
          })
        }
      }
      
      return episodesList.length ? episodesList : this.getDefaultEpisodes()
    }
  },
  methods: {
    getDefaultEpisodes() {
      return [
        {
          title: "Episode 1: Introduction to Leadership",
          description: "In this episode, we explore the fundamentals of effective leadership.",
          audio_url: "",
          spotify_url: "#",
          apple_url: "#"
        }
      ]
    }
  }
}
</script>

<style scoped>
.gmkb-podcast-player-component {
  padding: 2rem;
  background: var(--gmkb-color-surface, #fff);
}

.podcast-container {
  max-width: 900px;
  margin: 0 auto;
}

.podcast-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-xl, 2rem);
  margin-bottom: 1rem;
}

.podcast-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  margin-bottom: 2rem;
}

.podcast-episodes {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.episode-card {
  background: var(--gmkb-color-background, #f8f9fa);
  padding: 1.5rem;
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.1));
}

.episode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.episode-title {
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
}

.episode-duration {
  color: var(--gmkb-color-text-light, #666);
  font-size: 0.9rem;
}

.episode-description {
  color: var(--gmkb-color-text-light, #666);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin-bottom: 1rem;
}

.episode-player audio {
  width: 100%;
}

.episode-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.podcast-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--gmkb-color-primary, #007cba);
  color: white;
  text-decoration: none;
  border-radius: var(--gmkb-border-radius, 4px);
  transition: background 0.3s ease;
}

.podcast-link:hover {
  background: var(--gmkb-color-primary-hover, #005a87);
}

.podcast-link.spotify {
  background: #1db954;
}

.podcast-link.spotify:hover {
  background: #1aa34a;
}

.podcast-link.apple {
  background: #872ec4;
}

.podcast-link.apple:hover {
  background: #6f26a0;
}
</style>
