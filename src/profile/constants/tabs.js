/**
 * Profile Tab Constants
 *
 * Single source of truth for profile tab IDs.
 * Used by both the store and the ProfileTabs component.
 */

export const PROFILE_TABS = [
    { id: 'overview', label: 'Profile Overview' },
    { id: 'value', label: 'Value' },
    { id: 'messaging', label: 'Messaging' },
    { id: 'branding', label: 'Branding' },
    { id: 'seo', label: 'SEO & Visibility' },
];

export const PROFILE_TAB_IDS = PROFILE_TABS.map((tab) => tab.id);

export const DEFAULT_TAB = 'overview';
