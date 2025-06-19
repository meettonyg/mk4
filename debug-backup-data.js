/**
 * Debug backup data system - run in console to diagnose
 */
window.debugBackupData = function() {
    console.log('🔍 BACKUP DATA DIAGNOSTIC');
    console.log('='.repeat(40));
    
    // Check what's available
    console.log('Available data objects:');
    console.log('- window.guestifyData:', !!window.guestifyData);
    console.log('- window.guestifyDataBackup:', !!window.guestifyDataBackup);
    console.log('- window.guestifyDataReady:', !!window.guestifyDataReady);
    
    // Check for inline script content
    const scripts = document.querySelectorAll('script');
    let foundBackupScript = false;
    
    scripts.forEach((script, index) => {
        if (script.innerHTML.includes('guestifyDataBackup')) {
            foundBackupScript = true;
            console.log(`✅ Found backup script at index ${index}`);
            console.log('Script content preview:', script.innerHTML.substring(0, 100) + '...');
        }
    });
    
    if (!foundBackupScript) {
        console.log('❌ No backup script found in DOM');
        console.log('This means the PHP inline script is not being generated');
    }
    
    // Check if data exists in any other form
    console.log('\nChecking for data in other locations:');
    Object.keys(window).filter(key => key.toLowerCase().includes('guestify')).forEach(key => {
        console.log(`- window.${key}:`, typeof window[key]);
    });
    
    // Check PHP data structure
    if (window.guestifyData) {
        console.log('\nguestifyData structure:');
        console.log('- pluginUrl:', window.guestifyData.pluginUrl);
        console.log('- validation:', window.guestifyData.validation);
        console.log('- dataReady:', window.guestifyData.dataReady);
        console.log('- timestamp:', window.guestifyData.timestamp);
    }
    
    return {
        hasBackup: !!window.guestifyDataBackup,
        hasMain: !!window.guestifyData,
        hasReady: !!window.guestifyDataReady,
        foundScript: foundBackupScript
    };
};

console.log('🔧 Backup data diagnostic loaded');
console.log('💡 Run: window.debugBackupData()');
