/**
 * Media Kit List - Main Entry Point
 *
 * Vue 3 application for displaying user's media kits
 */

import './styles/media-kit-list.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import MediaKitListApp from './MediaKitListApp.vue';
import { useMediaKitListStore } from './stores/mediaKitList.js';

// Check for initialization
if (window.gmkbMediaKitListInitialized) {
    console.warn('Media Kit List app already initialized');
} else {
    window.gmkbMediaKitListInitialized = true;

    // Wait for DOM ready
    const initMediaKitListApp = () => {
        const mountElement = document.getElementById('gmkb-media-kit-list-app');

        if (!mountElement) {
            console.error('Media Kit List mount element not found: #gmkb-media-kit-list-app');
            return;
        }

        // Get configuration from global
        const nonce = window.gmkbMediaKitListData?.nonce || window.wpApiSettings?.nonce;
        const apiUrl = window.gmkbMediaKitListData?.apiUrl || window.wpApiSettings?.root;
        const createUrl = window.gmkbMediaKitListData?.createUrl || '/tools/media-kit/';
        const showCreate = window.gmkbMediaKitListData?.showCreate !== false;

        console.log('Initializing Media Kit List');

        // Create Pinia store
        const pinia = createPinia();

        // Create Vue app
        const app = createApp(MediaKitListApp);

        // Use Pinia
        app.use(pinia);

        // Initialize store with config
        const store = useMediaKitListStore();
        store.setConfig({
            nonce,
            apiUrl,
            createUrl,
            showCreate,
        });

        // Mount the app
        app.mount(mountElement);

        console.log('Media Kit List mounted successfully');

        // Expose for debugging
        window.GMKB = window.GMKB || {};
        window.GMKB.mediaKitListApp = app;
        window.GMKB.mediaKitListStore = store;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMediaKitListApp);
    } else {
        initMediaKitListApp();
    }
}
