# Sidebar Tabs Missing Issue

## Problem
The sidebar is showing the component list, but the tabs (Components, Layout, Settings) at the top are not visible.

## Investigation

Looking at the code:

1. **`SidebarIntegration.vue`** - Teleports `SidebarTabs` into `#gmkb-sidebar`
2. **`SidebarTabs.vue`** - Renders the tabs with dark background (`#0f172a`)
3. **Template** - Has `#gmkb-sidebar` element with `background: white` inline style

## Root Cause

The issue appears to be a CSS conflict. The template has:
```html
<aside id="gmkb-sidebar" style="width: 300px; background: white;"></aside>
```

But `SidebarTabs.vue` expects:
```css
.gmkb-sidebar {
  background: #0f172a; /* Dark background */
}
```

The white background from the template is overriding the dark background of the Vue component, making the dark-colored tabs invisible or hard to see.

## The Fix

Removed inline styles from the template to let Vue component styles apply:

```diff
- <aside id="gmkb-sidebar" style="width: 300px; border-right: 1px solid #e5e7eb; overflow-y: auto; background: white;"></aside>
+ <aside id="gmkb-sidebar"></aside>
```

And kept the CSS in the `<style>` block for proper styling.

## Files Modified

- `templates/builder-template-vue-pure.php` - Removed conflicting inline styles

## Test

After refreshing, you should see:
- Dark background sidebar
- Three tabs at the top: 📦 Components | 🎨 Layout | ⚙️ Settings
- Tab navigation working properly

## If Still Not Showing

Check browser console for:
1. Any CSS errors
2. Vue component mounting messages
3. Element inspection to see if tabs are rendered but hidden

Run in console:
```javascript
document.querySelector('.sidebar-tabs')
// Should return the tabs element
```
