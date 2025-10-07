# P0 Fix #10: EventBus Removal - Migration Strategy

**Priority**: P0 (Critical)  
**Estimated Time**: 16 hours  
**Risk**: Medium (many touch points)  
**Status**: IN PROGRESS

---

## 🎯 OBJECTIVE

Remove EventBus anti-pattern and replace with Pinia-native solutions:
- Pinia `$subscribe` for state changes
- Direct store watchers for initialization
- Custom events for DOM communication only

---

## 🔍 CURRENT EVENTBUS USAGE

### 1. Store Initialization Events
**Location**: `src/stores/mediaKit.js`

**Current**:
```javascript
// Line 134-142: Wait for initialization
eventBus.on('store:initialized', handler);

// Line 155: Emit start
eventBus.emit('store:initializing');

// Line 443: Emit success
eventBus.emit('store:initialized', { ... });

// Line 452: Emit error
eventBus.emit('store:error', error);
```

**Replace With**: Pinia state flags + watchers
```javascript
// No events needed - use reactive state:
// - isInitializing (already exists)
// - isInitialized (already exists)
// - loadError (already exists)

// Watchers use Pinia's watch() or $subscribe()
```

### 2. Section Duplication Event
**Location**: `src/stores/mediaKit.js` line 1146

**Current**:
```javascript
eventBus.emit('section:duplicated', {
  original: sectionId,
  duplicate: newSectionId,
  componentCount: componentIdMap.size
});
```

**Replace With**: DOM CustomEvent
```javascript
document.dispatchEvent(new CustomEvent('gmkb:section-duplicated', {
  detail: {
    original: sectionId,
    duplicate: newSectionId,
    componentCount: componentIdMap.size
  }
}));
```

### 3. System Readiness (if used)
**Location**: `src/stores/mediaKit.js` line 441

**Current**:
```javascript
systemReadiness.markReady('store', this);
```

**Keep**: This is NOT EventBus, it's a separate system

---

## 📋 MIGRATION STEPS

### Step 1: Remove EventBus Import (5 min)
**File**: `src/stores/mediaKit.js`

```javascript
// REMOVE:
import eventBus from '../services/EventBus.js';

// Keep systemReadiness (it's different):
import systemReadiness from '../services/SystemReadiness.js';
```

### Step 2: Replace Initialization Wait Logic (30 min)
**File**: `src/stores/mediaKit.js` lines 127-150

**BEFORE**:
```javascript
if (this.isInitializing) {
  return new Promise((resolve) => {
    const handler = () => {
      eventBus.off('store:initialized', handler);
      resolve({ alreadyInitialized: true });
    };
    eventBus.on('store:initialized', handler);
    setTimeout(() => {
      eventBus.off('store:initialized', handler);
      resolve({ error: 'Initialization timeout' });
    }, 10000);
  });
}
```

**AFTER** (Pinia-native):
```javascript
if (this.isInitializing) {
  // P0 FIX #10: Use Pinia watch instead of EventBus
  return new Promise((resolve) => {
    const unwatch = this.$subscribe((mutation, state) => {
      if (state.isInitialized) {
        unwatch();
        resolve({ alreadyInitialized: true });
      }
      if (state.loadError) {
        unwatch();
        resolve({ error: state.loadError });
      }
    });
    
    // Timeout fallback
    setTimeout(() => {
      unwatch();
      resolve({ error: 'Initialization timeout' });
    }, 10000);
  });
}
```

### Step 3: Remove EventBus Emits (15 min)
**File**: `src/stores/mediaKit.js`

**Lines to Remove**:
```javascript
// Line 155 - REMOVE (not needed, state flags enough)
eventBus.emit('store:initializing');

// Line 443 - REMOVE (state flag is enough)
eventBus.emit('store:initialized', { ... });

// Line 452 - REMOVE (loadError state is enough)
eventBus.emit('store:error', error);
```

