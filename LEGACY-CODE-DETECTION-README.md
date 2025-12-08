# 🔍 Legacy Code Detection System

A comprehensive toolkit for identifying and eliminating architectural violations and technical debt in the Guestify Media Kit Builder.

## 📚 Overview

This system helps you find and fix legacy patterns that violate the project's architectural principles:
- ❌ Hardcoded component maps (dual systems)
- ❌ Polling patterns (setTimeout/setInterval)
- ❌ Global object sniffing (window.* checks)
- ❌ Duplicate service logic
- ❌ Hardcoded field mappings
- ❌ Deprecated patterns (jQuery, EventBus, Vue 2)

---

## 🛠️ Tools Available

### 1. Automated Scanner
**File:** `FIND-LEGACY-CODE.ps1`

**What it does:**
- Scans entire `src/` directory
- Detects 8 categories of legacy patterns
- Generates detailed report with line numbers
- Prioritizes issues (HIGH/MEDIUM/LOW)

**How to use:**
```powershell
# Double-click the file, or run:
.\FIND-LEGACY-CODE.ps1
```

**Output:**
- Console summary of findings
- `LEGACY-CODE-REPORT.md` with full details
- Opens report automatically

**When to use:**
- Weekly code health checks
- Before major refactors
- After merging feature branches
- Pre-release audits

---

### 2. Quick Search Tool
**File:** `QUICK-SEARCH.ps1`

**What it does:**
- Interactive menu for targeted searches
- Fast pattern matching
- Real-time results with file paths and line numbers

**How to use:**
```powershell
.\QUICK-SEARCH.ps1
```

**Menu Options:**
1. Hardcoded component maps
2. Polling patterns
3. Global object sniffing
4. jQuery usage
5. EventBus usage
6. Direct Pods field access
7. Hardcoded field names
8. ALL patterns (comprehensive)

**When to use:**
- Quick checks during development
- Investigating specific pattern types
- Verifying fixes before commit

---

### 3. Manual Review Checklist
**File:** `MANUAL-REVIEW-CHECKLIST.md`

**What it contains:**
- Detailed explanations of each violation
- Code examples (bad vs. good)
- Why patterns are problematic
- How to fix each pattern
- PR review template

**How to use:**
- Open in VS Code while reviewing code
- Copy checklist for PR reviews
- Reference when writing new code

**When to use:**
- Code reviews and PR approvals
- Writing new features
- Refactoring existing code
- Training new team members

---

### 4. VS Code Integration
**File:** `.vscode/settings.json`

**What it provides:**
- Optimized search settings
- Excluded directories (node_modules, dist)
- Format on save
- ESLint auto-fix

**How to use:**
Already active if you open the project folder in VS Code.

**Bonus:** Use VS Code's built-in search with regex:
```
componentMap\s*=          # Find component maps
setTimeout.*retry         # Find polling
if.*window\.(gmkb|guest)  # Find global sniffing
```

---

## 📋 Quick Reference

### Common Legacy Patterns to Avoid

#### ❌ Pattern 1: Hardcoded Component Map
```javascript
// BAD
const componentMap = {
  'biography': defineAsyncComponent(() => import('...')),
  'hero': defineAsyncComponent(() => import('...'))
}

// GOOD
import UnifiedComponentRegistry from '@/services/UnifiedComponentRegistry'
const component = UnifiedComponentRegistry.getVueComponent(type)
```

#### ❌ Pattern 2: Polling
```javascript
// BAD
setTimeout(() => checkIfReady(), 100)
setInterval(() => pollForData(), 50)

// GOOD
document.addEventListener('gmkb:ready', handleReady)
store.$subscribe((mutation, state) => { ... })
```

#### ❌ Pattern 3: Global Sniffing
```javascript
// BAD
if (window.gmkbComponentRegistry) { ... }

// GOOD
import UnifiedComponentRegistry from '@/services/UnifiedComponentRegistry'
```

---

## 🚀 Workflow Integration

### Daily Development
```
1. Make code changes
2. Run quick search for specific patterns
3. Fix any issues found
4. Commit
```

### Weekly Maintenance
```
1. Run full FIND-LEGACY-CODE.ps1 scan
2. Review LEGACY-CODE-REPORT.md
3. Create tickets for HIGH priority items
4. Schedule fixes for MEDIUM priority
```

### Pre-Release Audit
```
1. Run full scan
2. Ensure 0 HIGH priority issues
3. Document any MEDIUM issues with mitigation plan
4. Update documentation
```

### Code Review Process
```
1. Open MANUAL-REVIEW-CHECKLIST.md
2. Review PR against checklist
3. Run quick search on changed files
4. Request changes if violations found
```

---

## 📊 Understanding the Report

### Severity Levels

**🔴 HIGH Priority**
- Blocks architectural integrity
- Causes race conditions or bugs
- Must fix before merge

Examples:
- Hardcoded component maps
- Polling patterns
- Global object sniffing

**🟡 MEDIUM Priority**
- Creates technical debt
- Reduces maintainability
- Should fix within sprint

Examples:
- Duplicate service logic
- Hardcoded field mappings
- Deprecated patterns

**🔵 LOW Priority**
- Minor improvements
- Code quality issues
- Fix during refactor

Examples:
- Missing null safety
- Direct state mutations
- Optimization opportunities

---

## 🎯 Success Metrics

### Project Health Goals
```
🔴 HIGH Priority:    0 issues
🟡 MEDIUM Priority:  < 10 issues
🔵 LOW Priority:     < 50 issues
```

### Trend Tracking
Run weekly scans and track:
- Total issue count (should decrease)
- HIGH priority issues (should be 0)
- New vs. fixed issues
- Most common violation types

