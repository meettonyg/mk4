/**
 * Onboarding Dashboard - Main Entry Point
 *
 * Vue 3 application for the onboarding gamification dashboard.
 * Displays progress, tasks, and rewards for podcast guesting activities.
 */

import './styles/onboarding.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import OnboardingApp from './OnboardingApp.vue';
import { useOnboardingStore } from './stores/onboarding.js';

// Check for initialization
if (window.gmkbOnboardingInitialized) {
    console.warn('Onboarding app already initialized');
} else {
    window.gmkbOnboardingInitialized = true;

    // Wait for DOM ready
    const initOnboardingApp = () => {
        const mountElement = document.getElementById('gmkb-onboarding-app');

        if (!mountElement) {
            console.error('Onboarding mount element not found: #gmkb-onboarding-app');
            return;
        }

        // Get configuration from global
        const nonce = window.gmkbOnboardingData?.nonce || window.gmkbData?.restNonce || window.wpApiSettings?.nonce;
        const apiUrl = window.gmkbOnboardingData?.apiUrl || window.gmkbData?.restUrl || window.wpApiSettings?.root || '/wp-json/';

        console.log('Initializing Onboarding Dashboard');

        // Create Pinia store
        const pinia = createPinia();

        // Create Vue app
        const app = createApp(OnboardingApp);

        // Use Pinia
        app.use(pinia);

        // Initialize store with config
        const store = useOnboardingStore();
        store.setConfig({
            nonce,
            apiUrl,
        });

        // Mount the app
        app.mount(mountElement);

        console.log('Onboarding Dashboard mounted successfully');

        // Expose for debugging
        window.GMKB = window.GMKB || {};
        window.GMKB.onboardingApp = app;
        window.GMKB.onboardingStore = store;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOnboardingApp);
    } else {
        initOnboardingApp();
    }
}
