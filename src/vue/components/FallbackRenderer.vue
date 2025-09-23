<template>
  <div class="gmkb-fallback-component" :data-component-id="componentId">
    <div class="fallback-container">
      <div class="fallback-message">
        <h3>{{ componentType }} Component</h3>
        <p>Vue renderer not yet implemented</p>
        <pre v-if="showData">{{ JSON.stringify(data, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FallbackRenderer',
  props: {
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    componentType() {
      return this.config?.type || 'Unknown'
    },
    showData() {
      return process.env.NODE_ENV === 'development'
    }
  }
}
</script>

<style scoped>
.gmkb-fallback-component {
  padding: 2rem;
  background: var(--gmkb-color-surface, #f8f9fa);
  border: 2px dashed var(--gmkb-color-border, #dee2e6);
  border-radius: var(--gmkb-border-radius, 8px);
}

.fallback-container {
  max-width: 800px;
  margin: 0 auto;
}

.fallback-message {
  text-align: center;
  color: var(--gmkb-color-text-light, #6c757d);
}

.fallback-message h3 {
  color: var(--gmkb-color-text, #495057);
  margin-bottom: 0.5rem;
}

.fallback-message pre {
  text-align: left;
  background: var(--gmkb-color-background, #ffffff);
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-size: 0.875rem;
  overflow-x: auto;
}
</style>
