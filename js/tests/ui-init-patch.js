/**
 * UI Initialization Patch
 * Add this script to your page or run it after the page loads
 * to ensure all UI components are properly initialized
 */

(function() {
    'use strict';
    
    console.log('🔧 UI Initialization Patch Starting...');
    
    // Wait for DOM and initial scripts to load
    function waitForReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeUI);
        } else {
            // Small delay to ensure other scripts have run
            setTimeout(initializeUI, 100);
        }
    }
    
    function initializeUI() {
        console.log('Initializing UI components...');
        
        // 1. Fix Tabs
        const tabs = document.querySelectorAll('.sidebar__tab');
        const contents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const tabName = this.getAttribute('data-tab');
                
                // Update active states
                tabs.forEach(t => t.classList.remove('sidebar__tab--active'));
                contents.forEach(c => c.classList.remove('tab-content--active'));
                
                this.classList.add('sidebar__tab--active');
                const content = document.getElementById(tabName + '-tab');
                if (content) {
                    content.classList.add('tab-content--active');
                }
            });
        });
        
        // 2. Fix Component Library
        const addComponentBtn = document.getElementById('add-component-btn');
        if (addComponentBtn) {
            addComponentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                document.dispatchEvent(new CustomEvent('show-component-library'));
            });
        }
        
        // Listen for component library event
        document.addEventListener('show-component-library', () => {
            // Try to use the imported function if available
            if (typeof showComponentLibraryModal !== 'undefined') {
                showComponentLibraryModal();
            } else {
                // Fallback: create and show modal manually
                let modal = document.getElementById('component-library-overlay');
                if (!modal) {
                    createBasicComponentModal();
                    modal = document.getElementById('component-library-overlay');
                }
                if (modal) {
                    modal.style.display = 'flex';
                }
            }
        });
        
        // 3. Fix Template Library
        document.addEventListener('show-template-library', () => {
            const modal = document.getElementById('template-library-modal');
            if (modal) {
                modal.style.display = 'flex';
            }
        });
        
        // 4. Fix Export Button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                document.dispatchEvent(new CustomEvent('show-export-modal'));
            });
        }
        
        // 5. Fix Theme Button
        const themeBtn = document.getElementById('global-theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                document.dispatchEvent(new CustomEvent('show-theme-settings'));
            });
        }
        
        // 6. Fix Empty State Buttons
        const addFirstBtn = document.getElementById('add-first-component');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('show-component-library'));
            });
        }
        
        const loadTemplateBtn = document.getElementById('load-template');
        if (loadTemplateBtn) {
            loadTemplateBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('show-template-library'));
            });
        }
        
        // 7. Setup modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal__close')) {
                const modal = e.target.closest('.modal-overlay, .modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            }
            
            if (e.target.matches('.modal-overlay')) {
                if (e.target === e.currentTarget) {
                    e.target.style.display = 'none';
                }
            }
        });
        
        console.log('✅ UI components initialized');
    }
    
    function createBasicComponentModal() {
        const modal = document.createElement('div');
        modal.id = 'component-library-overlay';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center;';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal modal--library';
        modalContent.style.cssText = 'background: white; padding: 20px; border-radius: 8px; max-width: 800px; max-height: 80vh; overflow: auto;';
        
        modalContent.innerHTML = `
            <div class="library__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Component Library</h2>
                <button class="modal__close" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
            </div>
            <div class="library__body">
                <div class="component-grid" id="modal-components" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px;">
                    <!-- Components will be populated here -->
                </div>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Populate with components
        setTimeout(() => {
            const grid = document.getElementById('modal-components');
            const components = document.querySelectorAll('.sidebar__content .component-item');
            
            components.forEach(comp => {
                const clone = comp.cloneNode(true);
                clone.style.cursor = 'pointer';
                clone.addEventListener('click', async () => {
                    const componentType = clone.getAttribute('data-component');
                    if (window.componentManager) {
                        await window.componentManager.addComponent(componentType);
                        modal.style.display = 'none';
                    }
                });
                grid.appendChild(clone);
            });
        }, 100);
    }
    
    // Start initialization
    waitForReady();
})();

// Export for debugging
window.reinitializeUI = function() {
    console.log('Reinitializing UI...');
    const script = document.createElement('script');
    script.textContent = arguments.callee.toString().replace(/^[^{]+{/, '').replace(/}$/, '');
    document.body.appendChild(script);
};