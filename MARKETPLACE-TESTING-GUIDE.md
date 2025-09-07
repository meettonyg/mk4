# Component Marketplace Testing Guide

## How to Test the Component Marketplace

### 1. Access the Marketplace

After activating the plugin, you should see a new menu item in your WordPress admin:

- **Main Menu**: Look for "Component Market" with a store icon (dashicons-store)
- **Tools Menu**: Tools → Component Marketplace
- **Direct URL**: `/wp-admin/admin.php?page=gmkb-component-marketplace`

### 2. Test Package Creation

I've created a test component package for you at:
```
/test-packages/video-showcase/
```

To create a ZIP file for upload testing:

#### On Windows:
1. Navigate to `C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\test-packages\`
2. Right-click on the `video-showcase` folder
3. Select "Send to" → "Compressed (zipped) folder"
4. This creates `video-showcase.zip`

#### On Mac/Linux:
```bash
cd /path/to/mk4/test-packages/
zip -r video-showcase.zip video-showcase/
```

### 3. Test Component Upload

1. Go to the Component Marketplace admin page
2. Click on the "Upload Component" tab
3. Choose the `video-showcase.zip` file
4. Options to test:
   - ✅ **Validate only**: Check this to test validation without installing
   - ✅ **Override version check**: Use if re-uploading the same version

5. Click "Upload Component"

### 4. Expected Results

#### Successful Validation:
- You should see "Component package is valid"
- Details about the component will be displayed

#### Successful Installation:
- Component appears in "Installed Components" tab
- Component is available in the Media Kit Builder
- Files are installed to `/components/video-showcase/`

### 5. Test Validation Errors

To test error handling, try these scenarios:

#### Missing Required File:
1. Create a copy of the test package
2. Delete `schema.json` from the copy
3. Zip and upload - should show "Required file missing: schema.json"

#### Invalid Manifest:
1. Edit `manifest.json` to have invalid JSON
2. Zip and upload - should show "Invalid manifest JSON"

#### Security Issue:
1. Add `eval($_POST['code']);` to template.php
2. Zip and upload - should show security warning

### 6. Test Component in Builder

After successful installation:

1. Go to Media Kit Builder (`/tools/media-kit/`)
2. Click "Add Component"
3. Look for "Video Showcase" in the Media category
4. Add it to your media kit
5. Test the component functionality

### 7. Test Uninstall

1. Go back to Component Marketplace
2. In "Installed Components" tab
3. Find "Video Showcase" 
4. Click "Uninstall" button
5. Confirm the action
6. Component should be removed from system

### 8. Verify Database Entries

Check WordPress options table for marketplace data:
```sql
SELECT * FROM wp_options WHERE option_name = 'gmkb_installed_components';
```

### 9. Debug Mode Testing

Add to `wp-config.php` for detailed logging:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Check logs at: `/wp-content/debug.log`

## Troubleshooting

### Menu Not Appearing
- Clear WordPress admin menu cache
- Check user permissions (need 'manage_options' capability)
- Deactivate and reactivate the plugin

### Upload Fails
- Check PHP upload limits in php.ini:
  - `upload_max_filesize`
  - `post_max_size`
  - `max_execution_time`
- Ensure `/wp-content/uploads/` is writable

### Component Not Loading
- Clear component discovery cache
- Check `/components/` directory permissions
- Look for PHP errors in debug.log

### Validation Issues
- Ensure all required files are present
- Check file permissions (readable)
- Validate JSON syntax in manifest.json and schema.json

## Test Checklist

- [ ] Marketplace menu appears in admin
- [ ] Upload tab displays correctly
- [ ] Can select and upload ZIP file
- [ ] Validation works (try with and without "Validate only")
- [ ] Installation creates component directory
- [ ] Component appears in installed list
- [ ] Component shows in Media Kit Builder
- [ ] Component renders correctly when added
- [ ] Uninstall removes component cleanly
- [ ] Error messages are clear and helpful
- [ ] Upload of invalid package shows appropriate errors

## Creating More Test Packages

To create additional test components:

1. Copy the `video-showcase` directory
2. Rename to your component name (e.g., `testimonial-slider`)
3. Update all JSON files with new component info
4. Modify template.php and script.js
5. Zip the directory
6. Upload through marketplace

## API Integration (Future)

The marketplace is ready for API integration. To connect to a remote marketplace:

1. Implement `get_marketplace_download_url()` in ComponentPackageManager.php
2. Implement `get_marketplace_latest_version()` for update checks
3. Add authentication if needed
4. Configure marketplace API endpoint

---

## Quick Test

For a quick functionality test:

1. **Create ZIP**: 
   ```
   Right-click test-packages/video-showcase → Send to → Compressed folder
   ```

2. **Upload**:
   ```
   Admin → Component Market → Upload Component → Choose video-showcase.zip → Upload
   ```

3. **Verify**:
   ```
   Check "Installed Components" tab → Should see "Video Showcase"
   ```

4. **Use**:
   ```
   Media Kit Builder → Add Component → Media category → Video Showcase
   ```

That's it! The component marketplace should now be fully functional for testing.
