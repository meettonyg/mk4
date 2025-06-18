# Media Kit Builder - Implementation Prompts

## Quick Start

Each prompt is self-contained and can be executed independently. Start with Phase 6 prompts for immediate performance gains, then proceed sequentially through Phases 7-8.

---

## Phase 6: Migration and Performance Optimization

### Prompt 6.1: Implement Client-Side Template Caching

```
TASK: Add client-side template caching to eliminate server delays after first component load.

FILE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\js\components\dynamic-component-loader.js

IMPLEMENTATION:
1. Add at the top of the file:
   const templateCache = new Map();
   const cacheVersion = window.mediaKitData?.pluginVersion || '1.0.0';

2. In renderComponent method:
   - Before fetch: Check templateCache.has(`${componentType}-${cacheVersion}`)
   - If exists: Return cached template with hydrated props
   - If not: Fetch from server, then cache before returning

3. Create hydrateTemplate(template, props) method:
   - Replace {{prop}} placeholders with actual values
   - Handle nested properties safely

4. Add cache stats to window.mkPerf for monitoring

5. Test by adding same component type multiple times - second+ should be instant

VALIDATION: Console should show "Template cache hit" messages after first load of each type.
```

### Prompt 6.2: Add Loading Indicators

```
TASK: Add visual loading indicators to all async operations.

FILES TO MODIFY:
1. js/components/dynamic-component-loader.js
2. js/services/template-loader.js  
3. css/admin-styles.css

STEPS:
1. In CSS file, add:
   .is-loading { position: relative; pointer-events: none; opacity: 0.7; }
   .is-loading::after { /* spinner CSS from plan */ }

2. In dynamic-component-loader.js:
   - Before fetch: element.classList.add('is-loading')
   - In finally block: element.classList.remove('is-loading')

3. In template-loader.js:
   - Add loading class to modal/container during template fetch
   - Remove in finally block

4. For save operations in state manager:
   - Dispatch 'saving-start' event
   - Dispatch 'saving-end' event
   - Listen in UI to show/hide indicator

TEST: Every async operation should show spinner, even on error.
```

### Prompt 6.3: Replace Alert Dialogs

```
TASK: Replace all alert() calls with toast notifications.

SEARCH: Find all files containing "alert(" in components/*/panel-script.js

COMPONENTS TO UPDATE:
- booking-calendar
- photo-gallery  
- social
- testimonials

REPLACEMENT PATTERN:
// Error alerts
alert('Error message') → window.historyService.showToast('User-friendly error message', 'error')

// Success alerts  
alert('Success!') → window.historyService.showToast('Action completed successfully', 'success')

// Info alerts
alert('Information') → window.historyService.showToast('Helpful information', 'info')

IMPROVE MESSAGES:
- "Invalid URL" → "Please enter a valid web address starting with http:// or https://"
- "Required field" → "Please fill in the [field name] before saving"
- Generic errors → Specific, actionable messages

TEST: Trigger each validation in component panels to see toasts.
```

---

## Phase 7: Testing, Validation & Polish

### Prompt 7.1: Add Schema Validation Warnings

```
TASK: Implement non-breaking schema validation with detailed warnings.

FILE: js/core/enhanced-component-manager.js

ADD METHOD:
validateComponentData(componentId, data, schema) {
    const issues = [];
    const componentType = schema.type || 'unknown';
    
    // Check required fields
    // Check unknown fields  
    // Check type mismatches
    // Check select/radio option validity
    
    if (issues.length > 0) {
        console.warn(`[Schema Validation] Component ${componentType} (ID: ${componentId}): ${issues.length} issues found`, issues);
    }
    
    return issues;
}

INTEGRATE:
- Call in addComponent after schema load
- Call in duplicateComponent  
- Call in loadSerializedState

OUTPUT: Warnings only, no enforcement. This identifies issues for future fixing.
```

### Prompt 7.2: Refactor Photo Gallery Panel

```
TASK: Convert photo-gallery panel from manual DOM updates to schema-driven.

FILES:
1. components/photo-gallery/component.json - UPDATE FIRST
2. components/photo-gallery/panel-script.js - REMOVE manual code
3. components/photo-gallery/styles.css - ADD grid classes

SCHEMA ADDITIONS:
"columns": {
    "type": "select",
    "label": "Grid Columns",
    "default": "3",
    "options": [
        {"value": "2", "label": "2 Columns"},
        {"value": "3", "label": "3 Columns"}, 
        {"value": "4", "label": "4 Columns"}
    ],
    "previewSelector": ".photo-gallery-grid",
    "updateMethod": "class",
    "classPrefix": "grid-cols-"
}

CSS ADDITIONS:
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

REMOVE FROM panel-script.js:
- Manual gridTemplateColumns updates
- Related event listeners

TEST: Column selector should update preview automatically via DataBindingEngine.
```

