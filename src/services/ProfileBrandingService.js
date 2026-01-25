/**
 * Profile Branding Service
 *
 * Provides access to profile branding data (colors, fonts, images) from either:
 * 1. The associated Brand Kit (new system)
 * 2. Legacy profile branding data (backward compatibility)
 *
 * The service prioritizes Brand Kit data when available, falling back to legacy
 * profile branding stored in window.gmkbData.profileBranding.
 *
 * @class ProfileBrandingService
 * @version 2.0.0
 */

import brandKitService from './BrandKitService.js';

class ProfileBrandingService {
  constructor() {
    /**
     * Cached branding data from window.gmkbData
     * @type {Object|null}
     * @private
     */
    this._legacyBrandingData = null;

    /**
     * Cached Brand Kit data
     * @type {Object|null}
     * @private
     */
    this._brandKit = null;

    /**
     * Whether the service has been initialized
     * @type {boolean}
     * @private
     */
    this._initialized = false;

    /**
     * Whether Brand Kit data is being loaded
     * @type {boolean}
     * @private
     */
    this._loading = false;
  }

  /**
   * Initialize and cache branding data
   * Called automatically on first access
   * @private
   */
  _ensureInitialized() {
    if (this._initialized) return;

    this._legacyBrandingData = window.gmkbData?.profileBranding || null;
    this._initialized = true;

    // Check for Brand Kit ID
    const brandKitId = window.gmkbData?.brandKitId || this._legacyBrandingData?.brandKitId;
    if (brandKitId && !this._loading) {
      this._loadBrandKit(brandKitId);
    }

    console.log('[ProfileBrandingService] Initialized', {
      hasBrandKit: !!brandKitId,
      hasLegacyData: !!this._legacyBrandingData?.hasBrandingData
    });
  }

  /**
   * Load Brand Kit data asynchronously
   * @param {number|string} brandKitId - The Brand Kit ID
   * @private
   */
  async _loadBrandKit(brandKitId) {
    if (this._loading) return;

    this._loading = true;
    try {
      this._brandKit = await brandKitService.get(brandKitId);
      console.log('[ProfileBrandingService] Loaded Brand Kit:', this._brandKit?.name);
    } catch (err) {
      console.error('[ProfileBrandingService] Failed to load Brand Kit:', err);
    } finally {
      this._loading = false;
    }
  }

  /**
   * Check if branding data is available (from Brand Kit or legacy)
   * @returns {boolean} True if branding data exists
   */
  hasBrandingData() {
    this._ensureInitialized();
    return !!this._brandKit || this._legacyBrandingData?.hasBrandingData === true;
  }

  /**
   * Check if using the new Brand Kit system
   * @returns {boolean} True if a Brand Kit is loaded
   */
  hasBrandKit() {
    this._ensureInitialized();
    return !!this._brandKit;
  }

  /**
   * Get the active Brand Kit
   * @returns {Object|null} Brand Kit object or null
   */
  getBrandKit() {
    this._ensureInitialized();
    return this._brandKit;
  }

  /**
   * Set the active Brand Kit (for use when Brand Kit is selected in UI)
   * @param {Object} brandKit - Brand Kit object
   */
  setBrandKit(brandKit) {
    this._brandKit = brandKit;
  }

