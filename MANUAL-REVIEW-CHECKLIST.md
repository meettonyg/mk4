# Manual Code Review Checklist
# Use this for reviewing code changes and PRs

## 🎯 Purpose
This checklist helps identify legacy patterns and architectural violations during code review. Use it when:
- Reviewing pull requests
- Auditing existing code
- Refactoring components
- Adding new features

---

## 🔴 HIGH PRIORITY VIOLATIONS

### 1. Hardcoded Component Maps
**What to look for:**
```javascript
// ❌ BAD - Hardcoded component map
const componentMap = {
  'biography': defineAsyncComponent(() => import('@components/biography/Biography.vue')),
  'hero': defineAsyncComponent(() => import('@components/hero/Hero.vue'))
}

// ✅ GOOD - Use UnifiedComponentRegistry
import UnifiedComponentRegistry from '@/services/UnifiedComponentRegistry'
const component = UnifiedComponentRegistry.getVueComponent(type)
```

**Why it's bad:**
- Violates single source of truth
- Requires manual updates for new components
- Creates dual loading systems
- Easy to miss components (like profile-photo bug)

**How to fix:**
- Delete hardcoded map
- Import UnifiedComponentRegistry
- Use getVueComponent(type) method

---

### 2. Polling Patterns
**What to look for:**
```javascript
// ❌ BAD - Polling with setTimeout
function waitForSystem() {
  if (!window.enhancedComponentManager) {
    setTimeout(waitForSystem, 100)
    return
  }
  // ... do work
}

// ❌ BAD - Interval polling
const checkReady = setInterval(() => {
  if (store.isReady) {
    clearInterval(checkReady)
    doWork()
  }
}, 50)

// ✅ GOOD - Event-driven
document.addEventListener('gmkb:system-ready', () => {
  doWork()
}, { once: true })

// ✅ GOOD - Pinia subscribe
const unsubscribe = store.$subscribe((mutation, state) => {
  if (state.isReady) {
    unsubscribe()
    doWork()
  }
})
```

**Why it's bad:**
- Race conditions
- Performance overhead
- Unreliable timing
- Hard to debug

**How to fix:**
- Use DOM custom events
- Use Pinia $subscribe
- Use Vue watch/watchEffect
- Use async/await with promises

---

### 3. Global Object Sniffing
**What to look for:**
```javascript
// ❌ BAD - Checking for global objects
if (window.gmkbComponentRegistry) {
  window.gmkbComponentRegistry.register(...)
}

// ❌ BAD - Waiting for globals
while (!window.enhancedComponentManager) {
  await new Promise(resolve => setTimeout(resolve, 100))
}

// ✅ GOOD - Proper imports
import UnifiedComponentRegistry from '@/services/UnifiedComponentRegistry'
UnifiedComponentRegistry.register(...)

// ✅ GOOD - Event-driven initialization
document.addEventListener('gmkb:registry-ready', () => {
  // Work with registry
})
```

**Why it's bad:**
- Unreliable load order
- Race conditions
- Tight coupling to globals
- Hard to test

**How to fix:**
- Use ES6 imports
- Use event listeners for async dependencies
- Use singleton patterns with initialization events

---

## 🟡 MEDIUM PRIORITY VIOLATIONS

### 4. Duplicate Service Logic
**What to look for:**
```javascript
// ❌ BAD - Direct API call
fetch('/wp-json/guestify/v1/media-kit/' + id)
  .then(r => r.json())
  .then(data => ...)

// ✅ GOOD - Use APIService
import APIService from '@/services/APIService'
const data = await APIService.getMediaKit(id)

// ❌ BAD - Manual style injection
const style = document.createElement('style')
style.innerHTML = `.component { color: ${color}; }`
document.head.appendChild(style)

// ✅ GOOD - Use ComponentStyleService
import ComponentStyleService from '@/services/ComponentStyleService'
ComponentStyleService.generateComponentStyles(component)
```

**Services to use:**
- `APIService` - All WordPress REST API calls
- `ComponentStyleService` - CSS generation and injection
- `ThemeStyleInjector` - Theme application
- `SecurityService` - XSS protection and sanitization
- `EnhancedErrorHandler` - Error logging and reporting

---

### 5. Hardcoded Field Mappings
**What to look for:**
```javascript
// ❌ BAD - Hardcoded Pods field names
const name = gmkbData.pods.guestify_full_name
const bio = gmkbData.pods.guestify_biography
const company = gmkbData.pods.guestify_company_name

// ❌ BAD - Hardcoded field mapping
const fieldMap = {
  name: 'guestify_full_name',
  bio: 'guestify_biography',
  company: 'guestify_company_name'
}

// ✅ GOOD - Use component.json schema
// In component.json:
{
  "schema": {
    "properties": {
      "name": {
        "type": "string",
        "podsField": "guestify_full_name"
      }
    }
  }
}

// ✅ GOOD - Use usePodsData composable
import { usePodsData } from '@composables/usePodsData'
const { fullName, biography, companyName } = usePodsData()
```

**Why it's bad:**
- Breaks if Pods field names change
- Scattered across codebase
- Not DRY
- Hard to maintain

**How to fix:**
- Define all mappings in component.json
- Use usePodsData() composable
- Let the system handle mapping

---