### Prompt 7.3: Setup Vitest Testing Framework

```
TASK: Install and configure Vitest for automated testing.

SETUP COMMANDS:
npm install --save-dev vitest @testing-library/dom @testing-library/jest-dom jsdom

CREATE: package.json scripts
"scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
}

CREATE: vitest.config.js
import { defineConfig } from 'vitest'

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './tests/setup.js'
    }
})

CREATE: tests/setup.js
// Mock WordPress globals
global.wp = { /* mocks */ }
global.jQuery = { /* mocks */ }

CREATE: First test file tests/unit/state-manager.test.js
- Port logic from verify-all-fixes-v3.js
- Test batch updates, pending actions, persistence

RUN: npm test
```

---

## Phase 8: Cleanup and Documentation

### Prompt 8.1: Create Architecture Documentation

```
TASK: Create visual architecture documentation.

FILE: docs/ARCHITECTURE.md

INCLUDE:
1. System Overview section
2. Data Flow Diagram (ASCII or Mermaid):
   User Action → ComponentManager → StateManager → ComponentRenderer → DOM
        ↑                                    ↓
        └──────── Event System ←─────────────┘

3. Component Lifecycle
4. State Structure  
5. Event System
6. Extension Points

VISUAL ELEMENTS:
- Use Mermaid diagrams for complex flows
- Include code examples for each concept
- Add "Common Patterns" section

LENGTH: ~500-800 lines with examples
```

### Prompt 8.2: Performance Monitoring Dashboard

```
TASK: Create performance monitoring system with visual dashboard.

FILE: js/utils/performance-monitor.js

FEATURES:
1. Automatic operation tracking
2. Benchmark comparison
3. Historical data in localStorage
4. Console table output
5. Optional analytics integration

IMPLEMENTATION:
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.benchmarks = {
            'component-add': 100,
            'state-save': 50,
            'full-render': 200,
            'control-action': 300
        };
    }
    
    track(operation, startTime) {
        const duration = performance.now() - startTime;
        // Store metric
        // Check against benchmark
        // Update running average
    }
    
    report() {
        // Generate console table
        // Color code pass/fail
        // Show trends
    }
}

INTEGRATE: Wrap existing operations with performance.now() tracking
EXPOSE: window.mkPerf = new PerformanceMonitor()
```

### Prompt 8.3: Legacy Code Removal

```
TASK: Remove legacy implementation after validation period.

PRE-REQUISITES:
✓ All tests passing
✓ 2 weeks stable with enhanced system
✓ No console errors in production
✓ Performance benchmarks met

STEPS:
1. Create backup: git checkout -b pre-cleanup-backup

2. Search and remove orphaned references:
   - Search: "componentManager" (old instance)
   - Search: "componentRenderer" (old instance)
   - Search: "conditionalLoader"

3. Delete files:
   - js/components/component-manager.js
   - js/components/component-renderer.js
   - js/core/conditional-loader.js

4. Update js/main.js:
   - Remove conditional loading
   - Direct imports only
   - Remove feature flag checks

5. Update js/core/feature-flags.js:
   - Keep only ENABLE_DEBUG_LOGGING
   - Remove other flags

6. Run full test suite

7. Deploy to staging for 24-hour test

WARNING: Only execute after meeting ALL prerequisites!
```

### Prompt 8.4: Create Component Development Guide

```
TASK: Write comprehensive guide for creating new components.

FILE: docs/COMPONENTS.md

SECTIONS:
1. Quick Start (template to copy)
2. File Structure
3. Schema Definition
4. Template Variables  
5. Panel Controls
6. Styling Guidelines
7. Testing Components
8. Common Patterns

INCLUDE:
- Complete working example (hero component)
- Schema property reference
- DataBindingEngine integration
- Best practices checklist

SPECIAL FOCUS:
- How updateMethod and previewSelector work
- Variable naming conventions
- CSS class patterns
- Accessibility requirements

LENGTH: ~400-600 lines with code examples
```

---

## Validation Prompts

### Final System Test

```
TASK: Run comprehensive system validation.

CHECKLIST:
□ All component types render correctly
□ Template caching shows 90%+ hit rate  
□ No console errors in production mode
□ All control actions work (move, duplicate, delete)
□ State persistence survives page reload
□ Template presets load without errors
□ Performance metrics all green
□ Loading indicators appear/disappear correctly
□ Toast notifications replace all alerts
□ Schema validation warnings appear (dev mode)

AUTOMATED: npm test (if Vitest configured)
MANUAL: Use test-component-render.js for UI testing
PERFORMANCE: window.mkPerf.report() shows all green

SIGN-OFF: System ready for production when all checks pass.
```

---

## Notes

- Each prompt is independent but best executed in order
- Test after each prompt to catch issues early
- Keep backups before major changes
- Monitor performance metrics throughout
- Document any deviations from the plan