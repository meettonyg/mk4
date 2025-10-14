<template>
  <div class="deprecated-component-placeholder">
    <div class="placeholder-content">
      <div class="placeholder-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      
      <h3 class="placeholder-title">Deprecated Component</h3>
      
      <div class="placeholder-details">
        <p class="original-type">
          <strong>Original Type:</strong> {{ originalType }}
        </p>
        
        <p class="message">{{ message }}</p>
        
        <div v-if="deprecationInfo" class="deprecation-info">
          <p v-if="deprecationInfo.version" class="info-item">
            <strong>Removed in:</strong> Version {{ deprecationInfo.version }}
          </p>
          
          <p v-if="deprecationInfo.reason" class="info-item">
            <strong>Reason:</strong> {{ deprecationInfo.reason }}
          </p>
          
          <p v-if="deprecationInfo.replacement" class="info-item">
            <strong>Replacement:</strong> {{ deprecationInfo.replacement }}
          </p>
        </div>
      </div>
      
      <div class="placeholder-actions">
        <button 
          v-if="deprecationInfo?.replacement"
          @click="handleMigrate"
          class="action-button action-button--primary"
        >
          Migrate to {{ deprecationInfo.replacement }}
        </button>
        
        <button 
          @click="handleRemove"
          class="action-button action-button--danger"
        >
          Remove Component
        </button>
        
        <button 
          @click="showDetails = !showDetails"
          class="action-button action-button--secondary"
        >
          {{ showDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>
      
      <div v-if="showDetails && data" class="preserved-data">
        <h4>Preserved Data</h4>
        <pre>{{ JSON.stringify(data, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMediaKitStore } from '@/stores/mediaKit';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: () => ({})
  }
});

const store = useMediaKitStore();
const showDetails = ref(false);

// Extract deprecation info from data
const originalType = computed(() => props.data?.originalType || 'unknown');
const message = computed(() => props.data?.message || 'This component is no longer supported.');
const deprecationInfo = computed(() => props.data?.deprecationInfo || null);

const handleMigrate = () => {
  const replacement = deprecationInfo.value?.replacement;
  if (!replacement) return;
  
  // Get the fallback config
  const fallbackConfig = deprecationInfo.value?.fallback;
  if (!fallbackConfig) {
    console.error('No fallback configuration available');
    return;
  }
  
  // Create replacement component
  const newComponentId = store.addComponent({
    type: fallbackConfig.type,
    data: props.data // Preserve original data
  });
  
  if (newComponentId) {
    // Remove this deprecated component
    store.removeComponent(props.componentId);
    
    console.log(`✅ Migrated ${originalType.value} to ${fallbackConfig.type}`);
    
    // Show success notification
    document.dispatchEvent(new CustomEvent('gmkb:notification', {
      detail: {
        type: 'success',
        message: `Component migrated to ${fallbackConfig.type}`
      }
    }));
  }
};

const handleRemove = () => {
  if (confirm(`Remove this deprecated component (${originalType.value})?`)) {
    store.removeComponent(props.componentId);
    
    console.log(`🗑️ Removed deprecated component: ${originalType.value}`);
    
    // Show notification
    document.dispatchEvent(new CustomEvent('gmkb:notification', {
      detail: {
        type: 'info',
        message: 'Deprecated component removed'
      }
    }));
  }
};
</script>

<style scoped>
.deprecated-component-placeholder {
  background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
  border: 2px dashed #ef4444;
  border-radius: 8px;
  padding: 32px 24px;
  margin: 16px 0;
  text-align: center;
}

.placeholder-content {
  max-width: 600px;
  margin: 0 auto;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: #ef4444;
}

.placeholder-icon svg {
  width: 100%;
  height: 100%;
}

.placeholder-title {
  color: #991b1b;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.placeholder-details {
  text-align: left;
  background: white;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.original-type {
  margin: 0 0 12px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #fee2e2;
}

.message {
  color: #7f1d1d;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.deprecation-info {
  background: #fef2f2;
  border-left: 3px solid #f87171;
  padding: 12px;
  margin-top: 12px;
}

.info-item {
  margin: 8px 0;
  font-size: 14px;
  color: #7f1d1d;
}

.info-item strong {
  color: #991b1b;
}

.placeholder-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.action-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button--primary {
  background: #3b82f6;
  color: white;
}

.action-button--primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-button--danger {
  background: #ef4444;
  color: white;
}

.action-button--danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.action-button--secondary {
  background: #e5e7eb;
  color: #374151;
}

.action-button--secondary:hover {
  background: #d1d5db;
}

.preserved-data {
  text-align: left;
  background: #1f2937;
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
}

.preserved-data h4 {
  color: #f3f4f6;
  font-size: 14px;
  margin: 0 0 12px 0;
}

.preserved-data pre {
  color: #10b981;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  margin: 0;
  overflow-x: auto;
}
</style>
