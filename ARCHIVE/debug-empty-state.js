/**
 * Debug script to identify empty state and error issues
 * Run this in the browser console
 */

// Check empty state
console.log('=== EMPTY STATE DEBUG ===');
const emptyState = document.getElementById('empty-state');
if (emptyState) {
    console.log('Empty state found');
    console.log('Display style:', emptyState.style.display);
    console.log('Computed display:', window.getComputedStyle(emptyState).display);
    console.log('Visibility:', window.getComputedStyle(emptyState).visibility);
    console.log('Opacity:', window.getComputedStyle(emptyState).opacity);
    console.log('Parent:', emptyState.parentElement?.id);
    
    // Check if any CSS is hiding it
    const rect = emptyState.getBoundingClientRect();
    console.log('Bounding rect:', rect);
    console.log('Is visible:', rect.width > 0 && rect.height > 0);
} else {
    console.log('No empty state element found');
}

// Check preview container
console.log('\n=== PREVIEW CONTAINER ===');
const preview = document.getElementById('media-kit-preview');
if (preview) {
    console.log('Has components class:', preview.classList.contains('has-components'));
    console.log('Children count:', preview.children.length);
    console.log('Children:', Array.from(preview.children).map(child => ({
        tag: child.tagName,
        id: child.id,
        classes: child.className,
        display: window.getComputedStyle(child).display
    })));
}

// Force show empty state
console.log('\n=== FORCE SHOW EMPTY STATE ===');
console.log('To force show empty state, run:');
console.log(`
const es = document.getElementById('empty-state');
if (es) {
    es.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
    console.log('Empty state forced visible');
} else {
    console.log('Creating new empty state...');
    const preview = document.getElementById('media-kit-preview');
    const newEs = window.componentRenderer.createEmptyStateElement();
    preview.appendChild(newEs);
    newEs.style.cssText = 'display: block !important;';
    window.componentRenderer.setupEmptyState();
}
`);

// Check for any errors
console.log('\n=== ERROR CHECK ===');
// Listen for next error
window.addEventListener('error', (e) => {
    console.error('Caught error:', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        error: e.error
    });
}, { once: true });

console.log('Error listener attached. Any errors will be logged above.');
