/**
 * Quick fix for empty state and component controls
 * Run this in the browser console after page load
 */

console.log('🔧 Applying quick fixes...\n');

// Fix 1: Ensure empty state is displayed correctly
function fixEmptyState() {
    const state = enhancedStateManager?.getState();
    const emptyState = document.getElementById('empty-state');
    
    if (state && emptyState) {
        const hasComponents = Object.keys(state.components || {}).length > 0;
        emptyState.style.display = hasComponents ? 'none' : 'flex';
        console.log(`✅ Empty state ${hasComponents ? 'hidden' : 'shown'}`);
    }
}

// Fix 2: Setup empty state button listeners
function setupEmptyStateButtons() {
    const addBtn = document.getElementById('add-first-component');
    const templateBtn = document.getElementById('load-template');
    
    if (addBtn && !addBtn.hasAttribute('data-fixed')) {
        addBtn.setAttribute('data-fixed', 'true');
        addBtn.addEventListener('click', () => {
            console.log('Triggering component library...');
            document.dispatchEvent(new CustomEvent('show-component-library'));
        });
        console.log('✅ Add Component button fixed');
    }
    
    if (templateBtn && !templateBtn.hasAttribute('data-fixed')) {
        templateBtn.setAttribute('data-fixed', 'true');
        templateBtn.addEventListener('click', () => {
            console.log('Triggering template library...');
            document.dispatchEvent(new CustomEvent('show-template-library'));
        });
        console.log('✅ Load Template button fixed');
    }
}

// Fix 3: Ensure component library modal is initialized
function ensureComponentLibrary() {
    if (typeof setupComponentLibraryModal === 'function') {
        setupComponentLibraryModal();
        console.log('✅ Component library modal initialized');
    } else {
        console.warn('⚠️ setupComponentLibraryModal not found, trying to import...');
        import('./js/modals/component-library.js').then(module => {
            if (module.setupComponentLibraryModal) {
                module.setupComponentLibraryModal();
                console.log('✅ Component library modal imported and initialized');
            }
        }).catch(err => {
            console.error('Failed to import component library:', err);
        });
    }
}

// Fix 4: Ensure template library is ready
function ensureTemplateLibrary() {
    // Check if template library is loaded
    import('./js/modals/template-library.js').then(() => {
        console.log('✅ Template library loaded');
    }).catch(err => {
        console.error('Failed to import template library:', err);
    });
}

// Fix 5: Update renderer if needed
function updateRenderer() {
    if (enhancedComponentRenderer) {
        enhancedComponentRenderer.setupEmptyStateListeners();
        const state = enhancedStateManager.getState();
        enhancedComponentRenderer.updateEmptyState(state);
        console.log('✅ Renderer updated');
    }
}

// Apply all fixes
fixEmptyState();
setupEmptyStateButtons();
ensureComponentLibrary();
ensureTemplateLibrary();
updateRenderer();

console.log('\n✨ Quick fixes applied! Try the buttons now.');