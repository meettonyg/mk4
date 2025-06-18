# Media Kit Builder - Implementation Prompts Series

## How to Use These Prompts

1. Copy each prompt exactly as written
2. Wait for the plan outline and approve before implementation
3. Verify each implementation before moving to the next
4. Check the summaries folder after each phase

---

# PHASE 6: MIGRATION AND PERFORMANCE OPTIMIZATION

## Prompt 6.1: Client-Side Template Caching

```
TASK: Implement client-side template caching for 90%+ performance improvement

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md (Section 6.1)

REQUIREMENTS:
1. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
2. INVESTIGATE THE PHP CODE BEFORE THE JS TO IDENTIFY THE ROOT ISSUE
3. First outline the plan get approval and then start coding
4. EDIT THE CODE DIRECTLY after approval
5. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

INVESTIGATION NEEDED:
- Check includes/enqueue.php for how pluginVersion is passed to JS
- Verify guestify-media-kit-builder.php for version constant
- Review includes/api/class-component-api.php for template generation

EXPECTED PLAN OUTLINE:
1. PHP investigation results
2. Cache implementation strategy
3. Hydration method design
4. Cache invalidation approach
5. Performance measurement plan

TARGET FILES:
- js/components/dynamic-component-loader.js (main implementation)
- includes/enqueue.php (version passing)

SUCCESS CRITERIA:
- 90%+ reduction in load time after first component
- Cache hit rate displayed in console
- Version-based cache invalidation working
```

## Prompt 6.2: Loading Indicators Implementation

```
TASK: Add professional loading indicators to all async operations

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md (Section 6.2)

REQUIREMENTS:
1. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
2. INVESTIGATE THE PHP CODE BEFORE THE JS TO IDENTIFY THE ROOT ISSUE
3. First outline the plan get approval and then start coding
4. EDIT THE CODE DIRECTLY after approval
5. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

INVESTIGATION NEEDED:
- Check partials/builder-template.php for existing loading states
- Review css/admin-styles.css for any current spinner styles
- Verify includes/api/class-component-api.php response times

EXPECTED PLAN OUTLINE:
1. Identify all async operations needing indicators
2. CSS design for consistent spinner
3. Implementation strategy for each operation type
4. Error state handling approach
5. Testing methodology

TARGET FILES:
- js/components/dynamic-component-loader.js
- js/services/template-loader.js
- css/admin-styles.css
- js/core/enhanced-state-manager.js (save operations)

SUCCESS CRITERIA:
- Loading spinner appears within 50ms of operation start
- Spinner always removed, even on error
- Consistent design across all operations
```

## Prompt 6.3: Replace Alert Calls with Toast Notifications

```
TASK: Modernize all alert() dialogs with toast notification system

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md (Section 6.3)

REQUIREMENTS:
1. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
2. INVESTIGATE THE PHP CODE BEFORE THE JS TO IDENTIFY THE ROOT ISSUE
3. First outline the plan get approval and then start coding
4. EDIT THE CODE DIRECTLY after approval
5. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

INVESTIGATION NEEDED:
- Search all files for "alert(" to find instances
- Check if historyService is available in all contexts
- Review existing toast implementation in history-service.js

EXPECTED PLAN OUTLINE:
1. Complete list of alert() locations
2. Categorization of alerts (error/success/info)
3. Message improvement strategy
4. Implementation order
5. Testing approach for each component

TARGET FILES:
- components/booking-calendar/panel-script.js
- components/photo-gallery/panel-script.js
- components/social/panel-script.js
- components/testimonials/panel-script.js
- Any other files with alert() calls

SUCCESS CRITERIA:
- Zero alert() calls remain in codebase
- All messages are user-friendly and actionable
- Toast notifications appear consistently
```

## Phase 6 Summary Prompt

```
TASK: Create Phase 6 implementation summary

After completing prompts 6.1, 6.2, and 6.3, create a comprehensive summary at:
C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\summaries\phase-6-summary.md

Include:
1. All files modified with line counts
2. Performance improvements measured
3. Issues encountered and solutions
4. Before/after metrics
5. Screenshots or examples if applicable
6. Any deviations from original plan
7. Recommendations for Phase 7
```

---

# PHASE 7: TESTING, VALIDATION & POLISH

## Prompt 7.1: Schema Validation Warnings

