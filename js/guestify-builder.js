/**
 * Guestify Media Kit Builder - Main
 * 
 * This file combines all modules into a single file for use in production
 * It replaces the old guestify-builder.js with a more maintainable structure
 */

// ====================================================
// STATE MANAGEMENT
// ====================================================
const state = {
    draggedComponent: null,
    selectedElement: null,
    undoStack: [],
    redoStack: [],
    isUnsaved: false,
    currentTheme: 'blue',
};

function getState(key) {
    return state[key];
}

function setState(key, value) {
    state[key] = value;
}

function resetState() {
    state.draggedComponent = null;
    state.selectedElement = null;
    state.undoStack = [];
    state.redoStack = [];
    state.isUnsaved = false;
    state.currentTheme = 'blue';
}

// ====================================================
// UTILITY FUNCTIONS
// ====================================================
function isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
}

function adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function showUpgradePrompt() {
    alert('This is a premium component. Upgrade to Pro to unlock advanced features!');
}

// ====================================================
// UI: TABS
// ====================================================
function setupTabs() {
    console.log("Setting up tabs...");
    const tabs = document.querySelectorAll('.sidebar-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active states
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
        });
    });
}

// ====================================================
// UI: PREVIEW TOGGLE
// ====================================================
function setupPreviewToggle() {
    console.log("Setting up preview toggle...");
    const toggleButtons = document.querySelectorAll('.preview-toggle button');
    const container = document.getElementById('preview-container');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            toggleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const previewType = this.getAttribute('data-preview');
            container.classList.remove('mobile-preview', 'tablet-preview');
            
            if (previewType === 'mobile') {
                container.classList.add('mobile-preview');
            } else if (previewType === 'tablet') {
                container.classList.add('tablet-preview');
            }
        });
    });
}

// ====================================================
// UI: FORM CONTROLS
// ====================================================
function setupFormUpdates() {
    console.log("Setting up form updates...");
    
    const colorInputs = document.querySelectorAll('.color-input');
    colorInputs.forEach(input => {
        const textInput = input.nextElementSibling;
        
        input.addEventListener('input', function() {
            if (textInput) textInput.value = this.value;
        });

        if (textInput) {
            textInput.addEventListener('input', function() {
                if (isValidColor(this.value)) {
                    input.value = this.value;
                }
            });
        }
    });

    setupLiveEditing();
}

function setupLiveEditing() {
    console.log("Setting up live editing...");
    
    // Sync form inputs with preview elements
    const nameInput = document.getElementById('hero-name');
    const titleInput = document.getElementById('hero-title');
    const bioInput = document.getElementById('hero-bio');
    const bgColorInput = document.getElementById('hero-bg-color');
    const textColorInput = document.getElementById('hero-text-color');

    if (nameInput) {
        nameInput.addEventListener('input', function() {
            const preview = document.getElementById('preview-name');
            if (preview) preview.textContent = this.value;
            markUnsaved();
        });
    }

    if (titleInput) {
        titleInput.addEventListener('input', function() {
            const preview = document.getElementById('preview-title');
            if (preview) preview.textContent = this.value;
            markUnsaved();
        });
    }

    if (bioInput) {
        bioInput.addEventListener('input', function() {
            const preview = document.getElementById('preview-bio');
            if (preview) preview.textContent = this.value;
            markUnsaved();
        });
    }

    if (bgColorInput) {
        bgColorInput.addEventListener('input', function() {
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.style.background = `linear-gradient(135deg, ${this.value} 0%, ${adjustBrightness(this.value, -10)} 100%)`;
            }
            document.getElementById('hero-bg-text').value = this.value;
            markUnsaved();
        });
    }

    if (textColorInput) {
        textColorInput.addEventListener('input', function() {
            const heroName = document.querySelector('.hero-name');
            if (heroName) heroName.style.color = this.value;
            document.getElementById('hero-text-text').value = this.value;
            markUnsaved();
        });
    }
}

