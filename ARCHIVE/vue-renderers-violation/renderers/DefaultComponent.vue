<template>
  <div class="default-component">
    <h4>{{ componentType }}</h4>
    <p class="component-id">ID: {{ id }}</p>
    <div v-if="hasData" class="component-data">
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: String,
  data: Object,
  props: Object,
  settings: Object
});

const componentType = computed(() => {
  // Extract type from ID if possible
  const parts = props.id?.split('_') || [];
  return parts[0] || 'Component';
});

const hasData = computed(() => {
  return props.data && Object.keys(props.data).length > 0;
});
</script>

<style scoped>
.default-component {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.default-component h4 {
  color: #e2e8f0;
  margin: 0 0 10px 0;
  text-transform: capitalize;
}

.component-id {
  color: #64748b;
  font-size: 12px;
  margin: 0 0 10px 0;
}

.component-data {
  margin-top: 10px;
}

.component-data pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 4px;
  color: #94a3b8;
  font-size: 11px;
  overflow: auto;
}
</style>
