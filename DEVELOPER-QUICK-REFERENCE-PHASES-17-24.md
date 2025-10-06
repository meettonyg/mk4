# Media Kit Builder - Developer Quick Reference (Phases 17-24)

## 🚀 Quick Start

All new services are globally available and auto-initialize on app load.

```javascript
// Access services via window object
window.gmkbSecurity     // SecurityService
window.gmkbUndoRedo     // UndoRedoManager  
window.gmkbKeyboard     // KeyboardManager
window.gmkbPerformance  // PerformanceMonitor
window.gmkbAnalytics    // Analytics
```

---

## 🔐 Security Service

### Basic Usage
```javascript
// Sanitize user input
const clean = window.gmkbSecurity.sanitize('<script>alert("XSS")</script>');
// Result: (empty string or escaped)

// Sanitize with HTML allowed (for rich text)
const html = window.gmkbSecurity.sanitize(userInput, { allowHtml: true });

// Sanitize entire component data object
const safeData = window.gmkbSecurity.sanitizeComponentData({
  title: 'My Title',
  content: '<p>Safe HTML</p>',
  url: 'https://example.com'
});
```

### URL Validation
```javascript
// Check if URL is valid
if (window.gmkbSecurity.isValidUrl(url)) {
  // Safe to use
}

// Sanitize URL (returns null if invalid)
const safeUrl = window.gmkbSecurity.sanitizeUrl(url);
if (safeUrl) {
  window.location.href = safeUrl;
}
```

### Allowed HTML Tags
```
p, br, strong, em, u, a, ul, ol, li, h1-h6, blockquote, code, pre
```

### Forbidden Elements
```
script, style, iframe, object, embed, form, input, button, meta, base
```

---

## ↩️ Undo/Redo Manager

### Keyboard Shortcuts
```
Ctrl/Cmd + Z          Undo
Ctrl/Cmd + Y          Redo
Ctrl/Cmd + Shift + Z  Redo (alternative)
```

### Programmatic Usage
```javascript
// Undo last action
await window.gmkbUndoRedo.undo();

// Redo previously undone action
await window.gmkbUndoRedo.redo();

// Check if can undo/redo
const state = window.gmkbUndoRedo.getState();
console.log('Can undo:', state.canUndo);
console.log('Can redo:', state.canRedo);
console.log('Current index:', state.currentIndex);

// Get history
const history = window.gmkbUndoRedo.getHistory(10);
history.forEach(entry => {
  console.log(entry.description, entry.timestamp);
});

// Clear history
window.gmkbUndoRedo.clear();
```

### Recording Custom Changes
```javascript
window.gmkbUndoRedo.record({
  type: 'update',           // add, remove, update, move
  target: 'component-123',  // What was changed
  oldValue: 'Old Title',    // Previous value
  newValue: 'New Title'     // New value
});
```

### Integration with Pinia Store
The undo/redo manager automatically records all Pinia store mutations. No manual integration needed!

---

## ⌨️ Keyboard Manager

### Default Shortcuts
```
# Editing
mod+s           Save
mod+c           Copy
mod+v           Paste
mod+d           Duplicate
delete          Delete
backspace       Delete (alternative)

# Navigation
tab             Next component
shift+tab       Previous component
arrow keys      Move/navigate (when not in input)
escape          Deselect

# View
mod+k           Toggle component library
mod+p           Toggle preview
mod+f           Find/search

# Selection
mod+a           Select all (when not in input)
```

### Register Custom Shortcuts
```javascript
window.gmkbKeyboard.register('ctrl+shift+d', () => {
  console.log('Custom shortcut triggered!');
}, 'My custom shortcut', {
  allowInInput: false,    // Don't trigger in input fields
  allowInModal: true,     // Allow in modals
  priority: 0             // Higher = executes first
});
```

### Unregister Shortcuts
```javascript
window.gmkbKeyboard.unregister('ctrl+shift+d');
```

### Get All Shortcuts
```javascript
const shortcuts = window.gmkbKeyboard.getAllShortcuts();
shortcuts.forEach(shortcut => {
  console.log(shortcut.keys, '-', shortcut.description);
});
```

### Format Shortcut for Display
```javascript
const display = window.gmkbKeyboard.formatShortcut('mod+s');
// Returns: "⌘S" on Mac, "Ctrl+S" on Windows/Linux
```

---

## 🔍 Debounced Search (Composable)