```
TASK: Implement non-breaking schema validation system

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md (Section 7.1)

REQUIREMENTS:
1. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
2. INVESTIGATE THE PHP CODE BEFORE THE JS TO IDENTIFY THE ROOT ISSUE
3. First outline the plan get approval and then start coding
4. EDIT THE CODE DIRECTLY after approval
5. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

INVESTIGATION NEEDED:
- Review all component.json files for schema structure
- Check PHP component registration for schema loading
- Identify any components with non-standard schemas

EXPECTED PLAN OUTLINE:
1. Schema validation rules design
2. Warning format and grouping strategy
3. Integration points in component lifecycle
4. Performance impact assessment
5. Future strict mode preparation

TARGET FILES:
- js/core/enhanced-component-manager.js
- js/core/schema-validator.js (new file)

SUCCESS CRITERIA:
- Validation runs without breaking functionality
- Clear warnings with component IDs
- Issues logged but not enforced
- Performance impact < 10ms
```

## Prompt 7.2: Refactor Photo Gallery Component Panel

```
TASK: Convert photo-gallery from manual DOM updates to schema-driven

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md (Section 7.2)

REQUIREMENTS:
1. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
2. INVESTIGATE THE PHP CODE BEFORE THE JS TO IDENTIFY THE ROOT ISSUE
3. First outline the plan get approval and then start coding
4. EDIT THE CODE DIRECTLY after approval
5. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

INVESTIGATION NEEDED:
- Analyze current panel-script.js implementation
- Check how DataBindingEngine handles updates
- Review existing schema structure

EXPECTED PLAN OUTLINE:
1. Current manual updates inventory
2. Schema additions needed
3. CSS classes to create
4. Code removal strategy
5. Testing methodology

TARGET FILES:
- components/photo-gallery/component.json
- components/photo-gallery/panel-script.js
- components/photo-gallery/styles.css

SUCCESS CRITERIA:
- All manual DOM updates removed
- Settings work through DataBindingEngine
- No functionality lost
- Code reduction of 50%+
```

## Prompt 7.3: Social Component Panel Refactoring

```
TASK: Convert social component from manual updates to schema-driven

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md (Section 7.2)

REQUIREMENTS:
1. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
2. INVESTIGATE THE PHP CODE BEFORE THE JS TO IDENTIFY THE ROOT ISSUE
3. First outline the plan get approval and then start coding
4. EDIT THE CODE DIRECTLY after approval
5. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

[Similar structure to 7.2, adapted for social component]

TARGET FILES:
- components/social/component.json
- components/social/panel-script.js
- components/social/styles.css
```

## Prompt 7.4: Setup Vitest Testing Framework

```
TASK: Install and configure Vitest for automated testing

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md (Section 7.3)

REQUIREMENTS:
1. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
2. INVESTIGATE THE PHP CODE BEFORE THE JS TO IDENTIFY THE ROOT ISSUE
3. First outline the plan get approval and then start coding
4. EDIT THE CODE DIRECTLY after approval
5. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

INVESTIGATION NEEDED:
- Check if package.json exists
- Review existing test scripts to convert
- Identify WordPress globals to mock

EXPECTED PLAN OUTLINE:
1. Installation steps
2. Configuration structure
3. Mock setup strategy
4. First test conversion plan
5. CI integration approach

TARGET FILES:
- package.json (create or update)
- vitest.config.js (new)
- tests/setup.js (new)
- tests/unit/state-manager.test.js (new)

SUCCESS CRITERIA:
- npm test runs successfully
- First test suite passes
- Coverage report generated
- WordPress globals properly mocked
```

## Phase 7 Summary Prompt

```
TASK: Create Phase 7 implementation summary

After completing prompts 7.1 through 7.4, create summary at:
C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\summaries\phase-7-summary.md

Include all items from Phase 6 summary template plus:
- Schema validation findings
- Component refactoring metrics
- Test coverage percentage
- Performance impact measurements
```

---

# PHASE 8: CLEANUP AND DOCUMENTATION

## Prompt 8.1: Create Architecture Documentation