// ====================================================
// UI: LAYOUT OPTIONS
// ====================================================
function setupLayoutOptions() {
    console.log("Setting up layout options...");
    
    const layoutOptions = document.querySelectorAll('.layout-option');
    
    layoutOptions.forEach(option => {
        option.addEventListener('click', function() {
            layoutOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const layout = this.getAttribute('data-layout');
            applyLayout(layout);
            markUnsaved();
        });
    });
}

function applyLayout(layoutType) {
    console.log('Applying layout:', layoutType);
    // Implementation would depend on your specific layout system
    const preview = document.getElementById('media-kit-preview');
    
    // Remove existing layout classes
    preview.classList.remove('layout-full-width', 'layout-two-column', 'layout-sidebar', 'layout-three-column');
    
    // Add new layout class
    preview.classList.add(`layout-${layoutType}`);
}

// ====================================================
// UI: ELEMENT SELECTION & EDITING
// ====================================================
function setupElementSelection() {
    console.log("Setting up element selection...");
    
    const editableElements = document.querySelectorAll('.editable-element');
    editableElements.forEach(element => {
        element.addEventListener('click', function(e) {
            e.stopPropagation();
            selectElement(this);
        });
    });

    // Deselect when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.editable-element') && 
            !e.target.closest('.left-sidebar') && 
            !e.target.closest('.component-library-modal') &&
            !e.target.closest('.global-settings-modal') &&
            !e.target.closest('.export-modal')) {
            deselectAllElements();
        }
    });
}

function selectElement(element) {
    console.log("Selecting element: " + element.getAttribute('data-element'));
    
    // Remove selection from all elements
    const elements = document.querySelectorAll('.editable-element');
    elements.forEach(el => el.classList.remove('selected'));

    // Select clicked element
    element.classList.add('selected');
    setState('selectedElement', element);

    // Update design panel
    updateDesignPanel(element);

    // Switch to design tab
    const designTab = document.querySelector('.sidebar-tab[data-tab="design"]');
    if (designTab) designTab.click();
}

function deselectAllElements() {
    const elements = document.querySelectorAll('.editable-element');
    elements.forEach(el => el.classList.remove('selected'));
    setState('selectedElement', null);
    console.log("All elements deselected");
}

function updateDesignPanel(element) {
    const elementType = element.getAttribute('data-element');
    const editor = document.getElementById('element-editor');
    
    if (!editor) return;

    // Update editor title and icon based on element type
    const title = editor.querySelector('.editor-title');
    if (title) {
        const iconMap = {
            'hero': '👤',
            'topics': '💬',
            'social': '🔗',
            'bio': '📝',
            'contact': '📧',
            'questions': '❓',
            'stats': '📊',
            'cta': '🎯',
            'logo-grid': '🏢',
            'testimonials': '💬'
        };
        
        const elementNames = {
            'hero': 'Hero Section',
            'topics': 'Topics Section',
            'social': 'Social Links',
            'bio': 'Biography',
            'contact': 'Contact Information',
            'questions': 'Interview Questions',
            'stats': 'Statistics',
            'cta': 'Call to Action',
            'logo-grid': 'Logo Grid',
            'testimonials': 'Testimonials'
        };

        title.innerHTML = `
            <span style="font-size: 16px;">${iconMap[elementType] || '⚙️'}</span>
            ${elementNames[elementType] || 'Element Settings'}
        `;
    }

    // Show relevant form controls based on element type
    showRelevantControls(elementType);
}

function showRelevantControls(elementType) {
    // This would dynamically show/hide relevant form controls
    console.log('Updating controls for:', elementType);
}

