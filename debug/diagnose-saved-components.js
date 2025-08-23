/**
 * Diagnostic tool for debugging saved components not showing
 * Run this in the console when the media kit preview shows blank but admin shows components
 */

console.group('🔍 GMKB Saved Components Diagnostic');

// 1. Check URL and Post ID Detection
console.log('1️⃣ URL & Post ID Detection:');
console.log('Current URL:', window.location.href);
console.log('URL Parameters:', window.location.search);

const urlParams = new URLSearchParams(window.location.search);
console.log('Detected Parameters:', {
    post_id: urlParams.get('post_id'),
    mkcg_id: urlParams.get('mkcg_id'),
    p: urlParams.get('p'),
    page_id: urlParams.get('page_id'),
    media_kit_id: urlParams.get('media_kit_id')
});

// 2. Check WordPress Data
console.log('\n2️⃣ WordPress Data (gmkbData):');
if (window.gmkbData) {
    console.log('✅ gmkbData exists');
    console.log('Post ID from gmkbData:', window.gmkbData.postId);
    console.log('Has saved state:', !!window.gmkbData.saved_state);
    console.log('Has saved components:', !!window.gmkbData.saved_components);
    
    if (window.gmkbData.saved_state) {
        console.log('Saved state structure:', {
            hasComponents: !!window.gmkbData.saved_state.components,
            componentCount: window.gmkbData.saved_state.components ? Object.keys(window.gmkbData.saved_state.components).length : 0,
            hasSavedComponentsArray: !!window.gmkbData.saved_state.saved_components,
            savedComponentsArrayLength: window.gmkbData.saved_state.saved_components ? window.gmkbData.saved_state.saved_components.length : 0,
            hasLayout: !!window.gmkbData.saved_state.layout,
            layoutLength: window.gmkbData.saved_state.layout ? window.gmkbData.saved_state.layout.length : 0
        });
    }
    
    if (window.gmkbData.saved_components) {
        console.log('Saved components array:', window.gmkbData.saved_components);
    }
} else {
    console.error('❌ gmkbData not found!');
}

// 3. Check State Manager
console.log('\n3️⃣ State Manager:');
if (window.enhancedStateManager) {
    console.log('✅ State Manager exists');
    console.log('Is initialized:', window.enhancedStateManager.isInitialized);
    
    const currentState = window.enhancedStateManager.getState();
    console.log('Current state:', {
        componentCount: Object.keys(currentState.components || {}).length,
        components: currentState.components,
        layout: currentState.layout,
        hasSavedComponents: !!currentState.saved_components,
        savedComponentsLength: currentState.saved_components ? currentState.saved_components.length : 0
    });
} else {
    console.error('❌ State Manager not found!');
}

// 4. Check Component Renderer
console.log('\n4️⃣ Component Renderer:');
if (window.enhancedComponentRenderer) {
    console.log('✅ Component Renderer exists');
    console.log('Is initialized:', window.enhancedComponentRenderer.initialized);
    console.log('Stats:', window.enhancedComponentRenderer.getStats());
} else {
    console.error('❌ Component Renderer not found!');
}

// 5. Check DOM Containers
console.log('\n5️⃣ DOM Containers:');
const containers = {
    'media-kit-preview': document.getElementById('media-kit-preview'),
    'saved-components-container': document.getElementById('saved-components-container'),
    'empty-state': document.getElementById('empty-state')
};

Object.entries(containers).forEach(([name, element]) => {
    if (element) {
        console.log(`✅ ${name}:`, {
            exists: true,
            visible: element.style.display !== 'none',
            display: element.style.display || 'default',
            childCount: element.children.length,
            className: element.className
        });
    } else {
        console.error(`❌ ${name}: Not found`);
    }
});

// 6. Check for Rendered Components in DOM
console.log('\n6️⃣ Rendered Components in DOM:');
const renderedComponents = document.querySelectorAll('[data-component-id]');
console.log('Components with data-component-id:', renderedComponents.length);
renderedComponents.forEach((comp, index) => {
    console.log(`Component ${index + 1}:`, {
        id: comp.getAttribute('data-component-id'),
        type: comp.getAttribute('data-component-type'),
        parent: comp.parentElement?.id || comp.parentElement?.className
    });
});

// 7. Check Template Instructions (if available in DOM comments)
console.log('\n7️⃣ Template Debug Info:');
const comments = Array.from(document.childNodes)
    .concat(Array.from(document.body.childNodes))
    .filter(node => node.nodeType === Node.COMMENT_NODE)
    .map(node => node.textContent)
    .filter(text => text.includes('GMKB Template Debug'));

if (comments.length > 0) {
    console.log('Template debug comment:', comments[0]);
} else {
    console.log('No template debug comments found');
}

// 8. Attempt to manually trigger render
console.log('\n8️⃣ Manual Render Attempt:');
console.log('To manually trigger a render of saved components, run:');
console.log('gmkbDiagnostic.forceRenderSavedComponents()');

// Provide diagnostic functions
window.gmkbDiagnostic = {
    async forceRenderSavedComponents() {
        console.log('🔧 Attempting to force render saved components...');
        
        if (!window.enhancedComponentRenderer || !window.enhancedComponentRenderer.initialized) {
            console.error('Component renderer not initialized');
            return;
        }
        
        if (!window.gmkbData || !window.gmkbData.saved_state) {
            console.error('No saved state available');
            return;
        }
        
        // Hide empty state
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        // Show saved components container
        const savedContainer = document.getElementById('saved-components-container');
        if (savedContainer) {
            savedContainer.style.display = 'block';
        }
        
        // Force render
        try {
            await window.enhancedComponentRenderer.renderSavedComponents(window.gmkbData.saved_state);
            console.log('✅ Force render completed');
        } catch (error) {
            console.error('❌ Force render failed:', error);
        }
    },
    
    checkPostIdFlow() {
        console.group('🔄 Post ID Flow Check');
        
        // Check URL
        const urlPostId = new URLSearchParams(window.location.search).get('mkcg_id') || 
                         new URLSearchParams(window.location.search).get('post_id') ||
                         new URLSearchParams(window.location.search).get('p');
        console.log('1. URL Post ID:', urlPostId);
        
        // Check PHP to JS
        console.log('2. gmkbData.postId:', window.gmkbData?.postId);
        
        // Check if they match
        if (urlPostId && window.gmkbData?.postId) {
            if (parseInt(urlPostId) === parseInt(window.gmkbData.postId)) {
                console.log('✅ Post IDs match!');
            } else {
                console.error('❌ Post ID mismatch!', {
                    url: urlPostId,
                    gmkbData: window.gmkbData.postId
                });
            }
        }
        
        console.groupEnd();
    },
    
    showAllContainers() {
        console.log('🔧 Showing all containers...');
        
        ['saved-components-container', 'empty-state', 'media-kit-preview'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'block';
                el.style.border = '2px solid red';
                el.style.minHeight = '100px';
                console.log(`✅ ${id} visible`);
            }
        });
    },
    
    logSavedState() {
        if (window.gmkbData && window.gmkbData.saved_state) {
            console.log('Full saved state:', window.gmkbData.saved_state);
        } else {
            console.log('No saved state found');
        }
    }
};

console.groupEnd();

console.log('\n💡 Quick Actions:');
console.log('- gmkbDiagnostic.forceRenderSavedComponents() - Force render saved components');
console.log('- gmkbDiagnostic.checkPostIdFlow() - Check post ID detection flow');
console.log('- gmkbDiagnostic.showAllContainers() - Make all containers visible');
console.log('- gmkbDiagnostic.logSavedState() - Log full saved state data');
