/**
 * Slug Utilities
 *
 * Shared helper functions for URL slug formatting and validation.
 *
 * @package GMKB
 * @since 3.3.0
 */

/**
 * Format a string as a valid URL slug
 * Converts to lowercase, replaces spaces with hyphens, removes invalid characters
 *
 * @param {string} value - The input string to format
 * @returns {string} Formatted slug
 */
export const formatSlug = (value) => {
    if (!value) return '';

    return value
        .toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '')  // Remove invalid characters
        .replace(/-+/g, '-')          // Replace multiple hyphens with single
        .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
};

/**
 * Validate a slug and return validation result
 *
 * @param {string} slug - The slug to validate
 * @returns {{ valid: boolean, error: string|null }} Validation result
 */
export const validateSlug = (slug) => {
    if (!slug || !slug.trim()) {
        return { valid: false, error: 'Slug cannot be empty' };
    }

    if (slug.length < 3) {
        return { valid: false, error: 'Slug must be at least 3 characters' };
    }

    // Check for valid characters (should already be formatted, but double-check)
    if (!/^[a-z0-9-]+$/.test(slug)) {
        return { valid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
    }

    return { valid: true, error: null };
};

/**
 * Reserved slugs that cannot be used
 */
export const RESERVED_SLUGS = [
    'new',
    'edit',
    'delete',
    'admin',
    'login',
    'register',
    'api',
    'app',
];
