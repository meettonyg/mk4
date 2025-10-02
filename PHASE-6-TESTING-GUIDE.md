# Phase 6 Testing Guide

## 🧪 Testing Phase 6: Race Conditions & Optimization

This guide provides comprehensive testing procedures for Phase 6 improvements.

---

## Prerequisites

### Setup
1. Ensure you have Chrome DevTools open (F12)
2. Have the Console tab visible
3. Have the Network tab available
4. Enable "Preserve log" in Console and Network tabs

### Test Environment
- Browser: Chrome (latest), Firefox (latest), Safari (latest)
- WordPress: Latest version
- Plugin: Media Kit Builder v4.0-phase6

---

## Test Suite 1: Retry Logic

### Test 1.1: Network Failure Recovery
**Objective**: Verify automatic retry on network failure

**Steps**:
1. Open Media Kit Builder
2. Open Chrome DevTools → Network tab
3. Set throttling to "Offline"
4. Wait 2 seconds
5. Set throttling back to "No throttling"
6. Observe console

**Expected Results**:
- ✅ Console shows retry attempts: `⚠️ Attempt 1/3 failed, retrying in 1000ms...`
- ✅ Console shows retry attempts: `⚠️ Attempt 2/3 failed, retrying in 2000ms...`
- ✅ After going online, request succeeds
- ✅ Media kit loads successfully
- ✅ No errors in console

**Pass Criteria**: Media kit loads after network is restored

---

### Test 1.2: Slow Network Handling
**Objective**: Verify graceful handling of slow networks

**Steps**:
1. Open Media Kit Builder
2. Chrome DevTools → Network → Throttling → "Slow 3G"
3. Reload page
4. Observe loading screen and console

**Expected Results**:
- ✅ Loading screen shows immediately
- ✅ Loading progress visible
- ✅ Page eventually loads (may take 10-20 seconds)
- ✅ No timeout errors
- ✅ All components render correctly

**Pass Criteria**: Page loads successfully on slow network

---

### Test 1.3: API Error Recovery
**Objective**: Verify retry on API errors

**Steps**:
1. Open browser console
2. Run: `window.gmkbAPI.clearCache()`
3. In WordPress admin, temporarily disable the REST API plugin (if using)
4. Reload Media Kit Builder
5. Re-enable REST API after 5 seconds
6. Observe console

**Expected Results**:
- ✅ Console shows retry attempts
- ✅ After API is restored, request succeeds
- ✅ Media kit loads successfully

**Pass Criteria**: Successful recovery after API restoration

---

## Test Suite 2: Race Condition Prevention

### Test 2.1: Concurrent Load Requests
**Objective**: Verify no duplicate load requests

**Steps**:
1. Open Media Kit Builder
2. Open Network tab
3. Quickly press F5 (refresh) 3 times in rapid succession
4. Observe Network tab

**Expected Results**:
- ✅ Console shows: "⏳ Load already in progress, waiting..."
- ✅ Only ONE request to `/wp-json/gmkb/v2/mediakit/{id}` in Network tab
- ✅ All three reloads receive the same data
- ✅ No duplicate data loading

**Pass Criteria**: Only one actual API request made

---

### Test 2.2: Concurrent Save Requests
**Objective**: Verify no duplicate save requests

**Steps**:
1. Load Media Kit Builder
2. Add a component
3. Quickly click Save button 5 times rapidly
4. Observe Network tab and console

**Expected Results**:
- ✅ Console shows: "⏳ Save already in progress, waiting..."
- ✅ Only ONE POST request to `/wp-json/gmkb/v2/mediakit/{id}`
- ✅ All save attempts wait for the same promise
- ✅ Data saved correctly (check by reloading)

**Pass Criteria**: Only one actual save request made

---

### Test 2.3: Save During Load
**Objective**: Verify proper handling of save during load

**Steps**:
1. Open Media Kit Builder with slow network (Slow 3G)
2. While page is loading, attempt to make a change
3. Observe behavior

**Expected Results**:
- ✅ UI prevents interaction during load
- ✅ OR: Changes queue until load completes
- ✅ No data corruption
- ✅ Changes persist after load completes

**Pass Criteria**: No data loss or corruption

---

## Test Suite 3: Cache Behavior

### Test 3.1: Cache Hit Performance
**Objective**: Verify cache improves performance

**Steps**:
1. Open Media Kit Builder (fresh load)
2. Note load time in Network tab
3. Run: `window.GMKB.cacheStatus()`
4. Reload page (F5)
5. Run: `window.GMKB.cacheStatus()` again
6. Compare load times

**Expected Results**:
- ✅ First load makes API request
- ✅ Cache shows 1 entry after first load
- ✅ Second load uses cache (no API request if <1 min)
- ✅ Second load is faster

**Pass Criteria**: Cache reduces load time by >50%

---

### Test 3.2: Cache Expiration
**Objective**: Verify cache expires correctly

**Steps**:
1. Open Media Kit Builder
2. Run: `window.GMKB.cacheStatus()`
3. Note timestamp
4. Wait 65 seconds (cache TTL is 60s)
5. Reload page
6. Observe Network tab