function setupContentEditableUpdates() {
    console.log("Setting up contenteditable updates...");
    
    // Use event delegation for contenteditable elements
    document.addEventListener('blur', function(e) {
        if (e.target.hasAttribute('contenteditable')) {
            markUnsaved();
            saveCurrentState();
        }
    }, true);

    document.addEventListener('keydown', function(e) {
        if (e.target.hasAttribute('contenteditable')) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.target.blur();
            }
        }
    }, true);
}

function setupElementEvents(element) {
    // Add click event to make it selectable
    element.addEventListener('click', function(e) {
        e.stopPropagation();
        selectElement(this);
    });
    
    // Add events for contenteditable elements
    const editableElements = element.querySelectorAll('[contenteditable="true"]');
    editableElements.forEach(editable => {
        editable.addEventListener('blur', function() {
            markUnsaved();
            saveCurrentState();
        });
        
        editable.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.blur();
            }
        });
    });
}

function deleteSelectedElement() {
    const selectedElement = getState('selectedElement');
    if (selectedElement && selectedElement.getAttribute('data-component') !== 'hero') {
        selectedElement.remove();
        setState('selectedElement', null);
        markUnsaved();
        saveCurrentState();
        console.log("Selected element deleted");
    }
}

// ====================================================
// UI: DRAG & DROP
// ====================================================
function setupDragAndDrop() {
    console.log("Setting up drag and drop...");
    
    // Make components draggable
    const componentItems = document.querySelectorAll('.component-item[draggable="true"]');
    
    componentItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            setState('draggedComponent', this.getAttribute('data-component'));
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'copy';
            console.log("Dragging component: " + getState('draggedComponent'));
        });

        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            setState('draggedComponent', null);
        });
    });

    // Set up drop zones
    const dropZones = document.querySelectorAll('.drop-zone');
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            this.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });

        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            const draggedComponent = getState('draggedComponent');
            if (draggedComponent) {
                // Check if premium component
                const componentElement = document.querySelector(`[data-component="${draggedComponent}"]`);
                if (componentElement && componentElement.classList.contains('premium')) {
                    showUpgradePrompt();
                    return;
                }
                
                addComponentToZone(draggedComponent, this);
                markUnsaved();
                saveCurrentState();
                console.log("Component dropped: " + draggedComponent);
            }
        });

        // Click to add component
        zone.addEventListener('click', function() {
            if (this.classList.contains('empty')) {
                showComponentLibraryModal();
                console.log("Empty drop zone clicked, showing component library");
            }
        });
    });

    // Initialize sortable for rearranging components
    if (typeof Sortable !== 'undefined') {
        const mediaKitPreview = document.getElementById('media-kit-preview');
        if (mediaKitPreview) {
            new Sortable(mediaKitPreview, {
                animation: 150,
                handle: '.element-controls',
                draggable: '.editable-element',
                onEnd: function() {
                    markUnsaved();
                    saveCurrentState();
                    console.log("Components reordered");
                }
            });
        } else {
            console.error("Could not find #media-kit-preview element");
        }
    } else {
        console.error("Sortable.js is not loaded");
    }

    // Set up element control buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('control-btn')) {
            e.stopPropagation();
            const action = e.target.getAttribute('title');
            const element = e.target.closest('.editable-element');
            
            if (action === 'Delete') {
                if (element.getAttribute('data-component') !== 'hero') {
                    element.remove();
                    markUnsaved();
                    saveCurrentState();
                    console.log("Element deleted");
                } else {
                    alert("You cannot delete the hero section");
                }
            } else if (action === 'Duplicate') {
                const clone = element.cloneNode(true);
                element.parentNode.insertBefore(clone, element.nextSibling);
                markUnsaved();
                saveCurrentState();
                console.log("Element duplicated");
                
                // Add event listeners to the cloned element
                setupElementEvents(clone);
            } else if (action === 'Move Up') {
                const prev = element.previousElementSibling;
                if (prev && !prev.classList.contains('drop-zone')) {
                    element.parentNode.insertBefore(element, prev);
                    markUnsaved();
                    saveCurrentState();
                    console.log("Element moved up");
                }
            } else if (action === 'Move Down') {
                const next = element.nextElementSibling;
                if (next && !next.classList.contains('drop-zone')) {
                    element.parentNode.insertBefore(next, element);
                    markUnsaved();
                    saveCurrentState();
                    console.log("Element moved down");
                }
            }
        }
    });
}

