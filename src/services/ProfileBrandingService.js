/**
 * Profile Branding Service
 *
 * Provides access to profile branding data (colors, fonts, images) that was
 * injected via window.gmkbData.profileBranding from WordPress post meta.
 *
 * PHASE 2: Branding Integration (2025-12-16)
 * This service acts as the JavaScript bridge between profile branding settings
 * (from the Branding tab) and the Media Kit Builder's theme system.
 *
 * @class ProfileBrandingService
 * @version 1.0.0
 */

class ProfileBrandingService {
  constructor() {
    /**
     * Cached branding data from window.gmkbData
     * @type {Object|null}
     * @private
     */
    this._brandingData = null;

    /**
     * Whether the service has been initialized
     * @type {boolean}
     * @private
     */
    this._initialized = false;
  }

  /**
   * Initialize and cache branding data from window.gmkbData
   * Called automatically on first access
   * @private
   */
  _ensureInitialized() {
    if (this._initialized) return;

    this._brandingData = window.gmkbData?.profileBranding || null;
    this._initialized = true;

    if (this._brandingData) {
      console.log('[ProfileBrandingService] Initialized with branding data');
    } else {
      console.log('[ProfileBrandingService] No branding data available');
    }
  }

  /**
   * Check if profile branding data is available
   * @returns {boolean} True if branding data exists
   */
  hasBrandingData() {
    this._ensureInitialized();
    return this._brandingData?.hasBrandingData === true;
  }

  /**
   * Get all profile branding colors
   * @returns {Object} Color values keyed by type
   * @example
   * {
   *   primary: '#952d2d',
   *   accent: '#ff6600',
   *   contrasting: '#ffffff',
   *   background: '#f5f5f5',
   *   header: '#333333',
   *   headerAccent: '#666666',
   *   headerText: '#ffffff',
   *   paragraph: '#444444'
   * }
   */
  getColors() {
    this._ensureInitialized();
    return this._brandingData?.colors || {};
  }

  /**
   * Get a specific color by key
   * @param {string} colorKey - Color key (primary, accent, etc.)
   * @returns {string|null} Hex color value or null if not set
   */
  getColor(colorKey) {
    const colors = this.getColors();
    return colors[colorKey] || null;
  }

  /**
   * Check if any colors are defined
   * @returns {boolean} True if at least one color is set
   */
  hasColors() {
    const colors = this.getColors();
    return Object.values(colors).some(v => v !== null && v !== '');
  }

  /**
   * Get all profile branding fonts
   * @returns {Object} Font values keyed by type
   * @example
   * {
   *   primary: 'Roboto',
   *   secondary: 'Open Sans'
   * }
   */
  getFonts() {
    this._ensureInitialized();
    return this._brandingData?.fonts || {};
  }

  /**
   * Get a specific font by key
   * @param {string} fontKey - Font key (primary, secondary)
   * @returns {string|null} Font family name or null if not set
   */
  getFont(fontKey) {
    const fonts = this.getFonts();
    return fonts[fontKey] || null;
  }

  /**
   * Check if any fonts are defined
   * @returns {boolean} True if at least one font is set
   */
  hasFonts() {
    const fonts = this.getFonts();
    return Object.values(fonts).some(v => v !== null && v !== '');
  }

  /**
   * Get all profile branding images
   * @returns {Object} Image data keyed by type
   * @example
   * {
   *   headshotPrimary: { id: 123, url: '...', alt: '...', sizes: {...} },
   *   headshotVertical: { id: 124, url: '...', alt: '...', sizes: {...} },
   *   headshotHorizontal: { id: 125, url: '...', alt: '...', sizes: {...} },
   *   logos: [{ id: 126, url: '...', alt: '...', sizes: {...} }],
   *   carouselImages: [{ id: 127, url: '...', alt: '...', sizes: {...} }]
   * }
   */
  getImages() {
    this._ensureInitialized();
    return this._brandingData?.images || {};
  }

  /**
   * Get a specific image by key
   * @param {string} imageKey - Image key (headshotPrimary, logos, etc.)
   * @returns {Object|Array|null} Image object, array of images, or null
   */
  getImage(imageKey) {
    const images = this.getImages();
    return images[imageKey] || null;
  }

  /**
   * Get primary headshot image
   * @returns {Object|null} Image object with id, url, alt, sizes
   */
  getPrimaryHeadshot() {
    return this.getImage('headshotPrimary');
  }

