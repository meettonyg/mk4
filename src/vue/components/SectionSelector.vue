<template>
  <Teleport to="body">
    <div class="section-selector-overlay" @click.self="$emit('close')">
      <div class="section-selector">
        <div class="selector-header">
          <h3>Choose Section Layout</h3>
          <button @click="$emit('close')" class="close-btn">×</button>
        </div>
        
        <div class="selector-content">
          <div class="layout-grid">
            <button 
              v-for="layout in layouts"
              :key="layout.value"
              @click="selectLayout(layout.value)"
              class="layout-card"
            >
              <div class="layout-preview">
                <component :is="layout.icon" />
              </div>
              <h4>{{ layout.label }}</h4>
              <p>{{ layout.description }}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const emit = defineEmits(['select', 'close'])

const layouts = [
  {
    value: 'full_width',
    label: 'Full Width',
    description: 'Single column layout that spans the full width',
    icon: {
      template: `
        <svg viewBox="0 0 120 80" fill="none">
          <rect x="10" y="20" width="100" height="40" rx="4" fill="currentColor" opacity="0.3"/>
        </svg>
      `
    }
  },
  {
    value: 'two_column',
    label: 'Two Columns',
    description: 'Split content into two equal columns',
    icon: {
      template: `
        <svg viewBox="0 0 120 80" fill="none">
          <rect x="10" y="20" width="48" height="40" rx="4" fill="currentColor" opacity="0.3"/>
          <rect x="62" y="20" width="48" height="40" rx="4" fill="currentColor" opacity="0.3"/>
        </svg>
      `
    }
  },
  {
    value: 'three_column',
    label: 'Three Columns',
    description: 'Divide content into three equal columns',
    icon: {
      template: `
        <svg viewBox="0 0 120 80" fill="none">
          <rect x="10" y="20" width="30" height="40" rx="4" fill="currentColor" opacity="0.3"/>
          <rect x="45" y="20" width="30" height="40" rx="4" fill="currentColor" opacity="0.3"/>
          <rect x="80" y="20" width="30" height="40" rx="4" fill="currentColor" opacity="0.3"/>
        </svg>
      `
    }
  }
]

function selectLayout(layout) {
  emit('select', layout)
  emit('close')
}
</script>

<style scoped>
.section-selector-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.section-selector {
  background: var(--panel-bg, #1a1a1a);
  color: var(--text-color, #fff);
  width: 90%;
  max-width: 720px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.selector-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-color, #fff);
  font-size: 28px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.selector-content {
  padding: 24px;
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.layout-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  color: var(--text-color, #fff);
}

.layout-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary-color, #3b82f6);
  transform: translateY(-2px);
}

.layout-preview {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--primary-color, #3b82f6);
}

.layout-preview svg {
  width: 100%;
  height: 100%;
}

.layout-card h4 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.layout-card p {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted, #94a3b8);
  line-height: 1.4;
}

@media (max-width: 640px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
