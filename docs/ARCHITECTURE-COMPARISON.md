# Component Discovery Architecture - Current vs Proposed

## 🔍 Phase 1 Investigation Findings

---

## 📐 Current Architecture (Complex)

```
┌─────────────────────────────────────────────────────────┐
│                    CURRENT STATE                         │
│                  (3 Separate Systems)                    │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   PHP ComponentDiscovery  │ ← Scans filesystem
│   (system/*.php)          │ ← Loads component.json
│                           │ ← WordPress transient cache
└────────────┬──────────────┘
             │
             │ AJAX (legacy)
             ↓
┌──────────────────────────┐
│  Vue ComponentDiscovery   │ ← Bridges PHP → Vue
│  (componentDiscovery.js)  │ ← Event-driven
│                           │ ← Maintains Map cache
└────────────┬──────────────┘
             │
             │ Events
             ↓
┌──────────────────────────────┐
│  ComponentDiscoveryService   │ ← Auto-discovers Vue files
│  (ComponentDiscoveryService) │ ← import.meta.glob
│                              │ ← Separate cache
└──────────────────────────────┘

⚠️ PROBLEMS:
- 3 separate caches
- Duplicate logic
- Sync issues possible
- Complex data flow
- Hard to maintain
```

---

## ✅ Proposed Architecture (Simplified)

```
┌─────────────────────────────────────────────────────────┐
│                   PROPOSED STATE                         │
│              (Single Source of Truth)                    │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│   PHP ComponentDiscovery (Master)            │
│   ────────────────────────────────           │
│   • Scans filesystem (component.json)        │
│   • WordPress transient cache                │
│   • Single source of truth                   │
└────────────┬─────────────────────────────────┘
             │
             │ REST API v2
             │ GET /gmkb/v2/components
             ↓
┌──────────────────────────────────────────────┐
│   REST API Endpoint (Thin Layer)             │
│   ────────────────────────────────           │
│   • Returns component metadata               │
│   • Uses PHP cache                           │
│   • Standard JSON format                     │
└────────────┬─────────────────────────────────┘
             │
             │ HTTP GET
             │ (cached response)
             ↓
┌──────────────────────────────────────────────┐
│   Vue APIService (Thin Client)               │
│   ────────────────────────────────           │
│   • Fetches from REST API                    │
│   • Minimal caching (short TTL)              │
│   • Reactive updates                         │
│   • Notifies ComponentLibrary                │
└────────────┬─────────────────────────────────┘
             │
             │ Reactive
             ↓
┌──────────────────────────────────────────────┐
│   ComponentLibrary (Consumer)                │
│   ────────────────────────────────           │
│   • Displays components                      │
│   • Uses UnifiedComponentRegistry            │
│   • Auto-refreshes via watchEffect           │
└──────────────────────────────────────────────┘

✅ BENEFITS:
- 1 cache (PHP transients)
- Clear data flow
- REST API standard
- Easy to maintain
- No sync issues
```

---

## 🔄 Data Flow Comparison

### Current (Complex):
```
Filesystem → PHP Discovery → [Cache 1] → AJAX → 
Vue Bridge → [Cache 2] → Events → 
Service → [Cache 3] → Component Library
```

### Proposed (Simple):
```
Filesystem → PHP Discovery → [Cache] → REST API → 
APIService → ComponentLibrary
```

**Result**: 66% fewer steps, 66% less caching complexity

---

## 📊 Component Metadata Flow

### Before (3 Places):
1. PHP: `ComponentDiscovery->getComponents()`
2. Vue Bridge: `vueComponentDiscovery.discoveredComponents`
3. Service: `ComponentDiscoveryService.componentCache`

### After (1 Place):
1. PHP: `ComponentDiscovery->getComponents()` (master)
   ↓ (via REST API)
2. Vue: Receives and displays (no storage)

---

## 🎯 Implementation Strategy

