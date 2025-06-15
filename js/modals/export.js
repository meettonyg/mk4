/**
 * Export modal functionality
 */

import { showModal, hideModal, setupModalClose } from './modal-base.js';

/**
 * Set up export system
 */
export function setupExportSystem() {
    const exportBtn = document.getElementById('export-btn');
    setupModalClose('export-modal', 'close-export-modal');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', showExportModal);
    }

    const exportOptions = document.querySelectorAll('.export-option');
    exportOptions.forEach(option => {
        option.addEventListener('click', function() {
            const exportType = this.getAttribute('data-export');
            handleExport(exportType);
        });
    });
}

/**
 * Show the export modal
 */
export function showExportModal() {
    showModal('export-modal');
}

/**
 * Hide the export modal
 */
export function hideExportModal() {
    hideModal('export-modal');
}

/**
 * Handle export based on type
 * @param {string} type - The export type
 */
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

/**
 * Export to PDF
 */
function exportToPDF() {
    // Simulate PDF export
    console.log('Exporting to PDF...');
    alert('PDF export functionality would be implemented here using libraries like jsPDF or html2canvas + jsPDF');
}

/**
 * Export to image
 */
function exportToImage() {
    // Simulate image export
    console.log('Exporting to Image...');
    alert('Image export functionality would be implemented here using html2canvas');
}

/**
 * Export to HTML
 */
function exportToHTML() {
    // Simulate HTML export
    console.log('Generating shareable link...');
    const shareableUrl = `https://guestify.com/share/${generateShareId()}`;
    prompt('Your shareable link:', shareableUrl);
}

/**
 * Generate embed code
 */
function generateEmbedCode() {
    // Simulate embed code generation
    const embedCode = `<iframe src="https://guestify.com/embed/${generateShareId()}" width="100%" height="600" frameborder="0"></iframe>`;
    prompt('Embed code for your website:', embedCode);
}

/**
 * Generate a random share ID
 * @returns {string} A random share ID
 */
function generateShareId() {
    return Math.random().toString(36).substr(2, 9);
}