### In Vue Components
```vue
<script setup>
import { useDebounceSearch } from '@/composables/useDebounceSearch';

// Define search function
const searchFunction = async (term, options) => {
  const response = await fetch(`/api/search?q=${term}`);
  return response.json();
};

// Use composable
const {
  searchTerm,           // v-model this
  searchResults,        // Array of results
  isSearching,          // Boolean loading state
  hasResults,           // Boolean has results
  suggestions,          // Array of suggestions
  searchHistoryItems,   // Array of recent searches
  clearSearch,          // Function to clear
  clearHistory,         // Function to clear history
  searchImmediate       // Function to search without debounce
} = useDebounceSearch(searchFunction, {
  delay: 300,           // Debounce delay (ms)
  minLength: 2,         // Minimum characters
  maxResults: 50,       // Max results
  enableHistory: true,  // Save to localStorage
  historyKey: 'my_search_history',
  maxHistoryItems: 10
});
</script>

<template>
  <div class="search-container">
    <input 
      v-model="searchTerm" 
      placeholder="Search..."
      type="text"
    />
    
    <!-- Loading state -->
    <div v-if="isSearching" class="loading">
      Searching...
    </div>
    
    <!-- Results -->
    <div v-else-if="hasResults" class="results">
      <div v-for="result in searchResults" :key="result.id">
        {{ result.title }}
      </div>
    </div>
    
    <!-- Search history/suggestions -->
    <div v-if="!searchTerm && searchHistoryItems.length" class="history">
      <h4>Recent Searches</h4>
      <div v-for="item in searchHistoryItems" :key="item">
        <button @click="searchTerm = item">{{ item }}</button>
      </div>
    </div>
  </div>
</template>
```

### Utility Functions
```javascript
import { debounce, throttle } from '@/composables/useDebounceSearch';

// Debounce a function
const debouncedFunc = debounce(() => {
  console.log('Debounced!');
}, 300);

// Throttle a function
const throttledFunc = throttle(() => {
  console.log('Throttled!');
}, 300);
```

---

## 📱 Mobile Responsiveness (Composables)

### Media Query Hook
```vue
<script setup>
import { useMediaQuery } from '@/composables/useMediaQuery';

const {
  windowWidth,      // Current window width (reactive)
  windowHeight,     // Current window height (reactive)
  isMobile,         // < 768px
  isTablet,         // 768px - 1024px
  isDesktop,        // >= 1024px
  isWide,           // >= 1440px
  isSmallMobile,    // < 480px
  isTouchDevice,    // Has touch support
  isPortrait,       // Height > width
  isLandscape,      // Width > height
  deviceType        // 'mobile' | 'tablet' | 'desktop'
} = useMediaQuery();
</script>

<template>
  <div :class="deviceType">
    <h1 v-if="isMobile">Mobile View</h1>
    <h1 v-else-if="isTablet">Tablet View</h1>
    <h1 v-else>Desktop View</h1>
    
    <div v-if="isTouchDevice">
      Touch-enabled device
    </div>
  </div>
</template>
```

### Touch Gestures Hook
```vue
<script setup>
import { useTouchGestures } from '@/composables/useMediaQuery';
import { onMounted, onUnmounted } from 'vue';

const { enableTouchGestures } = useTouchGestures();

let cleanup;

onMounted(() => {
  cleanup = enableTouchGestures(document.body, {
    onSwipeLeft: () => console.log('Swiped left'),
    onSwipeRight: () => console.log('Swiped right'),
    onSwipeUp: () => console.log('Swiped up'),
    onSwipeDown: () => console.log('Swiped down'),
    onTap: () => console.log('Tapped')
  });
});

onUnmounted(() => {
  if (cleanup) cleanup();
});
</script>
```

### Responsive Utilities
```javascript
import { responsive, BREAKPOINTS } from '@/composables/useMediaQuery';

// Check media query
if (responsive.matches('(max-width: 768px)')) {
  // Mobile
}

// Get current breakpoint
const breakpoint = responsive.getCurrentBreakpoint();
// Returns: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Check preferences
if (responsive.prefersDarkMode()) {
  // User prefers dark mode
}

if (responsive.prefersReducedMotion()) {
  // Disable animations
}

// Use breakpoint constants
console.log(BREAKPOINTS.mobile);   // 480
console.log(BREAKPOINTS.tablet);   // 768
console.log(BREAKPOINTS.desktop);  // 1024
console.log(BREAKPOINTS.wide);     // 1440
```

---

## 📊 Performance Monitor

