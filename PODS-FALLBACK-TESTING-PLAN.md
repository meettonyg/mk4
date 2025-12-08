# Pods Data Fallback Testing Plan
**Date:** October 27, 2025  
**Phase:** Post-Enrichment Removal  
**Status:** ✅ IMPLEMENTATION COMPLETE - READY FOR TESTING

---

## 📋 CHANGES SUMMARY

### **Root Cause**
After archiving `class-enrichment.php`, components were missing Pods data fallback mechanism, causing empty/blank displays on new media kits despite Pods data being available in the store.

### **Solution Implemented**
Added `usePodsData()` composable integration to **Contact.vue** and **GuestIntro.vue**, completing the self-contained architecture pattern already established in Topics.vue and Questions.vue.

---

## ✅ COMPONENTS FIXED

| Component | File Path | Status | Pods Fields Added |
|-----------|-----------|--------|-------------------|
| Contact | `components/contact/Contact.vue` | ✅ Fixed | email, phone, website, address, linkedin, twitter, instagram, facebook |
| GuestIntro | `components/guest-intro/GuestIntro.vue` | ✅ Fixed | firstName, lastName, fullName, position, company |
| Biography | `components/biography/Biography.vue` | ✅ Already Fixed | biography |
| Hero | `components/hero/Hero.vue` | ✅ Already Fixed | firstName, lastName, fullName, position |
| Topics | `components/topics/Topics.vue` | ✅ Already Fixed | topics array |
| Questions | `components/questions/Questions.vue` | ✅ Already Fixed | questions array |

---

## 🔧 COMPOSABLE UPDATES

### **File:** `src/composables/usePodsData.js`
**Changes:** Added direct access fields for Contact component

```javascript
// New fields added:
website: computed(() => store.podsData?.website || ''),
address: computed(() => store.podsData?.address || ''),
twitter: computed(() => store.podsData?.twitter || ''),
facebook: computed(() => store.podsData?.facebook || ''),
instagram: computed(() => store.podsData?.instagram || ''),
linkedin: computed(() => store.podsData?.linkedin || ''),
headshot: computed(() => store.podsData?.guest_headshot || ''),
```

---

## 🧪 TESTING SCENARIOS

### **Test 1: New Empty Media Kit**
**Objective:** Verify components display Pods data when no saved component data exists

**Steps:**
1. Create a new media kit (no saved components)
2. Ensure Pods data is populated (check Pods CPT fields)
3. Add components to media kit: Biography, Hero, Contact, GuestIntro, Topics, Questions
4. Verify each component displays Pods data without errors

**Expected Results:**
- ✅ Biography shows Pods biography text
- ✅ Hero shows Pods first name + last name / position
- ✅ Contact shows Pods email, phone, website, social links
- ✅ GuestIntro shows Pods name, position, company
- ✅ Topics shows Pods topics (topic_1 through topic_10)
- ✅ Questions shows Pods questions (question_1 through question_10)

**Failure Indicators:**
- ❌ "No biography available" when Pods has biography
- ❌ "Guest Name" when Pods has first/last name
- ❌ Empty contact fields when Pods has email/phone
- ❌ Component placeholders when Pods data exists

---

### **Test 2: User Customization Override**
**Objective:** Verify component saved data takes precedence over Pods data

**Steps:**
1. Create media kit with components showing Pods data
2. Edit a component and customize fields (e.g., change email in Contact)
3. Save changes
4. Reload page

**Expected Results:**
- ✅ Customized fields show user input (not Pods data)
- ✅ Non-customized fields still show Pods fallback
- ✅ No data loss on save/reload

**Example:**
- User changes Contact email from `pods@example.com` to `custom@example.com`
- Contact shows `custom@example.com` (user data)
- Phone still shows Pods phone number (fallback)

---

### **Test 3: Mixed Data Sources**
**Objective:** Verify 3-tier fallback works correctly

**Steps:**
1. Create media kit with some component data saved
2. Leave some fields empty in saved data
3. Verify fallback behavior

**Expected Data Flow:**
```
Tier 1: Check component saved data
↓ (if empty)
Tier 2: Check Pods data from store
↓ (if empty)
Tier 3: Show empty string or default
```

**Example - Contact Component:**
- Email: Saved = `user@example.com` → Shows `user@example.com` ✅
- Phone: Saved = empty, Pods = `555-1234` → Shows `555-1234` ✅
- Website: Saved = empty, Pods = empty → Shows nothing ✅

---

### **Test 4: Console Verification**
**Objective:** Verify no errors or warnings in browser console

**Steps:**
1. Open browser DevTools console
2. Load media kit builder
3. Add components
4. Check for errors

**Expected Results:**
- ✅ No "undefined" errors for Pods fields
- ✅ No "Cannot read property of null" errors
- ✅ usePodsData returns proper computed refs
- ✅ All component mounts successfully

