/**
 * Quick Fix for Topics Bi-Directional Sync
 * Run this entire script in the console
 */

// Step 1: Force initialize topics sync
console.log('🔧 Fixing Topics Bi-Directional Sync...');

// Find the topics component
const topicsComponent = document.querySelector('[data-component-type="topics"]');
const componentId = topicsComponent?.getAttribute('data-component-id');

if (!componentId) {
    console.error('❌ No topics component found!');
} else {
    console.log(`✅ Found topics component: ${componentId}`);
    
    // Step 2: Get sidebar inputs and preview items
    const sidebarInputs = document.querySelectorAll('#element-editor input[type="text"]:not([type="hidden"]):not([readonly])');
    const previewItems = document.querySelectorAll(`[data-component-id="${componentId}"] .gmkb-topics__item h4, [data-component-id="${componentId}"] .topic-item h4`);
    
    console.log(`📝 Found ${sidebarInputs.length} sidebar inputs`);
    console.log(`🎨 Found ${previewItems.length} preview items`);
    
    // Step 3: Set up bi-directional sync
    if (sidebarInputs.length > 0 && previewItems.length > 0) {
        // Clear any existing listeners first
        sidebarInputs.forEach((input, index) => {
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
        });
        
        // Get fresh references after clone
        const freshInputs = document.querySelectorAll('#element-editor input[type="text"]:not([type="hidden"]):not([readonly])');
        
        freshInputs.forEach((input, index) => {
            if (previewItems[index]) {
                const previewItem = previewItems[index];
                
                // SIDEBAR → PREVIEW sync
                const updatePreview = function() {
                    previewItem.textContent = this.value;
                    console.log(`✏️ Sidebar → Preview: "${this.value}"`);
                    
                    // Update state
                    if (window.enhancedStateManager) {
                        const state = window.enhancedStateManager.getState();
                        const component = state.components[componentId];
                        if (component) {
                            if (!component.props) component.props = {};
                            if (!component.props.topics) component.props.topics = [];
                            component.props.topics[index] = { 
                                title: this.value,
                                topic_title: this.value 
                            };
                            window.enhancedStateManager.updateComponent(componentId, component);
                        }
                    }
                };
                
                input.addEventListener('input', updatePreview);
                input.addEventListener('change', updatePreview);
                input.addEventListener('blur', updatePreview);
                
                // PREVIEW → SIDEBAR sync
                previewItem.setAttribute('contenteditable', 'true');
                previewItem.style.cursor = 'text';
                previewItem.style.minHeight = '20px';
                previewItem.style.transition = 'all 0.2s ease';
                
                // Visual feedback
                previewItem.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                });
                
                previewItem.addEventListener('mouseleave', function() {
                    if (this !== document.activeElement) {
                        this.style.backgroundColor = '';
                    }
                });
                
                previewItem.addEventListener('focus', function() {
                    this.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    this.style.outline = '2px solid rgba(59, 130, 246, 0.4)';
                    this.style.borderRadius = '4px';
                    this.style.padding = '2px 6px';
                    this.style.marginLeft = '-6px';
                });
                
                previewItem.addEventListener('blur', function() {
                    this.style.backgroundColor = '';
                    this.style.outline = '';
                    this.style.padding = '';
                    this.style.marginLeft = '';
                    
                    // Update sidebar
                    input.value = this.textContent.trim();
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log(`✏️ Preview → Sidebar: "${this.textContent.trim()}"`);
                });
                
                previewItem.addEventListener('input', function() {
                    input.value = this.textContent;
                });
                
                previewItem.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.blur();
                    }
                });
                
                console.log(`✅ Topic ${index + 1}: Bi-directional sync active`);
            }
        });
        
        console.log('');
        console.log('🎉 SUCCESS! Topics bi-directional sync is now working!');
        console.log('');
        console.log('📝 Try it out:');
        console.log('  1. Type in any sidebar input field');
        console.log('  2. Click on any topic title in the preview to edit');
        console.log('  3. Changes sync automatically both ways!');
        console.log('');
        
        // Also refresh the Universal Sync system
        if (window.ComponentSync) {
            window.ComponentSync.refreshSync(componentId, 'topics');
        }
        
    } else {
        console.error('❌ Could not set up sync - missing elements');
        console.log('Please make sure the Speaking Topics panel is open');
    }
}
