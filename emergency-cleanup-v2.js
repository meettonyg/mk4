/**
 * EMERGENCY FIX v2: Use REST API instead of AJAX
 * 
 * Run this in the browser console on the media kit editor page
 */

(async function cleanupAuthorityHookV2() {
  console.log('🧹 Starting authority-hook cleanup (REST API method)...');
  
  // Get the post ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('mkcg_id');
  
  if (!postId) {
    console.error('❌ No mkcg_id found in URL');
    return;
  }
  
  console.log('📝 Post ID:', postId);
  
  // Build REST API URL
  const restUrl = window.gmkbData?.restUrl || 'https://guestify.ai/wp-json/';
  const apiUrl = `${restUrl}gmkb/v2/mediakit/${postId}`;
  const restNonce = window.gmkbData?.restNonce;
  
  if (!restNonce) {
    console.error('❌ No REST nonce found');
    return;
  }
  
  try {
    // Load current state via REST API
    console.log('📥 Loading current state from:', apiUrl);
    
    const loadResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-WP-Nonce': restNonce,
        'Content-Type': 'application/json'
      }
    });
    
    if (!loadResponse.ok) {
      console.error('❌ Load failed:', loadResponse.status, loadResponse.statusText);
      const errorText = await loadResponse.text();
      console.error('Response:', errorText);
      return;
    }
    
    const state = await loadResponse.json();
    console.log('✅ Current state loaded');
    console.log('📊 Components:', Object.keys(state.components || {}).length);
    console.log('📊 Sections:', (state.sections || []).length);
    
    // Find authority-hook components
    const authorityHooks = [];
    
    if (state.components) {
      Object.entries(state.components).forEach(([id, comp]) => {
        if (comp && comp.type === 'authority-hook') {
          authorityHooks.push(id);
          console.log(`  🔍 Found authority-hook: ${id}`);
        }
      });
    }
    
    if (authorityHooks.length === 0) {
      console.log('✅ No authority-hook components found!');
      console.log('💡 The error might be from:');
      console.log('   1. Browser cache - Try: Ctrl+Shift+R');
      console.log('   2. Old bundle - Check dist/gmkb.iife.js timestamp');
      console.log('   3. Different post - Check the mkcg_id in URL');
      return;
    }
    
    console.log(`🔍 Found ${authorityHooks.length} authority-hook component(s)`);
    
    // Remove from components
    authorityHooks.forEach(id => {
      delete state.components[id];
      console.log(`  ✅ Removed component: ${id}`);
    });
    
    // Remove from sections
    let removedFromSections = 0;
    
    if (state.sections && Array.isArray(state.sections)) {
      state.sections.forEach((section, idx) => {
        // Full-width sections
        if (section.components && Array.isArray(section.components)) {
          const before = section.components.length;
          section.components = section.components.filter(compRef => {
            const compId = typeof compRef === 'string' ? compRef : (compRef.component_id || compRef.id);
            return !authorityHooks.includes(compId);
          });
          if (section.components.length < before) {
            const removed = before - section.components.length;
            console.log(`  🗑️  Removed ${removed} from section ${idx} (${section.section_id})`);
            removedFromSections += removed;
          }
        }
        
        // Multi-column sections
        if (section.columns && typeof section.columns === 'object') {
          Object.keys(section.columns).forEach(col => {
            if (Array.isArray(section.columns[col])) {
              const before = section.columns[col].length;
              section.columns[col] = section.columns[col].filter(compId => {
                return !authorityHooks.includes(compId);
              });
              if (section.columns[col].length < before) {
                const removed = before - section.columns[col].length;
                console.log(`  🗑️  Removed ${removed} from section ${idx} column ${col}`);
                removedFromSections += removed;
              }
            }
          });
        }
      });
    }
    
    console.log('📊 Summary:');
    console.log(`   Components deleted: ${authorityHooks.length}`);
    console.log(`   Section references removed: ${removedFromSections}`);
    
    // Save the cleaned state via REST API
    console.log('💾 Saving cleaned state...');
    
    const saveResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': restNonce,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(state)
    });
    
    if (!saveResponse.ok) {
      console.error('❌ Save failed:', saveResponse.status, saveResponse.statusText);
      const errorText = await saveResponse.text();
      console.error('Response:', errorText);
      return;
    }
    
    const saveResult = await saveResponse.json();
    console.log('✅ Save response:', saveResult);
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('✅ CLEANUP COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log(`   Removed ${authorityHooks.length} authority-hook component(s)`);
    console.log('');
    console.log('🎉 Now reloading the page...');
    console.log('   The error should be GONE!');
    console.log('═══════════════════════════════════════');
    
    // Auto-reload after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    console.error('Stack:', error.stack);
  }
})();
