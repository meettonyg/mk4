# Media Kit Builder - Implementation Cheat Sheet

## Phase 6: Performance (Days 1-4)

### 6.1 Template Caching
```javascript
// dynamic-component-loader.js
const templateCache = new Map();
const cacheVersion = window.mediaKitData?.pluginVersion || '1.0.0';
// Check cache before fetch, store after fetch
```

### 6.2 Loading Indicators
```css
.is-loading::after { /* spinner */ }
```
```javascript
element.classList.add('is-loading'); // before fetch
element.classList.remove('is-loading'); // in finally
```

### 6.3 Toast Notifications
```javascript
// Replace all alert() with:
window.historyService.showToast('message', 'error|success|info');
```

## Phase 7: Testing (Days 5-8)

### 7.1 Schema Validation
```javascript
// enhanced-component-manager.js
validateComponentData(componentId, data, schema) {
    // Log warnings only, don't break
}
```

### 7.2 Component Refactoring
1. Update component.json schema first
2. Add CSS classes for variations
3. Remove manual JS updates
4. Test with DataBindingEngine

### 7.3 Vitest Setup
```bash
npm install --save-dev vitest @testing-library/dom jsdom
npm test
```

## Phase 8: Cleanup (Days 9-14)

### 8.1 Documentation
- ARCHITECTURE.md (with flow diagram)
- COMPONENTS.md (developer guide)
- API.md (public methods)

### 8.2 Performance Monitor
```javascript
window.mkPerf = {
    track(operation, duration),
    report() // console table
}
```

### 8.3 Legacy Removal
**WAIT 2 WEEKS!** Then:
1. Backup branch
2. Delete old files
3. Update imports
4. Remove feature flags

## Quick Commands

```javascript
// Current status
window.mediaKitFeatures.FEATURES

// Performance check
window.mkPerf.report()

// Test components
window.mkTest.addRapidComponents()

// Validate state
window.mkDiag.checkState()
```

## Key Metrics

| What | Target |
|------|--------|
| Cached load | <100ms |
| Save | <50ms |
| Render | <200ms |
| Actions | <300ms |

## File Locations

```
js/
├── components/
│   └── dynamic-component-loader.js (caching)
├── core/
│   └── enhanced-component-manager.js (validation)
└── services/
    └── template-loader.js (loading states)

components/*/
├── component.json (schema updates)
├── panel-script.js (remove manual code)
└── styles.css (add utility classes)
```

---
*Start with 6.1 Template Caching for biggest impact!*