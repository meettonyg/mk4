/**
 * Utility functions
 */

/**
 * Check if a string is a valid CSS color
 * @param {string} color - The color to check
 * @returns {boolean} Whether the color is valid
 */
export function isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
}

/**
 * Adjust the brightness of a color
 * @param {string} color - The color to adjust
 * @param {number} percent - The percentage to adjust (-100 to 100)
 * @returns {string} The adjusted color
 */
export function adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

/**
 * Show the upgrade prompt
 */
export function showUpgradePrompt() {
    alert('This is a premium component. Upgrade to Pro to unlock advanced features!');
}