### Get Performance Metrics
```javascript
// Get current FPS
const fps = window.gmkbPerformance.getCurrentFPS();
console.log('Current FPS:', fps);

// Get memory usage
const memory = window.gmkbPerformance.getCurrentMemory();
console.log('Memory used:', memory.used, 'MB');
console.log('Memory total:', memory.total, 'MB');
console.log('Memory limit:', memory.limit, 'MB');

// Get full report
const report = window.gmkbPerformance.getReport();
console.log('Performance Report:', report);
```

### Mark Render Times
```javascript
// Measure component render time
window.gmkbPerformance.markRenderStart('hero-component');
// ... render component
window.gmkbPerformance.markRenderEnd('hero-component');

// Get average render time
const avgTime = window.gmkbPerformance.getAverageRenderTime();
console.log('Average render:', avgTime, 'ms');
```

### Check Performance Health
```javascript
const health = window.gmkbPerformance.checkPerformance();

if (!health.healthy) {
  console.warn('Performance issues detected:', health.issues);
  console.warn('Current FPS:', health.fps);
  console.warn('Memory usage:', health.memory);
}

// Issues can include:
// - 'Low FPS detected' (< 30 FPS)
// - 'High memory usage' (> 90% of limit)
// - 'Multiple long tasks detected' (> 10 tasks over 50ms)
```

### API Statistics
```javascript
const apiStats = window.gmkbPerformance.getAPIStats();
console.log('API calls:', apiStats.count);
console.log('Average duration:', apiStats.averageDuration, 'ms');
console.log('Total data transferred:', apiStats.totalSize, 'KB');
```

---

## 📈 Analytics

### Track Events
```javascript
// Track generic event
window.gmkbAnalytics.track('button_clicked', {
  button: 'save',
  location: 'toolbar'
});

// Track component usage
window.gmkbAnalytics.trackComponent('hero', 'added', {
  section: 'header'
});

// Track feature usage
window.gmkbAnalytics.trackFeature('export', {
  format: 'json',
  size: '2.5KB'
});

// Track errors
try {
  // ... code
} catch (error) {
  window.gmkbAnalytics.trackError(error, {
    component: 'ComponentName',
    action: 'save'
  });
}

// Track performance metrics
window.gmkbAnalytics.trackPerformance('render_time', 45, {
  component: 'hero'
});
```

### User Identification
```javascript
// Identify user (call once on login)
window.gmkbAnalytics.identify('user-123', {
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium'
});
```

### Manual Flush
```javascript
// Force immediate flush of queued events
await window.gmkbAnalytics.flush();

// Synchronous flush (for page unload)
window.gmkbAnalytics.flush(true);
```

### Control Analytics
```javascript
// Disable analytics
window.gmkbAnalytics.setEnabled(false);

// Enable analytics
window.gmkbAnalytics.setEnabled(true);

// Clear queue
window.gmkbAnalytics.clear();
```

---

## 🛡️ Error Boundary

### Wrap Components
```vue
<template>
  <ErrorBoundary
    error-title="Component Error"
    error-message="This component encountered an error"
    :show-details="true"
    @error="handleError"
    @reset="handleReset"
    :on-report="reportError"
  >
    <YourComponent />
  </ErrorBoundary>
</template>

<script setup>
import ErrorBoundary from '@/vue/components/ErrorBoundary.vue';

const handleError = ({ error, info }) => {
  console.error('Error caught:', error);
  console.log('Error info:', info);
};

const handleReset = () => {
  console.log('Error boundary reset');
};

const reportError = ({ error, info }) => {
  // Send to error tracking service
  window.gmkbAnalytics.trackError(error, {
    info,
    boundary: 'MyComponent'
  });
};
</script>
```

### Props
```javascript
{
  errorTitle: String,        // Default: 'Something went wrong'
  errorMessage: String,      // Default: 'An unexpected error occurred...'
  showDetails: Boolean,      // Default: true (show error details)
  onReset: Function,         // Custom reset handler
  onReport: Function,        // Custom report handler
  fallback: Object           // Custom fallback component
}
```

### Events
```javascript
@error="handleError"   // ({ error, info }) => void
@reset="handleReset"   // () => void
```

---

## 🎨 CSS Responsive Utilities

### Use in Components
```vue
<style scoped>
/* Mobile first approach */
.component {
  padding: 10px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: 20px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: 30px;
  }
}

/* Or use max-width for desktop first */
@media (max-width: 768px) {
  .component {
    flex-direction: column;
  }
}
</style>
```

