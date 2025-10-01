# Media Kit Builder Implementation Prompts

## Phase 6 Prompts: Migration and Performance Optimization

### Prompt 1: Implement Client-Side Template Caching
```
Implement client-side template caching in js/components/dynamic-component-loader.js to eliminate server delays after first component load.

Requirements:
1. Create a Map-based cache for component templates
2. Check cache before making server requests
3. Cache templates by component type on first load
4. Implement cache invalidation strategy (optional: version-based)
5. Add performance logging to measure improvement
6. Ensure graceful fallback if cache fails

Expected outcome: 90%+ reduction in component load time after first use of each type.

Current file location: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\js\components\dynamic-component-loader.js
```

### Prompt 2: Add Loading Indicators
```
Add loading indicators to all async operations in the Media Kit Builder to improve user experience.

Requirements:
1. Find all fetch() calls in dynamic-component-loader.js
2. Add 'is-loading' class to container before fetch
3. Remove class in finally block (works for success or error)
4. Create CSS for .is-loading state with spinner/skeleton
5. Apply to: component loading, template loading, save operations
6. Ensure indicators are removed even on errors

Files to modify:
- js/components/dynamic-component-loader.js
- js/services/template-loader.js
- css/admin-styles.css (add loading styles)

Test by: Adding components and observing loading states
```

### Prompt 3: Replace Alert Calls
```
Replace all remaining alert() calls with the modern toast notification system.

Steps:
1. Search entire codebase for: alert(
2. Found in panel-script.js files for: booking-calendar, photo-gallery, social, testimonials
3. Replace each alert('message') with: window.historyService.showToast('message', 'info')
4. For errors use: window.historyService.showToast('message', 'error')
5. For success use: window.historyService.showToast('message', 'success')
6. Test each component's panel to ensure notifications work

Example transformation:
Before: alert('Please enter a valid URL');
After: window.historyService.showToast('Please enter a valid URL', 'error');
```

## Phase 7 Prompts: Testing, Validation & Polish

### Prompt 4: Implement Schema Validation Warnings
```
Add non-breaking schema validation to help identify data inconsistencies without disrupting functionality.

Implementation in enhanced-component-manager.js:
1. In addComponent method, after loading schema
2. Create validateComponentData(data, schema) function
3. Log warnings for:
   - Missing required fields
   - Extra fields not in schema
   - Type mismatches
   - Invalid values for select/radio options
4. DO NOT enforce - only warn in console
5. Add counts to help prioritize fixes

Output format:
console.warn(`[Schema Validation] Component ${type}: ${issues.length} issues found`);

This prepares for future strict validation without breaking existing components.
```

### Prompt 5: Refactor Component Panel Scripts
```
Refactor 2-3 component panel scripts to use schema-driven updates instead of manual DOM manipulation.

Target components:
1. photo-gallery - Grid columns setting
2. social - Platform enable/disable
3. testimonials - Layout options

For each component:
1. Review panel-script.js for manual DOM updates
2. Add corresponding settings to component.json schema
3. Add previewSelector and updateMethod to schema
4. Remove manual JavaScript updates
5. Let DataBindingEngine handle updates automatically

Example: photo-gallery columns
- Current: Manual gridTemplateColumns update
- New: Schema setting with classPrefix: 'grid-cols-'
- Add CSS: .grid-cols-2, .grid-cols-3, .grid-cols-4
```

### Prompt 6: Create Comprehensive Test Suite
```
Set up Jest/Vitest and create a comprehensive test suite for the Media Kit Builder.

Setup:
1. Install testing framework: npm install --save-dev vitest @testing-library/dom
2. Create test directory structure
3. Convert existing test scripts to formal tests

Test categories to create:
1. State Manager Tests
   - Batch updates
   - Pending actions
   - Component meta
   
2. Component Manager Tests  
   - Add/remove components
   - Control actions
   - Content saving
   
3. Renderer Tests
   - Diff calculation
   - Queue processing
   - DOM updates
   
4. Integration Tests
   - Full component lifecycle
   - Template loading
   - State persistence

Include performance benchmarks in tests.
```

## Phase 8 Prompts: Cleanup and Documentation

### Prompt 7: Remove Legacy System
```
ONLY EXECUTE AFTER PHASE 7 VALIDATION PASSES!

Safely remove the legacy system after confirming enhanced system stability:

1. Delete legacy files:
   - js/components/component-manager.js
   - js/components/component-renderer.js  
   - js/core/conditional-loader.js
   
2. Update main.js:
   - Remove conditional loading logic
   - Direct imports only
   
3. Simplify feature-flags.js:
   - Keep only ENABLE_DEBUG_LOGGING
   - Remove all other flags
   
4. Update all imports throughout codebase

5. Test everything one more time

Create backup branch before deletion: git checkout -b pre-cleanup-backup
```

### Prompt 8: Create Technical Documentation
```
Create comprehensive technical documentation for the Media Kit Builder.

Documentation structure:
1. README.md - Project overview
2. ARCHITECTURE.md - System design and data flow
3. COMPONENTS.md - How to create new components
4. SCHEMAS.md - Schema definition guide
5. API.md - Public methods and events
6. TROUBLESHOOTING.md - Common issues and solutions

For each document:
- Include code examples
- Add diagrams where helpful
- Document key decisions
- Explain extension points

Special focus on component creation workflow since that's what developers will do most.
```

### Prompt 9: Performance Monitoring Script
```
Create a performance monitoring script to track improvements and detect regressions.

Requirements:
1. Measure key operations:
   - Component render time
   - State save time
   - Template load time
   - Control action response
   
2. Compare to benchmarks:
   - Component addition: < 100ms
   - State save: < 50ms
   - Full re-render: < 200ms
   - Control actions: < 300ms
   
3. Output format:
   - Console table with timings
   - Color coding (green = pass, red = fail)
   - Historical comparison if available
   
4. Integration:
   - Add to window.mkPerf
   - Run automatically in debug mode
   - Manual trigger: mkPerf.report()

Save results to localStorage for trend analysis.
```

### Prompt 10: Create Migration Guide
```
Create a migration guide for developers who have extended the old system.

Guide sections:
1. What Changed
   - State manager enhancements
   - Component manager (no DOM)
   - Renderer improvements
   
2. Breaking Changes
   - Direct DOM manipulation removed
   - New event system
   - State structure changes
   
3. Migration Steps
   - Update event listeners
   - Convert DOM updates to state updates
   - Update component schemas
   
4. Code Examples
   - Before/after comparisons
   - Common patterns
   - Best practices
   
5. Compatibility Layer
   - Temporary shims if needed
   - Deprecation warnings
   - Timeline for removal

This helps any custom extensions migrate smoothly.
```