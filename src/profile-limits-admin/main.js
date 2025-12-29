/**
 * Profile Limits Admin - Entry Point
 *
 * Vue 3 application for managing membership tiers and profile limits in wp-admin.
 */

import './styles/admin.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import AdminTiersManager from './components/AdminTiersManager.vue';

// Check for initialization
if (window.gmkbProfileLimitsAdminInitialized) {
    console.warn('Profile Limits Admin already initialized');
} else {
    window.gmkbProfileLimitsAdminInitialized = true;

    // Wait for DOM ready
    const initProfileLimitsAdmin = () => {
        const mountElement = document.getElementById('gmkb-profile-limits-admin-app');

        if (!mountElement) {
            // Not on the admin page, skip initialization
            return;
        }

        console.log('Initializing Profile Limits Admin');

        // Create Pinia store
        const pinia = createPinia();

        // Create Vue app
        const app = createApp(AdminTiersManager);

        // Use Pinia
        app.use(pinia);

        // Mount the app
        app.mount(mountElement);

        console.log('Profile Limits Admin mounted successfully');

        // Expose for debugging
        window.GMKB = window.GMKB || {};
        window.GMKB.profileLimitsAdminApp = app;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfileLimitsAdmin);
    } else {
        initProfileLimitsAdmin();
    }
}
