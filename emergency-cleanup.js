/**
 * EMERGENCY FIX: Remove authority-hook from current page
 * 
 * Run this in the browser console on the media kit editor page
 * This will fix the error IMMEDIATELY without needing database access
 */

(async function cleanupAuthorityHook() {
  console.log('🧹 Starting authority-hook cleanup...');
  
  // Get the post ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('mkcg_id');
  
  if (!postId) {
    console.error('❌ No mkcg_id found in URL');
    return;
  }
  
  console.log('📝 Post ID:', postId);
  
  // Get current saved state
  const formData = new FormData();
  formData.append('action', 'gmkb_load_media_kit');
  formData.append('nonce', window.gmkbData?.nonce || '');
  formData.append('post_id', postId);
  
  try {
    console.log('📥 Loading current state...');
    const response = await fetch(window.gmkbData.ajaxUrl, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Failed to load:', result);
      return;
    }
    
    const state = result.data;
    console.log('✅ Current state loaded');
    
    // Find and remove authority-hook components
    const authorityHooks = [];
    
    if (state.components) {
      Object.entries(state.components).forEach(([id, comp]) => {
        if (comp.type === 'authority-hook') {
          authorityHooks.push(id);
        }
      });
    }
    
    if (authorityHooks.length === 0) {
      console.log('✅ No authority-hook components found!');
      console.log('💡 The error might be from cached data. Try hard refresh: Ctrl+Shift+R');
      return;
    }
    
    console.log(`🔍 Found ${authorityHooks.length} authority-hook component(s)`);
    
    // Remove from components
    authorityHooks.forEach(id => {
      delete state.components[id];
      console.log(`  ✅ Removed component: ${id}`);
    });
    
    // Remove from sections
    if (state.sections) {
      state.sections.forEach(section => {
        // Full-width sections
        if (section.components) {
          const before = section.components.length;
          section.components = section.components.filter(compRef => {
            const compId = typeof compRef === 'string' ? compRef : compRef.component_id;
            return !authorityHooks.includes(compId);
          });
          if (section.components.length < before) {
            console.log(`  🗑️  Removed from section ${section.section_id}`);
          }
        }
        
        // Multi-column sections
        if (section.columns) {
          Object.keys(section.columns).forEach(col => {
            if (section.columns[col]) {
              const before = section.columns[col].length;
              section.columns[col] = section.columns[col].filter(compId => {
                return !authorityHooks.includes(compId);
              });
              if (section.columns[col].length < before) {
                console.log(`  🗑️  Removed from section ${section.section_id} column ${col}`);
              }
            }
          });
        }
      });
    }
    
    // Save the cleaned state
    console.log('💾 Saving cleaned state...');
    
    const saveFormData = new FormData();
    saveFormData.append('action', 'gmkb_save_media_kit');
    saveFormData.append('nonce', window.gmkbData?.nonce || '');
    saveFormData.append('post_id', postId);
    saveFormData.append('state', JSON.stringify(state));
    
    const saveResponse = await fetch(window.gmkbData.ajaxUrl, {
      method: 'POST',
      body: saveFormData
    });
    
    const saveResult = await saveResponse.json();
    
    if (saveResult.success) {
      console.log('✅ CLEANUP COMPLETE!');
      console.log(`   Removed ${authorityHooks.length} authority-hook component(s)`);
      console.log('');
      console.log('🎉 Now reload the page: Press F5 or Ctrl+R');
      console.log('   The error should be GONE!');
      
      // Auto-reload after 3 seconds
      console.log('');
      console.log('⏳ Auto-reloading in 3 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      console.error('❌ Failed to save:', saveResult);
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
})();
