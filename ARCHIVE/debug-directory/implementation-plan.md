# MKCG Auto-Load Fix Implementation Plan

## Investigation Summary

After thorough code review, the Media Kit Builder already has comprehensive automatic MKCG data loading implemented in multiple layers:

1. **Main Plugin**: Auto-detects post IDs from URL parameters
2. **Script Manager**: Auto-loads MKCG data into `window.guestifyData.mkcgData`
3. **Template**: Auto-displays MKCG dashboard with data metrics

## Root Cause Analysis

The manual "Load" button likely exists due to one of these issues:

### Issue 1: Missing URL Parameter ❌
**Problem**: No `?post_id=123` in URL when accessing Media Kit Builder
**Solution**: Ensure URL includes post ID parameter

### Issue 2: Race Condition ⚠️
**Problem**: JavaScript initializes before MKCG data is ready
**Solution**: Fix initialization timing

### Issue 3: Data Detection Failure 🔍
**Problem**: Post exists but has no MKCG meta data
**Solution**: Validate MKCG data exists in post

### Issue 4: Button is Actually "Refresh" 🔄
**Problem**: Button is for refreshing stale data, not initial load
**Solution**: Rename button and improve UX

## Implementation Phases

### Phase 1: Diagnostic (IMMEDIATE)
1. Run diagnostic script in browser console
2. Check URL parameters and guestifyData object
3. Verify automatic loading status

### Phase 2: Fix Root Issues (15 minutes)
1. Enhance URL parameter detection
2. Fix initialization timing
3. Improve error handling
4. Update button functionality

### Phase 3: UX Enhancement (10 minutes)
1. Remove/rename manual load button
2. Add automatic loading indicators
3. Improve empty state handling
4. Add data refresh functionality

## Expected Outcome

✅ MKCG data loads automatically when page loads with `?post_id=123`
✅ No manual "Load" button needed for initial data
✅ Optional "Refresh" button for updating stale data
✅ Clear visual indicators of data loading status
✅ Proper error handling for missing data scenarios

## Ready to Implement?

Would you like me to:
1. **First run the diagnostic** to identify the exact issue?
2. **Skip to implementation** based on most likely scenarios?
3. **Focus on specific area** you suspect is causing the problem?

The fix should take 15-30 minutes total depending on the root cause discovered.
