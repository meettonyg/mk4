# Security & Code Audit Report

**Project:** Guestify Media Kit Builder (GMKB)
**Version:** 4.0.0
**Date:** 2025-11-22
**Auditor:** Automated Code Review

---

## Executive Summary

This comprehensive audit identified **92 issues** across the codebase:

| Severity | Count | Priority |
|----------|-------|----------|
| **Critical** | 8 | Immediate fix required |
| **High** | 22 | Fix within 1-2 sprints |
| **Medium** | 35 | Plan for upcoming releases |
| **Low** | 27 | Address as time permits |

The most significant issues involve:
1. Missing CSRF/nonce verification on form submissions
2. REST API permission callbacks returning `true` for all requests
3. Debug mode bypassing security checks
4. Memory leaks from uncleaned timers/subscriptions
5. NPM dependency vulnerabilities

---

## Critical Issues (Immediate Action Required)

### 1. Missing CSRF Protection - Admin Cache Page
**File:** `includes/class-gmkb-admin.php:81-88`

The admin cache page processes form submissions without verifying the nonce that was added to the form.

```php
// VULNERABLE: No nonce verification before processing
if (isset($_POST['clear_cache'])) {
    $this->component_discovery->clearCache();
}
```

**Fix:** Add nonce verification:
```php
if (isset($_POST['clear_cache']) && check_admin_referer('gmkb_cache_action')) {
```

---

### 2. Nonce Bypass in Debug Mode
**File:** `includes/class-gmkb-ajax.php:70-80`

When `WP_DEBUG` is enabled and no nonce is provided, security verification is completely skipped.

```php
if (!$nonce_provided && (!defined('WP_DEBUG') || !WP_DEBUG)) {
    wp_send_json_error('Nonce required');
    return;
}
// In WP_DEBUG mode, request proceeds WITHOUT nonce!
```

**Fix:** Always require nonce verification:
```php
if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
    wp_send_json_error('Security verification failed');
    return;
}
```

---

### 3. Conditional Nonce Check Allows Bypass
**File:** `includes/class-gmkb-ajax.php:202, 234`

```php
// VULNERABLE: Only checks IF nonce provided
if (isset($_POST['nonce']) && !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
```

**Fix:** Require nonce to be present:
```php
if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
```

---

### 4. REST API Read Permissions Always Return True
**File:** `includes/api/v2/class-gmkb-rest-api-v2.php:717-742`

```php
public function check_read_permissions($request) {
    // Always allow read access for now
    return true;  // CRITICAL: No actual permission check!
}
```

**Fix:** Implement proper permission checks based on post status and user capabilities.

---

### 5. Cookie Auth Bypass for Logged-in Users
**File:** `includes/api/v2/class-gmkb-rest-api-v2.php:57-85`

This filter deliberately bypasses WordPress REST API nonce verification for logged-in users with edit capabilities, defeating CSRF protection.

**Fix:** Remove this bypass and properly handle nonce refresh on the frontend.

---

### 6. Unauthenticated Topics Save Endpoint
**File:** `components/topics/save-handler.php:24-25`

```php
add_action('wp_ajax_gmkb_save_topics_to_pods', array($this, 'save_topics_to_pods'));
add_action('wp_ajax_nopriv_gmkb_save_topics_to_pods', array($this, 'save_topics_to_pods')); // VULNERABLE
```

**Fix:** Remove `wp_ajax_nopriv_` registration for write operations.

---

### 7. Missing Post-Level Authorization in Topics Save
**File:** `components/topics/save-handler.php:28-107`

The handler verifies nonce but doesn't check if the user has permission to edit the specific post.

**Fix:** Add capability check:
```php
if (!current_user_can('edit_post', $post_id)) {
    wp_send_json_error('You do not have permission to edit this post');
    return;
}
```

---

### 8. XSS Risk in stripHTML Function
**File:** `src/services/XSSSanitizer.js:522-529`

