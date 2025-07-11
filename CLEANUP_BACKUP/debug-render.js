/**
 * Debug script for component rendering issues
 * Run this in the console to diagnose rendering problems
 */

window.mkDebugRender = {
    // Check renderer status
    checkRenderer: function() {
        console.log('🔍 Checking renderer status...');
        
        const renderer = window.enhancedComponentRenderer || window.componentRenderer;
        if (!renderer) {
            console.error('❌ No renderer found!');
            return;
        }
        
        console.log('Renderer info:');
        console.log(`- Initialized: ${renderer.initialized}`);
        console.log(`- Is rendering: ${renderer.isRendering}`);
        console.log(`- Disable rendering: ${renderer.disableRendering}`);
        console.log(`- Preview container: ${renderer.previewContainer ? '✅' : '❌'}`);
        console.log(`- Component cache size: ${renderer.componentCache?.size || 0}`);
        console.log(`- Render queue size: ${renderer.renderQueue?.size || 0}`);
        
        return renderer;
    },
    
    // Check state manager
    checkState: function() {
        console.log('\n🔍 Checking state...');
        
        const stateManager = window.enhancedStateManager || window.stateManager;
        if (!stateManager) {
            console.error('❌ No state manager found!');
            return;
        }
        
        const state = stateManager.getState();
        console.log('State info:');
        console.log(`- Component count: ${Object.keys(state.components || {}).length}`);
        console.log(`- Layout array: ${state.layout ? state.layout.length + ' items' : 'missing'}`);
        console.log(`- Components:`, Object.keys(state.components || {}));
        console.log(`- Layout:`, state.layout);
        
        return state;
    },
    
    // Force a render
    forceRender: function() {
        console.log('🚀 Forcing render...');
        
        const renderer = window.enhancedComponentRenderer || window.componentRenderer;
        const stateManager = window.enhancedStateManager || window.stateManager;
        
        if (!renderer || !stateManager) {
            console.error('❌ Renderer or state manager not found!');
            return;
        }
        
        // Get current state
        const state = stateManager.getState();
        console.log(`Rendering ${Object.keys(state.components || {}).length} components...`);
        
        // Enable rendering
        renderer.disableRendering = false;
        
        // Call onStateChange directly
        renderer.onStateChange(state);
        
        console.log('✅ Render triggered');
    },
    
    // Manually render a component
    renderComponent: async function(componentId) {
        const state = this.checkState();
        if (!state || !state.components[componentId]) {
            console.error(`❌ Component ${componentId} not found in state!`);
            return;
        }
        
        const renderer = window.enhancedComponentRenderer || window.componentRenderer;
        if (!renderer) {
            console.error('❌ Renderer not found!');
            return;
        }
        
        const component = state.components[componentId];
        console.log(`🎨 Manually rendering ${componentId} (${component.type})...`);
        
        try {
            const result = await renderer.renderComponent(componentId, component.type, component.data);
            console.log('✅ Render result:', result);
            
            // Add to DOM
            const preview = document.getElementById('media-kit-preview');
            if (preview && result.element) {
                preview.appendChild(result.element);
                console.log('✅ Added to DOM');
            }
        } catch (error) {
            console.error('❌ Render failed:', error);
        }
    },
    
    // Fix rendering by re-initializing
    fixRendering: function() {
        console.log('🔧 Fixing rendering...');
        
        const renderer = window.enhancedComponentRenderer || window.componentRenderer;
        const stateManager = window.enhancedStateManager || window.stateManager;
        
        if (!renderer || !stateManager) {
            console.error('❌ Required objects not found!');
            return;
        }
        
        // Re-subscribe to state changes
        if (renderer.stateUnsubscribe) {
            renderer.stateUnsubscribe();
        }
        
        renderer.stateUnsubscribe = stateManager.subscribeGlobal((state) => {
            console.log('📢 State change detected in re-subscribed handler');
            renderer.onStateChange(state);
        });
        
        // Force initial render
        this.forceRender();
        
        console.log('✅ Rendering fixed and re-subscribed to state changes');
    },
    
    // Test adding a component with full debugging
    testAddComponent: async function(type = 'hero') {
        console.log(`\n🧪 Testing add component: ${type}`);
        
        const manager = window.enhancedComponentManager || window.componentManager;
        if (!manager) {
            console.error('❌ Component manager not found!');
            return;
        }
        
        console.log('1️⃣ Current state before add:');
        this.checkState();
        
        console.log(`\n2️⃣ Adding ${type} component...`);
        const componentId = await manager.addComponent(type);
        console.log(`✅ Component added with ID: ${componentId}`);
        
        console.log('\n3️⃣ State after add:');
        this.checkState();
        
        console.log('\n4️⃣ Checking renderer:');
        this.checkRenderer();
        
        console.log('\n5️⃣ Forcing render if needed...');
        setTimeout(() => {
            const preview = document.getElementById('media-kit-preview');
            const component = document.getElementById(componentId);
            
            if (!component) {
                console.log('❌ Component not found in DOM, forcing render...');
                this.forceRender();
            } else {
                console.log('✅ Component found in DOM!');
            }
        }, 1000);
    },
    
    // Run full diagnostics
    runDiagnostics: function() {
        console.log('🏥 Running full diagnostics...\n');
        
        this.checkRenderer();
        this.checkState();
        
        // Check event listeners
        console.log('\n🔍 Checking event system...');
        const stateManager = window.enhancedStateManager || window.stateManager;
        if (stateManager) {
            console.log(`- Global listeners: ${stateManager.globalListeners?.size || 0}`);
            console.log(`- Component listeners: ${stateManager.listeners?.size || 0}`);
        }
        
        // Check DOM
        console.log('\n🔍 Checking DOM...');
        const preview = document.getElementById('media-kit-preview');
        const emptyState = document.getElementById('empty-state');
        console.log(`- Preview container: ${preview ? '✅' : '❌'}`);
        console.log(`- Empty state: ${emptyState ? (emptyState.style.display === 'none' ? '✅ Hidden' : '⚠️ Visible') : '❌'}`);
        console.log(`- Component count in DOM: ${preview?.querySelectorAll('[data-component-id]').length || 0}`);
        
        console.log('\n💡 Suggestions:');
        console.log('- Try mkDebugRender.fixRendering() to re-initialize');
        console.log('- Try mkDebugRender.testAddComponent() to test adding');
        console.log('- Try mkDebugRender.forceRender() to trigger render');
    }
};

// Auto-run diagnostics
console.log('🚀 Render Debug Tools Loaded');
console.log('Available commands:');
console.log('- mkDebugRender.runDiagnostics() - Full system check');
console.log('- mkDebugRender.checkRenderer() - Check renderer status');
console.log('- mkDebugRender.checkState() - Check state contents');
console.log('- mkDebugRender.forceRender() - Force a render cycle');
console.log('- mkDebugRender.fixRendering() - Fix rendering issues');
console.log('- mkDebugRender.testAddComponent(type) - Test adding a component');
console.log('\nRunning initial diagnostics...\n');

mkDebugRender.runDiagnostics();