// ====================================================
// SERVICES: SAVE SYSTEM
// ====================================================
function setupSaveSystem() {
    console.log("Setting up save system...");
    
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveMediaKit();
        });
    }

    // Auto-save every 30 seconds
    setInterval(() => {
        if (state.isUnsaved) {
            autoSave();
        }
    }, 30000);
}

function saveMediaKit() {
    const saveBtn = document.getElementById('save-btn');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-indicator span');

    // Update UI to show saving state
    if (saveBtn) saveBtn.disabled = true;
    if (statusDot) statusDot.classList.add('saving');
    if (statusText) statusText.textContent = 'Saving...';

    // Simulate save operation
    setTimeout(() => {
        setState('isUnsaved', false);
        if (saveBtn) saveBtn.disabled = false;
        if (statusDot) statusDot.classList.remove('saving');
        if (statusText) statusText.textContent = 'Saved';
        
        console.log('Media kit saved successfully');
    }, 1500);
}

function autoSave() {
    const statusText = document.querySelector('.status-indicator span');
    if (statusText) statusText.textContent = 'Auto-saving...';
    
    setTimeout(() => {
        setState('isUnsaved', false);
        if (statusText) statusText.textContent = 'Saved';
    }, 1000);
}

function markUnsaved() {
    setState('isUnsaved', true);
    const statusText = document.querySelector('.status-indicator span');
    if (statusText) statusText.textContent = 'Unsaved changes';
}

// ====================================================
// SERVICES: HISTORY (UNDO/REDO)
// ====================================================
function saveCurrentState() {
    const mediaKitPreview = document.getElementById('media-kit-preview');
    if (!mediaKitPreview) return;
    
    const currentState = mediaKitPreview.innerHTML;
    state.undoStack.push(currentState);
    state.redoStack = [];
    
    // Limit undo stack to 50 items
    if (state.undoStack.length > 50) {
        state.undoStack.shift();
    }
    
    // Update button states
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) undoBtn.disabled = false;
    if (redoBtn) redoBtn.disabled = true;
}

function undo() {
    const mediaKitPreview = document.getElementById('media-kit-preview');
    if (!mediaKitPreview) return;
    
    if (state.undoStack.length > 0) {
        const currentState = mediaKitPreview.innerHTML;
        state.redoStack.push(currentState);
        
        const previousState = state.undoStack.pop();
        mediaKitPreview.innerHTML = previousState;
        
        // Update button states
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) undoBtn.disabled = state.undoStack.length === 0;
        if (redoBtn) redoBtn.disabled = false;
        
        markUnsaved();
        console.log("Undo performed");
    }
}

function redo() {
    const mediaKitPreview = document.getElementById('media-kit-preview');
    if (!mediaKitPreview) return;
    
    if (state.redoStack.length > 0) {
        const currentState = mediaKitPreview.innerHTML;
        state.undoStack.push(currentState);
        
        const nextState = state.redoStack.pop();
        mediaKitPreview.innerHTML = nextState;
        
        // Update button states
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) undoBtn.disabled = false;
        if (redoBtn) redoBtn.disabled = state.redoStack.length === 0;
        
        markUnsaved();
        console.log("Redo performed");
    }
}

// ====================================================
// SERVICES: KEYBOARD SHORTCUTS
// ====================================================
function setupKeyboardShortcuts() {
    console.log("Setting up keyboard shortcuts...");
    
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    saveMediaKit();
                    break;
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                    break;
                case 'e':
                    e.preventDefault();
                    showExportModal();
                    break;
            }
        }
        
        if (e.key === 'Delete' && getState('selectedElement')) {
            deleteSelectedElement();
        }
    });
}

