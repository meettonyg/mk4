/**
 * Preview toggle functionality (desktop/tablet/mobile)
 */

/**
 * Set up preview toggle functionality
 */
export function setupPreviewToggle() {
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