  /**
   * Get all profile branding colors
   * Prioritizes Brand Kit colors over legacy colors
   * @returns {Object} Color values keyed by type
   */
  getColors() {
    this._ensureInitialized();

    // Use Brand Kit colors if available
    if (this._brandKit) {
      return {
        primary: this._brandKit.color_primary || null,
        secondary: this._brandKit.color_secondary || null,
        accent: this._brandKit.color_accent || null,
        background: this._brandKit.color_background || null,
        surface: this._brandKit.color_surface || null,
        text: this._brandKit.color_text || null,
        textMuted: this._brandKit.color_text_muted || null,
        link: this._brandKit.color_link || null,
        // Legacy mappings for backward compatibility
        contrasting: this._brandKit.color_accent || null,
        header: this._brandKit.color_surface || null,
        headerAccent: this._brandKit.color_link || null,
        headerText: this._brandKit.color_text_muted || null,
        paragraph: this._brandKit.color_text || null
      };
    }

    // Fall back to legacy branding data
    return this._legacyBrandingData?.colors || {};
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
   * Prioritizes Brand Kit fonts over legacy fonts
   * @returns {Object} Font values keyed by type
   */
  getFonts() {
    this._ensureInitialized();

    // Use Brand Kit fonts if available
    if (this._brandKit) {
      return {
        primary: this._brandKit.font_primary || null,
        heading: this._brandKit.font_heading || null,
        accent: this._brandKit.font_accent || null,
        // Legacy mapping for backward compatibility
        secondary: this._brandKit.font_heading || null
      };
    }

    // Fall back to legacy branding data
    return this._legacyBrandingData?.fonts || {};
  }

  /**
   * Get a specific font by key
   * @param {string} fontKey - Font key (primary, secondary/heading)
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
   * Prioritizes Brand Kit media over legacy images
   * @returns {Object} Image data keyed by type
   */
  getImages() {
    this._ensureInitialized();

    // Use Brand Kit media if available
    if (this._brandKit?.media && Array.isArray(this._brandKit.media)) {
      const media = this._brandKit.media;
      const headshots = media.filter(m => m.category === 'headshot');
      const logos = media.filter(m => m.category === 'logo');
      const photos = media.filter(m => m.category === 'photo');
      const backgrounds = media.filter(m => m.category === 'background');

      // Find primary headshot or use first
      const primaryHeadshot = headshots.find(h => h.is_primary) || headshots[0] || null;

      return {
        headshotPrimary: primaryHeadshot,
        headshotVertical: headshots.find(h => h.tags?.includes('vertical')) || null,
        headshotHorizontal: headshots.find(h => h.tags?.includes('horizontal')) || null,
        headshots: headshots,
        logos: logos,
        photos: photos,
        backgrounds: backgrounds,
        carouselImages: logos.filter(l => l.tags?.includes('carousel'))
      };
    }

    // Fall back to legacy branding data
    return this._legacyBrandingData?.images || {};
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

    // If using Brand Kit, return the headshots array
    if (this._brandKit && images.headshots) {
      return images.headshots;
    }

    // Legacy format
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
   * Get photos (Brand Kit only)
   * @returns {Array<Object>} Array of photo image objects
   */
  getPhotos() {
    const photos = this.getImage('photos');
    return Array.isArray(photos) ? photos : [];
  }

  /**
   * Get backgrounds (Brand Kit only)
   * @returns {Array<Object>} Array of background image objects
   */
  getBackgrounds() {
    const backgrounds = this.getImage('backgrounds');
    return Array.isArray(backgrounds) ? backgrounds : [];
  }

  /**
   * Get media by category (Brand Kit only)
   * @param {string} category - Category name (headshot, logo, photo, background)
   * @returns {Array<Object>} Array of media items in that category
   */
  getMediaByCategory(category) {
    if (!this._brandKit?.media) return [];
    return this._brandKit.media.filter(m => m.category === category);
  }

  /**
   * Get media by tags (Brand Kit only)
   * @param {Array<string>} tags - Tags to filter by
   * @returns {Array<Object>} Array of media items with matching tags
   */
  getMediaByTags(tags) {
    if (!this._brandKit?.media) return [];
    return this._brandKit.media.filter(m =>
      tags.some(tag => m.tags?.includes(tag))
    );
  }

  /**
   * Check if any images are defined
   * @returns {boolean} True if at least one image is set
   */
  hasImages() {
    const images = this.getImages();

    // Brand Kit format
    if (this._brandKit) {
      return (
        (images.headshots && images.headshots.length > 0) ||
        (images.logos && images.logos.length > 0) ||
        (images.photos && images.photos.length > 0) ||
        (images.backgrounds && images.backgrounds.length > 0)
      );
    }

    // Legacy format
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
   * Maps profile/Brand Kit color keys to theme.js color structure
   * @returns {Object} Colors formatted for theme system
   */
  getThemeColors() {
    const colors = this.getColors();

    // Brand Kit uses a cleaner color structure
    if (this._brandKit) {
      return {
        primary: colors.primary || null,
        secondary: colors.secondary || null,
        accent: colors.accent || null,
        background: colors.background || null,
        surface: colors.surface || null,
        text: colors.text || null,
        text_muted: colors.textMuted || null,
        link: colors.link || null,
        // Legacy theme property names
        heading: colors.surface || null,
        header_accent: colors.link || null,
        header_text: colors.textMuted || null
      };
    }

    // Legacy format with smart fallbacks
    const effectivePrimary = colors.primary || colors.accent || null;
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
   * Maps profile/Brand Kit font keys to theme.js typography structure
   * @returns {Object} Typography formatted for theme system
   */
  getThemeTypography() {
    const fonts = this.getFonts();

    // Brand Kit uses cleaner font structure
    if (this._brandKit) {
      return {
        primary_font: fonts.primary ? {
          family: fonts.primary,
          fallback: this._getFontFallback(fonts.primary)
        } : null,
        heading_font: fonts.heading ? {
          family: fonts.heading,
          fallback: this._getFontFallback(fonts.heading)
        } : null,
        accent_font: fonts.accent ? {
          family: fonts.accent,
          fallback: this._getFontFallback(fonts.accent)
        } : null
      };
    }

    // Legacy format with smart fallbacks
    const effectivePrimaryFont = fonts.primary || fonts.secondary || null;
    const effectiveHeadingFont = fonts.secondary || fonts.primary || null;

    return {
      primary_font: effectivePrimaryFont ? {
        family: effectivePrimaryFont,
        fallback: this._getFontFallback(effectivePrimaryFont)
      } : null,
      heading_font: effectiveHeadingFont ? {
        family: effectiveHeadingFont,
        fallback: this._getFontFallback(effectiveHeadingFont)
      } : null
    };
  }

  /**
   * Get CSS variables for the current branding
   * @returns {Object} CSS custom property key-value pairs
   */
  getCSSVariables() {
    if (this._brandKit) {
      return brandKitService.getCSSVariables(this._brandKit);
    }

    // Generate CSS variables from legacy data
    const colors = this.getColors();
    const fonts = this.getFonts();
    const vars = {};

    if (colors.primary) vars['--brand-color-primary'] = colors.primary;
    if (colors.accent) vars['--brand-color-accent'] = colors.accent;
    if (colors.background) vars['--brand-color-background'] = colors.background;
    if (colors.paragraph) vars['--brand-color-text'] = colors.paragraph;
    if (fonts.primary) vars['--brand-font-primary'] = fonts.primary;
    if (fonts.secondary) vars['--brand-font-heading'] = fonts.secondary;

    return vars;
  }

  /**
   * Apply branding CSS variables to an element
   * @param {HTMLElement} element - Target element (defaults to documentElement)
   */
  applyToElement(element = document.documentElement) {
    const vars = this.getCSSVariables();
    Object.entries(vars).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }

  /**
   * Get appropriate CSS fallback for a font family
   * @param {string} fontName - The font family name
   * @returns {string} CSS fallback stack (serif, sans-serif, or cursive)
   * @private
   */
  _getFontFallback(fontName) {
    const serifFonts = [
      'Amiri', 'Georgia', 'Lora', 'Merriweather',
      'Playfair Display', 'Roboto Slab', 'Times New Roman',
      'Crimson Text', 'Libre Baskerville'
    ];
    const cursiveFonts = ['Bonbon'];

    if (serifFonts.includes(fontName)) {
      return 'serif';
    }
    if (cursiveFonts.includes(fontName)) {
      return 'cursive';
    }
    return 'sans-serif';
  }

  /**
   * Get a summary of available branding data
   * Useful for UI to show what can be applied
   * @returns {Object} Summary of available branding items
   */
  getBrandingSummary() {
    const images = this.getImages();

    return {
      source: this._brandKit ? 'brand_kit' : 'legacy',
      brandKitId: this._brandKit?.id || null,
      brandKitName: this._brandKit?.name || null,
      hasColors: this.hasColors(),
      hasFonts: this.hasFonts(),
      hasImages: this.hasImages(),
      colorCount: Object.values(this.getColors()).filter(v => v).length,
      fontCount: Object.values(this.getFonts()).filter(v => v).length,
      headshotCount: this.getAllHeadshots().length,
      logoCount: this.getLogos().length,
      photoCount: this.getPhotos().length,
      backgroundCount: this.getBackgrounds().length,
      carouselCount: this.getCarouselImages().length
    };
  }

  /**
   * Refresh branding data from window.gmkbData
   * Useful if data was updated dynamically
   */
  refresh() {
    this._initialized = false;
    this._legacyBrandingData = null;
    this._brandKit = null;
    this._loading = false;
    this._ensureInitialized();
  }

  /**
   * Reload Brand Kit data from the API
   * @param {number|string} brandKitId - The Brand Kit ID to load
   * @returns {Promise<Object|null>} The loaded Brand Kit or null
   */
  async loadBrandKit(brandKitId) {
    if (!brandKitId) {
      this._brandKit = null;
      return null;
    }

    try {
      this._brandKit = await brandKitService.get(brandKitId);
      return this._brandKit;
    } catch (err) {
      console.error('[ProfileBrandingService] Failed to load Brand Kit:', err);
      return null;
    }
  }
}

// Export as singleton instance
const profileBrandingService = new ProfileBrandingService();

export default profileBrandingService;
export { ProfileBrandingService };
