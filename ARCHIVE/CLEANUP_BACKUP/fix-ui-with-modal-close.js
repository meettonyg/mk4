/**
 * Fixed UI Script with Working Modal Close
 * This ensures all modals can be properly closed
 */

console.log('🔧 Applying UI Fix with Modal Close...\n');

// Fix 1: Setup Tabs
document.querySelectorAll('.sidebar__tab').forEach(tab => {
    tab.onclick = function() {
        const tabName = this.getAttribute('data-tab');
        document.querySelectorAll('.sidebar__tab').forEach(t => t.classList.remove('sidebar__tab--active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('tab-content--active'));
        this.classList.add('sidebar__tab--active');
        const content = document.getElementById(tabName + '-tab');
        if (content) content.classList.add('tab-content--active');
    };
});
console.log('✅ Tabs fixed');

// Fix 2: Setup Buttons
const addComponentBtn = document.getElementById('add-component-btn');
if (addComponentBtn) {
    addComponentBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showComponentLibraryModal();
    };
}

const addFirstBtn = document.getElementById('add-first-component');
if (addFirstBtn) {
    addFirstBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showComponentLibraryModal();
    };
}

const loadTemplateBtn = document.getElementById('load-template');
if (loadTemplateBtn) {
    loadTemplateBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showTemplateLibraryModal();
    };
}
console.log('✅ Buttons fixed');

// Fix 3: Modal Functions
function showComponentLibraryModal() {
    let modal = document.getElementById('component-library-overlay');
    
    // Create modal if it doesn't exist
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'component-library-overlay';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center;';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal modal--library';
        modalContent.style.cssText = 'background: white; padding: 20px; border-radius: 8px; max-width: 800px; width: 90%; max-height: 80vh; overflow: auto; position: relative;';
        
        modalContent.innerHTML = `
            <div class="library__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Component Library</h2>
                <button class="modal__close" data-close-modal style="background: none; border: none; font-size: 28px; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">&times;</button>
            </div>
            <div class="library__body">
                <p style="margin-bottom: 20px;">Click a component below to add it to your media kit:</p>
                <div class="component-grid" id="modal-components" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px;">
                    <!-- Components will be populated here -->
                </div>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Populate components
        const grid = modalContent.querySelector('#modal-components');
        const components = document.querySelectorAll('.sidebar__content .component-item');
        
        components.forEach(comp => {
            const clone = comp.cloneNode(true);
            clone.style.cssText = 'cursor: pointer; padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: center; transition: all 0.2s;';
            clone.onmouseover = () => clone.style.background = '#e0e0e0';
            clone.onmouseout = () => clone.style.background = '#f5f5f5';
            clone.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const componentType = clone.getAttribute('data-component');
                if (window.componentManager) {
                    await window.componentManager.addComponent(componentType);
                    closeModal(modal);
                }
            };
            grid.appendChild(clone);
        });
    }
    
    // Show modal
    modal.style.display = 'flex';
    
    // Setup close handlers for this modal
    setupModalCloseHandlers(modal);
}

function showTemplateLibraryModal() {
    let modal = document.getElementById('template-library-modal');
    if (modal) {
        modal.style.display = 'flex';
        setupModalCloseHandlers(modal);
    } else {
        alert('Template library not available yet');
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
    }
}

function setupModalCloseHandlers(modal) {
    // Close button
    const closeBtn = modal.querySelector('[data-close-modal], .modal__close');
    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal(modal);
        };
    }
    
    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    };
    
    // ESC key to close
    const escHandler = (e) => {
        if (e.key === 'Escape' && modal.style.display !== 'none') {
            closeModal(modal);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Fix 4: Global Modal Close Handler (for any existing modals)
document.addEventListener('click', (e) => {
    // Handle any modal close button
    if (e.target.matches('.modal__close, [data-close-modal]')) {
        e.preventDefault();
        e.stopPropagation();
        const modal = e.target.closest('.modal-overlay, .modal');
        if (modal) {
            if (modal.classList.contains('modal-overlay')) {
                closeModal(modal);
            } else {
                // If it's just the inner modal, find the overlay
                const overlay = modal.closest('.modal-overlay');
                if (overlay) {
                    closeModal(overlay);
                } else {
                    modal.style.display = 'none';
                }
            }
        }
    }
    
    // Handle clicks on overlay background
    if (e.target.matches('.modal-overlay')) {
        if (e.target === e.currentTarget) {
            closeModal(e.target);
        }
    }
}, true); // Use capture phase to ensure we catch events

console.log('✅ Modal close handlers set up');

// Fix 5: Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modal
        const openModals = document.querySelectorAll('.modal-overlay[style*="flex"], .modal-overlay[style*="block"]');
        openModals.forEach(modal => {
            closeModal(modal);
        });
    }
});

console.log('\n✨ All UI fixes applied!');
console.log('📝 Instructions:');
console.log('  - Click the × button to close modals');
console.log('  - Click outside the modal to close');
console.log('  - Press ESC to close modals');
console.log('  - All tabs and buttons should work now');

// Test: Try to close any currently open modals
const openModal = document.querySelector('.modal-overlay[style*="flex"], .modal-overlay[style*="block"]');
if (openModal) {
    console.log('\n🔍 Found an open modal, setting up close handlers...');
    setupModalCloseHandlers(openModal);
    console.log('✅ You should now be able to close it!');
}