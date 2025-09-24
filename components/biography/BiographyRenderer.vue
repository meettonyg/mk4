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
  padding: var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-surface, #ffffff);
  border-radius: var(--gmkb-border-radius, 8px);
}

.biography-container {
  display: flex;
  gap: var(--gmkb-spacing-xl, 2rem);
  max-width: var(--gmkb-container-max-width, 1200px);
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
  transition: var(--gmkb-transition, all 0.3s ease);
}

.biography-image img:hover {
  transform: scale(1.02);
  box-shadow: var(--gmkb-shadow-lg, 0 10px 15px rgba(0,0,0,0.1));
}

.biography-content {
  flex: 1;
}

.biography-name {
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  color: var(--gmkb-color-text, #1e293b);
  font-size: var(--gmkb-font-size-2xl, 2rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-spacing-sm, 0.5rem);
}

.biography-title {
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  color: var(--gmkb-color-text-light, #64748b);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  font-weight: var(--gmkb-font-weight-medium, 500);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

.biography-text {
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  color: var(--gmkb-color-text, #1e293b);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
}

.biography-text :deep(p) {
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

.biography-achievements {
  margin-top: var(--gmkb-spacing-lg, 1.5rem);
  padding-top: var(--gmkb-spacing-lg, 1.5rem);
  border-top: 1px solid var(--gmkb-color-border, #e2e8f0);
}

.biography-achievements h4 {
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  color: var(--gmkb-color-primary, #3b82f6);
  font-size: var(--gmkb-font-size-lg, 1.125rem);
  font-weight: var(--gmkb-font-weight-bold, 600);
  margin-bottom: var(--gmkb-spacing-sm, 0.5rem);
}

.biography-achievements ul {
  list-style: disc;
  margin-left: var(--gmkb-spacing-lg, 1.5rem);
  color: var(--gmkb-color-text, #1e293b);
}

.biography-achievements li {
  margin-bottom: var(--gmkb-spacing-xs, 0.25rem);
  line-height: var(--gmkb-line-height-base, 1.6);
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
