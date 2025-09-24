/**
 * Development Environment Switcher
 * Quickly switch between Vue and Legacy modes for testing
 */

(function() {
    'use strict';
    
    // Check current architecture
    const getCurrentArch = () => {
        if (window.gmkbVue && !window.gmkbLegacy) return 'vue';
        if (window.gmkbLegacy && !window.gmkbVue) return 'legacy';
        if (window.gmkbVue && window.gmkbLegacy) return 'hybrid';
        return 'unknown';
    };
    
    // Create switcher UI
    const createSwitcher = () => {
        const switcher = document.createElement('div');
        switcher.id = 'gmkb-arch-switcher';
        switcher.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1e293b;
            border: 2px solid #475569;
            border-radius: 8px;
            padding: 15px;
            z-index: 99999;
            font-family: monospace;
            color: #e2e8f0;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            min-width: 300px;
        `;
        
        const currentArch = getCurrentArch();
        
        switcher.innerHTML = `
            <div style="font-size: 12px; margin-bottom: 10px; opacity: 0.7;">
                GMKB ARCHITECTURE
            </div>
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">
                Current: <span style="color: ${getArchColor(currentArch)}">${currentArch.toUpperCase()}</span>
            </div>
            <div style="margin-bottom: 10px;">
                <button id="switch-to-vue" style="
                    background: #10b981;
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 5px;
                    font-size: 12px;
                ">Switch to Vue</button>
                <button id="switch-to-legacy" style="
                    background: #ef4444;
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 5px;
                    font-size: 12px;
                ">Switch to Legacy</button>
                <button id="switch-to-hybrid" style="
                    background: #f59e0b;
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">Hybrid (Debug)</button>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #475569;">
                <div style="font-size: 11px; margin-bottom: 8px;">DIAGNOSTICS:</div>
                ${generateDiagnostics()}
            </div>
            <button id="close-switcher" style="
                position: absolute;
                top: 5px;
                right: 5px;
                background: transparent;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                font-size: 18px;
            ">×</button>
        `;
        
        document.body.appendChild(switcher);
        
        // Add event handlers
        document.getElementById('switch-to-vue').onclick = () => switchToArch('vue');
        document.getElementById('switch-to-legacy').onclick = () => switchToArch('legacy');
        document.getElementById('switch-to-hybrid').onclick = () => switchToArch('hybrid');
        document.getElementById('close-switcher').onclick = () => switcher.remove();
    };
    
    // Get color for architecture
    const getArchColor = (arch) => {
        switch(arch) {
            case 'vue': return '#10b981';
            case 'legacy': return '#ef4444';
            case 'hybrid': return '#f59e0b';
            default: return '#94a3b8';
        }
    };
    
    // Generate diagnostics HTML
    const generateDiagnostics = () => {
        const scripts = document.querySelectorAll('script[src]');
        let vueScripts = 0;
        let legacyScripts = 0;
        let bundleFound = false;
        
        scripts.forEach(script => {
            const src = script.src;
            if (src.includes('gmkb.iife.js')) bundleFound = true;
            if (src.includes('/dist/')) vueScripts++;
            if (src.includes('/js-legacy/') || src.includes('/js/')) legacyScripts++;
        });
        
        return `
            <div style="font-size: 10px; line-height: 1.6;">
                <div>📦 Vue Bundle: ${bundleFound ? '✅ Loaded' : '❌ Not found'}</div>
                <div>📜 Vue Scripts: ${vueScripts}</div>
                <div>🔧 Legacy Scripts: ${legacyScripts}</div>
                <div>🎯 Total Scripts: ${scripts.length}</div>
                <div style="margin-top: 8px;">
                    ${window.gmkbVue ? '✅ gmkbVue namespace' : '❌ gmkbVue missing'}<br>
                    ${window.gmkbLegacy ? '✅ gmkbLegacy namespace' : '❌ gmkbLegacy missing'}<br>
                    ${window.Vue ? '✅ Vue.js loaded' : '❌ Vue.js missing'}
                </div>
            </div>
        `;
    };
    
    // Switch architecture (requires server-side change)
    const switchToArch = (arch) => {
        // Store preference
        localStorage.setItem('gmkb_preferred_arch', arch);
        
        // Show instructions
        alert(`To switch to ${arch.toUpperCase()} mode:

1. Edit: includes/architecture-config.php
2. Change: define('GMKB_ARCHITECTURE_MODE', '${arch}');
3. Save the file
4. Refresh this page

Note: This requires server access. The setting has been saved to localStorage for reference.`);
        
        // Log instructions to console too
        console.log('='.repeat(50));
        console.log(`SWITCHING TO ${arch.toUpperCase()} MODE`);
        console.log('='.repeat(50));
        console.log('1. Edit: includes/architecture-config.php');
        console.log(`2. Change: define('GMKB_ARCHITECTURE_MODE', '${arch}');`);
        console.log('3. Save and refresh');
        console.log('='.repeat(50));
    };
    
    // Auto-create switcher in development
    if (window.location.href.includes('localhost') || 
        window.location.href.includes('dev.') ||
        window.location.href.includes('staging.') ||
        window.location.search.includes('debug=1')) {
        
        // Wait for page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createSwitcher);
        } else {
            setTimeout(createSwitcher, 1000);
        }
    }
    
    // Console commands
    window.gmkbArchInfo = () => {
        console.log('='.repeat(50));
        console.log('GMKB ARCHITECTURE INFORMATION');
        console.log('='.repeat(50));
        console.log('Current Mode:', getCurrentArch().toUpperCase());
        console.log('');
        console.log('Namespaces:');
        console.log('  gmkbVue:', !!window.gmkbVue);
        console.log('  gmkbLegacy:', !!window.gmkbLegacy);
        console.log('  GMKB:', !!window.GMKB);
        console.log('');
        console.log('Frameworks:');
        console.log('  Vue.js:', !!window.Vue);
        console.log('  Pinia:', !!window.gmkbPinia);
        console.log('');
        console.log('Scripts Loaded:');
        const scripts = document.querySelectorAll('script[src*="gmkb"], script[src*="/mk4/"]');
        scripts.forEach(script => {
            const filename = script.src.split('/').pop().split('?')[0];
            const type = script.src.includes('/dist/') ? 'VUE' : 
                        script.src.includes('/js-legacy/') ? 'LEGACY' : 'OTHER';
            console.log(`  [${type}] ${filename}`);
        });
        console.log('');
        console.log('Total Scripts:', scripts.length);
        console.log('='.repeat(50));
        
        return {
            mode: getCurrentArch(),
            vueLoaded: !!window.gmkbVue,
            legacyLoaded: !!window.gmkbLegacy,
            scriptCount: scripts.length
        };
    };
    
    window.gmkbSwitchArch = (mode) => {
        if (!['vue', 'legacy', 'hybrid'].includes(mode)) {
            console.error('Invalid mode. Use: vue, legacy, or hybrid');
            return;
        }
        switchToArch(mode);
    };
    
    // Show current architecture on load
    console.log(
        `%c🏗️ GMKB Architecture: ${getCurrentArch().toUpperCase()}`,
        `color: ${getArchColor(getCurrentArch())}; font-weight: bold; font-size: 14px;`
    );
    console.log('Run gmkbArchInfo() for details');
    console.log('Run gmkbSwitchArch("vue"|"legacy"|"hybrid") to switch');
    
})();