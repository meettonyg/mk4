<template>
  <div class="section-controls">
    <button 
      class="section-handle control-btn control-btn--drag"
      title="Drag to reorder"
    >
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d="M9 4v16M15 4v16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    
    <button 
      @click="$emit('duplicate')"
      class="control-btn"
      title="Duplicate Section"
    >
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d="M5 7v12a2 2 0 002 2h10M9 3h8a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    </button>
    
    <button 
      @click="$emit('settings')"
      class="control-btn"
      title="Section Settings"
    >
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d="M12 8a4 4 0 100 8 4 4 0 000-8zM2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    </button>
    
    <button 
      @click="handleRemove"
      class="control-btn control-btn--delete"
      title="Delete Section"
    >
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['duplicate', 'remove', 'settings'])

function handleRemove() {
  if (confirm('Remove this section and all its components?')) {
    emit('remove')
  }
}
</script>

<style scoped>
.section-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.8);
  padding: 4px;
  border-radius: 6px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gmkb-section:hover .section-controls {
  opacity: 1;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn--delete:hover {
  background: rgba(239, 68, 68, 0.5);
  color: #fff;
}

.control-btn--drag {
  cursor: grab;
}

.control-btn--drag:active {
  cursor: grabbing;
}

.control-btn svg {
  width: 16px;
  height: 16px;
}
</style>
