/**
 * @file export.js - Manages the export modal functionality.
 * @description This module handles the UI and logic for the "Export Media Kit" modal,
 * including format selection and generating download links.
 * @version 2.0.0
 */

// Export system module - properly exports initialization function

let exportModalElement;

/**
 * Initializes the export system.
 * This should be called once the main application is ready.
 */
function init() {
    console.log('🔄 Initializing Export System...');
    exportModalElement = document.getElementById('export-modal');

    if (!exportModalElement) {
        console.error('Export modal element (#export-modal) not found. Aborting initialization.');
        return;
    }

    // Set up event listeners for the buttons within the modal.
    setupEventListeners();

    console.log('✅ Export System Initialized');
}

/**
 * Sets up all necessary event listeners for the export modal.
 */
function setupEventListeners() {
    // --- THIS IS THE ROOT FIX ---
    // We no longer import `hideModal`. Instead, we use the global API.
    // We find all close buttons and attach the correct API call to them.
    const closeButtons = exportModalElement.querySelectorAll('.modal__close, [data-modal-close]');
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.GMKB_Modals && typeof window.GMKB_Modals.hide === 'function') {
                window.GMKB_Modals.hide('export-modal');
            }
        });
    });

    const exportButton = exportModalElement.querySelector('#export-button');
    if (exportButton) {
        exportButton.addEventListener('click', handleExport);
    }

    // Add any other listeners for format selection, etc.
    const formatSelectors = exportModalElement.querySelectorAll('input[name="export-format"]');
    formatSelectors.forEach(radio => {
        radio.addEventListener('change', handleFormatChange);
    });
}

/**
 * Handles the main export logic when the primary export button is clicked.
 */
function handleExport() {
    const selectedFormat = exportModalElement.querySelector('input[name="export-format"]:checked');
    if (!selectedFormat) {
        alert('Please select an export format.');
        return;
    }

    const format = selectedFormat.value;
    console.log(`🚀 Starting export for format: ${format}`);
    // Add your specific export logic here (e.g., generate PDF, JSON, etc.)
    alert(`Exporting as ${format}... (This is a placeholder)`);

    // You might want to close the modal after export, or show a success message.
    if (window.GMKB_Modals && typeof window.GMKB_Modals.hide === 'function') {
        window.GMKB_Modals.hide('export-modal');
    }
}

/**
 * Handles changes in the selected export format.
 * @param {Event} e The change event.
 */
function handleFormatChange(e) {
    const selectedFormat = e.target.value;
    console.log(`Format changed to: ${selectedFormat}`);
    // You could update the UI or prepare data based on the selected format here.
}

// ROOT FIX: Make export system available globally instead of ES6 export
window.GMKBExportSystem = {
    init,
    setupEventListeners,
    handleExport,
    handleFormatChange
};

// Legacy compatibility
window.setupExportSystem = init;

console.log('✅ Export System: Available globally and ready');

// --- Initialization ---
// Wait for the main GMKB application to be ready before initializing.
document.addEventListener('gmkb:ready', init, { once: true });