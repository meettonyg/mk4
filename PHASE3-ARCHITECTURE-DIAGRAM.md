# PHASE 3 TOOLBAR - ARCHITECTURE DIAGRAM

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WordPress Template                        │
│              builder-template-vue-pure.php                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Provides HTML Shell
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DOM Structure                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  #gmkb-toolbar (empty container)                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  #app (Vue mount point)                             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  #gmkb-sidebar                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  #media-kit-preview                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Vue Mounts
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   MediaKitApp.vue                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  <Teleport to="#gmkb-toolbar">                       │  │
│  │    <MediaKitToolbarComplete />                       │  │
│  │  </Teleport>                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  <Teleport to="#media-kit-preview">                  │  │
│  │    <SectionLayoutEnhanced />                         │  │
│  │  </Teleport>                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│          MediaKitToolbarComplete.vue                         │
│                                                              │
│  ┌────────────┬──────────────────┬────────────────────┐    │
│  │  LEFT      │     CENTER       │      RIGHT         │    │
│  ├────────────┼──────────────────┼────────────────────┤    │
│  │ • Logo     │ DevicePreview    │ • Undo             │    │
│  │ • Title    │   - Desktop      │ • Redo             │    │
│  │ • Status   │   - Tablet       │ • Theme            │    │
│  │            │   - Mobile       │ • Export           │    │
│  │            │                  │ • Share            │    │
│  │            │                  │ • Save             │    │
│  └────────────┴──────────────────┴────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Uses Components
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Child Components                            │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ DevicePreview    │  │  ExportModal     │                │
│  │ .vue             │  │  .vue            │                │
│  │                  │  │                  │                │
│  │ • Desktop btn    │  │ • HTML export    │                │
│  │ • Tablet btn     │  │ • PDF export     │                │
│  │ • Mobile btn     │  │ • JSON export    │                │
│  │ • Shortcuts      │  │ • Shortcode      │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Connects to
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Pinia Store (mediaKit)                      │
│                                                              │
│  State:                    Actions:                          │
│  • components             • save()                           │
│  • sections               • undo()                           │
│  • history[]              • redo()                           │
│  • historyIndex           • addComponent()                   │
│  • isDirty                • removeComponent()                │
│  • isSaving               • _saveToHistory()                 │
│                                                              │
│  Getters:                                                    │
│  • canUndo                                                   │
│  • canRedo                                                   │
│  • saveStatus                                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Persists to
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  WordPress Database                          │
│                                                              │
│  • wp_postmeta                                               │
│    - gmkb_media_kit_state                                    │
│    - gmkb_theme                                              │
│    - gmkb_theme_customizations                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### User Action → State Update
```
User clicks "Save" button
        ↓
MediaKitToolbarComplete.handleSave()
        ↓
store.save()
        ↓
APIService.save(state)
        ↓
WordPress AJAX (admin-ajax.php)
        ↓
wp_postmeta updated
        ↓
store.isDirty = false
        ↓
Status indicator updates (✅ Saved)
```

### User Action → Undo
```
User presses Ctrl+Z
        ↓
MediaKitToolbarComplete.handleKeyboard()
        ↓
store.undo()
        ↓
historyIndex--
        ↓
state restored from history[historyIndex]
        ↓
UI updates reactively
        ↓
Redo button enabled
```

### Device Preview → Layout Update
```
User clicks "Tablet" button
        ↓
DevicePreview.setDevice('tablet')
        ↓
CSS: .gmkb-main-content { max-width: 768px }
        ↓
Event: 'gmkb:device-changed'
        ↓
Components adjust to new width
```

---

## 🎯 Event System

### Custom Events
```javascript
// Save events
'gmkb:save-success'     → Fired after successful save
'gmkb:save-error'       → Fired if save fails

// Component events
'gmkb:component-added'   → New component added
'gmkb:component-updated' → Component data changed
'gmkb:component-removed' → Component deleted

// Device events
'gmkb:device-changed'    → Device preview changed

// System events
'gmkb:initialized'       → App fully loaded
'gmkb:init-error'        → Initialization failed
```

### Keyboard Events
```javascript
document.addEventListener('keydown', (e) => {
  // Ctrl+S → Save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    handleSave();
  }
  
  // Ctrl+Z → Undo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    if (store.canUndo) handleUndo();
  }
  
  // Ctrl+Shift+Z → Redo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault();
    if (store.canRedo) handleRedo();
  }
});
```

---

## 📦 Module Dependencies

```
MediaKitToolbarComplete.vue
├── vue (core)
├── @/stores/mediaKit (Pinia store)
├── DevicePreview.vue
└── ExportModal.vue
    └── @/services/ExportService.js
```

---

## 🔌 Integration Points

### With WordPress
```php
// Template provides:
window.gmkbData = {
  postId: <?php echo $post_id; ?>,
  postTitle: "<?php echo $post->post_title; ?>",
  restUrl: "<?php echo rest_url(); ?>",
  restNonce: "<?php echo wp_create_nonce('wp_rest'); ?>",
  ajaxUrl: "<?php echo admin_url('admin-ajax.php'); ?>"
};
```

### With Existing Systems
```javascript
// ThemeSwitcher
document.getElementById('global-theme-btn')?.click();

// Legacy AJAX
window.gmkbNonceManager.ajaxRequest('gmkb_save_media_kit', data);

// Store
import { useMediaKitStore } from '@/stores/mediaKit';
const store = useMediaKitStore();
```

---

## 🎨 CSS Architecture

```
builder-template-vue-pure.php (inline CSS)
├── Critical layout styles
├── Loading spinner
└── Base toolbar structure

MediaKitToolbarComplete.vue (scoped)
├── Toolbar layout (flexbox)
├── Button styles
├── Status indicator
├── Responsive breakpoints
└── Animations
```

---

## 🔒 State Management

```javascript
// State structure
{
  // Data
  components: {},
  sections: [],
  theme: 'professional_clean',
  themeCustomizations: {},
  podsData: {},
  
  // History
  history: [],
  historyIndex: -1,
  maxHistory: 20,
  
  // UI state
  isDirty: false,
  isSaving: false,
  isLoading: false,
  
  // Meta
  postId: 123,
  lastSaved: timestamp
}
```

---

## 🚀 Lifecycle

```
Page Load
  ↓
WordPress renders template
  ↓
window.gmkbData injected
  ↓
Vue bundle loads
  ↓
MediaKitApp mounts
  ↓
MediaKitToolbarComplete teleports to #gmkb-toolbar
  ↓
Store initializes (loads data via API)
  ↓
UI becomes interactive
  ↓
Auto-save enabled (2s debounce)
  ↓
User interacts with toolbar
  ↓
State updates trigger reactivity
  ↓
Changes auto-saved to database
```

---

**This diagram should help understand how all the pieces fit together! 🎯**
