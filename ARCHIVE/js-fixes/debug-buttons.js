/**
 * Debug helper for button functionality
 */

console.log('=== GMKB Button Debug ===');

// Check if buttons exist after a delay
setTimeout(() => {
    const addBtn = document.getElementById('add-first-component');
    const loadBtn = document.getElementById('load-template');
    const componentModal = document.getElementById('component-library-overlay');
    const templateModal = document.getElementById('template-library-modal');
    
    console.log('Debug Check Results:');
    console.log('- Add Component Button:', addBtn ? 'FOUND' : 'NOT FOUND');
    console.log('- Load Template Button:', loadBtn ? 'FOUND' : 'NOT FOUND');
    console.log('- Component Library Modal:', componentModal ? 'FOUND' : 'NOT FOUND');
    console.log('- Template Library Modal:', templateModal ? 'FOUND' : 'NOT FOUND');
    
    // Test event dispatching
    console.log('\nTesting event system:');
    
    // Test component library event
    document.addEventListener('show-component-library', () => {
        console.log('✓ show-component-library event received in debug');
    });
    
    // Test template library event
    document.addEventListener('show-template-library', () => {
        console.log('✓ show-template-library event received in debug');
    });
    
    // Add test buttons if main buttons aren't working
    if (addBtn || loadBtn) {
        const testDiv = document.createElement('div');
        testDiv.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 10000; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
        testDiv.innerHTML = `
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">Debug Controls:</p>
            <button onclick="document.dispatchEvent(new CustomEvent('show-component-library'))" style="margin-right: 5px; padding: 5px 10px; background: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer;">Test Component Modal</button>
            <button onclick="document.dispatchEvent(new CustomEvent('show-template-library'))" style="padding: 5px 10px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Test Template Modal</button>
        `;
        document.body.appendChild(testDiv);
        console.log('Debug test buttons added to bottom-right of screen');
    }
    
}, 1000);

// Monitor clicks globally
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        console.log('Button clicked:', {
            id: e.target.id,
            className: e.target.className,
            text: e.target.textContent.trim()
        });
    }
}, true);