```javascript
export function stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;  // Can execute scripts before textContent extraction
    return div.textContent || div.innerText || '';
}
```

**Fix:** Use DOMParser instead:
```javascript
const doc = new DOMParser().parseFromString(html, 'text/html');
return doc.body.textContent || '';
```

---

## High Severity Issues

### REST API & Authorization

| # | File | Line | Issue |
|---|------|------|-------|
| 1 | `api/class-rest-theme-controller.php` | 56-67 | Custom theme GET endpoint uses `__return_true` |
| 2 | `api/ComponentDiscoveryAPI.php` | 26-43 | Discovery endpoints publicly accessible |
| 3 | `api/rest-api-templates.php` | 64-93 | Template endpoint includes PHP files from user input |
| 4 | `api/class-rest-theme-controller.php` | 376-412 | Set theme without post-level authorization |
| 5 | `import/ImportManager.php` | 91 | Unsanitized import data from POST |
| 6 | `marketplace/ComponentPackageManager.php` | 354-357 | MIME type check can be spoofed |
| 7 | `admin/media-kit-viewer.php` | 89-97 | SQL query without `$wpdb->prepare()` |

### JavaScript/Vue Issues

| # | File | Line | Issue |
|---|------|------|-------|
| 8 | `stores/mediaKit.js` | 286-316 | Race condition in store initialization |
| 9 | `utils/deepClone.js` | 38-44 | Potential null pointer with `hasOwnProperty` |
| 10 | `services/APIService.js` | 251-260 | Theme path mismatch between API and code |
| 11 | `api/v2/class-gmkb-rest-api-v2.php` | 481-493 | `update_post_meta` return value misinterpreted |

---

## Medium Severity Issues

### Memory Leaks & Resource Management

| # | File | Line | Issue |
|---|------|------|-------|
| 1 | `vue/components/GenericEditor.vue` | 111-122 | `updateTimeout` not cleared on unmount |
| 2 | `vue/components/SectionLayoutEnhanced.vue` | 1106 | `autoSaveTimer` not cleared on unmount |
| 3 | `stores/mediaKit.js` | 1698-1708 | `retryTimeout` not cleared on store destroy |
| 4 | `utils/debounce.js` | 27-49 | Missing `cancel()` method - used in 3+ places |

### Missing Output Escaping

| # | File | Line | Issue |
|---|------|------|-------|
| 5 | `admin/diagnostic-tools.php` | 255-279 | Values echoed without escaping |
| 6 | `admin/media-kit-viewer.php` | 180-315 | Multiple unescaped outputs |

### State Management Issues

| # | File | Line | Issue |
|---|------|------|-------|
| 7 | `stores/mediaKit.js` | 1525-1530 | References to moved UI state properties |
| 8 | `stores/mediaKit.js` | 210-215 | `editingComponent` getter references undefined property |
| 9 | `vue/components/GenericEditor.vue` | 121 | Assigns to computed getter `hasUnsavedChanges` |

### DOM & Security

| # | File | Line | Issue |
|---|------|------|-------|
| 10 | `services/ToastService.js` | 153 | `innerHTML` with user content |
| 11 | `vue/components/DevicePreview.vue` | 10 | `v-html` directive with dynamic content |
| 12 | `main.js` | 610-624 | Error message in `innerHTML` |

### API Issues

| # | File | Line | Issue |
|---|------|------|-------|
| 13 | Multiple files | - | Same nonce `gmkb_nonce` for all actions |
| 14 | All API files | - | No rate limiting on any endpoint |
| 15 | `api/v2/class-gmkb-rest-api-v2.php` | 364-370 | Exception messages exposed to users |

---

## Low Severity Issues

### Code Quality

