/**
 * Security Service - XSS Protection & Input Sanitization
 * 
 * Provides comprehensive security measures for user input and component data.
 * Prevents XSS attacks while allowing safe HTML formatting where needed.
 * 
 * @version 2.0.0
 */

export class SecurityService {
  constructor() {
    this.htmlFieldPatterns = [
      /content$/i,
      /description$/i,
      /biography$/i,
      /bio$/i,
      /body$/i,
      /text$/i
    ];
    
    this.allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ];
    
    this.allowedAttributes = ['href', 'target', 'rel', 'class', 'id'];
    
    this.forbiddenTags = [
      'script', 'style', 'iframe', 'object', 'embed', 'form',
      'input', 'button', 'link', 'meta', 'base'
    ];
    
    this.forbiddenAttributes = [
      'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus',
      'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup'
    ];
  }

  /**
   * Sanitize user input
   * 
   * @param {string} input - Raw user input
   * @param {Object} options - Sanitization options
   * @returns {string} Sanitized output
   */
  sanitize(input, options = {}) {
    if (typeof input !== 'string') {
      return input;
    }

    const {
      allowHtml = false,
      allowLinks = true,
      maxLength = null
    } = options;

    // Trim whitespace
    let sanitized = input.trim();

    // Enforce max length
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Use appropriate sanitization method
    if (allowHtml) {
      sanitized = this.sanitizeHtml(sanitized, { allowLinks });
    } else {
      sanitized = this.escapeHtml(sanitized);
    }

    return sanitized;
  }

  /**
   * Sanitize HTML content
   * 
   * @param {string} html - HTML content
   * @param {Object} options - Options
   * @returns {string} Sanitized HTML
   */
  sanitizeHtml(html, options = {}) {
    const { allowLinks = true } = options;
    
    // Create temporary DOM element
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Recursively clean elements
    this.cleanElement(temp, { allowLinks });

    return temp.innerHTML;
  }

  /**
   * Clean DOM element recursively
   * 
   * @param {HTMLElement} element - Element to clean
   * @param {Object} options - Options
   */
  cleanElement(element, options = {}) {
    const { allowLinks = true } = options;
    
    // Process child nodes
    const children = Array.from(element.childNodes);
    
    children.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName.toLowerCase();
        
        // Remove forbidden tags
        if (this.forbiddenTags.includes(tagName)) {
          child.remove();
          return;
        }
        
        // Remove non-allowed tags (but keep content)
        if (!this.allowedTags.includes(tagName)) {
          const textContent = child.textContent;
          const textNode = document.createTextNode(textContent);
          child.replaceWith(textNode);
          return;
        }
        
        // Special handling for links
        if (tagName === 'a' && !allowLinks) {
          const textContent = child.textContent;
          const textNode = document.createTextNode(textContent);
          child.replaceWith(textNode);
          return;
        }
        
        // Clean attributes
        this.cleanAttributes(child);
        
        // Recursively clean children
        this.cleanElement(child, options);
      }
    });
  }

  /**
   * Clean element attributes
   * 
   * @param {HTMLElement} element - Element to clean
   */
  cleanAttributes(element) {
    const attributes = Array.from(element.attributes);
    
    attributes.forEach(attr => {
      const name = attr.name.toLowerCase();
      
      // Remove forbidden attributes
      if (this.forbiddenAttributes.some(forbidden => name.includes(forbidden))) {
        element.removeAttribute(attr.name);
        return;
      }
      
      // Remove non-allowed attributes
      if (!this.allowedAttributes.includes(name) && !name.startsWith('data-')) {
        element.removeAttribute(attr.name);
        return;
      }
      
      // Sanitize href attributes
      if (name === 'href') {
        const value = attr.value.toLowerCase();
        if (value.startsWith('javascript:') || value.startsWith('data:')) {
          element.removeAttribute(attr.name);
        }
      }
      
      // Set safe rel for external links
      if (element.tagName.toLowerCase() === 'a' && name === 'href') {
        if (!attr.value.startsWith('/') && !attr.value.startsWith('#')) {
          element.setAttribute('rel', 'noopener noreferrer');
          element.setAttribute('target', '_blank');
        }
      }
    });
  }

  /**
   * Escape HTML entities
   * 
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return text.replace(/[&<>"'/]/g, char => map[char]);
  }

  /**
   * Unescape HTML entities
   * 
   * @param {string} text - Text to unescape
   * @returns {string} Unescaped text
   */
  unescapeHtml(text) {
    const map = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/'
    };

    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;/g, entity => map[entity]);
  }

  /**
   * Sanitize component data
   * 
   * @param {Object} data - Component data
   * @returns {Object} Sanitized data
   */
  sanitizeComponentData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Check if field should allow HTML
        const allowHtml = this.isHtmlField(key);
        sanitized[key] = this.sanitize(value, { allowHtml });
      } else if (Array.isArray(value)) {
        // Recursively sanitize arrays
        sanitized[key] = value.map(item => 
          typeof item === 'object' ? this.sanitizeComponentData(item) : this.sanitize(item, {})
        );
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize objects
        sanitized[key] = this.sanitizeComponentData(value);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  /**
   * Check if field should allow HTML
   * 
   * @param {string} fieldName - Field name
   * @returns {boolean} Whether to allow HTML
   */
  isHtmlField(fieldName) {
    return this.htmlFieldPatterns.some(pattern => pattern.test(fieldName));
  }

  /**
   * Validate URL
   * 
   * @param {string} url - URL to validate
   * @returns {boolean} Whether URL is valid
   */
  isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Sanitize URL
   * 
   * @param {string} url - URL to sanitize
   * @returns {string|null} Sanitized URL or null if invalid
   */
  sanitizeUrl(url) {
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Remove whitespace
    url = url.trim();

    // Check for javascript: or data: protocols
    if (url.toLowerCase().startsWith('javascript:') || 
        url.toLowerCase().startsWith('data:')) {
      return null;
    }

    // Validate URL
    if (!this.isValidUrl(url)) {
      return null;
    }

    return url;
  }

  /**
   * Get Content Security Policy headers
   * 
   * @returns {Object} CSP headers
   */
  getCSPHeaders() {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Vue
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    };
  }

  /**
   * Create safe JSON from untrusted input
   * 
   * @param {string} json - JSON string
   * @returns {Object|null} Parsed object or null if invalid
   */
  safeJsonParse(json) {
    try {
      const parsed = JSON.parse(json);
      return this.sanitizeComponentData(parsed);
    } catch (error) {
      console.error('Invalid JSON:', error);
      return null;
    }
  }
}

// Export singleton instance
export const securityService = new SecurityService();

// Export utility functions
export function sanitizeInput(input, options = {}) {
  return securityService.sanitize(input, options);
}

export function sanitizeComponentData(data) {
  return securityService.sanitizeComponentData(data);
}

export function escapeHtml(text) {
  return securityService.escapeHtml(text);
}

export function isValidUrl(url) {
  return securityService.isValidUrl(url);
}