### 6. Deprecated Patterns
**What to look for:**
```javascript
// ❌ BAD - jQuery AJAX
$.ajax({
  url: '/wp-json/...',
  success: (data) => ...
})

// ❌ BAD - EventBus (Vue 2 pattern)
EventBus.$emit('component-updated')
EventBus.$on('component-updated', handler)

// ❌ BAD - Vue 2 parent access
this.$root.someMethod()
this.$parent.someData

// ✅ GOOD - Modern alternatives
// Use fetch or APIService
const data = await APIService.getMediaKit(id)

// Use Pinia state management
store.updateComponent(...)

// Use props and provide/inject
provide('parentData', data)
const data = inject('parentData')
```

---

## 🔵 LOW PRIORITY ISSUES

### 7. Direct Store Mutations
**What to look for:**
```javascript
// ❌ BAD - Direct state mutation
store.components[id].data.title = newTitle

// ✅ GOOD - Use actions
store.updateComponent(id, { data: { title: newTitle } })
```

---

### 8. Missing Null Safety
**What to look for:**
```javascript
// ❌ BAD - No null checks
const title = component.data.title.toUpperCase()

// ✅ GOOD - Defensive programming
const title = component?.data?.title?.toUpperCase() ?? 'Untitled'
```

---

## 📋 Review Checklist Template

Copy this for code reviews:

```markdown
## Architecture Review

### Phase 1: Critical Violations
- [ ] No hardcoded component maps
- [ ] No polling patterns (setTimeout/setInterval for waiting)
- [ ] No global object sniffing (window.* checks for readiness)
- [ ] Root cause fixes, not symptom patches

### Phase 2: Code Quality
- [ ] Uses existing services (no duplicate logic)
- [ ] No hardcoded field mappings (uses component.json)
- [ ] No deprecated patterns (jQuery, EventBus, Vue 2 patterns)
- [ ] Proper null safety throughout

### Phase 3: State Management
- [ ] Uses Pinia actions for state changes
- [ ] No direct state mutations
- [ ] Follows state schema

### Phase 4: Event Handling
- [ ] Event-driven for async operations
- [ ] Proper cleanup (removeEventListener, unsubscribe)
- [ ] No memory leaks

### Phase 5: Documentation
- [ ] Complex logic has comments
- [ ] New patterns documented
- [ ] Updated relevant docs
```

---

## 🛠️ Quick Detection Methods

### Method 1: Grep/Search
```bash
# In VS Code, search for these patterns:
componentMap\s*=
setTimeout.*retry|wait|check
if.*window\.(gmkb|guestify)
EventBus\.\$
fieldMapping\s*=
```

### Method 2: File Patterns
**High-risk files to audit:**
- Files with "legacy" in name
- Files with "old" in name
- Files not touched in 6+ months
- Files with 500+ lines
- Files with complex conditional logic

### Method 3: Automated Script
```powershell
.\FIND-LEGACY-CODE.ps1  # Comprehensive scan
.\QUICK-SEARCH.ps1       # Targeted searches
```

---

## 🎓 Training Examples

### Example 1: Component Loading
```javascript
// ❌ BEFORE: Hardcoded map in ComponentWrapper.vue
import { defineAsyncComponent } from 'vue'
const componentMap = {
  'profile-photo': defineAsyncComponent(() => 
    import('@components/profile-photo/ProfilePhoto.vue')
  )
}
<component :is="componentMap[type]" />

// ✅ AFTER: Use UnifiedComponentRegistry
import UnifiedComponentRegistry from '@/services/UnifiedComponentRegistry'
const component = computed(() => 
  UnifiedComponentRegistry.getVueComponent(type)
)
<component :is="component" />
```

### Example 2: Async Initialization
```javascript
// ❌ BEFORE: Polling pattern
function init() {
  if (!window.gmkbData) {
    setTimeout(init, 100)
    return
  }
  loadMediaKit()
}

// ✅ AFTER: Event-driven
document.addEventListener('gmkb:data-loaded', () => {
  loadMediaKit()
}, { once: true })
```

### Example 3: Field Access
```javascript
// ❌ BEFORE: Hardcoded Pods fields
const bio = gmkbData.pods?.guestify_biography || ''
const name = gmkbData.pods?.guestify_full_name || ''

// ✅ AFTER: Use composable
import { usePodsData } from '@composables/usePodsData'
const { biography, fullName } = usePodsData()
```

---

## ✅ Success Criteria

Code is clean when:
1. ✅ No hardcoded component maps or registries
2. ✅ All async coordination is event-driven
3. ✅ All configuration comes from component.json files
4. ✅ Services are used instead of duplicate logic
5. ✅ Modern Vue 3 patterns throughout
6. ✅ Proper error handling and null safety
7. ✅ No global object dependencies
8. ✅ All changes follow Post-Update Developer Checklist

---

## 📚 Reference Documents

- `Post-Update Developer Checklist` - Must follow for all changes
- `ROOT_CAUSE_FIX_SUMMARY.md` - Example of proper architectural fix
- `IMMEDIATE-ACTION-PLAN.md` - Testing and verification process
- `FIND-LEGACY-CODE.ps1` - Automated detection script

---

**Remember:** When in doubt, ask:
1. Does this follow the single source of truth principle?
2. Is this event-driven or polling?
3. Does this duplicate existing service functionality?
4. Will this scale when we add new components?
5. Would this pass the Post-Update Developer Checklist?
