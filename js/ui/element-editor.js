/**
 * Element selection and editing functionality
 */

import { getState, setState } from '../state.js';
import { markUnsaved } from '../services/save-service.js';
import { saveCurrentState } from '../services/history-service.js';

/**
 * Set up element selection functionality
 */
export function setupElementSelection() {
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
            !e.target.closest('.sidebar') && 
            !e.target.closest('.library') &&
            !e.target.closest('.modal__content')) {
            deselectAllElements();
        }
    });
}

/**
 * Select an element
 * @param {HTMLElement} element - The element to select
 */
export function selectElement(element) {
    // Remove selection from all elements
    document.querySelectorAll('.editable-element').forEach(el => {
        el.classList.remove('editable-element--selected');
    });

    // Select clicked element
    element.classList.add('editable-element--selected');
    setState('selectedElement', element);

    // Update design panel
    updateDesignPanel(element);

    // Switch to design tab
    document.querySelector('.sidebar__tab[data-tab="design"]').click();
}

/**
 * Deselect all elements
 */
export function deselectAllElements() {
    document.querySelectorAll('.editable-element').forEach(el => {
        el.classList.remove('editable-element--selected');
    });
    setState('selectedElement', null);
}

/**
 * Update the design panel based on the selected element
 * @param {HTMLElement} element - The selected element
 */
export function updateDesignPanel(element) {
    const elementType = element.getAttribute('data-element');
    const editor = document.getElementById('element-editor');
    
    if (!editor) return;

    // Update editor title and icon based on element type
    const title = editor.querySelector('.element-editor__title');
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

/**
 * Show relevant controls based on element type
 * @param {string} elementType - The type of element
 */
function showRelevantControls(elementType) {
    // This would dynamically show/hide relevant form controls
    console.log('Updating controls for:', elementType);
}

/**
 * Set up contenteditable live updates
 */
export function setupContentEditableUpdates() {
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    
    editableElements.forEach(element => {
        element.addEventListener('blur', function() {
            markUnsaved();
            saveCurrentState();
        });

        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.blur();
            }
        });
    });
}

/**
 * Delete the selected element
 */
export function deleteSelectedElement() {
    const selectedElement = getState('selectedElement');
    if (selectedElement && selectedElement.getAttribute('data-component') !== 'hero') {
        selectedElement.remove();
        setState('selectedElement', null);
        markUnsaved();
        saveCurrentState();
    }
}
