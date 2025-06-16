/**
 * Layout options functionality
 */

import { markUnsaved } from '../services/save-service.js';
import { selectElement } from './element-editor.js';
import { getComponentTemplate } from '../components/component-manager.js';

/**
 * Set up layout options
 */
export function setupLayoutOptions() {
    const layoutOptions = document.querySelectorAll('.layout-option');
    
    // Set up layout selection
    layoutOptions.forEach(option => {
        option.addEventListener('click', function() {
            layoutOptions.forEach(opt => opt.classList.remove('layout-option--active'));
            this.classList.add('layout-option--active');
            
            const layout = this.getAttribute('data-layout');
            applyLayout(layout);
            markUnsaved();
        });
    });
    
    // Set up Add Section button
    const addSectionBtn = document.getElementById('add-section-btn');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', function() {
            addNewSection();
        });
    }
    
    // Set up Duplicate Section button
    const duplicateSectionBtn = document.getElementById('duplicate-section-btn');
    if (duplicateSectionBtn) {
        duplicateSectionBtn.addEventListener('click', function() {
            duplicateSelectedSection();
        });
    }
    
    console.log('Layout options initialized with Add/Duplicate functionality');
}

/**
 * Apply a layout to the media kit
 * @param {string} layoutType - The type of layout to apply
 */
function applyLayout(layoutType) {
    console.log('Applying layout:', layoutType);
    
    // Get the currently selected element or the media kit container
    const selectedElement = document.querySelector('.editable-element--selected');
    const targetElement = selectedElement || document.getElementById('media-kit-preview');
    
    // Apply layout class to the target element
    if (targetElement) {
        // Remove existing layout classes
        targetElement.classList.remove('layout-full-width', 'layout-two-column', 'layout-sidebar', 'layout-three-column');
        
        // Add new layout class
        targetElement.classList.add(`layout-${layoutType}`);
        
        // Apply layout-specific styles
        applyLayoutStyles(targetElement, layoutType);
        
        markUnsaved();
    }
}

/**
 * Apply specific styles based on the layout type
 * @param {HTMLElement} element - The element to style
 * @param {string} layoutType - The type of layout to apply
 */
function applyLayoutStyles(element, layoutType) {
    // Get all direct child elements
    const children = Array.from(element.children).filter(child => 
        child.classList.contains('editable-element') || 
        child.classList.contains('drop-zone')
    );
    
    // Reset any previous layout styles
    children.forEach(child => {
        child.style.width = '';
        child.style.float = '';
        child.style.marginRight = '';
    });
    
    // Apply layout-specific styles
    switch(layoutType) {
        case 'two-column':
            // Apply two-column layout
            children.forEach(child => {
                if (child.classList.contains('editable-element')) {
                    child.style.width = '48%';
                    child.style.float = 'left';
                    child.style.marginRight = '4%';
                }
                // Reset margin for every second element
                if (children.indexOf(child) % 2 === 1) {
                    child.style.marginRight = '0';
                }
            });
            break;
            
        case 'sidebar':
            // Apply main + sidebar layout
            children.forEach((child, index) => {
                if (child.classList.contains('editable-element')) {
                    if (index === 0) {
                        // First element is main content
                        child.style.width = '65%';
                        child.style.float = 'left';
                        child.style.marginRight = '5%';
                    } else {
                        // Other elements are in sidebar
                        child.style.width = '30%';
                        child.style.float = 'left';
                    }
                }
            });
            break;
            
        case 'three-column':
            // Apply three-column layout
            children.forEach((child, index) => {
                if (child.classList.contains('editable-element')) {
                    child.style.width = '31%';
                    child.style.float = 'left';
                    child.style.marginRight = '3.5%';
                    
                    // Reset margin for every third element
                    if ((children.indexOf(child) + 1) % 3 === 0) {
                        child.style.marginRight = '0';
                    }
                }
            });
            break;
            
        default: // full-width
            // No special styling needed, defaults handled by CSS
            break;
    }
    
    // Add a clearfix to ensure parent contains floated elements
    const clearfix = document.createElement('div');
    clearfix.style.clear = 'both';
    clearfix.style.display = 'table';
    element.appendChild(clearfix);
}

/**
 * Add a new section to the media kit
 */
function addNewSection() {
    console.log('Adding new section');
    
    // Get the currently active layout
    const activeLayout = document.querySelector('.layout-option--active');
    if (!activeLayout) return;
    
    const layoutType = activeLayout.getAttribute('data-layout');
    
    // Create a new section container
    const sectionTemplate = `
        <div class="content-section editable-element" data-element="section" data-component="section" data-layout="${layoutType}">
            <div class="element-controls">
                <button class="control-btn" title="Move Up">↑</button>
                <button class="control-btn" title="Move Down">↓</button>
                <button class="control-btn" title="Duplicate">⧉</button>
                <button class="control-btn" title="Delete">×</button>
            </div>
            <h2 class="section-title" contenteditable="true">New Section</h2>
            <div class="section-content">
                <p contenteditable="true">Add your content here. This section uses the ${layoutType.replace('-', ' ')} layout.</p>
            </div>
        </div>
    `;
    
    // Find the last element in the preview
    const mediaKit = document.getElementById('media-kit-preview');
    const lastElement = Array.from(mediaKit.children)
        .filter(el => el.classList.contains('editable-element') || el.classList.contains('drop-zone'))
        .pop();
    
    // Insert the new section after the last element
    if (lastElement) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sectionTemplate;
        const newSection = tempDiv.firstElementChild;
        
        lastElement.parentNode.insertBefore(newSection, lastElement.nextSibling);
        
        // Make the new section selectable
        newSection.addEventListener('click', function(e) {
            e.stopPropagation();
            selectElement(this);
        });
        
        // Apply the selected layout
        applyLayoutStyles(newSection, layoutType);
        
        // Select the new section
        selectElement(newSection);
        
        // Mark as unsaved
        markUnsaved();
        
        // Rebind control buttons
        const event = new CustomEvent('rebindControls');
        document.dispatchEvent(event);
    }
}

/**
 * Duplicate the currently selected section
 */
function duplicateSelectedSection() {
    console.log('Duplicating selected section');
    
    // Get the currently selected element
    const selectedElement = document.querySelector('.editable-element--selected');
    
    if (selectedElement) {
        // Clone the element
        const clone = selectedElement.cloneNode(true);
        
        // Insert the clone after the selected element
        selectedElement.parentNode.insertBefore(clone, selectedElement.nextSibling);
        
        // Make the clone selectable
        clone.addEventListener('click', function(e) {
            e.stopPropagation();
            selectElement(this);
        });
        
        // Select the cloned element
        selectElement(clone);
        
        // Mark as unsaved
        markUnsaved();
        
        // Rebind control buttons
        const event = new CustomEvent('rebindControls');
        document.dispatchEvent(event);
    } else {
        console.log('No element selected to duplicate');
        // Optionally show a notification to select an element first
    }
}
