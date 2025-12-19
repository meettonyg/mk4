/**
 * Profile Editor - Main Entry Point
 *
 * Standalone Vue 3 application for editing Guest Profiles
 * Saves directly to WordPress post meta via REST API
 */

import './styles/profile.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import ProfileApp from './ProfileApp.vue';
import { useProfileStore } from './stores/profile.js';

// Check for initialization
if (window.gmkbProfileInitialized) {
    console.warn('Profile app already initialized');
} else {
    window.gmkbProfileInitialized = true;

    // Wait for DOM ready
    const initProfileApp = () => {
        const mountElement = document.getElementById('gmkb-profile-app');

        if (!mountElement) {
            console.error('Profile mount element not found: #gmkb-profile-app');
            return;
        }

        // Get configuration from data attributes or global
        const postId = mountElement.dataset.postId || window.gmkbProfileData?.postId;
        const nonce = window.gmkbProfileData?.nonce || window.wpApiSettings?.nonce;
        const apiUrl = window.gmkbProfileData?.apiUrl || window.wpApiSettings?.root;

        if (!postId) {
            console.error('Profile postId not provided');
            mountElement.innerHTML = '<div class="error">Profile ID not found</div>';
            return;
        }

        console.log('🚀 Initializing Profile Editor for post:', postId);

        // Create Pinia store
        const pinia = createPinia();

        // Create Vue app
        const app = createApp(ProfileApp, {
            postId: parseInt(postId, 10),
        });

        // Use Pinia
        app.use(pinia);

        // Initialize profile store with config
        const profileStore = useProfileStore();
        profileStore.setConfig({
            postId: parseInt(postId, 10),
            nonce,
            apiUrl,
        });

        // Load persisted tab state from localStorage
        profileStore.loadActiveTabFromStorage();

        // Mount the app
        app.mount(mountElement);

        console.log('✅ Profile Editor mounted successfully');

        // Expose for debugging
        window.GMKB = window.GMKB || {};
        window.GMKB.profileApp = app;
        window.GMKB.profileStore = profileStore;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfileApp);
    } else {
        initProfileApp();
    }
}
