/**
 * Debug and Fix Bi-Directional Sync for Topics
 * Run these commands to diagnose the issue
 */

// Step 1: Check if design panel event fired
console.log('=== CHECKING SYNC STATUS ===');

// Step 2: Manually check for sidebar elements
function checkSidebarElements() {
    console.log('Looking for sidebar topic inputs...');
    
    // Try different selectors that might match the topics inputs
    const selectors = [
        'input[name*="topic"]',
        '.topic-input',
        '.topics-sidebar__topic-input',
        'input[placeholder*="testing"]',
        '#element-editor input',
        '.element-editor__content input',
        '.form-group input',
        'input[type="text"]'
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`Found ${elements.length} elements with selector: ${selector}`);
            elements.forEach((el, i) => {
                console.log(`  ${i}: value="${el.value}", name="${el.name || 'no-name'}", placeholder="${el.placeholder}"`);
            });
        }
    });
    
    // Check the actual panel content
    const panel = document.getElementById('element-editor');
    if (panel) {
        console.log('Panel found! Content preview:', panel.innerHTML.substring(0, 500));
        const inputs = panel.querySelectorAll('input');
        console.log(`Total inputs in panel: ${inputs.length}`);
    }
}

// Step 3: Manually trigger sync for topics
function manualTopicsSync() {
    const componentId = 'topics-1756841493193-1'; // Your topics component ID
    
    // Find sidebar inputs
    const sidebarInputs = document.querySelectorAll('#element-editor input[type="text"]');
    console.log(`Found ${sidebarInputs.length} sidebar inputs`);
    
    // Find preview items
    const previewItems = document.querySelectorAll(`[data-component-id="${componentId}"] .gmkb-topics__item h4`);
    console.log(`Found ${previewItems.length} preview items`);
    
    // Set up manual sync
    if (sidebarInputs.length > 0 && previewItems.length > 0) {
        sidebarInputs.forEach((input, index) => {
            if (previewItems[index]) {
                // Sync sidebar to preview
                input.addEventListener('input', function() {
                    previewItems[index].textContent = this.value;
                    console.log(`Synced sidebar → preview: ${this.value}`);
                });
                
                // Make preview editable and sync back
                previewItems[index].setAttribute('contenteditable', 'true');
                previewItems[index].style.cursor = 'text';
                previewItems[index].addEventListener('input', function() {
                    input.value = this.textContent;
                    // Trigger input event to notify any listeners
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log(`Synced preview → sidebar: ${this.textContent}`);
                });
                
                console.log(`✅ Set up bi-directional sync for topic ${index + 1}`);
            }
        });
        
        console.log('✅ Manual sync activated! Try editing in either sidebar or preview.');
    } else {
        console.log('❌ Could not set up sync - elements not found');
    }
}

// Step 4: Force reinitialize with correct selectors
function forceReinitialize() {
    if (window.UniversalComponentSync) {
        // Update the topics field mapping to match actual DOM
        window.UniversalComponentSync.componentFieldMappings['topics'] = {
            fields: ['title', 'description'],
            selectors: {
                preview: '.gmkb-topics__item h4, .gmkb-topics__item p',
                sidebar: '#element-editor input[type="text"], #element-editor textarea'
            },
            isListBased: true
        };
        
        // Reinitialize for the topics component
        const componentId = 'topics-1756841493193-1';
        window.UniversalComponentSync.initializeComponentSync(componentId, 'topics');
        console.log('✅ Reinitialized sync with corrected selectors');
    }
}

// Step 5: Enhanced preview editing
function enhancePreviewEditing() {
    const items = document.querySelectorAll('.gmkb-topics__item h4');
    items.forEach((item, index) => {
        item.setAttribute('contenteditable', 'true');
        item.style.cursor = 'text';
        item.style.minHeight = '20px';
        item.setAttribute('data-topic-index', index);
        
        // Visual feedback
        item.addEventListener('focus', () => {
            item.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            item.style.outline = '2px solid rgba(59, 130, 246, 0.4)';
            item.style.borderRadius = '4px';
            item.style.padding = '2px 4px';
        });
        
        item.addEventListener('blur', () => {
            item.style.backgroundColor = '';
            item.style.outline = '';
            item.style.padding = '';
            
            // Find corresponding sidebar input and update it
            const inputs = document.querySelectorAll('#element-editor input[type="text"]');
            if (inputs[index]) {
                inputs[index].value = item.textContent;
                inputs[index].dispatchEvent(new Event('input', { bubbles: true }));
                console.log(`Updated sidebar input ${index}: ${item.textContent}`);
            }
        });
        
        console.log(`✅ Enhanced topic ${index + 1} for editing`);
    });
}

console.log('=== DIAGNOSTIC COMMANDS ===');
console.log('1. Run: checkSidebarElements() - Find sidebar inputs');
console.log('2. Run: manualTopicsSync() - Set up manual sync');
console.log('3. Run: forceReinitialize() - Fix sync with correct selectors');
console.log('4. Run: enhancePreviewEditing() - Make preview items editable');
console.log('=============================');

// Auto-run diagnostics
checkSidebarElements();
