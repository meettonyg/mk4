<template>
  <div class="fallback-renderer">
    <div class="fallback-header">
      <h3>{{ componentType }}</h3>
      <span class="fallback-id">{{ componentId }}</span>
    </div>
    <div class="fallback-content">
      <p class="fallback-message">
        Component renderer not available. 
        This component will be rendered on the frontend.
      </p>
      <details v-if="hasData" class="fallback-data">
        <summary>Component Data</summary>
        <pre>{{ JSON.stringify(data, null, 2) }}</pre>
      </details>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

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
  
  setup(props) {
    const componentType = computed(() => {
      // ROOT FIX: Don't show 'Unknown Component' which triggers errors
      // Try multiple sources for component type
      const type = props.config?.type || props.data?.type || props.settings?.type;
      
      // If still no type, use a fallback that won't trigger registry errors
      if (!type || type === 'unknown_type') {
        return 'Fallback Component';
      }
      
      return type;
    });
    
    const hasData = computed(() => {
      return Object.keys(props.data).length > 0;
    });
    
    return {
      componentType,
      hasData
    };
  }
};
</script>

<style scoped>
.fallback-renderer {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 20px;
  min-height: 150px;
}

.fallback-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.fallback-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
  text-transform: capitalize;
}

.fallback-id {
  font-family: monospace;
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.fallback-content {
  color: #475569;
}

.fallback-message {
  margin: 0 0 15px 0;
  font-size: 14px;
}

.fallback-data {
  margin-top: 15px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 10px;
}

.fallback-data summary {
  cursor: pointer;
  font-weight: 500;
  color: #334155;
  font-size: 13px;
  user-select: none;
  margin-bottom: 10px;
}

.fallback-data pre {
  margin: 10px 0 0 0;
  font-size: 12px;
  color: #475569;
  background: #f8fafc;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
