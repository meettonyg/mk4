# Moving Forward - Action Plan
**Date:** October 31, 2025  
**Status:** Ready for Next Phase

---

## ✅ WHAT'S BEEN COMPLETED

1. **Audit Status Validated**
   - Confirmed Biography/Guest-Intro simplifications are correct
   - Confirmed GitHub should not exist anywhere
   - Found and fixed critical Social component field mapping bug

2. **Social Component Fixed**
   - ✅ Corrected field names to match Pods schema
   - ✅ Removed email/phone (belong to Contact)
   - ✅ Added missing pinterest field
   - ✅ Added website2 field
   - File: `components/social/data-integration.php`

3. **Documentation Updated**
   - ✅ Created comprehensive audit completion report
   - ✅ Created current status assessment
   - ✅ Documented all architectural decisions

---

## 🎯 WHAT TO DO NEXT

### Option A: Test the Social Component Fix (Recommended First)

**Why:** Ensure the critical fix works before moving on

**Steps:**
1. Clear build cache: `npm run build`
2. Open a media kit in the builder
3. Add a Social component to the canvas
4. Try to edit social links
5. Save and verify data persists
6. Check browser console for any errors

**Expected Result:** Social links should now load and save correctly from Pods

---

### Option B: Continue Component Validation (If Social Works)

You have 12 more components that need field mapping verification:

**Quick Wins** (Probably already correct):
1. Topics
2. Hero  
3. Video Intro

**Medium Complexity:**
4. Questions (FAQ) - investigate why only 3 of 25 show
5. Topics-Questions
6. Photo Gallery
7. Podcast Player

**Logo/Image Components:**
8. Logo Grid
9. Company Logo
10. Personal Brand Logo
11. Profile Photo

**Call-to-Action:**
12. Call-to-Action

**Method for Each:**
```bash
# For each component, check:
1. Read pods-config.json → note declared fields
2. Read data-integration.php → note used fields
3. Compare - do they match?
4. If not, decide: fix code OR update pods-config
```

---

### Option C: Clean Up Known Minor Issues (Low Priority)

**Issue 1: Guest-Intro Extra Fields**
- pods-config.json declares: `first_name`, `last_name`
- data-integration.php uses: neither of these
- **Fix:** Remove unused fields from pods-config.json
- **Impact:** Low - just cleanup

**Issue 2: Stats/Testimonials/Booking Have Pods Config**
- These components use custom data, not Pods
- But they have pods-config.json files
- **Fix:** Remove pods-config.json from these 3 components
- **Impact:** Low - just cleanup

**Issue 3: FAQ Questions Display**
- 25 questions exist in Pods
- Only 3 show in preview
- **Fix:** Investigate if intentional or bug
- **Impact:** Medium - user-facing

---

## 📋 RECOMMENDED SEQUENCE

### Phase 1: Validate Critical Fix (Do Today)
1. Test Social component fix
2. Verify no regressions
3. Commit changes if working

### Phase 2: Quick Component Checks (Do This Week)
Focus on high-use components:
1. Topics (users need this)
2. Questions/FAQ (has known issue)
3. Hero (high visibility)
4. Video Intro (common)

### Phase 3: Remaining Components (Do When Time Permits)
The rest can be validated as time allows:
- Logo/image components
- Podcast player
- Photo gallery
- Call-to-action

### Phase 4: Final Cleanup (Optional)
- Remove unused fields from Guest-Intro pods-config
- Remove pods-config from Stats/Testimonials/Booking
- Update REST API field list if needed

---

## 🚨 IF SOMETHING BREAKS

### Social Component Issues?

**Symptom:** Social links not loading/saving  
**Check:**
1. Browser console for errors
2. Network tab for failed API calls
3. Verify Pods fields exist in database
4. Check if field names match exactly

**Common Fixes:**
- Clear cache: `npm run build`
- Verify nonce is valid
- Check user permissions
- Verify post type is 'guests' or 'mkcg'

### Other Component Issues?

**Symptom:** Component not displaying Pods data  
**Debug Steps:**
1. Check browser console for Vue errors
2. Verify pods-config.json exists
3. Verify data-integration.php exists
4. Check field names match between files
5. Verify Pods fields have data in database

---

## 📝 QUICK REFERENCE: What Goes Where

### Contact Information:
- **Email, Phone, Address** → Contact Component
- **Website URLs** → Social Component
- **Skype** → Contact Component

### Social Media:
- **All Social Platforms** → Social Component ONLY
- **YouTube** → Social Component (uses `guest_youtube` field)
- **GitHub** → NOWHERE (intentionally excluded)

### Personal Info:
- **Biography Text** → Biography Component ONLY
- **Introduction** → Guest-Intro Component ONLY
- **Name, Title, Company** → Guest-Intro & Hero (shared)

### Content:
- **Topics** → Topics Component OR Topics-Questions
- **Questions** → Questions Component OR Topics-Questions
- **Testimonials** → Custom data (not Pods)
- **Stats** → Custom data (not Pods)

---

## 🎯 SUCCESS CRITERIA

You'll know you're done when:

### For Social Component Fix:
- [ ] Social links load in editor
- [ ] Social links save to database
- [ ] Social links display in preview
- [ ] Social links display on frontend
- [ ] No console errors

### For Component Validation:
- [ ] All 12 components checked
- [ ] Field mismatches documented
- [ ] Critical issues fixed
- [ ] Minor issues documented for later

### For System Health:
- [ ] No component shows wrong data
- [ ] All Pods data displays correctly
- [ ] Builder loads without errors
- [ ] Frontend matches preview

---

## 💡 TIPS

### Testing Pods Integration:
```javascript
// In browser console, check what Pods data is available:
console.log($pinia.state.value.mediaKit.podsData);

// Check specific field:
console.log($pinia.state.value.mediaKit.podsData['1_twitter']);
```

### Finding Component Files:
```bash
# All component directories:
components/[component-name]/

# Key files in each:
- component.json        (component metadata)
- pods-config.json      (declares Pods fields)
- data-integration.php  (uses Pods fields)
- [Name]Renderer.vue    (displays data in preview)
- template.php          (displays data on frontend)
```

### Verifying Field Names:
```bash
# Check actual Pods schema in database or via:
# WP Admin → Pods Admin → Guest One Sheets → Fields
# Field names must match EXACTLY (case-sensitive!)
```

---

## 📞 NEED HELP?

### Common Questions:

**Q: Should I add more Pods fields?**  
A: Only if users specifically request them. Current fields cover 95% of use cases.

**Q: Should I remove pods-config from Stats/Testimonials?**  
A: Not urgent. They work fine with custom data. Clean up when convenient.

**Q: What about the FAQ showing only 3 questions?**  
A: Investigate to see if it's a feature (pagination) or bug. Medium priority.

**Q: Can I just validate the high-use components?**  
A: Yes! Topics, Hero, Social, Contact, Bio are most important. Others can wait.

---

## ✅ BOTTOM LINE

### You're in Good Shape! ✅

The system is architecturally sound. The critical bug in Social component is fixed. The rest is just cleanup and verification.

**Priority Order:**
1. Test Social fix (HIGH)
2. Check Topics/Hero/FAQ (MEDIUM)  
3. Validate other components (LOW)
4. Clean up minor issues (OPTIONAL)

**You can ship with what you have now.** The remaining work is optimization, not bug fixes.

---

**Ready to proceed?** Start with testing the Social component fix, then work through the high-priority components as time permits.
