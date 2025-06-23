// Direct test for modal functionality
console.log('🧪 Testing Modal Display Fix\n');

// Test 1: Check if modal exists
const modal = document.getElementById('component-library-overlay');
console.log('1. Modal element exists:', modal ? '✅ Yes' : '❌ No');

if (modal) {
    // Test 2: Check current display style
    console.log('2. Current display:', modal.style.display || 'not set');
    
    // Test 3: Try to show modal directly
    console.log('\n3. Testing direct display...');
    modal.style.display = 'flex';
    modal.classList.add('modal--open');
    
    setTimeout(() => {
        const isVisible = window.getComputedStyle(modal).display !== 'none';
        console.log('   Modal visible:', isVisible ? '✅ Yes' : '❌ No');
        
        if (isVisible) {
            console.log('   ✅ Direct display works! The issue was with the showModal function.');
            
            // Test close button
            const closeBtn = document.getElementById('close-library');
            if (closeBtn) {
                console.log('\n4. Testing close button...');
                closeBtn.click();
                
                setTimeout(() => {
                    const isClosed = window.getComputedStyle(modal).display === 'none';
                    console.log('   Modal closed:', isClosed ? '✅ Yes' : '❌ No');
                }, 100);
            }
        } else {
            console.log('   ❌ Modal not visible. Checking for CSS issues...');
            
            // Check computed styles
            const styles = window.getComputedStyle(modal);
            console.log('   - Display:', styles.display);
            console.log('   - Visibility:', styles.visibility);
            console.log('   - Opacity:', styles.opacity);
            console.log('   - Z-index:', styles.zIndex);
            console.log('   - Position:', styles.position);
        }
    }, 100);
}

// Test 4: Test the button click with the imported function
console.log('\n5. Testing button functionality...');
const btn = document.getElementById('add-component-btn');
if (btn) {
    console.log('   Button found, checking for showModal function...');
    
    // Import and test
    import('./modals/component-library.js').then(module => {
        console.log('   Module loaded, clicking button...');
        btn.click();
        
        setTimeout(() => {
            const modal = document.getElementById('component-library-overlay');
            const isVisible = modal && window.getComputedStyle(modal).display !== 'none';
            console.log('   Modal visible after button click:', isVisible ? '✅ Yes' : '❌ No');
            
            if (!isVisible) {
                console.log('\n💡 Try refreshing with Ctrl+F5 to ensure latest code is loaded');
            }
        }, 200);
    });
}