**Keep systemReadiness**: Line 441
```javascript
// KEEP THIS - it's not EventBus
systemReadiness.markReady('store', this);
```

### Step 4: Replace Section Event (10 min)
**File**: `src/stores/mediaKit.js` line 1146

**BEFORE**:
```javascript
eventBus.emit('section:duplicated', {
  original: sectionId,
  duplicate: newSectionId,
  componentCount: componentIdMap.size
});
```

**AFTER** (DOM CustomEvent):
```javascript
// P0 FIX #10: Use DOM CustomEvent instead of EventBus
document.dispatchEvent(new CustomEvent('gmkb:section-duplicated', {
  detail: {
    original: sectionId,
    duplicate: newSectionId,
    componentCount: componentIdMap.size
  }
}));
```

### Step 5: Update External Listeners (2 hours)
Search entire codebase for event listeners:
- `eventBus.on('store:initialized')`
- `eventBus.on('store:error')`
- `eventBus.on('section:duplicated')`

Replace with:
- Pinia watchers: `watch(() => store.isInitialized, ...)`
- DOM listeners: `document.addEventListener('gmkb:section-duplicated', ...)`

### Step 6: Remove EventBus File (5 min)
**After confirming zero usage**:

```bash
# Search for any remaining usage
grep -r "eventBus" src/

# If no results, remove file
rm src/services/EventBus.js
```

### Step 7: Update main.js (10 min)
**File**: `src/main.js`

Remove EventBus import if present:
```javascript
// REMOVE IF EXISTS:
import eventBus from './services/EventBus.js';
```

### Step 8: Testing (2 hours)
1. Test initialization (normal case)
2. Test initialization (duplicate call case)
3. Test initialization (error case)
4. Test section duplication
5. Test any external listeners
6. Full regression testing

---

## 🔄 ALTERNATIVE: Keep EventBus for Now

If migration proves too complex, we can keep EventBus but mark it as deprecated:

```javascript
/**
 * EventBus - DEPRECATED
 * @deprecated Use Pinia $subscribe or DOM CustomEvents instead
 * Will be removed in v5.0.0
 */
```

Then create wrappers:
```javascript
// In stores
this.$onInitialized = (callback) => {
  const unwatch = this.$subscribe((mutation, state) => {
    if (state.isInitialized) {
      unwatch();
      callback();
    }
  });
  return unwatch;
};
```

---

## ✅ ACCEPTANCE CRITERIA

- [ ] Zero `eventBus` imports in codebase
- [ ] All initialization waits use Pinia watchers
- [ ] All events use DOM CustomEvents or Pinia
- [ ] EventBus.js file removed
- [ ] All tests passing
- [ ] No regressions in initialization
- [ ] No regressions in section duplication

---

## 🚨 RISKS & MITIGATION

### Risk 1: Breaking Initialization
**Mitigation**: Test thoroughly, keep flags as backup

### Risk 2: External Plugins Listen to EventBus
**Mitigation**: Check for any third-party code listening

### Risk 3: Performance Impact
**Mitigation**: Pinia watchers are optimized, should be faster

---

## 📊 IMPACT ANALYSIS

### Files to Modify:
1. `src/stores/mediaKit.js` - PRIMARY
2. `src/main.js` - Remove import
3. Any files listening to events
4. Remove `src/services/EventBus.js`

### Estimated LOC Changes:
- Lines removed: ~200 (EventBus.js + usage)
- Lines added: ~30 (Pinia watchers)
- Net reduction: ~170 lines

---

## 🎯 BENEFITS

1. **Simpler Architecture**: One less system to maintain
2. **Better Performance**: Pinia watchers are optimized
3. **Type Safety**: Pinia watchers have better TypeScript support
4. **Less Code**: ~170 lines removed
5. **Fewer Bugs**: No event bus race conditions

---

**Status**: Ready to implement  
**Next**: Execute steps 1-8 above  
**ETA**: 16 hours (2 days)