**Expected Results**:
- ✅ After 65 seconds, cache is expired
- ✅ Reload makes fresh API request
- ✅ New data cached

**Pass Criteria**: Cache expires and refreshes

---

### Test 3.3: Cache Invalidation on Save
**Objective**: Verify cache clears after save

**Steps**:
1. Load Media Kit Builder
2. Run: `window.GMKB.cacheStatus()` (should show 1 entry)
3. Make a change and save
4. Run: `window.GMKB.cacheStatus()` again

**Expected Results**:
- ✅ Cache cleared after save
- ✅ Next load fetches fresh data

**Pass Criteria**: Cache empties after successful save

---

## Test Suite 4: Error Handling

### Test 4.1: Invalid Data Handling
**Objective**: Verify validation prevents bad data

**Steps**:
1. Open browser console
2. Try to add invalid component:
   ```javascript
   window.gmkbStore.addComponent({ type: 'invalid_type', data: {} })
   ```
3. Observe console

**Expected Results**:
- ✅ Console warning: "Invalid component type prevented"
- ✅ Component not added
- ✅ State remains valid
- ✅ No errors

**Pass Criteria**: Invalid data rejected gracefully

---

### Test 4.2: Nonce Expiration Handling
**Objective**: Verify graceful handling of expired nonce

**Steps**:
1. Open Media Kit Builder
2. Wait for nonce to expire (WordPress default: 12-24 hours)
3. OR manually invalidate nonce in localStorage
4. Try to save changes
5. Observe behavior

**Expected Results**:
- ✅ Save fails gracefully
- ✅ User notified of session expiration
- ✅ Option to refresh page
- ✅ Local backup preserved

**Pass Criteria**: User informed, data not lost

---

### Test 4.3: Large Data Size Handling
**Objective**: Verify size limit enforcement

**Steps**:
1. Open Media Kit Builder
2. Add many components (20+)
3. Add large amounts of text data
4. Attempt to save
5. Observe console

**Expected Results**:
- ✅ If data >3MB, error message shown
- ✅ Error: "State too large: X.XX MB (max 3MB)"
- ✅ Save prevented
- ✅ User advised to reduce data

**Pass Criteria**: Size limit enforced with clear message

---

## Test Suite 5: Loading States & UI Feedback

### Test 5.1: Loading Screen Display
**Objective**: Verify loading screen appears correctly

**Steps**:
1. Clear browser cache
2. Open Media Kit Builder
3. Observe initial load

**Expected Results**:
- ✅ Loading screen appears immediately
- ✅ Animated spinner visible
- ✅ Progress message shown
- ✅ Loading screen disappears when ready
- ✅ Smooth transition to main UI

**Pass Criteria**: Professional loading experience

---

### Test 5.2: Retry Feedback Display
**Objective**: Verify retry attempts visible to user

**Steps**:
1. Set network to "Offline" in DevTools
2. Open Media Kit Builder
3. After 2 seconds, go back online
4. Observe loading screen

**Expected Results**:
- ✅ Loading screen shows retry count
- ✅ "Attempt 1 of 3" displayed
- ✅ Error message shown
- ✅ Updates in real-time
- ✅ Success message on recovery

**Pass Criteria**: User informed of retry status

---

### Test 5.3: Error Screen Display
**Objective**: Verify error screen on critical failure

**Steps**:
1. Disable REST API completely
2. Try to load Media Kit Builder
3. Let all retries fail
4. Observe error screen

**Expected Results**:
- ✅ Error screen appears after all retries
- ✅ Clear error message displayed
- ✅ "Reload Page" button visible
- ✅ Professional appearance
- ✅ Button works when clicked

**Pass Criteria**: User can understand and recover from error

---

## Test Suite 6: Cross-Browser Testing

### Test 6.1: Chrome
**Browser**: Chrome (latest)
**Steps**: Run all above tests
**Pass Criteria**: All tests pass

### Test 6.2: Firefox
**Browser**: Firefox (latest)
**Steps**: Run all above tests
**Pass Criteria**: All tests pass

### Test 6.3: Safari
**Browser**: Safari (latest)
**Steps**: Run all above tests
**Pass Criteria**: All tests pass

### Test 6.4: Mobile Chrome
**Browser**: Chrome on Android
**Steps**: Run critical tests (1.1, 2.1, 4.1, 5.1)
**Pass Criteria**: Core functionality works

---

## Test Suite 7: Performance Testing

### Test 7.1: Load Time Measurement
**Objective**: Measure page load performance

**Steps**:
1. Open Chrome DevTools → Performance tab
2. Click "Record"
3. Load Media Kit Builder
4. Stop recording when page is interactive
5. Analyze results

**Expected Results**:
- ✅ Page interactive in <2 seconds (fast network)
- ✅ No blocking scripts
- ✅ Smooth rendering
- ✅ No layout shifts

**Pass Criteria**: Load time <2s, no performance warnings

---

### Test 7.2: Memory Usage
**Objective**: Verify no memory leaks

