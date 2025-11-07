<template>
  <div class="gmkb-component gmkb-component--podcastplayer" :data-component-id="componentId">
    <div class="component-root podcast-container">
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
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'PodcastPlayerRenderer',
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
    // Store and composables
    const store = useMediaKitStore();
    const { rawPodsData, stats } = usePodsData();
    
    // Computed properties
    const title = computed(() => {
      return props.data?.title || 'Podcast Episodes';
    });
    
    const description = computed(() => {
      if (props.data?.description) return props.data.description;
      // ROOT FIX: Use Pods data as fallback
      if (stats.value?.episodes) {
        return `Featured episodes from my ${stats.value.episodes}+ podcast episodes`;
      }
      return '';
    });
    
    const episodes = computed(() => {
      // Handle array format
      if (Array.isArray(props.data?.episodes)) {
        return props.data.episodes;
      }
      
      // Build from individual episode fields
      const episodesList = [];
      for (let i = 1; i <= 5; i++) {
        if (props.data?.[`episode_${i}_title`]) {
          episodesList.push({
            title: props.data[`episode_${i}_title`],
            description: props.data[`episode_${i}_description`] || '',
            audio_url: props.data[`episode_${i}_audio_url`] || '',
            spotify_url: props.data[`episode_${i}_spotify_url`] || '',
            apple_url: props.data[`episode_${i}_apple_url`] || '',
            duration: props.data[`episode_${i}_duration`] || ''
          });
        }
      }
      
      // ROOT FIX: Check for podcast episodes in Pods data
      if (episodesList.length === 0) {
        for (let i = 1; i <= 5; i++) {
          const episodeTitle = rawPodsData.value?.[`podcast_episode_${i}_title`];
          if (episodeTitle) {
            episodesList.push({
              title: episodeTitle,
              description: rawPodsData.value?.[`podcast_episode_${i}_description`] || '',
              audio_url: rawPodsData.value?.[`podcast_episode_${i}_audio`] || '',
              spotify_url: rawPodsData.value?.[`podcast_spotify_url`] || '',
              apple_url: rawPodsData.value?.[`podcast_apple_url`] || '',
              duration: rawPodsData.value?.[`podcast_episode_${i}_duration`] || ''
            });
          }
        }
      }
      
      // Return empty array instead of default episodes
      return episodesList;
    });
    
    // Lifecycle
    onMounted(() => {
      // ROOT FIX: No polling or global checking - use event-driven approach
      if (store.components[props.componentId]) {
        console.log('PodcastPlayer component mounted:', props.componentId);
        
        // Check if using Pods data
        const usingPodsData = episodes.value.some(episode => 
          rawPodsData.value && Object.values(rawPodsData.value).includes(episode.title)
        );
        
        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'podcast-player',
            id: props.componentId,
            podsDataUsed: usingPodsData
          }
        }));
      }
    });
    
    return {
      title,
      description,
      episodes
    };
  }
};
</script>

<style>
.gmkb-component--podcastplayer {
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