| # | Issue | Files Affected |
|---|-------|----------------|
| 1 | Console logs without environment guards | Throughout codebase |
| 2 | Magic numbers without constants | `DataValidator.js`, others |
| 3 | Inconsistent `intval()` vs `absint()` for post IDs | Multiple PHP files |
| 4 | Missing PHP type hints | `ComponentDiscovery.php` |
| 5 | Dead code - commented permission check | `class-gmkb-rest-api-v2.php:721-741` |
| 6 | Version defined twice | `guestify-media-kit-builder.php:44-49` |
| 7 | Inconsistent hook priorities | Main plugin file |
| 8 | Debug logging always active | `component-data-sanitization.php:49-55` |

### Configuration Issues

| # | Issue | File |
|---|-------|------|
| 9 | Hardcoded cache duration (300s) | `class-gmkb-rest-api-v2.php:37` |
| 10 | `REQUEST_URI` used without sanitization | `enqueue.php:73-80` |
| 11 | Path info exposed in API responses | `ComponentDiscoveryAPI.php:114, 127` |
| 12 | Fallback themes hardcoded, may drift | `enqueue.php:956-1006` |

---

## NPM Dependency Vulnerabilities

```
Total Vulnerabilities: 10
- Critical: 0
- High: 6
- Moderate: 2
- Low: 2
```

### Key Vulnerabilities

| Package | Severity | Issue | Fix |
|---------|----------|-------|-----|
| `esbuild` | Moderate | Dev server can be accessed by any website | Update vite |
| `tar-fs` | High | Arbitrary file write via symlink | Update lighthouse to v13+ |
| `cookie` | Low | Out of bounds characters accepted | Update lighthouse to v13+ |

**Recommended Action:**
```bash
npm update lighthouse --save-dev
npm audit fix
```

---

## Build Configuration Notes

### Vite Config Review (`vite.config.js`)

1. **Console stripping disabled** (Line 123-124):
   ```javascript
   drop: [], // TEMPORARILY DISABLED for debugging
   ```
   This should be re-enabled for production.

2. **Source maps in development only** - Good practice

3. **Tree shaking enabled** with XSS sanitizer preserved - Correct

---

## Recommendations by Priority

### Immediate (Critical)
1. Fix all CSRF/nonce verification issues in admin and AJAX handlers
2. Implement proper REST API permission callbacks
3. Remove debug mode security bypasses
4. Add post-level authorization checks

### Short-term (High)
1. Replace all `__return_true` permission callbacks
2. Sanitize all user inputs before processing
3. Add MIME verification for file uploads (check actual content)
4. Fix memory leaks by adding cleanup in `onUnmounted`

### Medium-term (Medium)
1. Implement rate limiting on API endpoints
2. Use action-specific nonces instead of generic `gmkb_nonce`
3. Add output escaping to all admin templates
4. Update npm dependencies to fix vulnerabilities
5. Add `cancel()` method to debounce utility

### Long-term (Low)
1. Add comprehensive PHP type hints
2. Standardize logging format and environment checks
3. Document hook priorities
4. Remove dead code and consolidate version constants

---

## Positive Findings

The codebase demonstrates several good security practices:

1. **Direct file access protection** - All PHP files check `if (!defined('ABSPATH'))`
2. **Capability checks** - Most handlers verify `current_user_can()`
3. **Input sanitization** - Many inputs use `intval()`, `sanitize_text_field()`
4. **XSS sanitization service** - Dedicated XSSSanitizer for content filtering
5. **Component package validation** - Blocks dangerous PHP functions
6. **Data size limits** - POST data limited to 10MB

---

## Files Requiring Immediate Attention

1. `includes/class-gmkb-admin.php` - Add nonce verification
2. `includes/class-gmkb-ajax.php` - Remove debug bypasses, fix conditional nonces
3. `includes/api/v2/class-gmkb-rest-api-v2.php` - Implement real permission checks
4. `components/topics/save-handler.php` - Remove nopriv, add capability check
5. `src/services/XSSSanitizer.js` - Fix stripHTML function
6. `src/utils/debounce.js` - Add cancel method

---

*Report generated by automated code review*