### Dynamic Classes
```vue
<script setup>
import { useMediaQuery } from '@/composables/useMediaQuery';

const { isMobile, isTablet, isDesktop } = useMediaQuery();
</script>

<template>
  <div :class="{
    'mobile-view': isMobile,
    'tablet-view': isTablet,
    'desktop-view': isDesktop
  }">
    Content
  </div>
</template>
```

---

## 🐛 Debugging Tips

### Check Service Status
```javascript
// Check if services are loaded
console.log('Security:', !!window.gmkbSecurity);
console.log('Undo/Redo:', !!window.gmkbUndoRedo);
console.log('Keyboard:', !!window.gmkbKeyboard);
console.log('Performance:', !!window.gmkbPerformance);
console.log('Analytics:', !!window.gmkbAnalytics);

// Check undo/redo state
console.log('Undo/Redo state:', window.gmkbUndoRedo.getState());

// Check keyboard shortcuts
console.log('Shortcuts:', window.gmkbKeyboard.getAllShortcuts());

// Check performance
console.log('Performance:', window.gmkbPerformance.getReport());
```

### Enable Debug Mode
```javascript
// In browser console during development
localStorage.setItem('gmkb_debug', 'true');
location.reload();

// This will enable verbose logging for all services
```

### Test Security
```javascript
// Test XSS prevention
const tests = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
  '<iframe src="evil.com"></iframe>'
];

tests.forEach(test => {
  const result = window.gmkbSecurity.sanitize(test);
  console.log('Input:', test);
  console.log('Output:', result);
  console.log('Safe:', !result.includes('script') && !result.includes('javascript'));
});
```

### Monitor Performance
```javascript
// Start monitoring
setInterval(() => {
  const report = window.gmkbPerformance.getReport();
  console.log('FPS:', report.fps.current);
  console.log('Memory:', report.memory.used, 'MB');
}, 5000);
```

---

## 📚 Common Patterns

### Secure Form Input
```vue
<script setup>
import { ref } from 'vue';

const userInput = ref('');
const sanitizedValue = ref('');

const handleSubmit = () => {
  // Sanitize before using
  sanitizedValue.value = window.gmkbSecurity.sanitize(
    userInput.value,
    { allowHtml: true }
  );
  
  // Now safe to use sanitizedValue
  console.log('Safe value:', sanitizedValue.value);
};
</script>
```

### Undoable Actions
```vue
<script setup>
const deleteComponent = (id) => {
  // Pinia store mutation - automatically tracked by undo manager
  store.removeComponent(id);
  
  // User can press Ctrl+Z to undo
};
</script>
```

### Responsive Component
```vue
<script setup>
import { useMediaQuery } from '@/composables/useMediaQuery';

const { isMobile, isTablet, isDesktop } = useMediaQuery();

const layoutStyle = computed(() => ({
  gridTemplateColumns: isMobile.value ? '1fr' :
                       isTablet.value ? '1fr 1fr' :
                       '1fr 1fr 1fr'
}));
</script>

<template>
  <div class="grid" :style="layoutStyle">
    <slot />
  </div>
</template>
```

### Track User Actions
```vue
<script setup>
const handleAction = (action) => {
  // Perform action
  performAction(action);
  
  // Track in analytics
  window.gmkbAnalytics.trackAction(action, {
    timestamp: Date.now(),
    source: 'toolbar'
  });
};
</script>
```

---

## ⚡ Performance Best Practices

1. **Always sanitize user input** before storing or displaying
2. **Use debounced search** for search inputs
3. **Wrap error-prone components** in ErrorBoundary
4. **Track important events** with analytics
5. **Monitor performance** during heavy operations
6. **Use responsive composables** instead of CSS media queries when you need reactivity
7. **Leverage keyboard shortcuts** for power users
8. **Test undo/redo** for all state mutations

---

## 🔗 Related Documentation

- [Main Implementation Report](./PHASES-17-24-IMPLEMENTATION-COMPLETE.md)
- [Security Service](./src/services/SecurityService.js)
- [Undo/Redo Manager](./src/services/UndoRedoManager.js)
- [Keyboard Manager](./src/services/KeyboardManager.js)
- [Performance Monitor](./src/services/PerformanceMonitor.js)
- [Analytics Service](./src/services/Analytics.js)

---

**Version**: 1.0.0  
**Last Updated**: Current Session  
**Maintained By**: Media Kit Builder Team
