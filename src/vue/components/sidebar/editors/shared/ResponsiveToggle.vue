<template>
  <div class="responsive-toggle">
    <div class="device-toggles">
      <!-- Desktop -->
      <div class="device-toggle">
        <label class="toggle-label">
          <input
            type="checkbox"
            :checked="!responsive.hideOnDesktop"
            @change="updateVisibility('hideOnDesktop', !$event.target.checked)"
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke-width="2"/>
            <path d="M8 21h8" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="device-name">Desktop</span>
        </label>
      </div>

      <!-- Tablet -->
      <div class="device-toggle">
        <label class="toggle-label">
          <input
            type="checkbox"
            :checked="!responsive.hideOnTablet"
            @change="updateVisibility('hideOnTablet', !$event.target.checked)"
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="5" y="2" width="14" height="20" rx="2" stroke-width="2"/>
            <circle cx="12" cy="18" r="1" fill="currentColor"/>
          </svg>
          <span class="device-name">Tablet</span>
        </label>
      </div>

      <!-- Mobile -->
      <div class="device-toggle">
        <label class="toggle-label">
          <input
            type="checkbox"
            :checked="!responsive.hideOnMobile"
            @change="updateVisibility('hideOnMobile', !$event.target.checked)"
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="7" y="2" width="10" height="20" rx="2" stroke-width="2"/>
            <circle cx="12" cy="18" r="1" fill="currentColor"/>
          </svg>
          <span class="device-name">Mobile</span>
        </label>
      </div>
    </div>

    <!-- Info text -->
    <p class="responsive-info">
      Toggle to show/hide this component on different devices
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  responsive: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update']);

const updateVisibility = (property, value) => {
  emit('update', {
    ...props.responsive,
    [property]: value
  });
};
</script>

<style scoped>
.responsive-toggle {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-toggles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-toggle {
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  transition: all 0.2s;
}

.device-toggle:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.toggle-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.toggle-label svg {
  color: #64748b;
  flex-shrink: 0;
}

.device-name {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  flex: 1;
}

.toggle-label input:checked ~ svg,
.toggle-label input:checked ~ .device-name {
  color: #3b82f6;
}

.responsive-info {
  margin: 0;
  padding: 8px 12px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}
</style>
