<template>
  <div class="generic-component">
    <h3>{{ type }}</h3>
    <p>Component content goes here</p>
    <pre v-if="props">{{ JSON.stringify(props, null, 2) }}</pre>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'generic'
  },
  props: {
    type: Object,
    default: () => ({})
  }
});
</script>

<style scoped>
.generic-component {
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.generic-component h3 {
  margin: 0 0 8px;
  text-transform: capitalize;
}

.generic-component pre {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  color: #6b7280;
}
</style>
