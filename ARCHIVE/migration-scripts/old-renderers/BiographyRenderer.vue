<template>
  <div class="gmkb-biography-component" :data-component-id="componentId">
    <div class="biography-container">
      <!-- Image Section -->
      <div v-if="imageUrl" class="biography-image">
        <img :src="imageUrl" :alt="name" />
      </div>
      
      <!-- Content Section -->
      <div class="biography-content">
        <h2 v-if="name" class="biography-name">{{ name }}</h2>
        <h3 v-if="title" class="biography-title">{{ title }}</h3>
        <div v-if="bio" class="biography-text" v-html="formattedBio"></div>
        
        <!-- Achievements -->
        <div v-if="achievements && achievements.length" class="biography-achievements">
          <h4>Key Achievements</h4>
          <ul>
            <li v-for="(achievement, index) in achievements" :key="index">
              {{ achievement }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BiographyRenderer',
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
    name() {
      return this.data.name || this.data.speaker_name || ''
    },
    title() {
      return this.data.title || this.data.professional_title || ''
    },
    bio() {
      return this.data.bio || this.data.biography || ''
    },
    imageUrl() {
      return this.data.image_url || this.data.photo || ''
    },
    achievements() {
      return this.data.achievements || []
    },
    formattedBio() {
      // Convert newlines to paragraphs if needed
      if (!this.bio.includes('<p>')) {
        return this.bio.split('\n\n').map(p => `<p>${p}</p>`).join('')
      }
      return this.bio
    }
  }
}
</script>

<style scoped>
.gmkb-biography-component {
  padding: 2rem;
  background: var(--gmkb-color-surface, #fff);
}

.biography-container {
  display: flex;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.biography-image {
  flex-shrink: 0;
  width: 250px;
}

.biography-image img {
  width: 100%;
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0,0,0,0.1));
}

.biography-content {
  flex: 1;
}

.biography-name {
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-xl, 2rem);
  margin-bottom: 0.5rem;
}

.biography-title {
  color: var(--gmkb-color-text-light, #666);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  margin-bottom: 1rem;
}

.biography-text {
  color: var(--gmkb-color-text, #333);
  line-height: var(--gmkb-line-height-base, 1.6);
}

.biography-achievements {
  margin-top: 1.5rem;
}

.biography-achievements h4 {
  color: var(--gmkb-color-primary, #007cba);
  margin-bottom: 0.5rem;
}

.biography-achievements ul {
  list-style: disc;
  margin-left: 1.5rem;
}

@media (max-width: 768px) {
  .biography-container {
    flex-direction: column;
  }
  
  .biography-image {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
}
</style>