// ====================================================
// SERVICES: SHARE SYSTEM
// ====================================================
function setupShareSystem() {
    console.log("Setting up share system...");
    
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const shareUrl = `https://guestify.com/share/${generateShareId()}`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'My Media Kit',
                    text: 'Check out my professional media kit created with Guestify',
                    url: shareUrl
                });
            } else {
                // Fallback for browsers without Web Share API
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        alert('Share link copied to clipboard!');
                    });
                } else {
                    prompt('Share this link:', shareUrl);
                }
            }
        });
    }
}

function generateShareId() {
    return Math.random().toString(36).substr(2, 9);
}

// ====================================================
// MODALS: GLOBAL SETTINGS
// ====================================================
function setupGlobalSettings() {
    console.log("Setting up global settings...");
    
    const globalSettingsBtn = document.getElementById('global-settings-btn');
    const globalThemeBtn = document.getElementById('global-theme-btn');
    const closeGlobalSettings = document.getElementById('close-global-settings');
    const globalSettingsModal = document.getElementById('global-settings-modal');

    if (globalSettingsBtn) {
        globalSettingsBtn.addEventListener('click', showGlobalSettings);
    }

    if (globalThemeBtn) {
        globalThemeBtn.addEventListener('click', showGlobalSettings);
    }

    if (closeGlobalSettings) {
        closeGlobalSettings.addEventListener('click', hideGlobalSettings);
    }

    if (globalSettingsModal) {
        globalSettingsModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideGlobalSettings();
            }
        });
    }

    // Palette selection
    const paletteOptions = document.querySelectorAll('.palette-option');
    paletteOptions.forEach(option => {
        option.addEventListener('click', function() {
            paletteOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const palette = this.getAttribute('data-palette');
            applyThemePalette(palette);
        });
    });

    // Font changes
    const primaryFont = document.getElementById('primary-font');
    const secondaryFont = document.getElementById('secondary-font');

    if (primaryFont) {
        primaryFont.addEventListener('change', function() {
            applyPrimaryFont(this.value);
        });
    }

    if (secondaryFont) {
        secondaryFont.addEventListener('change', function() {
            applySecondaryFont(this.value);
        });
    }
}

function showGlobalSettings() {
    const modal = document.getElementById('global-settings-modal');
    if (modal) modal.style.display = 'flex';
    console.log("Global settings modal shown");
}

function hideGlobalSettings() {
    const modal = document.getElementById('global-settings-modal');
    if (modal) modal.style.display = 'none';
    console.log("Global settings modal hidden");
}

function applyThemePalette(palette) {
    setState('currentTheme', palette);
    const preview = document.getElementById('media-kit-preview');
    
    // Remove existing theme classes
    if (preview) {
        preview.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-pink', 'theme-gray');
        
        // Add new theme class
        preview.classList.add(`theme-${palette}`);
    }
    
    // Update CSS variables based on palette
    const paletteColors = {
        blue: { primary: '#3b82f6', secondary: '#dbeafe', accent: '#1e40af' },
        green: { primary: '#10b981', secondary: '#dcfce7', accent: '#047857' },
        purple: { primary: '#8b5cf6', secondary: '#f3e8ff', accent: '#7c3aed' },
        orange: { primary: '#f97316', secondary: '#fed7aa', accent: '#ea580c' },
        pink: { primary: '#ec4899', secondary: '#fce7f3', accent: '#db2777' },
        gray: { primary: '#64748b', secondary: '#f1f5f9', accent: '#475569' }
    };

    const colors = paletteColors[palette];
    if (colors) {
        document.documentElement.style.setProperty('--theme-primary', colors.primary);
        document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
        document.documentElement.style.setProperty('--theme-accent', colors.accent);
    }

    markUnsaved();
    console.log("Theme palette changed to: " + palette);
}

