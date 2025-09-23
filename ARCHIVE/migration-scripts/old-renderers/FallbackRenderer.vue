<template>
  <div class="fallback-component">
    <div class="fallback-header">
      <span class="fallback-type">{{ componentType }}</span>
      <span class="fallback-id">{{ id }}</span>
    </div>
    <div class="fallback-content">
      <p class="fallback-message">
        Vue renderer for "{{ componentType }}" is not yet implemented.
      </p>
      <div class="fallback-data" v-if="hasData">
        <h4>Component Data:</h4>
        <pre>{{ JSON.stringify(data, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'FallbackRenderer',
  
  props: {
    id: String,
    data: {
      type: Object,
      default: () => ({})
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: 'unknown'
    }
  },
  
  setup(props) {
    const componentType = computed(() => 
      props.type || props.data.type || 'unknown'
    );
    
    const hasData = computed(() => 
      Object.keys(props.data).length > 0
    );
    
    return {
      componentType,
      hasData
    };
  }
};
</script>

<style scoped>
.fallback-component {
  border: 2px dashed #475569;
  border-radius: 8px;
  padding: 20px;
  background: #1e293b;
}

.fallback-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #334155;
}

.fallback-type {
  font-weight: 600;
  color: #3b82f6;
  text-transform: capitalize;
}

.fallback-id {
  font-size: 12px;
  color: #64748b;
  font-family: monospace;
}

.fallback-message {
  color: #94a3b8;
  margin: 10px 0;
}

.fallback-data {
  margin-top: 20px;
}

.fallback-data h4 {
  color: #cbd5e1;
  margin-bottom: 10px;
  font-size: 14px;
}

.fallback-data pre {
  background: #0f172a;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  color: #94a3b8;
}
</style>
