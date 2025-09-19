<template>
  <div class="debug-component" style="background: #1e293b; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px; margin: 10px;">
    <h3 style="color: #3b82f6; margin-bottom: 10px;">🔍 Debug: {{ componentType }}</h3>
    <div style="color: #cbd5e1; font-family: monospace; font-size: 12px;">
      <div style="margin-bottom: 10px;">
        <strong>ID:</strong> {{ id }}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Type:</strong> {{ componentType }}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Data:</strong>
        <pre style="background: #0f172a; padding: 10px; border-radius: 4px; overflow: auto;">{{ JSON.stringify(data, null, 2) }}</pre>
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Props:</strong>
        <pre style="background: #0f172a; padding: 10px; border-radius: 4px; overflow: auto;">{{ JSON.stringify(props, null, 2) }}</pre>
      </div>
      <div>
        <strong>Settings:</strong>
        <pre style="background: #0f172a; padding: 10px; border-radius: 4px; overflow: auto;">{{ JSON.stringify(settings, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: String,
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
  }
});

const componentType = computed(() => {
  // Extract type from ID if possible
  const parts = props.id?.split('_') || [];
  return parts[0] || 'Unknown';
});

// Expose all props for debugging
const { id, data, settings } = props;
</script>