---

## 🔧 Customization

### Adding New Pattern Detection

Edit `FIND-LEGACY-CODE.ps1`:

```powershell
# Add new pattern group
Write-Host "7️⃣  Searching for [NEW PATTERN]..." -ForegroundColor Cyan

foreach ($file in $allFiles) {
    $lines = Get-Content $file.FullName
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "YOUR_REGEX_PATTERN") {
            Add-Finding -Category "New Pattern" -Severity "MEDIUM" `
                -File $file.FullName.Replace($projectRoot, "") `
                -LineNumber ($i + 1) `
                -Code $lines[$i].Trim() `
                -Reason "Description of why this is bad"
        }
    }
}
```

### Custom Quick Searches

Edit `QUICK-SEARCH.ps1` to add menu items:

```powershell
Write-Host "9. Custom pattern search" -ForegroundColor White

# In switch statement:
"9" {
    Search-Pattern -Pattern "your-pattern" -Description "Your description"
}
```

---

## 📚 Related Documentation

- **Post-Update Developer Checklist** - Must follow for all changes
- **ROOT_CAUSE_FIX_SUMMARY.md** - Example of proper fix
- **IMMEDIATE-ACTION-PLAN.md** - Testing procedures
- **Component Architecture Guide** - System design principles

---

## 💡 Tips & Best Practices

### For Developers

1. **Run quick search before commit**
   ```powershell
   .\QUICK-SEARCH.ps1
   # Choose option 8 (ALL patterns)
   ```

2. **Use VS Code search with regex**
   - Press Ctrl+Shift+F
   - Enable regex mode (.\*)
   - Search for patterns from checklist

3. **Fix root causes, not symptoms**
   - If you find one violation, search for similar patterns
   - Fix entire categories at once
   - Update documentation after fixes

4. **Document architectural decisions**
   - Why you chose a particular approach
   - Alternatives considered
   - Trade-offs made

### For Code Reviewers

1. **Use the manual checklist**
   - Copy template from MANUAL-REVIEW-CHECKLIST.md
   - Check each category
   - Leave educational comments

2. **Run quick search on PR files**
   ```powershell
   # Search specific files from PR
   Select-String -Path "path/to/changed/file.vue" -Pattern "componentMap\s*="
   ```

3. **Look for patterns, not just code**
   - Is this solving the root cause?
   - Does this scale?
   - Will future developers understand this?

---

## 🆘 Troubleshooting

### Script won't run
**Error:** "Execution of scripts is disabled on this system"

**Fix:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### No matches found but you know they exist
**Issue:** Search might be case-sensitive or pattern incorrect

**Fix:**
- Check the regex pattern syntax
- Try the interactive QUICK-SEARCH.ps1 instead
- Use VS Code's search with case-insensitive option

### Too many false positives
**Issue:** Pattern is too broad

**Fix:**
- Edit the script to narrow the regex
- Add exclusion patterns for known safe uses
- Filter by file type or directory

---

## 🎓 Learning Resources

### Understanding the Architecture

1. **Component Loading System**
   - Read: `src/services/UnifiedComponentRegistry.js`
   - Key concept: Single source of truth via import.meta.glob

2. **Event-Driven Pattern**
   - Read: `src/vue/components/ComponentRenderer.vue`
   - Key concept: No polling, use events

3. **Service Layer**
   - Read: Files in `src/services/`
   - Key concept: Centralized, reusable logic

### Real-World Examples

**Example 1:** Profile Photo Fix
- File: `ROOT_CAUSE_FIX_SUMMARY.md`
- Lesson: Eliminate dual systems

**Example 2:** (Add your own as you fix issues)
- Document major refactors
- Share lessons learned
- Update this README

---

## 📞 Getting Help

### Questions?
1. Check MANUAL-REVIEW-CHECKLIST.md for examples
2. Look at ROOT_CAUSE_FIX_SUMMARY.md for patterns
3. Review the Post-Update Developer Checklist

### Found a bug in the scanner?
1. Check the pattern regex
2. Test with manual VS Code search
3. Update the script
4. Document the fix

### Need to add new detection?
1. Follow the customization guide above
2. Test on a few files first
3. Run full scan to verify
4. Update this README

---

## ✅ Verification

After running the scanner and fixing issues:

```powershell
# 1. Run full scan
.\FIND-LEGACY-CODE.ps1

# 2. Check goals
# HIGH: Should be 0
# MEDIUM: Should be decreasing
# LOW: Acceptable in small numbers

# 3. Verify fixes work
.\BUILD.ps1
# Test in browser

# 4. Update tracking
# Document issue count reduction
# Note patterns that were fixed
```

---

## 🎯 Quick Start

**New to the system?**

1. Read this README (you're here! ✅)
2. Open MANUAL-REVIEW-CHECKLIST.md
3. Run `.\FIND-LEGACY-CODE.ps1`
4. Review LEGACY-CODE-REPORT.md
5. Start fixing HIGH priority issues

**Need to review code?**

1. Open MANUAL-REVIEW-CHECKLIST.md
2. Copy the review template
3. Run quick search on changed files
4. Check against checklist categories

**Adding new feature?**

1. Review architectural principles
2. Check examples in checklist
3. Use services, not duplicate logic
4. Run quick search before commit

---

**Remember:** The goal isn't zero legacy code overnight. The goal is:
1. ✅ Stop creating NEW technical debt
2. ✅ Fix HIGH priority issues immediately
3. ✅ Gradually reduce MEDIUM/LOW issues
4. ✅ Build habits that prevent future debt

Happy hunting! 🎯
