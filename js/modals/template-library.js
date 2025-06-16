/**
 * Template Library Modal
 * Shows available templates for selection
 */

import { showModal, hideModal, setupModalClose } from './modal-base.js';
import { templateLoader } from '../services/template-loader.js';

/**
 * Set up template library modal
 */
export function setupTemplateLibrary() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('template-library-modal')) {
        createTemplateModal();
    }
    
    setupModalClose('template-library-modal', 'close-template-library');
    
    // Listen for show event
    document.addEventListener('show-template-library', () => {
        console.log('Received show-template-library event');
        showTemplateLibrary();
    });
    
    // Set up template selection
    document.addEventListener('click', (e) => {
        const templateCard = e.target.closest('.template-card');
        if (templateCard && templateCard.closest('#template-library-modal')) {
            const templateId = templateCard.getAttribute('data-template-id');
            selectTemplate(templateId);
        }
    });
}

/**
 * Create template modal HTML
 */
function createTemplateModal() {
    const modal = document.createElement('div');
    modal.id = 'template-library-modal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    
    modal.innerHTML = `
        <div class="modal modal--large">
            <div class="modal__header">
                <h2 class="modal__title">Choose a Template</h2>
                <button class="modal__close" id="close-template-library">×</button>
            </div>
            <div class="modal__body">
                <div class="template-grid" id="template-grid">
                    <!-- Templates will be populated here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Show template library
 */
function showTemplateLibrary() {
    console.log('showTemplateLibrary called');
    const modal = document.getElementById('template-library-modal');
    if (modal) {
        console.log('Template modal found, showing...');
        populateTemplates();
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
    } else {
        console.error('Template library modal not found!');
    }
}

/**
 * Hide template library
 */
export function hideTemplateLibrary() {
    hideModal('template-library-modal');
}

/**
 * Populate templates in the modal
 */
function populateTemplates() {
    const grid = document.getElementById('template-grid');
    if (!grid) return;
    
    const templates = templateLoader.getTemplates();
    
    grid.innerHTML = templates.map(template => `
        <div class="template-card" data-template-id="${template.id}">
            <div class="template-card__preview">
                <div class="template-card__placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                </div>
            </div>
            <div class="template-card__info">
                <h3 class="template-card__name">${template.name}</h3>
                <p class="template-card__description">${template.description}</p>
            </div>
            <button class="template-card__select">Use This Template</button>
        </div>
    `).join('');
    
    // Add blank template option
    grid.innerHTML += `
        <div class="template-card template-card--blank" data-template-id="blank">
            <div class="template-card__preview">
                <div class="template-card__placeholder template-card__placeholder--blank">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-dasharray="3 3"></rect>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                </div>
            </div>
            <div class="template-card__info">
                <h3 class="template-card__name">Blank Canvas</h3>
                <p class="template-card__description">Start from scratch and build your own</p>
            </div>
            <button class="template-card__select">Start Blank</button>
        </div>
    `;
}

/**
 * Select a template
 * @param {string} templateId - Template ID
 */
async function selectTemplate(templateId) {
    if (templateId === 'blank') {
        // Just close the modal for blank template
        hideTemplateLibrary();
        return;
    }
    
    // Show loading state
    const modal = document.getElementById('template-library-modal');
    const modalBody = modal.querySelector('.modal__body');
    const originalContent = modalBody.innerHTML;
    
    modalBody.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading template...</p>
        </div>
    `;
    
    try {
        // Load the template
        await templateLoader.loadTemplate(templateId);
        
        // Close modal on success
        hideTemplateLibrary();
        
    } catch (error) {
        console.error('Failed to load template:', error);
        
        // Show error state
        modalBody.innerHTML = `
            <div class="error-state">
                <p>Failed to load template. Please try again.</p>
                <button class="btn btn--primary" onclick="location.reload()">Refresh</button>
            </div>
        `;
        
        // Restore original content after 3 seconds
        setTimeout(() => {
            modalBody.innerHTML = originalContent;
        }, 3000);
    }
}

// Add styles for template modal
const style = document.createElement('style');
style.textContent = `
    .template-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
        padding: 20px;
    }
    
    .template-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.2s;
        cursor: pointer;
    }
    
    .template-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #cbd5e1;
    }
    
    .template-card__preview {
        height: 160px;
        background: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .template-card__placeholder {
        color: #64748b;
    }
    
    .template-card__placeholder--blank {
        color: #cbd5e1;
    }
    
    .template-card__info {
        padding: 20px;
    }
    
    .template-card__name {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 8px 0;
    }
    
    .template-card__description {
        font-size: 14px;
        color: #64748b;
        margin: 0 0 16px 0;
        line-height: 1.5;
    }
    
    .template-card__select {
        width: 100%;
        padding: 10px 16px;
        background: #0ea5e9;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
        margin: 0 20px 20px 20px;
        width: calc(100% - 40px);
    }
    
    .template-card__select:hover {
        background: #0284c7;
    }
    
    .template-card--blank .template-card__select {
        background: transparent;
        color: #64748b;
        border: 1px solid #e2e8f0;
    }
    
    .template-card--blank .template-card__select:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
    }
    
    .loading-state,
    .error-state {
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e2e8f0;
        border-top-color: #0ea5e9;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTemplateLibrary);
} else {
    setupTemplateLibrary();
}
