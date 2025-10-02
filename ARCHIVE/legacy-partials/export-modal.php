<!-- ROOT FIX: Added modal overlay for proper centering and backdrop clicks -->
<div class="modal-overlay" id="export-modal" style="display: none;">
    <div class="modal__content modal__content--centered">
        <div class="modal__header">
            <div class="modal__title">Export Your Media Kit</div>
            <button class="modal__close" id="close-export-modal">&times;</button>
        </div>
        <div class="modal__body">
            <div class="export-options">
                <div class="export-option" data-export="pdf">
                    <div class="export-option__icon">📄</div>
                    <div class="export-option__title">PDF Document</div>
                    <div class="export-option__description">Download as a PDF file</div>
                </div>
                <div class="export-option" data-export="image">
                    <div class="export-option__icon">🖼️</div>
                    <div class="export-option__title">Image (PNG)</div>
                    <div class="export-option__description">Export as high-res image</div>
                </div>
                <div class="export-option" data-export="html">
                    <div class="export-option__icon">🌐</div>
                    <div class="export-option__title">Web Page</div>
                    <div class="export-option__description">Get shareable web link</div>
                </div>
                <div class="export-option" data-export="embed">
                    <div class="export-option__icon">📱</div>
                    <div class="export-option__title">Embed Code</div>
                    <div class="export-option__description">Embed on your website</div>
                </div>
            </div>
        </div>
    </div>
</div>