function applyPrimaryFont(fontFamily) {
    document.documentElement.style.setProperty('--primary-font', fontFamily);
    markUnsaved();
    console.log("Primary font changed to: " + fontFamily);
}

function applySecondaryFont(fontFamily) {
    document.documentElement.style.setProperty('--secondary-font', fontFamily);
    markUnsaved();
    console.log("Secondary font changed to: " + fontFamily);
}

// ====================================================
// MODALS: EXPORT SYSTEM
// ====================================================
function setupExportSystem() {
    console.log("Setting up export system...");
    
    const exportBtn = document.getElementById('export-btn');
    const closeExportModal = document.getElementById('close-export-modal');
    const exportModal = document.getElementById('export-modal');

    if (exportBtn) {
        exportBtn.addEventListener('click', showExportModal);
    }

    if (closeExportModal) {
        closeExportModal.addEventListener('click', hideExportModal);
    }

    if (exportModal) {
        exportModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideExportModal();
            }
        });
    }

    // Export option selection
    const exportOptions = document.querySelectorAll('.export-option');
    exportOptions.forEach(option => {
        option.addEventListener('click', function() {
            const exportType = this.getAttribute('data-export');
            handleExport(exportType);
        });
    });
}

function showExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) modal.style.display = 'flex';
    console.log("Export modal shown");
}

function hideExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) modal.style.display = 'none';
    console.log("Export modal hidden");
}

function handleExport(type) {
    switch(type) {
        case 'pdf':
            exportToPDF();
            break;
        case 'image':
            exportToImage();
            break;
        case 'html':
            exportToHTML();
            break;
        case 'embed':
            generateEmbedCode();
            break;
    }
    hideExportModal();
}

function exportToPDF() {
    // Simulate PDF export
    console.log('Exporting to PDF...');
    alert('PDF export functionality would be implemented here using libraries like jsPDF or html2canvas + jsPDF');
}

function exportToImage() {
    // Simulate image export
    console.log('Exporting to Image...');
    alert('Image export functionality would be implemented here using html2canvas');
}

function exportToHTML() {
    // Simulate HTML export
    console.log('Generating shareable link...');
    const shareableUrl = `https://guestify.com/share/${generateShareId()}`;
    prompt('Your shareable link:', shareableUrl);
}

function generateEmbedCode() {
    // Simulate embed code generation
    const embedCode = `<iframe src="https://guestify.com/embed/${generateShareId()}" width="100%" height="600" frameborder="0"></iframe>`;
    prompt('Embed code for your website:', embedCode);
}

