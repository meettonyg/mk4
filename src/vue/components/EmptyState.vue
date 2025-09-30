<template>
  <div class="empty-state">
    <div class="empty-state-content">
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" width="64" height="64">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="4 2"/>
          <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      
      <h3 class="empty-state-title">Start Building Your Media Kit</h3>
      <p class="empty-state-description">
        Add your first section to get started. Choose from full width, two column, or three column layouts.
      </p>
      
      <button 
        @click="$emit('add-section')"
        class="empty-state-btn"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Add Your First Section</span>
      </button>
      
      <div class="empty-state-tips">
        <p class="tip-title">Quick Tips:</p>
        <ul>
          <li>Drag components from the sidebar into sections</li>
          <li>Reorder sections and components by dragging</li>
          <li>Click on any component to edit its content</li>
          <li>Use Ctrl+S to save your changes</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['add-section'])
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.empty-state-content {
  text-align: center;
  max-width: 500px;
}

.empty-state-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  color: var(--text-muted, #64748b);
}

.empty-state-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--text-color, #fff);
}

.empty-state-description {
  font-size: 16px;
  color: var(--text-muted, #94a3b8);
  margin: 0 0 32px;
  line-height: 1.6;
}

.empty-state-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-state-btn:hover {
  background: var(--primary-hover, #2563eb);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.empty-state-btn svg {
  width: 20px;
  height: 20px;
}

.empty-state-tips {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
}

.tip-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
}

.empty-state-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.empty-state-tips li {
  padding-left: 24px;
  position: relative;
  color: var(--text-muted, #94a3b8);
  font-size: 14px;
  line-height: 1.6;
}

.empty-state-tips li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--success-color, #10b981);
  font-weight: bold;
}

@media (max-width: 640px) {
  .empty-state-title {
    font-size: 20px;
  }
  
  .empty-state-description {
    font-size: 14px;
  }
}
</style>