  /**
   * Get all headshots as an array
   * @returns {Array<Object>} Array of headshot image objects
   */
  getAllHeadshots() {
    const images = this.getImages();
    const headshots = [];

    if (images.headshotPrimary) headshots.push(images.headshotPrimary);
    if (images.headshotVertical) headshots.push(images.headshotVertical);
    if (images.headshotHorizontal) headshots.push(images.headshotHorizontal);

    return headshots;
  }

  /**
   * Get all logos
   * @returns {Array<Object>} Array of logo image objects
   */
  getLogos() {
    const logos = this.getImage('logos');
    return Array.isArray(logos) ? logos : [];
  }

  /**
   * Get carousel images
   * @returns {Array<Object>} Array of carousel image objects
   */
  getCarouselImages() {
    const carousel = this.getImage('carouselImages');
    return Array.isArray(carousel) ? carousel : [];
  }

  /**
   * Check if any images are defined
   * @returns {boolean} True if at least one image is set
   */
  hasImages() {
    const images = this.getImages();
    return (
      images.headshotPrimary !== null ||
      images.headshotVertical !== null ||
      images.headshotHorizontal !== null ||
      (Array.isArray(images.logos) && images.logos.length > 0) ||
      (Array.isArray(images.carouselImages) && images.carouselImages.length > 0)
    );
  }

  /**
   * Convert profile colors to theme-compatible format
   * Maps profile color keys to theme.js color structure
   *
   * IMPORTANT: The theme system primarily uses `primary` for buttons and UI elements.
   * If the user only sets their "Secondary/Accent Color" in the profile branding tab,
   * we need to use that as the `primary` color so it actually affects the visible UI.
   *
   * @returns {Object} Colors formatted for theme system
   */
  getThemeColors() {
    const colors = this.getColors();

    // Determine the primary color with smart fallback
    // If profile primary is not set but accent is, use accent as primary
    // This ensures the user's brand color actually affects buttons/UI
    const effectivePrimary = colors.primary || colors.accent || null;

    // For secondary, prefer contrasting color, then fall back to accent if primary was used
    const secondaryFromAccent = colors.primary ? colors.accent : null;
    const effectiveSecondary = colors.contrasting || secondaryFromAccent || null;

    return {
      primary: effectivePrimary,
      accent: colors.accent || null,
      secondary: effectiveSecondary,
      background: colors.background || null,
      text: colors.paragraph || null,
      heading: colors.header || null,
      header_accent: colors.headerAccent || null,
      header_text: colors.headerText || null
    };
  }

  /**
   * Convert profile fonts to theme-compatible format
   * Maps profile font keys to theme.js typography structure
   *
   * IMPORTANT: Similar to colors, if only one font is set, use it for both
   * body text and headings so the user's brand font actually affects the UI.
   *
   * @returns {Object} Typography formatted for theme system
   */
  getThemeTypography() {
    const fonts = this.getFonts();

    // Smart fallback: if only primary is set, use it for headings too
    // If only secondary is set, use it for body text too
    const effectivePrimaryFont = fonts.primary || fonts.secondary || null;
    const effectiveHeadingFont = fonts.secondary || fonts.primary || null;

    return {
      primary_font: effectivePrimaryFont ? {
        family: effectivePrimaryFont,
        fallback: 'sans-serif'
      } : null,
      heading_font: effectiveHeadingFont ? {
        family: effectiveHeadingFont,
        fallback: 'sans-serif'
      } : null
    };
  }

  /**
   * Get a summary of available branding data
   * Useful for UI to show what can be applied
   * @returns {Object} Summary of available branding items
   */
  getBrandingSummary() {
    return {
      hasColors: this.hasColors(),
      hasFonts: this.hasFonts(),
      hasImages: this.hasImages(),
      colorCount: Object.values(this.getColors()).filter(v => v).length,
      fontCount: Object.values(this.getFonts()).filter(v => v).length,
      headshotCount: this.getAllHeadshots().length,
      logoCount: this.getLogos().length,
      carouselCount: this.getCarouselImages().length
    };
  }

  /**
   * Refresh branding data from window.gmkbData
   * Useful if data was updated dynamically
   */
  refresh() {
    this._initialized = false;
    this._brandingData = null;
    this._ensureInitialized();
  }
}

// Export as singleton instance
const profileBrandingService = new ProfileBrandingService();

export default profileBrandingService;
export { ProfileBrandingService };
