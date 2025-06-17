# Correct Commands for Debug Scripts

The debug scripts are in your plugin directory. Use these commands with the full path:

```javascript
// Step 1: Load enhanced debugging
const s1 = document.createElement('script');
s1.src = '/wp-content/plugins/guestify-media-kit-builder/debug-delete-enhanced.js';
document.head.appendChild(s1);

// Step 2: Test switch statement
const s2 = document.createElement('script');
s2.src = '/wp-content/plugins/guestify-media-kit-builder/test-switch-statement.js';
document.head.appendChild(s2);

// Step 3: Check async imports (optional)
const s3 = document.createElement('script');
s3.src = '/wp-content/plugins/guestify-media-kit-builder/debug-async-import.js';
document.head.appendChild(s3);
```

## Alternative: Using Plugin URL from Window

If the above doesn't work, try:

```javascript
// Get plugin URL
const pluginUrl = window.guestifyData?.pluginUrl || window.gmkb_data?.plugin_url || '/wp-content/plugins/guestify-media-kit-builder/';

// Step 1: Load enhanced debugging
const s1 = document.createElement('script');
s1.src = pluginUrl + 'debug-delete-enhanced.js';
document.head.appendChild(s1);

// Step 2: Test switch statement
const s2 = document.createElement('script');
s2.src = pluginUrl + 'test-switch-statement.js';
document.head.appendChild(s2);
```

## Or Copy-Paste the Debug Code Directly

If you still get 404 errors, you can copy the entire debug script content and paste it directly into the console. Open the file:
- `C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\debug-delete-enhanced.js`

Copy all content and paste into console.
