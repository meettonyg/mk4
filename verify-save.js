/**
 * Save Verification Test Script
 * Run in browser console after building to verify save functionality
 */

(async function verifySave() {
  console.log('='.repeat(50));
  console.log('Media Kit Builder - Save Verification');
  console.log('='.repeat(50));
  
  // Check prerequisites
  console.log('\n1. Checking prerequisites...');
  const checks = {
    'gmkbStore exists': !!window.gmkbStore,
    'NonceManager exists': !!window.gmkbNonceManager,
    'Post ID set': !!(window.gmkbStore?.postId),
    'AJAX URL set': !!(window.gmkbData?.ajaxUrl),
    'Nonce set': !!(window.gmkbData?.nonce)
  };
  
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
  });
  
  const allPassed = Object.values(checks).every(v => v);
  
  if (!allPassed) {
    console.error('\n❌ Prerequisites not met. Cannot test save.');
    return;
  }
  
  // Check current state
  console.log('\n2. Current state:');
  console.log(`  Components: ${window.gmkbStore.componentCount}`);
  console.log(`  Sections: ${window.gmkbStore.sectionCount}`);
  console.log(`  Theme: ${window.gmkbStore.theme}`);
  console.log(`  Has unsaved changes: ${window.gmkbStore.isDirty}`);
  
  // Test save method exists
  console.log('\n3. Checking save method...');
  if (typeof window.gmkbStore.save === 'function') {
    console.log('  ✅ save() method exists');
  } else {
    console.error('  ❌ save() method not found!');
    return;
  }
  
  // Perform test save
  console.log('\n4. Testing save...');
  console.log('  Making a small change to trigger save...');
  
  // Make a small change
  const originalTheme = window.gmkbStore.theme;
  window.gmkbStore.theme = originalTheme; // No actual change
  window.gmkbStore.isDirty = true; // Force dirty flag
  
  console.log('  Calling save()...');
  
  try {
    const result = await window.gmkbStore.save();
    
    if (result) {
      console.log('\n✅ SAVE SUCCESSFUL!');
      console.log('  Check the console above for:');
      console.log('  - "📦 Local backup created"');
      console.log('  - "✅ Saved to WordPress database"');
      console.log('\n  The save is working correctly.');
    } else {
      console.warn('\n⚠️ Save returned false');
      console.log('  This might mean there were no changes to save.');
    }
    
  } catch (error) {
    console.error('\n❌ SAVE FAILED!');
    console.error('  Error:', error.message);
    console.error('  Full error:', error);
  }
  
  // Check localStorage backup
  console.log('\n5. Checking local backup...');
  const backupKey = `gmkb_backup_${window.gmkbStore.postId}`;
  const backup = localStorage.getItem(backupKey);
  
  if (backup) {
    try {
      const backupData = JSON.parse(backup);
      console.log('  ✅ Local backup exists');
      console.log(`  Components in backup: ${Object.keys(backupData.components || {}).length}`);
      console.log(`  Backup age: ${Math.round((Date.now() - backupData.timestamp) / 1000)}s`);
    } catch (e) {
      console.warn('  ⚠️ Backup exists but is invalid JSON');
    }
  } else {
    console.log('  ℹ️ No local backup found (cleared after successful save)');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Verification Complete!');
  console.log('='.repeat(50));
  
  // Summary
  console.log('\nSUMMARY:');
  console.log('- If you see "✅ Saved to WordPress database", the save is working');
  console.log('- Check the PHP error logs for "GMKB Save" messages');
  console.log('- Check wp_postmeta table for gmkb_media_kit_state meta_key');
  console.log('- The data should be visible when you refresh the page');
})();
