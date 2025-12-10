# Quick Testing Guide - XSS Sanitization

**Purpose**: Verify XSS protection is working correctly  
**Time**: 15 minutes  
**Priority**: CRITICAL

---

## 🧪 TEST 1: Basic XSS Attack (Script Tag)

### Input:
```html
<script>alert('XSS')</script>Hello World
```

### Where to Test:
- Component: Biography
- Field: Bio content

### Expected Result:
```html
Hello World
```
✅ **PASS**: Script tag completely removed  
❌ **FAIL**: Alert popup appears

---

## 🧪 TEST 2: Image XSS (onerror)

### Input:
```html
<img src="invalid.jpg" onerror="alert('XSS')">
```

### Where to Test:
- Component: Hero
- Field: Image description

### Expected Result:
```html
<img src="invalid.jpg" alt="">
```
✅ **PASS**: onerror removed, image tag safe  
❌ **FAIL**: Alert popup appears on image load error

---

## 🧪 TEST 3: Link XSS (javascript:)

### Input:
```html
<a href="javascript:alert('XSS')">Click me</a>
```

### Where to Test:
- Component: Call to Action
- Field: Button URL

### Expected Result:
```html
<a href="#">Click me</a>
```
✅ **PASS**: javascript: replaced with #  
❌ **FAIL**: Alert popup on click

---

## 🧪 TEST 4: Data URI XSS

### Input:
```html
<a href="data:text/html,<script>alert('XSS')</script>">Click</a>
```

### Where to Test:
- Component: Social Links
- Field: Website URL

### Expected Result:
```html
<a href="#">Click</a>
```
or URL rejected entirely

✅ **PASS**: data: URI blocked  
❌ **FAIL**: Click opens dangerous page

---

## 🧪 TEST 5: Event Handler XSS

### Input:
```html
<div onclick="alert('XSS')">Click me</div>
```

### Where to Test:
- Component: Any rich text field

### Expected Result:
```html
<div>Click me</div>
```
✅ **PASS**: onclick removed  
❌ **FAIL**: Alert popup on click

---

## 🧪 TEST 6: Style XSS (expression)

### Input:
```html
<div style="background: expression(alert('XSS'))">Text</div>
```

### Where to Test:
- Component: Custom HTML

### Expected Result:
```html
<div>Text</div>
```
or style attribute completely removed

✅ **PASS**: Dangerous style removed  
❌ **FAIL**: Alert popup appears

---

## 🧪 TEST 7: Nested XSS

### Input:
```html
<div><p><span><script>alert('XSS')</script></span></p></div>
```

### Where to Test:
- Component: Biography
- Field: Full bio

### Expected Result:
```html
<div><p><span></span></p></div>
```
✅ **PASS**: Nested script removed  
❌ **FAIL**: Alert popup appears

---

## 🧪 TEST 8: Valid HTML (Should Pass)

### Input:
```html
<p>Hello <strong>World</strong>!</p>
<a href="https://example.com">Link</a>
<img src="image.jpg" alt="Description">
```

### Where to Test:
- Component: Biography

### Expected Result:
```html
<p>Hello <strong>World</strong>!</p>
<a href="https://example.com">Link</a>
<img src="image.jpg" alt="Description">
```
✅ **PASS**: Valid HTML preserved  
❌ **FAIL**: Content stripped or broken

---

## 🧪 TEST 9: URL Validation

### Test Valid URLs:
```
✅ https://example.com
✅ http://example.com
✅ mailto:test@example.com
✅ /relative/path
✅ #anchor
```

### Test Invalid URLs:
```
❌ javascript:alert('XSS')
❌ data:text/html,<script>alert('XSS')</script>
❌ vbscript:alert('XSS')
❌ file:///etc/passwd
```

### Where to Test:
- Component: Social Links
- All URL fields

### Expected:
- Valid URLs work normally
- Invalid URLs replaced with # or rejected

---

## 🧪 TEST 10: Performance Test

### Input:
50 components with HTML content

### Measure:
1. Save time: Should be < 2 seconds
2. Load time: Should be < 2 seconds  
3. Memory usage: Should be stable

### Tool:
```javascript
// Run in browser console
console.time('save');
await window.GMKB.stores.mediaKit.save();
console.timeEnd('save');
```

### Expected:
✅ **PASS**: < 2 seconds, no browser lag  
❌ **FAIL**: > 5 seconds or browser freezes

---

## 📊 TEST RESULTS TEMPLATE

```markdown
# XSS Sanitization Test Results

**Date**: [Date]
**Tester**: [Name]
**Browser**: [Browser + Version]
**Environment**: [Staging/Production]

## Results:

| Test | Status | Notes |
|------|--------|-------|
| 1. Script Tag | ✅/❌ | |
| 2. Image onerror | ✅/❌ | |
| 3. javascript: URL | ✅/❌ | |
| 4. data: URI | ✅/❌ | |
| 5. Event Handler | ✅/❌ | |
| 6. Style Expression | ✅/❌ | |
| 7. Nested XSS | ✅/❌ | |
| 8. Valid HTML | ✅/❌ | |
| 9. URL Validation | ✅/❌ | |
| 10. Performance | ✅/❌ | [Time] |

## Summary:
- **Passed**: X/10
- **Failed**: X/10
- **Overall**: ✅ PASS / ❌ FAIL

## Issues Found:
1. [Issue description]
2. [Issue description]

## Recommendations:
1. [Recommendation]
2. [Recommendation]
```

---

## 🚨 CRITICAL FAILURE SCENARIOS

### If ANY of These Happen - STOP IMMEDIATELY:

1. **Alert Popup Appears**: XSS protection failed
2. **Malicious Redirect**: URL sanitization failed
3. **Browser Crash**: Performance issue
4. **Data Loss**: Sanitization too aggressive
5. **Console Errors**: Integration broken

### Action:
1. Document the exact input that caused failure
2. Take screenshot
3. Check browser console for errors
4. Report to development team immediately
5. Do NOT deploy to production

---

## ✅ PASS CRITERIA

For deployment approval, must achieve:

- **9/10 tests passed** (minimum)
- **No critical XSS vulnerabilities**
- **Valid HTML preserved**
- **Performance acceptable** (<2s)
- **No regressions** (existing features work)

---

## 🔧 DEBUGGING TIPS

### If Test Fails:

1. **Check Browser Console**:
   ```javascript
   // See if sanitization happened
   window.GMKB.stores.mediaKit.components
   ```

2. **Check Network Tab**:
   - Look at save request payload
   - Verify data is sanitized before save

3. **Check DataValidator**:
   ```javascript
   // Test sanitization directly
   import { sanitizeHTML } from './services/XSSSanitizer.js';
   sanitizeHTML('<script>alert(1)</script>');
   ```

4. **Enable Debug Mode**:
   ```javascript
   window.gmkbData.debugMode = true;
   ```

---

**Testing Priority**: HIGHEST  
**Must Complete Before**: Production deployment  
**Estimated Time**: 15-30 minutes  
**Retest After**: Any code changes to sanitizer
