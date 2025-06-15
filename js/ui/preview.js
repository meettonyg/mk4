/**
 * Preview toggle functionality (desktop/tablet/mobile)
 */

/**
 * Set up preview toggle functionality
 */
export function setupPreviewToggle() {
    const toggleButtons = document.querySelectorAll('.toolbar__preview-toggle button');
    const container = document.getElementById('preview-container');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            toggleButtons.forEach(b => b.classList.remove('toolbar__preview-btn--active'));
            this.classList.add('toolbar__preview-btn--active');
            
            const previewType = this.getAttribute('data-preview');
            container.classList.remove('preview__container--mobile', 'preview__container--tablet');
            
            if (previewType === 'mobile') {
                container.classList.add('preview__container--mobile');
            } else if (previewType === 'tablet') {
                container.classList.add('preview__container--tablet');
            }
        });
    });
}
