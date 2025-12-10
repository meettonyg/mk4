# PHASE 2: Batch Null Safety Fixes

## Remaining Fixes Needed

Looking at the errors, we need to add `?.` to MORE places in each component:

### 1. AuthorityHookRenderer - Line 65
**Error**: `props.data.subheadline`
**Fix**: Add `?.` to line 65

### 2. GuestIntroRenderer - Line 108  
**Error**: `props.data[`highlight_${i}`]`
**Fix**: Add `?.` before bracket access

### 3. QuestionsRenderer - Line 88
**Error**: `props.data[`question_${i}`]`
**Fix**: Add `?.` before bracket access

### 4. StatsRenderer - Line 51
**Error**: `props.data.description`
**Fix**: Add `?.` 

### 5. TopicsRenderer - Line 67
**Error**: `props.data[`topic_${i}`]`
**Fix**: Add `?.` before bracket access

## Strategy

We need to add null safety to ALL `props.data` accesses, not just the first one in each computed.

## Quick Fix Script

Find pattern: `props\.data(\[|\.)` 
Replace with: `props.data?$1`

But be careful - we already fixed some, so we need to skip lines with `?.` already.
