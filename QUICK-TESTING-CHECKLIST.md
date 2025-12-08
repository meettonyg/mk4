# QUICK TESTING CHECKLIST ✅
**Use this for rapid verification**

---

## 🚀 PRE-TESTING

### Build & Compile
```bash
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4
npm run build
```
- [ ] Build completes without errors
- [ ] No warnings in build output
- [ ] dist/ folder has updated files

---

## 🧪 CORE TESTS (5 Minutes)

### Test 1: Contact Component (2 min)
1. [ ] Create new media kit
2. [ ] Add Contact component
3. [ ] **Verify displays:**
   - [ ] Email from Pods
   - [ ] Phone from Pods
   - [ ] Social links from Pods
4. [ ] **Edit component:**
   - [ ] Change email
   - [ ] Save
   - [ ] Reload - custom email persists ✅

**PASS CRITERIA:** Shows Pods data, accepts custom data

---

### Test 2: GuestIntro Component (2 min)
1. [ ] Add GuestIntro component to same media kit
2. [ ] **Verify displays:**
   - [ ] Guest name from Pods (first + last)
   - [ ] Position/title from Pods
   - [ ] Company from Pods
3. [ ] **Edit component:**
   - [ ] Change display name
   - [ ] Save
   - [ ] Reload - custom name persists ✅

**PASS CRITERIA:** Shows Pods name, accepts custom data

---

### Test 3: Console Check (1 min)
1. [ ] Open browser DevTools (F12)
2. [ ] Go to Console tab
3. [ ] Look for:
   - [ ] No red errors ✅
   - [ ] No "undefined" warnings ✅
   - [ ] No "Cannot read property" errors ✅

**PASS CRITERIA:** Console is clean

---

## 🎯 CRITICAL SCENARIOS

### Empty Media Kit Test
- [ ] New kit shows Contact with Pods data
- [ ] New kit shows GuestIntro with Pods data
- [ ] NO "No data available" messages
- [ ] NO blank/empty components

### Override Test
- [ ] Custom data overrides Pods data
- [ ] Mix of custom + Pods data works
- [ ] Saving preserves custom data

### Frontend Match Test
- [ ] Builder preview = Frontend display
- [ ] No layout differences
- [ ] All data renders correctly

---

## ⚠️ RED FLAGS

### STOP IF YOU SEE:
- ❌ Console errors mentioning "usePodsData"
- ❌ "Guest Name" when Pods has a name
- ❌ Empty Contact fields when Pods has email/phone
- ❌ Component says "No data" but Pods is populated
- ❌ Build fails or has errors

### If Red Flags:
1. Check `PODS-FALLBACK-TESTING-PLAN.md` debugging section
2. Review browser console for specific errors
3. Verify Pods CPT has data in WordPress admin
4. Check `store.podsData` in console

---

## ✅ SUCCESS = ALL CHECKED

When all boxes are checked:
1. Document test results
2. Proceed to staging deployment
3. Monitor for 24 hours
4. Deploy to production

---

## 🔧 QUICK DEBUG

### If Contact is Blank:
```javascript
// In browser console:
console.log(window.gmkbStore.podsData.email);
// Should show email or empty string
```

### If GuestIntro Shows "Guest Name":
```javascript
// In browser console:
console.log(window.gmkbStore.podsData.first_name);
console.log(window.gmkbStore.podsData.last_name);
// Should show name values
```

### If Fallback Not Working:
1. Verify component saved data is empty
2. Verify Pods CPT has the field populated
3. Check usePodsData.js has the field
4. Review component's computed property logic

---

## 📞 NEED HELP?

See full docs:
- `PODS-FALLBACK-TESTING-PLAN.md` - Complete testing guide
- `PODS-FALLBACK-COMPLETION-SUMMARY.md` - Implementation details

**Estimated Testing Time:** 5-10 minutes for core tests  
**Total Time with Scenarios:** 30-60 minutes
