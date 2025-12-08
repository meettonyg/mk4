# Section Settings Sidebar - Testing Guide

## Quick Test Checklist

### Basic Functionality
- [ ] 1. Click the settings icon on any section
- [ ] 2. Panel slides in from the right side
- [ ] 3. Panel shows current section settings
- [ ] 4. Panel has semi-transparent overlay behind it

### Layout Changes
- [ ] 5. Click "Full Width" layout option
- [ ] 6. Section updates to full width layout
- [ ] 7. Click "Two Columns" layout option
- [ ] 8. Section updates to two column layout
- [ ] 9. Click "Three Columns" layout option
- [ ] 10. Section updates to three column layout

### Background Settings
- [ ] 11. Click the color picker
- [ ] 12. Select a different color
- [ ] 13. Section background updates
- [ ] 14. Adjust opacity slider
- [ ] 15. Section background opacity changes

### Spacing Settings
- [ ] 16. Change "Padding" dropdown to "Large"
- [ ] 17. Section padding increases
- [ ] 18. Change "Gap" dropdown to "Small"
- [ ] 19. Gap between items decreases

### Advanced Settings
- [ ] 20. Check "Full Width Container"
- [ ] 21. Container expands to full width
- [ ] 22. Check "Reverse Columns on Mobile"
- [ ] 23. Setting is saved (verify in mobile preview)
- [ ] 24. Type a custom CSS class
- [ ] 25. Class is applied to section

### Saving & Closing
- [ ] 26. Click "Apply Settings" button
- [ ] 27. Panel closes
- [ ] 28. Settings are saved
- [ ] 29. Reopen panel
- [ ] 30. Previous settings are still there

### Alternative Close Methods
- [ ] 31. Open panel
- [ ] 32. Press Escape key
- [ ] 33. Panel closes
- [ ] 34. Open panel
- [ ] 35. Click on overlay (outside panel)
- [ ] 36. Panel closes
- [ ] 37. Open panel
- [ ] 38. Click X button
- [ ] 39. Panel closes