**Steps**:
1. Open Chrome DevTools → Memory tab
2. Take heap snapshot (Snapshot 1)
3. Add 10 components
4. Remove all components
5. Take heap snapshot (Snapshot 2)
6. Compare snapshots

**Expected Results**:
- ✅ Memory returns to near baseline
- ✅ No significant memory growth
- ✅ No detached DOM nodes

**Pass Criteria**: Memory usage stable

---

### Test 7.3: Cache Performance Impact
**Objective**: Measure cache performance benefit

**Steps**:
1. Clear cache: `window.gmkbAPI.clearCache()`
2. Measure load time (Network tab)
3. Reload page
4. Measure load time again (should use cache)
5. Calculate improvement

**Expected Results**:
- ✅ Cached load is significantly faster
- ✅ At least 50% improvement
- ✅ No API requests on cached load

**Pass Criteria**: >50% performance improvement with cache

---

## Debug Commands Reference

### Check System Status
```javascript
// Check cache status
window.GMKB.cacheStatus()

// Check in-flight requests
window.GMKB.inflightStatus()

// Check store state
window.gmkbStore.$state

// Check API service
window.gmkbAPI
```

### Manual Testing
```javascript
// Clear cache
window.gmkbAPI.clearCache()

// Force reload without cache
await window.gmkbAPI.load({ forceRefresh: true })

// Test save
await window.gmkbStore.save()

// Check local backup
window.gmkbStore.restoreFromLocalStorage()
```

### Simulate Errors
```javascript
// Simulate network error
window.gmkbAPI.restNonce = 'invalid'
await window.gmkbAPI.load() // Should retry and fail

// Reset
window.gmkbAPI.restNonce = window.gmkbData.restNonce
```

---

## Reporting Issues

### Information to Collect
When reporting issues, include:

1. **Browser**: Name and version
2. **Console Logs**: Copy all error messages
3. **Network Tab**: Screenshot of failed requests
4. **Steps to Reproduce**: Exact steps that cause the issue
5. **Expected vs Actual**: What should happen vs what happens
6. **Cache Status**: Output of `window.GMKB.cacheStatus()`
7. **State**: Output of `window.gmkbStore.$state`

### Example Issue Report
```
Title: Retry logic not working on network failure

Browser: Chrome 120.0.6099.109
Environment: Development

Steps to Reproduce:
1. Open Media Kit Builder
2. Set network to offline in DevTools
3. Wait 5 seconds
4. Set network back online

Expected: Should retry and load successfully
Actual: Shows error screen, does not retry

Console Output:
[Paste console logs]

Cache Status:
{
  entries: [],
  total: 0,
  totalSize: 0
}
```

---

## Test Results Template

Use this template to track test results:

```
## Phase 6 Test Results

Date: ___________
Tester: ___________
Environment: ___________

### Suite 1: Retry Logic
- [ ] 1.1 Network Failure Recovery
- [ ] 1.2 Slow Network Handling
- [ ] 1.3 API Error Recovery

### Suite 2: Race Condition Prevention
- [ ] 2.1 Concurrent Load Requests
- [ ] 2.2 Concurrent Save Requests
- [ ] 2.3 Save During Load

### Suite 3: Cache Behavior
- [ ] 3.1 Cache Hit Performance
- [ ] 3.2 Cache Expiration
- [ ] 3.3 Cache Invalidation on Save

### Suite 4: Error Handling
- [ ] 4.1 Invalid Data Handling
- [ ] 4.2 Nonce Expiration Handling
- [ ] 4.3 Large Data Size Handling

### Suite 5: Loading States & UI Feedback
- [ ] 5.1 Loading Screen Display
- [ ] 5.2 Retry Feedback Display
- [ ] 5.3 Error Screen Display

### Suite 6: Cross-Browser Testing
- [ ] 6.1 Chrome
- [ ] 6.2 Firefox
- [ ] 6.3 Safari
- [ ] 6.4 Mobile Chrome

### Suite 7: Performance Testing
- [ ] 7.1 Load Time Measurement
- [ ] 7.2 Memory Usage
- [ ] 7.3 Cache Performance Impact

### Issues Found
1. ___________
2. ___________
3. ___________

### Overall Result
- [ ] All tests passed
- [ ] Some tests failed (see issues)
- [ ] Critical issues found (do not deploy)
```

---

## Success Criteria

Phase 6 is complete when:

- ✅ All Test Suite 1-5 tests pass
- ✅ At least 2 browsers from Suite 6 pass
- ✅ Performance metrics from Suite 7 meet targets
- ✅ No critical issues found
- ✅ User experience is smooth and professional
- ✅ Error recovery works in all scenarios

---

## Next Steps After Testing

1. **Document Results**: Complete the test results template
2. **Fix Issues**: Address any failures found
3. **Retest**: Run failed tests again after fixes
4. **Deploy to Staging**: Test in staging environment
5. **User Acceptance**: Have users test the improvements
6. **Production Deployment**: Deploy with confidence!

**Good luck with testing! 🚀**
