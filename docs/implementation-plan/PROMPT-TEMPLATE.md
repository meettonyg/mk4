# Media Kit Builder - Prompt Template

## Standard Implementation Prompt Template

Use this template for any additional implementation tasks not covered in the main series.

```
TASK: [Clear, specific task description]

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\[relevant-document.md]

REQUIREMENTS:
1. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
2. INVESTIGATE THE PHP CODE BEFORE THE JS TO IDENTIFY THE ROOT ISSUE
3. First outline the plan get approval and then start coding
4. EDIT THE CODE DIRECTLY after approval
5. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

INVESTIGATION NEEDED:
- [PHP files to check]
- [Configuration to verify]
- [Dependencies to confirm]

EXPECTED PLAN OUTLINE:
1. [Investigation findings]
2. [Implementation approach]
3. [Risk assessment]
4. [Testing strategy]
5. [Rollback plan if needed]

TARGET FILES:
- [Primary file to modify]
- [Secondary files affected]
- [New files to create]

SUCCESS CRITERIA:
- [Specific, measurable outcome]
- [Performance target if applicable]
- [User experience improvement]
- [Code quality metric]

VALIDATION:
- [How to test the implementation]
- [Expected console output]
- [User-facing changes to verify]
```

## Summary Prompt Template

```
TASK: Create [Phase/Feature] implementation summary

After completing [specific prompts/tasks], create a comprehensive summary at:
C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\summaries\[summary-name].md

Include:
1. All files modified with specific changes
2. Metrics/improvements measured
3. Issues encountered and resolutions
4. Before/after comparisons
5. Screenshots or code examples
6. Deviations from plan with justification
7. Recommendations for next steps

Update tracking documents:
- CHANGELOG.md with implementation details
- DAILY-TRACKER.md with progress
- Performance metrics if applicable
```

## Quick Decision Prompt Template

For getting quick approvals on implementation decisions:

```
DECISION NEEDED: [Specific decision required]

CONTEXT:
- Current situation: [brief description]
- Options identified: 
  1. [Option 1 with pros/cons]
  2. [Option 2 with pros/cons]
  
RECOMMENDATION: [Your recommended approach]

IMPACT:
- Performance: [expected impact]
- Complexity: [development effort]
- Risk: [potential issues]

Please approve recommended approach or suggest alternative.
```

## Bug Fix Prompt Template

For addressing issues discovered during implementation:

```
BUG DISCOVERED: [Clear bug description]

SYMPTOMS:
- [What happens]
- [When it happens]
- [Error messages if any]

ROOT CAUSE INVESTIGATION:
Following the principle of fixing at root level, need to investigate:
1. [PHP-side checks needed]
2. [JS-side verification]
3. [Data flow analysis]

Files at: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

Please investigate and provide root cause analysis before implementing fix.
```

## Notes on Using Templates

1. **Always include the file path**: This ensures direct implementation
2. **PHP investigation first**: Even for JS issues, check PHP side
3. **Plan before coding**: Get approval on approach
4. **Document everything**: Update summaries after each task
5. **Test thoroughly**: Include validation criteria

## Example: Using Template for Custom Task

```
TASK: Add keyboard shortcuts for component actions

REFERENCE: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\docs\implementation-plan\FINAL-IMPLEMENTATION-PLAN.md

REQUIREMENTS:
1. FIX THE CODE DIRECTLY AT THE ROOT LEVEL, NO PATCHES OR QUICK FIXES
2. INVESTIGATE THE PHP CODE BEFORE THE JS TO IDENTIFY THE ROOT ISSUE
3. First outline the plan get approval and then start coding
4. EDIT THE CODE DIRECTLY after approval
5. IMPLEMENT the file edits directly, files are located here: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\

INVESTIGATION NEEDED:
- Check if any keyboard shortcuts defined in PHP localization
- Verify no conflicts with WordPress admin shortcuts
- Review existing event listeners in component-library.js

EXPECTED PLAN OUTLINE:
1. Shortcut key mapping design
2. Implementation approach (global vs component-specific)
3. Conflict detection strategy
4. User notification method
5. Documentation approach

TARGET FILES:
- js/ui/keyboard-shortcuts.js (new)
- js/core/media-kit-builder-init.js (integration)
- docs/SHORTCUTS.md (documentation)

SUCCESS CRITERIA:
- Common actions have keyboard shortcuts
- No conflicts with WordPress
- Shortcuts are discoverable
- Can be disabled if needed

VALIDATION:
- Test each shortcut combination
- Verify no interference with form inputs
- Check accessibility compliance
```