# Media Kit Builder Test Scripts

## 🧪 Comprehensive Test Suite

This script runs a full automated test of all enhanced features:

```javascript
// Copy and paste the content from the "Media Kit Builder Test Suite" artifact
```

**What it tests:**
- Feature flag system
- Enhanced state manager (pending actions, batch updates, meta state)
- Enhanced component manager (no DOM manipulation, debouncing)
- Enhanced component renderer (diff rendering, render queue)
- Performance benchmarks (<100ms component ops, <50ms saves)
- System integration

## 🎮 Interactive Test Console

This script provides manual testing commands:

```javascript
// Copy and paste the content from the "Media Kit Builder Interactive Test Console" artifact
```

**Available commands:**
- `mkTest.status()` - Show system status
- `mkTest.enableAll()` - Enable all enhanced features
- `mkTest.addRapidComponents(5)` - Test rapid component addition
- `mkTest.testControlActions()` - Test buttons (delete, duplicate, move)
- `mkTest.testBatchOperations()` - Test batch update performance
- `mkTest.testTemplateLoad()` - Load a template
- `mkTest.testPendingActions()` - Test duplicate action prevention
- `mkTest.stressTestRenderer(20)` - Stress test with random operations
- `mkTest.clearAll()` - Clear all components
- `mkTest.help()` - Show all commands

## 🔍 Quick Diagnostic

This script identifies common issues:

```javascript
// Copy and paste the content from the "Media Kit Builder Diagnostic Script" artifact
```

**What it checks:**
- Core system availability
- Feature flag configuration
- DOM elements presence
- State/DOM synchronization
- Performance issues
- Common problems

## 🔖 Bookmarklet (One-Click Testing)

Save this as a bookmark to run diagnostics with one click:

```javascript
javascript:(function(){fetch('https://raw.githubusercontent.com/your-repo/media-kit-builder/main/tests/diagnostic.js').then(r=>r.text()).then(eval).catch(e=>console.error('Failed to load diagnostic:',e));})();
```

## 📝 Test Scenarios

### Scenario 1: Basic Functionality
1. Run diagnostic: Check all systems are green
2. Add a hero component
3. Edit the title
4. Duplicate the component
5. Move it down
6. Delete one copy
7. Save and reload
8. Verify state persisted

### Scenario 2: Performance Test
1. Clear all components
2. Run: `mkTest.addRapidComponents(10)`
3. Check timing < 100ms per component
4. Run: `mkTest.stressTestRenderer(50)`
5. Monitor for smooth animations
6. Check no duplicate renders in console

### Scenario 3: Template Loading
1. Clear all components
2. Run: `mkTest.testTemplateLoad('professional-speaker')`
3. Verify no UI flashing
4. Check all components loaded
5. Edit some content
6. Save state

### Scenario 4: Edge Cases
1. Rapidly click delete on same component
2. Add component while another is animating
3. Move component during delete animation
4. Load template with existing components
5. Test undo/redo after batch operations

## 🐛 Troubleshooting

### Issue: Tests failing
```javascript
// 1. Check feature flags
mediaKitFeatures.FEATURES

// 2. Enable all enhanced features
mkTest.enableAll()

// 3. Reload page and re-run tests
```

### Issue: State/DOM mismatch
```javascript
// Force re-sync
document.dispatchEvent(new CustomEvent('force-render'))

// Or clear and restart
mkTest.clearAll()
location.reload()
```

### Issue: Performance problems
```javascript
// Check render queue
window.enhancedComponentRenderer?.renderQueue

// Disable animations temporarily
document.body.style.setProperty('--animation-duration', '0ms')
```

### Issue: Components not updating
```javascript
// Check if rendering is disabled
window.componentRenderer.disableRendering = false

// Force update
window.stateManager.notifyGlobalListeners()
```

## 📊 Success Metrics

Your implementation is working correctly when:

1. **Test Suite**: 100% pass rate (0 failed, minimal skipped)
2. **Diagnostic**: All green checks, no critical issues
3. **Performance**: 
   - Component operations < 100ms
   - State saves < 50ms
   - No duplicate renders
4. **User Experience**:
   - Smooth animations
   - No UI flashing
   - Instant feedback
   - Reliable saves

## 🚀 Quick Start

```javascript
// 1. Run diagnostic first
(function(){const s=document.createElement('script');s.textContent=`(${window.diagnosticScript})()`;document.head.appendChild(s);})();

// 2. If issues found, enable enhanced features
mkTest.enableAll()

// 3. Reload and run full test suite
// [Paste test suite script]

// 4. Play with interactive console
mkTest.help()
```

Remember: The enhanced system is designed to be **gradually adopted**. Start with diagnostics, fix any issues, then progressively test each feature.