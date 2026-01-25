/**
 * Brand Kits Manager - Main Entry Point
 *
 * Standalone Vue 3 application for managing Brand Kits
 * Provides CRUD operations via REST API
 */

import './styles/brand-kits.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import BrandKitsApp from './BrandKitsApp.vue';
import { useBrandKitStore } from '../stores/brandKit.js';

// Check for initialization
if (window.gmkbBrandKitsInitialized) {
    console.warn('Brand Kits app already initialized');
} else {
    window.gmkbBrandKitsInitialized = true;

    // Wait for DOM ready
    const initBrandKitsApp = () => {
        const mountElement = document.getElementById('gmkb-brand-kits-app');

        if (!mountElement) {
            console.error('Brand Kits mount element not found: #gmkb-brand-kits-app');
            return;
        }

        // Get configuration from data attributes or global
        const brandKitId = mountElement.dataset.brandKitId || window.gmkbBrandKitsData?.brandKitId;
        const nonce = window.gmkbBrandKitsData?.nonce || window.wpApiSettings?.nonce;
        const apiUrl = window.gmkbBrandKitsData?.apiUrl || window.wpApiSettings?.root;

        console.log('🚀 Initializing Brand Kits Manager');

        // Create Pinia store
        const pinia = createPinia();

        // Create Vue app
        const app = createApp(BrandKitsApp, {
            initialBrandKitId: brandKitId ? parseInt(brandKitId, 10) : null,
        });

        // Use Pinia
        app.use(pinia);

        // Mount the app
        app.mount(mountElement);

        console.log('✅ Brand Kits Manager mounted successfully');

        // Expose for debugging
        window.GMKB = window.GMKB || {};
        window.GMKB.brandKitsApp = app;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBrandKitsApp);
    } else {
        initBrandKitsApp();
    }
}
