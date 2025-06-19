// Quick fix for modal display issue - Run this in console

console.log('🔧 Applying modal display fix...\n');

// Fix the showModal function to work properly
window.showModalFixed = function(modalId) {
    const modal = typeof modalId === 'string' 
        ? document.getElementById(modalId) 
        : modalId;
        
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('modal--open');
        console.log('✅ Modal shown:', modal.id);
    } else {
        console.error('❌ Modal not found:', modalId);
    }
};

// Fix the component library button
const componentBtn = document.getElementById('add-component-btn');
if (componentBtn) {
    // Remove old listeners
    const newBtn = componentBtn.cloneNode(true);
    componentBtn.parentNode.replaceChild(newBtn, componentBtn);
    
    // Add new listener
    newBtn.addEventListener('click', () => {
        console.log('Component button clicked');
        window.showModalFixed('component-library-overlay');
    });
    
    console.log('✅ Component Library button fixed');
}

// Fix the template button
const templateBtn = document.getElementById('load-template');
if (templateBtn) {
    const newBtn = templateBtn.cloneNode(true);
    templateBtn.parentNode.replaceChild(newBtn, templateBtn);
    
    newBtn.addEventListener('click', () => {
        console.log('Template button clicked');
        window.showModalFixed('template-library-modal');
    });
    
    console.log('✅ Template Library button fixed');
}

// Fix the global settings button
const settingsBtn = document.getElementById('global-theme-btn');
if (settingsBtn) {
    const newBtn = settingsBtn.cloneNode(true);
    settingsBtn.parentNode.replaceChild(newBtn, settingsBtn);
    
    newBtn.addEventListener('click', () => {
        console.log('Settings button clicked');
        window.showModalFixed('global-settings-modal');
    });
    
    console.log('✅ Global Settings button fixed');
}

// Fix close buttons
document.addEventListener('click', (e) => {
    if (e.target.matches('#close-library, #close-template-library, #close-global-settings, .library__close, .modal__close')) {
        const modal = e.target.closest('.library-modal, .modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('modal--open');
            console.log('✅ Modal closed:', modal.id);
        }
    }
});

console.log('\n✅ Modal fix applied! Try clicking the buttons now.');
console.log('💡 This is a temporary fix. For permanent fix, clear cache and reload.');