```
TASK: Write comprehensive architecture documentation with visual diagrams

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md (Section 8.2)

REQUIREMENTS:
1. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
2. First outline the plan get approval and then start coding
3. EDIT THE CODE DIRECTLY after approval
4. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

EXPECTED PLAN OUTLINE:
1. Documentation structure
2. Diagram tools/format selection
3. Code example selection
4. Key concepts to cover
5. Review process

TARGET FILES:
- docs/ARCHITECTURE.md (new/update)
- docs/diagrams/ (new directory)

SUCCESS CRITERIA:
- Clear data flow diagram included
- All major components documented
- Extension points identified
- Code examples for each pattern
```

## Prompt 8.2: Performance Monitoring Implementation

```
TASK: Create performance monitoring dashboard system

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md (Section 8.3)

REQUIREMENTS:
1. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
2. First outline the plan get approval and then start coding
3. EDIT THE CODE DIRECTLY after approval
4. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

EXPECTED PLAN OUTLINE:
1. Metrics to track
2. Storage strategy
3. Reporting format
4. Integration points
5. Analytics consideration

TARGET FILES:
- js/utils/performance-monitor.js (new)
- Integration updates in existing files

SUCCESS CRITERIA:
- All key operations tracked
- Console report shows color-coded results
- Historical data preserved
- < 5ms overhead per operation
```

## Prompt 8.3: Legacy Code Removal (CONDITIONAL)

```
TASK: Remove legacy implementation after stability confirmation

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md (Section 8.1)

REQUIREMENTS:
1. ONLY EXECUTE IF: 2 weeks stable, all tests passing, team approval
2. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
3. First outline the plan get approval and then start coding
4. EDIT THE CODE DIRECTLY after approval
5. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

PRE-FLIGHT CHECKLIST:
- [ ] 2 weeks since Phase 7 completion
- [ ] All tests passing
- [ ] No production issues reported
- [ ] Performance targets met
- [ ] Team sign-off obtained

EXPECTED PLAN OUTLINE:
1. Backup strategy
2. Orphaned code search results
3. File deletion list
4. Import update list
5. Rollback procedure

TARGET FILES FOR DELETION:
- js/components/component-manager.js
- js/components/component-renderer.js
- js/core/conditional-loader.js

SUCCESS CRITERIA:
- No broken imports
- All tests still pass
- File size reduction documented
- No functionality lost
```

## Prompt 8.4: Create Component Development Guide

```
TASK: Write developer guide for creating new components

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md (Section 8.2)

REQUIREMENTS:
1. First outline the plan get approval and then start coding
2. EDIT THE CODE DIRECTLY after approval
3. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

EXPECTED PLAN OUTLINE:
1. Guide structure
2. Example component selection
3. Common patterns to document
4. Troubleshooting section design
5. Quick reference format

TARGET FILES:
- docs/COMPONENTS.md (new)
- docs/examples/ (new directory)

SUCCESS CRITERIA:
- Step-by-step component creation
- Complete working example
- Schema reference included
- Common pitfalls documented
```

## Final Phase 8 Summary Prompt

```
TASK: Create final project summary and completion report

After completing all Phase 8 tasks, create final summary at:
C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\summaries\phase-8-final-summary.md

Include:
1. Complete file change inventory
2. Performance improvements achieved
3. Test coverage final percentage
4. Documentation created
5. Code reduction metrics
6. Lessons learned
7. Future recommendations
8. Project closure checklist

Also update:
- CHANGELOG.md with final entries
- README.md with completion status
- Create PROJECT-COMPLETE.md with handover information
```

---

# VALIDATION AND SIGN-OFF

## Final Validation Prompt

```
TASK: Run complete system validation and create sign-off document

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\DAILY-TRACKER.md (Final Sign-off section)

Create validation report at:
C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\summaries\FINAL-VALIDATION-REPORT.md

Run all tests and checks:
1. Automated test suite
2. Performance benchmarks
3. Manual testing checklist
4. Documentation review
5. Code quality metrics

Document results and obtain sign-offs as specified in DAILY-TRACKER.md
```

---

## Usage Instructions

1. Execute prompts in order within each phase
2. Complete all prompts in a phase before moving to next
3. Always wait for plan approval before implementation
4. Create summaries at end of each phase
5. Don't skip the validation steps
6. Maintain the changelog throughout

## Important Notes

- Each prompt references the implementation plan
- PHP investigation is included where relevant
- Direct code editing is emphasized
- Summary creation is required after each phase
- Phase 8.3 (Legacy Removal) has strict prerequisites