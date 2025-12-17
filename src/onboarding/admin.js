/**
 * Onboarding Admin - Entry Point
 *
 * Vue 3 application for managing onboarding rewards in wp-admin.
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import AdminRewardsManager from './components/admin/AdminRewardsManager.vue';

// Check for initialization
if (window.gmkbOnboardingAdminInitialized) {
    console.warn('Onboarding Admin already initialized');
} else {
    window.gmkbOnboardingAdminInitialized = true;

    // Wait for DOM ready
    const initOnboardingAdmin = () => {
        const mountElement = document.getElementById('gmkb-onboarding-admin-app');

        if (!mountElement) {
            // Not on the admin page, skip initialization
            return;
        }

        console.log('Initializing Onboarding Admin');

        // Create Pinia store
        const pinia = createPinia();

        // Create Vue app
        const app = createApp(AdminRewardsManager);

        // Use Pinia
        app.use(pinia);

        // Mount the app
        app.mount(mountElement);

        console.log('Onboarding Admin mounted successfully');

        // Expose for debugging
        window.GMKB = window.GMKB || {};
        window.GMKB.onboardingAdminApp = app;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOnboardingAdmin);
    } else {
        initOnboardingAdmin();
    }
}
