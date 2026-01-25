/**
 * Media Gallery - Main Entry Point
 *
 * Standalone Vue 3 application for viewing all media across brand kits
 */

import './styles/media-gallery.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import MediaGalleryApp from './MediaGalleryApp.vue';

// Check for initialization
if (window.gmkbMediaGalleryInitialized) {
    console.warn('Media Gallery app already initialized');
} else {
    window.gmkbMediaGalleryInitialized = true;

    // Wait for DOM ready
    const initMediaGalleryApp = () => {
        const mountElement = document.getElementById('gmkb-media-gallery-app');

        if (!mountElement) {
            console.error('Media Gallery mount element not found: #gmkb-media-gallery-app');
            return;
        }

        // Get configuration from data attributes or global
        const initialCategory = mountElement.dataset.category || window.gmkbMediaGalleryData?.category || '';

        console.log('🚀 Initializing Media Gallery');

        // Create Pinia store
        const pinia = createPinia();

        // Create Vue app
        const app = createApp(MediaGalleryApp, {
            initialCategory,
        });

        // Use Pinia
        app.use(pinia);

        // Mount the app
        app.mount(mountElement);

        console.log('✅ Media Gallery mounted successfully');

        // Expose for debugging
        window.GMKB = window.GMKB || {};
        window.GMKB.mediaGalleryApp = app;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMediaGalleryApp);
    } else {
        initMediaGalleryApp();
    }
}
