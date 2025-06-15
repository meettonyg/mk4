<div class="global-settings-modal" id="global-settings-modal">
    <div class="modal-content">
        <div class="modal-header">
            <div class="modal-title">Global Theme Settings</div>
            <button class="close-modal" id="close-global-settings">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label">Color Palette</label>
                <div class="theme-palette">
                    <div class="palette-option blue active" data-palette="blue"></div>
                    <div class="palette-option green" data-palette="green"></div>
                    <div class="palette-option purple" data-palette="purple"></div>
                    <div class="palette-option orange" data-palette="orange"></div>
                    <div class="palette-option pink" data-palette="pink"></div>
                    <div class="palette-option gray" data-palette="gray"></div>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Primary Font</label>
                <select class="form-input" id="primary-font">
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Secondary Font</label>
                <select class="form-input" id="secondary-font">
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Merriweather">Merriweather</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Border Radius</label>
                <input type="range" class="form-input" id="border-radius" min="0" max="20" value="8">
            </div>
        </div>
    </div>
</div>