<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root podcast-player-component"
  >
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
          <span v-if="episode.duration" class="episode-duration">{{ episode.duration }}</span>
        </div>
        
        <p v-if="episode.description" class="episode-description">{{ episode.description }}</p>
        
        <div class="episode-player">
          <audio v-if="episode.audio_url" controls>
            <source :src="episode.audio_url" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
          
          <div v-else class="episode-links">
            <a v-if="episode.spotify_url" 
               :href="episode.spotify_url" 
               target="_blank"
               rel="noopener noreferrer"
               class="podcast-link spotify">
              Listen on Spotify
            </a>
            <a v-if="episode.apple_url" 
               :href="episode.apple_url" 
               target="_blank"
               rel="noopener noreferrer"
               class="podcast-link apple">
              Listen on Apple Podcasts
            </a>
          </div>
        </div>
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
const { rawPodsData, stats } = usePodsData();

// Extract data from both data and props for compatibility
const title = computed(() => props.data?.title || props.props?.title || 'Podcast Episodes');
const description = computed(() => {
  if (props.data?.description || props.props?.description) {
    return props.data?.description || props.props?.description;
  }
  if (stats.value?.episodes) {
    return `Featured episodes from my ${stats.value.episodes}+ podcast episodes`;
  }
  return '';
});

const episodes = computed(() => {
  // Handle array format
  if (Array.isArray(props.data?.episodes) && props.data.episodes.length > 0) {
    return props.data.episodes;
  }
  
  // Build from individual episode fields
  const episodesList = [];
  for (let i = 1; i <= 5; i++) {
    const title = props.data?.[`episode_${i}_title`] || props.props?.[`episode_${i}_title`];
    if (title) {
      episodesList.push({
        title: title,
        description: props.data?.[`episode_${i}_description`] || props.props?.[`episode_${i}_description`] || '',
        audio_url: props.data?.[`episode_${i}_audio_url`] || props.props?.[`episode_${i}_audio_url`] || '',
        spotify_url: props.data?.[`episode_${i}_spotify_url`] || props.props?.[`episode_${i}_spotify_url`] || '',
        apple_url: props.data?.[`episode_${i}_apple_url`] || props.props?.[`episode_${i}_apple_url`] || '',
        duration: props.data?.[`episode_${i}_duration`] || props.props?.[`episode_${i}_duration`] || ''
      });
    }
  }
  
  // Check for podcast episodes in Pods data
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
  
  return episodesList;
});

// Lifecycle
onMounted(() => {
  if (store.components[props.componentId]) {
    document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
      detail: {
        type: 'podcast-player',
        id: props.componentId,
        podsDataUsed: episodes.value.some(episode => 
          rawPodsData.value && Object.values(rawPodsData.value).includes(episode.title)
        )
      }
    }));
  }
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.podcast-player-component {
  /* Styles applied via inline styles from ComponentStyleService */
  max-width: 900px;
  margin: 0 auto;
}

.podcast-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: inherit;
}

.podcast-description {
  text-align: center;
  color: #64748b;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.podcast-episodes {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.episode-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.episode-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.episode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.episode-title {
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.episode-duration {
  color: #64748b;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.episode-description {
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.episode-player audio {
  width: 100%;
  outline: none;
}

.episode-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.podcast-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.podcast-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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

/* Responsive */
@media (max-width: 768px) {
  .podcast-title {
    font-size: 1.5rem;
  }
  
  .episode-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .episode-title {
    font-size: 1.125rem;
  }
  
  .episode-links {
    flex-direction: column;
  }
  
  .podcast-link {
    width: 100%;
    text-align: center;
  }
}
</style>