### Multi-Section Testing
- [ ] 40. Edit settings for Section 1
- [ ] 41. Apply settings
- [ ] 42. Edit settings for Section 2
- [ ] 43. Section 2 shows its own settings (not Section 1's)
- [ ] 44. Both sections maintain their individual settings

### Integration Testing
- [ ] 45. Open section settings
- [ ] 46. Click to edit a component
- [ ] 47. Section settings closes, component editor opens
- [ ] 48. Close component editor
- [ ] 49. Open section settings again
- [ ] 50. Works correctly

### Responsive Testing
- [ ] 51. Test on desktop (panel should be 400px wide)
- [ ] 52. Test on tablet (panel should be 400px wide)
- [ ] 53. Test on mobile (panel should be full width)
- [ ] 54. All controls work on all screen sizes

### Error Handling
- [ ] 55. Try to open settings for non-existent section
- [ ] 56. No errors in console
- [ ] 57. Try invalid color value
- [ ] 58. Falls back to default
- [ ] 59. Save without making changes
- [ ] 60. No unnecessary API calls

## Detailed Testing Scenarios

### Scenario 1: Basic Workflow
1. Load the media kit builder
2. Add a new section (any layout)
3. Hover over the section
4. Click the settings/eye icon in the section controls
5. Verify panel opens from right side
6. Make a change to any setting
7. Click "Apply Settings"
8. Verify change is reflected in the section
9. Save the media kit
10. Reload the page
11. Verify settings persisted

### Scenario 2: Layout Switching
1. Create a Full Width section
2. Add 2 components to it
3. Open section settings
4. Switch to "Two Columns"
5. Verify components are redistributed into columns
6. Switch to "Three Columns"
7. Verify layout changes again
8. Switch back to "Full Width"
9. Verify components are back in single column

### Scenario 3: Multiple Sections
1. Create 3 different sections
2. Give each section different settings:
   - Section 1: Full Width, blue background
   - Section 2: Two Columns, red background
   - Section 3: Three Columns, green background
3. Verify each section maintains its own settings
4. Edit Section 2 settings
5. Verify Section 1 and 3 are unchanged
6. Save and reload
7. Verify all sections kept their settings

### Scenario 4: Keyboard Navigation
1. Open section settings
2. Press Tab key
3. Verify focus moves through controls
4. Press Escape
5. Verify panel closes
6. Open section settings again
7. Press Shift+Tab
8. Verify reverse tab order works

### Scenario 5: Auto-Save Integration
1. Open section settings
2. Make a change
3. Click "Apply Settings"
4. Wait 2 seconds
5. Verify auto-save triggered (check console)
6. Verify "Saved" indicator appears

## Console Checks

Open browser DevTools Console and verify:

- [ ] No errors appear when opening panel
- [ ] No errors appear when closing panel
- [ ] No errors appear when changing settings
- [ ] "✅ SectionSettings: Escape key listener registered" appears
- [ ] "✅ SectionSettings: Escape key listener cleaned up" appears on close
- [ ] Event "gmkb:section-settings-opened" is dispatched
- [ ] Event "gmkb:section-updated" is dispatched when applying

## Network Checks

Open DevTools Network tab and verify:

- [ ] No unnecessary API calls when opening panel
- [ ] API call made when clicking "Apply Settings"
- [ ] Auto-save triggers after settings change
- [ ] No duplicate save calls

## Performance Checks

- [ ] Panel opens smoothly without lag
- [ ] Animations are smooth (60fps)
- [ ] No memory leaks (check DevTools Memory)
- [ ] Panel closes cleanly without errors

## Edge Cases

### Test Invalid Data
- [ ] Open settings for section with no existing settings object
- [ ] Panel shows defaults
- [ ] Settings can be saved normally

### Test Concurrent Actions
- [ ] Open section settings
- [ ] Click to add a component (without closing settings)
- [ ] Verify correct behavior (one or the other opens)

### Test Rapid Actions
- [ ] Open and close panel rapidly (10 times)
- [ ] No errors occur
- [ ] No memory leaks

### Test During Save
- [ ] Make a setting change
- [ ] While auto-save is happening, open another section's settings
- [ ] Verify no conflicts

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Visual Regression

Compare screenshots before/after for:
- [ ] Panel appearance
- [ ] Overlay darkness
- [ ] Animation smoothness
- [ ] Section appearance after settings applied

## Accessibility

- [ ] Panel can be navigated with keyboard only
- [ ] All controls have visible focus indicators
- [ ] Close button has proper aria-label
- [ ] Panel has proper role attributes
- [ ] Color picker is accessible
- [ ] Dropdowns are accessible

## Known Issues to Watch For

1. **Issue**: Panel doesn't open
   - **Check**: Verify UI store is imported correctly
   - **Check**: Verify Section.vue is calling uiStore.openSectionSettings()
   
2. **Issue**: Settings don't save
   - **Check**: Verify store.updateSectionSettings() is being called
   - **Check**: Check console for API errors
   
3. **Issue**: Settings show wrong data
   - **Check**: Verify section prop is reactive
   - **Check**: Verify watch is working on section changes

4. **Issue**: Escape key doesn't work
   - **Check**: Verify event listener is registered
   - **Check**: Check for other code that might be preventing event

5. **Issue**: Panel remains visible after closing
   - **Check**: Verify v-if condition
   - **Check**: Verify uiStore.closeSectionSettings() is being called

## Success Criteria

All of the following must be true:
✅ Panel opens smoothly from right side
✅ All settings controls work correctly
✅ Settings are saved to the store
✅ Settings persist across page reloads
✅ Panel integrates cleanly with other panels
✅ No console errors
✅ No memory leaks
✅ Works on all target browsers
✅ Accessible via keyboard
✅ Mobile responsive

## Regression Tests

Verify these existing features still work:
- [ ] Component editor panel
- [ ] Design panel
- [ ] Component library modal
- [ ] Theme customizer modal
- [ ] Drag and drop components
- [ ] Add/remove sections
- [ ] Undo/redo
- [ ] Auto-save
- [ ] Manual save

## Final Verification

After all tests pass:
1. Create a fresh media kit from scratch
2. Add 3 different sections with different layouts
3. Configure settings for each section
4. Add components to each section
5. Save the media kit
6. Close the browser
7. Reopen and load the media kit
8. Verify everything looks correct
9. Export the media kit
10. Import on a different installation
11. Verify settings transferred correctly

## Reporting Issues

If you find a bug, report with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and version
- Console errors (if any)
- Screenshots or video
