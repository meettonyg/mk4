/**
 * Element controls functionality (move, duplicate, delete)
 */

import { markUnsaved } from '../services/save-service.js';
import { saveCurrentState } from '../services/history-service.js';
import { selectElement, deleteSelectedElement } from './element-editor.js';

/**
 * Setup event listeners for element control buttons
 */
export function setupElementControls() {
    // Bind control buttons immediately
    bindControlButtons();
    
    // Debounce timer for mutation observer
    let debounceTimer = null;
    
    // Re-bind buttons when content changes (for dynamically added elements)
    const observer = new MutationObserver((mutations) => {
        // Clear existing timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        // Set new timer to debounce rapid mutations
        debounceTimer = setTimeout(() => {
            // Check if any mutations actually added control buttons
            const hasNewButtons = mutations.some(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    return Array.from(mutation.addedNodes).some(node => {
                        return node.nodeType === 1 && (node.classList?.contains('control-btn') || 
                               node.querySelector?.('.control-btn'));
                    });
                }
                return false;
            });
            
            // Only rebind if new buttons were actually added
            if (hasNewButtons) {
                bindControlButtons();
            }
        }, 100); // 100ms debounce
    });
    
    // Observe only the preview area instead of entire body
    const previewArea = document.getElementById('media-kit-preview');
    if (previewArea) {
        observer.observe(previewArea, { 
            childList: true, 
            subtree: true 
        });
    }
    
    // Listen for custom rebindControls events
    document.addEventListener('rebindControls', function() {
        console.log('Rebinding control buttons');
        bindControlButtons();
    });
    
    console.log('Element controls initialized');
}

// Track which buttons have been bound
const boundButtons = new WeakSet();

/**
 * Bind event listeners to all control buttons
 */
function bindControlButtons() {
    const controlButtons = document.querySelectorAll('.control-btn');
    let newButtonsCount = 0;
    
    controlButtons.forEach(button => {
        // Skip if already bound
        if (boundButtons.has(button)) {
            return;
        }
        
        // Mark as bound
        boundButtons.add(button);
        newButtonsCount++;
        
        // Add listener
        button.addEventListener('click', handleControlButtonClick);
    });
    
    if (newButtonsCount > 0) {
        console.log(`Bound ${newButtonsCount} new control buttons (${controlButtons.length} total)`);
    }
}

/**
 * Handle control button click events
 * @param {Event} e - The click event
 */
function handleControlButtonClick(e) {
    e.stopPropagation();
    e.preventDefault();
    
    const button = e.currentTarget;
    const element = button.closest('.editable-element');
    
    if (!element) {
        console.warn('Control button clicked but no parent editable element found');
        return;
    }
    
    // Get the action from the title attribute
    const action = button.getAttribute('title');
    console.log(`Control action: ${action} on element:`, element);
    
    // Perform the corresponding action
    if (action === 'Move Up') {
        moveElementUp(element);
    } else if (action === 'Move Down') {
        moveElementDown(element);
    } else if (action === 'Duplicate') {
        duplicateElement(element);
    } else if (action === 'Delete') {
        deleteElement(element);
    }
}

/**
 * Move an element up in the DOM
 * @param {HTMLElement} element - The element to move up
 */
function moveElementUp(element) {
    console.log('Moving element up');
    const previousElement = getPreviousElement(element);
    
    if (previousElement) {
        // Check if the elements are in drop zones
        const currentZone = element.parentNode;
        const previousZone = previousElement.parentNode;
        
        if (currentZone.classList.contains('drop-zone') && previousZone.classList.contains('drop-zone')) {
            // Swap elements between drop zones
            const tempHtml = previousZone.innerHTML;
            previousZone.innerHTML = currentZone.innerHTML;
            currentZone.innerHTML = tempHtml;
        } else {
            // Regular element movement
            element.parentNode.insertBefore(element, previousElement);
        }
        
        // Mark as unsaved
        markUnsaved();
        saveCurrentState();
        
        // Select the moved element
        selectElement(element);
        
        // Rebind controls because DOM has changed
        bindControlButtons();
    } else {
        console.log('No previous element found');
    }
}

/**
 * Move an element down in the DOM
 * @param {HTMLElement} element - The element to move down
 */