// ====================================================
// MODALS: COMPONENT LIBRARY
// ====================================================
function setupComponentLibraryModal() {
    console.log("Setting up component library modal...");
    
    const openLibraryBtn = document.getElementById('add-component-btn');
    const closeLibraryBtn = document.getElementById('close-library');
    const componentLibraryOverlay = document.getElementById('component-library-overlay');

    if (openLibraryBtn) {
        openLibraryBtn.addEventListener('click', showComponentLibraryModal);
    }
    
    if (closeLibraryBtn) {
        closeLibraryBtn.addEventListener('click', hideComponentLibraryModal);
    }
    
    if (componentLibraryOverlay) {
        componentLibraryOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                hideComponentLibraryModal();
            }
        });
    }

    // Category filtering in modal
    const categoryItems = document.querySelectorAll('.category-item');
    const categoryFilter = document.getElementById('category-filter');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            categoryItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterComponents(category);
            if (categoryFilter) categoryFilter.value = category;
        });
    });

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const category = this.value;
            filterComponents(category);
            categoryItems.forEach(i => i.classList.remove('active'));
            const matchingSidebarItem = document.querySelector(`.category-item[data-category="${category}"]`);
            if (matchingSidebarItem) matchingSidebarItem.classList.add('active');
        });
    }

    // Search functionality in modal
    const componentSearch = document.getElementById('component-search');
    if (componentSearch) {
        componentSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const cards = document.querySelectorAll('.component-card');
            
            cards.forEach(card => {
                const title = card.querySelector('h4').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Component selection in modal
    const componentCards = document.querySelectorAll('.component-card');
    componentCards.forEach(card => {
        card.addEventListener('click', function() {
            const componentType = this.getAttribute('data-component');
            const isPremium = this.classList.contains('premium');
            
            if (isPremium) {
                showUpgradePrompt();
            } else {
                const firstEmptyDropZone = document.querySelector('.drop-zone.empty');
                if (firstEmptyDropZone) {
                    addComponentToZone(componentType, firstEmptyDropZone);
                    hideComponentLibraryModal();
                    markUnsaved();
                    saveCurrentState();
                } else {
                    alert('Please make space for a new component by moving or deleting an existing one, or dragging to an empty drop zone.');
                }
            }
        });
    });
}

function showComponentLibraryModal() {
    const modal = document.getElementById('component-library-overlay');
    if (modal) modal.style.display = 'flex';
    console.log("Component library modal shown");
}

function hideComponentLibraryModal() {
    const modal = document.getElementById('component-library-overlay');
    if (modal) modal.style.display = 'none';
    console.log("Component library modal hidden");
}

function filterComponents(category) {
    const cards = document.querySelectorAll('.component-card');
    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ====================================================
// COMPONENTS: COMPONENT MANAGEMENT
// ====================================================
function addComponentToZone(componentType, zone) {
    console.log("Adding component to zone: " + componentType);
    const template = getComponentTemplate(componentType);
    zone.classList.remove('empty');
    zone.innerHTML = template;
    
    // Make the new element selectable
    const newElement = zone.querySelector('.editable-element');
    if (newElement) {
        // Add event listeners to the new element
        setupElementEvents(newElement);
        
        // Select the newly added element
        selectElement(newElement);
    }
}

function getComponentTemplate(componentType) {
    const templates = {
        'hero': `
            <div class="hero-section editable-element" data-element="hero" data-component="hero">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <div class="hero-avatar">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='50' font-size='50' text-anchor='middle' x='50' fill='%2364748b'%3EDJ%3C/text%3E%3C/svg%3E" alt="Profile Avatar">
                </div>
                <h1 class="hero-name" contenteditable="true">New Hero Section</h1>
                <div class="hero-title" contenteditable="true">Your Professional Title</div>
                <p class="hero-bio" contenteditable="true">Briefly introduce yourself and your expertise.</p>
            </div>
        `,
        'bio': `
            <div class="content-section editable-element" data-element="bio" data-component="bio">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title-mk" contenteditable="true">About Me</h2>
                <p contenteditable="true">Add your full biography and professional background here. This is where you can share your story, expertise, and what makes you unique as a speaker or expert in your field.</p>
            </div>
        `,
        'topics': `
            <div class="content-section editable-element" data-element="topics" data-component="topics">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title-mk" contenteditable="true">Speaking Topics</h2>
                <div class="topics-grid">
                    <div class="topic-item" contenteditable="true">Topic 1</div>
                    <div class="topic-item" contenteditable="true">Topic 2</div>
                    <div class="topic-item" contenteditable="true">Topic 3</div>
                    <div class="topic-item" contenteditable="true">Topic 4</div>
                </div>
            </div>
        `,
        'social': `
            <div class="social-links editable-element" data-element="social" data-component="social">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <a href="#" class="social-link" title="Twitter">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                </a>
                <a href="#" class="social-link" title="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                        <circle cx="4" cy="4" r="2"/>
                    </svg>
                </a>
                <a href="#" class="social-link" title="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                </a>
            </div>
        `,
        'stats': `
            <div class="content-section editable-element" data-element="stats" data-component="stats">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title-mk" contenteditable="true">Key Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number" contenteditable="true">1.2M</span>
                        <div class="stat-label" contenteditable="true">Followers</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" contenteditable="true">150+</span>
                        <div class="stat-label" contenteditable="true">Podcast Shows</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" contenteditable="true">500K</span>
                        <div class="stat-label" contenteditable="true">Downloads</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" contenteditable="true">5</span>
                        <div class="stat-label" contenteditable="true">Years Experience</div>
                    </div>
                </div>
            </div>
        `,
        'cta': `
            <div class="content-section editable-element" data-element="cta" data-component="cta">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <div class="cta-section">
                    <h2 class="section-title-mk" contenteditable="true">Ready to Connect?</h2>
                    <p contenteditable="true">Let's discuss how we can work together on your next project or podcast.</p>
                    <a href="#" class="cta-button" contenteditable="true">Book a Meeting</a>
                </div>
            </div>
        `,
        'logo-grid': `
            <div class="content-section editable-element" data-element="logo-grid" data-component="logo-grid">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title-mk" contenteditable="true">Featured On</h2>
                <div class="logo-grid">
                    <div class="logo-item">
                        <div class="logo-placeholder">Click to add logo</div>
                    </div>
                    <div class="logo-item">
                        <div class="logo-placeholder">Click to add logo</div>
                    </div>
                    <div class="logo-item">
                        <div class="logo-placeholder">Click to add logo</div>
                    </div>
                    <div class="logo-item">
                        <div class="logo-placeholder">Click to add logo</div>
                    </div>
                </div>
            </div>
        `,
        'testimonials': `
            <div class="content-section editable-element" data-element="testimonials" data-component="testimonials">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title-mk" contenteditable="true">What People Say</h2>
                <div class="testimonial-card">
                    <p class="testimonial-quote" contenteditable="true">"An incredible speaker with deep insights into quantum physics and ancient technology. Highly recommended!"</p>
                    <div class="testimonial-author" contenteditable="true">Sarah Mitchell</div>
                    <div class="testimonial-role" contenteditable="true">Host, The Science Podcast</div>
                </div>
            </div>
        `,
        'contact': `
            <div class="content-section editable-element" data-element="contact" data-component="contact">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title-mk" contenteditable="true">Contact Information</h2>
                <div class="contact-info">
                    <p contenteditable="true">📧 your.email@example.com</p>
                    <p contenteditable="true">📱 +1 (555) 123-4567</p>
                    <p contenteditable="true">🌐 www.yourwebsite.com</p>
                </div>
            </div>
        `,
        'questions': `
            <div class="content-section editable-element" data-element="questions" data-component="questions">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title-mk" contenteditable="true">Interview Questions</h2>
                <div class="questions-list">
                    <div class="question-item" contenteditable="true">What inspired you to become an expert in your field?</div>
                    <div class="question-item" contenteditable="true">What's the most common misconception about your industry?</div>
                    <div class="question-item" contenteditable="true">What advice would you give to someone starting out?</div>
                </div>
            </div>
        `
    };
    
    return templates[componentType] || '<div class="content-section"><p>Component template not found</p></div>';
}

// ====================================================
// MAIN INITIALIZATION
// ====================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("Guestify Media Kit Builder v2 initialization started");
    
    // Initialize all modules
    resetState();
    setupTabs();
    setupPreviewToggle();
    setupDragAndDrop();
    setupElementSelection();
    setupContentEditableUpdates();
    setupFormUpdates();
    setupLayoutOptions();
    setupSaveSystem();
    setupKeyboardShortcuts();
    setupComponentLibraryModal();
    setupGlobalSettings();
    setupExportSystem();
    setupShareSystem();
    
    // Initialize the first state for undo/redo
    setTimeout(() => {
        saveCurrentState();
    }, 500);
    
    console.log('Guestify Media Kit Builder v2 initialized');
});