### Phase 2A: Create v2 API Endpoint (2-3h)
```php
// includes/api/class-gmkb-rest-api-v2.php

register_rest_route('gmkb/v2', '/components', [
    'methods' => 'GET',
    'callback' => [$this, 'get_components'],
]);

public function get_components() {
    $discovery = new ComponentDiscovery(PLUGIN_DIR . 'components/');
    $discovery->scan(); // Uses cache
    
    return [
        'success' => true,
        'components' => array_values($discovery->getComponents()),
        'categories' => $discovery->getCategories(),
        'cache_age' => /* transient age */
    ];
}
```

### Phase 2B: Update Vue APIService (1h)
```javascript
// src/services/APIService.js

async loadComponents() {
  const response = await fetch(
    `${this.restUrl}gmkb/v2/components`,
    { headers: { 'X-WP-Nonce': this.restNonce } }
  );
  
  const data = await response.json();
  return data.components;
}
```

### Phase 2C: Make Library Reactive (2-3h)
```javascript
// ComponentLibraryNew.vue

import { watchEffect } from 'vue';

watchEffect(async () => {
  // Auto-refresh when registry changes
  const latest = await apiService.loadComponents();
  if (latest.length !== components.value.length) {
    components.value = latest;
  }
});
```

### Phase 2D: Deprecate Old Systems (1-2h)
- Mark `componentDiscovery.js` as deprecated
- Remove `ComponentDiscoveryService.js` (if not needed)
- Update documentation

---

## 📈 Performance Impact

### Cache Hits (Estimated):
- **Before**: 3 separate caches = 33% efficiency
- **After**: 1 unified cache = 90% efficiency

### Load Time (Estimated):
- **Before**: 150-200ms (3 systems)
- **After**: 50-100ms (1 system)

### Memory Usage:
- **Before**: 3x component data in memory
- **After**: 1x component data in memory

---

## 🧪 Testing Strategy

### Integration Tests:
```bash
# Test REST API
curl http://site.local/wp-json/gmkb/v2/components

# Test Vue loading
# Open browser console:
window.gmkbAPI.loadComponents().then(console.log)

# Test component library
# Open component library, should show all components
```

### Cache Validation:
```php
// PHP test
$discovery = new ComponentDiscovery(PLUGIN_DIR . 'components/');
$discovery->scan(true); // force refresh
var_dump($discovery->getDebugInfo()['cache_status']);
```

### Reactivity Test:
```javascript
// Add new component, library should auto-refresh
// No manual refresh needed
```

---

## 🎁 Expected Outcomes

After implementing proposed architecture:

1. ✅ **Single Source of Truth**
   - PHP ComponentDiscovery is master
   - No conflicting data
   - Easy to debug

2. ✅ **Simplified Maintenance**
   - 1 place to update logic
   - Clear data flow
   - Less cognitive load

3. ✅ **Better Performance**
   - Unified caching
   - Fewer HTTP calls
   - Faster load times

4. ✅ **REST API Compliance**
   - Aligns with migration plan
   - Standard endpoint
   - Easy to extend

---

## 📚 Related Files

**Files to Update:**
1. `includes/api/class-gmkb-rest-api-v2.php` (create endpoint)
2. `src/services/APIService.js` (add loadComponents)
3. `src/vue/components/ComponentLibraryNew.vue` (make reactive)
4. `system/ComponentDiscovery.php` (no changes, stays master)

**Files to Deprecate:**
1. `src/vue/services/componentDiscovery.js` (mark deprecated)
2. `src/vue/services/ComponentDiscoveryService.js` (evaluate removal)

**Documentation to Update:**
1. Architecture diagrams
2. API documentation
3. Developer guide

---

## ⏱️ Timeline Recap

**Total Effort**: 6-9 hours

- REST API Endpoint: 2-3h
- Vue APIService: 1h
- Reactive Library: 2-3h
- Deprecation & Docs: 1-2h

**Fits in**: 1 working day ✅

---

## 🎯 Success Metrics

After implementation, verify:

- [ ] Component library loads instantly
- [ ] All components visible
- [ ] Cache hit rate >90%
- [ ] Load time <100ms
- [ ] No console errors
- [ ] Auto-refresh works
- [ ] REST API documented

---

*This architecture simplification is part of Phase 2 Implementation*  
*See PHASE1-INVESTIGATION-REPORT.md for full details*