function moveElementDown(element) {
    console.log('Moving element down');
    const nextElement = getNextElement(element);
    
    if (nextElement) {
        // Check if the elements are in drop zones
        const currentZone = element.parentNode;
        const nextZone = nextElement.parentNode;
        
        if (currentZone.classList.contains('drop-zone') && nextZone.classList.contains('drop-zone')) {
            // Swap elements between drop zones
            const tempHtml = nextZone.innerHTML;
            nextZone.innerHTML = currentZone.innerHTML;
            currentZone.innerHTML = tempHtml;
        } else if (nextElement.nextSibling) {
            // If there's an element after the next element, insert before that
            nextElement.parentNode.insertBefore(element, nextElement.nextSibling);
        } else {
            // Otherwise append to the end
            nextElement.parentNode.appendChild(element);
        }
        
        // Mark as unsaved
        markUnsaved();
        saveCurrentState();
        
        // Select the moved element
        selectElement(element);
        
        // Rebind controls because DOM has changed
        bindControlButtons();
    } else {
        console.log('No next element found');
    }
}

/**
 * Duplicate an element
 * @param {HTMLElement} element - The element to duplicate
 */
function duplicateElement(element) {
    console.log('Duplicating element');
    // Clone the element deeply (including all children)
    const clone = element.cloneNode(true);
    
    // Insert the clone after the original element
    if (element.nextSibling) {
        element.parentNode.insertBefore(clone, element.nextSibling);
    } else {
        element.parentNode.appendChild(clone);
    }
    
    // Mark as unsaved
    markUnsaved();
    saveCurrentState();
    
    // Select the cloned element
    selectElement(clone);
    
    // Rebind controls because DOM has changed
    bindControlButtons();
}

/**
 * Delete an element
 * @param {HTMLElement} element - The element to delete
 */
function deleteElement(element) {
    console.log('Deleting element');
    if (element.getAttribute('data-component') === 'hero') {
        console.log('Hero element cannot be deleted');
        return;
    }
    
    // Check if the element is in a drop zone
    const parentNode = element.parentNode;
    if (parentNode && parentNode.classList.contains('drop-zone')) {
        // If in a drop zone, make the zone empty again
        parentNode.innerHTML = '';
        parentNode.classList.add('drop-zone--empty');
    } else {
        // Otherwise, just remove the element
        element.remove();
    }
    
    // Mark as unsaved
    markUnsaved();
    saveCurrentState();
    
    // Rebind controls because DOM has changed
    bindControlButtons();
}

/**
 * Get the previous editable element in the DOM
 * @param {HTMLElement} element - The current element
 * @returns {HTMLElement|null} The previous editable element, or null if none exists
 */
function getPreviousElement(element) {
    // First try to find previous editable element within the same container
    let prevElement = element.previousElementSibling;
    while (prevElement && !prevElement.classList.contains('editable-element')) {
        prevElement = prevElement.previousElementSibling;
    }
    
    if (prevElement) return prevElement;
    
    // If no previous sibling found, look for elements in previous drop zones
    const dropZones = Array.from(document.querySelectorAll('.drop-zone'));
    const currentZoneIndex = dropZones.findIndex(zone => zone.contains(element));
    
    if (currentZoneIndex > 0) {
        const prevZone = dropZones[currentZoneIndex - 1];
        const prevZoneElement = prevZone.querySelector('.editable-element');
        if (prevZoneElement) return prevZoneElement;
    }
    
    // If all else fails, try to get any previous element in the document
    const allElements = Array.from(document.querySelectorAll('.editable-element'));
    const index = allElements.indexOf(element);
    return index > 0 ? allElements[index - 1] : null;
}

/**
 * Get the next editable element in the DOM
 * @param {HTMLElement} element - The current element
 * @returns {HTMLElement|null} The next editable element, or null if none exists
 */
function getNextElement(element) {
    // First try to find next editable element within the same container
    let nextElement = element.nextElementSibling;
    while (nextElement && !nextElement.classList.contains('editable-element')) {
        nextElement = nextElement.nextElementSibling;
    }
    
    if (nextElement) return nextElement;
    
    // If no next sibling found, look for elements in next drop zones
    const dropZones = Array.from(document.querySelectorAll('.drop-zone'));
    const currentZoneIndex = dropZones.findIndex(zone => zone.contains(element));
    
    if (currentZoneIndex >= 0 && currentZoneIndex < dropZones.length - 1) {
        const nextZone = dropZones[currentZoneIndex + 1];
        const nextZoneElement = nextZone.querySelector('.editable-element');
        if (nextZoneElement) return nextZoneElement;
    }
    
    // If all else fails, try to get any next element in the document
    const allElements = Array.from(document.querySelectorAll('.editable-element'));
    const index = allElements.indexOf(element);
    return index < allElements.length - 1 ? allElements[index + 1] : null;
}

// Export the bindControlButtons function so it can be called from elsewhere
export { bindControlButtons };
