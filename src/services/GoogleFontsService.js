/**
 * Google Fonts Service
 *
 * Dynamically loads Google Fonts when profile branding fonts are applied.
 * Ensures custom fonts render correctly in the Media Kit preview.
 *
 * PHASE 6: Branding Integration (2025-12-16)
 *
 * @class GoogleFontsService
 * @version 1.0.0
 */

class GoogleFontsService {
  constructor() {
    /**
     * Set of fonts that have been loaded
     * @type {Set<string>}
     * @private
     */
    this._loadedFonts = new Set();

    /**
     * Font weights to load for each font
     * @type {string}
     */
    this._defaultWeights = '400;500;600;700';

    /**
     * Google Fonts API base URL
     * @type {string}
     */
    this._apiBaseUrl = 'https://fonts.googleapis.com/css2';

    console.log('[GoogleFontsService] Initialized');
  }

  /**
   * Load a Google Font by name
   * @param {string} fontName - Name of the font (e.g., 'Roboto', 'Open Sans')
   * @param {Object} options - Loading options
   * @param {string} options.weights - Font weights to load (default: '400;500;600;700')
   * @param {boolean} options.italic - Include italic variants (default: false)
   * @returns {Promise<boolean>} True if font was loaded successfully
   */
  async loadFont(fontName, options = {}) {
    if (!fontName || typeof fontName !== 'string') {
      console.warn('[GoogleFontsService] Invalid font name:', fontName);
      return false;
    }

    // Normalize font name
    const normalizedName = fontName.trim();

    // Skip if already loaded
    if (this._loadedFonts.has(normalizedName)) {
      console.log(`[GoogleFontsService] Font already loaded: ${normalizedName}`);
      return true;
    }

    // Skip system fonts
    if (this._isSystemFont(normalizedName)) {
      console.log(`[GoogleFontsService] Skipping system font: ${normalizedName}`);
      return true;
    }

    const { weights = this._defaultWeights, italic = false } = options;

    try {
      // Build Google Fonts URL
      const fontUrl = this._buildFontUrl(normalizedName, weights, italic);

      // Create and inject link element
      await this._injectFontLink(fontUrl, normalizedName);

      // Mark as loaded
      this._loadedFonts.add(normalizedName);

      console.log(`[GoogleFontsService] Loaded font: ${normalizedName}`);
      return true;
    } catch (error) {
      console.error(`[GoogleFontsService] Failed to load font: ${normalizedName}`, error);
      return false;
    }
  }

  /**
   * Load multiple fonts at once
   * @param {string[]} fontNames - Array of font names to load
   * @returns {Promise<Object>} Results object with success/failed arrays
   */
  async loadFonts(fontNames) {
    const results = { success: [], failed: [] };

    if (!Array.isArray(fontNames)) {
      return results;
    }

    const loadPromises = fontNames.map(async (fontName) => {
      const success = await this.loadFont(fontName);
      if (success) {
        results.success.push(fontName);
      } else {
        results.failed.push(fontName);
      }
    });

    await Promise.all(loadPromises);

    console.log(`[GoogleFontsService] Loaded ${results.success.length}/${fontNames.length} fonts`);
    return results;
  }

  /**
   * Load fonts from profile branding data
   * @param {Object} profileBranding - Profile branding data from window.gmkbData
   * @returns {Promise<Object>} Results object
   */
  async loadProfileBrandingFonts(profileBranding) {
    const fonts = profileBranding?.fonts || {};
    const fontsToLoad = [];

    if (fonts.primary) {
      fontsToLoad.push(fonts.primary);
    }

    if (fonts.secondary) {
      fontsToLoad.push(fonts.secondary);
    }

    if (fontsToLoad.length === 0) {
      console.log('[GoogleFontsService] No profile branding fonts to load');
      return { success: [], failed: [] };
    }

    console.log('[GoogleFontsService] Loading profile branding fonts:', fontsToLoad);
    return this.loadFonts(fontsToLoad);
  }

  /**
   * Build Google Fonts CSS URL
   * @param {string} fontName - Font name
   * @param {string} weights - Font weights (semicolon-separated)
   * @param {boolean} italic - Include italic variants
   * @returns {string} Google Fonts URL
   * @private
   */
  _buildFontUrl(fontName, weights, italic) {
    // Encode font name for URL
    const encodedName = fontName.replace(/\s+/g, '+');

    // Build weight specification
    let weightSpec;
    if (italic) {
      // Include both normal and italic variants
      const weightList = weights.split(';').join(',');
      weightSpec = `ital,wght@0,${weightList};1,${weightList}`;
    } else {
      // Normal weights only - convert semicolons to commas for Google Fonts API
      weightSpec = `wght@${weights.replace(/;/g, ',')}`;
    }

    // Build URL with display=swap for better performance
    return `${this._apiBaseUrl}?family=${encodedName}:${weightSpec}&display=swap`;
  }

  /**
   * Inject a font link element into the document head
   * @param {string} fontUrl - Google Fonts URL
   * @param {string} fontName - Font name (for identification)
   * @returns {Promise<void>}
   * @private
   */
  _injectFontLink(fontUrl, fontName) {
    return new Promise((resolve, reject) => {
      // Check if link already exists
      const existingLink = document.querySelector(`link[data-gmkb-font="${fontName}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      // Create link element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      link.setAttribute('data-gmkb-font', fontName);

      // Handle load/error events
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load font: ${fontName}`));

      // Inject into head
      document.head.appendChild(link);
    });
  }

  /**
   * Check if a font name is a system font
   * @param {string} fontName - Font name to check
   * @returns {boolean} True if it's a system font
   * @private
   */
  _isSystemFont(fontName) {
    const systemFonts = [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
      'serif',
      'monospace',
      'inherit',
      'initial',
      'unset'
    ];

    const lowerName = fontName.toLowerCase();
    return systemFonts.some(f => f.toLowerCase() === lowerName);
  }

  /**
   * Check if a font has been loaded
   * @param {string} fontName - Font name to check
   * @returns {boolean} True if the font is loaded
   */
  isFontLoaded(fontName) {
    return this._loadedFonts.has(fontName?.trim());
  }

  /**
   * Get list of all loaded fonts
   * @returns {string[]} Array of loaded font names
   */
  getLoadedFonts() {
    return Array.from(this._loadedFonts);
  }

  /**
   * Preload common Google Fonts used in themes
   * Call this during app initialization for better UX
   * @returns {Promise<void>}
   */
  async preloadCommonFonts() {
    const commonFonts = [
      'Inter',
      'Roboto',
      'Open Sans',
      'Lato',
      'Montserrat',
      'Poppins'
    ];

    console.log('[GoogleFontsService] Preloading common fonts...');
    await this.loadFonts(commonFonts);
  }
}

// Export as singleton
const googleFontsService = new GoogleFontsService();

export default googleFontsService;
export { GoogleFontsService };
