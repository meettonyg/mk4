# 🚀 Quick Component Editor Integration Guide

## Copy-Paste Template

Use this template for updating all remaining component editors.

---

## Step-by-Step Process

### 1. Add Tab System (Template HTML)

Replace the entire `<template>` section with:

```vue
<template>
  <div class="[COMPONENT-NAME]-editor">
    <div class="editor-header">
      <h3>[Component Display Name]</h3>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>
    
    <!-- Tab Navigation -->
    <div class="editor-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="editor-content">
      <!-- CONTENT TAB: Keep your existing component-specific fields -->
      <div v-show="activeTab === 'content'" class="tab-panel">
        <!-- PASTE YOUR EXISTING EDITOR SECTIONS HERE -->
      </div>
      
      <!-- STYLE TAB: New! -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'[COMPONENT-TYPE]'"
          :show-typography="[TRUE OR FALSE]"
        />
      </div>
      
      <!-- ADVANCED TAB: New! -->
      <div v-show="activeTab === 'advanced'" class="tab-panel">
        <BaseAdvancedPanel
          :component-id="componentId"
        />
      </div>
    </div>
  </div>
</template>
```

---

### 2. Update Script Setup

Add these imports at the top:

```vue
<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';

// NEW IMPORTS:
import BaseStylePanel from '../../src/vue/components/sidebar/editors/BaseStylePanel.vue';
import BaseAdvancedPanel from '../../src/vue/components/sidebar/editors/BaseAdvancedPanel.vue';

// ... rest of your existing script
</script>
```

Add tab state after your existing refs:

```javascript
// Tab state
const activeTab = ref('content');
const tabs = [
  { id: 'content', label: 'Content' },
  { id: 'style', label: 'Style' },
  { id: 'advanced', label: 'Advanced' }
];
```

---

### 3. Update Styles

Add/update these CSS classes:

```vue
<style scoped>
/* Add these new classes */
.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.tab-btn.active {
  color: #3b82f6;
  background: white;
  border-bottom-color: #3b82f6;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
}

.tab-panel {
  padding: 20px;
}

/* Update existing class if you have it */
.editor-sections {
  /* Change to: */
  /* This class is now unused, can be removed */
}

/* Keep all your other existing styles */
</style>
```

---

## Component-Specific Decisions

### Q: Should `show-typography` be true or false?

**TRUE** for components with text:
- hero
- biography
- topics
- contact
- guest-intro
- authority-hook
- questions
- testimonials
- call-to-action
- topics-questions
- stats (if it has labels)

**FALSE** for components without text:
- photo-gallery
- logo-grid
- video-intro
- podcast-player
- booking-calendar
- social (icons only, no main text)

**When in doubt**: Set to `true` - user can ignore typography if not needed.

---

## Checklist for Each Component

Before moving to the next component:

- [ ] Replaced template with tab structure
- [ ] Pasted existing content fields into Content tab
- [ ] Added BaseStylePanel and BaseAdvancedPanel imports
- [ ] Added tab state variables
- [ ] Set correct `component-type` in BaseStylePanel
- [ ] Set correct `show-typography` value
- [ ] Updated CSS with tab styles
- [ ] Removed unused CSS classes
- [ ] Tested in browser:
  - [ ] All 3 tabs appear
  - [ ] Content tab shows existing fields
  - [ ] Style tab shows BaseStylePanel
  - [ ] Advanced tab shows BaseAdvancedPanel
  - [ ] Existing functionality still works
  - [ ] No console errors

---

## Example: Before & After

### BEFORE (Old Structure):
```vue
<template>
  <div class="biography-editor">
    <div class="editor-header">
      <h3>Biography</h3>
      <button @click="$emit('close')">×</button>
    </div>
    
    <div class="editor-sections">
      <section>
        <h4>Content</h4>
        <!-- fields -->
      </section>
      <!-- more sections -->
    </div>
  </div>
</template>

<script setup>
// Just basic imports
</script>
```

### AFTER (New Structure):
```vue
<template>
  <div class="biography-editor">
    <div class="editor-header">
      <h3>Biography</h3>
      <button @click="$emit('close')">×</button>
    </div>
    
    <div class="editor-tabs">
      <button v-for="tab in tabs" ...>{{ tab.label }}</button>
    </div>
    
    <div class="editor-content">
      <div v-show="activeTab === 'content'" class="tab-panel">
        <!-- Existing fields moved here -->
      </div>
      
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel ... />
      </div>
      
      <div v-show="activeTab === 'advanced'" class="tab-panel">
        <BaseAdvancedPanel ... />
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseStylePanel from '...';
import BaseAdvancedPanel from '...';

const activeTab = ref('content');
const tabs = [...];
// Rest of existing script
</script>
```

---

## Time Estimate Per Component

- Simple components (5-10 fields): **15-20 minutes**
- Complex components (10+ fields): **20-30 minutes**

**Total for remaining 16 components**: ~5-6 hours

---

## Common Pitfalls to Avoid

1. **Forgetting to import base panels** ❌
   - Always add both imports at top of script

2. **Wrong component-type in BaseStylePanel** ❌
   - Must match the component's type in registry

3. **Not adding tab state** ❌
   - Always add activeTab ref and tabs array

4. **Forgetting v-show on tab panels** ❌
   - Each panel needs `v-show="activeTab === '....'"`

5. **Breaking existing functionality** ❌
   - Test all existing fields after update
   - Ensure updateField() still works

---

## Quick Test Script

After each update, paste this in browser console:

```javascript
// Verify component has settings
const component = GMKB.stores.mediaKit.components['comp_xxx'];
console.log('Settings:', component?.settings);

// Verify base panels loaded
console.log('BaseStylePanel:', document.querySelector('.base-style-panel'));
console.log('BaseAdvancedPanel:', document.querySelector('.base-advanced-panel'));

// Verify style service working
GMKB.services.componentStyle.applyStyling('comp_xxx', component.settings);
```

---

## When You Hit Issues

### Issue: "Component settings undefined"
**Fix**: Component may not have settings. Store should auto-create on addComponent, but check:
```javascript
GMKB.stores.mediaKit.components[id].settings = { style: {}, advanced: {} }
```

### Issue: "BaseStylePanel not rendering"
**Fix**: Check import path is correct relative to your file location

### Issue: "Changes not persisting"
**Fix**: Verify updateField() calls store.updateComponent()

### Issue: "Console errors about missing properties"
**Fix**: Component settings incomplete. Re-save component to trigger schema merge

---

## Need Help?

1. Check IMPLEMENTATION-STATUS.md for architecture notes
2. Look at HeroEditor.vue for reference implementation
3. Review componentSchema.js for settings structure
4. Check ComponentStyleService.js for CSS application

---

**Good luck! You've got this! 🚀**
