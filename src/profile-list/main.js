/**
 * Profile List - Main Entry Point
 *
 * Vue 3 application for displaying user's guest profiles
 */

import './styles/profile-list.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import ProfileListApp from './ProfileListApp.vue';
import { useProfileListStore } from './stores/profileList.js';

// Check for initialization
if (window.gmkbProfileListInitialized) {
    console.warn('Profile List app already initialized');
} else {
    window.gmkbProfileListInitialized = true;

    // Wait for DOM ready
    const initProfileListApp = () => {
        const mountElement = document.getElementById('gmkb-profile-list-app');

        if (!mountElement) {
            console.error('Profile List mount element not found: #gmkb-profile-list-app');
            return;
        }

        // Get configuration from global
        const nonce = window.gmkbProfileListData?.nonce || window.wpApiSettings?.nonce;
        const apiUrl = window.gmkbProfileListData?.apiUrl || window.wpApiSettings?.root;
        const createUrl = window.gmkbProfileListData?.createUrl || '/app/profiles/guest/profile/';

        console.log('Initializing Profile List');

        // Create Pinia store
        const pinia = createPinia();

        // Create Vue app
        const app = createApp(ProfileListApp);

        // Use Pinia
        app.use(pinia);

        // Initialize store with config
        const store = useProfileListStore();
        store.setConfig({
            nonce,
            apiUrl,
            createUrl,
        });

        // Mount the app
        app.mount(mountElement);

        console.log('Profile List mounted successfully');

        // Expose for debugging
        window.GMKB = window.GMKB || {};
        window.GMKB.profileListApp = app;
        window.GMKB.profileListStore = store;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfileListApp);
    } else {
        initProfileListApp();
    }
}