---

### **Test 5: Frontend Display**
**Objective:** Verify frontend (public view) matches builder preview

**Steps:**
1. Create media kit with components using Pods data
2. Save media kit
3. View frontend (public URL)
4. Compare with builder preview

**Expected Results:**
- ✅ Builder preview matches frontend exactly
- ✅ All Pods data displays on frontend
- ✅ WYSIWYG is maintained
- ✅ No layout differences

---

## 🔍 DEBUGGING CHECKLIST

If tests fail, check these items:

### **1. Store Initialization**
```javascript
// In browser console:
const store = window.gmkbStore || window.stateManager?.store;
console.log('Pods Data:', store?.podsData);
// Should show object with Pods fields
```

### **2. Composable Return Values**
```javascript
// In component, add temporary logging:
const { email } = usePodsData();
console.log('Email from Pods:', email.value);
// Should show Pods email or empty string
```

### **3. Component Props**
```javascript
// Check props received by component:
console.log('Component Data:', props.data);
console.log('Component Props:', props.props);
// Should show saved component data or empty object
```

### **4. Computed Values**
```javascript
// In component:
const email = computed(() => {
  console.log('Checking email sources:');
  console.log('  props.data.email:', props.data?.email);
  console.log('  podsEmail.value:', podsEmail.value);
  // Debug fallback logic
});
```

---

## 📊 ACCEPTANCE CRITERIA

### ✅ All Tests Must Pass:
- [ ] Test 1: New Empty Media Kit
- [ ] Test 2: User Customization Override
- [ ] Test 3: Mixed Data Sources
- [ ] Test 4: Console Verification
- [ ] Test 5: Frontend Display

### ✅ Code Quality:
- [ ] No console errors
- [ ] No undefined warnings
- [ ] Consistent with Topics/Questions pattern
- [ ] Passes Developer Checklist (Phase 1-5)

### ✅ User Experience:
- [ ] Components never show "No data" when Pods has data
- [ ] User customization always takes precedence
- [ ] Builder preview matches frontend exactly
- [ ] No performance degradation

---

## 🚨 ROLLBACK PLAN

If critical issues are found:

### **Option A: Quick Fix**
1. Identify specific component with issue
2. Apply targeted fix to that component
3. Re-test only affected component

### **Option B: Temporary Restore**
1. Un-archive `includes/class-enrichment.php`
2. Re-enable enrichment registration in `includes/enqueue.php`
3. Create ticket for proper fix

### **Option C: Full Rollback**
1. Revert Contact.vue to previous version
2. Revert GuestIntro.vue to previous version
3. Revert usePodsData.js changes
4. Test stability
5. Plan new approach

---

## 📝 NOTES

### **Implementation Details**
- All components now use identical Pods fallback pattern
- No centralized enrichment needed (architectural win)
- Each component is truly self-contained
- Fallback logic is explicit and traceable

### **Performance Impact**
- ✅ No additional API calls (data already in store)
- ✅ Computed properties cached by Vue
- ✅ No polling or setTimeout loops
- ✅ Event-driven reactivity

### **Maintenance Benefits**
- Easier to debug (check component directly)
- Consistent pattern across all components
- No hidden "magic" from enrichment file
- Clear data flow: Store → Composable → Component

---

## 🎯 NEXT ACTIONS

1. **Build Project** - Ensure Vue components compile
   ```bash
   npm run build
   ```

2. **Run Tests** - Execute all test scenarios above

3. **Document Results** - Record which tests pass/fail

4. **Production Deploy** - If all tests pass
   - Update changelog
   - Deploy to staging first
   - Monitor for issues
   - Deploy to production

5. **Monitor** - Watch for:
   - User reports of blank components
   - Console errors in production
   - Performance metrics

---

## ✅ SIGN-OFF

### **Developer Checklist Verification**

#### Phase 1: Architectural Integrity ✅
- [x] No Polling
- [x] Event-Driven Initialization
- [x] Dependency-Awareness
- [x] No Global Object Sniffing
- [x] Root Cause Fix

#### Phase 2: Code Quality ✅
- [x] Simplicity First
- [x] No Redundant Logic
- [x] Maintainability
- [x] Documentation

#### Phase 3: State Management ✅
- [x] Centralized State
- [x] No Direct Manipulation

#### Phase 4: Error Handling ✅
- [x] Graceful Failure
- [x] Empty string fallback prevents errors

#### Phase 5: WordPress Integration ✅
- [x] No PHP changes required
- [x] Pure Vue component updates

---

**Testing Window:** Immediate  
**Expected Duration:** 30-60 minutes  
**Priority:** HIGH - Blocks empty media kit functionality  
**Risk Level:** LOW - Follows proven pattern from Topics/Questions
